// src/components/CamAutomationPeople/screens/IdleScreen.tsx
// Tela inicial — sem estado próprio, sem chamadas de API
// Tudo vem de idleState + sysConfig via useCamAutomation

// import type { IdleState, SysConfig } from '../../../hooks/useCamAutomation';
// import { formatMinutes } from '../../../hooks/useCamAutomation';

// // ─── Props ────────────────────────────────────────────────────────────────────

// interface IdleScreenProps {
//   idleState:    IdleState;
//   sysConfig:    SysConfig;
//   onStartEntry: () => void;
//   onStartExit:  () => void;
// }

// // ─── Componente ───────────────────────────────────────────────────────────────

// export default function IdleScreen({ idleState, sysConfig, onStartEntry, onStartExit }: IdleScreenProps) {
//   const { dashboard, loadingDash } = idleState;

//   const val = (v: unknown) => (loadingDash ? '…' : String(v ?? '—'));

//   const stats = [
//     { label: 'Dentro agora',    value: val(dashboard?.inside_count ?? dashboard?.people_inside),       color: 'var(--blue)',  icon: '👥' },
//     { label: 'Acessos hoje',    value: val(dashboard?.entries_today ?? dashboard?.today?.total),        color: 'var(--green)', icon: '✅' },
//     { label: 'Alertas EPI',     value: val(dashboard?.open_alerts   ?? dashboard?.alerts_open),         color: 'var(--amber)', icon: '⚠'  },
//     { label: 'Acima do limite', value: val(dashboard?.over_limit_count),                                color: 'var(--red)',   icon: '🕐' },
//   ];

//   return (
//     <div style={{
//       flex: 1, position: 'relative',
//       display: 'flex', flexDirection: 'column',
//       alignItems: 'center', justifyContent: 'center',
//       padding: '24px 32px', gap: 24,
//       animation: 'fadeIn 400ms ease',
//       background: 'var(--bg-deep)',
//     }}>

//       {/* Headline */}
//       <div style={{ textAlign: 'center', marginBottom: 8, position: 'relative', zIndex: 1 }}>
//         <div style={{
//           fontFamily: 'var(--font-head)', fontSize: '3rem', fontWeight: 900,
//           letterSpacing: '0.04em', color: 'var(--white)', lineHeight: 1, textTransform: 'uppercase',
//         }}>
//           CÂMARA FRIA
//         </div>
//         <div style={{
//           fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
//           color: 'var(--gray-light)', letterSpacing: '0.12em', marginTop: 6,
//         }}>
//           CONTROLE DE ACESSO · EPI OBRIGATÓRIO · NR-36
//         </div>
//       </div>

//       {/* Stats row */}
//       <div style={{
//         display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
//         gap: 12, width: '100%', maxWidth: 700, position: 'relative', zIndex: 1,
//       }}>
//         {stats.map((s) => (
//           <div key={s.label} style={{
//             background: 'var(--bg-card)', border: '1px solid var(--border)',
//             borderRadius: 'var(--radius)', padding: '14px 16px',
//             display: 'flex', flexDirection: 'column', gap: 4,
//             borderLeft: `3px solid ${s.color}`,
//           }}>
//             <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--gray-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
//               {s.icon} {s.label}
//             </div>
//             <div style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>
//               {s.value}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Action buttons */}
//       <div style={{ display: 'flex', gap: 16, width: '100%', maxWidth: 560, position: 'relative', zIndex: 1 }}>
//         <button
//           className="btn-primary"
//           onClick={onStartEntry}
//           style={{
//             flex: 1, height: 80, fontSize: '1.4rem',
//             borderRadius: 'var(--radius-lg)', flexDirection: 'column', gap: 4,
//             background: 'var(--blue)', boxShadow: '0 0 40px rgba(0,132,255,0.2)',
//           }}
//         >
//           <span style={{ fontSize: '2rem' }}>🚪</span>
//           <span>ENTRAR</span>
//         </button>

//         <button
//           className="btn-ghost"
//           onClick={onStartExit}
//           style={{
//             flex: 1, height: 80, fontSize: '1.2rem',
//             borderRadius: 'var(--radius-lg)', flexDirection: 'column', gap: 4,
//           }}
//         >
//           <span style={{ fontSize: '1.8rem' }}>↩</span>
//           <span>SAIR</span>
//         </button>
//       </div>

