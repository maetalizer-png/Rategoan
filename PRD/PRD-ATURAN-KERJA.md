# PRD — Aturan Kerja: Larangan & Warning Lintas Sektor

Status: berlaku untuk SEMUA pekerjaan di repo ini, bukan cuma
`PRD-RAGET-TEMPLATE.md`/`PRD-RAGET-NEURAL.md`. Dokumen ini ada karena
preseden nyata: sebuah folder adapter/router tambahan (`raget-llm-lokal/`)
pernah dibangun penuh (kontrak adapter, router, dokumentasi) yang
memperlakukan proyek ini seolah punya 3 mesin AI terpisah, padahal
RATEGOAN sejak awal cuma satu LLM lokal miliknya sendiri (RAGET, yang
sudah terbagi jadi dua bagian: Template dan Neural — bukan tiga mesin
berbeda). Folder itu dibangun tanpa konfirmasi arah dulu ke pemilik
produk, tidak menambah kemampuan nyata di luar yang sudah ada di RAGET
Neural, dan akhirnya harus dihapus lagi karena cuma menambah lapisan
membingungkan. Aturan di bawah ada supaya kejadian serupa tidak
terulang, dan supaya campur-aduk sektor tidak menyebabkan regresi yang
tidak diketahui.

## 1. Definisi sektor kerja

| Sektor | Cakupan file |
|---|---|
| **Template** | `raget/raget-template/`, mesin-mesin rule-based di `raget-agents/` (math, bilingual, stem, social, context, dst — bukan router/kontrak) |
| **Neural** | `raget/raget-neural/`, skrip training/eval terkait di `raget-tools/` |
| **Data** | `raget/raget-data/`, `raget/raget-devlog/` |
| **Infra Bersama** | `raget-agents/engine-router.js`, `engine-contract.js`, `agent.js` (orkestrator), `raget-memory/`, `raget-database/`, `raget-retrieval/` |
| **UI/UX** | `js/`, `css/`, `index.html`, `vault/`, `fitur/` |
| **Tooling** | `raget-tools/` (di luar skrip training/eval Neural) |
| **Dokumentasi** | `docs/`, `README.md`, `PRD/` |

Satu sesi kerja = SATU sektor sebagai fokus utama. Kalau tugas secara
alami butuh menyentuh Infra Bersama (karena definisinya dipakai kedua
otak), itu WARNING (§3), bukan larangan — tapi harus dinyatakan
eksplisit, bukan diam-diam.

## 2. DILARANG (pelanggaran keras, jangan dilakukan)

1. **Dilarang** mengubah file di sektor lain di luar yang sedang
   dikerjakan tanpa instruksi eksplisit — termasuk perubahan yang
   "kelihatannya kecil/tidak berbahaya". Kalau sedang fokus Template,
   JANGAN sentuh `raget-neural/` sama sekali kecuali diminta, begitu
   juga sebaliknya.
2. **Dilarang** membuat folder/konsep arsitektur baru (folder mesin baru,
   adapter baru, lapisan baru) tanpa konfirmasi eksplisit dari pemilik
   produk lebih dulu. Preseden: `raget-llm-lokal/` harus dihapus lagi
   karena dibangun tanpa konfirmasi arah, memperlakukan proyek seolah
   punya mesin AI ketiga padahal LLM lokal proyek ini ya RAGET itu
   sendiri (Template + Neural, dua bagian dari satu hal yang sama,
   bukan dua mesin di antara tiga).
3. **Dilarang** mengklaim pekerjaan "selesai" tanpa bukti nyata:
   `node raget/raget-tools/lint-check.mjs` WAJIB LOLOS 0 error, DAN
   untuk perubahan yang memengaruhi jawaban/UI WAJIB diverifikasi lewat
   Playwright hidup (bukan diasumsikan benar dari baca kode saja).
4. **Dilarang** memotong pekerjaan di tengah jalan lalu melapor sebagian
   ketika diminta "satu perintah, satu hasil tuntas". Kalau memang harus
   berhenti (butuh keputusan produk, batasan teknis nyata), WAJIB
   nyatakan itu dengan jelas dan alasannya — bukan diam-diam berhenti
   atau melapor seolah-olah selesai.
