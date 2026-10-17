const ORB = {
  mind: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>',
  web: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg>',
  file: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>',
  image: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
  tool: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><polyline points="8 10 11 12.5 8 15"/><line x1="13" y1="15" x2="16" y2="15"/></svg>',
  connect: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  slide: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8"/><path d="M12 16v4"/></svg>',
  search: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.2" y2="16.2"/></svg>',
  check: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
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
  if (k === 'CHECK') return 'check';
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
      target: refMatch[1].trim().slice(0, 32),
      ref: refMatch[2].trim().slice(0, 32),
    };
  }
  const appMatch = clean.match(/(?:buat(?:kan)?|bikin|rancang)\s+(?:saya\s+)?(aplikasi|app|website|web|situs|landing\s*page|dashboard|toko(?:\s*online)?|jadwal(?:\s*perjalanan)?|itinerary|program|alat)(?:\s+([^,.?!]+))?/i);
  if (appMatch) {
    const label = [appMatch[1], appMatch[2] || ''].join(' ').trim().slice(0, 36);
    return { target: label, ref: '' };
  }
  return { target: '', ref: '' };
}

export function buildDynamicThoughts(query, opts) {
  const clean = String(query || '').replace(/\s+/g, ' ').trim();
  const lower = clean.toLowerCase();
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

  const isWebBuild = /\b(website|web|situs|landing\s*page|aplikasi|app|toko\s*online|dashboard|portofolio|html|css|jadwal\s*perjalanan|itinerary)\b/i.test(clean) || (/\b(buatkan|bikin|rancang)\b/i.test(clean) && /\b(aplikasi|web|html)\b/i.test(clean));
  const isCode = isWebBuild || /\b(kode|code|fungsi|function|script|python|js|bug|komponen|perbaiki|edit|ubah)\b/i.test(clean);
  const isSlide = /\b(slide|presentasi|powerpoint|pptx|deck)\b/i.test(clean);
  const isChartOrDiagram = /\b(grafik|chart|diagram|flowchart|bagan)\b/i.test(clean);
  const isConnect = !isWebBuild && !isCode && /\b(github|repo|drive|gmail|email|kotak masuk|kalender|calendar)\b/i.test(clean);
  const isMath = /\b(hitung|rumus|integral|turunan|matriks|persamaan|\d+\s*[+*^/-]\s*\d+)\b/i.test(clean);
  const isGreeting = /^(ha+l+o+|he+l+o+|hai+|hi+|hei+|hey+|p|pagi|siang|sore|malam|selamat\s+(pagi|siang|sore|malam)|assalamu'?alaikum|permisi|tes|test|ping|apa\s+kabar)\b/i.test(clean) && clean.split(/\s+/).length <= 5;

  const isPhysics = /\b(fisika|mekanika|termodinamika|relativitas|optik|kuantum|kinematika|gravitasi)\b/i.test(lower);
  const isBiology = /\b(biologi|hayati|organisme|sel|genetika|ekosistem|zoologi|botani|fisiologi)\b/i.test(lower);
  const isMathTopic = !isMath && /\b(matematika|aljabar|geometri|kalkulus|trigonometri|statistika|aritmetika)\b/i.test(lower);

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
        kind: 'CHECK',
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
    const targetDesc = buildEnt.target || topic;
    const hasItinerary = /\b(jadwal|itinerary|perjalanan|agenda)\b/i.test(clean);

    steps.push({
      kind: 'MIND',
      liveLabel: 'Membedah kebutuhan pembuatan "' + shortQ + '"…',
      text: 'Membedah kebutuhan pembuatan "' + shortQ + '"',
      sub: buildEnt.ref
        ? ('Saya identifikasi komponen utama, gaya tampilan, struktur navigasi, serta fitur referensi yang diperlukan.')
        : hasItinerary
        ? ('Saya petakan kebutuhan modul jadwal perjalanan: input destinasi, linimasa waktu, daftar kegiatan, dan kartu tampilan.')
        : ('Saya petakan kebutuhan struktur ' + targetDesc + ': komponen utama, tata letak antarmuka, dan alur interaksinya.'),
      chips: [
        buildEnt.target ? ('Target: ' + buildEnt.target) : ('Proyek: ' + topic.slice(0, 22)),
        buildEnt.ref ? ('Acuan: ' + buildEnt.ref) : 'Struktur Modul',
      ].filter(Boolean),
    });
    steps.push({
      kind: 'TOOL_CODE',
      liveLabel: 'Merancang kerangka halaman & tata letak visual…',
      text: 'Merancang kerangka halaman, tata letak visual, & interaksi',
      sub: hasItinerary
        ? 'Menyusun kerangka HTML5 semantik, penataan jadwal berbasis linimasa, serta gaya CSS yang rapi dan responsif.'
        : 'Menentukan susunan bagian halaman (header, kartu konten, formulir, dan aturan responsif) beserta fungsi interaktifnya.',
    });
    if (isThink) {
      steps.push({
        kind: 'SEARCH',
        liveLabel: 'Meneliti kelengkapan fitur & alur pengguna…',
        text: 'Meneliti kelengkapan fitur & alur pengalaman pengguna',
        sub: hasItinerary
          ? 'Memastikan alur penambahan kegiatan, penanda waktu, dan keterbacaan jadwal perjalanan berjalan dengan lancar.'
          : 'Saya pastikan setiap komponen yang dirancang saling terhubung dengan rapi dan sesuai spesifikasi yang diminta.',
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

  if (isChartOrDiagram) {
    steps.push({
      kind: 'MIND',
      liveLabel: 'Memetakan pasangan data & kategori visualisasi…',
      text: 'Memetakan pasangan data & kategori pada "' + shortQ + '"',
      sub: 'Saya ekstrak label kategori, nilai numerik, serta jenis visualisasi yang paling tepat untuk menyajikan data tersebut.',
    });
    steps.push({
      kind: 'SLIDE',
      liveLabel: 'Merancang skala sumbu & merender kanvas vektor SVG…',
      text: 'Merancang skala proporsional & merender kanvas vektor SVG',
      sub: 'Menghitung proporsi tinggi batang/kurva, garis bantu, dan label nilai secara presisi ke dalam grafik SVG.',
    });
    if (isThink) {
      steps.push({
        kind: 'CHECK',
        liveLabel: 'Memeriksa keterbacaan label & akurasi angka…',
        text: 'Memeriksa keterbacaan label & ketepatan proporsi angka',
        sub: 'Memastikan seluruh kategori dan angka tampil utuh tanpa tumpang tindih.',
      });
    }
    steps.push({
      kind: 'WRITE',
      liveLabel: 'Menyajikan kartu grafik interaktif di ruang obrolan…',
      text: 'Menyajikan kartu grafik interaktif siap unduh (.svg)',
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

  if (isPhysics) {
    steps.push({
      kind: 'MIND',
      liveLabel: 'Membedah ruang lingkup ilmu fisika…',
      text: 'Membedah ruang lingkup materi ilmu fisika',
      sub: 'Saya petakan konsep dasar fisika: hukum alam, interaksi materi dan energi, mekanika gerak, serta prinsip keteraturan alam.',
    });
    steps.push({
      kind: 'SEARCH',
      liveLabel: 'Menelusuri cabang fisika & contoh penerapannya…',
      text: 'Menelusuri cabang fisika klasik & modern serta contoh terapannya',
      sub: 'Mengelompokkan cabang utama (mekanika, termodinamika, elektromagnetisme, dan fisika modern) beserta aplikasinya dalam teknologi.',
    });
    if (isThink) {
      steps.push({
        kind: 'CHECK',
        liveLabel: 'Menyusun kerangka penjelasan ilmiah fisika…',
        text: 'Menyusun alur pembahasan ilmiah & memverifikasi ketepatan konsep',
        sub: 'Menyusun sistematika penjelasan dari definisi, prinsip kunci, hingga manfaat nyata ilmu fisika agar terstruktur utuh.',
      });
    }
    steps.push({
      kind: 'WRITE',
      liveLabel: 'Menyusun jawaban mengenai ilmu fisika…',
      text: 'Menyusun jawaban komprehensif mengenai ilmu fisika',
      sub: 'Merangkai penjelasan yang jernih, runtut, dan mudah dipahami.',
    });
    return steps;
  }

  if (isBiology) {
    steps.push({
      kind: 'MIND',
      liveLabel: 'Membedah ruang lingkup ilmu biologi…',
      text: 'Membedah ruang lingkup materi ilmu pengetahuan biologi',
      sub: 'Saya petakan konsep dasar biologi: karakteristik makhluk hidup, tingkatan sel, genetika, serta interaksi dalam ekosistem.',
    });
    steps.push({
      kind: 'SEARCH',
      liveLabel: 'Menelusuri cabang biologi & perannya bagi kehidupan…',
      text: 'Menelusuri pembagian cabang biologi & peranannya bagi kehidupan',
      sub: 'Menguraikan ruang lingkup biologi (anatomi, fisiologi, ekologi, mikrobiologi) serta kontribusinya bagi kesehatan dan lingkungan.',
    });
    if (isThink) {
      steps.push({
        kind: 'CHECK',
        liveLabel: 'Menyusun kerangka penjelasan biologi…',
        text: 'Menyusun alur pembahasan terstruktur mengenai keanekaragaman hayati',
        sub: 'Menyelaraskan urutan bahasan agar definisi, proses kehidupan, dan contoh nyata tersaji secara ilmiah dan mudah dipahami.',
      });
    }
    steps.push({
      kind: 'WRITE',
      liveLabel: 'Menyusun jawaban mengenai ilmu biologi…',
      text: 'Menyusun jawaban komprehensif mengenai ilmu pengetahuan biologi',
      sub: 'Merangkai penjelasan yang terstruktur, padat, dan jelas.',
    });
    return steps;
  }

  if (isMathTopic) {
    steps.push({
      kind: 'MIND',
      liveLabel: 'Membedah ruang lingkup ilmu matematika…',
      text: 'Membedah ruang lingkup materi ilmu matematika',
      sub: 'Saya petakan pilar dasar matematika: penalaran logis, hubungan kuantitatif, struktur bilangan, aljabar, dan geometri.',
    });
    steps.push({
      kind: 'SEARCH',
      liveLabel: 'Menelusuri cabang matematika & aplikasi praktisnya…',
      text: 'Menelusuri cabang utama matematika & penerapannya dalam sains',
      sub: 'Menguraikan fungsi matematika sebagai bahasa ilmu pengetahuan serta kegunaannya dalam teknologi dan kehidupan sehari-hari.',
    });
    if (isThink) {
      steps.push({
        kind: 'CHECK',
        liveLabel: 'Menyusun alur pembahasan konsep matematika…',
        text: 'Menyusun alur pembahasan konsep dari teori dasar hingga penerapan',
        sub: 'Memastikan penjelasan terstruktur rapi dari pengertian dasar, cabang ilmu, hingga contoh peran matematika.',
      });
    }
    steps.push({
      kind: 'WRITE',
      liveLabel: 'Menyusun jawaban mengenai ilmu matematika…',
      text: 'Menyusun jawaban komprehensif mengenai ilmu matematika',
      sub: 'Merangkai penjelasan yang runtut, jernih, dan mudah dipahami.',
    });
    return steps;
  }

  steps.push({
    kind: 'MIND',
    liveLabel: 'Membedah fokus pertanyaan tentang "' + topic.slice(0, 26) + '"…',
    text: 'Membedah fokus pertanyaan tentang "' + shortQ + '"',
    sub: isThink
      ? ('Saya petakan poin-poin inti mengenai ' + topic + ' yang perlu dijelaskan secara terstruktur.')
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
      kind: 'CHECK',
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

  const prevBox = container.querySelector(':scope > .thought-accordion');
  if (prevBox) {
    const prevNodes = prevBox.querySelectorAll('.stepper-node');
    if (prevNodes.length === thoughts.length) {
      if (!running) {
        const prevTimer = Number(container.dataset.thoughtTimerId) || 0;
        if (prevTimer) {
          clearInterval(prevTimer);
          delete container.dataset.thoughtTimerId;
        }
        if (container._onNeuralStep && typeof window !== 'undefined') {
          window.removeEventListener('rategoan:neural-step', container._onNeuralStep);
          delete container._onNeuralStep;
        }
      }
      prevBox.className = 'thought-accordion' + (running ? ' running' : ' completed');
      const prevDot = prevBox.querySelector('.thought-dot');
      if (prevDot) prevDot.className = 'zen-dot thought-dot' + (running ? ' is-pulsing' : ' is-done');
      const curActive = running ? Math.min(thoughts.length - 1, Number(container.dataset.thoughtActiveIdx) || 0) : thoughts.length;
      prevNodes.forEach((li, idx) => {
        const step = thoughts[idx];
        const lane = laneOf(step);
        const stClass = !running ? ' is-done' : (idx < curActive ? ' is-done' : (idx === curActive ? ' is-live' : ' is-pending'));
        li.className = 'stepper-node lane-' + lane + stClass;
        const subEl = li.querySelector('.stepper-sub');
        if (step && step.sub && subEl) subEl.textContent = String(step.sub).trim();
      });
      return prevBox;
    }
    prevBox.remove();
  }

  const prevTimer = Number(container.dataset.thoughtTimerId) || 0;
  if (prevTimer) {
    clearInterval(prevTimer);
    delete container.dataset.thoughtTimerId;
  }
  if (container._onNeuralStep && typeof window !== 'undefined') {
    window.removeEventListener('rategoan:neural-step', container._onNeuralStep);
    delete container._onNeuralStep;
  }

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

  const label = document.createElement('span');
  label.className = 'thought-summary-label';
  label.textContent = LEGACY_STATUS_FALLBACK.completed;

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
    container.dataset.thoughtActiveIdx = String(clamped);
    for (let i = 0; i < nodes.length; i += 1) {
      const state = i < clamped ? ' is-done' : (i === clamped ? ' is-live' : ' is-pending');
      nodes[i].li.className = 'stepper-node lane-' + nodes[i].lane + state;
    }
  };

  if (running && typeof window !== 'undefined') {
    const onNeuralStep = (ev) => {
      const d = (ev && ev.detail) || {};
      const done = Number(d.doneLayers) || 0;
      const total = Math.max(1, Number(d.totalLayers) || 28);
      const ratio = Math.max(0, Math.min(0.999, done / total));
      const layerIdx = Math.min(thoughts.length - 1, Math.floor(ratio * thoughts.length));
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
      const timeIdx = Math.min(thoughts.length - 1, Math.floor(nowSec / 0.7));
      const curIdx = Number(container.dataset.thoughtActiveIdx) || 0;
      if (timeIdx > curIdx) applyActiveStep(timeIdx);
    }, 150);
    container.dataset.thoughtTimerId = String(tid);
  }

  box.appendChild(summary);
  box.appendChild(list);
  container.insertBefore(box, container.firstChild);
  return box;
}
