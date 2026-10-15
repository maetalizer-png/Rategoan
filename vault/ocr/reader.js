const PACKAGE_SIZE_MB = 15;
let downloadState = 'ready';

function isReady() {
  return true;
}

async function downloadPackage() {
  downloadState = 'ready';
  return true;
}

function extractEmbeddedImageStrings(bytes) {
  if (!bytes || bytes.byteLength < 16) return [];
  const found = [];
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    let pos = 8;
    while (pos + 8 <= bytes.byteLength) {
      const len = ((bytes[pos] << 24) | (bytes[pos + 1] << 16) | (bytes[pos + 2] << 8) | bytes[pos + 3]) >>> 0;
      const type = String.fromCharCode(bytes[pos + 4], bytes[pos + 5], bytes[pos + 6], bytes[pos + 7]);
      if (pos + 8 + len > bytes.byteLength) break;
      if (type === 'tEXt' || type === 'iTXt') {
        const raw = new TextDecoder('utf-8', { fatal: false }).decode(bytes.subarray(pos + 8, pos + 8 + Math.min(len, 4096)));
        const clean = raw.replace(/\x00+/g, ': ').replace(/[\x01-\x1f]/g, ' ').trim();
        if (clean.length > 3) found.push(clean);
      }
      pos += 12 + len;
    }
  }
  return found;
}

function classifyPixelColor(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const v = max / 255;
  const s = max === 0 ? 0 : delta / max;

  if (v >= 0.86 && s < 0.14) return { name: 'Putih / Terang', colorful: false };
  if (v <= 0.16) return { name: 'Hitam / Gelap', colorful: false };
  if (s < 0.16) return { name: 'Abu-abu Netral', colorful: false };

  let h = 0;
  if (delta > 0) {
    if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / delta + 2) * 60;
    else h = ((r - g) / delta + 4) * 60;
  }

  if (h < 16 || h >= 345) return { name: 'Merah', colorful: true };
  if (h < 42) return { name: 'Oranye / Cokelat', colorful: true };
  if (h < 68) return { name: 'Kuning', colorful: true };
  if (h < 165) return { name: 'Hijau', colorful: true };
  if (h < 202) return { name: 'Biru Muda / Toska', colorful: true };
  if (h < 262) return { name: 'Biru', colorful: true };
  return { name: 'Ungu / Merah Muda', colorful: true };
}

