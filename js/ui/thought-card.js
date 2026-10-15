const ORB = {
  mind: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>',
  web: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg>',
  file: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>',
  image: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
  tool: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><polyline points="8 10 11 12.5 8 15"/><line x1="13" y1="15" x2="16" y2="15"/></svg>',
  connect: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  slide: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8"/><path d="M12 16v4"/></svg>',
  search: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.2" y2="16.2"/></svg>',
  write: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
};

const LEGACY_STATUS_FALLBACK = {
  running: 'Sedang berpikir…',
  done: 'Berpikir selama ',
  completed: 'Proses berpikir',
  stages: ['VERIFIKASI_VALIDASI', 'PERANCANGAN_ARSITEKTUR', 'SINTESIS_SUMBER'],
};

const CHEVRON_SVG =
  '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>';

const STOPWORDS = new Set([
  'apa', 'itu', 'yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'pada', 'dengan', 'adalah',
  'ini', 'itu', 'tolong', 'coba', 'bisa', 'buat', 'buatkan', 'bikin', 'jelaskan', 'uraikan',
  'ceritakan', 'tentang', 'bagaimana', 'cara', 'mengapa', 'kenapa', 'baca', 'ringkas', 'rangkum',
  'lampiran', 'berkas', 'file', 'dokumen', 'foto', 'gambar', 'saya', 'kamu', 'anda', 'dalam', 'secara',
]);

export function laneOf(step) {
  const k = String((step && step.kind) || '').toUpperCase();
  if (k === 'MIND') return 'mind';
  if (k === 'CONNECT') return 'connect';
  if (k === 'WEB_SEARCH') return 'web';
  if (k === 'SLIDE') return 'slide';
  if (k === 'TOOL_CODE' || k === 'TOOL_MATH') return 'tool';
  if (k === 'SEARCH') return 'search';
  if (k === 'WRITE') return 'write';
  if (k === 'FILE') return 'file';
  const blob = k + ' ' + ((step && step.text) || '');
  const t = blob.toLowerCase();
  if (/konektor|github|drive|gmail|calendar|kalender|oauth/.test(t)) return 'connect';
  if (/web|riset|internet|sumber|artikel|berita|cuaca|rujukan/.test(t)) return 'web';
  if (/berkas|dokumen|pdf|docx|lampiran|file|laporan|arsip|zip|citra|foto|gambar/.test(t)) return 'file';
  if (/slide|presentasi|pptx|diagram|grafik|chart|sheet|xlsx/.test(t)) return 'slide';
  if (/alat|terminal|sandbox|kode|script|fungsi|html|css|python|perintah|hitung|rumus|grep|patch|lint|uji|ekspresi|kalkulator|komponen|halaman/.test(t)) return 'tool';
  if (/konteks|memori|koleksi|riwayat|cari|telusur|referensi|proyek|ekstrak|meneliti|membandingkan/.test(t)) return 'search';
  if (/susun|tulis|rangkum|jawab|selesai|merapikan/.test(t)) return 'write';
  return 'mind';
}

