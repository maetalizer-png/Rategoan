#!/usr/bin/env python3
"""MEGA-BATCH RAGETAN-50M ROUND 3 - FASE 1: extract + bersihkan dump
Wikipedia bahasa Indonesia (idwiki-latest-pages-articles.xml.bz2, dari
GitHub Release 'Korpus' repo ini - diunduh+diverifikasi SHA256 cocok
persis dengan yang dilaporkan GitHub API sebelum skrip ini dijalankan).

Streaming: bz2 dibaca sebagai stream (tidak pernah menulis XML mentah utuh
ke disk), iterparse per <page>, filter ns=0 (artikel utama) dan bukan
redirect, wikitext dibersihkan dengan pembersih regex (mirip WikiExtractor
disederhanakan): buang template {{...}}, ref, tabel {|...|}, komentar
HTML, kategori/file/link interwiki, ubah [[link|label]] jadi label saja,
markup bold/italic/heading dibuang tapi teks dipertahankan.

Dedupe: exact (hash judul+awal teks) - fuzzy dedupe di skala ratusan ribu
artikel butuh algoritma lebih berat (MinHash dkk), di luar cakupan waktu
ronde ini; ditulis apa adanya sebagai limitasi jujur di laporan akhir jika
tidak dijalankan.

Berhenti otomatis begitu word count melewati STOP_AT_WORDS (margin aman di
atas lantai 100 juta token) supaya tidak perlu memproses seluruh dump
(~600rb+ artikel) kalau target sudah tercapai lebih awal - dilaporkan jujur
berapa fraksi dump yang benar-benar diproses.

Pakai: python3 raget-tools/extract-clean-wikipedia.py <input.xml.bz2> <output.jsonl> [stop_at_words]
"""
import bz2
import hashlib
import json
import re
import sys
import time
import xml.etree.ElementTree as ET

INPUT = sys.argv[1]
OUTPUT = sys.argv[2]
STOP_AT_WORDS = int(sys.argv[3]) if len(sys.argv) > 3 else 130_000_000

RE_COMMENT = re.compile(r'<!--.*?-->', re.DOTALL)
RE_REF = re.compile(r'<ref[^>]*?/>|<ref[^>]*?>.*?</ref>', re.DOTALL | re.IGNORECASE)
RE_TABLE = re.compile(r'\{\|.*?\|\}', re.DOTALL)
RE_TEMPLATE = re.compile(r'\{\{[^{}]*\}\}')
RE_FILE_START = re.compile(r'\[\[(?:File|Berkas|Image|Gambar|Kategori|Category):', re.IGNORECASE)
RE_LINK_LABEL = re.compile(r'\[\[[^\]|]*\|([^\]]*)\]\]')
RE_LINK_PLAIN = re.compile(r'\[\[([^\]]*)\]\]')
RE_EXTLINK_LABEL = re.compile(r'\[https?://\S+\s+([^\]]*)\]')
RE_EXTLINK_PLAIN = re.compile(r'\[https?://\S+\]')
RE_BOLD_ITALIC = re.compile(r"'{2,5}")
RE_HEADING = re.compile(r'^={2,6}\s*(.*?)\s*={2,6}$', re.MULTILINE)
RE_HTML_TAG = re.compile(r'<[^>]+>')
RE_MULTI_NL = re.compile(r'\n{2,}')
RE_MULTI_SPACE = re.compile(r'[ \t]{2,}')

STOPWORD_TITLE_PREFIXES = ('Kategori:', 'Berkas:', 'Templat:', 'Wikipedia:', 'Bantuan:', 'Portal:', 'Modul:', 'MediaWiki:', 'Pengguna:', 'Pembicaraan')


def strip_bracket_links_with_prefix(text, start_re):
    """Hapus [[Prefix:...]] dengan bracket-depth-aware scan - menangani
    nested [[link]] di dalam caption gambar (regex non-recursive gagal di
    kasus ini, sering menyisakan ']]' menggantung)."""
    out = []
    i = 0
    n = len(text)
    while i < n:
        m = start_re.match(text, i)
        if not m:
            out.append(text[i])
            i += 1
            continue
        depth = 1
        j = m.end()
        while j < n and depth > 0:
            if text[j:j + 2] == '[[':
                depth += 1
                j += 2
            elif text[j:j + 2] == ']]':
                depth -= 1
                j += 2
            else:
                j += 1
        i = j
    return ''.join(out)


