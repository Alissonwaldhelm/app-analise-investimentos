import { IndicatorResult, OHLCData } from './indicators';

export type SignalType = 'CALL' | 'PUT' | 'NEUTRO';

export interface TradingSignal {
  type: SignalType;
  confidence: number; // 0-100
  reasons: string[];
  timestamp: string;
  price: number;
}

export function generateSignal(
  data: OHLCData[],
  indicators: IndicatorResult
): TradingSignal {
  const lastIndex = data.length - 1;
  const currentPrice = data[lastIndex].close;
  const currentTime = data[lastIndex].time;
  
  const reasons: string[] = [];
  let bullishSignals = 0;
  let bearishSignals = 0;
  
  // Análise RSI
  const currentRSI = indicators.rsi[lastIndex];
  if (!isNaN(currentRSI)) {
    if (currentRSI < 30) {
      bullishSignals++;
      reasons.push(`RSI em ${currentRSI.toFixed(2)} (sobrevendido)`);
    } else if (currentRSI > 70) {
      bearishSignals++;
      reasons.push(`RSI em ${currentRSI.toFixed(2)} (sobrecomprado)`);
    }
  }
  
  // Análise MACD
  const currentMACD = indicators.macd.macd[lastIndex];
  const currentSignal = indicators.macd.signal[lastIndex];
  const currentHistogram = indicators.macd.histogram[lastIndex];
  const prevHistogram = indicators.macd.histogram[lastIndex - 1];
  
  if (!isNaN(currentMACD) && !isNaN(currentSignal)) {
    // Cruzamento MACD
    if (currentMACD > currentSignal && !isNaN(prevHistogram) && prevHistogram < 0 && currentHistogram > 0) {
      bullishSignals += 2;
      reasons.push('MACD cruzou acima da linha de sinal (bullish crossover)');
    } else if (currentMACD < currentSignal && !isNaN(prevHistogram) && prevHistogram > 0 && currentHistogram < 0) {
      bearishSignals += 2;
      reasons.push('MACD cruzou abaixo da linha de sinal (bearish crossover)');
    }
    
    // Histograma crescente/decrescente
    if (!isNaN(prevHistogram)) {
      if (currentHistogram > prevHistogram && currentHistogram > 0) {
        bullishSignals++;
        reasons.push('Histograma MACD crescente (momentum positivo)');
      } else if (currentHistogram < prevHistogram && currentHistogram < 0) {
        bearishSignals++;
        reasons.push('Histograma MACD decrescente (momentum negativo)');
      }
    }
  }
  
  // Análise SMA vs Preço
  const currentSMA = indicators.sma[lastIndex];
  if (!isNaN(currentSMA)) {
    if (currentPrice > currentSMA) {
      bullishSignals++;
      reasons.push(`Preço acima da SMA (${currentSMA.toFixed(2)})`);
    } else if (currentPrice < currentSMA) {
      bearishSignals++;
      reasons.push(`Preço abaixo da SMA (${currentSMA.toFixed(2)})`);
    }
  }
  
  // Análise EMA vs Preço
  const currentEMA = indicators.ema[lastIndex];
  if (!isNaN(currentEMA)) {
    if (currentPrice > currentEMA) {
      bullishSignals++;
      reasons.push(`Preço acima da EMA (${currentEMA.toFixed(2)})`);
    } else if (currentPrice < currentEMA) {
      bearishSignals++;
      reasons.push(`Preço abaixo da EMA (${currentEMA.toFixed(2)})`);
    }
  }
  
  // Determinar sinal e confiança
  const totalSignals = bullishSignals + bearishSignals;
  let signalType: SignalType = 'NEUTRO';
  let confidence = 0;
  
  if (totalSignals === 0) {
    signalType = 'NEUTRO';
    confidence = 0;
    reasons.push('Indicadores insuficientes para gerar sinal');
  } else if (bullishSignals > bearishSignals) {
    signalType = 'CALL';
    confidence = Math.min(100, (bullishSignals / totalSignals) * 100);
  } else if (bearishSignals > bullishSignals) {
    signalType = 'PUT';
    confidence = Math.min(100, (bearishSignals / totalSignals) * 100);
  } else {
    signalType = 'NEUTRO';
    confidence = 50;
    reasons.push('Sinais conflitantes - aguardar confirmação');
  }
  
  return {
    type: signalType,
    confidence: Math.round(confidence),
    reasons,
    timestamp: currentTime,
    price: currentPrice
  };
}
