// src/pages/EpiCameraStation.tsx
// ─────────────────────────────────────────────────────────────────────────────
// TOTEM KIOSK — EPI Check + Facial — Modo tablet/portaria
//
// Comportamento totalmente automático:
//   1. Câmera liga ao montar o componente
//   2. Fica em IDLE mostrando o feed ao vivo
//   3. Quando detecta "person" → inicia scan via WebSocket automaticamente
//   4. Após decisão → mostra resultado por 5s → volta ao IDLE
//   5. Loop infinito, zero interação
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback } from 'react'

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API_BASE   = sessionStorage.getItem('apiEndpoint') ?? 'https://aihub.smartxhub.cloud'
const WS_BASE    = API_BASE.replace(/^http/, 'ws')
const COMPANY_ID = 1

const CFG = {
  window_seconds:            9,
  fps:                       15,
  confidence:                0.35,
  face_threshold:            0.45,
  detect_faces:              true,
  result_show_ms:            5000,
  idle_check_interval_ms:    1500,  // frequência da detecção de presença no idle
  person_trigger_confidence: 0.3,
}

// ─── TYPES ───────────────────────────────────────────────────────────────────
type Phase = 'idle' | 'scanning' | 'granted' | 'denied_epi' | 'denied_face'

interface Detection {
  class_name: string
  confidence: number
  bbox: { x: number; y: number; w: number; h: number }
}

interface FrameResult {
  compliant: boolean
  missing: string[]
  detections: Detection[]
  face_detected: boolean
  face_recognized: boolean
  face_person_code?: string
  face_person_name?: string
  face_confidence: number
  window_progress: number
  session_compliant_rate: number
}

interface Decision {
  access_decision: 'GRANTED' | 'DENIED_EPI' | 'DENIED_FACE'
  compliance_rate: number
  face_rate: number
  person_code?: string
  person_name?: string
  total_frames: number
}

// ─── EPI META ─────────────────────────────────────────────────────────────────
const EPI_LABEL: Record<string, string> = {
  helmet: 'Capacete', boots: 'Botas', gloves: 'Luvas',
  thermal_coat: 'Jaleco Térmico', thermal_pants: 'Calça Térmica',
}
const EPI_ICON: Record<string, string> = {
  helmet: '⛑️', boots: '🥾', gloves: '🧤', thermal_coat: '🧥', thermal_pants: '👖',
}
const EPI_COLOR: Record<string, string> = {
  helmet: '#F59E0B', boots: '#8B5CF6', gloves: '#06B6D4',
  thermal_coat: '#10B981', thermal_pants: '#3B82F6',
}
const ALL_EPIS = ['helmet', 'thermal_coat', 'thermal_pants', 'gloves', 'boots']

