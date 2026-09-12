export const markdown = {
  escape(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },
  render(text) {
    const fences = [];
    let src = String(text || '');
    src = src.replace(/```([\s\S]*?)```/g, (m, code) => {
      fences.push('<pre class="md-pre">' + this.escape(code.replace(/^\n+|\n+$/g, '')) + '</pre>');
      return ' F' + (fences.length - 1) + ' ';
    });
    let out = this.escape(src);
    out = out.replace(/`([^`\n]+)`/g, '<code class="md-code">$1</code>');
    out = out.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/^#{1,3}\s+(.+)$/gm, '<strong class="md-h">$1</strong>');
    // Bungkus SELURUH baris poin (bukan cuma tandanya) jadi elemen block -
    // sebelumnya cuma tandanya (•/1.) yang jadi <span>, sisanya teks polos
    // mengalir mengikuti satu line-height paragraf biasa lewat white-space:
    // pre-wrap saja, tanpa jarak antar-poin sendiri - itu yang bikin daftar
    // panjang kelihatan padat/tidak rapi dibanding paragraf biasa.
    out = out.replace(/(^|\n)[ \t]*[-•][ \t]+(.*)/g, '<div class="md-li-row"><span class="md-li">•</span> $2</div>');
    out = out.replace(/(^|\n)[ \t]*(\d+)\.[ \t]+(.*)/g, '<div class="md-li-row"><span class="md-li">$2.</span> $3</div>');
    out = out.replace(/\bhttps?:\/\/[^\s<]+/g, (m) => {
      const trailing = m.match(/[).,;:!?]+$/);
      const url = trailing ? m.slice(0, -trailing[0].length) : m;
      const rest = trailing ? trailing[0] : '';
      if (!url) return m;
      return '<a class="md-link" href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + '</a>' + rest;
    });
    out = out.replace(/ F(\d+) /g, (m, i) => fences[Number(i)]);
    return out;
  },
};
