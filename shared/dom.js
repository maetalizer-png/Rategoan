export const $ = (id) => document.getElementById(id);

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const scrollBottom = () => {
  const m = $('messages');
  if (m) m.scrollTop = m.scrollHeight;
};
