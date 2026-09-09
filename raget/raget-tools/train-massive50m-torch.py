#!/usr/bin/env python3
"""MEGA-BATCH RAGETAN-50M ROUND 2 - FASE 1/3: transformasi stack training ke
PyTorch (BLAS/optimized CPU tensor ops) karena audit FASE 0 membuktikan:
tidak ada GPU (nvidia-smi/CUDA absen), tapi pip install torch (CPU) BERHASIL
lewat pypi.org (satu-satunya index yang tidak diblokir kebijakan egress).

Arsitektur PERSIS SAMA seperti preset 'massive50m' di raget-neural/
llm-config.js (vocabSize 30368, dModel 512, nLayers 6, nHeads 8, dFF 2048),
forward pass direplikasi PERSIS mengikuti llm-transformer.js/llm-attention.js/
llm-decoder.js (pre-LN, GELU tanh-approx, attention head-split kontigu, tied
embedding/output projection, positional encoding sinusoidal tetap) SUPAYA
checkpoint hasil training di sini bisa dimuat balik oleh runtime inference
JS murni di browser (llm-checkpoint.js#restoreModelFromCheckpointSafetensors)
TANPA perubahan apa pun pada runtime - local-first / rule-engine tidak
tersentuh, cuma training-nya yang pindah stack.

Tokenizer (BPE merges + vocab) di-dump dari checkpoint raget-neural-
massive50m.safetensors yang sudah ada (hasil ronde sebelumnya) lewat
raget-tools/dump-tokenizer.mjs setara - dipakai APA ADANYA di sini supaya
tokenisasi identik dengan sisi JS.

Checkpoint keluaran ditulis dengan format biner PERSIS SAMA seperti
llm-checkpoint.js#createCheckpointSafetensors() (quantisasi int8 per-matrix,
header JSON SafeTensors-like, __metadata__.rategoan berisi config/merges/
vocab/quant) - byte-compatible, bukan cuma "mirip".

Pakai: python3 raget-tools/train-massive50m-torch.py [menitAnggaran]
"""
import json
import os
import struct
import sys
import time

import torch
import torch.nn as nn
import torch.nn.functional as F

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TOKENIZER_DUMP = sys.argv[3] if len(sys.argv) > 3 else '/tmp/claude-0/-home-user-Rategoan/1d3a8163-ee4a-5623-836f-b8ff04731bed/scratchpad/tokenizer-dump.json'
CORPUS_DUMP = sys.argv[4] if len(sys.argv) > 4 else '/tmp/claude-0/-home-user-Rategoan/1d3a8163-ee4a-5623-836f-b8ff04731bed/scratchpad/corpus-tokenized.json'
OUT_CHECKPOINT = os.path.join(ROOT, 'raget', 'raget-data', 'neural', 'raget-neural-massive50m.safetensors')
REPORT_FILE = os.path.join(ROOT, 'raget', 'raget-devlog', 'neural', 'training-report-massive50m.json')

BUDGET_MINUTES = float(sys.argv[1]) if len(sys.argv) > 1 else 30.0
BATCH_SIZE = int(sys.argv[2]) if len(sys.argv) > 2 else 16

torch.manual_seed(42)
torch.set_num_threads(os.cpu_count() or 4)

with open(TOKENIZER_DUMP) as f:
    tok = json.load(f)
CFG = tok['config']['model']
SPECIAL = tok['config']['specialTokenIds']
MERGES = tok['merges']
VOCAB_ENTRIES = tok['vocabEntries']

VOCAB_SIZE = CFG['vocabSize']
D_MODEL = CFG['dModel']
N_LAYERS = CFG['nLayers']
N_HEADS = CFG['nHeads']
D_FF = CFG['dFF']
INIT_STD = CFG['initStd']
PAD_ID = SPECIAL['PAD']
BOS_ID = SPECIAL['BOS']
EOS_ID = SPECIAL['EOS']
UNK_ID = SPECIAL['UNK']

with open(CORPUS_DUMP) as f:
    corpus = json.load(f)
