export default {
  id: "training-checkpoint50m-fase-c",
  judul: "Fase C — Training Nyata Pertama pada Checkpoint 50M (Gradient Descent, 100 Step)",
  tanggal: "2026-08-21",
  komit: [
    "7438ad6"
  ],
  ringkasan: "Entri susulan yang belum sempat ditulis saat commit-nya dibuat: run training nyata PERTAMA pada preset neural 'small' (~58 juta parameter, checkpoint raget-neural-50m). Sebelum ronde ini bobot checkpoint murni acak (skipAutoTrain, belum pernah dilatih sama sekali). Skrip raget-tools/train-neural-checkpoint.mjs dibuat baru khusus untuk ini, berbasis anggaran WAKTU (bukan jumlah step tetap) karena kalibrasi menunjukkan satu step penuh (forward+backward lewat transformer 8-layer/512-dim) di JS murni tanpa GPU makan ~12-19 detik - jauh lebih lambat dari perkiraan awal, sehingga anggaran waktu praktis hanya cukup untuk puluhan step, bukan ribuan. Run nyata dengan anggaran 20 menit (korpus raget_own_corpus.jsonl, 3.389 kalimat/teks setelah ekspansi dialog saat itu) menghasilkan 100 step selesai dalam 20,3 menit. Sampel generasi sebelum dan sesudah training TETAP TIDAK KOHEREN - dicatat apa adanya di training-report.json, tidak dipoles. checkpoint-50m ditandai trained:true, trainingSteps:100 (sebelumnya bobot acak murni), dan deskripsi model raget-neural-50m diperbarui agar jujur: training nyata sudah terjadi tapi jawaban tetap tidak koheren pada skala ini. Rule engine (raget-template-1) tetap default; neural tetap opt-in berlabel 'Neural Lokal (Eksperimental)' - jalur default tidak tersentuh.",
  fitur_baru: [
    "raget-tools/train-neural-checkpoint.mjs (baru): skrip training gradient descent nyata untuk preset 'small' (~58 juta parameter), berbasis anggaran waktu (menit) lewat argumen CLI, bukan jumlah step tetap - satu argumen: node train-neural-checkpoint.mjs [menitAnggaran]",
    "Run pertama: anggaran 20 menit -> 100 step selesai dalam 20,3 menit di atas korpus 3.389 kalimat/teks",
    "Loss turun dari rata-rata 10,53 (5 step pertama) ke 10,38 (5 step terakhir); perplexity turun dari ~37.318 ke ~32.300 - penurunan nyata tapi sangat kecil, sesuai ekspektasi untuk model 58 juta parameter yang baru dilatih 100 step",
    "checkpoint raget-neural-50m.safetensors ditulis ulang dengan bobot hasil training nyata (trained:true, trainingSteps:100, trainingMinutes:20.3), menggantikan bobot acak murni sebelumnya"
  ],
  bug_ditutup: [],
  kpi: {
    preset: "small (~58 juta parameter, 8-layer/512-dim)",
    training: "100 step nyata dalam anggaran 20 menit (aktual 20,3 menit), korpus 3.389 kalimat/teks",
    loss: "rata-rata 5 step pertama 10,53 -> rata-rata 5 step terakhir 10,38 (perplexity ~37.318 -> ~32.300) - turun tipis, jauh dari cukup untuk koherensi",
    generasi: "sampel sebelum maupun sesudah training MASIH sepenuhnya tidak koheren (potongan kata acak, bukan kalimat) - dicatat jujur di training-report.json, tidak diklaim 'siap pakai'",
    catatan: "entri ini ditulis belakangan (bukan pada tanggal commit) untuk melengkapi devlog yang sempat terlewat sebelum ronde training 85-menit berikutnya dijalankan"
  }
};
