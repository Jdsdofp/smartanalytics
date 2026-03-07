// src/components/TopBar/index.tsx
// Barra superior do tablet com logo, status da porta, hora e botões de modal

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

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
  const dateStr = time.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
          }}
        >
          SX
        </div>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-head)',
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '0.05em',
              color: 'var(--white)',
              lineHeight: 1,
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
            }}
          >
            {config?.doorId || 'DOOR_CAMARA_FRIA_01'}
          </div>
        </div>
      </div>

      {/* Center — door status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <DoorStatusIndicator status={doorStatus} />
      </div>

      {/* Right — clock + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--white)',
              letterSpacing: '0.05em',
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

function HeaderButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);

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
      }}
    >
      {children}
    </button>
  );
}

interface DoorStatusIndicatorProps {
  status: DoorStatus;
}

function DoorStatusIndicator({ status }: DoorStatusIndicatorProps) {
  const configs: Record<DoorStatus, { color: string; label: string; icon: string }> = {
    closed:  { color: 'var(--gray)',  label: 'PORTA FECHADA',    icon: '🔒' },
    open:    { color: 'var(--green)', label: 'PORTA ABERTA',     icon: '🔓' },
    alert:   { color: 'var(--red)',   label: 'ALERTA DE ACESSO', icon: '🚨' },
    waiting: { color: 'var(--amber)', label: 'AGUARDANDO',       icon: '⏳' },
  };
  const cfg = configs[status] ?? configs.closed;

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
        }}
      />
      <span
        style={{
          fontFamily: 'var(--font-head)',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: cfg.color,
          letterSpacing: '0.08em',
        }}
      >
        {cfg.label}
      </span>
    </div>
  );
}