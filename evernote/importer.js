function stripEnml(content) {
  return String(content || '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function importENEX(xmlText) {
  try {
    const doc = new DOMParser().parseFromString(String(xmlText || ''), 'text/xml');
    if (doc.getElementsByTagName('parsererror').length) {
      return { ok: false, message: 'File ENEX ini tidak valid atau rusak.' };
    }
    const notes = Array.from(doc.getElementsByTagName('note'));
    const chunks = notes
      .map((n) => {
        const title = (n.getElementsByTagName('title')[0] && n.getElementsByTagName('title')[0].textContent) || 'Tanpa judul';
        const contentEl = n.getElementsByTagName('content')[0];
        const text = stripEnml(contentEl ? contentEl.textContent : '');
        const created = (n.getElementsByTagName('created')[0] && n.getElementsByTagName('created')[0].textContent) || null;
        return { title, text: text.slice(0, 4000), created };
      })
      .filter((c) => c.text);
    if (!chunks.length) return { ok: false, message: 'Tidak ditemukan catatan di dalam file ENEX ini.' };
    return { ok: true, chunks };
  } catch (e) {
    return { ok: false, message: 'Gagal membaca file ENEX ini.' };
  }
}

export const evernoteImporter = Object.freeze({ importENEX });
