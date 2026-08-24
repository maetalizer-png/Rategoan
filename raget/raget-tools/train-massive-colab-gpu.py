#!/usr/bin/env python3
"""MEGA-BATCH RAGETAN ROUND 8 - FASE 1: skrip training GPU Colab TERSATUKAN
untuk 3 ukuran model (50m/100m/200m) - menggantikan train-massive50m-colab-
gpu.py dan train-massive100m-colab-gpu.py sebagai satu skrip terpadu (skrip
lama TETAP ada di riwayat/tidak dihapus, tapi notebook Round 8 memakai
skrip ini). Vocab BPE 30.368 SATU untuk ketiga ukuran ("satu jiwa, tiga
badan") - diambil dari metadata checkpoint 50M yang sudah ada kalau model
ini fresh init, atau dari checkpoint model ini sendiri kalau resume.

MODE TUNTAS: berhenti kalau SALAH SATU tercapai duluan -
  (a) 1 epoch penuh atas korpus (semua chunk train sudah dilihat sekali),
  (b) target perplexity held-out tercapai (opsional, 0 = tidak dipakai),
  (c) BUDGET_MINUTES sesi ini habis (batas aman - checkpoint disimpan,
      TIDAK dianggap "selesai", tinggal Run all lagi utk lanjut).
AUTO-RESUME: checkpoint (kalau sudah ada di path output) dimuat balik
sebelum training generasi baru - trainingSteps/trainingMinutes akumulasi
dari metadata checkpoint sendiri, PERSIS pola round 4/5.
AUTO-COMMIT PERIODIK: tiap COMMIT_EVERY_MINUTES, checkpoint DAN laporan
progress di-commit+push ke git (kalau dijalankan di dalam clone repo) -
supaya sesi Colab yang mati mendadak tidak kehilangan progres sejak commit
terakhir (bukan cuma sejak training dimulai).

Pakai:
  python3 raget-tools/train-massive-colab-gpu.py <model_size:50m|100m|200m> \
      <budget_minutes> <batch_size> <chunks.txt> <target_perplexity_or_0> \
      [commit_every_minutes] [push_branch]
"""
import os
import subprocess

os.environ.setdefault('OMP_NUM_THREADS', str(os.cpu_count() or 4))

import array
import json
import random
import struct
import sys
import time

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

MODEL_SIZE = sys.argv[1]
BUDGET_MINUTES = float(sys.argv[2])
BATCH_SIZE = int(sys.argv[3])
CHUNKS_FILE = sys.argv[4]
TARGET_PERPLEXITY = float(sys.argv[5]) if len(sys.argv) > 5 else 0.0
COMMIT_EVERY_MINUTES = float(sys.argv[6]) if len(sys.argv) > 6 else 0.0
PUSH_BRANCH = sys.argv[7] if len(sys.argv) > 7 else None

DIMS = {
    '50m': {'dModel': 512, 'nLayers': 6, 'nHeads': 8, 'dFF': 2048},
    '100m': {'dModel': 768, 'nLayers': 8, 'nHeads': 12, 'dFF': 3072},
    '200m': {'dModel': 1024, 'nLayers': 11, 'nHeads': 16, 'dFF': 4096},
}
if MODEL_SIZE not in DIMS:
    raise SystemExit('model_size harus salah satu dari: ' + ', '.join(DIMS.keys()))

D_MODEL = DIMS[MODEL_SIZE]['dModel']
N_LAYERS = DIMS[MODEL_SIZE]['nLayers']
N_HEADS = DIMS[MODEL_SIZE]['nHeads']
D_FF = DIMS[MODEL_SIZE]['dFF']

VOCAB_SIZE = 30368
INIT_STD = 0.02
MAX_CONTEXT_LEN = 512
PAD_ID, UNK_ID, BOS_ID, EOS_ID = 0, 1, 2, 3
END_OF_WORD = '</w>'

