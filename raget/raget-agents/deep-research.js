export function queryTree(topic) {
  const t = String(topic || '').trim() || 'topik';
  return [
    t + ' — definisi dan batas masalah',
    t + ' — data dan angka yang bisa dicek',
    t + ' — pendapat yang saling bertentangan',
    t + ' — dampak praktis dan langkah berikutnya',
  ];
}
