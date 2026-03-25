// src/hooks/useEpiVideoStream.ts
// Hook para processamento contínuo de vídeo via WebSocket.
// Envia frames JPEG do vídeo ao backend a ~10fps.
// Backend processa com YOLOv8 + InsightFace (GPU) e devolve detecções.
// Decisão final por maioria de frames em X segundos.

import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

export interface EpiDetection {
  class_name: string;
  confidence: number;
  bbox: { x: number; y: number; w: number; h: number };
  source?: string;
}

export interface EpiFrameResult {
  type: "frame_result";
  frame_id: number;
  processing_ms: number;
  compliant: boolean;
  missing: string[];
  detections: EpiDetection[];
  face_detected: boolean;
  face_recognized: boolean;
  face_person_code: string | null;
  face_confidence: number;
  face_bbox: { x: number; y: number; w: number; h: number } | null;
  // Progresso da janela de decisão
  window_progress: number;    // 0.0 → 1.0
  window_elapsed: number;     // segundos decorridos
  window_seconds: number;     // duração total da janela
  // Stats acumulados da janela atual
  session_frame_count: number;
  session_compliant_rate: number;
  session_face_rate: number;
}

export interface EpiStreamDecision {
  type: "decision";
  access_decision: "GRANTED" | "DENIED_EPI" | "DENIED_FACE";
  compliant_frames: number;
  total_frames: number;
  compliance_rate: number;
  face_frames: number;
  face_rate: number;
  person_code: string | null;
  person_name: string | null;
  window_seconds: number;
}

export type EpiStreamStatus =
  | "idle"          // não conectado
  | "connecting"    // conectando WS
  | "streaming"     // enviando frames, recebendo resultados
  | "decided"       // decisão tomada, aguardando reset
  | "error"         // erro de conexão
  | "disconnected"; // desconectado

export interface UseEpiVideoStreamReturn {
  // Estado
  status: EpiStreamStatus;
  latestFrame: EpiFrameResult | null;
  decision: EpiStreamDecision | null;
  windowProgress: number;       // 0.0 → 1.0
  sessionCompliantRate: number; // taxa de conformidade acumulada
  sessionFaceRate: number;      // taxa de face detectada acumulada
  error: string | null;
  frameCount: number;

  // Controle
  startStream: (videoElement: HTMLVideoElement) => void;
  stopStream: () => void;
  resetDecision: () => void;
}

