#!/usr/bin/env python3
"""MEGA-BATCH RAGETAN ROUND 7 - FASE 3: bersihkan + dedupe (EXACT + NEAR,
bukan cuma exact seperti limitasi jujur jilid 1) korpus jilid 2 mentah
dari FASE 2.

Pipeline per baris:
1. Buang HTML/entity sisa (regex sederhana - konten sumber sudah relatif
   bersih dari FASE 2, ini jaring pengaman)
2. Filter URL Wikipedia (anti-duplikat dengan jilid 1 yang sumbernya
   Wikipedia dump - kalau parquet CommonCrawl kebetulan memuat cermin
   Wikipedia, dibuang di sini)
3. Filter panjang minimum (<30 kata dibuang - artikel stub/rusak)
4. Filter bahasa Indonesia ringan: rasio stopword Indonesia umum di
   1000 karakter pertama harus >= ambang - jaring pengaman kedua untuk
   newspapers (yang TIDAK punya kolom lang dari sumbernya, beda dengan
   parquet yang sudah difilter ind_Latn di FASE 2)
5. Dedupe EXACT: hash teks ternormalisasi (lower+whitespace collapse)
6. Dedupe NEAR: MinHash 8-fungsi atas shingle 5-kata dari teks
   ternormalisasi - dokumen dianggap near-duplicate kalau nilai minhash-nya
   cocok di >=3 dari 8 "band" dengan dokumen yang SUDAH disimpan
   (pendekatan LSH band=1-row, standar untuk deteksi duplikat cepat di
   korpus besar - BUKAN klaim kemiripan semantik penuh, murni tekstual)

Pakai: python3 raget-tools/clean-dedupe-korpus-jilid2.py <in_dir> <out.jsonl> <report.json>
"""
import hashlib
import json
import re
import sys
import time

IN_DIR = sys.argv[1]
OUT_FILE = sys.argv[2]
REPORT_FILE = sys.argv[3]

SOURCE_FILES = ['newspapers-raw.jsonl', 'train-00000-of-00140-raw.jsonl', 'train-00001-of-00140-raw.jsonl', 'train-00002-of-00140-raw.jsonl']

RE_HTML_TAG = re.compile(r'<[^>]+>')
RE_HTML_ENTITY = re.compile(r'&[a-zA-Z]+;|&#\d+;')
RE_MULTI_SPACE = re.compile(r'[ \t]{2,}')
RE_MULTI_NL = re.compile(r'\n{2,}')
RE_WORD = re.compile(r'\w+', re.UNICODE)

STOPWORDS_ID = set('yang dan di ke dari untuk dengan pada tidak ini itu dalam akan atau juga oleh sudah bisa ada karena saat setelah para lebih adalah tersebut mereka telah kata namun jika kami saya kita seperti dua tahun'.split())

NUM_MINHASH = 8
MIN_BAND_MATCHES = 3


def clean_text(t):
    t = RE_HTML_TAG.sub(' ', t)
    t = RE_HTML_ENTITY.sub(' ', t)
    t = RE_MULTI_SPACE.sub(' ', t)
    t = RE_MULTI_NL.sub('\n', t)
    return t.strip()


def is_indonesian_enough(text):
    sample = text[:1000].lower()
    words = RE_WORD.findall(sample)
    if len(words) < 10:
        return False
    hits = sum(1 for w in words if w in STOPWORDS_ID)
    return (hits / len(words)) >= 0.08


def normalize_for_hash(text):
    t = text.lower()
    t = re.sub(r'[^\w\s]', ' ', t, flags=re.UNICODE)
    t = re.sub(r'\s+', ' ', t).strip()
    return t


def shingles(norm_text, k=5):
    words = norm_text.split(' ')
    if len(words) < k:
        return {norm_text}
    return {' '.join(words[i:i + k]) for i in range(len(words) - k + 1)}


def minhash_signature(shingle_set):
    sig = []
    for seed in range(NUM_MINHASH):
        best = None
        for s in shingle_set:
            h = int(hashlib.md5((str(seed) + '|' + s).encode('utf-8')).hexdigest(), 16)
            if best is None or h < best:
                best = h
        sig.append(best)
    return tuple(sig)


def main():
    t0 = time.time()
    seen_exact = set()
    band_buckets = [dict() for _ in range(NUM_MINHASH)]

    stats = {
        'perSumber': {},
        'totalMasuk': 0,
        'totalTerbuang': {'htmlKosong': 0, 'wikipedia': 0, 'terlaluPendek': 0, 'bukanIndonesia': 0, 'duplikatExact': 0, 'duplikatNear': 0},
        'totalDitulis': 0,
    }

    out = open(OUT_FILE, 'w', encoding='utf-8')
    for src_file in SOURCE_FILES:
        path = IN_DIR + '/' + src_file
        src_name = src_file.replace('-raw.jsonl', '')
        n_in = 0
        n_out = 0
        try:
            fh = open(path, encoding='utf-8')
        except FileNotFoundError:
            continue
        with fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                n_in += 1
                stats['totalMasuk'] += 1
                try:
                    rec = json.loads(line)
                except json.JSONDecodeError:
                    continue
                text = clean_text(rec.get('text', ''))
                if not text:
                    stats['totalTerbuang']['htmlKosong'] += 1
                    continue
                url = rec.get('url', '') or ''
                if 'wikipedia.org' in url:
                    stats['totalTerbuang']['wikipedia'] += 1
                    continue
                word_count = len(RE_WORD.findall(text))
                if word_count < 30:
                    stats['totalTerbuang']['terlaluPendek'] += 1
                    continue
                if not is_indonesian_enough(text):
                    stats['totalTerbuang']['bukanIndonesia'] += 1
                    continue

                norm = normalize_for_hash(text)
                exact_key = hashlib.md5(norm.encode('utf-8')).hexdigest()
                if exact_key in seen_exact:
                    stats['totalTerbuang']['duplikatExact'] += 1
                    continue

                shingle_set = shingles(norm)
                sig = minhash_signature(shingle_set)
                band_matches = 0
                for i in range(NUM_MINHASH):
                    if sig[i] in band_buckets[i]:
                        band_matches += 1
                if band_matches >= MIN_BAND_MATCHES:
                    stats['totalTerbuang']['duplikatNear'] += 1
                    continue

                seen_exact.add(exact_key)
                for i in range(NUM_MINHASH):
                    band_buckets[i].setdefault(sig[i], True)

                out.write(json.dumps({'source': rec.get('source', src_name), 'url': url, 'title': rec.get('title', ''), 'text': text}, ensure_ascii=False) + '\n')
                n_out += 1
                stats['totalDitulis'] += 1

        stats['perSumber'][src_name] = {'barisMasuk': n_in, 'barisLolos': n_out}
        print('{}: {} masuk -> {} lolos ({}s)'.format(src_name, n_in, n_out, round(time.time() - t0)), flush=True)

    out.close()
    stats['elapsedSec'] = round(time.time() - t0, 1)
    with open(REPORT_FILE, 'w') as f:
        json.dump(stats, f, indent=2)
    print('\nSELESAI. Masuk:', stats['totalMasuk'], 'Ditulis:', stats['totalDitulis'], 'Terbuang:', stats['totalTerbuang'])
    print('Laporan:', REPORT_FILE)


if __name__ == '__main__':
    main()
