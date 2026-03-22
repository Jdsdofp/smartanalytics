// // // // src/components/CamAutomationPeople/components/PermanenceModal.tsx
// // // // Modal de permanência — sem estado próprio, sem chamadas de API
// // // // Tudo vem de permanenceState + sysConfig via useCamAutomation

// // // import { useState } from 'react';
// // // import type { PermanenceState, SysConfig, WorkerRecord } from '../../../hooks/useCamAutomation';
// // // import { formatMinutes } from '../../../hooks/useCamAutomation';

// // // // ─── Props ────────────────────────────────────────────────────────────────────

// // // interface PermanenceModalProps {
// // //   permanenceState: PermanenceState;
// // //   sysConfig:       SysConfig;
// // //   onClose:         () => void;
// // // }

// // // type FilterId = 'all' | 'inside' | 'over';

// // // // ─── Componente ───────────────────────────────────────────────────────────────

// // // export default function PermanenceModal({ permanenceState, sysConfig, onClose }: PermanenceModalProps) {
// // //   const [filter, setFilter] = useState<FilterId>('all');

// // //   const { people, loading, fetchPeople } = permanenceState;
// // //   const limitMin = sysConfig.dailyLimitMin || 120;

// // //   // ── Derivados ────────────────────────────────────────────────────────────

// // //   const insideCount = people.filter((p) => p.is_inside).length;
// // //   const overCount   = people.filter((p) => (p.daily_accumulated_min ?? p.total_minutes ?? 0) >= limitMin).length;
// // //   const avgMin      = people.length
// // //     ? people.reduce((s, p) => s + (p.daily_accumulated_min ?? p.total_minutes ?? 0), 0) / people.length
// // //     : 0;

// // //   const filtered = people
// // //     .filter((p) => {
// // //       const mins = p.daily_accumulated_min ?? p.total_minutes ?? 0;
// // //       if (filter === 'inside') return p.is_inside;
// // //       if (filter === 'over')   return mins >= limitMin;
// // //       return true;
// // //     })
// // //     .sort(
// // //       (a, b) =>
// // //         (b.daily_accumulated_min ?? b.total_minutes ?? 0) -
// // //         (a.daily_accumulated_min ?? a.total_minutes ?? 0),
// // //     );

// // //   const summaryCards = [
// // //     { label: 'Dentro agora',    value: insideCount,           color: 'var(--green)'      },
// // //     { label: 'Total hoje',      value: people.length,         color: 'var(--blue)'       },
// // //     { label: 'Tempo médio',     value: formatMinutes(avgMin), color: 'var(--gray-light)' },
// // //     { label: 'Acima do limite', value: overCount,             color: 'var(--red)'        },
// // //   ];

// // //   const filterTabs: { id: FilterId; label: string }[] = [
// // //     { id: 'all',    label: `Todos (${people.length})`          },
// // //     { id: 'inside', label: `Dentro agora (${insideCount})`     },
// // //     { id: 'over',   label: `Acima do limite (${overCount})`    },
// // //   ];

// // //   return (
// // //     <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
// // //       <div className="modal-content" style={{ maxWidth: 840, width: '100%' }}>

// // //         {/* Header */}
// // //         <div style={{
// // //           display: 'flex', alignItems: 'center', justifyContent: 'space-between',
// // //           padding: '20px 24px', borderBottom: '1px solid var(--border)',
// // //         }}>
// // //           <div>
// // //             <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
// // //               ⏱ Relatório de Permanência
// // //             </h2>
// // //             <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray-light)', marginTop: 2 }}>
// // //               HOJE · LIMITE: {formatMinutes(limitMin)} · POLÍTICA:{' '}
// // //               {sysConfig.overLimitPolicy === 'block' ? '🚫 BLOQUEAR' : '⚠ AVISAR'}
// // //             </div>
// // //           </div>
// // //           <button onClick={onClose} style={{
// // //             background: 'transparent', border: '1px solid var(--border)',
// // //             color: 'var(--gray-light)', borderRadius: 8,
// // //             width: 36, height: 36, fontSize: '1rem', cursor: 'pointer',
// // //             display: 'flex', alignItems: 'center', justifyContent: 'center',
// // //           }}>✕</button>
// // //         </div>

// // //         {/* Summary cards */}
// // //         <div style={{
// // //           display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
// // //           gap: 12, padding: '16px 24px', borderBottom: '1px solid var(--border)',
// // //         }}>
// // //           {summaryCards.map((s) => (
// // //             <div key={s.label} style={{
// // //               background: 'var(--bg-card)', border: '1px solid var(--border)',
// // //               borderRadius: 'var(--radius)', padding: '12px 14px',
// // //               borderLeft: `3px solid ${s.color}`,
// // //             }}>
// // //               <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray-light)', textTransform: 'uppercase' }}>
// // //                 {s.label}
// // //               </div>
// // //               <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.6rem', fontWeight: 800, color: s.color, lineHeight: 1, marginTop: 2 }}>
// // //                 {loading ? '…' : s.value}
// // //               </div>
// // //             </div>
// // //           ))}
// // //         </div>

// // //         {/* Filters */}
// // //         <div style={{ display: 'flex', gap: 8, padding: '12px 24px 0' }}>
// // //           {filterTabs.map((f) => (
// // //             <button
// // //               key={f.id}
// // //               onClick={() => setFilter(f.id)}
// // //               style={{
// // //                 background: filter === f.id ? 'var(--blue)' : 'transparent',
// // //                 border: `1px solid ${filter === f.id ? 'var(--blue)' : 'var(--border)'}`,
// // //                 color: filter === f.id ? '#fff' : 'var(--gray-light)',
// // //                 borderRadius: 20, padding: '4px 14px', fontSize: '0.75rem',
// // //                 fontFamily: 'var(--font-head)', fontWeight: 600,
// // //                 cursor: 'pointer', letterSpacing: '0.04em', transition: 'all 200ms',
// // //               }}
// // //             >
// // //               {f.label}
// // //             </button>
// // //           ))}
// // //           <button
// // //             onClick={fetchPeople}
// // //             style={{
// // //               marginLeft: 'auto', background: 'transparent',
// // //               border: '1px solid var(--border)', color: 'var(--gray-light)',
// // //               borderRadius: 8, padding: '4px 12px', fontSize: '0.75rem',
// // //               fontFamily: 'var(--font-head)', fontWeight: 600,
// // //               cursor: 'pointer', letterSpacing: '0.04em',
// // //             }}
// // //           >
// // //             ↻ ATUALIZAR
// // //           </button>
// // //         </div>

// // //         {/* Worker list */}
// // //         <div style={{
// // //           maxHeight: '45vh', overflowY: 'auto',
// // //           padding: '12px 24px 20px',
// // //           display: 'flex', flexDirection: 'column', gap: 6,
// // //         }}>
// // //           {loading && (
// // //             <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--gray)' }}>
// // //               Carregando…
// // //             </div>
// // //           )}
// // //           {!loading && filtered.length === 0 && (
// // //             <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--gray)' }}>
// // //               Nenhum registro para este filtro.
// // //             </div>
// // //           )}
// // //           {!loading && filtered.map((p, idx) => (
// // //             <WorkerRow key={p.person_code || idx} person={p} limitMin={limitMin} />
// // //           ))}
// // //         </div>

// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // // ─── WorkerRow ────────────────────────────────────────────────────────────────

// // // function WorkerRow({ person, limitMin }: { person: WorkerRecord; limitMin: number }) {
// // //   const totalMin = person.daily_accumulated_min ?? person.total_minutes ?? 0;
// // //   const pct      = Math.min((totalMin / limitMin) * 100, 100);
// // //   const isOver   = totalMin >= limitMin;
// // //   const isNear   = !isOver && totalMin >= limitMin * 0.8;

// // //   const barColor = isOver ? 'var(--red)' : isNear ? 'var(--amber)' : 'var(--green)';
// // //   const rowBg    = isOver ? 'rgba(255,61,61,0.05)' : isNear ? 'rgba(255,171,0,0.04)' : 'transparent';

// // //   return (
// // //     <div style={{
// // //       background: rowBg,
// // //       border: `1px solid ${isOver ? 'rgba(255,61,61,0.15)' : 'var(--border)'}`,
// // //       borderRadius: 'var(--radius)', padding: '10px 14px',
// // //       display: 'flex', alignItems: 'center', gap: 12,
// // //     }}>

// // //       {/* Avatar */}
// // //       <div style={{
// // //         width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
// // //         background: 'var(--bg-card)', border: `2px solid ${barColor}55`,
// // //         display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
// // //       }}>👤</div>

// // //       {/* Info */}
// // //       <div style={{ flex: '0 0 180px' }}>
// // //         <div style={{
// // //           fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--white)',
// // //           display: 'flex', alignItems: 'center', gap: 6,
// // //         }}>
// // //           {person.person_name}
// // //           {person.is_inside && (
// // //             <span style={{
// // //               width: 7, height: 7, borderRadius: '50%',
// // //               background: 'var(--green)', boxShadow: '0 0 6px var(--green)',
// // //               display: 'inline-block', animation: 'pulse-dot 1.5s ease infinite',
// // //             }} />
// // //           )}
// // //         </div>
// // //         <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray-light)' }}>
// // //           {person.person_code} · {person.department || '—'}
// // //         </div>
// // //       </div>

// // //       {/* Sessions */}
// // //       <div style={{ flex: '0 0 60px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--gray-light)' }}>
// // //         <div style={{ fontWeight: 700, color: 'var(--white)' }}>
// // //           {person.total_entries ?? person.sessions_today ?? 0}
// // //         </div>
// // //         <div>entradas</div>
// // //       </div>

