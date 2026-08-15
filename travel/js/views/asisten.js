import { ic } from '../icons.js';
import { data } from '../loader.js';
import { errorCard, low, fmtN, fuzzyCountry, phrasesFor } from '../utils.js';
import { PACK_TIPS } from '../constants.js';
import { getAssistantHistory, pushAssistantMessage } from '../storage.js';
import { computePlan, buildPlanLines, buildPlanMarkdown, openPdfPrintWindow, downloadFile } from './trip.js';
import { exportLog } from '../../../raget-memory/export-log.js';

const $ = (s) => document.querySelector(s);
const view = $('#view');

let lastPlan = null;

function findCountry(text, countries) {
  const t = low(text);
  const exact = countries.find((c) => t.includes(low(c.metadata.name)));
  if (exact) return exact;
  return fuzzyCountry(text, countries);
}

function parseRequest(text, countries) {
  const t = low(text);
  const country = findCountry(text, countries);
  const dayMatch = t.match(/(\d+)\s*hari/);
  const days = dayMatch ? Math.max(1, Math.min(14, +dayMatch[1])) : 3;
  let tier = 'hemat';
  if (/nyaman|mewah/.test(t)) tier = 'nyaman';
  else if (/sedang|menengah/.test(t)) tier = 'sedang';
  let focus = null;
  if (/kuliner|makan/.test(t)) focus = 'kuliner';
  else if (/budaya/.test(t)) focus = 'budaya';
  else if (/wisata|jalan|liburan|explore/.test(t)) focus = 'wisata';
  return { country, days, tier, focus };
}

function wantsSummary(t) {
  return /ringkas|rangkum|summary/.test(t);
}
function wantsPdf(t) {
  return /pdf|cetak|print/.test(t);
}
function wantsMd(t) {
  return /markdown|\bmd\b|ekspor/.test(t) && !/pdf/.test(t);
}

function replyPlan(country, days, tier, focus, foods, wisata, langs) {
  const plan = computePlan(country, days, tier, foods, wisata);
  lastPlan = { country, days, tier, plan, foods, wisata, langs };
  const lines = buildPlanLines({ ...plan, days, tier, depart: '', notes: [], c: country });
  const tips = PACK_TIPS[plan.reg] || PACK_TIPS.lain;
  const lang = phrasesFor(plan.name, langs);
  const extra = [];
  if (focus === 'kuliner' && plan.f.length) extra.push('Fokus kuliner: coba ' + plan.f.slice(0, 3).map((x) => x.metadata.name).join(', ') + '.');
  if (focus === 'budaya' && lang && lang.metadata.greetings) extra.push('Frasa dasar (' + lang.metadata.name + '): "' + lang.metadata.greetings.halo + '" untuk halo.');
  extra.push('Saran bawaan: ' + tips.join(', ') + '.');
  return lines.join('\n') + '\n\n' + extra.join('\n') +
    '\n\nMau saya "buat PDF" dari rencana ini, atau tanya "ringkas" untuk versi singkat?';
}

function replySummary() {
  if (!lastPlan) return 'Belum ada rencana yang dibuat di sesi ini. Coba: "rencana ke Jepang 3 hari budget hemat".';
  const { plan, days, tier } = lastPlan;
  return 'Ringkasan: ' + plan.name + ', ' + days + ' hari (' + tier + '), estimasi total ~Rp ' + fmtN(plan.perDay * days) + '.';
}

function replyPdf() {
  if (!lastPlan) return 'Belum ada rencana untuk dijadikan PDF. Buat rencana dulu, mis. "rencana ke Thailand 4 hari".';
  const { plan, days, tier, country } = lastPlan;
  openPdfPrintWindow({ ...plan, days, tier, depart: '', notes: [], c: country });
  exportLog.logExport('pdf', 'Rencana PDF ' + plan.name + ' (Asisten)');
  return 'PDF sedang dibuat lewat jendela cetak. Sudah tercatat di Koleksi > Artefak juga.';
}

function replyMd() {
  if (!lastPlan) return 'Belum ada rencana untuk diekspor. Buat rencana dulu, mis. "rencana ke Thailand 4 hari".';
  const { plan, days, tier, country } = lastPlan;
  downloadFile(buildPlanMarkdown({ ...plan, days, tier, depart: '', notes: [], c: country }), 'text/markdown', 'rencana-' + plan.name.toLowerCase().replace(/\s+/g, '-') + '.md');
  exportLog.logExport('markdown', 'Rencana MD ' + plan.name + ' (Asisten)');
  return 'Rencana diekspor sebagai Markdown. Sudah tercatat di Koleksi > Artefak juga.';
}

