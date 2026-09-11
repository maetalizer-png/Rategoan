#!/usr/bin/env node
// Otomatisasi PRD-RELEASE.md §5b langkah 10 - GABUNG KE KANONIK.
//
// Sebelum ada skrip ini, langkah "update kanonik.entries di git" dikerjakan
// MANUAL: buka Release, baca angka, ketik ulang ke korpus-manifest-total.json
// satu-satu. Manual = gampang lupa/salah ketik/salah baca asset yang mana -
// inilah sumber kebingungan berulang ("udah diupload, kok belum masuk?").
//
// Skrip ini menutup celah itu: ambil manifest kategori LANGSUNG dari 3 tag
// Release resmi (§2), verifikasi SHA256-nya melawan digest asset gzip
// (Gerbang 1b PRD §4), lalu tulis ulang kanonik.entries + SEMUA field
// turunan (total, ringkasanTotal, targetTercapai) otomatis dari situ -
// tidak ada lagi angka yang diketik tangan terpisah dari sumbernya.
//
// Pakai:
//   GH_TOKEN=... node raget/raget-tools/sync-manifest-from-release.mjs
//   (mode --dry-run: tampilkan apa yang AKAN berubah, tidak menulis file)
//
// Exit code: 0 = sinkron (baik sudah sinkron dari awal, atau berhasil
// disinkronkan). 1 = ada asset yang gagal diverifikasi (SHA256 tidak
// cocok, atau manifest kategori tidak ketemu) - TIDAK menulis apa pun.

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execFileSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = join(__dirname, '../raget-data/jsonl/external/korpus-manifest-total.json');
const OWNER = 'maetalizer-png';
const REPO = 'Rategoan';

// Node global fetch (undici) TIDAK otomatis lewat proxy sandbox ini
// (https_proxy env var), beda dari curl yang otomatis menghormatinya -
// jadi HTTP request di skrip ini sengaja shell-out ke curl, bukan fetch().
function curlJson(url, accept) {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  const args = ['-sSL', '-w', '\n%{http_code}', '-H', `Accept: ${accept || 'application/vnd.github+json'}`];
  if (token) args.push('-H', `Authorization: token ${token}`);
  args.push(url);
  const out = execFileSync('curl', args, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 200 });
  const idx = out.lastIndexOf('\n');
  const body = out.slice(0, idx);
  const status = Number(out.slice(idx + 1));
  if (status < 200 || status >= 300) throw new Error(`${url} -> HTTP ${status}`);
  return JSON.parse(body);
}

// Satu-satunya 3 tag kanonik yang sah - lihat PRD-RELEASE.md §2. Nama
// "rak" harus PERSIS sama dengan yang tertulis di kanonik.entries[].rak
// supaya skrip tahu entry mana yang ditimpa.
const RAK_BY_TAG = {
  'korpus-ensiklopedia-bersih': 'K1 korpus-ensiklopedia-bersih',
  'korpus-dialog-daerah-bersih': 'K2 korpus-dialog-daerah-bersih',
  'korpus-pelengkap-bersih': 'K3 korpus-pelengkap-bersih',
};

const isDryRun = process.argv.includes('--dry-run');

function fmt(n) {
  return n.toLocaleString('id-ID');
}

async function gh(path) {
  return curlJson(`https://api.github.com/repos/${OWNER}/${REPO}${path}`);
}

async function ghAssetJson(assetId) {
  return curlJson(`https://api.github.com/repos/${OWNER}/${REPO}/releases/assets/${assetId}`, 'application/octet-stream');
}

// Kalau Release punya lebih dari satu asset .json (preseden nyata: asset
// "manifest.json" LAMA yang lupa dihapus, ketumpuk sama "manifest-<kategori>
// -bersih.json" BARU - dua-duanya nyangkut bareng di satu Release, bikin
// bingung mana yang dipakai) - cari yang PUNYA field totalTokenBPEResmi
// (skema manifest kategori resmi, lihat PRD §6), bukan asal ambil json
// pertama yang ketemu. Kalau ada lebih dari satu kandidat valid, pakai
// yang paling baru di-upload (created_at terbesar).
async function findCategoryManifestAsset(release) {
  const jsonAssets = release.assets.filter((a) => a.name.endsWith('.json'));
  const candidates = [];
  for (const asset of jsonAssets) {
    try {
      const data = await ghAssetJson(asset.id);
      if (data && typeof data.totalTokenBPEResmi === 'number' && typeof data.totalDokumen === 'number' && data.sha256) {
        candidates.push({ asset, data });
      }
    } catch (e) {
      // asset ini bukan JSON yang bisa dibaca atau bukan manifest kategori - lewati
    }
  }
  if (!candidates.length) return null;
  candidates.sort((a, b) => new Date(b.asset.created_at) - new Date(a.asset.created_at));
  if (candidates.length > 1) {
    console.log(
      `  ⚠ PERINGATAN: ${candidates.length} asset .json di Release ini sama-sama punya skema manifest kategori valid - ` +
        `pakai yang paling baru (${candidates[0].asset.name}, ${candidates[0].asset.created_at}). ` +
        `Asset lama (${candidates.slice(1).map((c) => c.asset.name).join(', ')}) sebaiknya DIHAPUS dari Release oleh Grok/dirigen supaya tidak ambigu lagi.`
    );
  }
  return candidates[0];
}

function findGzipDigest(release) {
  const gz = release.assets.find((a) => a.name.endsWith('.jsonl.gz'));
  if (!gz || !gz.digest) return null;
  return gz.digest.replace(/^sha256:/, '');
}

