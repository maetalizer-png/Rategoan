const ORB = {
  mind: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>',
  search: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.2" y2="16.2"/></svg>',
  analysis: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  verify: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>',
  web: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg>',
  file: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>',
  image: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
  arch: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
  tool: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><polyline points="8 10 11 12.5 8 15"/><line x1="13" y1="15" x2="16" y2="15"/></svg>',
  connect: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  slide: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8"/><path d="M12 16v4"/></svg>',
  write: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
};

// Taksonomi 12 Tahap Penalaran & Eksekusi AI Modern Rategoan
const STAGE_META = {
  PEMAHAMAN_INTI: { label: 'PEMAHAMAN INTI', tone: 'mind', icon: 'mind', live: 'Memahami maksud & fokus permintaan…' },
  PEMETAAN_REFERENSI: { label: 'PEMETAAN REFERENSI', tone: 'search', icon: 'search', live: 'Menelusuri konsep & referensi…' },
  PENALARAN_ANALISIS: { label: 'PENALARAN & ANALISIS', tone: 'analysis', icon: 'analysis', live: 'Menganalisis struktur & alur logika…' },
  VERIFIKASI_VALIDASI: { label: 'VERIFIKASI & VALIDASI', tone: 'verify', icon: 'verify', live: 'Memverifikasi kelengkapan & ketepatan…' },
  PENELUSURAN_WEB: { label: 'PENELUSURAN WEB', tone: 'web', icon: 'web', live: 'Menelusuri & membaca rujukan web…' },
  SINTESIS_SUMBER: { label: 'SINTESIS LINTAS SUMBER', tone: 'analysis', icon: 'analysis', live: 'Membandingkan temuan lintas sumber…' },
  INSPEKSI_CITRA: { label: 'INSPEKSI VISUAL & CITRA', tone: 'image', icon: 'image', live: 'Mengamati detail visual gambar…' },
  BEDAH_BERKAS: { label: 'PEMBEDAHAN BERKAS & ARSIP', tone: 'file', icon: 'file', live: 'Membuka & membaca isi berkas…' },
  PERANCANGAN_ARSITEKTUR: { label: 'PERANCANGAN ARSITEKTUR', tone: 'arch', icon: 'arch', live: 'Merancang tata letak & arsitektur…' },
  REKAYASA_KODE: { label: 'REKAYASA LOGIKA & KODE', tone: 'tool', icon: 'tool', live: 'Menyusun kode & logika program…' },
  SINKRONISASI_KONEKTOR: { label: 'SINKRONISASI KONEKTOR', tone: 'connect', icon: 'connect', live: 'Menghubungkan ke layanan konektor…' },
  STRUKTUR_SLIDE: { label: 'STRUKTUR PRESENTASI', tone: 'slide', icon: 'slide', live: 'Menyusun kerangka tiap halaman slide…' },
  PENYUSUNAN_JAWABAN: { label: 'PENYUSUNAN JAWABAN', tone: 'write', icon: 'write', live: 'Menyusun jawaban akhir…' },
};

