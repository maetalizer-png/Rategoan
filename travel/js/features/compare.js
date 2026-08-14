import { ic } from '../icons.js';
import { fmtN } from '../utils.js';
import { openSheet } from '../views/jelajah.js';

const $ = (s) => document.querySelector(s);

function options(countries, selected) {
  return countries.map((c) =>
    '<option value="' + c.metadata.name + '"' + (c.metadata.name === selected ? ' selected' : '') + '>' + c.metadata.name + '</option>'
  ).join('');
}

function row(label, a, b) {
  return '<tr><td>' + label + '</td><td>' + (a || '-') + '</td><td>' + (b || '-') + '</td></tr>';
}

function tableHtml(countries, nameA, nameB) {
  const a = countries.find((c) => c.metadata.name === nameA);
  const b = countries.find((c) => c.metadata.name === nameB);
  if (!a || !b) return '<p class="desc">Pilih dua negara untuk dibandingkan.</p>';
  const ma = a.metadata, mb = b.metadata;
  return (
    '<table class="cmp-table">' +
    '<tr><th></th><th>' + ma.name + '</th><th>' + mb.name + '</th></tr>' +
    row('Ibukota', ma.capital, mb.capital) +
    row('Mata uang', ma.currency, mb.currency) +
    row('Populasi', ma.population ? fmtN(ma.population) : '-', mb.population ? fmtN(mb.population) : '-') +
    row('Luas', ma.area ? fmtN(ma.area) + ' km2' : '-', mb.area ? fmtN(mb.area) + ' km2' : '-') +
    '</table>'
  );
}

function sheetHtml(countries, nameA, nameB) {
  return (
    '<h3>' + ic('swap') + ' Bandingkan Negara</h3>' +
    '<div class="cmp-row"><select id="cmpA">' + options(countries, nameA) + '</select>' +
    '<select id="cmpB">' + options(countries, nameB) + '</select></div>' +
    '<div id="cmpOut">' + tableHtml(countries, nameA, nameB) + '</div>' +
    '<div class="rowbtn" style="margin-top:8px"><button class="btn" id="cmpShare">' + ic('share') + ' Bagikan perbandingan</button></div>'
  );
}

function bind(countries) {
  const selA = $('#cmpA'), selB = $('#cmpB'), out = $('#cmpOut'), share = $('#cmpShare');
  const refresh = () => { out.innerHTML = tableHtml(countries, selA.value, selB.value); };
  selA.addEventListener('change', refresh);
  selB.addEventListener('change', refresh);
  share.onclick = (ev) => {
    const a = countries.find((c) => c.metadata.name === selA.value);
    const b = countries.find((c) => c.metadata.name === selB.value);
    if (!a || !b) return;
    const ma = a.metadata, mb = b.metadata;
    const lines = [
      ma.name + ' vs ' + mb.name,
      'Ibukota: ' + (ma.capital || '-') + ' | ' + (mb.capital || '-'),
      'Mata uang: ' + (ma.currency || '-') + ' | ' + (mb.currency || '-'),
      'Populasi: ' + (ma.population ? fmtN(ma.population) : '-') + ' | ' + (mb.population ? fmtN(mb.population) : '-'),
      'Luas: ' + (ma.area ? fmtN(ma.area) + ' km2' : '-') + ' | ' + (mb.area ? fmtN(mb.area) + ' km2' : '-'),
      '- dari Jalanin',
    ].join('\n');
    if (navigator.share) navigator.share({ text: lines }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(lines).then(() => { ev.currentTarget.innerHTML = ic('share') + ' Tersalin'; });
  };
}

export function openCompare(countries, nameA, nameB) {
  const a = nameA || (countries[0] && countries[0].metadata.name);
  const b = nameB || (countries[1] && countries[1].metadata.name);
  openSheet(sheetHtml(countries, a, b));
  bind(countries);
}
