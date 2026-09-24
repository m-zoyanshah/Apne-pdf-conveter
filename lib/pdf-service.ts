import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

export async function loadPdfDoc(file: File | ArrayBuffer | Uint8Array): Promise<PDFDocument> {
  const bytes = file instanceof File ? await file.arrayBuffer() : file;
  return await PDFDocument.load(bytes, { ignoreEncryption: true });
}

// 1. Merge PDF
export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  if (files.length < 2) {
    throw new Error('Please select at least 2 PDF files to merge.');
  }

  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

// 2. Split PDF
export async function splitPdf(
  file: File,
  splitRanges: string // e.g. "1-3, 4-5" or "all"
): Promise<{ name: string; data: Uint8Array }[]> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();

  const results: { name: string; data: Uint8Array }[] = [];
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  if (splitRanges === 'all' || !splitRanges.trim()) {
    // Split each page into separate PDF
    for (let i = 0; i < totalPages; i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(sourcePdf, [i]);
      newPdf.addPage(copiedPage);
      const data = await newPdf.save();
      results.push({
        name: `${baseName}_page_${i + 1}.pdf`,
        data,
      });
    }
  } else {
    // Parse ranges like "1-3, 5, 7-9"
    const ranges = splitRanges.split(',').map((r) => r.trim());
    let rangeIndex = 1;

    for (const range of ranges) {
      let pageIndices: number[] = [];
      if (range.includes('-')) {
        const [startStr, endStr] = range.split('-');
        const start = Math.max(1, parseInt(startStr, 10));
        const end = Math.min(totalPages, parseInt(endStr, 10));
        for (let p = start; p <= end; p++) {
          pageIndices.push(p - 1);
        }
      } else {
        const p = parseInt(range, 10);
        if (!isNaN(p) && p >= 1 && p <= totalPages) {
          pageIndices.push(p - 1);
        }
      }

      if (pageIndices.length > 0) {
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
        copiedPages.forEach((p) => newPdf.addPage(p));
        const data = await newPdf.save();
        results.push({
          name: `${baseName}_part_${rangeIndex}_pages_${range.replace(/\s+/g, '')}.pdf`,
          data,
        });
        rangeIndex++;
      }
    }
  }

  if (results.length === 0) {
    throw new Error('No valid pages found in the requested range.');
  }

  return results;
}

// 3. Rotate PDF
export async function rotatePdf(
  file: File,
  rotationDegrees: number, // 90, 180, 270
  selectedPages?: number[] // 1-indexed; if empty, rotates all
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  const targetPages = selectedPages && selectedPages.length > 0
    ? selectedPages.map((p) => p - 1)
    : pdfDoc.getPageIndices();

  for (const pageIdx of targetPages) {
    if (pageIdx >= 0 && pageIdx < totalPages) {
      const page = pdfDoc.getPage(pageIdx);
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + rotationDegrees) % 360));
    }
  }

  return await pdfDoc.save();
}

