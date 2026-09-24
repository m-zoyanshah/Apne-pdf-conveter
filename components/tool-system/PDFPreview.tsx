'use client';

import React, { useEffect, useState } from 'react';
import { renderPdfPages, RenderedPage } from '@/lib/pdfjs-renderer';
import { Loader2, Check, RotateCw, Trash2, ZoomIn, ZoomOut, CheckSquare, Square } from 'lucide-react';

interface PageSelectorProps {
  file: File;
  selectedPages: number[]; // 1-indexed
  onTogglePage: (pageNumber: number) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  actionLabel?: string;
  badgeType?: 'select' | 'delete' | 'extract';
}

export function PageSelector({
  file,
  selectedPages,
  onTogglePage,
  onSelectAll,
  onDeselectAll,
  badgeType = 'select',
}: PageSelectorProps) {
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    async function loadPages() {
      setLoading(true);
      setError(null);
      try {
        const rendered = await renderPdfPages(file, 60, 0.4);
        if (!isCancelled) {
          setPages(rendered);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Render PDF pages error:', err);
        if (!isCancelled) {
          setError('Could not generate visual thumbnails. You can still process the document by page numbers.');
          setLoading(false);
        }
      }
    }

    loadPages();
    return () => {
      isCancelled = true;
    };
  }, [file]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Generating page thumbnails...
        </p>
        <p className="text-xs text-slate-400">Rendering directly in your browser</p>
      </div>
    );
  }

  if (error || pages.length === 0) {
    return (
      <div className="p-6 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-3xl text-center space-y-2">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
          Document loaded successfully
        </p>
        <p className="text-xs text-amber-700/80 dark:text-amber-400">
          {error || 'Page count detected: processing ready.'}
        </p>
      </div>
    );
  }

  const allSelected = pages.length > 0 && selectedPages.length === pages.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            Pages ({pages.length})
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-semibold">
            {selectedPages.length} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onSelectAll && (
            <button
              type="button"
              onClick={allSelected ? onDeselectAll : onSelectAll}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              {allSelected ? <Square className="w-3.5 h-3.5" /> : <CheckSquare className="w-3.5 h-3.5" />}
              <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[480px] overflow-y-auto p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
        {pages.map((p) => {
          const isSelected = selectedPages.includes(p.pageNumber);
          return (
            <div
              key={p.pageNumber}
              onClick={() => onTogglePage(p.pageNumber)}
              className={`group relative flex flex-col items-center p-2 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? badgeType === 'delete'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-500/30'
                    : 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              {/* Badge indicator */}
              <div
                className={`absolute top-3 right-3 z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-transform group-hover:scale-110 ${
                  isSelected
                    ? badgeType === 'delete'
                      ? 'bg-rose-600 text-white'
                      : 'bg-blue-600 text-white'
                    : 'bg-white/90 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700'
                }`}
              >
                {isSelected ? (
                  badgeType === 'delete' ? (
                    <Trash2 className="w-3.5 h-3.5" />
                  ) : (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  )
                ) : (
                  <span className="text-[10px]">{p.pageNumber}</span>
                )}
              </div>

              {/* Page Thumbnail Image */}
              <div className="w-full aspect-[1/1.4] bg-white rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex items-center justify-center mb-2">
                <img
                  src={p.dataUrl}
                  alt={`Page ${p.pageNumber}`}
                  className="w-full h-full object-contain"
                />
              </div>

              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Page {p.pageNumber}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
