#!/usr/bin/env python3
"""MEGA-BATCH RAGETAN ROUND 9 - FASE 1: tanam "akta kelahiran" (metadata
identitas permanen) ke checkpoint .safetensors - key BARU __metadata__.akta
(terpisah dari __metadata__.rategoan yang sudah ada, supaya tidak
mengganggu format yang sudah dipakai runtime JS) berisi JSON identitas
model: pencipta, kru, kurir data, tanggal lahir, ukuran vocab, ukuran
korpus TERUKUR (dari manifest, BUKAN perkiraan), riwayat garis keturunan,
lisensi, dan pesan.

JANGAN SENTUH BOBOT: skrip ini HANYA menulis ulang header (metadata) -
seluruh byte tensor data disalin PERSIS tanpa diubah sedikit pun
(diverifikasi lewat perbandingan byte-for-byte sebelum/sesudah).

Pakai: python3 raget-tools/tanam-akta-checkpoint.py <checkpoint.safetensors> [preset_name]
"""
import json
import struct
import sys
import time

CHECKPOINT = sys.argv[1]
PRESET_NAME = sys.argv[2] if len(sys.argv) > 2 else None

ROOT = __import__('os').path.dirname(__import__('os').path.dirname(__import__('os').path.dirname(__import__('os').path.abspath(__file__))))
MANIFEST_TOTAL = __import__('os').path.join(ROOT, 'raget', 'raget-data', 'jsonl', 'external', 'korpus-manifest-total.json')

RIWAYAT_PER_PRESET = {
    'tiny': 'tiny (lahir pertama - preset kecil pembuktian arsitektur)',
    'massive50m': 'tiny -> 50m -> massive50m (garis keturunan saat ini)',
    'massive100m': 'tiny -> 50m -> massive50m -> massive100m (badan kedua, vocab sama)',
    'massive200m': 'tiny -> 50m -> massive50m -> massive100m -> massive200m (badan ketiga, vocab sama)',
}


def align4(n):
    return (n + 3) & ~3


def main():
    with open(CHECKPOINT, 'rb') as f:
        raw = f.read()
    header_len = struct.unpack('<Q', raw[:8])[0]
    header_bytes_old = raw[8:8 + header_len]
    header = json.loads(header_bytes_old.decode('utf-8').rstrip())
    tensor_data = raw[8 + header_len:]

    rategoan_meta = json.loads(header['__metadata__']['rategoan'])
    preset_name = PRESET_NAME or rategoan_meta.get('config', {}).get('model', {}).get('name', 'unknown')

    try:
        with open(MANIFEST_TOTAL) as f:
            manifest_total = json.load(f)
        makanan = '{:,} token (korpus gabungan TERUKUR - {})'.format(
            manifest_total['totalTokenGabungan'],
            ', '.join(e['jilid'] for e in manifest_total['entries'])
        ).replace(',', '.')
    except Exception as e:
        makanan = 'manifest korpus tidak ditemukan saat akta ditanam ({})'.format(e)

    akta = {
        'model': 'Rategoan (RAGET)',
        'pencipta': 'Rahmad Raharjo',
        'kru_dan_alat': 'Claude (si raksasa karyawan semut) + Colab T4 (kompor pinjaman Google)',
        'kurir_data': 'HP Android Rahmad Raharjo (pembawa karung data)',
        'lahir': '2026',
        'jiwa': 'Kamus BPE 30.368 kata',
        'makanan': makanan,
        'riwayat': RIWAYAT_PER_PRESET.get(preset_name, 'tiny -> 50m -> massive50m -> ... -> {} (bersambung)'.format(preset_name)),
        'lisensi': 'Hak cipta Rahmad Raharjo. Hormati riwayatnya.',
        'pesan': 'Dari semut, dirakit raksasa, untuk Indonesia. \U0001F41C️\U0001F1EE\U0001F1E9',
        'checkpointIni': preset_name,
        'ditanamPada': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
    }

    header['__metadata__']['akta'] = json.dumps(akta, ensure_ascii=False)
    raw_header_bytes = json.dumps(header).encode('utf-8')
    prefix_length = align4(8 + len(raw_header_bytes))
    header_bytes = bytearray(prefix_length - 8)
    header_bytes[:len(raw_header_bytes)] = raw_header_bytes
    for i in range(len(raw_header_bytes), len(header_bytes)):
        header_bytes[i] = 0x20

    tmp_path = CHECKPOINT + '.tmp'
    with open(tmp_path, 'wb') as f:
        f.write(struct.pack('<Q', len(header_bytes)))
        f.write(bytes(header_bytes))
        f.write(tensor_data)
    import os
    os.replace(tmp_path, CHECKPOINT)

    # --- verifikasi read-back + bobot tidak berubah ---
    with open(CHECKPOINT, 'rb') as f:
        raw2 = f.read()
    header_len2 = struct.unpack('<Q', raw2[:8])[0]
    header2 = json.loads(raw2[8:8 + header_len2].decode('utf-8').rstrip())
    tensor_data2 = raw2[8 + header_len2:]
    akta_readback = json.loads(header2['__metadata__']['akta'])

    weights_identical = tensor_data2 == tensor_data
    print('=== AKTA DITANAM:', CHECKPOINT, '===')
    print(json.dumps(akta_readback, indent=2, ensure_ascii=False))
    print('\nRead-back berhasil:', akta_readback == akta)
    print('Bobot (tensor bytes) TIDAK berubah:', weights_identical, '(', len(tensor_data), 'bytes dibandingkan byte-for-byte)')
    if not weights_identical:
        raise SystemExit('FATAL: bobot berubah - seharusnya tidak mungkin, batalkan!')


if __name__ == '__main__':
    main()
