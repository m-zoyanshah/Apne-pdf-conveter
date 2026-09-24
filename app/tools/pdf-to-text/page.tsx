'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tool-system/ToolLayout';
import { FileUploader } from '@/components/tool-system/FileUploader';
import { ProgressBar } from '@/components/tool-system/ProgressBar';
import { ErrorMessage } from '@/components/tool-system/ErrorMessage';
import { extractFullTextWithPdfJs } from '@/lib/pdfjs-renderer';
import { extractTextFromPdf } from '@/lib/pdf-service';
import { recordToolUsage } from '@/lib/firebase';
import { FileText, Copy, Download, Check, RotateCcw } from 'lucide-react';

export default function PdfToTextPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [pageCount, setPageCount] = useState(0);
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
    setProgress(30);

    try {
      setProgress(60);
      let text = '';
      let pages = 1;

      // Try PDF.js extraction first
      const pdfJsRes = await extractFullTextWithPdfJs(selected);
      if (pdfJsRes.text && pdfJsRes.text.trim().length > 20) {
        text = pdfJsRes.text;
        pages = pdfJsRes.pages.length;
      } else {
        // Fallback
        const basicRes = await extractTextFromPdf(selected);
        text = basicRes.fullText;
        pages = basicRes.pageCount;
      }

      setProgress(100);
      setExtractedText(text);
      setPageCount(pages);

      try {
        await recordToolUsage({
          toolId: 'pdf-to-text',
          toolName: 'PDF to Text',
          fileName: selected.name,
          fileSize: selected.size,
          pageCount: pages,
          status: 'success',
        });
      } catch (e) {
        console.warn('History record failed:', e);
      }
    } catch (err: any) {
      console.error('Text extraction error:', err);
      setError('Could not extract text from this PDF. It may be an image-only scan or protected.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace(/\.pdf$/i, '') || 'document'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const wordCount = extractedText.trim() ? extractedText.trim().split(/\s+/).length : 0;
  const charCount = extractedText.length;

  return (
    <ToolLayout
      toolId="pdf-to-text"
      title="PDF to Text Extractor"
      description="Extract all raw text, sentences, and paragraphs from your PDF document for editing, copying, or saving as a clean .txt file."
      categoryLabel="Convert PDF"
    >
      <div className="space-y-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {isProcessing ? (
          <ProgressBar progress={progress} statusText="Extracting text contents from PDF..." />
        ) : extractedText ? (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {file?.name}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>{pageCount} Page(s)</span>
                  <span>•</span>
                  <span>{wordCount.toLocaleString()} Words</span>
                  <span>•</span>
                  <span>{charCount.toLocaleString()} Characters</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setExtractedText('');
                    setFile(null);
                  }}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>

                <button
                  onClick={handleDownloadTxt}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .TXT</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                rows={18}
                className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-200 font-mono outline-none resize-y leading-relaxed p-2"
                placeholder="Extracted text will appear here..."
              />
            </div>
          </div>
        ) : (
          <FileUploader
            onFilesSelected={handleFileSelected}
            title="Drop a PDF file here to extract text"
            subtitle="Extract paragraphs, tables and words into editable format"
          />
        )}
      </div>
    </ToolLayout>
  );
}
