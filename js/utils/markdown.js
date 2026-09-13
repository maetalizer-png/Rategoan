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
    out = out.replace(/(^|\n)[ \t]*[-•][ \t]+(.*)/g, '<div class="md-li-row"><span class="md-li">•</span> $2</div>');
    out = out.replace(/(^|\n)[ \t]*(\d+)\.[ \t]+(.*)/g, '<div class="md-li-row"><span class="md-li">$2.</span> $3</div>');
    out = out.replace(/(^|\n)Sumber::([^|\n]+)\|(https?:\/\/\S+)/g, '$1<div class="md-source">Sumber: <a class="md-link" href="$3" target="_blank" rel="noopener noreferrer">$2</a></div>');
    out = out.replace(/(^|\n)\(Sumber:\s*([^)]+)\)/g, '$1<div class="md-source">Sumber: $2</div>');
    out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a class="md-link" href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    out = out.replace(/\bhttps?:\/\/[^\s<]+/g, (m, off, str) => {
      if (/href=["']$/.test(str.slice(Math.max(0, off - 6), off))) return m;
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
