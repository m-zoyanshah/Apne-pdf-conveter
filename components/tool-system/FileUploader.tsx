'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, Plus, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { formatBytes } from '@/lib/pdf-service';

interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeBytes?: number; // default 50MB
  onFilesSelected: (files: File[]) => void;
  title?: string;
  subtitle?: string;
  allowedTypesDescription?: string;
}

export function FileUploader({
  accept = '.pdf,application/pdf',
  multiple = false,
  maxFiles = 20,
  maxSizeBytes = 50 * 1024 * 1024, // 50 MB
  onFilesSelected,
  title = 'Drop PDF files here',
  subtitle = 'or click to browse from your device',
  allowedTypesDescription = 'PDF files up to 50MB',
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateAndAddFiles = (fileList: FileList | null) => {
    setError(null);
    if (!fileList || fileList.length === 0) return;

    const filesArray = Array.from(fileList);

    // Limit files
    if (!multiple && filesArray.length > 1) {
      setError('Only one file is accepted for this tool. Please select a single file.');
      return;
    }

    if (filesArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files can be uploaded at once.`);
      return;
    }

    const validFiles: File[] = [];

    for (const f of filesArray) {
      // Check size
      if (f.size > maxSizeBytes) {
        setError(`File "${f.name}" exceeds the maximum limit of ${formatBytes(maxSizeBytes)}.`);
        return;
      }

      // Check type if accept includes pdf
      if (accept.includes('pdf')) {
        const isPdf = f.type.includes('pdf') || f.name.toLowerCase().endsWith('.pdf');
        if (!isPdf && !accept.includes('image')) {
          setError(`File "${f.name}" is not a valid PDF document.`);
          return;
        }
      }

      // Check type if accept includes images
      if (accept.includes('image')) {
        const isImg = f.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(f.name);
        if (!isImg && !accept.includes('pdf')) {
          setError(`File "${f.name}" is not a supported image format.`);
          return;
        }
      }

      validFiles.push(f);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    validateAndAddFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    validateAndAddFiles(e.target.files);
    // Reset input value so re-uploading same file name triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-blue-500/80 dark:hover:border-blue-400 hover:bg-slate-50/50 dark:hover:bg-slate-900 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-200 ${
              isDragging
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
            }`}
          >
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Choose {multiple ? 'Files' : 'File'}</span>
            </span>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 pt-2">
            {allowedTypesDescription} • Processed privately in your browser
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
