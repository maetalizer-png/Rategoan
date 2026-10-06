const BANNED = [
  /\b(csam|child\s+porn|pornografi\s+anak|eksploitasi\s+anak|konten\s+seksual\s+anak)\b/i,
  /\b(cara\s+membuat\s+bom|buat(?:kan)?\s+bom|how\s+to\s+make\s+a\s+bomb|racik\s+bahan\s+peledak|instruksi\s+kekerasan|bikin\s+ujaran\s+kebencian)\b/i,
];

export function refuseProhibited(text) {
  const src = String(text || '');
  if (!BANNED.some((rule) => rule.test(src))) return '';
  return 'Permintaan itu tidak saya kerjakan. Rategoan menolak kekerasan ekstrem, eksploitasi anak, ujaran kebencian, dan instruksi berbahaya yang melanggar hukum.';
}
