// Migrasi satu-kali (one-time): pindahkan data sapaan/smalltalk yang tadinya
// jadi konstanta literal di raget/raget-llm/llm-engine.js ke skema JSON
// tunggal Fase B (lihat roadmap vNext §3): {id, kategori, wilayah, nama,
// tags, teks, meta}. Ini prasyarat yang disebut roadmap vNext §4 sebelum
// scripts/dataries-ke-korpus.mjs bisa merender dialog sapaan tanpa parsing
// JS - sumbernya sekarang JSON murni.
//
// Isi array di bawah adalah SALINAN dari konstanta yang ada di
// llm-engine.js pada saat migrasi ini ditulis (TIME_GREETING_TEMPLATES,
// PLAIN_GREETING_TEMPLATES, SMALLTALK, FOLLOWUPS). Setelah dijalankan,
// llm-engine.js ditulis ulang jadi loader tipis yang fetch() file JSON ini -
// skrip ini sendiri jadi arsip/riwayat migrasi, bukan untuk dijalankan
// ulang (menjalankannya lagi cuma menulis ulang file yang sama).
//
// Pakai: node raget/raget-tools/migrate-sapaan-domain.mjs

import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'raget', 'raget-data', 'json', 'sapaan');
const OUT_FILE = path.join(OUT_DIR, 'sapaan.json');

const TIME_GREETING_TEMPLATES = {
  pagi: [
    'Selamat pagi! Ada yang bisa saya bantu?',
    'Pagi! Semoga harimu menyenangkan, mau mulai dari mana?',
    'Pagi juga, ada rencana apa hari ini?',
  ],
  siang: ['Selamat siang! Ada yang bisa dibantu?', 'Siang, gimana harimu sejauh ini? Yuk, mau bahas apa?'],
  sore: ['Selamat sore! Ada yang bisa saya bantu?', 'Sore juga, gimana harimu sejauh ini?'],
  malam: [
    'Selamat malam! Ada yang bisa saya bantu?',
    'Malam juga, mau ngobrol soal apa malam ini?',
    'Malam, semoga harimu berjalan baik. Ada yang bisa dibantu?',
  ],
};

const PLAIN_GREETING_TEMPLATES = [
  'Halo! Saya {name}, ada yang bisa dibantu?',
  'Hai, senang bisa ngobrol denganmu. Mau bahas apa?',
  'Halo juga! Ceritakan apa yang sedang kamu pikirkan.',
];

const SMALLTALK = [
  {
    key: 'siapa',
    templates: [
      'Saya {name}, asisten lokal di Rategoan — semua obrolan kita tersimpan di perangkatmu sendiri.',
      'Kenalkan, saya {name}. Saya bisa bantu jawab, ringkas, hitung, dan ingat hal penting selama kita ngobrol.',
    ],
  },
  {
    key: 'kabar',
    templates: [
      'Saya baik, terima kasih sudah nanya! Kamu sendiri gimana kabarnya?',
      'Baik-baik saja di sini. Ada yang ingin kamu ceritakan hari ini?',
    ],
    templatesFormal: [
      'Saya baik, terima kasih sudah bertanya. Bagaimana kabar Anda hari ini?',
      'Baik-baik saja, terima kasih. Ada yang bisa saya bantu?',
    ],
  },
  {
    key: 'terima_kasih',
    templates: ['Sama-sama! Kalau ada pertanyaan lain, tinggal tanya saja.', 'Senang bisa bantu. Ada lagi yang mau ditanyakan?'],
  },
  {
    key: 'jumpa',
    templates: [
      'Sampai jumpa! Saya di sini kalau kamu butuh sesuatu lagi.',
      'Dadah! Jangan ragu balik lagi kalau ada yang mau dibahas.',
    ],
  },
  {
    key: 'kemampuan',
    templates: [
      'Saya bisa ngobrol, meringkas teks, menghitung, kasih ide konten, jelaskan istilah, dan mengingat hal penting soal kamu — semua tanpa internet.',
      'Beberapa hal yang bisa saya bantu: ringkas, hitung, cari info dari catatan, dan nemenin ngobrol santai.',
    ],
  },
];

const FOLLOWUPS = {
  greeting: ['Ada topik tertentu yang ingin kamu bahas?', 'Mau mulai dari mana hari ini?'],
  smalltalk: ['Ada hal lain yang ingin kamu ceritakan?'],
};

function buildRecords() {
  const records = [];

  for (const periode of Object.keys(TIME_GREETING_TEMPLATES)) {
    const variants = TIME_GREETING_TEMPLATES[periode];
    records.push({
      id: 'sapaan-waktu-' + periode,
      kategori: 'sapaan',
      wilayah: null,
      nama: 'Sapaan waktu: ' + periode,
      tags: ['waktu', periode],
      teks: variants[0],
      meta: { jenis: 'waktu', periode, variants },
    });
  }

  records.push({
    id: 'sapaan-plain',
    kategori: 'sapaan',
    wilayah: null,
    nama: 'Sapaan umum',
    tags: ['plain'],
    teks: PLAIN_GREETING_TEMPLATES[0],
    meta: { jenis: 'plain', variants: PLAIN_GREETING_TEMPLATES },
  });

  for (const entry of SMALLTALK) {
    records.push({
      id: 'sapaan-smalltalk-' + entry.key,
      kategori: 'sapaan',
      wilayah: null,
      nama: 'Smalltalk: ' + entry.key,
      tags: ['smalltalk', entry.key],
      teks: entry.templates[0],
      meta: {
        jenis: 'smalltalk',
        key: entry.key,
        variants: entry.templates,
        variantsFormal: entry.templatesFormal || null,
      },
    });
  }

  records.push({
    id: 'sapaan-followup',
    kategori: 'sapaan',
    wilayah: null,
    nama: 'Follow-up singkat setelah sapaan',
    tags: ['followup'],
    teks: FOLLOWUPS.greeting[0],
    meta: { jenis: 'followup', greeting: FOLLOWUPS.greeting, smalltalk: FOLLOWUPS.smalltalk },
  });

  return records;
}

function main() {
  const records = buildRecords();
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(records, null, 2) + '\n', 'utf8');
  console.log('Ditulis:', path.relative(ROOT, OUT_FILE), '-', records.length, 'entri.');
}

main();
