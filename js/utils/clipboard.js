function copyViaExecCommand(text) {
  return new Promise((resolve, reject) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
    } catch (e) {
      reject(e);
    } finally {
      ta.remove();
    }
  });
}

// navigator.clipboard.writeText() dilaporkan kadang tidak pernah
// resolve MAUPUN reject di sebagian browser/perangkat Android (izin
// clipboard yang macet, dialog izin yang tidak sempat dirender, dst) -
// tombol Salin jadi terasa "tidak ada reaksi sama sekali", bukan gagal
// dengan pesan. Race dengan timeout supaya SELALU ada kepastian dalam
// waktu wajar, jatuh ke execCommand (sinkron, tidak butuh izin) kalau
// API modern tidak merespons atau ditolak.
export const copy = (text) => {
  if (!(navigator.clipboard && navigator.clipboard.writeText)) {
    return copyViaExecCommand(text);
  }
  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };
    navigator.clipboard.writeText(text).then(
      () => finish(true),
      () => copyViaExecCommand(text).then(() => finish(true), () => finish(false))
    );
    setTimeout(() => {
      if (settled) return;
      copyViaExecCommand(text).then(() => finish(true), () => finish(false));
    }, 1200);
  }).then((ok) => {
    if (!ok) throw new Error('copy failed');
  });
};

export const download = (name, text) => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
};
