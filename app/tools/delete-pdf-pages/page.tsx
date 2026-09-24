'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tool-system/ToolLayout';
import { FileUploader } from '@/components/tool-system/FileUploader';
import { PageSelector } from '@/components/tool-system/PDFPreview';
import { ProgressBar } from '@/components/tool-system/ProgressBar';
import { ResultCard } from '@/components/tool-system/ResultCard';
import { ErrorMessage } from '@/components/tool-system/ErrorMessage';
import { deletePdfPages, downloadPdfBlob } from '@/lib/pdf-service';
import { recordToolUsage } from '@/lib/firebase';
import { Trash2 } from 'lucide-react';

export default function DeletePdfPagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pagesToDelete, setPagesToDelete] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files[0]) {
      setFile(files[0]);
      setError(null);
      setResultBytes(null);
      setPagesToDelete([]);
    }
  };

  const handleTogglePage = (pageNum: number) => {
    setPagesToDelete((prev) =>
      prev.includes(pageNum) ? prev.filter((p) => p !== pageNum) : [...prev, pageNum]
    );
  };

  const handleDeletePages = async () => {
    if (!file) return;

    if (pagesToDelete.length === 0) {
      setError('Please click on at least one page thumbnail below to mark it for deletion.');
      return;
    }

    setIsProcessing(true);
    setProgress(30);
    setError(null);

    try {
      setProgress(60);
      const outputBytes = await deletePdfPages(file, pagesToDelete);
      setProgress(100);
      setResultBytes(outputBytes);

      try {
        await recordToolUsage({
          toolId: 'delete-pdf-pages',
          toolName: 'Delete PDF Pages',
          fileName: file.name,
          fileSize: file.size,
          resultSize: outputBytes.length,
          status: 'success',
        });
      } catch (e) {
        console.warn('History record failed:', e);
      }
    } catch (err: any) {
      console.error('Delete pages error:', err);
      setError(err?.message || 'Failed to remove pages. At least 1 page must remain.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBytes && file) {
      downloadPdfBlob(resultBytes, `pages_removed_${file.name}`);
    }
  };

  return (
    <ToolLayout
      toolId="delete-pdf-pages"
      title="Delete PDF Pages"
      description="Remove unwanted, blank, or duplicate pages from any PDF document. Simply click on thumbnails to mark them for removal."
      categoryLabel="Organize PDF"
    >
      <div className="space-y-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {resultBytes && file ? (
          <ResultCard
            fileName={`pages_removed_${file.name}`}
            fileSize={resultBytes.length}
            originalSize={file.size}
            onDownload={handleDownload}
            onReset={() => {
              setResultBytes(null);
              setFile(null);
            }}
            title="Pages Successfully Deleted!"
            subtitle={`Removed ${pagesToDelete.length} page(s) from your document.`}
          />
        ) : isProcessing ? (
          <ProgressBar progress={progress} statusText="Removing selected pages..." />
        ) : (
          <div className="space-y-6">
            {!file ? (
              <FileUploader
                onFilesSelected={handleFileSelected}
                title="Drop a PDF file here to delete pages"
                subtitle="Select 1 PDF file to inspect and remove pages"
              />
            ) : (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {file.name}
                    </h3>
                    <p className="text-xs text-rose-500 font-semibold mt-0.5">
                      {pagesToDelete.length === 0
                        ? 'Click thumbnails below to mark pages to delete'
                        : `${pagesToDelete.length} page(s) marked for deletion: [${pagesToDelete.join(', ')}]`}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPagesToDelete([])}
                      disabled={pagesToDelete.length === 0}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30"
                    >
                      Reset Selection
                    </button>

                    <button
                      onClick={handleDeletePages}
                      disabled={pagesToDelete.length === 0}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete {pagesToDelete.length} Pages</span>
                    </button>
                  </div>
                </div>

                <div className="max-w-4xl mx-auto">
                  <PageSelector
                    file={file}
                    selectedPages={pagesToDelete}
                    onTogglePage={handleTogglePage}
                    badgeType="delete"
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
