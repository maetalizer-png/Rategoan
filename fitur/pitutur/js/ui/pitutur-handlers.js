import { pituturState } from '../core/pitutur-state.js';
import { pituturRenderer as R } from './pitutur-renderer.js';
import { daftarSemua } from '../sumber/pitutur-channels.js';
import { pituturDokumen } from '../sumber/pitutur-dokumen.js';
import { notebookStore } from '../notebook/pitutur-notebook-store.js';
import { pituturHttp } from '../sumber/pitutur-http.js';
import { pituturVoice } from '../audio/pitutur-voice.js';

const LABEL = { monolog: 'Monolog', dialog: 'Dialog', diskusi: 'Diskusi' };

function syncModeLabel() {
  const m = pituturState.state.mode === 'solo' ? 'monolog' : pituturState.state.mode;
  R.$('modeLabel').textContent = LABEL[m] || 'Monolog';
}

function sumberUntukStrategi(strategi, sources) {
  if (strategi === 'koleksi') return sources.koleksi;
  if (strategi === 'dokumen') return sources.dokumen;
  return sources.dataries;
}


function setSumberPath(path, actions) {
  const state = pituturState.state;
  const panelP = R.$('panelPustaka');
  const panelM = R.$('grpDokumen');
  const pathP = R.$('pathPustaka');
  const pathM = R.$('pathMateri');
  const isMateri = path === 'materi';
  if (panelP) {
    panelP.hidden = isMateri;
    panelP.setAttribute('aria-hidden', isMateri ? 'true' : 'false');
  }
  if (panelM) {
    panelM.hidden = !isMateri;
    panelM.setAttribute('aria-hidden', isMateri ? 'false' : 'true');
  }
  if (pathP) pathP.classList.toggle('on', !isMateri);
  if (pathM) pathM.classList.toggle('on', isMateri);
  if (isMateri) {
    state.sources.dokumen = true;
  } else {
    state.sources.dokumen = false;
    if (!state.sources.dataries && !state.sources.koleksi && !state.sources.devlog) {
      state.sources.dataries = true;
    }
  }
  pituturState.save();
  syncSourceChips(actions);
  if (isMateri) renderDocList();
  else if (typeof buildChannelChips === 'function') buildChannelChips(actions);
}

function syncSourceChips(actions) {
  document.querySelectorAll('#sources .src').forEach(function (c) {
    c.addEventListener('click', function () {
      const k = c.getAttribute('data-source');
      const state = pituturState.state;
      if (k === 'dokumen') {
        setSumberPath('materi', actions);
        R.toast('Buka materi saya');
        if (actions) actions.batal();
        return;
      }
      state.sources[k] = !state.sources[k];
      c.classList.toggle('on', state.sources[k]);
      pituturState.save();
      R.toast('Sumber ' + k + (state.sources[k] ? ' dinyalakan' : ' dimatikan'));
      buildChannelChips(actions);
      if (actions) actions.batal();
    });
  });
}

async function buildChannelChips(actions) {
  const state = pituturState.state;
  const container = R.$('channels');
  if (!container) return;

  const semua = await daftarSemua();
  const terlihat = semua.filter(function (k) {
    return sumberUntukStrategi(k.strategi, state.sources);
  });

  if (!terlihat.length) {
    container.innerHTML = '<div class="hint">Tidak ada saluran aktif — nyalakan salah satu Sumber Data di atas.</div>';
    return;
  }

  if (!terlihat.some(function (k) { return k.id === state.channel; })) {
    state.channel = terlihat[0].id;
    pituturState.save();
    if (actions) actions.batal();
  }

  container.innerHTML = terlihat.map(function (k) {
    return '<button class="chip chan' + (k.id === state.channel ? ' on' : '') + '" data-channel="' + R.escapeAttr(k.id) + '">' +
      R.escapeHtml(k.label) + '<small>' + R.escapeHtml(k.small) + '</small></button>';
  }).join('');
}

function hitungBagian(doc) {
  if (doc.chunkCount && doc.chunkCount > 0) return doc.chunkCount;
  if (doc.chunks && doc.chunks.length) return doc.chunks.length;
  return Math.max(1, Math.ceil((doc.words || 1) / 40));
}

