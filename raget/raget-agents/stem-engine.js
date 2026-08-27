const PI = Math.PI;

function r2(n) {
  return Math.round(n * 100) / 100;
}
function r3(n) {
  return Math.round(n * 1000) / 1000;
}
function tnum(n) {
  return Number.isInteger(n) ? String(n) : String(r3(n));
}

function tryAlgebra(text) {
  const t = text;
  if (!/(selesaikan|solve|cari\s+(nilai\s+)?x|berapa\s+nilai\s+x|nilai\s+x\s+dari)/i.test(t)) return null;
  const re = /(-?\d*)\s*x\s*([+\-]\s*\d+(?:\.\d+)?)?\s*=\s*(-?\d+(?:\.\d+)?)/i;
  const m = t.match(re);
  if (!m) return null;
  const aRaw = (m[1] || '').trim();
  const a = aRaw === '' ? 1 : aRaw === '-' ? -1 : parseFloat(aRaw);
  const bStr = (m[2] || '').replace(/\s+/g, '');
  const b = bStr ? parseFloat(bStr) : 0;
  const c = parseFloat(m[3]);
  if (!a || !isFinite(a) || !isFinite(b) || !isFinite(c)) return null;
  const diff = r3(c - b);
  const x = r3(diff / a);
  const eqDisplay = m[0].trim();
  return (
    `Persamaan: ${eqDisplay}\n` +
    `Langkah: ${tnum(a)}x = ${tnum(c)} - (${tnum(b)}) = ${tnum(diff)}\n` +
    `x = ${tnum(diff)} / ${tnum(a)} = ${tnum(x)}`
  );
}

function extractParam(text, labels) {
  for (const label of labels) {
    const re = new RegExp(label + '\\s*(?:nya)?\\s*(?:adalah|sebesar|=|:)?\\s*(\\d+(?:[.,]\\d+)?)', 'i');
    const m = text.match(re);
    if (m) return parseFloat(m[1].replace(',', '.'));
  }
  return null;
}

function fmtGeo(label, rumus, sub, hasil, satuan) {
  return `${label}\nRumus: ${rumus}\nSubstitusi: ${sub} = ${tnum(r2(hasil))} ${satuan}`;
}

