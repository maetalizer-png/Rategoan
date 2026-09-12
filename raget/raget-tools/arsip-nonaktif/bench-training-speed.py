#!/usr/bin/env python3
"""MEGA-BATCH RAGETAN ROUND 5 - FASE 1: benchmark jujur beberapa kombinasi
percepatan CPU (thread OMP, batch size lebih besar, torch.compile, bf16
autocast) memakai arsitektur+data identik dengan train-massive50m-continue.py,
supaya angka token/detik SEBELUM vs SESUDAH bisa dibandingkan apple-to-apple
tanpa harus menjalankan training panjang berulang kali.

Setiap kombinasi diukur dengan langkah training NYATA (forward+backward+
optimizer.step) pada model+data asli (bukan model dummy/random kecil), rata-
rata dari beberapa step sesudah warmup (step pertama selalu lebih lambat
karena alokasi awal/JIT compile), supaya angka representatif.

Pakai: python3 raget-tools/bench-training-speed.py <chunks.txt> <tokenizer.json>
"""
import array
import json
import os
import random
import sys
import time

import torch
import torch.nn as nn
import torch.nn.functional as F

CHUNKS_FILE = sys.argv[1]
TOKENIZER_FILE = sys.argv[2]

VOCAB_SIZE = 30368
D_MODEL = 512
N_LAYERS = 6
N_HEADS = 8
D_FF = 2048
INIT_STD = 0.02
MAX_CONTEXT_LEN = 512
PAD_ID = 0

torch.manual_seed(42)
random.seed(42)


def sinusoidal_positional_encoding(max_len, d_model):
    pe = torch.zeros(max_len, d_model)
    position = torch.arange(0, max_len, dtype=torch.float32).unsqueeze(1)
    for i in range(0, d_model, 2):
        angle = position / (10000.0 ** (i / d_model))
        pe[:, i] = torch.sin(angle).squeeze(1)
        if i + 1 < d_model:
            pe[:, i + 1] = torch.cos(angle).squeeze(1)
    return pe


class TransformerBlock(nn.Module):
    def __init__(self, d_model, n_heads, d_ff, init_std):
        super().__init__()
        self.n_heads = n_heads
        self.d_head = d_model // n_heads
        self.Wq = nn.Parameter(torch.randn(d_model, d_model) * init_std)
        self.Wk = nn.Parameter(torch.randn(d_model, d_model) * init_std)
        self.Wv = nn.Parameter(torch.randn(d_model, d_model) * init_std)
        self.Wo = nn.Parameter(torch.randn(d_model, d_model) * init_std)
        self.W1 = nn.Parameter(torch.randn(d_model, d_ff) * init_std)
        self.b1 = nn.Parameter(torch.zeros(d_ff))
        self.W2 = nn.Parameter(torch.randn(d_ff, d_model) * init_std)
        self.b2 = nn.Parameter(torch.zeros(d_model))
        self.ln1 = nn.LayerNorm(d_model, eps=1e-5)
        self.ln2 = nn.LayerNorm(d_model, eps=1e-5)

    def forward(self, x, causal_mask):
        normed1 = self.ln1(x)
        B, T, D = normed1.shape
        Q = normed1 @ self.Wq
        K = normed1 @ self.Wk
        V = normed1 @ self.Wv
        Qh = Q.view(B, T, self.n_heads, self.d_head).transpose(1, 2)
        Kh = K.view(B, T, self.n_heads, self.d_head).transpose(1, 2)
        Vh = V.view(B, T, self.n_heads, self.d_head).transpose(1, 2)
        scale = 1.0 / (self.d_head ** 0.5)
        scores = (Qh @ Kh.transpose(-2, -1)) * scale
        scores = scores + causal_mask
        weights = F.softmax(scores, dim=-1)
        headOut = weights @ Vh
        merged = headOut.transpose(1, 2).contiguous().view(B, T, D)
        attnOut = merged @ self.Wo
        x = x + attnOut

        normed2 = self.ln2(x)
        hidden = normed2 @ self.W1 + self.b1
        hidden = F.gelu(hidden, approximate='tanh')
        ffnOut = hidden @ self.W2 + self.b2
        x = x + ffnOut
        return x


class RategoanTransformer(nn.Module):
    def __init__(self):
        super().__init__()
        self.embedding = nn.Parameter(torch.randn(VOCAB_SIZE, D_MODEL) * INIT_STD)
        self.register_buffer('pos_enc', sinusoidal_positional_encoding(MAX_CONTEXT_LEN, D_MODEL))
        self.blocks = nn.ModuleList([TransformerBlock(D_MODEL, N_HEADS, D_FF, INIT_STD) for _ in range(N_LAYERS)])
        self.final_norm = nn.LayerNorm(D_MODEL, eps=1e-5)

    def forward(self, ids):
        B, T = ids.shape
        x = self.embedding[ids] + self.pos_enc[:T].unsqueeze(0)
        mask = torch.triu(torch.full((T, T), float('-inf')), diagonal=1)
        for block in self.blocks:
            x = block(x, mask)
        x = self.final_norm(x)
        logits = x @ self.embedding.t()
        return logits


