// src/components/EpiBodyFigure/index.tsx
import {
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/solid'
import {
  ShieldCheckIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline'

import peopleImg    from '../../assets/images/api/people.png'
import headImg      from '../../assets/images/api/head.png'
import handLeftImg  from '../../assets/images/api/hand_left.png'
import handRightImg from '../../assets/images/api/hand_right.png'
import bootsImg     from '../../assets/images/api/boots.png'
//@ts-ignore
interface EpiStatus {
  helmet:        boolean
  gloves:        boolean
  boots:         boolean
  thermal_coat:  boolean
  thermal_pants: boolean
}

interface EpiBodyFigureProps {
  detected:    string[]
  missing:     string[]
  size?:       'sm' | 'md' | 'lg'
  showLabels?: boolean
}

const SIZE_MAP = {
  sm: { w: 100, h: 190 },
  md: { w: 140, h: 260 },
  lg: { w: 180, h: 340 },
}

const STATUS_COLORS = {
  ok:      '#10B981',
  missing: '#EF4444',
  unknown: '#374151',
}

function StatusBadge({ ok, label }: { ok: boolean | null; label: string }) {
  const color = ok === null ? STATUS_COLORS.unknown : ok ? STATUS_COLORS.ok : STATUS_COLORS.missing
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
      background: `${color}18`, border: `1px solid ${color}44`,
      borderRadius: 6, fontSize: 11, color, fontFamily: 'monospace',
      whiteSpace: 'nowrap', transition: 'all .3s',
    }}>
      {ok === null
        ? <ClockIcon style={{ width: 12, height: 12 }} />
        : ok
        ? <CheckIcon style={{ width: 12, height: 12 }} />
        : <XMarkIcon style={{ width: 12, height: 12 }} />
      }
      {label}
    </div>
  )
}

function DotIndicator({ ok }: { ok: boolean | null }) {
  const bg = ok === null ? '#374151' : ok ? '#10B981' : '#EF4444'
  const shadow = ok === false ? '0 0 8px rgba(239,68,68,0.6)' : ok === true ? '0 0 6px rgba(16,185,129,0.5)' : ''
  return (
    <div style={{
      width: 20, height: 20, borderRadius: '50%', background: bg,
      border: '2px solid rgba(0,0,0,0.3)', boxShadow: shadow,
      animation: ok === false ? 'pulse 1.2s ease-in-out infinite' : '',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all .3s',
    }}>
      {ok === null
        ? <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#9CA3AF' }} />
        : ok
        ? <CheckIcon style={{ width: 11, height: 11, color: '#fff' }} />
        : <ExclamationCircleIcon style={{ width: 13, height: 13, color: '#fff' }} />
      }
    </div>
  )
}

export default function EpiBodyFigure({
  detected, missing, size = 'md', showLabels = true,
}: EpiBodyFigureProps) {
  const { w, h } = SIZE_MAP[size]
  const det = detected ?? []
  const mis = missing  ?? []
  

  // const getStatus = (key: keyof EpiStatus): boolean | null => {
  //   if (det.length === 0 && mis.length === 0) return null
  //   return status[key]
  // }

    const EPI_KEYS = ['helmet', 'gloves', 'boots', 'thermal_coat', 'thermal_pants']
  const hasInfo  = mis.length > 0 || det.some(d => EPI_KEYS.includes(d))


  const getStatus = (key: string): boolean | null => {
    if (!hasInfo) return null          // ⏳ ainda sem dados
    return !mis.includes(key)          // true = OK, false = faltando
  }

  const helmetOk = getStatus('helmet')
  const glovesOk = getStatus('gloves')
  const bootsOk  = getStatus('boots')
  const coatOk   = getStatus('thermal_coat')
  const pantsOk  = getStatus('thermal_pants')

  const allOk     = hasInfo && [helmetOk, glovesOk, bootsOk, coatOk, pantsOk].every(s => s === true)
  const anyMissing = [helmetOk, glovesOk, bootsOk, coatOk, pantsOk].some(s => s === false)


  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>

      {/* Status geral */}
      {(allOk || anyMissing) && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 20,
          background: allOk ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${allOk ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          fontSize: 11, fontWeight: 600, fontFamily: 'monospace',
          color: allOk ? '#10B981' : '#EF4444',
        }}>
          {allOk
            ? <ShieldCheckIcon style={{ width: 14, height: 14 }} />
            : <ShieldExclamationIcon style={{ width: 14, height: 14 }} />
          }
          {allOk ? 'COMPLETO' : 'INCOMPLETO'}
        </div>
      )}

      {/* Boneco */}
      <div style={{ position: 'relative', width: w, height: h, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 8 }}>
        <img src={peopleImg} alt="Operador" style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 0 }} />

        {helmetOk === false && (
          <img src={headImg} alt="capacete faltando" style={{ position: 'absolute', top: '6%', left: '48%', transform: 'translateX(-50%)', width: '30%', opacity: 0.9, zIndex: 2, filter: 'drop-shadow(0 0 6px rgba(252,56,56,0.8))', animation: 'blink 1.2s ease-in-out infinite' }} />
        )}
        {glovesOk === false && (
          <>
            <img src={handLeftImg} alt="luva esq" style={{ position: 'absolute', top: '48%', right: '9%', width: '19%', opacity: 0.9, zIndex: 2, filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.8))', animation: 'blink 1.2s ease-in-out infinite' }} />
            <img src={handRightImg} alt="luva dir" style={{ position: 'absolute', top: '48%', left: '9%', width: '19%', opacity: 0.9, zIndex: 2, filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.8))', animation: 'blink 1.2s ease-in-out infinite' }} />
          </>
        )}
        {bootsOk === false && (
          <img src={bootsImg} alt="botas faltando" style={{ position: 'absolute', bottom: '7%', left: '49%', transform: 'translateX(-50%)', width: '60%', opacity: 0.9, zIndex: 2, filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.8))', animation: 'blink 1.2s ease-in-out infinite' }} />
        )}

        {/* Indicadores */}
        <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}><DotIndicator ok={helmetOk} /></div>
        <div style={{ position: 'absolute', top: '30%', right: -14 }}><DotIndicator ok={coatOk} /></div>
        <div style={{ position: 'absolute', top: '60%', left: -14 }}><DotIndicator ok={pantsOk} /></div>
        <div style={{ position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)' }}><DotIndicator ok={bootsOk} /></div>
        <div style={{ position: 'absolute', top: '50%', right: -14 }}><DotIndicator ok={glovesOk} /></div>

        <style>{`
          @keyframes blink { 0%,100%{opacity:.4} 50%{opacity:1} }
          @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
        `}</style>
      </div>

      {/* Labels */}
      {showLabels && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
          <StatusBadge ok={helmetOk} label="Capacete" />
          <StatusBadge ok={coatOk}   label="Jaleco Térmico" />
          <StatusBadge ok={pantsOk}  label="Calça Térmica" />
          <StatusBadge ok={glovesOk} label="Luvas" />
          <StatusBadge ok={bootsOk}  label="Botas" />
        </div>
      )}
    </div>
  )
}