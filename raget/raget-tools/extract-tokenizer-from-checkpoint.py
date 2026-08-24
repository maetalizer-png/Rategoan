#!/usr/bin/env python3
"""MEGA-BATCH RAGETAN ROUND 5 - FASE 2: ekstrak ulang file tokenizer.json
(format {merges, vocab} yang dipakai tokenize-chunk-corpus.py) LANGSUNG dari
metadata checkpoint .safetensors yang sudah ada - dipakai notebook Colab
supaya token ID hasil tokenisasi ulang korpus DIJAMIN identik dengan token
ID yang dipakai waktu checkpoint ini dilatih (bpe-tokenizer.json sendiri
sengaja TIDAK dikomit ke git karena besar - lihat wikipedia-korpus-manifest
.json - tapi merges+vocabEntries-nya disimpan ULANG di dalam metadata
checkpoint, jadi tidak pernah hilang).

vocabEntries di checkpoint = list(token_to_id.items()) - urutan insersinya
PERSIS urutan 'vocab' asli (sorted(vocab_set) dari train-bpe-python.py)
karena dict Python mempertahankan urutan insersi. Jadi cukup buang 4 token
spesial dari vocabEntries untuk dapat kembali list 'vocab' yang identik.

Pakai: python3 raget-tools/extract-tokenizer-from-checkpoint.py <checkpoint.safetensors> <output-tokenizer.json>
"""
import json
import struct
import sys

CHECKPOINT = sys.argv[1]
OUTPUT = sys.argv[2]
SPECIAL = {'<pad>', '<unk>', '<bos>', '<eos>'}

with open(CHECKPOINT, 'rb') as f:
    raw = f.read(20_000_000)  # header ada di awal file, jauh di bawah ini
header_len = struct.unpack('<Q', raw[:8])[0]
header_bytes = raw[8:8 + header_len]
header = json.loads(header_bytes.decode('utf-8').rstrip())
rategoan_meta = json.loads(header['__metadata__']['rategoan'])
merges = rategoan_meta['merges']
vocab_entries = rategoan_meta['vocabEntries']
vocab_pieces = [t for t, i in vocab_entries if t not in SPECIAL]

with open(OUTPUT, 'w') as f:
    json.dump({'merges': merges, 'vocab': vocab_pieces}, f)

print('Tokenizer diekstrak dari checkpoint:', len(merges), 'merges,', len(vocab_pieces), 'vocab piece (di luar token spesial).')
print('Ditulis:', OUTPUT)
