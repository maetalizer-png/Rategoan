#!/usr/bin/env python3
"""MEGA-BATCH RAGETAN ROUND 8 - FASE 3: pipeline korpus BERULANG/IDEMPOTEN -
skrip ini memindai SEMUA manifest jilid (raget-data/jsonl/external/korpus-
jilid*-manifest.json, pola glob) dan menjumlahkan totalGabungan-nya jadi
SATU angka total resmi - dipakai tiap kali jilid baru (3, 4, dst) selesai
diproses lewat pipeline yang SAMA (parse-korpus-jilid2.py + clean-dedupe-
korpus-jilid2.py + tokenize-chunk-corpus.py + rechunk-corpus-window.py),
tanpa perlu tulis ulang kode - cukup re-run dengan tag Release baru dan
nama file manifest baru (korpus-jilid3-manifest.json dst, format field
SAMA seperti korpus-jilid2-manifest.json).

Pakai: python3 raget-tools/merge-korpus-manifest.py
(dijalankan dari root repo - otomatis scan raget-data/jsonl/external/)
"""
import glob
import json
import os
import time

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
EXTERNAL_DIR = os.path.join(ROOT, 'raget', 'raget-data', 'jsonl', 'external')


def main():
    pattern = os.path.join(EXTERNAL_DIR, 'korpus-jilid*-manifest.json')
    files = sorted(glob.glob(pattern))
    if not files:
        print('Tidak ada manifest jilid ditemukan (pola: korpus-jilid*-manifest.json).')
        return

    jilid1_tokens = 236392520  # angka tetap dari Round 3 - jilid 1 tidak punya file manifest berpola korpus-jilid*-manifest.json (namanya wikipedia-korpus-manifest.json, sudah ada sejak awal)
    entries = [{'jilid': 'jilid1-wikipedia', 'file': 'wikipedia-korpus-manifest.json', 'tokenWindow126': jilid1_tokens}]
    total = jilid1_tokens

    for path in files:
        with open(path) as f:
            m = json.load(f)
        gab = m.get('gabunganJilid1DanJilid2', {})
        jilid2_tokens = gab.get('jilid2TokenWindow126')
        if jilid2_tokens is None:
            # manifest jilid berikutnya (jilid3 dst) sebaiknya punya field serupa -
            # fallback ke fase4 kalau field gabungan belum ada di manifest itu
            jilid2_tokens = m.get('fase4_tokenize', {}).get('totalTokenWindow126SetelahRechunk')
        if jilid2_tokens is None:
            print('PERINGATAN: {} tidak punya field token yang dikenali - dilewati.'.format(path))
            continue
        name = os.path.basename(path).replace('-manifest.json', '')
        entries.append({'jilid': name, 'file': os.path.basename(path), 'tokenWindow126': jilid2_tokens})
        total += jilid2_tokens

    target = 1_000_000_000
    result = {
        'generatedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'entries': entries,
        'totalTokenGabungan': total,
        'targetGerbang': target,
        'targetTercapai': total >= target,
        'kekuranganToken': max(0, target - total),
    }
    out_path = os.path.join(EXTERNAL_DIR, 'korpus-manifest-total.json')
    with open(out_path, 'w') as f:
        json.dump(result, f, indent=2)

    print('Manifest jilid ditemukan:', len(entries))
    for e in entries:
        print(' -', e['jilid'], ':', '{:,}'.format(e['tokenWindow126']), 'token')
    print('TOTAL GABUNGAN:', '{:,}'.format(total), 'token')
    print('Target gerbang (1 miliar) tercapai:', result['targetTercapai'])
    print('Ditulis:', out_path)


if __name__ == '__main__':
    main()
