#!/usr/bin/env python3
"""MEGA-BATCH RAGETAN-50M ROUND 3 - FASE 1: retrain BPE tokenizer (vocab
30368, sesuai arsitektur preset 'massive50m') di atas korpus Wikipedia ID
yang baru diekstrak - korpus lama (raget_own_corpus.jsonl, ~95rb token)
terlalu kecil untuk BPE pernah mencapai target vocab (mentok di 10488
token/10359 merge di ronde-ronde sebelumnya, lihat tokenizer-dump.json).

Pretokenisasi PERSIS SAMA seperti llm-tokenizer.js#preTokenize() (regex
kata Unicode + tanda baca individual) dan END_OF_WORD='</w>' supaya
merges yang dihasilkan tetap kompatibel dipakai runtime inference JS
murni di browser (tidak mengubah format tokenizer, cuma isi merges/vocab).

Algoritma BPE efisien (bukan O(numMerges x totalWord) seperti trainBPE()
JS naive yang scan ulang semua pasangan tiap step - terlalu lambat untuk
korpus jutaan kata): pakai inverted index pair->word_keys supaya tiap
merge hanya meng-update entri kata yang benar-benar terpengaruh.

BPE dilatih di SAMPEL korpus (representatif, bukan ratusan MB penuh -
praktik standar, BPE konvergen baik dari sampel jauh lebih kecil dari
seluruh korpus) - merges yang dihasilkan lalu dipakai tokenize SELURUH
korpus retained (lantai 100 juta token diukur dari HASIL tokenisasi
penuh, bukan dari sampel BPE).

Pakai: python3 raget-tools/train-bpe-python.py <corpus.jsonl> <output_tokenizer.json> <vocab_size> <sample_words>
"""
import json
import re
import sys
import time
from collections import Counter, defaultdict

CORPUS_FILE = sys.argv[1]
OUTPUT_FILE = sys.argv[2]
VOCAB_SIZE = int(sys.argv[3]) if len(sys.argv) > 3 else 30368
SAMPLE_WORDS = int(sys.argv[4]) if len(sys.argv) > 4 else 4_000_000

END_OF_WORD = '</w>'
PRETOK_RE = re.compile(r'[^\W\d_]+|\d+|[^\s\w]', re.UNICODE)
# Catatan: Python `\w` termasuk underscore & digit, regex JS asli
# [\p{L}\p{N}_]+|[^\s\p{L}\p{N}_] menggabung huruf+angka+underscore jadi
# satu kelas kata - disini dipecah tapi digabung ulang di bawah supaya
# hasil pretokenisasi (bukan cuma pola regex-nya) tetap identik.
PRETOK_RE_EXACT = re.compile(r'[^\s]+', re.UNICODE)


def pretokenize(text):
    # replikasi persis: [\p{L}\p{N}_]+ (huruf/angka/underscore beruntun)
    # ATAU satu karakter non-spasi non-huruf/angka/underscore
    out = []
    i = 0
    n = len(text)
    is_word_char = lambda c: c.isalnum() or c == '_'
    while i < n:
        c = text[i]
        if c.isspace():
            i += 1
            continue
        if is_word_char(c):
            j = i
            while j < n and is_word_char(text[j]):
                j += 1
            out.append(text[i:j])
            i = j
        else:
            out.append(c)
            i += 1
    return out


def word_to_symbols(word):
    return list(word) + [END_OF_WORD]


def main():
    t0 = time.time()
    print('Membaca korpus + pretokenisasi sampel ({} kata target)...'.format(SAMPLE_WORDS))
    word_freq = Counter()
    total_words_seen = 0
    with open(CORPUS_FILE, encoding='utf-8') as f:
        for line in f:
            if total_words_seen >= SAMPLE_WORDS:
                break
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                continue
            text = rec.get('text', '')
            words = pretokenize(text)
            word_freq.update(words)
            total_words_seen += len(words)
    print('Sampel: {} kata (token pretokenisasi), {} kata unik. ({}s)'.format(total_words_seen, len(word_freq), round(time.time() - t0, 1)))

    # representasi kata sebagai tuple simbol
    word_symbols = {}
    vocab_set = set()
    for w in word_freq:
        syms = tuple(word_to_symbols(w))
        word_symbols[w] = syms
        vocab_set.update(syms)

    num_merges = max(1, VOCAB_SIZE - 4 - 256)
    print('Target merges:', num_merges)

    def get_pair_counts_and_index(word_symbols, word_freq):
        pair_counts = Counter()
        pair_to_words = defaultdict(set)
        for w, syms in word_symbols.items():
            freq = word_freq[w]
            for i in range(len(syms) - 1):
                pair = (syms[i], syms[i + 1])
                pair_counts[pair] += freq
                pair_to_words[pair].add(w)
        return pair_counts, pair_to_words

    print('Menghitung pasangan awal...')
    pair_counts, pair_to_words = get_pair_counts_and_index(word_symbols, word_freq)
    print('Pasangan unik awal:', len(pair_counts), '({}s)'.format(round(time.time() - t0, 1)))

    merges = []
    t_merge_start = time.time()
    for step in range(num_merges):
        if not pair_counts:
            break
        best_pair, best_count = pair_counts.most_common(1)[0]
        if best_count < 2:
            break
        left, right = best_pair
        merged = left + right
        merges.append((left, right))
        vocab_set.add(merged)

        affected_words = list(pair_to_words.get(best_pair, ()))
        for w in affected_words:
            syms = word_symbols[w]
            freq = word_freq[w]
            # kurangi kontribusi pasangan lama kata ini
            for i in range(len(syms) - 1):
                p = (syms[i], syms[i + 1])
                pair_counts[p] -= freq
                if pair_counts[p] <= 0:
                    del pair_counts[p]
                    pair_to_words[p].discard(w)
            # terapkan merge pada simbol kata ini
            new_syms = []
            i = 0
            while i < len(syms):
                if i < len(syms) - 1 and syms[i] == left and syms[i + 1] == right:
                    new_syms.append(merged)
                    i += 2
                else:
                    new_syms.append(syms[i])
                    i += 1
            word_symbols[w] = tuple(new_syms)
            # tambah kontribusi pasangan baru kata ini
            for i in range(len(new_syms) - 1):
                p = (new_syms[i], new_syms[i + 1])
                pair_counts[p] += freq
                pair_to_words[p].add(w)
        del pair_to_words[best_pair]

        if (step + 1) % 2000 == 0:
            print('  merge {}/{} ({}s, pasangan aktif={})'.format(step + 1, num_merges, round(time.time() - t_merge_start, 1), len(pair_counts)))

    print('BPE training selesai: {} merge dalam {}s.'.format(len(merges), round(time.time() - t_merge_start, 1)))
    print('Ukuran vocab akhir:', len(vocab_set))

    with open(OUTPUT_FILE, 'w') as f:
        json.dump({
            'merges': [[a, b] for a, b in merges],
            'vocab': sorted(vocab_set),
            'sampleWordsUsed': total_words_seen,
            'uniqueWordsInSample': len(word_freq),
        }, f)
    print('Tokenizer ditulis:', OUTPUT_FILE)
    print('Total waktu:', round(time.time() - t0, 1), 's')


if __name__ == '__main__':
    main()
