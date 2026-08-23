#!/usr/bin/env python3
"""MEGA-BATCH RAGETAN-50M ROUND 3 - FASE 1 (lanjutan): tokenisasi SELURUH
korpus Wikipedia ID yang sudah dibersihkan (idwiki-clean.jsonl) memakai
BPE merges yang baru dilatih (bpe-tokenizer.json), lalu dipotong jadi
window <=maxContextLength (dengan BOS/EOS) supaya siap dipakai batch
training PyTorch tanpa artikel panjang mendominasi padding.

Cache per-kata-unik (bukan per-kemunculan) untuk hasil BPE-apply -
1 artikel bisa memakai kata yang sama ratusan kali, dan lintas 536rb
artikel banyak kata yang sama diulang jutaan kali - cache membuat
tokenisasi seluruh korpus jauh lebih cepat daripada re-apply BPE per
kemunculan kata.

Pakai: python3 raget-tools/tokenize-chunk-corpus.py <clean.jsonl> <tokenizer.json> <output.txt> <max_context_len>
"""
import json
import sys
import time

CORPUS_FILE = sys.argv[1]
TOKENIZER_FILE = sys.argv[2]
OUTPUT_FILE = sys.argv[3]
MAX_LEN = int(sys.argv[4]) if len(sys.argv) > 4 else 512

END_OF_WORD = '</w>'
PAD_ID, UNK_ID, BOS_ID, EOS_ID = 0, 1, 2, 3
VOCAB_SIZE = 30368


def pretokenize(text):
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


def main():
    t0 = time.time()
    print('Memuat tokenizer BPE...')
    with open(TOKENIZER_FILE) as f:
        tok = json.load(f)
    merges = [tuple(m) for m in tok['merges']]
    merge_rank = {m: i for i, m in enumerate(merges)}

    pieces = tok['vocab']
    special = ['<pad>', '<unk>', '<bos>', '<eos>']
    token_to_id = {t: i for i, t in enumerate(special)}
    next_id = 4
    for p in pieces:
        if next_id >= VOCAB_SIZE:
            break
        if p not in token_to_id:
            token_to_id[p] = next_id
            next_id += 1
    print('Vocab efektif (dipakai, sesuai config vocabSize):', len(token_to_id))

    def apply_bpe(word):
        symbols = list(word) + [END_OF_WORD]
        if len(symbols) == 1:
            return symbols
        while True:
            best_rank = None
            best_i = -1
            for i in range(len(symbols) - 1):
                pair = (symbols[i], symbols[i + 1])
                r = merge_rank.get(pair)
                if r is not None and (best_rank is None or r < best_rank):
                    best_rank = r
                    best_i = i
            if best_i == -1:
                break
            symbols = symbols[:best_i] + [symbols[best_i] + symbols[best_i + 1]] + symbols[best_i + 2:]
        return symbols

    word_cache = {}

    def encode_word(word):
        cached = word_cache.get(word)
        if cached is not None:
            return cached
        pieces_ = apply_bpe(word)
        ids = [token_to_id.get(p, UNK_ID) for p in pieces_]
        word_cache[word] = ids
        return ids

    def encode_text(text):
        ids = []
        for w in pretokenize(text):
            ids.extend(encode_word(w))
        return ids

    print('Tokenisasi + chunking seluruh korpus (max_len={})...'.format(MAX_LEN))
    total_articles = 0
    total_chunks = 0
    total_tokens = 0
    window = MAX_LEN - 2  # sisakan ruang BOS+EOS

    out = open(OUTPUT_FILE, 'w')
    with open(CORPUS_FILE, encoding='utf-8') as f:
        for line in f:
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                continue
            total_articles += 1
            ids = encode_text(rec.get('text', ''))
            for start in range(0, len(ids), window):
                chunk = ids[start:start + window]
                if len(chunk) < 8:
                    continue
                full = [BOS_ID] + chunk + [EOS_ID]
                out.write(' '.join(map(str, full)) + '\n')
                total_chunks += 1
                total_tokens += len(full)
            if total_articles % 50000 == 0:
                elapsed = time.time() - t0
                print('  {} artikel diproses ({}s), {} chunk, {} token, cache kata={}'.format(
                    total_articles, round(elapsed), total_chunks, total_tokens, len(word_cache)), flush=True)
    out.close()

    elapsed = time.time() - t0
    print('\n=== SELESAI tokenisasi+chunking ===')
    print('Artikel diproses:', total_articles)
    print('Chunk (sequence training) dihasilkan:', total_chunks)
    print('Total token (termasuk BOS/EOS tiap chunk):', total_tokens)
    print('Kata unik ter-cache:', len(word_cache))
    print('Waktu:', round(elapsed, 1), 's')

    with open(OUTPUT_FILE + '.summary.json', 'w') as f:
        json.dump({
            'articlesProcessed': total_articles,
            'chunksGenerated': total_chunks,
            'totalTokens': total_tokens,
            'uniqueWordsCached': len(word_cache),
            'vocabEffective': len(token_to_id),
            'elapsedSec': round(elapsed, 1),
        }, f, indent=2)


if __name__ == '__main__':
    main()
