import { ic } from '../icons.js';
import { data } from '../loader.js';
import { errorCard, low, clusterByCity, byCountry, regionOf, fmtN, daysUntil, phrasesFor, fuzzyCountry, lev, toast } from '../utils.js';
import { BUDGET_BASE, TIER_MULT, PACK_TIPS } from '../constants.js';
import { getCheck, saveCheck, getTrips, saveTrips, getStats, saveStats } from '../storage.js';
import { climateCard } from '../features/climate.js';
import { journalCard, getNotes, bindJournal } from '../features/journal.js';
import { exportLog } from '../../../raget-memory/export-log.js';

const $ = (s) => document.querySelector(s);
const view = $('#view');

export function downloadFile(content, mime, filename) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function computePlan(c, days, tier, foods, wisata) {
  const name = c.metadata.name;
  const w = clusterByCity(byCountry(wisata, name));
  const f = byCountry(foods, name);
  const per = Math.max(1, Math.ceil(w.length / days));
  const reg = regionOf(name);
  const perDay = Math.round(BUDGET_BASE[reg] * TIER_MULT[tier]);
  return { name, w, f, per, reg, perDay };
}

export function buildPlanLines(ctx) {
  const { name, days, tier, depart, w, per, f, c, perDay, notes } = ctx;
  return [
    'Rencana ' + days + ' hari di ' + name + ' (' + tier + ')' + (depart ? ' — berangkat ' + depart : ''),
    ...Array.from({ length: days }, (_, i) => {
      const items = w.slice(i * per, (i + 1) * per);
      return 'Hari ' + (i + 1) + ': ' +
        (items.length ? items.map((x) => x.metadata.name).join(', ') : 'jelajah ' + (c.metadata.capital || 'kota')) +
        (f.length ? ' | kuliner ' + f[i % f.length].metadata.name : '');
    }),
    'Estimasi total ~Rp ' + fmtN(perDay * days),
    ...(notes.length ? ['Catatan: ' + notes.map((n) => n.text).join('; ')] : []),
    '- dari Jalanin',
  ];
}

export function buildPlanMarkdown(ctx) {
  const { name, days, tier, depart, w, per, f, c, perDay, notes } = ctx;
  const lines = ['# Rencana Perjalanan ' + name, ''];
  lines.push('Durasi: ' + days + ' hari &middot; Tingkat: ' + tier + (depart ? ' &middot; Berangkat: ' + depart : ''), '');
  lines.push('## Itinerari', '');
  for (let i = 0; i < days; i++) {
    const items = w.slice(i * per, (i + 1) * per);
    lines.push('**Hari ' + (i + 1) + '**: ' + (items.length ? items.map((x) => x.metadata.name).join(', ') : 'jelajah ' + (c.metadata.capital || 'kota')) +
      (f.length ? ' — kuliner: ' + f[i % f.length].metadata.name : ''));
  }
  lines.push('', '## Estimasi Budget', '', 'Total ~Rp ' + fmtN(perDay * days) + ' (' + tier + ')');
  if (notes.length) {
    lines.push('', '## Jurnal Catatan', '');
    notes.forEach((n) => lines.push('- ' + n.text));
  }
  lines.push('', '_Dibuat dengan Jalanin_');
  return lines.join('\n');
}

