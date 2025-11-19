'use client';

import { Upload, FileText, Download } from 'lucide-react';
import { useCallback } from 'react';
import { generateSampleCSV } from '@/lib/csvParser';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function UploadZone({ onFileSelect, isProcessing }: UploadZoneProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (isProcessing) return;
      
      const files = Array.from(e.dataTransfer.files);
      const csvFile = files.find(f => f.name.endsWith('.csv'));
      
      if (csvFile) {
        onFileSelect(csvFile);
      }
    },
    [onFileSelect, isProcessing]
  );
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.name.endsWith('.csv')) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );
  
  const downloadSample = useCallback(() => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exemplo-ohlc.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);
  
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 sm:p-12
          transition-all duration-300 ease-in-out
          ${isProcessing 
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-60' 
            : 'border-blue-300 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-400 cursor-pointer'
          }
        `}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          id="file-upload"
        />
        
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className={`
            p-4 rounded-full transition-colors
            ${isProcessing ? 'bg-gray-200' : 'bg-blue-100'}
          `}>
            {isProcessing ? (
              <FileText className="w-8 h-8 text-gray-500 animate-pulse" />
            ) : (
              <Upload className="w-8 h-8 text-blue-600" />
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isProcessing ? 'Processando arquivo...' : 'Faça upload do arquivo CSV'}
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              Arraste e solte ou clique para selecionar
            </p>
            <p className="text-xs text-gray-500">
              Formato: time, open, high, low, close, volume
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={downloadSample}
          disabled={isProcessing}
          className="
            inline-flex items-center gap-2 px-4 py-2 
            text-sm font-medium text-blue-600 
            hover:text-blue-700 hover:bg-blue-50 
            rounded-lg transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <Download className="w-4 h-4" />
          Baixar arquivo de exemplo
        </button>
      </div>
    </div>
  );
}
