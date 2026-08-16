export default {
  id: 'jilid-14',
  judul: 'Perintah Mega Jilid 14 — Otak + Fitur + Speed + Journey',
  tanggal: '2026-08-14',
  komit: ['024d64f', '77b5391', 'e9fcebe', 'ac77b7b', '1d8b34b', '464cddf', '9388cc6', '4c958e3'],
  ringkasan:
    'Ronde besar 1-6: dataries jadi sumber fallback planner (OTAK); kuis+streak, chips pintar, onboarding v2, export catatan (FITUR HARIAN); lazy-load dynamic import, idle warmup, LRU cache di retrieve() (SPEED); multi-intent, tool temporal, slang, "X vs Y", quick chips (CERDAS); badge streak, briefing+kuis, kartu berbagi, mode hemat (RETENSI); ditutup Journey audit — Playwright sebagai pemilik+user, 3 persona berurutan, 33/33 langkah lulus. Dua bug nyata ditemukan & ditutup di tengah jalan.',
  fitur_baru: [
    'dataries sebagai sumber fallback planner (ambang 0.30), tool fungsi()/tujuan()/penyebab()',
    'dataries/quiz.js — kuis 1 soal PG + streak (raget_streak)',
    'Chips empty-state berputar per jam, onboarding v2 interaktif 3-tap',
    'ai-agent/lazy-modules.js — dynamic import OCR/PDF/Notion/Evernote/WhatsApp/translator',
    'Idle warmup 2 region dataries, LRU cache 50 entri di retrieve()',
    'Multi-intent " dan " (maks 2), tool temporal ("berapa hari lagi X merdeka"), "X vs Y", quick chips kontekstual',
    'Badge streak drawer, tool "bagikan kartu <negara>", mode hemat (raget_hemat), guard emoji≤1 & factoid≤3 kalimat',
  ],
  bug_ditutup: [
    'Onboarding v2 tidak pernah tampil — onboard.maybeShow() tidak dipanggil ulang pasca-login async',
    'guardFactoidSentences() merusak jawaban terstruktur (heading+bullet) — sekarang mendeteksi baris - / # dan melewatinya utuh',
    'Bonus: "ingat apa yang saya catat tentang X" salah tertangkap sebagai fakta baru, bukan pencarian',
  ],
  kpi: {
    quality: 'Q=58→67 (A70/K30/U98/D100/V50, n per komponen: A=0,K=80,U=230,D=43,V=3)',
    bench: '204/213 (95.8%) → 222/231 (96.1%)',
    boot: '13ms (target <800ms)',
    localStorage: '65.5KB/5 kunci → 72.5KB/8 kunci',
    journey: '33/33 langkah, 3 persona, rata-rata 4.7/5 (kejujuran 5/5 konsisten)',
    diffKerangka: '173 baris (di atas target 100, dengan alasan terdokumentasi)',
  },
};