// ─── HOOK PRINCIPAL ───────────────────────────────────────────────────────────
function useKioskStream() {
  const videoRef   = useRef<HTMLVideoElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const wsRef      = useRef<WebSocket | null>(null)
  const wsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const idleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)
  const phaseRef   = useRef<Phase>('idle')

  const [phase, setPhaseState]    = useState<Phase>('idle')
  const [lastFrame, setLastFrame] = useState<FrameResult | null>(null)
  const [decision, setDecision]   = useState<Decision | null>(null)
  const [camReady, setCamReady]   = useState(false)
  const [camError, setCamError]   = useState('')

  const setPhase = useCallback((p: Phase) => {
    phaseRef.current = p
    setPhaseState(p)
  }, [])

  // ── Captura um frame do vídeo para blob ───────────────────────────────────
  const captureFrame = useCallback((quality = 0.8): Promise<Blob | null> => {
    return new Promise(resolve => {
      const video  = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState < 2) return resolve(null)
      canvas.width  = video.videoWidth  || 640
      canvas.height = video.videoHeight || 360
      canvas.getContext('2d')!.drawImage(video, 0, 0)
      canvas.toBlob(resolve, 'image/jpeg', quality)
    })
  }, [])

  // ── Fecha WebSocket de scan ───────────────────────────────────────────────
  const closeScan = useCallback(() => {
    if (wsTimerRef.current) { clearInterval(wsTimerRef.current); wsTimerRef.current = null }
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
  }, [])

  // ── Volta ao IDLE ─────────────────────────────────────────────────────────
  const goIdle = useCallback(() => {
    closeScan()
    setPhase('idle')
    setLastFrame(null)
    setDecision(null)
  }, [closeScan, setPhase])

  // ── Abre WebSocket de scan ────────────────────────────────────────────────
  const openScan = useCallback(() => {
    if (!mountedRef.current || phaseRef.current === 'scanning') return
    closeScan()
    setPhase('scanning')
    setLastFrame(null)

    const params = new URLSearchParams({
      company_id:     String(COMPANY_ID),
      window_seconds: String(CFG.window_seconds),
      fps:            String(CFG.fps),
      confidence:     String(CFG.confidence),
      face_threshold: String(CFG.face_threshold),
      detect_faces:   String(CFG.detect_faces),
    })
    const ws = new WebSocket(`${WS_BASE}/api/v1/epi/ws/epi-stream?${params}`)
    wsRef.current = ws

    ws.onmessage = (ev) => {
      if (!mountedRef.current) return
      try {
        const msg = JSON.parse(ev.data as string)

        if (msg.type === 'frame_result') {
          setLastFrame(msg as FrameResult)
        }

        if (msg.type === 'decision') {
          const d = msg as Decision
          closeScan()
          setDecision(d)
          const p: Phase = d.access_decision === 'GRANTED' ? 'granted'
            : d.access_decision === 'DENIED_EPI' ? 'denied_epi' : 'denied_face'
          setPhase(p)
          // Volta ao idle após exibir resultado
          resultTimerRef.current = setTimeout(() => {
            if (mountedRef.current) goIdle()
          }, CFG.result_show_ms)
        }
      } catch {}
    }

    ws.onopen = () => {
      const interval = Math.round(1000 / CFG.fps)
      wsTimerRef.current = setInterval(async () => {
        if (ws.readyState !== WebSocket.OPEN) return
        const blob = await captureFrame(0.8)
        if (blob && ws.readyState === WebSocket.OPEN) ws.send(blob)
      }, interval)
    }

    ws.onclose = () => {
      if (wsTimerRef.current) { clearInterval(wsTimerRef.current); wsTimerRef.current = null }
    }
  }, [closeScan, setPhase, goIdle, captureFrame])

  // ── Loop de detecção de presença no IDLE ──────────────────────────────────
  const startIdleDetection = useCallback(() => {
    if (idleTimerRef.current) clearInterval(idleTimerRef.current)
    idleTimerRef.current = setInterval(async () => {
      if (!mountedRef.current || phaseRef.current !== 'idle') return
      const blob = await captureFrame(0.6)
      if (!blob) return
      try {
        const fd = new FormData()
        fd.append('file', blob, 'frame.jpg')
        fd.append('confidence', String(CFG.confidence))
        fd.append('detect_faces', 'false')
        const r = await fetch(
          `${API_BASE}/api/v1/epi/detect/frame?company_id=${COMPANY_ID}`,
          { method: 'POST', body: fd }
        )
        const data = await r.json()
        const dets: Detection[] = data.detections ?? []
        const hasPerson = dets.some(
          d => d.class_name === 'person' && d.confidence >= CFG.person_trigger_confidence
        )
        if (hasPerson && phaseRef.current === 'idle') openScan()
      } catch {}
    }, CFG.idle_check_interval_ms)
  }, [captureFrame, openScan])

  // ── Inicia câmera ao montar ───────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true
    ;(async () => {
      try {
        const constraints: MediaStreamConstraints = {
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' },
          audio: false,
        }
        let stream: MediaStream
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints)
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        }
        if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return }
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setCamReady(true)
      } catch (e: unknown) {
        setCamError(e instanceof Error ? e.message : 'Erro ao acessar câmera')
      }
    })()
    return () => {
      mountedRef.current = false
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
      }
      closeScan()
      if (idleTimerRef.current) clearInterval(idleTimerRef.current)
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current)
    }
  }, [closeScan])

  // ── Inicia detecção de presença assim que câmera ficar pronta ─────────────
  useEffect(() => {
    if (!camReady) return
    startIdleDetection()
    return () => { if (idleTimerRef.current) clearInterval(idleTimerRef.current) }
  }, [camReady, startIdleDetection])

  return { videoRef, canvasRef, phase, lastFrame, decision, camReady, camError }
}

