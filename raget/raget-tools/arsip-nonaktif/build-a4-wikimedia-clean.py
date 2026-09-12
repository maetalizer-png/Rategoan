#!/usr/bin/env python3
"""
build-a4-wikimedia-clean.py
Fase A — unduh dump resmi Wikimedia (CC-BY-SA) → clean JSONL → manifest.

Jalankan di Colab / mesin lokal (butuh ~5–8 GB disk + 30–60 menit).
Jangan jalankan di sandbox ephemeral.

Output:
  korpus-a4-wikimedia-clean.jsonl.gz
  manifest-a4-wikimedia-clean.json

Release target: A4 · Korpus AMAN — Wikimedia terbaru
"""
from __future__ import annotations
import argparse, bz2, gzip, hashlib, json, os, re, time, urllib.request
import xml.etree.ElementTree as ET

UA = "RategoanBot/1.0 (open research; build-a4)"
DATE_DEFAULT = "20260801"
PROJECTS = [
    ("idwiki", 50),
    ("idwikibooks", 40),
    ("idwikisource", 40),
    ("idwiktionary", 30),
    ("idwikivoyage", 40),
    ("idwikiquote", 40),
]


def local(tag: str) -> str:
    return tag.split("}")[-1] if "}" in tag else tag


def wiki_to_text(wikitext: str) -> str:
    if not wikitext:
        return ""
    t = wikitext
    for _ in range(4):
        nt = re.sub(r"\{\{[^{}]*\}\}", " ", t)
        if nt == t:
            break
        t = nt
    t = re.sub(r"\{\|[^\n]*", " ", t)
    t = re.sub(r"\|\}", " ", t)
    t = re.sub(r"\[\[(?:File|Berkas|Image|Media|Kategori|Category):[^\]]*\]\]", " ", t, flags=re.I)
    t = re.sub(r"\[\[[^\|\]]*\|([^\]]+)\]\]", r"\1", t)
    t = re.sub(r"\[\[([^\]]+)\]\]", r"\1", t)
    t = re.sub(r"\[https?://[^\s\]]+\s+([^\]]+)\]", r"\1", t)
    t = re.sub(r"\[https?://[^\]]+\]", " ", t)
    t = re.sub(r"'{2,}", "", t)
    t = re.sub(r"<ref[^>]*>.*?</ref>", " ", t, flags=re.S | re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    t = re.sub(r"==+[^=]+==+", "\n", t)
    t = re.sub(r"^\*+\s*", "", t, flags=re.M)
    t = re.sub(r"^#+\s*", "", t, flags=re.M)
    t = re.sub(r"&nbsp;|&amp;|&lt;|&gt;|&quot;", " ", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    t = re.sub(r"[ \t]{2,}", " ", t)
    return t.strip()


def download(proj: str, date: str, out_dir: str) -> str:
    fname = f"{proj}-{date}-pages-articles.xml.bz2"
    path = os.path.join(out_dir, fname)
    if os.path.exists(path) and os.path.getsize(path) > 1_000_000:
        print(f"[skip] {fname} already exists")
        return path
    url = f"https://dumps.wikimedia.org/{proj}/{date}/{fname}"
    print(f"[dl] {url}")
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=600) as resp, open(path, "wb") as f:
        while True:
            chunk = resp.read(8 * 1024 * 1024)
            if not chunk:
                break
            f.write(chunk)
    print(f"[ok] {fname} {os.path.getsize(path)/1024/1024:.1f} MB")
    return path


def process_dump(path: str, source: str, min_words: int, out_fh) -> dict:
    count = kept = words = 0
    t0 = time.time()
    with bz2.open(path, "rt", encoding="utf-8", errors="ignore") as f:
        for event, elem in ET.iterparse(f, events=("end",)):
            if local(elem.tag) != "page":
                continue
            count += 1
            title = ns = ""
            text = ""
            for child in elem:
                ln = local(child.tag)
                if ln == "title":
                    title = (child.text or "").strip()
                elif ln == "ns":
                    ns = (child.text or "0").strip()
                elif ln == "revision":
                    for rchild in child:
                        if local(rchild.tag) == "text":
                            text = rchild.text or ""
            elem.clear()
            if ns != "0":
                continue
            if title.startswith(("Wikipedia:", "MediaWiki:", "Portal:", "Bantuan:", "Templat:")):
                continue
            plain = wiki_to_text(text)
            wc = len(plain.split())
            if wc < min_words:
                continue
            low = plain[:80].lower()
            if low.startswith("#redirect") or low.startswith("alihkan"):
                continue
            host = {
                "idwiki": "https://id.wikipedia.org/wiki/",
                "idwikibooks": "https://id.wikibooks.org/wiki/",
                "idwikisource": "https://id.wikisource.org/wiki/",
                "idwiktionary": "https://id.wiktionary.org/wiki/",
                "idwikivoyage": "https://id.wikivoyage.org/wiki/",
                "idwikiquote": "https://id.wikiquote.org/wiki/",
            }.get(source, "")
            obj = {
                "text": plain[:50000],
                "source": source,
                "license": "cc-by-sa-4.0",
                "url": host + title.replace(" ", "_") if host else None,
                "title": title,
            }
            out_fh.write(json.dumps(obj, ensure_ascii=False) + "\n")
            kept += 1
            words += wc
            if kept % 20000 == 0:
                print(f"  {source}: kept={kept} seen={count} words={words}")
    return {"pages": count, "kept": kept, "words": words, "sec": round(time.time() - t0)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", default=DATE_DEFAULT)
    ap.add_argument("--work", default="./a4_work")
    ap.add_argument("--skip-download", action="store_true")
    args = ap.parse_args()
    os.makedirs(args.work, exist_ok=True)
    raw_dir = os.path.join(args.work, "raw")
    os.makedirs(raw_dir, exist_ok=True)

    jsonl_path = os.path.join(args.work, "korpus-a4-wikimedia-clean.jsonl")
    stats = {}
    with open(jsonl_path, "w", encoding="utf-8") as out:
        for proj, min_w in PROJECTS:
            if not args.skip_download:
                path = download(proj, args.date, raw_dir)
            else:
                path = os.path.join(raw_dir, f"{proj}-{args.date}-pages-articles.xml.bz2")
            print(f"[process] {proj}")
            stats[proj] = process_dump(path, proj, min_w, out)

    # gzip + sha
    gz_path = jsonl_path + ".gz"
    h = hashlib.sha256()
    total_docs = 0
    with open(jsonl_path, "rb") as src, gzip.open(gz_path, "wb") as dst:
        while True:
            chunk = src.read(8 * 1024 * 1024)
            if not chunk:
                break
            h.update(chunk)
            dst.write(chunk)
            total_docs += chunk.count(b"\n")

    total_words = sum(s["words"] for s in stats.values())
    manifest = {
        "name": "korpus-a4-wikimedia-clean",
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "dumpDate": args.date,
        "totalDokumen": total_docs,
        "totalKataApprox": total_words,
        "sha256_jsonl": h.hexdigest(),
        "license": "cc-by-sa-4.0",
        "source": "dumps.wikimedia.org (official)",
        "breakdown": stats,
        "status": "AMAN",
        "rekomendasi": "Campur dengan A3: 60-70% A4/A1 + 30-40% A3",
    }
    man_path = os.path.join(args.work, "manifest-a4-wikimedia-clean.json")
    with open(man_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(json.dumps(manifest, indent=2, ensure_ascii=False))
    print(f"\nOutput:\n  {gz_path}\n  {man_path}")
    print("Upload ke GitHub Release tag: korpus-a4-wikimedia-clean")
    print("Nama: A4 · Korpus AMAN — Wikimedia terbaru")


if __name__ == "__main__":
    main()
