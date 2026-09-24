'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tool-system/ToolLayout';
import { FileUploader } from '@/components/tool-system/FileUploader';
import { ProgressBar } from '@/components/tool-system/ProgressBar';
import { ResultCard } from '@/components/tool-system/ResultCard';
import { ErrorMessage } from '@/components/tool-system/ErrorMessage';
import { addWatermarkToPdf, downloadPdfBlob } from '@/lib/pdf-service';
import { recordToolUsage } from '@/lib/firebase';
import { Stamp, Sparkles } from 'lucide-react';

export default function WatermarkPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.25);
  const [angle, setAngle] = useState(45);
  const [color, setColor] = useState('#888888');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files[0]) {
      setFile(files[0]);
      setError(null);
      setResultBytes(null);
    }
  };

  const handleAddWatermark = async () => {
    if (!file) return;

    if (!text.trim()) {
      setError('Please provide watermark text.');
      return;
    }

    setIsProcessing(true);
    setProgress(30);
    setError(null);

    try {
      setProgress(70);
      const watermarkedBytes = await addWatermarkToPdf(file, {
        text: text.trim(),
        fontSize,
        opacity,
        angle,
        color,
      });
      setProgress(100);
      setResultBytes(watermarkedBytes);

      try {
        await recordToolUsage({
          toolId: 'watermark-pdf',
          toolName: 'Add Watermark',
          fileName: file.name,
          fileSize: file.size,
          resultSize: watermarkedBytes.length,
          status: 'success',
        });
      } catch (e) {
        console.warn('History record failed:', e);
      }
    } catch (err: any) {
      console.error('Watermark error:', err);
      setError(err?.message || 'Failed to add watermark to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBytes && file) {
      downloadPdfBlob(resultBytes, `watermarked_${file.name}`);
    }
  };

  return (
    <ToolLayout
      toolId="watermark-pdf"
      title="Add Watermark to PDF"
      description="Stamp custom text watermarks across every page with adjustable transparency, angle, font size, and colors."
      categoryLabel="Security & Protect"
    >
      <div className="space-y-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {resultBytes && file ? (
          <ResultCard
            fileName={`watermarked_${file.name}`}
            fileSize={resultBytes.length}
            originalSize={file.size}
            onDownload={handleDownload}
            onReset={() => {
              setResultBytes(null);
              setFile(null);
            }}
            title="Watermark Successfully Added!"
            subtitle={`Stamped "${text}" across all document pages.`}
          />
        ) : isProcessing ? (
          <ProgressBar progress={progress} statusText="Stamping watermark on document..." />
        ) : (
          <div className="space-y-6">
            {!file ? (
              <FileUploader
                onFilesSelected={handleFileSelected}
                title="Drop a PDF file here to add a watermark"
                subtitle="Select 1 PDF file to stamp"
              />
            ) : (
              <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[260px]">
                      {file.name}
                    </h3>
                    <p className="text-xs text-slate-400">Ready to watermark</p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-xs font-semibold text-rose-500 hover:underline"
                  >
                    Change
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Watermark Text
                    </label>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="e.g. CONFIDENTIAL, DRAFT, SAMPLE"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-bold uppercase tracking-wider outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        <span>Font Size</span>
                        <span>{fontSize} pt</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="90"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        <span>Opacity</span>
                        <span>{Math.round(opacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.8"
                        step="0.05"
                        value={opacity}
                        onChange={(e) => setOpacity(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Rotation Angle
                      </label>
                      <select
                        value={angle}
                        onChange={(e) => setAngle(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-medium"
                      >
                        <option value={45}>Diagonal 45°</option>
                        <option value={0}>Horizontal 0°</option>
                        <option value={90}>Vertical 90°</option>
                        <option value={-45}>Reverse Diagonal -45°</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Watermark Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-9 h-9 rounded-xl border-0 cursor-pointer p-0 bg-transparent"
                        />
                        <span className="text-xs font-mono text-slate-500">{color}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAddWatermark}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-bold rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-xl shadow-rose-500/25 transition-all"
                >
                  <Stamp className="w-5 h-5" />
                  <span>Apply Watermark to PDF</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
