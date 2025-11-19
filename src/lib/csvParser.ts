import { OHLCData } from './indicators';

export interface ParseResult {
  success: boolean;
  data?: OHLCData[];
  error?: string;
}

export function parseCSV(csvContent: string): ParseResult {
  try {
    const lines = csvContent.trim().split('\n');
    
    if (lines.length < 2) {
      return {
        success: false,
        error: 'Arquivo CSV vazio ou inválido'
      };
    }
    
    // Processar header
    const header = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    // Verificar colunas necessárias
    const requiredColumns = ['time', 'open', 'high', 'low', 'close', 'volume'];
    const missingColumns = requiredColumns.filter(col => !header.includes(col));
    
    if (missingColumns.length > 0) {
      return {
        success: false,
        error: `Colunas faltando: ${missingColumns.join(', ')}`
      };
    }
    
    // Mapear índices das colunas
    const columnIndices = {
      time: header.indexOf('time'),
      open: header.indexOf('open'),
      high: header.indexOf('high'),
      low: header.indexOf('low'),
      close: header.indexOf('close'),
      volume: header.indexOf('volume')
    };
    
    // Processar dados
    const data: OHLCData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      
      try {
        const ohlc: OHLCData = {
          time: values[columnIndices.time],
          open: parseFloat(values[columnIndices.open]),
          high: parseFloat(values[columnIndices.high]),
          low: parseFloat(values[columnIndices.low]),
          close: parseFloat(values[columnIndices.close]),
          volume: parseFloat(values[columnIndices.volume])
        };
        
        // Validar dados
        if (
          isNaN(ohlc.open) ||
          isNaN(ohlc.high) ||
          isNaN(ohlc.low) ||
          isNaN(ohlc.close) ||
          isNaN(ohlc.volume)
        ) {
          console.warn(`Linha ${i + 1} ignorada: dados inválidos`);
          continue;
        }
        
        data.push(ohlc);
      } catch (error) {
        console.warn(`Erro ao processar linha ${i + 1}:`, error);
      }
    }
    
    if (data.length === 0) {
      return {
        success: false,
        error: 'Nenhum dado válido encontrado no arquivo'
      };
    }
    
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: `Erro ao processar CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
}

// Gerar CSV de exemplo para download
export function generateSampleCSV(): string {
  const header = 'time,open,high,low,close,volume';
  const rows = [
    '2024-01-01,100.00,105.00,99.00,103.00,1000000',
    '2024-01-02,103.00,107.00,102.00,106.00,1200000',
    '2024-01-03,106.00,108.00,104.00,105.00,1100000',
    '2024-01-04,105.00,110.00,105.00,109.00,1300000',
    '2024-01-05,109.00,112.00,108.00,111.00,1400000',
    '2024-01-08,111.00,113.00,109.00,110.00,1250000',
    '2024-01-09,110.00,111.00,107.00,108.00,1150000',
    '2024-01-10,108.00,109.00,105.00,106.00,1050000',
    '2024-01-11,106.00,108.00,104.00,107.00,1100000',
    '2024-01-12,107.00,110.00,106.00,109.00,1200000',
    '2024-01-15,109.00,111.00,108.00,110.00,1150000',
    '2024-01-16,110.00,112.00,109.00,111.00,1200000',
    '2024-01-17,111.00,113.00,110.00,112.00,1250000',
    '2024-01-18,112.00,114.00,111.00,113.00,1300000',
    '2024-01-19,113.00,115.00,112.00,114.00,1350000',
    '2024-01-22,114.00,116.00,113.00,115.00,1400000',
    '2024-01-23,115.00,117.00,114.00,116.00,1450000',
    '2024-01-24,116.00,118.00,115.00,117.00,1500000',
    '2024-01-25,117.00,119.00,116.00,118.00,1550000',
    '2024-01-26,118.00,120.00,117.00,119.00,1600000'
  ];
  
  return [header, ...rows].join('\n');
}