//       {/* Hint */}
//       <div style={{
//         fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
//         color: 'var(--gray)', letterSpacing: '0.06em',
//         textAlign: 'center', marginTop: -8, position: 'relative', zIndex: 1,
//       }}>
//         Pressione ENTRAR e posicione-se em frente às câmeras
//         {sysConfig.dailyLimitMin > 0 && <> · Limite diário: {formatMinutes(sysConfig.dailyLimitMin)}</>}
//       </div>

//       {/* Background decoration */}
//       <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
//         <div style={{
//           position: 'absolute', width: '60vw', height: '60vw', borderRadius: '50%',
//           background: 'radial-gradient(circle, rgba(0,132,255,0.04) 0%, transparent 70%)',
//           top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
//         }} />
//         <div style={{
//           position: 'absolute', inset: 0,
//           backgroundImage: 'linear-gradient(rgba(30,45,71,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(30,45,71,0.4) 1px, transparent 1px)',
//           backgroundSize: '60px 60px', opacity: 0.5,
//         }} />
//       </div>

//     </div>
//   );
// }


// src/components/CamAutomationPeople/screens/IdleScreen.tsx
// Tela inicial — sem estado próprio, sem chamadas de API
// Layout inspirado na UI da imagem: cards grandes para operações + stats pequenos embaixo
// Usando Heroicons para ícones profissionais

