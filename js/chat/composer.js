import { $, scrollBottom } from '../../shared/dom.js';
import { haptics } from '../../shared/haptics.js';
import { toast } from '../core/toast.js';
import { store } from '../state/store.js';
import { auth } from '../state/auth.js';
import { router } from '../core/router.js';
import { drawer } from '../ui/drawer.js';
import { quote } from '../ui/quote.js';
import { history } from '../history/history.js';
import { chat } from './chat.js';
import { attach } from '../sheets/attach.js';
import { sheets } from '../sheets/sheets.js';
import { googleAuth } from '../state/google-auth.js';
import { summarizeFileText, answerFromFile } from '../../shared/file-summary.js';
import { memoryLong } from '../../raget/raget-memory/memory-long.js';
import { collectionStore } from '../../raget/raget-memory/collection-store.js';
import { buildOutline, exportSlides, previewOutline, rememberSlide, allArtifacts } from '../../shared/slides-export.js';
import { turnPipeline } from '../../raget/raget-agents/turn-pipeline.js';
import { toolsKoleksi } from '../../raget/raget-agents/tools-koleksi.js';
import { flowHub } from '../../raget/raget-agents/flow-hub.js';
import { toolsKode } from '../../raget/raget-agents/tools-kode.js';
import { artifact } from '../ui/artifact.js';
import { workspace } from '../state/workspace.js';
import { projectPage } from '../project/project.js';
import { runAgentPlan } from '../agent/worker-bridge.js';
import { mountThought } from '../ui/thought-card.js';
import { mountQuiz } from '../ui/quiz-card.js';
import { parseChartAsk, buildChartSvg } from '../../shared/charts-local.js';
import { parseDiagramAsk, buildDiagramSvg } from '../../shared/diagrams-local.js';
import { printReport } from '../../shared/report-export.js';
import { cancelAgent } from '../agent/worker-bridge.js';

const FILE_READ_RE = /\b(baca|ringkas|rangkum|ekstrak|extract|impor|import)\b/i;
const FILE_ASK_RE = /\b(baca|ringkas|rangkum|jelaskan|uraikan|apa\s+(isi|kata|yang)|tentang\s+(file|dokumen|lampiran|pdf)|dokumen|lampiran)\b/i;
const WORK_RE = /\b(tugas|skripsi|makalah|rencana|langkah|proyek|pekerjaan|kerjakan)\b/i;

function wrapTrace(title, body) {
  if (!body) return '';
  return '<trace title="' + String(title || 'Jejak').replace(/"/g, '') + '">\n' + body + '\n</trace>';
}

function titleFrom(text) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (!t) return 'Chat';
  if (t.length <= 36) return t;
  return t.slice(0, 36).replace(/\s+\S*$/, '') || t.slice(0, 36);
}

function lastAttachedFile(session) {
  const msgs = (session && session.messages) || [];
  for (let i = msgs.length - 1; i >= 0; i -= 1) {
    const att = msgs[i].attach;
    if (att && att.fileText) return att;
  }
  return null;
}

const SLIDE_ACTION_RE = /\b(buat(kan)?|bikin|jadikan|susun|export|unduh)\b/i;
const SLIDE_NOUN_RE = /\b(slide|ppt|pptx)\b/i;

async function pickSlideMaterial(session, att) {
  if (att && att.fileText) {
    return { text: att.fileText, title: (att.name || 'Presentasi').replace(/\.[a-z0-9]+$/i, '') };
  }
  const msgs = (session && session.messages) || [];
  for (let i = msgs.length - 1; i >= 0; i -= 1) {
    const m = msgs[i];
    if (!m || m.role === 'user' || !m.text) continue;
    if (/Pratinjau slide|Unduh file slide|sudah diunduh/.test(m.text)) continue;
    if (m.source === 'websearch' || m.text.length >= 160) {
      return { text: m.text, title: session.title && session.title !== 'Chat' ? session.title : 'Presentasi' };
    }
  }
  const items = await collectionStore.allItems();
  for (let i = items.length - 1; i >= 0; i -= 1) {
    const it = items[i];
    if (it && it.text && it.text.length >= 80) {
      return { text: it.text, title: it.chatTitle || 'Koleksi' };
    }
  }
  return null;
}