OUT_CHECKPOINT = os.path.join(ROOT, 'raget', 'raget-data', 'neural', 'raget-neural-massive{}.safetensors'.format(MODEL_SIZE))
TOKENIZER_SOURCE_CHECKPOINT = os.path.join(ROOT, 'raget', 'raget-data', 'neural', 'raget-neural-massive50m.safetensors')
REPORT_FILE = os.path.join(ROOT, 'raget', 'raget-devlog', 'neural', 'training-report-massive{}-round8-colab-gpu.json'.format(MODEL_SIZE))

DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
USE_FP16 = DEVICE.type == 'cuda'

torch.manual_seed(42)
random.seed(42)
if DEVICE.type == 'cpu':
    torch.set_num_threads(os.cpu_count() or 4)


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
        mask = torch.triu(torch.full((T, T), float('-inf'), device=ids.device), diagonal=1)
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


def load_tokenizer_from_checkpoint(path):
    with open(path, 'rb') as f:
        header_len = struct.unpack('<Q', f.read(8))[0]
        header_bytes = f.read(header_len)
    header = json.loads(header_bytes.decode('utf-8').rstrip())
    rategoan_meta = json.loads(header['__metadata__']['rategoan'])
    return rategoan_meta.get('merges', []), rategoan_meta.get('vocabEntries', [])


def load_checkpoint_into_model(path, model):
    with open(path, 'rb') as f:
        raw = f.read()
    header_len = struct.unpack('<Q', raw[:8])[0]
    header_bytes = raw[8:8 + header_len]
    header = json.loads(header_bytes.decode('utf-8').rstrip())
    tensor_data_start = 8 + header_len
    rategoan_meta = json.loads(header['__metadata__']['rategoan'])
    quant = rategoan_meta['quant']
    prev_steps = rategoan_meta.get('trainingSteps', 0)
    prev_minutes = rategoan_meta.get('trainingMinutes', 0)
    merges = rategoan_meta.get('merges', [])
    vocab_entries = rategoan_meta.get('vocabEntries', [])
    prev_epochs = rategoan_meta.get('fullEpochsCompleted', 0)

    def read_tensor(name):
        desc = header[name]
        start, end = desc['data_offsets']
        abs_start = tensor_data_start + start
        abs_end = tensor_data_start + end
        if desc['dtype'] == 'I8':
            data = np.frombuffer(raw[abs_start:abs_end], dtype=np.int8)
            q = quant[name]
            rows, cols = desc['shape']
            arr = (data.astype(np.float32).reshape(rows, cols) + 127) * q['scale'] + q['zeroPoint']
            return arr
        else:
            arr = np.frombuffer(raw[abs_start:abs_end], dtype='<f4')
            return arr.copy()

    with torch.no_grad():
        model.embedding.copy_(torch.from_numpy(read_tensor('embedding.weight')))
        for i, blk in enumerate(model.blocks):
            p = 'layers.{}.'.format(i)
            blk.Wq.copy_(torch.from_numpy(read_tensor(p + 'attention.Wq')))
            blk.Wk.copy_(torch.from_numpy(read_tensor(p + 'attention.Wk')))
            blk.Wv.copy_(torch.from_numpy(read_tensor(p + 'attention.Wv')))
            blk.Wo.copy_(torch.from_numpy(read_tensor(p + 'attention.Wo')))
            blk.W1.copy_(torch.from_numpy(read_tensor(p + 'ffn.W1')))
            blk.b1.copy_(torch.from_numpy(read_tensor(p + 'ffn.b1')))
            blk.W2.copy_(torch.from_numpy(read_tensor(p + 'ffn.W2')))
            blk.b2.copy_(torch.from_numpy(read_tensor(p + 'ffn.b2')))
            blk.ln1.weight.copy_(torch.from_numpy(read_tensor(p + 'ln1.gamma')))
            blk.ln1.bias.copy_(torch.from_numpy(read_tensor(p + 'ln1.beta')))
            blk.ln2.weight.copy_(torch.from_numpy(read_tensor(p + 'ln2.gamma')))
            blk.ln2.bias.copy_(torch.from_numpy(read_tensor(p + 'ln2.beta')))
        model.final_norm.weight.copy_(torch.from_numpy(read_tensor('final_norm.gamma')))
        model.final_norm.bias.copy_(torch.from_numpy(read_tensor('final_norm.beta')))

    return prev_steps, prev_minutes, prev_epochs, merges, vocab_entries


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
            ids = torch.tensor([s], dtype=torch.long, device=DEVICE)
            loss = compute_loss(model, ids)
            total_loss += loss.item()
            count += 1
    model.train()
    return total_loss / count if count else None


