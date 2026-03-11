// src/hooks/useBodyFramingDetection.ts
// Hook para detectar se o corpo está completamente enquadrado na câmera
// Usa detecção de pose/keypoints para verificar visibilidade de pontos-chave

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
  missingParts?: string[]; // Partes do corpo não visíveis
}

interface BodyFramingDetectionOptions {
  videoElement: HTMLVideoElement | null;
  enabled: boolean;
  checkIntervalMs?: number;
  apiEndpoint?: string; // Endpoint para detecção de pose/keypoints
}

/**
 * Hook que monitora o enquadramento do corpo na câmera
 * Detecta se a pessoa está:
 * - Completamente visível (cabeça aos pés)
 * - Muito próxima (precisa afastar)
 * - Parcialmente visível (faltando partes)
 */
export function useBodyFramingDetection({
  videoElement,
  enabled,
  checkIntervalMs = 1000,
  apiEndpoint = 'https://aihub.smartxhub.cloud/api/v1/epi/camera/analyze-framing', // Endpoint que retorna keypoints do corpo
}: BodyFramingDetectionOptions) {
  
  const [feedback, setFeedback] = useState<FramingFeedback>({
    status: 'checking',
    message: 'Posicione-se na frente da câmera',
    confidence: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  //@ts-ignore
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Pontos-chave essenciais para verificar corpo completo
  // (baseado em modelos como PoseNet, MediaPipe Pose, etc.)
  const REQUIRED_KEYPOINTS = {
    head: ['nose', 'left_eye', 'right_eye'],
    torso: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'],
    arms: ['left_elbow', 'right_elbow', 'left_wrist', 'right_wrist'],
    legs: ['left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
  };

  const analyzeFraming = useCallback(async () => {

      console.log('🔍 analyzeFraming called', {
            hasVideo: !!videoElement,
            enabled,
            readyState: videoElement?.readyState
        });

    if (!videoElement || !enabled || videoElement.readyState < 2) {
        
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
      formData.append('image', blob, 'frame.jpg');

          console.log('📤 Sending to API:', apiEndpoint);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

    console.log('✅ API Response:', response.status);
      if (!response.ok) {
        throw new Error('Falha na detecção de pose');
      }

      const result = await response.json();
      
      // Processar resultado da detecção
      const framingResult = processKeypointDetection(result, canvas.width, canvas.height);
      setFeedback(framingResult);

    } catch (error) {
      console.error('Erro ao analisar enquadramento:', error);
      // Em caso de erro, não bloqueia o fluxo
      setFeedback({
        status: 'checking',
        message: 'Verificando posicionamento...',
        confidence: 0,
      });
    }
  }, [videoElement, enabled, apiEndpoint]);

  // Processar keypoints detectados e determinar status de enquadramento
  const processKeypointDetection = (
    detectionResult: any,
    //@ts-ignore
    frameWidth: number,
    frameHeight: number
  ): FramingFeedback => {
    
    // Se não detectou pessoa
    if (!detectionResult.keypoints || detectionResult.keypoints.length === 0) {
      return {
        status: 'no-person',
        message: 'Nenhuma pessoa detectada. Posicione-se na frente da câmera.',
        confidence: 0,
      };
    }

    const keypoints = detectionResult.keypoints;
    const missingParts: string[] = [];
    let visibleKeypoints = 0;
    let totalKeypoints = 0;

    // Verificar quais partes do corpo estão visíveis
    Object.entries(REQUIRED_KEYPOINTS).forEach(([bodyPart, keypointNames]) => {
      const partVisible = keypointNames.some((kpName) => {
        const kp = keypoints.find((k: any) => k.name === kpName);
        totalKeypoints++;
        if (kp && kp.confidence > 0.3) {
          visibleKeypoints++;
          return true;
        }
        return false;
      });

      if (!partVisible) {
        missingParts.push(translateBodyPart(bodyPart));
      }
    });

    const visibilityRatio = visibleKeypoints / totalKeypoints;
    const confidence = Math.round(visibilityRatio * 100);

    // Verificar se está muito próximo (cabeça ou pés cortados nas bordas)
    const headKeypoint = keypoints.find((k: any) => k.name === 'nose');
    const feetKeypoints = keypoints.filter((k: any) => 
      k.name === 'left_ankle' || k.name === 'right_ankle'
    );

    const MARGIN_THRESHOLD = 0.05; // 5% de margem
    
    if (headKeypoint && headKeypoint.y < frameHeight * MARGIN_THRESHOLD) {
      return {
        status: 'too-close',
        message: 'Você está muito próximo! Afaste-se um pouco.',
        confidence,
        missingParts: ['Cabeça cortada'],
      };
    }

    const hasFeetCutOff = feetKeypoints.length > 0 && 
      feetKeypoints.every((kp: any) => kp.y > frameHeight * (1 - MARGIN_THRESHOLD));
    
    if (hasFeetCutOff) {
      return {
        status: 'too-close',
        message: 'Afaste-se para que seus pés fiquem visíveis.',
        confidence,
        missingParts: ['Pés cortados'],
      };
    }

    // Se faltam partes importantes
    if (missingParts.length > 0) {
      return {
        status: 'partial',
        message: `Ajuste a posição. Não visível: ${missingParts.join(', ')}`,
        confidence,
        missingParts,
      };
    }

    // Corpo completo visível
    if (visibilityRatio >= 0.85) {
      return {
        status: 'well-framed',
        message: 'Perfeito! Você está bem posicionado.',
        confidence,
      };
    }

    // Caso padrão
    return {
      status: 'partial',
      message: 'Ajuste sua posição para ficar completamente visível.',
      confidence,
      missingParts,
    };
  };

  const translateBodyPart = (part: string): string => {
    const translations: Record<string, string> = {
      head: 'Cabeça',
      torso: 'Tronco',
      arms: 'Braços',
      legs: 'Pernas',
    };
    return translations[part] || part;
  };

  // Iniciar verificação periódica
  useEffect(() => {
    if (enabled && videoElement) {
      intervalRef.current = setInterval(analyzeFraming, checkIntervalMs);
      // Primeira verificação imediata
      analyzeFraming();
    }

    return () => {
      if (intervalRef.current) {
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