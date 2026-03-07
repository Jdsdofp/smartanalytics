// src/components/CamAutomationPeople/components/PermanenceModal.tsx
// Modal de permanência — sem estado próprio, sem chamadas de API
// Tudo vem de permanenceState + sysConfig via useCamAutomation

import { useState } from 'react';
import type { PermanenceState, SysConfig, WorkerRecord } from '../../../hooks/useCamAutomation';
import { formatMinutes } from '../../../hooks/useCamAutomation';

// ─── Props ────────────────────────────────────────────────────────────────────

interface PermanenceModalProps {
  permanenceState: PermanenceState;
  sysConfig:       SysConfig;
  onClose:         () => void;
}

type FilterId = 'all' | 'inside' | 'over';

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PermanenceModal({ permanenceState, sysConfig, onClose }: PermanenceModalProps) {
  const [filter, setFilter] = useState<FilterId>('all');

  const { people, loading, fetchPeople } = permanenceState;
  const limitMin = sysConfig.dailyLimitMin || 120;

  // ── Derivados ────────────────────────────────────────────────────────────

  const insideCount = people.filter((p) => p.is_inside).length;
  const overCount   = people.filter((p) => (p.daily_accumulated_min ?? p.total_minutes ?? 0) >= limitMin).length;
  const avgMin      = people.length
    ? people.reduce((s, p) => s + (p.daily_accumulated_min ?? p.total_minutes ?? 0), 0) / people.length
    : 0;

  const filtered = people
    .filter((p) => {
      const mins = p.daily_accumulated_min ?? p.total_minutes ?? 0;
      if (filter === 'inside') return p.is_inside;
      if (filter === 'over')   return mins >= limitMin;
      return true;
    })
    .sort(
      (a, b) =>
        (b.daily_accumulated_min ?? b.total_minutes ?? 0) -
        (a.daily_accumulated_min ?? a.total_minutes ?? 0),
    );

  const summaryCards = [
    { label: 'Dentro agora',    value: insideCount,           color: 'var(--green)'      },
    { label: 'Total hoje',      value: people.length,         color: 'var(--blue)'       },
    { label: 'Tempo médio',     value: formatMinutes(avgMin), color: 'var(--gray-light)' },
    { label: 'Acima do limite', value: overCount,             color: 'var(--red)'        },
  ];

  const filterTabs: { id: FilterId; label: string }[] = [
    { id: 'all',    label: `Todos (${people.length})`          },
    { id: 'inside', label: `Dentro agora (${insideCount})`     },
    { id: 'over',   label: `Acima do limite (${overCount})`    },
  ];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: 840, width: '100%' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              ⏱ Relatório de Permanência
            </h2>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray-light)', marginTop: 2 }}>
              HOJE · LIMITE: {formatMinutes(limitMin)} · POLÍTICA:{' '}
              {sysConfig.overLimitPolicy === 'block' ? '🚫 BLOQUEAR' : '⚠ AVISAR'}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--gray-light)', borderRadius: 8,
            width: 36, height: 36, fontSize: '1rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Summary cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12, padding: '16px 24px', borderBottom: '1px solid var(--border)',
        }}>
          {summaryCards.map((s) => (
            <div key={s.label} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '12px 14px',
              borderLeft: `3px solid ${s.color}`,
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray-light)', textTransform: 'uppercase' }}>
                {s.label}
              </div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.6rem', fontWeight: 800, color: s.color, lineHeight: 1, marginTop: 2 }}>
                {loading ? '…' : s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 24px 0' }}>
          {filterTabs.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                background: filter === f.id ? 'var(--blue)' : 'transparent',
                border: `1px solid ${filter === f.id ? 'var(--blue)' : 'var(--border)'}`,
                color: filter === f.id ? '#fff' : 'var(--gray-light)',
                borderRadius: 20, padding: '4px 14px', fontSize: '0.75rem',
                fontFamily: 'var(--font-head)', fontWeight: 600,
                cursor: 'pointer', letterSpacing: '0.04em', transition: 'all 200ms',
              }}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={fetchPeople}
            style={{
              marginLeft: 'auto', background: 'transparent',
              border: '1px solid var(--border)', color: 'var(--gray-light)',
              borderRadius: 8, padding: '4px 12px', fontSize: '0.75rem',
              fontFamily: 'var(--font-head)', fontWeight: 600,
              cursor: 'pointer', letterSpacing: '0.04em',
            }}
          >
            ↻ ATUALIZAR
          </button>
        </div>

        {/* Worker list */}
        <div style={{
          maxHeight: '45vh', overflowY: 'auto',
          padding: '12px 24px 20px',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--gray)' }}>
              Carregando…
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--gray)' }}>
              Nenhum registro para este filtro.
            </div>
          )}
          {!loading && filtered.map((p, idx) => (
            <WorkerRow key={p.person_code || idx} person={p} limitMin={limitMin} />
          ))}
        </div>

      </div>
    </div>
  );
}

// ─── WorkerRow ────────────────────────────────────────────────────────────────

function WorkerRow({ person, limitMin }: { person: WorkerRecord; limitMin: number }) {
  const totalMin = person.daily_accumulated_min ?? person.total_minutes ?? 0;
  const pct      = Math.min((totalMin / limitMin) * 100, 100);
  const isOver   = totalMin >= limitMin;
  const isNear   = !isOver && totalMin >= limitMin * 0.8;

  const barColor = isOver ? 'var(--red)' : isNear ? 'var(--amber)' : 'var(--green)';
  const rowBg    = isOver ? 'rgba(255,61,61,0.05)' : isNear ? 'rgba(255,171,0,0.04)' : 'transparent';

  return (
    <div style={{
      background: rowBg,
      border: `1px solid ${isOver ? 'rgba(255,61,61,0.15)' : 'var(--border)'}`,
      borderRadius: 'var(--radius)', padding: '10px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>

      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: 'var(--bg-card)', border: `2px solid ${barColor}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
      }}>👤</div>

      {/* Info */}
      <div style={{ flex: '0 0 180px' }}>
        <div style={{
          fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--white)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {person.person_name}
          {person.is_inside && (
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--green)', boxShadow: '0 0 6px var(--green)',
              display: 'inline-block', animation: 'pulse-dot 1.5s ease infinite',
            }} />
          )}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray-light)' }}>
          {person.person_code} · {person.department || '—'}
        </div>
      </div>

      {/* Sessions */}
      <div style={{ flex: '0 0 60px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--gray-light)' }}>
        <div style={{ fontWeight: 700, color: 'var(--white)' }}>
          {person.total_entries ?? person.sessions_today ?? 0}
        </div>
        <div>entradas</div>
      </div>

      {/* Progress bar + time */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gray-light)' }}>
            {isOver
              ? <span style={{ color: 'var(--red-text)' }}>+{Math.round(totalMin - limitMin)}min acima</span>
              : `Restam ${formatMinutes(limitMin - totalMin)}`}
          </span>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', color: barColor }}>
            {formatMinutes(totalMin)}
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
        </div>
      </div>

      {/* Status badge */}
      <div style={{ flexShrink: 0 }}>
        {isOver
          ? <span className="badge badge-red">EXCEDEU</span>
          : isNear
          ? <span className="badge badge-amber">PRÓXIMO</span>
          : <span className="badge badge-green">OK</span>}
      </div>
    </div>
  );
}