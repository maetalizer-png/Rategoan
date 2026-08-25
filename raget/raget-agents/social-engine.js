const EMOJI_CAP_RE = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;

function capEmoji(text) {
  let count = 0;
  return String(text || '').replace(EMOJI_CAP_RE, (m) => {
    count++;
    return count <= 1 ? m : '';
  });
}

function naturalize({ mirror, body, followup, emoji }) {
  let out = '';
  if (mirror) out += mirror + ' ';
  out += body;
  if (followup) out += '\n\n' + followup;
  if (emoji) out += ' ' + emoji;
  return capEmoji(out);
}

function detectEmotion(text) {
  const t = text.toLowerCase();
  if (/\b(marah|kesel|kesal|emosi|geram|jengkel)\b/.test(t)) return 'marah';
  if (/\b(kecewa|sedih|nyesek|kesel\s*banget)\b/.test(t)) return 'kecewa';
  return 'netral';
}

// ---------- SOCIAL INTENT: CURHAT ----------

function tryCurhat(text) {
  const t = text.toLowerCase();
  if (!/\b(mau|boleh|pengen|pengin)\s*curhat\b|\bdengerin\s+(aku|saya)\s+(dulu|sebentar|dong)?\b|\bcurhat\s+(dulu|dong|nih|bentar)\b/i.test(t)) return null;
  return naturalize({
    body: 'Boleh banget, aku dengerin. Cerita aja apa yang lagi kamu rasain atau alami — nggak perlu buru-buru, aku nggak akan langsung nge-judge atau nyuruh kamu ngapa-ngapain dulu.',
    followup: 'Mulai dari mana aja yang kamu mau ceritain duluan?',
    emoji: '🫶',
  });
}

// ---------- SOCIAL INTENT: DISKUSI & PERDEBATAN (steel-manning) ----------

