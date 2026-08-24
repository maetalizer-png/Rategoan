#!/usr/bin/env python3
"""MEGA-BATCH RAGETAN ROUND 7 - FASE 2: parse 4 asset korpus jilid 2 jadi
JSONL mentah (belum dibersihkan - itu FASE 3), satu file per sumber:
- newspapers-json.tgz -> baca tiap anggota tar .json (streaming, TIDAK
  pernah extract ke disk dulu - 499.164 file kecil), field
  {url,date,title,content} -> {source,url,title,text}
- 3 shard parquet (train-00000/1/2-of-00140) -> hanya kolom u/text/lang
  dibaca (bukan seluruh 17 kolom - hemat memori), field ind_Latn saja
  (semua baris di sampel FASE 1 sudah ind_Latn, tapi tetap difilter di
  sini untuk jujur - bukan diasumsikan berlaku 100% di seluruh 255rb baris)

Pakai: python3 raget-tools/parse-korpus-jilid2.py <tgz> <parquet1> <parquet2> <parquet3> <out_dir>
"""
import json
import sys
import tarfile
import time

import pyarrow.parquet as pq

TGZ = sys.argv[1]
PARQUETS = sys.argv[2:-1]
OUT_DIR = sys.argv[-1]

RE_JUNK_PREFIX = ('._',)


def parse_newspapers():
    t0 = time.time()
    n_members = 0
    n_json_candidates = 0
    n_parsed = 0
    n_errors = 0
    out_path = OUT_DIR + '/newspapers-raw.jsonl'
    with tarfile.open(TGZ, mode='r:gz') as tar, open(out_path, 'w', encoding='utf-8') as out:
        for member in tar:
            n_members += 1
            if not member.isfile() or not member.name.endswith('.json'):
                continue
            base = member.name.rsplit('/', 1)[-1]
            if base.startswith(RE_JUNK_PREFIX):
                continue
            n_json_candidates += 1
            try:
                f = tar.extractfile(member)
                if f is None:
                    n_errors += 1
                    continue
                data = json.loads(f.read().decode('utf-8', errors='replace'))
                text = (data.get('content') or '').strip()
                if not text:
                    continue
                out.write(json.dumps({
                    'source': 'newspapers',
                    'url': data.get('url', ''),
                    'title': data.get('title', ''),
                    'date': data.get('date', ''),
                    'text': text,
                }, ensure_ascii=False) + '\n')
                n_parsed += 1
            except Exception:
                n_errors += 1
            if n_json_candidates % 50000 == 0:
                print('  newspapers: {} anggota tar diperiksa, {} kandidat json, {} berhasil di-parse ({}s)'.format(
                    n_members, n_json_candidates, n_parsed, round(time.time() - t0)), flush=True)
    elapsed = round(time.time() - t0, 1)
    print('newspapers SELESAI: {} anggota tar total, {} kandidat .json (bukan ._), {} berhasil di-parse, {} error. {}s'.format(
        n_members, n_json_candidates, n_parsed, n_errors, elapsed))
    return {'totalTarMembers': n_members, 'jsonCandidates': n_json_candidates, 'parsed': n_parsed, 'errors': n_errors, 'elapsedSec': elapsed}


def parse_parquet_shard(path, shard_name):
    t0 = time.time()
    n_rows = 0
    n_ind = 0
    n_written = 0
    out_path = OUT_DIR + '/' + shard_name + '-raw.jsonl'
    pf = pq.ParquetFile(path)
    with open(out_path, 'w', encoding='utf-8') as out:
        for batch in pf.iter_batches(batch_size=5000, columns=['u', 'text', 'lang']):
            d = batch.to_pydict()
            for i in range(len(d['text'])):
                n_rows += 1
                langs = d['lang'][i]
                is_ind = bool(langs) and langs[0] == 'ind_Latn'
                if is_ind:
                    n_ind += 1
                text = (d['text'][i] or '').strip()
                if not is_ind or not text:
                    continue
                out.write(json.dumps({
                    'source': shard_name,
                    'url': d['u'][i] or '',
                    'title': '',
                    'date': '',
                    'text': text,
                }, ensure_ascii=False) + '\n')
                n_written += 1
    elapsed = round(time.time() - t0, 1)
    print('{} SELESAI: {} baris total, {} ind_Latn, {} ditulis. {}s'.format(shard_name, n_rows, n_ind, n_written, elapsed))
    return {'totalRows': n_rows, 'indLatnRows': n_ind, 'written': n_written, 'elapsedSec': elapsed}


def main():
    news_stats = None
    if TGZ and TGZ.lower() not in ('none', 'skip', '-'):
        print('=== Parse ' + TGZ + ' ===', flush=True)
        news_stats = parse_newspapers()
    else:
        print('=== tgz dilewati (TGZ=' + repr(TGZ) + ') - jilid ini murni parquet ===', flush=True)

    parquet_stats = {}
    for p in PARQUETS:
        shard_name = p.rsplit('/', 1)[-1].replace('.parquet', '')
        print('\n=== Parse {} ==='.format(shard_name), flush=True)
        parquet_stats[shard_name] = parse_parquet_shard(p, shard_name)

    summary = {'newspapers': news_stats, 'parquetShards': parquet_stats}
    with open(OUT_DIR + '/fase2-parse-summary.json', 'w') as f:
        json.dump(summary, f, indent=2)
    print('\nRingkasan ditulis:', OUT_DIR + '/fase2-parse-summary.json')


if __name__ == '__main__':
    main()
