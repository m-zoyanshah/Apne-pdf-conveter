'use client';

import React from 'react';
import {
  Download,
  RotateCcw,
  CheckCircle2,
  FileCheck,
  Share2,
  Sparkles,
  TrendingDown,
} from 'lucide-react';
import { formatBytes } from '@/lib/pdf-service';

interface ResultCardProps {
  fileName: string;
  fileSize?: number;
  originalSize?: number;
  onDownload: () => void;
  onReset: () => void;
  title?: string;
  subtitle?: string;
  extraAction?: React.ReactNode;
}

export function ResultCard({
  fileName,
  fileSize,
  originalSize,
  onDownload,
  onReset,
  title = 'Your PDF is Ready!',
  subtitle = 'The document has been processed with real pixel accuracy.',
  extraAction,
}: ResultCardProps) {
  const hasSavings = originalSize && fileSize && fileSize < originalSize;
  const savingsPercent = hasSavings
    ? Math.round(((originalSize - fileSize) / originalSize) * 100)
    : 0;

  return (
    <div className="w-full max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
      <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800/80 shadow-lg shadow-emerald-500/10">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>

      {/* File Info Box */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-left space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
              {fileName}
            </span>
          </div>
          {fileSize && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
              {formatBytes(fileSize)}
            </span>
          )}
        </div>

        {hasSavings && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/80 text-xs">
            <span className="text-slate-500">
              Original: <span className="line-through">{formatBytes(originalSize)}</span>
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
              <TrendingDown className="w-3.5 h-3.5" />
              {savingsPercent}% Size Reduction
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onDownload}
          className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-bold rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Download className="w-5 h-5 stroke-[2.2]" />
          <span>Download PDF</span>
        </button>

        <button
          onClick={onReset}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Process Another</span>
        </button>
      </div>

      {extraAction && <div className="pt-2">{extraAction}</div>}
    </div>
  );
}
