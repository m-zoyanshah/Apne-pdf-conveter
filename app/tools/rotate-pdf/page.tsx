'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tool-system/ToolLayout';
import { FileUploader } from '@/components/tool-system/FileUploader';
import { PageSelector } from '@/components/tool-system/PDFPreview';
import { ProgressBar } from '@/components/tool-system/ProgressBar';
import { ResultCard } from '@/components/tool-system/ResultCard';
import { ErrorMessage } from '@/components/tool-system/ErrorMessage';
import { rotatePdf, downloadPdfBlob } from '@/lib/pdf-service';
import { recordToolUsage } from '@/lib/firebase';
import { RotateCw, RotateCcw } from 'lucide-react';

export default function RotatePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [rotationDegrees, setRotationDegrees] = useState<number>(90);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files[0]) {
      setFile(files[0]);
      setError(null);
      setResultBytes(null);
      setSelectedPages([]);
    }
  };

  const handleTogglePage = (pageNum: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageNum) ? prev.filter((p) => p !== pageNum) : [...prev, pageNum]
    );
  };

  const handleRotate = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(30);
    setError(null);

    try {
      setProgress(60);
      const rotatedBytes = await rotatePdf(
        file,
        rotationDegrees,
        selectedPages.length > 0 ? selectedPages : undefined
      );
      setProgress(100);
      setResultBytes(rotatedBytes);

      try {
        await recordToolUsage({
          toolId: 'rotate-pdf',
          toolName: 'Rotate PDF',
          fileName: file.name,
          fileSize: file.size,
          resultSize: rotatedBytes.length,
          status: 'success',
        });
      } catch (e) {
        console.warn('History record failed:', e);
      }
    } catch (err: any) {
      console.error('Rotate error:', err);
      setError(err?.message || 'Failed to rotate PDF pages.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBytes && file) {
      downloadPdfBlob(resultBytes, `rotated_${file.name}`);
    }
  };

  return (
    <ToolLayout
      toolId="rotate-pdf"
      title="Rotate PDF Pages"
      description="Change the orientation of your PDF document. Rotate all pages or select specific pages by 90°, 180°, or 270° clockwise or counter-clockwise."
      categoryLabel="Organize PDF"
    >
      <div className="space-y-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {resultBytes && file ? (
          <ResultCard
            fileName={`rotated_${file.name}`}
            fileSize={resultBytes.length}
            originalSize={file.size}
            onDownload={handleDownload}
            onReset={() => {
              setResultBytes(null);
              setFile(null);
            }}
            title="PDF Successfully Rotated!"
            subtitle="The page orientation has been updated and saved."
          />
        ) : isProcessing ? (
          <ProgressBar progress={progress} statusText="Rotating PDF pages..." />
        ) : (
          <div className="space-y-6">
            {!file ? (
              <FileUploader
                onFilesSelected={handleFileSelected}
                title="Drop a PDF file here to rotate"
                subtitle="Select 1 PDF file to change page orientation"
              />
            ) : (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-w-2xl mx-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {file.name}
                    </span>
                    <button
                      onClick={() => setFile(null)}
                      className="text-xs font-semibold text-rose-500 hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Select Rotation Angle
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: '90° Clockwise', deg: 90 },
                        { label: '180° Flip', deg: 180 },
                        { label: '270° (Counter-CW)', deg: 270 },
                      ].map((item) => (
                        <button
                          key={item.deg}
                          type="button"
                          onClick={() => setRotationDegrees(item.deg)}
                          className={`p-3 rounded-2xl border text-center transition-all ${
                            rotationDegrees === item.deg
                              ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                              : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <RotateCw className="w-4 h-4 mx-auto mb-1" />
                          <span className="text-xs">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">
                    {selectedPages.length === 0
                      ? 'Applying to ALL pages (or click thumbnails below to select specific pages).'
                      : `Applying to ${selectedPages.length} selected pages.`}
                  </p>

                  <button
                    onClick={handleRotate}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all"
                  >
                    <RotateCw className="w-5 h-5" />
                    <span>Apply Rotation</span>
                  </button>
                </div>

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
