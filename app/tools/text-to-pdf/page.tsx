'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tool-system/ToolLayout';
import { ProgressBar } from '@/components/tool-system/ProgressBar';
import { ResultCard } from '@/components/tool-system/ResultCard';
import { ErrorMessage } from '@/components/tool-system/ErrorMessage';
import { textToPdf, downloadPdfBlob } from '@/lib/pdf-service';
import { recordToolUsage } from '@/lib/firebase';
import { AlignLeft, FileText, ArrowRight } from 'lucide-react';

export default function TextToPdfPage() {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [fontSize, setFontSize] = useState(12);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Please enter or paste some text to generate a PDF.');
      return;
    }

    setIsProcessing(true);
    setProgress(30);
    setError(null);

    try {
      setProgress(70);
      const pdfBytes = await textToPdf(text, { title: title.trim() || undefined, fontSize });
      setProgress(100);
      setResultBytes(pdfBytes);

      try {
        await recordToolUsage({
          toolId: 'text-to-pdf',
          toolName: 'Text to PDF',
          fileName: `${(title || 'text_document').replace(/\s+/g, '_')}.pdf`,
          fileSize: text.length,
          resultSize: pdfBytes.length,
          status: 'success',
        });
      } catch (e) {
        console.warn('History record failed:', e);
      }
    } catch (err: any) {
      console.error('Text to PDF error:', err);
      setError(err?.message || 'Failed to generate PDF from text.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBytes) {
      const outName = `${(title.trim() || 'text_document').replace(/[^a-z0-9_-]/gi, '_')}.pdf`;
      downloadPdfBlob(resultBytes, outName);
    }
  };

  return (
    <ToolLayout
      toolId="text-to-pdf"
      title="Text to PDF Generator"
      description="Create a professionally formatted, paginated PDF from raw text, notes, or articles with custom headers and font sizing."
      categoryLabel="Convert PDF"
    >
      <div className="space-y-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {resultBytes ? (
          <ResultCard
            fileName={`${(title || 'text_document').replace(/\s+/g, '_')}.pdf`}
            fileSize={resultBytes.length}
            onDownload={handleDownload}
            onReset={() => setResultBytes(null)}
            title="PDF Successfully Created!"
            subtitle="Your text has been typeset and exported into an A4 PDF document."
          />
        ) : isProcessing ? (
          <ProgressBar progress={progress} statusText="Formatting and building PDF document..." />
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Document Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Project Proposal or Meeting Notes"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Font Size
                  </label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none focus:border-blue-500"
                  >
                    <option value={10}>Small (10 pt)</option>
                    <option value={12}>Standard (12 pt)</option>
                    <option value={14}>Medium (14 pt)</option>
                    <option value={16}>Large (16 pt)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Document Text Content
                  </label>
                  <span className="text-xs text-slate-400">
                    {text.trim() ? text.trim().split(/\s+/).length : 0} words
                  </span>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={14}
                  placeholder="Paste or type your text here... Long text will automatically break across pages with margins."
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 font-sans leading-relaxed"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={!text.trim()}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/25 transition-all disabled:opacity-40"
              >
                <FileText className="w-5 h-5" />
                <span>Generate PDF Document</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
