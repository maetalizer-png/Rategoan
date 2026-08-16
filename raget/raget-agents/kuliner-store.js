// Basis data KULINER terstruktur (nama, negara asal, jenis, bahan utama, trivia) + composer
// adaptif. Menuntaskan SATU kategori data kuliner (menyusul tokoh-store.js dan data country
// di raget-dataries/), sesuai preseden ronde-ronde sebelumnya: bukan cuma daftar nama, tapi
// entri lengkap dengan detail yang bisa dijawab lewat beberapa jenis pertanyaan berbeda.

import { pickVariant } from '../../utils/text.js';

const KULINER = [
  { nama: 'Rendang', negara: 'Indonesia', jenis: 'makanan utama', bahanUtama: ['daging sapi', 'santan', 'bumbu rempah'], trivia: 'Pernah dinobatkan CNN sebagai salah satu hidangan terenak di dunia; dimasak berjam-jam sampai bumbu benar-benar meresap dan kering.' },
  { nama: 'Sate', negara: 'Indonesia', jenis: 'makanan utama', bahanUtama: ['daging (ayam/sapi/kambing)', 'bumbu kacang atau kecap', 'tusuk bambu'], trivia: 'Setiap daerah di Indonesia punya versi khasnya sendiri, dari Sate Madura sampai Sate Padang dengan kuah kuning.' },
  { nama: 'Gado-Gado', negara: 'Indonesia', jenis: 'makanan utama', bahanUtama: ['sayuran rebus', 'bumbu kacang', 'lontong'], trivia: "Sering disebut 'salad Indonesia' karena isinya sayuran campur, tapi disiram saus kacang yang gurih." },
  { nama: 'Nasi Goreng', negara: 'Indonesia', jenis: 'makanan utama', bahanUtama: ['nasi', 'kecap manis', 'bumbu bawang'], trivia: 'Pernah masuk daftar makanan terenak dunia versi CNN dan sering disebut sebagai hidangan nasional Indonesia.' },
  { nama: 'Soto', negara: 'Indonesia', jenis: 'sup/soto', bahanUtama: ['kaldu ayam atau sapi', 'rempah', 'nasi/lontong'], trivia: 'Punya banyak variasi daerah seperti Soto Betawi, Soto Lamongan, dan Soto Banjar, masing-masing dengan ciri kuah berbeda.' },
  { nama: 'Bakso', negara: 'Indonesia', jenis: 'sup/soto', bahanUtama: ['daging giling', 'tepung tapioka', 'kuah kaldu'], trivia: 'Berasal dari pengaruh kuliner Tionghoa-Indonesia dan kini jadi salah satu jajanan jalanan paling populer di Indonesia.' },
  { nama: 'Rawon', negara: 'Indonesia', jenis: 'sup/soto', bahanUtama: ['daging sapi', 'kluwek', 'kaldu hitam'], trivia: 'Warna kuahnya yang hitam pekat berasal dari kluwek, buah khas yang juga dipakai dalam masakan Jawa Timur lainnya.' },
  { nama: 'Gudeg', negara: 'Indonesia', jenis: 'makanan utama', bahanUtama: ['nangka muda', 'santan', 'gula merah'], trivia: 'Dikenal sebagai makanan khas Yogyakarta dengan rasa manis yang khas dari gula merah dan santan.' },
  { nama: 'Klepon', negara: 'Indonesia', jenis: 'kue/penutup', bahanUtama: ['tepung ketan', 'gula merah cair', 'kelapa parut'], trivia: "Kue tradisional berwarna hijau ini akan 'meletus' mengeluarkan gula cair saat digigit." },
  { nama: 'Es Cendol', negara: 'Indonesia', jenis: 'minuman', bahanUtama: ['tepung beras', 'santan', 'gula merah cair'], trivia: 'Butiran hijaunya terbuat dari tepung beras dengan pewarna alami daun pandan atau suji.' },
  { nama: 'Sushi', negara: 'Jepang', jenis: 'makanan utama', bahanUtama: ['nasi cuka', 'ikan mentah', 'nori'], trivia: 'Awalnya sushi adalah metode pengawetan ikan dengan nasi fermentasi, bukan hidangan segar seperti sekarang.' },
  { nama: 'Ramen', negara: 'Jepang', jenis: 'sup/soto', bahanUtama: ['mi gandum', 'kaldu kaldu (tonkotsu/shoyu/miso)', 'topping chashu'], trivia: 'Sebenarnya berasal dari mi Tiongkok yang diadaptasi orang Jepang menjadi hidangan khasnya sendiri.' },
  { nama: 'Tempura', negara: 'Jepang', jenis: 'makanan utama', bahanUtama: ['udang atau sayuran', 'adonan tepung', 'minyak goreng'], trivia: 'Teknik menggoreng dengan balutan tepung ini sebenarnya diperkenalkan oleh pedagang Portugis pada abad ke-16.' },
  { nama: 'Takoyaki', negara: 'Jepang', jenis: 'jajanan', bahanUtama: ['adonan tepung', 'potongan gurita', 'saus takoyaki'], trivia: 'Dimasak dalam cetakan bulat khusus dan dibalik berulang kali sampai bentuknya bulat sempurna.' },
  { nama: 'Kimchi', negara: 'Korea Selatan', jenis: 'jajanan', bahanUtama: ['sawi putih', 'bubuk cabai', 'bawang putih'], trivia: 'Fermentasi kimchi bisa berlangsung dari beberapa hari sampai berbulan-bulan, menghasilkan rasa asam khas.' },
  { nama: 'Bibimbap', negara: 'Korea Selatan', jenis: 'makanan utama', bahanUtama: ['nasi', 'sayuran campur', 'gochujang'], trivia: "Namanya berarti 'nasi campur', biasanya disajikan dalam mangkuk batu panas yang membuat nasi di dasarnya renyah." },
  { nama: 'Tteokbokki', negara: 'Korea Selatan', jenis: 'jajanan', bahanUtama: ['kue beras', 'saus gochujang', 'ikan olahan'], trivia: 'Jajanan pinggir jalan paling populer di Korea Selatan dengan rasa pedas-manis khas gochujang.' },
  { nama: 'Peking Duck', negara: 'Tiongkok', jenis: 'makanan utama', bahanUtama: ['bebek utuh', 'kulit lumpia tipis', 'saus hoisin'], trivia: 'Prosesnya membutuhkan pengeringan kulit bebek berjam-jam agar hasil akhirnya renyah sempurna saat dipanggang.' },
  { nama: 'Dim Sum', negara: 'Tiongkok', jenis: 'jajanan', bahanUtama: ['adonan tepung', 'isian daging/udang', 'kukusan bambu'], trivia: "Tradisi menyantap dim sum biasanya dibarengi minum teh, dikenal dengan istilah 'yum cha'." },
  { nama: 'Mapo Tofu', negara: 'Tiongkok', jenis: 'makanan utama', bahanUtama: ['tahu lembut', 'daging cincang', 'pasta cabai Sichuan'], trivia: "Berasal dari provinsi Sichuan, terkenal dengan sensasi pedas dan mati rasa dari bumbu 'mala' khasnya." },
  { nama: 'Pad Thai', negara: 'Thailand', jenis: 'makanan utama', bahanUtama: ['mi beras', 'udang atau ayam', 'saus asam manis'], trivia: 'Dipromosikan besar-besaran oleh pemerintah Thailand pada 1930-an sebagai hidangan nasional untuk memperkuat identitas negara.' },
  { nama: 'Tom Yum', negara: 'Thailand', jenis: 'sup/soto', bahanUtama: ['udang', 'serai dan lengkuas', 'cabai dan jeruk nipis'], trivia: 'Rasa asam-pedasnya yang khas membuat Tom Yum jadi salah satu sup paling terkenal di dunia.' },
  { nama: 'Pho', negara: 'Vietnam', jenis: 'sup/soto', bahanUtama: ['mi beras', 'kaldu daging sapi', 'kecambah dan daun herba'], trivia: 'Diyakini muncul awal abad ke-20 di Vietnam Utara, dipengaruhi teknik kaldu daging dari kuliner Prancis.' },
  { nama: 'Banh Mi', negara: 'Vietnam', jenis: 'makanan utama', bahanUtama: ['roti baguette', 'daging/pate', 'acar sayuran'], trivia: 'Perpaduan roti gaya Prancis dengan isian khas Vietnam ini adalah warisan kuliner era kolonial.' },
  { nama: 'Laksa', negara: 'Malaysia', jenis: 'sup/soto', bahanUtama: ['mi', 'kuah santan atau asam', 'udang/ayam'], trivia: 'Punya banyak variasi regional, dari Laksa Penang yang asam sampai Laksa Katong yang gurih santan.' },
  { nama: 'Nasi Lemak', negara: 'Malaysia', jenis: 'makanan utama', bahanUtama: ['nasi santan', 'sambal', 'ikan bilis dan kacang'], trivia: 'Dianggap sebagai hidangan sarapan nasional Malaysia, biasa dibungkus daun pisang.' },
  { nama: 'Adobo', negara: 'Filipina', jenis: 'makanan utama', bahanUtama: ['daging ayam atau babi', 'cuka dan kecap asin', 'bawang putih'], trivia: "Nama 'adobo' berasal dari bahasa Spanyol yang berarti 'bumbu' atau 'marinasi', walau resepnya asli Filipina." },
  { nama: 'Lumpia', negara: 'Filipina', jenis: 'jajanan', bahanUtama: ['kulit lumpia', 'sayuran atau daging cincang', 'minyak goreng'], trivia: 'Berasal dari pengaruh kuliner Tionghoa yang lalu beradaptasi menjadi camilan khas Filipina.' },
  { nama: 'Amok', negara: 'Kamboja', jenis: 'makanan utama', bahanUtama: ['ikan', 'santan', 'pasta kroeung'], trivia: 'Dikukus dalam daun pisang dan dianggap sebagai salah satu hidangan paling ikonik Kamboja.' },
  { nama: 'Momo', negara: 'Nepal', jenis: 'jajanan', bahanUtama: ['kulit adonan tepung', 'isian daging atau sayuran', 'saus cabai'], trivia: 'Mirip dumpling, momo dipercaya masuk ke Nepal lewat jalur perdagangan dengan Tibet.' },
  { nama: 'Butter Chicken', negara: 'India', jenis: 'makanan utama', bahanUtama: ['ayam', 'saus tomat krim', 'mentega'], trivia: 'Konon diciptakan secara tak sengaja di sebuah restoran Delhi untuk memanfaatkan sisa ayam tandoori.' },
  { nama: 'Biryani', negara: 'India', jenis: 'makanan utama', bahanUtama: ['nasi basmati', 'daging atau ayam', 'rempah campuran'], trivia: 'Diperkirakan dibawa ke India oleh pedagang dan penguasa Persia berabad-abad lalu.' },
  { nama: 'Samosa', negara: 'India', jenis: 'jajanan', bahanUtama: ['kulit adonan tepung', 'kentang dan kacang polong', 'rempah'], trivia: 'Nama dan bentuk segitiganya diyakini berasal dari Timur Tengah sebelum populer di anak benua India.' },
  { nama: 'Hummus', negara: 'Timur Tengah', jenis: 'makanan pembuka', bahanUtama: ['kacang arab (chickpea)', 'tahini', 'minyak zaitun'], trivia: 'Diklaim sebagai warisan kuliner oleh beberapa negara Timur Tengah sekaligus, memicu perdebatan asal-usulnya.' },
  { nama: 'Falafel', negara: 'Timur Tengah', jenis: 'makanan utama', bahanUtama: ['kacang arab atau fava', 'rempah', 'minyak goreng'], trivia: 'Sering disebut sebagai salah satu makanan cepat saji tertua di dunia, sudah ada sejak berabad-abad lalu.' },
  { nama: 'Shawarma', negara: 'Timur Tengah', jenis: 'makanan utama', bahanUtama: ['daging panggang berlapis', 'roti pita', 'saus'], trivia: 'Teknik memanggang daging berlapis vertikal ini juga jadi cikal bakal gyro Yunani dan doner kebab Turki.' },
  { nama: 'Kebab', negara: 'Turki', jenis: 'makanan utama', bahanUtama: ['daging panggang', 'roti', 'sayuran'], trivia: 'Punya banyak variasi di seluruh Turki dan Timur Tengah, dari Adana Kebab sampai Iskender Kebab.' },
  { nama: 'Baklava', negara: 'Turki', jenis: 'kue/penutup', bahanUtama: ['adonan filo tipis', 'kacang cincang', 'sirup madu'], trivia: 'Diperkirakan berasal dari era Kesultanan Utsmaniyah dan kini populer di banyak negara Timur Tengah dan Balkan.' },
  { nama: 'Paella', negara: 'Spanyol', jenis: 'makanan utama', bahanUtama: ['nasi', 'saffron', 'makanan laut atau ayam'], trivia: "Berasal dari wilayah Valencia, dimasak dalam wajan lebar khas yang juga disebut 'paellera'." },
  { nama: 'Tapas', negara: 'Spanyol', jenis: 'makanan pembuka', bahanUtama: ['beragam bahan (keju, daging, sayuran)', 'roti', 'minyak zaitun'], trivia: 'Awalnya konon dipakai sebagai penutup gelas minuman agar debu atau serangga tidak masuk.' },
  { nama: 'Pizza', negara: 'Italia', jenis: 'makanan utama', bahanUtama: ['adonan tepung', 'saus tomat', 'keju mozzarella'], trivia: 'Pizza Margherita diyakini diciptakan untuk menghormati Ratu Margherita dari Italia dengan warna bendera Italia.' },
  { nama: 'Pasta Carbonara', negara: 'Italia', jenis: 'makanan utama', bahanUtama: ['pasta', 'telur dan keju pecorino', 'guanciale/daging asap'], trivia: 'Resep otentiknya tidak memakai krim, meski versi krim populer di banyak negara lain.' },
  { nama: 'Risotto', negara: 'Italia', jenis: 'makanan utama', bahanUtama: ['beras arborio', 'kaldu', 'keju parmesan'], trivia: 'Dimasak dengan cara diaduk perlahan sambil kaldu ditambahkan sedikit demi sedikit hingga teksturnya creamy.' },
  { nama: 'Tiramisu', negara: 'Italia', jenis: 'kue/penutup', bahanUtama: ['kue ladyfinger', 'kopi espresso', 'krim mascarpone'], trivia: "Namanya berarti 'angkat aku' dalam bahasa Italia, merujuk pada efek kafein dari kopi di dalamnya." },
  { nama: 'Croissant', negara: 'Prancis', jenis: 'kue/penutup', bahanUtama: ['adonan mentega berlapis', 'ragi', 'mentega'], trivia: 'Meski identik dengan Prancis, bentuk awalnya konon terinspirasi dari kue bulan sabit khas Austria.' },
  { nama: 'Ratatouille', negara: 'Prancis', jenis: 'makanan utama', bahanUtama: ['terong dan zukini', 'tomat', 'bumbu Provençal'], trivia: 'Awalnya hidangan sederhana petani di Provence, kini dikenal luas berkat film animasi berjudul sama.' },
  { nama: 'Crepe', negara: 'Prancis', jenis: 'kue/penutup', bahanUtama: ['tepung terigu', 'telur dan susu', 'isian manis/gurih'], trivia: 'Berasal dari wilayah Brittany, Prancis, dan bisa disajikan manis maupun gurih tergantung isiannya.' },
  { nama: 'Fondue', negara: 'Swiss', jenis: 'makanan utama', bahanUtama: ['keju leleh campuran', 'roti', 'anggur putih'], trivia: 'Awalnya dipopulerkan sebagai cara petani pegunungan Swiss menghabiskan keju dan roti keras di musim dingin.' },
  { nama: 'Schnitzel', negara: 'Austria', jenis: 'makanan utama', bahanUtama: ['daging (biasanya sapi muda)', 'tepung roti', 'minyak goreng'], trivia: 'Wiener Schnitzel asli secara hukum harus dibuat dari daging sapi muda, bukan daging lain.' },
  { nama: 'Sauerkraut', negara: 'Jerman', jenis: 'jajanan', bahanUtama: ['kubis difermentasi', 'garam', 'rempah'], trivia: 'Fermentasi kubis ini sudah dikenal sejak zaman kuno dan menyebar ke Eropa lewat jalur perdagangan.' },
  { nama: 'Pretzel', negara: 'Jerman', jenis: 'jajanan', bahanUtama: ['adonan tepung', 'larutan alkali (lye)', 'garam kasar'], trivia: 'Bentuk simpulnya konon terinspirasi dari lengan yang bersilang saat berdoa di biara abad pertengahan.' },
  { nama: 'Currywurst', negara: 'Jerman', jenis: 'jajanan', bahanUtama: ['sosis babi', 'saus tomat', 'bubuk kari'], trivia: 'Ditemukan di Berlin pasca Perang Dunia II ketika bumbu kari mulai mudah didapat dari tentara sekutu.' },
  { nama: 'Fish and Chips', negara: 'Inggris', jenis: 'makanan utama', bahanUtama: ['ikan (biasanya cod)', 'kentang goreng', 'adonan tepung'], trivia: 'Pernah jadi hidangan yang dikecualikan dari penjatahan makanan selama Perang Dunia II di Inggris.' },
  { nama: "Shepherd's Pie", negara: 'Inggris', jenis: 'makanan utama', bahanUtama: ['daging domba cincang', 'sayuran', 'kentang tumbuk'], trivia: "Versi dengan daging sapi disebut 'Cottage Pie', sedangkan daging domba disebut 'Shepherd's Pie'." },
  { nama: 'Full English Breakfast', negara: 'Inggris', jenis: 'makanan utama', bahanUtama: ['telur dan sosis', 'bacon', 'kacang panggang'], trivia: 'Tradisi sarapan besar ini mulai populer di kalangan bangsawan Inggris sejak era Victoria.' },
  { nama: 'Stroopwafel', negara: 'Belanda', jenis: 'kue/penutup', bahanUtama: ['adonan wafel tipis', 'sirup karamel', 'kayu manis'], trivia: 'Awalnya dibuat dari sisa remahan roti oleh tukang roti Belanda pada abad ke-18.' },
  { nama: 'Smorgasbord', negara: 'Swedia', jenis: 'makanan utama', bahanUtama: ['ikan asap/asin', 'daging dingin', 'roti dan keju'], trivia: "Konsep hidangan prasmanan tradisional Swedia ini menjadi inspirasi kata 'buffet' di banyak negara." },
  { nama: 'Borscht', negara: 'Ukraina', jenis: 'sup/soto', bahanUtama: ['bit merah', 'kubis', 'daging sapi'], trivia: 'Warna merah khasnya berasal dari bit, dan hidangan ini diklaim sebagai warisan kuliner oleh beberapa negara Slavia.' },
  { nama: 'Pierogi', negara: 'Polandia', jenis: 'jajanan', bahanUtama: ['adonan tepung', 'isian kentang/keju/daging', 'mentega'], trivia: 'Sering disajikan saat perayaan Natal dan acara keluarga besar di Polandia.' },
  { nama: 'Goulash', negara: 'Hungaria', jenis: 'sup/soto', bahanUtama: ['daging sapi', 'paprika bubuk', 'kentang'], trivia: 'Awalnya makanan para penggembala sapi Hungaria yang dimasak dalam kuali besar di atas api unggun.' },
  { nama: 'Moussaka', negara: 'Yunani', jenis: 'makanan utama', bahanUtama: ['terong', 'daging cincang', 'saus bechamel'], trivia: 'Punya kemiripan dengan lasagna, namun memakai lapisan terong sebagai pengganti pasta.' },
  { nama: 'Souvlaki', negara: 'Yunani', jenis: 'makanan utama', bahanUtama: ['daging tusuk panggang', 'roti pita', 'saus tzatziki'], trivia: 'Sudah dikenal sejak zaman Yunani Kuno, dengan bukti arkeologi alat pemanggang tusuk sate.' },
  { nama: 'Feijoada', negara: 'Brasil', jenis: 'makanan utama', bahanUtama: ['kacang hitam', 'berbagai potongan daging babi', 'nasi'], trivia: 'Awalnya dianggap hidangan kalangan bawah, kini justru jadi hidangan nasional yang dibanggakan Brasil.' },
  { nama: 'Churrasco', negara: 'Brasil', jenis: 'makanan utama', bahanUtama: ['berbagai daging panggang', 'garam kasar', 'tusuk logam panjang'], trivia: 'Tradisi barbeque ala gaucho (penggembala) di Amerika Selatan ini kini populer di seluruh dunia lewat restoran churrascaria.' },
  { nama: 'Empanada', negara: 'Argentina', jenis: 'jajanan', bahanUtama: ['adonan pastry', 'isian daging atau sayuran', 'bumbu rempah'], trivia: 'Punya ratusan variasi isian di seluruh Amerika Latin, tergantung daerah dan tradisi keluarga.' },
  { nama: 'Asado', negara: 'Argentina', jenis: 'makanan utama', bahanUtama: ['berbagai potongan daging sapi', 'garam', 'panggangan terbuka'], trivia: 'Lebih dari sekadar barbeque, asado adalah ritual sosial dan budaya penting dalam kehidupan masyarakat Argentina.' },
  { nama: 'Ceviche', negara: 'Peru', jenis: 'makanan utama', bahanUtama: ['ikan atau makanan laut mentah', 'air jeruk nipis', 'cabai dan bawang merah'], trivia: "Ikan 'dimasak' hanya dengan asam jeruk nipis tanpa panas, proses yang disebut denaturasi protein." },
  { nama: 'Tacos', negara: 'Meksiko', jenis: 'makanan utama', bahanUtama: ['tortilla jagung', 'isian daging/sayuran', 'salsa'], trivia: 'Sejarah taco sudah ada sejak sebelum kedatangan bangsa Spanyol ke wilayah Meksiko.' },
  { nama: 'Guacamole', negara: 'Meksiko', jenis: 'makanan pembuka', bahanUtama: ['alpukat', 'bawang bombay dan tomat', 'jeruk nipis'], trivia: "Namanya berasal dari bahasa Nahuatl suku Aztec, 'ahuacamolli', yang berarti 'saus alpukat'." },
  { nama: 'Mole Poblano', negara: 'Meksiko', jenis: 'makanan utama', bahanUtama: ['cabai kering campuran', 'cokelat', 'rempah'], trivia: 'Salah satu saus paling rumit di dunia kuliner, bisa memakai lebih dari 20 jenis bahan berbeda.' },
  { nama: 'Poutine', negara: 'Kanada', jenis: 'jajanan', bahanUtama: ['kentang goreng', 'keju dadih (cheese curds)', 'saus gravy'], trivia: 'Berasal dari provinsi Quebec pada 1950-an dan kini jadi salah satu jajanan paling ikonik Kanada.' },
  { nama: 'Clam Chowder', negara: 'Amerika Serikat', jenis: 'sup/soto', bahanUtama: ['kerang', 'kentang', 'krim susu'], trivia: "New England Clam Chowder yang creamy dan Manhattan Clam Chowder yang berbasis tomat sering diperdebatkan mana yang 'asli'." },
  { nama: 'Hamburger', negara: 'Amerika Serikat', jenis: 'makanan utama', bahanUtama: ['daging sapi giling', 'roti bun', 'sayuran dan saus'], trivia: "Nama 'hamburger' diyakini berasal dari kota Hamburg, Jerman, tempat asal imigran yang memopulerkannya di AS." },
  { nama: 'Jollof Rice', negara: 'Nigeria', jenis: 'makanan utama', bahanUtama: ['nasi', 'saus tomat dan cabai', 'rempah'], trivia: "Sering memicu 'perang' persahabatan di media sosial antara Nigeria, Ghana, dan negara Afrika Barat lain soal versi mana yang terenak." },
  { nama: 'Injera', negara: 'Etiopia', jenis: 'makanan utama', bahanUtama: ['tepung teff', 'air', 'fermentasi alami'], trivia: "Roti pipih berpori ini juga berfungsi sebagai 'piring' sekaligus alat makan dalam tradisi makan Etiopia." },
  { nama: 'Bunny Chow', negara: 'Afrika Selatan', jenis: 'makanan utama', bahanUtama: ['roti tawar utuh dikeruk', 'kari daging/sayuran', 'acar sayur'], trivia: 'Konon diciptakan komunitas India di Durban sebagai cara praktis membawa kari tanpa wadah.' },
  { nama: 'Tagine', negara: 'Maroko', jenis: 'makanan utama', bahanUtama: ['daging atau ayam', 'buah kering', 'rempah campuran'], trivia: 'Namanya diambil dari wadah tanah liat berbentuk kerucut yang dipakai memasak dan menyajikannya.' },
  { nama: 'Couscous', negara: 'Maroko', jenis: 'makanan utama', bahanUtama: ['semolina gandum', 'sayuran', 'daging'], trivia: 'Secara tradisional dikukus tiga kali dalam panci khusus bernama couscoussier agar teksturnya ringan.' },
  { nama: 'Pavlova', negara: 'Australia', jenis: 'kue/penutup', bahanUtama: ['putih telur', 'gula', 'buah segar'], trivia: 'Australia dan Selandia Baru sama-sama mengklaim sebagai negara asal hidangan pencuci mulut ini.' },
  { nama: 'Meat Pie', negara: 'Australia', jenis: 'makanan utama', bahanUtama: ['daging cincang', 'kulit pastry', 'saus gravy'], trivia: 'Dianggap sebagai salah satu makanan nasional Australia, sering dijual di pertandingan olahraga.' },
  { nama: 'Hangi', negara: 'Selandia Baru', jenis: 'makanan utama', bahanUtama: ['daging', 'sayuran akar', 'batu panas'], trivia: 'Teknik memasak tradisional suku Maori ini menguburkan makanan di lubang tanah berisi batu panas.' },
  { nama: 'Kava', negara: 'Fiji', jenis: 'minuman', bahanUtama: ['akar tanaman kava', 'air', '-'], trivia: 'Minuman tradisional Pasifik ini punya efek menenangkan dan biasa diminum dalam upacara adat.' },
  { nama: 'Kopi Luwak', negara: 'Indonesia', jenis: 'minuman', bahanUtama: ['biji kopi', 'fermentasi alami pencernaan luwak', 'air'], trivia: 'Salah satu kopi termahal di dunia karena proses fermentasi unik lewat sistem pencernaan luwak.' },
  { nama: 'Teh Tarik', negara: 'Malaysia', jenis: 'minuman', bahanUtama: ['teh hitam', 'susu kental manis', '-'], trivia: "Namanya berarti 'teh tarik' karena teknik menuang bolak-balik dari ketinggian untuk menciptakan busa." },
  { nama: 'Bubble Tea', negara: 'Taiwan', jenis: 'minuman', bahanUtama: ['teh', 'susu', 'bola tapioka'], trivia: 'Diciptakan pada 1980-an dan sejak itu menyebar jadi tren minuman global di berbagai negara.' },
  { nama: 'Matcha', negara: 'Jepang', jenis: 'minuman', bahanUtama: ['bubuk teh hijau', 'air panas', '-'], trivia: 'Berbeda dari teh hijau biasa, matcha memakai seluruh daun teh yang digiling halus, bukan hanya diseduh.' },
  { nama: 'Chai', negara: 'India', jenis: 'minuman', bahanUtama: ['teh hitam', 'susu', 'campuran rempah (kayu manis, kapulaga, jahe)'], trivia: "Kata 'chai' sendiri sebenarnya berarti 'teh' dalam banyak bahasa, sehingga istilah 'chai tea' sebenarnya berlebihan (teh teh)." },
  { nama: 'Espresso', negara: 'Italia', jenis: 'minuman', bahanUtama: ['biji kopi giling halus', 'air bertekanan tinggi', '-'], trivia: 'Teknik ekstraksi bertekanan tinggi ini pertama kali dipatenkan di Italia pada awal abad ke-20.' },
  { nama: 'Sangria', negara: 'Spanyol', jenis: 'minuman', bahanUtama: ['anggur merah', 'buah potong', 'gula dan soda'], trivia: "Namanya berasal dari kata 'sangre' (darah) dalam bahasa Spanyol, merujuk pada warna merahnya." },
  { nama: 'Mate', negara: 'Argentina', jenis: 'minuman', bahanUtama: ['daun yerba mate', 'air panas', 'labu khusus (calabash)'], trivia: 'Diminum bergantian dari satu wadah dan sedotan logam yang sama sebagai simbol kebersamaan sosial.' },
  { nama: 'Horchata', negara: 'Meksiko', jenis: 'minuman', bahanUtama: ['beras atau kacang tiger nut', 'air', 'kayu manis dan gula'], trivia: 'Versi horchata berbeda-beda di tiap negara, ada yang berbasis beras, ada pula yang berbasis kacang.' },
  { nama: 'Ayran', negara: 'Turki', jenis: 'minuman', bahanUtama: ['yogurt', 'air', 'garam'], trivia: 'Minuman yogurt asin ini populer di seluruh Timur Tengah dan Asia Tengah dengan nama berbeda-beda.' },
  { nama: 'Root Beer', negara: 'Amerika Serikat', jenis: 'minuman', bahanUtama: ['ekstrak akar sassafras', 'gula', 'air berkarbonasi'], trivia: "Awalnya dipromosikan sebagai minuman herbal 'penyembuh' pada akhir abad ke-19 sebelum jadi minuman soda populer." },
  { nama: 'Baijiu', negara: 'Tiongkok', jenis: 'minuman', bahanUtama: ['sorgum fermentasi', 'air', 'ragi khusus'], trivia: 'Minuman keras tradisional Tiongkok ini disebut-sebut sebagai minuman keras paling banyak dikonsumsi di dunia berdasarkan volume.' },
  { nama: 'Soju', negara: 'Korea Selatan', jenis: 'minuman', bahanUtama: ['beras atau umbi fermentasi', 'air', 'ragi'], trivia: 'Minuman beralkohol khas Korea ini sering diminum bersama saat makan malam sebagai bagian dari budaya sosial.' },
  { nama: 'Sake', negara: 'Jepang', jenis: 'minuman', bahanUtama: ['beras fermentasi', 'air', 'ragi koji'], trivia: "Meski sering disebut 'anggur beras', proses pembuatan sake sebenarnya lebih mirip pembuatan bir." },
  { nama: 'Croquembouche', negara: 'Prancis', jenis: 'kue/penutup', bahanUtama: ['choux pastry kecil', 'karamel', 'krim vla'], trivia: 'Kue menara ini secara tradisional disajikan pada acara pernikahan dan perayaan besar di Prancis.' },
  { nama: 'Macaron', negara: 'Prancis', jenis: 'kue/penutup', bahanUtama: ['tepung almon', 'putih telur', 'gula'], trivia: "Meski identik dengan Prancis, konon resep dasarnya dibawa dari Italia oleh Catherine de' Medici." },
  { nama: 'Churros', negara: 'Spanyol', jenis: 'kue/penutup', bahanUtama: ['adonan tepung', 'minyak goreng', 'gula dan kayu manis'], trivia: 'Sering disantap bersama cokelat panas kental sebagai sarapan atau camilan sore hari.' },
  { nama: 'Gelato', negara: 'Italia', jenis: 'kue/penutup', bahanUtama: ['susu', 'gula', 'perasa alami (buah/kacang)'], trivia: 'Gelato punya kadar lemak lebih rendah dan diaduk lebih lambat dibanding es krim biasa, membuat teksturnya lebih padat.' },
  { nama: 'Baguette', negara: 'Prancis', jenis: 'makanan utama', bahanUtama: ['tepung terigu', 'air dan ragi', 'garam'], trivia: 'Sejak 2022, keahlian membuat baguette tradisional diakui UNESCO sebagai warisan budaya takbenda.' },
  { nama: 'Pretzel Bavaria', negara: 'Jerman', jenis: 'jajanan', bahanUtama: ['adonan tepung', 'larutan alkali', 'garam kasar'], trivia: 'Bentuk pretzel Bavaria yang besar dan lembut berbeda dari pretzel kering ala Amerika.' },
  { nama: 'Currywurst Berlin', negara: 'Jerman', jenis: 'jajanan', bahanUtama: ['sosis panggang', 'saus kari tomat', 'bubuk kari'], trivia: 'Ada museum khusus di Berlin yang didedikasikan untuk sejarah hidangan jajanan ini.' },
  { nama: 'Bibingka', negara: 'Filipina', jenis: 'kue/penutup', bahanUtama: ['tepung beras ketan', 'santan', 'gula kelapa'], trivia: 'Secara tradisional dipanggang dalam loyang beralas daun pisang di atas bara api, khas hidangan musim Natal.' },
  { nama: 'Halo-Halo', negara: 'Filipina', jenis: 'kue/penutup', bahanUtama: ['es serut', 'campuran buah dan jeli', 'susu evaporasi'], trivia: "Namanya berarti 'campur-campur' dalam bahasa Tagalog, sesuai dengan isinya yang beraneka ragam." },
  { nama: 'Sinigang', negara: 'Filipina', jenis: 'sup/soto', bahanUtama: ['daging atau ikan', 'sayuran', 'kuah asam tamarin'], trivia: "Rasa asamnya yang khas membuat sinigang sering disebut sebagai 'sup nasional' Filipina." },
  { nama: 'Kaya Toast', negara: 'Singapura', jenis: 'makanan utama', bahanUtama: ['roti panggang', 'selai kaya (kelapa-telur)', 'mentega'], trivia: 'Biasa disantap bersama kopi hitam kental dan telur setengah matang sebagai sarapan khas Singapura.' },
  { nama: 'Chili Crab', negara: 'Singapura', jenis: 'makanan utama', bahanUtama: ['kepiting', 'saus cabai tomat', 'telur'], trivia: 'Dianggap sebagai salah satu hidangan nasional Singapura meski baru diciptakan pada 1950-an.' },
];

