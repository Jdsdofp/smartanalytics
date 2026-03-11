// src/hooks/useBodyFramingDetectionLocal.ts
// Hook para detectar enquadramento usando MediaPipe Pose (local, sem backend)

// import { useEffect, useRef, useState, useCallback } from 'react';
// import { Pose, POSE_LANDMARKS } from '@mediapipe/pose';
// import type { Results } from '@mediapipe/pose';
// import { Camera } from '@mediapipe/camera_utils';

// export type FramingStatus = 
//   | 'checking'
//   | 'too-close'
//   | 'partial'
//   | 'well-framed'
//   | 'no-person';

// export interface FramingFeedback {
//   status: FramingStatus;
//   message: string;
//   confidence: number;
//   missingParts?: string[];
// }

// interface LocalFramingDetectionOptions {
//   videoElement: HTMLVideoElement | null;
//   enabled: boolean;
// }

// export function useBodyFramingDetectionLocal({
//   videoElement,
//   enabled,
// }: LocalFramingDetectionOptions) {
  
//   const [feedback, setFeedback] = useState<FramingFeedback>({
//     status: 'checking',
//     message: 'Inicializando detecção...',
//     confidence: 0,
//   });

//   const poseRef = useRef<Pose | null>(null);
//   const cameraRef = useRef<Camera | null>(null);

//   // Analisar resultado do MediaPipe
//   const analyzeFraming = useCallback((results: Results) => {
//     if (!results.poseLandmarks) {
//       setFeedback({
//         status: 'no-person',
//         message: '👥 Nenhuma pessoa detectada',
//         confidence: 0,
//       });
//       return;
//     }

//     const landmarks = results.poseLandmarks;
    
//     // Pontos-chave importantes (usando os nomes corretos do MediaPipe)
//     const nose = landmarks[POSE_LANDMARKS.NOSE];
//     const leftAnkle = landmarks[23]; // LEFT_ANKLE
//     const rightAnkle = landmarks[24]; // RIGHT_ANKLE
//     const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
//     const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
//     const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
//     const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];

//     // Calcular visibilidade média (com verificação de undefined)
//     const allPoints = [nose, leftAnkle, rightAnkle, leftShoulder, rightShoulder, leftHip, rightHip];
//     const avgVisibility = allPoints.reduce((sum, p) => {
//       return sum + (p?.visibility ?? 0);
//     }, 0) / allPoints.length;
    
//     const missingParts: string[] = [];
//     let score = 0;

//     // 1. Verificar se cabeça está visível
//     if (!nose || (nose.visibility ?? 0) < 0.5) {
//       missingParts.push('Cabeça');
//     } else {
//       score += 25;
//     }

//     // 2. Verificar se tronco está visível
//     const torsoVisible = 
//       (leftShoulder?.visibility ?? 0) > 0.5 && 
//       (rightShoulder?.visibility ?? 0) > 0.5 &&
//       (leftHip?.visibility ?? 0) > 0.5 &&
//       (rightHip?.visibility ?? 0) > 0.5;
    
//     if (!torsoVisible) {
//       missingParts.push('Tronco');
//     } else {
//       score += 25;
//     }

//     // 3. Verificar se pés estão visíveis
//     const feetVisible = 
//       (leftAnkle?.visibility ?? 0) > 0.5 || 
//       (rightAnkle?.visibility ?? 0) > 0.5;
    
//     if (!feetVisible) {
//       missingParts.push('Pés');
//     } else {
//       score += 25;
//     }

//     // 4. Verificar enquadramento (não muito próximo, não muito longe)
//     const noseY = nose?.y ?? 0;
//     const leftAnkleY = leftAnkle?.y ?? 0;
//     const rightAnkleY = rightAnkle?.y ?? 0;
//     const personHeight = Math.abs(noseY - Math.max(leftAnkleY, rightAnkleY));
    
//     let framingScore = 0;
//     let framingIssue = '';
    