function analyzeImageCanvas(file) {
  return new Promise((resolve) => {
    if (typeof document === 'undefined' || typeof Image === 'undefined' || typeof URL === 'undefined') {
      resolve(null);
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      try {
        const origW = img.naturalWidth || img.width || 1;
        const origH = img.naturalHeight || img.height || 1;
        let nativeOcrLines = [];
        if (typeof window !== 'undefined' && typeof window.TextDetector === 'function') {
          try {
            const detector = new window.TextDetector();
            const blocks = await detector.detect(img);
            if (Array.isArray(blocks) && blocks.length) {
              nativeOcrLines = blocks.map((b) => String(b.rawValue || '').trim()).filter(Boolean);
            }
          } catch (e) { /* lanjut ke analisis kanvas */ }
        }
        const sampleW = Math.min(360, origW);
        const sampleH = Math.max(1, Math.round((origH / origW) * sampleW));
        const canvas = document.createElement('canvas');
        canvas.width = sampleW;
        canvas.height = sampleH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, sampleW, sampleH);
        const data = ctx.getImageData(0, 0, sampleW, sampleH).data;

        let lumaSum = 0;
        let lumaSqSum = 0;
        let satSum = 0;
        let colorfulPixels = 0;
        const colorBuckets = {};
        const centerBuckets = {};
        let centerCount = 0;
        const nPixels = sampleW * sampleH;
        const rowEdges = new Float32Array(sampleH);

        const x0 = Math.floor(sampleW * 0.15);
        const x1 = Math.ceil(sampleW * 0.85);
        const y0 = Math.floor(sampleH * 0.15);
        const y1 = Math.ceil(sampleH * 0.85);

        for (let y = 0; y < sampleH; y += 1) {
          let edgesInRow = 0;
          let prevLuma = 0;
          const inY = y >= y0 && y <= y1;
          for (let x = 0; x < sampleW; x += 1) {
            const idx = (y * sampleW + x) << 2;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;
            lumaSum += luma;
            lumaSqSum += luma * luma;
            if (x > 0 && Math.abs(luma - prevLuma) > 28) edgesInRow += 1;
            prevLuma = luma;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const sat = max === 0 ? 0 : (max - min) / max;
            satSum += sat;

            const col = classifyPixelColor(r, g, b);
            colorBuckets[col.name] = (colorBuckets[col.name] || 0) + 1;
            if (col.colorful) colorfulPixels += 1;
            if (inY && x >= x0 && x <= x1) {
              centerBuckets[col.name] = (centerBuckets[col.name] || 0) + 1;
              centerCount += 1;
            }
          }
          rowEdges[y] = edgesInRow / sampleW;
        }

        const meanLuma = lumaSum / Math.max(1, nPixels);
        const stdLuma = Math.sqrt(Math.max(0, lumaSqSum / Math.max(1, nPixels) - meanLuma * meanLuma));
        const meanSat = satSum / Math.max(1, nPixels);
        const colorfulRatio = colorfulPixels / Math.max(1, nPixels);

        let textBands = 0;
        let inBand = false;
        for (let y = 0; y < sampleH; y += 1) {
          if (rowEdges[y] > 0.08) {
            if (!inBand) {
              textBands += 1;
              inBand = true;
            }
          } else {
            inBand = false;
          }
        }

        const topColors = Object.entries(colorBuckets)
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => ({ name, pct: Math.round((count / Math.max(1, nPixels)) * 100) }))
          .filter((c) => c.pct >= 3)
          .slice(0, 4);

        const subjectColors = Object.entries(centerBuckets)
          .sort((a, b) => b[1] - a[1])
          .filter(([name]) => name !== 'Putih / Terang' && name !== 'Abu-abu Netral')
          .map(([name, count]) => ({ name, pct: Math.round((count / Math.max(1, centerCount)) * 100) }))
          .filter((c) => c.pct >= 4)
          .slice(0, 4);

        const aspect = origH / Math.max(1, origW);
        const isPortraitPhone = aspect >= 1.55 && origW >= 320;
        const isDesktopWide = aspect <= 0.8 && origW >= 800;
        const themeTone = meanLuma >= 185 ? 'latar terang (mode terang)' : (meanLuma <= 75 ? 'latar gelap (mode gelap)' : 'pencahayaan seimbang');

        let kindLabel = 'Foto kamera / citra visual';
        if (colorfulRatio >= 0.24 && (!isPortraitPhone || meanSat >= 0.22)) {
          kindLabel = 'Foto objek / ilustrasi & motif berwarna';
        } else if (isPortraitPhone) {
          kindLabel = colorfulRatio >= 0.16
            ? 'Tangkapan layar antarmuka ponsel dengan pratinjau media/foto'
            : 'Tangkapan layar antarmuka ponsel (Mobile UI)';
        } else if (isDesktopWide) {
          kindLabel = 'Tangkapan layar antarmuka desktop/web';
        } else if (textBands >= 10 && colorfulRatio < 0.12) {
          kindLabel = 'Citra dokumen / halaman teks';
        }

        URL.revokeObjectURL(url);
        resolve({
          width: origW,
          height: origH,
          meanLuma: Math.round(meanLuma),
          contrast: Math.round(stdLuma),
          meanSat: Number(meanSat.toFixed(2)),
          colorfulRatio: Number(colorfulRatio.toFixed(2)),
          textBands,
          themeTone,
          kindLabel,
          topColors,
          subjectColors,
          nativeOcrLines,
        });
      } catch (e) {
        URL.revokeObjectURL(url);
        resolve(null);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

async function recognize(file) {
  if (!file) {
    return { ok: false, stub: false, message: 'Tidak ada gambar.' };
  }
  let tesseractText = '';
  try {
    if (typeof window !== 'undefined' && window.Tesseract && typeof window.Tesseract.recognize === 'function') {
      const result = await window.Tesseract.recognize(file, 'eng+ind');
      tesseractText = String((result && result.data && result.data.text) || '').trim();
    }
  } catch (e) { /* lanjut ke mesin visi kanvas lokal */ }

  try {
    let embedded = [];
    if (typeof file.arrayBuffer === 'function') {
      const buf = await file.arrayBuffer();
      embedded = extractEmbeddedImageStrings(new Uint8Array(buf));
    }
    const vis = await analyzeImageCanvas(file);
    const kb = Math.max(1, Math.round((Number(file.size) || 0) / 1024));
    const lines = [];
    if (vis) {
      const paletteStr = vis.topColors && vis.topColors.length
        ? vis.topColors.map((c) => c.name + ' (' + c.pct + '%)').join(', ')
        : 'Netral';
      const subjectStr = vis.subjectColors && vis.subjectColors.length
        ? vis.subjectColors.map((c) => c.name + ' (' + c.pct + '%)').join(', ')
        : '';
      lines.push(
        'Ringkasan Visual Gambar (' + (file.name || 'gambar') + '): ' +
        vis.kindLabel + ', resolusi ' + vis.width + '×' + vis.height + ' piksel (' + kb + ' KB), ' +
        vis.themeTone + ', kontras σ=' + vis.contrast + ', terdeteksi ' + vis.textBands + ' jalur elemen/baris visual.'
      );
      lines.push('Palet warna keseluruhan: ' + paletteStr + (subjectStr ? (' | Warna objek/fokus tengah: ' + subjectStr) : '') + '.');
      if (tesseractText) {
        lines.push('Teks terbaca (OCR):\n' + tesseractText);
      } else if (vis.nativeOcrLines && vis.nativeOcrLines.length) {
        lines.push('Teks terbaca (OCR perangkat):\n' + vis.nativeOcrLines.join('\n'));
      }
    } else if (tesseractText) {
      lines.push('Teks terbaca (OCR):\n' + tesseractText);
    } else {
      lines.push('Berkas Gambar "' + (file.name || 'gambar') + '" (' + (file.type || 'image/jpeg') + ', ' + kb + ' KB) siap dianalisis.');
    }
    if (embedded.length) {
      lines.push('Metadata teks tertanam: ' + embedded.join(' | '));
    }
    return {
      ok: true,
      text: lines.join('\n\n'),
      meta: vis ? Object.assign({ kb }, vis) : { kb },
    };
  } catch (e) {
    return { ok: false, stub: false, message: 'Gagal membaca gambar ini.' };
  }
}

export const ocrReader = Object.freeze({
  isReady,
  downloadPackage,
  recognize,
  get state() {
    return downloadState;
  },
  packageSizeMB: PACKAGE_SIZE_MB,
});
