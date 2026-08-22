import { ic } from '../icons.js';
import { RATES } from '../constants.js';
import { openSheet } from '../views/jelajah.js';

const $ = (s) => document.querySelector(s);

function options(selected) {
  return Object.keys(RATES)
    .map((n) => '<option value="' + n + '"' + (n === selected ? ' selected' : '') + '>' + n + '</option>')
    .join('');
}

const PRESETS = [50000, 100000, 500000, 1000000];

function sheetHtml(from, to) {
  return (
    '<h3>' + ic('swap') + ' Konverter Mata Uang</h3>' +
    '<div class="conv-full">' +
    '<div class="conv-row"><select id="cvFrom">' + options(from) + '</select>' +
    '<input id="cvAmt" type="number" inputmode="decimal" value="100"></div>' +
    '<div class="tags">' + PRESETS.map((p) => '<button class="tag" data-preset="' + p + '">' + fmtPreset(p) + '</button>').join('') + '</div>' +
    '<button class="btn" id="cvSwap">' + ic('swap') + ' Tukar arah</button>' +
    '<div class="conv-row"><select id="cvTo">' + options(to) + '</select><b id="cvOut">-</b></div>' +
    '<p class="desc">Kurs perkiraan, hanya sebagai acuan kasar.</p>' +
    '</div>'
  );
}

function fmtPreset(n) {
  return n >= 1000000 ? (n / 1000000) + 'jt' : (n / 1000) + 'rb';
}

function bind() {
  const fromSel = $('#cvFrom'), toSel = $('#cvTo'), amt = $('#cvAmt'), out = $('#cvOut'), swap = $('#cvSwap');
  const calc = () => {
    const f = RATES[fromSel.value], t = RATES[toSel.value];
    const a = parseFloat(amt.value) || 0;
    if (!f || !t) { out.textContent = '-'; return; }
    const idr = a * f;
    out.textContent = (idr / t).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' ' + toSel.value;
  };
  fromSel.addEventListener('change', calc);
  toSel.addEventListener('change', calc);
  amt.addEventListener('input', calc);
  document.querySelectorAll('[data-preset]').forEach((b) => {
    b.onclick = () => { amt.value = b.dataset.preset; calc(); };
  });
  swap.onclick = () => {
    const f = fromSel.value;
    fromSel.value = toSel.value;
    toSel.value = f;
    calc();
  };
  calc();
}

export function openConverter(defaultCurrency) {
  const names = Object.keys(RATES);
  const from = defaultCurrency && RATES[defaultCurrency] ? defaultCurrency : names[0];
  const to = from === 'Rupiah' ? (names.find((n) => n !== 'Rupiah') || 'Rupiah') : 'Rupiah';
  openSheet(sheetHtml(from, to));
  bind();
}