def clean_wikitext(text):
    if not text:
        return ''
    t = text
    for _ in range(3):
        t = RE_TEMPLATE.sub('', t)
    t = RE_COMMENT.sub('', t)
    t = RE_REF.sub('', t)
    t = RE_TABLE.sub('', t)
    t = strip_bracket_links_with_prefix(t, RE_FILE_START)
    t = RE_LINK_LABEL.sub(r'\1', t)
    t = RE_LINK_PLAIN.sub(r'\1', t)
    t = RE_EXTLINK_LABEL.sub(r'\1', t)
    t = RE_EXTLINK_PLAIN.sub('', t)
    t = RE_HEADING.sub(r'\1', t)
    t = RE_BOLD_ITALIC.sub('', t)
    t = RE_HTML_TAG.sub('', t)
    t = RE_MULTI_SPACE.sub(' ', t)
    t = RE_MULTI_NL.sub('\n\n', t)
    return t.strip()


def is_redirect(text):
    return bool(text) and (text.lstrip().lower().startswith('#redirect') or text.lstrip().lower().startswith('#alih'))


def main():
    t0 = time.time()
    ns_tag = None
    page_count = 0
    kept_count = 0
    skipped_ns = 0
    skipped_redirect = 0
    skipped_short = 0
    skipped_dup = 0
    total_words = 0
    seen_hashes = set()

    out = open(OUTPUT, 'w', encoding='utf-8')
    with bz2.open(INPUT, 'rb') as f:
        context = ET.iterparse(f, events=('start', 'end'))
        _, root = next(context)
        title = None
        ns = None
        in_revision = False
        text_content = None
        for event, elem in context:
            tag = elem.tag.split('}')[-1] if '}' in elem.tag else elem.tag
            if event == 'start' and tag == 'revision':
                in_revision = True
            if event == 'end':
                if tag == 'title' and not in_revision:
                    title = elem.text
                elif tag == 'ns' and not in_revision:
                    ns = elem.text
                elif tag == 'text' and in_revision:
                    text_content = elem.text
                elif tag == 'revision':
                    in_revision = False
                elif tag == 'page':
                    page_count += 1
                    if ns != '0' or (title and title.startswith(STOPWORD_TITLE_PREFIXES)):
                        skipped_ns += 1
                    elif is_redirect(text_content):
                        skipped_redirect += 1
                    else:
                        cleaned = clean_wikitext(text_content or '')
                        words = cleaned.split()
                        if len(words) < 30:
                            skipped_short += 1
                        else:
                            h = hashlib.md5((title + '|' + cleaned[:200]).encode('utf-8')).hexdigest()
                            if h in seen_hashes:
                                skipped_dup += 1
                            else:
                                seen_hashes.add(h)
                                out.write(json.dumps({'title': title, 'text': cleaned}, ensure_ascii=False) + '\n')
                                kept_count += 1
                                total_words += len(words)
                    title = None
                    ns = None
                    text_content = None
                    root.clear()
                    if page_count % 20000 == 0:
                        elapsed = time.time() - t0
                        print('  {} halaman diproses ({}s), {} disimpan, ~{} kata terkumpul'.format(
                            page_count, round(elapsed), kept_count, total_words), flush=True)
                    if total_words >= STOP_AT_WORDS:
                        print('STOP_AT_WORDS ({}) tercapai di halaman ke-{} - berhenti lebih awal (tidak perlu proses seluruh dump).'.format(STOP_AT_WORDS, page_count), flush=True)
                        break
    out.close()

    elapsed = time.time() - t0
    print('\n=== SELESAI extract+clean ===')
    print('Total halaman <page> diproses:', page_count)
    print('Artikel disimpan:', kept_count)
    print('Dilewati (ns bukan artikel/namespace non-konten):', skipped_ns)
    print('Dilewati (redirect):', skipped_redirect)
    print('Dilewati (terlalu pendek <30 kata):', skipped_short)
    print('Dilewati (duplikat exact judul+awal teks):', skipped_dup)
    print('Total kata terkumpul (~token, whitespace-split):', total_words)
    print('Waktu:', round(elapsed, 1), 's')

    summary = {
        'pagesProcessed': page_count,
        'articlesKept': kept_count,
        'skippedNamespace': skipped_ns,
        'skippedRedirect': skipped_redirect,
        'skippedTooShort': skipped_short,
        'skippedDuplicateExact': skipped_dup,
        'totalWordsApprox': total_words,
        'elapsedSec': round(elapsed, 1),
        'stoppedEarly': total_words >= STOP_AT_WORDS,
    }
    with open(OUTPUT + '.summary.json', 'w') as f:
        json.dump(summary, f, indent=2)


if __name__ == '__main__':
    main()