// ─── OVERLAY BOUNDING BOXES ───────────────────────────────────────────────────
function Overlay({ frame, vw, vh, ow, oh }: {
  frame: FrameResult | null; vw: number; vh: number; ow: number; oh: number
}) {
  if (!frame?.detections.length) return null
  const sx = ow / (vw || 1)
  const sy = oh / (vh || 1)
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {frame.detections.map((d, i) => {
        const { x, y, w, h } = d.bbox
        const c = EPI_COLOR[d.class_name] ?? (d.class_name === 'person' ? '#F43F5E' : '#fff')
        const label = `${EPI_ICON[d.class_name] ?? '👤'} ${EPI_LABEL[d.class_name] ?? d.class_name} ${Math.round(d.confidence * 100)}%`
        return (
          <g key={i}>
            <rect x={x*sx} y={y*sy} width={w*sx} height={h*sy} fill={`${c}18`} stroke={c} strokeWidth={2.5} rx={6} />
            <rect x={x*sx} y={Math.max(0, y*sy - 22)} width={label.length * 8 + 8} height={22} fill={c} rx={4} />
            <text x={x*sx + 5} y={Math.max(15, y*sy - 6)} fill="#fff" fontSize={12} fontFamily="monospace" fontWeight={700}>
              {label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── RESULTADO ────────────────────────────────────────────────────────────────
function ResultOverlay({ phase, decision }: { phase: Phase; decision: Decision | null }) {
  const granted   = phase === 'granted'
  const deniedEpi = phase === 'denied_epi'
  const color     = granted ? '#10B981' : '#EF4444'
  const icon      = granted ? '✅' : deniedEpi ? '⚠️' : '❌'
  const title     = granted ? 'ACESSO LIBERADO' : deniedEpi ? 'EPI INCOMPLETO' : 'FACE NÃO IDENTIFICADA'
  const bg        = granted ? 'rgba(6,78,59,0.96)' : 'rgba(69,10,10,0.96)'

  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: bg,
      backdropFilter: 'blur(8px)',
    }}>
      <style>{`
        @keyframes pop { 0%{transform:scale(.3);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>
      <div style={{ fontSize: 100, marginBottom: 20, filter: `drop-shadow(0 0 40px ${color})`, animation: 'pop .5s cubic-bezier(.34,1.56,.64,1)' }}>
        {icon}
      </div>
      <div style={{
        fontSize: 44, fontWeight: 900, color, letterSpacing: '-0.03em',
        marginBottom: 12, textAlign: 'center', textShadow: `0 0 30px ${color}88`,
        animation: 'slideUp .4s ease .1s both', fontFamily: "'DM Sans',system-ui,sans-serif",
      }}>
        {title}
      </div>
      {(decision?.person_name || decision?.person_code) && (
        <div style={{ fontSize: 22, color: '#E5E7EB', marginBottom: 24, animation: 'slideUp .4s ease .2s both' }}>
          👤 {decision.person_name ?? decision.person_code}
        </div>
      )}
      <div style={{ display: 'flex', gap: 16, animation: 'slideUp .4s ease .3s both' }}>
        {[
          { l: 'Conformidade', v: `${Math.round((decision?.compliance_rate ?? 0) * 100)}%` },
          { l: 'Face', v: `${Math.round((decision?.face_rate ?? 0) * 100)}%` },
          { l: 'Frames', v: String(decision?.total_frames ?? 0) },
        ].map(s => (
          <div key={s.l} style={{
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12, padding: '12px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace', textTransform: 'uppercase' }}>{s.l}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#F9FAFB' }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── IDLE OVERLAY ─────────────────────────────────────────────────────────────
function IdleOverlay({ camError }: { camError: string }) {
  if (camError) return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: '#0A0F1A',
    }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📵</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: '#EF4444', marginBottom: 8 }}>Câmera indisponível</div>
      <div style={{ fontSize: 13, color: '#6B7280', fontFamily: 'monospace', maxWidth: 280, textAlign: 'center' }}>{camError}</div>
    </div>
  )
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      <style>{`@keyframes breathe{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}`}</style>
      <div style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)',
        padding: '48px 24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%', fontSize: 26,
          background: 'rgba(59,130,246,0.15)', border: '2px solid rgba(59,130,246,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'breathe 2.5s ease-in-out infinite',
        }}>📷</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#F9FAFB', letterSpacing: '-0.01em' }}>
            Posicione-se em frente à câmera
          </div>
          <div style={{ fontSize: 14, color: '#9CA3AF', marginTop: 2 }}>
            A verificação de EPI iniciará automaticamente
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── STATUS BAR ───────────────────────────────────────────────────────────────
function StatusBar({ phase, frame }: { phase: Phase; frame: FrameResult | null }) {
  const scanning  = phase === 'scanning'
  const progress  = frame?.window_progress ?? 0
  const rate      = frame?.session_compliant_rate ?? 0
  const rateColor = rate > 0.7 ? '#10B981' : rate > 0.4 ? '#F59E0B' : '#EF4444'

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <span style={{ fontSize: 20 }}>🛡️</span>
      <span style={{ fontWeight: 700, fontSize: 15, color: '#F9FAFB', flex: 1 }}>EPI Check Station</span>

      {scanning && (
        <>
          <div style={{ width: 100, height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3, transition: 'width .3s',
              background: `linear-gradient(90deg,#3B82F6,${rateColor})`,
              width: `${progress * 100}%`,
            }} />
          </div>
          <span style={{ fontSize: 12, fontFamily: 'monospace', color: rateColor, fontWeight: 700 }}>
            {Math.round(rate * 100)}%
          </span>
          {frame?.face_recognized && (
            <span style={{
              background: 'rgba(16,185,129,0.2)', color: '#10B981',
              border: '1px solid rgba(16,185,129,0.4)', borderRadius: 20,
              padding: '2px 10px', fontSize: 11, fontFamily: 'monospace',
            }}>✓ {frame.face_person_name ?? frame.face_person_code ?? 'OK'}</span>
          )}
        </>
      )}

      <span style={{
        background: scanning ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.12)',
        color: scanning ? '#F59E0B' : '#60A5FA',
        border: `1px solid ${scanning ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.25)'}`,
        borderRadius: 20, padding: '3px 12px', fontSize: 11, fontFamily: 'monospace',
      }}>
        {scanning ? '⚡ ESCANEANDO' : '👁️ AGUARDANDO'}
      </span>
    </div>
  )
}