// // //       {/* Progress bar + time */}
// // //       <div style={{ flex: 1 }}>
// // //         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
// // //           <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gray-light)' }}>
// // //             {isOver
// // //               ? <span style={{ color: 'var(--red-text)' }}>+{Math.round(totalMin - limitMin)}min acima</span>
// // //               : `Restam ${formatMinutes(limitMin - totalMin)}`}
// // //           </span>
// // //           <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', color: barColor }}>
// // //             {formatMinutes(totalMin)}
// // //           </span>
// // //         </div>
// // //         <div className="progress-bar">
// // //           <div className="progress-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
// // //         </div>
// // //       </div>

// // //       {/* Status badge */}
// // //       <div style={{ flexShrink: 0 }}>
// // //         {isOver
// // //           ? <span className="badge badge-red">EXCEDEU</span>
// // //           : isNear
// // //           ? <span className="badge badge-amber">PRÓXIMO</span>
// // //           : <span className="badge badge-green">OK</span>}
// // //       </div>
// // //     </div>
// // //   );
// // // }


// // // src/components/CamAutomationPeople/components/PermanenceModal.tsx

// // import { useState, useEffect, useRef } from 'react';
// // import type { PermanenceState, SysConfig, WorkerRecord } from '../../../hooks/useCamAutomation';
// // import { formatMinutes } from '../../../hooks/useCamAutomation';

// // interface PermanenceModalProps {
// //   permanenceState: PermanenceState;
// //   sysConfig: SysConfig;
// //   onClose: () => void;
// // }

// // type FilterId = 'all' | 'inside' | 'over' | 'no_photo';

// // // ─── Helpers ──────────────────────────────────────────────────────────────────

// // function timeSince(dateStr: string | null | undefined): string {
// //   if (!dateStr) return '—';
// //   const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
// //   if (diff < 1) return 'agora';
// //   if (diff < 60) return `${diff}min atrás`;
// //   const h = Math.floor(diff / 60);
// //   const m = diff % 60;
// //   return m > 0 ? `${h}h ${m}min atrás` : `${h}h atrás`;
// // }

// // function getInitials(name: string): string {
// //   return name
// //     .split(' ')
// //     .filter(Boolean)
// //     .slice(0, 2)
// //     .map((n) => n[0])
// //     .join('')
// //     .toUpperCase();
// // }

// // // ─── Avatar color hash ────────────────────────────────────────────────────────
// // const AVATAR_COLORS = [
// //   '#0ea5e9', '#10b981', '#f59e0b', '#ef4444',
// //   '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16',
// // ];
// // function avatarColor(code: string): string {
// //   let h = 0;
// //   for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) & 0xffffffff;
// //   return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
// // }

// // // ─── Modal ────────────────────────────────────────────────────────────────────

// // export default function PermanenceModal({
// //   permanenceState,
// //   sysConfig,
// //   onClose,
// // }: PermanenceModalProps) {
// //   const [filter, setFilter] = useState<FilterId>('all');
// //   const [search, setSearch] = useState('');
// //   const [mounted, setMounted] = useState(false);
// //   const searchRef = useRef<HTMLInputElement>(null);

// //   const { people, loading, fetchPeople } = permanenceState;
// //   const limitMin = sysConfig.dailyLimitMin || 120;

// //   useEffect(() => {
// //     setMounted(true);
// //     setTimeout(() => searchRef.current?.focus(), 300);
// //   }, []);

// //   // ── Counts ───────────────────────────────────────────────────────────────
// //   const insideCount  = people.filter((p) => p.is_inside).length;
// //   const overCount    = people.filter((p) => (p.daily_accumulated_min ?? p.total_minutes ?? 0) >= limitMin).length;
// //   const noPhotoCount = people.filter((p) => !p.face_photos_count || p.face_photos_count === 0).length;

// //   const avgMin = people.length
// //     ? people.reduce((s, p) => s + (p.daily_accumulated_min ?? p.total_minutes ?? 0), 0) / people.length
// //     : 0;

// //   // ── Filter + search ───────────────────────────────────────────────────────
// //   const filtered = people
// //     .filter((p) => {
// //       const mins = p.daily_accumulated_min ?? p.total_minutes ?? 0;
// //       if (filter === 'inside')   return p.is_inside;
// //       if (filter === 'over')     return mins >= limitMin;
// //       if (filter === 'no_photo') return !p.face_photos_count || p.face_photos_count === 0;
// //       return true;
// //     })
// //     .filter((p) => {
// //       if (!search) return true;
// //       const q = search.toLowerCase();
// //       return (
// //         p.person_name.toLowerCase().includes(q) ||
// //         p.person_code.toLowerCase().includes(q) ||
// //         (p.badge_id ?? '').toLowerCase().includes(q)
// //       );
// //     })
// //     .sort((a, b) => {
// //       // Dentro primeiro, depois por tempo acumulado desc
// //       if (a.is_inside && !b.is_inside) return -1;
// //       if (!a.is_inside && b.is_inside) return 1;
// //       return (b.daily_accumulated_min ?? b.total_minutes ?? 0) - (a.daily_accumulated_min ?? a.total_minutes ?? 0);
// //     });

// //   const filterTabs: { id: FilterId; label: string; count: number; color: string }[] = [
// //     { id: 'all',      label: 'Todos',         count: people.length, color: '#64748b' },
// //     { id: 'inside',   label: 'Dentro agora',  count: insideCount,   color: '#10b981' },
// //     { id: 'over',     label: 'Acima limite',  count: overCount,     color: '#ef4444' },
// //     { id: 'no_photo', label: 'Sem foto',      count: noPhotoCount,  color: '#f59e0b' },
// //   ];

// //   const complianceRate = people.length
// //     ? Math.round(((people.length - overCount) / people.length) * 100)
// //     : 100;

// //   return (
// //     <>
// //       <style>{`
// //         @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

// //         .pm-overlay {
// //           position: fixed; inset: 0; z-index: 9999;
// //           background: rgba(2, 6, 15, 0.85);
// //           backdrop-filter: blur(12px) saturate(180%);
// //           display: flex; align-items: center; justify-content: center;
// //           padding: 20px;
// //           animation: pm-fade-in 200ms ease;
// //         }

// //         @keyframes pm-fade-in {
// //           from { opacity: 0; }
// //           to   { opacity: 1; }
// //         }

// //         .pm-modal {
// //           width: 100%; max-width: 920px;
// //           max-height: 92vh;
// //           display: flex; flex-direction: column;
// //           background: #0a0f1e;
// //           border: 1px solid rgba(255,255,255,0.08);
// //           border-radius: 20px;
// //           overflow: hidden;
// //           box-shadow:
// //             0 0 0 1px rgba(14,165,233,0.1),
// //             0 40px 80px rgba(0,0,0,0.7),
// //             inset 0 1px 0 rgba(255,255,255,0.05);
// //           animation: pm-slide-up 280ms cubic-bezier(0.16, 1, 0.3, 1);
// //         }

// //         @keyframes pm-slide-up {
// //           from { opacity: 0; transform: translateY(24px) scale(0.98); }
// //           to   { opacity: 1; transform: translateY(0) scale(1); }
// //         }

// //         .pm-header {
// //           display: flex; align-items: flex-start; justify-content: space-between;
// //           padding: 24px 28px 20px;
// //           border-bottom: 1px solid rgba(255,255,255,0.06);
// //           background: linear-gradient(135deg, rgba(14,165,233,0.04) 0%, transparent 60%);
// //           position: relative; overflow: hidden;
// //         }

// //         .pm-header::before {
// //           content: ''; position: absolute; top: -40px; right: -40px;
// //           width: 200px; height: 200px; border-radius: 50%;
// //           background: radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%);
// //           pointer-events: none;
// //         }

// //         .pm-title {
// //           font-family: 'Syne', sans-serif;
// //           font-size: 1.5rem; font-weight: 800;
// //           color: #f1f5f9;
// //           letter-spacing: -0.02em;
// //           line-height: 1;
// //           display: flex; align-items: center; gap: 10px;
// //         }

// //         .pm-title-icon {
// //           width: 36px; height: 36px; border-radius: 10px;
// //           background: linear-gradient(135deg, #0ea5e9, #0284c7);
// //           display: flex; align-items: center; justify-content: center;
// //           font-size: 1rem;
// //           box-shadow: 0 4px 12px rgba(14,165,233,0.4);
// //           flex-shrink: 0;
// //         }

// //         .pm-subtitle {
// //           font-family: 'JetBrains Mono', monospace;
// //           font-size: 0.6rem; color: #475569;
// //           letter-spacing: 0.12em; text-transform: uppercase;
// //           margin-top: 6px;
// //           display: flex; align-items: center; gap: 8px;
// //         }

// //         .pm-subtitle-sep { color: #1e293b; }

// //         .pm-close {
// //           background: rgba(255,255,255,0.04);
// //           border: 1px solid rgba(255,255,255,0.08);
// //           color: #64748b; border-radius: 10px;
// //           width: 36px; height: 36px;
// //           font-size: 1rem; cursor: pointer;
// //           display: flex; align-items: center; justify-content: center;
// //           transition: all 150ms;
// //           flex-shrink: 0;
// //         }
// //         .pm-close:hover { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); color: #ef4444; }

// //         /* ── KPI strip ─────────────────────────────────────────────── */
// //         .pm-kpis {
// //           display: grid; grid-template-columns: repeat(5, 1fr);
// //           gap: 0;
// //           border-bottom: 1px solid rgba(255,255,255,0.06);
// //         }

// //         .pm-kpi {
// //           padding: 16px 20px;
// //           border-right: 1px solid rgba(255,255,255,0.06);
// //           position: relative; overflow: hidden;
// //         }
// //         .pm-kpi:last-child { border-right: none; }

