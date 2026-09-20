
let tokohCache = null;

async function loadTokoh() {
  if (tokohCache) return tokohCache;
  try {
    const res = await fetch(new URL('../raget-data/json/tokoh/tokoh.json', import.meta.url));
    const raw = res.ok ? await res.json() : [];
    tokohCache = raw.map((e) => ({
      nama: e.nama,
      namaEn: e.meta.namaEn,
      lahir: e.meta.lahir,
      wafat: e.meta.wafat,
      bidang: e.meta.bidang,
      pencapaian: e.meta.pencapaian,
      kutipan: e.meta.kutipan,
      trivia: e.meta.trivia,
      relasi: e.meta.relasi,
    }));
  } catch (e) {
    tokohCache = [];
  }
  return tokohCache;
}

function norm(s) {
  return String(s || '').toLowerCase().trim();
}

let lastTokoh = null;

function rememberTokoh(t) {
  if (t && t.nama) lastTokoh = t.nama;
}

function resolvePronoun(text) {
  if (!lastTokoh) return text;
  return String(text || '').replace(/\bdia\b/gi, lastTokoh);
}

function hasWordSubstring(haystack, needle) {
  if (!haystack || !needle) return false;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('\\b' + escaped + '\\b', 'i').test(haystack);
}

async function findTokoh(query) {
  const q = norm(query);
  if (!q) return null;
  const tokoh = await loadTokoh();
  let found = tokoh.find((t) => norm(t.nama) === q || norm(t.namaEn) === q);
  if (found) return found;
  found = tokoh.find((t) => hasWordSubstring(q, norm(t.nama)) || hasWordSubstring(norm(t.nama), q) || hasWordSubstring(q, norm(t.namaEn)));
  return found || null;
}

function fmtTahun(t) {
  if (t == null) return 'sekarang (masih hidup)';
  return t < 0 ? Math.abs(t) + ' SM' : String(t);
}

function composeTokoh(t) {
  const wafatStr = t.wafat == null ? 'Masih hidup hingga sekarang.' : 'Wafat tahun ' + fmtTahun(t.wafat) + '.';
  return (
    `${t.nama} (${t.bidang}) — lahir tahun ${fmtTahun(t.lahir.tahun)} di ${t.lahir.negara}. ${wafatStr}\n\n` +
    'Pencapaian utama:\n' + t.pencapaian.map((p) => '• ' + p).join('\n') + '\n\n' +
    'Kutipan: "' + t.kutipan + '"\n\n' +
    'Trivia: ' + t.trivia
  );
}

async function tryProfil(text) {
  const m = text.match(/^(siapa\s+itu|siapa|ceritakan\s+tentang|biografi(\s+dari)?)\s+(.+?)\??$/i);
  if (!m) return null;
  const name = String(m[3] || '').trim().replace(/\?+$/, '');
  const t = await findTokoh(name);
  if (!t) {
    const words = name.split(/\s+/).filter(Boolean);
    if (words.length >= 2 && /^(siapa(\s+itu)?)\s+/i.test(text)) {
      return 'Saya belum yakin siapa ' + name + '.';
    }
    return null;
  }
  rememberTokoh(t);
  return composeTokoh(t);
}

async function tryPencapaian(text) {
  const m = text.match(
    /^apa\s+(saja\s+)?pencapaian\s+(.+?)\??$|^prestasi\s+(.+?)\s+apa\s+saja\??$|^pencapaian\s+(.+?)\??$|^prestasi\s+(.+?)\??$/i
  );
  if (!m) return null;
  const name = m[2] || m[3] || m[4] || m[5];
  const t = await findTokoh(name);
  if (!t) return null;
  rememberTokoh(t);
  return t.nama + ' — pencapaian utama:\n' + t.pencapaian.map((p) => '• ' + p).join('\n');
}

async function tryKutipan(text) {
  const m = text.match(/^kutipan\s+(terkenal\s+)?(dari\s+)?(.+?)\??$|^quote\s+dari\s+(.+?)\??$/i);
  if (!m) return null;
  const name = m[3] || m[4];
  const t = await findTokoh(name);
  if (!t) return null;
  rememberTokoh(t);
  return t.nama + ' pernah berkata: "' + t.kutipan + '"';
}

async function tryTrivia(text) {
  const m = text.match(/^(fakta\s+unik|trivia)\s+(tentang\s+|dari\s+)?(.+?)\??$/i);
  if (!m) return null;
  const t = await findTokoh(m[3]);
  if (!t) return null;
  rememberTokoh(t);
  return 'Fakta unik tentang ' + t.nama + ': ' + t.trivia;
}

async function tryRelasi(text) {
  const m = text.match(/^siapa\s+yang\s+berhubungan\s+dengan\s+(.+?)\??$|^hubungan\s+(.+?)\s+dengan\s+siapa\??$/i);
  if (!m) return null;
  const name = m[1] || m[2];
  const t = await findTokoh(name);
  if (!t || !t.relasi.length) return null;
  rememberTokoh(t);
  return t.nama + ' berhubungan dengan: ' + t.relasi.map((r) => r.nama + ' (' + r.jenis + ')').join(', ') + '.';
}

async function tryVital(text) {
  const m = text.match(
    /^kapan\s+(.+?)\s+(lahir|meninggal|wafat)\??$|^(.+?)\s+(lahir|meninggal|wafat)\s+kapan\??$|^berapa\s+umur\s+(.+?)\??$/i
  );
  if (!m) return null;
  const name = m[1] || m[3] || m[5];
  const t = await findTokoh(name);
  if (!t) return null;
  rememberTokoh(t);
  if (m[5]) {
    if (t.wafat != null) {
      return t.nama + ' wafat pada usia sekitar ' + (t.wafat - t.lahir.tahun) + ' tahun (lahir ' + fmtTahun(t.lahir.tahun) + ', wafat ' + fmtTahun(t.wafat) + ').';
    }
    const currentYear = new Date().getFullYear();
    return t.nama + ' saat ini berusia sekitar ' + (currentYear - t.lahir.tahun) + ' tahun (lahir ' + fmtTahun(t.lahir.tahun) + ').';
  }
  const isMeninggal = /meninggal|wafat/i.test(m[2] || m[4] || '');
  if (isMeninggal) {
    return t.wafat == null ? t.nama + ' masih hidup hingga sekarang.' : t.nama + ' wafat pada tahun ' + fmtTahun(t.wafat) + '.';
  }
  return t.nama + ' lahir pada tahun ' + fmtTahun(t.lahir.tahun) + ' di ' + t.lahir.negara + '.';
}

async function tryTokoh(text) {
  const raw = String(text || '').trim();
  if (!raw) return null;
  const t = resolvePronoun(raw);
  return (
    (await tryVital(t)) ||
    (await tryPencapaian(t)) ||
    (await tryKutipan(t)) ||
    (await tryTrivia(t)) ||
    (await tryRelasi(t)) ||
    (await tryProfil(t)) ||
    null
  );
}

export const tokohStore = Object.freeze({
  findTokoh,
  composeTokoh,
  tryProfil,
  tryVital,
  tryPencapaian,
  tryKutipan,
  tryTrivia,
  tryRelasi,
  tryTokoh,
});