const TOPIC_BANK = {
  'kerja remote': {
    keys: ['kerja remote', 'wfh', 'kerja dari rumah'],
    a: 'kerja remote memberi fleksibilitas waktu dan lokasi, mengurangi waktu komuter, dan sering meningkatkan fokus individu',
    b: 'kerja di kantor memudahkan kolaborasi spontan, membangun budaya tim yang lebih kuat, dan memisahkan jelas antara waktu kerja dan istirahat',
    synthesis: 'Yang paling ideal biasanya model hybrid: cukup fleksibel untuk fokus individu, tapi tetap ada waktu tatap muka untuk kolaborasi dan menjaga koneksi tim.',
  },
  'ai menggantikan pekerjaan': {
    keys: ['ai menggantikan pekerjaan', 'ai gantiin pekerjaan manusia', 'ai mengambil alih pekerjaan'],
    a: 'AI bisa mengotomatiskan tugas repetitif sehingga manusia bisa fokus ke pekerjaan yang lebih kreatif dan strategis',
    b: 'otomatisasi AI berisiko menghilangkan lapangan kerja di sektor tertentu lebih cepat daripada kemampuan pekerja untuk beralih keterampilan',
    synthesis: 'Kemungkinan besar dampaknya adalah pergeseran jenis pekerjaan, bukan penghapusan total — tantangan terbesarnya ada di kecepatan adaptasi kebijakan dan pelatihan ulang tenaga kerja.',
  },
  'media sosial': {
    keys: ['media sosial baik atau buruk', 'medsos baik atau buruk', 'dampak media sosial'],
    a: 'media sosial mempermudah koneksi, akses informasi, dan memberi ruang bagi suara-suara yang sebelumnya tidak terdengar',
    b: 'penggunaan berlebihan media sosial dikaitkan dengan masalah kesehatan mental, perbandingan sosial, dan penyebaran misinformasi',
    synthesis: 'Dampaknya sangat bergantung pada cara dan intensitas pemakaian — alatnya netral, tapi kebiasaan pemakaiannya yang menentukan apakah manfaat atau risikonya yang lebih dominan.',
  },
  'pendidikan formal vs otodidak': {
    keys: ['pendidikan formal vs otodidak', 'kuliah vs belajar sendiri', 'sekolah vs otodidak'],
    a: 'pendidikan formal memberi struktur, pengakuan resmi (ijazah), dan akses ke jaringan serta bimbingan langsung',
    b: 'belajar otodidak lebih fleksibel, bisa disesuaikan kecepatan dan minat masing-masing, dan sering lebih murah',
    synthesis: 'Keduanya bisa saling melengkapi — banyak orang sukses mengombinasikan fondasi dari pendidikan formal dengan pembelajaran mandiri yang terus berjalan setelahnya.',
  },
  'makan daging vs vegetarian': {
    keys: ['makan daging vs vegetarian', 'vegetarian vs makan daging', 'diet vegetarian baik atau tidak'],
    a: 'pola makan dengan daging menyediakan sumber protein dan nutrisi tertentu (seperti B12 dan zat besi heme) secara lebih mudah diserap tubuh',
    b: 'pola makan vegetarian umumnya berdampak lebih rendah terhadap lingkungan dan bisa menurunkan risiko beberapa penyakit tidak menular bila direncanakan dengan baik',
    synthesis: 'Pilihan ini sangat personal — yang terpenting adalah pola makan yang seimbang secara nutrisi, apapun sumber proteinnya.',
  },
  'game buruk untuk anak': {
    keys: ['game buruk untuk anak', 'bermain game buruk untuk anak', 'main game merusak anak'],
    a: 'bermain game berlebihan tanpa batasan waktu bisa mengganggu tidur, aktivitas fisik, dan interaksi sosial anak',
    b: 'game juga bisa melatih kemampuan memecahkan masalah, koordinasi, dan bahkan kerja sama tim lewat game multiplayer',
    synthesis: 'Masalahnya biasanya bukan game itu sendiri, tapi soal keseimbangan — game yang dimainkan dengan batasan waktu yang sehat justru bisa jadi hal yang positif.',
  },
  'kerja keras vs kerja cerdas': {
    keys: ['kerja keras vs kerja cerdas', 'kerja cerdas vs kerja keras'],
    a: 'kerja keras (usaha dan konsistensi tinggi) tetap jadi fondasi penting karena banyak hasil butuh waktu dan pengulangan',
    b: 'kerja cerdas (strategi dan prioritas yang tepat) membuat usaha yang sama menghasilkan dampak yang jauh lebih besar',
    synthesis: 'Keduanya bukan pilihan yang saling meniadakan — kombinasi usaha konsisten dengan strategi yang tepat biasanya memberi hasil paling optimal.',
  },
  'uang bisa beli kebahagiaan': {
    keys: ['uang bisa beli kebahagiaan', 'apakah uang bisa membeli kebahagiaan'],
    a: 'uang bisa mengurangi banyak sumber stres nyata seperti kekhawatiran finansial, akses kesehatan, dan waktu luang',
    b: 'setelah kebutuhan dasar terpenuhi, penelitian menunjukkan tambahan uang punya efek yang makin kecil terhadap tingkat kebahagiaan harian',
    synthesis: 'Uang lebih tepat dilihat sebagai alat untuk mengurangi penderitaan tertentu, bukan sumber utama kebahagiaan itu sendiri.',
  },
};

function findTopic(text) {
  const t = text.toLowerCase();
  for (const topic of Object.values(TOPIC_BANK)) {
    if (topic.keys.some((k) => t.includes(k))) return topic;
  }
  return null;
}

function tryDiskusiPerdebatan(text) {
  const t = text.toLowerCase();
  const isOpinionAsk = /\bmenurut(mu|kamu)?\b|\bapa\s+pendapatmu\b|\bgimana\s+pendapatmu\b|\bbagaimana\s+pendapatmu\b|\bbagaimana\s+pendapat\s+kamu\b|\bgimana\s+pendapat\s+kamu\b/i.test(t);
  const isDebate = /\b(aku|saya)\s+(rasa|pikir)\s+kamu\s+(salah|keliru)\b|\btidak\s+setuju\s+(dengan|sama)\s+(kamu|itu|pendapat)\b|\bmenurutku\s+kamu\s+(salah|keliru)\b/i.test(t);
  if (!isOpinionAsk && !isDebate) return null;
  const topic = findTopic(t);
  if (!topic) return null;
  const opener = isDebate
    ? 'Oke, aku coba lihat dari dua sisi dulu sebelum menanggapi (steel-manning, bukan strawman):'
    : 'Menurutku ini topik yang punya dua sisi kuat, jadi aku coba timbang dulu keduanya:';
  return naturalize({
    body: `${opener}\n\nSisi pertama: ${topic.a}.\nSisi kedua: ${topic.b}.\n\nSintesis: ${topic.synthesis}`,
    followup: 'Kamu sendiri lebih condong ke sisi yang mana, atau ada sudut pandang lain yang belum aku sebut?',
  });
}