def pad_batch(seqs, pad_id):
    max_len = max(len(s) for s in seqs)
    ids = torch.full((len(seqs), max_len), pad_id, dtype=torch.long)
    for i, s in enumerate(seqs):
        ids[i, :len(s)] = torch.tensor(s, dtype=torch.long)
    return ids


def compute_loss(model, ids):
    inp = ids[:, :-1]
    tgt = ids[:, 1:]
    logits = model(inp)
    loss = F.cross_entropy(logits.reshape(-1, VOCAB_SIZE), tgt.reshape(-1), ignore_index=PAD_ID)
    return loss


def load_chunks(n_needed):
    chunks = []
    with open(CHUNKS_FILE) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            chunks.append(array.array('H', (int(x) for x in line.split(' '))))
            if len(chunks) >= n_needed:
                break
    return chunks


def bench_config(label, batch_size, use_compile, use_bf16, n_steps=8, n_warmup=2):
    model = RategoanTransformer()
    model.train()
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    if use_compile:
        try:
            model_fwd = torch.compile(model)
        except Exception as e:
            return {'label': label, 'error': 'compile_failed: {}'.format(e)}
    else:
        model_fwd = model

    chunks = load_chunks(batch_size * (n_steps + n_warmup) + 8)
    random.shuffle(chunks)

    def step(batch_seqs):
        ids = pad_batch(batch_seqs, PAD_ID)
        optimizer.zero_grad()
        if use_bf16:
            with torch.autocast(device_type='cpu', dtype=torch.bfloat16):
                inp = ids[:, :-1]
                tgt = ids[:, 1:]
                logits = model_fwd(inp)
                loss = F.cross_entropy(logits.reshape(-1, VOCAB_SIZE), tgt.reshape(-1), ignore_index=PAD_ID)
        else:
            inp = ids[:, :-1]
            tgt = ids[:, 1:]
            logits = model_fwd(inp)
            loss = F.cross_entropy(logits.reshape(-1, VOCAB_SIZE), tgt.reshape(-1), ignore_index=PAD_ID)
        loss.backward()
        optimizer.step()
        return loss.item(), sum(len(s) for s in batch_seqs)

    idx = 0
    try:
        for _ in range(n_warmup):
            batch = chunks[idx:idx + batch_size]
            idx += batch_size
            step(batch)
    except Exception as e:
        return {'label': label, 'error': 'warmup_failed: {}'.format(e)}

    t0 = time.time()
    total_tokens = 0
    try:
        for _ in range(n_steps):
            batch = chunks[idx:idx + batch_size]
            idx += batch_size
            _, ntok = step(batch)
            total_tokens += ntok
    except Exception as e:
        return {'label': label, 'error': 'measured_step_failed: {}'.format(e)}
    dt = time.time() - t0

    return {
        'label': label,
        'batchSize': batch_size,
        'compile': use_compile,
        'bf16': use_bf16,
        'steps': n_steps,
        'elapsedSec': round(dt, 3),
        'secPerStep': round(dt / n_steps, 4),
        'tokensPerSec': round(total_tokens / dt, 1),
        'totalTokens': total_tokens,
    }


def main():
    results = []
    configs = json.loads(sys.argv[3]) if len(sys.argv) > 3 and sys.argv[3] else None
    if configs is None:
        configs = [
            {'label': 'baseline_b32', 'batch_size': 32, 'use_compile': False, 'use_bf16': False},
            {'label': 'bf16_b32', 'batch_size': 32, 'use_compile': False, 'use_bf16': True},
            {'label': 'compile_b32', 'batch_size': 32, 'use_compile': True, 'use_bf16': False},
            {'label': 'baseline_b64', 'batch_size': 64, 'use_compile': False, 'use_bf16': False},
            {'label': 'baseline_b128', 'batch_size': 128, 'use_compile': False, 'use_bf16': False},
        ]
    for cfg in configs:
        print('--- bench:', cfg['label'], '---', flush=True)
        t0 = time.time()
        r = bench_config(cfg['label'], cfg['batch_size'], cfg['use_compile'], cfg['use_bf16'])
        r['wallSec'] = round(time.time() - t0, 1)
        print(json.dumps(r), flush=True)
        results.append(r)
    with open(sys.argv[4] if len(sys.argv) > 4 else 'bench-training-speed-report.json', 'w') as f:
        json.dump(results, f, indent=2)
    print('\nSELESAI. Hasil ditulis.', flush=True)


if __name__ == '__main__':
    main()
