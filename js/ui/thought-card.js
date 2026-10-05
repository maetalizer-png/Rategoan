const ORB = {
  web: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg>',
  file: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
  tool: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
  mind: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><path d="M12 3a6 6 0 0 0-6 6c0 2 1 3 1 5h10c0-2 1-3 1-5a6 6 0 0 0-6-6z"/><path d="M9 21h6"/></svg>',
  slide: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
};

function laneOf(step) {
  const blob = ((step && step.kind) || '') + ' ' + ((step && step.text) || '');
  const t = blob.toLowerCase();
  if (/web|riset|telusur|cari|sumber/.test(t)) return 'web';
  if (/berkas|dokumen|rag|pdf|file/.test(t)) return 'file';
  if (/slide|presentasi|pptx|artefak/.test(t)) return 'slide';
  if (/alat|terminal|sandbox|kode|perintah|hitung|excel/.test(t)) return 'tool';
  return 'mind';
}

export function mountThought(container, thoughts, status) {
  if (!container || !thoughts || !thoughts.length) return null;
  if (!container.dataset.thoughtStart) container.dataset.thoughtStart = String(Date.now());
  const started = Number(container.dataset.thoughtStart) || Date.now();
  const running = status === 'berjalan';
  const seconds = Math.max(1, Math.round((Date.now() - started) / 1000));
  const box = document.createElement('details');
  box.className = 'thought-accordion' + (running ? ' running' : ' completed');
  box.open = running;
  const summary = document.createElement('summary');
  summary.textContent = running
    ? 'Sedang memproses...'
    : 'Selesai · ' + thoughts.length + ' langkah eksekusi · ' + seconds + ' detik';
  const list = document.createElement('ol');
  list.className = 'agentic-stepper';
  thoughts.forEach((step, index) => {
    const live = running && index === thoughts.length - 1;
    const lane = laneOf(step);
    const li = document.createElement('li');
    li.className = 'stepper-node lane-' + lane + (live ? ' is-live' : '');
    const orb = document.createElement('span');
    orb.className = 'stepper-orb';
    orb.innerHTML = ORB[lane];
    const copy = document.createElement('span');
    copy.className = 'stepper-copy';
    copy.textContent = (step.text || 'Langkah');
    if (live) {
      const pulse = document.createElement('small');
      pulse.textContent = 'Sedang memproses...';
      copy.appendChild(document.createElement('br'));
      copy.appendChild(pulse);
    }
    li.appendChild(orb);
    li.appendChild(copy);
    list.appendChild(li);
  });
  box.appendChild(summary);
  box.appendChild(list);
  container.insertBefore(box, container.firstChild);
  return box;
}
