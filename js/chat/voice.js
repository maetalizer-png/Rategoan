import { $ } from '../../shared/dom.js';
import { toast } from '../core/toast.js';
import { composer } from './composer.js';

export const voice = {
  listening: false,
  speakNext: false,
  rec: null,
  speak(text) {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    if (synth.speaking && this._last === text) {
      if (synth.paused) {
        synth.resume();
        toast.show('Suara lanjut');
      } else {
        synth.pause();
        toast.show('Suara dijeda');
      }
      return;
    }
    this._last = text;
    const u = new SpeechSynthesisUtterance(text.replace(/[*_#`~]/g, ''));
    u.lang = 'id-ID';
    u.onstart = () => $('btn-stop').classList.add('active');
    u.onend = () => $('btn-stop').classList.remove('active');
    u.onerror = () => $('btn-stop').classList.remove('active');
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  },
  stop() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    this.speakNext = false;
  },
  listen() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast.show('Input suara tidak didukung');
      return;
    }
    if (this.listening) {
      try {
        this.rec && this.rec.stop();
      } catch (e) { console.warn('[Rategoan Fallback]', e); }
      return;
    }
    try {
      this.rec = new SR();
    } catch (e) {
      toast.show('Input suara gagal');
      return;
    }
    this.rec.lang = 'id-ID';
    this.rec.interimResults = false;
    this.rec.onstart = () => {
      this.listening = true;
      $('btn-voice-input').classList.add('listening');
    };
    this.rec.onresult = (e) => {
      const result = e.results[0];
      if (!result || !result[0]) return;
      const t = result[0].transcript;
      const inp = $('chat-input');
      inp.value += (inp.value ? ' ' : '') + t;
      inp.dispatchEvent(new Event('input'));
      composer.autoGrow();
      if (inp.value.trim()) {
        this.speakNext = true;
        const btn = $('btn-send');
        if (btn) btn.click();
      }
    };
    this.rec.onerror = (e) => toast.show('Suara: ' + (e.error || 'gagal'));
    this.rec.onend = () => {
      this.listening = false;
      $('btn-voice-input').classList.remove('listening');
    };
    try {
      this.rec.start();
    } catch (e) {
      toast.show('Input suara tidak dapat dimulai');
    }
  },
  bind() {
    $('btn-stop').onclick = () => {
      this.stop();
      document.dispatchEvent(new CustomEvent('rategoan:stop-generation'));
    };
    const btn = $('btn-voice-input');
    if (!btn) return;
    btn.onclick = (event) => {
      event.preventDefault();
      if (this.listening) {
        try { this.rec && this.rec.stop(); } catch (e) { console.warn('[Rategoan Fallback]', e); }
      } else this.listen();
    };
  },
};