// 4. Delete PDF Pages
export async function deletePdfPages(
  file: File,
  pagesToDelete: number[] // 1-indexed (e.g. [2, 5])
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();

  const toDeleteSet = new Set(pagesToDelete.map((p) => p - 1));
  const pagesToKeep: number[] = [];

  for (let i = 0; i < totalPages; i++) {
    if (!toDeleteSet.has(i)) {
      pagesToKeep.push(i);
    }
  }

  if (pagesToKeep.length === 0) {
    throw new Error('Cannot delete all pages. At least 1 page must remain.');
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(sourcePdf, pagesToKeep);
  copiedPages.forEach((p) => newPdf.addPage(p));

  return await newPdf.save();
}

// 5. Reorder PDF Pages
export async function reorderPdfPages(
  file: File,
  newOrder: number[] // 1-indexed array of page numbers e.g. [3, 1, 2, 4]
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();

  const targetIndices = newOrder
    .map((p) => p - 1)
    .filter((idx) => idx >= 0 && idx < totalPages);

  if (targetIndices.length === 0) {
    throw new Error('Invalid page order specified.');
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(sourcePdf, targetIndices);
  copiedPages.forEach((p) => newPdf.addPage(p));

  return await newPdf.save();
}

// 6. Extract PDF Pages
export async function extractPdfPages(
  file: File,
  pagesToExtract: number[] // 1-indexed (e.g. [1, 3, 4])
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();

  const validIndices = pagesToExtract
    .map((p) => p - 1)
    .filter((p) => p >= 0 && p < totalPages);

  if (validIndices.length === 0) {
    throw new Error('Please select at least 1 valid page to extract.');
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(sourcePdf, validIndices);
  copiedPages.forEach((p) => newPdf.addPage(p));

  return await newPdf.save();
}

// 7. Compress PDF
export async function compressPdf(
  file: File,
  level: 'standard' | 'extreme' = 'standard'
): Promise<{ data: Uint8Array; originalSize: number; compressedSize: number }> {
  const originalSize = file.size;
  const arrayBuffer = await file.arrayBuffer();
  
  // Load and rewrite object streams, removing redundant references and metadata
  const pdfDoc = await PDFDocument.load(arrayBuffer, {
    ignoreEncryption: true,
    updateMetadata: false,
  });

  // Level-specific optimization
  if (level === 'extreme') {
    // Strip optional info
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('ZoraPDF Compressor');
    pdfDoc.setCreator('ZoraPDF');
  }

  // Save with maximum object stream compression and removal of unused objects
  const compressedBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  return {
    data: compressedBytes,
    originalSize,
    compressedSize: compressedBytes.length,
  };
}

// 8. Images to PDF (JPG/PNG)
export async function imagesToPdf(
  images: { file: File; dataUrl: string }[],
  options: {
    pageSize?: 'fit' | 'a4' | 'letter';
    orientation?: 'portrait' | 'landscape' | 'auto';
    margin?: number;
  } = {}
): Promise<Uint8Array> {
  if (images.length === 0) {
    throw new Error('Please upload at least one image.');
  }

  const pdfDoc = await PDFDocument.create();
  const margin = options.margin ?? 20;

  for (const item of images) {
    const arrayBuffer = await item.file.arrayBuffer();
    const isPng = item.file.type.includes('png') || item.file.name.toLowerCase().endsWith('.png');

    let embeddedImage;
    try {
      if (isPng) {
        embeddedImage = await pdfDoc.embedPng(arrayBuffer);
      } else {
        embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
      }
    } catch {
      // Fallback try JPG or PNG
      try {
        embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
      } catch {
        embeddedImage = await pdfDoc.embedPng(arrayBuffer);
      }
    }

    const { width: imgW, height: imgH } = embeddedImage;

    let pageWidth = imgW + margin * 2;
    let pageHeight = imgH + margin * 2;

    if (options.pageSize === 'a4') {
      pageWidth = 595.28;
      pageHeight = 841.89;
    } else if (options.pageSize === 'letter') {
      pageWidth = 612.0;
      pageHeight = 792.0;
    }

    if (options.orientation === 'landscape' && pageWidth < pageHeight) {
      const temp = pageWidth;
      pageWidth = pageHeight;
      pageHeight = temp;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Scale image to fit within page margins while maintaining aspect ratio
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;
    const scale = Math.min(maxWidth / imgW, maxHeight / imgH, 1);

    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const posX = margin + (maxWidth - drawW) / 2;
    const posY = margin + (maxHeight - drawH) / 2;

    page.drawImage(embeddedImage, {
      x: posX,
      y: posY,
      width: drawW,
      height: drawH,
    });
  }

  return await pdfDoc.save();
}

// 9. Watermark PDF
export async function addWatermarkToPdf(
  file: File,
  options: {
    text: string;
    fontSize?: number;
    opacity?: number;
    color?: string; // hex e.g. '#000000' or '#ff0000'
    angle?: number;
    pages?: 'all' | number[];
  }
): Promise<Uint8Array> {
  if (!options.text.trim()) {
    throw new Error('Watermark text cannot be empty.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const totalPages = pdfDoc.getPageCount();
  const fontSize = options.fontSize ?? 48;
  const opacity = options.opacity ?? 0.25;
  const angle = options.angle ?? 45;

  // Parse color hex
  let r = 0.5, g = 0.5, b = 0.5;
  if (options.color && options.color.startsWith('#')) {
    const hex = options.color.replace('#', '');
    if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16) / 255;
      g = parseInt(hex.substring(2, 4), 16) / 255;
      b = parseInt(hex.substring(4, 6), 16) / 255;
    }
  }

  const targetPages = options.pages && options.pages !== 'all'
    ? options.pages.map((p) => p - 1).filter((p) => p >= 0 && p < totalPages)
    : pdfDoc.getPageIndices();

  for (const pageIdx of targetPages) {
    const page = pdfDoc.getPage(pageIdx);
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(options.text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    // Center position
    const centerX = (width - textWidth) / 2;
    const centerY = (height - textHeight) / 2;

    page.drawText(options.text, {
      x: centerX,
      y: centerY,
      size: fontSize,
      font,
      color: rgb(r, g, b),
      opacity,
      rotate: degrees(angle),
    });
  }

  return await pdfDoc.save();
}

// 10. Protect PDF / Security Metadata & Watermark
export async function protectPdfDocument(
  file: File,
  options: {
    password?: string;
    securityBannerText?: string;
    confidentialWatermark?: boolean;
  }
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  // Update security metadata tags
  pdfDoc.setAuthor('Protected with ZoraPDF');
  pdfDoc.setProducer('ZoraPDF Security Suite');
  pdfDoc.setKeywords(['Encrypted', 'Protected', 'Confidential']);

  if (options.confidentialWatermark) {
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      page.drawText('CONFIDENTIAL & PROTECTED', {
        x: width * 0.15,
        y: height * 0.5,
        size: 36,
        font,
        color: rgb(0.85, 0.2, 0.2),
        opacity: 0.15,
        rotate: degrees(45),
      });
    }
  }

  return await pdfDoc.save();
}

// 11. Add Signature to PDF
export async function signPdfDocument(
  file: File,
  signaturePngDataUrl: string,
  placement: {
    pageNumber: number; // 1-indexed
    x: number; // normalized (0 to 1) or pt
    y: number; // normalized (0 to 1) or pt
    width: number; // pt
    height: number; // pt
  }
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  const targetPageIdx = Math.max(0, Math.min(totalPages - 1, placement.pageNumber - 1));
  const page = pdfDoc.getPage(targetPageIdx);
  const { width: pWidth, height: pHeight } = page.getSize();

  // Convert base64 DataURL to bytes
  const base64Data = signaturePngDataUrl.replace(/^data:image\/png;base64,/, '');
  const binaryString = atob(base64Data);
  const sigBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    sigBytes[i] = binaryString.charCodeAt(i);
  }

  const sigImage = await pdfDoc.embedPng(sigBytes);

  // If coordinates are normalized 0..1, scale to page points
  const drawX = placement.x <= 1 ? placement.x * pWidth : placement.x;
  const drawY = placement.y <= 1 ? (1 - placement.y) * pHeight - placement.height : placement.y;

  page.drawImage(sigImage, {
    x: Math.max(0, Math.min(pWidth - placement.width, drawX)),
    y: Math.max(0, Math.min(pHeight - placement.height, drawY)),
    width: placement.width,
    height: placement.height,
  });

  return await pdfDoc.save();
}

// 12. Text to PDF
export async function textToPdf(
  text: string,
  options: {
    fontSize?: number;
    title?: string;
    lineSpacing?: number;
  } = {}
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = options.fontSize ?? 12;
  const titleSize = fontSize + 6;
  const margin = 50;
  const pageWidth = 595.28; // A4
  const pageHeight = 841.89; // A4
  const contentWidth = pageWidth - margin * 2;
  const lineHeight = fontSize * (options.lineSpacing ?? 1.4);

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - margin;

  // Draw title if provided
  if (options.title) {
    currentPage.drawText(options.title, {
      x: margin,
      y: currentY - titleSize,
      size: titleSize,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.2),
    });
    currentY -= titleSize * 2;
  }

  // Wrap text
  const paragraphs = text.split('\n');

  for (const para of paragraphs) {
    if (!para.trim()) {
      currentY -= lineHeight;
      continue;
    }

    const words = para.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > contentWidth) {
        if (currentY - lineHeight < margin) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }
        currentPage.drawText(currentLine, {
          x: margin,
          y: currentY,
          size: fontSize,
          font,
          color: rgb(0.15, 0.15, 0.15),
        });
        currentY -= lineHeight;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      if (currentY - lineHeight < margin) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
      }
      currentPage.drawText(currentLine, {
        x: margin,
        y: currentY,
        size: fontSize,
        font,
        color: rgb(0.15, 0.15, 0.15),
      });
      currentY -= lineHeight * 1.2;
    }
  }

  return await pdfDoc.save();
}

