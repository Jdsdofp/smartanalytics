// src/hooks/useBodyFramingDetection.ts
// Hook para detectar se o corpo está completamente enquadrado na câmera
// Usa análise de enquadramento do backend para verificar posicionamento adequado

import { useEffect, useRef, useState, useCallback } from 'react';

export type FramingStatus = 
  | 'checking'        // Verificando enquadramento inicial
  | 'too-close'       // Pessoa muito próxima, precisa afastar
  | 'partial'         // Apenas parte do corpo visível
  | 'well-framed'     // Corpo completo visível e bem enquadrado
  | 'no-person';      // Nenhuma pessoa detectada

export interface FramingFeedback {
  status: FramingStatus;
  message: string;
  confidence: number; // 0-100, confiança na detecção
  missingParts?: string[]; // Partes do corpo não visíveis ou problemas detectados
}

interface BodyFramingDetectionOptions {
  videoElement: HTMLVideoElement | null;
  enabled: boolean;
  checkIntervalMs?: number;
  apiEndpoint?: string;
}

/**
 * Hook que monitora o enquadramento do corpo na câmera
 * Detecta se a pessoa está:
 * - Completamente visível e bem enquadrada
 * - Muito próxima (precisa afastar)
 * - Muito distante (precisa aproximar)
 * - Parcialmente visível (faltando partes)
 */
export function useBodyFramingDetection({
  videoElement,
  enabled,
  checkIntervalMs = 1000,
  apiEndpoint = 'https://aihub.smartxhub.cloud/api/v1/epi/camera/analyze-framing',
}: BodyFramingDetectionOptions) {
  
  const [feedback, setFeedback] = useState<FramingFeedback>({
    status: 'checking',
    message: 'Posicione-se na frente da câmera',
    confidence: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  //@ts-ignore
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Adaptar resposta da API para formato do hook
  const adaptApiResponse = useCallback((apiResult: any): FramingFeedback => {
    // API retorna: { overall_score, is_acceptable, breakdown, metrics, recommendations, issues }
    
    const score = apiResult.overall_score || 0;
    const personCount = apiResult.metrics?.person_count || 0;
    const issues = apiResult.issues || [];
    
    // Determinar status baseado no score e issues
    let status: FramingStatus;
    let message: string;
    
    if (apiResult.is_acceptable && score >= 70) {
      status = 'well-framed';
      message = '✅ Enquadramento adequado!';
    } else if (personCount === 0) {
      status = 'no-person';
      message = '👥 Nenhuma pessoa detectada';
    } else if (issues.some((issue: string) => issue.includes('muito próxima') || issue.includes('muito alta') || issue.includes('muito baixa'))) {
      status = 'too-close';
      message = '⬅️ Afaste-se um pouco';
    } else if (issues.some((issue: string) => issue.includes('muito distante') || issue.includes('pequenas demais'))) {
      status = 'partial';
      message = '🔍 Aproxime-se da câmera';
    } else if (score < 70) {
      status = 'partial';
      message = '⚠️ Ajuste sua posição';
    } else {
      status = 'checking';
      message = 'Verificando posicionamento...';
    }
    
    return {
      status,
      message,
      confidence: Math.round(score),
      missingParts: issues,
    };
  }, []);

  const analyzeFraming = useCallback(async () => {
    console.log('🔍 analyzeFraming called', {
      hasVideo: !!videoElement,
      enabled,
      readyState: videoElement?.readyState
    });

    if (!videoElement || !enabled || videoElement.readyState < 2) {
      console.log('⚠️ Skipping analysis:', {
        noVideo: !videoElement,
        disabled: !enabled,
        //@ts-ignore
        notReady: videoElement?.readyState < 2
      });
      return;
    }

    try {
      console.log('📸 Capturing frame...');
      
      // Criar canvas temporário para capturar frame
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      const canvas = canvasRef.current;
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(videoElement, 0, 0);
      
      // Converter para blob e enviar para API de detecção
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.8);
      });

      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');  // ✅ CORRETO - backend espera 'file'

      console.log('📤 Sending to API:', apiEndpoint);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      console.log('✅ API Response:', response.status);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const result = await response.json();
      console.log('📊 API Result:', result);
      
      // Adaptar resultado da API para formato do hook
      const framingResult = adaptApiResponse(result);
      setFeedback(framingResult);

    } catch (error) {
      console.error('❌ Erro ao analisar enquadramento:', error);
      // Em caso de erro, não bloqueia o fluxo
      setFeedback({
        status: 'checking',
        message: 'Verificando posicionamento...',
        confidence: 0,
      });
    }
  }, [videoElement, enabled, apiEndpoint, adaptApiResponse]);

  // Iniciar verificação periódica
  useEffect(() => {
    if (enabled && videoElement) {
      console.log('🎬 Starting framing detection interval');
      intervalRef.current = setInterval(analyzeFraming, checkIntervalMs);
      // Primeira verificação imediata
      analyzeFraming();
    }

    return () => {
      if (intervalRef.current) {
        console.log('🛑 Stopping framing detection interval');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, videoElement, checkIntervalMs, analyzeFraming]);

  return {
    feedback,
    isWellFramed: feedback.status === 'well-framed',
    shouldBlock: feedback.status === 'too-close' || feedback.status === 'no-person',
  };
}