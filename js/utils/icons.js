const ICONS = {
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  speaker: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/>',
  share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/>',
  paperclip: '<path d="M21.4 11.1 12.2 20.3a4.5 4.5 0 0 1-6.4-6.4l9-9a3 3 0 0 1 4.2 4.2l-9 9a1.5 1.5 0 0 1-2.1-2.1l8.3-8.3"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a13.5 13.5 0 0 1 0 18"/><path d="M12 3a13.5 13.5 0 0 0 0 18"/>',
  calculator: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8"/><path d="M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01"/>',
  alarm: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2"/><path d="M5 3 2 6M19 3l3 3"/>',
  flame: '<path d="M12 22c4.4 0 7-2.8 7-6.7 0-2.8-1.7-5-3.2-6.6-.6 1-1.4 1.8-2.3 2.3.3-2.8-.8-6-2.5-8-.3 3-1.7 4.6-3.1 6.2C6.4 10.9 5 12.8 5 15.3c0 3.9 2.6 6.7 7 6.7z"/>',
  bookmark: '<path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
  bookmarkFilled: '<path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" fill="currentColor"/>',
  thumbUp: '<path d="M7 22V11l5-8 1.5 1L12 9h7a2 2 0 0 1 2 2.2l-1.3 8A2 2 0 0 1 17.7 21H7z"/><path d="M7 11H4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3"/>',
  thumbDown: '<path d="M17 2v11l-5 8-1.5-1L12 15H5a2 2 0 0 1-2-2.2l1.3-8A2 2 0 0 1 6.3 3H17z"/><path d="M17 13h3a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-3"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  pin: '<path d="M12 17v5"/><path d="M9 10.5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6.5l2 3.5H7z"/>',
  archive: '<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/><path d="M10 13h4"/>',
  upload: '<path d="M12 21V8"/><path d="M7 13l5-5 5 5"/><path d="M5 21h14"/>',
};

export function ic(name, cls) {
  return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
}
