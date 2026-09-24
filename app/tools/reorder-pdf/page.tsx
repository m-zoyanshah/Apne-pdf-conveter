'use client';

import React, { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/tool-system/ToolLayout';
import { FileUploader } from '@/components/tool-system/FileUploader';
import { ProgressBar } from '@/components/tool-system/ProgressBar';
import { ResultCard } from '@/components/tool-system/ResultCard';
import { ErrorMessage } from '@/components/tool-system/ErrorMessage';
import { reorderPdfPages, downloadPdfBlob } from '@/lib/pdf-service';
import { renderPdfPages, RenderedPage } from '@/lib/pdfjs-renderer';
import { recordToolUsage } from '@/lib/firebase';
import { ArrowUpDown, ArrowLeft, ArrowRight, RotateCcw, Loader2 } from 'lucide-react';

export default function ReorderPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [order, setOrder] = useState<number[]>([]); // array of original page numbers in current order
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files[0]) {
      const selected = files[0];
      setFile(selected);
      setError(null);
      setResultBytes(null);
      setLoadingThumbnails(true);

      try {
        const rendered = await renderPdfPages(selected, 50, 0.4);
        setPages(rendered);
        setOrder(rendered.map((p) => p.pageNumber));
      } catch (err: any) {
        console.error('Error rendering pages for reorder:', err);
        setError('Could not render page thumbnails. You can still process standard documents.');
      } finally {
        setLoadingThumbnails(false);
      }
    }
  };

  const movePage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= order.length) return;

    setOrder((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleResetOrder = () => {
    setOrder(pages.map((p) => p.pageNumber));
  };

  const handleSaveReorder = async () => {
    if (!file || order.length === 0) return;

    setIsProcessing(true);
    setProgress(30);
    setError(null);

    try {
      setProgress(60);
      const reorderedBytes = await reorderPdfPages(file, order);
      setProgress(100);
      setResultBytes(reorderedBytes);

      try {
        await recordToolUsage({
          toolId: 'reorder-pdf',
          toolName: 'Reorder PDF Pages',
          fileName: file.name,
          fileSize: file.size,
          resultSize: reorderedBytes.length,
          status: 'success',
        });
      } catch (e) {
        console.warn('History record failed:', e);
      }
    } catch (err: any) {
      console.error('Reorder error:', err);
      setError(err?.message || 'Failed to reorder PDF pages.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBytes && file) {
      downloadPdfBlob(resultBytes, `reordered_${file.name}`);
    }
  };

  return (
    <ToolLayout
      toolId="reorder-pdf"
      title="Reorder PDF Pages"
      description="Easily rearrange the page order of your PDF document. Move pages forward or backward with visual thumbnail cards."
      categoryLabel="Organize PDF"
    >
      <div className="space-y-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {resultBytes && file ? (
          <ResultCard
            fileName={`reordered_${file.name}`}
            fileSize={resultBytes.length}
            originalSize={file.size}
            onDownload={handleDownload}
            onReset={() => {
              setResultBytes(null);
              setFile(null);
              setPages([]);
              setOrder([]);
            }}
            title="Pages Successfully Reordered!"
            subtitle="The page sequence has been rearranged and saved."
          />
        ) : isProcessing ? (
          <ProgressBar progress={progress} statusText="Rearranging document pages..." />
        ) : (
          <div className="space-y-6">
            {!file ? (
              <FileUploader
                onFilesSelected={handleFileSelected}
                title="Drop a PDF file here to reorder pages"
                subtitle="Select 1 PDF file to rearrange its pages"
              />
            ) : loadingThumbnails ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Loading page thumbnails...
                </p>
              </div>
            ) : (
              <div className="space-y-6 max-w-5xl mx-auto">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {file.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Current Order: [{order.join(', ')}]
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleResetOrder}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Order</span>
                    </button>

                    <button
                      onClick={handleSaveReorder}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
                    >
                      <ArrowUpDown className="w-4 h-4" />
                      <span>Save Reordered PDF</span>
                    </button>
                  </div>
                </div>

                {/* Visual Pages in Current Reordered Sequence */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 rounded-3xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  {order.map((origPageNum, idx) => {
                    const pageData = pages.find((p) => p.pageNumber === origPageNum);
                    return (
                      <div
                        key={`${origPageNum}-${idx}`}
                        className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-between"
                      >
                        <div className="w-full flex items-center justify-between text-xs mb-2">
                          <span className="font-extrabold text-blue-600 dark:text-blue-400">
                            Pos #{idx + 1}
                          </span>
                          <span className="text-[11px] text-slate-400">Orig p.{origPageNum}</span>
                        </div>

                        <div className="w-full aspect-[1/1.4] bg-slate-50 dark:bg-slate-950 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-2">
                          {pageData?.dataUrl ? (
                            <img
                              src={pageData.dataUrl}
                              alt={`Page ${origPageNum}`}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-xs font-bold text-slate-400">
                              Page {origPageNum}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-center gap-1 w-full pt-1 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => movePage(idx, 'left')}
                            disabled={idx === 0}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-20"
                            title="Move Left"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => movePage(idx, 'right')}
                            disabled={idx === order.length - 1}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-20"
                            title="Move Right"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
