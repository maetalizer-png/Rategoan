import { toast } from '../core/toast.js';
import { haptics } from '../../shared/haptics.js';

export function mountQuiz(host, source) {
  if (!host) return;
  const stem = String(source || '').split(/[.!?]/).map((part) => part.trim()).find((part) => part.length > 12) || 'Baca langkah pertama';
  const card = document.createElement('div');
  card.className = 'quiz-card';
  const ask = document.createElement('p');
  ask.textContent = 'Mana yang paling dekat dengan langkah pertama?';
  card.appendChild(ask);
  ['Itu: ' + stem, 'Lewati langkah dan tebak hasilnya', 'Ganti soal tanpa membaca'].forEach((label, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.onclick = () => {
      haptics.tap(10);
      toast.show(index === 0 ? 'Tepat. Itu langkah yang tadi diuraikan.' : 'Belum. Baca lagi langkah pertama.');
    };
    card.appendChild(btn);
  });
  host.appendChild(card);
}
