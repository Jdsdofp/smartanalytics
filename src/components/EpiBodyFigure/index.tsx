// src/components/EpiBodyFigure/index.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Boneco visual de EPI usando as imagens do poc-swift
// Mostra o corpo completo com overlays nos EPIs faltando
// ─────────────────────────────────────────────────────────────────────────────

import peopleImg    from '../../assets/images/api/people.png'
import headImg      from '../../assets/images/api/head.png'
import handLeftImg  from '../../assets/images/api/hand_left.png'
import handRightImg from '../../assets/images/api/hand_right.png'
import bootsImg     from '../../assets/images/api/boots.png'

interface EpiStatus {
  helmet:        boolean  // head / balaclava
  gloves:        boolean  // ambas as luvas
  boots:         boolean
  thermal_coat:  boolean  // uniforme/jaleco
  thermal_pants: boolean  // calça térmica
}

interface EpiBodyFigureProps {
  detected:  string[]   // ex: ['helmet', 'gloves', 'boots']
  missing:   string[]   // ex: ['thermal_coat', 'thermal_pants']
  size?:     'sm' | 'md' | 'lg'
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
  const icon  = ok === null ? '⏳' : ok ? '✅' : '❌'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px',
      background: `${color}18`, border: `1px solid ${color}44`,
      borderRadius: 6, fontSize: 11, color,
      fontFamily: 'monospace', whiteSpace: 'nowrap',
      transition: 'all .3s',
    }}>
      <span style={{ fontSize: 12 }}>{icon}</span>
      {label}
    </div>
  )
}

