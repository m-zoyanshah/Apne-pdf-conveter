'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tool-system/ToolLayout';
import { FileUploader } from '@/components/tool-system/FileUploader';
import { ProgressBar } from '@/components/tool-system/ProgressBar';
import { ResultCard } from '@/components/tool-system/ResultCard';
import { ErrorMessage } from '@/components/tool-system/ErrorMessage';
import { compressPdf, downloadPdfBlob, formatBytes } from '@/lib/pdf-service';
import { recordToolUsage } from '@/lib/firebase';
import { Minimize2, Zap, ShieldCheck } from 'lucide-react';

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<'standard' | 'extreme'>('standard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    data: Uint8Array;
    originalSize: number;
    compressedSize: number;
  } | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files[0]) {
      setFile(files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(30);
    setError(null);

    try {
      setProgress(60);
      const res = await compressPdf(file, level);
      setProgress(100);
      setResult(res);

      // Record to Firestore
      try {
        await recordToolUsage({
          toolId: 'compress-pdf',
          toolName: 'Compress PDF',
          fileName: file.name,
          fileSize: res.originalSize,
          resultSize: res.compressedSize,
          status: 'success',
        });
      } catch (e) {
        console.warn('History record failed:', e);
      }
    } catch (err: any) {
      console.error('Compress error:', err);
      setError(err?.message || 'Failed to compress PDF file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result && file) {
      const outName = `compressed_${file.name}`;
      downloadPdfBlob(result.data, outName);
    }
  };

  return (
    <ToolLayout
      toolId="compress-pdf"
      title="Compress PDF File Size"
      description="Reduce PDF file size without sacrificing document quality. Optimize object streams and remove redundant references for faster email and web sharing."
      badge="Save Space"
      categoryLabel="Organize PDF"
      howToSteps={[
        { title: 'Select PDF', desc: 'Choose a PDF file from your device to compress.' },
        { title: 'Choose Level', desc: 'Select between Standard and Maximum stream optimization.' },
        { title: 'Download Smaller PDF', desc: 'Get your lightweight PDF with instant file size savings.' },
      ]}
    >
      <div className="space-y-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {result && file ? (
          <ResultCard
            fileName={`compressed_${file.name}`}
            fileSize={result.compressedSize}
            originalSize={result.originalSize}
            onDownload={handleDownload}
            onReset={() => {
              setResult(null);
              setFile(null);
            }}
            title="PDF Successfully Compressed!"
            subtitle="Your file has been optimized with lossless stream re-encoding."
          />
        ) : isProcessing ? (
          <ProgressBar progress={progress} statusText="Optimizing PDF object streams..." />
        ) : (
          <div className="space-y-6">
            {!file ? (
              <FileUploader
                onFilesSelected={handleFileSelected}
                title="Drop a PDF file here to compress"
                subtitle="Select 1 PDF file to reduce its size"
              />
            ) : (
              <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[260px]">
                      {file.name}
                    </h3>
                    <p className="text-xs text-slate-400">Current Size: {formatBytes(file.size)}</p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-xs font-semibold text-rose-500 hover:underline"
                  >
                    Change
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Select Compression Profile
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLevel('standard')}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        level === 'standard'
                          ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Standard
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Balanced size reduction while maintaining high fidelity.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLevel('extreme')}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        level === 'extreme'
                          ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Maximum
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Maximum stream stripping for emails and portals.
                      </p>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleCompress}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-bold rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-xl shadow-blue-500/25 transition-all"
                >
                  <Minimize2 className="w-5 h-5" />
                  <span>Compress PDF Now</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
