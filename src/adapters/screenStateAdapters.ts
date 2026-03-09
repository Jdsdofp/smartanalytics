// src/adapters/screenStateAdapters.ts
// Adaptadores para converter os estados do hook useCamAutomation
// para os formatos esperados pelos screens

import type { FaceScanState as HookFaceScanState, EpiScanState as HookEpiScanState } from '../hooks/useCamAutomation';

// ─── Tipos dos Screens (como estão definidos nos componentes) ────────────────

export interface ScreenFaceScanState {
  status: 'idle' | 'capturing' | 'analyzing' | 'ok' | 'error';
  errorMsg?: string;
  captureUrl?: string | null;
}

export interface ScreenEpiScanState {
  status: 'idle' | 'capturing' | 'analyzing' | 'ok' | 'error';
  errorMsg?: string;
  captureUrl?: string | null;
  detectedEpi?: string[];
}

// ─── Adaptadores ──────────────────────────────────────────────────────────────

/**
 * Converte FaceScanState do hook para o formato esperado pelo FaceScanScreen
 */
export function adaptFaceScanState(hookState: HookFaceScanState): ScreenFaceScanState {
  // Mapeia os steps do hook para status do screen
  const statusMap: Record<string, ScreenFaceScanState['status']> = {
    ready:      'idle',
    capturing:  'capturing',
    processing: 'analyzing',
    done:       'ok',
    error:      'error',
  };

  return {
    status: statusMap[hookState.step] || 'idle',
    captureUrl: hookState.captureUrl,
    errorMsg: hookState.step === 'error' ? hookState.subMsg || hookState.statusMsg : undefined,
  };
}

/**
 * Converte EpiScanState do hook para o formato esperado pelo EpiScanScreen
 */
export function adaptEpiScanState(hookState: HookEpiScanState): ScreenEpiScanState {
  // Mapeia os steps do hook para status do screen
  const statusMap: Record<string, ScreenEpiScanState['status']> = {
    ready:      'idle',
    capturing:  'capturing',
    processing: 'analyzing',
    done:       'ok',
    error:      'error',
  };

  return {
    status: statusMap[hookState.step] || 'idle',
    captureUrl: hookState.captureUrl1, // Usa apenas a primeira câmera
    errorMsg: hookState.step === 'error' ? hookState.statusMsg : undefined,
    detectedEpi: hookState.result?.detected || hookState.result?.detected_ppe || [],
  };
}