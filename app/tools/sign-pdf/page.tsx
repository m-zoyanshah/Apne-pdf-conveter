'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ToolLayout } from '@/components/tool-system/ToolLayout';
import { FileUploader } from '@/components/tool-system/FileUploader';
import { ProgressBar } from '@/components/tool-system/ProgressBar';
import { ResultCard } from '@/components/tool-system/ResultCard';
import { ErrorMessage } from '@/components/tool-system/ErrorMessage';
import { signPdfDocument, downloadPdfBlob } from '@/lib/pdf-service';
import { renderPdfPages, RenderedPage } from '@/lib/pdfjs-renderer';
import { recordToolUsage } from '@/lib/firebase';
import { PenTool, Type, Eraser, Check, RotateCcw } from 'lucide-react';

export default function SignPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [selectedPageNum, setSelectedPageNum] = useState(1);
  const [signMode, setSignMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);

  // Drawing canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Target placement position (normalized 0..1)
  const [signaturePos, setSignaturePos] = useState({ x: 0.6, y: 0.8 });

  const handleFileSelected = async (files: File[]) => {
    if (!files[0]) return;
    const selected = files[0];
    setFile(selected);
    setError(null);
    setResultBytes(null);

    try {
      const rendered = await renderPdfPages(selected, 20, 0.8);
      setPages(rendered);
      setSelectedPageNum(1);
    } catch (e) {
      console.warn('Preview render warning:', e);
    }
  };

  // Setup drawing canvas
  useEffect(() => {
    if (signMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [signMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasSignature(false);
  };

  const getSignatureDataUrl = (): string => {
    if (signMode === 'type') {
      // Render cursive typed signature onto offscreen canvas
      const offscreen = document.createElement('canvas');
      offscreen.width = 300;
      offscreen.height = 100;
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        ctx.font = 'italic 36px "Brush Script MT", cursive, sans-serif';
        ctx.fillStyle = '#1e3a8a';
        ctx.fillText(typedName || 'Signature', 20, 60);
      }
      return offscreen.toDataURL('image/png');
    } else {
      return canvasRef.current ? canvasRef.current.toDataURL('image/png') : '';
    }
  };

  const handleApplySignature = async () => {
    if (!file) return;

    if (signMode === 'type' && !typedName.trim()) {
      setError('Please type your name or signature.');
      return;
    }
    if (signMode === 'draw' && !hasSignature) {
      setError('Please draw your signature on the pad.');
      return;
    }

    setIsProcessing(true);
    setProgress(30);
    setError(null);

    try {
      const sigDataUrl = getSignatureDataUrl();
      setProgress(60);

      const signedBytes = await signPdfDocument(file, sigDataUrl, {
        pageNumber: selectedPageNum,
        x: signaturePos.x,
        y: signaturePos.y,
        width: 140,
        height: 50,
      });

      setProgress(100);
      setResultBytes(signedBytes);

      try {
        await recordToolUsage({
          toolId: 'sign-pdf',
          toolName: 'Sign PDF Document',
          fileName: file.name,
          fileSize: file.size,
          resultSize: signedBytes.length,
          status: 'success',
        });
      } catch (e) {
        console.warn('History record failed:', e);
      }
    } catch (err: any) {
      console.error('Sign error:', err);
      setError(err?.message || 'Failed to apply signature to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBytes && file) {
      downloadPdfBlob(resultBytes, `signed_${file.name}`);
    }
  };

  const activePagePreview = pages.find((p) => p.pageNumber === selectedPageNum);

  return (
    <ToolLayout
      toolId="sign-pdf"
      title="Sign PDF Document"
      description="Draw your electronic signature or type cursive name. Position signature precisely on any page of your contract or agreement."
      badge="Electronic Sign"
      categoryLabel="Edit & Sign"
    >
      <div className="space-y-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {resultBytes && file ? (
          <ResultCard
            fileName={`signed_${file.name}`}
            fileSize={resultBytes.length}
            originalSize={file.size}
            onDownload={handleDownload}
            onReset={() => {
              setResultBytes(null);
              setFile(null);
              clearSignature();
            }}
            title="PDF Successfully Signed!"
            subtitle={`Signature placed on page ${selectedPageNum} with digital stamp.`}
          />
        ) : isProcessing ? (
          <ProgressBar progress={progress} statusText="Embedding signature onto document..." />
        ) : (
          <div className="space-y-6">
            {!file ? (
              <FileUploader
                onFilesSelected={handleFileSelected}
                title="Drop a PDF file here to sign"
                subtitle="Select 1 PDF contract, agreement, or form"
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl mx-auto">
                {/* Left Panel: Signature Pad & Placement Controls */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Signature Creation
                      </span>
                      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs">
                        <button
                          type="button"
                          onClick={() => setSignMode('draw')}
                          className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                            signMode === 'draw'
                              ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                              : 'text-slate-500'
                          }`}
                        >
                          Draw
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignMode('type')}
                          className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                            signMode === 'type'
                              ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                              : 'text-slate-500'
                          }`}
                        >
                          Type
                        </button>
                      </div>
                    </div>

                    {signMode === 'draw' ? (
                      <div className="space-y-2">
                        <div className="relative border border-slate-200 dark:border-slate-700 rounded-2xl bg-white overflow-hidden shadow-inner">
                          <canvas
                            ref={canvasRef}
                            width={320}
                            height={140}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="w-full h-[140px] cursor-crosshair touch-none"
                          />
                          {!hasSignature && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-slate-300 font-medium">
                              Draw your signature here
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={clearSignature}
                          className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1"
                        >
                          <Eraser className="w-3.5 h-3.5" />
                          <span>Clear Pad</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={typedName}
                          onChange={(e) => setTypedName(e.target.value)}
                          placeholder="Type your full name..."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none focus:border-blue-500"
                        />
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                          <p className="font-serif italic text-2xl text-blue-900 dark:text-blue-300">
                            {typedName || 'Your Signature'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Page Choice */}
                    {pages.length > 1 && (
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Sign on Page:
                        </label>
                        <select
                          value={selectedPageNum}
                          onChange={(e) => setSelectedPageNum(parseInt(e.target.value, 10))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-medium"
                        >
                          {pages.map((p) => (
                            <option key={p.pageNumber} value={p.pageNumber}>
                              Page {p.pageNumber} of {pages.length}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Position Preset selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Placement Position
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                        <button
                          type="button"
                          onClick={() => setSignaturePos({ x: 0.6, y: 0.85 })}
                          className={`p-2 rounded-xl border ${
                            signaturePos.y >= 0.8
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600'
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          Bottom Right (Default)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignaturePos({ x: 0.1, y: 0.85 })}
                          className={`p-2 rounded-xl border ${
                            signaturePos.x <= 0.2
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600'
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          Bottom Left
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleApplySignature}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-500/25 transition-all"
                    >
                      <PenTool className="w-5 h-5" />
                      <span>Sign &amp; Download PDF</span>
                    </button>
                  </div>
                </div>

                {/* Right Panel: Visual Page Preview with Signature indicator */}
                <div className="lg:col-span-7 flex flex-col items-center">
                  <div className="w-full p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-3">
                      Preview: Page {selectedPageNum}
                    </p>

                    <div className="relative max-w-sm w-full aspect-[1/1.414] bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                      {activePagePreview ? (
                        <img
                          src={activePagePreview.dataUrl}
                          alt={`Page ${selectedPageNum}`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                          Document Page
                        </div>
                      )}

                      {/* Simulated placed signature badge */}
                      <div
                        className="absolute p-1.5 rounded bg-blue-50/90 border border-blue-500 text-[10px] text-blue-900 font-bold shadow-md cursor-move pointer-events-none"
                        style={{
                          left: `${signaturePos.x * 100}%`,
                          top: `${signaturePos.y * 100}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        ✓ [Signed Signature]
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 text-center">
                      Click placement presets on left to position signature.
                    </p>
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
