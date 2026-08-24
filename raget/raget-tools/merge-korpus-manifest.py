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
    'jilid1-wikipedia': {
        'sumberAsli': 'https://dumps.wikimedia.org/idwiki/latest/idwiki-latest-pages-articles.xml.bz2',
        'catatan': 'Dump Wikipedia bahasa Indonesia terbaru. Diproses lewat raget-tools/extract-clean-wikipedia.py. dumps.wikimedia.org DIBLOKIR oleh kebijakan jaringan sandbox Claude Code Remote - unduh ulang harus dilakukan di luar sandbox (mesin lokal/Colab), lalu upload dump sebagai Release asset sebelum sandbox bisa memprosesnya.',
        'statusArsipBersih': 'BELUM diarsipkan ke Release (jsonl bersih sudah tidak ada di disk, terpakai habis jadi idwiki-chunks-128.txt lalu dibuang saat pembersihan disk Round 6-7; checkpoint massive50m/100m/200m tetap menyimpan hasil pembelajarannya).',
    },
    'korpus-jilid2': {
        'sumberAsli': 'GitHub Release tag "Corpus" repo ini (newspapers-json.tgz + train-00000/00001/00002-of-00140.parquet, sumber asli HPLT/CommonCrawl-derived, diunggah manual oleh kurir data).',
        'catatan': 'Raw asset masih ada di Release tag Corpus per 2026-08-24. Bisa diproses ulang lewat parse-korpus-jilid2.py + clean-dedupe-korpus-jilid2.py.',
        'statusArsipBersih': 'BELUM diarsipkan ke tag korpus-jilid-2-clean - sesi sandbox tidak diizinkan membuat/upload Release asset ("Creating, editing, or deleting releases is not permitted for this session type"). Pakai raget-tools/publish-checkpoint-release.py dari luar sandbox (Colab/lokal) untuk mengarsipkannya.',
    },
}


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
