// src/hooks/useBodyFramingDetectionLocal.ts
// Hook para detectar enquadramento usando MediaPipe Pose (local, sem backend)
// Bloqueia captura até corpo completo estar visível

import { useEffect, useRef, useState, useCallback } from 'react';
import { Pose, POSE_LANDMARKS } from '@mediapipe/pose';
import type { Results } from '@mediapipe/pose';

export type FramingStatus = 
  | 'checking'        // Inicializando
  | 'too-close'       // Pessoa muito próxima
  | 'partial'         // Corpo parcialmente visível
  | 'well-framed'     // ✅ CORPO COMPLETO VISÍVEL - PODE CAPTURAR
  | 'no-person';      // Nenhuma pessoa detectada

export interface FramingFeedback {
  status: FramingStatus;
  message: string;
  confidence: number;
  missingParts?: string[];
}

interface LocalFramingDetectionOptions {
  videoElement: HTMLVideoElement | null;
  enabled: boolean;
}

export function useBodyFramingDetectionLocal({
  videoElement,
  enabled,
}: LocalFramingDetectionOptions) {
  
  const [feedback, setFeedback] = useState<FramingFeedback>({
    status: 'checking',
    message: 'Posicione-se em frente à câmera',
    confidence: 0,
  });

  const poseRef = useRef<Pose | null>(null);

  // Analisar resultado do MediaPipe
  const analyzeFraming = useCallback((results: Results) => {
    if (!results.poseLandmarks) {
      setFeedback({
        status: 'no-person',
        message: '👥 Nenhuma pessoa detectada',
        confidence: 0,
        missingParts: ['Posicione-se na frente da câmera'],
      });
      return;
    }

    const landmarks = results.poseLandmarks;
    
    // Pontos-chave ESSENCIAIS para corpo completo
    const nose = landmarks[POSE_LANDMARKS.NOSE];
    const leftAnkle = landmarks[27];  // Tornozelo esquerdo
    const rightAnkle = landmarks[28]; // Tornozelo direito
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const leftWrist = landmarks[15];  // Pulso esquerdo
    const rightWrist = landmarks[16]; // Pulso direito

    // Lista de partes NÃO visíveis
    const missingParts: string[] = [];
    
    // CRITÉRIOS RIGOROSOS para corpo completo
    const VISIBILITY_THRESHOLD = 0.6; // 60% de confiança mínima
    
    // 1. CABEÇA (obrigatória)
    const headVisible = (nose?.visibility ?? 0) >= VISIBILITY_THRESHOLD;
    if (!headVisible) {
      missingParts.push('Cabeça não visível');
    }

    // 2. OMBROS (obrigatórios - ambos)
    const shouldersVisible = 
      (leftShoulder?.visibility ?? 0) >= VISIBILITY_THRESHOLD && 
      (rightShoulder?.visibility ?? 0) >= VISIBILITY_THRESHOLD;
    if (!shouldersVisible) {
      missingParts.push('Ombros não visíveis');
    }

    // 3. QUADRIL (obrigatório - ambos)
    const hipsVisible = 
      (leftHip?.visibility ?? 0) >= VISIBILITY_THRESHOLD && 
      (rightHip?.visibility ?? 0) >= VISIBILITY_THRESHOLD;
    if (!hipsVisible) {
      missingParts.push('Quadril não visível');
    }

    // 4. PÉS (obrigatório - pelo menos um)
    const feetVisible = 
      (leftAnkle?.visibility ?? 0) >= VISIBILITY_THRESHOLD || 
      (rightAnkle?.visibility ?? 0) >= VISIBILITY_THRESHOLD;
    if (!feetVisible) {
      missingParts.push('Pés não visíveis');
    }

    // 5. MÃOS/PULSOS (obrigatório - pelo menos um)
    const handsVisible = 
      (leftWrist?.visibility ?? 0) >= VISIBILITY_THRESHOLD || 
      (rightWrist?.visibility ?? 0) >= VISIBILITY_THRESHOLD;
    if (!handsVisible) {
      missingParts.push('Mãos não visíveis');
    }

    // Calcular visibilidade geral
    const allPoints = [
      nose, leftShoulder, rightShoulder, 
      leftHip, rightHip, 
      leftAnkle, rightAnkle,
      leftWrist, rightWrist
    ];
    const avgVisibility = allPoints.reduce((sum, p) => {
      return sum + (p?.visibility ?? 0);
    }, 0) / allPoints.length;
    
    const confidence = Math.round(avgVisibility * 100);

    // Verificar enquadramento (distância)
    const noseY = nose?.y ?? 0;
    const maxAnkleY = Math.max(leftAnkle?.y ?? 0, rightAnkle?.y ?? 0);
    const personHeight = Math.abs(noseY - maxAnkleY);

    // ✅ CRITÉRIO FINAL: CORPO COMPLETO VISÍVEL?
    const isBodyComplete = missingParts.length === 0;
    const isWellDistanced = personHeight >= 0.5 && personHeight <= 0.85;

    let status: FramingStatus;
    let message: string;

    if (isBodyComplete && isWellDistanced) {
      // ✅ PERFEITO - CORPO COMPLETO E BEM ENQUADRADO
      status = 'well-framed';
      message = '✅ Corpo completo visível! Pode capturar';
    } else if (personHeight > 0.85) {
      // ⚠️ MUITO PRÓXIMO
      status = 'too-close';
      message = '⬅️ Afaste-se da câmera';
      if (!missingParts.includes('Muito próximo')) {
        missingParts.push('Muito próximo da câmera');
      }
    } else if (personHeight < 0.5) {
      // ⚠️ MUITO LONGE
      status = 'partial';
      message = '🔍 Aproxime-se da câmera';
      if (!missingParts.includes('Muito distante')) {
        missingParts.push('Muito distante da câmera');
      }
    } else {
      // ⚠️ CORPO PARCIAL
      status = 'partial';
      message = '⚠️ Mostre o corpo completo';
    }

    console.log('📊 MediaPipe Result:', {
      status,
      confidence,
      personHeight: personHeight.toFixed(2),
      missingParts,
      isBodyComplete,
      isWellDistanced
    });

    setFeedback({
      status,
      message,
      confidence,
      missingParts,
    });
  }, []);

  // Inicializar MediaPipe Pose
  useEffect(() => {
    if (!videoElement || !enabled) {
      console.log('⏸️ MediaPipe pausado:', { 
        hasVideo: !!videoElement, 
        enabled 
      });
      return;
    }

    console.log('🎬 Iniciando MediaPipe Pose para detecção de corpo completo...');

    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.6, // Aumentado para maior precisão
      minTrackingConfidence: 0.6,  // Aumentado para maior precisão
    });

    pose.onResults(analyzeFraming);

    poseRef.current = pose;

    // Processar frames continuamente
    let rafId: number;
    let isProcessing = false;
    
    const processFrame = async () => {
      if (poseRef.current && videoElement.readyState >= 2 && !isProcessing) {
        isProcessing = true;
        try {
          await poseRef.current.send({ image: videoElement });
        } catch (error) {
          console.error('❌ MediaPipe erro:', error);
        } finally {
          isProcessing = false;
        }
      }
      rafId = requestAnimationFrame(processFrame);
    };

    const startProcessing = () => {
      if (videoElement.readyState >= 2) {
        console.log('✅ MediaPipe pronto - analisando corpo...');
        processFrame();
      } else {
        videoElement.addEventListener('loadeddata', () => {
          console.log('✅ Vídeo carregado - iniciando análise...');
          processFrame();
        }, { once: true });
      }
    };

    startProcessing();

    return () => {
      console.log('🛑 Parando MediaPipe');
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (poseRef.current) {
        poseRef.current.close();
        poseRef.current = null;
      }
    };
  }, [videoElement, enabled, analyzeFraming]);

  return {
    feedback,
    isWellFramed: feedback.status === 'well-framed', // ✅ TRUE só quando corpo COMPLETO
    shouldBlock: feedback.status !== 'well-framed',   // ❌ BLOQUEIA se não estiver completo
  };
}