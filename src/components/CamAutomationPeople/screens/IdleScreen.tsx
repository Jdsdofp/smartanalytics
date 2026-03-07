// src/components/CamAutomationPeople/screens/IdleScreen.tsx
// Tela inicial — sem estado próprio, sem chamadas de API
// Tudo vem de idleState + sysConfig via useCamAutomation

import type { IdleState, SysConfig } from '../../../hooks/useCamAutomation';
import { formatMinutes } from '../../../hooks/useCamAutomation';

// ─── Props ────────────────────────────────────────────────────────────────────

interface IdleScreenProps {
  idleState:    IdleState;
  sysConfig:    SysConfig;
  onStartEntry: () => void;
  onStartExit:  () => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function IdleScreen({ idleState, sysConfig, onStartEntry, onStartExit }: IdleScreenProps) {
  const { dashboard, loadingDash } = idleState;

  const val = (v: unknown) => (loadingDash ? '…' : String(v ?? '—'));

  const stats = [
    { label: 'Dentro agora',    value: val(dashboard?.inside_count ?? dashboard?.people_inside),       color: 'var(--blue)',  icon: '👥' },
    { label: 'Acessos hoje',    value: val(dashboard?.entries_today ?? dashboard?.today?.total),        color: 'var(--green)', icon: '✅' },
    { label: 'Alertas EPI',     value: val(dashboard?.open_alerts   ?? dashboard?.alerts_open),         color: 'var(--amber)', icon: '⚠'  },
    { label: 'Acima do limite', value: val(dashboard?.over_limit_count),                                color: 'var(--red)',   icon: '🕐' },
  ];

  return (
    <div style={{
      flex: 1, position: 'relative',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 32px', gap: 24,
      animation: 'fadeIn 400ms ease',
      background: 'var(--bg-deep)',
    }}>

      {/* Headline */}
      <div style={{ textAlign: 'center', marginBottom: 8, position: 'relative', zIndex: 1 }}>
        <div style={{
          fontFamily: 'var(--font-head)', fontSize: '3rem', fontWeight: 900,
          letterSpacing: '0.04em', color: 'var(--white)', lineHeight: 1, textTransform: 'uppercase',
        }}>
          CÂMARA FRIA
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
          color: 'var(--gray-light)', letterSpacing: '0.12em', marginTop: 6,
        }}>
          CONTROLE DE ACESSO · EPI OBRIGATÓRIO · NR-36
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12, width: '100%', maxWidth: 700, position: 'relative', zIndex: 1,
      }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '14px 16px',
            display: 'flex', flexDirection: 'column', gap: 4,
            borderLeft: `3px solid ${s.color}`,
          }}>
            <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--gray-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {s.icon} {s.label}
            </div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 16, width: '100%', maxWidth: 560, position: 'relative', zIndex: 1 }}>
        <button
          className="btn-primary"
          onClick={onStartEntry}
          style={{
            flex: 1, height: 80, fontSize: '1.4rem',
            borderRadius: 'var(--radius-lg)', flexDirection: 'column', gap: 4,
            background: 'var(--blue)', boxShadow: '0 0 40px rgba(0,132,255,0.2)',
          }}
        >
          <span style={{ fontSize: '2rem' }}>🚪</span>
          <span>ENTRAR</span>
        </button>

        <button
          className="btn-ghost"
          onClick={onStartExit}
          style={{
            flex: 1, height: 80, fontSize: '1.2rem',
            borderRadius: 'var(--radius-lg)', flexDirection: 'column', gap: 4,
          }}
        >
          <span style={{ fontSize: '1.8rem' }}>↩</span>
          <span>SAIR</span>
        </button>
      </div>

      {/* Hint */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
        color: 'var(--gray)', letterSpacing: '0.06em',
        textAlign: 'center', marginTop: -8, position: 'relative', zIndex: 1,
      }}>
        Pressione ENTRAR e posicione-se em frente às câmeras
        {sysConfig.dailyLimitMin > 0 && <> · Limite diário: {formatMinutes(sysConfig.dailyLimitMin)}</>}
      </div>

      {/* Background decoration */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', width: '60vw', height: '60vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,132,255,0.04) 0%, transparent 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(30,45,71,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(30,45,71,0.4) 1px, transparent 1px)',
          backgroundSize: '60px 60px', opacity: 0.5,
        }} />
      </div>

    </div>
  );
}