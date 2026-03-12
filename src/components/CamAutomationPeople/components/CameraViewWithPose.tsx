// src/components/CamAutomationPeople/components/CameraViewWithPose.tsx
// Componente de câmera com detecção de pose em tempo real
// Mostra feedback visual ao usuário sobre o enquadramento
//@ts-ignore
import React, { useEffect, useRef, useState } from 'react';
import { useMediaPipePose } from '../../../hooks/useMediaPipePose';
import type { CamRole, CameraHook } from '../../../hooks/useCamAutomation';

interface CameraViewWithPoseProps {
  role: CamRole;
  cameraHook: CameraHook;
  showSkeleton?: boolean;           // Mostrar skeleton overlay?
  showFramingGuide?: boolean;       // Mostrar guia de enquadramento?
  autoCapture?: boolean;            // Captura automática quando bem posicionado?
  autoCaptureDuration?: number;     // Tempo em milissegundos para auto-captura
  onPoseUpdate?: (wellPositioned: boolean) => void;
  onAutoCapture?: () => void;
  className?: string;
}

export default function CameraViewWithPose({
  role,
  cameraHook,
  showSkeleton = true,
  showFramingGuide = true,
  autoCapture = false,
  autoCaptureDuration = 2000,
  onPoseUpdate,
  onAutoCapture,
  className = '',
}: CameraViewWithPoseProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [autoCaptureProgress, setAutoCaptureProgress] = useState(0);
  //@ts-ignore
  const autoCaptureTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionStateRef = useRef(false);

  const {
    isReady,
    status,
    startContinuousDetection,
    stopContinuousDetection,
    drawPoseOverlay,
  } = useMediaPipePose();

  // ═══════════════════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO DA CÂMERA
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!cameraHook || !role) return;
    cameraHook.setVideoRef(role, videoRef.current);
    if (cameraHook.getAssignment(role)) {
      cameraHook.startStream(role);
    }
  }, [role, cameraHook]);

  // ═══════════════════════════════════════════════════════════════════════════
  // DETECÇÃO CONTÍNUA DE POSE
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!isReady || !videoRef.current) return;

    const handlePoseUpdate = (newStatus: any) => {
      // Desenha skeleton overlay se habilitado
      if (showSkeleton && overlayCanvasRef.current && newStatus.landmarks) {
        drawPoseOverlay(videoRef.current!, overlayCanvasRef.current, newStatus.landmarks);
      }

      // Notifica parent component sobre mudança de posição
      if (onPoseUpdate && newStatus.wellPositioned !== lastPositionStateRef.current) {
        lastPositionStateRef.current = newStatus.wellPositioned;
        onPoseUpdate(newStatus.wellPositioned);
      }
    };

    startContinuousDetection(videoRef.current, handlePoseUpdate);

    return () => {
      stopContinuousDetection();
    };
  }, [isReady, showSkeleton, drawPoseOverlay, startContinuousDetection, stopContinuousDetection, onPoseUpdate]);

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTO-CAPTURA
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!autoCapture) {
      setAutoCaptureProgress(0);
      if (autoCaptureTimerRef.current) {
        clearTimeout(autoCaptureTimerRef.current);
        autoCaptureTimerRef.current = null;
      }
      return;
    }

    if (status.wellPositioned && status.confidence > 0.7) {
      // Pessoa bem posicionada - inicia contagem para auto-captura
      const startTime = Date.now();
      
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / autoCaptureDuration) * 100, 100);
        setAutoCaptureProgress(progress);

        if (progress >= 100) {
          // Auto-captura!
          if (onAutoCapture) {
            onAutoCapture();
          }
          setAutoCaptureProgress(0);
        } else {
          autoCaptureTimerRef.current = setTimeout(updateProgress, 16); // ~60fps
        }
      };

      updateProgress();

      return () => {
        if (autoCaptureTimerRef.current) {
          clearTimeout(autoCaptureTimerRef.current);
          autoCaptureTimerRef.current = null;
        }
      };
    } else {
      // Pessoa NÃO está bem posicionada - reseta progresso
      setAutoCaptureProgress(0);
      if (autoCaptureTimerRef.current) {
        clearTimeout(autoCaptureTimerRef.current);
        autoCaptureTimerRef.current = null;
      }
    }
  }, [autoCapture, status.wellPositioned, status.confidence, autoCaptureDuration, onAutoCapture]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CORES E ESTILOS BASEADOS NO STATUS
  // ═══════════════════════════════════════════════════════════════════════════

  const getBorderColor = () => {
    if (!status.personDetected) return '#666';
    if (status.wellPositioned) return '#00FF00';
    if (status.fullyFramed) return '#FFA500';
    return '#FF0000';
  };

  const getStatusIcon = () => {
    if (!status.personDetected) return '👤';
    if (status.wellPositioned) return '✅';
    if (status.fullyFramed) return '⚠️';
    return '❌';
  };

  const getFeedbackColor = () => {
    if (!status.personDetected) return '#999';
    if (status.wellPositioned) return '#00FF00';
    if (status.fullyFramed) return '#FFA500';
    return '#FF6B6B';
  };

  return (
    <div
      className={`cam-view-with-pose ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: role === 'face' ? '9/12' : '16/12',
        maxHeight: '85vh',
        background: '#000',
        borderRadius: '16px',
        overflow: 'hidden',
        border: `3px solid ${getBorderColor()}`,
        transition: 'border-color 300ms ease',
        boxShadow: status.wellPositioned 
          ? `0 0 30px ${getBorderColor()}88` 
          : 'none',
        margin: '0 auto',
      }}
    >
      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* VÍDEO DA CÂMERA */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: role === 'face' ? 'scaleX(-1)' : 'none',
        }}
      />

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* CANVAS OVERLAY (Skeleton) */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {showSkeleton && (
        <canvas
          ref={overlayCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            transform: role === 'face' ? 'scaleX(-1)' : 'none',
          }}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* GUIA DE ENQUADRAMENTO */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {showFramingGuide && !status.wellPositioned && (
        <div
          style={{
            position: 'absolute',
            inset: '10%',
            border: '2px dashed rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              padding: '8px 16px',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            Posicione-se dentro desta área
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* BARRA DE PROGRESSO AUTO-CAPTURA */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {autoCapture && autoCaptureProgress > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${autoCaptureProgress}%`,
              background: 'linear-gradient(90deg, #00FF00, #00CC00)',
              transition: 'width 16ms linear',
            }}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* FEEDBACK AO USUÁRIO */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        {/* Ícone de status */}
        <div
          style={{
            fontSize: '2rem',
            lineHeight: 1,
          }}
        >
          {getStatusIcon()}
        </div>

        {/* Mensagem de feedback */}
        <div
          style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: getFeedbackColor(),
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          {status.feedback}
        </div>

        {/* Indicador de confiança */}
        {status.personDetected && (
          <div
            style={{
              fontSize: '0.7rem',
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: 'monospace',
            }}
          >
            Confiança: {Math.round(status.confidence * 100)}%
          </div>
        )}

        {/* Mensagem de auto-captura */}
        {autoCapture && autoCaptureProgress > 0 && (
          <div
            style={{
              fontSize: '0.8rem',
              color: '#00FF00',
              fontWeight: 600,
              animation: 'pulse 1s infinite',
            }}
          >
            🎯 Capturando em {Math.ceil((100 - autoCaptureProgress) / 50)}s...
          </div>
        )}

        {/* Status de carregamento */}
        {!isReady && (
          <div
            style={{
              fontSize: '0.8rem',
              color: '#FFA500',
            }}
          >
            ⏳ Carregando detector de pose...
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* CORNER BRACKETS (quando bem posicionado) */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {status.wellPositioned && (
        <>
          {/* Top Left */}
          <div style={{
            position: 'absolute',
            top: '12%',
            left: '12%',
            width: '30px',
            height: '30px',
            borderTop: '4px solid #00FF00',
            borderLeft: '4px solid #00FF00',
            borderRadius: '4px 0 0 0',
          }} />
          
          {/* Top Right */}
          <div style={{
            position: 'absolute',
            top: '12%',
            right: '12%',
            width: '30px',
            height: '30px',
            borderTop: '4px solid #00FF00',
            borderRight: '4px solid #00FF00',
            borderRadius: '0 4px 0 0',
          }} />
          
          {/* Bottom Left */}
          <div style={{
            position: 'absolute',
            bottom: '12%',
            left: '12%',
            width: '30px',
            height: '30px',
            borderBottom: '4px solid #00FF00',
            borderLeft: '4px solid #00FF00',
            borderRadius: '0 0 0 4px',
          }} />
          
          {/* Bottom Right */}
          <div style={{
            position: 'absolute',
            bottom: '12%',
            right: '12%',
            width: '30px',
            height: '30px',
            borderBottom: '4px solid #00FF00',
            borderRight: '4px solid #00FF00',
            borderRadius: '0 0 4px 0',
          }} />
        </>
      )}
    </div>
  );
}