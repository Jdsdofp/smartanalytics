// src/components/CameraView/index.tsx
// Componente de exibição de câmera com overlays de scan e status
// Otimizado para tablets com layout responsivo dinâmico

import React, { useEffect, useRef } from 'react';
import type { CamRole, CameraHook } from '../../../hooks/useCamAutomation';
import { useTabletLayout } from '../../../hooks/useTabletLayout';

type CamStatus = 'idle' | 'scanning' | 'ok' | 'fail' | 'warning';

interface CameraViewProps {
  role: CamRole;
  cameraHook: CameraHook;
  scanning?: boolean;
  label?: string;
  captureUrl?: string | null;
  status?: CamStatus;
  autoStart?: boolean;
  overlay?: React.ReactNode;
  className?: string;
  aspectRatio?: string;
  dynamicSize?: boolean; // Nova prop para ativar dimensionamento dinâmico
}

const STATUS_COLORS: Record<CamStatus, string> = {
  idle:    'transparent',
  scanning:'var(--blue)',
  ok:      'var(--green)',
  fail:    'var(--red)',
  warning: 'var(--amber)',
};

const STATUS_LABELS: Record<CamStatus, string | null> = {
  idle:    null,
  scanning:'Analisando…',
  ok:      'Aprovado',
  fail:    'Reprovado',
  warning: 'Atenção',
};

export default function CameraView({
  role,
  cameraHook,
  scanning = false,
  label,
  captureUrl = null,
  status = 'idle',
  autoStart = true,
  overlay,
  className = '',
  aspectRatio,
  dynamicSize = true,
}: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const layoutInfo = useTabletLayout();

  useEffect(() => {
    if (!cameraHook || !role) return;
    cameraHook.setVideoRef(role, videoRef.current);
    if (autoStart && cameraHook.getAssignment(role)) {
      cameraHook.startStream(role);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, autoStart, cameraHook?.getAssignment(role)]);

  const borderColor = STATUS_COLORS[status] ?? 'transparent';

  // Calcula aspect ratio dinamicamente baseado no dispositivo e orientação
  const computedAspectRatio = aspectRatio || (
    dynamicSize ? layoutInfo.aspectRatio : (role === 'face' ? '9/12' : '16/12')
  );

  // Calcula tamanho máximo baseado na orientação
  const maxSize = dynamicSize 
    ? (layoutInfo.orientation === 'landscape' ? '75vh' : '85vh')
    : '100%';

  // Ajusta corner brackets e oval guide para diferentes tamanhos
  const cornerSize = layoutInfo.size === 'large' ? 40 : layoutInfo.size === 'small' ? 25 : 30;
  const cornerOffset = layoutInfo.size === 'large' ? '15%' : '12%';

  return (
    <div
      className={`cam-view ${className}`}
      style={{
        position: 'relative',
        aspectRatio: computedAspectRatio,
        width: '100%',
        maxHeight: maxSize,
        background: '#000',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: `2px solid ${borderColor}`,
        transition: 'border-color 300ms ease, max-height 300ms ease',
        boxShadow: status !== 'idle' ? `0 0 24px ${borderColor}44` : 'none',
        margin: '0 auto', // centraliza horizontalmente
      }}
    >
      {/* Vídeo ao vivo */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          // objectFit: 'cover',
          objectFit: role === 'face' ? 'cover' : 'contain',
          display: captureUrl ? 'none' : 'block',
          transform: role === 'face' ? 'scaleX(-1)' : 'none',
        }}
      />

      {/* Frame capturado (freeze) */}
      {captureUrl && (
        <img
          src={captureUrl}
          alt="Frame capturado"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: role === 'face' ? 'scaleX(-1)' : 'none',
          }}
        />
      )}

      {/* Sem câmera atribuída */}
      {!cameraHook?.getAssignment(role) && !captureUrl && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--gray)',
            gap: 8,
            background: 'var(--bg-card)',
          }}
        >
          <span style={{ fontSize: '2rem' }}>📷</span>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            Câmera não configurada
          </span>
        </div>
      )}

      {/* Linha de scan animada */}
      {scanning && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, transparent, var(--blue), var(--blue-bright), transparent)',
              animation: 'scanline 1.8s linear infinite',
              boxShadow: '0 0 12px var(--blue)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(0,132,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,132,255,0.05) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>
      )}

      {/* Corner brackets para câmera de rosto */}
      {role === 'face' && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((pos) => {
            const isTop = pos.includes('top');
            const isLeft = pos.includes('left');
            return (
              <div
                key={pos}
                style={{
                  position: 'absolute',
                  [isTop ? 'top' : 'bottom']: cornerOffset,
                  [isLeft ? 'left' : 'right']: '20%',
                  width: cornerSize,
                  height: cornerSize,
                  borderTop: isTop ? `3px solid ${borderColor || 'var(--blue)'}` : 'none',
                  borderBottom: !isTop ? `3px solid ${borderColor || 'var(--blue)'}` : 'none',
                  borderLeft: isLeft ? `3px solid ${borderColor || 'var(--blue)'}` : 'none',
                  borderRight: !isLeft ? `3px solid ${borderColor || 'var(--blue)'}` : 'none',
                  opacity: 0.8,
                  transition: 'border-color 300ms ease, width 300ms ease, height 300ms ease',
                }}
              />
            );
          })}
          {/* Oval face guide */}
          <div
            style={{
              position: 'absolute',
              top: '10%',
              left: '20%',
              right: '20%',
              bottom: '10%',
              border: `1px dashed ${scanning ? 'var(--blue)' : 'rgba(255,255,255,0.2)'}`,
              borderRadius: '50%',
              transition: 'border-color 300ms ease',
            }}
          />
        </div>
      )}

      {/* Label superior */}
      {label && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: 'rgba(7,11,20,0.85)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '3px 8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--gray-light)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>
      )}

      {/* Status badge */}
      {STATUS_LABELS[status] && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: `${borderColor}22`,
            border: `1px solid ${borderColor}66`,
            borderRadius: 'var(--radius-sm)',
            padding: '3px 10px',
            fontFamily: 'var(--font-head)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: borderColor,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {STATUS_LABELS[status]}
        </div>
      )}

      {/* Overlay customizado */}
      {overlay && <div style={{ position: 'absolute', inset: 0 }}>{overlay}</div>}
    </div>
  );
}