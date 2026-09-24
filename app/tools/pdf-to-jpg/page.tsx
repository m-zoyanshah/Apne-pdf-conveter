'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tool-system/ToolLayout';
import { FileUploader } from '@/components/tool-system/FileUploader';
import { ProgressBar } from '@/components/tool-system/ProgressBar';
import { ErrorMessage } from '@/components/tool-system/ErrorMessage';
import { renderPdfPages, RenderedPage } from '@/lib/pdfjs-renderer';
import { recordToolUsage } from '@/lib/firebase';
import JSZip from 'jszip';
import { FileSpreadsheet, Download, Archive, RotateCcw } from 'lucide-react';

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [renderedPages, setRenderedPages] = useState<RenderedPage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files[0]) return;
    const selected = files[0];
    setFile(selected);
    setError(null);
    setIsProcessing(true);
    setProgress(20);

    try {
      setProgress(50);
      const pages = await renderPdfPages(selected, 30, 1.5);
      setProgress(100);
      setRenderedPages(pages);

      try {
        await recordToolUsage({
          toolId: 'pdf-to-jpg',
          toolName: 'PDF to JPG',
          fileName: selected.name,
          fileSize: selected.size,
          pageCount: pages.length,
          status: 'success',
        });
      } catch (e) {
        console.warn('History record failed:', e);
      }
    } catch (err: any) {
      console.error('PDF to JPG error:', err);
      setError('Could not render PDF pages to images. Verify the document is valid.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSingle = (page: RenderedPage) => {
    const a = document.createElement('a');
    a.href = page.dataUrl;
    a.download = `${file?.name.replace(/\.pdf$/i, '') || 'page'}_page_${page.pageNumber}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadZip = async () => {
    if (!file || renderedPages.length === 0) return;

    const zip = new JSZip();
    const baseName = file.name.replace(/\.pdf$/i, '');

    renderedPages.forEach((p) => {
      const base64Data = p.dataUrl.replace(/^data:image\/jpeg;base64,/, '');
      zip.file(`${baseName}_page_${p.pageNumber}.jpg`, base64Data, { base64: true });
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}_jpg_images.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <ToolLayout
      toolId="pdf-to-jpg"
      title="PDF to JPG Converter"
      description="Convert PDF pages into high-definition JPG images. Download single images or export all pages simultaneously in a ZIP archive."
      categoryLabel="Convert PDF"
    >
      <div className="space-y-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {isProcessing ? (
          <ProgressBar progress={progress} statusText="Rendering PDF pages to JPG images..." />
        ) : renderedPages.length > 0 ? (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {renderedPages.length} Pages Converted to JPG
                </h3>
                <p className="text-xs text-slate-400">Rendered at high resolution (1.5x scale)</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setRenderedPages([]);
                    setFile(null);
                  }}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Convert Another</span>
                </button>

                <button
                  onClick={handleDownloadZip}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
                >
                  <Archive className="w-4 h-4" />
                  <span>Download All as ZIP</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {renderedPages.map((page) => (
                <div
                  key={page.pageNumber}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                >
                  <div className="w-full aspect-[1/1.4] bg-slate-50 dark:bg-slate-950 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-3">
                    <img
                      src={page.dataUrl}
                      alt={`Page ${page.pageNumber}`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Page {page.pageNumber}
                    </span>
                    <button
                      onClick={() => handleDownloadSingle(page)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>JPG</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <FileUploader
            onFilesSelected={handleFileSelected}
            title="Drop a PDF file here to convert to JPG"
            subtitle="Select 1 PDF file to extract all pages as images"
          />
        )}
      </div>
    </ToolLayout>
  );
}
