const CLIMATE_BY_REGION = {
  asean: { tipe: 'Tropis', desc: 'Panas & lembap sepanjang tahun, musim hujan November-Maret.', pakaian: ['Pakaian tipis & menyerap keringat', 'Payung/jas hujan ringan', 'Sandal nyaman'] },
  asia: { tipe: 'Campuran', desc: 'Bervariasi dari tropis hingga empat musim tergantung sub-wilayah.', pakaian: ['Cek musim spesifik negara tujuan', 'Bawa lapisan (layering)'] },
  eropa: { tipe: 'Empat Musim', desc: 'Musim dingin bisa sangat dingin, musim panas sejuk-hangat.', pakaian: ['Jaket hangat/coat', 'Syal & sarung tangan (musim dingin)', 'Payung lipat'] },
  afrika: { tipe: 'Gurun & Tropis', desc: 'Panas kering di utara, tropis lembap di khatulistiwa & selatan.', pakaian: ['Tabir surya SPF tinggi', 'Topi lebar', 'Pakaian longgar menutup kulit'] },
  amerika: { tipe: 'Campuran', desc: 'Beragam dari tropis (Amerika Tengah/Selatan) hingga empat musim (Amerika Utara).', pakaian: ['Cek musim spesifik negara tujuan', 'Bawa lapisan (layering)'] },
  osenia: { tipe: 'Tropis & Sedang', desc: 'Pesisir tropis, pedalaman lebih kering.', pakaian: ['Tabir surya', 'Pakaian ringan', 'Jaket tipis untuk malam'] },
  lain: { tipe: 'Beragam', desc: 'Data iklim spesifik belum tersedia untuk wilayah ini.', pakaian: ['Cek prakiraan cuaca sebelum berangkat'] },
};

export function climateFor(regionKey) {
  return CLIMATE_BY_REGION[regionKey] || CLIMATE_BY_REGION.lain;
}

export function climateCard(regionKey) {
  const c = climateFor(regionKey);
  return '<div class="sec">Iklim (' + c.tipe + ')</div><div class="card"><p class="desc">' + c.desc + '</p>' +
    '<div class="tags">' + c.pakaian.map((p) => '<span class="tag">' + p + '</span>').join('') + '</div></div>';
}
