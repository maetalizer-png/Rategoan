// Shim supaya modul yang masih membaca bridge opsional `window.LLMXxx`
// (dependency yang sengaja tidak di-import statis, lihat masing-masing
// file) tetap berfungsi di dalam Worker (window tidak ada di sini,
// tapi self ada, dan keduanya sekarang menunjuk objek yang sama).
//
// Harus jadi import PALING PERTAMA di llm-worker.js — evaluasi modul ES
// berjalan depth-first mengikuti urutan import (dependensi dulu, baru
// modul pemanggil), jadi file tanpa dependensi apa pun yang di-import
// paling awal dijamin dievaluasi sebelum modul manapun setelahnya.
self.window = self;
