// src/hooks/useMediaPipePose.ts
// Hook para detecção de pose com MediaPipe no frontend
// Verifica se a pessoa está completamente enquadrada na câmera

import { useEffect, useRef, useState, useCallback } from 'react';

import { 
  PoseLandmarker, 
  FilesetResolver,
  DrawingUtils,
  type PoseLandmarkerResult 
  //@ts-ignore
} from '@mediapipe/tasks-vision';

export interface PoseDetectionStatus {
  personDetected: boolean;
  fullyFramed: boolean;        // Pessoa completamente no frame
  wellPositioned: boolean;      // Bem posicionada (centralizada)
  confidence: number;           // Confiança da detecção (0-1)
  landmarks?: any[];            // 33 landmarks do corpo
  feedback: string;             // Mensagem para o usuário
}

export interface PoseBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

const MARGIN_THRESHOLD = 0.1;    // 10% de margem em cada lado
const CONFIDENCE_THRESHOLD = 0.6; // 60% de confiança mínima
const CENTER_TOLERANCE = 0.15;    // 15% de tolerância para centralização

export function useMediaPipePose() {
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<PoseDetectionStatus>({
    personDetected: false,
    fullyFramed: false,
    wellPositioned: false,
    confidence: 0,
    feedback: 'Inicializando detector de pose...',
  });

  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  ///@ts-ignore
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO DO MEDIAPIPE
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    const initPoseLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU', // Usa GPU se disponível
          },
          runningMode: 'VIDEO',
          numPoses: 1,              // Detectar apenas 1 pessoa
          minPoseDetectionConfidence: CONFIDENCE_THRESHOLD,
          minPosePresenceConfidence: CONFIDENCE_THRESHOLD,
          minTrackingConfidence: CONFIDENCE_THRESHOLD,
        });

        poseLandmarkerRef.current = poseLandmarker;
        setIsReady(true);
        setStatus(prev => ({
          ...prev,
          feedback: 'Detector pronto. Posicione-se na câmera.',
        }));
      } catch (error) {
        console.error('Erro ao inicializar MediaPipe Pose:', error);
        setStatus(prev => ({
          ...prev,
          feedback: 'Erro ao carregar detector de pose',
        }));
      }
    };

    initPoseLandmarker();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      poseLandmarkerRef.current?.close();
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // ANÁLISE DE ENQUADRAMENTO
  // ═══════════════════════════════════════════════════════════════════════════

  const analyzePoseBounds = useCallback((landmarks: any[]): PoseBounds => {
    // Calcula bounding box dos landmarks
    let minX = 1, maxX = 0, minY = 1, maxY = 0;

    landmarks.forEach(landmark => {
      minX = Math.min(minX, landmark.x);
      maxX = Math.max(maxX, landmark.x);
      minY = Math.min(minY, landmark.y);
      maxY = Math.max(maxY, landmark.y);
    });

    return {
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }, []);

  const checkFraming = useCallback((bounds: PoseBounds): {
    fullyFramed: boolean;
    wellPositioned: boolean;
    feedback: string;
  } => {
    //@ts-ignore
    const { minX, maxX, minY, maxY, width, height } = bounds;

    // Verifica se a pessoa está cortada nas bordas
    const isCutLeft = minX < MARGIN_THRESHOLD;
    const isCutRight = maxX > (1 - MARGIN_THRESHOLD);
    const isCutTop = minY < MARGIN_THRESHOLD;
    const isCutBottom = maxY > (1 - MARGIN_THRESHOLD);

    const fullyFramed = !isCutLeft && !isCutRight && !isCutTop && !isCutBottom;

    // Verifica centralização
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const isXCentered = Math.abs(centerX - 0.5) < CENTER_TOLERANCE;
    const isYCentered = Math.abs(centerY - 0.5) < CENTER_TOLERANCE;

    // Verifica tamanho adequado (pessoa não muito longe nem muito perto)
    //@ts-ignore
    const idealHeight = 0.7; // Pessoa deve ocupar ~70% da altura
    const heightOk = height > 0.5 && height < 0.9;

    const wellPositioned = fullyFramed && isXCentered && isYCentered && heightOk;

    // Feedback específico
    let feedback = '';
    if (isCutTop || isCutBottom) {
      feedback = isCutTop ? '⬆️ Afaste-se da câmera' : '⬇️ Aproxime-se da câmera';
    } else if (isCutLeft) {
      feedback = '➡️ Mova-se para a direita';
    } else if (isCutRight) {
      feedback = '⬅️ Mova-se para a esquerda';
    } else if (!heightOk) {
      feedback = height < 0.5 ? '⬆️ Aproxime-se da câmera' : '⬇️ Afaste-se da câmera';
    } else if (!isXCentered) {
      feedback = centerX < 0.5 ? '➡️ Centralize-se (mais à direita)' : '⬅️ Centralize-se (mais à esquerda)';
    } else if (!isYCentered) {
      feedback = centerY < 0.5 ? '⬇️ Centralize-se (mais para baixo)' : '⬆️ Centralize-se (mais para cima)';
    } else {
      feedback = '✅ Perfeito! Posição ideal';
    }

    return { fullyFramed, wellPositioned, feedback };
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // DETECÇÃO EM TEMPO REAL
  // ═══════════════════════════════════════════════════════════════════════════

  const detectPose = useCallback(
    async (videoElement: HTMLVideoElement): Promise<PoseDetectionStatus> => {
      if (!poseLandmarkerRef.current || !videoElement || videoElement.readyState < 2) {
        return {
          personDetected: false,
          fullyFramed: false,
          wellPositioned: false,
          confidence: 0,
          feedback: 'Carregando vídeo...',
        };
      }

      try {
        const timestamp = performance.now();
        const result: PoseLandmarkerResult = poseLandmarkerRef.current.detectForVideo(
          videoElement,
          timestamp
        );

        // Nenhuma pose detectada
        if (!result.landmarks || result.landmarks.length === 0) {
          return {
            personDetected: false,
            fullyFramed: false,
            wellPositioned: false,
            confidence: 0,
            feedback: '👤 Nenhuma pessoa detectada',
          };
        }

        // Pega a primeira (e única) pose detectada
        const landmarks = result.landmarks[0];
        //@ts-ignore
        const worldLandmarks = result.worldLandmarks?.[0];

        // Calcula confiança média dos landmarks principais
        // Landmarks importantes: 0=nose, 11=left_shoulder, 12=right_shoulder, 
        //                        23=left_hip, 24=right_hip, 15=left_ankle, 16=right_ankle
        const keyLandmarkIndices = [0, 11, 12, 23, 24, 27, 28];
        const avgConfidence = keyLandmarkIndices.reduce((sum, idx) => {
          return sum + (landmarks[idx]?.visibility || 0);
        }, 0) / keyLandmarkIndices.length;

        // Analisa enquadramento
        const bounds = analyzePoseBounds(landmarks);
        const { fullyFramed, wellPositioned, feedback } = checkFraming(bounds);

        return {
          personDetected: true,
          fullyFramed,
          wellPositioned,
          confidence: avgConfidence,
          landmarks,
          feedback,
        };
      } catch (error) {
        console.error('Erro na detecção de pose:', error);
        return {
          personDetected: false,
          fullyFramed: false,
          wellPositioned: false,
          confidence: 0,
          feedback: 'Erro na detecção',
        };
      }
    },
    [analyzePoseBounds, checkFraming]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // LOOP DE DETECÇÃO CONTÍNUA
  // ═══════════════════════════════════════════════════════════════════════════

  const startContinuousDetection = useCallback(
    (videoElement: HTMLVideoElement, onUpdate?: (status: PoseDetectionStatus) => void) => {
      if (!isReady) return;

      const detect = async () => {
        const newStatus = await detectPose(videoElement);
        setStatus(newStatus);
        if (onUpdate) onUpdate(newStatus);

        animationFrameRef.current = requestAnimationFrame(detect);
      };

      detect();
    },
    [isReady, detectPose]
  );

  const stopContinuousDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // DESENHAR SKELETON OVERLAY
  // ═══════════════════════════════════════════════════════════════════════════

  const drawPoseOverlay = useCallback(
    (
      videoElement: HTMLVideoElement,
      canvasElement: HTMLCanvasElement,
      landmarks?: any[]
    ) => {
      if (!landmarks || !canvasElement) return;

      const ctx = canvasElement.getContext('2d');
      if (!ctx) return;

      // Ajusta canvas ao tamanho do vídeo
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;

      // Limpa canvas
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Desenha conexões do corpo (skeleton)
      //@ts-ignore
      const drawingUtils = new DrawingUtils(ctx);
      
      // Conexões principais do corpo
      const connections = [
        // Torso
        [11, 12], [11, 23], [12, 24], [23, 24],
        // Braço esquerdo
        [11, 13], [13, 15],
        // Braço direito
        [12, 14], [14, 16],
        // Perna esquerda
        [23, 25], [25, 27],
        // Perna direita
        [24, 26], [26, 28],
        // Cabeça
        [0, 1], [0, 4], [1, 2], [2, 3], [3, 7], [4, 5], [5, 6], [6, 8],
      ];

      // Desenha linhas
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 3;
      connections.forEach(([start, end]) => {
        const startPoint = landmarks[start];
        const endPoint = landmarks[end];
        if (startPoint && endPoint) {
          ctx.beginPath();
          ctx.moveTo(
            startPoint.x * canvasElement.width,
            startPoint.y * canvasElement.height
          );
          ctx.lineTo(
            endPoint.x * canvasElement.width,
            endPoint.y * canvasElement.height
          );
          ctx.stroke();
        }
      });

      // Desenha pontos (landmarks)
      ctx.fillStyle = '#FF0000';
      landmarks.forEach(landmark => {
        ctx.beginPath();
        ctx.arc(
          landmark.x * canvasElement.width,
          landmark.y * canvasElement.height,
          5,
          0,
          2 * Math.PI
        );
        ctx.fill();
      });
    },
    []
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // DETECÇÃO ÚNICA (para captura de foto)
  // ═══════════════════════════════════════════════════════════════════════════

  const checkSingleFrame = useCallback(
    async (videoElement: HTMLVideoElement): Promise<PoseDetectionStatus> => {
      setIsProcessing(true);
      const result = await detectPose(videoElement);
      setIsProcessing(false);
      return result;
    },
    [detectPose]
  );

  return {
    isReady,
    isProcessing,
    status,
    detectPose,
    startContinuousDetection,
    stopContinuousDetection,
    drawPoseOverlay,
    checkSingleFrame,
  };
}