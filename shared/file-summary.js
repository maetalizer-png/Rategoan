function splitSentences(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
}

const GENERIC_TRIGGER_RE = /^(?:baca(?:kan)?(?:\s+dan\s+ringkas)?(?:\s+(?:isi\s+)?(?:lampiran|berkas|file|dokumen|foto|gambar|arsip)(?:\s+ini)?)?|ringkas(?:kan)?(?:\s+(?:lampiran|berkas|file|dokumen)(?:\s+ini)?)?|rangkum(?:kan)?|ekstrak(?:\s+isi)?|extract|cek(?:\s+ini)?|lihat|analisis|analisa|jelaskan(?:\s+isi)?|apa\s+ini|apa\s+isi(?:nya)?|[a-z0-9]{1,3})[?.!]*$/i;

export function summarizeFileText(text, filename) {
  const clean = String(text || '').trim();
  const name = filename || 'file ini';
  if (!clean) {
    return 'Sudah saya coba baca "' + name + '", tapi isinya kosong atau tidak berupa teks yang bisa diambil (kemungkinan hasil scan/gambar tanpa lapisan teks).';
  }
  const lines = clean.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const wordCount = clean.split(/\s+/).filter(Boolean).length;
  if (/^Daftar berkas arsip ZIP/i.test(clean)) {
    const previewLines = lines.slice(0, 28).join('\n');
    return '### Hasil Ekstraksi Arsip `' + name + '`\n\n' +
      previewLines +
      '\n\nSebutkan nama berkas atau modul di atas jika Anda ingin membaca isi kodenya secara spesifik.';
  }
  if (/^\[Dokumen PDF/i.test(clean)) {
    const header = lines[0];
    const bodyText = lines.slice(1).join(' ');
    const sentences = splitSentences(bodyText);
    const preview = sentences.slice(0, 6).join(' ') || bodyText.slice(0, 700);
    return '### Hasil Ekstraksi Dokumen `' + name + '`\n' +
      '**Info**: ' + header.replace(/^\[|\]$/g, '') + ' · ' + wordCount.toLocaleString('id-ID') + ' kata\n\n' +
      preview + (sentences.length > 6 ? ' [...]' : '');
  }
  if (/^Ringkasan Visual Gambar/i.test(clean)) {
    return '### Hasil Analisis Gambar `' + name + '`\n\n' + clean;
  }
  const sentences = splitSentences(clean);
  const preview = sentences.slice(0, 6).join(' ');
  return 'Isi "' + name + '" (' + wordCount.toLocaleString('id-ID') + ' kata):\n\n' +
    preview + (sentences.length > 6 ? ' [...]' : '') +
    '\n\nMau saya jelaskan bagian tertentu, atau ringkas lebih pendek lagi?';
}

export function answerFromFile(text, query, filename) {
  const clean = String(text || '').trim();
  const name = filename || 'file ini';
  const q = String(query || '').toLowerCase().replace(/[?.!,]/g, ' ').trim();
  if (!clean || !q || GENERIC_TRIGGER_RE.test(q)) {
    return summarizeFileText(clean, name);
  }
  const words = q.split(/\s+/).filter((w) => w.length > 2 && !/^(baca|ringkas|rangkum|tentang|dari|pada|untuk|yang|ini|itu|apa|bagaimana|dan|lampiran|berkas|file|dokumen|tolong|coba)$/.test(w));
  if (!words.length) return summarizeFileText(clean, name);
  const chunks = clean.split(/\n+|(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 6);
  const scored = chunks.map((s) => {
    const low = s.toLowerCase();
    let n = 0;
    words.forEach((w) => {
      if (low.includes(w)) n += 1;
    });
    return { s, n };
  }).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
  if (!scored.length) {
    return summarizeFileText(clean, name);
  }
  const pick = scored.slice(0, 4).map((x) => {
    const at = clean.indexOf(x.s);
    const page = at < 0 ? 0 : Math.floor(at / 1800) + 1;
    const cleanLine = x.s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || x.s;
    return page > 1 || clean.length > 1800 ? '- ' + cleanLine + ' (bagian ' + page + ')' : '- ' + cleanLine;
  });
  return 'Dari **' + name + '**:\n\n' + pick.join('\n');
}

export function summarizeMultiAttachments(att, query) {
  if (!att) return null;
  const files = Array.isArray(att.files) && att.files.length ? att.files : [att];
  const q = String(query || '').trim();
  const isGeneric = !q || GENERIC_TRIGGER_RE.test(q);

  if (files.length === 1) {
    const f = files[0];
    if (f.fileText) {
      return isGeneric ? summarizeFileText(f.fileText, f.name) : answerFromFile(f.fileText, q, f.name);
    }
    if (f.fileTextError) return f.fileTextError;
    return 'Berkas **' + (f.name || 'lampiran') + '** (' + (f.badge || 'FILE') + (f.sizeLabel ? ' · ' + f.sizeLabel : '') + ') telah diterima.';
  }

  const sections = [
    'Berikut hasil pembacaan dan ekstraksi **' + files.length + ' berkas lampiran** yang Anda kirimkan:',
  ];
  files.forEach((f, idx) => {
    const title = (idx + 1) + '. **`' + (f.name || ('Berkas ' + (idx + 1))) + '`** (' + [f.badge || 'BERKAS', f.sizeLabel, f.statusLabel].filter(Boolean).join(' · ') + ')';
    const body = String(f.fileText || '').trim();
    if (!body) {
      sections.push(title + '\n   - ' + (f.fileTextError || 'Berkas biner/media telah dilampirkan dan terindeks.'));
      return;
    }
    if (!isGeneric) {
      const ans = answerFromFile(body, q, f.name);
      sections.push(title + '\n' + ans);
      return;
    }
    const lines = body.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const preview = lines.slice(0, 8).join('\n   ');
    sections.push(title + '\n   ' + preview + (lines.length > 8 ? '\n   (… ' + (lines.length - 8) + ' baris lainnya siap ditanyakan)' : ''));
  });
  sections.push('Silakan tanyakan bagian spesifik dari salah satu berkas di atas (misalnya membedah modul di dalam `.zip`, merangkum bab `.pdf`, atau mengekstrak detail gambar).');
  return sections.join('\n\n');
}