train_seqs = corpus['train']
held_out_seqs = corpus['heldOut']
print('Korpus: {} train, {} held-out (token id sudah di-dump dari tokenizer JS yang sama)'.format(len(train_seqs), len(held_out_seqs)))


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
    """Pre-LN block, replika PERSIS transformerBlock() di llm-transformer.js."""

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
        # x: (B, T, D)
        normed1 = self.ln1(x)
        B, T, D = normed1.shape
        Q = normed1 @ self.Wq
        K = normed1 @ self.Wk
        V = normed1 @ self.Wv
        # split heads: chunk kontigu sama seperti splitHeads() di llm-attention.js
        Qh = Q.view(B, T, self.n_heads, self.d_head).transpose(1, 2)
        Kh = K.view(B, T, self.n_heads, self.d_head).transpose(1, 2)
        Vh = V.view(B, T, self.n_heads, self.d_head).transpose(1, 2)
        scale = 1.0 / (self.d_head ** 0.5)
        scores = (Qh @ Kh.transpose(-2, -1)) * scale
        scores = scores + causal_mask
        weights = F.softmax(scores, dim=-1)
        headOut = weights @ Vh  # (B, nHeads, T, dHead)
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
        self.register_buffer('pos_enc', sinusoidal_positional_encoding(CFG['maxContextLength'], D_MODEL))
        self.blocks = nn.ModuleList([TransformerBlock(D_MODEL, N_HEADS, D_FF, INIT_STD) for _ in range(N_LAYERS)])
        self.final_norm = nn.LayerNorm(D_MODEL, eps=1e-5)

    def forward(self, ids):
        B, T = ids.shape
        x = self.embedding[ids] + self.pos_enc[:T].unsqueeze(0)
        mask = torch.triu(torch.full((T, T), float('-inf')), diagonal=1)
        for block in self.blocks:
            x = block(x, mask)
        x = self.final_norm(x)
        logits = x @ self.embedding.t()  # tied output projection
        return logits

    def param_count(self):
        total = self.embedding.numel()  # embedding
        for b in self.blocks:
            total += b.Wq.numel() + b.Wk.numel() + b.Wv.numel() + b.Wo.numel()
            total += b.W1.numel() + b.b1.numel() + b.W2.numel() + b.b2.numel()
            total += b.ln1.weight.numel() + b.ln1.bias.numel() + b.ln2.weight.numel() + b.ln2.bias.numel()
        total += self.final_norm.weight.numel() + self.final_norm.bias.numel()
        total += self.embedding.numel()  # outputProjection (tied, tapi dihitung terpisah - sama seperti countParameters() di llm-weights.js)
        return total


def pad_batch(seqs, pad_id):
    max_len = max(len(s) for s in seqs)
    ids = torch.full((len(seqs), max_len), pad_id, dtype=torch.long)
    lengths = []
    for i, s in enumerate(seqs):
        ids[i, :len(s)] = torch.tensor(s, dtype=torch.long)
        lengths.append(len(s))
    return ids, lengths


def compute_loss(model, ids, lengths):
    inp = ids[:, :-1]
    tgt = ids[:, 1:]
    logits = model(inp)
    logits_flat = logits.reshape(-1, VOCAB_SIZE)
    tgt_flat = tgt.reshape(-1)
    loss = F.cross_entropy(logits_flat, tgt_flat, ignore_index=PAD_ID)
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
            loss = compute_loss(model, ids, [len(s)])
            total_loss += loss.item()
            count += 1
    model.train()
    return total_loss / count if count else None


def generate_sample(model, prompt_ids, max_new_tokens, min_new_tokens, temperature):
    model.eval()
    ids = [BOS_ID] + prompt_ids
    generated = []
    with torch.no_grad():
        for step in range(max_new_tokens):
            inp = torch.tensor([ids[-CFG['maxContextLength']:]], dtype=torch.long)
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


def tokenize_prompt(text):
    # tokenisasi prompt sample pakai apply-BPE yang sama seperti sisi JS -
    # tapi untuk kesederhanaan sample generation di sini, prompt di-encode via
    # whitespace+BPE-merge sederhana: dipakai HANYA untuk sampel generasi
    # (bukan bagian training), jadi cukup lookup token yang ada di vocab.
    ids = []
    for w in text.lower().split():
        found = None
        for tok_str, tid in VOCAB_ENTRIES:
            if tok_str.rstrip('</w>') == w or tok_str == w + '</w>':
                found = tid
                break
        ids.append(found if found is not None else UNK_ID)
    return ids