const LEGACY_STATUS_FALLBACK = {
  running: 'Sedang berpikir…',
  done: 'Berpikir selama ',
  completed: 'Proses berpikir',
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

function resolveStageMeta(step) {
  if (step && step.stage && STAGE_META[step.stage]) {
    return STAGE_META[step.stage];
  }
  const lane = laneOf(step);
  const txt = String((step && step.text) || '').toLowerCase();
  if (lane === 'file' && /citra|foto|gambar|ocr|jpg|png|webp/i.test(txt)) return STAGE_META.INSPEKSI_CITRA;
  if (lane === 'file') return STAGE_META.BEDAH_BERKAS;
  if (lane === 'web') return STAGE_META.PENELUSURAN_WEB;
  if (lane === 'connect') return STAGE_META.SINKRONISASI_KONEKTOR;
  if (lane === 'slide') return STAGE_META.STRUKTUR_SLIDE;
  if (lane === 'tool' && /kerangka halaman|tata letak|arsitektur|desain/i.test(txt)) return STAGE_META.PERANCANGAN_ARSITEKTUR;
  if (lane === 'tool') return STAGE_META.REKAYASA_KODE;
  if (lane === 'search' && /verifikasi|validasi|kelengkapan|keseimbangan|uji/i.test(txt)) return STAGE_META.VERIFIKASI_VALIDASI;
  if (lane === 'search' && /bandingkan|sintesis/i.test(txt)) return STAGE_META.SINTESIS_SUMBER;
  if (lane === 'search') return STAGE_META.PEMETAAN_REFERENSI;
  if (lane === 'write') return STAGE_META.PENYUSUNAN_JAWABAN;
  if (/alur pembahasan|menyelaraskan|kerangka/i.test(txt)) return STAGE_META.PENALARAN_ANALISIS;
  return STAGE_META.PEMAHAMAN_INTI;
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
        stage: 'INSPEKSI_CITRA',
        liveLabel: 'Mengamati gambar ' + fileName + '…',
        text: 'Membuka & mengamati gambar ' + fileName,
        sub: 'Saya buka berkas gambar (' + dimInfo + ') untuk memeriksa tampilan visual, objek, serta tulisan yang ada di dalamnya.',
        chips: [fileName, pxMatch ? pxMatch[0] : ((fileMeta && fileMeta.sizeLabel) || 'Citra Visual'), 'Inspeksi Tampilan'].filter(Boolean),
      });
      steps.push({
        kind: 'SEARCH',
        stage: 'PEMETAAN_REFERENSI',
        liveLabel: 'Mengekstrak informasi visual dari gambar…',
        text: 'Membedah isi visual & mengekstrak informasi dari gambar',
        sub: colorInfo
          ? ('Mengamati komposisi visual (' + colorInfo + ') dan mencatat detail penting' + (!isGenericAttach ? (' terkait "' + topic + '".') : ' pada gambar.'))
          : ('Mencatat detail tampilan, tata letak, dan informasi teks yang tampak pada ' + fileName + '.'),
        chips: [
          colorInfo ? colorInfo.replace(/^Warna dominan:\s*/i, 'Palet: ').slice(0, 38) : 'Komposisi Visual',
          !isGenericAttach ? ('Fokus: ' + topic.slice(0, 24)) : 'Ekstraksi Teks & Objek',
        ].filter(Boolean),
      });
    } else if (isZipFile) {
      const zipStat = (fileMeta && fileMeta.statusLabel) || (fileMeta && fileMeta.sizeLabel) || 'paket berkas';
      steps.push({
        kind: 'FILE',
        stage: 'BEDAH_BERKAS',
        liveLabel: 'Membuka paket arsip ' + fileName + '…',
        text: 'Membuka & membaca paket arsip ' + fileName,
        sub: 'Saya buka arsip ZIP (' + zipStat + ') untuk memetakan struktur folder dan daftar berkas di dalamnya.',
        chips: [fileName, zipStat, 'Pemetaan Direktori'],
      });
      steps.push({
        kind: 'SEARCH',
        stage: 'REKAYASA_KODE',
        liveLabel: 'Memeriksa modul & berkas utama di dalam arsip…',
        text: 'Memeriksa isi berkas utama di dalam arsip',
        sub: 'Saya baca berkas-berkas kunci di dalam arsip untuk memahami alur kode, struktur proyek, dan bagian yang perlu dibedah.',
        chips: ['Inspeksi Modul Utama', !isGenericAttach ? ('Target: ' + topic.slice(0, 24)) : 'Analisis Struktur Proyek'],
      });
    } else if (isPdfFile) {
      const pdfStat = (fileMeta && fileMeta.statusLabel) || (fileMeta && fileMeta.sizeLabel) || 'dokumen';
      steps.push({
        kind: 'FILE',
        stage: 'BEDAH_BERKAS',
        liveLabel: 'Membaca isi dokumen ' + fileName + '…',
        text: 'Membaca dokumen ' + fileName,
        sub: 'Saya buka dokumen PDF (' + pdfStat + ') dan memeriksa isi tiap halamannya.',
        chips: [fileName, pdfStat, 'Pembacaan Halaman'],
      });
      steps.push({
        kind: 'SEARCH',
        stage: 'PEMETAAN_REFERENSI',
        liveLabel: 'Mengambil poin-poin inti dari dokumen…',
        text: 'Mengambil poin-poin inti dari isi dokumen',
        sub: 'Menyeleksi informasi utama dan fakta penting dari dalam dokumen agar ringkas dan akurat.',
        chips: ['Ekstraksi Intisari', !isGenericAttach ? ('Topik: ' + topic.slice(0, 24)) : 'Pokok Bahasan'],
      });
    } else {
      const docStat = (fileMeta && fileMeta.statusLabel) || (fileMeta && fileMeta.sizeLabel) || 'lampiran';
      steps.push({
        kind: 'FILE',
        stage: 'BEDAH_BERKAS',
        liveLabel: 'Membaca berkas ' + fileName + '…',
        text: 'Membaca berkas ' + fileName,
        sub: 'Saya periksa isi berkas (' + docStat + ') untuk memahami struktur dan datanya.',
        chips: [fileName, docStat],
      });
      steps.push({
        kind: 'SEARCH',
        stage: 'PEMETAAN_REFERENSI',
        liveLabel: 'Memetakan bagian penting di dalam berkas…',
        text: 'Memetakan bagian penting di dalam ' + fileName,
        sub: !isGenericAttach
          ? ('Mencari bagian berkas yang berkaitan langsung dengan "' + topic + '".')
          : 'Merangkum pokok-pokok isi berkas agar mudah dipahami.',
        chips: [!isGenericAttach ? ('Fokus: ' + topic.slice(0, 24)) : 'Ringkasan Isi Berkas'],
      });
    }
    if (isThink) {
      steps.push({
        kind: 'MIND',
        stage: 'VERIFIKASI_VALIDASI',
        liveLabel: 'Menyelaraskan temuan berkas dengan instruksi…',
        text: 'Menyelaraskan temuan berkas dengan permintaan pengguna',
        sub: 'Saya periksa kembali hasil pembacaan berkas agar penjelasan yang disusun runtut dan menjawab seluruh pertanyaan.',
        chips: ['Verifikasi Konteks', 'Kesesuaian Isi'],
      });
    }
    steps.push({
      kind: 'WRITE',
      stage: 'PENYUSUNAN_JAWABAN',
      liveLabel: 'Menyusun penjelasan hasil pembacaan berkas…',
      text: 'Menyusun hasil pembacaan & penjelasan ' + fileName,
      sub: 'Saya rangkum hasil pengamatan berkas ke dalam penjelasan yang terstruktur.',
      chips: ['Penyusunan Ringkasan', fileName],
    });
    return steps;
  }

  if (isGreeting) {
    steps.push({
      kind: 'MIND',
      stage: 'PEMAHAMAN_INTI',
      liveLabel: 'Memahami sapaan pengguna…',
      text: 'Memahami sapaan "' + shortQ + '"',
      sub: 'Saya tangkap sapaan pengguna dan menyiapkan respons pembuka untuk membantu kebutuhan berikutnya.',
      chips: ['Sapaan Pengguna', 'Siap Membantu'],
    });
    steps.push({
      kind: 'SEARCH',
      stage: 'PEMETAAN_REFERENSI',
      liveLabel: 'Memeriksa konteks percakapan aktif…',
      text: 'Memeriksa konteks percakapan aktif',
      sub: 'Memastikan alur obrolan siap menerima instruksi atau pertanyaan lanjutan.',
    });
    steps.push({
      kind: 'WRITE',
      stage: 'PENYUSUNAN_JAWABAN',
      liveLabel: 'Menyusun balasan sapaan…',
      text: 'Menyusun balasan sapaan',
    });
    return steps;
  }

  if (isWebBuild) {
    const buildEnt = extractBuildEntities(clean);
    steps.push({
      kind: 'MIND',
      stage: 'PEMAHAMAN_INTI',
      liveLabel: 'Membedah spesifikasi & referensi pembuatan…',
      text: 'Membedah kebutuhan pembuatan "' + shortQ + '"',
      sub: 'Saya identifikasi komponen utama, gaya tampilan, struktur navigasi, serta fitur referensi yang diperlukan.',
      chips: [
        buildEnt.target ? ('Target: ' + buildEnt.target) : ('Proyek: ' + topic.slice(0, 22)),
        buildEnt.ref ? ('Acuan: ' + buildEnt.ref) : 'Pemetaan Fitur Utama',
        'Struktur Halaman',
      ].filter(Boolean),
    });
    steps.push({
      kind: 'TOOL_CODE',
      stage: 'PERANCANGAN_ARSITEKTUR',
      liveLabel: 'Merancang kerangka halaman & tata letak visual…',
      text: 'Merancang kerangka halaman, tata letak visual, & interaksi',
      sub: 'Menentukan susunan bagian halaman (header, kartu konten, formulir, dan aturan responsif) beserta fungsi interaktifnya.',
      chips: ['Kerangka HTML5', 'Tata Letak CSS Responsif', 'Interaksi Antarmuka'],
    });
    if (isThink) {
      steps.push({
        kind: 'SEARCH',
        stage: 'VERIFIKASI_VALIDASI',
        liveLabel: 'Meneliti kelengkapan fitur & alur pengguna…',
        text: 'Meneliti kelengkapan fitur & alur pengalaman pengguna',
        sub: 'Saya pastikan setiap komponen yang dirancang saling terhubung dengan rapi dan sesuai spesifikasi yang diminta.',
        chips: ['Audit Komponen', buildEnt.ref ? ('Kesesuaian Gaya ' + buildEnt.ref) : 'Uji Responsivitas'],
      });
    }
    steps.push({
      kind: 'WRITE',
      stage: 'PENYUSUNAN_JAWABAN',
      liveLabel: 'Merakit kode & menyusun penjelasan implementasi…',
      text: 'Menyusun rancangan kode & penjelasan implementasi',
      sub: 'Saya rakit kode lengkap beserta panduan struktur dan bagian-bagian utamanya.',
      chips: ['Perakitan Kode', 'Panduan Struktur'],
    });
    return steps;
  }

  if (isSlide) {
    steps.push({
      kind: 'MIND',
      stage: 'PEMAHAMAN_INTI',
      liveLabel: 'Merencanakan alur materi presentasi…',
      text: 'Merencanakan alur materi untuk "' + shortQ + '"',
      sub: 'Saya petakan topik utama ke dalam urutan halaman presentasi dari pembuka, isi bahasan, hingga kesimpulan.',
      chips: ['Topik: ' + topic.slice(0, 24), 'Alur Presentasi'],
    });
    steps.push({
      kind: 'SLIDE',
      stage: 'STRUKTUR_SLIDE',
      liveLabel: 'Menyusun struktur tiap halaman slide (.pptx)…',
      text: 'Menyusun struktur judul & poin ringkasan tiap halaman slide (.pptx)',
      sub: 'Membagi materi agar setiap slide memuat poin-poin yang padat dan jelas saat dipresentasikan.',
      chips: ['Dek Slide (.pptx)', 'Poin Tiap Halaman'],
    });
    if (isThink) {
      steps.push({
        kind: 'SEARCH',
        stage: 'VERIFIKASI_VALIDASI',
        liveLabel: 'Memeriksa keseimbangan isi antar-slide…',
        text: 'Memeriksa keseimbangan isi & urutan antar-slide',
        sub: 'Saya tinjau kembali alur presentasi agar runtut dan mudah dipahami audiens.',
        chips: ['Kepadatan Materi', 'Urutan Narasi'],
      });
    }
    steps.push({
      kind: 'WRITE',
      stage: 'PENYUSUNAN_JAWABAN',
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
      stage: 'PEMAHAMAN_INTI',
      liveLabel: 'Memahami permintaan akses ke ' + connName + '…',
      text: 'Memahami permintaan akses ke ' + connName,
      sub: 'Saya periksa detail data atau tindakan yang perlu dijalankan melalui konektor ' + connName + '.',
      chips: ['Layanan: ' + connName, 'Fokus: ' + topic.slice(0, 22)],
    });
    steps.push({
      kind: 'CONNECT',
      stage: 'SINKRONISASI_KONEKTOR',
      liveLabel: 'Menghubungkan ke konektor ' + connName + '…',
      text: 'Menggunakan Konektor ' + connName,
      sub: 'Menghubungkan ke layanan ' + connName + ' untuk membaca atau mengambil informasi yang diminta.',
      chips: ['Konektor ' + connName, 'Sinkronisasi Data'],
    });
    steps.push({
      kind: 'WRITE',
      stage: 'PENYUSUNAN_JAWABAN',
      liveLabel: 'Menyusun ringkasan data dari ' + connName + '…',
      text: 'Menyusun ringkasan hasil dari ' + connName,
    });
    return steps;
  }

  if (isCode) {
    steps.push({
      kind: 'MIND',
      stage: 'PEMAHAMAN_INTI',
      liveLabel: 'Membedah spesifikasi & kebutuhan kode…',
      text: 'Membedah spesifikasi tugas pada "' + shortQ + '"',
      sub: 'Saya analisis kebutuhan fungsi, alur logika, serta struktur berkas kode yang perlu dibuat atau diperbaiki.',
      chips: ['Spesifikasi Kode', 'Fokus: ' + topic.slice(0, 24)],
    });
    steps.push({
      kind: 'TOOL_CODE',
      stage: 'REKAYASA_KODE',
      liveLabel: 'Merancang fungsi & memeriksa sintaks kode…',
      text: 'Merancang implementasi fungsi & memeriksa sintaks kode',
      sub: 'Menyusun alur program secara bersih dan memastikan tidak ada kesalahan logika pada kode.',
      chips: ['Logika & Algoritma', 'Pemeriksaan Sintaks'],
    });
    if (isThink) {
      steps.push({
        kind: 'SEARCH',
        stage: 'VERIFIKASI_VALIDASI',
        liveLabel: 'Menguji kasus batas & struktur modul…',
        text: 'Menguji kasus batas & memvalidasi struktur modul',
        sub: 'Saya periksa kembali perilaku fungsi pada berbagai kondisi input agar kode siap dijalankan.',
        chips: ['Uji Kasus Batas', 'Validasi Modul'],
      });
    }
    steps.push({
      kind: 'WRITE',
      stage: 'PENYUSUNAN_JAWABAN',
      liveLabel: 'Menyusun kode & penjelasan cara kerjanya…',
      text: 'Menyusun kode beserta penjelasan cara kerjanya',
    });
    return steps;
  }

  if (isMath) {
    steps.push({
      kind: 'MIND',
      stage: 'PEMAHAMAN_INTI',
      liveLabel: 'Memetakan variabel & rumus penyelesaian…',
      text: 'Membedah persoalan & variabel pada "' + shortQ + '"',
      sub: 'Saya identifikasi nilai yang diketahui, rumus yang relevan, serta urutan langkah penyelesaiannya.',
      chips: ['Identifikasi Variabel', 'Pemetaan Rumus'],
    });
    steps.push({
      kind: 'TOOL_MATH',
      stage: 'REKAYASA_KODE',
      liveLabel: 'Menghitung tahapan persamaan…',
      text: 'Menghitung tahapan persamaan & memeriksa ketepatan angka',
      sub: 'Menjalankan operasi perhitungan langkah demi langkah untuk memastikan hasil akhir akurat.',
      chips: ['Evaluasi Persamaan', 'Verifikasi Angka'],
    });
    if (isThink) {
      steps.push({
        kind: 'SEARCH',
        stage: 'VERIFIKASI_VALIDASI',
        liveLabel: 'Memverifikasi ulang konsistensi hasil hitung…',
        text: 'Memverifikasi ulang konsistensi hasil perhitungan',
      });
    }
    steps.push({
      kind: 'WRITE',
      stage: 'PENYUSUNAN_JAWABAN',
      liveLabel: 'Menyusun langkah penyelesaian & jawaban akhir…',
      text: 'Menyusun langkah penyelesaian & jawaban akhir',
    });
    return steps;
  }

  // Pertanyaan Umum / Ilmu Pengetahuan / Riset / Analisis
  steps.push({
    kind: 'MIND',
    stage: 'PEMAHAMAN_INTI',
    liveLabel: 'Membedah fokus pertanyaan tentang "' + topic.slice(0, 26) + '"…',
    text: 'Membedah fokus pertanyaan tentang "' + shortQ + '"',
    sub: isThink
      ? ('Saya petakan poin-poin inti mengenai ' + topic + ' yang perlu dijelaskan, mulai dari pengertian dasar, cara kerja/pembagian utama, hingga contoh penerapannya.')
      : ('Saya identifikasi inti informasi mengenai ' + topic + ' yang ditanyakan oleh pengguna.'),
    chips: ['Topik: ' + topic.slice(0, 26), isThink ? 'Penalaran Mendalam' : 'Pemetaan Inti'],
  });

  if (isResearch) {
    steps.push({
      kind: 'WEB_SEARCH',
      stage: 'PENELUSURAN_WEB',
      liveLabel: 'Menelusuri berbagai sumber web terkait "' + topic.slice(0, 24) + '"…',
      text: 'Menelusuri berbagai sumber web untuk riset "' + topic + '"',
      sub: 'Mencari dan membaca artikel rujukan yang relevan untuk mengumpulkan fakta, definisi, serta data pendukung.',
      chips: ['Riset Multi-Sumber', 'Ekstraksi Fakta & Rujukan'],
    });
    steps.push({
      kind: 'SEARCH',
      stage: 'SINTESIS_SUMBER',
      liveLabel: 'Membandingkan temuan lintas sumber…',
      text: 'Membandingkan temuan & menyusun poin perbandingan "' + topic + '"',
      sub: 'Saya kelompokkan informasi dari berbagai sumber agar dapat disajikan secara sistematis dan mudah dibaca.',
      chips: ['Sintesis Lintas Sumber', 'Penyusunan Poin Utama'],
    });
  } else if (isWeb) {
    steps.push({
      kind: 'WEB_SEARCH',
      stage: 'PENELUSURAN_WEB',
      liveLabel: 'Menelusuri rujukan web tentang "' + topic.slice(0, 24) + '"…',
      text: 'Menelusuri sumber informasi web tentang "' + topic + '"',
      sub: 'Mencari rujukan terbaru di web yang berkaitan langsung dengan pertanyaan pengguna.',
      chips: ['Penelusuran Web Aktif', 'Topik: ' + topic.slice(0, 24)],
    });
  } else {
    steps.push({
      kind: 'SEARCH',
      stage: 'PEMETAAN_REFERENSI',
      liveLabel: 'Menelusuri konsep & referensi terkait "' + topic.slice(0, 24) + '"…',
      text: 'Menelusuri konsep utama & referensi terkait "' + topic + '"',
      sub: isThink
        ? ('Mengumpulkan informasi kunci, karakteristik utama, serta contoh nyata yang relevan dengan ' + topic + '.')
        : ('Menyiapkan poin-poin penjelasan utama mengenai ' + topic + '.'),
      chips: ['Konsep Kunci', 'Contoh & Penerapan'],
    });
  }

  if (isThink && !isResearch) {
    steps.push({
      kind: 'MIND',
      stage: 'PENALARAN_ANALISIS',
      liveLabel: 'Menyusun alur penalaran & kerangka pembahasan…',
      text: 'Menyusun alur pembahasan & memeriksa kelengkapan argumen',
      sub: 'Saya susun urutan penjelasan dari konsep dasar hingga rincian mendalam agar terstruktur dan tidak ada bagian yang terlewat.',
      chips: ['Struktur Pembahasan', 'Pemeriksaan Kelengkapan'],
    });
    steps.push({
      kind: 'SEARCH',
      stage: 'VERIFIKASI_VALIDASI',
      liveLabel: 'Memverifikasi ketepatan istilah & konteks…',
      text: 'Memverifikasi ketepatan konsep & kejelasan alur penjelasan',
      sub: 'Saya pastikan setiap istilah kunci dan contoh yang digunakan sudah tepat serta langsung menjawab pertanyaan.',
      chips: ['Validasi Konsep', 'Kejelasan Narasi'],
    });
  }

  steps.push({
    kind: 'WRITE',
    stage: 'PENYUSUNAN_JAWABAN',
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
    const meta = resolveStageMeta(st);
    return meta.live || LEGACY_STATUS_FALLBACK.running;
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
    const meta = resolveStageMeta(step);
    const stateClass = !running
      ? ' is-done'
      : (index < initialActive ? ' is-done' : (index === initialActive ? ' is-live' : ' is-pending'));
    const li = document.createElement('li');
    li.className = 'stepper-node lane-' + lane + stateClass;

    const railCol = document.createElement('div');
    railCol.className = 'stepper-rail-col';
    const orb = document.createElement('span');
    orb.className = 'stepper-orb';
    orb.innerHTML = ORB[meta.icon] || ORB[lane] || ORB.mind;
    const line = document.createElement('span');
    line.className = 'stepper-rail-line';
    line.setAttribute('aria-hidden', 'true');
    railCol.appendChild(orb);
    if (index < thoughts.length - 1) {
      railCol.appendChild(line);
    }

    const bodyCol = document.createElement('div');
    bodyCol.className = 'stepper-body';

    // Kicker tanpa nomor urut (hanya lencana kategori tahapan + indikator status)
    const kicker = document.createElement('div');
    kicker.className = 'stepper-kicker';
    const laneTag = document.createElement('span');
    laneTag.className = 'stepper-lane-tag lane-tag-' + meta.tone;
    laneTag.textContent = meta.label;
    const stateTag = document.createElement('span');
    stateTag.className = 'stepper-state-tag';
    stateTag.textContent = !running
      ? 'Selesai'
      : (index < initialActive ? 'Selesai' : (index === initialActive ? 'Sedang dikerjakan' : 'Menunggu'));
    kicker.appendChild(laneTag);
    kicker.appendChild(stateTag);
    bodyCol.appendChild(kicker);

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

    if (step && Array.isArray(step.chips) && step.chips.length) {
      const chipWrap = document.createElement('div');
      chipWrap.className = 'stepper-chips';
      step.chips.slice(0, 4).forEach((chipText) => {
        const cleanChip = String(chipText || '').trim();
        if (!cleanChip) return;
        const chip = document.createElement('span');
        chip.className = 'stepper-chip';
        chip.textContent = cleanChip;
        chipWrap.appendChild(chip);
      });
      if (chipWrap.childNodes.length) {
        bodyCol.appendChild(chipWrap);
      }
    }

    li.appendChild(railCol);
    li.appendChild(bodyCol);
    list.appendChild(li);
    nodes.push({ li, lane, copy, step, stateTag });
  });

  const applyActiveStep = (activeIdx) => {
    const clamped = Math.max(0, Math.min(thoughts.length - 1, activeIdx | 0));
    const prevIdx = Number(container.dataset.thoughtActiveIdx) || 0;
    container.dataset.thoughtActiveIdx = String(clamped);
    for (let i = 0; i < nodes.length; i += 1) {
      const state = i < clamped ? ' is-done' : (i === clamped ? ' is-live' : ' is-pending');
      nodes[i].li.className = 'stepper-node lane-' + nodes[i].lane + state;
      if (nodes[i].stateTag) {
        nodes[i].stateTag.textContent = i < clamped ? 'Selesai' : (i === clamped ? 'Sedang dikerjakan' : 'Menunggu');
      }
    }
    const nextSummaryText = resolveLiveSummaryText(clamped);
    if (label.textContent !== nextSummaryText || clamped !== prevIdx) {
      label.classList.remove('is-switching');
      // Trigger smooth text transition when active step changes
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