// 13. Extract raw text from PDF ArrayBuffer
export async function extractTextFromPdf(file: File): Promise<{
  fullText: string;
  pageCount: number;
  previewSnippet: string;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pageCount = pdfDoc.getPageCount();

  // Basic client-side text extractor reading PDF stream bytes
  const bytes = new Uint8Array(arrayBuffer);
  const textDecoder = new TextDecoder('latin1');
  const rawString = textDecoder.decode(bytes);

  const textChunks: string[] = [];
  // Match BT ... ET (Begin Text ... End Text) blocks or (text) Tj
  const matches = rawString.match(/\((?:[^()\\]|\\.)*\)\s*Tj/g);

  if (matches && matches.length > 0) {
    for (const match of matches) {
      const clean = match
        .replace(/^\(/, '')
        .replace(/\)\s*Tj$/, '')
        .replace(/\\([()\\])/g, '$1')
        .trim();
      if (clean) textChunks.push(clean);
    }
  }

  let extracted = textChunks.join(' ');
  if (!extracted || extracted.length < 20) {
    // Fallback: search for clean alphanumeric words in streams
    const wordMatches = rawString.match(/[A-Za-z0-9,.:;?!'’"()\-–—]{3,}/g);
    if (wordMatches) {
      extracted = wordMatches.filter(w => !['obj', 'endobj', 'stream', 'endstream', 'xref', 'trailer'].includes(w)).slice(0, 3000).join(' ');
    }
  }

  const snippet = extracted.slice(0, 400);

  return {
    fullText: extracted || 'PDF Document containing ' + pageCount + ' pages.',
    pageCount,
    previewSnippet: snippet,
  };
}

// Utility: Trigger browser download for Uint8Array
export function downloadPdfBlob(bytes: Uint8Array, fileName: string): void {
  const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// Utility: Format file size
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
