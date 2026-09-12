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

# Kebijakan Gudang Besar (Round 9, keputusan dirigen): korpus RAW tidak
# disimpan permanen - hanya hasil clean+tokenize yang diarsipkan (ke
# Release, tag korpus-jilid-N-clean). URL sumber asli tiap jilid dicatat
# di sini supaya "kurir" (siapa pun yang menjalankan pipeline) bisa jemput
# ulang data mentahnya kalau perlu regenerasi dari nol.
JILID_SOURCES = {
    'korpus-jilid1-round10': {
        'sumberAsli': 'GitHub Release tag "J1" repo ini (idwiki-latest-pages-articles.xml.bz2, sumber asli dumps.wikimedia.org, diunggah manual oleh kurir data).',
        'catatan': 'Round 10: jilid 1 diregenerasi dari nol (jsonl bersih Round 3 sudah hilang saat pembersihan disk sebelumnya) - SELURUH dump diproses (bukan berhenti di lantai kata), hasil jauh lebih besar dari Round 3.',
        'statusArsipBersih': 'BELUM diarsipkan ke tag korpus-jilid-1-clean - sesi sandbox tidak diizinkan upload Release asset. Pakai raget-tools/publish-checkpoint-release.py dari luar sandbox (Colab/lokal).',
    },
    'korpus-jilid2': {
        'sumberAsli': 'GitHub Release tag "Sft" repo ini (newspapers-json.tgz + train-00000/00001/00002-of-00140.parquet, sumber asli HPLT/CommonCrawl-derived, diunggah manual oleh kurir data).',
        'catatan': 'Raw asset masih ada di Release tag Sft. Bisa diproses ulang lewat parse-korpus-jilid2.py + clean-dedupe-korpus-jilid2.py.',
        'statusArsipBersih': 'SUDAH diarsipkan ke tag korpus-jilid-2-clean (dipublikasikan dirigen dari luar sandbox).',
    },
    'korpus-jilid3': {
        'sumberAsli': 'GitHub Release tag "U" repo ini (idwikibooks-latest-pages-articles.xml.bz2).',
        'catatan': 'Diproses lewat extract-clean-wikipedia.py (format sama dengan Wikipedia).',
        'statusArsipBersih': 'BELUM diarsipkan ke tag korpus-jilid-3-clean - perlu publish dari luar sandbox.',
    },
    'korpus-jilid4': {
        'sumberAsli': 'GitHub Release tag "J34" repo ini (idwikivoyage + idwikisource + idwikiquote, 3 file XML).',
        'catatan': 'Digabung dari 3 sumber (extract-clean-wikipedia.py per sumber + tag field source per baris).',
        'statusArsipBersih': 'BELUM diarsipkan ke tag korpus-jilid-4-clean - perlu publish dari luar sandbox.',
    },
    'korpus-jilid5': {
        'sumberAsli': 'GitHub Release tag "Hhh" repo ini (idwiktionary-latest-pages-articles.xml.bz2).',
        'catatan': 'Diproses lewat extract-clean-wiktionary.py (struktur entri kamus berbeda dari artikel prosa - hanya bagian {{bahasa|id}} + definisi bernomor yang diambil).',
        'statusArsipBersih': 'BELUM diarsipkan ke tag korpus-jilid-5-clean - perlu publish dari luar sandbox.',
    },
}


def main():
    pattern = os.path.join(EXTERNAL_DIR, 'korpus-jilid*-manifest.json')
    files = sorted(glob.glob(pattern))
    if not files:
        print('Tidak ada manifest jilid ditemukan (pola: korpus-jilid*-manifest.json).')
        return

    entries = []
    total = 0

    for path in files:
        with open(path) as f:
            m = json.load(f)
        gab = m.get('gabunganJilid1DanJilid2', {})
        jilid_tokens = gab.get('jilid2TokenWindow126')
        if jilid_tokens is None:
            # Semua manifest jilid (1 dan seterusnya, sejak Round 10) pakai field
            # fase4_tokenize.totalTokenWindow126SetelahRechunk secara seragam -
            # gabunganJilid1DanJilid2 di atas cuma fallback untuk manifest jilid2 lama.
            jilid_tokens = m.get('fase4_tokenize', {}).get('totalTokenWindow126SetelahRechunk')
        if jilid_tokens is None:
            print('PERINGATAN: {} tidak punya field token yang dikenali - dilewati.'.format(path))
            continue
        name = os.path.basename(path).replace('-manifest.json', '')
        entries.append({'jilid': name, 'file': os.path.basename(path), 'tokenWindow126': jilid_tokens})
        total += jilid_tokens

    target = 1_000_000_000
    result = {
        'generatedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'entries': entries,
        'totalTokenGabungan': total,
        'targetGerbang': target,
        'targetTercapai': total >= target,
        'kekuranganToken': max(0, target - total),
        'kebijakanGudangBesar': {
            'rakKorpus': 'Barang bersih - raw tidak disimpan permanen di git/sandbox, hanya clean+tokenize yang diarsipkan (Release, tag korpus-jilid-N-clean).',
            'rakOtak': 'Checkpoint >100MB (batas keras GitHub) keluar dari git, wajib Release asset (bukan Git LFS). Lihat raget-tools/CHECKPOINT-POLICY.md.',
            'sumberPerJilid': {k: JILID_SOURCES[k] for k in JILID_SOURCES if k in {e['jilid'] for e in entries}},
        },
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
