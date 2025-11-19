// Funções para cálculo de indicadores financeiros

export interface OHLCData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorResult {
  sma: number[];
  ema: number[];
  rsi: number[];
  macd: {
    macd: number[];
    signal: number[];
    histogram: number[];
  };
}

// Simple Moving Average
export function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
      continue;
    }
    
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / period);
  }
  
  return result;
}

// Exponential Moving Average
export function calculateEMA(data: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // Primeira EMA é uma SMA
  let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
      continue;
    }
    
    if (i === period - 1) {
      result.push(ema);
      continue;
    }
    
    ema = (data[i] - ema) * multiplier + ema;
    result.push(ema);
  }
  
  return result;
}

// Relative Strength Index
export function calculateRSI(data: number[], period: number = 14): number[] {
  const result: number[] = [];
  const changes: number[] = [];
  
  // Calcular mudanças de preço
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i] - data[i - 1]);
  }
  
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push(NaN);
      continue;
    }
    
    const recentChanges = changes.slice(i - period, i);
    const gains = recentChanges.filter(c => c > 0);
    const losses = recentChanges.filter(c => c < 0).map(c => Math.abs(c));
    
    const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0;
    
    if (avgLoss === 0) {
      result.push(100);
      continue;
    }
    
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    result.push(rsi);
  }
  
  return result;
}

// MACD (Moving Average Convergence Divergence)
export function calculateMACD(
  data: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  
  // MACD Line
  const macdLine: number[] = fastEMA.map((fast, i) => {
    if (isNaN(fast) || isNaN(slowEMA[i])) return NaN;
    return fast - slowEMA[i];
  });
  
  // Signal Line (EMA do MACD)
  const validMacd = macdLine.filter(v => !isNaN(v));
  const signalLine = calculateEMA(validMacd, signalPeriod);
  
  // Preencher com NaN até o início dos valores válidos
  const nanCount = macdLine.findIndex(v => !isNaN(v));
  const fullSignal = [
    ...Array(nanCount + signalPeriod - 1).fill(NaN),
    ...signalLine.filter(v => !isNaN(v))
  ];
  
  // Histogram
  const histogram: number[] = macdLine.map((macd, i) => {
    if (isNaN(macd) || isNaN(fullSignal[i])) return NaN;
    return macd - fullSignal[i];
  });
  
  return {
    macd: macdLine,
    signal: fullSignal,
    histogram
  };
}

// Calcular todos os indicadores
export function calculateAllIndicators(data: OHLCData[]): IndicatorResult {
  const closePrices = data.map(d => d.close);
  
  return {
    sma: calculateSMA(closePrices, 20),
    ema: calculateEMA(closePrices, 20),
    rsi: calculateRSI(closePrices, 14),
    macd: calculateMACD(closePrices, 12, 26, 9)
  };
}