//     if (personHeight > 0.9) {
//       // Muito próximo (pessoa ocupa >90% da altura)
//       framingScore = 10;
//       framingIssue = 'too-close';
//     } else if (personHeight < 0.4) {
//       // Muito longe (pessoa ocupa <40% da altura)
//       framingScore = 10;
//       framingIssue = 'too-far';
//     } else if (personHeight >= 0.5 && personHeight <= 0.8) {
//       // Ideal (pessoa ocupa 50-80% da altura)
//       framingScore = 25;
//     } else {
//       framingScore = 15;
//     }

//     score += framingScore;

//     // Determinar status final
//     const confidence = Math.round(avgVisibility * 100);
//     let status: FramingStatus;
//     let message: string;

//     if (score >= 75 && missingParts.length === 0) {
//       status = 'well-framed';
//       message = '✅ Enquadramento adequado!';
//     } else if (framingIssue === 'too-close') {
//       status = 'too-close';
//       message = '⬅️ Afaste-se um pouco';
//       missingParts.push('Pessoa muito próxima');
//     } else if (framingIssue === 'too-far') {
//       status = 'partial';
//       message = '🔍 Aproxime-se da câmera';
//       missingParts.push('Pessoa muito distante');
//     } else if (missingParts.length > 0) {
//       status = 'partial';
//       message = '⚠️ Ajuste sua posição';
//     } else {
//       status = 'partial';
//       message = '⚠️ Melhore o enquadramento';
//     }

//     setFeedback({
//       status,
//       message,
//       confidence,
//       missingParts,
//     });
//   }, []);

//   // Inicializar MediaPipe Pose
//   useEffect(() => {
//     if (!videoElement || !enabled) return;

//     const pose = new Pose({
//       locateFile: (file) => {
//         return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
//       },
//     });

//     pose.setOptions({
//       modelComplexity: 1,
//       smoothLandmarks: true,
//       enableSegmentation: false,
//       smoothSegmentation: false,
//       minDetectionConfidence: 0.5,
//       minTrackingConfidence: 0.5,
//     });

//     pose.onResults(analyzeFraming);

//     poseRef.current = pose;

//     // Iniciar câmera
//     const camera = new Camera(videoElement, {
//       onFrame: async () => {
//         if (poseRef.current) {
//           await poseRef.current.send({ image: videoElement });
//         }
//       },
//       width: 720,
//       height: 1280,
//     });

//     camera.start();
//     cameraRef.current = camera;

//     return () => {
//       camera.stop();
//       pose.close();
//     };
//   }, [videoElement, enabled, analyzeFraming]);

//   return {
//     feedback,
//     isWellFramed: feedback.status === 'well-framed',
//     shouldBlock: feedback.status === 'too-close' || feedback.status === 'no-person',
//   };
// }



// src/hooks/useBodyFramingDetectionLocal.ts
// Hook para detectar enquadramento usando MediaPipe Pose (local, sem backend)
// Versão corrigida: processa vídeo existente sem controlar a câmera

import { useEffect, useRef, useState, useCallback } from 'react';
import { Pose, POSE_LANDMARKS } from '@mediapipe/pose';
import type { Results } from '@mediapipe/pose';