function lastAiText(session) {
  const msgs = (session && session.messages) || [];
  for (let i = msgs.length - 1; i >= 0; i -= 1) {
    if (msgs[i].role !== 'user' && msgs[i].text) return msgs[i].text;
  }
  return '';
}

async function trySlideRequest(text, att, session) {
  if (!(SLIDE_ACTION_RE.test(text) && SLIDE_NOUN_RE.test(text))) return null;
  const fromLast = /\b(dari\s+ini|dari\s+jawaban|dari\s+hasil|jawaban\s+ini)\b/i.test(text);
  let material = null;
  let judul = 'Presentasi';
  if (att && att.fileText) {
    material = att.fileText;
    judul = (att.name || judul).replace(/\.[a-z0-9]+$/i, '');
  } else {
    const afterColon = text.split(':').slice(1).join(':').trim();
    if (afterColon) {
      material = afterColon;
      const topicMatch = text.match(/\b(?:tentang|untuk|dari)\s+([^:]+?)(?::|$)/i);
      if (topicMatch && !fromLast) judul = topicMatch[1].trim();
    }
  }
  if (!material || fromLast) {
    const prev = lastAiText(session);
    if (prev) {
      material = prev;
      if (session && session.title && session.title !== 'Chat') judul = session.title;
    }
  }
  if (!material) {
    const picked = await pickSlideMaterial(session, att);
    if (picked) {
      material = picked.text;
      judul = picked.title || judul;
    }
  }
  if (!material) {
    return 'Boleh, tapi saya butuh bahannya dulu — lampirkan file, ketik "buatkan slide tentang judul: isi", tanya dulu, atau simpan ke Koleksi lalu tap Slide.';
  }
  try {
    const outline = buildOutline(material, judul);
    const fileName = judul.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'slide';
    rememberSlide(outline, fileName + '.pptx');
    artifact.open(outline, judul, fileName + '.pptx');
    return previewOutline(outline) + '\n\nKetuk Unduh file slide kalau mau simpan PPTX.';
  } catch (e) {
    return 'Gagal membuat slide: ' + (e && e.message ? e.message : 'error tidak diketahui');
  }
}


const DOC_RE = /\b(buat(?:kan)?|tulis|susun)\s+(dokumen|laporan|makalah|catatan)\b/i;
const WORD_RE = /\b(docx|dokumen word|file word|microsoft word)\b/i;

