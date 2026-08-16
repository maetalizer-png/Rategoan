import genesis from './sejarah/01-genesis.js';
import jilid23 from './sejarah/02-jilid2-3.js';
import dataries1 from './sejarah/03-dataries-fase1.js';
import jilid56 from './sejarah/04-jilid5-6.js';
import fondasiKualitas from './sejarah/05-fondasi-kualitas.js';
import jilid1112 from './sejarah/06-jilid11-12.js';
import produkisasi from './sejarah/07-produkisasi.js';
import jilid13 from './sejarah/08-jilid13.js';
import jilid14 from './sejarah/09-jilid14.js';
import travelIntegrasi from './sejarah/10-travel-integrasi.js';
import restrukturisasi from './sejarah/11-restrukturisasi-mega-final.js';
import trisulaUltra from './sejarah/12-trisula-ultra.js';
import trisulaFinalV2 from './sejarah/13-trisula-final-v2.js';
import ronde_v3_gabungan_final from './sejarah/14-ronde-v3-gabungan-final.js';
import ronde_v4_trisula_deca from './sejarah/15-ronde-v4-trisula-deca.js';
import ronde_v5_trisula_deca_plus from './sejarah/16-ronde-v5-trisula-deca-plus.js';

const SEJARAH = Object.freeze([
  genesis,
  jilid23,
  dataries1,
  jilid56,
  fondasiKualitas,
  jilid1112,
  produkisasi,
  jilid13,
  jilid14,
  travelIntegrasi,
  restrukturisasi,
  trisulaUltra,
  trisulaFinalV2,
  ronde_v3_gabungan_final,
  ronde_v4_trisula_deca,
  ronde_v5_trisula_deca_plus,
]);

function all() {
  return SEJARAH;
}

function latest() {
  return SEJARAH[SEJARAH.length - 1];
}

function byId(id) {
  const needle = String(id || '').toLowerCase().trim();
  return SEJARAH.find((e) => e.id.toLowerCase() === needle) || null;
}

function search(query) {
  const q = String(query || '').toLowerCase().trim();
  if (!q) return [];
  return SEJARAH.filter((e) => {
    const hay = [e.id, e.judul, e.ringkasan, ...(e.fitur_baru || []), ...(e.bug_ditutup || [])]
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });
}

function allBugs() {
  const out = [];
  for (const e of SEJARAH) {
    for (const b of e.bug_ditutup || []) out.push({ entri: e.id, judul: e.judul, bug: b });
  }
  return out;
}

function totalKomit() {
  return SEJARAH.reduce((sum, e) => sum + (e.komit || []).length, 0);
}

export const devlogIndex = Object.freeze({
  all,
  latest,
  byId,
  search,
  allBugs,
  totalKomit,
});
