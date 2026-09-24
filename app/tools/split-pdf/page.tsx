'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tool-system/ToolLayout';
import { FileUploader } from '@/components/tool-system/FileUploader';
import { PageSelector } from '@/components/tool-system/PDFPreview';
import { ProgressBar } from '@/components/tool-system/ProgressBar';
import { ResultCard } from '@/components/tool-system/ResultCard';
import { ErrorMessage } from '@/components/tool-system/ErrorMessage';
import { splitPdf, downloadPdfBlob } from '@/lib/pdf-service';
import { recordToolUsage } from '@/lib/firebase';
import { Scissors, Download, FileText, CheckCircle2, RotateCcw } from 'lucide-react';

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [splitMode, setSplitMode] = useState<'ranges' | 'all'>('ranges');
  const [rangeInput, setRangeInput] = useState('1-2');
  const [selectedPages, setSelectedPages] = useState<number[]>([1, 2]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [splitResults, setSplitResults] = useState<{ name: string; data: Uint8Array }[]>([]);

  const handleFileSelected = (files: File[]) => {
    if (files[0]) {
      setFile(files[0]);
      setError(null);
      setSplitResults([]);
      setSelectedPages([1]);
      setRangeInput('1');
    }
  };

  const handleTogglePage = (pageNum: number) => {
    let updated: number[];
    if (selectedPages.includes(pageNum)) {
      updated = selectedPages.filter((p) => p !== pageNum);
    } else {
      updated = [...selectedPages, pageNum].sort((a, b) => a - b);
    }
    setSelectedPages(updated);
    setRangeInput(updated.join(', '));
  };

  const handleSplit = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(30);
    setError(null);

    try {
      const modeArg = splitMode === 'all' ? 'all' : rangeInput;
      setProgress(60);
      const results = await splitPdf(file, modeArg);
      setProgress(100);
      setSplitResults(results);

      // Record to Firestore
      try {
        await recordToolUsage({
          toolId: 'split-pdf',
          toolName: 'Split PDF',
          fileName: file.name,
          fileSize: file.size,
          resultSize: results.reduce((acc, r) => acc + r.data.length, 0),
          pageCount: results.length,
          status: 'success',
        });
      } catch (e) {
        console.warn('History record failed:', e);
      }
    } catch (err: any) {
      console.error('Split error:', err);
      setError(err?.message || 'Failed to split PDF. Please verify your range expression.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSingle = (item: { name: string; data: Uint8Array }) => {
    downloadPdfBlob(item.data, item.name);
  };

  const handleDownloadAll = () => {
    splitResults.forEach((item, idx) => {
      setTimeout(() => downloadPdfBlob(item.data, item.name), idx * 250);
    });
  };

  return (
    <ToolLayout
      toolId="split-pdf"
      title="Split PDF Document"
      description="Separate specific pages, extract custom ranges, or split every page into standalone PDF files with instant download."
      badge="Essential"
      categoryLabel="Organize PDF"
      howToSteps={[
        { title: 'Upload Document', desc: 'Choose the PDF you want to split into smaller documents.' },
        { title: 'Set Page Ranges', desc: 'Click thumbnails or enter custom page numbers like "1-3, 5, 8".' },
        { title: 'Download Split Files', desc: 'Download individual files or all generated PDFs simultaneously.' },
      ]}
    >
      <div className="space-y-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {splitResults.length > 0 ? (
          <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800/80">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Split Successfully Completed!
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Created {splitResults.length} standalone PDF {splitResults.length === 1 ? 'file' : 'files'}.
              </p>
            </div>

            {/* Split Files List */}
            <div className="space-y-2 max-h-60 overflow-y-auto p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-left">
              {splitResults.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {item.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDownloadSingle(item)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 flex items-center gap-1 shrink-0"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleDownloadAll}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all"
              >
                <Download className="w-5 h-5" />
                <span>Download All ({splitResults.length})</span>
              </button>
              <button
                onClick={() => {
                  setSplitResults([]);
                  setFile(null);
                }}
                className="flex items-center justify-center gap-1.5 px-5 py-3.5 text-sm font-semibold rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Split Another</span>
              </button>
            </div>
          </div>
        ) : isProcessing ? (
          <ProgressBar progress={progress} statusText="Splitting PDF pages..." />
        ) : (
          <div className="space-y-6">
            {!file ? (
              <FileUploader
                onFilesSelected={handleFileSelected}
                title="Drop a PDF file here to split"
                subtitle="Select 1 PDF file to extract or divide"
              />
            ) : (
              <div className="space-y-6">
                {/* Options Panel */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-w-2xl mx-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      File: {file.name}
                    </span>
                    <button
                      onClick={() => setFile(null)}
                      className="text-xs font-semibold text-rose-500 hover:underline"
                    >
                      Change File
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSplitMode('ranges')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        splitMode === 'ranges'
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Custom Ranges
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">e.g. 1-3, 5, 7-10</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSplitMode('all')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        splitMode === 'all'
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Split Every Page
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Each page as a new PDF</p>
                    </button>
                  </div>

                  {splitMode === 'ranges' && (
                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Page Range Expression
                      </label>
                      <input
                        type="text"
                        value={rangeInput}
                        onChange={(e) => setRangeInput(e.target.value)}
                        placeholder="e.g. 1-3, 5, 8"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-mono outline-none focus:border-blue-500"
                      />
                      <p className="text-[11px] text-slate-400">
                        Tip: Click page thumbnails below to auto-select, or type ranges manually.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleSplit}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all"
                  >
                    <Scissors className="w-5 h-5" />
                    <span>Split PDF Now</span>
                  </button>
                </div>

                {/* Page Selector */}
                <div className="max-w-4xl mx-auto">
                  <PageSelector
                    file={file}
                    selectedPages={selectedPages}
                    onTogglePage={handleTogglePage}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