function tryGeometry(text) {
  const t = text.toLowerCase();
  const wantsLuasPermukaan = /luas\s+permukaan/.test(t);
  const wantsVolume = /\bvolume\b/.test(t);
  const wantsKeliling = /\bkeliling\b/.test(t);
  const wantsLuas = !wantsLuasPermukaan && /\bluas\b/.test(t);
  if (!wantsVolume && !wantsKeliling && !wantsLuasPermukaan && !wantsLuas) return null;

  if (/persegi\s*panjang/.test(t)) {
    const p = extractParam(t, ['panjang']);
    const l = extractParam(t, ['lebar']);
    if (p == null || l == null) return null;
    if (wantsLuas) return fmtGeo('Luas Persegi Panjang', 'p × l', `${tnum(p)} × ${tnum(l)}`, p * l, 'satuan²');
    if (wantsKeliling) return fmtGeo('Keliling Persegi Panjang', '2 × (p + l)', `2 × (${tnum(p)} + ${tnum(l)})`, 2 * (p + l), 'satuan');
    return null;
  }
  if (/\bpersegi\b/.test(t)) {
    const s = extractParam(t, ['sisi']);
    if (s == null) return null;
    if (wantsLuas) return fmtGeo('Luas Persegi', 's²', `${tnum(s)}²`, s * s, 'satuan²');
    if (wantsKeliling) return fmtGeo('Keliling Persegi', '4 × s', `4 × ${tnum(s)}`, 4 * s, 'satuan');
    return null;
  }
  if (/lingkaran/.test(t)) {
    const r = extractParam(t, ['jari-jari', 'jari', 'radius']);
    if (r == null) return null;
    if (wantsLuas) return fmtGeo('Luas Lingkaran', 'π × r²', `π × ${tnum(r)}²`, PI * r * r, 'satuan²');
    if (wantsKeliling) return fmtGeo('Keliling Lingkaran', '2 × π × r', `2 × π × ${tnum(r)}`, 2 * PI * r, 'satuan');
    return null;
  }
  if (/segitiga/.test(t)) {
    const a = extractParam(t, ['alas']);
    const h = extractParam(t, ['tinggi']);
    if (a == null || h == null || !wantsLuas) return null;
    return fmtGeo('Luas Segitiga', '0.5 × alas × tinggi', `0.5 × ${tnum(a)} × ${tnum(h)}`, 0.5 * a * h, 'satuan²');
  }
  if (/kubus/.test(t)) {
    const s = extractParam(t, ['sisi']);
    if (s == null) return null;
    if (wantsVolume) return fmtGeo('Volume Kubus', 's³', `${tnum(s)}³`, s ** 3, 'satuan³');
    if (wantsLuasPermukaan) return fmtGeo('Luas Permukaan Kubus', '6 × s²', `6 × ${tnum(s)}²`, 6 * s * s, 'satuan²');
    return null;
  }
  if (/balok/.test(t)) {
    const p = extractParam(t, ['panjang']);
    const l = extractParam(t, ['lebar']);
    const h = extractParam(t, ['tinggi']);
    if (p == null || l == null || h == null || !wantsVolume) return null;
    return fmtGeo('Volume Balok', 'p × l × t', `${tnum(p)} × ${tnum(l)} × ${tnum(h)}`, p * l * h, 'satuan³');
  }
  if (/bola/.test(t)) {
    const r = extractParam(t, ['jari-jari', 'jari', 'radius']);
    if (r == null) return null;
    if (wantsVolume) return fmtGeo('Volume Bola', '(4/3) × π × r³', `(4/3) × π × ${tnum(r)}³`, (4 / 3) * PI * r ** 3, 'satuan³');
    if (wantsLuasPermukaan) return fmtGeo('Luas Permukaan Bola', '4 × π × r²', `4 × π × ${tnum(r)}²`, 4 * PI * r * r, 'satuan²');
    return null;
  }
  if (/tabung/.test(t)) {
    const r = extractParam(t, ['jari-jari', 'jari', 'radius']);
    const h = extractParam(t, ['tinggi']);
    if (r == null || h == null) return null;
    if (wantsVolume) return fmtGeo('Volume Tabung', 'π × r² × t', `π × ${tnum(r)}² × ${tnum(h)}`, PI * r * r * h, 'satuan³');
    if (wantsLuasPermukaan) return fmtGeo('Luas Permukaan Tabung', '2 × π × r × (r + t)', `2 × π × ${tnum(r)} × (${tnum(r)} + ${tnum(h)})`, 2 * PI * r * (r + h), 'satuan²');
    return null;
  }
  return null;
}

function tryStatistics(text) {
  const t = text.toLowerCase();
  const m = t.match(/(rata-rata|mean|median|modus|mode|simpangan\s*baku|standar\s*deviasi|stdev)\s+(?:dari|of)\s+([\d.,\s]+)/i);
  if (!m) return null;
  const kind = m[1];
  const nums = m[2]
    .split(/[,\s]+/)
    .map((s) => parseFloat(s))
    .filter((n) => isFinite(n));
  if (nums.length < 2) return null;
  const n = nums.length;
  const sum = nums.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const listStr = nums.map(tnum).join(', ');

  if (/rata-rata|mean/.test(kind)) {
    return `Rata-rata dari ${listStr}\n= (${nums.map(tnum).join(' + ')}) / ${n}\n= ${tnum(r3(sum))} / ${n}\n= ${tnum(r3(mean))}`;
  }
  if (/median/.test(kind)) {
    const sorted = [...nums].sort((a, b) => a - b);
    const mid = Math.floor(n / 2);
    const med = n % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    return `Median dari ${listStr}\nData terurut: ${sorted.map(tnum).join(', ')}\nMedian = ${tnum(r3(med))}`;
  }
  if (/modus|mode/.test(kind)) {
    const freq = new Map();
    nums.forEach((x) => freq.set(x, (freq.get(x) || 0) + 1));
    let max = 0;
    let modes = [];
    freq.forEach((c, v) => {
      if (c > max) {
        max = c;
        modes = [v];
      } else if (c === max) {
        modes.push(v);
      }
    });
    if (max <= 1) return `Modus dari ${listStr}\nSemua nilai muncul sama banyak, tidak ada modus tunggal.`;
    return `Modus dari ${listStr}\nModus = ${modes.map(tnum).join(', ')} (muncul ${max}x)`;
  }
  const variance = nums.reduce((a, x) => a + (x - mean) ** 2, 0) / n;
  const sd = Math.sqrt(variance);
  return `Simpangan baku dari ${listStr}\nRata-rata = ${tnum(r3(mean))}\nVarians = ${tnum(r3(variance))}\nSimpangan baku = √${tnum(r3(variance))} = ${tnum(r3(sd))}`;
}

