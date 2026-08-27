import { $ } from '../utils/dom.js';
import { attach } from './attach.js';
import { sheets } from './sheets.js';
import { toast } from '../core/toast.js';

export const camera = {
  stream: null,
  facing: 'environment',
  async open() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      $('pick-camera').click();
      return;
    }
    sheets.close();
    $('camera-overlay').hidden = false;
    await this.startStream();
  },
  async startStream() {
    this.stopStream();
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: this.facing },
        audio: false,
      });
      $('camera-video').srcObject = this.stream;
    } catch (e) {
      toast.show('Kamera tidak bisa diakses, pakai file picker.');
      this.close();
      $('pick-camera').click();
    }
  },
  stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
  },
  close() {
    this.stopStream();
    $('camera-overlay').hidden = true;
  },
  switchFacing() {
    this.facing = this.facing === 'environment' ? 'user' : 'environment';
    this.startStream();
  },
  async capture() {
    const video = $('camera-video');
    const canvas = $('camera-canvas');
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(video, 0, 0, w, h);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    if (!blob) return;
    const file = new File([blob], 'kamera-' + Date.now() + '.jpg', { type: 'image/jpeg' });
    this.close();
    await attach.handleFile(file);
  },
  bind() {
    $('sheet-camera').onclick = () => this.open();
    $('camera-cancel').onclick = () => this.close();
    $('camera-shutter').onclick = () => this.capture();
    $('camera-switch').onclick = () => this.switchFacing();
  },
};
