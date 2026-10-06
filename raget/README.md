# PANDUAN STRUKTUR MODUL RAGET

Folder ini menampung modul kecerdasan berdaulat Rategoan:
- `raget-data/json/` : 260 Database Pengetahuan Deterministik Kanonikal Aktif (Sistem 1 Fast-Path <10ms).
- `raget-vault/`     : Mesin RAG Hibrida Lokal (BM25 + TF-IDF Cosine via RRF).
- `raget-agents/`    : Orkestrasi Agenik, Sub-goal Planner, dan Tool Dispatcher.
- `raget-neural/`    : Runtime Pemuat Bobot Model Sisi Klien (WebGPU / Wasm).
- `raget-devlog/`    : ARSIP HISTORIS MASALAH RISET (Catatan eksperimen masa lalu, BUKAN status produksi aktif).
