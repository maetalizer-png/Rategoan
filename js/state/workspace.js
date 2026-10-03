const KEY = 'rategoan_workspace';

function shape(item) {
  return {
    id: item.id,
    name: item.name,
    created: item.created || Date.now(),
    updated: item.updated || item.created || Date.now(),
    description: item.description || '',
    systemPrompt: item.systemPrompt || '',
    pinnedFiles: Array.isArray(item.pinnedFiles) ? item.pinnedFiles : [],
    sessions: Array.isArray(item.sessions) ? item.sessions : [],
  };
}

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (!Array.isArray(raw.projects)) raw.projects = [];
    raw.projects = raw.projects.map(shape);
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
  const item = {
    id: 'p' + Date.now().toString(36),
    name: String(name || 'Proyek').trim() || 'Proyek',
    created: Date.now(),
    updated: Date.now(),
    description: '',
    systemPrompt: '',
    pinnedFiles: [],
    sessions: [],
  };
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
  remove(id) {
    const data = read();
    data.projects = data.projects.filter((p) => p.id !== id);
    if (data.currentId === id) data.currentId = data.projects[0] ? data.projects[0].id : null;
    write(data);
  },
  clearCurrent() {
    const data = read();
    data.currentId = null;
    write(data);
  },
  update(id, patch) {
    const data = read();
    const item = data.projects.find((p) => p.id === id);
    if (!item) return null;
    Object.assign(item, patch || {}, { updated: Date.now() });
    write(data);
    return item;
  },
  linkSession(id, sessionId) {
    const data = read();
    const item = data.projects.find((p) => p.id === id);
    if (!item || !sessionId) return;
    if (item.sessions.indexOf(sessionId) < 0) item.sessions.push(sessionId);
    item.updated = Date.now();
    write(data);
  },
};