import React, { useState } from 'react';
import {
  ArrowRightOnRectangleIcon,
  TruckIcon,
  ArrowLeftOnRectangleIcon,
  UsersIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import type { IdleState, SysConfig } from '../../../hooks/useCamAutomation';

// ─── Props ────────────────────────────────────────────────────────────────────

interface IdleScreenProps {
  idleState: IdleState;
  sysConfig: SysConfig;
  onStartEntry: () => void;
  onStartExit: () => void;
  onStartSupply?: () => void; // Callback para abastecimento
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function IdleScreen({
  idleState,
  sysConfig,
  onStartEntry,
  onStartExit,
  onStartSupply
}: IdleScreenProps) {
  const { dashboard, loadingDash } = idleState;

  const val = (v: unknown) => (loadingDash ? '…' : String(v ?? '—'));

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '24px 24px',
      gap: 16,
      background: 'linear-gradient(to bottom, #f5f7fa 0%, #e8ecf1 100%)',
      overflow: 'auto',
    }}>

      {/* Título principal */}
      <div style={{ textAlign: 'center', marginBottom: 0 }}>
        <h1 style={{
          fontFamily: 'var(--font-head)',
          fontSize: '1.8rem',
          fontWeight: 900,
          letterSpacing: '0.02em',
          color: '#1a1f2e',
          margin: 0,
          marginBottom: 4,
        }}>
          Câmara Fria CF-001
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          color: '#64748b',
          margin: 0,
        }}>
          Selecione a operação desejada
        </p>
      </div>

      {/* Cards de operações principais - Grid 3 colunas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        width: '100%',
        maxWidth: 1100,
      }}>

        {/* Card: Abrir a Porta (ENTRAR) */}
        <OperationCard
          icon={<ArrowRightOnRectangleIcon />}
          title="Abrir a Porta"
          description="Reconhecimento facial + verificação de EPIs para acesso regular"
          badge="Operador • Câmara Fria"
          badgeColor="#1e40af"
          onClick={onStartEntry}
        />

        {/* Card: Abastecimento */}
        <OperationCard
          icon={<TruckIcon />}
          title="Abastecimento"
          description="Abertura de porta para recebimento de carregamento — sem EPIs"
          badge="Operação Logística"
          badgeColor="#d97706"
          onClick={onStartSupply || (() => console.log('Abastecimento'))}
          accentColor="#f59e0b"
        />

        {/* Card: Registrar Saída */}
        <OperationCard
          icon={<ArrowLeftOnRectangleIcon />}
          title="Registrar Saída"
          description="Reconhecimento facial para registrar saída da câmara fria"
          badge="Saída Confirmada"
          badgeColor="#059669"
          onClick={onStartExit}
          accentColor="#10b981"
        />
      </div>

      {/* Cards de estatísticas - Grid 4 colunas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        width: '100%',
        maxWidth: 1100,
      }}>
        <StatCard
          value={val(dashboard?.inside_count ?? dashboard?.people_inside)}
          label="Na câmara agora"
          color="#10b981"
          icon={<UsersIcon />}
        />

        <StatCard
          value={val(dashboard?.entries_today ?? dashboard?.today?.total)}
          label="Acessos hoje"
          color="#3b82f6"
          icon={<ChartBarIcon />}
        />

        <StatCard
          value={val(dashboard?.open_alerts ?? dashboard?.alerts_open)}
          label="Acima do limite"
          color="#ef4444"
          icon={<ExclamationTriangleIcon />}
        />

        <StatCard
          value={sysConfig.dailyLimitMin ? `-${Math.round((sysConfig.dailyLimitMin / 60) * 10) / 10}°C` : '—'}
          label="Temperatura atual"
          color="#64748b"
          icon={<FireIcon />}
        />
      </div>

    </div>
  );
}

// ─── Componentes auxiliares ──────────────────────────────────────────────────

interface OperationCardProps {
  icon: React.ReactElement;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
  onClick: () => void;
  accentColor?: string;
}

function OperationCard({
  icon,
  title,
  description,
  badge,
  badgeColor,
  onClick,
  accentColor = '#3b82f6'
}: OperationCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#ffffff',
        border: `2px solid ${hovered ? accentColor : '#e2e8f0'}`,
        borderRadius: 10,
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 4,
        cursor: 'pointer',
        transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        textAlign: 'left',
        boxShadow: hovered
          ? `0 6px 12px -4px ${accentColor}40, 0 0 0 1px ${accentColor}20`
          : '0 1px 4px rgba(0, 0, 0, 0.04)',
        transform: hovered ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
        position: 'relative',
      }}
    >
      {/* Ícone */}
      <div style={{
        width: 36,
        height: 36,
        background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}08)`,
        borderRadius: 7,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: accentColor,
      }}>
        {React.cloneElement(icon, { 
          //@ts-ignore
          style: { width: 18, height: 18, strokeWidth: 2.5 } 
        })}
      </div>

      {/* Título */}
      <h3 style={{
        fontFamily: 'var(--font-head)',
        fontSize: '0.9rem',
        fontWeight: 700,
        color: '#1e293b',
        margin: 0,
        lineHeight: 1.2,
      }}>
        {title}
      </h3>

      {/* Descrição */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.7rem',
        color: '#64748b',
        margin: 0,
        lineHeight: 1.25,
        flex: 1,
      }}>
        {description}
      </p>

      {/* Badge */}
      <div style={{
        background: `${badgeColor}15`,
        color: badgeColor,
        padding: '2px 7px',
        borderRadius: 4,
        fontFamily: 'var(--font-head)',
        fontSize: '0.6rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
      }}>
        {badge}
      </div>

      {/* Seta indicativa */}
      <div style={{
        position: 'absolute',
        top: 12,
        right: 12,
        fontSize: '0.9rem',
        color: accentColor,
        opacity: hovered ? 1 : 0.3,
        transition: 'opacity 250ms ease',
      }}>
        →
      </div>
    </button>
  );
}

interface StatCardProps {
  value: string | number;
  label: string;
  color: string;
  icon: React.ReactElement;
}

function StatCard({ value, label, color, icon }: StatCardProps) {
  return (
    <div style={{
      background: '#ffffff',
      border: '2px solid #f1f5f9',
      borderRadius: 10,
      padding: '14px 12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
    }}>
      {/* Valor */}
      <div style={{
        fontFamily: 'var(--font-head)',
        fontSize: '2rem',
        fontWeight: 900,
        color: '#1e293b',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        {value}
      </div>

      {/* Label com ícone */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
      }}>
        <span style={{ color, display: 'flex' }}>
          {React.cloneElement(icon, {
            //@ts-ignore 
            style: { width: 14, height: 14, strokeWidth: 2.5 }
          })}
        </span>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.75rem',
          color: '#64748b',
          textAlign: 'center',
        }}>
          {label}
        </span>
      </div>

      {/* Indicador de cor */}
      <div style={{
        width: 32,
        height: 2.5,
        background: color,
        borderRadius: 2,
        marginTop: 2,
      }} />
    </div>
  );
}