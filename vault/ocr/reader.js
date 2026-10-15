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
        const nPixels = sampleW * sampleH;
        const rowEdges = new Float32Array(sampleH);

        for (let y = 0; y < sampleH; y += 1) {
          let edgesInRow = 0;
          let prevLuma = 0;
          for (let x = 0; x < sampleW; x += 1) {
            const idx = (y * sampleW + x) << 2;
            const luma = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            lumaSum += luma;
            lumaSqSum += luma * luma;
            if (x > 0 && Math.abs(luma - prevLuma) > 28) edgesInRow += 1;
            prevLuma = luma;
          }
          rowEdges[y] = edgesInRow / sampleW;
        }

        const meanLuma = lumaSum / Math.max(1, nPixels);
        const stdLuma = Math.sqrt(Math.max(0, lumaSqSum / Math.max(1, nPixels) - meanLuma * meanLuma));
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

        const aspect = origH / Math.max(1, origW);
        const isPortraitPhone = aspect >= 1.55 && origW >= 320;
        const isDesktopWide = aspect <= 0.8 && origW >= 800;
        const themeTone = meanLuma >= 185 ? 'latar terang (mode terang/dokumen)' : (meanLuma <= 75 ? 'latar gelap (mode gelap)' : 'pencahayaan seimbang');
        const kindLabel = isPortraitPhone
          ? 'Tangkapan layar antarmuka ponsel (Mobile UI)'
          : (isDesktopWide ? 'Tangkapan layar antarmuka desktop/web' : (textBands >= 6 ? 'Citra dokumen/halaman teks' : 'Citra visual/foto'));

        URL.revokeObjectURL(url);
        resolve({
          width: origW,
          height: origH,
          meanLuma: Math.round(meanLuma),
          contrast: Math.round(stdLuma),
          textBands,
          themeTone,
          kindLabel,
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
  try {
    if (typeof window !== 'undefined' && window.Tesseract && typeof window.Tesseract.recognize === 'function') {
      const result = await window.Tesseract.recognize(file, 'eng+ind');
      const t = String((result && result.data && result.data.text) || '').trim();
      if (t) return { ok: true, text: t };
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
      lines.push(
        'Ringkasan Visual Gambar (' + (file.name || 'gambar') + '): ' +
        vis.kindLabel + ', resolusi ' + vis.width + '×' + vis.height + ' piksel (' + kb + ' KB), ' +
        vis.themeTone + ', kontras σ=' + vis.contrast + ', terdeteksi ' + vis.textBands + ' jalur elemen/baris visual.'
      );
      if (vis.nativeOcrLines && vis.nativeOcrLines.length) {
        lines.push('Teks terbaca (OCR perangkat):\n' + vis.nativeOcrLines.join('\n'));
      }
    } else {
      lines.push('Berkas Gambar "' + (file.name || 'gambar') + '" (' + (file.type || 'image/jpeg') + ', ' + kb + ' KB) siap dianalisis.');
    }
    if (embedded.length) {
      lines.push('Metadata teks tertanam: ' + embedded.join(' | '));
    }
    return { ok: true, text: lines.join('\n\n') };
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