def main():
    print('Anggaran waktu training: {} menit. Batch size: {}. Threads: {}.'.format(BUDGET_MINUTES, BATCH_SIZE, torch.get_num_threads()))
    model = RategoanTransformer()
    param_count = model.param_count()
    print('parameterCount (formula sama seperti countParameters() JS):', param_count)
    if param_count != 49999872:
        print('PERINGATAN: parameterCount tidak persis 49999872!')

    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

    perplexity_before = None
    loss_before = eval_held_out(model, held_out_seqs, 15)
    if loss_before is not None:
        perplexity_before = float(torch.exp(torch.tensor(loss_before)))
        print('Held-out perplexity SEBELUM training:', perplexity_before)

    sample_prompts = ['Apa ibu kota Indonesia?', 'Siapa itu Albert Einstein?', 'Ceritakan tentang Rategoan', 'Halo, apa kabar?', 'Apa itu localStorage?']
    print('\n--- Mengukur kecepatan 1 step nyata (perbandingan langsung vs 6.29s/step JS ronde lalu) ---')
    warm_ids, warm_lens = pad_batch(train_seqs[:BATCH_SIZE], PAD_ID)
    t_step0 = time.time()
    optimizer.zero_grad()
    loss0 = compute_loss(model, warm_ids, warm_lens)
    loss0.backward()
    optimizer.step()
    step0_sec = time.time() - t_step0
    print('1 step (batch={}) pertama (termasuk warmup):'.format(BATCH_SIZE), round(step0_sec, 4), 's')

    t_step1 = time.time()
    optimizer.zero_grad()
    loss1 = compute_loss(model, warm_ids, warm_lens)
    loss1.backward()
    optimizer.step()
    step1_sec = time.time() - t_step1
    print('1 step (batch={}) kedua (steady-state):'.format(BATCH_SIZE), round(step1_sec, 4), 's')
    speedup = 6.29 / step1_sec if step1_sec > 0 else None
    print('Speedup vs JS murni (6.29 detik/step, batch=4):', round(speedup, 1) if speedup else 'n/a', 'x lebih cepat')

    print('\nMulai training nyata (Adam, lr=1e-3, batch={})...'.format(BATCH_SIZE))
    deadline = time.time() + BUDGET_MINUTES * 60
    loss_history = []
    held_out_history = []
    total_steps = 0
    idx = 0
    train_start = time.time()
    checkpoint_fractions = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    next_ckpt_idx = 0
    total_tokens_seen = 0

    while time.time() < deadline:
        batch_seqs = train_seqs[idx:idx + BATCH_SIZE]
        idx += BATCH_SIZE
        if not batch_seqs:
            idx = 0
            continue
        ids, lengths = pad_batch(batch_seqs, PAD_ID)
        optimizer.zero_grad()
        loss = compute_loss(model, ids, lengths)
        loss.backward()
        optimizer.step()
        total_steps += 1
        total_tokens_seen += sum(lengths)
        elapsed = time.time() - train_start
        loss_history.append({'step': total_steps, 'loss': loss.item(), 'elapsedSec': round(elapsed, 1)})
        if total_steps % 20 == 0:
            print('  step {} train_loss={:.4f} ({}s, {} token terlihat)'.format(total_steps, loss.item(), round(elapsed, 1), total_tokens_seen))

        progress = elapsed / (BUDGET_MINUTES * 60)
        while next_ckpt_idx < len(checkpoint_fractions) and progress >= checkpoint_fractions[next_ckpt_idx] and total_steps > 5:
            print('  [checkpoint {}%] step {} ({}s)'.format(round(checkpoint_fractions[next_ckpt_idx] * 100), total_steps, round(elapsed, 1)))
            next_ckpt_idx += 1

    actual_minutes = (time.time() - train_start) / 60
    sec_per_step_avg = (time.time() - train_start) / total_steps if total_steps else None
    print('\nTraining berhenti setelah {:.1f} menit, {} step, {} token terlihat (termasuk pengulangan/epoch).'.format(actual_minutes, total_steps, total_tokens_seen))

    loss_final = eval_held_out(model, held_out_seqs, len(held_out_seqs))
    perplexity_final = float(torch.exp(torch.tensor(loss_final))) if loss_final is not None else None
    print('Held-out perplexity FINAL (seluruh {} teks held-out):'.format(len(held_out_seqs)), perplexity_final)

    print('\n--- Sampel generasi (SESUDAH training - {} step) ---'.format(total_steps))
    samples_after = []
    for prompt in sample_prompts:
        pid = tokenize_prompt(prompt)
        t0 = time.time()
        gen_ids = generate_sample(model, pid, max_new_tokens=40, min_new_tokens=8, temperature=0.9)
        dt = time.time() - t0
        id_to_token = {tid: t for t, tid in VOCAB_ENTRIES}
        text = ' '.join(id_to_token.get(i, '<unk>').replace('</w>', '') for i in gen_ids)
        print('  "{}" -> "{}" ({:.1f}s, {} token)'.format(prompt, text[:200], dt, len(gen_ids)))
        samples_after.append({'prompt': prompt, 'text': text[:300], 'tokensGenerated': len(gen_ids), 'seconds': round(dt, 1)})

    print('\nMenulis checkpoint SafeTensors (format byte-compatible dengan llm-checkpoint.js)...')
    write_checkpoint(model, param_count, total_steps, actual_minutes, len(train_seqs))

    report = {
        'generatedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'preset': 'massive50m',
        'stack': 'pytorch-cpu (ROUND 2 - transformasi dari JS murni)',
        'parameterCount': param_count,
        'parameterCountTargetExact': 50000000,
        'budgetMinutes': BUDGET_MINUTES,
        'actualMinutes': round(actual_minutes, 2),
        'batchSize': BATCH_SIZE,
        'trainCorpusSize': len(train_seqs),
        'heldOutCorpusSize': len(held_out_seqs),
        'totalSteps': total_steps,
        'totalTokensSeen': total_tokens_seen,
        'secPerStepAvg': round(sec_per_step_avg, 4) if sec_per_step_avg else None,
        'secPerStepFirstStep': round(step0_sec, 4),
        'secPerStepSteadyState': round(step1_sec, 4),
        'secPerStepJSRoundSebelumnya': 6.29,
        'speedupVsJS': round(speedup, 1) if speedup else None,
        'lossHistory': loss_history,
        'heldOutPerplexity': {'before': perplexity_before, 'final': perplexity_final},
        'samplesAfter': samples_after,
        'catatanJujur': 'Training PyTorch CPU (bukan simulasi) berjalan {} step nyata dalam {:.1f} menit, {}x lebih cepat per-step dibanding JS murni ronde sebelumnya (diukur langsung, bukan asumsi). Held-out perplexity {} -> {}. Lantai 100 juta token TETAP tidak tercapai dalam sesi ini - {} token terlihat (termasuk pengulangan korpus/epoch berulang, korpus asli hanya ~95 ribu token unik) jauh di bawah 100 juta. Generasi pasca-training dicek apa adanya di atas - koheren/tidaknya dilaporkan sesuai hasil sungguhan, tidak diklaim sepihak.'.format(
            total_steps, actual_minutes, round(speedup, 1) if speedup else '?', perplexity_before, perplexity_final, total_tokens_seen
        ),
    }
    os.makedirs(os.path.dirname(REPORT_FILE), exist_ok=True)
    with open(REPORT_FILE, 'w') as f:
        json.dump(report, f, indent=2)
    print('Laporan ditulis:', os.path.relpath(REPORT_FILE, ROOT))


def quantize_matrix_np(mat):
    """Replika PERSIS quantizeMatrix() di llm-quantization.js (int8, scale=(max-min)/254, zeroPoint=min)."""
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


def align4(n):
    return (n + 3) & ~3


def write_checkpoint(model, param_count, total_steps, actual_minutes, corpus_size):
    import numpy as np

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
        b = q.tobytes()
        start, end = place(b)
        header[name] = {'dtype': 'I8', 'shape': [rows, cols], 'data_offsets': [start, end]}
        quant[name] = {'scale': scale, 'zeroPoint': zp}

    def write_vector(name, vec):
        arr = vec.detach().numpy().astype('<f4')
        b = arr.tobytes()
        start, end = place(b)
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

    rategoan_meta = {
        'name': 'rategoan-neural-massive50m-checkpoint-torch',
        'description': 'Trained with PyTorch CPU (ROUND 2 transformasi stack)',
        'createdAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'trained': True,
        'trainingSteps': total_steps,
        'trainingMinutes': actual_minutes,
        'corpusSize': corpus_size,
        'config': tok['config'],
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


if __name__ == '__main__':
    main()