// //         .pm-kpi::after {
// //           content: ''; position: absolute; bottom: 0; left: 0; right: 0;
// //           height: 2px;
// //           background: var(--kpi-color, #334155);
// //           opacity: 0.6;
// //         }

// //         .pm-kpi-label {
// //           font-family: 'JetBrains Mono', monospace;
// //           font-size: 0.55rem; color: #475569;
// //           letter-spacing: 0.1em; text-transform: uppercase;
// //           margin-bottom: 6px;
// //         }

// //         .pm-kpi-value {
// //           font-family: 'Syne', sans-serif;
// //           font-size: 1.8rem; font-weight: 800;
// //           color: var(--kpi-color, #f1f5f9);
// //           line-height: 1;
// //         }

// //         .pm-kpi-sub {
// //           font-family: 'JetBrains Mono', monospace;
// //           font-size: 0.6rem; color: #334155;
// //           margin-top: 3px;
// //         }

// //         /* ── Toolbar ─────────────────────────────────────────────────── */
// //         .pm-toolbar {
// //           display: flex; align-items: center; gap: 8px;
// //           padding: 14px 20px;
// //           border-bottom: 1px solid rgba(255,255,255,0.06);
// //           background: rgba(255,255,255,0.01);
// //           flex-wrap: wrap;
// //         }

// //         .pm-filter-btn {
// //           display: flex; align-items: center; gap: 6px;
// //           background: transparent;
// //           border: 1px solid rgba(255,255,255,0.08);
// //           color: #475569; border-radius: 8px;
// //           padding: 5px 12px; font-size: 0.72rem;
// //           font-family: 'DM Sans', sans-serif; font-weight: 600;
// //           cursor: pointer; transition: all 150ms; white-space: nowrap;
// //         }
// //         .pm-filter-btn:hover { border-color: rgba(255,255,255,0.16); color: #94a3b8; }
// //         .pm-filter-btn.active {
// //           background: rgba(14,165,233,0.12);
// //           border-color: rgba(14,165,233,0.4);
// //           color: #7dd3fc;
// //         }
// //         .pm-filter-btn.active[data-color="green"] {
// //           background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.35); color: #6ee7b7;
// //         }
// //         .pm-filter-btn.active[data-color="red"] {
// //           background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.35); color: #fca5a5;
// //         }
// //         .pm-filter-btn.active[data-color="amber"] {
// //           background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.35); color: #fcd34d;
// //         }

// //         .pm-filter-count {
// //           font-family: 'JetBrains Mono', monospace;
// //           font-size: 0.6rem; font-weight: 700;
// //           background: rgba(255,255,255,0.06);
// //           padding: 1px 5px; border-radius: 4px;
// //         }

// //         .pm-search {
// //           flex: 1; min-width: 160px;
// //           background: rgba(255,255,255,0.04);
// //           border: 1px solid rgba(255,255,255,0.08);
// //           border-radius: 8px; color: #e2e8f0;
// //           padding: 5px 12px 5px 32px;
// //           font-family: 'DM Sans', sans-serif; font-size: 0.8rem;
// //           outline: none; transition: border-color 150ms;
// //           position: relative;
// //         }
// //         .pm-search:focus { border-color: rgba(14,165,233,0.4); }
// //         .pm-search::placeholder { color: #334155; }

// //         .pm-search-wrap { position: relative; flex: 1; min-width: 160px; }
// //         .pm-search-icon {
// //           position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
// //           color: #334155; font-size: 0.8rem; pointer-events: none;
// //         }

// //         .pm-refresh {
// //           background: rgba(255,255,255,0.04);
// //           border: 1px solid rgba(255,255,255,0.08);
// //           color: #475569; border-radius: 8px;
// //           padding: 5px 12px; font-size: 0.72rem;
// //           font-family: 'JetBrains Mono', monospace; font-weight: 600;
// //           cursor: pointer; transition: all 150ms; white-space: nowrap;
// //           letter-spacing: 0.04em;
// //         }
// //         .pm-refresh:hover { border-color: rgba(14,165,233,0.4); color: #7dd3fc; }
// //         .pm-refresh:active { transform: rotate(180deg); }

// //         /* ── List ────────────────────────────────────────────────────── */
// //         .pm-list {
// //           flex: 1; overflow-y: auto;
// //           padding: 12px 16px 16px;
// //           display: flex; flex-direction: column; gap: 4px;
// //           scrollbar-width: thin; scrollbar-color: #1e293b transparent;
// //         }
// //         .pm-list::-webkit-scrollbar { width: 4px; }
// //         .pm-list::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }

// //         .pm-empty {
// //           text-align: center; padding: 48px 20px;
// //           font-family: 'JetBrains Mono', monospace;
// //           font-size: 0.75rem; color: #1e293b;
// //           letter-spacing: 0.08em;
// //         }
// //         .pm-empty-icon { font-size: 2rem; margin-bottom: 12px; opacity: 0.3; }

// //         .pm-loading {
// //           text-align: center; padding: 48px 20px;
// //           font-family: 'JetBrains Mono', monospace;
// //           font-size: 0.7rem; color: #334155;
// //           letter-spacing: 0.1em;
// //         }

// //         /* ── Worker row ──────────────────────────────────────────────── */
// //         .pm-row {
// //           display: flex; align-items: center; gap: 12px;
// //           background: rgba(255,255,255,0.02);
// //           border: 1px solid rgba(255,255,255,0.05);
// //           border-radius: 10px; padding: 10px 14px;
// //           transition: all 150ms; cursor: default;
// //         }
// //         .pm-row:hover {
// //           background: rgba(255,255,255,0.04);
// //           border-color: rgba(255,255,255,0.1);
// //           transform: translateX(2px);
// //         }
// //         .pm-row.is-inside {
// //           background: rgba(16,185,129,0.04);
// //           border-color: rgba(16,185,129,0.12);
// //         }
// //         .pm-row.is-over {
// //           background: rgba(239,68,68,0.04);
// //           border-color: rgba(239,68,68,0.12);
// //         }
// //         .pm-row.is-near {
// //           background: rgba(245,158,11,0.03);
// //           border-color: rgba(245,158,11,0.1);
// //         }

// //         .pm-avatar {
// //           width: 38px; height: 38px; border-radius: 10px;
// //           display: flex; align-items: center; justify-content: center;
// //           font-family: 'Syne', sans-serif; font-size: 0.7rem; font-weight: 800;
// //           color: #fff; flex-shrink: 0;
// //           position: relative;
// //         }

// //         .pm-avatar-dot {
// //           position: absolute; bottom: -2px; right: -2px;
// //           width: 10px; height: 10px; border-radius: 50%;
// //           background: #10b981;
// //           border: 2px solid #0a0f1e;
// //           box-shadow: 0 0 8px rgba(16,185,129,0.6);
// //           animation: pm-pulse 2s ease infinite;
// //         }

// //         @keyframes pm-pulse {
// //           0%, 100% { opacity: 1; transform: scale(1); }
// //           50%       { opacity: 0.7; transform: scale(0.9); }
// //         }

// //         .pm-info { flex: 0 0 200px; min-width: 0; }

// //         .pm-name {
// //           font-family: 'DM Sans', sans-serif;
// //           font-size: 0.85rem; font-weight: 600; color: #e2e8f0;
// //           white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
// //         }

// //         .pm-meta {
// //           font-family: 'JetBrains Mono', monospace;
// //           font-size: 0.58rem; color: #334155;
// //           margin-top: 2px;
// //           white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
// //         }

// //         .pm-entries {
// //           flex: 0 0 56px; text-align: center;
// //         }
// //         .pm-entries-val {
// //           font-family: 'Syne', sans-serif;
// //           font-size: 1.1rem; font-weight: 800; color: #e2e8f0;
// //           line-height: 1;
// //         }
// //         .pm-entries-label {
// //           font-family: 'JetBrains Mono', monospace;
// //           font-size: 0.55rem; color: #334155;
// //           margin-top: 1px;
// //         }

// //         .pm-last-seen {
// //           flex: 0 0 96px;
// //           font-family: 'JetBrains Mono', monospace;
// //           font-size: 0.6rem; color: #475569;
// //           text-align: center; line-height: 1.4;
// //         }
// //         .pm-last-seen strong { display: block; color: #64748b; font-size: 0.55rem; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px; }

// //         .pm-bar-wrap { flex: 1; min-width: 80px; }

// //         .pm-bar-top {
// //           display: flex; justify-content: space-between; align-items: baseline;
// //           margin-bottom: 5px;
// //         }
// //         .pm-bar-remain {
// //           font-family: 'JetBrains Mono', monospace;
// //           font-size: 0.6rem; color: #475569;
// //         }
// //         .pm-bar-remain.over { color: #f87171; }

// //         .pm-bar-time {
// //           font-family: 'Syne', sans-serif;
// //           font-size: 0.9rem; font-weight: 800;
// //         }

// //         .pm-bar-track {
// //           height: 4px; border-radius: 2px;
// //           background: rgba(255,255,255,0.05); overflow: hidden;
// //         }
// //         .pm-bar-fill {
// //           height: 100%; border-radius: 2px;
// //           transition: width 600ms cubic-bezier(0.16, 1, 0.3, 1);
// //         }

// //         .pm-badge {
// //           flex-shrink: 0;
// //           font-family: 'JetBrains Mono', monospace;
// //           font-size: 0.55rem; font-weight: 700;
// //           letter-spacing: 0.08em; padding: 3px 7px;
// //           border-radius: 5px; white-space: nowrap;
// //         }
// //         .pm-badge-green  { background: rgba(16,185,129,0.15); color: #6ee7b7; border: 1px solid rgba(16,185,129,0.25); }
// //         .pm-badge-amber  { background: rgba(245,158,11,0.15);  color: #fcd34d; border: 1px solid rgba(245,158,11,0.25); }
// //         .pm-badge-red    { background: rgba(239,68,68,0.15);   color: #fca5a5; border: 1px solid rgba(239,68,68,0.25); }
// //         .pm-badge-gray   { background: rgba(100,116,139,0.1);  color: #475569; border: 1px solid rgba(100,116,139,0.2); }

