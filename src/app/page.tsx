'use client';

import { useState, useEffect } from 'react';
import { parseCSV } from '@/lib/csvParser';
import { calculateAllIndicators, OHLCData, IndicatorResult } from '@/lib/indicators';
import { generateSignal, TradingSignal } from '@/lib/signals';
import UploadZone from '@/components/custom/UploadZone';
import ResultsDisplay from '@/components/custom/ResultsDisplay';
import { TrendingUp, AlertCircle, RotateCcw } from 'lucide-react';

interface AnalysisData {
  data: OHLCData[];
  indicators: IndicatorResult;
  signal: TradingSignal;
}

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);

  // Carregar dados salvos do Local Storage
  useEffect(() => {
    const savedData = localStorage.getItem('investment-analysis');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setAnalysis(parsed);
      } catch (err) {
        console.error('Erro ao carregar dados salvos:', err);
      }
    }
  }, []);

  // Salvar dados no Local Storage quando houver análise
  useEffect(() => {
    if (analysis) {
      localStorage.setItem('investment-analysis', JSON.stringify(analysis));
    }
  }, [analysis]);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const content = await file.text();
      const parseResult = parseCSV(content);
      
      if (!parseResult.success || !parseResult.data) {
        setError(parseResult.error || 'Erro ao processar arquivo');
        setIsProcessing(false);
        return;
      }
      
      // Calcular indicadores
      const indicators = calculateAllIndicators(parseResult.data);
      
      // Gerar sinal de trading
      const signal = generateSignal(parseResult.data, indicators);
      
      // Salvar análise
      setAnalysis({
        data: parseResult.data,
        indicators,
        signal
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao processar arquivo');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setError(null);
    localStorage.removeItem('investment-analysis');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Análise de Investimentos
                </h1>
                <p className="text-sm text-gray-600 hidden sm:block">
                  Indicadores técnicos e sinais de trading
                </p>
              </div>
            </div>
            
            {analysis && (
              <button
                onClick={handleReset}
                className="
                  inline-flex items-center gap-2 px-4 py-2
                  text-sm font-medium text-gray-700
                  bg-white hover:bg-gray-50
                  border border-gray-300 rounded-lg
                  transition-colors shadow-sm
                "
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Nova Análise</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Erro ao processar arquivo</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Upload Zone ou Results */}
        {!analysis ? (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Análise Técnica Automatizada
              </h2>
              <p className="text-lg text-gray-600">
                Faça upload de um arquivo CSV com dados OHLC e receba sinais de trading
                baseados em indicadores técnicos profissionais
              </p>
            </div>
            
            <UploadZone
              onFileSelect={handleFileSelect}
              isProcessing={isProcessing}
            />
            
            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">SMA & EMA</h3>
                <p className="text-sm text-gray-600">
                  Médias móveis simples e exponenciais para identificar tendências
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">RSI</h3>
                <p className="text-sm text-gray-600">
                  Índice de força relativa para detectar sobrecompra e sobrevenda
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">MACD</h3>
                <p className="text-sm text-gray-600">
                  Convergência e divergência de médias móveis para momentum
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Sinais</h3>
                <p className="text-sm text-gray-600">
                  Recomendações CALL/PUT com nível de confiança calculado
                </p>
              </div>
            </div>
          </div>
        ) : (
          <ResultsDisplay
            signal={analysis.signal}
            indicators={analysis.indicators}
            data={analysis.data}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            ⚠️ Este app é apenas para fins educacionais. Não constitui aconselhamento financeiro.
          </p>
        </div>
      </footer>
    </div>
  );
}