export type FramingStatus = 
  | 'checking'
  | 'too-close'
  | 'partial'
  | 'well-framed'
  | 'no-person';

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
    message: 'Inicializando detecção...',
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
      });
      return;
    }

    const landmarks = results.poseLandmarks;
    
    // Pontos-chave importantes (usando os índices corretos do MediaPipe)
    const nose = landmarks[POSE_LANDMARKS.NOSE];
    const leftAnkle = landmarks[27]; // LEFT_ANKLE
    const rightAnkle = landmarks[28]; // RIGHT_ANKLE
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];

    // Calcular visibilidade média (com verificação de undefined)
    const allPoints = [nose, leftAnkle, rightAnkle, leftShoulder, rightShoulder, leftHip, rightHip];
    const avgVisibility = allPoints.reduce((sum, p) => {
      return sum + (p?.visibility ?? 0);
    }, 0) / allPoints.length;
    
    const missingParts: string[] = [];
    let score = 0;

    // 1. Verificar se cabeça está visível
    if (!nose || (nose.visibility ?? 0) < 0.5) {
      missingParts.push('Cabeça');
    } else {
      score += 25;
    }

    // 2. Verificar se tronco está visível
    const torsoVisible = 
      (leftShoulder?.visibility ?? 0) > 0.5 && 
      (rightShoulder?.visibility ?? 0) > 0.5 &&
      (leftHip?.visibility ?? 0) > 0.5 &&
      (rightHip?.visibility ?? 0) > 0.5;
    
    if (!torsoVisible) {
      missingParts.push('Tronco');
    } else {
      score += 25;
    }

    // 3. Verificar se pés estão visíveis
    const feetVisible = 
      (leftAnkle?.visibility ?? 0) > 0.5 || 
      (rightAnkle?.visibility ?? 0) > 0.5;
    
    if (!feetVisible) {
      missingParts.push('Pés');
    } else {
      score += 25;
    }

    // 4. Verificar enquadramento (não muito próximo, não muito longe)
    const noseY = nose?.y ?? 0;
    const leftAnkleY = leftAnkle?.y ?? 0;
    const rightAnkleY = rightAnkle?.y ?? 0;
    const personHeight = Math.abs(noseY - Math.max(leftAnkleY, rightAnkleY));
    
    let framingScore = 0;
    let framingIssue = '';
    
    if (personHeight > 0.9) {
      // Muito próximo (pessoa ocupa >90% da altura)
      framingScore = 10;
      framingIssue = 'too-close';
    } else if (personHeight < 0.4) {
      // Muito longe (pessoa ocupa <40% da altura)
      framingScore = 10;
      framingIssue = 'too-far';
    } else if (personHeight >= 0.5 && personHeight <= 0.8) {
      // Ideal (pessoa ocupa 50-80% da altura)
      framingScore = 25;
    } else {
      framingScore = 15;
    }

    score += framingScore;

    // Determinar status final
    const confidence = Math.round(avgVisibility * 100);
    let status: FramingStatus;
    let message: string;

    if (score >= 75 && missingParts.length === 0) {
      status = 'well-framed';
      message = '✅ Enquadramento adequado!';
    } else if (framingIssue === 'too-close') {
      status = 'too-close';
      message = '⬅️ Afaste-se um pouco';
      missingParts.push('Pessoa muito próxima');
    } else if (framingIssue === 'too-far') {
      status = 'partial';
      message = '🔍 Aproxime-se da câmera';
      missingParts.push('Pessoa muito distante');
    } else if (missingParts.length > 0) {
      status = 'partial';
      message = '⚠️ Ajuste sua posição';
    } else {
      status = 'partial';
      message = '⚠️ Melhore o enquadramento';
    }

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
      console.log('MediaPipe não iniciado:', { 
        hasVideo: !!videoElement, 
        enabled 
      });
      return;
    }

    console.log('🎬 Iniciando MediaPipe Pose...');

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
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(analyzeFraming);

    poseRef.current = pose;

    // ✅ NOVO: Processar frames manualmente sem Camera (evita conflito)
    let rafId: number;
    let isProcessing = false;
    
    const processFrame = async () => {
      if (poseRef.current && videoElement.readyState >= 2 && !isProcessing) {
        isProcessing = true;
        try {
          await poseRef.current.send({ image: videoElement });
        } catch (error) {
          console.error('❌ MediaPipe processing error:', error);
        } finally {
          isProcessing = false;
        }
      }
      rafId = requestAnimationFrame(processFrame);
    };

    // Aguardar vídeo estar pronto
    const startProcessing = () => {
      if (videoElement.readyState >= 2) {
        console.log('✅ MediaPipe iniciado com sucesso');
        processFrame();
      } else {
        videoElement.addEventListener('loadeddata', () => {
          console.log('✅ Vídeo carregado, iniciando MediaPipe');
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
    isWellFramed: feedback.status === 'well-framed',
    shouldBlock: feedback.status === 'too-close' || feedback.status === 'no-person',
  };
}