5. **Dilarang** mengubah default behavior yang terlihat pengguna (flag
   aktif/nonaktif, pilihan default di UI, dst) di luar task yang
   diminta secara eksplisit.
6. **Dilarang** menghapus atau menimpa pekerjaan kolaborator lain
   (commit yang sudah di-push orang/proses lain) tanpa `git fetch` +
   pengecekan riwayat dulu — selalu rebase, jangan force-push tanpa
   alasan yang dikonfirmasi.

## 3. WARNING (boleh dikerjakan, tapi wajib hati-hati + dinyatakan eksplisit)

1. Mengubah file **Infra Bersama** (`engine-router.js`,
   `engine-contract.js`, `agent.js`) — secara definisi menyentuh
   Template & Neural sekaligus. WARNING: boleh, tapi WAJIB disebutkan
   eksplisit di laporan akhir ("saya sentuh file bersama X karena Y").
2. Mengubah skema data lintas-domain di `raget-data/json/` — berisiko
   merusak retrieval/tag di domain lain yang tidak sedang jadi fokus.
   Selalu cek referensi (`grep`) sebelum mengubah struktur field.
3. Menghapus file/folder — cek dulu apakah masih direferensikan di
   tempat lain (`grep -rl` nama file/folder) sebelum menghapus, bukan
   asumsi "kelihatannya tidak dipakai".
4. Mengubah dokumentasi (README/ARSITEKTUR.md/PRD) SAMBIL mengerjakan
   sektor lain — sebaiknya dipisah jadi commit/langkah sendiri supaya
   jelas mana perubahan kode vs perubahan dokumentasi.
5. Retag/reklasifikasi data dalam jumlah besar (>50 entri sekaligus) —
   WAJIB spot-check manual sampel acak sebelum commit (preseden: entri
   "Gaji belum" sempat salah retag ke bucket `tetangga` padahal soal
   kerja/uang, ketahuan lewat spot-check manual, bukan otomatis).

## 4. Kriteria "SELESAI, boleh pindah sektor"

Sebuah unit kerja baru boleh dianggap selesai (dan baru boleh pindah
fokus ke sektor lain) kalau SEMUA berikut terpenuhi:

- [ ] `lint-check.mjs` LOLOS, 0 error.
- [ ] Kalau menyentuh jawaban/UI: live Playwright test dengan skenario
      nyata dijalankan, 0 error konsol/network.
- [ ] Tidak ada regresi terverifikasi di sektor lain (spot-check
      singkat minimal beberapa query/alur kunci).
- [ ] Perubahan sudah di-commit (dan di-push kalau diminta), atau
      dinyatakan jelas kenapa belum.

Kalau salah satu belum terpenuhi, TETAP di sektor yang sama sampai
terpenuhi — jangan pindah ke sektor/tugas lain di tengah jalan.

## 5. Pengecualian

Kalau ADA PERINTAH LAIN eksplisit dari pemilik produk di tengah jalan,
boleh pindah fokus. Tapi sebelum pindah, WAJIB nyatakan status
pekerjaan yang ditinggalkan (selesai/belum, apa yang tertunda) supaya
tidak hilang jejak dan tidak ada pekerjaan setengah jadi yang terlupakan.

## 6. Kenapa aturan ini penting (konteks jujur)

Riwayat proyek ini sempat membangun lapisan adapter/router tambahan
(`raget-llm-lokal/`) lengkap dengan kontrak adapter dan dokumentasi
289-baris yang memperlakukan proyek seolah punya 3 mesin AI berbeda,
hanya untuk kemudian dibongkar lagi karena LLM lokal RATEGOAN memang
cuma satu — RAGET sendiri, yang terbagi jadi Template (rule-based) dan
Neural (transformer dari nol) — bukan tiga sistem terpisah, dan lapisan
tambahan itu tidak pernah membawa model/kemampuan lain di luar RAGET.
Ini bukan salah satu pihak — ini akibat langsung dari membangun
struktur besar tanpa memastikan arahnya benar-benar disepakati dulu,
dan tanpa menjaga fokus satu sektor per waktu. Aturan di dokumen ini
ada supaya biaya (waktu, token, kepercayaan) dari kesalahan seperti itu
tidak terulang.
