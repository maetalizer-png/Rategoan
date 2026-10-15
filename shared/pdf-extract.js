const MAX_CHARS = 40000;
const MAX_STREAMS = 240;

function decodeLiteralPdfString(raw) {
  let out = '';
  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i];
    if (ch !== '\\') {
      out += ch;
      continue;
    }
    i += 1;
    if (i >= raw.length) break;
    const next = raw[i];
    if (next === 'n') out += '\n';
    else if (next === 'r') out += '\r';
    else if (next === 't') out += '\t';
    else if (next === 'b') out += '\b';
    else if (next === 'f') out += '\f';
    else if (next === '(' || next === ')' || next === '\\') out += next;
    else if (next >= '0' && next <= '7') {
      let oct = next;
      if (i + 1 < raw.length && raw[i + 1] >= '0' && raw[i + 1] <= '7') {
        oct += raw[++i];
        if (i + 1 < raw.length && raw[i + 1] >= '0' && raw[i + 1] <= '7') {
          oct += raw[++i];
        }
      }
      out += String.fromCharCode(parseInt(oct, 8));
    } else if (next === '\r' || next === '\n') {
      if (next === '\r' && raw[i + 1] === '\n') i += 1;
    } else {
      out += next;
    }
  }
  if (out.length >= 2 && out.charCodeAt(0) === 0xfe && out.charCodeAt(1) === 0xff) {
    let u16 = '';
    for (let j = 2; j + 1 < out.length; j += 2) {
      const code = (out.charCodeAt(j) << 8) | out.charCodeAt(j + 1);
      if (code > 0) u16 += String.fromCharCode(code);
    }
    return u16;
  }
  return out;
}

function decodeHexPdfString(hexStr, cmap) {
  const clean = String(hexStr || '').replace(/[^0-9a-fA-F]/g, '');
  if (!clean) return '';
  if (cmap && cmap.size > 0) {
    const keyLens = [4, 2];
    for (const kLen of keyLens) {
      if (clean.length % kLen === 0) {
        let mapped = '';
        let hits = 0;
        for (let i = 0; i < clean.length; i += kLen) {
          const code = parseInt(clean.slice(i, i + kLen), 16);
          if (cmap.has(code)) {
            mapped += cmap.get(code);
            hits += 1;
          } else if (code >= 32 && code <= 126) {
            mapped += String.fromCharCode(code);
          }
        }
        if (hits > 0) return mapped;
      }
    }
  }
  if (clean.startsWith('feff') || clean.startsWith('FEFF')) {
    let out = '';
    for (let i = 4; i + 3 < clean.length; i += 4) {
      const code = parseInt(clean.slice(i, i + 4), 16);
      if (code > 0) out += String.fromCharCode(code);
    }
    return out;
  }
  let out = '';
  for (let i = 0; i + 1 < clean.length; i += 2) {
    const code = parseInt(clean.slice(i, i + 2), 16);
    if (code >= 32 && code <= 255) out += String.fromCharCode(code);
  }
  return out;
}

function parseToUnicodeCmap(streamText, cmap) {
  if (!/beginbfchar|beginbfrange/.test(streamText)) return;
  const charBlocks = streamText.match(/beginbfchar[\s\S]*?endbfchar/g) || [];
  charBlocks.forEach((blk) => {
    const pairs = blk.match(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g) || [];
    pairs.forEach((pair) => {
      const m = pair.match(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/);
      if (!m) return;
      const src = parseInt(m[1], 16);
      const dstHex = m[2];
      let str = '';
      for (let i = 0; i + 3 < dstHex.length; i += 4) {
        str += String.fromCharCode(parseInt(dstHex.slice(i, i + 4), 16));
      }
      if (!str && dstHex.length === 2) str = String.fromCharCode(parseInt(dstHex, 16));
      if (str) cmap.set(src, str);
    });
  });
  const rangeBlocks = streamText.match(/beginbfrange[\s\S]*?endbfrange/g) || [];
  rangeBlocks.forEach((blk) => {
    const ranges = blk.match(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g) || [];
    ranges.forEach((r) => {
      const m = r.match(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/);
      if (!m) return;
      const start = parseInt(m[1], 16);
      const end = Math.min(start + 256, parseInt(m[2], 16));
      let dst = parseInt(m[3], 16);
      for (let code = start; code <= end; code += 1, dst += 1) {
        cmap.set(code, String.fromCharCode(dst));
      }
    });
  });
}

async function decompressFlate(slice) {
  const Stream = globalThis.DecompressionStream;
  if (typeof Stream !== 'function') return null;
  for (const fmt of ['deflate', 'deflate-raw']) {
    try {
      const ds = new Stream(fmt);
      const writer = ds.writable.getWriter();
      writer.write(slice).catch(() => {});
      writer.close().catch(() => {});
      const reader = ds.readable.getReader();
      const chunks = [];
      let total = 0;
      while (true) {
        const step = await reader.read();
        if (step.done) break;
        if (step.value) {
          chunks.push(step.value);
          total += step.value.byteLength;
          if (total > 1024 * 1024) break;
        }
      }
      if (total > 0) {
        const merged = new Uint8Array(total);
        let offset = 0;
        for (const c of chunks) {
          merged.set(c, offset);
          offset += c.byteLength;
        }
        return new TextDecoder('latin1').decode(merged);
      }
    } catch (e) {
      /* coba format berikutnya */
    }
  }
  return null;
}

