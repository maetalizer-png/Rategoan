const ORB = {
  mind: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>',
  web: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg>',
  file: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>',
  tool: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><polyline points="8 10 11 12.5 8 15"/><line x1="13" y1="15" x2="16" y2="15"/></svg>',
  connect: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  slide: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8"/><path d="M12 16v4"/></svg>',
  search: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.2" y2="16.2"/></svg>',
  write: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
};

const CHEVRON_SVG =
  '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>';

export function laneOf(step) {
  const blob = ((step && step.kind) || '') + ' ' + ((step && step.text) || '');
  const t = blob.toLowerCase();
  if (/konektor|github|drive|gmail|calendar|kalender|oauth/.test(t)) return 'connect';
  if (/web|riset|internet|sumber|artikel|berita|cuaca/.test(t)) return 'web';
  if (/berkas|dokumen|pdf|docx|lampiran|file|laporan/.test(t)) return 'file';
  if (/slide|presentasi|pptx|diagram|grafik|chart|sheet|xlsx/.test(t)) return 'slide';
  if (/alat|terminal|sandbox|kode|script|fungsi|html|css|python|perintah|hitung|rumus|grep|patch|lint|uji/.test(t)) return 'tool';
  if (/konteks|memori|koleksi|riwayat|cari|telusur/.test(t)) return 'search';
  if (/susun|tulis|rangkum|rumus|jawab|selesai/.test(t)) return 'write';
  return 'mind';
}

function defaultSubNote(step, lane) {
  if (step && step.sub) return String(step.sub);
  const text = String((step && step.text) || '');
  if (/baca berkas/i.test(text)) return 'Memindai struktur direktori VFS dan membaca isi berkas yang relevan.';
  if (/racik|sintesis/i.test(text)) return 'Menyusun perubahan kode secara terukur dan memetakan dependensi antar-modul.';
  if (/uji sandbox|lint/i.test(text)) return 'Menjalankan verifikasi sintaks serta menguji eksekusi di dalam ruang isolasi.';
  if (/pratinjau/i.test(text)) return 'Memuat hasil akhir ke kanvas interaktif agar siap diinspeksi.';
  if (lane === 'connect') return 'Memeriksa status otorisasi konektor dan mengambil metadata terbaru.';
  if (lane === 'web') return 'Menyeleksi rujukan relevan dan memverifikasi kecocokan fakta.';
  if (lane === 'file') return 'Mengekstrak bagian inti dokumen untuk dijadikan landasan jawaban.';
  if (lane === 'slide') return 'Menata hierarki visual, judul bagian, dan poin ringkasan tiap halaman.';
  if (lane === 'tool') return 'Mengeksekusi logika terstruktur dan memastikan tidak ada galat runtime.';
  if (lane === 'search') return 'Menyelaraskan konteks percakapan sebelumnya agar respons tetap nyambung.';
  if (lane === 'write') return 'Merangkai penjelasan yang jernih, terstruktur, dan langsung menjawab inti pertanyaan.';
  return 'Menganalisis maksud dan fokus utama dari instruksi pengguna.';
}

export function buildDynamicThoughts(query, opts) {
  const clean = String(query || '').replace(/\s+/g, ' ').trim();
  const shortQ = clean.length > 36 ? clean.slice(0, 36) + '…' : (clean || 'permintaan');
  const isWeb = !!(opts && opts.websearch);
  const isResearch = !!(opts && opts.research);
  const fileName = opts && opts.files ? String(opts.files) : '';
  const isConnect = /\b(github|repo|drive|gmail|email|kotak masuk|calendar|kalender|jadwal)\b/i.test(clean);
  const isSlide = /\b(slide|presentasi|powerpoint|pptx|deck)\b/i.test(clean);
  const isCode = /\b(kode|code|fungsi|function|script|html|css|python|js|bug|komponen|aplikasi)\b/i.test(clean);
  const isMath = /\b(hitung|rumus|integral|turunan|matriks|persamaan|\d+\s*[+*^/-]\s*\d+)\b/i.test(clean);

  const steps = [
    {
      kind: 'MIND',
      text: 'Memahami maksud pertanyaan tentang "' + shortQ + '"',
      sub: 'Saya sedang menganalisis fokus utama permintaan pengguna beserta detail konteksnya.',
    },
  ];

  if (fileName) {
    steps.push({
      kind: 'FILE',
      text: 'Membaca & mengekstrak isi berkas lampiran (' + fileName + ')',
      sub: 'Memeriksa struktur dan isi berkas "' + fileName + '" untuk mengambil informasi kunci.',
    });
  }

  if (isConnect) {
    steps.push({
      kind: 'CONNECT',
      text: 'Menghubungkan ke layanan konektor & mengambil data terkait',
      sub: 'Memeriksa jembatan konektor aktif dan menarik data yang dibutuhkan secara aman.',
    });
  } else if (isResearch) {
    steps.push({
      kind: 'WEB_SEARCH',
      text: 'Menelusuri berbagai sumber web & literatur untuk riset mendalam',
      sub: 'Membandingkan beberapa rujukan sekaligus untuk memastikan kelengkapan analisis.',
    });
    steps.push({
      kind: 'FILE',
      text: 'Merangkum temuan utama ke dalam laporan terstruktur',
      sub: 'Menyusun temuan menjadi bagian-bagian yang mudah dipindai beserta kutipan sumber.',
    });
  } else if (isWeb) {
    steps.push({
      kind: 'WEB_SEARCH',
      text: 'Menelusuri sumber informasi terbaru di web',
      sub: 'Mencari referensi terkini yang paling relevan dengan topik yang ditanyakan.',
    });
  } else if (isSlide) {
    steps.push({
      kind: 'SLIDE',
      text: 'Merancang struktur & poin-poin halaman slide presentasi',
      sub: 'Membagi materi ke dalam alur slide yang ringkas dan seimbang.',
    });
  } else if (isCode) {
    steps.push({
      kind: 'TOOL_CODE',
      text: 'Menyusun struktur kode & memeriksa validitas sintaks',
      sub: 'Merancang implementasi modul dan memastikan tidak ada celah sintaks maupun logika.',
    });
  } else if (isMath) {
    steps.push({
      kind: 'TOOL_MATH',
      text: 'Menghitung ekspresi & memverifikasi langkah penyelesaian',
      sub: 'Mengevaluasi operasi matematika langkah demi langkah untuk menjaga akurasi hasil.',
    });
  } else {
    steps.push({
      kind: 'SEARCH',
      text: 'Memeriksa konteks percakapan & catatan yang relevan',
      sub: 'Meninjau alur obrolan dan pengetahuan relevan agar jawaban tepat sasaran.',
    });
  }

  steps.push({
    kind: 'WRITE',
    text: 'Menyusun jawaban akhir',
    sub: 'Merapikan alur kalimat agar ringkas, jelas, dan siap ditampilkan.',
  });

  return steps;
}

