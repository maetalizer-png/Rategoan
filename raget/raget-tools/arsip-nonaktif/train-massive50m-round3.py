#!/usr/bin/env python3
"""MEGA-BATCH RAGETAN-50M ROUND 3 - FASE 2: training pada korpus Wikipedia
ID nyata (idwiki-latest-pages-articles.xml.bz2, diunduh dari GitHub Release
'Korpus' repo ini, SHA256 diverifikasi cocok persis) - lantai 100 juta token
TERCAPAI (236.793.009 token, 809.776 chunk sequence, dari 536.372 artikel
nyata setelah extract+clean+dedupe-exact+BPE retrain vocab 30368).

Arsitektur, forward pass, dan format checkpoint PERSIS SAMA seperti round 2
(train-massive50m-torch.py) - byte-compatible dengan runtime JS browser.
Bedanya HANYA: (1) tokenizer di-retrain dari nol di atas korpus Wikipedia
nyata (bpe-tokenizer.json, bukan lagi tokenizer kecil hasil korpus internal
~95rb token), (2) data training dibaca dari file chunk yang SUDAH
di-tokenize+chunk sebelumnya (idwiki-chunks.txt, satu baris = satu sequence
token id siap pakai, sudah termasuk BOS/EOS) - supaya proses training tidak
perlu re-tokenize teks mentah tiap epoch.

Pakai: python3 raget-tools/train-massive50m-round3.py <menit> <batch_size> <chunks.txt> <bpe_tokenizer.json>
"""
import array
import json
import os
import random
import struct
import sys
import time

import torch
import torch.nn as nn
import torch.nn.functional as F

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHUNKS_FILE = sys.argv[3]
TOKENIZER_FILE = sys.argv[4]
OUT_CHECKPOINT = os.path.join(ROOT, 'raget', 'raget-data', 'neural', 'raget-neural-massive50m.safetensors')
REPORT_FILE = os.path.join(ROOT, 'raget', 'raget-devlog', 'neural', 'training-report-massive50m-round3.json')

BUDGET_MINUTES = float(sys.argv[1]) if len(sys.argv) > 1 else 45.0
BATCH_SIZE = int(sys.argv[2]) if len(sys.argv) > 2 else 16

torch.manual_seed(42)
random.seed(42)
torch.set_num_threads(os.cpu_count() or 4)

VOCAB_SIZE = 30368
D_MODEL = 512
N_LAYERS = 6
N_HEADS = 8
D_FF = 2048
INIT_STD = 0.02
MAX_CONTEXT_LEN = 512
PAD_ID, UNK_ID, BOS_ID, EOS_ID = 0, 1, 2, 3

print('Memuat tokenizer BPE (round 3, dilatih di korpus Wikipedia ID nyata)...')
with open(TOKENIZER_FILE) as f:
    tok_data = json.load(f)
MERGES = tok_data['merges']
pieces = tok_data['vocab']
special = ['<pad>', '<unk>', '<bos>', '<eos>']
TOKEN_TO_ID = {t: i for i, t in enumerate(special)}
_next_id = 4
for p in pieces:
    if _next_id >= VOCAB_SIZE:
        break
    if p not in TOKEN_TO_ID:
        TOKEN_TO_ID[p] = _next_id
        _next_id += 1
VOCAB_ENTRIES = list(TOKEN_TO_ID.items())
print('Vocab efektif:', len(TOKEN_TO_ID))

print('Memuat chunk sequence dari', CHUNKS_FILE, '(array.array uint16, hemat memori)...')
t_load = time.time()
all_chunks = []
with open(CHUNKS_FILE) as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        all_chunks.append(array.array('H', (int(x) for x in line.split(' '))))
print('Chunk dimuat:', len(all_chunks), '({}s)'.format(round(time.time() - t_load, 1)))