function tryCalculus(text) {
  const m = text.match(/(?:turunan\s+(?:dari|dari\s+fungsi)?|derivative\s+of)\s+(.+)/i);
  if (!m) return null;
  const expr = m[1].replace(/[?.]+$/, '').trim();
  const compact = expr.replace(/\s+/g, '');
  const terms = compact.match(/[+\-]?[^+\-]+/g);
  if (!terms || !terms.length) return null;
  const derived = [];
  for (const term of terms) {
    const tm = term.match(/^([+\-]?\d*\.?\d*)x(?:\^(\d+))?$/i);
    const cm = term.match(/^([+\-]?\d+\.?\d*)$/);
    if (tm) {
      const coefRaw = tm[1];
      const coef = coefRaw === '' || coefRaw === '+' ? 1 : coefRaw === '-' ? -1 : parseFloat(coefRaw);
      if (!isFinite(coef)) return null;
      const pow = tm[2] ? parseInt(tm[2], 10) : 1;
      const newCoef = coef * pow;
      const newPow = pow - 1;
      if (newCoef === 0) continue;
      if (newPow === 0) derived.push([newCoef, '']);
      else if (newPow === 1) derived.push([newCoef, 'x']);
      else derived.push([newCoef, 'x^' + newPow]);
    } else if (cm) {
      continue;
    } else {
      return null;
    }
  }
  const result = derived.length
    ? derived
        .map(([coef, varPart]) => (coef < 0 ? '- ' : '+ ') + (Math.abs(coef) === 1 && varPart ? '' : tnum(Math.abs(coef))) + varPart)
        .join(' ')
        .replace(/^\+ /, '')
    : '0';
  return `Turunan dari ${expr}\nGunakan aturan pangkat: d/dx[cxⁿ] = c·n·x^(n-1)\nHasil: f'(x) = ${result}`;
}

function boolWord(s) {
  if (/^(benar|true)$/i.test(s)) return true;
  if (/^(salah|false)$/i.test(s)) return false;
  return null;
}

function tryLogic(text) {
  const t = text.trim();
  let m = t.match(/^(benar|salah|true|false)\s+(dan|and|atau|or|xor)\s+(benar|salah|true|false)\??$/i);
  if (m) {
    const a = boolWord(m[1]);
    const b = boolWord(m[3]);
    const op = m[2].toLowerCase();
    let result;
    let opLabel;
    if (op === 'dan' || op === 'and') {
      result = a && b;
      opLabel = 'AND';
    } else if (op === 'atau' || op === 'or') {
      result = a || b;
      opLabel = 'OR';
    } else {
      result = a !== b;
      opLabel = 'XOR';
    }
    return `Evaluasi logika: ${m[1]} ${opLabel} ${m[3]}\nHasil: ${result ? 'Benar' : 'Salah'}`;
  }
  m = t.match(/^(bukan|not|tidak)\s+(benar|salah|true|false)\??$/i);
  if (m) {
    const a = boolWord(m[2]);
    return `Evaluasi logika: NOT ${m[2]}\nHasil: ${!a ? 'Benar' : 'Salah'}`;
  }
  return null;
}

function grab(text, labels) {
  for (const label of labels) {
    const re = new RegExp('\\b' + label + '\\b\\s*(?:nya)?\\s*(?:adalah|sebesar|=|:)?\\s*(-?\\d+(?:[.,]\\d+)?)', 'i');
    const m = text.match(re);
    if (m) return parseFloat(m[1].replace(',', '.'));
  }
  return null;
}

function fmtPhys(label, rumus, sub, hasil, satuan) {
  return `${label}\nRumus: ${rumus}\nSubstitusi: ${sub} = ${tnum(r3(hasil))} ${satuan}`;
}