function artifactTag(type, title, filename, body) {
  const safe = String(body || '').replace(/<\/artifact>/gi, '< /artifact>');
  const cleanTitle = String(title || 'Dokumen').replace(/"/g, '');
  const cleanName = String(filename || 'dokumen.docx').replace(/"/g, '');
  return '<artifact type="' + type + '" title="' + cleanTitle + '" filename="' + cleanName + '">' + safe + '</artifact>';
}

async function tryDocumentRequest(text, session) {
  const wantsWord = WORD_RE.test(text);
  if (!DOC_RE.test(text) && !wantsWord) return null;
  const material = lastAiText(session) || text.replace(DOC_RE, '').replace(WORD_RE, '').trim();
  if (!material) return 'Tanya topiknya dulu, baru minta dokumen.';
  const title = (session && session.title && session.title !== 'Chat') ? session.title : 'Dokumen';
  const md = '# ' + title + '\n\n' + material;
  const fileBase = title.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'dokumen';
  const fileName = fileBase + (wantsWord ? '.docx' : '.md');
  artifact.open({ type: 'document', markdown: md, title: title, fileName: fileName }, title);
  if (!wantsWord) return 'Dokumen terbuka di panel kanan. Bisa diedit lalu diunduh sebagai Markdown.';
  return artifactTag('document', title, fileName, md) + '\n\nDokumen Word siap di kartu obrolan. Ketuk Unduh berkas.';
}

async function tryCodeArtifact(text) {
  if (!toolsKode.isCodeQuestion(text)) return false;
  try {
    const packed = await toolsKode.compose(text);
    const m = packed && packed.text && packed.text.match(/```(\w+)?\n([\s\S]*?)```/);
    if (!m) return false;
    const lang = m[1] || packed.lang || 'js';
    artifact.open({ type: 'code', code: m[2], lang: lang, title: 'Kode', fileName: 'cuplikan.' + (lang === 'python' || lang === 'py' ? 'py' : lang === 'html' ? 'html' : lang === 'css' ? 'css' : 'js') }, 'Kode');
    return true;
  } catch (e) {
    return false;
  }
}


const TABLE_RE = /\b(buat(kan)?|susun|jadikan)\s+tabel\b/i;

function textToTable(text) {
  const lines = String(text || '').split(/\n+/).map((l) => l.replace(/^\s*[-•]\s*/, '').trim()).filter((l) => l.length > 8).slice(0, 8);
  const rows = [['Poin', 'Isi']];
  lines.forEach((l, i) => {
    const parts = l.split(/[—:\-]/);
    if (parts.length >= 2) rows.push([parts[0].trim().slice(0, 40), parts.slice(1).join(':').trim().slice(0, 120)]);
    else rows.push([String(i + 1), l.slice(0, 140)]);
  });
  if (rows.length < 2) rows.push(['1', String(text || '').slice(0, 140)]);
  return rows;
}

async function tryDiagramRequest(text) {
  const spec = parseDiagramAsk(text);
  if (!spec) return null;
  const svg = buildDiagramSvg(spec);
  artifact.open({ type: 'diagram', markdown: svg, spec, title: 'Diagram', fileName: 'diagram.svg' }, 'Diagram');
  return 'Diagram terbuka di panel. Bisa diperbesar dan diunduh sebagai SVG.';
}

async function tryReportRequest(text) {
  if (!/\b(cetak|siap cetak|laporan pdf|simpan pdf)\b/i.test(text)) return null;
  const body = '<p>' + text.replace(/</g, '').slice(0, 4000) + '</p>';
  artifact.open({ type: 'report', markdown: body, title: 'Laporan', fileName: 'laporan.html' }, 'Laporan');
  printReport({ title: 'Laporan', body });
  return 'Pratinjau cetak dibuka. Simpan sebagai PDF dari jendela cetak.';
}

async function tryChartRequest(text) {
  if (!/\b(grafik|chart)\b/i.test(text)) return null;
  const spec = parseChartAsk(text);
  if (!spec) return 'Sebut nilainya, misalnya: buat grafik batang A: 10, B: 20.';
  const svg = buildChartSvg(spec);
  artifact.open({ type: 'chart', markdown: svg, title: spec.title, fileName: 'grafik.svg' }, spec.title);
  return 'Grafik terbuka di panel. Bisa diunduh sebagai SVG.';
}

async function tryTableRequest(text, session) {
  if (!TABLE_RE.test(text)) return null;
  const material = lastAiText(session) || text.replace(TABLE_RE, '').trim();
  if (!material) return 'Tanya topiknya dulu, baru minta tabel.';
  const rows = textToTable(material);
  artifact.open({ type: 'table', rows: rows, title: 'Tabel', fileName: 'tabel.csv' }, 'Tabel');
  return 'Tabel terbuka di panel kanan. Bisa diunduh CSV.';
}

export const composer = {
  websearchActive: false,
  thinkActive: false,
  slideActive: false,
  researchActive: false,
  autoGrow() {
    const inp = $('chat-input');
    inp.style.height = 'auto';
    inp.style.height = Math.min(inp.scrollHeight, 120) + 'px';
  },
  ensure() {
    const st = store.get();
    let s = st.sessions.find((x) => x.id === st.currentId);
    if (!s) {
      s = { id: Date.now().toString(36), title: 'Chat', messages: [], created: Date.now(), projectId: workspace.currentId() };
      store.set({ sessions: [s].concat(st.sessions), currentId: s.id });
    }
    return s;
  },
  async send(text) {
    const s = this.ensure();
    if (!s.messages.length) s.title = titleFrom(text);
    if (WORK_RE.test(text) && !s.project) {
      s.project = { goal: titleFrom(text), started: Date.now() };
    }
    try { memoryLong.learnFromText(text); } catch (e) { console.warn('[Rategoan Fallback]', e); }
    const att = attach.consume();
    const q = quote.consume();
    s.messages.push({
      role: 'user',
      text: text,
      time: Date.now(),
      attach: att,
      quote: q ? { name: q.role === 'user' ? 'Anda' : 'Rategoan', text: String(q.text).slice(0, 140) } : null,
    });
    store.save();
    history.render();
    chat.renderMessages();
    haptics.tap(10);
    const projNew = text.match(/^proyek baru\s+(.+)$/i);
    if (projNew) {
      const p = workspace.create(projNew[1]);
      const reply = 'Proyek "' + p.name + '" aktif. Chat baru di sini tidak tercampur proyek lain.';
      s.projectId = p.id;
      s.project = { goal: p.name, started: Date.now() };
      await chat.ask(text, { directReply: reply });
      store.save();
      return;
    }
    const projGo = text.match(/^pindah proyek\s+(.+)$/i);
    if (projGo) {
      const found = workspace.findByName(projGo[1]);
      const reply = found ? (workspace.setCurrent(found.id) && ('Pindah ke proyek "' + found.name + '".')) : 'Proyek tidak ketemu. Ketik proyek baru <nama>.';
      if (found) s.projectId = found.id;
      await chat.ask(text, { directReply: reply });
      store.save();
      return;
    }
    if (/^proyek ini$/i.test(text.trim())) {
      const cur = workspace.current();
      await chat.ask(text, { directReply: cur ? ('Proyek aktif: ' + cur.name) : 'Belum ada proyek. Ketik proyek baru <nama>.' });
      store.save();
      return;
    }
    if (flowHub.wantsLesson(text)) {
      const material = lastAiText(s) || text;
      await chat.ask(text, { directReply: flowHub.lesson(material, s.title) });
      store.save();
      return;
    }
    if (this.researchActive || flowHub.wantsResearch(text)) this.setWebsearch(true);
    const plan = turnPipeline.inspect(text, {
      messages: s.messages,
      attach: att,
      websearch: this.websearchActive || this.researchActive,
    });
    const isWebsearch = plan.route === 'web' || plan.route === 'research' || this.researchActive;
    const deep = this.researchActive || flowHub.wantsResearch(text);
    const routedText = isWebsearch ? ((deep ? 'riset ' : 'googling ') + text.replace(/^riset\s+(mendalam\s+)?/i, '')) : text;
    if (plan.route === 'slide' && /^(lanjut|lanjutkan|dari ini)$/i.test(text.trim())) {
      text = 'buatkan slide dari ini';
    }
    let directReply = await trySlideRequest(text, att, s);
    if (directReply == null) directReply = await tryDocumentRequest(text, s);
    if (directReply == null) directReply = await tryTableRequest(text, s);
    if (directReply == null) directReply = await tryChartRequest(text);
    if (directReply == null) directReply = await tryDiagramRequest(text);
    if (directReply == null) directReply = await tryReportRequest(text);
    if (directReply == null && plan.route === 'collection') {
      directReply = await toolsKoleksi.run('cari_koleksi', text);
    }
    const fileSrc = (att && (att.fileText || att.fileTextError)) ? att : lastAttachedFile(s);
    if (directReply == null && fileSrc && (FILE_ASK_RE.test(text) || FILE_READ_RE.test(text))) {
      if (fileSrc.fileText) {
        if (FILE_READ_RE.test(text) && !/\b(apa|jelaskan|tentang)\b/i.test(text)) {
          directReply = summarizeFileText(fileSrc.fileText, fileSrc.name);
        } else {
          directReply = answerFromFile(fileSrc.fileText, text, fileSrc.name);
        }
      } else if (fileSrc.fileTextError) directReply = fileSrc.fileTextError;
    }
    const project = workspace.current();
    if (project) workspace.linkSession(project.id, s.id);
    let projectPrefix = '';
    if (project && (project.systemPrompt || (project.pinnedFiles && project.pinnedFiles.length))) {
      projectPrefix = '[Instruksi proyek ' + project.name + ']\n' + (project.systemPrompt || '') + '\n' + (project.pinnedFiles || []).map((file) => file.name + ': ' + String(file.textContent || '').slice(0, 400)).join('\n');
    }
    let thoughts = null;
    if (this.thinkActive || this.researchActive) {
      const live = document.createElement('div');
      live.className = 'msg ai';
      const card = mountThought(live, [{ kind: 'EMIT_THOUGHT', text: 'Menyiapkan jejak…' }], 'berjalan');
      $('messages').appendChild(live);
      const plan = await runAgentPlan({
        text,
        think: this.thinkActive,
        research: this.researchActive,
        files: att && att.name,
        sessionId: s.id,
        onStep: (steps) => {
          if (!card) return;
          live.innerHTML = '';
          mountThought(live, steps, 'berjalan');
        },
      });
      if (plan.status === 'dibatalkan') {
        live.remove();
        return;
      }
      thoughts = plan.steps;
      live.remove();
    }
    let reply = await chat.ask(routedText, { searching: isWebsearch, directReply, thoughts, preamble: [projectPrefix, wrapTrace('Langkah riset', (this.researchActive || flowHub.wantsResearch(text)) ? flowHub.researchPlan(text) : ''), wrapTrace('Proses berpikir', (this.thinkActive || flowHub.wantsThink(text)) ? flowHub.thinkBlock(text) : '')].filter(Boolean).join('\n\n') });
    if (reply == null) {
      toast.show('AI belum terpasang');
      return;
    }
    if (deep && reply) {
      const body = '<h2>Abstrak</h2><p>' + String(reply).replace(/</g, '').slice(0, 4000) + '</p><h2>Cabang kueri</h2><pre>' + flowHub.researchPlan(text).replace(/</g, '') + '</pre>';
      artifact.open({ type: 'report', markdown: body, title: 'Berkas riset', fileName: 'riset.html' }, 'Berkas riset');
    }
    if (plan.route === 'tool' || toolsKode.isCodeQuestion(text)) {
      await tryCodeArtifact(text);
    }
    if (isWebsearch && reply) {
      try {
        if (!(await collectionStore.existsByText(reply))) {
          await collectionStore.addItem({
            text: reply,
            role: 'ai',
            tag: 'web',
            kind: 'web',
            note: flowHub.threePoints(reply),
            chatTitle: s.title || '',
            projectId: s.projectId || workspace.currentId(),
          });
        }
      } catch (e) { console.warn('[Rategoan Fallback]', e); }
    }
    store.save();
    history.render();
  },

  _toggleSwitch(id, on) {
    const card = $(id);
    if (card) {
      card.classList.toggle('active', on);
      card.setAttribute('aria-checked', String(on));
    }
  },
  syncModes() {
    attach.setModes({
      websearch: this.websearchActive,
      think: this.thinkActive,
      research: this.researchActive,
    });
  },
  setWebsearch(active) {
    this.websearchActive = active;
    const card = $('sheet-websearch');
    const inp = $('chat-input');
    if (card) {
      card.classList.toggle('active', active);
      card.setAttribute('aria-checked', String(active));
    }
    if (inp) inp.placeholder = 'Tanya Rategoan';
    this.paintQuick();
    this.syncModes();
  },
  paintQuick() {
    const web = $('btn-quick-web');
    const think = $('btn-quick-think');
    const slide = $('btn-quick-slide');
    if (web) {
      web.hidden = !this.websearchActive;
      web.classList.toggle('on', !!this.websearchActive);
      web.setAttribute('aria-pressed', String(!!this.websearchActive));
    }
    if (think) {
      think.hidden = !this.thinkActive;
      think.classList.toggle('on', !!this.thinkActive);
      think.setAttribute('aria-pressed', String(!!this.thinkActive));
    }
    if (slide) {
      slide.hidden = !this.slideActive;
      slide.classList.toggle('on', !!this.slideActive);
      slide.setAttribute('aria-pressed', String(!!this.slideActive));
    }
  },
  bind() {
    const inp = $('chat-input');
    if (!inp) return;
    inp.addEventListener('input', () => this.autoGrow());
    inp.addEventListener('focus', () => setTimeout(scrollBottom, 250));
    const send = $('btn-send');
    if (send) send.onclick = () => {
      let t = inp.value.trim();
      if (!t && !attach.current && !quote.current) return;
      if (this.slideActive && t && !SLIDE_NOUN_RE.test(t)) t = 'Buatkan slide: ' + t;
      inp.value = '';
      this.autoGrow();
      this.send(t);
    };
    const plus = $('btn-plus');
    if (plus) plus.onclick = () => attach.open();
    const stop = $('btn-stop');
    if (stop) stop.onclick = () => cancelAgent();
    document.addEventListener('rategoan:command', (event) => {
      if (event.detail === 'think') {
        this.thinkActive = true;
        this._toggleSwitch('sheet-think', true);
        this.paintQuick();
        this.syncModes();
      } else if (event.detail === 'neural') {
        try { localStorage.setItem('rategoan_engine', 'neural'); } catch (e) { console.warn('[Rategoan Fallback]', e); }
      } else if (event.detail === 'docx') {
        $('chat-input').value = 'Buatkan dokumen Word dari percakapan ini';
      } else if (event.detail === 'slide') {
        $('chat-input').value = 'Buatkan slide dari percakapan ini';
      }
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        const offset = Math.max(0, window.innerHeight - window.visualViewport.height - (window.visualViewport.offsetTop || 0));
        document.documentElement.style.setProperty('--keyboard-offset', offset + 'px');
        if (offset > 100) scrollBottom();
      });
    }
    attach.onModeOff = (key) => {
      if (key === 'websearch') this.setWebsearch(false);
      else if (key === 'think') {
        this.thinkActive = false;
        this._toggleSwitch('sheet-think', false);
        this.paintQuick();
        this.syncModes();
      } else if (key === 'research') {
        this.researchActive = false;
        this._toggleSwitch('sheet-research', false);
        this.syncModes();
      }
    };
    const modelBtn = $('btn-model');
    if (modelBtn) modelBtn.onclick = () => sheets.openModel();
    const quickWeb = $('btn-quick-web');
    if (quickWeb) quickWeb.onclick = () => this.setWebsearch(!this.websearchActive);
    const quickThink = $('btn-quick-think');
    if (quickThink) quickThink.onclick = () => {
      this.thinkActive = !this.thinkActive;
      this._toggleSwitch('sheet-think', this.thinkActive);
      this.paintQuick();
      this.syncModes();
      toast.show(this.thinkActive ? 'Berpikir keras nyala' : 'Berpikir keras mati');
    };
    const quickSlide = $('btn-quick-slide');
    if (quickSlide) quickSlide.onclick = () => {
      this.slideActive = !this.slideActive;
      this.paintQuick();
      toast.show(this.slideActive ? 'Pesan berikutnya dijadikan slide' : 'Mode slide mati');
    };
    const websearchCard = $('sheet-websearch');
    if (websearchCard) {
      websearchCard.onclick = () => {
        this.setWebsearch(!this.websearchActive);
      };
    }
    const thinkCard = $('sheet-think');
    if (thinkCard) thinkCard.onclick = () => {
      this.thinkActive = !this.thinkActive;
      this._toggleSwitch('sheet-think', this.thinkActive);
      this.paintQuick();
      this.syncModes();
    };
    const researchCard = $('sheet-research');
    if (researchCard) researchCard.onclick = () => {
      this.researchActive = !this.researchActive;
      this._toggleSwitch('sheet-research', this.researchActive);
      if (this.researchActive) this.setWebsearch(true);
      else this.syncModes();
    };
    const paintProjects = () => {
      const ul = $('project-list');
      if (!ul) return;
      ul.innerHTML = '';
      workspace.list().forEach((p) => {
        const li = document.createElement('li');
        li.textContent = p.name + (workspace.currentId() === p.id ? ' · aktif' : '');
        li.onclick = () => {
          workspace.setCurrent(p.id);
          const sess = this.ensure();
          sess.projectId = p.id;
          sess.project = { goal: p.name, started: Date.now() };
          store.save();
          toast.show('Proyek: ' + p.name);
          sheets.close();
        };
        ul.appendChild(li);
      });
    };
    const openProjectSheet = () => {
      paintProjects();
      sheets.close();
      projectPage.open();
    };
    const learnCard = $('sheet-learn');
    if (learnCard) learnCard.onclick = async () => {
      sheets.close();
      const s = this.ensure();
      const material = lastAiText(s);
      if (!material) { toast.show('Tanya dulu, baru tap Belajar'); return; }
      const reply = flowHub.lesson(material, s.title) + '\n\nCek pemahaman: jelaskan langkah 1 dengan kata sendiri.\nKetik kuis kalau mau soal pilihan. Mesin menilai lewat quiz-session, dan hitungan eksak lewat stem-engine.';
      s.messages.push({ role: 'ai', text: reply, time: Date.now() });
      store.save();
      history.render();
      chat.renderMessages();
      mountQuiz($('messages'), material);
    };
    const projectCard = $('sheet-project');
    if (projectCard) projectCard.onclick = () => openProjectSheet();
    const sideProj = $('btn-project');
    if (sideProj) sideProj.onclick = () => { drawer.close(); openProjectSheet(); };
    const makeP = $('project-create');
    if (makeP) makeP.onclick = () => {
      const name = (($('project-name') || {}).value || '').trim();
      if (!name) return;
      const found = workspace.findByName(name) || workspace.create(name);
      workspace.setCurrent(found.id);
      const sess = this.ensure();
      sess.projectId = found.id;
      sess.project = { goal: found.name, started: Date.now() };
      store.save();
      toast.show('Proyek: ' + found.name);
      sheets.close();
    };
    const slideCard = $('sheet-slide');
    if (slideCard) {
      slideCard.onclick = async () => {
        sheets.close();
        const s = this.ensure();
        const att = attach.consume();
        const picked = await pickSlideMaterial(s, att);
        if (!picked) {
          toast.show('Tanya topiknya dulu, atau simpan ke Koleksi, baru tap Slide');
          return;
        }
        try {
          const outline = buildOutline(picked.text, picked.title);
          const stamp = Date.now().toString(36);
          const fileName = (picked.title.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'slide') + '-' + stamp + '.pptx';
          rememberSlide(outline, fileName);
          await exportSlides(outline, fileName);
          artifact.open(outline, picked.title, fileName);
          const reply = artifactTag('slide', picked.title, fileName, previewOutline(outline)) + '\n\nFile PPTX sudah diunduh. Kartu di obrolan bisa mengunduh ulang.';
          s.messages.push({ role: 'ai', text: reply, time: Date.now() });
          store.save();
          history.render();
          chat.renderMessages();
        } catch (e) {
          toast.show('Gagal merangkai slide');
        }
      };
    }
    $('btn-login').onclick = () => {
      drawer.close();
      if (auth.state) {
        router.go('settings');
      } else {
        googleAuth.ensure();
        router.go('login');
      }
    };
  },
};
