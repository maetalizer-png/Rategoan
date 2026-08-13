/**
 * Voice Input/Output - Speech recognition and synthesis
 * @module ui/components/voice
 */

import { RG } from '../../core/index.js';

/**
 * Voice interaction manager
 */
RG.voice = {
  listening: false,
  rec: null,

  /**
   * Speak text using speech synthesis
   * @param {string} text - Text to speak
   */
  speak(text) {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text.replace(/[*_#`~]/g, ''));
    u.lang = 'id-ID';
    u.onstart = () => RG.$('btn-stop').classList.add('active');
    u.onend = () => RG.$('btn-stop').classList.remove('active');
    u.onerror = () => RG.$('btn-stop').classList.remove('active');
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  },

  /**
   * Stop speech synthesis
   */
  stop() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  },

  /**
   * Start speech recognition
   */
  listen() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { RG.toast.show('Input suara tidak didukung'); return; }
    if (this.listening) { try { this.rec && this.rec.stop(); } catch (e) {} return; }
    try { this.rec = new SR(); } catch (e) { RG.toast.show('Input suara gagal'); return; }
    this.rec.lang = 'id-ID';
    this.rec.interimResults = false;
    this.rec.onstart = () => {
      this.listening = true;
      RG.$('btn-voice-input').classList.add('listening');
    };
    this.rec.onresult = (e) => {
      const t = e.results[0][0].transcript;
      const inp = RG.$('chat-input');
      inp.value += (inp.value ? ' ' : '') + t;
      RG.composer.autoGrow();
    };
    this.rec.onerror = (e) => RG.toast.show('Suara: ' + (e.error || 'gagal'));
    this.rec.onend = () => {
      this.listening = false;
      RG.$('btn-voice-input').classList.remove('listening');
    };
    try { this.rec.start(); } catch (e) { RG.toast.show('Input suara tidak dapat dimulai'); }
  },

  /**
   * Bind voice event listeners
   */
  bind() {
    RG.$('btn-stop').onclick = () => this.stop();
    RG.$('btn-voice-input').onclick = () => this.listen();
  },
};

export { RG };