const PHYSICS_FNS = [
  function newton2(t) {
    if (!/\bgaya\b/i.test(t) || /tekanan/i.test(t) || !/massa/i.test(t) || !/percepatan/i.test(t)) return null;
    const m = grab(t, ['massa']);
    const a = grab(t, ['percepatan']);
    if (m == null || a == null) return null;
    return fmtPhys('Gaya (Hukum Newton II)', 'F = m × a', `F = ${tnum(m)} × ${tnum(a)}`, m * a, 'N');
  },
  function kineticEnergy(t) {
    if (!/energi\s*kinetik/i.test(t)) return null;
    const m = grab(t, ['massa']);
    const v = grab(t, ['kecepatan']);
    if (m == null || v == null) return null;
    return fmtPhys('Energi Kinetik', 'EK = 0.5 × m × v²', `EK = 0.5 × ${tnum(m)} × ${tnum(v)}²`, 0.5 * m * v * v, 'J');
  },
  function potentialEnergy(t) {
    if (!/energi\s*potensial/i.test(t)) return null;
    const m = grab(t, ['massa']);
    const h = grab(t, ['tinggi']);
    if (m == null || h == null) return null;
    const g = 9.8;
    return fmtPhys('Energi Potensial', 'EP = m × g × h', `EP = ${tnum(m)} × ${g} × ${tnum(h)}`, m * g * h, 'J');
  },
  function work(t) {
    if (!/\busaha\b/i.test(t)) return null;
    const f = grab(t, ['gaya']);
    const d = grab(t, ['jarak']);
    if (f == null || d == null) return null;
    return fmtPhys('Usaha', 'W = F × d', `W = ${tnum(f)} × ${tnum(d)}`, f * d, 'J');
  },
  function power(t) {
    if (!/\bdaya\b/i.test(t)) return null;
    const w = grab(t, ['usaha']);
    const time = grab(t, ['waktu']);
    if (w == null || time == null) return null;
    return fmtPhys('Daya', 'P = W / t', `P = ${tnum(w)} / ${tnum(time)}`, w / time, 'W');
  },
  function ohm(t) {
    if (!/hukum\s*ohm|tegangan|arus|hambatan/i.test(t)) return null;
    const askV = /tegangan\s+jika|^(berapa|hitung|cari)\s+tegangan/i.test(t);
    const askI = /arus\s+jika|^(berapa|hitung|cari)\s+arus/i.test(t);
    const askR = /hambatan\s+jika|^(berapa|hitung|cari)\s+hambatan/i.test(t);
    const V = grab(t, ['tegangan']);
    const I = grab(t, ['arus']);
    const R = grab(t, ['hambatan']);
    if (askV && I != null && R != null) return fmtPhys('Tegangan (Hukum Ohm)', 'V = I × R', `V = ${tnum(I)} × ${tnum(R)}`, I * R, 'V');
    if (askI && V != null && R != null) return fmtPhys('Arus (Hukum Ohm)', 'I = V / R', `I = ${tnum(V)} / ${tnum(R)}`, V / R, 'A');
    if (askR && V != null && I != null) return fmtPhys('Hambatan (Hukum Ohm)', 'R = V / I', `R = ${tnum(V)} / ${tnum(I)}`, V / I, 'Ω');
    return null;
  },
  function density(t) {
    if (!/massa\s*jenis/i.test(t)) return null;
    const m = grab(t, ['massa']);
    const v = grab(t, ['volume']);
    if (m == null || v == null) return null;
    return fmtPhys('Massa Jenis', 'ρ = m / V', `ρ = ${tnum(m)} / ${tnum(v)}`, m / v, 'kg/m³');
  },
  function pressure(t) {
    if (!/\btekanan\b/i.test(t)) return null;
    const f = grab(t, ['gaya']);
    const a = grab(t, ['luas']);
    if (f == null || a == null) return null;
    return fmtPhys('Tekanan', 'P = F / A', `P = ${tnum(f)} / ${tnum(a)}`, f / a, 'Pa');
  },
  function waveSpeed(t) {
    if (!/cepat\s*rambat/i.test(t)) return null;
    const f = grab(t, ['frekuensi']);
    const lambda = grab(t, ['panjang\\s*gelombang']);
    if (f == null || lambda == null) return null;
    return fmtPhys('Cepat Rambat Gelombang', 'v = f × λ', `v = ${tnum(f)} × ${tnum(lambda)}`, f * lambda, 'm/s');
  },
  function kinematics(t) {
    if (!/kecepatan\s*akhir/i.test(t)) return null;
    const v0 = grab(t, ['kecepatan\\s*awal']);
    const a = grab(t, ['percepatan']);
    const time = grab(t, ['waktu']);
    if (v0 == null || a == null || time == null) return null;
    return fmtPhys('Kecepatan Akhir (Kinematika)', 'v = v0 + a × t', `v = ${tnum(v0)} + ${tnum(a)} × ${tnum(time)}`, v0 + a * time, 'm/s');
  },
];