// //         /* ── Footer ────────────────────────────────────────────────── */
// //         .pm-footer {
// //           padding: 10px 20px;
// //           border-top: 1px solid rgba(255,255,255,0.06);
// //           display: flex; align-items: center; justify-content: space-between;
// //           background: rgba(255,255,255,0.01);
// //         }

// //         .pm-footer-stat {
// //           font-family: 'JetBrains Mono', monospace;
// //           font-size: 0.6rem; color: #334155;
// //           letter-spacing: 0.08em;
// //         }
// //         .pm-footer-stat strong { color: #475569; }

// //         @media (max-width: 640px) {
// //           .pm-kpis { grid-template-columns: repeat(3, 1fr); }
// //           .pm-info { flex: 0 0 140px; }
// //           .pm-last-seen { display: none; }
// //         }
// //       `}</style>

// //       <div className="pm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
// //         <div className="pm-modal" style={{ opacity: mounted ? 1 : 0 }}>

// //           {/* ── Header ─────────────────────────────────────────────── */}
// //           <div className="pm-header">
// //             <div>
// //               <div className="pm-title">
// //                 <div className="pm-title-icon">⏱</div>
// //                 Relatório de Permanência
// //               </div>
// //               <div className="pm-subtitle">
// //                 <span>HOJE</span>
// //                 <span className="pm-subtitle-sep">·</span>
// //                 <span>LIMITE {formatMinutes(limitMin)}</span>
// //                 <span className="pm-subtitle-sep">·</span>
// //                 <span>POLÍTICA {sysConfig.overLimitPolicy === 'block' ? '🚫 BLOQUEAR' : '⚠ AVISAR'}</span>
// //               </div>
// //             </div>
// //             <button className="pm-close" onClick={onClose}>✕</button>
// //           </div>

// //           {/* ── KPI strip ──────────────────────────────────────────── */}
// //           <div className="pm-kpis">
// //             {[
// //               { label: 'Dentro agora',    value: loading ? '…' : insideCount,              sub: 'em área restrita',  color: '#10b981' },
// //               { label: 'Total registros', value: loading ? '…' : people.length,            sub: 'pessoas no sistema', color: '#0ea5e9' },
// //               { label: 'Tempo médio',     value: loading ? '…' : formatMinutes(avgMin),    sub: 'por pessoa hoje',    color: '#8b5cf6' },
// //               { label: 'Acima do limite', value: loading ? '…' : overCount,                sub: 'excederam hoje',     color: '#ef4444' },
// //               { label: 'Conformidade',    value: loading ? '…' : `${complianceRate}%`,     sub: 'dentro do limite',   color: complianceRate >= 90 ? '#10b981' : complianceRate >= 70 ? '#f59e0b' : '#ef4444' },
// //             ].map((k) => (
// //               <div key={k.label} className="pm-kpi" style={{ '--kpi-color': k.color } as React.CSSProperties}>
// //                 <div className="pm-kpi-label">{k.label}</div>
// //                 <div className="pm-kpi-value">{k.value}</div>
// //                 <div className="pm-kpi-sub">{k.sub}</div>
// //               </div>
// //             ))}
// //           </div>

// //           {/* ── Toolbar ────────────────────────────────────────────── */}
// //           <div className="pm-toolbar">
// //             {filterTabs.map((f) => {
// //               const colorMap: Record<string, string> = {
// //                 '#10b981': 'green', '#ef4444': 'red', '#f59e0b': 'amber', '#64748b': 'gray',
// //               };
// //               const colorKey = colorMap[f.color] ?? 'gray';
// //               return (
// //                 <button
// //                   key={f.id}
// //                   className={`pm-filter-btn ${filter === f.id ? 'active' : ''}`}
// //                   data-color={colorKey}
// //                   onClick={() => setFilter(f.id)}
// //                 >
// //                   {f.label}
// //                   <span className="pm-filter-count">{f.count}</span>
// //                 </button>
// //               );
// //             })}

// //             <div className="pm-search-wrap">
// //               <span className="pm-search-icon">⌕</span>
// //               <input
// //                 ref={searchRef}
// //                 className="pm-search"
// //                 placeholder="Buscar nome, código, crachá…"
// //                 value={search}
// //                 onChange={(e) => setSearch(e.target.value)}
// //               />
// //             </div>

// //             <button
// //               className="pm-refresh"
// //               onClick={() => fetchPeople()}
// //               title="Atualizar lista"
// //             >
// //               ↻ SYNC
// //             </button>
// //           </div>

// //           {/* ── List ───────────────────────────────────────────────── */}
// //           <div className="pm-list">
// //             {loading && (
// //               <div className="pm-loading">
// //                 <div style={{ marginBottom: 8, fontSize: '1.5rem' }}>⟳</div>
// //                 CARREGANDO REGISTROS…
// //               </div>
// //             )}

// //             {!loading && filtered.length === 0 && (
// //               <div className="pm-empty">
// //                 <div className="pm-empty-icon">◌</div>
// //                 <div>NENHUM REGISTRO ENCONTRADO</div>
// //                 {search && <div style={{ marginTop: 4, fontSize: '0.65rem', color: '#1e293b' }}>tente outro termo de busca</div>}
// //               </div>
// //             )}

// //             {!loading && filtered.map((p, idx) => (
// //               <WorkerRow key={p.person_code || idx} person={p} limitMin={limitMin} />
// //             ))}
// //           </div>

// //           {/* ── Footer ─────────────────────────────────────────────── */}
// //           <div className="pm-footer">
// //             <div className="pm-footer-stat">
// //               Exibindo <strong>{filtered.length}</strong> de <strong>{people.length}</strong> registros
// //             </div>
// //             <div className="pm-footer-stat">
// //               SmartX Vision · Zona <strong>{sysConfig.zoneId}</strong> · {sysConfig.doorId}
// //             </div>
// //           </div>

// //         </div>
// //       </div>
// //     </>
// //   );
// // }

// // // ─── WorkerRow ────────────────────────────────────────────────────────────────

// // function WorkerRow({ person, limitMin }: { person: WorkerRecord; limitMin: number }) {
// //   const totalMin = person.daily_accumulated_min ?? person.total_minutes ?? 0;
// //   const pct      = Math.min((totalMin / limitMin) * 100, 100);
// //   const isOver   = totalMin >= limitMin;
// //   const isNear   = !isOver && totalMin >= limitMin * 0.8;
// //   const hasTime  = totalMin > 0;

// //   const barColor  = isOver ? '#ef4444' : isNear ? '#f59e0b' : '#10b981';
// //   const color     = avatarColor(person.person_code);
// //   const initials  = getInitials(person.person_name);
// //   const entries   = person.total_entries ?? person.sessions_today ?? 0;

// //   const rowClass = [
// //     'pm-row',
// //     person.is_inside ? 'is-inside' : '',
// //     isOver ? 'is-over' : isNear ? 'is-near' : '',
// //   ].filter(Boolean).join(' ');

// //   return (
// //     <div className={rowClass}>

// //       {/* Avatar */}
// //       <div className="pm-avatar" style={{ background: `${color}22`, border: `1.5px solid ${color}44` }}>
// //         <span style={{ color }}>{initials}</span>
// //         {person.is_inside && <div className="pm-avatar-dot" />}
// //       </div>

// //       {/* Info */}
// //       <div className="pm-info">
// //         <div className="pm-name" title={person.person_name}>{person.person_name}</div>
// //         <div className="pm-meta">
// //           {person.person_code}
// //           {person.badge_id ? ` · ${person.badge_id}` : ''}
// //           {person.department ? ` · ${person.department}` : ''}
// //         </div>
// //       </div>

// //       {/* Entradas */}
// //       <div className="pm-entries">
// //         <div className="pm-entries-val">{entries}</div>
// //         <div className="pm-entries-label">entrada{entries !== 1 ? 's' : ''}</div>
// //       </div>

// //       {/* Último acesso */}
// //       <div className="pm-last-seen">
// //         <strong>{person.is_inside ? 'entrou' : 'última saída'}</strong>
// //         {timeSince(person.is_inside ? person.last_entry_at : person.last_exit_at)}
// //       </div>

// //       {/* Barra de tempo */}
// //       <div className="pm-bar-wrap">
// //         <div className="pm-bar-top">
// //           <span className={`pm-bar-remain ${isOver ? 'over' : ''}`}>
// //             {!hasTime
// //               ? 'sem registro'
// //               : isOver
// //               ? `+${Math.round(totalMin - limitMin)}min acima`
// //               : `faltam ${formatMinutes(limitMin - totalMin)}`}
// //           </span>
// //           <span className="pm-bar-time" style={{ color: hasTime ? barColor : '#1e293b' }}>
// //             {hasTime ? formatMinutes(totalMin) : '—'}
// //           </span>
// //         </div>
// //         <div className="pm-bar-track">
// //           <div
// //             className="pm-bar-fill"
// //             style={{
// //               width: `${hasTime ? pct : 0}%`,
// //               background: hasTime
// //                 ? isOver
// //                   ? 'linear-gradient(90deg, #dc2626, #ef4444)'
// //                   : isNear
// //                   ? 'linear-gradient(90deg, #d97706, #f59e0b)'
// //                   : 'linear-gradient(90deg, #059669, #10b981)'
// //                 : 'transparent',
// //             }}
// //           />
// //         </div>
// //       </div>

