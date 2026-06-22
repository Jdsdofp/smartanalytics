// src/pages/EpiCameraStation.tsx  — v4.0
// ─────────────────────────────────────────────────────────────────────────────
// v4.0:
//   1. Inicialização por API Key — chama /station/init para validar token
//   2. Tela de setup quando sem token configurado
//   3. Tema dinâmico da empresa (cores + logo) via xfinderdb
//   4. company_id e api_key passados em todas as chamadas Vision
//   5. Mantém toda lógica v3.0: face_scan → preparing → epi_scan
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  ShieldCheckIcon, ShieldExclamationIcon, CheckCircleIcon, XCircleIcon,
  UserIcon, BoltIcon, EyeIcon, FaceSmileIcon, ArrowPathIcon,
  Cog6ToothIcon, LockClosedIcon, SignalIcon,
  ArrowRightOnRectangleIcon, ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/24/solid'
import { useTabletLayout } from '../hooks/useTabletLayout'
import EpiBodyFigure from '../components/EpiBodyFigure'

// ─── TIPOS ───────────────────────────────────────────────────────────────────
type Direction = 'ENTRY' | 'EXIT'
type CamSource = 'usb' | 'ip'
type Phase = 'idle' | 'scanning' | 'granted' | 'denied_epi' | 'denied_face'
type ScanSubPhase = 'face_scan' | 'preparing' | 'epi_scan'
interface StationConfig {
  companyId: number
  apiKey: string
  apiBase: string
  lockIp: string
  lockMs: number
  doorId: string
  zoneId: string
  camSource: CamSource
  camDeviceId: string
  camIpUrl: string
  faceScanSeconds: number
  epiScanSeconds: number
  prepareSeconds: number
}

interface StationTheme {
  colorPrimary: string
  colorPrimaryDark: string
  colorAccent: string
  colorFontTitle: string
  colorMenuBackground: string
  colorHeaderBg: string
  logoUrl: string | null
}

interface StationCompany {
  company_id: number
  full_name: string
  lang: string
  time_zone: string
  logo: string | null
}

interface Detection {
  class_name: string
  confidence: number
  bbox: { x: number; y: number; w: number; h: number }
}
interface FrameResult {
  compliant: boolean; missing: string[]; detections: Detection[]
  face_detected: boolean; face_recognized: boolean
  face_person_code?: string; face_person_name?: string
  face_confidence: number; window_progress: number; session_compliant_rate: number
}
interface Decision {
  access_decision: 'GRANTED' | 'DENIED_EPI' | 'DENIED_FACE'
  compliance_rate: number; face_rate: number
  person_code?: string; person_name?: string; total_frames: number
}

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const CONFIG_KEY = 'epi_station_config_v4'

function defaultConfig(): StationConfig {
  const company = JSON.parse(sessionStorage.getItem('companyData') || '{}')
  const companyId = company?.details?.company_id ?? company?.id ?? 1
  return {
    companyId,
    apiKey: localStorage.getItem('epi_station_api_key') ?? '',
    apiBase: sessionStorage.getItem('apiEndpoint') ?? 'https://aihub.smartxhub.cloud',
    lockIp: sessionStorage.getItem('lockIp') ?? '192.168.68.100',
    lockMs: 5000,
    doorId: 'DOOR_CAMARA_FRIA_01',
    zoneId: '10',
    camSource: 'usb',
    camDeviceId: '',
    camIpUrl: '',
    faceScanSeconds: 8,
    epiScanSeconds: 20,
    prepareSeconds: 10,
  }
}

function loadConfig(): StationConfig {
  try {
    const s = localStorage.getItem(CONFIG_KEY)
    if (s) return { ...defaultConfig(), ...JSON.parse(s) }
  } catch { }
  return defaultConfig()
}

function saveConfig(cfg: StationConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg))
  localStorage.setItem('epi_station_api_key', cfg.apiKey)
  sessionStorage.setItem('lockIp', cfg.lockIp)
  sessionStorage.setItem('apiEndpoint', cfg.apiBase)
}

const DEFAULT_THEME: StationTheme = {
  colorPrimary: '#3B82F6',
  colorPrimaryDark: '#1D4ED8',
  colorAccent: '#06B6D4',
  colorFontTitle: '#FFFFFF',
  colorMenuBackground: '#1E293B',
  colorHeaderBg: '#0F172A',
  logoUrl: null,
}

const EPI_COLOR: Record<string, string> = {
  helmet: '#F59E0B', boots: '#8B5CF6', gloves: '#06B6D4',
  thermal_coat: '#10B981', thermal_pants: '#3B82F6', person: '#F43F5E',
}
const EPI_LABEL: Record<string, string> = {
  helmet: 'Capacete', boots: 'Botas', gloves: 'Luvas',
  thermal_coat: 'Jaleco Térmico', thermal_pants: 'Calça Térmica', person: 'Pessoa',
}

const CFG = {
  window_seconds: 20, fps: 15, confidence: 0.35,
  face_threshold: 0.45, detect_faces: true,
  result_show_ms: 5000, idle_check_interval_ms: 1500,
  person_trigger_confidence: 0.3,
  face_scan_seconds: 8, prepare_seconds: 10,
}

// ─── HOOK: câmera ────────────────────────────────────────────────────────────
function useCameraStream(cfg: StationConfig) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
      .then(d => setDevices(d.filter(x => x.kind === 'videoinput')))
      .catch(() => { })
  }, [])

  useEffect(() => {
    let active = true
    setReady(false); setError('')
    const start = async () => {
      try {
        if (cfg.camSource === 'ip' && cfg.camIpUrl) {
          if (videoRef.current) {
            videoRef.current.srcObject = null
            videoRef.current.src = cfg.camIpUrl
            await videoRef.current.play()
            if (active) setReady(true)
          }
        } else {
          const constraints: MediaStreamConstraints = {
            video: cfg.camDeviceId
              ? { deviceId: { exact: cfg.camDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
              : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' },
            audio: false,
          }
          let stream: MediaStream
          try { stream = await navigator.mediaDevices.getUserMedia(constraints) }
          catch { stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }) }
          if (!active) { stream.getTracks().forEach(t => t.stop()); return }
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            await videoRef.current.play()
            setReady(true)
          }
        }
      } catch (e: unknown) {
        if (active) setError(e instanceof Error ? e.message : 'Erro ao acessar câmera')
      }
    }
    start()
    return () => {
      active = false
      if (videoRef.current?.srcObject)
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
      if (videoRef.current) videoRef.current.src = ''
    }
  }, [cfg.camSource, cfg.camDeviceId, cfg.camIpUrl])

  const captureFrame = useCallback((quality = 0.8): Promise<Blob | null> => {
    return new Promise(resolve => {
      const video = videoRef.current; const canvas = canvasRef.current
      if (!video || !canvas || video.readyState < 2) return resolve(null)
      canvas.width = video.videoWidth || 640; canvas.height = video.videoHeight || 360
      canvas.getContext('2d')!.drawImage(video, 0, 0)
      canvas.toBlob(resolve, 'image/jpeg', quality)
    })
  }, [])

  return { videoRef, canvasRef, ready, error, devices, captureFrame }
}

