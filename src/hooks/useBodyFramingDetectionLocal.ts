// // src/hooks/useBodyFramingDetectionLocal.ts
// // Hook para detectar enquadramento usando MediaPipe Pose (local, sem backend)
// // Bloqueia captura até corpo completo estar visível

// import { useEffect, useRef, useState, useCallback } from 'react';
// import { Pose, POSE_LANDMARKS } from '@mediapipe/pose';
// import type { Results } from '@mediapipe/pose';

// export type FramingStatus = 
//   | 'checking'        // Inicializando
//   | 'too-close'       // Pessoa muito próxima
//   | 'partial'         // Corpo parcialmente visível
//   | 'well-framed'     // ✅ CORPO COMPLETO VISÍVEL - PODE CAPTURAR
//   | 'no-person';      // Nenhuma pessoa detectada

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
//     message: 'Posicione-se em frente à câmera',
//     confidence: 0,
//   });

//   const poseRef = useRef<Pose | null>(null);

//   // Analisar resultado do MediaPipe
//   const analyzeFraming = useCallback((results: Results) => {
//     if (!results.poseLandmarks) {
//       setFeedback({
//         status: 'no-person',
//         message: '👥 Nenhuma pessoa detectada',
//         confidence: 0,
//         missingParts: ['Posicione-se na frente da câmera'],
//       });
//       return;
//     }

//     const landmarks = results.poseLandmarks;
    
//     // Pontos-chave ESSENCIAIS para corpo completo
//     const nose = landmarks[POSE_LANDMARKS.NOSE];
//     const leftAnkle = landmarks[27];  // Tornozelo esquerdo
//     const rightAnkle = landmarks[28]; // Tornozelo direito
//     const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
//     const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
//     const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
//     const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
//     const leftWrist = landmarks[15];  // Pulso esquerdo
//     const rightWrist = landmarks[16]; // Pulso direito

//     // Lista de partes NÃO visíveis
//     const missingParts: string[] = [];
    
//     // CRITÉRIOS RIGOROSOS para corpo completo
//     const VISIBILITY_THRESHOLD = 0.6; // 60% de confiança mínima
    
//     // 1. CABEÇA (obrigatória)
//     const headVisible = (nose?.visibility ?? 0) >= VISIBILITY_THRESHOLD;
//     if (!headVisible) {
//       missingParts.push('Cabeça não visível');
//     }

//     // 2. OMBROS (obrigatórios - ambos)
//     const shouldersVisible = 
//       (leftShoulder?.visibility ?? 0) >= VISIBILITY_THRESHOLD && 
//       (rightShoulder?.visibility ?? 0) >= VISIBILITY_THRESHOLD;
//     if (!shouldersVisible) {
//       missingParts.push('Ombros não visíveis');
//     }

//     // 3. QUADRIL (obrigatório - ambos)
//     const hipsVisible = 
//       (leftHip?.visibility ?? 0) >= VISIBILITY_THRESHOLD && 
//       (rightHip?.visibility ?? 0) >= VISIBILITY_THRESHOLD;
//     if (!hipsVisible) {
//       missingParts.push('Quadril não visível');
//     }

//     // 4. PÉS (obrigatório - pelo menos um)
//     const feetVisible = 
//       (leftAnkle?.visibility ?? 0) >= VISIBILITY_THRESHOLD || 
//       (rightAnkle?.visibility ?? 0) >= VISIBILITY_THRESHOLD;
//     if (!feetVisible) {
//       missingParts.push('Pés não visíveis');
//     }

//     // 5. MÃOS/PULSOS (obrigatório - pelo menos um)
//     const handsVisible = 
//       (leftWrist?.visibility ?? 0) >= VISIBILITY_THRESHOLD || 
//       (rightWrist?.visibility ?? 0) >= VISIBILITY_THRESHOLD;
//     if (!handsVisible) {
//       missingParts.push('Mãos não visíveis');
//     }

