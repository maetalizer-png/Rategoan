const KEY = 'rategoan_workspace';

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (!Array.isArray(raw.projects)) raw.projects = [];
    if (!raw.currentId) raw.currentId = null;
    return raw;
  } catch (e) {
    return { projects: [], currentId: null };
  }
}

function write(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function create(name) {
  const data = read();
  const item = { id: 'p' + Date.now().toString(36), name: String(name || 'Proyek').trim() || 'Proyek', created: Date.now() };
  data.projects.push(item);
  data.currentId = item.id;
  write(data);
  return item;
}

function setCurrent(id) {
  const data = read();
  if (!data.projects.some((p) => p.id === id)) return null;
  data.currentId = id;
  write(data);
  return data.projects.find((p) => p.id === id);
}

function findByName(name) {
  const n = String(name || '').toLowerCase().trim();
  return read().projects.find((p) => p.name.toLowerCase() === n) || null;
}

export const workspace = {
  list: () => read().projects,
  currentId: () => read().currentId,
  current() {
    const data = read();
    return data.projects.find((p) => p.id === data.currentId) || null;
  },
  create,
  setCurrent,
  findByName,
  clearCurrent() {
    const data = read();
    data.currentId = null;
    write(data);
  },
};
