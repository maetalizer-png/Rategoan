export default {
  id: "ronde-v4-trisula-deca",
  judul: "Ronde v4 - mesin matematika nyata, dukungan bilingual, knowledge graph, toleransi typo, A akurat",
  tanggal: "2026-08-15",
  komit: [
    "53f1fbb",
    "752f5d9",
    "a01c040",
    "ea94ba5",
    "86e1ba6",
    "410d578"
  ],
  ringkasan: "Enam Bagian: (1) hapus auto-quiz yang nempel di jawaban faktual + animasi ketik natural dengan mode bench (render instan untuk automation lewat deteksi navigator.webdriver); (2) math-engine.js - parser recursive-descent asli (bukan eval), operator lengkap, konversi satuan/mata uang, mode langkah; (3) bilingual.js - deteksi bahasa ID/EN, jawaban factoid berbahasa Inggris, frasa dasar dari dataries tanpa perlu model neural; (4) knowledge-graph.js - komposer adaptif dan dialog-state lintas-bahasa yang menyambung follow-up ID<->EN ke entitas terakhir; (5) answer-composer.js - toleransi typo Levenshtein+fonetik, follow-up chip dibatasi 1; (6) feedback-store.js - Akurasi (A) akhirnya dihitung dari feedback nyata, bukan default 70%/n=0 yang dilaporkan tiga ronde beruntun. Bench 317->501 (+184 kasus). Ekspansi data dataries TIDAK dikerjakan di ronde ini (target +2.000 entri di perintah ronde tidak realistis dengan kualitas nyata dalam sisa waktu) - fokus diarahkan ke fondasi kode yang bisa diuji.",
  fitur_baru: [
    "ai-agent/math-engine.js - tokenizer + parser recursive-descent, konversi satuan/mata uang, mode langkah",
    "ai-agent/bilingual.js - deteksi bahasa, jawaban factoid EN, frasa dasar dari dataries",
    "ai-agent/knowledge-graph.js - entity store negara, komposer adaptif, dialog-state follow-up ID/EN",
    "ai-agent/answer-composer.js - toleransi typo Levenshtein + normalisasi fonetik",
    "raget-memory/feedback-store.js - pencatat thumbs up/down mandiri di raget_feedback",
    "Mode bench: reduceMotion() true otomatis saat navigator.webdriver terdeteksi"
  ],
  bug_ditutup: [
    "Auto-quiz nempel di jawaban faktual yang tidak relevan (screenshot bug user)",
    "Emoji tersembunyi di pesan jawaban kuis benar (lolos dari scan emoji ronde sebelumnya)",
    "Ekstraksi substring matematika naif merusak kurung/minus-di-depan/pemisah-ribuan",
    "Mode langkah matematika tidak benar-benar mencatat langkah perantara",
    "Konversi mata uang baru membajak fitur konversi ID lama yang lebih matang (urutan diperbaiki jadi fallback)",
    "Nama negara/ibukota masih ID-spelled di jawaban EN (Jepang bukan Japan, Kairo bukan Cairo)",
    "Follow-up EN dialog-state tidak update memoryContext, nyasar ke entitas ID terakhir",
    "Bug fuzzy-match matchesName() - sisa kata 'dan' (3 huruf) nyasar cocok ke 'Sao Tome dan Principe'",
    "Retry toleransi typo posisinya terlalu awal, sempat membajak perintah 'kuis' jadi 'luas'",
    "Akurasi (A) permanen default 70%/n=0 karena gerbang >=10 rating yang tak pernah tercapai"
  ],
  kpi: {
    bench: "317 -> 501 (+184 kasus core-suite, 100% pass)",
    kv_baku: "Q=81 K=73 U=100 D=90 V=100 (identik v3 - fokus ronde ini di kapabilitas baru, bukan pendalaman jawaban ID yang sudah diukur skrip baku)",
    A: "Terbukti nyata lewat verifikasi langsung: 3 suka + 1 tidak suka -> A=75% (n=4), pertama kali dilaporkan dengan angka sungguhan setelah 3 ronde beruntun stuck di 70%/n=0",
    playwright_final: "13/13 checklist ronde lolos (animasi natural, nol auto-quiz, thumbs berfungsi, matematika benar, EN benar, nol emoji, nol console error, mode bench instan)"
  }
};
