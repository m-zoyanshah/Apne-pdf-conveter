// Client-side PDF.js Dynamic Loader for rendering PDF pages to Canvas (thumbnails, image extraction, editor)

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

let pdfjsLoadingPromise: Promise<any> | null = null;

export async function getPdfJs(): Promise<any> {
  if (typeof window === 'undefined') return null;

  if (window.pdfjsLib) {
    return window.pdfjsLib;
  }

  if (pdfjsLoadingPromise) {
    return pdfjsLoadingPromise;
  }

  pdfjsLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      } else {
        reject(new Error('PDF.js failed to initialize.'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js script from CDN.'));
    document.head.appendChild(script);
  });

  return pdfjsLoadingPromise;
}

export interface RenderedPage {
  pageNumber: number;
  canvas: HTMLCanvasElement;
  dataUrl: string;
  width: number;
  height: number;
}

export async function renderPdfPages(
  file: File,
  maxPages = 20,
  scale = 1.0
): Promise<RenderedPage[]> {
  const pdfjs = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = Math.min(pdf.numPages, maxPages);

  const rendered: RenderedPage[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;

      rendered.push({
        pageNumber: pageNum,
        canvas,
        dataUrl: canvas.toDataURL('image/jpeg', 0.85),
        width: viewport.width,
        height: viewport.height,
      });
    }
  }

  return rendered;
}

export async function extractFullTextWithPdfJs(file: File): Promise<{
  text: string;
  pages: { pageNumber: number; text: string }[];
}> {
  try {
    const pdfjs = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const pages: { pageNumber: number; text: string }[] = [];
    const fullTextParts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      pages.push({ pageNumber: i, text: pageText });
      if (pageText) fullTextParts.push(`--- Page ${i} ---\n${pageText}`);
    }

    return {
      text: fullTextParts.join('\n\n'),
      pages,
    };
  } catch (err) {
    console.warn('PDF.js text extraction fallback error:', err);
    return { text: '', pages: [] };
  }
}
