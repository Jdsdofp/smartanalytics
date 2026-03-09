// src/components/TopBar/index.tsx
// Barra superior do tablet com logo, status da porta, hora e botões de modal
// Versão responsiva adaptada para diferentes tamanhos de tela

import React, { useState, useEffect } from 'react';
import type { DoorStatus, SysConfig } from '../../../hooks/useCamAutomation';

interface TopBarProps {
  doorStatus: DoorStatus;
  config: SysConfig;
  onOpenReport: () => void;
  onOpenConfig: () => void;
}

export default function TopBar({ onOpenReport, onOpenConfig, doorStatus, config }: TopBarProps) {
  const [time, setTime] = useState(new Date());
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Detecta tamanho da tela
  useEffect(() => {
    const checkSize = () => {
      setIsCompact(window.innerWidth < 768);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
  const dateStr = time.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });

  if (isCompact) {
    // Layout compacto para telas menores
    return (
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '8px 12px',
          background: 'var(--bg-panel)',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          gap: 8,
        }}
      >
        {/* Primeira linha: Logo + Status + Hora */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}>
          {/* Logo compacto */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                background: 'var(--blue)',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-head)',
                fontWeight: 900,
                fontSize: '0.7rem',
                color: '#fff',
              }}
            >
              SX
            </div>
            <div
              style={{
                fontFamily: 'var(--font-head)',
                fontWeight: 700,
                fontSize: '0.85rem',
                letterSpacing: '0.03em',
                color: 'var(--white)',
              }}
            >
              EPI CHECK
            </div>
          </div>

          {/* Status compacto */}
          <DoorStatusIndicator status={doorStatus} compact />

          {/* Hora compacta */}
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--white)',
                letterSpacing: '0.03em',
              }}
            >
              {timeStr}
            </div>
          </div>
        </div>

        {/* Segunda linha: Botões */}
        <div style={{
          display: 'flex',
          gap: 6,
          justifyContent: 'space-between',
        }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.55rem',
              color: 'var(--gray-light)',
              letterSpacing: '0.03em',
              padding: '2px 0',
            }}
          >
            {config?.doorId || 'DOOR_01'}
          </div>
          
          <div style={{ display: 'flex', gap: 6, flex: 1, justifyContent: 'flex-end' }}>
            <HeaderButton onClick={onOpenReport} compact>
              ⏱
            </HeaderButton>
            <HeaderButton onClick={onOpenConfig} compact>
              ⚙
            </HeaderButton>
          </div>
        </div>
      </header>
    );
  }

  // Layout normal para telas maiores
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: 56,
        background: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        gap: 12,
      }}
    >
      {/* Logo + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div
          style={{
            width: 32,
            height: 32,
            background: 'var(--blue)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-head)',
            fontWeight: 900,
            fontSize: '0.85rem',
            color: '#fff',
            letterSpacing: '-0.02em',
            flexShrink: 0,
          }}
        >
          SX
        </div>
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <div
            style={{
              fontFamily: 'var(--font-head)',
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '0.05em',
              color: 'var(--white)',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            EPI CHECK
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              color: 'var(--gray-light)',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {config?.doorId || 'DOOR_CAMARA_FRIA_01'}
          </div>
        </div>
      </div>

      {/* Center — door status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, justifyContent: 'center', minWidth: 0 }}>
        <DoorStatusIndicator status={doorStatus} />
      </div>

      {/* Right — clock + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--white)',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
            }}
          >
            {timeStr}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              color: 'var(--gray-light)',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {dateStr}
          </div>
        </div>

        <div style={{ width: 1, height: 28, background: 'var(--border)' }} />

        <HeaderButton onClick={onOpenReport}>⏱ PERMANÊNCIA</HeaderButton>
        <HeaderButton onClick={onOpenConfig}>⚙ CONFIG</HeaderButton>
      </div>
    </header>
  );
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────

interface HeaderButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  compact?: boolean;
}

function HeaderButton({ onClick, children, compact = false }: HeaderButtonProps) {
  const [hovered, setHovered] = useState(false);

  if (compact) {
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'transparent',
          border: `1px solid ${hovered ? 'var(--blue)' : 'var(--border)'}`,
          borderRadius: 6,
          color: hovered ? 'var(--blue)' : 'var(--gray-light)',
          padding: '4px 10px',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 200ms',
          minWidth: 36,
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'transparent',
        border: `1px solid ${hovered ? 'var(--blue)' : 'var(--border)'}`,
        borderRadius: 8,
        color: hovered ? 'var(--blue)' : 'var(--gray-light)',
        padding: '6px 12px',
        fontSize: '0.75rem',
        fontFamily: 'var(--font-head)',
        fontWeight: 600,
        letterSpacing: '0.05em',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
        transition: 'all 200ms',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

interface DoorStatusIndicatorProps {
  status: DoorStatus;
  compact?: boolean;
}

function DoorStatusIndicator({ status, compact = false }: DoorStatusIndicatorProps) {
  const configs: Record<DoorStatus, { color: string; label: string; labelShort: string; icon: string }> = {
    closed:  { color: 'var(--gray)',  label: 'PORTA FECHADA',    labelShort: 'FECHADA', icon: '🔒' },
    open:    { color: 'var(--green)', label: 'PORTA ABERTA',     labelShort: 'ABERTA',  icon: '🔓' },
    alert:   { color: 'var(--red)',   label: 'ALERTA DE ACESSO', labelShort: 'ALERTA',  icon: '🚨' },
    waiting: { color: 'var(--amber)', label: 'AGUARDANDO',       labelShort: 'AGUARD.', icon: '⏳' },
  };
  const cfg = configs[status] ?? configs.closed;

  if (compact) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 8px',
          background: `${cfg.color}11`,
          border: `1px solid ${cfg.color}44`,
          borderRadius: 12,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: cfg.color,
            boxShadow: `0 0 6px ${cfg.color}`,
            animation: status === 'open' ? 'pulse-dot 1.5s ease infinite' : 'none',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: '0.6rem',
            fontWeight: 700,
            color: cfg.color,
            letterSpacing: '0.05em',
          }}
        >
          {cfg.labelShort}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 14px',
        background: `${cfg.color}11`,
        border: `1px solid ${cfg.color}44`,
        borderRadius: 20,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: cfg.color,
          boxShadow: `0 0 8px ${cfg.color}`,
          animation: status === 'open' ? 'pulse-dot 1.5s ease infinite' : 'none',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: 'var(--font-head)',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: cfg.color,
          letterSpacing: '0.08em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {cfg.label}
      </span>
    </div>
  );
}