// ─── SIDEBAR EPI ──────────────────────────────────────────────────────────────
function EpiSidebar({ frame }: { frame: FrameResult | null }) {
  const detected = frame?.detections.map(d => d.class_name) ?? []
  const missing  = frame?.missing ?? []

  return (
    <div style={{
      width: 210, background: 'rgba(10,15,26,0.88)', backdropFilter: 'blur(12px)',
      borderLeft: '1px solid rgba(255,255,255,0.07)', padding: '64px 12px 16px',
      display: 'flex', flexDirection: 'column', gap: 7,
    }}>
      <div style={{ fontSize: 10, color: '#6B7280', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.1em' }}>
        Status EPI
      </div>
      {ALL_EPIS.map(epi => {
        const ok   = detected.includes(epi)
        const miss = missing.includes(epi)
        const c    = ok ? '#10B981' : miss ? '#EF4444' : '#374151'
        return (
          <div key={epi} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
            background: `${c}12`, border: `1px solid ${c}40`, borderRadius: 8, transition: 'all .3s',
          }}>
            <span style={{ fontSize: 18 }}>{EPI_ICON[epi]}</span>
            <span style={{ flex: 1, fontSize: 12, color: ok ? '#86EFAC' : miss ? '#FCA5A5' : '#6B7280', fontWeight: 500 }}>
              {EPI_LABEL[epi]}
            </span>
            <span>{ok ? '✅' : miss ? '❌' : '⏳'}</span>
          </div>
        )
      })}

      {/* Face card */}
      <div style={{
        marginTop: 6, padding: '10px 12px',
        background: frame?.face_recognized ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${frame?.face_recognized ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 10, textAlign: 'center', transition: 'all .3s',
      }}>
        <div style={{ fontSize: 24, marginBottom: 4 }}>
          {frame?.face_recognized ? '✅' : frame?.face_detected ? '👁️' : '👤'}
        </div>
        <div style={{ fontSize: 11, color: frame?.face_recognized ? '#86EFAC' : '#6B7280', fontFamily: 'monospace' }}>
          {frame?.face_recognized
            ? (frame.face_person_name ?? frame.face_person_code ?? 'Identificado')
            : frame?.face_detected ? 'Identificando...' : 'Sem face'}
        </div>
        {frame?.face_recognized && (
          <div style={{ fontSize: 10, color: '#10B981', fontFamily: 'monospace', marginTop: 2 }}>
            {Math.round((frame.face_confidence ?? 0) * 100)}% conf.
          </div>
        )}
      </div>

      {/* Compliance rate */}
      <div style={{
        marginTop: 4, padding: '10px', textAlign: 'center',
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10,
      }}>
        <div style={{ fontSize: 10, color: '#6B7280', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 2 }}>
          Conformidade
        </div>
        <div style={{
          fontSize: 32, fontWeight: 800,
          color: (frame?.session_compliant_rate ?? 0) > 0.7 ? '#10B981'
            : (frame?.session_compliant_rate ?? 0) > 0.4 ? '#F59E0B' : '#EF4444',
        }}>
          {Math.round((frame?.session_compliant_rate ?? 0) * 100)}%
        </div>
      </div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function EpiCameraStation() {
  const { videoRef, canvasRef, phase, lastFrame, decision, camReady, camError } = useKioskStream()
  const containerRef = useRef<HTMLDivElement>(null)
  const [vSize, setVSize] = useState({ w: 1280, h: 720 })
  const [oSize, setOSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const h = () => setVSize({ w: v.videoWidth, h: v.videoHeight })
    v.addEventListener('loadedmetadata', h)
    return () => v.removeEventListener('loadedmetadata', h)
  }, [videoRef])

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setOSize({ w: e.contentRect.width, h: e.contentRect.height })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const scanning    = phase === 'scanning'
  const showResult  = phase !== 'idle' && phase !== 'scanning'

  return (
    <div style={{
      width: '100%', height: '100vh', background: '#000',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      userSelect: 'none',   // kiosk: sem seleção de texto
      WebkitUserSelect: 'none',
    }}>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Câmera + Overlays ── */}
        <div ref={containerRef} style={{ flex: 1, position: 'relative', background: '#111', overflow: 'hidden' }}>
          <video
            ref={videoRef}
            autoPlay playsInline muted
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              opacity: camReady ? 1 : 0, transition: 'opacity .5s',
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Bounding boxes */}
          {(scanning || phase === 'idle') && camReady && (
            <Overlay frame={lastFrame} vw={vSize.w} vh={vSize.h} ow={oSize.w} oh={oSize.h} />
          )}

          {/* Overlay IDLE */}
          {phase === 'idle' && <IdleOverlay camError={camError} />}

          {/* Overlay Resultado */}
          {showResult && <ResultOverlay phase={phase} decision={decision} />}

          {/* Status bar (sempre visível) */}
          {camReady && <StatusBar phase={phase} frame={lastFrame} />}

          {/* Barra de progresso inferior */}
          {scanning && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 5, background: 'rgba(0,0,0,0.4)' }}>
              <div style={{
                height: '100%',
                background: `linear-gradient(90deg, #3B82F6, ${(lastFrame?.session_compliant_rate ?? 0) > 0.5 ? '#10B981' : '#EF4444'})`,
                width: `${(lastFrame?.window_progress ?? 0) * 100}%`,
                transition: 'width .3s',
              }} />
            </div>
          )}
        </div>

        {/* ── Sidebar de status EPI (só durante scan) ── */}
        {scanning && <EpiSidebar frame={lastFrame} />}
      </div>
    </div>
  )
}