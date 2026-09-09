#!/usr/bin/env python3
"""MEGA-BATCH RAGETAN ROUND 5 FASE 3 + ROUND 6 FASE 4: server inference
1 FILE untuk checkpoint Rategoan Neural (format SafeTensors custom, byte-
compatible dengan runtime JS browser) - dipakai oleh mode "Server" di
Settings PWA (js/state/llm-mode.js + raget/raget-neural/neural-provider.js)
sebagai alternatif runtime lokal browser, berguna untuk checkpoint besar
(massive50m 34MB+, ATAU massive100m ~78MB+) di perangkat lambat.

Dimensi arsitektur (dModel/nLayers/nHeads/dFF/vocabSize) DIBACA OTOMATIS
dari metadata checkpoint sendiri (peek_checkpoint_config) - satu file
server ini menyajikan checkpoint UKURAN APA PUN (50M, 100M, dst) tanpa
perlu diedit, cukup ganti CHECKPOINT_PATH.

Tinggal deploy ke VPS atau HF Spaces (Docker SDK) - lihat instruksi di
bagian bawah file ini. TIDAK ada dependency proyek lain di luar file ini
(model+tokenizer+checkpoint-loader+generate SEMUA didefinisikan ulang di
sini) - benar-benar 1 file siap jalan asal checkpoint .safetensors ada di
sampingnya (atau lewat env var CHECKPOINT_PATH).

Jalankan lokal (uji coba):
    pip install fastapi uvicorn torch numpy
    CHECKPOINT_PATH=/path/ke/raget-neural-massive50m.safetensors python3 serve-massive50m.py
    # server aktif di http://0.0.0.0:8000, endpoint POST /generate

Endpoint:
    GET  /health            -> {"status": "ok", "checkpointLoaded": true, "parameterCount": ...}
    POST /generate           body {"prompt": str, "maxNewTokens": int?, "temperature": float?}
                              -> {"text": str, "tokensGenerated": int, "seconds": float}

Deploy ke HF Spaces (Docker SDK, GPU/CPU gratis tersedia) - ganti nama
checkpoint di baris COPY/ENV kalau mau menyajikan massive100m, bukan
massive50m (arsitektur dibaca otomatis, tinggal ganti nama file):
    1. Buat Space baru, SDK "Docker".
    2. Push file ini + Dockerfile satu baris:
         FROM python:3.11-slim
         RUN pip install fastapi uvicorn "torch>=2.0" numpy
         COPY serve-massive50m.py raget-neural-massive50m.safetensors /app/
         WORKDIR /app
         ENV CHECKPOINT_PATH=/app/raget-neural-massive50m.safetensors
         CMD ["python3", "serve-massive50m.py"]
    3. Isi URL Space (mis. https://username-nama-space.hf.space) di Settings
       PWA > "Mode Inference: Raget Neural" > Server.

Deploy ke VPS: salin file + checkpoint .safetensors ke server, jalankan
lewat systemd/tmux/screen memakai perintah "Jalankan lokal" di atas
(ganti 0.0.0.0 sesuai kebutuhan firewall), lalu isi URL publik VPS di
Settings PWA yang sama.
"""
import json
import os
import struct
import time

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

CHECKPOINT_PATH = os.environ.get(
    'CHECKPOINT_PATH',
    os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'raget-data', 'neural', 'raget-neural-massive50m.safetensors'),
)
HOST = os.environ.get('HOST', '0.0.0.0')
PORT = int(os.environ.get('PORT', '8000'))

# MEGA-BATCH RAGETAN ROUND 6 - FASE 4: dimensi arsitektur DIBACA dari
# metadata checkpoint sendiri (config.model), BUKAN di-hardcode - satu skrip
# server ini menyajikan checkpoint 50M ATAU 100M (atau ukuran lain di masa
# depan) tanpa perlu file server terpisah per ukuran, cukup ganti
# CHECKPOINT_PATH. Nilai default di bawah ini fallback kalau field config
# entah kenapa tidak ada di checkpoint lama.
INIT_STD = 0.02
PAD_ID, UNK_ID, BOS_ID, EOS_ID = 0, 1, 2, 3
END_OF_WORD = '</w>'

DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')


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
    def __init__(self, vocab_size, d_model, n_layers, n_heads, d_ff, max_context_len, init_std=INIT_STD):
        super().__init__()
        self.vocab_size = vocab_size
        self.max_context_len = max_context_len
        self.embedding = nn.Parameter(torch.randn(vocab_size, d_model) * init_std)
        self.register_buffer('pos_enc', sinusoidal_positional_encoding(max_context_len, d_model))
        self.blocks = nn.ModuleList([TransformerBlock(d_model, n_heads, d_ff, init_std) for _ in range(n_layers)])
        self.final_norm = nn.LayerNorm(d_model, eps=1e-5)

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