export default function EpiBodyFigure({
  detected,
  missing,
  size = 'md',
  showLabels = true,
}: EpiBodyFigureProps) {
  const { w, h } = SIZE_MAP[size]

  // Garante arrays mesmo se vier undefined
  const det = detected ?? []
  const mis = missing  ?? []

  const status: EpiStatus = {
    helmet:        det.includes('helmet')        && !mis.includes('helmet'),
    gloves:        det.includes('gloves')        && !mis.includes('gloves'),
    boots:         det.includes('boots')         && !mis.includes('boots'),
    thermal_coat:  det.includes('thermal_coat')  && !mis.includes('thermal_coat'),
    thermal_pants: det.includes('thermal_pants') && !mis.includes('thermal_pants'),
  }

  // null = não sabemos ainda, true = ok, false = faltando
  const getStatus = (key: keyof EpiStatus): boolean | null => {
    if (det.length === 0 && mis.length === 0) return null
    return status[key]
  }

  const helmetOk       = getStatus('helmet')
  const glovesOk       = getStatus('gloves')
  const bootsOk        = getStatus('boots')
  const coatOk         = getStatus('thermal_coat')
  const pantsOk        = getStatus('thermal_pants')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {/* ── Boneco ── */}
      <div style={{
        position: 'relative', width: w, height: h,
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 12, padding: 8,
      }}>
        {/* Corpo base */}
        <img
          src={peopleImg}
          alt="Operador"
          style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 0 }}
        />

        {/* ── Overlays dos EPIs FALTANDO ── */}

        {/* Capacete/Balaclava */}
        {helmetOk === false && (
          <img src={headImg} alt="capacete faltando"
            style={{ position: 'absolute', top: '2%', left: '50%', transform: 'translateX(-50%)', width: '40%', opacity: 0.9, zIndex: 2,
              filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.8))', animation: 'blink 1.2s ease-in-out infinite' }} />
        )}

        {/* Luva esquerda */}
        {glovesOk === false && (
          <img src={handLeftImg} alt="luva esq faltando"
            style={{ position: 'absolute', top: '47%', right: '6%', width: '22%', opacity: 0.9, zIndex: 2,
              filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.8))', animation: 'blink 1.2s ease-in-out infinite' }} />
        )}

        {/* Luva direita */}
        {glovesOk === false && (
          <img src={handRightImg} alt="luva dir faltando"
            style={{ position: 'absolute', top: '47%', left: '6%', width: '22%', opacity: 0.9, zIndex: 2,
              filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.8))', animation: 'blink 1.2s ease-in-out infinite' }} />
        )}

        {/* Botas */}
        {bootsOk === false && (
          <img src={bootsImg} alt="botas faltando"
            style={{ position: 'absolute', bottom: '2%', left: '50%', transform: 'translateX(-50%)', width: '60%', opacity: 0.9, zIndex: 2,
              filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.8))', animation: 'blink 1.2s ease-in-out infinite' }} />
        )}

        {/* ── Indicadores ao redor ── */}

        {/* Capacete — topo */}
        <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: helmetOk === null ? '#374151' : helmetOk ? '#10B981' : '#EF4444',
            border: '2px solid rgba(0,0,0,0.3)',
            boxShadow: helmetOk === false ? '0 0 8px rgba(239,68,68,0.6)' : '',
            animation: helmetOk === false ? 'pulse 1.2s ease-in-out infinite' : '',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, transition: 'all .3s',
          }}>
            {helmetOk === null ? '·' : helmetOk ? '✓' : '!'}
          </div>
        </div>

        {/* Jaleco — direita */}
        <div style={{ position: 'absolute', top: '30%', right: -14 }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: coatOk === null ? '#374151' : coatOk ? '#10B981' : '#EF4444',
            border: '2px solid rgba(0,0,0,0.3)',
            boxShadow: coatOk === false ? '0 0 8px rgba(239,68,68,0.6)' : '',
            animation: coatOk === false ? 'pulse 1.2s ease-in-out infinite' : '',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, transition: 'all .3s',
          }}>
            {coatOk === null ? '·' : coatOk ? '✓' : '!'}
          </div>
        </div>

        {/* Calça — esquerda */}
        <div style={{ position: 'absolute', top: '60%', left: -14 }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: pantsOk === null ? '#374151' : pantsOk ? '#10B981' : '#EF4444',
            border: '2px solid rgba(0,0,0,0.3)',
            boxShadow: pantsOk === false ? '0 0 8px rgba(239,68,68,0.6)' : '',
            animation: pantsOk === false ? 'pulse 1.2s ease-in-out infinite' : '',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, transition: 'all .3s',
          }}>
            {pantsOk === null ? '·' : pantsOk ? '✓' : '!'}
          </div>
        </div>

        {/* Botas — base */}
        <div style={{ position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: bootsOk === null ? '#374151' : bootsOk ? '#10B981' : '#EF4444',
            border: '2px solid rgba(0,0,0,0.3)',
            boxShadow: bootsOk === false ? '0 0 8px rgba(239,68,68,0.6)' : '',
            animation: bootsOk === false ? 'pulse 1.2s ease-in-out infinite' : '',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, transition: 'all .3s',
          }}>
            {bootsOk === null ? '·' : bootsOk ? '✓' : '!'}
          </div>
        </div>

        {/* Luvas — lado */}
        <div style={{ position: 'absolute', top: '50%', right: -14 }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: glovesOk === null ? '#374151' : glovesOk ? '#10B981' : '#EF4444',
            border: '2px solid rgba(0,0,0,0.3)',
            boxShadow: glovesOk === false ? '0 0 8px rgba(239,68,68,0.6)' : '',
            animation: glovesOk === false ? 'pulse 1.2s ease-in-out infinite' : '',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, transition: 'all .3s',
          }}>
            {glovesOk === null ? '·' : glovesOk ? '✓' : '!'}
          </div>
        </div>

        <style>{`
          @keyframes blink { 0%,100%{opacity:.4} 50%{opacity:1} }
          @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
        `}</style>
      </div>

      {/* ── Labels de status ── */}
      {showLabels && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
          <StatusBadge ok={helmetOk}  label="Capacete" />
          <StatusBadge ok={coatOk}    label="Jaleco Térmico" />
          <StatusBadge ok={pantsOk}   label="Calça Térmica" />
          <StatusBadge ok={glovesOk}  label="Luvas" />
          <StatusBadge ok={bootsOk}   label="Botas" />
        </div>
      )}
    </div>
  )
}