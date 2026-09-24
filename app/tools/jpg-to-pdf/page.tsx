'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tool-system/ToolLayout';
import { FileUploader } from '@/components/tool-system/FileUploader';
import { ProgressBar } from '@/components/tool-system/ProgressBar';
import { ResultCard } from '@/components/tool-system/ResultCard';
import { ErrorMessage } from '@/components/tool-system/ErrorMessage';
import { imagesToPdf, downloadPdfBlob, formatBytes } from '@/lib/pdf-service';
import { recordToolUsage } from '@/lib/firebase';
import { Image as ImageIcon, ArrowRight, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export default function JpgToPdfPage() {
  const [images, setImages] = useState<{ file: File; dataUrl: string }[]>([]);
  const [pageSize, setPageSize] = useState<'fit' | 'a4' | 'letter'>('fit');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'auto'>('auto');
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

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      setError('Please select at least one JPG or JPEG image.');
      return;
    }

    setIsProcessing(true);
    setProgress(30);
    setError(null);

    try {
      setProgress(60);
      const pdfBytes = await imagesToPdf(images, { pageSize, orientation, margin });
      setProgress(100);
      setResultBytes(pdfBytes);

      try {
        await recordToolUsage({
          toolId: 'jpg-to-pdf',
          toolName: 'JPG to PDF',
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
      console.error('JPG to PDF conversion error:', err);
      setError(err?.message || 'Failed to convert images to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBytes) {
      const outName = images[0]
        ? `images_${images[0].file.name.replace(/\.[^/.]+$/, '')}.pdf`
        : 'images.pdf';
      downloadPdfBlob(resultBytes, outName);
    }
  };

  return (
    <ToolLayout
      toolId="jpg-to-pdf"
      title="JPG to PDF Converter"
      description="Convert JPG and JPEG images into high-resolution PDF documents. Arrange photos in custom order, adjust page orientation and margins."
      categoryLabel="Convert PDF"
    >
      <div className="space-y-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {resultBytes ? (
          <ResultCard
            fileName="converted_images.pdf"
            fileSize={resultBytes.length}
            originalSize={images.reduce((acc, img) => acc + img.file.size, 0)}
            onDownload={handleDownload}
            onReset={() => {
              setResultBytes(null);
              setImages([]);
            }}
            title="Images Successfully Converted to PDF!"
            subtitle={`Combined ${images.length} image(s) into a high-resolution PDF.`}
          />
        ) : isProcessing ? (
          <ProgressBar progress={progress} statusText="Building PDF document from images..." />
        ) : (
          <div className="space-y-6">
            {images.length === 0 ? (
              <FileUploader
                multiple
                accept="image/jpeg,image/jpg,.jpg,.jpeg"
                onFilesSelected={handleFilesSelected}
                title="Drop JPG images here to convert to PDF"
                subtitle="Select one or multiple JPG photos"
                allowedTypesDescription="JPG, JPEG files up to 25MB each"
              />
            ) : (
              <div className="space-y-6 max-w-4xl mx-auto">
                {/* Options Toolbar */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Page Format
                    </label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-medium"
                    >
                      <option value="fit">Fit to Image Size</option>
                      <option value="a4">Standard A4</option>
                      <option value="letter">US Letter</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Orientation
                    </label>
                    <select
                      value={orientation}
                      onChange={(e) => setOrientation(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-medium"
                    >
                      <option value="auto">Auto Detect</option>
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Margin
                    </label>
                    <select
                      value={margin}
                      onChange={(e) => setMargin(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-medium"
                    >
                      <option value={0}>No Margin (Border to border)</option>
                      <option value={20}>Small (20pt)</option>
                      <option value={40}>Large (40pt)</option>
                    </select>
                  </div>
                </div>

                {/* Uploaded Images Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Images to Convert ({images.length})
                    </span>
                    <button
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.multiple = true;
                        input.accept = 'image/jpeg,image/jpg,.jpg,.jpeg';
                        input.onchange = (e: any) => {
                          if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                        };
                        input.click();
                      }}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      + Add More Images
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                      >
                        <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-2">
                          <img
                            src={img.dataUrl}
                            alt={img.file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {img.file.name}
                        </p>
                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveImage(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveImage(idx, 'down')}
                              disabled={idx === images.length - 1}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleConvert}
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/25 transition-all"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span>Convert {images.length} Images to PDF</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