export interface EpiVideoStreamConfig {
  companyId: number;
  windowSeconds?: number;   // segundos para decidir (default: 3)
  fps?: number;             // frames por segundo enviados (default: 10)
  confidence?: number;      // threshold YOLO (default: 0.4)
  faceThreshold?: number;   // threshold face recognition (default: 0.45)
  detectFaces?: boolean;    // ativar reconhecimento facial (default: true)
  apiBase?: string;         // base URL da API (default: aihub.smartxhub.cloud)
  jpegQuality?: number;     // qualidade JPEG enviado 0-1 (default: 0.7)
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: resolve URL do WebSocket
// ─────────────────────────────────────────────────────────────────────────────

function getEpiStreamWsUrl(config: EpiVideoStreamConfig): string {
  const base = (config.apiBase ?? "https://aihub.smartxhub.cloud")
    .replace("https://", "wss://")
    .replace("http://", "ws://");

  const params = new URLSearchParams({
    company_id: String(config.companyId),
    window_seconds: String(config.windowSeconds ?? 3),
    fps: String(config.fps ?? 10),
    confidence: String(config.confidence ?? 0.4),
    face_threshold: String(config.faceThreshold ?? 0.45),
    detect_faces: String(config.detectFaces ?? true),
  });

  return `${base}/api/v1/epi/ws/epi-stream?${params.toString()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function useEpiVideoStream(config: EpiVideoStreamConfig): UseEpiVideoStreamReturn {
  const [status, setStatus] = useState<EpiStreamStatus>("idle");
  const [latestFrame, setLatestFrame] = useState<EpiFrameResult | null>(null);
  const [decision, setDecision] = useState<EpiStreamDecision | null>(null);
  const [windowProgress, setWindowProgress] = useState(0);
  const [sessionCompliantRate, setSessionCompliantRate] = useState(0);
  const [sessionFaceRate, setSessionFaceRate] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [frameCount, setFrameCount] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const captureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isStreamingRef = useRef(false);

  // Canvas offscreen para captura de frames
  const getCanvas = useCallback(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    return canvasRef.current;
  }, []);

  // ── Captura e envia um frame ──────────────────────────────────────────────
  const captureAndSend = useCallback(() => {
    const ws = wsRef.current;
    const video = videoRef.current;

    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    if (!video || video.readyState < 2) return;
    if (!isStreamingRef.current) return;

    const canvas = getCanvas();
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converte para blob JPEG e envia como binário
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const ws = wsRef.current;
        if (ws?.readyState === WebSocket.OPEN) {
          blob.arrayBuffer().then((buf) => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(buf);
              setFrameCount((n) => n + 1);
            }
          });
        }
      },
      "image/jpeg",
      config.jpegQuality ?? 0.7,
    );
  }, [getCanvas, config.jpegQuality]);

  // ── Inicia o stream ───────────────────────────────────────────────────────
  const startStream = useCallback((videoElement: HTMLVideoElement) => {
    // Fecha conexão anterior se existir
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }

    videoRef.current = videoElement;
    isStreamingRef.current = false;

    setStatus("connecting");
    setError(null);
    setLatestFrame(null);
    setDecision(null);
    setWindowProgress(0);
    setSessionCompliantRate(0);
    setSessionFaceRate(0);
    setFrameCount(0);

    const url = getEpiStreamWsUrl(config);
    console.log(`[EpiStream] Conectando: ${url}`);

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[EpiStream] ✅ WebSocket aberto");
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);

        switch (msg.type) {
          case "connected":
            // Backend confirmou — inicia captura de frames
            isStreamingRef.current = true;
            setStatus("streaming");
            console.log(`[EpiStream] Stream iniciado — window=${msg.window_seconds}s fps=${msg.fps}`);

            const intervalMs = 1000 / (config.fps ?? 10);
            captureIntervalRef.current = setInterval(captureAndSend, intervalMs);
            break;

          case "frame_result": {
            const frame = msg as EpiFrameResult;
            setLatestFrame(frame);
            setWindowProgress(frame.window_progress);
            setSessionCompliantRate(frame.session_compliant_rate);
            setSessionFaceRate(frame.session_face_rate);
            break;
          }

          case "decision": {
            const dec = msg as EpiStreamDecision;
            console.log(`[EpiStream] Decisão: ${dec.access_decision} (${(dec.compliance_rate * 100).toFixed(0)}% compliant, ${(dec.face_rate * 100).toFixed(0)}% face)`);
            setDecision(dec);
            setStatus("decided");
            setWindowProgress(0);
            // Para captura de frames após decisão
            if (captureIntervalRef.current) {
              clearInterval(captureIntervalRef.current);
              captureIntervalRef.current = null;
            }
            isStreamingRef.current = false;
            break;
          }

          case "reset_ok":
            setDecision(null);
            setStatus("streaming");
            setWindowProgress(0);
            setSessionCompliantRate(0);
            setSessionFaceRate(0);
            break;

          case "error":
            console.warn("[EpiStream] Erro do servidor:", msg.message);
            break;

          case "ping":
            // Keepalive — ignora
            break;
        }
      } catch (e) {
        console.warn("[EpiStream] Mensagem não-JSON:", ev.data);
      }
    };

    ws.onerror = (ev) => {
      console.error("[EpiStream] Erro WebSocket:", ev);
      setError("Erro de conexão com o servidor de detecção");
      setStatus("error");
      isStreamingRef.current = false;
    };

    ws.onclose = (ev) => {
      console.warn(`[EpiStream] Fechado (code: ${ev.code})`);
      isStreamingRef.current = false;
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
      if (ev.code !== 1000) {
        // Fechamento não-normal
        setStatus("disconnected");
      }
    };
  }, [config, captureAndSend]);

  // ── Para o stream ─────────────────────────────────────────────────────────
  const stopStream = useCallback(() => {
    isStreamingRef.current = false;

    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }

    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: "stop" }));
      }
      wsRef.current.close(1000, "User stopped stream");
      wsRef.current = null;
    }

    setStatus("idle");
    videoRef.current = null;
  }, []);

  // ── Reseta decisão para nova janela ───────────────────────────────────────
  const resetDecision = useCallback(() => {
    setDecision(null);
    setLatestFrame(null);
    setWindowProgress(0);
    setSessionCompliantRate(0);
    setSessionFaceRate(0);
    setFrameCount(0);

    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: "reset" }));
      isStreamingRef.current = true;
      setStatus("streaming");

      // Reinicia captura
      if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
      const intervalMs = 1000 / (config.fps ?? 10);
      captureIntervalRef.current = setInterval(captureAndSend, intervalMs);
    }
  }, [config.fps, captureAndSend]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      isStreamingRef.current = false;
      if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, []);

  return {
    status,
    latestFrame,
    decision,
    windowProgress,
    sessionCompliantRate,
    sessionFaceRate,
    error,
    frameCount,
    startStream,
    stopStream,
    resetDecision,
  };
}