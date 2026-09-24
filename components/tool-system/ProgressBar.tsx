'use client';

import React from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProgressBarProps {
  progress?: number; // 0 to 100
  statusText?: string;
  isCompleted?: boolean;
}

export function ProgressBar({
  progress = 40,
  statusText = 'Processing your document...',
  isCompleted = false,
}: ProgressBarProps) {
  return (
    <div className="w-full max-w-xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{statusText}</p>
            <p className="text-xs text-slate-400">Processing locally in WebAssembly</p>
          </div>
        </div>

        {progress !== undefined && (
          <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
            {progress}%
          </span>
        )}
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
        />
      </div>
    </div>
  );
}