// ─── HOOK: lógica de scan ─────────────────────────────────────────────────────
function useKioskLogic(
  stationCfg: StationConfig,
  captureFrame: (q?: number) => Promise<Blob | null>,
  camReady: boolean,
) {
  const wsRef = useRef<WebSocket | null>(null)
  const wsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastMissingRef = useRef<string[]>([])
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const subPhaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const doorDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const doorCountdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mountedRef = useRef(true)
  const phaseRef = useRef<Phase>('idle')
  const subPhaseRef = useRef<ScanSubPhase>('face_scan')
  const faceIdentifiedRef = useRef(false)

  const [phase, setPhaseState] = useState<Phase>('idle')
  const [scanSubPhase, setScanSubPhase] = useState<ScanSubPhase>('face_scan')
  const [prepareCountdown, setPrepareCountdown] = useState(0)
  const [doorCountdown, setDoorCountdown] = useState(0)
  const [lastFrame, setLastFrame] = useState<FrameResult | null>(null)
  const [decision, setDecision] = useState<Decision | null>(null)
  const [direction, setDirection] = useState<Direction>('ENTRY')
  const [lastMissing, setLastMissing] = useState<string[]>([])

  const setPhase = useCallback((p: Phase) => { phaseRef.current = p; setPhaseState(p) }, [])
  const setSubPhase = useCallback((sp: ScanSubPhase) => { subPhaseRef.current = sp; setScanSubPhase(sp) }, [])

  const clearSubPhaseTimers = useCallback(() => {
    if (subPhaseTimerRef.current) { clearTimeout(subPhaseTimerRef.current); subPhaseTimerRef.current = null }
    if (countdownIntervalRef.current) { clearInterval(countdownIntervalRef.current); countdownIntervalRef.current = null }
  }, [])

  const clearDoorDelay = useCallback(() => {
    if (doorDelayTimerRef.current) { clearTimeout(doorDelayTimerRef.current); doorDelayTimerRef.current = null }
    if (doorCountdownIntervalRef.current) { clearInterval(doorCountdownIntervalRef.current); doorCountdownIntervalRef.current = null }
    setDoorCountdown(0)
  }, [])

  const closeScan = useCallback(() => {
    if (wsTimerRef.current) { clearInterval(wsTimerRef.current); wsTimerRef.current = null }
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
    clearSubPhaseTimers()
  }, [clearSubPhaseTimers])

  const goIdle = useCallback(() => {
    closeScan()
    clearDoorDelay()
    setPhase('idle'); setLastFrame(null); setDecision(null)
    setSubPhase('face_scan'); setPrepareCountdown(0)
    faceIdentifiedRef.current = false
  }, [closeScan, clearDoorDelay, setPhase, setSubPhase])

  const authHeaders = useCallback(() => {
    const h: Record<string, string> = {}
    if (stationCfg.apiKey) h['X-API-Key'] = stationCfg.apiKey
    return h
  }, [stationCfg.apiKey])
  //@ts-ignore
  const startDoorCountdown = useCallback((openFn: () => void) => {
    clearDoorDelay()
    console.log('[startDoorCountdown] chamando openFn, lockIp:', stationCfg.lockIp, 'lockMs:', stationCfg.lockMs)
    openFn()
    const secs = Math.ceil(stationCfg.lockMs / 1000)
    setDoorCountdown(secs)
    doorCountdownIntervalRef.current = setInterval(() => {
      setDoorCountdown(p => {
        if (p <= 1) { clearInterval(doorCountdownIntervalRef.current!); doorCountdownIntervalRef.current = null; return 0 }
        return p - 1
      })
    }, 1000)
  }, [clearDoorDelay, stationCfg.lockMs])

  const buildWsParams = useCallback(() => new URLSearchParams({
    company_id: String(stationCfg.companyId),
    window_seconds: String(stationCfg.epiScanSeconds),
    fps: String(CFG.fps),
    confidence: String(CFG.confidence),
    face_threshold: String(CFG.face_threshold),
    detect_faces: String(CFG.detect_faces),
    api_key: stationCfg.apiKey,
  }), [stationCfg])

  const startPreparing = useCallback((apiBase: string, onMsg: (ev: MessageEvent) => void) => {
    clearSubPhaseTimers()
    setSubPhase('preparing')
    setPrepareCountdown(stationCfg.prepareSeconds)
    countdownIntervalRef.current = setInterval(() => {
      setPrepareCountdown(p => {
        if (p <= 1) { clearInterval(countdownIntervalRef.current!); countdownIntervalRef.current = null; return 0 }
        return p - 1
      })
    }, 1000)
    subPhaseTimerRef.current = setTimeout(() => {
      if (!mountedRef.current || phaseRef.current !== 'scanning') return
      setSubPhase('epi_scan')
      if (wsTimerRef.current) { clearInterval(wsTimerRef.current); wsTimerRef.current = null }
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
      const wsBase2 = apiBase.replace(/^http/, 'ws')
      const ws2 = new WebSocket(`${wsBase2}/api/v1/epi/ws/epi-stream?${buildWsParams()}`)
      wsRef.current = ws2
      ws2.onmessage = onMsg
      ws2.onopen = () => {
        const iv2 = Math.round(1000 / CFG.fps)
        wsTimerRef.current = setInterval(async () => {
          if (ws2.readyState !== WebSocket.OPEN) return
          const blob = await captureFrame(0.8)
          if (blob && ws2.readyState === WebSocket.OPEN) ws2.send(blob)
        }, iv2)
      }
      ws2.onclose = () => { if (wsTimerRef.current) { clearInterval(wsTimerRef.current); wsTimerRef.current = null } }
    }, stationCfg.prepareSeconds * 1000)
  }, [clearSubPhaseTimers, setSubPhase, captureFrame, buildWsParams, stationCfg.prepareSeconds])

  // const triggerDoor = useCallback((d: Decision, dir: Direction) => {
  //   //@ts-ignore
  //   const { apiBase, doorId, zoneId, lockIp, lockMs } = stationCfg
  //   try {
  //     const fd = new FormData()
  //     if (d.person_code) fd.append('person_code', d.person_code)
  //     if (d.person_name) fd.append('person_name', d.person_name)
  //     fd.append('reason', dir === 'ENTRY' ? 'EPI_COMPLIANT_ENTRY' : 'EXIT')
  //     if (doorId) fd.append('door_id', doorId)
  //     if (zoneId) fd.append('zone_id', zoneId)
  //     fd.append('direction', dir)
  //     fetch(`${apiBase}/api/v1/epi/access/door/open`, { method: 'POST', body: fd, headers: authHeaders() }).catch(() => { })
  //   } catch { }
  // }, [stationCfg, authHeaders])

  const triggerDoor = useCallback((d: Decision, dir: Direction) => {
  const { lockIp, lockMs, doorId, zoneId, apiBase } = stationCfg
    console.log('[triggerDoor] dir:', dir, 'lockIp:', lockIp, 'lockMs:', lockMs)
    // Abre o ESP32 diretamente
    if (lockIp) {
      fetch(`http://${lockIp}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration_ms: lockMs }),
      }).catch(() => {})
    }

    // Registra no backend (fire-and-forget, sem bloquear)
    try {
      const fd = new FormData()
      if (d.person_code) fd.append('person_code', d.person_code)
      if (d.person_name) fd.append('person_name', d.person_name)
      fd.append('reason', dir === 'ENTRY' ? 'EPI_COMPLIANT_ENTRY' : 'EXIT')
      if (doorId) fd.append('door_id', doorId)
      if (zoneId) fd.append('zone_id', zoneId)
      fd.append('direction', dir)
      fetch(`${apiBase}/api/v1/epi/access/door/open`, { method: 'POST', body: fd, headers: authHeaders() }).catch(() => {})
    } catch {}
  }, [stationCfg, authHeaders])

    const saveRecognitionEvent = useCallback(async (
    d: Decision,
    dir: Direction,
    lastMissingItems: string[],
  ) => {
    const { apiBase, companyId, apiKey, zoneId } = stationCfg
    try {
      const detNames = new Set(
        ['helmet','thermal_coat','thermal_pants','gloves','boots']
          .filter(n => !lastMissingItems.includes(n))
      )
      const epiRequired = 5
      const epiDetected = epiRequired - lastMissingItems.length

      const payload = {
        zone_id:              parseInt(zoneId) || null,
        person_code:          d.person_code   ?? null,
        person_name:          d.person_name   ?? null,
        face_recognized:      d.face_rate >= 0.5,
        face_confidence:      Math.round(d.face_rate * 10000) / 10000,
        epi_coat:   detNames.has('thermal_coat'),
        epi_pants:  detNames.has('thermal_pants'),
        epi_gloves: detNames.has('gloves'),
        epi_cap:    detNames.has('helmet'),
        epi_boots:  detNames.has('boots'),
        epi_total_required:  epiRequired,
        epi_total_detected:  Math.max(0, epiDetected),
        epi_compliant:       d.access_decision === 'GRANTED',
        epi_units_required:  epiRequired,
        epi_units_detected:  Math.max(0, epiDetected),
        epi_units_missing:   Math.max(0, lastMissingItems.length),
        compliance_score:    Math.round(d.compliance_rate * 10000) / 10000,
        compliance_detail:   { missing: lastMissingItems, direction: dir },
        exposure_accumulated_min: 0,
        exposure_limit_min:       100,
        exposure_exceeded:        false,
        access_decision:   d.access_decision,
        denial_reason:     d.access_decision !== 'GRANTED' ? d.access_decision : null,
        door_command_sent: d.access_decision === 'GRANTED',
        processing_time_ms: Math.round(stationCfg.epiScanSeconds * 1000),
        source: 'SMARTX_VISION',
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (apiKey) headers['X-API-Key'] = apiKey

      await fetch(
        `${apiBase}/api/v1/epi/access/recognition-events?company_id=${companyId}`,
        { method: 'POST', headers, body: JSON.stringify(payload) }
      )
    } catch (e) {
      console.warn('[EpiStation] saveRecognitionEvent falhou:', e)
    }
  }, [stationCfg])


  // const openScan = useCallback((dir: Direction) => {
  //   if (!mountedRef.current || phaseRef.current === 'scanning') return
  //   closeScan()
  //   setPhase('scanning'); setLastFrame(null); setDirection(dir); setLastMissing([])
  //   faceIdentifiedRef.current = false
  //   setSubPhase('face_scan')
  //   const { apiBase } = stationCfg

  //   // Fluxo EXIT: só reconhecimento facial via HTTP polling (sem handshake WS)
  //   if (dir === 'EXIT') {
  //     const pollInterval = Math.round(1000 / CFG.fps)

  //     const poll = async () => {
  //       if (!mountedRef.current || phaseRef.current !== 'scanning') return
  //       const blob = await captureFrame(0.8)
  //       if (!blob) return
  //       try {
  //         const fd = new FormData()
  //         fd.append('file', blob, 'frame.jpg')
  //         fd.append('confidence', String(CFG.confidence))
  //         fd.append('detect_faces', 'true')
  //         fd.append('face_threshold', String(CFG.face_threshold))
  //         const r = await fetch(
  //           `${apiBase}/api/v1/epi/detect/frame?company_id=${stationCfg.companyId}`,
  //           { method: 'POST', body: fd, headers: authHeaders() }
  //         )
  //         const data = await r.json()
  //         const fr: FrameResult = { ...data, window_progress: 0, session_compliant_rate: 1 }
  //         setLastFrame(fr)
  //         if (fr.face_recognized && !faceIdentifiedRef.current) {
  //           faceIdentifiedRef.current = true
  //           if (wsTimerRef.current) { clearInterval(wsTimerRef.current); wsTimerRef.current = null }
  //           subPhaseTimerRef.current = setTimeout(() => {
  //             if (!mountedRef.current || phaseRef.current !== 'scanning') return
  //             const d: Decision = {
  //               access_decision: 'GRANTED',
  //               compliance_rate: 1,
  //               face_rate: fr.face_confidence,
  //               person_code: fr.face_person_code,
  //               person_name: fr.face_person_name,
  //               total_frames: 1,
  //             }
  //             closeScan(); setDecision(d); setPhase('granted')
  //             triggerDoor(d, dir)
  //             saveRecognitionEvent(d, dir, [])
  //             resultTimerRef.current = setTimeout(() => { if (mountedRef.current) goIdle() }, CFG.result_show_ms)
  //           }, 600)
  //         }
  //       } catch { }
  //     }

  //     // Inicia polling imediatamente — sem aguardar handshake
  //     // Lock evita sobreposição de fetches quando a resposta demora mais que o intervalo
  //     let polling = false
  //     const guardedPoll = async () => {
  //       if (polling) return
  //       polling = true
  //       try { await poll() } finally { polling = false }
  //     }
  //     wsTimerRef.current = setInterval(guardedPoll, pollInterval)
  //     return
  //   }

  //   // Fluxo ENTRY: face_scan → preparing → epi_scan
  //   const handleWsMessage = (ev: MessageEvent) => {
  //     if (!mountedRef.current) return
  //     try {
  //       const msg = JSON.parse(ev.data as string)
  //       if (msg.type === 'frame_result') {
  //         const fr = msg as FrameResult
  //         setLastFrame(fr)
  //         if (fr.missing) { setLastMissing(fr.missing); lastMissingRef.current = fr.missing }
  //         if (fr.face_recognized && !faceIdentifiedRef.current && subPhaseRef.current === 'face_scan') {
  //           faceIdentifiedRef.current = true
  //           clearTimeout(subPhaseTimerRef.current!)
  //           subPhaseTimerRef.current = setTimeout(() => {
  //             if (!mountedRef.current || phaseRef.current !== 'scanning') return
  //             startPreparing(apiBase, handleWsMessage)
  //           }, 800)
  //         }
  //       }
  //       if (msg.type === 'decision') {
  //         if (subPhaseRef.current !== 'epi_scan') return
  //         const d = msg as Decision
  //         closeScan(); setDecision(d)
  //         const p: Phase = d.access_decision === 'GRANTED' ? 'granted'
  //           : d.access_decision === 'DENIED_EPI' ? 'denied_epi' : 'denied_face'
  //         setPhase(p)
  //         if (d.access_decision === 'GRANTED') triggerDoor(d, dir)
  //         resultTimerRef.current = setTimeout(() => { if (mountedRef.current) goIdle() }, CFG.result_show_ms)
  //         saveRecognitionEvent(d, dir, lastMissingRef.current)
  //       }
  //     } catch { }
  //   }

  //   subPhaseTimerRef.current = setTimeout(() => {
  //     if (!mountedRef.current || phaseRef.current !== 'scanning') return
  //     if (subPhaseRef.current === 'face_scan') startPreparing(apiBase, handleWsMessage)
  //   }, stationCfg.faceScanSeconds * 1000)

  //   const wsBase = apiBase.replace(/^http/, 'ws')
  //   const ws = new WebSocket(`${wsBase}/api/v1/epi/ws/epi-stream?${buildWsParams()}`)
  //   wsRef.current = ws
  //   ws.onmessage = handleWsMessage
  //   ws.onopen = () => {
  //     const interval = Math.round(1000 / CFG.fps)
  //     wsTimerRef.current = setInterval(async () => {
  //       if (ws.readyState !== WebSocket.OPEN) return
  //       const blob = await captureFrame(0.8)
  //       if (blob && ws.readyState === WebSocket.OPEN) ws.send(blob)
  //     }, interval)
  //   }
  //   ws.onclose = () => { if (wsTimerRef.current) { clearInterval(wsTimerRef.current); wsTimerRef.current = null } }
  // }, [closeScan, setPhase, setSubPhase, startPreparing, goIdle, captureFrame, triggerDoor, saveRecognitionEvent, stationCfg, buildWsParams])


  const openScan = useCallback((dir: Direction) => {
    if (!mountedRef.current || phaseRef.current === 'scanning') return
    closeScan()
    setPhase('scanning'); setLastFrame(null); setDirection(dir); setLastMissing([])
    faceIdentifiedRef.current = false
    setSubPhase('face_scan')
    const { apiBase } = stationCfg

    // ─── Fluxo EXIT: só reconhecimento facial via HTTP polling ───
    if (dir === 'EXIT') {
      const pollInterval = Math.round(1000 / CFG.fps)

      const poll = async () => {
        if (!mountedRef.current || phaseRef.current !== 'scanning') return
        const blob = await captureFrame(0.8)
        if (!blob) return
        try {
          const fd = new FormData()
          fd.append('file', blob, 'frame.jpg')
          fd.append('confidence', String(CFG.confidence))
          fd.append('detect_faces', 'true')
          fd.append('face_threshold', String(CFG.face_threshold))

          const r = await fetch(
            `${apiBase}/api/v1/epi/detect/frame?company_id=${stationCfg.companyId}`,
            { method: 'POST', body: fd, headers: authHeaders() }
          )
          const data = await r.json()

          // A API retorna faces como array: data.faces[0].recognized
          const topFace = data.faces?.[0]
          const fr: FrameResult = {
            ...data,
            compliant: true,
            missing: [],
            window_progress: 0,
            session_compliant_rate: 1,
            face_detected:    !!topFace,
            face_recognized:  topFace?.recognized  ?? false,
            face_confidence:  topFace?.confidence  ?? 0,
            face_person_code: topFace?.person_code ?? undefined,
            face_person_name: topFace?.person_name ?? undefined,
          }

          setLastFrame(fr)

          if (fr.face_recognized && !faceIdentifiedRef.current) {
            faceIdentifiedRef.current = true
            if (wsTimerRef.current) { clearInterval(wsTimerRef.current); wsTimerRef.current = null }

            subPhaseTimerRef.current = setTimeout(() => {
              if (!mountedRef.current || phaseRef.current !== 'scanning') return
              const d: Decision = {
                access_decision: 'GRANTED',
                compliance_rate: 1,
                face_rate: fr.face_confidence,
                person_code: fr.face_person_code,
                person_name: fr.face_person_name,
                total_frames: 1,
              }
              closeScan(); setDecision(d); setPhase('granted')
              saveRecognitionEvent(d, dir, [])
              startDoorCountdown(() => triggerDoor(d, dir))
              resultTimerRef.current = setTimeout(() => { if (mountedRef.current) goIdle() }, CFG.result_show_ms)
            }, 600)
          }
        } catch (e) { console.warn('[EXIT poll] erro fetch:', e) }
      }

      let polling = false
      const guardedPoll = async () => {
        if (polling) return
        polling = true
        try { await poll() } finally { polling = false }
      }
      wsTimerRef.current = setInterval(guardedPoll, pollInterval)
      return
    }

    // ─── Fluxo ENTRY: face_scan → preparing → epi_scan ───
    const handleWsMessage = (ev: MessageEvent) => {
      if (!mountedRef.current) return
      try {
        const msg = JSON.parse(ev.data as string)
        if (msg.type === 'frame_result') {
          const raw = msg as FrameResult & { faces?: { recognized: boolean; person_code?: string; person_name?: string; confidence?: number }[] }
          const topFace = raw.faces?.[0]
          const fr: FrameResult = {
            ...raw,
            face_detected:    raw.face_detected    ?? !!topFace,
            face_recognized:  raw.face_recognized  ?? topFace?.recognized  ?? false,
            face_confidence:  raw.face_confidence  ?? topFace?.confidence  ?? 0,
            face_person_code: raw.face_person_code ?? topFace?.person_code ?? undefined,
            face_person_name: raw.face_person_name ?? topFace?.person_name ?? undefined,
          }
          setLastFrame(fr)
          if (fr.missing) { setLastMissing(fr.missing); lastMissingRef.current = fr.missing }
          if (fr.face_recognized && !faceIdentifiedRef.current && subPhaseRef.current === 'face_scan') {
            faceIdentifiedRef.current = true
            clearTimeout(subPhaseTimerRef.current!)
            subPhaseTimerRef.current = setTimeout(() => {
              if (!mountedRef.current || phaseRef.current !== 'scanning') return
              startPreparing(apiBase, handleWsMessage)
            }, 800)
          }
        }
        if (msg.type === 'decision') {
          if (subPhaseRef.current !== 'epi_scan') return
          const d = msg as Decision
          closeScan(); setDecision(d)
          const p: Phase = d.access_decision === 'GRANTED' ? 'granted'
            : d.access_decision === 'DENIED_EPI' ? 'denied_epi' : 'denied_face'
          setPhase(p)
          if (d.access_decision === 'GRANTED')
            startDoorCountdown(() => triggerDoor(d, dir))
          resultTimerRef.current = setTimeout(() => { if (mountedRef.current) goIdle() }, CFG.result_show_ms)
          saveRecognitionEvent(d, dir, lastMissingRef.current)
        }
      } catch { }
    }

    subPhaseTimerRef.current = setTimeout(() => {
      if (!mountedRef.current || phaseRef.current !== 'scanning') return
      if (subPhaseRef.current === 'face_scan') startPreparing(apiBase, handleWsMessage)
    }, stationCfg.faceScanSeconds * 1000)

    const wsBase = apiBase.replace(/^http/, 'ws')
    const ws = new WebSocket(`${wsBase}/api/v1/epi/ws/epi-stream?${buildWsParams()}`)
    wsRef.current = ws
    ws.onmessage = handleWsMessage
    ws.onopen = () => {
      const interval = Math.round(1000 / CFG.fps)
      wsTimerRef.current = setInterval(async () => {
        if (ws.readyState !== WebSocket.OPEN) return
        const blob = await captureFrame(0.8)
        if (blob && ws.readyState === WebSocket.OPEN) ws.send(blob)
      }, interval)
    }
    ws.onclose = () => { if (wsTimerRef.current) { clearInterval(wsTimerRef.current); wsTimerRef.current = null } }
  }, [closeScan, setPhase, setSubPhase, startPreparing, goIdle, captureFrame, triggerDoor, saveRecognitionEvent, startDoorCountdown, stationCfg, buildWsParams])


  // Conecta no WebSocket do controlador IoT e dispara scan quando botão externo é pressionado
  useEffect(() => {
    if (!stationCfg.lockIp) return
    let ws: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let destroyed = false

    const connect = () => {
      if (destroyed) return
      try {
        ws = new WebSocket(`ws://${stationCfg.lockIp}:81`)
        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data)
            if (phaseRef.current !== 'idle') return
            if (msg.event === 'start_recognition') openScan('ENTRY')
            if (msg.event === 'button_press') openScan('EXIT')
          } catch { }
        }
        ws.onclose = () => {
          if (!destroyed) reconnectTimer = setTimeout(connect, 5000)
        }
        ws.onerror = () => ws?.close()
      } catch { }
    }

    connect()
    return () => {
      destroyed = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      ws?.close()
    }
  }, [stationCfg.lockIp, openScan])

  useEffect(() => {
    if (!camReady) return
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      closeScan()
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current)
    }
  }, [camReady, closeScan])

  return { phase, scanSubPhase, prepareCountdown, doorCountdown, lastFrame, decision, direction, openScan, goIdle, lastMissing }
}

