#!/usr/bin/env python3
"""Deskripsi arsitektur tier 1.0B / 1.5B / 2.0B.

Skrip ini tidak menulis berkas bobot ratusan megabita dan tidak
mengunggah tensor acak sebagai otak terlatih. Checkpoint Safetensors
hanya boleh terbit dari state dict yang benar-benar dilatih, lalu
dikirim lewat publish-checkpoint-huggingface.py.
"""
import json
import sys

TIERS = {
    '1.0B': {'d_model': 1536, 'n_layers': 24, 'n_heads': 12, 'n_kv_heads': 3, 'd_ff': 6144},
    '1.5B': {'d_model': 2048, 'n_layers': 28, 'n_heads': 16, 'n_kv_heads': 4, 'd_ff': 5632},
    '2.0B': {'d_model': 2560, 'n_layers': 32, 'n_heads': 20, 'n_kv_heads': 5, 'd_ff': 6912},
}

NAMES = {
    '1.0B': 'raget-neural-1.0b.safetensors',
    '1.5B': 'raget-neural-1.5b.safetensors',
    '2.0B': 'raget-neural-2.0b.safetensors',
}


def main():
    print(json.dumps({'tiers': TIERS, 'names': NAMES, 'weights_written': False}, indent=2))
    print('Tidak ada bobot yang ditulis. Latih dulu, lalu publish-checkpoint-huggingface.py.', file=sys.stderr)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
