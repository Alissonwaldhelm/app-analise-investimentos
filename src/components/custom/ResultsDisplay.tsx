'use client';

import { TradingSignal } from '@/lib/signals';
import { IndicatorResult, OHLCData } from '@/lib/indicators';
import { TrendingUp, TrendingDown, Minus, Activity, BarChart3, Target } from 'lucide-react';

interface ResultsDisplayProps {
  signal: TradingSignal;
  indicators: IndicatorResult;
  data: OHLCData[];
}

export default function ResultsDisplay({ signal, indicators, data }: ResultsDisplayProps) {
  const lastIndex = data.length - 1;
  
  const getSignalColor = (type: string) => {
    switch (type) {
      case 'CALL':
        return 'from-green-500 to-emerald-600';
      case 'PUT':
        return 'from-red-500 to-rose-600';
      default:
        return 'from-gray-500 to-slate-600';
    }
  };
  
  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'CALL':
        return <TrendingUp className="w-8 h-8" />;
      case 'PUT':
        return <TrendingDown className="w-8 h-8" />;
      default:
        return <Minus className="w-8 h-8" />;
    }
  };
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-green-600';
    if (confidence >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Sinal Principal */}
      <div className={`
        relative overflow-hidden rounded-2xl p-6 sm:p-8
        bg-gradient-to-br ${getSignalColor(signal.type)}
        text-white shadow-2xl
      `}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
              {getSignalIcon(signal.type)}
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-1">
                {signal.type}
              </h2>
              <p className="text-white/90 text-sm">
                {signal.timestamp}
              </p>
            </div>
          </div>
          
          <div className="text-center sm:text-right">
            <div className="text-5xl sm:text-6xl font-bold mb-1">
              {signal.confidence}%
            </div>
            <p className="text-white/90 text-sm">
              Confiança
            </p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-white/20">
          <p className="text-lg font-semibold mb-2">Preço Atual</p>
          <p className="text-3xl font-bold">
            ${signal.price.toFixed(2)}
          </p>
        </div>
      </div>
      
      {/* Razões do Sinal */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">
            Análise Detalhada
          </h3>
        </div>
        
        <ul className="space-y-3">
          {signal.reasons.map((reason, index) => (
            <li
              key={index}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                {index + 1}
              </div>
              <p className="text-gray-700 text-sm sm:text-base flex-1">
                {reason}
              </p>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* RSI */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-purple-600" />
            <h4 className="font-bold text-gray-900">RSI</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-600">Valor Atual</span>
              <span className={`text-2xl font-bold ${getConfidenceColor(indicators.rsi[lastIndex])}`}>
                {indicators.rsi[lastIndex].toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, indicators.rsi[lastIndex])}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Sobrevendido (&lt;30)</span>
              <span>Sobrecomprado (&gt;70)</span>
            </div>
          </div>
        </div>
        
        {/* MACD */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-gray-900">MACD</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">MACD</span>
              <span className="text-lg font-bold text-gray-900">
                {indicators.macd.macd[lastIndex].toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Signal</span>
              <span className="text-lg font-bold text-gray-900">
                {indicators.macd.signal[lastIndex].toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Histogram</span>
              <span className={`text-lg font-bold ${
                indicators.macd.histogram[lastIndex] > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {indicators.macd.histogram[lastIndex].toFixed(4)}
              </span>
            </div>
          </div>
        </div>
        
        {/* SMA */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h4 className="font-bold text-gray-900">SMA (20)</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-600">Valor</span>
              <span className="text-2xl font-bold text-gray-900">
                ${indicators.sma[lastIndex].toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-600">vs Preço</span>
              <span className={`text-lg font-semibold ${
                data[lastIndex].close > indicators.sma[lastIndex] ? 'text-green-600' : 'text-red-600'
              }`}>
                {data[lastIndex].close > indicators.sma[lastIndex] ? 'Acima' : 'Abaixo'}
              </span>
            </div>
          </div>
        </div>
        
        {/* EMA */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-cyan-600" />
            <h4 className="font-bold text-gray-900">EMA (20)</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-600">Valor</span>
              <span className="text-2xl font-bold text-gray-900">
                ${indicators.ema[lastIndex].toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-600">vs Preço</span>
              <span className={`text-lg font-semibold ${
                data[lastIndex].close > indicators.ema[lastIndex] ? 'text-green-600' : 'text-red-600'
              }`}>
                {data[lastIndex].close > indicators.ema[lastIndex] ? 'Acima' : 'Abaixo'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dados do Arquivo */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="font-bold text-gray-900 mb-4">Informações do Dataset</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total de Registros</p>
            <p className="text-2xl font-bold text-gray-900">{data.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Primeiro Registro</p>
            <p className="text-sm font-semibold text-gray-900">{data[0].time}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Último Registro</p>
            <p className="text-sm font-semibold text-gray-900">{data[lastIndex].time}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Volume Médio</p>
            <p className="text-lg font-bold text-gray-900">
              {(data.reduce((sum, d) => sum + d.volume, 0) / data.length).toFixed(0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