def peek_checkpoint_config(path):
    """Baca HANYA header (bukan tensor data) untuk ambil dimensi arsitektur
    (config.model) tersimpan di metadata checkpoint - dipakai membangun
    model dengan ukuran yang BENAR sebelum bobot dimuat, supaya server ini
    bisa menyajikan checkpoint ukuran berapa pun (50M, 100M, dst) tanpa
    hardcode dimensi."""
    with open(path, 'rb') as f:
        header_len_bytes = f.read(8)
        header_len = struct.unpack('<Q', header_len_bytes)[0]
        header_bytes = f.read(header_len)
    header = json.loads(header_bytes.decode('utf-8').rstrip())
    rategoan_meta = json.loads(header['__metadata__']['rategoan'])
    model_cfg = rategoan_meta.get('config', {}).get('model', {})
    return {
        'vocab_size': model_cfg.get('vocabSize', 30368),
        'd_model': model_cfg.get('dModel', 512),
        'n_layers': model_cfg.get('nLayers', 6),
        'n_heads': model_cfg.get('nHeads', 8),
        'd_ff': model_cfg.get('dFF', 2048),
        'max_context_len': model_cfg.get('maxContextLength', 512),
        'name': model_cfg.get('name', 'unknown'),
    }


def load_checkpoint(path, model):
    with open(path, 'rb') as f:
        raw = f.read()
    header_len = struct.unpack('<Q', raw[:8])[0]
    header_bytes = raw[8:8 + header_len]
    header = json.loads(header_bytes.decode('utf-8').rstrip())
    tensor_data_start = 8 + header_len
    rategoan_meta = json.loads(header['__metadata__']['rategoan'])
    quant = rategoan_meta['quant']
    merges = rategoan_meta.get('merges', [])
    vocab_entries = rategoan_meta.get('vocabEntries', [])

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

    return merges, vocab_entries, rategoan_meta.get('trainingSteps', 0)


def decode_ids(ids, id_to_token):
    text = ''
    word = ''
    for i in ids:
        piece = id_to_token.get(i, '<unk>')
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
def generate_text(model, prompt_ids, token_to_id, id_to_token, max_new_tokens, min_new_tokens, temperature):
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
    return decode_ids(generated, id_to_token), len(generated)


# --- muat model sekali saat proses start (bukan per-request) ---
_cfg = peek_checkpoint_config(CHECKPOINT_PATH)
MAX_CONTEXT_LEN = _cfg['max_context_len']
_model = RategoanTransformer(_cfg['vocab_size'], _cfg['d_model'], _cfg['n_layers'], _cfg['n_heads'], _cfg['d_ff'], _cfg['max_context_len']).to(DEVICE)
_param_count = _model.param_count()
_merges, _vocab_entries, _training_steps = load_checkpoint(CHECKPOINT_PATH, _model)
_merge_rank = {tuple(m): i for i, m in enumerate(_merges)}
_token_to_id = {t: i for t, i in _vocab_entries}
_id_to_token = {i: t for t, i in _vocab_entries}
print('Checkpoint dimuat:', CHECKPOINT_PATH, '| preset=', _cfg['name'], '| parameterCount=', _param_count, '| trainingSteps=', _training_steps, '| device=', DEVICE, flush=True)

app = FastAPI(title='Rategoan Neural Inference Server')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)


class GenerateRequest(BaseModel):
    prompt: str
    maxNewTokens: int = 60
    minNewTokens: int = 8
    temperature: float = 0.9


@app.get('/health')
def health():
    return {
        'status': 'ok',
        'checkpointLoaded': True,
        'preset': _cfg['name'],
        'parameterCount': _param_count,
        'trainingSteps': _training_steps,
        'device': str(DEVICE),
    }


@app.post('/generate')
def generate(req: GenerateRequest):
    t0 = time.time()
    prompt_ids = encode_prompt(req.prompt, _token_to_id, _merge_rank)
    text, n_tokens = generate_text(
        _model, prompt_ids, _token_to_id, _id_to_token,
        max_new_tokens=max(1, min(200, req.maxNewTokens)),
        min_new_tokens=max(0, req.minNewTokens),
        temperature=max(0.05, req.temperature),
    )
    return {'text': text, 'tokensGenerated': n_tokens, 'seconds': round(time.time() - t0, 2)}


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)
