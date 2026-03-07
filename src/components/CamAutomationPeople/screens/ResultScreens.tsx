// src/components/CamAutomationPeople/screens/ResultScreens.tsx
// Telas de resultado: Acesso Liberado e Acesso Negado
// Sem chamadas de API — toda lógica de porta/sessão já foi executada no hook

import { useEffect, useState } from 'react';
import type { Person, EpiResult, SysConfig } from '../../../hooks/useCamAutomation';

// ─── Labels EPI ───────────────────────────────────────────────────────────────

const EPI_LABELS_PT: Record<string, string> = {
  helmet:        'Capacete',
  vest:          'Colete',
  gloves:        'Luvas',
  boots:         'Botas',
  thermal_coat:  'Jaqueta Térmica',
  thermal_pants: 'Calça Térmica',
  glasses:       'Óculos de Proteção',
  mask:          'Máscara',
  apron:         'Avental',
  hardhat:       'Capacete',
};

const label = (k: string) => EPI_LABELS_PT[k] ?? k;

// ─────────────────────────────────────────────────────────────────────────────
// ACCESS GRANTED
// ─────────────────────────────────────────────────────────────────────────────

interface AccessGrantedScreenProps {
  person:    Person | null;
  result:    EpiResult | null;
  sysConfig: SysConfig;
  onDone:    () => void;
}

export function AccessGrantedScreen({ person, result, sysConfig, onDone }: AccessGrantedScreenProps) {
  const totalSeconds = (sysConfig.doorOpenMaxMin || 15) * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(t); onDone(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [onDone]);

  const pct      = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const minsLeft = Math.ceil(secondsLeft / 60);
  const mm       = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss       = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 32, gap: 24,
      background: 'radial-gradient(circle at center, rgba(0,230,118,0.06) 0%, transparent 60%)',
      animation: 'scaleIn 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    }}>

      {/* Big checkmark */}
      <div style={{
        width: 100, height: 100, borderRadius: '50%',
        background: 'rgba(0,230,118,0.12)', border: '3px solid var(--green)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '3rem', boxShadow: '0 0 40px rgba(0,230,118,0.2)',
        animation: 'pulse-ring 2s ease infinite',
      }}>✅</div>

      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--font-head)', fontSize: '3rem', fontWeight: 900,
          color: 'var(--green)', letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          ACESSO LIBERADO
        </h1>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', color: 'var(--white)', marginTop: 6 }}>
          {person?.personName}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--gray-light)', marginTop: 4 }}>
          {person?.personCode}
        </div>
      </div>

      {/* Door timer card */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid rgba(0,230,118,0.2)',
        borderRadius: 'var(--radius-lg)', padding: '20px 32px',
        textAlign: 'center', width: '100%', maxWidth: 360,
      }}>
        <div style={{
          fontFamily: 'var(--font-head)', fontSize: '3.5rem', fontWeight: 900,
          color: minsLeft <= 3 ? 'var(--amber)' : 'var(--green)',
          lineHeight: 1, transition: 'color 300ms',
        }}>
          {mm}:{ss}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
          color: 'var(--gray-light)', letterSpacing: '0.08em', marginTop: 4,
        }}>
          PORTA ABERTA — TEMPO RESTANTE
        </div>
        <div className="progress-bar" style={{ marginTop: 12, height: 4 }}>
          <div className="progress-bar-fill" style={{
            width: `${pct}%`,
            background: minsLeft <= 3
              ? 'var(--amber)'
              : 'linear-gradient(90deg, var(--green), #33ef8e)',
          }} />
        </div>
      </div>

      {/* EPI summary */}
      {(result?.detected || result?.detected_ppe) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, maxWidth: 480 }}>
          {(result?.detected || result?.detected_ppe || []).map((k) => (
            <span key={k} className="epi-chip ok">✓ {label(k)}</span>
          ))}
        </div>
      )}

      <button className="btn-ghost" onClick={onDone} style={{ marginTop: 8 }}>
        ✕ FECHAR
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCESS DENIED
// ─────────────────────────────────────────────────────────────────────────────

interface AccessDeniedScreenProps {
  person:   Person | null;
  missing:  string[];
  reason?:  string;
  onRetry:  () => void;
  onDone:   () => void;
}

export function AccessDeniedScreen({
  person,
  missing = [],
  reason  = 'EPI incompleto',
  onRetry,
  onDone,
}: AccessDeniedScreenProps) {
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(t); onDone(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [onDone]);

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 32, gap: 24,
      background: 'radial-gradient(circle at center, rgba(255,61,61,0.06) 0%, transparent 60%)',
      animation: 'scaleIn 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    }}>

      {/* Big X */}
      <div style={{
        width: 100, height: 100, borderRadius: '50%',
        background: 'rgba(255,61,61,0.12)', border: '3px solid var(--red)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '3rem', boxShadow: '0 0 40px rgba(255,61,61,0.2)',
      }}>🚫</div>

      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--font-head)', fontSize: '3rem', fontWeight: 900,
          color: 'var(--red)', letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          ACESSO NEGADO
        </h1>
        {person && (
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem', color: 'var(--white)', marginTop: 6 }}>
            {person.personName}
          </div>
        )}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--gray-light)', marginTop: 4 }}>
          {reason}
        </div>
      </div>

      {/* Missing EPI list */}
      {missing.length > 0 && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid rgba(255,61,61,0.2)',
          borderRadius: 'var(--radius-lg)', padding: '20px 24px',
          width: '100%', maxWidth: 420,
        }}>
          <div style={{
            fontFamily: 'var(--font-head)', fontSize: '0.85rem', fontWeight: 700,
            color: 'var(--red-text)', letterSpacing: '0.08em',
            marginBottom: 12, textTransform: 'uppercase',
          }}>
            EPI Ausentes ({missing.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {missing.map((item) => (
              <span key={item} className="epi-chip missing">✗ {item}</span>
            ))}
          </div>
        </div>
      )}

      {/* Auto-close countdown */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--gray)' }}>
        Voltando à tela inicial em {countdown}s…
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-primary" onClick={onRetry} style={{ padding: '12px 24px' }}>
          🔄 TENTAR NOVAMENTE
        </button>
        <button className="btn-ghost" onClick={onDone}>
          ✕ FECHAR
        </button>
      </div>

    </div>
  );
}