//     // Calcular visibilidade geral
//     const allPoints = [
//       nose, leftShoulder, rightShoulder, 
//       leftHip, rightHip, 
//       leftAnkle, rightAnkle,
//       leftWrist, rightWrist
//     ];
//     const avgVisibility = allPoints.reduce((sum, p) => {
//       return sum + (p?.visibility ?? 0);
//     }, 0) / allPoints.length;
    
//     const confidence = Math.round(avgVisibility * 100);

//     // Verificar enquadramento (distância)
//     const noseY = nose?.y ?? 0;
//     const maxAnkleY = Math.max(leftAnkle?.y ?? 0, rightAnkle?.y ?? 0);
//     const personHeight = Math.abs(noseY - maxAnkleY);

//     // ✅ CRITÉRIO FINAL: CORPO COMPLETO VISÍVEL?
//     const isBodyComplete = missingParts.length === 0;
//     const isWellDistanced = personHeight >= 0.5 && personHeight <= 0.85;

//     let status: FramingStatus;
//     let message: string;

//     if (isBodyComplete && isWellDistanced) {
//       // ✅ PERFEITO - CORPO COMPLETO E BEM ENQUADRADO
//       status = 'well-framed';
//       message = '✅ Corpo completo visível! Pode capturar';
//     } else if (personHeight > 0.85) {
//       // ⚠️ MUITO PRÓXIMO
//       status = 'too-close';
//       message = '⬅️ Afaste-se da câmera';
//       if (!missingParts.includes('Muito próximo')) {
//         missingParts.push('Muito próximo da câmera');
//       }
//     } else if (personHeight < 0.5) {
//       // ⚠️ MUITO LONGE
//       status = 'partial';
//       message = '🔍 Aproxime-se da câmera';
//       if (!missingParts.includes('Muito distante')) {
//         missingParts.push('Muito distante da câmera');
//       }
//     } else {
//       // ⚠️ CORPO PARCIAL
//       status = 'partial';
//       message = '⚠️ Mostre o corpo completo';
//     }

//     console.log('📊 MediaPipe Result:', {
//       status,
//       confidence,
//       personHeight: personHeight.toFixed(2),
//       missingParts,
//       isBodyComplete,
//       isWellDistanced
//     });

//     setFeedback({
//       status,
//       message,
//       confidence,
//       missingParts,
//     });
//   }, []);

//   // Inicializar MediaPipe Pose
//   useEffect(() => {
//     if (!videoElement || !enabled) {
//       console.log('⏸️ MediaPipe pausado:', { 
//         hasVideo: !!videoElement, 
//         enabled 
//       });
//       return;
//     }

//     console.log('🎬 Iniciando MediaPipe Pose para detecção de corpo completo...');

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
//       minDetectionConfidence: 0.6, // Aumentado para maior precisão
//       minTrackingConfidence: 0.6,  // Aumentado para maior precisão
//     });

//     pose.onResults(analyzeFraming);

//     poseRef.current = pose;

//     // Processar frames continuamente
//     let rafId: number;
//     let isProcessing = false;
    
//     const processFrame = async () => {
//       if (poseRef.current && videoElement.readyState >= 2 && !isProcessing) {
//         isProcessing = true;
//         try {
//           await poseRef.current.send({ image: videoElement });
//         } catch (error) {
//           console.error('❌ MediaPipe erro:', error);
//         } finally {
//           isProcessing = false;
//         }
//       }
//       rafId = requestAnimationFrame(processFrame);
//     };

//     const startProcessing = () => {
//       if (videoElement.readyState >= 2) {
//         console.log('✅ MediaPipe pronto - analisando corpo...');
//         processFrame();
//       } else {
//         videoElement.addEventListener('loadeddata', () => {
//           console.log('✅ Vídeo carregado - iniciando análise...');
//           processFrame();
//         }, { once: true });
//       }
//     };

//     startProcessing();

//     return () => {
//       console.log('🛑 Parando MediaPipe');
//       if (rafId) {
//         cancelAnimationFrame(rafId);
//       }
//       if (poseRef.current) {
//         poseRef.current.close();
//         poseRef.current = null;
//       }
//     };
//   }, [videoElement, enabled, analyzeFraming]);