function norm(s) {
  return String(s || '').toLowerCase().trim();
}

function findKuliner(query) {
  const q = norm(query);
  if (!q) return null;
  let found = KULINER.find((k) => norm(k.nama) === q);
  if (found) return found;
  // Fuzzy fallback SATU ARAH saja: cocok kalau nama kuliner LENGKAP muncul di dalam query
  // (mis. "resep rendang enak dong" mengandung "rendang"). Arah sebaliknya (nama kuliner
  // mengandung query) SENGAJA tidak dipakai karena berisiko salah tangkap kata pendek yang
  // kebetulan jadi prefiks nama kuliner - mis. "chili" (negara Chile) jangan sampai
  // ketangkap ke "Chili Crab" hanya karena "chili crab".includes("chili").
  found = KULINER.find((k) => q.includes(norm(k.nama)));
  return found || null;
}

const PROFILE_OPENERS = ['', 'Setahu saya, ', 'Kalau tidak salah, ', 'Sepengetahuan saya, ', 'Setahu saya sih, '];

function composeKuliner(k, richness) {
  const opener = pickVariant('kuliner_opener', PROFILE_OPENERS, k.nama);
  const openerText = opener ? opener.charAt(0).toUpperCase() + opener.slice(1) : '';
  const base = openerText + k.nama + ' adalah ' + k.jenis + ' khas ' + k.negara + '.';
  if (richness === 'singkat') return base;
  return base + ' Bahan utamanya: ' + k.bahanUtama.join(', ') + '.\n\nTrivia: ' + k.trivia;
}

