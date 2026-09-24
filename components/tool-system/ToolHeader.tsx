'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/components/Providers';
import { ChevronRight, Star, ShieldCheck, Sparkles } from 'lucide-react';

interface ToolHeaderProps {
  toolId: string;
  title: string;
  description: string;
  badge?: string;
  categoryLabel?: string;
  isAi?: boolean;
}

export function ToolHeader({
  toolId,
  title,
  description,
  badge,
  categoryLabel = 'PDF Tool',
  isAi = false,
}: ToolHeaderProps) {
  const { favorites, toggleFavorite } = useApp();
  const isFav = favorites.includes(toolId);

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
        <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        <Link href="/tools" className="hover:text-blue-600 dark:hover:text-blue-400">
          Tools
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        <span className="text-slate-800 dark:text-slate-200 font-semibold">{title}</span>
      </div>

      {/* Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            {badge && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isAi
                    ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                }`}
              >
                {isAi && <Sparkles className="w-3 h-3 text-indigo-500" />}
                {badge}
              </span>
            )}
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
              {categoryLabel}
            </span>
          </div>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            {description}
          </p>

          <div className="flex items-center gap-3 pt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Client-Side Safe Processing
            </span>
            <span>•</span>
            <span>Zero Server File Retention</span>
          </div>
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => toggleFavorite(toolId)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
            isFav
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
          <span>{isFav ? 'Favorited' : 'Favorite'}</span>
        </button>
      </div>
    </div>
  );
}