function extractKeyTopic(query) {
  const clean = String(query || '').replace(/[?!.,:;"'()[\]{}]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = clean.split(' ').filter((w) => w.length > 2 && !STOPWORDS.has(w.toLowerCase()));
  if (!words.length) return clean.slice(0, 36) || 'permintaan ini';
  return words.slice(0, 6).join(' ');
}

function shortenFileName(name) {
  const s = String(name || '').trim();
  if (s.length <= 34) return s;
  const extMatch = s.match(/(\.[a-z0-9]{1,5})$/i);
  const ext = extMatch ? extMatch[1] : '';
  return s.slice(0, 22) + '…' + ext;
}

function extractBuildEntities(clean) {
  const refMatch = clean.match(/(?:buat(?:kan)?|bikin|rancang)\s+(?:saya\s+)?(.+?)\s+(?:seperti|mirip|ala|kayak)\s+([^,.?!]+)/i);
  if (refMatch) {
    return {
      target: refMatch[1].trim().slice(0, 28),
      ref: refMatch[2].trim().slice(0, 28),
    };
  }
  const targetMatch = clean.match(/(?:buat(?:kan)?|bikin|rancang)\s+(?:saya\s+)?(website|web|situs|aplikasi|app|landing\s*page|dashboard|toko(?:\s*online)?|portofolio)(?:\s+([^,.?!]+))?/i);
  if (targetMatch) {
    const label = [targetMatch[1], targetMatch[2] || ''].join(' ').trim().slice(0, 28);
    return { target: label, ref: '' };
  }
  return { target: '', ref: '' };
}

export function buildDynamicThoughts(query, opts) {
  const clean = String(query || '').replace(/\s+/g, ' ').trim();
  const isGenericAttach = !clean || /^baca dan ringkas lampiran ini$/i.test(clean);
  const topic = extractKeyTopic(clean);
  const shortQ = clean.length > 44 ? clean.slice(0, 44) + '…' : (clean || 'permintaan pengguna');

  const isThink = !!(opts && opts.think);
  const isWeb = !!(opts && opts.websearch);
  const isResearch = !!(opts && opts.research);
  const rawFileName = opts && opts.files ? String(opts.files) : '';
  const fileName = shortenFileName(rawFileName);
  const fileMeta = opts && opts.fileMeta ? opts.fileMeta : null;

  const isImageFile = /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(rawFileName) || (fileMeta && fileMeta.kind === 'image');
  const isZipFile = /\.zip$/i.test(rawFileName) || (fileMeta && fileMeta.kind === 'zip');
  const isPdfFile = /\.pdf$/i.test(rawFileName) || (fileMeta && fileMeta.kind === 'pdf');

  const isConnect = /\b(github|repo|drive|gmail|email|kotak masuk|calendar|kalender|jadwal)\b/i.test(clean);
  const isSlide = /\b(slide|presentasi|powerpoint|pptx|deck)\b/i.test(clean);
  const isWebBuild = /\b(website|web|situs|landing\s*page|aplikasi|app|toko\s*online|dashboard|portofolio|seperti\s+website)\b/i.test(clean);
  const isCode = isWebBuild || /\b(kode|code|fungsi|function|script|html|css|python|js|bug|komponen|perbaiki|edit|ubah)\b/i.test(clean);
  const isMath = /\b(hitung|rumus|integral|turunan|matriks|persamaan|\d+\s*[+*^/-]\s*\d+)\b/i.test(clean);
  const isGreeting = /^(halo|hai|hi|hei|selamat\s+(pagi|siang|sore|malam)|assalamualaikum|tes|test|ping)\b/i.test(clean) && clean.split(/\s+/).length <= 5;

  const steps = [];

  if (rawFileName) {
    if (isImageFile) {
      const dimInfo = fileMeta && fileMeta.visionSummary ? fileMeta.visionSummary : (fileMeta && fileMeta.sizeLabel ? fileMeta.sizeLabel : 'gambar');
      const colorInfo = fileMeta && fileMeta.paletteSummary ? fileMeta.paletteSummary : '';
      const pxMatch = dimInfo.match(/\d+\s*[×x]\s*\d+\s*px/i);
      steps.push({
        kind: 'FILE',
        liveLabel: 'Mengamati gambar ' + fileName + '…',
        text: 'Membuka & mengamati gambar ' + fileName,
        sub: 'Saya buka berkas gambar (' + dimInfo + ') untuk memeriksa tampilan visual, objek, serta tulisan yang ada di dalamnya.',
        chips: [fileName, pxMatch ? pxMatch[0] : ((fileMeta && fileMeta.sizeLabel) || 'Citra Visual')],
      });
      steps.push({
        kind: 'SEARCH',
        liveLabel: 'Mengekstrak informasi visual dari gambar…',
        text: 'Membedah isi visual & mengekstrak informasi dari gambar',
        sub: colorInfo
          ? ('Mengamati komposisi visual (' + colorInfo + ') dan mencatat detail penting' + (!isGenericAttach ? (' terkait "' + topic + '".') : ' pada gambar.'))
          : ('Mencatat detail tampilan, tata letak, dan informasi teks yang tampak pada ' + fileName + '.'),
      });
    } else if (isZipFile) {
      const zipStat = (fileMeta && fileMeta.statusLabel) || (fileMeta && fileMeta.sizeLabel) || 'paket berkas';
      steps.push({
        kind: 'FILE',
        liveLabel: 'Membuka paket arsip ' + fileName + '…',
        text: 'Membuka & membaca paket arsip ' + fileName,
        sub: 'Saya buka arsip ZIP (' + zipStat + ') untuk memetakan struktur folder dan daftar berkas di dalamnya.',
        chips: [fileName, zipStat],
      });
      steps.push({
        kind: 'SEARCH',
        liveLabel: 'Memeriksa isi berkas utama di dalam arsip…',
        text: 'Memeriksa isi berkas utama di dalam arsip',
        sub: 'Saya baca berkas-berkas kunci di dalam arsip untuk memahami alur kode, struktur proyek, dan bagian yang perlu dibedah.',
      });
    } else if (isPdfFile) {
      const pdfStat = (fileMeta && fileMeta.statusLabel) || (fileMeta && fileMeta.sizeLabel) || 'dokumen';
      steps.push({
        kind: 'FILE',
        liveLabel: 'Membaca isi dokumen ' + fileName + '…',
        text: 'Membaca dokumen ' + fileName,
        sub: 'Saya buka dokumen PDF (' + pdfStat + ') dan memeriksa isi tiap halamannya.',
        chips: [fileName, pdfStat],
      });
      steps.push({
        kind: 'SEARCH',
        liveLabel: 'Mengambil poin-poin inti dari dokumen…',
        text: 'Mengambil poin-poin inti dari isi dokumen',
        sub: 'Menyeleksi informasi utama dan fakta penting dari dalam dokumen agar ringkas dan akurat.',
      });
    } else {
      const docStat = (fileMeta && fileMeta.statusLabel) || (fileMeta && fileMeta.sizeLabel) || 'lampiran';
      steps.push({
        kind: 'FILE',
        liveLabel: 'Membaca berkas ' + fileName + '…',
        text: 'Membaca berkas ' + fileName,
        sub: 'Saya periksa isi berkas (' + docStat + ') untuk memahami struktur dan datanya.',
        chips: [fileName, docStat],
      });
      steps.push({
        kind: 'SEARCH',
        liveLabel: 'Memetakan bagian penting di dalam berkas…',
        text: 'Memetakan bagian penting di dalam ' + fileName,
        sub: !isGenericAttach
          ? ('Mencari bagian berkas yang berkaitan langsung dengan "' + topic + '".')
          : 'Merangkum pokok-pokok isi berkas agar mudah dipahami.',
      });
    }
    if (isThink) {
      steps.push({
        kind: 'MIND',
        liveLabel: 'Menyelaraskan temuan berkas dengan permintaan…',
        text: 'Menyelaraskan temuan berkas dengan permintaan pengguna',
        sub: 'Saya periksa kembali hasil pembacaan berkas agar penjelasan yang disusun runtut dan menjawab seluruh pertanyaan.',
      });
    }
    steps.push({
      kind: 'WRITE',
      liveLabel: 'Menyusun penjelasan hasil pembacaan berkas…',
      text: 'Menyusun hasil pembacaan & penjelasan ' + fileName,
      sub: 'Saya rangkum hasil pengamatan berkas ke dalam penjelasan yang terstruktur.',
    });
    return steps;
  }

  if (isGreeting) {
    steps.push({
      kind: 'MIND',
      liveLabel: 'Memahami sapaan pengguna…',
      text: 'Memahami sapaan "' + shortQ + '"',
      sub: 'Saya tangkap sapaan pengguna dan menyiapkan respons pembuka untuk membantu kebutuhan berikutnya.',
    });
    steps.push({
      kind: 'SEARCH',
      liveLabel: 'Memeriksa konteks percakapan aktif…',
      text: 'Memeriksa konteks percakapan aktif',
      sub: 'Memastikan alur obrolan siap menerima instruksi atau pertanyaan lanjutan.',
    });
    steps.push({
      kind: 'WRITE',
      liveLabel: 'Menyusun balasan sapaan…',
      text: 'Menyusun balasan sapaan',
    });
    return steps;
  }

  if (isWebBuild) {
    const buildEnt = extractBuildEntities(clean);
    steps.push({
      kind: 'MIND',
      liveLabel: 'Membedah kebutuhan pembuatan "' + shortQ + '"…',
      text: 'Membedah kebutuhan pembuatan "' + shortQ + '"',
      sub: 'Saya identifikasi komponen utama, gaya tampilan, struktur navigasi, serta fitur referensi yang diperlukan.',
      chips: [
        buildEnt.target ? ('Target: ' + buildEnt.target) : ('Proyek: ' + topic.slice(0, 22)),
        buildEnt.ref ? ('Acuan: ' + buildEnt.ref) : 'Pemetaan Fitur Utama',
      ].filter(Boolean),
    });
    steps.push({
      kind: 'TOOL_CODE',
      liveLabel: 'Merancang kerangka halaman & tata letak visual…',
      text: 'Merancang kerangka halaman, tata letak visual, & interaksi',
      sub: 'Menentukan susunan bagian halaman (header, kartu konten, formulir, dan aturan responsif) beserta fungsi interaktifnya.',
    });
    if (isThink) {
      steps.push({
        kind: 'SEARCH',
        liveLabel: 'Meneliti kelengkapan fitur & alur pengguna…',
        text: 'Meneliti kelengkapan fitur & alur pengalaman pengguna',
        sub: 'Saya pastikan setiap komponen yang dirancang saling terhubung dengan rapi dan sesuai spesifikasi yang diminta.',
      });
    }
    steps.push({
      kind: 'WRITE',
      liveLabel: 'Menyusun rancangan kode & penjelasan implementasi…',
      text: 'Menyusun rancangan kode & penjelasan implementasi',
      sub: 'Saya rakit kode lengkap beserta panduan struktur dan bagian-bagian utamanya.',
    });
    return steps;
  }

  if (isSlide) {
    steps.push({
      kind: 'MIND',
      liveLabel: 'Merencanakan alur materi presentasi…',
      text: 'Merencanakan alur materi untuk "' + shortQ + '"',
      sub: 'Saya petakan topik utama ke dalam urutan halaman presentasi dari pembuka, isi bahasan, hingga kesimpulan.',
    });
    steps.push({
      kind: 'SLIDE',
      liveLabel: 'Menyusun struktur tiap halaman slide (.pptx)…',
      text: 'Menyusun struktur judul & poin ringkasan tiap halaman slide (.pptx)',
      sub: 'Membagi materi agar setiap slide memuat poin-poin yang padat dan jelas saat dipresentasikan.',
    });
    if (isThink) {
      steps.push({
        kind: 'SEARCH',
        liveLabel: 'Memeriksa keseimbangan isi antar-slide…',
        text: 'Memeriksa keseimbangan isi & urutan antar-slide',
        sub: 'Saya tinjau kembali alur presentasi agar runtut dan mudah dipahami audiens.',
      });
    }
    steps.push({
      kind: 'WRITE',
      liveLabel: 'Menyelesaikan draf rangkaian slide…',
      text: 'Menyelesaikan draf rangkaian slide presentasi',
    });
    return steps;
  }

  if (isConnect) {
    const connName = /github|repo/i.test(clean)
      ? 'GitHub'
      : (/drive/i.test(clean) ? 'Google Drive' : (/gmail|email|kotak masuk/i.test(clean) ? 'Gmail' : 'Google Calendar'));
    steps.push({
      kind: 'MIND',
      liveLabel: 'Memahami permintaan akses ke ' + connName + '…',
      text: 'Memahami permintaan akses ke ' + connName,
      sub: 'Saya periksa detail data atau tindakan yang perlu dijalankan melalui konektor ' + connName + '.',
    });
    steps.push({
      kind: 'CONNECT',
      liveLabel: 'Menghubungkan ke konektor ' + connName + '…',
      text: 'Menggunakan Konektor ' + connName,
      sub: 'Menghubungkan ke layanan ' + connName + ' untuk membaca atau mengambil informasi yang diminta.',
    });
    steps.push({
      kind: 'WRITE',
      liveLabel: 'Menyusun ringkasan hasil dari ' + connName + '…',
      text: 'Menyusun ringkasan hasil dari ' + connName,
    });
    return steps;
  }

  if (isCode) {
    steps.push({
      kind: 'MIND',
      liveLabel: 'Membedah spesifikasi tugas kode…',
      text: 'Membedah spesifikasi tugas pada "' + shortQ + '"',
      sub: 'Saya analisis kebutuhan fungsi, alur logika, serta struktur berkas kode yang perlu dibuat atau diperbaiki.',
    });
    steps.push({
      kind: 'TOOL_CODE',
      liveLabel: 'Merancang fungsi & memeriksa sintaks kode…',
      text: 'Merancang implementasi fungsi & memeriksa sintaks kode',
      sub: 'Menyusun alur program secara bersih dan memastikan tidak ada kesalahan logika pada kode.',
    });
    if (isThink) {
      steps.push({
        kind: 'SEARCH',
        liveLabel: 'Menguji kasus batas & struktur modul…',
        text: 'Menguji kasus batas & memvalidasi struktur modul',
        sub: 'Saya periksa kembali perilaku fungsi pada berbagai kondisi input agar kode siap dijalankan.',
      });
    }
    steps.push({
      kind: 'WRITE',
      liveLabel: 'Menyusun kode & penjelasan cara kerjanya…',
      text: 'Menyusun kode beserta penjelasan cara kerjanya',
    });
    return steps;
  }

  if (isMath) {
    steps.push({
      kind: 'MIND',
      liveLabel: 'Membedah persoalan & variabel…',
      text: 'Membedah persoalan & variabel pada "' + shortQ + '"',
      sub: 'Saya identifikasi nilai yang diketahui, rumus yang relevan, serta urutan langkah penyelesaiannya.',
    });
    steps.push({
      kind: 'TOOL_MATH',
      liveLabel: 'Menghitung tahapan persamaan…',
      text: 'Menghitung tahapan persamaan & memeriksa ketepatan angka',
      sub: 'Menjalankan operasi perhitungan langkah demi langkah untuk memastikan hasil akhir akurat.',
    });
    if (isThink) {
      steps.push({
        kind: 'SEARCH',
        liveLabel: 'Memverifikasi ulang hasil perhitungan…',
        text: 'Memverifikasi ulang konsistensi hasil perhitungan',
      });
    }
    steps.push({
      kind: 'WRITE',
      liveLabel: 'Menyusun langkah penyelesaian & jawaban akhir…',
      text: 'Menyusun langkah penyelesaian & jawaban akhir',
    });
    return steps;
  }

  // Pertanyaan Umum / Ilmu Pengetahuan / Riset / Analisis
  steps.push({
    kind: 'MIND',
    liveLabel: 'Membedah fokus pertanyaan tentang "' + topic.slice(0, 26) + '"…',
    text: 'Membedah fokus pertanyaan tentang "' + shortQ + '"',
    sub: isThink
      ? ('Saya petakan poin-poin inti mengenai ' + topic + ' yang perlu dijelaskan, mulai dari pengertian dasar, cara kerja/pembagian utama, hingga contoh penerapannya.')
      : ('Saya identifikasi inti informasi mengenai ' + topic + ' yang ditanyakan oleh pengguna.'),
  });

  if (isResearch) {
    steps.push({
      kind: 'WEB_SEARCH',
      liveLabel: 'Menelusuri berbagai sumber web terkait "' + topic.slice(0, 24) + '"…',
      text: 'Menelusuri berbagai sumber web untuk riset "' + topic + '"',
      sub: 'Mencari dan membaca artikel rujukan yang relevan untuk mengumpulkan fakta, definisi, serta data pendukung.',
    });
    steps.push({
      kind: 'SEARCH',
      liveLabel: 'Membandingkan temuan lintas sumber…',
      text: 'Membandingkan temuan & menyusun poin perbandingan "' + topic + '"',
      sub: 'Saya kelompokkan informasi dari berbagai sumber agar dapat disajikan secara sistematis dan mudah dibaca.',
    });
  } else if (isWeb) {
    steps.push({
      kind: 'WEB_SEARCH',
      liveLabel: 'Menelusuri rujukan web tentang "' + topic.slice(0, 24) + '"…',
      text: 'Menelusuri sumber informasi web tentang "' + topic + '"',
      sub: 'Mencari rujukan terbaru di web yang berkaitan langsung dengan pertanyaan pengguna.',
    });
  } else {
    steps.push({
      kind: 'SEARCH',
      liveLabel: 'Menelusuri konsep & referensi terkait "' + topic.slice(0, 24) + '"…',
      text: 'Menelusuri konsep utama & referensi terkait "' + topic + '"',
      sub: isThink
        ? ('Mengumpulkan informasi kunci, karakteristik utama, serta contoh nyata yang relevan dengan ' + topic + '.')
        : ('Menyiapkan poin-poin penjelasan utama mengenai ' + topic + '.'),
    });
  }

  if (isThink && !isResearch) {
    steps.push({
      kind: 'TOOL_CODE',
      liveLabel: 'Menyusun alur pembahasan & memeriksa kelengkapan…',
      text: 'Menyusun alur pembahasan & memeriksa kelengkapan argumen',
      sub: 'Saya susun urutan penjelasan dari konsep dasar hingga rincian mendalam agar terstruktur dan tidak ada bagian yang terlewat.',
    });
  }

  steps.push({
    kind: 'WRITE',
    liveLabel: 'Menyusun jawaban mengenai "' + topic.slice(0, 26) + '"…',
    text: 'Menyusun jawaban mengenai "' + topic + '"',
    sub: 'Merangkai hasil pemetaan menjadi penjelasan yang jelas dan mudah dipahami.',
  });

  return steps;
}

export function mountThought(container, thoughts, status) {
  if (!container || !thoughts || !thoughts.length) return null;
  if (!container.dataset.thoughtStart) container.dataset.thoughtStart = String(Date.now());
  const started = Number(container.dataset.thoughtStart) || Date.now();
  const running = status === 'berjalan';

  const prevTimer = Number(container.dataset.thoughtTimerId) || 0;
  if (prevTimer) {
    clearInterval(prevTimer);
    delete container.dataset.thoughtTimerId;
  }
  if (container._onNeuralStep && typeof window !== 'undefined') {
    window.removeEventListener('rategoan:neural-step', container._onNeuralStep);
    delete container._onNeuralStep;
  }

  const prevBox = container.querySelector(':scope > .thought-accordion');
  if (prevBox) prevBox.remove();

  const box = document.createElement('details');
  box.className = 'thought-accordion' + (running ? ' running' : ' completed');
  box.open = container.dataset.userOpened === '1';
  box.addEventListener('toggle', () => {
    container.dataset.userOpened = box.open ? '1' : '0';
  });

  const initialActive = running ? Math.min(thoughts.length - 1, Number(container.dataset.thoughtActiveIdx) || 0) : thoughts.length;

  const summary = document.createElement('summary');
  summary.className = 'thought-summary';

  const dot = document.createElement('span');
  dot.className = 'zen-dot thought-dot' + (running ? ' is-pulsing' : ' is-done');
  dot.setAttribute('aria-hidden', 'true');

  const resolveLiveSummaryText = (idx) => {
    if (!running) return LEGACY_STATUS_FALLBACK.completed;
    const st = thoughts[idx] || thoughts[0];
    if (st && st.liveLabel) return String(st.liveLabel);
    if (st && st.text) {
      const t = String(st.text).trim();
      return (t.length > 48 ? t.slice(0, 48) + '…' : t + '…');
    }
    return LEGACY_STATUS_FALLBACK.running;
  };

  const label = document.createElement('span');
  label.className = 'thought-summary-label' + (running ? ' is-live-text' : '');
  label.textContent = resolveLiveSummaryText(initialActive);

  const chev = document.createElement('span');
  chev.className = 'thought-chevron';
  chev.setAttribute('aria-hidden', 'true');
  chev.innerHTML = CHEVRON_SVG;

  summary.appendChild(dot);
  summary.appendChild(label);
  summary.appendChild(chev);

  const list = document.createElement('ol');
  list.className = 'agentic-stepper';
  const nodes = [];

  thoughts.forEach((step, index) => {
    const lane = laneOf(step);
    const isImg = lane === 'file' && /citra|foto|gambar|ocr|jpg|png|webp/i.test((step && step.text) || '');
    const stateClass = !running
      ? ' is-done'
      : (index < initialActive ? ' is-done' : (index === initialActive ? ' is-live' : ' is-pending'));
    const li = document.createElement('li');
    li.className = 'stepper-node lane-' + lane + stateClass;

    const railCol = document.createElement('div');
    railCol.className = 'stepper-rail-col';
    const orb = document.createElement('span');
    orb.className = 'stepper-orb';
    orb.innerHTML = isImg ? ORB.image : (ORB[lane] || ORB.mind);
    const line = document.createElement('span');
    line.className = 'stepper-rail-line';
    line.setAttribute('aria-hidden', 'true');
    railCol.appendChild(orb);
    if (index < thoughts.length - 1) {
      railCol.appendChild(line);
    }

    const bodyCol = document.createElement('div');
    bodyCol.className = 'stepper-body';

    const copy = document.createElement('span');
    copy.className = 'stepper-copy';
    copy.textContent = (step && step.text) || 'Memproses langkah kerja';
    bodyCol.appendChild(copy);

    if (step && step.sub && String(step.sub).trim()) {
      const sub = document.createElement('p');
      sub.className = 'stepper-sub';
      sub.textContent = String(step.sub).trim();
      bodyCol.appendChild(sub);
    }

    li.appendChild(railCol);
    li.appendChild(bodyCol);
    list.appendChild(li);
    nodes.push({ li, lane, copy, step });
  });

  const applyActiveStep = (activeIdx) => {
    const clamped = Math.max(0, Math.min(thoughts.length - 1, activeIdx | 0));
    const prevIdx = Number(container.dataset.thoughtActiveIdx) || 0;
    container.dataset.thoughtActiveIdx = String(clamped);
    for (let i = 0; i < nodes.length; i += 1) {
      const state = i < clamped ? ' is-done' : (i === clamped ? ' is-live' : ' is-pending');
      nodes[i].li.className = 'stepper-node lane-' + nodes[i].lane + state;
    }
    const nextSummaryText = resolveLiveSummaryText(clamped);
    if (label.textContent !== nextSummaryText || clamped !== prevIdx) {
      label.classList.remove('is-switching');
      void label.offsetWidth;
      label.textContent = nextSummaryText;
      label.classList.add('is-switching');
    }
  };

  if (running && typeof window !== 'undefined') {
    const onNeuralStep = (ev) => {
      const d = (ev && ev.detail) || {};
      const done = Number(d.doneLayers) || 0;
      const total = Math.max(1, Number(d.totalLayers) || 28);
      const ratio = Math.max(0, Math.min(0.999, done / total));
      const layerIdx = Math.floor(ratio * thoughts.length);
      const curIdx = Number(container.dataset.thoughtActiveIdx) || 0;
      if (layerIdx > curIdx) applyActiveStep(layerIdx);
    };
    container._onNeuralStep = onNeuralStep;
    window.addEventListener('rategoan:neural-step', onNeuralStep);
  }

  if (running && typeof setInterval === 'function') {
    const tid = setInterval(() => {
      if (!box.isConnected) {
        clearInterval(tid);
        if (container._onNeuralStep && typeof window !== 'undefined') {
          window.removeEventListener('rategoan:neural-step', container._onNeuralStep);
          delete container._onNeuralStep;
        }
        return;
      }
      const nowSec = Math.max(0.1, (Date.now() - started) / 1000);
      const timeIdx = Math.min(thoughts.length - 1, Math.floor(nowSec / 1.3));
      const curIdx = Number(container.dataset.thoughtActiveIdx) || 0;
      if (timeIdx > curIdx) applyActiveStep(timeIdx);
    }, 120);
    container.dataset.thoughtTimerId = String(tid);
  }

  box.appendChild(summary);
  box.appendChild(list);
  container.insertBefore(box, container.firstChild);
  return box;
}