const NON_SUPERLATIVE_TER_RE = /^(tersebut|ternyata|terus|terima|tertentu|terlibat|terjadi|terlihat|tergantung|terkait|terlambat|terdiri|terletak|terjebak|terpaksa|terjatuh|tersisa|terpisah|tersimpan|terjaga|terikat|terbentuk|terkena|tersedia|terpenting|terutama|terhadap|termasuk|terhubung)$/i;

function isSuperlativeQuery(t) {
  if (/\b(paling\s+\w+|nomor\s*satu)\b/i.test(t)) return true;
  const terMatches = t.match(/\bter[a-z]{3,}\b/gi) || [];
  return terMatches.some((w) => !NON_SUPERLATIVE_TER_RE.test(w));
}

function tryOpiniUmum(text) {
  const t = text.toLowerCase();
  const isOpinionAsk =
    /\bmenurut(mu|kamu|anda)?\b|\bapa\s+pendapat(\s+kamu|\s+anda|mu)?\b|\b(gimana|bagaimana)\s+pendapat(\s+kamu|\s+anda|mu)?\b|\bopini(\s+kamu|\s+anda|mu)?\b/i.test(
      t
    );
  const isSuperlative = isSuperlativeQuery(t);
  if (!isOpinionAsk) return null;
  if (findTopic(t)) return null;
  if (!isSuperlative) {
    return naturalize({
      body: 'Aku bisa bantu menimbang opsi, tapi bukan punya opini pribadi seperti manusia. Kasih topik atau situasinya dulu.',
      followup: 'Contoh: keputusan kerja, pilih produk, atau dilema sehari-hari — yang mana?',
      emoji: '💭',
    });
  }
  return naturalize({
    body:
      'Aku nggak punya preferensi atau selera pribadi karena aku mesin rule-based, bukan yang benar-benar merasakan sesuatu — jadi nggak adil kalau aku klaim satu jawaban sebagai "terbaik" secara subjektif.',
    followup: 'Kalau kamu kasih tahu kriteria yang penting buat kamu (misalnya biaya, keamanan, atau kenyamanan), aku bisa bantu cari fakta relevan biar kamu bisa nilai sendiri.',
  });
}

// ---------- SOCIAL INTENT: HUMOR ----------

const JOKE_BANK = [
  'Kenapa komputer gak pernah masuk angin? Soalnya dia selalu pakai Windows!',
  'Kenapa programmer benci alam? Terlalu banyak bug yang gak bisa di-fix.',
  'Kenapa angka 6 takut sama angka 7? Karena 7, 8, 9 (seven ate nine)!',
  'Apa bedanya baterai sama cewek galak? Baterai ada positif negatifnya, kalau cewek galak negatif semua!',
  'Kenapa ikan gak suka main basket? Takut kena net!',
  'Kenapa kunang-kunang gak pernah sedih? Soalnya dia selalu bawa terang sendiri.',
  'Apa itu awan paling ramah? Awan yang selalu mendung tapi gak pernah marah.',
];

function tryHumor(text) {
  const t = text.toLowerCase();
  if (!/\b(kasih|ceritain|kasih\s+aku)\s+(lelucon|lawakan|hal\s+lucu|guyonan)\b|\bbikin\s+aku\s+ketawa\b|\bmau\s+dengar\s+lelucon\b|\bpunya\s+lelucon\b/i.test(t)) return null;
  const idx = t.length % JOKE_BANK.length;
  return naturalize({
    body: JOKE_BANK[idx],
    followup: 'Mau lelucon lagi atau cukup satu dulu?',
    emoji: '😄',
  });
}

