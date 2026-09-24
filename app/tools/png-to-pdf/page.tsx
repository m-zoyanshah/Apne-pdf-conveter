'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tool-system/ToolLayout';
import { FileUploader } from '@/components/tool-system/FileUploader';
import { ProgressBar } from '@/components/tool-system/ProgressBar';
import { ResultCard } from '@/components/tool-system/ResultCard';
import { ErrorMessage } from '@/components/tool-system/ErrorMessage';
import { imagesToPdf, downloadPdfBlob } from '@/lib/pdf-service';
import { recordToolUsage } from '@/lib/firebase';
import { FileImage, ArrowRight, Trash2 } from 'lucide-react';

export default function PngToPdfPage() {
  const [images, setImages] = useState<{ file: File; dataUrl: string }[]>([]);
  const [pageSize, setPageSize] = useState<'fit' | 'a4' | 'letter'>('fit');
  const [margin, setMargin] = useState<number>(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setError(null);
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [...prev, { file, dataUrl: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      setError('Please select at least one PNG image.');
      return;
    }

    setIsProcessing(true);
    setProgress(30);
    setError(null);

    try {
      setProgress(60);
      const pdfBytes = await imagesToPdf(images, { pageSize, margin });
      setProgress(100);
      setResultBytes(pdfBytes);

      try {
        await recordToolUsage({
          toolId: 'png-to-pdf',
          toolName: 'PNG to PDF',
          fileName: `converted_${images[0].file.name.replace(/\.[^/.]+$/, '')}.pdf`,
          fileSize: images.reduce((acc, img) => acc + img.file.size, 0),
          resultSize: pdfBytes.length,
          pageCount: images.length,
          status: 'success',
        });
      } catch (e) {
        console.warn('History record failed:', e);
      }
    } catch (err: any) {
      console.error('PNG to PDF error:', err);
      setError(err?.message || 'Failed to convert PNG images to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBytes) {
      downloadPdfBlob(resultBytes, 'converted_pngs.pdf');
    }
  };

  return (
    <ToolLayout
      toolId="png-to-pdf"
      title="PNG to PDF Converter"
      description="Convert PNG graphics and illustrations into PDF documents with full alpha transparency support and pixel clarity."
      categoryLabel="Convert PDF"
    >
      <div className="space-y-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {resultBytes ? (
          <ResultCard
            fileName="converted_pngs.pdf"
            fileSize={resultBytes.length}
            originalSize={images.reduce((acc, img) => acc + img.file.size, 0)}
            onDownload={handleDownload}
            onReset={() => {
              setResultBytes(null);
              setImages([]);
            }}
            title="PNGs Successfully Converted!"
            subtitle={`Created a high-fidelity PDF from ${images.length} PNG image(s).`}
          />
        ) : isProcessing ? (
          <ProgressBar progress={progress} statusText="Converting PNGs to PDF..." />
        ) : (
          <div className="space-y-6">
            {images.length === 0 ? (
              <FileUploader
                multiple
                accept="image/png,.png"
                onFilesSelected={handleFilesSelected}
                title="Drop PNG images here to convert to PDF"
                subtitle="Supports transparent and high-res PNG files"
                allowedTypesDescription="PNG images up to 25MB each"
              />
            ) : (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    PNG Images ({images.length})
                  </span>
                  <button
                    onClick={() => setImages([])}
                    className="text-xs font-semibold text-rose-500 hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative group"
                    >
                      <img
                        src={img.dataUrl}
                        alt="Preview"
                        className="w-full aspect-square object-contain rounded-lg bg-slate-50 dark:bg-slate-950 p-1"
                      />
                      <p className="text-xs font-semibold truncate mt-2">{img.file.name}</p>
                      <button
                        onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-2 right-2 p-1 rounded-md bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleConvert}
                  className="w-full py-4 text-base font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/25 transition-all"
                >
                  Convert to PDF Document
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
