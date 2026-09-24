'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ToolLayout } from '@/components/tool-system/ToolLayout';
import { FileUploader } from '@/components/tool-system/FileUploader';
import { ProgressBar } from '@/components/tool-system/ProgressBar';
import { ResultCard } from '@/components/tool-system/ResultCard';
import { ErrorMessage } from '@/components/tool-system/ErrorMessage';
import { renderPdfPages, RenderedPage } from '@/lib/pdfjs-renderer';
import { loadPdfDoc, downloadPdfBlob } from '@/lib/pdf-service';
import { recordToolUsage } from '@/lib/firebase';
import { PDFDocument, rgb } from 'pdf-lib';
import {
  FileEdit,
  Type,
  Pencil,
  Highlighter,
  Square,
  RotateCcw,
  Download,
  ChevronLeft,
  ChevronRight,
  Palette,
} from 'lucide-react';

export default function PdfEditorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTool, setActiveTool] = useState<'draw' | 'highlight' | 'text' | 'rect'>('draw');
  const [drawColor, setDrawColor] = useState('#2563eb');
  const [lineWidth, setLineWidth] = useState(3);
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);

  // Overlay canvas for drawings
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    if (!files[0]) return;
    const selected = files[0];
    setFile(selected);
    setError(null);
    setResultBytes(null);

    try {
      const rendered = await renderPdfPages(selected, 15, 1.2);
      setPages(rendered);
      setCurrentPage(1);
    } catch (e) {
      console.warn('PDF render warning:', e);
      setError('Could not render PDF pages for visual editor.');
    }
  };

  const activePageData = pages.find((p) => p.pageNumber === currentPage);

  // Clear overlay when page changes
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [currentPage]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (activeTool === 'text') {
      if (textInput.trim()) {
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = drawColor;
        ctx.fillText(textInput, x, y);
      }
      return;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (activeTool === 'highlight') {
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)'; // Translucent yellow
      ctx.lineWidth = 18;
      ctx.lineCap = 'square';
    } else if (activeTool === 'draw') {
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleExportPdf = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(30);
    setError(null);

    try {
      // Create a copy of the PDF document
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      // Embed annotations from overlay canvas into the current page
      const overlayCanvas = overlayCanvasRef.current;
      if (overlayCanvas) {
        const overlayDataUrl = overlayCanvas.toDataURL('image/png');
        const base64Data = overlayDataUrl.replace(/^data:image\/png;base64,/, '');
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const embeddedOverlay = await pdfDoc.embedPng(bytes);
        const targetPage = pdfDoc.getPage(currentPage - 1);
        const { width, height } = targetPage.getSize();

        targetPage.drawImage(embeddedOverlay, {
          x: 0,
          y: 0,
          width,
          height,
        });
      }

      setProgress(80);
      const savedBytes = await pdfDoc.save();
      setProgress(100);
      setResultBytes(savedBytes);

      try {
        await recordToolUsage({
          toolId: 'pdf-editor',
          toolName: 'PDF Editor',
          fileName: file.name,
          fileSize: file.size,
          resultSize: savedBytes.length,
          status: 'success',
        });
      } catch (e) {
        console.warn('History record failed:', e);
      }
    } catch (err: any) {
      console.error('Editor export error:', err);
      setError(err?.message || 'Failed to export edited PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBytes && file) {
      downloadPdfBlob(resultBytes, `edited_${file.name}`);
    }
  };

  return (
    <ToolLayout
      toolId="pdf-editor"
      title="PDF Editor & Annotator"
      description="Add custom text notes, highlight critical paragraphs, draw freehand diagrams, and export your modified PDF with guaranteed privacy."
      badge="Interactive Workspace"
      categoryLabel="Edit & Sign"
    >
      <div className="space-y-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {resultBytes && file ? (
          <ResultCard
            fileName={`edited_${file.name}`}
            fileSize={resultBytes.length}
            originalSize={file.size}
            onDownload={handleDownload}
            onReset={() => {
              setResultBytes(null);
              setFile(null);
            }}
            title="PDF Successfully Saved!"
            subtitle="All your annotations, drawings, and text notes have been rendered into the PDF."
          />
        ) : isProcessing ? (
          <ProgressBar progress={progress} statusText="Rendering edits into PDF document..." />
        ) : (
          <div className="space-y-6">
            {!file ? (
              <FileUploader
                onFilesSelected={handleFileSelected}
                title="Drop a PDF file here to edit and annotate"
                subtitle="Select 1 PDF file to open in visual canvas workspace"
              />
            ) : (
              <div className="space-y-6 max-w-5xl mx-auto">
                {/* Editor Toolbar */}
                <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
                  {/* Tool Selection */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setActiveTool('draw')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeTool === 'draw'
                          ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Draw</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTool('highlight')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeTool === 'highlight'
                          ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Highlighter className="w-3.5 h-3.5" />
                      <span>Highlight</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTool('text')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeTool === 'text'
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Type className="w-3.5 h-3.5" />
                      <span>Add Text</span>
                    </button>
                  </div>

                  {/* Options based on tool */}
                  {activeTool === 'text' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Text to stamp (click on page)..."
                        className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 w-52 outline-none"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-slate-400" />
                      <input
                        type="color"
                        value={drawColor}
                        onChange={(e) => setDrawColor(e.target.value)}
                        className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                      />
                    </div>
                  )}

                  {/* Page Navigation & Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={clearCanvas}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200"
                    >
                      Clear
                    </button>

                    {pages.length > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-30"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-bold px-2">
                          {currentPage} / {pages.length}
                        </span>
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(pages.length, p + 1))}
                          disabled={currentPage === pages.length}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-30"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <button
                      onClick={handleExportPdf}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export PDF</span>
                    </button>
                  </div>
                </div>

                {/* Canvas Workspace */}
                <div className="flex justify-center p-4 rounded-3xl bg-slate-200/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 overflow-x-auto">
                  <div className="relative shadow-2xl rounded-xl overflow-hidden bg-white">
                    {/* Background PDF page */}
                    {activePageData ? (
                      <img
                        src={activePageData.dataUrl}
                        alt={`Page ${currentPage}`}
                        className="block max-w-full h-auto pointer-events-none"
                      />
                    ) : (
                      <div className="w-[595px] h-[842px] bg-white flex items-center justify-center text-slate-400">
                        Page Canvas
                      </div>
                    )}

                    {/* Interactive drawing overlay */}
                    <canvas
                      ref={overlayCanvasRef}
                      width={activePageData?.width || 595}
                      height={activePageData?.height || 842}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
