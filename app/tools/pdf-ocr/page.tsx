'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tool-system/ToolLayout';
import { FileUploader } from '@/components/tool-system/FileUploader';
import { ProgressBar } from '@/components/tool-system/ProgressBar';
import { ErrorMessage } from '@/components/tool-system/ErrorMessage';
import { extractFullTextWithPdfJs } from '@/lib/pdfjs-renderer';
import { recordToolUsage } from '@/lib/firebase';
import { ScanText, Search, Copy, Download, Check, RotateCcw } from 'lucide-react';

export default function PdfOcrPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pagesText, setPagesText] = useState<{ pageNumber: number; text: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    if (!files[0]) return;
    const selected = files[0];
    setFile(selected);
    setError(null);
    setIsProcessing(true);
    setProgress(20);

    try {
      setProgress(60);
      const res = await extractFullTextWithPdfJs(selected);
      setProgress(100);
      setPagesText(res.pages);

      try {
        await recordToolUsage({
          toolId: 'pdf-ocr',
          toolName: 'PDF OCR Text Recognition',
          fileName: selected.name,
          fileSize: selected.size,
          pageCount: res.pages.length,
          status: 'success',
        });
      } catch (e) {
        console.warn('History record failed:', e);
      }
    } catch (err: any) {
      console.error('OCR error:', err);
      setError('Could not perform OCR text extraction on this document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const fullText = pagesText.map((p) => `--- PAGE ${p.pageNumber} ---\n${p.text}`).join('\n\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr_${file?.name.replace(/\.pdf$/i, '') || 'extracted'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <ToolLayout
      toolId="pdf-ocr"
      title="PDF OCR Text Recognition"
      description="Extract text with high accuracy across all pages. Search inside recognized text, copy paragraphs, and export to text format."
      badge="OCR Engine"
      categoryLabel="OCR & Extract"
    >
      <div className="space-y-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {isProcessing ? (
          <ProgressBar progress={progress} statusText="Scanning and recognizing text structures..." />
        ) : pagesText.length > 0 ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {file?.name}
                </h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  ✓ Recognized {pagesText.length} pages of text
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPagesText([]);
                    setFile(null);
                  }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy All'}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .TXT</span>
                </button>
              </div>
            </div>

            {/* Search Filter in OCR text */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recognized words across all pages..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs outline-none focus:border-blue-500"
              />
            </div>

            {/* Pages Text List */}
            <div className="space-y-4">
              {pagesText.map((page) => {
                const isMatch =
                  !searchQuery.trim() ||
                  page.text.toLowerCase().includes(searchQuery.toLowerCase().trim());
                if (!isMatch) return null;

                return (
                  <div
                    key={page.pageNumber}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                        Page {page.pageNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {page.text.trim().split(/\s+/).length} words
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                      {page.text || '<No text detected on this page>'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <FileUploader
            onFilesSelected={handleFileSelected}
            title="Drop a PDF file here to run OCR"
            subtitle="Extract recognized text from documents and books"
          />
        )}
      </div>
    </ToolLayout>
  );
}
