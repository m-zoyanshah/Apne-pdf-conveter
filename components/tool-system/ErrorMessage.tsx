'use client';

import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onDismiss, onRetry }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="w-full max-w-xl mx-auto p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/80 text-rose-800 dark:text-rose-200 shadow-sm flex items-start gap-3 animate-in fade-in">
      <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold">{message}</p>
        <p className="text-xs text-rose-700/80 dark:text-rose-300/80">
          Make sure your PDF is valid and not password-locked.
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 transition-colors"
            title="Retry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
