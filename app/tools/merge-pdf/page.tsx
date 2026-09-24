'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tool-system/ToolLayout';
import { FileUploader } from '@/components/tool-system/FileUploader';
import { FileList } from '@/components/tool-system/FileList';
import { ProgressBar } from '@/components/tool-system/ProgressBar';
import { ResultCard } from '@/components/tool-system/ResultCard';
import { ErrorMessage } from '@/components/tool-system/ErrorMessage';
import { mergePdfs, downloadPdfBlob } from '@/lib/pdf-service';
import { recordToolUsage } from '@/lib/firebase';
import { Files, ArrowRight } from 'lucide-react';

export default function MergePdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [outputFileName, setOutputFileName] = useState('');

  const handleFilesSelected = (newFiles: File[]) => {
    setError(null);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  const handleClearAll = () => {
    setFiles([]);
    setResultBytes(null);
    setError(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please add at least 2 PDF files to merge.');
      return;
    }

    setIsProcessing(true);
    setProgress(20);
    setError(null);

    try {
      setProgress(50);
      const mergedBytes = await mergePdfs(files);
      setProgress(90);

      const fileName = `merged_${files[0].name.replace(/\.pdf$/i, '')}_and_more.pdf`;
      setResultBytes(mergedBytes);
      setOutputFileName(fileName);
      setProgress(100);

      // Record to Firestore
      try {
        await recordToolUsage({
          toolId: 'merge-pdf',
          toolName: 'Merge PDF',
          fileName,
          fileSize: files.reduce((acc, f) => acc + f.size, 0),
          resultSize: mergedBytes.length,
          pageCount: files.length,
          status: 'success',
        });
      } catch (e) {
        console.warn('History record failed:', e);
      }
    } catch (err: any) {
      console.error('Merge error:', err);
      setError(err?.message || 'Failed to merge PDF files. Make sure files are not password-locked.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBytes) {
      downloadPdfBlob(resultBytes, outputFileName);
    }
  };

  return (
    <ToolLayout
      toolId="merge-pdf"
      title="Merge PDF Files"
      description="Combine multiple PDF documents into a single unified file. Arrange files in any order and merge in seconds with pixel-perfect accuracy."
      badge="Most Popular"
      categoryLabel="Organize PDF"
      howToSteps={[
        { title: 'Upload Multiple PDFs', desc: 'Select 2 or more PDF documents from your computer or mobile device.' },
        { title: 'Arrange File Order', desc: 'Use the up/down arrows to order files exactly how you want them merged.' },
        { title: 'Merge & Download', desc: 'Click "Merge PDFs" to combine into a single PDF instantly with zero cloud upload.' },
      ]}
    >
      <div className="space-y-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {resultBytes ? (
          <ResultCard
            fileName={outputFileName}
            fileSize={resultBytes.length}
            originalSize={files.reduce((acc, f) => acc + f.size, 0)}
            onDownload={handleDownload}
            onReset={handleClearAll}
            title="PDFs Successfully Merged!"
            subtitle={`Combined ${files.length} documents into one clean PDF.`}
          />
        ) : isProcessing ? (
          <ProgressBar progress={progress} statusText="Combining PDF pages..." />
        ) : (
          <div className="space-y-6">
            {files.length === 0 ? (
              <FileUploader
                multiple
                accept=".pdf,application/pdf"
                onFilesSelected={handleFilesSelected}
                title="Drop multiple PDF files here to merge"
                subtitle="Select 2 or more PDF files from your device"
                allowedTypesDescription="PDF files up to 50MB each"
              />
            ) : (
              <div className="space-y-6 max-w-2xl mx-auto">
                <FileList
                  files={files}
                  onRemove={handleRemoveFile}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onClearAll={handleClearAll}
                  onAddMore={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.accept = '.pdf,application/pdf';
                    input.onchange = (e: any) => {
                      if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                    };
                    input.click();
                  }}
                />

                <div className="pt-2">
                  <button
                    onClick={handleMerge}
                    disabled={files.length < 2}
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Files className="w-5 h-5" />
                    <span>Merge {files.length} PDF Files</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {files.length === 1 && (
                    <p className="text-xs text-center text-amber-600 dark:text-amber-400 mt-2 font-medium">
                      Please add at least 1 more PDF to enable merging.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
