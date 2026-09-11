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
    out = out.replace(/(^|\n)\s*[-•]\s+/g, '$1<span class="md-li">•</span> ');
    out = out.replace(/(^|\n)(\d+)\.\s+/g, '$1<span class="md-li">$2.</span> ');
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