function tryPhysics(text) {
  const t = text.trim();
  for (const fn of PHYSICS_FNS) {
    const r = fn(t);
    if (r) return r;
  }
  return null;
}

const TECH_CONCEPTS = {
  'load balancer': 'Load balancer adalah komponen yang membagi trafik masuk ke beberapa server agar beban kerja merata dan sistem tetap responsif saat trafik tinggi.',
  microservices: 'Microservices adalah pendekatan arsitektur software yang memecah aplikasi besar menjadi layanan-layanan kecil independen yang saling berkomunikasi lewat API.',
  'ci/cd': 'CI/CD (Continuous Integration/Continuous Deployment) adalah praktik otomatisasi build, test, dan deploy kode setiap ada perubahan, agar rilis software lebih cepat dan minim error.',
  'version control': 'Version control adalah sistem yang melacak perubahan kode dari waktu ke waktu, memungkinkan banyak orang berkolaborasi dan kembali ke versi sebelumnya bila perlu. Contoh: Git.',
  'unit testing': 'Unit testing adalah pengujian bagian terkecil dari kode (fungsi/metode) secara terisolasi untuk memastikan bagian itu bekerja sesuai harapan.',
  'rest api': 'REST API adalah gaya arsitektur API yang menggunakan method HTTP standar (GET, POST, PUT, DELETE) untuk mengakses dan memanipulasi data lewat URL.',
  gpu: 'GPU (Graphics Processing Unit) adalah prosesor yang dirancang untuk menjalankan banyak perhitungan sederhana secara paralel, awalnya untuk grafis, kini juga dipakai untuk AI.',
  cpu: 'CPU (Central Processing Unit) adalah otak utama komputer yang menjalankan instruksi program secara berurutan dengan kecepatan tinggi.',
  kompiler: 'Kompiler adalah program yang menerjemahkan seluruh kode sumber ke bahasa mesin sekaligus sebelum dijalankan, menghasilkan file yang bisa dieksekusi langsung.',
  interpreter: 'Interpreter adalah program yang menerjemahkan dan menjalankan kode sumber baris per baris saat program berjalan, tanpa kompilasi penuh di awal.',
};

function tryTechConcept(text) {
  const t = text.toLowerCase();
  if (!/^(apa\s*itu|jelaskan|apa\s*yang\s*dimaksud\s*dengan)\b/.test(t)) return null;
  for (const key of Object.keys(TECH_CONCEPTS)) {
    if (t.includes(key)) return TECH_CONCEPTS[key];
  }
  return null;
}