//   return {
//     feedback,
//     isWellFramed: feedback.status === 'well-framed', // ✅ TRUE só quando corpo COMPLETO
//     shouldBlock: feedback.status !== 'well-framed',   // ❌ BLOQUEIA se não estiver completo
//   };
// }



// src/hooks/useBodyFramingDetectionLocal.ts
// Hook para detecção de enquadramento corporal usando MediaPipe localmente
// ATUALIZADO: Agora expõe os landmarks para visualização

import { useEffect, useRef, useState } from 'react';

// Tipos exportados
export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface FramingFeedback {
  status: 'checking' | 'well-framed' | 'partial' | 'too-close' | 'no-person';
  message: string;
  missingParts?: string[];
  confidence: number;
  landmarks?: PoseLandmark[];  // ✅ NOVO: Expõe landmarks
}

interface UseBodyFramingDetectionLocalProps {
  videoElement: HTMLVideoElement | null;
  enabled?: boolean;
  minConfidence?: number;
  checkIntervalMs?: number;
}

export function useBodyFramingDetectionLocal({
  videoElement,
  enabled = true,
  minConfidence = 0.6,
  checkIntervalMs = 500,
}: UseBodyFramingDetectionLocalProps) {
  const [feedback, setFeedback] = useState<FramingFeedback>({
    status: 'checking',
    message: 'Inicializando detector...',
    confidence: 0,
  });
  const [isWellFramed, setIsWellFramed] = useState(false);
  const [shouldBlock, setShouldBlock] = useState(true);

  const poseLandmarkerRef = useRef<any>(null);
  //@ts-ignore
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO DO MEDIAPIPE
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!enabled || isInitializedRef.current) return;

    const initMediaPipe = async () => {
      try {
        // Importa MediaPipe dinamicamente
        const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: minConfidence,
          minPosePresenceConfidence: minConfidence,
          minTrackingConfidence: minConfidence,
        });

        poseLandmarkerRef.current = poseLandmarker;
        isInitializedRef.current = true;

        console.log('✅ MediaPipe Pose inicializado com sucesso');
      } catch (error) {
        console.error('❌ Erro ao inicializar MediaPipe:', error);
        setFeedback({
          status: 'no-person',
          message: 'Erro ao carregar detector',
          confidence: 0,
        });
      }
    };

    initMediaPipe();

    return () => {
      poseLandmarkerRef.current?.close();
      isInitializedRef.current = false;
    };
  }, [enabled, minConfidence]);

  // ═══════════════════════════════════════════════════════════════════════════
  // DETECÇÃO PERIÓDICA
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!enabled || !videoElement || !poseLandmarkerRef.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const detectPose = () => {
      if (!videoElement || videoElement.readyState < 2 || !poseLandmarkerRef.current) {
        return;
      }

      try {
        const timestamp = performance.now();
        const result = poseLandmarkerRef.current.detectForVideo(videoElement, timestamp);

        // Nenhuma pose detectada
        if (!result.landmarks || result.landmarks.length === 0) {
          setFeedback({
            status: 'no-person',
            message: 'Nenhuma pessoa detectada',
            confidence: 0,
            landmarks: undefined,
          });
          setIsWellFramed(false);
          setShouldBlock(true);
          return;
        }

        // Pega a primeira pose
        const landmarks = result.landmarks[0];

        // ═══════════════════════════════════════════════════════════════════
        // ANÁLISE DE ENQUADRAMENTO
        // ═══════════════════════════════════════════════════════════════════

        // Calcula bounding box
        let minX = 1, maxX = 0, minY = 1, maxY = 0;
        landmarks.forEach((lm: PoseLandmark) => {
          minX = Math.min(minX, lm.x);
          maxX = Math.max(maxX, lm.x);
          minY = Math.min(minY, lm.y);
          maxY = Math.max(maxY, lm.y);
        });
        //@ts-ignore
        const width = maxX - minX;
        const height = maxY - minY;

        // Verifica partes do corpo visíveis
        const nose = landmarks[0];
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftHip = landmarks[23];
        const rightHip = landmarks[24];
        const leftAnkle = landmarks[27];
        const rightAnkle = landmarks[28];

        const headVisible = (nose?.visibility ?? 0) > 0.5;
        const shouldersVisible = 
          (leftShoulder?.visibility ?? 0) > 0.5 && 
          (rightShoulder?.visibility ?? 0) > 0.5;
        const hipsVisible = 
          (leftHip?.visibility ?? 0) > 0.5 && 
          (rightHip?.visibility ?? 0) > 0.5;
        const feetVisible = 
          (leftAnkle?.visibility ?? 0) > 0.5 && 
          (rightAnkle?.visibility ?? 0) > 0.5;

        // Calcula confiança média dos pontos-chave
        const keyLandmarks = [nose, leftShoulder, rightShoulder, leftHip, rightHip, leftAnkle, rightAnkle];
        const avgConfidence = keyLandmarks.reduce((sum, lm) => sum + (lm?.visibility ?? 0), 0) / keyLandmarks.length;

        // ═══════════════════════════════════════════════════════════════════
        // DETERMINA STATUS
        // ═══════════════════════════════════════════════════════════════════

        const marginThreshold = 0.05;
        const isCutLeft = minX < marginThreshold;
        const isCutRight = maxX > (1 - marginThreshold);
        const isCutTop = minY < marginThreshold;
        const isCutBottom = maxY > (1 - marginThreshold);
        const isCut = isCutLeft || isCutRight || isCutTop || isCutBottom;

        // Muito próximo (ocupa mais de 90% da altura)
        if (height > 0.9) {
          setFeedback({
            status: 'too-close',
            message: 'Afaste-se da câmera',
            confidence: Math.round(avgConfidence * 100),
            landmarks,  // ✅ Expõe landmarks
          });
          setIsWellFramed(false);
          setShouldBlock(true);
          return;
        }

        // Partes faltando
        const missingParts: string[] = [];
        if (!headVisible) missingParts.push('Cabeça');
        if (!shouldersVisible) missingParts.push('Ombros');
        if (!hipsVisible) missingParts.push('Quadris');
        if (!feetVisible) missingParts.push('Pés');

        if (missingParts.length > 0 || isCut) {
          setFeedback({
            status: 'partial',
            message: 'Ajuste o enquadramento',
            missingParts,
            confidence: Math.round(avgConfidence * 100),
            landmarks,  // ✅ Expõe landmarks
          });
          setIsWellFramed(false);
          setShouldBlock(true);
          return;
        }

        // Tamanho adequado (entre 60% e 85% da altura)
        const idealSize = height >= 0.6 && height <= 0.85;

        if (!idealSize) {
          setFeedback({
            status: 'partial',
            message: height < 0.6 ? 'Aproxime-se da câmera' : 'Afaste-se um pouco',
            confidence: Math.round(avgConfidence * 100),
            landmarks,  // ✅ Expõe landmarks
          });
          setIsWellFramed(false);
          setShouldBlock(true);
          return;
        }

        // ✅ BEM ENQUADRADO!
        setFeedback({
          status: 'well-framed',
          message: '✓ Posição perfeita',
          confidence: Math.round(avgConfidence * 100),
          landmarks,  // ✅ Expõe landmarks
        });
        setIsWellFramed(true);
        setShouldBlock(false);

      } catch (error) {
        console.error('Erro na detecção:', error);
        setFeedback({
          status: 'checking',
          message: 'Verificando...',
          confidence: 0,
          landmarks: undefined,
        });
      }
    };

    // Inicia detecção periódica
    intervalRef.current = setInterval(detectPose, checkIntervalMs);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, videoElement, checkIntervalMs]);

  return {
    feedback,
    isWellFramed,
    shouldBlock,
    // ✅ NOVO: Expõe landmarks diretamente
    landmarks: feedback.landmarks,
  };
}