// ---------- SOCIAL INTENT: MOTIVASI ----------

const MOTIVATION_BANK = [
  'Progres kecil tetap progres. Yang penting kamu masih melangkah, sekecil apapun langkahnya.',
  'Capek itu wajar kalau kamu udah berusaha keras — itu tandanya kamu beneran mengusahakan sesuatu, bukan cuma diam.',
  'Kegagalan bukan lawan dari sukses, tapi bagian dari prosesnya. Coba lagi dengan sedikit penyesuaian.',
  'Kamu gak harus selesai hari ini. Kamu cuma perlu jadi sedikit lebih maju dari kemarin.',
  'Orang yang bertahan lewat masa sulit biasanya adalah orang yang paling kuat nantinya — kamu sedang membangun itu sekarang.',
];

function tryMotivasi(text) {
  const t = text.toLowerCase();
  if (!/\b(kasih|aku\s+butuh|aku\s+perlu|saya\s+butuh|saya\s+perlu)\s*(aku\s+)?motivasi\b|\bsemangatin\s+(aku|saya)\b|\b(aku|saya)\b.{0,20}\bmenyerah\b|\b(aku|saya)\s+putus\s*asa\b|\bga\s*ada\s*semangat\b|\btidak\s+ada\s+semangat\b/i.test(t)) return null;
  const idx = t.length % MOTIVATION_BANK.length;
  return naturalize({
    body: MOTIVATION_BANK[idx],
    followup: 'Ada hal spesifik yang lagi bikin kamu berat langkah, mau cerita?',
    emoji: '💪',
  });
}

// ---------- SOCIAL INTENT: KRITIK (constructive feedback) ----------

function tryKritik(text) {
  const t = text.toLowerCase();
  if (!/\bkritik\s+(dong|membangun)?\s*(untuk|buat)?\s*(tulisan|ide|kerjaan|karya|proyek|desain)(ku|mu|nya|saya)?\b|\bgimana\s+menurutmu\s+kualitas\b|\bkasih\s+kritik\b/i.test(t)) return null;
  return naturalize({
    body:
      'Aku belum bisa lihat langsung karyamu, tapi ini kerangka self-review yang bisa kamu pakai buat mengecek sendiri (metode sandwich: mulai dan tutup dengan hal positif):\n' +
      '1. Apa 2-3 bagian yang menurutmu paling kuat dari karya ini?\n' +
      '2. Apa satu bagian yang paling bikin kamu ragu atau kurang yakin?\n' +
      '3. Kalau ada waktu lebih, bagian mana yang paling ingin kamu revisi dulu?\n' +
      '4. Terakhir, apa satu hal yang kamu banggakan dari proses membuatnya?',
    followup: 'Kalau kamu ceritakan detail karyanya, aku bisa bantu kasih perspektif lebih spesifik.',
  });
}

// ---------- CUSTOMER SERVICE FRAMEWORKS: LATTE, HEARD, 3A ----------

function tryLatte(text) {
  const t = text.toLowerCase();
  if (!/\bkomplain\b.*\b(aplikasi|produk|layanan|sistem)\b|\b(aplikasi|produk|sistem)\b.*\b(error|lambat|bug|force\s*close|rusak)\b.*\b(kecewa|komplain|kesel|kesal)\b/i.test(t)) return null;
  const emotion = detectEmotion(t);
  const apology = emotion === 'marah' ? 'Saya benar-benar minta maaf atas masalah ini, saya paham ini bikin kamu kesal.' : 'Maaf atas ketidaknyamanan yang kamu alami.';
  return naturalize({
    body:
      'Menerapkan kerangka LATTE untuk keluhanmu:\n' +
      'L (Listen): Saya dengar keluhanmu soal masalah teknis ini.\n' +
      'A (Apologize): ' + apology + '\n' +
      'T (Take action): Coba catat langkah persis sebelum masalah muncul, lalu cek update terbaru atau restart aplikasi — itu langkah awal yang paling sering membantu.\n' +
      'T (Thank): Terima kasih sudah kasih tahu, laporan seperti ini yang membantu perbaikan ke depan.\n' +
      'E (Evaluate): Ada detail error lain yang bisa kamu ceritakan supaya bisa saya bantu telusuri lebih jauh?',
  });
}