function extractTextFromContentStream(streamText, cmap) {
  const out = [];
  const btBlocks = streamText.match(/BT[\s\S]*?ET/g) || [streamText];
  for (let b = 0; b < btBlocks.length; b += 1) {
    const blk = btBlocks[b];
    const tokenRe = /\[((?:[^[\]]|\([^)]*\))*)\]\s*TJ|\(((?:[^()\\]|\\.)*)\)\s*(?:Tj|'|")|<([0-9a-fA-F]+)>\s*Tj|\b(T\*|TD|Td)\b/g;
    let line = '';
    let match;
    while ((match = tokenRe.exec(blk)) !== null) {
      if (match[1] !== undefined) {
        const arr = match[1];
        const partRe = /\(((?:[^()\\]|\\.)*)\)|<([0-9a-fA-F]+)>|(-?\d+(?:\.\d+)?)/g;
        let pm;
        while ((pm = partRe.exec(arr)) !== null) {
          if (pm[1] !== undefined) {
            line += decodeLiteralPdfString(pm[1]);
          } else if (pm[2] !== undefined) {
            line += decodeHexPdfString(pm[2], cmap);
          } else if (pm[3] !== undefined) {
            const kern = parseFloat(pm[3]);
            if (kern < -160 && !line.endsWith(' ')) line += ' ';
          }
        }
      } else if (match[2] !== undefined) {
        line += decodeLiteralPdfString(match[2]);
      } else if (match[3] !== undefined) {
        line += decodeHexPdfString(match[3], cmap);
      } else if (match[4] !== undefined) {
        if (line.trim()) {
          out.push(line.trim());
          line = '';
        }
      }
    }
    if (line.trim()) out.push(line.trim());
  }
  return out.join('\n');
}

export async function extractPdfText(arrayBuffer) {
  const bytes = arrayBuffer instanceof Uint8Array
    ? arrayBuffer
    : new Uint8Array(arrayBuffer || new ArrayBuffer(0));
  if (bytes.byteLength < 8) return '';
  const rawLatin = new TextDecoder('latin1').decode(bytes);
  if (!rawLatin.startsWith('%PDF-')) {
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes).slice(0, MAX_CHARS).trim();
  }
  const pageMatches = rawLatin.match(/\/Type\s*\/Page\b(?!s)/g);
  const pageCount = pageMatches ? pageMatches.length : 1;

  const cmap = new Map();
  const decodedStreams = [];
  let searchPos = 0;
  let streamCount = 0;

  while (streamCount < MAX_STREAMS && searchPos < rawLatin.length) {
    const streamIdx = rawLatin.indexOf('stream', searchPos);
    if (streamIdx < 0) break;
    const before = rawLatin.slice(Math.max(0, streamIdx - 320), streamIdx);
    if (!/>>\s*$/.test(before)) {
      searchPos = streamIdx + 6;
      continue;
    }
    let dataStart = streamIdx + 6;
    if (rawLatin[dataStart] === '\r' && rawLatin[dataStart + 1] === '\n') dataStart += 2;
    else if (rawLatin[dataStart] === '\n' || rawLatin[dataStart] === '\r') dataStart += 1;

    const endIdx = rawLatin.indexOf('endstream', dataStart);
    if (endIdx < 0) break;
    searchPos = endIdx + 9;
    streamCount += 1;

    let dataEnd = endIdx;
    if (rawLatin[dataEnd - 2] === '\r' && rawLatin[dataEnd - 1] === '\n') dataEnd -= 2;
    else if (rawLatin[dataEnd - 1] === '\n' || rawLatin[dataEnd - 1] === '\r') dataEnd -= 1;
    if (dataEnd <= dataStart) continue;

    const isFlate = /\/FlateDecode\b|\/Fl\b/.test(before);
    const isImage = /\/Subtype\s*\/Image\b/.test(before);
    if (isImage) continue;

    const slice = bytes.subarray(dataStart, dataEnd);
    let content = null;
    if (isFlate) {
      content = await decompressFlate(slice);
    } else {
      content = rawLatin.slice(dataStart, dataEnd);
    }
    if (!content) continue;
    parseToUnicodeCmap(content, cmap);
    decodedStreams.push(content);
  }

  const chunks = [];
  const titleMatch = rawLatin.match(/\/Title\s*\(((?:[^()\\]|\\.)*)\)/);
  const authorMatch = rawLatin.match(/\/Author\s*\(((?:[^()\\]|\\.)*)\)/);
  if (titleMatch) {
    const t = decodeLiteralPdfString(titleMatch[1]).trim();
    if (t && /^[\x20-\x7E\u00A0-\u024F]+$/.test(t)) chunks.push('Judul PDF: ' + t);
  }
  if (authorMatch) {
    const a = decodeLiteralPdfString(authorMatch[1]).trim();
    if (a && /^[\x20-\x7E\u00A0-\u024F]+$/.test(a)) chunks.push('Penulis: ' + a);
  }

  for (let i = 0; i < decodedStreams.length; i += 1) {
    const text = extractTextFromContentStream(decodedStreams[i], cmap);
    const cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ').replace(/[ \t]{2,}/g, ' ').trim();
    if (cleaned.length >= 2) chunks.push(cleaned);
    if (chunks.join('\n').length >= MAX_CHARS) break;
  }

  if (!chunks.length) {
    const fallbackText = extractTextFromContentStream(rawLatin, cmap)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
    if (fallbackText.length >= 4) chunks.push(fallbackText);
  }

  const finalBody = chunks.join('\n\n').slice(0, MAX_CHARS).trim();
  if (finalBody) {
    return '[Dokumen PDF · ' + pageCount + ' halaman]\n' + finalBody;
  }
  const kb = Math.max(1, Math.round(bytes.byteLength / 1024));
  return '[Dokumen PDF · ' + pageCount + ' halaman · ' + kb + ' KB]\nDokumen PDF ini berisi objek grafis/pindaian halaman (' + pageCount + ' halaman) tanpa lapisan teks terbuka.';
}
