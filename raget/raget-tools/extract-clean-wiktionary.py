#!/usr/bin/env python3
"""MEGA-BATCH RAGETAN ROUND 10 - FASE B5: extract+clean definisi Wiktionary
bahasa Indonesia (idwiktionary-latest-pages-articles.xml.bz2, dari GitHub
Release tag Hhh).

Wiktionary punya struktur BEDA dari artikel Wikipedia biasa - bukan prosa,
tapi entri kamus: satu <page> per kata, berisi satu bagian per bahasa
(=={{bahasa|id}}==, =={{bahasa|en}}==, dst) dan di dalamnya definisi
bernomor (# definisi ...) di bawah penanda kelas kata ({{-n-|id}},
{{-v-|id}}, {{-a-|id}}, dst). extract-clean-wikipedia.py (dibuat untuk
prosa) TIDAK cocok dipakai di sini - definisi akan hilang/rusak kalau
dipaksakan lewat pembersih artikel biasa.

Skrip ini HANYA mengambil bagian bahasa Indonesia ({{bahasa|id}}) dari
tiap halaman, mengekstrak baris definisi bernomor, buang markup wiki/
template, dan menulis satu baris kata=definisi per entri yang punya
minimal satu definisi non-kosong.

Pakai: python3 raget-tools/extract-clean-wiktionary.py <input.xml.bz2> <output.jsonl>
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

RE_TEMPLATE = re.compile(r'\{\{[^{}]*\}\}')
RE_TEMPLATE_NESTED = re.compile(r'\{\{(?:[^{}]|\{\{[^{}]*\}\})*\}\}')
RE_LINK = re.compile(r'\[\[([^\]|]+)(?:\|([^\]]+))?\]\]')
RE_BOLD_ITALIC = re.compile(r"'''?")
RE_REF = re.compile(r'<ref[^>]*?/>|<ref[^>]*?>.*?</ref>', re.DOTALL | re.IGNORECASE)
RE_TAG = re.compile(r'<[^>]+>')
RE_WS = re.compile(r'[ \t]+')

LANG_SECTION_RE = re.compile(r'==\s*\{\{bahasa\|id\}\}\s*==(.*?)(?=\n==[^=]|\Z)', re.DOTALL)
DEFINITION_LINE_RE = re.compile(r'^#\s*(?!\*)(.+)$', re.MULTILINE)


def clean_wikitext_fragment(text):
    text = RE_REF.sub(' ', text)
    prev = None
    while prev != text:
        prev = text
        text = RE_TEMPLATE_NESTED.sub(' ', text)
    text = RE_TEMPLATE.sub(' ', text)
    text = RE_LINK.sub(lambda m: m.group(2) or m.group(1), text)
    text = RE_BOLD_ITALIC.sub('', text)
    text = RE_TAG.sub(' ', text)
    text = RE_WS.sub(' ', text).strip()
    return text


def extract_definitions(id_section_text):
    defs = []
    for m in DEFINITION_LINE_RE.finditer(id_section_text):
        cleaned = clean_wikitext_fragment(m.group(1))
        if cleaned and len(cleaned) >= 3:
            defs.append(cleaned)
    return defs


def is_redirect(text):
    return bool(text) and text.strip()[:12].upper().replace('ALIH', 'REDIRECT').startswith('#REDIRECT')


def main():
    t0 = time.time()
    total_pages = 0
    saved = 0
    skipped_not_ns0 = 0
    skipped_redirect = 0
    skipped_no_id_section = 0
    skipped_no_definitions = 0
    skipped_duplicate = 0
    seen_hashes = set()
    total_words_defs = 0

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
                    total_pages += 1
                    if ns != '0':
                        skipped_not_ns0 += 1
                    elif is_redirect(text_content):
                        skipped_redirect += 1
                    else:
                        raw_text = text_content or ''
                        m = LANG_SECTION_RE.search(raw_text)
                        if not m:
                            skipped_no_id_section += 1
                        else:
                            defs = extract_definitions(m.group(1))
                            if not defs:
                                skipped_no_definitions += 1
                            else:
                                body = (title or '') + ': ' + '; '.join(defs)
                                h = hashlib.md5(body.encode('utf-8')).hexdigest()
                                if h in seen_hashes:
                                    skipped_duplicate += 1
                                else:
                                    seen_hashes.add(h)
                                    out.write(json.dumps({'title': title, 'text': body, 'source': 'wiktionary', 'jumlahDefinisi': len(defs)}, ensure_ascii=False) + '\n')
                                    saved += 1
                                    total_words_defs += len(body.split())
                    title = None
                    ns = None
                    text_content = None
                    root.clear()
    out.close()

    elapsed = time.time() - t0
    print('=== SELESAI extract+clean wiktionary ===')
    print('Total halaman <page> diproses:', total_pages)
    print('Entri disimpan:', saved)
    print('Dilewati (ns bukan 0):', skipped_not_ns0)
    print('Dilewati (redirect/alih):', skipped_redirect)
    print('Dilewati (tidak ada bagian {{bahasa|id}}):', skipped_no_id_section)
    print('Dilewati (bagian id ada tapi tanpa definisi bernomor):', skipped_no_definitions)
    print('Dilewati (duplikat exact):', skipped_duplicate)
    print('Total kata terkumpul (~token, whitespace-split):', total_words_defs)
    print('Waktu:', round(elapsed, 1), 's')


if __name__ == '__main__':
    main()