export function mountThought(container, thoughts, status) {
  if (!container || !thoughts || !thoughts.length) return null;
  if (!container.dataset.thoughtStart) container.dataset.thoughtStart = String(Date.now());
  const started = Number(container.dataset.thoughtStart) || Date.now();
  const running = status === 'berjalan';
  const elapsedSec = Math.max(0.1, (Date.now() - started) / 1000);
  const computedLabel = elapsedSec < 10 ? elapsedSec.toFixed(1) + ' dtk' : Math.round(elapsedSec) + ' dtk';
  if (!running && !container.dataset.thoughtFrozenSec) {
    container.dataset.thoughtFrozenSec = computedLabel;
  }
  const secLabel = (!running && container.dataset.thoughtFrozenSec) ? container.dataset.thoughtFrozenSec : computedLabel;

  const prevTimer = Number(container.dataset.thoughtTimerId) || 0;
  if (prevTimer) {
    clearInterval(prevTimer);
    delete container.dataset.thoughtTimerId;
  }

  const prevBox = container.querySelector(':scope > .thought-accordion');
  if (prevBox) prevBox.remove();

  const box = document.createElement('details');
  box.className = 'thought-accordion' + (running ? ' running' : ' completed');
  box.open = container.dataset.userOpened === '1';
  box.addEventListener('toggle', () => {
    container.dataset.userOpened = box.open ? '1' : '0';
  });

  const summary = document.createElement('summary');
  summary.className = 'thought-summary';

  const dot = document.createElement('span');
  dot.className = 'zen-dot thought-dot' + (running ? ' is-pulsing' : ' is-done');
  dot.setAttribute('aria-hidden', 'true');

  const label = document.createElement('span');
  label.className = 'thought-summary-label';
  label.textContent = running ? 'Sedang berpikir…' : ('Berpikir selama ' + secLabel);

  const timerNode = document.createElement('span');
  timerNode.className = 'thought-timer';
  timerNode.textContent = running ? secLabel : '';
  if (!running) timerNode.hidden = true;

  const chev = document.createElement('span');
  chev.className = 'thought-chevron';
  chev.setAttribute('aria-hidden', 'true');
  chev.innerHTML = CHEVRON_SVG;

  summary.appendChild(dot);
  summary.appendChild(label);
  summary.appendChild(timerNode);
  summary.appendChild(chev);

  const list = document.createElement('ol');
  list.className = 'agentic-stepper';
  thoughts.forEach((step, index) => {
    const live = running && index === thoughts.length - 1;
    const lane = laneOf(step);
    const li = document.createElement('li');
    li.className = 'stepper-node lane-' + lane + (live ? ' is-live' : ' is-done');

    const railCol = document.createElement('div');
    railCol.className = 'stepper-rail-col';
    const orb = document.createElement('span');
    orb.className = 'stepper-orb';
    orb.innerHTML = ORB[lane] || ORB.mind;
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

    const sub = document.createElement('p');
    sub.className = 'stepper-sub';
    sub.textContent = defaultSubNote(step, lane);

    bodyCol.appendChild(copy);
    bodyCol.appendChild(sub);

    li.appendChild(railCol);
    li.appendChild(bodyCol);
    list.appendChild(li);
  });

  if (running && typeof setInterval === 'function') {
    const tid = setInterval(() => {
      if (!box.isConnected) {
        clearInterval(tid);
        return;
      }
      const nowSec = Math.max(0.1, (Date.now() - started) / 1000);
      timerNode.textContent = nowSec < 10 ? nowSec.toFixed(1) + ' dtk' : Math.round(nowSec) + ' dtk';
    }, 100);
    container.dataset.thoughtTimerId = String(tid);
  }

  box.appendChild(summary);
  box.appendChild(list);
  container.insertBefore(box, container.firstChild);
  return box;
}
