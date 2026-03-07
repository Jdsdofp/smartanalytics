// src/components/CamAutomationPeople/screens/TimeAlertScreen.tsx
// Exibida quando trabalhador excedeu o limite diário de permanência
// Sem chamadas de API — dados vêm de session + sysConfig via useCamAutomation

import type { Person, DailyExposure, SysConfig } from '../../../hooks/useCamAutomation';
import { formatMinutes } from '../../../hooks/useCamAutomation';

// ─── Props ────────────────────────────────────────────────────────────────────

interface TimeAlertScreenProps {
  person:        Person | null;
  dailyExposure: DailyExposure | null;
  sysConfig:     SysConfig;
  onDeny:        () => void;
  onOverride:    () => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function TimeAlertScreen({
  person,
  dailyExposure,
  sysConfig,
  onDeny,
  onOverride,
}: TimeAlertScreenProps) {
  const totalMin  = dailyExposure?.total_minutes ?? 0;
  const limitMin  = dailyExposure?.limit_minutes ?? sysConfig.dailyLimitMin ?? 120;
  const overMin   = Math.max(0, Math.round(totalMin - limitMin));
  const isBlocked = sysConfig.overLimitPolicy === 'block';
  const pct       = Math.min((totalMin / limitMin) * 100, 100);
  const accent    = isBlocked ? 'var(--red)' : 'var(--amber)';

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 32px', gap: 20,
      animation: 'scaleIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    }}>
      <div style={{
        width: '100%', maxWidth: 560,
        background: isBlocked ? 'linear-gradient(135deg, #1a0808, #200a0a)' : 'linear-gradient(135deg, #1a1000, #201500)',
        border: `2px solid ${accent}`,
        borderRadius: 'var(--radius-lg)', padding: '28px 32px',
        display: 'flex', flexDirection: 'column', gap: 20,
        boxShadow: isBlocked ? '0 0 40px rgba(255,61,61,0.15)' : '0 0 40px rgba(255,171,0,0.15)',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: isBlocked ? 'rgba(255,61,61,0.15)' : 'rgba(255,171,0,0.15)',
            border: `2px solid ${accent}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem',
          }}>
            {isBlocked ? '🚫' : '⚠️'}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 800, color: accent, letterSpacing: '0.04em' }}>
              {isBlocked ? 'ACESSO BLOQUEADO' : 'LIMITE EXCEDIDO'}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gray-light)', marginTop: 2 }}>
              LIMITE DIÁRIO DE PERMANÊNCIA NA CÂMARA FRIA
            </div>
          </div>
        </div>

        {/* Person card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 'var(--radius)', padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: 'var(--bg-card)', border: '2px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
          }}>👤</div>
          <div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--white)' }}>
              {person?.personName ?? '—'}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gray-light)' }}>
              {person?.personCode} · {dailyExposure?.entries_today ?? '—'} entradas hoje
            </div>
          </div>
        </div>

        {/* Time stats */}
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { value: formatMinutes(totalMin), label: 'ACUMULADO HOJE', color: accent              },
            { value: formatMinutes(limitMin), label: 'LIMITE DIÁRIO',  color: 'var(--gray-light)' },
            { value: `+${overMin}min`,        label: 'EXCEDEU',        color: accent              },
          ].map((s) => (
            <div key={s.label} style={{
              flex: 1, background: 'rgba(255,255,255,0.04)',
              borderRadius: 'var(--radius)', padding: '14px 16px', textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray-light)', marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-bar-fill" style={{
              width: `${pct}%`,
              background: isBlocked
                ? 'linear-gradient(90deg, #cc0000, var(--red))'
                : 'linear-gradient(90deg, #cc7700, var(--amber))',
            }} />
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray)', marginTop: 4,
          }}>
            <span>0</span>
            <span>Limite: {formatMinutes(limitMin)}</span>
          </div>
        </div>

        {/* Policy message */}
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
          color: isBlocked ? 'var(--red-text)' : 'var(--amber)',
          lineHeight: 1.5, padding: '10px 14px',
          background: isBlocked ? 'rgba(255,61,61,0.08)' : 'rgba(255,171,0,0.08)',
          borderRadius: 'var(--radius-sm)',
          borderLeft: `3px solid ${accent}`,
        }}>
          {isBlocked
            ? '🚫 Política: Acesso bloqueado. Contate um supervisor para liberar manualmente.'
            : '⚠ Política: Aviso de excedente. Supervisor pode liberar com ressalva — ocorrência será registrada no SmartX HUB.'}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button className="btn-ghost" onClick={onDeny} style={{ flex: 1, height: 52 }}>
            ↩ NEGAR ACESSO
          </button>

          {!isBlocked ? (
            <button className="btn-amber" onClick={onOverride} style={{ flex: 1, height: 52 }}>
              ⚠ LIBERAR COM RESSALVA
            </button>
          ) : (
            <button
              disabled
              style={{
                flex: 1, height: 52,
                background: 'rgba(255,61,61,0.1)', border: '1px solid var(--red)',
                borderRadius: 'var(--radius)', color: 'var(--red-text)',
                fontFamily: 'var(--font-head)', fontWeight: 700,
                fontSize: '0.85rem', letterSpacing: '0.08em',
                cursor: 'not-allowed', opacity: 0.7,
              }}
            >
              🚫 BLOQUEADO — SUPERVISOR
            </button>
          )}
        </div>

      </div>
    </div>
  );
}