function formatDocMeta(doc) {
  const state = pituturState.state;
  const pos = (state.docPos && state.docPos[doc.id]) || 0;
  const tgl = new Date(doc.addedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  const bagian = hitungBagian(doc);
  if (pos > 0) {
    const pct = Math.min(99, Math.round((pos / bagian) * 100));
    return 'Bagian ' + Math.min(pos + 1, bagian) + '/' + bagian + ' · lanjut ' + pct + '%';
  }
  return 'Materi · ' + bagian + ' bagian · ' + doc.words + ' kata · ' + tgl;
}

async function renderDocList() {
  const el = R.$('docList');
  if (!el) return;
  const state = pituturState.state;
  let docs = [];
  try {
    docs = await pituturDokumen.daftar();
  } catch (e) {
    el.innerHTML = '<div class="docEmpty">Gagal memuat daftar dokumen.</div>';
    return;
  }
  if (!docs.length) {
    el.innerHTML = '<div class="docEmpty">Belum ada materi tersimpan.</div>';
    renderSesiList();
    return;
  }
  el.innerHTML = docs.map(function (d) {
    const aktif = state.channel === 'doc:' + d.id;
    const pos = (state.docPos && state.docPos[d.id]) || 0;
    const resetBtn = pos > 0
      ? '<button class="docReset" data-reset-doc="' + R.escapeAttr(d.id) + '" type="button">Ulang</button>'
      : '';
    return '<div class="docItem' + (aktif ? ' on' : '') + '" data-doc-id="' + R.escapeAttr(d.id) + '">' +
      '<div class="docInfo"><span class="docNama">' + R.escapeHtml(d.name) + '</span>' +
      '<span class="docMeta">' + R.escapeHtml(formatDocMeta(d)) + (aktif ? ' · aktif' : '') + '</span></div>' +
      '<div class="docAksi">' + resetBtn +
      '<button class="docHapus" data-hapus-doc="' + R.escapeAttr(d.id) + '" type="button" aria-label="Hapus materi">✕</button></div>' +
      '</div>';
  }).join('');
  return renderSesiList();
}

async function renderSesiList() {
  const el = R.$('sesiList');
  if (!el) return;
  let list = [];
  try {
    list = await notebookStore.semua();
  } catch (e) {
    el.innerHTML = '';
    return;
  }
  if (!list.length) {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = list.map(function (nb) {
    const src = (nb.sources || [])[0];
    const pos = src && nb.progress ? (nb.progress[src.ref] || 0) : 0;
    const total = src ? (src.chunkCount || 0) : 0;
    const meta = src
      ? ((src.title || 'Materi') + (total ? ' · bagian ' + Math.min(pos + 1, total) + '/' + total : ''))
      : 'Kosong';
    return '<div class="docItem" data-sesi-id="' + R.escapeAttr(nb.id) + '">' +
      '<div class="docInfo"><span class="docNama">' + R.escapeHtml(nb.title) + '</span>' +
      '<span class="docMeta">' + R.escapeHtml(meta) + '</span></div>' +
      '<div class="docAksi">' +
      '<button class="docReset" data-lanjut-sesi="' + R.escapeAttr(nb.id) + '" type="button">Lanjut</button>' +
      '<button class="docHapus" data-hapus-sesi="' + R.escapeAttr(nb.id) + '" type="button" aria-label="Hapus sesi">✕</button>' +
      '</div></div>';
  }).join('');
}

export function segarkanDaftarMateri() {
  return Promise.all([renderDocList(), renderSesiList()]);
}

function aktifkanDokumen(docId, actions) {
  const state = pituturState.state;
  state.sources.dokumen = true;
  state.channel = 'doc:' + docId;
  pituturState.save();
  setSumberPath('materi', actions);
  if (actions) actions.batal();
  return Promise.all([renderDocList(), buildChannelChips(actions)]);
}


export function attach(actions) {
  const state = pituturState.state;
  const scrim = R.$('scrim');
  const sheetIds = ['sheetKendali', 'sheetMode', 'sheetSumber', 'sheetRiwayat'];

  function closeSheets() {
    sheetIds.forEach(function (s) { R.$(s).classList.remove('open'); });
    scrim.classList.remove('on');
    document.querySelectorAll('.barBtn[data-sheet]').forEach(function (b) { b.classList.remove('on'); });
  }

  syncSourceChips(actions);

  const pathPustaka = R.$('pathPustaka');
  const pathMateri = R.$('pathMateri');
  if (pathPustaka) {
    pathPustaka.addEventListener('click', function () {
      setSumberPath('pustaka', actions);
      buildChannelChips(actions);
    });
  }
  if (pathMateri) {
    pathMateri.addEventListener('click', function () {
      setSumberPath('materi', actions);
    });
  }
  if (state.sources.dokumen && state.channel && String(state.channel).indexOf('doc:') === 0) {
    setSumberPath('materi', actions);
  } else {
    setSumberPath('pustaka', actions);
  }

  document.querySelectorAll('#docModes .chip').forEach(function (c) {
    c.classList.toggle('on', c.getAttribute('data-doc-mode') === (state.docMode || 'baca'));
  });
  buildChannelChips(actions);

  R.$('channels').addEventListener('click', function (e) {
    const c = e.target.closest('.chip[data-channel]');
    if (!c) return;
    state.channel = c.getAttribute('data-channel');
    R.$('channels').querySelectorAll('.chip').forEach(function (x) { x.classList.toggle('on', x === c); });
    pituturState.save();
    actions.batal();
    if (state.channel.indexOf('doc:') === 0) renderDocList();
  });

  document.querySelectorAll('#modes .chip').forEach(function (c) {
    c.addEventListener('click', function () {
      state.mode = c.getAttribute('data-mode');
      document.querySelectorAll('#modes .chip').forEach(function (x) { x.classList.toggle('on', x === c); });
      pituturState.save();
      R.clearSeats();
      syncModeLabel();
      actions.batal();
      closeSheets();
    });
  });

  const grpDokumen = R.$('grpDokumen');
  document.querySelectorAll('#sources .src').forEach(function (c) {
    c.addEventListener('click', function () {
      const k = c.getAttribute('data-source');
      state.sources[k] = !state.sources[k];
      c.classList.toggle('on', state.sources[k]);
      pituturState.save();
      if (k === 'dokumen' && grpDokumen) {
        grpDokumen.hidden = !state.sources.dokumen;
        if (state.sources.dokumen) renderDocList();
      }
      R.toast('Sumber ' + k + (state.sources[k] ? ' dinyalakan' : ' dimatikan'));
      actions.batal();
      buildChannelChips(actions);
    });
  });
  if (grpDokumen) {
    grpDokumen.hidden = !state.sources.dokumen;
    if (state.sources.dokumen) renderDocList();
  }

  document.querySelectorAll('#docModes .chip').forEach(function (c) {
    c.addEventListener('click', function () {
      const m = c.getAttribute('data-doc-mode') || 'baca';
      state.docMode = m;
      document.querySelectorAll('#docModes .chip').forEach(function (x) {
        x.classList.toggle('on', x === c);
      });
      pituturState.save();
      actions.batal();
      const label = m === 'ringkas' ? 'Ringkasan' : (m === 'faq' ? 'FAQ' : 'Baca');
      R.toast('Mode materi: ' + label);
    });
  });


  const fileDokumen = R.$('fileDokumen');
  const docStatus = R.$('docStatus');
  const inputUrl = R.$('inputUrl');
  const inputPaste = R.$('inputPaste');
  const btnMateriAksi = R.$('btnMateriAksi');
  let materiInput = 'paste';

  function setMateriInput(mode) {
    materiInput = mode || 'paste';
    document.querySelectorAll('#materiInputModes .mTool').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-materi-input') === materiInput);
    });
    if (inputPaste) inputPaste.hidden = materiInput !== 'paste';
    if (inputUrl) inputUrl.hidden = materiInput !== 'url';
    if (btnMateriAksi) {
      btnMateriAksi.textContent = materiInput === 'url' ? 'Ambil' : (materiInput === 'file' ? 'Pilih file' : 'Simpan');
    }
    if (materiInput === 'paste' && inputPaste) inputPaste.focus();
    if (materiInput === 'url' && inputUrl) inputUrl.focus();
  }

  document.querySelectorAll('#materiInputModes .mTool').forEach(function (b) {
    b.addEventListener('click', function () {
      const mode = b.getAttribute('data-materi-input');
      setMateriInput(mode);
      if (mode === 'file' && fileDokumen) fileDokumen.click();
    });
  });
  setMateriInput('paste');

  function masukkanMateri(doc) {
    return aktifkanDokumen(doc.id, actions);
  }

  if (fileDokumen) {
    fileDokumen.addEventListener('change', function () {
      const file = fileDokumen.files && fileDokumen.files[0];
      fileDokumen.value = '';
      if (!file) return;
      if (docStatus) docStatus.textContent = 'Memproses "' + file.name + '" ...';
      pituturDokumen.tambah(file, function (hal, total) {
        if (docStatus) docStatus.textContent = 'Membaca PDF halaman ' + hal + '/' + total + ' ...';
      }).then(function (doc) {
        if (docStatus) docStatus.textContent = doc.chunkCount + ' bagian · ' + doc.words + ' kata';
        R.toast('Materi siap · ' + doc.words + ' kata');
        return masukkanMateri(doc);
      }).catch(function (err) {
        if (docStatus) docStatus.textContent = err && err.message ? err.message : 'Gagal memproses';
        R.toast('Gagal: ' + (err && err.message ? err.message : 'tidak diketahui'));
      });
    });
  }

  if (btnMateriAksi) {
    btnMateriAksi.addEventListener('click', function () {
      if (materiInput === 'file') {
        if (fileDokumen) fileDokumen.click();
        return;
      }
      if (materiInput === 'url') {
        const url = (inputUrl && inputUrl.value || '').trim();
        if (!url) {
          R.toast('Isi URL dulu');
          return;
        }
        if (docStatus) docStatus.textContent = 'Mengambil URL ...';
        pituturHttp.ambilUrl(url).then(function (hasil) {
          if (!hasil.ok) {
            const msg = hasil.error || 'Gagal mengambil URL';
            if (docStatus) docStatus.textContent = msg;
            R.toast(msg.length > 80 ? 'URL gagal — pakai mode Teks' : msg);
            setMateriInput('paste');
            if (inputPaste && !inputPaste.value) {
              inputPaste.placeholder = 'Tempel teks / transkrip di sini (URL tidak bisa diambil otomatis)';
            }
            return null;
          }
          const nama = (hasil.title || 'Artikel').slice(0, 80) + '.txt';
          return pituturDokumen.tambahTeks(nama, hasil.text, 'url').then(function (doc) {
            if (docStatus) docStatus.textContent = doc.chunkCount + ' bagian · ' + doc.words + ' kata';
            if (inputUrl) inputUrl.value = '';
            R.toast('URL siap · ' + doc.words + ' kata');
            return masukkanMateri(doc);
          });
        }).catch(function (err) {
          const msg = err && err.message ? err.message : 'Gagal';
          if (docStatus) docStatus.textContent = msg;
          R.toast('Gagal: ' + msg);
          setMateriInput('paste');
        });
        return;
      }
      const teks = (inputPaste && inputPaste.value || '').trim();
      if (!teks || teks.length < 20) {
        R.toast('Tempel teks yang lebih panjang');
        return;
      }
      const nama = 'Tempelan ' + new Date().toLocaleDateString('id-ID') + '.txt';
      if (docStatus) docStatus.textContent = 'Menyimpan ...';
      pituturDokumen.tambahTeks(nama, teks, 'txt').then(function (doc) {
        if (docStatus) docStatus.textContent = doc.chunkCount + ' bagian · ' + doc.words + ' kata';
        if (inputPaste) inputPaste.value = '';
        R.toast('Teks siap · ' + doc.words + ' kata');
        return masukkanMateri(doc);
      }).catch(function (err) {
        if (docStatus) docStatus.textContent = '';
        R.toast('Gagal: ' + (err && err.message ? err.message : ''));
      });
    });
  }

  function isiVoiceSelects() {
    const voices = pituturVoice.daftarVoice();
    const cast = pituturVoice.bacaCast();
    const map = { Warta: 'voiceWarta', Tanya: 'voiceTanya', Kisah: 'voiceKisah' };
    Object.keys(map).forEach(function (speaker) {
      const sel = R.$(map[speaker]);
      if (!sel) return;
      const current = cast[speaker] || '';
      const opts = ['<option value="">Otomatis</option>'].concat(
        voices.map(function (v) {
          const label = v.name + ' (' + (v.lang || '') + ')';
          const selected = v.name === current ? ' selected' : '';
          return '<option value="' + R.escapeAttr(v.name) + '"' + selected + '>' + R.escapeHtml(label) + '</option>';
        })
      );
      sel.innerHTML = opts.join('');
    });
  }

  function pasangVoiceSelects() {
    const map = { Warta: 'voiceWarta', Tanya: 'voiceTanya', Kisah: 'voiceKisah' };
    Object.keys(map).forEach(function (speaker) {
      const sel = R.$(map[speaker]);
      if (!sel) return;
      sel.addEventListener('change', function () {
        const cast = pituturVoice.bacaCast();
        const val = sel.value;
        if (val) cast[speaker] = val;
        else delete cast[speaker];
        pituturVoice.simpanCast(cast);
        R.toast('Suara ' + speaker + ' disimpan');
      });
    });
  }

  pituturVoice.waitForVoices(2000).then(function () {
    isiVoiceSelects();
    pasangVoiceSelects();
  });
  window.addEventListener('pitutur-voices', function () {
    isiVoiceSelects();
  });

  const docList = R.$('docList');
  if (docList) {
    docList.addEventListener('click', function (e) {
      const reset = e.target.closest('[data-reset-doc]');
      if (reset) {
        const id = reset.getAttribute('data-reset-doc');
        if (state.docPos) delete state.docPos[id];
        pituturState.save(true);
        R.toast('Progres diulang dari awal');
        renderDocList();
        actions.batal();
        return;
      }
      const btn = e.target.closest('[data-hapus-doc]');
      if (btn) {
        const id = btn.getAttribute('data-hapus-doc');
        const idKanal = 'doc:' + id;
        pituturDokumen.hapus(id).then(function () {
          if (state.channel === idKanal) {
            state.channel = 'pagi';
            pituturState.save();
            actions.batal();
          }
          if (state.docPos) delete state.docPos[id];
          pituturState.save();
          R.toast('Materi dihapus');
          return Promise.all([renderDocList(), buildChannelChips(actions)]);
        }).catch(function (err) {
          R.toast('Gagal menghapus: ' + (err && err.message ? err.message : ''));
        });
        return;
      }
      const item = e.target.closest('[data-doc-id]');
      if (!item) return;
      const id = item.getAttribute('data-doc-id');
      aktifkanDokumen(id, actions).then(function () {
        const pos = (state.docPos && state.docPos[id]) || 0;
        R.toast(pos > 0
          ? 'Lanjut dari bagian ' + (pos + 1) + ' — Susun Naskah lalu Putar'
          : 'Materi dipilih — Susun Naskah lalu Putar');
      });
    });
  }

  R.$('topic').addEventListener('input', function () { actions.batal(); });
  R.$('rate').addEventListener('change', function (e) {
    state.rate = parseFloat(e.target.value);
    pituturState.save();
  });
  R.$('lang').addEventListener('change', function (e) {
    state.lang = e.target.value;
    pituturState.save();
    actions.batal();
  });
  R.$('btnPreview').addEventListener('click', function () {
    actions.susun().then(function (lines) {
      if (lines) closeSheets();
    });
  });
  R.$('btnPlay').addEventListener('click', actions.play);
  R.$('btnStop').addEventListener('click', actions.stop);

  const btnPause = R.$('btnPause');
  if (btnPause) btnPause.addEventListener('click', actions.togglePause);

  const selSleep = R.$('selSleep');
  if (selSleep) {
    selSleep.value = String(state.settings.sleep);
    selSleep.addEventListener('change', function (e) {
      state.settings.sleep = parseInt(e.target.value, 10) || 0;
      pituturState.save();
      actions.aturSleep(state.settings.sleep);
    });
  }

  const tglRoom = R.$('tglRoom');
  if (tglRoom) {
    tglRoom.checked = state.settings.roomTone;
    tglRoom.addEventListener('change', function (e) {
      state.settings.roomTone = e.target.checked;
      pituturState.save();
    });
  }

  const tglWake = R.$('tglWake');
  if (tglWake) {
    tglWake.checked = state.settings.wakeLock;
    tglWake.addEventListener('change', function (e) {
      state.settings.wakeLock = e.target.checked;
      pituturState.save();
    });
  }

  document.querySelectorAll('.barBtn[data-sheet]').forEach(function (b) {
    b.addEventListener('click', function () {
      const sh = R.$(b.getAttribute('data-sheet'));
      const wasOpen = sh.classList.contains('open');
      closeSheets();
      if (!wasOpen) {
        sh.classList.add('open');
        scrim.classList.add('on');
        b.classList.add('on');
      }
    });
  });

  scrim.addEventListener('click', closeSheets);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSheets();
  });


  const btnBuatSesi = R.$('btnBuatSesi');
  const inputSesiNama = R.$('inputSesiNama');
  if (btnBuatSesi && inputSesiNama) {
    btnBuatSesi.addEventListener('click', function () {
      const nama = (inputSesiNama.value || '').trim();
      const ch = state.channel || '';
      if (ch.indexOf('doc:') !== 0) {
        R.toast('Pilih materi aktif dulu');
        return;
      }
      const docId = ch.slice(4);
      pituturDokumen.ambil(docId).then(function (doc) {
        if (!doc) throw new Error('Materi tidak ditemukan');
        return notebookStore.buat(nama, doc, {
          mode: state.mode,
          lang: state.lang,
          docMode: state.docMode
        });
      }).then(function () {
        inputSesiNama.value = '';
        R.toast('Sesi disimpan');
        return renderSesiList();
      }).catch(function (err) {
        R.toast(err && err.message ? err.message : 'Gagal membuat sesi');
      });
    });
  }

  const sesiList = R.$('sesiList');
  if (sesiList) {
    sesiList.addEventListener('click', function (e) {
      const hapus = e.target.closest('[data-hapus-sesi]');
      if (hapus) {
        const id = hapus.getAttribute('data-hapus-sesi');
        notebookStore.hapus(id).then(function () {
          R.toast('Sesi dihapus');
          return renderSesiList();
        }).catch(function () {
          R.toast('Gagal menghapus sesi');
        });
        return;
      }
      const lanjut = e.target.closest('[data-lanjut-sesi]');
      if (!lanjut) return;
      const id = lanjut.getAttribute('data-lanjut-sesi');
      notebookStore.ambil(id).then(function (nb) {
        if (!nb) {
          R.toast('Sesi tidak ditemukan');
          return null;
        }
        const src = (nb.sources || []).find(function (s) { return s.type === 'dokumen' && s.ref; });
        if (!src) {
          R.toast('Sesi belum punya materi');
          return null;
        }
        if (nb.settings) {
          if (nb.settings.mode) state.mode = nb.settings.mode;
          if (nb.settings.lang) state.lang = nb.settings.lang;
          if (nb.settings.docMode) state.docMode = nb.settings.docMode;
        }
        if (nb.progress && nb.progress[src.ref] != null) {
          state.docPos[src.ref] = nb.progress[src.ref];
        }
        pituturState.save();
        return aktifkanDokumen(src.ref, actions).then(function () {
          R.toast('Sesi dibuka — Susun Naskah lalu Putar');
          return renderSesiList();
        });
      });
    });
  }

  window.addEventListener('pitutur-materi-update', function () {
    renderDocList();
    renderSesiList();
  });

  syncModeLabel();
}