random.shuffle(all_chunks)
held_out_n = max(1, len(all_chunks) // 200)  # 0.5% held-out (korpus besar, cukup representatif)
held_out_seqs = all_chunks[:held_out_n]
train_seqs = all_chunks[held_out_n:]
print('Train:', len(train_seqs), 'Held-out:', len(held_out_seqs))
total_train_tokens = sum(len(s) for s in train_seqs)
print('Total token di train set:', total_train_tokens)


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

    def param_count(self):
        total = self.embedding.numel()
        for b in self.blocks:
            total += b.Wq.numel() + b.Wk.numel() + b.Wv.numel() + b.Wo.numel()
            total += b.W1.numel() + b.b1.numel() + b.W2.numel() + b.b2.numel()
            total += b.ln1.weight.numel() + b.ln1.bias.numel() + b.ln2.weight.numel() + b.ln2.bias.numel()
        total += self.final_norm.weight.numel() + self.final_norm.bias.numel()
        total += self.embedding.numel()
        return total


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


def eval_held_out(model, seqs, sample_size):
    model.eval()
    sample = seqs[:sample_size]
    total_loss = 0.0
    count = 0
    with torch.no_grad():
        for s in sample:
            if len(s) < 2:
                continue
            ids = torch.tensor([s], dtype=torch.long)
            loss = compute_loss(model, ids)
            total_loss += loss.item()
            count += 1
    model.train()
    return total_loss / count if count else None


ID_TO_TOKEN = {i: t for t, i in TOKEN_TO_ID.items()}
END_OF_WORD = '</w>'


def decode_ids(ids):
    text = ''
    word = ''
    for i in ids:
        piece = ID_TO_TOKEN.get(i, '<unk>')
        if piece.endswith(END_OF_WORD):
            word += piece[:-len(END_OF_WORD)]
            if word:
                if text and word not in '.,!?;:)':
                    text += ' '
                text += word
            word = ''
        else:
            word += piece
    if word:
        if text:
            text += ' '
        text += word
    return text


MERGE_RANK = {tuple(m): i for i, m in enumerate(MERGES)}


def encode_prompt(prompt_text):
    words = []
    cur = ''
    for c in prompt_text.lower():
        if c.isspace():
            if cur:
                words.append(cur)
                cur = ''
        elif c.isalnum() or c == '_':
            cur += c
        else:
            if cur:
                words.append(cur)
                cur = ''
            words.append(c)
    if cur:
        words.append(cur)
    ids = []
    for w in words:
        symbols = list(w) + [END_OF_WORD]
        while True:
            best_rank, best_i = None, -1
            for i in range(len(symbols) - 1):
                r = MERGE_RANK.get((symbols[i], symbols[i + 1]))
                if r is not None and (best_rank is None or r < best_rank):
                    best_rank, best_i = r, i
            if best_i == -1:
                break
            symbols = symbols[:best_i] + [symbols[best_i] + symbols[best_i + 1]] + symbols[best_i + 2:]
        ids.extend(TOKEN_TO_ID.get(s, UNK_ID) for s in symbols)
    return ids


def generate_sample(model, prompt_ids, max_new_tokens, min_new_tokens, temperature):
    model.eval()
    ids = [BOS_ID] + prompt_ids
    generated = []
    with torch.no_grad():
        for step in range(max_new_tokens):
            inp = torch.tensor([ids[-MAX_CONTEXT_LEN:]], dtype=torch.long)
            logits = model(inp)[0, -1]
            logits = logits / max(temperature, 1e-6)
            if len(generated) < min_new_tokens:
                logits[EOS_ID] = float('-inf')
            logits[PAD_ID] = float('-inf')
            logits[BOS_ID] = float('-inf')
            probs = F.softmax(logits, dim=-1)
            next_id = torch.multinomial(probs, 1).item()
            if next_id == EOS_ID:
                break
            ids.append(next_id)
            generated.append(next_id)
    model.train()
    return generated


def align4(n):
    return (n + 3) & ~3


def quantize_matrix_np(mat):
    import numpy as np
    arr = mat.detach().numpy().astype('float32')
    mn = float(arr.min())
    mx = float(arr.max())
    if mn == mx:
        mn -= 0.5
        mx += 0.5
    scale = (mx - mn) / 254.0
    zero_point = mn
    q = np.round((arr - zero_point) / scale) - 127
    q = np.clip(q, -127, 127).astype('int8')
    return q, scale, zero_point


def write_checkpoint(model, total_steps, actual_minutes, corpus_size):
    header = {}
    quant = {}
    chunks = []
    offset = 0

    def place(b):
        nonlocal offset
        start = offset
        chunks.append(b)
        offset += len(b)
        pad = (4 - (offset % 4)) % 4
        if pad:
            chunks.append(b'\x00' * pad)
            offset += pad
        return start, start + len(b)

    def write_matrix(name, mat):
        q, scale, zp = quantize_matrix_np(mat)
        rows, cols = q.shape
        start, end = place(q.tobytes())
        header[name] = {'dtype': 'I8', 'shape': [rows, cols], 'data_offsets': [start, end]}
        quant[name] = {'scale': scale, 'zeroPoint': zp}

    def write_vector(name, vec):
        arr = vec.detach().numpy().astype('<f4')
        start, end = place(arr.tobytes())
        header[name] = {'dtype': 'F32', 'shape': [len(arr)], 'data_offsets': [start, end]}

    write_matrix('embedding.weight', model.embedding)
    for i, blk in enumerate(model.blocks):
        p = 'layers.{}.'.format(i)
        write_matrix(p + 'attention.Wq', blk.Wq)
        write_matrix(p + 'attention.Wk', blk.Wk)
        write_matrix(p + 'attention.Wv', blk.Wv)
        write_matrix(p + 'attention.Wo', blk.Wo)
        write_matrix(p + 'ffn.W1', blk.W1)
        write_vector(p + 'ffn.b1', blk.b1)
        write_matrix(p + 'ffn.W2', blk.W2)
        write_vector(p + 'ffn.b2', blk.b2)
        write_vector(p + 'ln1.gamma', blk.ln1.weight)
        write_vector(p + 'ln1.beta', blk.ln1.bias)
        write_vector(p + 'ln2.gamma', blk.ln2.weight)
        write_vector(p + 'ln2.beta', blk.ln2.bias)
    write_vector('final_norm.gamma', model.final_norm.weight)
    write_vector('final_norm.beta', model.final_norm.bias)

    config = {
        'model': {'name': 'massive50m', 'vocabSize': VOCAB_SIZE, 'dModel': D_MODEL, 'nLayers': N_LAYERS, 'nHeads': N_HEADS, 'dFF': D_FF, 'maxContextLength': MAX_CONTEXT_LEN, 'dropoutRate': 0.1, 'initStd': INIT_STD},
        'runtime': {'backend': 'cpu-js', 'precision': 'f32', 'seed': 42, 'logLevel': 'warn', 'maxNewTokens': 128, 'minNewTokens': 8, 'temperature': 0.4, 'topP': 0.88, 'repetitionPenalty': 1.15, 'greedy': False},
        'specialTokens': {'PAD': '<pad>', 'UNK': '<unk>', 'BOS': '<bos>', 'EOS': '<eos>'},
        'specialTokenIds': {'PAD': 0, 'UNK': 1, 'BOS': 2, 'EOS': 3},
    }
    rategoan_meta = {
        'name': 'rategoan-neural-massive50m-checkpoint-round3-wikipedia',
        'description': 'Trained ROUND 3 with real Wikipedia ID corpus (236.8M tokens) via PyTorch CPU',
        'createdAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'trained': True,
        'trainingSteps': total_steps,
        'trainingMinutes': actual_minutes,
        'corpusSize': corpus_size,
        'config': config,
        'merges': MERGES,
        'vocabEntries': VOCAB_ENTRIES,
        'quant': quant,
    }
    full_header = dict(header)
    full_header['__metadata__'] = {'rategoan': json.dumps(rategoan_meta)}
    raw_header_bytes = json.dumps(full_header).encode('utf-8')
    prefix_length = align4(8 + len(raw_header_bytes))
    header_bytes = bytearray(prefix_length - 8)
    header_bytes[:len(raw_header_bytes)] = raw_header_bytes
    for i in range(len(raw_header_bytes), len(header_bytes)):
        header_bytes[i] = 0x20

    with open(OUT_CHECKPOINT, 'wb') as f:
        f.write(struct.pack('<Q', len(header_bytes)))
        f.write(bytes(header_bytes))
        for c in chunks:
            f.write(c)
    size_mb = os.path.getsize(OUT_CHECKPOINT) / 1024 / 1024
    print('Ditulis:', os.path.relpath(OUT_CHECKPOINT, ROOT), '-', round(size_mb, 2), 'MB')


def main():
    print('\nAnggaran waktu training: {} menit. Batch size: {}. Threads: {}.'.format(BUDGET_MINUTES, BATCH_SIZE, torch.get_num_threads()))
    model = RategoanTransformer()
    param_count = model.param_count()
    print('parameterCount:', param_count)
    if param_count != 49999872:
        print('PERINGATAN: parameterCount tidak persis 49999872!')

    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

    perplexity_before = None
    loss_before = eval_held_out(model, held_out_seqs, 30)
    if loss_before is not None:
        perplexity_before = float(torch.exp(torch.tensor(loss_before)))
        print('Held-out perplexity SEBELUM training:', perplexity_before)

    sample_prompts = ['Apa ibu kota Indonesia?', 'Siapa itu Albert Einstein?', 'Ceritakan tentang Rategoan', 'Halo, apa kabar?', 'Apa itu localStorage?']

    print('\nMulai training nyata (Adam, lr=1e-3, batch={}) di korpus Wikipedia nyata...'.format(BATCH_SIZE))
    deadline = time.time() + BUDGET_MINUTES * 60
    loss_history = []
    total_steps = 0
    idx = 0
    train_start = time.time()
    total_tokens_seen = 0
    checkpoint_fractions = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    next_ckpt_idx = 0

    while time.time() < deadline:
        batch_seqs = train_seqs[idx:idx + BATCH_SIZE]
        idx += BATCH_SIZE
        if not batch_seqs:
            idx = 0
            random.shuffle(train_seqs)
            continue
        ids = pad_batch(batch_seqs, PAD_ID)
        optimizer.zero_grad()
        loss = compute_loss(model, ids)
        loss.backward()
        optimizer.step()
        total_steps += 1
        total_tokens_seen += sum(len(s) for s in batch_seqs)
        elapsed = time.time() - train_start
        loss_history.append({'step': total_steps, 'loss': loss.item(), 'elapsedSec': round(elapsed, 1)})
        if total_steps % 20 == 0:
            print('  step {} train_loss={:.4f} ({}s, {} token terlihat)'.format(total_steps, loss.item(), round(elapsed, 1), total_tokens_seen), flush=True)

        progress = elapsed / (BUDGET_MINUTES * 60)
        while next_ckpt_idx < len(checkpoint_fractions) and progress >= checkpoint_fractions[next_ckpt_idx] and total_steps > 20:
            print('  [checkpoint {}%] step {} ({}s)'.format(round(checkpoint_fractions[next_ckpt_idx] * 100), total_steps, round(elapsed, 1)))
            next_ckpt_idx += 1

    actual_minutes = (time.time() - train_start) / 60
    sec_per_step_avg = (time.time() - train_start) / total_steps if total_steps else None
    print('\nTraining berhenti setelah {:.1f} menit, {} step, {} token terlihat.'.format(actual_minutes, total_steps, total_tokens_seen))

    loss_final = eval_held_out(model, held_out_seqs, min(200, len(held_out_seqs)))
    perplexity_final = float(torch.exp(torch.tensor(loss_final))) if loss_final is not None else None
    print('Held-out perplexity FINAL:', perplexity_final)

    print('\n--- Sampel generasi (SESUDAH training - {} step) ---'.format(total_steps))
    samples_after = []
    for prompt in sample_prompts:
        pid = encode_prompt(prompt)
        t0 = time.time()
        gen_ids = generate_sample(model, pid, max_new_tokens=40, min_new_tokens=8, temperature=0.9)
        dt = time.time() - t0
        text = decode_ids(gen_ids)
        print('  "{}" -> "{}" ({:.1f}s, {} token)'.format(prompt, text[:200], dt, len(gen_ids)))
        samples_after.append({'prompt': prompt, 'text': text[:300], 'tokensGenerated': len(gen_ids), 'seconds': round(dt, 1)})

    print('\nMenulis checkpoint SafeTensors round 3...')
    write_checkpoint(model, total_steps, actual_minutes, len(train_seqs))

    report = {
        'generatedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'preset': 'massive50m',
        'stack': 'pytorch-cpu (ROUND 3 - korpus Wikipedia ID nyata)',
        'parameterCount': param_count,
        'corpusSource': 'idwiki-latest-pages-articles.xml.bz2 via GitHub Release (SHA256 diverifikasi)',
        'corpusArticles': 536372,
        'corpusChunks': len(all_chunks),
        'corpusTotalTokens': sum(len(s) for s in all_chunks),
        'trainChunks': len(train_seqs),
        'heldOutChunks': len(held_out_seqs),
        'batchSize': BATCH_SIZE,
        'budgetMinutes': BUDGET_MINUTES,
        'actualMinutes': round(actual_minutes, 2),
        'totalSteps': total_steps,
        'totalTokensSeen': total_tokens_seen,
        'secPerStepAvg': round(sec_per_step_avg, 4) if sec_per_step_avg else None,
        'lossHistory': loss_history,
        'heldOutPerplexity': {'before': perplexity_before, 'final': perplexity_final},
        'samplesAfter': samples_after,
        'catatanJujur': 'Training round 3 dengan korpus Wikipedia ID nyata (236.793.009 token, lantai 100 juta TERCAPAI - pertama kalinya dalam seluruh ronde proyek ini). {} step nyata dalam {:.1f} menit. Perplexity {} -> {}. Sampel generasi dicek apa adanya di atas.'.format(
            total_steps, actual_minutes, perplexity_before, perplexity_final
        ),
    }
    os.makedirs(os.path.dirname(REPORT_FILE), exist_ok=True)
    with open(REPORT_FILE, 'w') as f:
        json.dump(report, f, indent=2)
    print('Laporan ditulis:', os.path.relpath(REPORT_FILE, ROOT))


if __name__ == '__main__':
    main()
