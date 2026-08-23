#!/usr/bin/env python3
"""MEGA-BATCH RAGETAN-50M ROUND 3: pecah ulang chunk hasil tokenize-chunk-
corpus.py (window 512, mengikuti maxContextLength) jadi window lebih kecil
(126 token + BOS/EOS) - window 512 di batch praktis (16-32) bikin biaya
attention kuadratik terlalu lambat (diukur langsung: >18s/step, tidak
terpakai untuk training round 3 sebenarnya). Window 128 mengurangi biaya
attention ~16x pada dModel/nHeads/nLayers yang sama.

Pakai: python3 raget-tools/rechunk-corpus-window.py <chunks.txt> <output.txt> <window_baru>
"""
import sys
import time

IN_FILE = sys.argv[1]
OUT_FILE = sys.argv[2]
NEW_WINDOW = int(sys.argv[3])
BOS_ID, EOS_ID = 2, 3

t0 = time.time()
n_in = 0
n_out = 0
with open(IN_FILE) as fin, open(OUT_FILE, 'w') as fout:
    for line in fin:
        line = line.strip()
        if not line:
            continue
        n_in += 1
        ids = line.split(' ')
        # buang BOS di depan dan EOS di belakang (index 0 dan -1)
        content = ids[1:-1]
        for start in range(0, len(content), NEW_WINDOW):
            chunk = content[start:start + NEW_WINDOW]
            if len(chunk) < 8:
                continue
            fout.write(str(BOS_ID) + ' ' + ' '.join(chunk) + ' ' + str(EOS_ID) + '\n')
            n_out += 1
        if n_in % 100000 == 0:
            print('  {} baris asal diproses ({}s), {} chunk baru'.format(n_in, round(time.time()-t0), n_out), flush=True)

print('SELESAI: {} baris asal -> {} chunk baru (window={}). {}s'.format(n_in, n_out, NEW_WINDOW, round(time.time()-t0, 1)))