const TROUBLESHOOT = [
  { match: /wifi.*(tidak\s*(mau\s*)?connect|gak\s*connect|tidak\s*konek|tidak\s*nyambung)/i, title: 'WiFi Tidak Bisa Connect', steps: ['Restart router dan perangkat', 'Pastikan password WiFi benar', 'Lupakan (forget) jaringan lalu sambungkan ulang', 'Cek apakah perangkat lain juga gagal connect (berarti masalah di router)', 'Update driver WiFi perangkat'] },
  { match: /laptop.*(lambat|lemot|lelet)/i, title: 'Laptop Lambat', steps: ['Tutup aplikasi yang tidak dipakai di background', 'Cek Task Manager untuk proses yang makan resource besar', 'Bersihkan file sementara/cache', 'Scan malware/virus', 'Pertimbangkan upgrade RAM atau ganti ke SSD'] },
  { match: /(hp|handphone|ponsel).*(cepat\s*)?panas/i, title: 'HP Cepat Panas', steps: ['Tutup aplikasi berat yang berjalan di background', 'Lepas case saat charging atau main game berat', 'Hindari pakai HP sambil di-charge', 'Kurangi kecerahan layar', 'Update aplikasi dan sistem ke versi terbaru'] },
  { match: /(layar\s*biru|blue\s*screen)/i, title: 'Blue Screen (BSOD)', steps: ['Catat kode error yang muncul di layar biru', 'Restart komputer dan cek apakah berulang', 'Update driver, terutama driver GPU', 'Jalankan Windows Update', 'Cek RAM dengan Memory Diagnostic bila BSOD sering terjadi'] },
  { match: /force\s*close|aplikasi.*tiba-tiba\s*(nutup|keluar|berhenti)/i, title: 'Aplikasi Force Close', steps: ['Clear cache aplikasi tersebut', 'Update aplikasi ke versi terbaru', 'Restart HP', 'Cek ruang penyimpanan yang tersisa', 'Uninstall lalu install ulang aplikasi bila masih bermasalah'] },
  { match: /baterai.*(boros|cepat\s*habis)/i, title: 'Baterai Boros', steps: ['Cek aplikasi yang paling banyak menyerap baterai di pengaturan', 'Matikan lokasi/GPS dan sinkronisasi latar belakang yang tidak perlu', 'Turunkan kecerahan layar', 'Nonaktifkan notifikasi push yang tidak penting', 'Aktifkan mode hemat baterai'] },
  { match: /internet.*(lambat|lemot)/i, title: 'Internet Lambat', steps: ['Restart modem/router', 'Cek jumlah perangkat yang terhubung bersamaan', 'Tes kecepatan lewat speed test', 'Pindah ke frekuensi 5GHz bila tersedia', 'Hubungi provider bila masalah terus terjadi'] },
  { match: /printer.*(tidak\s*terdeteksi|tidak\s*konek|tidak\s*connect)/i, title: 'Printer Tidak Terdeteksi', steps: ['Pastikan kabel/koneksi WiFi printer aktif', 'Restart printer dan komputer', 'Install ulang atau update driver printer', 'Cek printer diset sebagai default device', 'Coba port USB atau jaringan lain'] },
  { match: /keyboard.*(tidak\s*(bisa\s*)?berfungsi|tidak\s*(ke)?respon)/i, title: 'Keyboard Tidak Berfungsi', steps: ['Cek koneksi kabel/Bluetooth keyboard', 'Coba keyboard di perangkat lain untuk isolasi masalah', 'Update atau instal ulang driver keyboard', 'Bersihkan debu di sela-sela tombol', 'Restart perangkat'] },
  { match: /email.*(tidak\s*bisa\s*terkirim|gagal\s*terkirim)/i, title: 'Email Gagal Terkirim', steps: ['Cek koneksi internet', 'Pastikan ukuran lampiran tidak melebihi batas', 'Cek alamat penerima sudah benar', 'Cek folder Outbox/Drafts untuk email yang tersangkut', 'Coba logout lalu login ulang ke akun email'] },
];

function tryTroubleshoot(text) {
  const t = text.toLowerCase();
  for (const item of TROUBLESHOOT) {
    if (item.match.test(t)) {
      return `${item.title} — coba langkah berikut:\n` + item.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
    }
  }
  return null;
}

const SCIENCE_FIELDS = {
  biologi: 'Biologi adalah cabang ilmu pengetahuan alam yang mempelajari makhluk hidup — mulai dari struktur sel, cara kerja tubuh, hingga interaksi antar makhluk hidup dan lingkungannya.',
  fisika: 'Fisika adalah cabang ilmu pengetahuan alam yang mempelajari materi, energi, dan interaksi antara keduanya — mencakup gerak, gaya, panas, cahaya, listrik, hingga struktur alam semesta.',
  kimia: 'Kimia adalah cabang ilmu pengetahuan alam yang mempelajari komposisi, struktur, sifat, dan perubahan zat — termasuk bagaimana unsur dan senyawa bereaksi membentuk zat baru.',
};

function tryScienceField(text) {
  const t = text.toLowerCase();
  if (!/^(apa\s*itu|jelaskan|apa\s*yang\s*dimaksud\s*dengan)\b/.test(t)) return null;
  for (const key of Object.keys(SCIENCE_FIELDS)) {
    if (new RegExp('\\b' + key + '\\b').test(t)) return SCIENCE_FIELDS[key];
  }
  return null;
}