// ─── MODAL CONFIG ────────────────────────────────────────────────────────────
function ConfigModal({ onClose, onSave, devices, theme }: {

  onClose: () => void
  onSave: (cfg: StationConfig) => void
  devices: MediaDeviceInfo[]
  theme: StationTheme
}) {
  const [cfg, setCfg] = useState<StationConfig>(loadConfig)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null)
  const [tab, setTab] = useState<'cam' | 'door' | 'api' | 'scan'>('cam')

  // ── ESP32 Monitor ──
  const [esp32Log, setEsp32Log] = useState<{ ts: string; raw: string; event: string; state?: string; led?: string }[]>([])
  const [esp32Status, setEsp32Status] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const esp32WsRef = useRef<WebSocket | null>(null)
  const logEndRef = useRef<HTMLDivElement>(null)

  const connectEsp32Ws = useCallback(() => {
    if (!cfg.lockIp) return
    if (esp32WsRef.current) { esp32WsRef.current.close(); esp32WsRef.current = null }
    setEsp32Status('connecting')
    setEsp32Log([])
    const ws = new WebSocket(`ws://${cfg.lockIp}:81`)
    esp32WsRef.current = ws
    ws.onopen = () => setEsp32Status('connected')
    ws.onclose = () => setEsp32Status('disconnected')
    ws.onerror = () => setEsp32Status('error')
    ws.onmessage = (ev) => {
      try {
        const d = JSON.parse(ev.data)
        const now = new Date().toLocaleTimeString('pt-BR', { hour12: false })
        setEsp32Log(prev => [...prev.slice(-49), {
          ts: now,
          raw: ev.data,
          event: d.event ?? '?',
          state: d.lock_state ?? d.door_state,
          led: d.led,
        }])
      } catch {
        const now = new Date().toLocaleTimeString('pt-BR', { hour12: false })
        setEsp32Log(prev => [...prev.slice(-49), { ts: now, raw: ev.data, event: 'raw' }])
      }
    }
  }, [cfg.lockIp])

  // Auto-scroll log
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [esp32Log])

  // Fecha WS ao desmontar
  useEffect(() => () => { esp32WsRef.current?.close() }, [])

  const set = (k: keyof StationConfig, v: string | number) => setCfg(p => ({ ...p, [k]: v }))
  const handleSave = () => { saveConfig(cfg); onSave(cfg); onClose() }

  const testLock = async () => {
    if (!cfg.lockIp) return
    setTesting(true); setTestResult(null)
    try {
      const r = await fetch(`http://${cfg.lockIp}/status`, { signal: AbortSignal.timeout(3000) })
      setTestResult(r.ok ? 'ok' : 'fail')
    } catch { setTestResult('fail') } finally { setTesting(false) }
  }

  const inp: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8, color: '#F9FAFB', padding: '8px 12px', fontSize: 13,
    fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box',
  }
  const lbl: React.CSSProperties = {
    fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, display: 'block',
  }
  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
    fontSize: 12, fontFamily: 'monospace',
    background: active ? `${theme.colorPrimary}30` : 'transparent',
    color: active ? theme.colorPrimary : '#6B7280',
    borderBottom: active ? `2px solid ${theme.colorPrimary}` : '2px solid transparent',
  })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, width: '100%', maxWidth: 460, overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Cog6ToothIcon style={{ width: 18, height: 18, color: theme.colorPrimary }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: '#F9FAFB', flex: 1 }}>Configurações da Estação</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
            <XCircleIcon style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 4, padding: '10px 16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {([['cam', '📷 Câmera'], ['door', '🔒 Fechadura'], ['api', '🌐 API'], ['scan', '⚙️ Scan']] as [typeof tab, string][]).map(([id, label]) => (
            <button key={id} style={tabBtn(tab === id)} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '55vh', overflowY: 'auto' }}>

          {tab === 'cam' && (
            <>
              <div>
                <label style={lbl}>Tipo de câmera</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {([['usb', 'USB / Webcam'], ['ip', 'IP / RTSP']] as [CamSource, string][]).map(([v, l]) => (
                    <button key={v} onClick={() => set('camSource', v)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1px solid ${cfg.camSource === v ? theme.colorPrimary : 'rgba(255,255,255,0.12)'}`, background: cfg.camSource === v ? `${theme.colorPrimary}20` : 'transparent', color: cfg.camSource === v ? theme.colorPrimary : '#9CA3AF', cursor: 'pointer', fontSize: 12, fontFamily: 'monospace' }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              {cfg.camSource === 'usb' && (
                <div>
                  <label style={lbl}>Câmera USB</label>
                  <select style={{ ...inp }} value={cfg.camDeviceId} onChange={e => set('camDeviceId', e.target.value)}>
                    <option value="">Padrão (automático)</option>
                    {devices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Câmera ${d.deviceId.slice(0, 8)}`}</option>)}
                  </select>
                </div>
              )}
              {cfg.camSource === 'ip' && (
                <div>
                  <label style={lbl}>URL da Câmera IP</label>
                  <input style={inp} value={cfg.camIpUrl} onChange={e => set('camIpUrl', e.target.value)} placeholder="http://192.168.1.50:8080/video" />
                </div>
              )}
            </>
          )}

          {tab === 'door' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={lbl}>Door ID</label><input style={inp} value={cfg.doorId} onChange={e => set('doorId', e.target.value)} /></div>
                <div><label style={lbl}>Zone ID</label><input style={inp} value={cfg.zoneId} onChange={e => set('zoneId', e.target.value)} /></div>
              </div>
              <div>
                <label style={lbl}>IP da Fechadura (ESP32)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input style={{ ...inp, flex: 1 }} value={cfg.lockIp} onChange={e => set('lockIp', e.target.value)} placeholder="192.168.68.100" />
                  <button onClick={testLock} disabled={!cfg.lockIp || testing} style={{ background: testResult === 'ok' ? 'rgba(16,185,129,0.15)' : testResult === 'fail' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${testResult === 'ok' ? 'rgba(16,185,129,0.4)' : testResult === 'fail' ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 8, padding: '8px 12px', cursor: 'pointer', color: testResult === 'ok' ? '#10B981' : testResult === 'fail' ? '#EF4444' : '#9CA3AF', fontSize: 12, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {testing ? <ArrowPathIcon style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} /> : testResult === 'ok' ? <CheckCircleIcon style={{ width: 12, height: 12 }} /> : testResult === 'fail' ? <XCircleIcon style={{ width: 12, height: 12 }} /> : <SignalIcon style={{ width: 12, height: 12 }} />}
                    {testing ? '...' : testResult === 'ok' ? 'Online' : testResult === 'fail' ? 'Offline' : 'Testar'}
                  </button>
                </div>
              </div>
              <div>
                <label style={lbl}>Tempo aberta (ms)</label>
                <input style={inp} type="number" value={cfg.lockMs} onChange={e => set('lockMs', parseInt(e.target.value) || 5000)} />
              </div>

            </>
          )}

          {tab === 'api' && (
            <>
              <div>
                <label style={lbl}>API Key da Máquina</label>
                <input style={inp} type="password" value={cfg.apiKey} onChange={e => set('apiKey', e.target.value)} placeholder="Token do painel..." />
                {cfg.apiKey && <div style={{ fontSize: 11, color: '#10B981', fontFamily: 'monospace', marginTop: 4 }}>✓ {cfg.apiKey.slice(0, 8)}...{cfg.apiKey.slice(-4)}</div>}
              </div>
              <div>
                <label style={lbl}>Company ID</label>
                <input style={inp} type="number" value={cfg.companyId} onChange={e => set('companyId', parseInt(e.target.value) || 1)} />
              </div>
              <div>
                <label style={lbl}>URL da API</label>
                <input style={inp} value={cfg.apiBase} onChange={e => set('apiBase', e.target.value)} placeholder="https://aihub.smartxhub.cloud" />
                <div style={{ fontSize: 11, color: '#6B7280', fontFamily: 'monospace', marginTop: 4 }}>
                  WS: {cfg.apiBase.replace(/^http/, 'ws')}/api/v1/epi/ws/epi-stream
                </div>
              </div>
              {/* ── ESP32 WebSocket Monitor ── */}
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={lbl}>Monitor ESP32</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {/* Indicador de status */}
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontFamily: 'monospace',
                      color: esp32Status === 'connected' ? '#10B981' : esp32Status === 'connecting' ? '#F59E0B' : esp32Status === 'error' ? '#EF4444' : '#6B7280'
                    }}>
                      <span style={{
                        width: 7, height: 7, borderRadius: '50%', display: 'inline-block',
                        background: esp32Status === 'connected' ? '#10B981' : esp32Status === 'connecting' ? '#F59E0B' : esp32Status === 'error' ? '#EF4444' : '#374151',
                        boxShadow: esp32Status === 'connected' ? '0 0 6px #10B981' : esp32Status === 'connecting' ? '0 0 6px #F59E0B' : 'none',
                        animation: esp32Status === 'connecting' ? 'pulse 1s ease-in-out infinite' : 'none',
                      }} />
                      {{ disconnected: 'OFFLINE', connecting: 'CONECTANDO', connected: 'ONLINE', error: 'ERRO' }[esp32Status]}
                    </span>
                    <button
                      onClick={esp32Status === 'connected' || esp32Status === 'connecting'
                        ? () => { esp32WsRef.current?.close(); setEsp32Status('disconnected') }
                        : connectEsp32Ws
                      }
                      disabled={!cfg.lockIp}
                      style={{
                        background: esp32Status === 'connected' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.12)',
                        border: `1px solid ${esp32Status === 'connected' ? 'rgba(239,68,68,0.4)' : 'rgba(59,130,246,0.35)'}`,
                        borderRadius: 6, padding: '3px 10px', cursor: cfg.lockIp ? 'pointer' : 'not-allowed',
                        color: esp32Status === 'connected' ? '#EF4444' : '#60A5FA',
                        fontSize: 11, fontFamily: 'monospace', fontWeight: 600,
                      }}
                    >
                      {esp32Status === 'connected' || esp32Status === 'connecting' ? 'Desconectar' : 'Conectar WS'}
                    </button>
                    {esp32Log.length > 0 && (
                      <button onClick={() => setEsp32Log([])} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: '#6B7280', fontSize: 11, fontFamily: 'monospace' }}>
                        Limpar
                      </button>
                    )}
                  </div>
                </div>

                {/* Log terminal */}
                <div style={{
                  background: '#060A10', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
                  padding: '10px 12px', height: 160, overflowY: 'auto', fontFamily: 'monospace', fontSize: 11,
                  display: 'flex', flexDirection: 'column', gap: 3,
                }}>
                  {esp32Log.length === 0 ? (
                    <div style={{ color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 18 }}>📡</span>
                      <span>{esp32Status === 'disconnected' ? 'Clique em "Conectar WS" para ouvir o ESP32' : 'Aguardando mensagens...'}</span>
                    </div>
                  ) : esp32Log.map((entry, i) => {
                    const eventColor: Record<string, string> = {
                      connected: '#10B981', status: '#60A5FA', unlocked: '#F59E0B',
                      locked: '#8B5CF6', raw: '#9CA3AF',
                    }
                    const color = eventColor[entry.event] ?? '#9CA3AF'
                    return (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', lineHeight: 1.5 }}>
                        <span style={{ color: '#374151', flexShrink: 0 }}>{entry.ts}</span>
                        <span style={{
                          background: `${color}20`, color, border: `1px solid ${color}40`,
                          borderRadius: 4, padding: '0 5px', fontSize: 10, flexShrink: 0, fontWeight: 700,
                        }}>
                          {entry.event.toUpperCase()}
                        </span>
                        <span style={{ color: '#9CA3AF', wordBreak: 'break-all' }}>{entry.raw}</span>
                      </div>
                    )
                  })}
                  <div ref={logEndRef} />
                </div>
                {cfg.lockIp && (
                  <div style={{ fontSize: 10, color: '#374151', fontFamily: 'monospace', marginTop: 4 }}>
                    ws://{cfg.lockIp}:81
                  </div>
                )}
              </div>


              <div style={{ marginTop: 4 }}>
                <label style={lbl}>Debug</label>
                <button
                  onClick={async () => {
                    if (!cfg.lockIp) return
                    setTesting(true); setTestResult(null)
                    try {
                      const r = await fetch(`http://${cfg.lockIp}/unlock`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ duration_ms: cfg.lockMs }),
                        signal: AbortSignal.timeout(5000),
                      })
                      const data = await r.json().catch(() => ({}))
                      console.log('[DEBUG] ESP32 unlock response:', data)
                      setTestResult(r.ok ? 'ok' : 'fail')
                    } catch (e) {
                      console.error('[DEBUG] ESP32 unlock error:', e)
                      setTestResult('fail')
                    } finally {
                      setTesting(false)
                    }
                  }}
                  disabled={!cfg.lockIp || testing}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: `1px solid ${testResult === 'ok' ? 'rgba(16,185,129,0.5)' : testResult === 'fail' ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.4)'}`,
                    background: testResult === 'ok'
                      ? 'rgba(16,185,129,0.12)'
                      : testResult === 'fail'
                        ? 'rgba(239,68,68,0.12)'
                        : 'rgba(245,158,11,0.1)',
                    color: testResult === 'ok' ? '#10B981' : testResult === 'fail' ? '#EF4444' : '#F59E0B',
                    cursor: cfg.lockIp && !testing ? 'pointer' : 'not-allowed',
                    fontSize: 13,
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all .2s',
                  }}
                >
                  {testing
                    ? <><ArrowPathIcon style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> Abrindo...</>
                    : testResult === 'ok'
                      ? <><CheckCircleIcon style={{ width: 14, height: 14 }} /> Fechadura aberta! ({(cfg.lockMs / 1000).toFixed(1)}s)</>
                      : testResult === 'fail'
                        ? <><XCircleIcon style={{ width: 14, height: 14 }} /> Falhou — verifique o IP</>
                        : <><LockClosedIcon style={{ width: 14, height: 14 }} /> Abrir Fechadura ({(cfg.lockMs / 1000).toFixed(1)}s)</>
                  }
                </button>
                {cfg.lockIp && (
                  <div style={{ fontSize: 11, color: '#6B7280', fontFamily: 'monospace', marginTop: 4 }}>
                    POST http://{cfg.lockIp}/unlock · duration_ms: {cfg.lockMs}
                  </div>
                )}
              </div>
            </>
          )}

          {tab === 'scan' && (
            <>
              <div>
                <label style={lbl}>Tempo reconhecimento facial (s)</label>
                <input style={inp} type="number" value={cfg.faceScanSeconds} onChange={e => set('faceScanSeconds', parseInt(e.target.value) || 8)} min={3} max={30} />
              </div>
              <div>
                <label style={lbl}>Janela de verificação EPI (s)</label>
                <input style={inp} type="number" value={cfg.epiScanSeconds} onChange={e => set('epiScanSeconds', parseInt(e.target.value) || 20)} min={5} max={60} />
              </div>
              <div>
                <label style={lbl}>Tempo para colocar a balaclava (s)</label>
                <input style={inp} type="number" value={cfg.prepareSeconds} onChange={e => set('prepareSeconds', parseInt(e.target.value) || 10)} min={3} max={30} />
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '7px 18px', color: '#9CA3AF', cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
          <button onClick={handleSave} style={{ background: `linear-gradient(135deg,${theme.colorPrimaryDark},${theme.colorPrimary})`, border: 'none', borderRadius: 8, padding: '7px 20px', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            <CheckIcon style={{ width: 13, height: 13 }} />Salvar
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ─── OVERLAY / RESULT / SIDEBAR (inalterados da v3) ──────────────────────────
function Overlay({ frame, vw, vh, ow, oh }: { frame: FrameResult | null; vw: number; vh: number; ow: number; oh: number }) {
  if (!frame?.detections.length) return null
  const sx = ow / (vw || 1); const sy = oh / (vh || 1); const MARGIN = 0.08
  const filtered = frame.detections.filter(d => {
    const cx = (d.bbox.x + d.bbox.w / 2) / (vw || 1); const cy = (d.bbox.y + d.bbox.h / 2) / (vh || 1)
    return cx > MARGIN && cx < (1 - MARGIN) && cy > MARGIN && cy < (1 - MARGIN)
  })
  if (!filtered.length) return null
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {filtered.map((d, i) => {
        const { x, y, w, h } = d.bbox; const c = EPI_COLOR[d.class_name] ?? '#fff'
        const label = `${EPI_LABEL[d.class_name] ?? d.class_name} ${Math.round(d.confidence * 100)}%`
        return (
          <g key={d.class_name + i}>
            <rect x={x * sx} y={y * sy} width={w * sx} height={h * sy} fill={`${c}18`} stroke={c} strokeWidth={2.5} rx={6} />
            <rect x={x * sx} y={Math.max(0, y * sy - 22)} width={label.length * 8 + 8} height={22} fill={c} rx={4} />
            <text x={x * sx + 5} y={Math.max(15, y * sy - 6)} fill="#fff" fontSize={12} fontFamily="monospace" fontWeight={700}>{label}</text>
          </g>
        )
      })}
    </svg>
  )
}

function ResultOverlay({ phase, decision, direction, hasLock, missing, doorCountdown }: { phase: Phase; decision: Decision | null; direction: Direction; hasLock: boolean; missing: string[]; doorCountdown: number }) {
  const granted = phase === 'granted'; const deniedEpi = phase === 'denied_epi'
  const color = granted ? '#10B981' : '#EF4444'
  const bg = granted ? 'rgba(6,78,59,0.96)' : 'rgba(69,10,10,0.96)'
  const Icon = granted ? CheckCircleIcon : deniedEpi ? ShieldExclamationIcon : XCircleIcon
  const title = granted ? (direction === 'ENTRY' ? 'ACESSO LIBERADO' : 'SAÍDA REGISTRADA') : deniedEpi ? 'EPI INCOMPLETO' : 'FACE NÃO IDENTIFICADA'
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: bg, backdropFilter: 'blur(8px)', padding: 16 }}>
      <style>{`@keyframes pop{0%{transform:scale(.3);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes ringPulse{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.5)}50%{box-shadow:0 0 0 12px rgba(16,185,129,0)}}`}</style>
      <div style={{ marginBottom: 16, filter: `drop-shadow(0 0 40px ${color})`, animation: 'pop .5s cubic-bezier(.34,1.56,.64,1)' }}>
        <Icon style={{ width: 80, height: 80, color }} />
      </div>
      <div style={{ fontSize: 'clamp(24px,5vw,44px)', fontWeight: 900, color, letterSpacing: '-0.02em', marginBottom: 10, textAlign: 'center', animation: 'slideUp .4s ease .1s both' }}>{title}</div>
      {(decision?.person_name || decision?.person_code) && (
        <div style={{ fontSize: 'clamp(16px,3vw,22px)', color: '#E5E7EB', marginBottom: 16, animation: 'slideUp .4s ease .2s both', display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserIcon style={{ width: 20, height: 20 }} />{decision.person_name ?? decision.person_code}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', animation: 'slideUp .4s ease .3s both' }}>
        {[{ l: 'Conformidade', v: `${Math.round((decision?.compliance_rate ?? 0) * 100)}%` }, { l: 'Face', v: `${Math.round((decision?.face_rate ?? 0) * 100)}%` }, { l: 'Frames', v: String(decision?.total_frames ?? 0) }].map(s => (
          <div key={s.l} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', textTransform: 'uppercase' }}>{s.l}</div>
            <div style={{ fontSize: 'clamp(18px,3vw,24px)', fontWeight: 700, color: '#F9FAFB' }}>{s.v}</div>
          </div>
        ))}
      </div>
      {deniedEpi && missing.length > 0 && (
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace', textTransform: 'uppercase' }}>EPIs faltando</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {missing.map(epi => (
              <span key={epi} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.45)', borderRadius: 10, padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#FCA5A5' }}>
                <ShieldExclamationIcon style={{ width: 15, height: 15, color: '#EF4444' }} />{EPI_LABEL[epi] ?? epi}
              </span>
            ))}
          </div>
        </div>
      )}
      {granted && hasLock && (
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, fontSize: 12, color: '#86EFAC', fontFamily: 'monospace' }}>
          {doorCountdown > 0
            ? <><LockClosedIcon style={{ width: 12, height: 12 }} /> Fechadura aberta · fechando em {doorCountdown}s</>
            : <><LockClosedIcon style={{ width: 12, height: 12 }} /> Fechadura fechada</>
          }
        </div>
      )}
    </div>
  )
}
//@ts-ignore
function IdleOverlay({ camError, onEntry, onExit, theme }: { camError: string; onEntry: () => void; onExit: () => void; theme: StationTheme }) {
  if (camError) return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0A0F1A' }}>
      <XCircleIcon style={{ width: 48, height: 48, color: '#EF4444', marginBottom: 12 }} />
      <div style={{ fontSize: 18, fontWeight: 600, color: '#EF4444', marginBottom: 8 }}>Câmera indisponível</div>
      <div style={{ fontSize: 13, color: '#6B7280', fontFamily: 'monospace', maxWidth: 280, textAlign: 'center' }}>{camError}</div>
    </div>
  )
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.9) 0%,transparent 100%)', padding: '32px 20px 20px', display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={onEntry} style={{ flex: 1, maxWidth: 200, background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.5)', borderRadius: 12, padding: '14px 20px', color: '#10B981', cursor: 'pointer', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <ArrowRightOnRectangleIcon style={{ width: 20, height: 20 }} /> Entrada
        </button>
        <button onClick={onExit} style={{ flex: 1, maxWidth: 200, background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.4)', borderRadius: 12, padding: '14px 20px', color: '#EF4444', cursor: 'pointer', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <ArrowLeftOnRectangleIcon style={{ width: 20, height: 20 }} /> Saída
        </button>
        <div style={{ width: '100%', textAlign: 'center', fontSize: 12, color: '#6B7280', marginTop: 4 }}>
          Ou posicione-se — detecção automática em 1.5s
        </div>
      </div>
    </div>
  )
}

