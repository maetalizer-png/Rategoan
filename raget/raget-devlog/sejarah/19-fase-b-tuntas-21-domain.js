export default {
  id: "fase-b-tuntas-21-domain",
  judul: "Fase B Tuntas — 21 Domain Migrasi ke Skema JSON Tunggal (2.112 Entri) + REORG raget-data/raget-devlog + Training Neural Tiny",
  tanggal: "2026-08-23",
  komit: [
    "3576302",
    "611e37a",
    "aebd71d",
    "d619665",
    "d967be0",
    "3d44db3",
    "7b804dc",
    "97ac782",
    "8e12fe4",
    "123d69c",
    "c37de71",
    "0a1edab",
    "aa52eef",
    "55577fc",
    "1d76982",
    "2f50db6",
    "c711ef8",
    "de61229",
    "a28af4d",
    "03bccf9",
    "3717a4f",
    "2019387"
  ],
  ringkasan: "Ronde multi-sesi yang menuntaskan seluruh Fase B roadmap vNext: migrasi 21 domain data dari format modul JS lama (raget-dataries/<domain>/*.js, DATA export per region) ke satu skema JSON seragam {id, kategori, wilayah, nama, tags, teks, meta} di raget-data/json/<domain>/, dimulai dari pilot domain tokoh dan diakhiri domain seni-budaya sebagai domain ke-21. Total 2.112 entri terverifikasi (dihitung ulang langsung dari file JSON, bukan diasumsikan) tersebar di 21 domain, dari yang terkecil (sapaan, 11 entri) sampai yang terbesar (marplace, 378 entri). Di tengah ronde dijalankan BLOK REORG yang merapikan raget-data/ jadi tiga sub-folder (json/jsonl/neural) dan raget-devlog/ mengikuti pola yang sama, plus satu training run nyata pada preset neural tiny memakai korpus gabungan seluruh domain. Setiap domain digerbangi pola yang identik: migrasi terpisah per commit, korpus di-regenerasi, live-verify lewat query nyata di browser (bukan cuma unit test), lalu full bench 1180 core-suite sebelum commit dianggap selesai. Dua temuan jujur tercatat: (1) menambahkan domain besar (marplace) ke DATARIES_FALLBACK_GROUPS sempat bikin regresi TF-IDF pada query negara kecil - dicoba lalu sengaja dibatalkan, didokumentasikan di commit, bukan disembunyikan; (2) unifiedToLegacyShape() di raget-dataries/index.js ternyata TIDAK PERNAH menyuntik balik field 'tags' sejak domain JSON-migrated pertama - bug lama yang baru terpapar di domain ke-21 lewat query 'tari khas bali', diperbaiki di commit yang sama dan berlaku otomatis untuk seluruh 21 domain sekaligus.",
  fitur_baru: [
    "21 domain migrasi tuntas ke skema JSON tunggal: tokoh, kuliner, hari-internasional, sapaan, negara, kota, bahasa, etika, minuman, wisata, sejarah, makanan, alam, sains, olahraga, marplace, lingo, ekonomi, paluang, penemuan, seni-budaya - total 2.112 entri (terverifikasi ulang dari file, bukan angka asumsi)",
    "REORG raget-data/ menjadi json/ (skema JSON per domain), jsonl/ (korpus gabungan untuk training), neural/ (checkpoint dan laporan training) - raget-devlog/ mengikuti pola yang sama",
    "dataries-ke-korpus.mjs versi penuh menggabungkan seluruh 21 domain JSON jadi satu korpus JSONL (raget_own_corpus.jsonl), kini 4.163 baris / ~121.921 token setelah domain terakhir masuk",
    "Training run nyata preset tiny (2.839.296 parameter) dengan korpus gabungan terbaru: 7.634 step dalam anggaran 40 menit, held-out perplexity 8.551,6 -> 2.180,6 (turun ~4,4x), namun generasi masih premature EOS / fragmen kata tidak koheren - dicatat apa adanya, tidak diklaim 'siap pakai'"
  ],
  bug_ditutup: [
    "unifiedToLegacyShape() (raget-dataries/index.js) tidak pernah menyuntik balik field 'tags' dari entry unified ke bentuk legacy {text, metadata} - hanya category/region/name yang disuntik. Bug ada sejak domain JSON-migrated pertama, baru terpapar di domain seni-budaya lewat query 'tari khas bali' (butuh cocok lewat tags karena nama entri 'Tari Kecak' tidak memuat kata 'bali'). Fix satu baris berlaku otomatis untuk seluruh 21 domain, diverifikasi tidak merusak domain lain (penemuan, ekonomi dicek ulang pasca-fix)",
    "DATARIES_FALLBACK_GROUPS (dataries-bridge.js): mencoba menambah 'marplace' (378 entri) ke whitelist fallback chat generik menyebabkan regresi nyata - query negara kecil di Eropa kehijak entri marplace karena kompetisi TF-IDF antar korpus dengan ukuran sangat timpang. Percobaan dibatalkan, domain besar berikutnya (lingo, ekonomi, paluang, penemuan, seni-budaya) sengaja TIDAK ditambahkan ke whitelist ini - hanya bisa dijangkau lewat consumer khusus per domain di bridge-extras.js bila ada",
    "REPORT_FILE di 3 skrip neural (train-tiny-checkpoint.mjs, train-neural-checkpoint.mjs, diagnose-neural-generation.mjs) masih menunjuk path lama raget-tools/ dari sebelum BLOK REORG - diperbaiki ke raget-devlog/neural/ SEBELUM training dijalankan, supaya laporan tidak salah tempat"
  ],
  kpi: {
    domain_migrasi: "21/21 domain tuntas, 2.112 entri total (dihitung ulang langsung dari raget-data/json/*/*.json, cocok dengan target ronde)",
    bench: "1180/1180 core-suite hijau (100%) di commit terakhir setiap domain - domain #21 (seni-budaya) sempat 1179/1180 karena bug tags di atas, run kedua pasca-fix 1180/1180 bersih",
    korpus: "raget_own_corpus.jsonl: 4.163 baris, ~121.921 token (estimasi ~4 char/token) setelah domain ke-21 masuk",
    training_neural_tiny: "2.839.296 parameter, 7.634 step, anggaran 40 menit (aktual 40 menit), held-out perplexity 8.551,57 -> 2.180,60. Sampel generasi pasca-training MASIH belum koheren (contoh: prompt 'Apa ibu kota Indonesia?' -> ': KatTom Isaac. Republik ex') - premature EOS / fragmentasi kata, dicatat jujur sebagai batas nyata preset tiny, bukan diklaim selesai",
    rule_engine: "tidak disentuh sepanjang ronde - seluruh 21 migrasi murni memindahkan data lewat unifiedToLegacyShape(), consumer di bridge-extras.js/dataries-bridge.js tidak diubah kecuali fix bug tags yang justru mengembalikan perilaku yang seharusnya sudah ada sejak awal"
  }
};
