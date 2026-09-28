# Pengembangan Rategoan — rangkuman wajib

Satu file app. Data korpus = tag Release + `PRD-GROK-BUILD.md`, bukan file ini.

Vercel = panggung bangun. Rumah akhir = server sendiri. Bukan chat mainan.
Dua otak milik sendiri: **Raget Template** + **Raget 1.0** (dulu Neural). Dilarang semat model pihak lain.
Rak K1–K4 + audio tetap di GitHub Release. App tidak menelan gzip rak.

---

## A. Yang wajib ada (kerangka)

| Mesin | Fungsi | Status |
|---|---|---|
| Otak Template | Jawaban pasti (aturan + JSON templat) | Ada, jalan |
| Otak Raget 1.0 | Checkpoint neural sendiri | Ada; mutu jawaban **belum** koheren |
| Perencana | Rute: obrol / web / slide / koleksi / pikir / riset / belajar / proyek | Ada (`flow-hub`, `turn-pipeline`) — masih overlap intent lama |
| Bahan | File, kamera, wiki/web, koleksi, chat | Ada |
| Perangkai | Gabung bahan jadi jawaban dalam | Kerangka `mesin.compose` ada; **isi masih dangkal** (wiki 1 halaman) |
| Kanvas | Panel kanan slide + sunting + PPTX + daftar artefak | Ada |
| Ingat | Fakta/catatan + projectId | Ada |
| Belajar terpandu | Pecah bahan jadi langkah | Ada, dari jawaban yang sudah ada |
| Proyek | Isolasi chat/koleksi/riwayat | Ada (sheet, bukan prompt) |
| Jadwal | Antrian lokal + pengingat perangkat | Antrian `mesin.queueJob` + reminder lama; **kirim keluar belum** |
| Konektor | Drive / WA / plugin | Port `mesin.serverCall` saja. **Belum hidup** |
| Studio kode | Parser + jalanin kode | **Belum** |
| Server app | Host inferensi + konektor + korpus jauh | **Belum** — nanti `mesin.setServerBase` |

Jangan dibangun di dalam Raget: generate gambar/video/musik pihak lain, community, toko plugin.

---

## B. Ceklis UI / pintu (yang pengguna lihat)

- [x] Chat, riwayat, cari riwayat
- [x] Unggah kamera / foto / file
- [x] Saklar Pencarian Web
- [x] Buat Slide + panel kanan + unduh PPTX
- [x] Koleksi + simpan hasil web
- [x] Tanya koleksi (perintah teks)
- [x] Saklar Berpikir lebih keras
- [x] Saklar Riset mendalam (rencana + web)
- [x] Sidebar Proyek + sheet daftar/buat
- [x] Masukkan ke proyek
- [x] Sidebar Artefak (daftar slide)
- [x] Belajar terpandu (tombol + perintah)
- [x] Model: Raget Template / Raget 1.0 — tanpa catatan eksperimen
- [x] Login: tanpa teks “nama tampilan lokal / tidak diverifikasi”
- [x] Toast acak online/offline / error mentah dimatikan
- [ ] Daftar artefak selain slide (laporan, kode)
- [ ] Notebook proyek (halaman penuh, bukan sheet)
- [ ] Sitasi web setara app lain (banyak sumber, bukan wiki saja)

---

## C. Yang perlu disempurnakan (bukan fitur baru)

1. **Perangkai web** — sekarang Wikipedia + QC. Harus multi-kutipan, paragraf utuh, tanpa bocoran HTML. Ini gap terbesar vs Gemini/Claude/ChatGPT.
2. **Berpikir** — masih 3–4 baris template. Bukan nalar.
3. **Riset** — rencana + 1 kali wiki. Bukan 5–8 sumber.
4. **Raget 1.0** — checkpoint jalan, kalimat sering acak. Sempurna lewat rak K1–K3 + latih, bukan ganti UI.
5. **Perencana** — `router-intent` + `turn-pipeline` + `flow-hub` + `agent-tools` tumpang tindih. Satukan pelan-pelan, jangan hapus tool lama.
6. **State pecah** — sesi, koleksi, proyek, artefak, memori, outbox: lima kunci storage. Nanti satu API server.
7. **K2 kemasan ≤1,5 GB** — K1/K3 masih part ~400 MB. Perintah ada di Release `PRD-GROK-BUILD.md`. Bukan tugas UI.

---

## D. Data (pisah dari app, wajib tetap jalan)

Angka resmi git 28 Sep 16:22:
K1 7.590.198 dok / 2.244.713.763 BPE  
K2 2.717.091 dok / 434.724.058 BPE  
K3 81.360.713 dok / 15.881.116.382 BPE  
Total 18.560.554.203 BPE

Alur: mentah → penampung → QC → rak ≤1,5 GB/file. Jangan pangkas topik. Jangan hapus tag penampung. Segel tag = git.

- [x] Tiga rak + K4 + audio di Release
- [x] K2 sortir template + segel disamakan
- [ ] QC lanjut K1/K3 + kemas file 1,0–1,5 GB (Grok Build / Release)
- [ ] Raget 1.0 dilatih ulang dari rak sampai koheren

---

## E. Urutan kerja (jangan loncat)

1. Sempurnakan perangkai + rute (C1, C5) tanpa merusak Template.
2. QC + kemas rak (D) — perintah Release.
3. Latih 1.0 dari rak (C4).
4. Server sendiri → konektor + outbox + nanti korpus jauh (A konektor).
5. Studio kode setelah 1–3 stabil.

Ganti server: `mesin.setServerBase('https://…')`. Jangan rombak UI.