function tryHeard(text) {
  const t = text.toLowerCase();
  if (!/\bkecewa\s+(dengan|sama)\s+pelayanan\b|\bpelayanan(nya)?\s+(buruk|jelek|mengecewakan)\b|\bstaf\s*(nya)?\s+(judes|kasar|tidak\s+ramah)\b/i.test(t)) return null;
  const emotion = detectEmotion(t);
  const empathy = emotion === 'marah' ? 'Wajar banget kalau kamu kesal dengan pengalaman seperti itu.' : 'Aku ngerti itu pasti bikin kamu kecewa.';
  return naturalize({
    body:
      'Menerapkan kerangka HEARD untuk pengalamanmu:\n' +
      'H (Hear): Saya dengar pengalaman pelayanan yang kamu alami kurang nyaman.\n' +
      'E (Empathize): ' + empathy + '\n' +
      'A (Apologize): Mohon maaf atas pengalaman kurang menyenangkan itu.\n' +
      'R (Resolve): Idealnya ini dilaporkan lewat kanal resmi layanan terkait supaya bisa ditindaklanjuti langsung ke pihak yang bertanggung jawab.\n' +
      'D (Diagnose): Supaya tidak terulang, ada baiknya dicatat kapan dan di mana kejadiannya sebagai bahan evaluasi.',
  });
}

function tryThreeA(text) {
  const t = text.toLowerCase();
  if (!/\bresponnya\s+lama\s+banget\b|\btidak\s+puas\s+dengan\s+respon\b|\bkomplain\s+singkat\b|\blambat\s+banget\s+responnya\b/i.test(t)) return null;
  return naturalize({
    body:
      'Menerapkan kerangka 3A untuk keluhanmu:\n' +
      'Acknowledge: Saya paham responnya terasa lambat dan itu mengganggu.\n' +
      'Apologize: Maaf atas keterlambatan itu.\n' +
      'Act: Coba hubungi ulang lewat kanal yang sama sambil menyertakan nomor tiket/riwayat sebelumnya, supaya prosesnya bisa dipercepat.',
  });
}

// ---------- NATURAL CHAT: mirroring + follow-up + contextual emoji ----------

const SMALLTALK_TOPICS = [
  {
    match: /\bcuaca\b.*\b(panas|dingin|hujan|mendung)\b|\b(hujan|mendung)\b.*(deras|terus|dari\s*tadi)|udara\s+dingin/i,
    mirror: 'Oh, lagi ngobrolin cuaca ya.',
    body: 'Cuaca memang suka bikin mood ikut berubah — kadang bikin malas gerak, kadang malah bikin betah di rumah.',
    followup: 'Cuaca kayak gitu biasanya bikin kamu pengen ngapain?',
    emoji: '🌤️',
  },
  {
    match: /\bhobi\b|\bdemen\s+(banget\s+)?main\s+game\b|\bwaktu\s+luang\b|\bbelajar\s+gitar\b/i,
    mirror: 'Seru juga ya soal hobi kamu itu.',
    body: 'Punya kegiatan yang bikin senang di waktu luang itu penting banget buat jaga mood tetap seimbang.',
    followup: 'Udah berapa lama kamu tekunin itu?',
    emoji: '🎮',
  },
  {
    match: /\bfilm\b.*(seru|bagus|nonton)|\blagu\s+ini\s+enak\b|\bseries\s+baru\b|\bkonser\b.*rame/i,
    mirror: 'Wah, soal hiburan nih.',
    body: 'Hal-hal kayak film, musik, atau series emang cara yang enak buat refreshing dari rutinitas.',
    followup: 'Ada rekomendasi yang bisa kamu ceritain lebih detail?',
    emoji: '🎬',
  },
  {
    match: /\bmakan\s+siang\b.*enak|\bresep\s+baru\b|\bkopi\s+pagi\b|\blaper\s+banget\b/i,
    mirror: 'Ngomongin makanan nih, jadi ikutan lapar.',
    body: 'Makanan enak emang salah satu hal simpel yang bisa langsung bikin hari lebih baik.',
    followup: 'Itu masakan sendiri atau beli?',
    emoji: '🍜',
  },
  {
    match: /\blari\s+pagi\b|\bpertandingan\s+bola\b|\brutin\s+gym\b|\bolahraga\b.*pegal/i,
    mirror: 'Semangat olahraganya!',
    body: 'Aktivitas fisik rutin emang efeknya kerasa banget buat energi dan mood, meskipun awalnya berat.',
    followup: 'Udah jadi rutinitas atau baru mulai-mulai ini?',
    emoji: '🏃',
  },
];

