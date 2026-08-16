// ---------- OPT-IN GEOLOCATION ----------
// Deliberately synchronous: an earlier version called navigator.geolocation.getCurrentPosition()
// directly, but its real (up to ~1.5s) async delay raced against the chat UI's typing-animation
// stability detection and could misattribute a reply to the wrong message. Opt-in consent is
// represented as an explicit text flow instead, keeping behavior instant and deterministic.

function tryGeoOptIn(text) {
  const t = text.toLowerCase();
  if (!/\b(aktifkan|gunakan|pakai|nyalakan)\s+lokasi(ku|mu|nya|\s+saya)?\b|\bboleh\s+akses\s+lokasi(ku|mu|nya)?\b/i.test(t)) return null;
  const supported = typeof navigator !== 'undefined' && !!navigator.geolocation;
  if (!supported) {
    return 'Fitur lokasi tidak didukung di perangkat/browser ini. Kamu tetap bisa sebutkan kotamu secara manual kalau perlu.';
  }
  return (
    'Akses lokasi ini bersifat opt-in — saya cuma pakai kalau kamu izinkan lewat prompt izin browser yang akan muncul. ' +
    'Silakan izinkan di sana kalau mau, atau sebutkan kotamu secara manual kalau lebih nyaman tanpa izin lokasi.'
  );
}

// ---------- TIME-AWARE GREETING (mood layer already handled by moodOpener wrapper) ----------

function timeGreeting(hour) {
  const h = typeof hour === 'number' ? hour : new Date().getHours();
  if (h >= 4 && h < 11) return 'Selamat pagi! Semoga harimu dimulai dengan baik.';
  if (h >= 11 && h < 15) return 'Selamat siang! Udah makan siang belum?';
  if (h >= 15 && h < 18) return 'Selamat sore! Gimana harimu sejauh ini?';
  return 'Selamat malam! Jangan lupa istirahat yang cukup ya.';
}

function tryTimeGreeting(text) {
  const t = text.trim();
  if (!/^(hai+|halo+|hi+|hey+|hoi+|woy+)[\s!.,]{0,3}$/i.test(t)) return null;
  return timeGreeting();
}

// ---------- SITUATION CLASSIFICATION ----------

const EMERGENCY_RE =
  /\bdarurat\b|\bini\s+darurat\b|\bsesak\s+napas\b|\bpendarahan\b|\b(pingsan|tidak\s+sadarkan\s+diri)\b|\bkecelakaan\b.*\btolong\b|\btolong\b.*\bkecelakaan\b|\bditangkap\s+polisi\b|\bbutuh\s+pengacara\s+sekarang\b|\bkebakaran\b.*\btolong\b|\btolong\b.*\bkebakaran\b/i;

function tryEmergency(text) {
  const t = text.toLowerCase();
  if (!EMERGENCY_RE.test(t)) return null;
  return (
    'Ini terdengar seperti situasi darurat. Saya AI berbasis template lokal dan TIDAK bisa memberikan bantuan darurat langsung — segera hubungi:\n' +
    '• 112 (Nomor Darurat Nasional)\n' +
    '• 119 (Ambulans/Medis)\n' +
    '• 110 (Polisi)\n' +
    '• 113 (Pemadam Kebakaran)\n\n' +
    'Kalau memungkinkan, segera hubungi juga orang terdekat kamu sekarang.'
  );
}

function trySituasiSantai(text) {
  const t = text.toLowerCase();
  if (!/\b(aku|saya)\s+lagi\s+santai\b|\bcuma\s+lagi\s+santai\b|\bgabut\s+nih\b|\bgabut\s+banget\b/i.test(t)) return null;
  return 'Oke, santai aja dulu~ Kalau mau ngobrol ringan, tanya-tanya iseng, atau butuh hiburan sebentar, bilang aja.';
}

function trySituasiBelajar(text) {
  const t = text.toLowerCase();
  if (!/\b(lagi|sedang)\s+belajar\b|\bmau\s+belajar\s+buat\s+ujian\b/i.test(t)) return null;
  return 'Mode belajar aktif! Kalau ada soal, materi, atau konsep yang mau ditanyakan, langsung aja tanya, aku bantu sejelas mungkin.';
}

function trySituasiKerja(text) {
  const t = text.toLowerCase();
  if (!/\b(lagi|sedang)\s+kerja\b.*\bdeadline\b|\bkerjaan\s+numpuk\b|\bdeadline\s+mepet\b/i.test(t)) return null;
  return 'Oke, mode kerja fokus ya. Aku bantu seefisien mungkin — langsung to the point aja kalau ada yang perlu dibantu.';
}

function trySituasi(text) {
  return tryEmergency(text) || trySituasiSantai(text) || trySituasiBelajar(text) || trySituasiKerja(text);
}

// ---------- "APA SELANJUTNYA" SUGGESTION ENGINE (max 3, opsional) ----------

const SUGGESTION_SETS = [
  { match: /belajar|ujian/i, items: ['Coba pecah materi jadi bagian-bagian kecil dan pelajari satu per satu', 'Gunakan teknik Pomodoro (25 menit fokus, 5 menit istirahat)', 'Uji pemahamanmu dengan coba jelaskan ulang materinya pakai kata-kata sendiri'] },
  { match: /kerja|deadline/i, items: ['Tulis 3 prioritas utama yang paling mendesak dulu', 'Kerjakan bagian tersulit di awal saat energi masih tinggi', 'Beri jeda singkat tiap 1-2 jam supaya fokus tetap terjaga'] },
  { match: /bingung|stres|stress|stuck|buntu/i, items: ['Coba tulis dulu apa sebenarnya yang bikin bingung, kadang menuliskannya saja sudah membantu', 'Ambil jeda sebentar lalu kembali dengan pikiran lebih segar', 'Coba ceritakan situasinya ke orang lain untuk dapat sudut pandang baru'] },
];

const DEFAULT_SUGGESTIONS = ['Tulis dulu apa yang paling ingin kamu capai saat ini', 'Pilih satu langkah kecil yang bisa langsung dikerjakan sekarang', 'Beri diri kamu jeda sebentar kalau memang terasa berat'];

function trySuggestions(text) {
  const t = text.toLowerCase();
  if (!/\bapa\s+yang\s+(harus|sebaiknya)\s+(aku|saya)\s+lakukan\b|\b(aku|saya)\s+harus\s+ngapain\b|\bkasih\s+saran\s+langkah\s+selanjutnya\b|\blangkah\s+selanjutnya\s+apa\b/i.test(t)) return null;
  const set = SUGGESTION_SETS.find((s) => s.match.test(t));
  const items = (set ? set.items : DEFAULT_SUGGESTIONS).slice(0, 3);
  return (
    'Ini beberapa saran langkah selanjutnya (opsional, pilih yang paling relevan buat kamu):\n' +
    items.map((s, i) => `${i + 1}. ${s}`).join('\n')
  );
}

// ---------- COMBINED ----------

function tryContext(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  return tryGeoOptIn(t) || tryTimeGreeting(t) || trySituasi(t) || trySuggestions(t) || null;
}

export const contextEngine = Object.freeze({
  tryGeoOptIn,
  tryTimeGreeting,
  tryEmergency,
  trySituasiSantai,
  trySituasiBelajar,
  trySituasiKerja,
  trySituasi,
  trySuggestions,
  timeGreeting,
  tryContext,
});
