export const fmtTime = (t) =>
  new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