export function openPdfPrintWindow(ctx) {
  const { name, days, tier, depart, w, per, f, c, perDay, notes } = ctx;
  const rows = Array.from({ length: days }, (_, i) => {
    const items = w.slice(i * per, (i + 1) * per);
    return '<h3>Hari ' + (i + 1) + '</h3><p>' +
      (items.length ? items.map((x) => x.metadata.name).join(', ') : 'Jelajah ' + (c.metadata.capital || 'kota')) +
      (f.length ? '<br>Kuliner: ' + f[i % f.length].metadata.name : '') + '</p>';
  }).join('');
  const notesHtml = notes.length ? '<h2>Jurnal Catatan</h2><ul>' + notes.map((n) => '<li>' + n.text + '</li>').join('') + '</ul>' : '';
  const html =
    '<html><head><title>Rencana ' + name + '</title><meta charset="utf-8">' +
    '<style>body{font-family:system-ui,sans-serif;padding:24px;color:#111}h1{margin-bottom:4px}h2{margin-top:24px}h3{margin-bottom:2px}</style>' +
    '</head><body><h1>Rencana Perjalanan ' + name + '</h1>' +
    '<p>Durasi: ' + days + ' hari &middot; Tingkat: ' + tier + (depart ? ' &middot; Berangkat: ' + depart : '') + '</p>' +
    '<h2>Itinerari</h2>' + rows +
    '<h2>Estimasi Budget</h2><p>Total ~Rp ' + fmtN(perDay * days) + '</p>' +
    notesHtml +
    '<p style="margin-top:32px;color:#888">Dibuat dengan Jalanin</p>' +
    '</body></html>';
  const win = window.open('', '_blank');
  if (!win) { toast('Popup diblokir, izinkan popup untuk membuat PDF.'); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

export async function openTrip() {
  const d = await data();
  if (!d) return errorCard();
  const { countries, foods, wisata, langs } = d;
  view.innerHTML =
    '<div class="card"><h3>' + ic('cal') + ' Rencana Perjalanan</h3>' +
    '<div class="search" style="margin-top:8px">' + ic('search') + '<input id="tq" placeholder="Negara tujuan..."></div>' +
    '<label class="field-label" for="td">Tanggal berangkat (opsional)</label>' +
    '<input id="td" type="date" class="q-opt" style="margin:0">' +
    '<div class="rowbtn" style="margin-top:8px">' +
      [2, 3, 4].map((x) => '<button class="btn days' + (x === 3 ? ' on' : '') + '" data-d="' + x + '">' + x + ' hari</button>').join('') +
    '</div>' +
    '<div class="rowbtn">' +
      ['hemat', 'sedang', 'nyaman'].map((t2, i) =>
        '<button class="btn days' + (i === 0 ? ' on' : '') + '" data-t="' + t2 + '">' + t2.charAt(0).toUpperCase() + t2.slice(1) + '</button>'
      ).join('') +
    '</div>' +
    '<div class="rowbtn"><button class="btn" id="gen">' + ic('map') + ' Buat rencana</button></div>' +
    '<div id="tripOut"></div></div>' +
    checklistCard() + savedTripsCard(countries);

  let days = 3, tier = 'hemat', depart = '';
  view.querySelectorAll('[data-d]').forEach((b) => b.onclick = () => {
    days = +b.dataset.d;
    view.querySelectorAll('[data-d]').forEach((x) => x.classList.toggle('on', x === b));
  });
  view.querySelectorAll('[data-t]').forEach((b) => b.onclick = () => {
    tier = b.dataset.t;
    view.querySelectorAll('[data-t]').forEach((x) => x.classList.toggle('on', x === b));
  });
  $('#td').onchange = (e) => { depart = e.target.value; };
  $('#gen').onclick = () => {
    const name = ($('#tq').value || '').trim();
    if (!name) {
      $('#tripOut').innerHTML = '<p class="desc">Ketik dulu nama negara tujuan di kolom pencarian di atas.</p>';
      $('#tripOut').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const c = countries.find((x) => low(x.metadata.name).includes(low(name))) || fuzzyCountry(name, countries);
    if (!c) {
      const suggestions = countries
        .slice()
        .sort((a, b) => lev(low(name), low(a.metadata.name)) - lev(low(name), low(b.metadata.name)))
        .slice(0, 3);
      $('#tripOut').innerHTML =
        '<p class="desc">Negara "' + name + '" tidak ditemukan. Coba salah satu ini:</p>' +
        '<div class="tags">' + suggestions.map((s, i) => '<button class="tag" data-sugg="' + i + '">' + s.metadata.name + '</button>').join('') + '</div>';
      view.querySelectorAll('[data-sugg]').forEach((b) => b.onclick = () => {
        $('#tq').value = suggestions[+b.dataset.sugg].metadata.name;
        renderTrip(suggestions[+b.dataset.sugg], days, tier, depart, foods, wisata, langs, countries);
      });
      $('#tripOut').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    renderTrip(c, days, tier, depart, foods, wisata, langs, countries);
  };
  bindChecklist();
  bindSavedTrips(countries);
}

function renderTrip(c, days, tier, depart, foods, wisata, langs, countries, tripKey) {
  const { name, w, f, per, reg, perDay } = computePlan(c, days, tier, foods, wisata);
  const hn = daysUntil(depart);

  let html =
    '<div class="card"><div class="trip-ready-head">' + ic('check') + ' Rencana siap' +
    (hn != null && hn >= 0 ? ' &middot; <span class="hn">H-' + hn + '</span>' : '') + '</div>' +
    '<div class="trip-actions-sticky">' +
    (tripKey ? '' : '<button class="btn btn-primary" id="tsave">' + ic('check') + ' Simpan</button>') +
    '<button class="btn" id="tshare">' + ic('share') + ' Bagikan</button>' +
    '<button class="btn" id="tpdf">' + ic('map') + ' Buat PDF</button>' +
    '</div>' +
    '<div class="rowbtn"><button class="btn" id="tmd">' + ic('check') + ' Ekspor MD</button>' +
    '<button class="btn" id="twa">' + ic('share') + ' WhatsApp</button></div>' +
    '<div id="tripSavedSlot"></div>' +
    '</div>' +
    '<div class="sec">' + ic('map') + ' Itinerari ' + name + '</div>';
  for (let dd = 0; dd < days; dd++) {
    const items = w.slice(dd * per, (dd + 1) * per);
    const city = items.length ? (items[0].metadata.city || '') : '';
    html +=
      '<div class="card"><h3>Hari ' + (dd + 1) + (city ? ' &middot; ' + city : '') + '</h3>' +
      (items.length
        ? '<div class="tags">' + items.map((x) => '<span class="tag">' + x.metadata.name + '</span>').join('') + '</div>'
        : '<p class="desc">Jelajah santai sekitar ' + (c.metadata.capital || 'pusat kota') + '.</p>') +
      (f.length ? '<p class="desc">Kuliner: ' + f[dd % f.length].metadata.name + '</p>' : '') +
      '</div>';
  }

  const lang = phrasesFor(name, langs);
  if (lang && lang.metadata.greetings) {
    const g = lang.metadata.greetings;
    html +=
      '<div class="card"><h3>' + ic('lang') + ' Frasa berguna (' + lang.metadata.name + ')</h3>' +
      '<div class="tags">' +
        '<span class="tag">halo: ' + (g.halo || '-') + '</span>' +
        '<span class="tag">pagi: ' + (g.pagi || '-') + '</span>' +
        '<span class="tag">makasih: ' + (g.terimakasih || '-') + '</span>' +
      '</div></div>';
  }

  const total = perDay * days;
  const breakdown = { Hotel: 0.4, Makan: 0.3, Wisata: 0.2, Transport: 0.1 };
  html +=
    '<div class="card"><h3>' + ic('swap') + ' Estimasi budget (' + tier + ')</h3>' +
    '<p class="desc">Per hari ~Rp ' + fmtN(perDay) + ' &middot; total ' + days + ' hari ~Rp ' + fmtN(total) + '</p>' +
    '<p class="desc">' + Object.entries(breakdown).map(([k, v]) => k + ' ' + Math.round(v * 100) + '%').join(' &middot; ') + ' (perkiraan kasar)</p>' +
    '<div class="rowbtn"><button class="btn" id="tbudget">' + ic('share') + ' Bagikan rincian budget</button></div></div>';

  const tips = PACK_TIPS[reg] || PACK_TIPS.lain;
  html +=
    '<div class="card"><h3>' + ic('check') + ' Saran bawaan (' + reg + ')</h3>' +
    '<div class="tags">' + tips.map((t, i) => '<button class="tag" data-p="' + i + '">' + ic('plus') + ' ' + t + '</button>').join('') + '</div></div>' +
    climateCard(reg) + (tripKey ? journalCard(tripKey, name) : '');
  $('#tripOut').innerHTML = html;
  $('#tripOut').scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (!tripKey) toast('Rencana siap! Simpan, bagikan, atau buat PDF.');

  view.querySelectorAll('[data-p]').forEach((b) => b.onclick = () => {
    const t = tips[+b.dataset.p];
    const l = getCheck();
    if (!l.some((x) => x.t === t)) {
      l.push({ t, done: false });
      saveCheck(l);
      b.classList.add('on');
      b.innerHTML = ic('check') + ' ' + t;
    }
  });

  const planCtx = () => ({ name, days, tier, depart, w, per, f, c, perDay, notes: tripKey ? getNotes(tripKey) : [] });

  $('#tshare').onclick = (ev) => {
    const lines = buildPlanLines(planCtx());
    if (navigator.share) navigator.share({ text: lines.join('\n') }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(lines.join('\n')).then(() => { ev.currentTarget.innerHTML = ic('share') + ' Tersalin'; toast('Rencana disalin'); });
  };
  $('#tpdf').onclick = () => {
    openPdfPrintWindow(planCtx());
    exportLog.logExport('pdf', 'Rencana PDF ' + name);
  };
  $('#tmd').onclick = () => {
    downloadFile(buildPlanMarkdown(planCtx()), 'text/markdown', 'rencana-' + name.toLowerCase().replace(/\s+/g, '-') + '.md');
    exportLog.logExport('markdown', 'Rencana MD ' + name);
    toast('Rencana diekspor sebagai Markdown');
  };
  $('#twa').onclick = () => {
    const text = buildPlanLines(planCtx()).join('\n');
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  };
  $('#tbudget').onclick = (ev) => {
    const lines = [
      'Estimasi budget ' + name + ' (' + tier + ', ' + days + ' hari)',
      ...Object.entries(breakdown).map(([k, v]) => k + ': Rp ' + fmtN(Math.round(total * v)) + ' (' + Math.round(v * 100) + '%)'),
      'Total ~Rp ' + fmtN(total),
      '- dari Jalanin',
    ].join('\n');
    if (navigator.share) navigator.share({ text: lines }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(lines).then(() => { ev.currentTarget.innerHTML = ic('share') + ' Tersalin'; });
  };
  if (tripKey) {
    bindJournal(view, tripKey, () => renderTrip(c, days, tier, depart, foods, wisata, langs, countries, tripKey), name);
  } else {
    $('#tsave').onclick = (ev) => {
      const l = getTrips();
      const saved = { country: name, days, tier, depart, time: Date.now() };
      l.push(saved);
      saveTrips(l);
      const st = getStats();
      st.trips++;
      saveStats(st);
      ev.currentTarget.innerHTML = ic('check') + ' Tersimpan';
      toast('Rencana tersimpan');

      const hnSaved = daysUntil(saved.depart);
      const slot = $('#tripSavedSlot');
      if (slot) {
        slot.innerHTML =
          '<div class="sec">' + ic('cal') + ' Rencana tersimpan</div>' +
          '<div class="rowbtn" style="justify-content:space-between;margin:6px 0">' +
          '<b>' + saved.country + ' &middot; ' + saved.days + ' hari &middot; ' + saved.tier +
          (hnSaved != null && hnSaved >= 0 ? ' &middot; H-' + hnSaved : '') + '</b>' +
          '<span style="display:flex;gap:6px">' +
          '<button class="btn" id="tSavedOpen">Buka</button>' +
          '<button class="btn" id="tSavedDel">Hapus</button></span></div>';
        $('#tSavedOpen').onclick = () => renderTrip(c, days, tier, depart, foods, wisata, langs, countries, 'trip_' + saved.time);
        $('#tSavedDel').onclick = () => {
          const list = getTrips();
          const idx = list.findIndex((t) => t.time === saved.time);
          if (idx >= 0) { list.splice(idx, 1); saveTrips(list); }
          slot.innerHTML = '';
        };
      }
    };
  }
}

function checklistCard() {
  const list = getCheck();
  const done = list.filter((x) => x.done).length;
  const pct = list.length ? Math.round((done / list.length) * 100) : 0;
  return '<div class="sec">' + ic('check') + ' Checklist bawaan</div><div class="card">' +
    '<div class="prog"><i id="progBar" style="width:' + pct + '%"></i></div>' +
    '<p class="desc" id="progLabel">' + done + '/' + list.length + ' siap (' + pct + '%)</p>' +
    list.map((it, i) =>
      '<label class="ck"><input type="checkbox" data-i="' + i + '"' + (it.done ? ' checked' : '') + '><span>' + it.t + '</span></label>'
    ).join('') +
    '<div class="rowbtn" style="margin-top:8px"><input id="ckNew" class="q-opt" style="margin:0" placeholder="Tambah bawaan...">' +
    '<button class="btn" id="ckAdd">' + ic('plus') + '</button></div></div>';
}

function bindChecklist() {
  const refresh = () => {
    const list = getCheck();
    const done = list.filter((x) => x.done).length;
    const pct = list.length ? Math.round((done / list.length) * 100) : 0;
    const bar = $('#progBar');
    const lab = $('#progLabel');
    if (bar) bar.style.width = pct + '%';
    if (lab) lab.textContent = done + '/' + list.length + ' siap (' + pct + '%)';
  };
  view.querySelectorAll('.ck input').forEach((cb) => {
    cb.onchange = () => {
      const l = getCheck();
      l[+cb.dataset.i].done = cb.checked;
      saveCheck(l);
      refresh();
    };
  });
  $('#ckAdd').onclick = () => {
    const v = ($('#ckNew').value || '').trim();
    if (!v) return;
    const l = getCheck();
    l.push({ t: v, done: false });
    saveCheck(l);
    openTrip();
  };
}

function savedTripsCard(countries) {
  const list = getTrips();
  if (!list.length) return '';
  return '<div class="sec">' + ic('cal') + ' Rencana tersimpan</div><div class="card">' +
    list.map((t, i) => {
      const hn = daysUntil(t.depart);
      const label = t.country + ' &middot; ' + t.days + ' hari &middot; ' + t.tier +
        (hn != null && hn >= 0 ? ' &middot; H-' + hn : '');
      return '<div class="rowbtn" style="justify-content:space-between;margin:6px 0"><b>' + label + '</b>' +
        '<span style="display:flex;gap:6px"><button class="btn" data-open="' + i + '">Buka</button>' +
        '<button class="btn" data-del="' + i + '">Hapus</button></span></div>';
    }).join('') + '</div>';
}

function bindSavedTrips(countries) {
  view.querySelectorAll('[data-open]').forEach((b) => b.onclick = async () => {
    const t = getTrips()[+b.dataset.open];
    const c = countries.find((x) => low(x.metadata.name) === low(t.country));
    if (c) {
      const d = await data();
      renderTrip(c, t.days, t.tier, t.depart, d.foods, d.wisata, d.langs, d.countries, 'trip_' + t.time);
    }
  });
  view.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => {
    const l = getTrips();
    l.splice(+b.dataset.del, 1);
    saveTrips(l);
    openTrip();
  });
}