function tryProfil(text) {
  const m = text.match(/^(apa\s*itu|siapa\s*itu|ceritakan\s*tentang|apa\s*yang\s*kamu\s*tahu\s*tentang)\s+(.+?)\??$/i);
  if (!m) return null;
  const k = findKuliner(m[2]);
  if (!k) return null;
  return composeKuliner(k);
}

function tryBahan(text) {
  const m =
    text.match(/^bahan\s*(utama\s*)?(dari\s*)?(.+?)\s*apa\s*saja\??$/i) ||
    text.match(/^apa\s*saja\s*bahan\s*(utama\s*)?(dari\s*)?(.+?)\??$/i);
  if (!m) return null;
  const name = m[3] || m[2];
  const k = findKuliner(name);
  if (!k) return null;
  return 'Bahan utama ' + k.nama + ': ' + k.bahanUtama.join(', ') + '.';
}

function tryTrivia(text) {
  const m = text.match(/^(fakta\s+unik|trivia)\s+(tentang\s+|dari\s+)?(.+?)\??$/i);
  if (!m) return null;
  const k = findKuliner(m[3]);
  if (!k) return null;
  return 'Fakta unik tentang ' + k.nama + ': ' + k.trivia;
}

function tryAsal(text) {
  const m =
    text.match(/^(.+?)\s*(itu\s*)?(asalnya|berasal)\s*dari\s*mana\??$/i) ||
    text.match(/^dari\s*negara\s*mana\s*(.+?)\s*berasal\??$/i);
  if (!m) return null;
  const name = m[1];
  const k = findKuliner(name);
  if (!k) return null;
  return k.nama + ' berasal dari ' + k.negara + '.';
}

function tryKuliner(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  return tryBahan(t) || tryTrivia(t) || tryAsal(t) || tryProfil(t) || null;
}

export const kulinerStore = Object.freeze({
  KULINER,
  findKuliner,
  composeKuliner,
  tryProfil,
  tryBahan,
  tryTrivia,
  tryAsal,
  tryKuliner,
});