function tryNaturalChat(text) {
  const t = text.toLowerCase();
  for (const topic of SMALLTALK_TOPICS) {
    if (topic.match.test(t)) {
      return naturalize({ mirror: topic.mirror, body: topic.body, followup: topic.followup, emoji: topic.emoji });
    }
  }
  return null;
}

// ---------- COMBINED ----------


function tryCustomerService(text) {
  const t = text.toLowerCase();
  if (/\b(tolong|minta)\s+bantuan\b|\bbantuan\s+(dong|ya|please)\b|\bcustomer\s*service\b|\blayanan\s+pelanggan\b/i.test(t)) {
    return naturalize({
      body: 'Siap, saya bantu. Jelaskan singkat: masalahnya apa, sejak kapan, dan yang sudah dicoba apa saja.',
      followup: 'Kalau ada nomor pesanan, tiket, atau tangkapan layar, sebutkan juga supaya lebih cepat.',
      emoji: '🤝',
    });
  }
  if (/\b(cara|gimana|bagaimana)\s+(pesan|order|bayar|refund|retur|batal(kan)?)\b|\bstatus\s+(pesanan|order)\b/i.test(t)) {
    return naturalize({
      body: 'Untuk urusan pesanan/pembayaran, langkah umumnya: cek status di aplikasi → simpan bukti bayar → hubungi penjual/CS dengan nomor order.',
      followup: 'Kamu sedang di tahap mana: pesan, bayar, kirim, atau komplain?',
      emoji: '📦',
    });
  }
  if (/\b(lambat|lemot|error|gagal|tidak\s+bisa)\b.*\b(login|masuk|daftar|aplikasi|web)\b|\b(login|masuk)\b.*\b(gagal|error|tidak\s+bisa)\b/i.test(t)) {
    return naturalize({
      body: 'Coba urut: (1) cek koneksi, (2) refresh/muat ulang, (3) clear cache atau mode samaran, (4) pastikan email/nomor benar. Kalau masih gagal, catat pesan errornya.',
      followup: 'Muncul pesan error apa tepatnya di layar?',
      emoji: '🛠️',
    });
  }
  if (/\bmaaf\b.*\bganggu\b|\bmohon\s+bantuannya\b|\bpermisi\b.*\btanya\b/i.test(t)) {
    return naturalize({
      body: 'Tidak mengganggu. Silakan sampaikan keperluannya — saya usahakan jelas dan ringkas.',
      followup: 'Mau langsung ke inti masalahnya?',
      emoji: '🙂',
    });
  }
  return null;
}

function trySocial(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  return (
    tryCustomerService(t) ||
    tryCurhat(t) ||
    tryDiskusiPerdebatan(t) ||
    tryOpiniUmum(t) ||
    tryHumor(t) ||
    tryMotivasi(t) ||
    tryKritik(t) ||
    tryLatte(t) ||
    tryHeard(t) ||
    tryThreeA(t) ||
    tryNaturalChat(t) ||
    null
  );
}

export const socialEngine = Object.freeze({
  tryCustomerService,
  tryCurhat,
  tryDiskusiPerdebatan,
  tryOpiniUmum,
  tryHumor,
  tryMotivasi,
  tryKritik,
  tryLatte,
  tryHeard,
  tryThreeA,
  tryNaturalChat,
  detectEmotion,
  trySocial,
});
