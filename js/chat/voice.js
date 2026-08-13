import { $ } from '../utils/dom.js';
import { toast } from '../core/toast.js';
import { composer } from './composer.js';

export const voice = {
  listening: false,
  rec: null,
  speak(text) {
    if (!('speechSynthesis' in window)) return;
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
      } catch (e) {}
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
      const t = e.results[0][0].transcript;
      const inp = $('chat-input');
      inp.value += (inp.value ? ' ' : '') + t;
      composer.autoGrow();
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
    $('btn-stop').onclick = () => this.stop();
    $('btn-voice-input').onclick = () => this.listen();
  },
};
