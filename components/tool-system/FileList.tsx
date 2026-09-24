'use client';

import React from 'react';
import { FileText, Trash2, ArrowUp, ArrowDown, Plus, CheckCircle2 } from 'lucide-react';
import { formatBytes } from '@/lib/pdf-service';

interface FileListProps {
  files: File[];
  onRemove: (index: number) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  onClearAll: () => void;
  onAddMore?: () => void;
  allowReorder?: boolean;
}

export function FileList({
  files,
  onRemove,
  onMoveUp,
  onMoveDown,
  onClearAll,
  onAddMore,
  allowReorder = true,
}: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Selected Files ({files.length})
          </span>
          <span className="text-xs text-slate-400">
            Total: {formatBytes(files.reduce((acc, f) => acc + f.size, 0))}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onAddMore && (
            <button
              type="button"
              onClick={onAddMore}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add More</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 px-2 py-1"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {files.map((file, idx) => (
          <div
            key={`${file.name}-${file.size}-${idx}`}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/50 dark:border-blue-800/50">
                <FileText className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {file.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{formatBytes(file.size)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-2">
              {allowReorder && onMoveUp && onMoveDown && files.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => onMoveUp(idx)}
                    disabled={idx === 0}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveDown(idx)}
                    disabled={idx === files.length - 1}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="p-1.5 text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors ml-1"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
