export default {
  id: 'jilid-11-12',
  judul: 'Jilid 11-12 — mesin penalaran, flywheel v2, 100% local-first',
  tanggal: '2026-08-14',
  komit: ['bd54b25', '90c118e', 'c1173af'],
  ringkasan:
    'Jilid 11 menaikkan kualitas jawaban lewat mesin penalaran dan "flywheel v2" (siklus belajar-dari-feedback), diikuti perbaikan 2 kasus bench yang salah asumsi. Jilid 12+ adalah deklarasi arsitektur eksplisit: "killer features 2026" dengan socket architecture dan komitmen 100% local-first — prinsip yang sejak saat itu jadi aturan wajib di setiap ronde berikutnya (tanpa API key, tanpa server, tanpa console/eval).',
  fitur_baru: [
    'Mesin penalaran (reasoning engine) generasi awal',
    'Flywheel v2 — siklus belajar dari feedback pengguna',
    'Deklarasi arsitektur 100% local-first (socket architecture)',
  ],
  bug_ditutup: ['2 kasus bench Jilid 11 dengan asumsi jawaban yang salah'],
  kpi: { catatan: 'Titik di mana "100% lokal, tanpa API key" resmi jadi prinsip wajib proyek.' },
};
