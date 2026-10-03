// Kontrak lint/build minimal (Fase A vNext, menutup temuan P0 audit teknis:
// "No formal build/lint/type contract terlihat dari arsip - refactor besar
// berisiko merusak import/export"). SENGAJA tanpa dependency npm apa pun
// (tidak pakai @eslint/js atau paket `globals`) supaya tetap konsisten
// dengan prinsip proyek "tanpa framework, tanpa build step" - ini murni
// alat verifikasi dev-time, bukan bagian dari aplikasi yang dikirim.
//
// Cakupan SENGAJA dibatasi ke aturan yang menangkap BUG NYATA (variabel
// tak terdefinisi, import/export salah, dead code tak sengaja), bukan gaya
// penulisan (tidak ada aturan format/spasi/kutip) - supaya gerbang ini
// tidak memicu perombakan besar-besaran di 300 file JS yang sudah berjalan.

const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  location: 'readonly',
  history: 'readonly',
  localStorage: 'readonly',
  sessionStorage: 'readonly',
  indexedDB: 'readonly',
  IDBKeyRange: 'readonly',
  fetch: 'readonly',
  Response: 'readonly',
  Request: 'readonly',
  Headers: 'readonly',
  console: 'readonly',
  crypto: 'readonly',
  performance: 'readonly',
  requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  queueMicrotask: 'readonly',
  Audio: 'readonly',
  Image: 'readonly',
  FileReader: 'readonly',
  Blob: 'readonly',
  File: 'readonly',
  FormData: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  Notification: 'readonly',
  IntersectionObserver: 'readonly',
  MutationObserver: 'readonly',
  ResizeObserver: 'readonly',
  CustomEvent: 'readonly',
  Event: 'readonly',
  MessageChannel: 'readonly',
  Worker: 'readonly',
  SharedWorker: 'readonly',
  WebSocket: 'readonly',
  AbortController: 'readonly',
  matchMedia: 'readonly',
  getComputedStyle: 'readonly',
  DOMParser: 'readonly',
  XMLSerializer: 'readonly',
  Path2D: 'readonly',
  OffscreenCanvas: 'readonly',
  ServiceWorkerRegistration: 'readonly',
  caches: 'readonly',
  self: 'readonly',
  globalThis: 'readonly',
  structuredClone: 'readonly',
  TextEncoder: 'readonly',
  TextDecoder: 'readonly',
  speechSynthesis: 'readonly',
  SpeechSynthesisUtterance: 'readonly',
  MediaMetadata: 'readonly',
  webkitSpeechRecognition: 'readonly',
  SpeechRecognition: 'readonly',
  confirm: 'readonly',
  prompt: 'readonly',
  alert: 'readonly',
  GPUBufferUsage: 'readonly',
  GPUMapMode: 'readonly',
  GPUShaderStage: 'readonly',
  visualViewport: 'readonly',
  requestIdleCallback: 'readonly',
  cancelIdleCallback: 'readonly',
  EventTarget: 'readonly',
  atob: 'readonly',
  btoa: 'readonly',
};

const workerGlobals = {
  self: 'readonly',
  postMessage: 'readonly',
  onmessage: 'writable',
  importScripts: 'readonly',
  close: 'readonly',
  clients: 'readonly',
  registration: 'readonly',
  skipWaiting: 'readonly',
};

const nodeGlobals = {
  process: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
  require: 'readonly',
  module: 'readonly',
  exports: 'writable',
  Buffer: 'readonly',
  console: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
};

const CORRECTNESS_RULES = {
  'no-undef': 'error',
  'no-dupe-keys': 'error',
  'no-dupe-args': 'error',
  'no-dupe-class-members': 'error',
  'no-const-assign': 'error',
  'no-unreachable': 'error',
  'no-unsafe-negation': 'error',
  'no-import-assign': 'error',
  'no-self-assign': 'error',
  'no-self-compare': 'warn',
  'no-fallthrough': 'error',
  'no-func-assign': 'error',
  'no-class-assign': 'error',
  'no-obj-calls': 'error',
  'no-setter-return': 'error',
  'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_', caughtErrors: 'none' }],
  'no-redeclare': 'error',
  'no-var': 'off',
  'valid-typeof': 'error',
  'use-isnan': 'error',
  'no-case-declarations': 'off',
};

export default [
  {
    ignores: ['**/kesempatan-os-/**', '**/node_modules/**', '**/*.min.js'],
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...browserGlobals },
    },
    rules: CORRECTNESS_RULES,
  },
  {
    files: ['**/*worker*.js', '**/*worker*.mjs', '**/sw.js'],
    languageOptions: {
      globals: { ...browserGlobals, ...workerGlobals },
    },
  },
  {
    files: ['raget/raget-tools/**/*.mjs', 'raget/raget-tools/**/*.js'],
    languageOptions: {
      globals: { ...nodeGlobals, ...browserGlobals },
    },
  },
  {
    files: ['api/**/*.js'],
    languageOptions: {
      globals: { ...nodeGlobals, ...browserGlobals, fetch: 'readonly' },
    },
  },
];
