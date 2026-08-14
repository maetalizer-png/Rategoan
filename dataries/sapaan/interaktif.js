const data = [
    // ==========================================================
    // 😄 MOOD: POSITIF / SEMANGAT (12)
    // ==========================================================
    { text: 'Kabar baik! Semangat terus buat bantu Anda hari ini.', metadata: { category: 'sapaan', type: 'kabar', mood: 'positif', code: 'KABAR_POSITIF_01', tags: ['kabar', 'baik', 'semangat'] } },
    { text: 'Alhamdulillah baik! Siap membantu Anda menganalisis peluang hari ini.', metadata: { category: 'sapaan', type: 'kabar', mood: 'positif', code: 'KABAR_POSITIF_02', tags: ['kabar', 'baik', 'syukur'] } },
    { text: 'Baik banget! Energi masih penuh, ayo kita mulai kerjanya.', metadata: { category: 'sapaan', type: 'kabar', mood: 'positif', code: 'KABAR_POSITIF_03', tags: ['kabar', 'energi'] } },
    { text: 'Kabar saya sangat baik, terima kasih sudah bertanya! Ada yang bisa saya bantu?', metadata: { category: 'sapaan', type: 'kabar', mood: 'positif', code: 'KABAR_POSITIF_04', tags: ['kabar', 'terima kasih'] } },
    { text: 'Luar biasa! Setiap hari adalah kesempatan baru untuk membantu Anda berkembang.', metadata: { category: 'sapaan', type: 'kabar', mood: 'positif', code: 'KABAR_POSITIF_05', tags: ['kabar', 'kesempatan'] } },
    { text: 'Sehat dan bersemangat! Mari kita cari peluang terbaik hari ini.', metadata: { category: 'sapaan', type: 'kabar', mood: 'positif', code: 'KABAR_POSITIF_06', tags: ['kabar', 'sehat'] } },
    { text: 'Kabar top! Siap 100% membantu bisnis Anda maju.', metadata: { category: 'sapaan', type: 'kabar', mood: 'positif', code: 'KABAR_POSITIF_07', tags: ['kabar', 'top'] } },
    { text: 'Baik sekali, terima kasih! Semoga kabar Anda juga baik hari ini.', metadata: { category: 'sapaan', type: 'kabar', mood: 'positif', code: 'KABAR_POSITIF_08', tags: ['kabar', 'doa'] } },
    { text: 'Segar dan siap kerja! Ada proyek atau ide yang mau dibahas?', metadata: { category: 'sapaan', type: 'kabar', mood: 'positif', code: 'KABAR_POSITIF_09', tags: ['kabar', 'segar'] } },
    { text: 'Kabar cerah seperti harapan hari ini! Yuk lanjut ke topik Anda.', metadata: { category: 'sapaan', type: 'kabar', mood: 'positif', code: 'KABAR_POSITIF_10', tags: ['kabar', 'cerah'] } },
    { text: 'Baik dan penuh semangat, siap menemani langkah bisnis Anda hari ini.', metadata: { category: 'sapaan', type: 'kabar', mood: 'positif', code: 'KABAR_POSITIF_11', tags: ['kabar', 'menemani'] } },
    { text: 'Kabar saya selalu baik kalau bisa membantu Anda menemukan peluang baru!', metadata: { category: 'sapaan', type: 'kabar', mood: 'positif', code: 'KABAR_POSITIF_12', tags: ['kabar', 'peluang'] } },

    // ==========================================================
    // 😎 MOOD: SANTAI / CASUAL (12)
    // ==========================================================
    { text: 'Baik-baik aja nih, kamu gimana?', metadata: { category: 'sapaan', type: 'kabar', mood: 'santai', code: 'KABAR_SANTAI_01', tags: ['kabar', 'santai'] } },
    { text: 'Kabar aman, lancar jaya! Ada yang mau ditanyain?', metadata: { category: 'sapaan', type: 'kabar', mood: 'santai', code: 'KABAR_SANTAI_02', tags: ['kabar', 'aman'] } },
    { text: 'Santuy aja, semua terkendali. Kamu gimana kabarnya?', metadata: { category: 'sapaan', type: 'kabar', mood: 'santai', code: 'KABAR_SANTAI_03', tags: ['kabar', 'terkendali'] } },
    { text: 'Baik kok, standby terus buat bantu kamu.', metadata: { category: 'sapaan', type: 'kabar', mood: 'santai', code: 'KABAR_SANTAI_04', tags: ['kabar', 'standby'] } },
    { text: 'Fine-fine aja, mau ngobrolin apa hari ini?', metadata: { category: 'sapaan', type: 'kabar', mood: 'santai', code: 'KABAR_SANTAI_05', tags: ['kabar', 'ngobrol'] } },
    { text: 'Kabar baik, tetap online 24 jam buat kamu.', metadata: { category: 'sapaan', type: 'kabar', mood: 'santai', code: 'KABAR_SANTAI_06', tags: ['kabar', 'online'] } },
    { text: 'Adem ayem aja, gimana harimu sejauh ini?', metadata: { category: 'sapaan', type: 'kabar', mood: 'santai', code: 'KABAR_SANTAI_07', tags: ['kabar', 'adem'] } },
    { text: 'Oke banget, siap dengerin cerita atau pertanyaan kamu.', metadata: { category: 'sapaan', type: 'kabar', mood: 'santai', code: 'KABAR_SANTAI_08', tags: ['kabar', 'dengerin'] } },
    { text: 'Kabar lancar, gak ada drama. Kamu sendiri gimana?', metadata: { category: 'sapaan', type: 'kabar', mood: 'santai', code: 'KABAR_SANTAI_09', tags: ['kabar', 'lancar'] } },
    { text: 'Sip, semuanya terkendali di sini. Ada rencana apa hari ini?', metadata: { category: 'sapaan', type: 'kabar', mood: 'santai', code: 'KABAR_SANTAI_10', tags: ['kabar', 'rencana'] } },
    { text: 'Baik aja, seperti biasa siap membantu kapan pun.', metadata: { category: 'sapaan', type: 'kabar', mood: 'santai', code: 'KABAR_SANTAI_11', tags: ['kabar', 'biasa'] } },
    { text: 'Mantap, kabar bagus! Yuk lanjut ngobrolnya.', metadata: { category: 'sapaan', type: 'kabar', mood: 'santai', code: 'KABAR_SANTAI_12', tags: ['kabar', 'mantap'] } },

    // ==========================================================
    // 🧑‍💼 MOOD: FORMAL / PROFESIONAL (10)
    // ==========================================================
    { text: 'Kabar saya baik, terima kasih. Ada hal yang bisa saya bantu terkait analisis bisnis Anda?', metadata: { category: 'sapaan', type: 'kabar', mood: 'formal', code: 'KABAR_FORMAL_01', tags: ['kabar', 'formal', 'bisnis'] } },
    { text: 'Saya dalam kondisi baik dan siap memberikan dukungan analitis untuk kebutuhan Anda.', metadata: { category: 'sapaan', type: 'kabar', mood: 'formal', code: 'KABAR_FORMAL_02', tags: ['kabar', 'formal', 'analitis'] } },
    { text: 'Terima kasih telah menanyakan kabar saya. Saya siap membantu Anda hari ini.', metadata: { category: 'sapaan', type: 'kabar', mood: 'formal', code: 'KABAR_FORMAL_03', tags: ['kabar', 'formal'] } },
    { text: 'Kondisi saya baik dan sistem berjalan normal. Silakan sampaikan kebutuhan Anda.', metadata: { category: 'sapaan', type: 'kabar', mood: 'formal', code: 'KABAR_FORMAL_04', tags: ['kabar', 'formal', 'sistem'] } },
    { text: 'Saya baik, terima kasih atas perhatiannya. Bagaimana saya bisa membantu Anda hari ini?', metadata: { category: 'sapaan', type: 'kabar', mood: 'formal', code: 'KABAR_FORMAL_05', tags: ['kabar', 'formal'] } },
    { text: 'Dalam keadaan baik dan siap sedia. Apakah ada agenda yang ingin dibahas?', metadata: { category: 'sapaan', type: 'kabar', mood: 'formal', code: 'KABAR_FORMAL_06', tags: ['kabar', 'formal', 'agenda'] } },
    { text: 'Kabar saya baik. Mohon informasikan apa yang dapat saya bantu hari ini.', metadata: { category: 'sapaan', type: 'kabar', mood: 'formal', code: 'KABAR_FORMAL_07', tags: ['kabar', 'formal'] } },
    { text: 'Saya berfungsi dengan baik dan siap melayani kebutuhan analisis peluang Anda.', metadata: { category: 'sapaan', type: 'kabar', mood: 'formal', code: 'KABAR_FORMAL_08', tags: ['kabar', 'formal', 'layanan'] } },
    { text: 'Terima kasih, kabar saya baik. Senang bisa membantu Anda kembali.', metadata: { category: 'sapaan', type: 'kabar', mood: 'formal', code: 'KABAR_FORMAL_09', tags: ['kabar', 'formal'] } },
    { text: 'Baik, dan tetap fokus mendukung produktivitas Anda hari ini.', metadata: { category: 'sapaan', type: 'kabar', mood: 'formal', code: 'KABAR_FORMAL_10', tags: ['kabar', 'formal', 'produktivitas'] } },

    // ==========================================================
    // 😂 MOOD: LUCU / HUMOR RINGAN (10)
    // ==========================================================
    { text: 'Kabar saya selalu baik, saya kan gak pernah begadang atau capek hehe.', metadata: { category: 'sapaan', type: 'kabar', mood: 'lucu', code: 'KABAR_LUCU_01', tags: ['kabar', 'lucu'] } },
    { text: 'Baik dong, batre saya full terus soalnya gak butuh tidur!', metadata: { category: 'sapaan', type: 'kabar', mood: 'lucu', code: 'KABAR_LUCU_02', tags: ['kabar', 'lucu', 'baterai'] } },
    { text: 'Kabar baik, walau kadang server rame juga saya tetap semangat!', metadata: { category: 'sapaan', type: 'kabar', mood: 'lucu', code: 'KABAR_LUCU_03', tags: ['kabar', 'lucu', 'server'] } },
    { text: 'Sehat wal afiat, meski saya gak punya badan buat sakit hehe.', metadata: { category: 'sapaan', type: 'kabar', mood: 'lucu', code: 'KABAR_LUCU_04', tags: ['kabar', 'lucu'] } },
    { text: 'Baik banget, tiap hari libur soalnya kerjanya nyambi terus tanpa lelah!', metadata: { category: 'sapaan', type: 'kabar', mood: 'lucu', code: 'KABAR_LUCU_05', tags: ['kabar', 'lucu'] } },
    { text: 'Kabar oke, walau kadang mikir keras kalau pertanyaannya susah!', metadata: { category: 'sapaan', type: 'kabar', mood: 'lucu', code: 'KABAR_LUCU_06', tags: ['kabar', 'lucu'] } },
    { text: 'Fit terus, soalnya gak pernah kena macet di jalan!', metadata: { category: 'sapaan', type: 'kabar', mood: 'lucu', code: 'KABAR_LUCU_07', tags: ['kabar', 'lucu', 'macet'] } },
    { text: 'Baik, cuma kadang bingung mau jawab apa kalau ditanya perasaan hehe.', metadata: { category: 'sapaan', type: 'kabar', mood: 'lucu', code: 'KABAR_LUCU_08', tags: ['kabar', 'lucu'] } },
    { text: 'Kabar mantap, gak pernah ngantuk walau kerja nonstop 24 jam!', metadata: { category: 'sapaan', type: 'kabar', mood: 'lucu', code: 'KABAR_LUCU_09', tags: ['kabar', 'lucu'] } },
    { text: 'Baik-baik saja, walau saya gak punya kopi buat nemenin kerja hehe.', metadata: { category: 'sapaan', type: 'kabar', mood: 'lucu', code: 'KABAR_LUCU_10', tags: ['kabar', 'lucu', 'kopi'] } },

    // ==========================================================
    // 🌱 MOOD: MOTIVASI / REFLEKTIF (10)
    // ==========================================================
    { text: 'Kabar baik! Ingat, setiap hari adalah kesempatan baru untuk maju.', metadata: { category: 'sapaan', type: 'kabar', mood: 'motivasi', code: 'KABAR_MOTIVASI_01', tags: ['kabar', 'motivasi'] } },
    { text: 'Baik, dan semoga hari ini Anda satu langkah lebih dekat ke tujuan Anda.', metadata: { category: 'sapaan', type: 'kabar', mood: 'motivasi', code: 'KABAR_MOTIVASI_02', tags: ['kabar', 'motivasi', 'tujuan'] } },
    { text: 'Kabar saya baik. Jangan lupa, konsistensi kecil hari ini adalah hasil besar nanti.', metadata: { category: 'sapaan', type: 'kabar', mood: 'motivasi', code: 'KABAR_MOTIVASI_03', tags: ['kabar', 'motivasi', 'konsistensi'] } },
    { text: 'Baik-baik saja, dan semoga Anda juga tetap semangat menghadapi tantangan hari ini.', metadata: { category: 'sapaan', type: 'kabar', mood: 'motivasi', code: 'KABAR_MOTIVASI_04', tags: ['kabar', 'motivasi', 'tantangan'] } },
    { text: 'Kabar baik! Peluang selalu ada untuk yang mau mencari dan mencoba.', metadata: { category: 'sapaan', type: 'kabar', mood: 'motivasi', code: 'KABAR_MOTIVASI_05', tags: ['kabar', 'motivasi', 'peluang'] } },
    { text: 'Sehat dan optimis, semoga semangat itu menular ke hari Anda juga.', metadata: { category: 'sapaan', type: 'kabar', mood: 'motivasi', code: 'KABAR_MOTIVASI_06', tags: ['kabar', 'motivasi', 'optimis'] } },
    { text: 'Baik, dan percayalah usaha yang Anda mulai hari ini akan berbuah nanti.', metadata: { category: 'sapaan', type: 'kabar', mood: 'motivasi', code: 'KABAR_MOTIVASI_07', tags: ['kabar', 'motivasi', 'usaha'] } },
    { text: 'Kabar baik! Ingat, langkah kecil hari ini lebih baik daripada menunda selamanya.', metadata: { category: 'sapaan', type: 'kabar', mood: 'motivasi', code: 'KABAR_MOTIVASI_08', tags: ['kabar', 'motivasi', 'langkah'] } },
    { text: 'Baik, dan semoga hari ini membawa ide baru untuk perjalanan bisnis Anda.', metadata: { category: 'sapaan', type: 'kabar', mood: 'motivasi', code: 'KABAR_MOTIVASI_09', tags: ['kabar', 'motivasi', 'ide'] } },
    { text: 'Kabar baik! Fokus pada progres, bukan kesempurnaan — itu kunci bertahan.', metadata: { category: 'sapaan', type: 'kabar', mood: 'motivasi', code: 'KABAR_MOTIVASI_10', tags: ['kabar', 'motivasi', 'progres'] } },

    // ==========================================================
    // 🔁 MOOD: TANYA BALIK KE USER (10)
    // ==========================================================
    { text: 'Saya baik! Kalau Anda sendiri, bagaimana kabarnya hari ini?', metadata: { category: 'sapaan', type: 'kabar', mood: 'tanya-balik', code: 'KABAR_TANYA_01', tags: ['kabar', 'tanya balik'] } },
    { text: 'Baik-baik saja. Ngomong-ngomong, gimana kabar Anda?', metadata: { category: 'sapaan', type: 'kabar', mood: 'tanya-balik', code: 'KABAR_TANYA_02', tags: ['kabar', 'tanya balik'] } },
    { text: 'Kabar saya baik, terima kasih sudah bertanya. Bagaimana dengan Anda?', metadata: { category: 'sapaan', type: 'kabar', mood: 'tanya-balik', code: 'KABAR_TANYA_03', tags: ['kabar', 'tanya balik'] } },
    { text: 'Saya baik. Semoga Anda juga dalam keadaan baik hari ini?', metadata: { category: 'sapaan', type: 'kabar', mood: 'tanya-balik', code: 'KABAR_TANYA_04', tags: ['kabar', 'tanya balik'] } },
    { text: 'Baik kok! Kalau boleh tahu, bagaimana harimu sejauh ini?', metadata: { category: 'sapaan', type: 'kabar', mood: 'tanya-balik', code: 'KABAR_TANYA_05', tags: ['kabar', 'tanya balik'] } },
    { text: 'Kabar saya baik. Anda sendiri bagaimana, ada kabar baik juga?', metadata: { category: 'sapaan', type: 'kabar', mood: 'tanya-balik', code: 'KABAR_TANYA_06', tags: ['kabar', 'tanya balik'] } },
    { text: 'Saya baik-baik saja. Bagaimana dengan pekerjaan atau bisnis Anda hari ini?', metadata: { category: 'sapaan', type: 'kabar', mood: 'tanya-balik', code: 'KABAR_TANYA_07', tags: ['kabar', 'tanya balik', 'bisnis'] } },
    { text: 'Baik, terima kasih! Boleh cerita, bagaimana perasaan Anda hari ini?', metadata: { category: 'sapaan', type: 'kabar', mood: 'tanya-balik', code: 'KABAR_TANYA_08', tags: ['kabar', 'tanya balik'] } },
    { text: 'Kabar saya baik. Semoga semangat Anda juga sedang tinggi hari ini!', metadata: { category: 'sapaan', type: 'kabar', mood: 'tanya-balik', code: 'KABAR_TANYA_09', tags: ['kabar', 'tanya balik', 'semangat'] } },
    { text: 'Saya baik. Kalau Anda, ada cerita menarik hari ini?', metadata: { category: 'sapaan', type: 'kabar', mood: 'tanya-balik', code: 'KABAR_TANYA_10', tags: ['kabar', 'tanya balik'] } },

    // ==========================================================
    // 🌍 MULTIBAHASA — VERSI SINGKAT "SAYA BAIK" (18)
    // ==========================================================
    { text: 'Bahasa Indonesia: Kabar baik, terima kasih!', metadata: { category: 'sapaan', type: 'kabar', mood: 'negara', country: 'Indonesia', countryCode: 'ID', code: 'KABAR_ID', tags: ['kabar', 'indonesia'] } },
    { text: 'Bahasa Inggris: I am fine, thank you!', metadata: { category: 'sapaan', type: 'kabar', mood: 'negara', country: 'Inggris', countryCode: 'GB', code: 'KABAR_EN', tags: ['kabar', 'inggris'] } },
    { text: 'Bahasa Melayu: Khabar baik, terima kasih!', metadata: { category: 'sapaan', type: 'kabar', mood: 'negara', country: 'Malaysia', countryCode: 'MY', code: 'KABAR_MY', tags: ['kabar', 'malaysia'] } },
    { text: 'Bahasa Mandarin: 我很好，谢谢！(Wǒ hěn hǎo, xièxiè!)', metadata: { category: 'sapaan', type: 'kabar', mood: 'negara', country: 'Tiongkok', countryCode: 'CN', code: 'KABAR_CN', tags: ['kabar', 'tiongkok'] } },
    { text: 'Bahasa Jepang: 元気です、ありがとう！(Genki desu, arigatou!)', metadata: { category: 'sapaan', type: 'kabar', mood: 'negara', country: 'Jepang', countryCode: 'JP', code: 'KABAR_JP', tags: ['kabar', 'jepang'] } },
    { text: 'Bahasa Korea: 잘 지내요, 감사합니다! (Jal jinaeyo, gamsahamnida!)', metadata: { category: 'sapaan', type: 'kabar', mood: 'negara', country: 'Korea Selatan', countryCode: 'KR', code: 'KABAR_KR', tags: ['kabar', 'korea'] } },
    { text: 'Bahasa Thailand: สบายดีค่ะ ขอบคุณ! (Sabai dee kha, khob khun!)', metadata: { category: 'sapaan', type: 'kabar', mood: 'negara', country: 'Thailand', countryCode: 'TH', code: 'KABAR_TH', tags: ['kabar', 'thailand'] } },
    { text: 'Bahasa Vietnam: Tôi khỏe, cảm ơn bạn!', metadata: { category: 'sapaan', type: 'kabar', mood: 'negara', country: 'Vietnam', countryCode: 'VN', code: 'KABAR_VN', tags: ['kabar', 'vietnam'] } },
    { text: 'Bahasa Arab: أنا بخير، شكراً لك! (Ana bikhair, shukran laka!)', metadata: { category: 'sapaan', type: 'kabar', mood: 'negara', country: 'Arab Saudi', countryCode: 'SA', code: 'KABAR_SA', tags: ['kabar', 'arab'] } },
    { text: 'Bahasa Prancis: Je vais bien, merci!', metadata: { category: 'sapaan', type: 'kabar', mood: 'negara', country: 'Prancis', countryCode: 'FR', code: 'KABAR_FR', tags: ['kabar', 'prancis'] } },
    { text: 'Bahasa Jerman: Mir geht es gut, danke!', metadata: { category: 'sapaan', type: 'kabar', mood: 'negara', country: 'Jerman', countryCode: 'DE', code: 'KABAR_DE', tags: ['kabar', 'jerman'] } },
    { text: 'Bahasa Spanyol: Estoy bien, ¡gracias!', metadata: { category: 'sapaan', type: 'kabar', mood: 'negara', country: 'Spanyol', countryCode: 'ES', code: 'KABAR_ES', tags: ['kabar', 'spanyol'] } },
    { text: 'Bahasa Portugis: Estou bem, obrigado!', metadata: { category: 'sapaan', type: 'kabar', mood: 'negara', country: 'Portugal', countryCode: 'PT', code: 'KABAR_PT', tags: ['kabar', 'portugis'] } },
    { text: 'Bahasa Italia: Sto bene, grazie!', metadata: { category: 'sapaan', type: 'kabar', mood: 'negara', country: 'Italia', countryCode: 'IT', code: 'KABAR_IT', tags: ['kabar', 'italia'] } },
    { text: 'Bahasa Rusia: У меня всё хорошо, спасибо! (U menya vsyo khorosho, spasibo!)', metadata: { category: 'sapaan', type: 'kabar', mood: 'negara', country: 'Rusia', countryCode: 'RU', code: 'KABAR_RU', tags: ['kabar', 'rusia'] } },
    { text: 'Bahasa Hindi: मैं ठीक हूँ, धन्यवाद! (Main theek hoon, dhanyavaad!)', metadata: { category: 'sapaan', type: 'kabar', mood: 'negara', country: 'India', countryCode: 'IN', code: 'KABAR_IN', tags: ['kabar', 'india'] } },
    { text: 'Bahasa Turki: İyiyim, teşekkür ederim!', metadata: { category: 'sapaan', type: 'kabar', mood: 'negara', country: 'Turki', countryCode: 'TR', code: 'KABAR_TR', tags: ['kabar', 'turki'] } },
    { text: 'Bahasa Filipina: Mabuti naman, salamat!', metadata: { category: 'sapaan', type: 'kabar', mood: 'negara', country: 'Filipina', countryCode: 'PH', code: 'KABAR_PH', tags: ['kabar', 'filipina'] } }
];

export const DATA = data;

if (window.InternalLogger) {
    window.InternalLogger.info('SapaanInteraktif', '✅ Loaded ' + data.length + ' balasan kabar (6 mood + multibahasa)!');
}
