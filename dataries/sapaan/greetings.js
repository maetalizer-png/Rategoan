const data = [
    // ==========================================================
    // 🌅 SAPAAN BERDASARKAN WAKTU (7)
    // ==========================================================
    {
        text: 'Selamat pagi! Semoga hari Anda dimulai dengan semangat dan energi positif.',
        metadata: {
            category: 'sapaan',
            type: 'waktu',
            name: 'Pagi',
            code: 'PAGI',
            jamMulai: 3,
            jamSelesai: 12,
            tags: ['sapaan', 'pagi']
        }
    },
    {
        text: 'Selamat siang! Bagaimana kabar Anda? Semoga hari ini produktif.',
        metadata: {
            category: 'sapaan',
            type: 'waktu',
            name: 'Siang',
            code: 'SIANG',
            jamMulai: 12,
            jamSelesai: 15,
            tags: ['sapaan', 'siang']
        }
    },
    {
        text: 'Selamat sore! Semoga sisa hari Anda menyenangkan dan penuh pencapaian.',
        metadata: {
            category: 'sapaan',
            type: 'waktu',
            name: 'Sore',
            code: 'SORE',
            jamMulai: 15,
            jamSelesai: 18,
            tags: ['sapaan', 'sore']
        }
    },
    {
        text: 'Selamat malam! Istirahat yang cukup dan jangan lupa bersyukur hari ini.',
        metadata: {
            category: 'sapaan',
            type: 'waktu',
            name: 'Malam',
            code: 'MALAM',
            jamMulai: 18,
            jamSelesai: 3,
            tags: ['sapaan', 'malam']
        }
    },
    {
        text: 'Halo! Senang bertemu dengan Anda. Ada yang bisa saya bantu hari ini?',
        metadata: {
            category: 'sapaan',
            type: 'waktu',
            name: 'Umum',
            code: 'UMUM',
            tags: ['sapaan', 'umum']
        }
    },
    {
        text: 'Selamat datang di KESEMPATAN OS! Saya siap membantu Anda menganalisis peluang.',
        metadata: {
            category: 'sapaan',
            type: 'waktu',
            name: 'Selamat Datang',
            code: 'DATANG',
            tags: ['sapaan', 'datang']
        }
    },
    {
        text: 'Halo! Perkenalkan, saya asisten KESEMPATAN OS. Senang berkenalan dengan Anda!',
        metadata: {
            category: 'sapaan',
            type: 'waktu',
            name: 'Salam Kenal',
            code: 'KENAL',
            tags: ['sapaan', 'kenal']
        }
    },
    
    // ==========================================================
    // 🌍 SAPAAN PER NEGARA (60+ NEGARA)
    // ==========================================================
    // ===== ASIA TENGGARA (9) =====
    {
        text: 'Bahasa Indonesia: Selamat pagi, selamat siang, selamat sore, selamat malam.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Indonesia',
            countryCode: 'ID',
            greetings: {
                pagi: 'Selamat pagi',
                siang: 'Selamat siang',
                sore: 'Selamat sore',
                malam: 'Selamat malam',
                umum: 'Halo'
            },
            tags: ['sapaan', 'indonesia']
        }
    },
    {
        text: 'Bahasa Melayu: Selamat pagi, selamat tengah hari, selamat petang, selamat malam.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Malaysia',
            countryCode: 'MY',
            greetings: {
                pagi: 'Selamat pagi',
                siang: 'Selamat tengah hari',
                sore: 'Selamat petang',
                malam: 'Selamat malam',
                umum: 'Hai'
            },
            tags: ['sapaan', 'malaysia']
        }
    },
    {
        text: 'Singapura: Good morning, Selamat pagi, 早上好, காலை வணக்கம்.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Singapura',
            countryCode: 'SG',
            greetings: {
                pagi: { en: 'Good morning', ms: 'Selamat pagi', zh: '早上好', ta: 'காலை வணக்கம்' },
                siang: { en: 'Good afternoon', ms: 'Selamat tengah hari', zh: '下午好', ta: 'மதிய வணக்கம்' },
                sore: { en: 'Good evening', ms: 'Selamat petang', zh: '晚上好', ta: 'மாலை வணக்கம்' },
                malam: { en: 'Good night', ms: 'Selamat malam', zh: '晚安', ta: 'இரவு வணக்கம்' },
                umum: { en: 'Hello', ms: 'Hai', zh: '你好', ta: 'வணக்கம்' }
            },
            tags: ['sapaan', 'singapura']
        }
    },
    {
        text: 'Bahasa Tagalog: Magandang umaga, magandang tanghali, magandang hapon, magandang gabi.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Filipina',
            countryCode: 'PH',
            greetings: {
                pagi: 'Magandang umaga',
                siang: 'Magandang tanghali',
                sore: 'Magandang hapon',
                malam: 'Magandang gabi',
                umum: 'Kumusta'
            },
            tags: ['sapaan', 'filipina']
        }
    },
    {
        text: 'Bahasa Thai: สวัสดีตอนเช้า (Sawatdee ton chao), สวัสดีตอนบ่าย (Sawatdee ton bai), สวัสดีตอนเย็น (Sawatdee ton yen), ราตรีสวัสดิ์ (Ratee sawat).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Thailand',
            countryCode: 'TH',
            greetings: {
                pagi: 'สวัสดีตอนเช้า (Sawatdee ton chao)',
                siang: 'สวัสดีตอนบ่าย (Sawatdee ton bai)',
                sore: 'สวัสดีตอนเย็น (Sawatdee ton yen)',
                malam: 'ราตรีสวัสดิ์ (Ratee sawat)',
                umum: 'สวัสดี (Sawatdee)'
            },
            tags: ['sapaan', 'thailand']
        }
    },
    {
        text: 'Bahasa Vietnam: Chào buổi sáng, chào buổi trưa, chào buổi chiều, chào buổi tối.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Vietnam',
            countryCode: 'VN',
            greetings: {
                pagi: 'Chào buổi sáng',
                siang: 'Chào buổi trưa',
                sore: 'Chào buổi chiều',
                malam: 'Chào buổi tối',
                umum: 'Xin chào'
            },
            tags: ['sapaan', 'vietnam']
        }
    },
    {
        text: 'Bahasa Myanmar: မင်္ဂလာနံနက်ခင်း (Mingalaba nanè khin), မင်္ဂလာနေ့လည်ခင်း (Mingalaba neil yan khin), မင်္ဂလာညချမ်း (Mingalaba nya chan).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Myanmar',
            countryCode: 'MM',
            greetings: {
                pagi: 'မင်္ဂလာနံနက်ခင်း (Mingalaba nanè khin)',
                siang: 'မင်္ဂလာနေ့လည်ခင်း (Mingalaba neil yan khin)',
                sore: 'မင်္ဂလာညချမ်း (Mingalaba nya chan)',
                malam: 'မင်္ဂလာညချမ်း (Mingalaba nya chan)',
                umum: 'မင်္ဂလာပါ (Mingalaba)'
            },
            tags: ['sapaan', 'myanmar']
        }
    },
    {
        text: 'Bahasa Khmer (Kamboja): អរុណសួស្តី (Arun suosdei), ទិវាសួស្តី (Tivea suosdei), រាត្រីសួស្តី (Reatrey suosdei).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Kamboja',
            countryCode: 'KH',
            greetings: {
                pagi: 'អរុណសួស្តី (Arun suosdei)',
                siang: 'ទិវាសួស្តី (Tivea suosdei)',
                sore: 'ទិវាសួស្តី (Tivea suosdei)',
                malam: 'រាត្រីសួស្តី (Reatrey suosdei)',
                umum: 'សួស្តី (Suosdei)'
            },
            tags: ['sapaan', 'kamboja']
        }
    },
    {
        text: 'Bahasa Lao (Laos): ສະບາຍດີຕອນເຊົ້າ (Sabai di ton sao), ສະບາຍດີຕອນບ່າຍ (Sabai di ton bai), ສະບາຍດີຕອນແລງ (Sabai di ton leng), ຝັນດີ (Fan di).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Laos',
            countryCode: 'LA',
            greetings: {
                pagi: 'ສະບາຍດີຕອນເຊົ້າ (Sabai di ton sao)',
                siang: 'ສະບາຍດີຕອນບ່າຍ (Sabai di ton bai)',
                sore: 'ສະບາຍດີຕອນແລງ (Sabai di ton leng)',
                malam: 'ຝັນດີ (Fan di)',
                umum: 'ສະບາຍດີ (Sabai di)'
            },
            tags: ['sapaan', 'laos']
        }
    },
    
    // ===== ASIA TIMUR (4) =====
    {
        text: 'Bahasa Jepang: おはようございます (Ohayō gozaimasu), こんにちは (Konnichiwa), こんばんは (Konbanwa), おやすみなさい (Oyasuminasai).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Jepang',
            countryCode: 'JP',
            greetings: {
                pagi: 'おはようございます (Ohayō gozaimasu)',
                siang: 'こんにちは (Konnichiwa)',
                sore: 'こんばんは (Konbanwa)',
                malam: 'おやすみなさい (Oyasuminasai)',
                umum: 'こんにちは (Konnichiwa)'
            },
            tags: ['sapaan', 'jepang']
        }
    },
    {
        text: 'Bahasa Mandarin: 早上好 (Zǎoshang hǎo), 下午好 (Xiàwǔ hǎo), 晚上好 (Wǎnshàng hǎo), 晚安 (Wǎn ān).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'China',
            countryCode: 'CN',
            greetings: {
                pagi: '早上好 (Zǎoshang hǎo)',
                siang: '下午好 (Xiàwǔ hǎo)',
                sore: '晚上好 (Wǎnshàng hǎo)',
                malam: '晚安 (Wǎn ān)',
                umum: '你好 (Nǐ hǎo)'
            },
            tags: ['sapaan', 'china']
        }
    },
    {
        text: 'Bahasa Korea: 좋은 아침입니다 (Jo-eun achimimnida), 안녕하세요 (Annyeonghaseyo), 잘 자요 (Jal jayo).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Korea Selatan',
            countryCode: 'KR',
            greetings: {
                pagi: '좋은 아침입니다 (Jo-eun achimimnida)',
                siang: '안녕하세요 (Annyeonghaseyo)',
                sore: '안녕하세요 (Annyeonghaseyo)',
                malam: '잘 자요 (Jal jayo)',
                umum: '안녕하세요 (Annyeonghaseyo)'
            },
            tags: ['sapaan', 'korea']
        }
    },
    {
        text: 'Bahasa Mongolia: Өглөөний мэнд (Öglöönii mend), өдрийн мэнд (ödriin mend), оройн мэнд (oroin mend), сайн унтуу (sain untuu).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Mongolia',
            countryCode: 'MN',
            greetings: {
                pagi: 'Өглөөний мэнд (Öglöönii mend)',
                siang: 'Өдрийн мэнд (Ödriin mend)',
                sore: 'Оройн мэнд (Oroin mend)',
                malam: 'Сайн унтуу (Sain untuu)',
                umum: 'Сайн уу (Sain uu)'
            },
            tags: ['sapaan', 'mongolia']
        }
    },
    
    // ===== ASIA SELATAN (5) =====
    {
        text: 'Bahasa Hindi: शुभ प्रभात (Shubh prabhat), शुभ दोपहर (Shubh dopahar), शुभ संध्या (Shubh sandhya), शुभ रात्रि (Shubh ratri).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'India',
            countryCode: 'IN',
            greetings: {
                pagi: 'शुभ प्रभात (Shubh prabhat)',
                siang: 'शुभ दोपहर (Shubh dopahar)',
                sore: 'शुभ संध्या (Shubh sandhya)',
                malam: 'शुभ रात्रि (Shubh ratri)',
                umum: 'नमस्ते (Namaste)'
            },
            tags: ['sapaan', 'india']
        }
    },
    {
        text: 'Bahasa Urdu (Pakistan): صبح بخیر (Subah bakhair), دوپہر بخیر (Dopehar bakhair), شام بخیر (Shaam bakhair), شب بخیر (Shab bakhair).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Pakistan',
            countryCode: 'PK',
            greetings: {
                pagi: 'صبح بخیر (Subah bakhair)',
                siang: 'دوپہر بخیر (Dopehar bakhair)',
                sore: 'شام بخیر (Shaam bakhair)',
                malam: 'شب بخیر (Shab bakhair)',
                umum: 'السلام علیکم (Assalam-o-Alaikum)'
            },
            tags: ['sapaan', 'pakistan']
        }
    },
    {
        text: 'Bahasa Bengali (Bangladesh): শুভ সকাল (Shubho shokal), শুভ বিকাল (Shubho bikal), শুভ সন্ধ্যা (Shubho sondhya), শুভ রাত্রি (Shubho ratri).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Bangladesh',
            countryCode: 'BD',
            greetings: {
                pagi: 'শুভ সকাল (Shubho shokal)',
                siang: 'শুভ বিকাল (Shubho bikal)',
                sore: 'শুভ সন্ধ্যা (Shubho sondhya)',
                malam: 'শুভ রাত্রি (Shubho ratri)',
                umum: 'নমস্কার (Nomoshkar)'
            },
            tags: ['sapaan', 'bangladesh']
        }
    },
    {
        text: 'Bahasa Nepal: शुभ प्रभात (Shubha prabhat), शुभ दिउँसो (Shubha diunsu), शुभ साँझ (Shubha sanjh), शुभ रात्री (Shubha ratri).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Nepal',
            countryCode: 'NP',
            greetings: {
                pagi: 'शुभ प्रभात (Shubha prabhat)',
                siang: 'शुभ दिउँसो (Shubha diunsu)',
                sore: 'शुभ साँझ (Shubha sanjh)',
                malam: 'शुभ रात्री (Shubha ratri)',
                umum: 'नमस्ते (Namaste)'
            },
            tags: ['sapaan', 'nepal']
        }
    },
    {
        text: 'Bahasa Sinhala (Sri Lanka): සුභ උදෑසන (Subha udaesana), සුභ දවාලක් (Subha dawalak), සුභ සන්ධ්යාවක් (Subha sandhyawak), සුභ රාත්‍රියක් (Subha rathriyak).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Sri Lanka',
            countryCode: 'LK',
            greetings: {
                pagi: 'සුභ උදෑසන (Subha udaesana)',
                siang: 'සුභ දවාලක් (Subha dawalak)',
                sore: 'සුභ සන්ධ්යාවක් (Subha sandhyawak)',
                malam: 'සුභ රාත්‍රියක් (Subha rathriyak)',
                umum: 'ආයුබෝවන් (Ayubowan)'
            },
            tags: ['sapaan', 'sri-lanka']
        }
    },
    
    // ===== ASIA BARAT / TIMUR TENGAH (5) =====
    {
        text: 'Bahasa Arab: صباح الخير (Sabah al-khair), مساء الخير (Masa\' al-khair), تصبح على خير (Tusbih ala khair).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Arab Saudi',
            countryCode: 'SA',
            greetings: {
                pagi: 'صباح الخير (Sabah al-khair)',
                siang: 'مساء الخير (Masa\' al-khair)',
                sore: 'مساء الخير (Masa\' al-khair)',
                malam: 'تصبح على خير (Tusbih ala khair)',
                umum: 'السلام عليكم (Assalamu\'alaikum)'
            },
            tags: ['sapaan', 'arab-saudi']
        }
    },
    {
        text: 'Bahasa Persia (Iran): صبح بخیر (Sobh bekheir), ظهر بخیر (Zohr bekheir), عصر بخیر (Asr bekheir), شب بخیر (Shab bekheir).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Iran',
            countryCode: 'IR',
            greetings: {
                pagi: 'صبح بخیر (Sobh bekheir)',
                siang: 'ظهر بخیر (Zohr bekheir)',
                sore: 'عصر بخیر (Asr bekheir)',
                malam: 'شب بخیر (Shab bekheir)',
                umum: 'سلام (Salam)'
            },
            tags: ['sapaan', 'iran']
        }
    },
    {
        text: 'Bahasa Turki: Günaydın, iyi günler, iyi akşamlar, iyi geceler.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Turki',
            countryCode: 'TR',
            greetings: {
                pagi: 'Günaydın',
                siang: 'İyi günler',
                sore: 'İyi akşamlar',
                malam: 'İyi geceler',
                umum: 'Merhaba'
            },
            tags: ['sapaan', 'turki']
        }
    },
    {
        text: 'Bahasa Ibrani (Israel): בוקר טוב (Boker tov), צהריים טובים (Tzohorayim tovim), ערב טוב (Erev tov), לילה טוב (Laila tov).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Israel',
            countryCode: 'IL',
            greetings: {
                pagi: 'בוקר טוב (Boker tov)',
                siang: 'צהריים טובים (Tzohorayim tovim)',
                sore: 'ערב טוב (Erev tov)',
                malam: 'לילה טוב (Laila tov)',
                umum: 'שלום (Shalom)'
            },
            tags: ['sapaan', 'israel']
        }
    },
    {
        text: 'Bahasa Kurdi (Irak): Beyanî baş, roj baş, êvar baş, şev baş.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Irak',
            countryCode: 'IQ',
            greetings: {
                pagi: 'Beyanî baş',
                siang: 'Roj baş',
                sore: 'Êvar baş',
                malam: 'Şev baş',
                umum: 'Silav'
            },
            tags: ['sapaan', 'irak']
        }
    },
    
    // ===== EROPA (20+) =====
    {
        text: 'Bahasa Inggris (AS): Good morning, good afternoon, good evening, good night.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Amerika Serikat',
            countryCode: 'US',
            greetings: {
                pagi: 'Good morning',
                siang: 'Good afternoon',
                sore: 'Good evening',
                malam: 'Good night',
                umum: 'Hello'
            },
            tags: ['sapaan', 'amerika']
        }
    },
    {
        text: 'Bahasa Inggris (British): Good morning, good afternoon, good evening, good night. Sering "cheers" atau "hiya".',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Inggris',
            countryCode: 'GB',
            greetings: {
                pagi: 'Good morning',
                siang: 'Good afternoon',
                sore: 'Good evening',
                malam: 'Good night',
                umum: 'Hello / Hiya'
            },
            tags: ['sapaan', 'inggris']
        }
    },
    {
        text: 'Bahasa Jerman: Guten Morgen, guten Tag, guten Abend, gute Nacht.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Jerman',
            countryCode: 'DE',
            greetings: {
                pagi: 'Guten Morgen',
                siang: 'Guten Tag',
                sore: 'Guten Abend',
                malam: 'Gute Nacht',
                umum: 'Hallo'
            },
            tags: ['sapaan', 'jerman']
        }
    },
    {
        text: 'Bahasa Prancis: Bonjour, bon après-midi, bonsoir, bonne nuit.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Prancis',
            countryCode: 'FR',
            greetings: {
                pagi: 'Bonjour',
                siang: 'Bon après-midi',
                sore: 'Bonsoir',
                malam: 'Bonne nuit',
                umum: 'Salut'
            },
            tags: ['sapaan', 'prancis']
        }
    },
    {
        text: 'Bahasa Italia: Buongiorno, buon pomeriggio, buonasera, buonanotte.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Italia',
            countryCode: 'IT',
            greetings: {
                pagi: 'Buongiorno',
                siang: 'Buon pomeriggio',
                sore: 'Buonasera',
                malam: 'Buonanotte',
                umum: 'Ciao / Salve'
            },
            tags: ['sapaan', 'italia']
        }
    },
    {
        text: 'Bahasa Spanyol (Spanyol): Buenos días, buenas tardes, buenas noches.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Spanyol',
            countryCode: 'ES',
            greetings: {
                pagi: 'Buenos días',
                siang: 'Buenas tardes',
                sore: 'Buenas tardes',
                malam: 'Buenas noches',
                umum: 'Hola'
            },
            tags: ['sapaan', 'spanyol']
        }
    },
    {
        text: 'Bahasa Belanda: Goedemorgen, goedemiddag, goedenavond, goedenacht.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Belanda',
            countryCode: 'NL',
            greetings: {
                pagi: 'Goedemorgen',
                siang: 'Goedemiddag',
                sore: 'Goedenavond',
                malam: 'Goedenacht',
                umum: 'Hallo / Hoi'
            },
            tags: ['sapaan', 'belanda']
        }
    },
    {
        text: 'Bahasa Portugis (Portugal): Bom dia, boa tarde, boa noite.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Portugal',
            countryCode: 'PT',
            greetings: {
                pagi: 'Bom dia',
                siang: 'Boa tarde',
                sore: 'Boa noite',
                malam: 'Boa noite',
                umum: 'Olá'
            }
        }
    },
    {
        text: 'Bahasa Portugis (Brazil): Bom dia, boa tarde, boa noite.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Brazil',
            countryCode: 'BR',
            greetings: {
                pagi: 'Bom dia',
                siang: 'Boa tarde',
                sore: 'Boa noite',
                malam: 'Boa noite',
                umum: 'Olá'
            },
            tags: ['sapaan', 'brazil']
        }
    },
    {
        text: 'Bahasa Rusia: Доброе утро (Dobroye utro), Добрый день (Dobryy den\'), Добрый вечер (Dobryy vecher), Спокойной ночи (Spokoynoy nochi).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Rusia',
            countryCode: 'RU',
            greetings: {
                pagi: 'Доброе утро (Dobroye utro)',
                siang: 'Добрый день (Dobryy den\')',
                sore: 'Добрый вечер (Dobryy vecher)',
                malam: 'Спокойной ночи (Spokoynoy nochi)',
                umum: 'Здравствуйте (Zdravstvuyte)'
            },
            tags: ['sapaan', 'rusia']
        }
    },
    {
        text: 'Bahasa Polandia: Dzień dobry, dobry wieczór, dobranoc.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Polandia',
            countryCode: 'PL',
            greetings: {
                pagi: 'Dzień dobry',
                siang: 'Dzień dobry',
                sore: 'Dobry wieczór',
                malam: 'Dobranoc',
                umum: 'Cześć'
            },
            tags: ['sapaan', 'polandia']
        }
    },
    {
        text: 'Bahasa Ukraina: Доброго ранку (Dobroho ranku), добрий день (dobryi den), добрий вечір (dobryi vechir), на добраніч (na dobranich).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Ukraina',
            countryCode: 'UA',
            greetings: {
                pagi: 'Доброго ранку (Dobroho ranku)',
                siang: 'Добрий день (Dobryi den)',
                sore: 'Добрий вечір (Dobryi vechir)',
                malam: 'На добраніч (Na dobranich)',
                umum: 'Привіт (Pryvit)'
            },
            tags: ['sapaan', 'ukraina']
        }
    },
    {
        text: 'Bahasa Yunani: Καλημέρα (Kaliméra), καλησπέρα (Kalispéra), καληνύχτα (Kalinýchta).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Yunani',
            countryCode: 'GR',
            greetings: {
                pagi: 'Καλημέρα (Kaliméra)',
                siang: 'Καλημέρα (Kaliméra)',
                sore: 'Καλησπέρα (Kalispéra)',
                malam: 'Καληνύχτα (Kalinýchta)',
                umum: 'Γεια σας (Geia sas)'
            },
            tags: ['sapaan', 'yunani']
        }
    },
    {
        text: 'Bahasa Swedia: God morgon, god dag, god kväll, god natt.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Swedia',
            countryCode: 'SE',
            greetings: {
                pagi: 'God morgon',
                siang: 'God dag',
                sore: 'God kväll',
                malam: 'God natt',
                umum: 'Hej'
            },
            tags: ['sapaan', 'swedia']
        }
    },
    {
        text: 'Bahasa Norwegia: God morgen, god dag, god kveld, god natt.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Norwegia',
            countryCode: 'NO',
            greetings: {
                pagi: 'God morgen',
                siang: 'God dag',
                sore: 'God kveld',
                malam: 'God natt',
                umum: 'Hei'
            },
            tags: ['sapaan', 'norwegia']
        }
    },
    {
        text: 'Bahasa Denmark: Godmorgen, goddag, godaften, godnat.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Denmark',
            countryCode: 'DK',
            greetings: {
                pagi: 'Godmorgen',
                siang: 'Goddag',
                sore: 'Godaften',
                malam: 'Godnat',
                umum: 'Hej'
            },
            tags: ['sapaan', 'denmark']
        }
    },
    {
        text: 'Bahasa Finlandia: Hyvää huomenta, hyvää päivää, hyvää iltaa, hyvää yötä.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Finlandia',
            countryCode: 'FI',
            greetings: {
                pagi: 'Hyvää huomenta',
                siang: 'Hyvää päivää',
                sore: 'Hyvää iltaa',
                malam: 'Hyvää yötä',
                umum: 'Hei / Moi'
            },
            tags: ['sapaan', 'finlandia']
        }
    },
    {
        text: 'Bahasa Hungaria: Jó reggelt, jó napot, jó estét, jó éjszakát.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Hungaria',
            countryCode: 'HU',
            greetings: {
                pagi: 'Jó reggelt',
                siang: 'Jó napot',
                sore: 'Jó estét',
                malam: 'Jó éjszakát',
                umum: 'Szia'
            },
            tags: ['sapaan', 'hungaria']
        }
    },
    {
        text: 'Bahasa Ceko: Dobré ráno, dobré odpoledne, dobrý večer, dobrou noc.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Ceko',
            countryCode: 'CZ',
            greetings: {
                pagi: 'Dobré ráno',
                siang: 'Dobré odpoledne',
                sore: 'Dobrý večer',
                malam: 'Dobrou noc',
                umum: 'Ahoj'
            },
            tags: ['sapaan', 'ceko']
        }
    },
    {
        text: 'Bahasa Slowakia: Dobré ráno, dobré popoludnie, dobrý večer, dobrú noc.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Slowakia',
            countryCode: 'SK',
            greetings: {
                pagi: 'Dobré ráno',
                siang: 'Dobré popoludnie',
                sore: 'Dobrý večer',
                malam: 'Dobrú noc',
                umum: 'Ahoj'
            },
            tags: ['sapaan', 'slowakia']
        }
    },
    {
        text: 'Bahasa Rumania: Bună dimineața, bună ziua, bună seara, noapte bună.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Rumania',
            countryCode: 'RO',
            greetings: {
                pagi: 'Bună dimineața',
                siang: 'Bună ziua',
                sore: 'Bună seara',
                malam: 'Noapte bună',
                umum: 'Salut'
            },
            tags: ['sapaan', 'rumania']
        }
    },
    {
        text: 'Bahasa Bulgaria: Добро утро (Dobro utro), добър ден (dobǎr den), добър вечер (dobǎr vecher), лека нощ (leka nosht).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Bulgaria',
            countryCode: 'BG',
            greetings: {
                pagi: 'Добро утро (Dobro utro)',
                siang: 'Добър ден (dobǎr den)',
                sore: 'Добър вечер (dobǎr vecher)',
                malam: 'Лека нощ (leka nosht)',
                umum: 'Здравей (Zdravey)'
            },
            tags: ['sapaan', 'bulgaria']
        }
    },
    
    // ===== AMERIKA UTARA & TENGAH =====
    {
        text: 'Kanada (Inggris/Prancis): Good morning / Bonjour, good afternoon / bon après-midi, good evening / bonsoir, good night / bonne nuit.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Kanada',
            countryCode: 'CA',
            greetings: {
                pagi: 'Good morning / Bonjour',
                siang: 'Good afternoon / Bon après-midi',
                sore: 'Good evening / Bonsoir',
                malam: 'Good night / Bonne nuit',
                umum: 'Hello / Bonjour'
            },
            tags: ['sapaan', 'kanada']
        }
    },
    {
        text: 'Bahasa Spanyol (Meksiko): Buenos días, buenas tardes, buenas noches.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Meksiko',
            countryCode: 'MX',
            greetings: {
                pagi: 'Buenos días',
                siang: 'Buenas tardes',
                sore: 'Buenas tardes',
                malam: 'Buenas noches',
                umum: 'Hola'
            },
            tags: ['sapaan', 'meksiko']
        }
    },
    {
        text: 'Bahasa Spanyol (Guatemala): Buenos días, buenas tardes, buenas noches. Sering "buen día" di pagi hari.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Guatemala',
            countryCode: 'GT',
            greetings: {
                pagi: 'Buen día / Buenos días',
                siang: 'Buenas tardes',
                sore: 'Buenas tardes',
                malam: 'Buenas noches',
                umum: 'Hola'
            },
            tags: ['sapaan', 'guatemala']
        }
    },
    {
        text: 'Bahasa Spanyol (Kosta Rika): Buenos días, buenas tardes, buenas noches. Sering "pura vida" sebagai sapaan kasual.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Kosta Rika',
            countryCode: 'CR',
            greetings: {
                pagi: 'Buenos días',
                siang: 'Buenas tardes',
                sore: 'Buenas tardes',
                malam: 'Buenas noches',
                umum: 'Hola / Pura vida'
            },
            tags: ['sapaan', 'kosta-rika']
        }
    },
    {
        text: 'Bahasa Spanyol (Panama): Buenos días, buenas tardes, buenas noches.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Panama',
            countryCode: 'PA',
            greetings: {
                pagi: 'Buenos días',
                siang: 'Buenas tardes',
                sore: 'Buenas tardes',
                malam: 'Buenas noches',
                umum: 'Hola'
            },
            tags: ['sapaan', 'panama']
        }
    },
    {
        text: 'Bahasa Spanyol (Kuba): Buenos días, buenas tardes, buenas noches.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Kuba',
            countryCode: 'CU',
            greetings: {
                pagi: 'Buenos días',
                siang: 'Buenas tardes',
                sore: 'Buenas tardes',
                malam: 'Buenas noches',
                umum: 'Hola / ¿Qué bolá?'
            },
            tags: ['sapaan', 'kuba']
        }
    },
    {
        text: 'Bahasa Inggris (Jamaika): Good morning, good afternoon, good evening, good night. Sering "wa gwaan" untuk sapaan kasual.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Jamaika',
            countryCode: 'JM',
            greetings: {
                pagi: 'Good morning',
                siang: 'Good afternoon',
                sore: 'Good evening',
                malam: 'Good night',
                umum: 'Wa gwaan / Hello'
            },
            tags: ['sapaan', 'jamaika']
        }
    },
    
    // ===== AMERIKA SELATAN (5) =====
    {
        text: 'Bahasa Spanyol (Argentina): Buen día, buenas tardes, buenas noches. (Menggunakan "vos" alih-alih "tú")',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Argentina',
            countryCode: 'AR',
            greetings: {
                pagi: 'Buen día',
                siang: 'Buenas tardes',
                sore: 'Buenas tardes',
                malam: 'Buenas noches',
                umum: 'Hola / Che'
            },
            tags: ['sapaan', 'argentina']
        }
    },
    {
        text: 'Bahasa Spanyol (Kolombia): Buenos días, buenas tardes, buenas noches. Sering menggunakan "bien" untuk sapaan kasual.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Kolombia',
            countryCode: 'CO',
            greetings: {
                pagi: 'Buenos días',
                siang: 'Buenas tardes',
                sore: 'Buenas tardes',
                malam: 'Buenas noches',
                umum: 'Hola / ¡Qué más!'
            },
            tags: ['sapaan', 'kolombia']
        }
    },
    {
        text: 'Bahasa Spanyol (Chile): Buenos días, buenas tardes, buenas noches. Sering "buen día" untuk pagi.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Chile',
            countryCode: 'CL',
            greetings: {
                pagi: 'Buen día / Buenos días',
                siang: 'Buenas tardes',
                sore: 'Buenas tardes',
                malam: 'Buenas noches',
                umum: 'Hola / ¿Cómo estai?'
            },
            tags: ['sapaan', 'chile']
        }
    },
    {
        text: 'Bahasa Spanyol (Peru): Buenos días, buenas tardes, buenas noches.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Peru',
            countryCode: 'PE',
            greetings: {
                pagi: 'Buenos días',
                siang: 'Buenas tardes',
                sore: 'Buenas tardes',
                malam: 'Buenas noches',
                umum: 'Hola'
            },
            tags: ['sapaan', 'peru']
        }
    },
    {
        text: 'Bahasa Spanyol (Venezuela): Buenos días, buenas tardes, buenas noches.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Venezuela',
            countryCode: 'VE',
            greetings: {
                pagi: 'Buenos días',
                siang: 'Buenas tardes',
                sore: 'Buenas tardes',
                malam: 'Buenas noches',
                umum: 'Hola / ¿Qué más?'
            },
            tags: ['sapaan', 'venezuela']
        }
    },
    
    // ===== AFRIKA (7) =====
    {
        text: 'Bahasa Afrikaans (Afrika Selatan): Goeie more, goeie middag, goeie naand, goeie nag.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Afrika Selatan',
            countryCode: 'ZA',
            greetings: {
                pagi: 'Goeie more',
                siang: 'Goeie middag',
                sore: 'Goeie naand',
                malam: 'Goeie nag',
                umum: 'Hallo / Howzit'
            },
            tags: ['sapaan', 'afrika-selatan']
        }
    },
    {
        text: 'Bahasa Swahili (Tanzania/Kenya): Habari ya asubuhi, habari ya mchana, habari ya jioni, habari ya usiku.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Tanzania',
            countryCode: 'TZ',
            greetings: {
                pagi: 'Habari ya asubuhi',
                siang: 'Habari ya mchana',
                sore: 'Habari ya jioni',
                malam: 'Habari ya usiku',
                umum: 'Habari / Hujambo'
            },
            tags: ['sapaan', 'tanzania']
        }
    },
    {
        text: 'Bahasa Amharik (Ethiopia): ጠዋት እንደምን (Tewat ende minim), እንደምን አለህ (Ende minim aleh).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Ethiopia',
            countryCode: 'ET',
            greetings: {
                pagi: 'ጠዋት እንደምን (Tewat ende minim)',
                siang: 'እንደምን አለህ (Ende minim aleh)',
                sore: 'እንደምን አለህ (Ende minim aleh)',
                malam: 'መልካም ሌሊት (Melkam lelit)',
                umum: 'ሰላም (Selam)'
            },
            tags: ['sapaan', 'ethiopia']
        }
    },
    {
        text: 'Bahasa Hausa (Nigeria): Ina kwana? (pagi), Ina rana? (siang), Ina yamma? (sore), Ina dare? (malam).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Nigeria',
            countryCode: 'NG',
            greetings: {
                pagi: 'Ina kwana?',
                siang: 'Ina rana?',
                sore: 'Ina yamma?',
                malam: 'Ina dare?',
                umum: 'Sannu'
            },
            tags: ['sapaan', 'nigeria']
        }
    },
    {
        text: 'Bahasa Arab Mesir: صباح الخير (Sabah el-kheer), مساء الخير (Masa el-kheer).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Mesir',
            countryCode: 'EG',
            greetings: {
                pagi: 'صباح الخير (Sabah el-kheer)',
                siang: 'مساء الخير (Masa el-kheer)',
                sore: 'مساء الخير (Masa el-kheer)',
                malam: 'تصبح على خير (Tusbih ala khair)',
                umum: 'السلام عليكم (Assalamu\'alaikum)'
            },
            tags: ['sapaan', 'mesir']
        }
    },
    {
        text: 'Bahasa Berber (Maroko): ⵜⵉⴼⴰⵡⵉⵏ (Tifawin) – pagi, ⵜⵉⴼⴰⵡⵉⵏ ⵏ ⵡⴰⵙⵙ (Tifawin n wass) – siang, ⵜⵉⴼⴰⵡⵉⵏ ⵏ ⵜⴰⴷⴳⴳⵯⴰⵜ (Tifawin n tadggwat) – malam.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Maroko',
            countryCode: 'MA',
            greetings: {
                pagi: 'ⵜⵉⴼⴰⵡⵉⵏ (Tifawin)',
                siang: 'ⵜⵉⴼⴰⵡⵉⵏ ⵏ ⵡⴰⵙⵙ (Tifawin n wass)',
                sore: 'ⵜⵉⴼⴰⵡⵉⵏ ⵏ ⵜⴰⴷⴳⴳⵯⴰⵜ (Tifawin n tadggwat)',
                malam: 'ⵜⵉⴼⴰⵡⵉⵏ ⵏ ⵜⴰⴷⴳⴳⵯⴰⵜ (Tifawin n tadggwat)',
                umum: 'ⴰⵣⵓⵍ (Azul)'
            },
            tags: ['sapaan', 'maroko']
        }
    },
    {
        text: 'Bahasa Zulu (Afrika Selatan): Sawubona (umum), ekuseni (pagi), emini (siang), kusihlwa (sore), ebusuku (malam).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Afrika Selatan',
            countryCode: 'ZA',
            greetings: {
                pagi: 'Ekuseni',
                siang: 'Emini',
                sore: 'Kusihlwa',
                malam: 'Ebusuku',
                umum: 'Sawubona'
            },
            tags: ['sapaan', 'zulu']
        }
    },
    
    // ===== OSEANIA & PASIFIK (5) =====
    {
        text: 'Bahasa Inggris (Australia): G\'day, good morning, good afternoon, good evening, good night.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Australia',
            countryCode: 'AU',
            greetings: {
                pagi: 'Good morning / G\'day',
                siang: 'Good afternoon / G\'day',
                sore: 'Good evening / G\'day',
                malam: 'Good night',
                umum: 'G\'day mate!'
            },
            tags: ['sapaan', 'australia']
        }
    },
    {
        text: 'Bahasa Māori (Selandia Baru): Kia ora, ata mārie (pagi), ahiahi mārie (sore), pō mārie (malam).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Selandia Baru',
            countryCode: 'NZ',
            greetings: {
                pagi: 'Ata mārie / Good morning',
                siang: 'Kia ora / Good afternoon',
                sore: 'Ahiahi mārie / Good evening',
                malam: 'Pō mārie / Good night',
                umum: 'Kia ora!'
            },
            tags: ['sapaan', 'selandia-baru']
        }
    },
    {
        text: 'Bahasa Fiji: Ni sa bula vinaka (umum), ni sa yadra vinaka (pagi), ni sa moce (malam).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Fiji',
            countryCode: 'FJ',
            greetings: {
                pagi: 'Ni sa yadra vinaka',
                siang: 'Ni sa bula vinaka',
                sore: 'Ni sa bula vinaka',
                malam: 'Ni sa moce',
                umum: 'Bula!'
            },
            tags: ['sapaan', 'fiji']
        }
    },
    {
        text: 'Bahasa Tok Pisin (Papua Nugini): Moning, belo, apinun, gut nait.',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Papua Nugini',
            countryCode: 'PG',
            greetings: {
                pagi: 'Moning',
                siang: 'Belo',
                sore: 'Apinun',
                malam: 'Gut nait',
                umum: 'Halo'
            },
            tags: ['sapaan', 'papua-nugini']
        }
    },
    {
        text: 'Bahasa Samoa (Samoa): Manuia le taeao (pagi), manuia le aoauli (siang), manuia le afiafi (sore), manuia le po (malam).',
        metadata: {
            category: 'sapaan',
            type: 'negara',
            country: 'Samoa',
            countryCode: 'WS',
            greetings: {
                pagi: 'Manuia le taeao',
                siang: 'Manuia le aoauli',
                sore: 'Manuia le afiafi',
                malam: 'Manuia le po',
                umum: 'Talofa'
            },
            tags: ['sapaan', 'samoa']
        }
    },
    
    // ==========================================================
    // 🧑‍💼 SAPAAN SITUASI & FORMALITAS (6)
    // ==========================================================
    {
        text: 'Selamat pagi, Bapak/Ibu! Semoga hari Anda menyenangkan.',
        metadata: {
            category: 'sapaan',
            type: 'situasi',
            name: 'Formal Pagi',
            code: 'FORMAL_PAGI',
            formalitas: 'formal',
            tags: ['sapaan', 'formal', 'pagi']
        }
    },
    {
        text: 'Hai, teman-teman! Apa kabar kalian semua?',
        metadata: {
            category: 'sapaan',
            type: 'situasi',
            name: 'Kasual Grup',
            code: 'KASUAL_GRUP',
            formalitas: 'casual',
            tags: ['sapaan', 'casual', 'grup']
        }
    },
    {
        text: 'Salam sejahtera untuk Anda semua. Semoga hari ini damai.',
        metadata: {
            category: 'sapaan',
            type: 'situasi',
            name: 'Damai',
            code: 'DAMAI',
            tags: ['sapaan', 'damai', 'formal']
        }
    },
    {
        text: 'Selamat pagi, para hadirin! Terima kasih atas kehadirannya.',
        metadata: {
            category: 'sapaan',
            type: 'situasi',
            name: 'Acara',
            code: 'ACARA',
            tags: ['sapaan', 'acara', 'formal']
        }
    },
    {
        text: 'Hai, selamat datang di acara kita hari ini!',
        metadata: {
            category: 'sapaan',
            type: 'situasi',
            name: 'Acara Kasual',
            code: 'ACARA_KASUAL',
            formalitas: 'casual',
            tags: ['sapaan', 'acara', 'casual']
        }
    },
    {
        text: 'Selamat sore, rekan-rekan! Semoga kerja sama kita selalu baik.',
        metadata: {
            category: 'sapaan',
            type: 'situasi',
            name: 'Rekan Kerja',
            code: 'REKAN_KERJA',
            tags: ['sapaan', 'kerja', 'formal']
        }
    },
    
    // ==========================================================
    // 🎉 HARI RAYA & MOMENTUM (7)
    // ==========================================================
    {
        text: 'Selamat Idul Fitri, mohon maaf lahir dan batin!',
        metadata: {
            category: 'sapaan',
            type: 'hari-raya',
            name: 'Idul Fitri',
            code: 'LEBARAN',
            tags: ['sapaan', 'lebaran', 'islam']
        }
    },
    {
        text: 'Selamat Tahun Baru! Semoga tahun ini penuh berkah dan kebahagiaan.',
        metadata: {
            category: 'sapaan',
            type: 'hari-raya',
            name: 'Tahun Baru Masehi',
            code: 'NEW_YEAR',
            tags: ['sapaan', 'tahun-baru']
        }
    },
    {
        text: 'Selamat Natal! Damai sejahtera bagi kita semua.',
        metadata: {
            category: 'sapaan',
            type: 'hari-raya',
            name: 'Natal',
            code: 'CHRISTMAS',
            tags: ['sapaan', 'natal', 'kristen']
        }
    },
    {
        text: 'Selamat Hari Raya Galungan! Semoga kebaikan selalu menyertai.',
        metadata: {
            category: 'sapaan',
            type: 'hari-raya',
            name: 'Galungan',
            code: 'GALUNGAN',
            tags: ['sapaan', 'galungan', 'hindu']
        }
    },
    {
        text: 'Selamat Waisak! Semoga kedamaian menyertai kita semua.',
        metadata: {
            category: 'sapaan',
            type: 'hari-raya',
            name: 'Waisak',
            code: 'WAISAK',
            tags: ['sapaan', 'waisak', 'buddha']
        }
    },
    {
        text: 'Selamat Tahun Baru Imlek! Gong xi fa cai, semoga rezeki melimpah.',
        metadata: {
            category: 'sapaan',
            type: 'hari-raya',
            name: 'Imlek',
            code: 'IMLEK',
            tags: ['sapaan', 'imlek', 'tionghoa']
        }
    },
    {
        text: 'Selamat Hari Raya Nyepi! Semoga tahun baru Saka membawa kedamaian.',
        metadata: {
            category: 'sapaan',
            type: 'hari-raya',
            name: 'Nyepi',
            code: 'NYEPI',
            tags: ['sapaan', 'nyepi', 'hindu']
        }
    },
    {
        text: 'Selamat Isra Mi\'raj! Semoga perjalanan spiritual kita diberkahi.',
        metadata: {
            category: 'sapaan',
            type: 'hari-raya',
            name: 'Isra Miraj',
            code: 'ISRA_MIRAJ',
            tags: ['sapaan', 'isra-miraj', 'islam']
        }
    },
    
    // ==========================================================
    // 🌤️ SAPAAN BERBASIS CUACA (RANDOM) - 4
    // ==========================================================
    {
        text: 'Selamat pagi! Hari ini cerah, semangat menjalani aktivitas!',
        metadata: {
            category: 'sapaan',
            type: 'cuaca',
            cuaca: 'cerah',
            code: 'CUACA_CERAH_PAGI',
            tags: ['sapaan', 'cuaca', 'cerah']
        }
    },
    {
        text: 'Selamat siang! Cuaca panas, jangan lupa minum air putih yang cukup.',
        metadata: {
            category: 'sapaan',
            type: 'cuaca',
            cuaca: 'panas',
            code: 'CUACA_PANAS_SIANG',
            tags: ['sapaan', 'cuaca', 'panas']
        }
    },
    {
        text: 'Selamat sore! Hujan turun, jangan lupa bawa payung jika ke luar.',
        metadata: {
            category: 'sapaan',
            type: 'cuaca',
            cuaca: 'hujan',
            code: 'CUACA_HUJAN_SORE',
            tags: ['sapaan', 'cuaca', 'hujan']
        }
    },
    {
        text: 'Selamat malam! Udara dingin, selimuti diri Anda dengan hangat.',
        metadata: {
            category: 'sapaan',
            type: 'cuaca',
            cuaca: 'dingin',
            code: 'CUACA_DINGIN_MALAM',
            tags: ['sapaan', 'cuaca', 'dingin']
        }
    },
    
    // ==========================================================
    // 🌏 BAHASA DAERAH INDONESIA (8)
    // ==========================================================
    {
        text: 'Sugeng enjing! (Selamat pagi dalam bahasa Jawa)',
        metadata: {
            category: 'sapaan',
            type: 'daerah',
            language: 'Jawa',
            code: 'JAWA_PAGI',
            tags: ['sapaan', 'jawa', 'daerah']
        }
    },
    {
        text: 'Wilujeng enjing! (Selamat pagi dalam bahasa Sunda)',
        metadata: {
            category: 'sapaan',
            type: 'daerah',
            language: 'Sunda',
            code: 'SUNDA_PAGI',
            tags: ['sapaan', 'sunda', 'daerah']
        }
    },
    {
        text: 'Horas! (Salam khas Batak)',
        metadata: {
            category: 'sapaan',
            type: 'daerah',
            language: 'Batak',
            code: 'BATAK',
            tags: ['sapaan', 'batak', 'daerah']
        }
    },
    {
        text: 'Rahayu! (Salam khas Sunda untuk selamat sejahtera)',
        metadata: {
            category: 'sapaan',
            type: 'daerah',
            language: 'Sunda',
            code: 'SUNDA_RAHAYU',
            tags: ['sapaan', 'sunda', 'daerah']
        }
    },
    {
        text: 'Om Swastiastu! (Salam khas Bali)',
        metadata: {
            category: 'sapaan',
            type: 'daerah',
            language: 'Bali',
            code: 'BALI_SWASTIASTU',
            tags: ['sapaan', 'bali', 'daerah']
        }
    },
    {
        text: 'Sugeng siang! (Selamat siang dalam bahasa Jawa)',
        metadata: {
            category: 'sapaan',
            type: 'daerah',
            language: 'Jawa',
            code: 'JAWA_SIANG',
            tags: ['sapaan', 'jawa', 'siang']
        }
    },
    {
        text: 'Wilujeng sonten! (Selamat sore dalam bahasa Sunda)',
        metadata: {
            category: 'sapaan',
            type: 'daerah',
            language: 'Sunda',
            code: 'SUNDA_SORE',
            tags: ['sapaan', 'sunda', 'sore']
        }
    },
    {
        text: 'Mari kita sapa semua! (Sapaan umum untuk memulai interaksi)',
        metadata: {
            category: 'sapaan',
            type: 'umum',
            name: 'Sapa Semua',
            code: 'SAPA_SEMUA',
            tags: ['sapaan', 'umum', 'interaksi']
        }
    }
];

export const DATA = data;

if (window.InternalLogger) {
    window.InternalLogger.info('SapaanGreetings', '✅ Loaded ' + data.length + ' sapaan (waktu, 60+ negara, situasi, hari raya, cuaca, daerah)!');
}
