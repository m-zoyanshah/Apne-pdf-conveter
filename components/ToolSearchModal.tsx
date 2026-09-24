'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from './Providers';
import { ALL_TOOLS, CATEGORIES, PDFTool } from '@/data/tools';
import {
  Search,
  X,
  ArrowRight,
  Sparkles,
  Files,
  Scissors,
  Minimize2,
  RotateCw,
  Trash2,
  ArrowUpDown,
  FolderOutput,
  Image,
  FileImage,
  FileSpreadsheet,
  ImageDown,
  FileText,
  AlignLeft,
  FileType,
  Table,
  Lock,
  Stamp,
  PenTool,
  FileEdit,
  ScanText,
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Files,
  Scissors,
  Minimize2,
  RotateCw,
  Trash2,
  ArrowUpDown,
  FolderOutput,
  Image,
  FileImage,
  FileSpreadsheet,
  ImageDown,
  FileText,
  AlignLeft,
  FileType,
  Table,
  Lock,
  Stamp,
  PenTool,
  FileEdit,
  ScanText,
  Sparkles,
};

export function ToolSearchModal() {
  const { searchOpen, setSearchOpen } = useApp();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      const timer = setTimeout(() => {
        setQuery('');
        setSelectedCategory('all');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchOpen]);

  const filteredTools = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ALL_TOOLS.filter((tool) => {
      const matchCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      if (!matchCategory) return false;

      if (!q) return true;

      const inName = tool.name.toLowerCase().includes(q);
      const inDesc = tool.description.toLowerCase().includes(q);
      const inKeywords = tool.keywords.some((k) => k.toLowerCase().includes(q));
      return inName || inDesc || inKeywords;
    });
  }, [query, selectedCategory]);

  if (!searchOpen) return null;

  const handleSelectTool = (href: string) => {
    setSearchOpen(false);
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a tool name, e.g. 'merge', 'compress', 'jpg', 'sign'..."
            className="flex-1 bg-transparent text-base text-slate-900 dark:text-white placeholder-slate-400 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setSearchOpen(false)}
            className="px-2 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            ESC
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 p-3 overflow-x-auto border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-1.5 flex-1">
          {filteredTools.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-base font-medium">No tools found for &quot;{query}&quot;</p>
              <p className="text-xs mt-1 text-slate-500">
                Try searching for &quot;pdf&quot;, &quot;image&quot;, &quot;watermark&quot; or &quot;ai&quot;
              </p>
            </div>
          ) : (
            filteredTools.map((tool) => {
              const IconComp = ICON_MAP[tool.iconName] || FileText;
              return (
                <div
                  key={tool.id}
                  onClick={() => handleSelectTool(tool.href)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tool.bgColor}`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {tool.name}
                        </span>
                        {tool.badge && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-medium text-slate-400 capitalize hidden sm:inline">
                      {tool.categoryLabel}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>{filteredTools.length} tools available</span>
          <span>Tip: Press ⌘K anytime to open search</span>
        </div>
      </div>
    </div>
  );
}
