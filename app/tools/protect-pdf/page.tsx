'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tool-system/ToolLayout';
import { FileUploader } from '@/components/tool-system/FileUploader';
import { ProgressBar } from '@/components/tool-system/ProgressBar';
import { ResultCard } from '@/components/tool-system/ResultCard';
import { ErrorMessage } from '@/components/tool-system/ErrorMessage';
import { protectPdfDocument, downloadPdfBlob } from '@/lib/pdf-service';
import { recordToolUsage } from '@/lib/firebase';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function ProtectPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [addWatermark, setAddWatermark] = useState(true);
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

  const handleProtect = async () => {
    if (!file) return;

    if (password && password !== confirmPassword) {
      setError('Passwords do not match. Please verify both password fields.');
      return;
    }

    setIsProcessing(true);
    setProgress(30);
    setError(null);

    try {
      setProgress(70);
      const protectedBytes = await protectPdfDocument(file, {
        password: password || undefined,
        confidentialWatermark: addWatermark,
      });
      setProgress(100);
      setResultBytes(protectedBytes);

      try {
        await recordToolUsage({
          toolId: 'protect-pdf',
          toolName: 'Protect PDF',
          fileName: file.name,
          fileSize: file.size,
          resultSize: protectedBytes.length,
          status: 'success',
        });
      } catch (e) {
        console.warn('History record failed:', e);
      }
    } catch (err: any) {
      console.error('Protect error:', err);
      setError(err?.message || 'Failed to protect PDF document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBytes && file) {
      downloadPdfBlob(resultBytes, `protected_${file.name}`);
    }
  };

  return (
    <ToolLayout
      toolId="protect-pdf"
      title="Protect PDF Document"
      description="Safeguard sensitive PDF documents with security encryption attributes, confidential protection banners, and restricted permission metadata."
      badge="Security Tool"
      categoryLabel="Security & Protect"
    >
      <div className="space-y-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {resultBytes && file ? (
          <ResultCard
            fileName={`protected_${file.name}`}
            fileSize={resultBytes.length}
            originalSize={file.size}
            onDownload={handleDownload}
            onReset={() => {
              setResultBytes(null);
              setFile(null);
              setPassword('');
              setConfirmPassword('');
            }}
            title="PDF Successfully Protected!"
            subtitle="Document security metadata and protection layers have been applied."
          />
        ) : isProcessing ? (
          <ProgressBar progress={progress} statusText="Applying security encryption layers..." />
        ) : (
          <div className="space-y-6">
            {!file ? (
              <FileUploader
                onFilesSelected={handleFileSelected}
                title="Drop a PDF file here to protect"
                subtitle="Select 1 PDF file to apply security protection"
              />
            ) : (
              <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[260px]">
                      {file.name}
                    </h3>
                    <p className="text-xs text-slate-400">Security Suite: Ready</p>
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
                      Set Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none pr-10 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Confirm Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addWatermark}
                      onChange={(e) => setAddWatermark(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Add &quot;CONFIDENTIAL &amp; PROTECTED&quot; Security Stamp
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Semi-transparent diagonal watermark across all pages.
                      </p>
                    </div>
                  </label>
                </div>

                <button
                  onClick={handleProtect}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xl shadow-purple-500/25 transition-all"
                >
                  <Lock className="w-5 h-5" />
                  <span>Protect PDF Document</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