const BODY_SYSTEMS = {
  'sistem pencernaan': 'Sistem pencernaan adalah rangkaian organ (mulut, kerongkongan, lambung, usus halus, usus besar) yang memecah makanan menjadi nutrisi yang bisa diserap tubuh.',
  'sistem pernapasan': 'Sistem pernapasan (hidung, tenggorokan, paru-paru) berfungsi menghirup oksigen dan mengeluarkan karbon dioksida lewat proses bernapas.',
  'sistem saraf': 'Sistem saraf (otak, sumsum tulang belakang, saraf tepi) mengatur dan mengoordinasikan semua fungsi tubuh serta merespons rangsangan dari luar.',
  'sistem ekskresi': 'Sistem ekskresi (ginjal, kulit, paru-paru, hati) berfungsi membuang zat sisa metabolisme yang tidak diperlukan tubuh, seperti urine dan keringat.',
  'sistem otot': 'Sistem otot terdiri dari otot rangka, otot polos, dan otot jantung yang bekerja sama menggerakkan tubuh dan organ dalam.',
  'sistem rangka': 'Sistem rangka (tulang dan sendi) memberi bentuk serta menopang tubuh, melindungi organ dalam, dan menjadi tempat melekatnya otot.',
  'sistem reproduksi': 'Sistem reproduksi adalah organ-organ yang berperan dalam proses perkembangbiakan dan menghasilkan keturunan pada makhluk hidup.',
  'sistem endokrin': 'Sistem endokrin adalah kumpulan kelenjar (seperti tiroid, pankreas, adrenal) yang menghasilkan hormon untuk mengatur berbagai fungsi tubuh.',
};

function tryBodySystem(text) {
  const t = text.toLowerCase();
  if (!/^(apa\s*itu|jelaskan|fungsi(\s*dari)?)\b/.test(t)) return null;
  for (const key of Object.keys(BODY_SYSTEMS)) {
    if (t.includes(key)) return BODY_SYSTEMS[key];
  }
  return null;
}

function tryClassification(text) {
  const t = text.toLowerCase();
  if (/klasifikasi\s*makhluk\s*hidup|tingkatan\s*takson/i.test(t)) {
    return 'Klasifikasi makhluk hidup (taksonomi) mengurutkan dari tingkat paling luas ke sempit: Kingdom (Kerajaan) → Filum/Divisio → Kelas → Ordo → Famili → Genus → Spesies. Semakin ke bawah, anggotanya semakin mirip satu sama lain.';
  }
  if (/contoh\s*hewan\s*vertebrata|hewan\s*bertulang\s*belakang/i.test(t)) {
    return 'Vertebrata (hewan bertulang belakang) terbagi 5 kelas utama: Pisces/ikan (contoh: hiu), Amfibi (contoh: katak), Reptil (contoh: buaya), Aves/burung (contoh: elang), dan Mamalia (contoh: kucing, paus).';
  }
  if (/contoh\s*hewan\s*invertebrata|hewan\s*tidak\s*bertulang\s*belakang/i.test(t)) {
    return 'Invertebrata (hewan tanpa tulang belakang) contohnya: serangga (semut, kupu-kupu), moluska (siput, cumi-cumi), cacing, dan echinodermata (bintang laut).';
  }
  return null;
}

