'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tool-system/ToolLayout';
import { FileUploader } from '@/components/tool-system/FileUploader';
import { ProgressBar } from '@/components/tool-system/ProgressBar';
import { ResultCard } from '@/components/tool-system/ResultCard';
import { ErrorMessage } from '@/components/tool-system/ErrorMessage';
import { extractFullTextWithPdfJs } from '@/lib/pdfjs-renderer';
import { recordToolUsage } from '@/lib/firebase';
import { Table, Download, CheckCircle2 } from 'lucide-react';

export default function PdfToExcelPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [csvContent, setCsvContent] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);

  const handleFileSelected = (files: File[]) => {
    if (files[0]) {
      setFile(files[0]);
      setError(null);
      setCsvContent(null);
      setPreviewRows([]);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(25);
    setError(null);

    try {
      setProgress(60);
      const res = await extractFullTextWithPdfJs(file);

      // Parse lines into table rows
      const rows: string[][] = [];
      res.pages.forEach((page) => {
        const lines = page.text.split('\n');
        lines.forEach((line) => {
          const trimmed = line.trim();
          if (trimmed) {
            // Split by tabs or multiple spaces
            const cells = trimmed.split(/\t+|\s{2,}/);
            rows.push(cells);
          }
        });
      });

      // Build CSV
      const csv = rows
        .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
        .join('\n');

      setProgress(100);
      setCsvContent(csv);
      setPreviewRows(rows.slice(0, 10)); // Top 10 rows preview

      try {
        await recordToolUsage({
          toolId: 'pdf-to-excel',
          toolName: 'PDF to Excel',
          fileName: file.name,
          fileSize: file.size,
          resultSize: csv.length,
          pageCount: res.pages.length,
          status: 'success',
        });
      } catch (e) {
        console.warn('History record failed:', e);
      }
    } catch (err: any) {
      console.error('PDF to Excel error:', err);
      setError(err?.message || 'Failed to extract spreadsheet data from PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (csvContent && file) {
      const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace(/\.pdf$/i, '')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }
  };

  return (
    <ToolLayout
      toolId="pdf-to-excel"
      title="PDF to Excel Converter"
      description="Extract financial tables, numbers, and structured data rows from PDF reports into clean CSV spreadsheets compatible with Microsoft Excel and Google Sheets."
      badge="Table Extractor"
      categoryLabel="Convert PDF"
    >
      <div className="space-y-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {csvContent && file ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            <ResultCard
              fileName={`${file.name.replace(/\.pdf$/i, '')}.csv`}
              fileSize={csvContent.length}
              originalSize={file.size}
              onDownload={handleDownload}
              onReset={() => {
                setCsvContent(null);
                setFile(null);
                setPreviewRows([]);
              }}
              title="PDF Converted to Spreadsheet!"
              subtitle="Tables and data lines extracted into universal CSV format."
            />

            {/* Table Preview */}
            {previewRows.length > 0 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Spreadsheet Preview (First {previewRows.length} Rows)
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-xs text-left text-slate-700 dark:text-slate-300">
                    <tbody>
                      {previewRows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className={rIdx % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800/40' : ''}
                        >
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className="px-3 py-2 border-r border-slate-100 dark:border-slate-800 font-mono truncate max-w-[200px]"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : isProcessing ? (
          <ProgressBar progress={progress} statusText="Detecting data rows and tabular columns..." />
        ) : (
          <div className="space-y-6">
            {!file ? (
              <FileUploader
                onFilesSelected={handleFileSelected}
                title="Drop a PDF file here to extract tables to Excel"
                subtitle="Supports invoices, statements, and tabular reports"
              />
            ) : (
              <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-center">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                  <Table className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {file.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Ready to parse into spreadsheet</p>
                </div>

                <button
                  onClick={handleConvert}
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/25 transition-all"
                >
                  <Table className="w-5 h-5" />
                  <span>Convert to Excel / CSV</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