def align4(n):
    return (n + 3) & ~3


def quantize_matrix_np(mat):
    arr = mat.detach().to('cpu').numpy().astype('float32')
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


def write_checkpoint(model, merges, vocab_entries, total_steps, actual_minutes, corpus_size, full_epochs):
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
        arr = vec.detach().to('cpu').numpy().astype('<f4')
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
        'model': {'name': 'massive' + MODEL_SIZE, 'vocabSize': VOCAB_SIZE, 'dModel': D_MODEL, 'nLayers': N_LAYERS, 'nHeads': N_HEADS, 'dFF': D_FF, 'maxContextLength': MAX_CONTEXT_LEN, 'dropoutRate': 0.1, 'initStd': INIT_STD},
        'runtime': {'backend': 'cpu-js', 'precision': 'f32', 'seed': 42, 'logLevel': 'warn', 'maxNewTokens': 128, 'minNewTokens': 8, 'temperature': 0.4, 'topP': 0.88, 'repetitionPenalty': 1.15, 'greedy': False},
        'specialTokens': {'PAD': '<pad>', 'UNK': '<unk>', 'BOS': '<bos>', 'EOS': '<eos>'},
        'specialTokenIds': {'PAD': 0, 'UNK': 1, 'BOS': 2, 'EOS': 3},
    }
    rategoan_meta = {
        'name': 'rategoan-neural-massive{}-checkpoint-round8-tuntas'.format(MODEL_SIZE),
        'description': 'Model {} - mode TUNTAS (epoch/perplexity/budget), auto-resume lintas sesi Colab'.format(MODEL_SIZE),
        'createdAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'trained': True,
        'trainingSteps': total_steps,
        'trainingMinutes': actual_minutes,
        'fullEpochsCompleted': full_epochs,
        'corpusSize': corpus_size,
        'config': config,
        'merges': merges,
        'vocabEntries': vocab_entries,
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

    tmp_path = OUT_CHECKPOINT + '.tmp'
    with open(tmp_path, 'wb') as f:
        f.write(struct.pack('<Q', len(header_bytes)))
        f.write(bytes(header_bytes))
        for c in chunks:
            f.write(c)
    os.replace(tmp_path, OUT_CHECKPOINT)
    size_mb = os.path.getsize(OUT_CHECKPOINT) / 1024 / 1024
    print('Ditulis:', os.path.relpath(OUT_CHECKPOINT, ROOT), '-', round(size_mb, 2), 'MB', flush=True)


def git_auto_commit(message):
    if not PUSH_BRANCH:
        return
    try:
        subprocess.run(['git', '-C', ROOT, 'add', OUT_CHECKPOINT, REPORT_FILE], check=False)
        res = subprocess.run(['git', '-C', ROOT, 'commit', '-m', message], check=False, capture_output=True, text=True)
        print('  [auto-commit]', res.stdout.strip()[:200] or res.stderr.strip()[:200], flush=True)
        push_res = subprocess.run(['git', '-C', ROOT, 'push', 'origin', 'HEAD:' + PUSH_BRANCH], check=False, capture_output=True, text=True)
        print('  [auto-push ke {}]'.format(PUSH_BRANCH), (push_res.stdout + push_res.stderr).strip()[:200], flush=True)
    except Exception as e:
        print('  [auto-commit GAGAL, lanjut training]:', e, flush=True)


ID_TO_TOKEN = None
MERGE_RANK = None


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


def encode_prompt(prompt_text, token_to_id, merge_rank):
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
                r = merge_rank.get((symbols[i], symbols[i + 1]))
                if r is not None and (best_rank is None or r < best_rank):
                    best_rank, best_i = r, i
            if best_i == -1:
                break
            symbols = symbols[:best_i] + [symbols[best_i] + symbols[best_i + 1]] + symbols[best_i + 2:]
        ids.extend(token_to_id.get(s, UNK_ID) for s in symbols)
    return ids


@torch.no_grad()
def generate_sample(model, prompt_ids, max_new_tokens, min_new_tokens, temperature):
    model.eval()
    ids = [BOS_ID] + prompt_ids
    generated = []
    for _ in range(max_new_tokens):
        inp = torch.tensor([ids[-MAX_CONTEXT_LEN:]], dtype=torch.long, device=DEVICE)
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
    return decode_ids(generated), len(generated)


def main():
    global ID_TO_TOKEN, MERGE_RANK

    print('=== Rategoan massive{} - MODE TUNTAS ==='.format(MODEL_SIZE), flush=True)
    print('Device:', DEVICE, '| fp16:', USE_FP16, '| dModel={} nLayers={} nHeads={} dFF={}'.format(D_MODEL, N_LAYERS, N_HEADS, D_FF), flush=True)

    print('Memuat chunk sequence dari', CHUNKS_FILE, '...', flush=True)
    t_load = time.time()
    all_chunks = []
    with open(CHUNKS_FILE) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            all_chunks.append(array.array('H', (int(x) for x in line.split(' '))))
    print('Chunk dimuat:', len(all_chunks), '({}s)'.format(round(time.time() - t_load, 1)), flush=True)

    random.shuffle(all_chunks)
    held_out_n = max(1, len(all_chunks) // 200)
    held_out_seqs = all_chunks[:held_out_n]
    train_seqs = all_chunks[held_out_n:]
    print('Train:', len(train_seqs), 'Held-out:', len(held_out_seqs), flush=True)

    model = RategoanTransformer().to(DEVICE)
    param_count = model.param_count()
    print('parameterCount ({}):'.format(MODEL_SIZE), param_count, flush=True)

    resuming = os.path.exists(OUT_CHECKPOINT)
    if resuming:
        print('Checkpoint {} SUDAH ADA - resume.'.format(MODEL_SIZE), flush=True)
        prev_steps, prev_minutes, prev_epochs, merges, vocab_entries = load_checkpoint_into_model(OUT_CHECKPOINT, model)
    else:
        print('Checkpoint {} BELUM ADA - fresh init, vocab dipinjam dari checkpoint 50M.'.format(MODEL_SIZE), flush=True)
        prev_steps, prev_minutes, prev_epochs = 0, 0.0, 0
        merges, vocab_entries = load_tokenizer_from_checkpoint(TOKENIZER_SOURCE_CHECKPOINT)

    MERGE_RANK = {tuple(m): i for i, m in enumerate(merges)}
    token_to_id = {t: i for t, i in vocab_entries}
    ID_TO_TOKEN = {i: t for t, i in vocab_entries}
    print('Vocab (satu jiwa untuk semua ukuran):', len(token_to_id), flush=True)

    optimizer = torch.optim.Adam(model.parameters(), lr=8e-4)
    scaler = torch.cuda.amp.GradScaler(enabled=USE_FP16)

    loss_before = eval_held_out(model, held_out_seqs, 30)
    perplexity_before = float(torch.exp(torch.tensor(loss_before))) if loss_before is not None else None
    print('Held-out perplexity SEBELUM sesi ini:', perplexity_before, flush=True)
    if TARGET_PERPLEXITY > 0 and perplexity_before is not None and perplexity_before <= TARGET_PERPLEXITY:
        print('Target perplexity ({}) SUDAH TERCAPAI sebelum training dimulai - berhenti.'.format(TARGET_PERPLEXITY), flush=True)

    sample_prompts = ['Apa ibu kota Indonesia?', 'Siapa itu Albert Einstein?', 'Ceritakan tentang Rategoan', 'Halo, apa kabar?', 'Apa itu localStorage?']

    print('\nBudget sesi ini: {} menit. Batch: {}. Target perplexity: {}. Epoch sudah selesai sebelumnya: {}.'.format(
        BUDGET_MINUTES, BATCH_SIZE, TARGET_PERPLEXITY or 'tidak dipakai', prev_epochs), flush=True)
    deadline = time.time() + BUDGET_MINUTES * 60
    loss_history = []
    total_steps_this_run = 0
    idx = 0
    train_start = time.time()
    total_tokens_seen_this_run = 0
    checkpoint_every_steps = 300
    last_checkpoint_step = 0
    last_commit_time = time.time()
    epoch_count = prev_epochs
    current_perplexity = perplexity_before
    stop_reason = 'budget_habis'

    while time.time() < deadline:
        if epoch_count >= 1:
            stop_reason = 'epoch_penuh_tercapai'
            break
        if TARGET_PERPLEXITY > 0 and current_perplexity is not None and current_perplexity <= TARGET_PERPLEXITY:
            stop_reason = 'target_perplexity_tercapai'
            break
        batch_seqs = train_seqs[idx:idx + BATCH_SIZE]
        idx += BATCH_SIZE
        if not batch_seqs:
            idx = 0
            epoch_count += 1
            random.shuffle(train_seqs)
            print('  [EPOCH {} SELESAI - {} chunk dilihat] ({}s)'.format(epoch_count, len(train_seqs), round(time.time() - train_start)), flush=True)
            continue
        ids = pad_batch(batch_seqs, PAD_ID).to(DEVICE)
        optimizer.zero_grad()
        if USE_FP16:
            with torch.autocast(device_type='cuda', dtype=torch.float16):
                loss = compute_loss(model, ids)
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
        else:
            loss = compute_loss(model, ids)
            loss.backward()
            optimizer.step()
        total_steps_this_run += 1
        total_tokens_seen_this_run += sum(len(s) for s in batch_seqs)
        elapsed = time.time() - train_start
        if total_steps_this_run % 40 == 0:
            loss_history.append({'step': prev_steps + total_steps_this_run, 'loss': loss.item(), 'elapsedSec': round(elapsed, 1)})
            print('  step {} (+{} sesi ini) train_loss={:.4f} ({}s, {:.1f} tok/s)'.format(
                prev_steps + total_steps_this_run, total_steps_this_run, loss.item(), round(elapsed, 1),
                total_tokens_seen_this_run / elapsed if elapsed > 0 else 0), flush=True)

        if total_steps_this_run - last_checkpoint_step >= checkpoint_every_steps:
            last_checkpoint_step = total_steps_this_run
            actual_minutes_so_far = (time.time() - train_start) / 60
            if TARGET_PERPLEXITY > 0:
                loss_now = eval_held_out(model, held_out_seqs, 30)
                current_perplexity = float(torch.exp(torch.tensor(loss_now))) if loss_now is not None else None
            write_checkpoint(model, merges, vocab_entries, prev_steps + total_steps_this_run, prev_minutes + actual_minutes_so_far, len(train_seqs), epoch_count)
            print('  [checkpoint periodik step {} | perplexity~{}]'.format(prev_steps + total_steps_this_run, current_perplexity), flush=True)

            if COMMIT_EVERY_MINUTES > 0 and (time.time() - last_commit_time) / 60 >= COMMIT_EVERY_MINUTES:
                git_auto_commit('Round 8 auto-commit: massive{} step {} (progress otomatis, sesi berjalan)'.format(MODEL_SIZE, prev_steps + total_steps_this_run))
                last_commit_time = time.time()

    actual_minutes_this_run = (time.time() - train_start) / 60
    total_steps_final = prev_steps + total_steps_this_run
    total_minutes_final = prev_minutes + actual_minutes_this_run
    sec_per_step_avg = (time.time() - train_start) / total_steps_this_run if total_steps_this_run else None
    tokens_per_sec_avg = total_tokens_seen_this_run / (time.time() - train_start) if total_steps_this_run else None
    print('\nBerhenti ({}) setelah {:.1f} menit ({} step, {} epoch). Total: {} step / {:.1f} menit. {:.1f} tok/s.'.format(
        stop_reason, actual_minutes_this_run, total_steps_this_run, epoch_count, total_steps_final, total_minutes_final, tokens_per_sec_avg or 0), flush=True)

    loss_final = eval_held_out(model, held_out_seqs, min(300, len(held_out_seqs)))
    perplexity_final = float(torch.exp(torch.tensor(loss_final))) if loss_final is not None else None
    print('Held-out perplexity FINAL:', perplexity_final, flush=True)

    print('\n--- Sampel generasi ---', flush=True)
    samples_after = []
    for prompt in sample_prompts:
        pid = encode_prompt(prompt, token_to_id, MERGE_RANK)
        t0 = time.time()
        text, n_tok = generate_sample(model, pid, max_new_tokens=40, min_new_tokens=8, temperature=0.9)
        dt = time.time() - t0
        print('  "{}" -> "{}" ({:.1f}s, {} token)'.format(prompt, text[:200], dt, n_tok), flush=True)
        samples_after.append({'prompt': prompt, 'text': text[:300], 'tokensGenerated': n_tok, 'seconds': round(dt, 1)})

    print('\nMenulis checkpoint SafeTensors final...', flush=True)
    write_checkpoint(model, merges, vocab_entries, total_steps_final, total_minutes_final, len(train_seqs), epoch_count)

    report = {
        'generatedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'preset': 'massive' + MODEL_SIZE,
        'stack': 'pytorch-{} (ROUND 8 MODE TUNTAS)'.format(DEVICE.type),
        'device': str(DEVICE),
        'gpuName': torch.cuda.get_device_name(0) if DEVICE.type == 'cuda' else None,
        'parameterCount': param_count,
        'wasFreshInit': not resuming,
        'stopReason': stop_reason,
        'prevSteps': prev_steps,
        'prevMinutes': prev_minutes,
        'stepsThisSession': total_steps_this_run,
        'minutesThisSession': round(actual_minutes_this_run, 2),
        'totalStepsAccumulated': total_steps_final,
        'totalMinutesAccumulated': round(total_minutes_final, 2),
        'fullEpochsCompleted': epoch_count,
        'trainChunksAvailable': len(train_seqs),
        'totalTokensSeenThisSession': total_tokens_seen_this_run,
        'batchSize': BATCH_SIZE,
        'budgetMinutesThisSession': BUDGET_MINUTES,
        'targetPerplexity': TARGET_PERPLEXITY or None,
        'secPerStepAvg': round(sec_per_step_avg, 4) if sec_per_step_avg else None,
        'tokenPerSecAvg': round(tokens_per_sec_avg, 1) if tokens_per_sec_avg else None,
        'heldOutPerplexity': {'beforeThisSession': perplexity_before, 'final': perplexity_final},
        'samplesAfter': samples_after,
        'lossHistoryTailSample': loss_history[-50:],
        'catatanJujur': 'massive{} mode TUNTAS. Berhenti karena: {}. Sesi ini {} step/{:.1f} menit. Total akumulasi {} step/{:.1f} menit, {} epoch penuh dari {} chunk. Perplexity {} -> {}.'.format(
            MODEL_SIZE, stop_reason, total_steps_this_run, actual_minutes_this_run, total_steps_final, total_minutes_final,
            epoch_count, len(train_seqs), perplexity_before, perplexity_final,
        ),
    }
    os.makedirs(os.path.dirname(REPORT_FILE), exist_ok=True)
    with open(REPORT_FILE, 'w') as f:
        json.dump(report, f, indent=2)
    print('Laporan ditulis:', os.path.relpath(REPORT_FILE, ROOT), flush=True)

    if PUSH_BRANCH:
        git_auto_commit('Round 8: massive{} - {} (step {}, {} epoch)'.format(MODEL_SIZE, stop_reason, total_steps_final, epoch_count))


if __name__ == '__main__':
    main()