function tryEcology(text) {
  const t = text.toLowerCase();
  if (/simbiosis\s*mutualisme/i.test(t)) return 'Simbiosis mutualisme adalah hubungan antar makhluk hidup berbeda spesies yang saling menguntungkan kedua belah pihak. Contoh: lebah dan bunga — lebah dapat nektar, bunga terbantu penyerbukan.';
  if (/simbiosis\s*komensalisme/i.test(t)) return 'Simbiosis komensalisme adalah hubungan di mana satu pihak untung, pihak lain tidak dirugikan maupun diuntungkan. Contoh: ikan remora yang menempel di hiu untuk sisa makanan, tanpa merugikan hiu.';
  if (/simbiosis\s*parasitisme/i.test(t)) return 'Simbiosis parasitisme adalah hubungan di mana satu pihak (parasit) diuntungkan sementara pihak lain (inang) dirugikan. Contoh: kutu pada hewan, cacing pita pada usus manusia.';
  if (/^(apa\s*itu\s*)?simbiosis\b/i.test(t) && !/mutualisme|komensalisme|parasitisme/.test(t)) {
    return 'Simbiosis adalah hubungan interaksi erat antara dua makhluk hidup berbeda spesies. Ada 3 jenis utama: mutualisme (saling untung), komensalisme (satu untung, satu netral), dan parasitisme (satu untung, satu rugi).';
  }
  if (/siklus\s*air/i.test(t)) return 'Siklus air (siklus hidrologi) adalah perputaran air di bumi: evaporasi (penguapan) → kondensasi (jadi awan) → presipitasi (hujan) → mengalir kembali ke laut/sungai, lalu berulang.';
  if (/siklus\s*karbon/i.test(t)) return 'Siklus karbon adalah perputaran karbon antara atmosfer, tumbuhan, hewan, dan tanah — lewat fotosintesis (menyerap CO2), respirasi, dan pembusukan (melepas CO2 kembali).';
  if (/siklus\s*nitrogen/i.test(t)) return 'Siklus nitrogen adalah perputaran nitrogen di alam: fiksasi nitrogen oleh bakteri di tanah/akar → diserap tumbuhan → berpindah lewat rantai makanan → kembali ke tanah lewat penguraian dan denitrifikasi.';
  return null;
}

const HEALTH_INFO = {
  'sakit kepala': 'Sakit kepala umumnya dipicu oleh kurang tidur, dehidrasi, stres, mata lelah, atau posisi duduk yang salah dalam waktu lama.',
  pusing: 'Pusing bisa disebabkan oleh tekanan darah yang naik-turun, dehidrasi, kurang makan, atau masalah pada telinga bagian dalam.',
  'sakit perut': 'Sakit perut umumnya dipicu oleh masuk angin, makan tidak teratur, makanan yang tidak cocok, atau asam lambung naik.',
  demam: 'Demam biasanya adalah respons tubuh melawan infeksi virus atau bakteri, ditandai suhu tubuh di atas 37.5°C.',
  batuk: 'Batuk umumnya adalah refleks tubuh membersihkan saluran napas dari iritasi, lendir, debu, atau infeksi ringan.',
  pilek: 'Pilek biasanya disebabkan infeksi virus pada saluran pernapasan atas, ditandai hidung tersumbat atau berair.',
  'susah tidur': 'Susah tidur (insomnia) bisa dipicu stres, kebiasaan main gawai sebelum tidur, kafein berlebih, atau jadwal tidur yang tidak teratur.',
  mual: 'Mual bisa dipicu masuk angin, makan berlebihan, mabuk perjalanan, atau efek samping tertentu.',
  diare: 'Diare umumnya dipicu infeksi bakteri/virus pada pencernaan, makanan yang tidak higienis, atau intoleransi makanan tertentu.',
};

function tryHealthInfo(text) {
  const t = text.toLowerCase();
  const symptomTrigger = /kenapa|penyebab|apa\s*yang\s*menyebabkan|terus[- ]?menerus|\bsering\b/i.test(t);
  if (!symptomTrigger) return null;
  for (const key of Object.keys(HEALTH_INFO)) {
    if (t.includes(key)) {
      return HEALTH_INFO[key] + '\n\nCatatan: ini bukan diagnosis medis. Kalau berlanjut atau memberat, sebaiknya konsultasikan ke dokter atau layanan kesehatan terdekat.';
    }
  }
  return null;
}

function tryStem(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  return (
    tryAlgebra(t) ||
    tryGeometry(t) ||
    tryStatistics(t) ||
    tryCalculus(t) ||
    tryLogic(t) ||
    tryPhysics(t) ||
    tryTechConcept(t) ||
    tryTroubleshoot(t) ||
    tryScienceField(t) ||
    tryBodySystem(t) ||
    tryClassification(t) ||
    tryEcology(t) ||
    tryHealthInfo(t) ||
    null
  );
}

export const stemEngine = Object.freeze({
  tryAlgebra,
  tryGeometry,
  tryStatistics,
  tryCalculus,
  tryLogic,
  tryPhysics,
  tryTechConcept,
  tryTroubleshoot,
  tryScienceField,
  tryBodySystem,
  tryClassification,
  tryEcology,
  tryHealthInfo,
  tryStem,
});