// //       {/* Badge */}
// //       <div>
// //         {!hasTime
// //           ? <span className="pm-badge pm-badge-gray">SEM DADOS</span>
// //           : isOver
// //           ? <span className="pm-badge pm-badge-red">EXCEDEU</span>
// //           : isNear
// //           ? <span className="pm-badge pm-badge-amber">PRÓXIMO</span>
// //           : <span className="pm-badge pm-badge-green">OK</span>}
// //       </div>

// //     </div>
// //   );
// // }

// // src/components/CamAutomationPeople/components/PermanenceModal.tsx

// import { useState, useEffect, useRef } from 'react';
// import type { PermanenceState, SysConfig, WorkerRecord } from '../../../hooks/useCamAutomation';
// import { formatMinutes } from '../../../hooks/useCamAutomation';

// interface PermanenceModalProps {
//   permanenceState: PermanenceState;
//   sysConfig: SysConfig;
//   onClose: () => void;
// }

// type FilterId = 'all' | 'inside' | 'over' | 'no_photo';

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function timeSince(dateStr: string | null | undefined): string {
//   if (!dateStr) return '—';
//   const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
//   if (diff < 1) return 'agora';
//   if (diff < 60) return `${diff}min atrás`;
//   const h = Math.floor(diff / 60);
//   const m = diff % 60;
//   return m > 0 ? `${h}h ${m}min atrás` : `${h}h atrás`;
// }

// function getInitials(name: string): string {
//   return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase();
// }

// const AVATAR_COLORS = ['#0ea5e9','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316'];
// function avatarColor(code: string): string {
//   let h = 0;
//   for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) & 0xffffffff;
//   return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
// }

// // ─────────────────────────────────────────────────────────────────────────────

// export default function PermanenceModal({ permanenceState, sysConfig, onClose }: PermanenceModalProps) {
//   const [filter, setFilter] = useState<FilterId>('all');
//   const [search, setSearch] = useState('');
//   const searchRef = useRef<HTMLInputElement>(null);

//   const { people, loading, fetchPeople } = permanenceState;
//   const limitMin = sysConfig.dailyLimitMin || 120;

//   useEffect(() => {
//     setTimeout(() => searchRef.current?.focus(), 300);
//   }, []);

//   const insideCount  = people.filter((p) => p.is_inside).length;
//   const overCount    = people.filter((p) => (p.daily_accumulated_min ?? p.total_minutes ?? 0) >= limitMin).length;
//   const noPhotoCount = people.filter((p) => !p.face_photos_count).length;
//   const avgMin       = people.length
//     ? people.reduce((s, p) => s + (p.daily_accumulated_min ?? p.total_minutes ?? 0), 0) / people.length
//     : 0;
//   const compRate = people.length ? Math.round(((people.length - overCount) / people.length) * 100) : 100;

//   const filtered = people
//     .filter((p) => {
//       const mins = p.daily_accumulated_min ?? p.total_minutes ?? 0;
//       if (filter === 'inside')   return p.is_inside;
//       if (filter === 'over')     return mins >= limitMin;
//       if (filter === 'no_photo') return !p.face_photos_count;
//       return true;
//     })
//     .filter((p) => {
//       if (!search) return true;
//       const q = search.toLowerCase();
//       return (
//         p.person_name.toLowerCase().includes(q) ||
//         p.person_code.toLowerCase().includes(q) ||
//         (p.badge_id ?? '').toLowerCase().includes(q)
//       );
//     })
//     .sort((a, b) => {
//       if (a.is_inside && !b.is_inside) return -1;
//       if (!a.is_inside && b.is_inside) return 1;
//       return (b.daily_accumulated_min ?? b.total_minutes ?? 0) - (a.daily_accumulated_min ?? a.total_minutes ?? 0);
//     });

//   const tabs: { id: FilterId; label: string; count: number }[] = [
//     { id: 'all',      label: 'Todos',        count: people.length },
//     { id: 'inside',   label: 'Dentro agora', count: insideCount   },
//     { id: 'over',     label: 'Acima limite', count: overCount      },
//     { id: 'no_photo', label: 'Sem foto',     count: noPhotoCount   },
//   ];

//   return (
//     <>
//       <style>{`
//         .pm-overlay {
//           position: fixed; inset: 0; z-index: 9999;
//           background: rgba(0,0,0,0.35);
//           backdrop-filter: blur(6px);
//           display: flex; align-items: center; justify-content: center;
//           padding: 16px; box-sizing: border-box;
//           animation: pmFadeIn 180ms ease;
//         }
//         @keyframes pmFadeIn { from { opacity:0 } to { opacity:1 } }

//         .pm-modal {
//           width: 100%; max-width: 900px;
//           max-height: 90vh;
//           display: flex; flex-direction: column;
//           background: #ffffff;
//           border-radius: 16px;
//           box-shadow: 0 24px 64px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08);
//           overflow: hidden;
//           animation: pmSlideUp 220ms cubic-bezier(0.16,1,0.3,1);
//         }
//         @keyframes pmSlideUp {
//           from { opacity:0; transform:translateY(20px) scale(0.98) }
//           to   { opacity:1; transform:translateY(0) scale(1) }
//         }

//         /* ── Header ──────────────────────────────────────────────────── */
//         .pm-header {
//           display: flex; align-items: center; justify-content: space-between;
//           padding: 18px 20px 14px; gap: 12px;
//           border-bottom: 1px solid #f1f5f9;
//           flex-shrink: 0;
//         }
//         .pm-header-left { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; }
//         .pm-icon {
//           width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
//           background: linear-gradient(135deg, #0ea5e9, #0284c7);
//           display: flex; align-items: center; justify-content: center;
//           font-size: 1rem; box-shadow: 0 4px 10px rgba(14,165,233,0.25);
//         }
//         .pm-title { font-size: 1rem; font-weight: 700; color: #0f172a; white-space: nowrap; }
//         .pm-sub   { font-size: 0.65rem; color: #94a3b8; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
//         .pm-close {
//           width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
//           background: #f8fafc; border: 1px solid #e2e8f0; color: #94a3b8;
//           font-size: 0.85rem; cursor: pointer;
//           display: flex; align-items: center; justify-content: center;
//           transition: all 130ms;
//         }
//         .pm-close:hover { background: #fee2e2; border-color: #fecaca; color: #ef4444; }

//         /* ── KPIs ──────────────────────────────────────────────────── */
//         .pm-kpis {
//           display: grid; grid-template-columns: repeat(5, 1fr);
//           border-bottom: 1px solid #f1f5f9; flex-shrink: 0;
//         }
//         .pm-kpi { padding: 12px 14px; border-right: 1px solid #f1f5f9; }
//         .pm-kpi:last-child { border-right: none; }
//         .pm-kpi-lbl { font-size: 0.58rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.07em; font-weight: 600; margin-bottom: 3px; }
//         .pm-kpi-val { font-size: 1.5rem; font-weight: 800; line-height: 1; }
//         .pm-kpi-sub { font-size: 0.58rem; color: #cbd5e1; margin-top: 2px; }

//         /* ── Toolbar ───────────────────────────────────────────────── */
//         .pm-toolbar {
//           display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
//           padding: 10px 14px; border-bottom: 1px solid #f1f5f9; flex-shrink: 0;
//         }
//         .pm-tab {
//           display: flex; align-items: center; gap: 4px;
//           padding: 4px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 600;
//           border: 1.5px solid #e2e8f0; color: #64748b; background: #fff;
//           cursor: pointer; transition: all 130ms; white-space: nowrap;
//         }
//         .pm-tab:hover { border-color: #cbd5e1; color: #334155; }
//         .pm-tab.active { background: #0ea5e9; border-color: #0ea5e9; color: #fff; }
//         .pm-badge-count {
//           background: rgba(0,0,0,0.1); border-radius: 10px;
//           padding: 0 5px; font-size: 0.6rem; font-weight: 700;
//         }
//         .pm-tab.active .pm-badge-count { background: rgba(255,255,255,0.3); }

//         .pm-search-wrap { position: relative; flex: 1; min-width: 120px; }
//         .pm-search-ico {
//           position: absolute; left: 9px; top: 50%; transform: translateY(-50%);
//           color: #cbd5e1; font-size: 0.75rem; pointer-events: none;
//         }
//         .pm-search {
//           width: 100%; padding: 5px 10px 5px 28px; box-sizing: border-box;
//           background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px;
//           font-size: 0.76rem; color: #0f172a; outline: none; transition: border-color 130ms;
//         }
//         .pm-search:focus { border-color: #0ea5e9; background: #fff; }
//         .pm-search::placeholder { color: #cbd5e1; }

//         .pm-sync {
//           padding: 5px 11px; border-radius: 8px; font-size: 0.72rem; font-weight: 600;
//           background: #f8fafc; border: 1.5px solid #e2e8f0; color: #64748b;
//           cursor: pointer; transition: all 130ms; white-space: nowrap;
//         }
//         .pm-sync:hover { border-color: #0ea5e9; color: #0ea5e9; background: #f0f9ff; }

//         /* ── List ──────────────────────────────────────────────────── */
//         .pm-list {
//           flex: 1; overflow-y: auto; padding: 10px 12px 12px;
//           display: flex; flex-direction: column; gap: 4px;
//           min-height: 0;
//         }
//         .pm-list::-webkit-scrollbar { width: 4px; }
//         .pm-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

//         .pm-empty, .pm-loading {
//           text-align: center; padding: 48px 20px;
//           color: #cbd5e1; font-size: 0.78rem;
//         }

//         /* ── Row ───────────────────────────────────────────────────── */
//         .pm-row {
//           display: grid;
//           grid-template-columns: 38px 1fr 80px 120px 80px;
//           align-items: center; gap: 10px;
//           padding: 9px 12px; border-radius: 10px;
//           border: 1px solid #f1f5f9; background: #fff;
//           transition: background 130ms, border-color 130ms;
//         }
//         .pm-row:hover { background: #f8fafc; border-color: #e2e8f0; }
//         .pm-row.r-inside { background: #f0fdf4; border-color: #bbf7d0; }
//         .pm-row.r-over   { background: #fff5f5; border-color: #fecaca; }
//         .pm-row.r-near   { background: #fffbeb; border-color: #fde68a; }

//         /* Avatar */
//         .pm-av {
//           width: 38px; height: 38px; border-radius: 9px; flex-shrink: 0;
//           display: flex; align-items: center; justify-content: center;
//           font-size: 0.68rem; font-weight: 800; color: #fff;
//           position: relative; letter-spacing: 0;
//         }
//         .pm-av-dot {
//           position: absolute; bottom: -2px; right: -2px;
//           width: 10px; height: 10px; border-radius: 50%;
//           background: #10b981; border: 2px solid #f0fdf4;
//           animation: pmPulse 2s ease infinite;
//         }
//         @keyframes pmPulse {
//           0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
//           50%      { box-shadow: 0 0 0 4px rgba(16,185,129,0); }
//         }

//         /* Info */
//         .pm-info { min-width: 0; }
//         .pm-name {
//           font-size: 0.82rem; font-weight: 600; color: #0f172a;
//           white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
//         }
//         .pm-code { font-size: 0.62rem; color: #94a3b8; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

//         /* Seen */
//         .pm-seen { text-align: right; }
//         .pm-seen-lbl { font-size: 0.56rem; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.05em; display: block; }
//         .pm-seen-val { font-size: 0.65rem; color: #94a3b8; }

//         /* Bar */
//         .pm-bar { }
//         .pm-bar-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
//         .pm-bar-remain { font-size: 0.6rem; color: #94a3b8; }
//         .pm-bar-remain.ov { color: #ef4444; }
//         .pm-bar-time { font-size: 0.78rem; font-weight: 700; }
//         .pm-bar-track { height: 4px; background: #f1f5f9; border-radius: 2px; overflow: hidden; }
//         .pm-bar-fill  { height: 100%; border-radius: 2px; transition: width 500ms ease; }

//         /* Badge */
//         .pm-bdg {
//           padding: 3px 7px; border-radius: 5px;
//           font-size: 0.58rem; font-weight: 700;
//           letter-spacing: 0.05em; white-space: nowrap; text-align: center;
//         }
//         .bd-g { background: #dcfce7; color: #15803d; }
//         .bd-a { background: #fef3c7; color: #b45309; }
//         .bd-r { background: #fee2e2; color: #dc2626; }
//         .bd-n { background: #f1f5f9; color: #94a3b8; }

//         /* Footer */
//         .pm-footer {
//           padding: 9px 16px; border-top: 1px solid #f1f5f9;
//           display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
//         }
//         .pm-footer-txt { font-size: 0.66rem; color: #94a3b8; }
//         .pm-footer-txt strong { color: #64748b; }

//         /* ── Responsive ──────────────────────────────────────────────── */
//         @media (max-width: 700px) {
//           .pm-kpis { grid-template-columns: repeat(3,1fr); }
//           .pm-kpi:nth-child(4), .pm-kpi:nth-child(5) { display: none; }
//           .pm-row { grid-template-columns: 36px 1fr 72px; }
//           .pm-seen, .pm-bar { display: none; }
//         }
//         @media (max-width: 460px) {
//           .pm-kpis { grid-template-columns: repeat(2,1fr); }
//           .pm-kpi:nth-child(3) { display: none; }
//           .pm-row { grid-template-columns: 34px 1fr; }
//           .pm-bdg { display: none; }
//           .pm-sub { display: none; }
//         }
//       `}</style>

//       <div className="pm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
//         <div className="pm-modal">

//           {/* Header */}
//           <div className="pm-header">
//             <div className="pm-header-left">
//               <div className="pm-icon">⏱</div>
//               <div style={{ minWidth: 0 }}>
//                 <div className="pm-title">Relatório de Permanência</div>
//                 <div className="pm-sub">
//                   LIMITE {formatMinutes(limitMin)} · {sysConfig.overLimitPolicy === 'block' ? 'BLOQUEAR' : 'AVISAR'} · ZONA {sysConfig.zoneId} · {sysConfig.doorId}
//                 </div>
//               </div>
//             </div>
//             <button className="pm-close" onClick={onClose}>✕</button>
//           </div>

//           {/* KPIs */}
//           <div className="pm-kpis">
//             {[
//               { lbl: 'Dentro agora',    val: loading ? '…' : insideCount,          color: '#10b981', sub: 'em área restrita'   },
//               { lbl: 'Total',           val: loading ? '…' : people.length,         color: '#0ea5e9', sub: 'pessoas cadastradas' },
//               { lbl: 'Tempo médio',     val: loading ? '…' : formatMinutes(avgMin), color: '#8b5cf6', sub: 'por pessoa hoje'     },
//               { lbl: 'Acima do limite', val: loading ? '…' : overCount,             color: '#ef4444', sub: 'excederam hoje'      },
//               { lbl: 'Conformidade',    val: loading ? '…' : `${compRate}%`,        color: compRate >= 90 ? '#10b981' : compRate >= 70 ? '#f59e0b' : '#ef4444', sub: 'dentro do limite' },
//             ].map((k) => (
//               <div key={k.lbl} className="pm-kpi">
//                 <div className="pm-kpi-lbl">{k.lbl}</div>
//                 <div className="pm-kpi-val" style={{ color: k.color }}>{k.val}</div>
//                 <div className="pm-kpi-sub">{k.sub}</div>
//               </div>
//             ))}
//           </div>

//           {/* Toolbar */}
//           <div className="pm-toolbar">
//             {tabs.map((t) => (
//               <button key={t.id} className={`pm-tab ${filter === t.id ? 'active' : ''}`} onClick={() => setFilter(t.id)}>
//                 {t.label}
//                 <span className="pm-badge-count">{t.count}</span>
//               </button>
//             ))}
//             <div className="pm-search-wrap">
//               <span className="pm-search-ico">⌕</span>
//               <input
//                 ref={searchRef}
//                 className="pm-search"
//                 placeholder="Buscar nome, código ou crachá…"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//               />
//             </div>
//             <button className="pm-sync" onClick={() => fetchPeople()}>↻ Atualizar</button>
//           </div>

//           {/* List */}
//           <div className="pm-list">
//             {loading && <div className="pm-loading">Carregando registros…</div>}
//             {!loading && filtered.length === 0 && (
//               <div className="pm-empty">
//                 {search ? `Nenhum resultado para "${search}"` : 'Nenhum registro neste filtro.'}
//               </div>
//             )}
//             {!loading && filtered.map((p, i) => (
//               <WorkerRow key={p.person_code || i} person={p} limitMin={limitMin} />
//             ))}
//           </div>

//           {/* Footer */}
//           <div className="pm-footer">
//             <span className="pm-footer-txt">Exibindo <strong>{filtered.length}</strong> de <strong>{people.length}</strong> registros</span>
//             <span className="pm-footer-txt">SmartX Vision · Zona <strong>{sysConfig.zoneId}</strong></span>
//           </div>

//         </div>
//       </div>
//     </>
//   );
// }

// // ─── WorkerRow ────────────────────────────────────────────────────────────────

// function WorkerRow({ person, limitMin }: { person: WorkerRecord; limitMin: number }) {
//   const totalMin = person.daily_accumulated_min ?? person.total_minutes ?? 0;
//   const hasTime  = totalMin > 0;
//   const pct      = Math.min((totalMin / limitMin) * 100, 100);
//   const isOver   = hasTime && totalMin >= limitMin;
//   const isNear   = hasTime && !isOver && totalMin >= limitMin * 0.8;

//   const barColor = isOver ? '#ef4444' : isNear ? '#f59e0b' : '#10b981';
//   const color    = avatarColor(person.person_code);
//   const initials = getInitials(person.person_name);

//   const rowClass = [
//     'pm-row',
//     person.is_inside ? 'r-inside' : '',
//     isOver ? 'r-over' : isNear ? 'r-near' : '',
//   ].filter(Boolean).join(' ');

//   return (
//     <div className={rowClass}>

//       {/* Avatar */}
//       <div className="pm-av" style={{ background: color }}>
//         {initials}
//         {person.is_inside && <div className="pm-av-dot" />}
//       </div>

//       {/* Info */}
//       <div className="pm-info">
//         <div className="pm-name">{person.person_name}</div>
//         <div className="pm-code">
//           {person.person_code}{person.badge_id ? ` · ${person.badge_id}` : ''}
//         </div>
//       </div>

//       {/* Último acesso */}
//       <div className="pm-seen">
//         <span className="pm-seen-lbl">{person.is_inside ? 'entrou' : 'saiu'}</span>
//         <span className="pm-seen-val">
//           {timeSince(person.is_inside ? person.last_entry_at : person.last_exit_at)}
//         </span>
//       </div>

//       {/* Barra */}
//       <div className="pm-bar">
//         <div className="pm-bar-top">
//           <span className={`pm-bar-remain ${isOver ? 'ov' : ''}`}>
//             {!hasTime ? 'sem registro' : isOver ? `+${Math.round(totalMin - limitMin)}min` : `faltam ${formatMinutes(limitMin - totalMin)}`}
//           </span>
//           <span className="pm-bar-time" style={{ color: hasTime ? barColor : '#cbd5e1' }}>
//             {hasTime ? formatMinutes(totalMin) : '—'}
//           </span>
//         </div>
//         <div className="pm-bar-track">
//           <div className="pm-bar-fill" style={{ width: `${hasTime ? pct : 0}%`, background: barColor }} />
//         </div>
//       </div>

//       {/* Badge */}
//       {!hasTime
//         ? <span className="pm-bdg bd-n">SEM DADOS</span>
//         : isOver ? <span className="pm-bdg bd-r">EXCEDEU</span>
//         : isNear  ? <span className="pm-bdg bd-a">PRÓXIMO</span>
//         :           <span className="pm-bdg bd-g">OK</span>}

//     </div>
//   );
// }


// src/components/CamAutomationPeople/components/PermanenceModal.tsx

import { useState, useEffect, useRef } from 'react';
import type { PermanenceState, SysConfig, WorkerRecord } from '../../../hooks/useCamAutomation';
import { formatMinutes } from '../../../hooks/useCamAutomation';

interface PermanenceModalProps {
  permanenceState: PermanenceState;
  sysConfig: SysConfig;
  onClose: () => void;
}

type FilterId = 'all' | 'inside' | 'over' | 'no_photo';

// ─── Heroicons (SVG inline, 20px solid) ───────────────────────────────────────

const Icon = {
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd"/>
    </svg>
  ),
  X: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/>
    </svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 17a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z"/>
    </svg>
  ),
  UserCheck: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path d="M6.5 9a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5ZM3.176 14.466A5.5 5.5 0 0 1 12 11.5c0 .572-.085 1.124-.244 1.644a.75.75 0 0 1-1.428-.457A4 4 0 0 0 7 9.5a4.5 4.5 0 0 0-4.5 4.5.5.5 0 0 0 .5.5h6.5a.75.75 0 0 1 0 1.5H3a2 2 0 0 1-2-2c0-.18.015-.356.044-.528ZM16.78 12.22a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 0 1-1.06 0l-1.5-1.5a.75.75 0 1 1 1.06-1.06l.97.97 2.47-2.47a.75.75 0 0 1 1.06 0Z"/>
    </svg>
  ),
  ExclamationTriangle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd"/>
    </svg>
  ),
  Camera: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path fillRule="evenodd" d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd"/>
    </svg>
  ),
  MagnifyingGlass: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd"/>
    </svg>
  ),
  ArrowPath: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
      <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd"/>
    </svg>
  ),
  MapPin: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
      <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd"/>
    </svg>
  ),
  Door: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
      <path fillRule="evenodd" d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Zm8.5 3a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" clipRule="evenodd"/>
    </svg>
  ),
  ArrowRightOnRectangle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
      <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Zm9.22 3.97a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 1 1-1.06-1.06l.97-.97H6.75a.75.75 0 0 1 0-1.5h6.44l-.97-.97a.75.75 0 0 1 0-1.06Z" clipRule="evenodd"/>
    </svg>
  ),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeSince(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 1) return 'agora';
  if (diff < 60) return `${diff}min atrás`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m > 0 ? `${h}h ${m}min atrás` : `${h}h atrás`;
}

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

