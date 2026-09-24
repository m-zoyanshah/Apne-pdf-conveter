'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tool-system/ToolLayout';
import { FileUploader } from '@/components/tool-system/FileUploader';
import { PageSelector } from '@/components/tool-system/PDFPreview';
import { ProgressBar } from '@/components/tool-system/ProgressBar';
import { ResultCard } from '@/components/tool-system/ResultCard';
import { ErrorMessage } from '@/components/tool-system/ErrorMessage';
import { extractPdfPages, downloadPdfBlob } from '@/lib/pdf-service';
import { recordToolUsage } from '@/lib/firebase';
import { FolderOutput } from 'lucide-react';

export default function ExtractPdfPagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pagesToExtract, setPagesToExtract] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files[0]) {
      setFile(files[0]);
      setError(null);
      setResultBytes(null);
      setPagesToExtract([1]);
    }
  };

  const handleTogglePage = (pageNum: number) => {
    setPagesToExtract((prev) =>
      prev.includes(pageNum) ? prev.filter((p) => p !== pageNum) : [...prev, pageNum]
    );
  };

  const handleExtract = async () => {
    if (!file) return;

    if (pagesToExtract.length === 0) {
      setError('Please select at least one page thumbnail below to extract.');
      return;
    }

    setIsProcessing(true);
    setProgress(30);
    setError(null);

    try {
      setProgress(60);
      const extractedBytes = await extractPdfPages(file, pagesToExtract);
      setProgress(100);
      setResultBytes(extractedBytes);

      try {
        await recordToolUsage({
          toolId: 'extract-pdf-pages',
          toolName: 'Extract PDF Pages',
          fileName: file.name,
          fileSize: file.size,
          resultSize: extractedBytes.length,
          pageCount: pagesToExtract.length,
          status: 'success',
        });
      } catch (e) {
        console.warn('History record failed:', e);
      }
    } catch (err: any) {
      console.error('Extract error:', err);
      setError(err?.message || 'Failed to extract selected pages.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBytes && file) {
      downloadPdfBlob(resultBytes, `extracted_${file.name}`);
    }
  };

  return (
    <ToolLayout
      toolId="extract-pdf-pages"
      title="Extract PDF Pages"
      description="Select specific pages from your PDF document and export them into a brand new, isolated PDF document."
      categoryLabel="Organize PDF"
    >
      <div className="space-y-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {resultBytes && file ? (
          <ResultCard
            fileName={`extracted_${file.name}`}
            fileSize={resultBytes.length}
            originalSize={file.size}
            onDownload={handleDownload}
            onReset={() => {
              setResultBytes(null);
              setFile(null);
              setPagesToExtract([]);
            }}
            title="Pages Successfully Extracted!"
            subtitle={`Created a new PDF containing ${pagesToExtract.length} selected page(s).`}
          />
        ) : isProcessing ? (
          <ProgressBar progress={progress} statusText="Extracting chosen pages..." />
        ) : (
          <div className="space-y-6">
            {!file ? (
              <FileUploader
                onFilesSelected={handleFileSelected}
                title="Drop a PDF file here to extract pages"
                subtitle="Select 1 PDF file to pull out specific pages"
              />
            ) : (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {file.name}
                    </h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                      {pagesToExtract.length} page(s) selected: [{pagesToExtract.join(', ')}]
                    </p>
                  </div>

                  <button
                    onClick={handleExtract}
                    disabled={pagesToExtract.length === 0}
                    className="flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <FolderOutput className="w-4 h-4" />
                    <span>Extract {pagesToExtract.length} Pages</span>
                  </button>
                </div>

                <div className="max-w-4xl mx-auto">
                  <PageSelector
                    file={file}
                    selectedPages={pagesToExtract}
                    onTogglePage={handleTogglePage}
                    badgeType="select"
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