function fallbackReply(countries) {
  return 'Saya belum paham maksudnya. Coba salah satu ini, atau ketik bebas seperti "rencana ke Jepang 3 hari budget sedang".';
}

function replyFocusList(kind, country, foods, wisata) {
  const list = (kind === 'kuliner' ? foods : wisata).filter((x) => low(x.metadata.country) === low(country.metadata.name)).slice(0, 8);
  if (!list.length) return 'Belum ada data ' + kind + ' untuk ' + country.metadata.name + ' di dataset ini.';
  return (kind === 'kuliner' ? 'Kuliner khas ' : 'Wisata di ') + country.metadata.name + ':\n' +
    list.map((x) => '- ' + x.metadata.name + (x.metadata.city ? ' (' + x.metadata.city + ')' : '')).join('\n');
}

async function handleSend(text, countries, foods, wisata, langs) {
  const t = low(text);
  if (wantsPdf(t)) return replyPdf();
  if (wantsMd(t)) return replyMd();
  if (wantsSummary(t)) return replySummary();
  if (/^buat\s+rencana$/.test(t.trim())) {
    return 'Tentu! Sebutkan negara, jumlah hari, dan budget, misalnya: "ke Vietnam 4 hari budget sedang".';
  }
  const focusMatch = t.match(/^(wisata|kuliner)\s+(.+)$/);
  if (focusMatch) {
    const country = findCountry(focusMatch[2], countries);
    if (country) return replyFocusList(focusMatch[1], country, foods, wisata);
  }
  const parsed = parseRequest(text, countries);
  if (parsed.country) {
    return replyPlan(parsed.country, parsed.days, parsed.tier, parsed.focus, foods, wisata, langs);
  }
  return fallbackReply(countries);
}

function messageHtml(m) {
  return '<div class="asis-msg ' + (m.role === 'user' ? 'user' : 'ai') + '">' + escapeHtml(m.text) + '</div>';
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function chipRow(lastCountryName) {
  const chips = ['Buat rencana', 'Ringkas', 'Buat PDF'];
  if (lastCountryName) chips.push('Wisata ' + lastCountryName, 'Kuliner ' + lastCountryName);
  return '<div class="asis-chipbar">' + chips.map((c, i) => '<button type="button" class="tag" data-chip="' + i + '">' + c + '</button>').join('') + '</div>';
}

function drawMessages() {
  const list = getAssistantHistory();
  const box = $('#asisList');
  if (!box) return;
  box.innerHTML = list.length
    ? list.map(messageHtml).join('')
    : '<div class="asis-empty">' + ic('chat') + '<p>Tanya saya untuk buat rencana perjalanan, mis. "rencana ke Bali... eh, Jepang 3 hari budget hemat".</p></div>';
  box.scrollTop = box.scrollHeight;
}

export async function renderAsisten() {
  const d = await data();
  if (!d) return errorCard();
  const { countries, foods, wisata, langs } = d;

  view.innerHTML =
    '<div class="card"><h3>' + ic('chat') + ' Asisten Perjalanan</h3>' +
    '<p class="desc">Ketik tujuan, jumlah hari, dan budget — saya susun rencananya. Semua diproses di perangkat ini, tanpa server.</p>' +
    chipRow(lastPlan ? lastPlan.plan.name : '') +
    '</div>' +
    '<div class="asis-list" id="asisList"></div>' +
    '<div class="asis-inputbar"><input id="asisInput" placeholder="Tulis pesan..." autocomplete="off">' +
    '<button type="button" id="asisSend" aria-label="Kirim">' + ic('send') + '</button></div>';

  drawMessages();

  const send = async (text) => {
    const v = (text || '').trim();
    if (!v) return;
    pushAssistantMessage('user', v);
    drawMessages();
    const reply = await handleSend(v, countries, foods, wisata, langs);
    pushAssistantMessage('ai', reply);
    drawMessages();
    view.querySelector('.card .asis-chipbar').outerHTML = chipRow(lastPlan ? lastPlan.plan.name : '');
    bindChips(countries, foods, wisata, langs);
  };

  $('#asisSend').onclick = () => {
    const inp = $('#asisInput');
    send(inp.value);
    inp.value = '';
  };
  $('#asisInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      send($('#asisInput').value);
      $('#asisInput').value = '';
    }
  });

  bindChips(countries, foods, wisata, langs);

  function bindChips(countries2, foods2, wisata2, langs2) {
    view.querySelectorAll('[data-chip]').forEach((b) => {
      b.onclick = () => send(b.textContent);
    });
  }
}