const AVATAR_COLORS = ['#0ea5e9','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316'];
function avatarColor(code: string): string {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PermanenceModal({ permanenceState, sysConfig, onClose }: PermanenceModalProps) {
  const [filter, setFilter] = useState<FilterId>('all');
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const { people, loading, fetchPeople } = permanenceState;
  const limitMin = sysConfig.dailyLimitMin || 120;

  useEffect(() => { setTimeout(() => searchRef.current?.focus(), 300); }, []);

  const insideCount  = people.filter((p) => p.is_inside).length;
  const overCount    = people.filter((p) => (p.daily_accumulated_min ?? p.total_minutes ?? 0) >= limitMin).length;
  const noPhotoCount = people.filter((p) => !p.face_photos_count).length;
  const avgMin       = people.length ? people.reduce((s, p) => s + (p.daily_accumulated_min ?? p.total_minutes ?? 0), 0) / people.length : 0;
  const compRate     = people.length ? Math.round(((people.length - overCount) / people.length) * 100) : 100;

  const filtered = people
    .filter((p) => {
      const mins = p.daily_accumulated_min ?? p.total_minutes ?? 0;
      if (filter === 'inside')   return p.is_inside;
      if (filter === 'over')     return mins >= limitMin;
      if (filter === 'no_photo') return !p.face_photos_count;
      return true;
    })
    .filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return p.person_name.toLowerCase().includes(q) || p.person_code.toLowerCase().includes(q) || (p.badge_id ?? '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (a.is_inside && !b.is_inside) return -1;
      if (!a.is_inside && b.is_inside) return 1;
      return (b.daily_accumulated_min ?? b.total_minutes ?? 0) - (a.daily_accumulated_min ?? a.total_minutes ?? 0);
    });

  const tabs: { id: FilterId; label: string; count: number; icon: React.ReactNode }[] = [
    { id: 'all',      label: 'Todos',        count: people.length, icon: <Icon.Users /> },
    { id: 'inside',   label: 'Dentro agora', count: insideCount,   icon: <Icon.UserCheck /> },
    { id: 'over',     label: 'Acima limite', count: overCount,     icon: <Icon.ExclamationTriangle /> },
    { id: 'no_photo', label: 'Sem foto',     count: noPhotoCount,  icon: <Icon.Camera /> },
  ];

  const kpis = [
    { label: 'Dentro agora',    val: loading ? '…' : insideCount,          color: '#10b981', sub: 'em área restrita'    },
    { label: 'Total',           val: loading ? '…' : people.length,         color: '#0ea5e9', sub: 'pessoas cadastradas'  },
    { label: 'Tempo médio',     val: loading ? '…' : formatMinutes(avgMin), color: '#8b5cf6', sub: 'por pessoa hoje'      },
    { label: 'Acima do limite', val: loading ? '…' : overCount,             color: '#ef4444', sub: 'excederam hoje'       },
    { label: 'Conformidade',    val: loading ? '…' : `${compRate}%`,        color: compRate >= 90 ? '#10b981' : compRate >= 70 ? '#f59e0b' : '#ef4444', sub: 'dentro do limite' },
  ];

  return (
    <>
      <style>{`
        .pm-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.35); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px; box-sizing: border-box;
          animation: pmFade 180ms ease;
        }
        @keyframes pmFade { from { opacity:0 } to { opacity:1 } }

        .pm-modal {
          width: 100%; max-width: 900px; max-height: 90vh;
          display: flex; flex-direction: column;
          background: #fff; border-radius: 16px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.07);
          overflow: hidden;
          animation: pmSlide 220ms cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes pmSlide {
          from { opacity:0; transform:translateY(20px) scale(0.98) }
          to   { opacity:1; transform:translateY(0) scale(1) }
        }

        /* Header */
        .pm-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 20px 14px; gap: 12px;
          border-bottom: 1px solid #f1f5f9; flex-shrink: 0;
        }
        .pm-header-left { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; }
        .pm-hicon {
          width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          display: flex; align-items: center; justify-content: center; color: #fff;
          box-shadow: 0 4px 10px rgba(14,165,233,0.25);
        }
        .pm-title { font-size: 1rem; font-weight: 700; color: #0f172a; }
        .pm-sub   { font-size: 0.64rem; color: #94a3b8; margin-top: 2px; display: flex; align-items: center; gap: 5px; }
        .pm-sub-dot { color: #e2e8f0; }
        .pm-close {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          background: #f8fafc; border: 1px solid #e2e8f0; color: #94a3b8;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 130ms;
        }
        .pm-close:hover { background: #fee2e2; border-color: #fecaca; color: #ef4444; }

        /* KPIs */
        .pm-kpis {
          display: grid; grid-template-columns: repeat(5,1fr);
          border-bottom: 1px solid #f1f5f9; flex-shrink: 0;
        }
        .pm-kpi { padding: 12px 14px; border-right: 1px solid #f1f5f9; }
        .pm-kpi:last-child { border-right: none; }
        .pm-kpi-lbl { font-size: 0.58rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.07em; font-weight: 600; margin-bottom: 3px; }
        .pm-kpi-val { font-size: 1.5rem; font-weight: 800; line-height: 1; }
        .pm-kpi-sub { font-size: 0.58rem; color: #cbd5e1; margin-top: 2px; }

        /* Toolbar */
        .pm-toolbar {
          display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
          padding: 10px 14px; border-bottom: 1px solid #f1f5f9; flex-shrink: 0;
        }
        .pm-tab {
          display: flex; align-items: center; gap: 5px;
          padding: 5px 11px; border-radius: 20px; font-size: 0.72rem; font-weight: 600;
          border: 1.5px solid #e2e8f0; color: #64748b; background: #fff;
          cursor: pointer; transition: all 130ms; white-space: nowrap;
        }
        .pm-tab:hover { border-color: #cbd5e1; color: #334155; }
        .pm-tab.active { background: #0ea5e9; border-color: #0ea5e9; color: #fff; }
        .pm-tab-n {
          background: rgba(0,0,0,0.08); border-radius: 10px;
          padding: 0 5px; font-size: 0.6rem; font-weight: 700;
        }
        .pm-tab.active .pm-tab-n { background: rgba(255,255,255,0.28); }

        .pm-search-wrap { position: relative; flex: 1; min-width: 130px; }
        .pm-search-ico {
          position: absolute; left: 9px; top: 50%; transform: translateY(-50%);
          color: #cbd5e1; pointer-events: none;
          display: flex; align-items: center;
        }
        .pm-search {
          width: 100%; padding: 6px 10px 6px 30px; box-sizing: border-box;
          background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px;
          font-size: 0.76rem; color: #0f172a; outline: none; transition: border-color 130ms;
        }
        .pm-search:focus { border-color: #0ea5e9; background: #fff; }
        .pm-search::placeholder { color: #cbd5e1; }

        .pm-sync {
          display: flex; align-items: center; gap: 5px;
          padding: 5px 11px; border-radius: 8px; font-size: 0.72rem; font-weight: 600;
          background: #f8fafc; border: 1.5px solid #e2e8f0; color: #64748b;
          cursor: pointer; transition: all 130ms; white-space: nowrap;
        }
        .pm-sync:hover { border-color: #0ea5e9; color: #0ea5e9; background: #f0f9ff; }

        /* List */
        .pm-list {
          flex: 1; overflow-y: auto; padding: 10px 12px 12px;
          display: flex; flex-direction: column; gap: 4px; min-height: 0;
        }
        .pm-list::-webkit-scrollbar { width: 4px; }
        .pm-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

        .pm-empty, .pm-loading {
          text-align: center; padding: 48px 20px; color: #cbd5e1; font-size: 0.78rem;
        }

        /* Row */
        .pm-row {
          display: grid;
          grid-template-columns: 38px 1fr 84px 130px 82px;
          align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 10px;
          border: 1px solid #f1f5f9; background: #fff;
          transition: background 130ms, border-color 130ms;
        }
        .pm-row:hover { background: #f8fafc; border-color: #e2e8f0; }
        .pm-row.r-inside { background: #f0fdf4; border-color: #bbf7d0; }
        .pm-row.r-over   { background: #fff5f5; border-color: #fecaca; }
        .pm-row.r-near   { background: #fffbeb; border-color: #fde68a; }

        .pm-av {
          width: 38px; height: 38px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.68rem; font-weight: 800; color: #fff; position: relative;
        }
        .pm-av-dot {
          position: absolute; bottom: -2px; right: -2px;
          width: 10px; height: 10px; border-radius: 50%;
          background: #10b981; border: 2px solid #f0fdf4;
          animation: pmPulse 2s ease infinite;
        }
        @keyframes pmPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
          50%      { box-shadow: 0 0 0 4px rgba(16,185,129,0); }
        }

        .pm-info { min-width: 0; }
        .pm-name { font-size: 0.82rem; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pm-code { font-size: 0.62rem; color: #94a3b8; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .pm-seen { text-align: right; }
        .pm-seen-lbl { font-size: 0.56rem; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; justify-content: flex-end; gap: 3px; margin-bottom: 1px; }
        .pm-seen-val { font-size: 0.65rem; color: #94a3b8; }

        .pm-bar-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
        .pm-bar-remain { font-size: 0.6rem; color: #94a3b8; }
        .pm-bar-remain.ov { color: #ef4444; }
        .pm-bar-time { font-size: 0.78rem; font-weight: 700; }
        .pm-bar-track { height: 4px; background: #f1f5f9; border-radius: 2px; overflow: hidden; }
        .pm-bar-fill  { height: 100%; border-radius: 2px; transition: width 500ms ease; }

        .pm-bdg { padding: 3px 7px; border-radius: 5px; font-size: 0.58rem; font-weight: 700; letter-spacing: 0.05em; white-space: nowrap; }
        .bd-g { background: #dcfce7; color: #15803d; }
        .bd-a { background: #fef3c7; color: #b45309; }
        .bd-r { background: #fee2e2; color: #dc2626; }
        .bd-n { background: #f1f5f9; color: #94a3b8; }

        /* Footer */
        .pm-footer {
          padding: 9px 16px; border-top: 1px solid #f1f5f9;
          display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
        }
        .pm-footer-txt { font-size: 0.66rem; color: #94a3b8; display: flex; align-items: center; gap: 4px; }
        .pm-footer-txt strong { color: #64748b; }

        /* Responsive */
        @media (max-width: 700px) {
          .pm-kpis { grid-template-columns: repeat(3,1fr); }
          .pm-kpi:nth-child(4), .pm-kpi:nth-child(5) { display: none; }
          .pm-row { grid-template-columns: 36px 1fr 72px; }
          .pm-seen ~ *, .pm-bar-col { display: none; }
        }
        @media (max-width: 460px) {
          .pm-kpis { grid-template-columns: repeat(2,1fr); }
          .pm-kpi:nth-child(3) { display: none; }
          .pm-row { grid-template-columns: 34px 1fr; }
          .pm-bdg, .pm-seen { display: none; }
          .pm-sub { display: none; }
          .pm-tab span:not(.pm-tab-n) { display: none; }
        }
      `}</style>

      <div className="pm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="pm-modal">

          {/* Header */}
          <div className="pm-header">
            <div className="pm-header-left">
              <div className="pm-hicon"><Icon.Clock /></div>
              <div style={{ minWidth: 0 }}>
                <div className="pm-title">Relatório de Permanência</div>
                <div className="pm-sub">
                  <Icon.MapPin />
                  <span>ZONA {sysConfig.zoneId}</span>
                  <span className="pm-sub-dot">·</span>
                  <Icon.Door />
                  <span>{sysConfig.doorId}</span>
                  <span className="pm-sub-dot">·</span>
                  <span>LIMITE {formatMinutes(limitMin)}</span>
                </div>
              </div>
            </div>
            <button className="pm-close" onClick={onClose}><Icon.X /></button>
          </div>

          {/* KPIs */}
          <div className="pm-kpis">
            {kpis.map((k) => (
              <div key={k.label} className="pm-kpi">
                <div className="pm-kpi-lbl">{k.label}</div>
                <div className="pm-kpi-val" style={{ color: k.color }}>{k.val}</div>
                <div className="pm-kpi-sub">{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="pm-toolbar">
            {tabs.map((t) => (
              <button key={t.id} className={`pm-tab ${filter === t.id ? 'active' : ''}`} onClick={() => setFilter(t.id)}>
                {t.icon}
                <span>{t.label}</span>
                <span className="pm-tab-n">{t.count}</span>
              </button>
            ))}
            <div className="pm-search-wrap">
              <span className="pm-search-ico"><Icon.MagnifyingGlass /></span>
              <input
                ref={searchRef}
                className="pm-search"
                placeholder="Buscar nome, código ou crachá…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="pm-sync" onClick={() => fetchPeople()}>
              <Icon.ArrowPath /> Atualizar
            </button>
          </div>

          {/* List */}
          <div className="pm-list">
            {loading && <div className="pm-loading">Carregando registros…</div>}
            {!loading && filtered.length === 0 && (
              <div className="pm-empty">
                {search ? `Nenhum resultado para "${search}"` : 'Nenhum registro neste filtro.'}
              </div>
            )}
            {!loading && filtered.map((p, i) => (
              <WorkerRow key={p.person_code || i} person={p} limitMin={limitMin} />
            ))}
          </div>

          {/* Footer */}
          <div className="pm-footer">
            <span className="pm-footer-txt">
              <Icon.Users />
              Exibindo <strong>{filtered.length}</strong> de <strong>{people.length}</strong> registros
            </span>
            <span className="pm-footer-txt">SmartX Vision · Zona <strong>{sysConfig.zoneId}</strong></span>
          </div>

        </div>
      </div>
    </>
  );
}

// ─── WorkerRow ────────────────────────────────────────────────────────────────

function WorkerRow({ person, limitMin }: { person: WorkerRecord; limitMin: number }) {
  const totalMin = person.daily_accumulated_min ?? person.total_minutes ?? 0;
  const hasTime  = totalMin > 0;
  const pct      = Math.min((totalMin / limitMin) * 100, 100);
  const isOver   = hasTime && totalMin >= limitMin;
  const isNear   = hasTime && !isOver && totalMin >= limitMin * 0.8;

  const barColor = isOver ? '#ef4444' : isNear ? '#f59e0b' : '#10b981';
  const color    = avatarColor(person.person_code);
  const initials = getInitials(person.person_name);

  const rowClass = ['pm-row', person.is_inside ? 'r-inside' : '', isOver ? 'r-over' : isNear ? 'r-near' : ''].filter(Boolean).join(' ');

  return (
    <div className={rowClass}>
      {/* Avatar */}
      <div className="pm-av" style={{ background: color }}>
        {initials}
        {person.is_inside && <div className="pm-av-dot" />}
      </div>

      {/* Info */}
      <div className="pm-info">
        <div className="pm-name">{person.person_name}</div>
        <div className="pm-code">{person.person_code}{person.badge_id ? ` · ${person.badge_id}` : ''}</div>
      </div>

      {/* Último acesso */}
      <div className="pm-seen">
        <span className="pm-seen-lbl">
          {person.is_inside ? <><Icon.ArrowRightOnRectangle /> entrou</> : 'saiu'}
        </span>
        <span className="pm-seen-val">
          {timeSince(person.is_inside ? person.last_entry_at : person.last_exit_at)}
        </span>
      </div>

      {/* Barra */}
      <div>
        <div className="pm-bar-top">
          <span className={`pm-bar-remain ${isOver ? 'ov' : ''}`}>
            {!hasTime ? 'sem registro' : isOver ? `+${Math.round(totalMin - limitMin)}min` : `faltam ${formatMinutes(limitMin - totalMin)}`}
          </span>
          <span className="pm-bar-time" style={{ color: hasTime ? barColor : '#cbd5e1' }}>
            {hasTime ? formatMinutes(totalMin) : '—'}
          </span>
        </div>
        <div className="pm-bar-track">
          <div className="pm-bar-fill" style={{ width: `${hasTime ? pct : 0}%`, background: barColor }} />
        </div>
      </div>

      {/* Badge */}
      {!hasTime
        ? <span className="pm-bdg bd-n">SEM DADOS</span>
        : isOver ? <span className="pm-bdg bd-r">EXCEDEU</span>
        : isNear  ? <span className="pm-bdg bd-a">PRÓXIMO</span>
        :           <span className="pm-bdg bd-g">OK</span>}
    </div>
  );
}