function StatusBar({ phase, scanSubPhase, frame, direction, company, theme, onConfig }: {
  phase: Phase; scanSubPhase: ScanSubPhase; frame: FrameResult | null
  direction: Direction; company: StationCompany | null; theme: StationTheme; onConfig: () => void
}) {
  const scanning = phase === 'scanning'
  const progress = frame?.window_progress ?? 0
  const rate = frame?.session_compliant_rate ?? 0
  const rateColor = rate > 0.7 ? '#10B981' : rate > 0.4 ? '#F59E0B' : '#EF4444'
  const subPhaseLabel: Record<ScanSubPhase, string> = { face_scan: 'FACE', preparing: 'PREP', epi_scan: 'EPI' }
  const subPhaseColor: Record<ScanSubPhase, string> = { face_scan: theme.colorPrimary, preparing: '#F59E0B', epi_scan: '#10B981' }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, background: `${theme.colorHeaderBg}CC`, backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: `1px solid ${theme.colorPrimary}30` }}>

      {/* Logo ou ícone */}
      {company?.logo
        ? <img src={company.logo} alt="logo" style={{ height: 28, width: 'auto', maxWidth: 80, objectFit: 'contain', borderRadius: 4 }} />
        : <ShieldCheckIcon style={{ width: 18, height: 18, color: theme.colorPrimary, flexShrink: 0 }} />
      }

      <span style={{ fontWeight: 700, fontSize: 13, color: '#F9FAFB', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {company?.full_name ?? 'EPI Check'}
      </span>

      {scanning && scanSubPhase === 'epi_scan' && (
        <>
          <div style={{ width: 70, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ height: '100%', borderRadius: 2, transition: 'width .3s', background: `linear-gradient(90deg,${theme.colorPrimary},${rateColor})`, width: `${progress * 100}%` }} />
          </div>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: rateColor, fontWeight: 700, flexShrink: 0 }}>{Math.round(rate * 100)}%</span>
        </>
      )}

      {scanning && (
        <span style={{ background: `${subPhaseColor[scanSubPhase]}20`, color: subPhaseColor[scanSubPhase], border: `1px solid ${subPhaseColor[scanSubPhase]}50`, borderRadius: 20, padding: '2px 8px', fontSize: 10, fontFamily: 'monospace', flexShrink: 0, fontWeight: 700 }}>
          {subPhaseLabel[scanSubPhase]}
        </span>
      )}

      <span style={{ background: direction === 'ENTRY' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: direction === 'ENTRY' ? '#10B981' : '#EF4444', border: `1px solid ${direction === 'ENTRY' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 20, padding: '2px 8px', fontSize: 10, fontFamily: 'monospace', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
        {direction === 'ENTRY' ? <ArrowRightOnRectangleIcon style={{ width: 10, height: 10 }} /> : <ArrowLeftOnRectangleIcon style={{ width: 10, height: 10 }} />}
        {direction === 'ENTRY' ? 'ENTRADA' : 'SAÍDA'}
      </span>

      <span style={{ background: scanning ? 'rgba(245,158,11,0.15)' : `${theme.colorPrimary}20`, color: scanning ? '#F59E0B' : theme.colorPrimary, border: `1px solid ${scanning ? 'rgba(245,158,11,0.3)' : `${theme.colorPrimary}40`}`, borderRadius: 20, padding: '2px 8px', fontSize: 10, fontFamily: 'monospace', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
        {scanning ? <><BoltIcon style={{ width: 9, height: 9 }} /> SCAN</> : <><EyeIcon style={{ width: 9, height: 9 }} /> IDLE</>}
      </span>

      <button onClick={onConfig} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
        <Cog6ToothIcon style={{ width: 13, height: 13 }} />
      </button>
    </div>
  )
}

function ScanPhaseInstruction({ subPhase, countdown, frame, theme }: { subPhase: ScanSubPhase; countdown: number; frame: FrameResult | null; theme: StationTheme }) {
  if (subPhase === 'epi_scan') return null
  const isPreparing = subPhase === 'preparing'
  const faceOk = frame?.face_recognized ?? false
  const faceName = frame?.face_person_name ?? frame?.face_person_code
  const faceConf = frame?.face_confidence ?? 0
  const color = isPreparing ? '#F59E0B' : faceOk ? '#10B981' : theme.colorPrimary
  return (
    <div style={{ position: 'absolute', bottom: 62, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', zIndex: 6 }}>
      <div style={{ background: `${color}18`, border: `1px solid ${color}50`, borderRadius: 16, padding: '14px 28px', textAlign: 'center', backdropFilter: 'blur(10px)', minWidth: 240 }}>
        <div style={{ fontSize: 'clamp(15px,3vw,19px)', fontWeight: 700, color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {isPreparing ? <><ShieldCheckIcon style={{ width: 20, height: 20 }} /> Coloque a balaclava</> : faceOk ? <><FaceSmileIcon style={{ width: 20, height: 20 }} /> Rosto identificado!</> : <><UserIcon style={{ width: 20, height: 20 }} /> Mostre o rosto para a câmera</>}
        </div>
        {isPreparing && countdown > 0 && <div style={{ fontSize: 'clamp(32px,7vw,52px)', fontWeight: 900, color: '#F59E0B', lineHeight: 1.1, marginTop: 6 }}>{countdown}</div>}
        {subPhase === 'face_scan' && faceOk && faceName && <div style={{ fontSize: 13, color: '#86EFAC', marginTop: 6, fontFamily: 'monospace' }}>{faceName} · {Math.round(faceConf * 100)}% confiança</div>}
        {subPhase === 'face_scan' && !faceOk && <div style={{ fontSize: 11, color: '#6B7280', fontFamily: 'monospace', marginTop: 4 }}>Retire a balaclava temporariamente</div>}
      </div>
    </div>
  )
}

function EpiSidebar({ frame, isNarrow }: { frame: FrameResult | null; isNarrow: boolean }) {
  const lastValidRef = useRef<FrameResult | null>(null)
  if (frame && (frame.detections.length > 0 || frame.missing.length > 0)) lastValidRef.current = frame
  const f = lastValidRef.current
  const detected = f?.detections.map(d => d.class_name) ?? []
  const missing = f?.missing ?? []
  const rate = f?.session_compliant_rate ?? 0

  if (isNarrow) return (
    <div style={{ position: 'absolute', bottom: 5, left: 0, right: 0, zIndex: 6, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(10,15,26,0.88)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <EpiBodyFigure detected={detected} missing={missing} size="sm" showLabels={false} />
      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {['helmet', 'thermal_coat', 'thermal_pants', 'gloves', 'boots'].map(epi => {
          const ok = detected.includes(epi) && !missing.includes(epi)
          const unk = detected.length === 0 && missing.length === 0
          return <span key={epi} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 6, fontFamily: 'monospace', background: unk ? 'rgba(55,65,81,0.5)' : ok ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: unk ? '#6B7280' : ok ? '#86EFAC' : '#FCA5A5', border: `1px solid ${unk ? 'rgba(55,65,81,0.4)' : ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>{EPI_LABEL[epi]?.split(' ')[0]}</span>
        })}
      </div>
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        {frame?.face_recognized ? <FaceSmileIcon style={{ width: 22, height: 22, color: '#10B981' }} /> : <UserIcon style={{ width: 22, height: 22, color: '#6B7280' }} />}
        <div style={{ fontSize: 12, fontWeight: 800, color: rate > 0.7 ? '#10B981' : rate > 0.4 ? '#F59E0B' : '#EF4444', fontFamily: 'monospace' }}>{Math.round(rate * 100)}%</div>
      </div>
    </div>
  )

  return (
    <div style={{ width: 220, background: 'rgba(10,15,26,0.92)', backdropFilter: 'blur(12px)', borderLeft: '1px solid rgba(255,255,255,0.07)', padding: '60px 12px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, overflowY: 'auto' }}>
      <EpiBodyFigure detected={detected} missing={missing} size="md" showLabels={true} />
      <div style={{ width: '100%', padding: '8px 10px', background: frame?.face_recognized ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${frame?.face_recognized ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 10, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>
          {frame?.face_recognized ? <FaceSmileIcon style={{ width: 22, height: 22, color: '#10B981' }} /> : frame?.face_detected ? <UserIcon style={{ width: 22, height: 22, color: '#F59E0B' }} /> : <UserIcon style={{ width: 22, height: 22, color: '#6B7280' }} />}
        </div>
        <div style={{ fontSize: 11, color: frame?.face_recognized ? '#86EFAC' : '#6B7280', fontFamily: 'monospace' }}>
          {frame?.face_recognized ? (frame.face_person_name ?? frame.face_person_code ?? 'Identificado') : frame?.face_detected ? 'Identificando...' : 'Sem face'}
        </div>
        {frame?.face_recognized && <div style={{ fontSize: 10, color: '#10B981', fontFamily: 'monospace', marginTop: 2 }}>{Math.round((frame.face_confidence ?? 0) * 100)}% conf.</div>}
      </div>
      <div style={{ width: '100%', padding: '8px', textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
        <div style={{ fontSize: 10, color: '#6B7280', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 2 }}>Conformidade</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: rate > 0.7 ? '#10B981' : rate > 0.4 ? '#F59E0B' : '#EF4444' }}>{Math.round(rate * 100)}%</div>
      </div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function EpiCameraStation() {
  const [stationCfg, setStationCfg] = useState<StationConfig>(loadConfig)
  const [showConfig, setShowConfig] = useState(false)
  const theme = DEFAULT_THEME
  const company: StationCompany | null = null

  const layout = useTabletLayout()
  const isNarrow = layout.orientation === 'portrait' || layout.width < 600

  const cam = useCameraStream(stationCfg)
  const logic = useKioskLogic(stationCfg, cam.captureFrame, cam.ready)

  const containerRef = useRef<HTMLDivElement>(null)
  const [vSize, setVSize] = useState({ w: 1280, h: 720 })
  const [oSize, setOSize] = useState({ w: 0, h: 0 })
  const [showName, setShowName] = useState(false)
  const nameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastPersonRef = useRef<string | null>(null)

  useEffect(() => {
    const personId = logic.lastFrame?.face_person_code ?? logic.lastFrame?.face_person_name ?? null
    if (logic.phase === 'scanning' && logic.lastFrame?.face_recognized && personId && personId !== lastPersonRef.current) {
      lastPersonRef.current = personId; setShowName(true)
      if (nameTimerRef.current) clearTimeout(nameTimerRef.current)
      nameTimerRef.current = setTimeout(() => setShowName(false), 3000)
    }
    if (logic.phase !== 'scanning') { setShowName(false); lastPersonRef.current = null }
  }, [logic.phase, logic.lastFrame?.face_recognized, logic.lastFrame?.face_person_code, logic.lastFrame?.face_person_name])

  useEffect(() => {
    const v = cam.videoRef.current; if (!v) return
    const h = () => setVSize({ w: v.videoWidth, h: v.videoHeight })
    v.addEventListener('loadedmetadata', h); return () => v.removeEventListener('loadedmetadata', h)
  }, [cam.videoRef])

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(e => { for (const x of e) setOSize({ w: x.contentRect.width, h: x.contentRect.height }) })
    ro.observe(containerRef.current); return () => ro.disconnect()
  }, [])

  const handleSaveConfig = (cfg: StationConfig) => {
    setStationCfg(cfg)
  }


  const scanning = logic.phase === 'scanning'
  const showResult = logic.phase !== 'idle' && logic.phase !== 'scanning'
  const showEpiSidebar = scanning && logic.scanSubPhase === 'epi_scan'

  return (
    <div style={{ width: '100%', height: '100vh', background: '#000', display: 'flex', flexDirection: isNarrow ? 'column' : 'row', overflow: 'hidden', fontFamily: "'DM Sans',system-ui,sans-serif", userSelect: 'none', WebkitUserSelect: 'none' }}>
      {showConfig && (
        <ConfigModal onClose={() => setShowConfig(false)} onSave={handleSaveConfig} devices={cam.devices} theme={theme} />
      )}

      <div ref={containerRef} style={{ flex: 1, position: 'relative', background: '#111', overflow: 'hidden' }}>
        <video ref={cam.videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: cam.ready ? 1 : 0, transition: 'opacity .5s' }} />
        <canvas ref={cam.canvasRef} style={{ display: 'none' }} />

        {scanning && logic.scanSubPhase === 'epi_scan' && cam.ready && (
          <Overlay frame={logic.lastFrame} vw={vSize.w} vh={vSize.h} ow={oSize.w} oh={oSize.h} />
        )}

        {logic.phase === 'idle' && (
          <IdleOverlay camError={cam.error} onEntry={() => logic.openScan('ENTRY')} onExit={() => logic.openScan('EXIT')} theme={theme} />
        )}

        {showResult && (
          <ResultOverlay phase={logic.phase} decision={logic.decision} direction={logic.direction} hasLock={!!stationCfg.lockIp} missing={logic.lastMissing} doorCountdown={logic.doorCountdown} />
        )}

        {cam.ready && (
          <StatusBar phase={logic.phase} scanSubPhase={logic.scanSubPhase} frame={logic.lastFrame} direction={logic.direction} company={company} theme={theme} onConfig={() => setShowConfig(true)} />
        )}

        {scanning && logic.scanSubPhase !== 'epi_scan' && (
          <ScanPhaseInstruction subPhase={logic.scanSubPhase} countdown={logic.prepareCountdown} frame={logic.lastFrame} theme={theme} />
        )}

        {scanning && showName && logic.lastFrame?.face_recognized && logic.scanSubPhase === 'face_scan' && (
          <div style={{ position: 'absolute', bottom: isNarrow ? 70 : 120, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', zIndex: 5 }}>
            <div style={{ fontSize: 'clamp(28px,6vw,48px)', fontWeight: 900, color: '#10B981', letterSpacing: '-0.03em', fontFamily: "'DM Sans',system-ui,sans-serif", textAlign: 'center', background: 'rgba(6,40,30,0.85)', backdropFilter: 'blur(8px)', padding: '10px 28px', borderRadius: 16, border: '1px solid rgba(16,185,129,0.25)' }}>
              {logic.lastFrame.face_person_name ?? logic.lastFrame.face_person_code}
            </div>
            <div style={{ fontSize: 12, color: '#86EFAC', fontFamily: 'monospace', marginTop: 5, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '2px 10px' }}>
              {Math.round((logic.lastFrame.face_confidence ?? 0) * 100)}% confiança
            </div>
          </div>
        )}

        {scanning && logic.scanSubPhase === 'epi_scan' && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'rgba(0,0,0,0.4)' }}>
            <div style={{ height: '100%', background: `linear-gradient(90deg,${theme.colorPrimary},${(logic.lastFrame?.session_compliant_rate ?? 0) > 0.5 ? '#10B981' : '#EF4444'})`, width: `${(logic.lastFrame?.window_progress ?? 0) * 100}%`, transition: 'width .3s' }} />
          </div>
        )}

        {showEpiSidebar && isNarrow && <EpiSidebar frame={logic.lastFrame} isNarrow={true} />}
      </div>

      {showEpiSidebar && !isNarrow && <EpiSidebar frame={logic.lastFrame} isNarrow={false} />}
    </div>
  )
}