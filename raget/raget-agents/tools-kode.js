import { llmCodeParser } from '../raget-neural/llm-code-parser.js';
import { syntaxValidator } from './syntax-validator.js';

const PACK_URL = new URL('../raget-data/jsonl/kode/code-pack.jsonl', import.meta.url);

let packCache = null;

const CODE_LANG_RE =
  /\b(javascript|ecmascript|\bjs\b|python|\bpy\b|html5?|\bcss\b|typescript|node\.?js)\b/i;
const CODE_TOKEN_RE =
  /\b(kode|coding|ngoding|pemrograman|programmer|syntax|sintaks|console\.log|consle\.log|document\.|queryselector|json\.parse|array\.map|async\s+await|const\s+|let\s+|var\s+|function\b|def\s+\w+\s*\(|<\/?[a-z][\s>]|npm\b)\b/i;
const CODE_ASK_RE =
  /\b(tulis\s+(fungsi|function|kode|script)|buat(kan)?\s+(fungsi|function|kode|script)|perbaiki\s+(kode|bug|syntax|sintaks)|refactor|cuplikan)\b/i;
const BIO_RE = /\b(organ|jantung|paru|hati|ginjal|otak\s+manusia|tumbuhan)\b/i;

function isCodeQuestion(prompt) {
  const t = String(prompt || '');
  if (!t.trim()) return false;
  if (/^(selamat|halo|hai|pagi|siang|sore|malam|apa\s+kabar|kabar)\b/i.test(t.trim())) return false;
  if (BIO_RE.test(t) && !CODE_LANG_RE.test(t) && !CODE_TOKEN_RE.test(t)) return false;
  return CODE_LANG_RE.test(t) || CODE_TOKEN_RE.test(t) || CODE_ASK_RE.test(t);
}

function detectLang(prompt) {
  return llmCodeParser.detectLang(prompt, prompt);
}

async function loadPack() {
  if (packCache) return packCache;
  try {
    const res = await fetch(PACK_URL);
    const raw = res.ok ? await res.text() : '';
    packCache = raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
  } catch (e) {
    packCache = [];
  }
  return packCache;
}

function scoreHit(q, row) {
  const hay = (
    (row.instruction || '') +
    ' ' +
    (row.text || '') +
    ' ' +
    (row.code || '') +
    ' ' +
    (row.lang || '')
  ).toLowerCase();
  const words = String(q || '')
    .toLowerCase()
    .split(/[^a-z0-9_]+/)
    .filter((w) => w.length > 2);
  let n = 0;
  words.forEach((w) => {
    if (hay.includes(w)) n++;
  });
  return n;
}

async function retrieve(prompt, limit) {
  const pack = await loadPack();
  const ranked = pack
    .map((row) => ({ row, score: scoreHit(prompt, row) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit || 3)
    .map((x) => x.row);
  return ranked;
}

function fence(lang, code) {
  const tag = lang === 'py' ? 'python' : lang === 'html' ? 'html' : lang === 'css' ? 'css' : 'javascript';
  return '```' + tag + '\n' + String(code || '').replace(/\s+$/, '') + '\n```';
}

function builtIn(prompt) {
  const t = String(prompt || '').toLowerCase();
  const table = [
    {
      re: /function|fungsi/.test(t) && /javascript|\bjs\b/.test(t) && !/jumlah|palindrome|map|filter|class/.test(t),
      text: 'Function di JavaScript adalah blok bernama yang menerima argumen, mengeksekusi isi, lalu bisa mengembalikan nilai. Pakai deklarasi `function`, ekspresi, atau panah `=>`.',
      code: 'function jumlah(a, b) {\n  return a + b;\n}\n\nconst kali = (a, b) => a * b;\njumlah(2, 3);',
      lang: 'js',
    },
    {
      re: /consle|console\.log/.test(t) && /perbaiki|betulkan|fix/.test(t),
      text: 'Typo `consle` harus `console`. Objek `console` punya metode `log` untuk menulis ke konsol.',
      code: 'console.log("a");',
      lang: 'js',
    },
    {
      re: /jumlah\s*\(|tulis\s+fungsi\s+jumlah/.test(t) && /python|\bpy\b/.test(t),
      text: 'Fungsi jumlah menerima dua angka lalu mengembalikan hasil tambah.',
      code: 'def jumlah(a, b):\n    return a + b\n\nprint(jumlah(2, 3))',
      lang: 'py',
    },
    {
      re: /jumlah\s*\(|tulis\s+fungsi\s+jumlah/.test(t),
      text: 'Fungsi jumlah menerima dua angka lalu mengembalikan hasil tambah.',
      code: 'function jumlah(a, b) {\n  return a + b;\n}',
      lang: 'js',
    },
    {
      re: /palindrome/.test(t),
      text: 'Palindrome dibaca sama dari kiri dan kanan. Bandingkan string dengan kebalikannya.',
      code: 'function palindrome(s) {\n  const n = String(s).toLowerCase().replace(/[^a-z0-9]/g, "");\n  return n === n.split("").reverse().join("");\n}',
      lang: 'js',
    },
    {
      re: /fizzbuzz/.test(t),
      text: 'Fizzbuzz: kelipatan 3 tulis fizz, 5 buzz, keduanya fizzbuzz.',
      code: 'function fizzbuzz(n) {\n  const out = [];\n  for (let i = 1; i <= n; i++) {\n    if (i % 15 === 0) out.push("fizzbuzz");\n    else if (i % 3 === 0) out.push("fizz");\n    else if (i % 5 === 0) out.push("buzz");\n    else out.push(String(i));\n  }\n  return out;\n}\nfizzbuzz(15);',
      lang: 'js',
    },
    {
      re: /\.map|array map/.test(t),
      text: 'Contoh `map` merubah tiap elemen tanpa mengubah array asal.',
      code: 'const a = [1, 2, 3];\nconst x = a.map((n) => n * 2);\n// x = [2, 4, 6]',
      lang: 'js',
    },
    {
      re: /filter/.test(t),
      text: 'Contoh `filter` menyimpan elemen yang lolos uji.',
      code: 'const a = [1, 2, 3, 4];\nconst genap = a.filter((n) => n % 2 === 0);',
      lang: 'js',
    },
    {
      re: /async|await|fetch/.test(t),
      text: 'async/await menunda sampai Promise selesai. fetch mengambil JSON dari jaringan.',
      code: 'async function ambilJson(url) {\n  const res = await fetch(url);\n  return await res.json();\n}',
      lang: 'js',
    },
    {
      re: /queryselector|dom/.test(t),
      text: 'querySelector mengambil satu elemen DOM yang cocok dengan pemilih CSS.',
      code: 'const el = document.querySelector("#nama");\nif (el) el.textContent = "Raget";',
      lang: 'js',
    },
    {
      re: /json\.parse|parse json/.test(t),
      text: 'JSON.parse mengubah teks JSON menjadi objek. Bungkus dengan try/catch.',
      code: 'function parseAman(s) {\n  try {\n    return JSON.parse(s);\n  } catch (e) {\n    return null;\n  }\n}',
      lang: 'js',
    },
    {
      re: /class /.test(t) || /class javascript|buat class/.test(t),
      text: 'Class JavaScript merangkum data dan metode. constructor dipanggil saat `new`.',
      code: 'class Mobil {\n  constructor(merk) {\n    this.merk = merk;\n  }\n  info() {\n    return "Mobil " + this.merk;\n  }\n}',
      lang: 'js',
    },
    {
      re: /html form|<form/.test(t),
      text: 'Form HTML mengumpulkan input pengguna. Field `nama` memakai atribut name.',
      code: '<form action="/kirim" method="post">\n  <label>Nama <input name="nama" required></label>\n  <button type="submit">Kirim</button>\n</form>',
      lang: 'html',
    },
    {
      re: /css|box model|padding|margin/.test(t),
      text: 'Box model: content + padding + border + margin. Padding di dalam, margin di luar.',
      code: '.kartu {\n  padding: 16px;\n  margin: 8px;\n  border: 1px solid #ccc;\n  box-sizing: border-box;\n}',
      lang: 'css',
    },
    {
      re: /for loop|perulangan/.test(t),
      text: 'for loop menelusuri indeks array dari 0 sampai length-1.',
      code: 'const a = ["a", "b", "c"];\nfor (let i = 0; i < a.length; i++) {\n  console.log(a[i]);\n}',
      lang: 'js',
    },
    {
      re: /try catch|try\/catch/.test(t),
      text: 'try/catch menahan error agar program tidak mati. Lempar Error jika perlu.',
      code: 'try {\n  JSON.parse("{");\n} catch (e) {\n  console.log("gagal parse");\n}',
      lang: 'js',
    },
    {
      re: /arrow function|panah/.test(t),
      text: 'Arrow function ringkas untuk callback. `this` tidak diikat ulang.',
      code: 'const kaliDua = (n) => n * 2;\n[1, 2, 3].map(kaliDua);',
      lang: 'js',
    },
    {
      re: /reduce/.test(t),
      text: 'reduce menggabungkan elemen menjadi satu nilai, misalnya jumlah.',
      code: 'const jumlah = [1, 2, 3, 4].reduce((acc, n) => acc + n, 0);',
      lang: 'js',
    },
    {
      re: /settimeout/.test(t),
      text: 'setTimeout menjalankan fungsi setelah jeda milidetik. 1000 ms = 1 detik.',
      code: 'setTimeout(() => {\n  console.log("satu detik");\n}, 1000);',
      lang: 'js',
    },
  ];
  for (const row of table) {
    if (row.re) return row;
  }
  return null;
}

async function compose(prompt) {
  const builtin = builtIn(prompt);
  const hits = await retrieve(prompt, 2);
  const lang = detectLang(prompt);
  let text;
  let code;
  let usedLang = lang;
  if (builtin) {
    text = builtin.text;
    code = builtin.code;
    usedLang = builtin.lang;
  } else if (hits.length && hits[0].code) {
    text = hits[0].text || hits[0].instruction || 'Contoh dari pack kode Raget.';
    code = hits[0].code;
    usedLang = hits[0].lang || lang;
  } else {
    text =
      'Saya bisa bantu cuplikan pendek JavaScript/Python/HTML. Tulis niatnya (fungsi, perbaiki typo, atau jelaskan baris). Ini bukan Copilot: cuplikan kecil, bukan repo utuh.';
    code = 'function hello(nama) {\n  return "Halo, " + nama;\n}';
    usedLang = 'js';
  }
  const body = text.trim() + '\n\n' + fence(usedLang, code);
  const qc = syntaxValidator.validateFence(body);
  const jsQc = usedLang === 'js' ? syntaxValidator.validateJs(code) : { ok: true, issues: [] };
  if (!qc.ok || !jsQc.ok) {
    return {
      text: text.trim() + '\n\n(Cuplikan ditahan: ' + (qc.issues.concat(jsQc.issues).join(', ') || 'qc') + '.)',
      engine: 'kode',
      qc: { fence: qc, js: jsQc },
    };
  }
  return { text: body, engine: 'kode', lang: usedLang, qc: { fence: qc, js: jsQc } };
}

async function run(kind, prompt) {
  if (kind !== 'kode' && !isCodeQuestion(prompt)) return null;
  const out = await compose(prompt);
  return out && out.text;
}

function source() {
  return { table: true, weights: false, download: false };
}

export const toolsKode = Object.freeze({
  isCodeQuestion,
  detectLang,
  retrieve,
  compose,
  run,
  source,
  handles: (kind) => kind === 'kode',
});