async function syncOneTag(tag, rakName, manifest) {
  console.log(`\n=== ${tag} (${rakName}) ===`);
  const release = await gh(`/releases/tags/${tag}`);
  const found = await findCategoryManifestAsset(release);
  if (!found) {
    console.error(`  ✗ Tidak ketemu asset manifest kategori yang valid (butuh field totalTokenBPEResmi+totalDokumen+sha256) di Release ini.`);
    return { ok: false };
  }
  const { data } = found;
  const gzipDigest = findGzipDigest(release);
  if (!gzipDigest) {
    console.error(`  ✗ Tidak ketemu asset .jsonl.gz di Release ini - tidak bisa verifikasi SHA256.`);
    return { ok: false };
  }
  if (data.sha256 !== gzipDigest) {
    console.error(
      `  ✗ GERBANG SHA256 GAGAL: manifest.sha256 (${data.sha256}) != digest asset gzip GitHub (${gzipDigest}). ` +
        `Data TIDAK digabung - kemungkinan korup/tertukar/gagal upload.`
    );
    return { ok: false };
  }
  console.log(`  ✓ SHA256 cocok (${data.sha256.slice(0, 16)}...)`);

  const entryIdx = manifest.kanonik.entries.findIndex((e) => e.rak === rakName);
  if (entryIdx === -1) {
    console.error(`  ✗ Tidak ketemu entry "${rakName}" di kanonik.entries - cek penamaan rak.`);
    return { ok: false };
  }
  const old = manifest.kanonik.entries[entryIdx];
  const changed = old.totalDokumen !== data.totalDokumen || old.totalTokenBPEResmi !== data.totalTokenBPEResmi || old.sha256 !== data.sha256;
  console.log(`  Dokumen: ${fmt(old.totalDokumen)} -> ${fmt(data.totalDokumen)}${changed ? '' : ' (tidak berubah)'}`);
  console.log(`  Token BPE: ${fmt(old.totalTokenBPEResmi)} -> ${fmt(data.totalTokenBPEResmi)}${changed ? '' : ' (tidak berubah)'}`);

  manifest.kanonik.entries[entryIdx] = {
    ...old,
    totalDokumen: data.totalDokumen,
    sizeByteGz: data.sizeByteGz || old.sizeByteGz,
    sha256: data.sha256,
    totalKataApprox: data.totalKataApprox != null ? data.totalKataApprox : old.totalKataApprox,
    totalTokenBPEResmi: data.totalTokenBPEResmi,
    diukurPada: `${new Date().toISOString().slice(0, 10)}; disinkronkan otomatis dari asset Release ${tag} (versi manifest ${data.versi != null ? data.versi : '?'})`,
    komposisiBahasa: data.komposisiBahasa || old.komposisiBahasa,
    catatan: changed
      ? `Disinkronkan otomatis oleh sync-manifest-from-release.mjs dari Release ${tag}. ${old.catatan || ''}`.trim()
      : old.catatan,
  };
  return { ok: true, changed };
}

function recomputeDerivedFields(manifest) {
  const entries = manifest.kanonik.entries;
  const totalToken = entries.reduce((sum, e) => sum + e.totalTokenBPEResmi, 0);
  const totalDocs = entries.reduce((sum, e) => sum + e.totalDokumen, 0);
  const kekurangan = manifest.targetGerbang - totalToken;

  manifest.kanonik.totalTokenBPEResmiKanonik = totalToken;
  manifest.kanonik.totalDokumenKanonik = totalDocs;
  manifest.ringkasanTotal.totalTokenKanonikTerverifikasi = totalToken;
  manifest.ringkasanTotal.tokenKanonikPerintahClaude = totalToken;
  manifest.ringkasanTotal.kekuranganTokenKanonik = kekurangan;
  manifest.tokenKanonikPerintahClaude = totalToken;
  manifest.kekuranganTokenKanonik = kekurangan;
  manifest.targetTercapai = kekurangan < 0;
  manifest.updatedAt = new Date().toISOString();
  return { totalToken, totalDocs, kekurangan };
}

async function main() {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  let anyFailed = false;
  let anyChanged = false;

  for (const [tag, rakName] of Object.entries(RAK_BY_TAG)) {
    const result = await syncOneTag(tag, rakName, manifest);
    if (!result.ok) anyFailed = true;
    if (result.changed) anyChanged = true;
  }

  if (anyFailed) {
    console.error('\nHASIL: GAGAL untuk satu atau lebih rak - manifest TIDAK ditulis. Perbaiki masalah di atas dulu.');
    process.exit(1);
  }

  const { totalToken, totalDocs, kekurangan } = recomputeDerivedFields(manifest);
  console.log(`\nTotal token kanonik: ${fmt(totalToken)}`);
  console.log(`Total dokumen kanonik: ${fmt(totalDocs)}`);
  console.log(`targetTercapai: ${kekurangan < 0}`);

  if (!anyChanged) {
    console.log('\nHASIL: Manifest git SUDAH sinkron dengan ketiga Release - tidak ada yang ditulis.');
    return;
  }

  if (isDryRun) {
    console.log('\nHASIL: --dry-run, TIDAK menulis file. Jalankan tanpa --dry-run untuk menyimpan perubahan di atas.');
    return;
  }

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`\nHASIL: Manifest ditulis ulang ke ${MANIFEST_PATH}. Jalankan check-korpus-manifest-sync.mjs untuk verifikasi, lalu commit.`);
}

main().catch((e) => {
  console.error('GAGAL:', e.message);
  process.exit(1);
});
