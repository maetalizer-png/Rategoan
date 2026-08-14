function capitalize(s) {
  return String(s || '')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function detectFormality(text) {
  return /informal|santai/i.test(text) ? 'informal' : 'formal';
}

function detectPurpose(text) {
  if (/follow[\s-]?up|menindaklanjuti/i.test(text)) return 'follow-up';
  if (/terima\s*kasih|thank/i.test(text)) return 'thank-you';
  if (/minta|request|permohonan/i.test(text)) return 'request';
  return 'general';
}

function extractRecipient(text) {
  const m = text.match(/\bke\s+([a-zA-Z\s]+?)(?:\s+tentang|\s+soal|\s+perihal|$)/i);
  return m ? m[1].trim() : null;
}

function extractTopic(text) {
  const m = text.match(/(?:tentang|soal|perihal)\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

const BODIES = {
  'follow-up': {
    formal: (topic) => 'Saya ingin menindaklanjuti perihal ' + topic + ' yang sebelumnya kita bahas. Mohon informasi terbaru mengenai hal ini.',
    informal: (topic) => 'Mau follow up soal ' + topic + ' nih, gimana kabarnya?',
  },
  'thank-you': {
    formal: (topic) => 'Saya ingin mengucapkan terima kasih atas bantuan dan kerja sama terkait ' + topic + '.',
    informal: (topic) => 'Makasih banyak ya soal ' + topic + '!',
  },
  request: {
    formal: (topic) => 'Dengan hormat, saya bermaksud mengajukan permohonan terkait ' + topic + '. Mohon kiranya dapat ditindaklanjuti.',
    informal: (topic) => 'Boleh minta tolong soal ' + topic + ' ya?',
  },
  general: {
    formal: (topic) => 'Melalui email ini, saya ingin menyampaikan perihal ' + topic + '.',
    informal: (topic) => 'Aku mau cerita soal ' + topic + ' nih.',
  },
};

function generateEmail(prompt) {
  const text = String(prompt || '');
  const formality = detectFormality(text);
  const purpose = detectPurpose(text);
  const recipient = capitalize(extractRecipient(text) || 'Bapak/Ibu');
  const topic = extractTopic(text) || 'hal ini';

  const greeting = formality === 'formal' ? 'Yth. ' + recipient + ',' : 'Hai ' + recipient + ',';
  const body = BODIES[purpose][formality](topic);
  const closing =
    formality === 'formal'
      ? 'Demikian yang dapat saya sampaikan. Atas perhatiannya, saya ucapkan terima kasih.\n\nHormat saya,'
      : 'Segitu dulu ya, makasih!\n\nSalam,';

  return greeting + '\n\n' + body + '\n\n' + closing;
}

export const emailComposer = Object.freeze({
  generateEmail,
});
