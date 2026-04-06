// // src/pages/EpiCameraStation.tsx
// import { useEffect, useRef, useState, useCallback } from 'react'
// import {
//   ShieldCheckIcon, ShieldExclamationIcon, CheckCircleIcon, XCircleIcon,
//   CameraIcon, UserIcon, BoltIcon, EyeIcon, FaceSmileIcon, ArrowPathIcon,
//   Cog6ToothIcon, LockClosedIcon, BuildingOffice2Icon, ServerStackIcon,
//   SignalIcon,
// } from '@heroicons/react/24/outline'
// import { CheckIcon } from '@heroicons/react/24/solid'
// import EpiBodyFigure from '../components/EpiBodyFigure'

// // ─── CONFIG PERSISTIDA ────────────────────────────────────────────────────────
// interface StationConfig {
//   lockIp:  string
//   lockMs:  number
//   doorId:  string
//   zoneId:  string
//   apiBase: string
// }

// const CONFIG_KEY = 'epi_station_config'

// function defaultConfig(): StationConfig {
//   return {
//     lockIp:  sessionStorage.getItem('lockIp') ?? '192.168.68.100',
//     lockMs:  5000,
//     doorId:  'DOOR_CAMARA_FRIA_01',
//     zoneId:  '10',
//     apiBase: sessionStorage.getItem('apiEndpoint') ?? 'https://aihub.smartxhub.cloud',
//   }
// }

// function loadConfig(): StationConfig {
//   try {
//     const s = localStorage.getItem(CONFIG_KEY)
//     if (s) return { ...defaultConfig(), ...JSON.parse(s) }
//   } catch {}
//   return defaultConfig()
// }

// function saveConfig(cfg: StationConfig) {
//   localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg))
//   sessionStorage.setItem('lockIp',      cfg.lockIp)
//   sessionStorage.setItem('apiEndpoint', cfg.apiBase)
// }

// // ─── MODAL CONFIG ─────────────────────────────────────────────────────────────
// function ConfigModal({ onClose, onSave }: { onClose: () => void; onSave: (cfg: StationConfig) => void }) {
//   const [cfg, setCfg] = useState<StationConfig>(loadConfig)
//   const [testing, setTesting]       = useState(false)
//   const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null)

//   const set = (key: keyof StationConfig, val: string | number) =>
//     setCfg(prev => ({ ...prev, [key]: val }))

//   const handleSave = () => { saveConfig(cfg); onSave(cfg); onClose() }

//   const testLock = async () => {
//     if (!cfg.lockIp) return
//     setTesting(true); setTestResult(null)
//     try {
//       const r = await fetch(`http://${cfg.lockIp}/status`, { signal: AbortSignal.timeout(3000) })
//       setTestResult(r.ok ? 'ok' : 'fail')
//     } catch { setTestResult('fail') }
//     finally { setTesting(false) }
//   }

//   const inp: React.CSSProperties = {
//     width: '100%', background: 'rgba(255,255,255,0.05)',
//     border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
//     color: '#F9FAFB', padding: '8px 12px', fontSize: 13,
//     fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box',
//   }
//   const lbl: React.CSSProperties = {
//     fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace',
//     textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, display: 'block',
//   }
//   const sec: React.CSSProperties = {
//     fontSize: 11, fontWeight: 700, color: '#60A5FA', fontFamily: 'monospace',
//     textTransform: 'uppercase', letterSpacing: '0.1em',
//     borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8, marginBottom: 16,
//     display: 'flex', alignItems: 'center', gap: 6,
//   }

//   return (
//     <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//       <div style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, width: '100%', maxWidth: 480, fontFamily: "'DM Sans', system-ui, sans-serif", overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>

//         {/* Header */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
//           <Cog6ToothIcon style={{ width: 20, height: 20, color: '#60A5FA' }} />
//           <span style={{ fontWeight: 700, fontSize: 16, color: '#F9FAFB', flex: 1 }}>Configurações da Estação</span>
//           <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}>
//             <XCircleIcon style={{ width: 20, height: 20 }} />
//           </button>
//         </div>

//         {/* Body */}
//         <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, maxHeight: '65vh', overflowY: 'auto' }}>

//           {/* API */}
//           <div>
//             <div style={sec}><ServerStackIcon style={{ width: 13, height: 13 }} /> API Backend</div>
//             <label style={lbl}>URL da API</label>
//             <input style={inp} value={cfg.apiBase} onChange={e => set('apiBase', e.target.value)} placeholder="https://aihub.smartxhub.cloud" />
//           </div>

//           {/* Identificação */}
//           <div>
//             <div style={sec}><BuildingOffice2Icon style={{ width: 13, height: 13 }} /> Identificação</div>
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//               <div>
//                 <label style={lbl}>Door ID</label>
//                 <input style={inp} value={cfg.doorId} onChange={e => set('doorId', e.target.value)} placeholder="DOOR_01" />
//               </div>
//               <div>
//                 <label style={lbl}>Zone ID</label>
//                 <input style={inp} value={cfg.zoneId} onChange={e => set('zoneId', e.target.value)} placeholder="ZONA_A" />
//               </div>
//             </div>
//           </div>

//           {/* Fechadura ESP32 */}
//           <div>
//             <div style={sec}><LockClosedIcon style={{ width: 13, height: 13 }} /> Fechadura ESP32</div>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//               <div>
//                 <label style={lbl}>IP da Fechadura</label>
//                 <div style={{ display: 'flex', gap: 8 }}>
//                   <input style={{ ...inp, flex: 1 }} value={cfg.lockIp} onChange={e => set('lockIp', e.target.value)} placeholder="192.168.1.100" />
//                   <button onClick={testLock} disabled={!cfg.lockIp || testing} style={{
//                     background: testResult === 'ok' ? 'rgba(16,185,129,0.15)' : testResult === 'fail' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
//                     border: `1px solid ${testResult === 'ok' ? 'rgba(16,185,129,0.4)' : testResult === 'fail' ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.12)'}`,
//                     borderRadius: 8, padding: '8px 14px', cursor: cfg.lockIp && !testing ? 'pointer' : 'not-allowed',
//                     color: testResult === 'ok' ? '#10B981' : testResult === 'fail' ? '#EF4444' : '#9CA3AF',
//                     fontSize: 12, fontFamily: 'monospace', whiteSpace: 'nowrap',
//                     display: 'flex', alignItems: 'center', gap: 5,
//                   }}>
//                     {testing
//                       ? <ArrowPathIcon style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} />
//                       : testResult === 'ok' ? <CheckCircleIcon style={{ width: 12, height: 12 }} />
//                       : testResult === 'fail' ? <XCircleIcon style={{ width: 12, height: 12 }} />
//                       : <SignalIcon style={{ width: 12, height: 12 }} />}
//                     {testing ? 'Testando...' : testResult === 'ok' ? 'Online' : testResult === 'fail' ? 'Offline' : 'Testar'}
//                   </button>
//                 </div>
//                 {cfg.lockIp && (
//                   <div style={{ fontSize: 11, color: '#6B7280', fontFamily: 'monospace', marginTop: 4 }}>
//                     POST http://{cfg.lockIp}/unlock
//                   </div>
//                 )}
//               </div>
//               <div>
//                 <label style={lbl}>Tempo aberta (ms)</label>
//                 <input style={inp} type="number" value={cfg.lockMs}
//                   onChange={e => set('lockMs', parseInt(e.target.value) || 5000)}
//                   min={1000} max={30000} step={500} />
//                 <div style={{ fontSize: 11, color: '#6B7280', fontFamily: 'monospace', marginTop: 4 }}>
//                   {(cfg.lockMs / 1000).toFixed(1)}s aberta após GRANTED
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div style={{ display: 'flex', gap: 10, padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', justifyContent: 'flex-end' }}>
//           <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 20px', color: '#9CA3AF', cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
//             Cancelar
//           </button>
//           <button onClick={handleSave} style={{ background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)', border: 'none', borderRadius: 8, padding: '8px 24px', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', system-ui, sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
//             <CheckIcon style={{ width: 14, height: 14 }} />
//             Salvar
//           </button>
//         </div>
//       </div>
//       <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
//     </div>
//   )
// }

// // ─── CONSTANTS ────────────────────────────────────────────────────────────────
// let _API_BASE = loadConfig().apiBase
// //@ts-ignore
// let _WS_BASE  = _API_BASE.replace(/^http/, 'ws')
// const COMPANY_ID = 1

// const CFG = {
//   window_seconds: 9, fps: 15, confidence: 0.35, face_threshold: 0.45,
//   detect_faces: true, result_show_ms: 5000, idle_check_interval_ms: 1500,
//   person_trigger_confidence: 0.3,
// }

// type Phase = 'idle' | 'scanning' | 'granted' | 'denied_epi' | 'denied_face'

// interface Detection { class_name: string; confidence: number; bbox: { x:number;y:number;w:number;h:number } }
// interface FrameResult {
//   compliant: boolean; missing: string[]; detections: Detection[]
//   face_detected: boolean; face_recognized: boolean
//   face_person_code?: string; face_person_name?: string
//   face_confidence: number; window_progress: number; session_compliant_rate: number
// }
// interface Decision {
//   access_decision: 'GRANTED' | 'DENIED_EPI' | 'DENIED_FACE'
//   compliance_rate: number; face_rate: number
//   person_code?: string; person_name?: string; total_frames: number
// }

// const EPI_COLOR: Record<string,string> = { helmet:'#F59E0B',boots:'#8B5CF6',gloves:'#06B6D4',thermal_coat:'#10B981',thermal_pants:'#3B82F6',person:'#F43F5E' }
// const EPI_LABEL: Record<string,string> = { helmet:'Capacete',boots:'Botas',gloves:'Luvas',thermal_coat:'Jaleco Térmico',thermal_pants:'Calça Térmica',person:'Pessoa' }

// // ─── HOOK ─────────────────────────────────────────────────────────────────────
// function useKioskStream(stationCfg: StationConfig) {
//   const videoRef       = useRef<HTMLVideoElement>(null)
//   const canvasRef      = useRef<HTMLCanvasElement>(null)
//   const wsRef          = useRef<WebSocket | null>(null)
//   const wsTimerRef     = useRef<ReturnType<typeof setInterval> | null>(null)
//   const idleTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null)
//   const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
//   const mountedRef     = useRef(true)
//   const phaseRef       = useRef<Phase>('idle')

//   const [phase, setPhaseState]    = useState<Phase>('idle')
//   const [lastFrame, setLastFrame] = useState<FrameResult | null>(null)
//   const [decision, setDecision]   = useState<Decision | null>(null)
//   const [camReady, setCamReady]   = useState(false)
//   const [camError, setCamError]   = useState('')

//   const setPhase = useCallback((p: Phase) => { phaseRef.current = p; setPhaseState(p) }, [])

//   const captureFrame = useCallback((quality = 0.8): Promise<Blob | null> => {
//     return new Promise(resolve => {
//       const video = videoRef.current; const canvas = canvasRef.current
//       if (!video || !canvas || video.readyState < 2) return resolve(null)
//       canvas.width = video.videoWidth || 640; canvas.height = video.videoHeight || 360
//       canvas.getContext('2d')!.drawImage(video, 0, 0)
//       canvas.toBlob(resolve, 'image/jpeg', quality)
//     })
//   }, [])

//   const closeScan = useCallback(() => {
//     if (wsTimerRef.current) { clearInterval(wsTimerRef.current); wsTimerRef.current = null }
//     if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
//   }, [])

//   const goIdle = useCallback(() => {
//     closeScan(); setPhase('idle'); setLastFrame(null); setDecision(null)
//   }, [closeScan, setPhase])

//   // ── Aciona fechadura ──────────────────────────────────────────────────────
//   const triggerDoorOpen = useCallback((d: Decision) => {
//     const apiBase = stationCfg.apiBase
//     // 1. Log backend
//     try {
//       const fd = new FormData()
//       if (d.person_code) fd.append('person_code', d.person_code)
//       if (d.person_name) fd.append('person_name', d.person_name)
//       fd.append('reason', 'EPI_COMPLIANT')
//       if (stationCfg.doorId) fd.append('door_id', stationCfg.doorId)
//       if (stationCfg.zoneId) fd.append('zone_id', stationCfg.zoneId)
//       fetch(`${apiBase}/api/v1/epi/door/open`, { method: 'POST', body: fd })
//         .catch(e => console.warn('[door/open]', e))
//     } catch {}
//     // 2. ESP32 direto
//     if (stationCfg.lockIp) {
//       fetch(`http://${stationCfg.lockIp}/unlock`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ duration_ms: stationCfg.lockMs }),
//       })
//         .then(r => r.json())
//         .then(data => console.log('[ESP32] unlock:', data.state, data.duration_ms + 'ms'))
//         .catch(e => console.warn('[ESP32] não disponível:', e))
//     }
//   }, [stationCfg])

//   const openScan = useCallback(() => {
//     if (!mountedRef.current || phaseRef.current === 'scanning') return
//     closeScan(); setPhase('scanning'); setLastFrame(null)
//     const apiBase = stationCfg.apiBase
//     const wsBase  = apiBase.replace(/^http/, 'ws')
//     const params = new URLSearchParams({
//       company_id: String(COMPANY_ID), window_seconds: String(CFG.window_seconds),
//       fps: String(CFG.fps), confidence: String(CFG.confidence),
//       face_threshold: String(CFG.face_threshold), detect_faces: String(CFG.detect_faces),
//     })
//     const ws = new WebSocket(`${wsBase}/api/v1/epi/ws/epi-stream?${params}`)
//     wsRef.current = ws
//     ws.onmessage = (ev) => {
//       if (!mountedRef.current) return
//       try {
//         const msg = JSON.parse(ev.data as string)
//         if (msg.type === 'frame_result') setLastFrame(msg as FrameResult)
//         if (msg.type === 'decision') {
//           const d = msg as Decision
//           closeScan(); setDecision(d)
//           const p: Phase = d.access_decision === 'GRANTED' ? 'granted'
//             : d.access_decision === 'DENIED_EPI' ? 'denied_epi' : 'denied_face'
//           setPhase(p)
//           if (d.access_decision === 'GRANTED') triggerDoorOpen(d)
//           resultTimerRef.current = setTimeout(() => { if (mountedRef.current) goIdle() }, CFG.result_show_ms)
//         }
//       } catch {}
//     }
//     ws.onopen = () => {
//       const interval = Math.round(1000 / CFG.fps)
//       wsTimerRef.current = setInterval(async () => {
//         if (ws.readyState !== WebSocket.OPEN) return
//         const blob = await captureFrame(0.8)
//         if (blob && ws.readyState === WebSocket.OPEN) ws.send(blob)
//       }, interval)
//     }
//     ws.onclose = () => { if (wsTimerRef.current) { clearInterval(wsTimerRef.current); wsTimerRef.current = null } }
//   }, [closeScan, setPhase, goIdle, captureFrame, triggerDoorOpen, stationCfg])

//   const startIdleDetection = useCallback(() => {
//     if (idleTimerRef.current) clearInterval(idleTimerRef.current)
//     idleTimerRef.current = setInterval(async () => {
//       if (!mountedRef.current || phaseRef.current !== 'idle') return
//       const blob = await captureFrame(0.6); if (!blob) return
//       try {
//         const fd = new FormData()
//         fd.append('file', blob, 'frame.jpg'); fd.append('confidence', String(CFG.confidence)); fd.append('detect_faces', 'false')
//         const r = await fetch(`${stationCfg.apiBase}/api/v1/epi/detect/frame?company_id=${COMPANY_ID}`, { method: 'POST', body: fd })
//         const data = await r.json()
//         const dets: Detection[] = data.detections ?? []
//         const hasPerson = dets.some(d => d.class_name === 'person' && d.confidence >= CFG.person_trigger_confidence)
//         if (hasPerson && phaseRef.current === 'idle') openScan()
//       } catch {}
//     }, CFG.idle_check_interval_ms)
//   }, [captureFrame, openScan, stationCfg])

//   useEffect(() => {
//     mountedRef.current = true
//     ;(async () => {
//       try {
//         let stream: MediaStream
//         try { stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' }, audio: false }) }
//         catch { stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }) }
//         if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return }
//         if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
//         setCamReady(true)
//       } catch (e: unknown) { setCamError(e instanceof Error ? e.message : 'Erro ao acessar câmera') }
//     })()
//     return () => {
//       mountedRef.current = false
//       if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
//       closeScan()
//       if (idleTimerRef.current) clearInterval(idleTimerRef.current)
//       if (resultTimerRef.current) clearTimeout(resultTimerRef.current)
//     }
//   }, [closeScan])

//   useEffect(() => {
//     if (!camReady) return
//     startIdleDetection()
//     return () => { if (idleTimerRef.current) clearInterval(idleTimerRef.current) }
//   }, [camReady, startIdleDetection])

//   return { videoRef, canvasRef, phase, lastFrame, decision, camReady, camError }
// }

// // ─── OVERLAY ──────────────────────────────────────────────────────────────────
// function Overlay({ frame, vw, vh, ow, oh }: { frame: FrameResult | null; vw:number;vh:number;ow:number;oh:number }) {
//   if (!frame?.detections.length) return null
//   const sx = ow/(vw||1); const sy = oh/(vh||1)
//   const MARGIN = 0.08
//   const filtered = frame.detections.filter(d => {
//     const cx = (d.bbox.x+d.bbox.w/2)/(vw||1); const cy = (d.bbox.y+d.bbox.h/2)/(vh||1)
//     return cx>MARGIN && cx<(1-MARGIN) && cy>MARGIN && cy<(1-MARGIN)
//   })
//   if (!filtered.length) return null
//   return (
//     <svg style={{ position:'absolute',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none' }}>
//       {filtered.map((d,i) => {
//         const {x,y,w,h} = d.bbox; const c = EPI_COLOR[d.class_name]??'#fff'
//         const label = `${EPI_LABEL[d.class_name]??d.class_name} ${Math.round(d.confidence*100)}%`
//         return (
//           <g key={d.class_name+i}>
//             <rect x={x*sx} y={y*sy} width={w*sx} height={h*sy} fill={`${c}18`} stroke={c} strokeWidth={2.5} rx={6}/>
//             <rect x={x*sx} y={Math.max(0,y*sy-22)} width={label.length*8+8} height={22} fill={c} rx={4}/>
//             <text x={x*sx+5} y={Math.max(15,y*sy-6)} fill="#fff" fontSize={12} fontFamily="monospace" fontWeight={700}>{label}</text>
//           </g>
//         )
//       })}
//     </svg>
//   )
// }

// // ─── RESULTADO ────────────────────────────────────────────────────────────────
// function ResultOverlay({ phase, decision }: { phase: Phase; decision: Decision | null }) {
//   const granted=phase==='granted'; const deniedEpi=phase==='denied_epi'
//   const color=granted?'#10B981':'#EF4444'; const bg=granted?'rgba(6,78,59,0.96)':'rgba(69,10,10,0.96)'
//   const Icon=granted?CheckCircleIcon:deniedEpi?ShieldExclamationIcon:XCircleIcon
//   const title=granted?'ACESSO LIBERADO':deniedEpi?'EPI INCOMPLETO':'FACE NÃO IDENTIFICADA'
//   return (
//     <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:bg,backdropFilter:'blur(8px)' }}>
//       <style>{`@keyframes pop{0%{transform:scale(.3);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
//       <div style={{ marginBottom:20,filter:`drop-shadow(0 0 40px ${color})`,animation:'pop .5s cubic-bezier(.34,1.56,.64,1)' }}>
//         <Icon style={{ width:100,height:100,color }}/>
//       </div>
//       <div style={{ fontSize:44,fontWeight:900,color,letterSpacing:'-0.03em',marginBottom:12,textAlign:'center',textShadow:`0 0 30px ${color}88`,animation:'slideUp .4s ease .1s both',fontFamily:"'DM Sans',system-ui,sans-serif" }}>{title}</div>
//       {(decision?.person_name||decision?.person_code) && (
//         <div style={{ fontSize:22,color:'#E5E7EB',marginBottom:24,animation:'slideUp .4s ease .2s both',display:'flex',alignItems:'center',gap:8 }}>
//           <UserIcon style={{ width:22,height:22 }}/>{decision.person_name??decision.person_code}
//         </div>
//       )}
//       <div style={{ display:'flex',gap:16,animation:'slideUp .4s ease .3s both' }}>
//         {[{l:'Conformidade',v:`${Math.round((decision?.compliance_rate??0)*100)}%`},{l:'Face',v:`${Math.round((decision?.face_rate??0)*100)}%`},{l:'Frames',v:String(decision?.total_frames??0)}].map(s=>(
//           <div key={s.l} style={{ background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:12,padding:'12px 20px',textAlign:'center' }}>
//             <div style={{ fontSize:11,color:'#9CA3AF',fontFamily:'monospace',textTransform:'uppercase' }}>{s.l}</div>
//             <div style={{ fontSize:26,fontWeight:700,color:'#F9FAFB' }}>{s.v}</div>
//           </div>
//         ))}
//       </div>
//       {/* Indicador de fechadura */}
//       {granted && loadConfig().lockIp && (
//         <div style={{ marginTop:20,display:'flex',alignItems:'center',gap:6,padding:'4px 14px',background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:20,fontSize:12,color:'#86EFAC',fontFamily:'monospace',animation:'slideUp .4s ease .4s both' }}>
//           <LockClosedIcon style={{ width:12,height:12 }}/> Fechadura aberta
//         </div>
//       )}
//     </div>
//   )
// }

// // ─── IDLE OVERLAY ─────────────────────────────────────────────────────────────
// function IdleOverlay({ camError }: { camError: string }) {
//   if (camError) return (
//     <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#0A0F1A' }}>
//       <XCircleIcon style={{ width:48,height:48,color:'#EF4444',marginBottom:12 }}/>
//       <div style={{ fontSize:18,fontWeight:600,color:'#EF4444',marginBottom:8 }}>Câmera indisponível</div>
//       <div style={{ fontSize:13,color:'#6B7280',fontFamily:'monospace',maxWidth:280,textAlign:'center' }}>{camError}</div>
//     </div>
//   )
//   return (
//     <div style={{ position:'absolute',inset:0,pointerEvents:'none',display:'flex',flexDirection:'column',justifyContent:'flex-end' }}>
//       <style>{`@keyframes breathe{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}`}</style>
//       <div style={{ background:'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)',padding:'48px 24px 28px',display:'flex',alignItems:'center',justifyContent:'center',gap:14 }}>
//         <div style={{ width:52,height:52,borderRadius:'50%',background:'rgba(59,130,246,0.15)',border:'2px solid rgba(59,130,246,0.4)',display:'flex',alignItems:'center',justifyContent:'center',animation:'breathe 2.5s ease-in-out infinite' }}>
//           <CameraIcon style={{ width:26,height:26,color:'#60A5FA' }}/>
//         </div>
//         <div>
//           <div style={{ fontSize:20,fontWeight:700,color:'#F9FAFB',letterSpacing:'-0.01em' }}>Posicione-se em frente à câmera</div>
//           <div style={{ fontSize:14,color:'#9CA3AF',marginTop:2 }}>A verificação de EPI iniciará automaticamente</div>
//         </div>
//       </div>
//     </div>
//   )
// }

// // ─── STATUS BAR ───────────────────────────────────────────────────────────────
// function StatusBar({ phase, frame, hasMultipleCams, onSwitch, onConfig }: {
//   phase: Phase; frame: FrameResult | null
//   hasMultipleCams?: boolean; onSwitch?: () => void; onConfig?: () => void
// }) {
//   const scanning=phase==='scanning'; const progress=frame?.window_progress??0
//   const rate=frame?.session_compliant_rate??0
//   const rateColor=rate>0.7?'#10B981':rate>0.4?'#F59E0B':'#EF4444'
//   const btnStyle: React.CSSProperties = { background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,padding:'4px 10px',cursor:'pointer',display:'flex',alignItems:'center',gap:5,color:'#9CA3AF',fontSize:11,fontFamily:'monospace' }
//   return (
//     <div style={{ position:'absolute',top:0,left:0,right:0,zIndex:10,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(10px)',display:'flex',alignItems:'center',gap:12,padding:'10px 16px',borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
//       <ShieldCheckIcon style={{ width:20,height:20,color:'#60A5FA' }}/>
//       <span style={{ fontWeight:700,fontSize:15,color:'#F9FAFB',flex:1 }}>EPI Check Station</span>
//       {scanning && (
//         <>
//           <div style={{ width:100,height:5,background:'rgba(255,255,255,0.1)',borderRadius:3,overflow:'hidden' }}>
//             <div style={{ height:'100%',borderRadius:3,transition:'width .3s',background:`linear-gradient(90deg,#3B82F6,${rateColor})`,width:`${progress*100}%` }}/>
//           </div>
//           <span style={{ fontSize:12,fontFamily:'monospace',color:rateColor,fontWeight:700 }}>{Math.round(rate*100)}%</span>
//           {frame?.face_recognized && (
//             <span style={{ background:'rgba(16,185,129,0.2)',color:'#10B981',border:'1px solid rgba(16,185,129,0.4)',borderRadius:20,padding:'2px 10px',fontSize:11,fontFamily:'monospace',display:'flex',alignItems:'center',gap:4 }}>
//               <CheckIcon style={{ width:10,height:10 }}/>{frame.face_person_name??frame.face_person_code??'OK'}
//             </span>
//           )}
//         </>
//       )}
//       {hasMultipleCams && (
//         <button onClick={onSwitch} style={btnStyle}>
//           <ArrowPathIcon style={{ width:13,height:13 }}/> Trocar câmera
//         </button>
//       )}
//       <button onClick={onConfig} style={btnStyle}>
//         <Cog6ToothIcon style={{ width:13,height:13 }}/> Config
//       </button>
//       <span style={{ background:scanning?'rgba(245,158,11,0.15)':'rgba(59,130,246,0.12)',color:scanning?'#F59E0B':'#60A5FA',border:`1px solid ${scanning?'rgba(245,158,11,0.3)':'rgba(59,130,246,0.25)'}`,borderRadius:20,padding:'3px 12px',fontSize:11,fontFamily:'monospace',display:'flex',alignItems:'center',gap:5 }}>
//         {scanning?<><BoltIcon style={{ width:11,height:11 }}/> ESCANEANDO</>:<><EyeIcon style={{ width:11,height:11 }}/> AGUARDANDO</>}
//       </span>
//     </div>
//   )
// }

// // ─── SIDEBAR ──────────────────────────────────────────────────────────────────
// function EpiSidebar({ frame }: { frame: FrameResult | null }) {
//   const detected=frame?.detections.map(d=>d.class_name)??[]; const missing=frame?.missing??[]; const rate=frame?.session_compliant_rate??0
//   return (
//     <div style={{ width:240,background:'rgba(10,15,26,0.92)',backdropFilter:'blur(12px)',borderLeft:'1px solid rgba(255,255,255,0.07)',padding:'68px 16px 16px',display:'flex',flexDirection:'column',alignItems:'center',gap:12,overflowY:'auto' }}>
//       <EpiBodyFigure detected={detected} missing={missing} size="md" showLabels={true}/>
//       <div style={{ width:'100%',padding:'10px 12px',background:frame?.face_recognized?'rgba(16,185,129,0.08)':'rgba(255,255,255,0.03)',border:`1px solid ${frame?.face_recognized?'rgba(16,185,129,0.3)':'rgba(255,255,255,0.07)'}`,borderRadius:10,textAlign:'center',transition:'all .3s' }}>
//         <div style={{ display:'flex',justifyContent:'center',marginBottom:4 }}>
//           {frame?.face_recognized?<FaceSmileIcon style={{ width:26,height:26,color:'#10B981' }}/>:frame?.face_detected?<UserIcon style={{ width:26,height:26,color:'#F59E0B' }}/>:<UserIcon style={{ width:26,height:26,color:'#6B7280' }}/>}
//         </div>
//         <div style={{ fontSize:11,color:frame?.face_recognized?'#86EFAC':'#6B7280',fontFamily:'monospace' }}>
//           {frame?.face_recognized?(frame.face_person_name??frame.face_person_code??'Identificado'):frame?.face_detected?'Identificando...':'Sem face'}
//         </div>
//         {frame?.face_recognized&&<div style={{ fontSize:10,color:'#10B981',fontFamily:'monospace',marginTop:2 }}>{Math.round((frame.face_confidence??0)*100)}% conf.</div>}
//       </div>
//       <div style={{ width:'100%',padding:'10px',textAlign:'center',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10 }}>
//         <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:4,marginBottom:2 }}>
//           {rate>0.7?<ShieldCheckIcon style={{ width:12,height:12,color:'#10B981' }}/>:<ShieldExclamationIcon style={{ width:12,height:12,color:rate>0.4?'#F59E0B':'#EF4444' }}/>}
//           <div style={{ fontSize:10,color:'#6B7280',fontFamily:'monospace',textTransform:'uppercase' }}>Conformidade</div>
//         </div>
//         <div style={{ fontSize:32,fontWeight:800,color:rate>0.7?'#10B981':rate>0.4?'#F59E0B':'#EF4444' }}>{Math.round(rate*100)}%</div>
//       </div>
//     </div>
//   )
// }

// // ─── MAIN ─────────────────────────────────────────────────────────────────────
// export default function EpiCameraStation() {
//   const [stationCfg, setStationCfg] = useState<StationConfig>(loadConfig)
//   const [showConfig, setShowConfig] = useState(false)

//   const { videoRef, canvasRef, phase, lastFrame, decision, camReady, camError } = useKioskStream(stationCfg)
//   const containerRef = useRef<HTMLDivElement>(null)
//   const [vSize, setVSize] = useState({ w:1280,h:720 })
//   const [oSize, setOSize] = useState({ w:0,h:0 })
//   const [facingMode, setFacingMode] = useState<'environment'|'user'>('environment')
//   const [hasMultipleCams, setHasMultipleCams] = useState(false)
//   const [showName, setShowName] = useState(false)
//   const nameTimerRef  = useRef<ReturnType<typeof setTimeout>|null>(null)
//   const lastPersonRef = useRef<string|null>(null)

//   useEffect(() => {
//     navigator.mediaDevices.enumerateDevices()
//       .then(d => setHasMultipleCams(d.filter(x=>x.kind==='videoinput').length>1))
//       .catch(()=>{})
//   }, [])

//   const switchCamera = useCallback(async () => {
//     const newMode = facingMode==='environment'?'user':'environment'; setFacingMode(newMode)
//     if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t=>t.stop())
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video:{facingMode:newMode,width:{ideal:1280},height:{ideal:720}},audio:false })
//       if (videoRef.current) { videoRef.current.srcObject=stream; await videoRef.current.play() }
//     } catch {
//       const stream = await navigator.mediaDevices.getUserMedia({ video:true,audio:false })
//       if (videoRef.current) { videoRef.current.srcObject=stream; await videoRef.current.play() }
//     }
//   }, [facingMode, videoRef])

//   useEffect(() => {
//     const personId = lastFrame?.face_person_code??lastFrame?.face_person_name??null
//     if (phase==='scanning'&&lastFrame?.face_recognized&&personId&&personId!==lastPersonRef.current) {
//       lastPersonRef.current=personId; setShowName(true)
//       if (nameTimerRef.current) clearTimeout(nameTimerRef.current)
//       nameTimerRef.current=setTimeout(()=>setShowName(false),3000)
//     }
//     if (phase!=='scanning') { setShowName(false); lastPersonRef.current=null; if (nameTimerRef.current) clearTimeout(nameTimerRef.current) }
//   }, [phase,lastFrame?.face_recognized,lastFrame?.face_person_code,lastFrame?.face_person_name])

//   useEffect(() => {
//     const v=videoRef.current; if (!v) return
//     const h=()=>setVSize({w:v.videoWidth,h:v.videoHeight})
//     v.addEventListener('loadedmetadata',h); return ()=>v.removeEventListener('loadedmetadata',h)
//   }, [videoRef])

//   useEffect(() => {
//     if (!containerRef.current) return
//     const ro=new ResizeObserver(e=>{for(const x of e)setOSize({w:x.contentRect.width,h:x.contentRect.height})})
//     ro.observe(containerRef.current); return ()=>ro.disconnect()
//   }, [])

//   const scanning=phase==='scanning'; const showResult=phase!=='idle'&&phase!=='scanning'

//   return (
//     <div style={{ width:'100%',height:'100vh',background:'#000',display:'flex',flexDirection:'column',overflow:'hidden',fontFamily:"'DM Sans',system-ui,sans-serif",userSelect:'none',WebkitUserSelect:'none' }}>
//       {showConfig && (
//         <ConfigModal
//           onClose={()=>setShowConfig(false)}
//           onSave={(cfg)=>setStationCfg(cfg)}
//         />
//       )}
//       <div style={{ flex:1,display:'flex',overflow:'hidden' }}>
//         <div ref={containerRef} style={{ flex:1,position:'relative',background:'#111',overflow:'hidden' }}>
//           <video ref={videoRef} autoPlay playsInline muted style={{ width:'100%',height:'100%',objectFit:'cover',opacity:camReady?1:0,transition:'opacity .5s' }}/>
//           <canvas ref={canvasRef} style={{ display:'none' }}/>
//           {(scanning||phase==='idle')&&camReady&&<Overlay frame={lastFrame} vw={vSize.w} vh={vSize.h} ow={oSize.w} oh={oSize.h}/>}
//           {phase==='idle'&&<IdleOverlay camError={camError}/>}
//           {showResult&&<ResultOverlay phase={phase} decision={decision}/>}
//           {camReady&&<StatusBar phase={phase} frame={lastFrame} hasMultipleCams={hasMultipleCams} onSwitch={switchCamera} onConfig={()=>setShowConfig(true)}/>}
//           {scanning&&showName&&lastFrame?.face_recognized&&(
//             <div style={{ position:'absolute',bottom:40,left:0,right:0,display:'flex',flexDirection:'column',alignItems:'center',animation:'slideUp .4s ease both',pointerEvents:'none',zIndex:5 }}>
//               <style>{`@keyframes nameGlow{0%,100%{text-shadow:0 0 30px #10B98188,0 0 60px #10B98144}50%{text-shadow:0 0 50px #10B981cc,0 0 100px #10B98166}}`}</style>
//               <div style={{ width:64,height:64,borderRadius:'50%',marginBottom:10,background:'rgba(16,185,129,0.15)',border:'3px solid #10B981',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 30px rgba(16,185,129,0.4)' }}>
//                 <UserIcon style={{ width:34,height:34,color:'#10B981' }}/>
//               </div>
//               <div style={{ fontSize:48,fontWeight:900,color:'#10B981',letterSpacing:'-0.03em',lineHeight:1,fontFamily:"'DM Sans',system-ui,sans-serif",animation:'nameGlow 2s ease-in-out infinite',textAlign:'center' }}>
//                 {lastFrame.face_person_name??lastFrame.face_person_code}
//               </div>
//               <div style={{ fontSize:13,color:'#86EFAC',fontFamily:'monospace',marginTop:6,background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:20,padding:'2px 12px' }}>
//                 {Math.round((lastFrame.face_confidence??0)*100)}% confiança
//               </div>
//             </div>
//           )}
//           {scanning&&(
//             <div style={{ position:'absolute',bottom:0,left:0,right:0,height:5,background:'rgba(0,0,0,0.4)' }}>
//               <div style={{ height:'100%',background:`linear-gradient(90deg,#3B82F6,${(lastFrame?.session_compliant_rate??0)>0.5?'#10B981':'#EF4444'})`,width:`${(lastFrame?.window_progress??0)*100}%`,transition:'width .3s' }}/>
//             </div>
//           )}
//         </div>
//         {scanning&&<EpiSidebar frame={lastFrame}/>}
//       </div>
//     </div>
//   )
// }



// src/pages/EpiCameraStation.tsx  — v2.0
// ─────────────────────────────────────────────────────────────────────────────
// Melhorias v2:
//   1. Responsivo — layout portrait/landscape, boneco visível em tablets menores
//   2. Câmera de entrada E saída (ENTRY/EXIT) com direção configurável
//   3. Suporte a câmera USB (deviceId), IP (MJPEG/HLS via <video src>) e local
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  ShieldCheckIcon, ShieldExclamationIcon, CheckCircleIcon, XCircleIcon,
   UserIcon, BoltIcon, EyeIcon, FaceSmileIcon, ArrowPathIcon,
  Cog6ToothIcon, LockClosedIcon, 
  SignalIcon, ArrowRightOnRectangleIcon, ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/24/solid'
import { useTabletLayout } from '../hooks/useTabletLayout'
import EpiBodyFigure from '../components/EpiBodyFigure'

// ─── TIPOS ───────────────────────────────────────────────────────────────────
type Direction   = 'ENTRY' | 'EXIT'
type CamSource   = 'usb' | 'ip'
type Phase       = 'idle' | 'scanning' | 'granted' | 'denied_epi' | 'denied_face'

interface StationConfig {
  lockIp:    string
  lockMs:    number
  doorId:    string
  zoneId:    string
  apiBase:   string
  // Câmera
  camSource:    CamSource   // 'usb' | 'ip'
  camDeviceId:  string      // USB: deviceId selecionado
  camIpUrl:     string      // IP: URL MJPEG/HLS ex: http://192.168.1.50:8080/video
}

interface Detection { class_name: string; confidence: number; bbox: { x:number;y:number;w:number;h:number } }
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
const CONFIG_KEY = 'epi_station_config_v2'

function defaultConfig(): StationConfig {
  return {
    lockIp:      sessionStorage.getItem('lockIp')      ?? '192.168.68.100',
    lockMs:      5000,
    doorId:      'DOOR_CAMARA_FRIA_01',
    zoneId:      '10',
    apiBase:     sessionStorage.getItem('apiEndpoint') ?? 'https://aihub.smartxhub.cloud',
    camSource:   'usb',
    camDeviceId: '',
    camIpUrl:    '',
  }
}

function loadConfig(): StationConfig {
  try {
    const s = localStorage.getItem(CONFIG_KEY)
    if (s) return { ...defaultConfig(), ...JSON.parse(s) }
  } catch {}
  return defaultConfig()
}

function saveConfig(cfg: StationConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg))
  sessionStorage.setItem('lockIp',      cfg.lockIp)
  sessionStorage.setItem('apiEndpoint', cfg.apiBase)
}

const EPI_COLOR: Record<string,string> = {
  helmet:'#F59E0B',boots:'#8B5CF6',gloves:'#06B6D4',
  thermal_coat:'#10B981',thermal_pants:'#3B82F6',person:'#F43F5E',
}
const EPI_LABEL: Record<string,string> = {
  helmet:'Capacete',boots:'Botas',gloves:'Luvas',
  thermal_coat:'Jaleco Térmico',thermal_pants:'Calça Térmica',person:'Pessoa',
}

const CFG = {
  window_seconds:9, fps:15, confidence:0.35, face_threshold:0.45,
  detect_faces:true, result_show_ms:5000, idle_check_interval_ms:1500,
  person_trigger_confidence:0.3,
}

// ─── HOOK: câmera (USB ou IP) ─────────────────────────────────────────────────
function useCameraStream(cfg: StationConfig) {
  const videoRef  = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady]   = useState(false)
  const [error, setError]   = useState('')
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])

  // Enumera câmeras USB
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
      .then(d => setDevices(d.filter(x => x.kind === 'videoinput')))
      .catch(() => {})
  }, [])

  // Inicia stream conforme tipo
  useEffect(() => {
    let active = true
    setReady(false); setError('')

    const start = async () => {
      try {
        if (cfg.camSource === 'ip' && cfg.camIpUrl) {
          // IP camera via <video src> (MJPEG/HLS)
          if (videoRef.current) {
            videoRef.current.srcObject = null
            videoRef.current.src = cfg.camIpUrl
            await videoRef.current.play()
            if (active) setReady(true)
          }
        } else {
          // USB / webcam local
          const constraints: MediaStreamConstraints = {
            video: cfg.camDeviceId
              ? { deviceId: { exact: cfg.camDeviceId }, width:{ideal:1280}, height:{ideal:720} }
              : { width:{ideal:1280}, height:{ideal:720}, facingMode:'environment' },
            audio: false,
          }
          let stream: MediaStream
          try { stream = await navigator.mediaDevices.getUserMedia(constraints) }
          catch { stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:false }) }
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

// ─── HOOK: lógica de scan (WebSocket + idle detection) ───────────────────────
function useKioskLogic(
  stationCfg: StationConfig,
  captureFrame: (q?: number) => Promise<Blob | null>,
  camReady: boolean,
) {
  const wsRef          = useRef<WebSocket | null>(null)
  const wsTimerRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  //@ts-ignore
  const idleTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef     = useRef(true)
  const phaseRef       = useRef<Phase>('idle')

  const [phase, setPhaseState]    = useState<Phase>('idle')
  const [lastFrame, setLastFrame] = useState<FrameResult | null>(null)
  const [decision, setDecision]   = useState<Decision | null>(null)
  const [direction, setDirection] = useState<Direction>('ENTRY')

  const setPhase = useCallback((p: Phase) => { phaseRef.current = p; setPhaseState(p) }, [])

  const closeScan = useCallback(() => {
    if (wsTimerRef.current) { clearInterval(wsTimerRef.current); wsTimerRef.current = null }
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
  }, [])

  const goIdle = useCallback(() => {
    closeScan(); setPhase('idle'); setLastFrame(null); setDecision(null)
  }, [closeScan, setPhase])

  const triggerDoor = useCallback((d: Decision, dir: Direction) => {
    const { apiBase, doorId, zoneId, lockIp, lockMs } = stationCfg
    try {
      const fd = new FormData()
      if (d.person_code) fd.append('person_code', d.person_code)
      if (d.person_name) fd.append('person_name', d.person_name)
      fd.append('reason', dir === 'ENTRY' ? 'EPI_COMPLIANT_ENTRY' : 'EXIT')
      if (doorId) fd.append('door_id', doorId)
      if (zoneId) fd.append('zone_id', zoneId)
      fd.append('direction', dir)
      fetch(`${apiBase}/api/v1/epi/door/open`, { method:'POST', body:fd }).catch(() => {})
    } catch {}
    if (lockIp) {
      fetch(`http://${lockIp}/unlock`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ duration_ms: lockMs }),
      }).then(r => r.json()).then(d => console.log('[ESP32]', d.state)).catch(() => {})
    }
  }, [stationCfg])

  const openScan = useCallback((dir: Direction) => {
    if (!mountedRef.current || phaseRef.current === 'scanning') return
    closeScan(); setPhase('scanning'); setLastFrame(null); setDirection(dir)
    const { apiBase } = stationCfg
    const wsBase = apiBase.replace(/^http/, 'ws')
    const params = new URLSearchParams({
      company_id: '1', window_seconds: String(CFG.window_seconds),
      fps: String(CFG.fps), confidence: String(CFG.confidence),
      face_threshold: String(CFG.face_threshold), detect_faces: String(CFG.detect_faces),
    })
    const ws = new WebSocket(`${wsBase}/api/v1/epi/ws/epi-stream?${params}`)
    wsRef.current = ws
    ws.onmessage = ev => {
      if (!mountedRef.current) return
      try {
        const msg = JSON.parse(ev.data as string)
        if (msg.type === 'frame_result') setLastFrame(msg as FrameResult)
        if (msg.type === 'decision') {
          const d = msg as Decision; closeScan(); setDecision(d)
          const p: Phase = d.access_decision === 'GRANTED' ? 'granted'
            : d.access_decision === 'DENIED_EPI' ? 'denied_epi' : 'denied_face'
          setPhase(p)
          if (d.access_decision === 'GRANTED') triggerDoor(d, dir)
          resultTimerRef.current = setTimeout(() => { if (mountedRef.current) goIdle() }, CFG.result_show_ms)
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
    ws.onclose = () => { if (wsTimerRef.current) { clearInterval(wsTimerRef.current); wsTimerRef.current = null } }
  }, [closeScan, setPhase, goIdle, captureFrame, triggerDoor, stationCfg])

  // idle detection
  useEffect(() => {
    if (!camReady) return
    mountedRef.current = true
    const timer = setInterval(async () => {
      if (!mountedRef.current || phaseRef.current !== 'idle') return
      const blob = await captureFrame(0.6); if (!blob) return
      try {
        const fd = new FormData()
        fd.append('file', blob, 'frame.jpg'); fd.append('confidence', String(CFG.confidence)); fd.append('detect_faces', 'false')
        const r = await fetch(`${stationCfg.apiBase}/api/v1/epi/detect/frame?company_id=1`, { method:'POST', body:fd })
        const data = await r.json()
        const dets: Detection[] = data.detections ?? []
        if (dets.some(d => d.class_name === 'person' && d.confidence >= CFG.person_trigger_confidence) && phaseRef.current === 'idle')
          openScan('ENTRY') // padrão: entrada
      } catch {}
    }, CFG.idle_check_interval_ms)
    return () => { mountedRef.current = false; clearInterval(timer); closeScan(); if (resultTimerRef.current) clearTimeout(resultTimerRef.current) }
  }, [camReady, captureFrame, openScan, closeScan, stationCfg])

  return { phase, lastFrame, decision, direction, openScan, goIdle }
}

// ─── MODAL CONFIG ─────────────────────────────────────────────────────────────
function ConfigModal({ onClose, onSave, devices }: {
  onClose: () => void; onSave: (cfg: StationConfig) => void; devices: MediaDeviceInfo[]
}) {
  const [cfg, setCfg] = useState<StationConfig>(loadConfig)
  const [testing, setTesting]       = useState(false)
  const [testResult, setTestResult] = useState<'ok'|'fail'|null>(null)
  const [tab, setTab]               = useState<'cam'|'door'|'api'>('cam')

  const set = (k: keyof StationConfig, v: string | number) => setCfg(p => ({ ...p, [k]: v }))
  const handleSave = () => { saveConfig(cfg); onSave(cfg); onClose() }

  const testLock = async () => {
    if (!cfg.lockIp) return
    setTesting(true); setTestResult(null)
    try { const r = await fetch(`http://${cfg.lockIp}/status`, { signal: AbortSignal.timeout(3000) }); setTestResult(r.ok ? 'ok' : 'fail') }
    catch { setTestResult('fail') } finally { setTesting(false) }
  }

  const inp: React.CSSProperties = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, color:'#F9FAFB', padding:'8px 12px', fontSize:13, fontFamily:'monospace', outline:'none', boxSizing:'border-box' }
  const lbl: React.CSSProperties = { fontSize:11, color:'#9CA3AF', fontFamily:'monospace', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4, display:'block' }
  const tabBtn = (active: boolean): React.CSSProperties => ({ padding:'6px 14px', borderRadius:6, border:'none', cursor:'pointer', fontSize:12, fontFamily:'monospace', background:active?'rgba(59,130,246,0.2)':'transparent', color:active?'#60A5FA':'#6B7280', borderBottom:active?'2px solid #3B82F6':'2px solid transparent' })

  return (
    <div style={{ position:'fixed',inset:0,zIndex:100,background:'rgba(0,0,0,0.8)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <div style={{ background:'#0D1117',border:'1px solid rgba(255,255,255,0.1)',borderRadius:16,width:'100%',maxWidth:460,fontFamily:"'DM Sans',system-ui,sans-serif",overflow:'hidden',boxShadow:'0 25px 50px rgba(0,0,0,0.5)' }}>

        {/* Header */}
        <div style={{ display:'flex',alignItems:'center',gap:10,padding:'16px 20px',borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <Cog6ToothIcon style={{ width:18,height:18,color:'#60A5FA' }}/>
          <span style={{ fontWeight:700,fontSize:15,color:'#F9FAFB',flex:1 }}>Configurações da Estação</span>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',color:'#6B7280' }}><XCircleIcon style={{ width:18,height:18 }}/></button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex',gap:4,padding:'10px 16px 0',borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          {([['cam','📷 Câmera'],['door','🔒 Fechadura'],['api','🌐 API']] as [typeof tab, string][]).map(([id,label]) => (
            <button key={id} style={tabBtn(tab===id)} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding:20,display:'flex',flexDirection:'column',gap:14,maxHeight:'55vh',overflowY:'auto' }}>

          {/* ── CÂMERA ── */}
          {tab === 'cam' && (
            <>
              <div>
                <label style={lbl}>Tipo de câmera</label>
                <div style={{ display:'flex',gap:8 }}>
                  {([['usb','USB / Webcam'],['ip','IP / RTSP']] as [CamSource,string][]).map(([v,l]) => (
                    <button key={v} onClick={() => set('camSource', v)} style={{ flex:1, padding:'8px', borderRadius:8, border:`1px solid ${cfg.camSource===v?'#3B82F6':'rgba(255,255,255,0.12)'}`, background:cfg.camSource===v?'rgba(59,130,246,0.15)':'transparent', color:cfg.camSource===v?'#60A5FA':'#9CA3AF', cursor:'pointer', fontSize:12, fontFamily:'monospace' }}>
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
                    {devices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Câmera ${d.deviceId.slice(0,8)}`}</option>)}
                  </select>
                </div>
              )}

              {cfg.camSource === 'ip' && (
                <div>
                  <label style={lbl}>URL da Câmera IP</label>
                  <input style={inp} value={cfg.camIpUrl} onChange={e => set('camIpUrl', e.target.value)} placeholder="http://192.168.1.50:8080/video ou rtsp://..." />
                  <div style={{ fontSize:11,color:'#6B7280',fontFamily:'monospace',marginTop:4 }}>
                    Suporta MJPEG (HTTP) e HLS (M3U8). RTSP requer proxy backend.
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── FECHADURA ── */}
          {tab === 'door' && (
            <>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <div><label style={lbl}>Door ID</label><input style={inp} value={cfg.doorId} onChange={e => set('doorId', e.target.value)} placeholder="DOOR_01"/></div>
                <div><label style={lbl}>Zone ID</label><input style={inp} value={cfg.zoneId} onChange={e => set('zoneId', e.target.value)} placeholder="10"/></div>
              </div>
              <div>
                <label style={lbl}>IP da Fechadura (ESP32)</label>
                <div style={{ display:'flex',gap:8 }}>
                  <input style={{ ...inp,flex:1 }} value={cfg.lockIp} onChange={e => set('lockIp', e.target.value)} placeholder="192.168.68.100"/>
                  <button onClick={testLock} disabled={!cfg.lockIp||testing} style={{ background:testResult==='ok'?'rgba(16,185,129,0.15)':testResult==='fail'?'rgba(239,68,68,0.15)':'rgba(255,255,255,0.06)', border:`1px solid ${testResult==='ok'?'rgba(16,185,129,0.4)':testResult==='fail'?'rgba(239,68,68,0.4)':'rgba(255,255,255,0.12)'}`, borderRadius:8,padding:'8px 12px',cursor:cfg.lockIp&&!testing?'pointer':'not-allowed',color:testResult==='ok'?'#10B981':testResult==='fail'?'#EF4444':'#9CA3AF',fontSize:12,fontFamily:'monospace',display:'flex',alignItems:'center',gap:4,whiteSpace:'nowrap' }}>
                    {testing?<ArrowPathIcon style={{ width:12,height:12,animation:'spin 1s linear infinite' }}/>:testResult==='ok'?<CheckCircleIcon style={{ width:12,height:12 }}/>:testResult==='fail'?<XCircleIcon style={{ width:12,height:12 }}/>:<SignalIcon style={{ width:12,height:12 }}/>}
                    {testing?'...':testResult==='ok'?'Online':testResult==='fail'?'Offline':'Testar'}
                  </button>
                </div>
                {cfg.lockIp && <div style={{ fontSize:11,color:'#6B7280',fontFamily:'monospace',marginTop:4 }}>POST http://{cfg.lockIp}/unlock</div>}
              </div>
              <div>
                <label style={lbl}>Tempo aberta (ms)</label>
                <input style={inp} type="number" value={cfg.lockMs} onChange={e => set('lockMs', parseInt(e.target.value)||5000)} min={1000} max={30000} step={500}/>
                <div style={{ fontSize:11,color:'#6B7280',fontFamily:'monospace',marginTop:4 }}>{(cfg.lockMs/1000).toFixed(1)}s após GRANTED</div>
              </div>
            </>
          )}

          {/* ── API ── */}
          {tab === 'api' && (
            <div>
              <label style={lbl}>URL da API</label>
              <input style={inp} value={cfg.apiBase} onChange={e => set('apiBase', e.target.value)} placeholder="https://aihub.smartxhub.cloud"/>
              <div style={{ fontSize:11,color:'#6B7280',fontFamily:'monospace',marginTop:4 }}>
                WebSocket: {cfg.apiBase.replace(/^http/,'ws')}/api/v1/epi/ws/epi-stream
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display:'flex',gap:8,padding:'14px 20px',borderTop:'1px solid rgba(255,255,255,0.06)',justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ background:'transparent',border:'1px solid rgba(255,255,255,0.12)',borderRadius:8,padding:'7px 18px',color:'#9CA3AF',cursor:'pointer',fontSize:13 }}>Cancelar</button>
          <button onClick={handleSave} style={{ background:'linear-gradient(135deg,#1D4ED8,#3B82F6)',border:'none',borderRadius:8,padding:'7px 20px',color:'#fff',cursor:'pointer',fontSize:13,fontWeight:600,display:'flex',alignItems:'center',gap:5 }}>
            <CheckIcon style={{ width:13,height:13 }}/>Salvar
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ─── OVERLAY BOXES ────────────────────────────────────────────────────────────
function Overlay({ frame, vw, vh, ow, oh }: { frame:FrameResult|null;vw:number;vh:number;ow:number;oh:number }) {
  if (!frame?.detections.length) return null
  const sx=ow/(vw||1); const sy=oh/(vh||1); const MARGIN=0.08
  const filtered=frame.detections.filter(d => {
    const cx=(d.bbox.x+d.bbox.w/2)/(vw||1); const cy=(d.bbox.y+d.bbox.h/2)/(vh||1)
    return cx>MARGIN&&cx<(1-MARGIN)&&cy>MARGIN&&cy<(1-MARGIN)
  })
  if (!filtered.length) return null
  return (
    <svg style={{ position:'absolute',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none' }}>
      {filtered.map((d,i) => {
        const {x,y,w,h}=d.bbox; const c=EPI_COLOR[d.class_name]??'#fff'
        const label=`${EPI_LABEL[d.class_name]??d.class_name} ${Math.round(d.confidence*100)}%`
        return (
          <g key={d.class_name+i}>
            <rect x={x*sx} y={y*sy} width={w*sx} height={h*sy} fill={`${c}18`} stroke={c} strokeWidth={2.5} rx={6}/>
            <rect x={x*sx} y={Math.max(0,y*sy-22)} width={label.length*8+8} height={22} fill={c} rx={4}/>
            <text x={x*sx+5} y={Math.max(15,y*sy-6)} fill="#fff" fontSize={12} fontFamily="monospace" fontWeight={700}>{label}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── RESULTADO ────────────────────────────────────────────────────────────────
function ResultOverlay({ phase, decision, direction, hasLock }: { phase:Phase;decision:Decision|null;direction:Direction;hasLock:boolean }) {
  const granted=phase==='granted'; const deniedEpi=phase==='denied_epi'
  const color=granted?'#10B981':'#EF4444'; const bg=granted?'rgba(6,78,59,0.96)':'rgba(69,10,10,0.96)'
  const Icon=granted?CheckCircleIcon:deniedEpi?ShieldExclamationIcon:XCircleIcon
  const title=granted?(direction==='ENTRY'?'ACESSO LIBERADO':'SAÍDA REGISTRADA'):deniedEpi?'EPI INCOMPLETO':'FACE NÃO IDENTIFICADA'
  return (
    <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:bg,backdropFilter:'blur(8px)',padding:16 }}>
      <style>{`@keyframes pop{0%{transform:scale(.3);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <div style={{ marginBottom:16,filter:`drop-shadow(0 0 40px ${color})`,animation:'pop .5s cubic-bezier(.34,1.56,.64,1)' }}>
        <Icon style={{ width:80,height:80,color }}/>
      </div>
      <div style={{ fontSize:'clamp(24px,5vw,44px)',fontWeight:900,color,letterSpacing:'-0.02em',marginBottom:10,textAlign:'center',textShadow:`0 0 30px ${color}88`,animation:'slideUp .4s ease .1s both',fontFamily:"'DM Sans',system-ui,sans-serif" }}>{title}</div>
      {(decision?.person_name||decision?.person_code)&&(
        <div style={{ fontSize:'clamp(16px,3vw,22px)',color:'#E5E7EB',marginBottom:16,animation:'slideUp .4s ease .2s both',display:'flex',alignItems:'center',gap:8 }}>
          <UserIcon style={{ width:20,height:20 }}/>{decision.person_name??decision.person_code}
        </div>
      )}
      <div style={{ display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center',animation:'slideUp .4s ease .3s both' }}>
        {[{l:'Conformidade',v:`${Math.round((decision?.compliance_rate??0)*100)}%`},{l:'Face',v:`${Math.round((decision?.face_rate??0)*100)}%`},{l:'Frames',v:String(decision?.total_frames??0)}].map(s=>(
          <div key={s.l} style={{ background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:10,padding:'10px 16px',textAlign:'center' }}>
            <div style={{ fontSize:10,color:'#9CA3AF',fontFamily:'monospace',textTransform:'uppercase' }}>{s.l}</div>
            <div style={{ fontSize:'clamp(18px,3vw,24px)',fontWeight:700,color:'#F9FAFB' }}>{s.v}</div>
          </div>
        ))}
      </div>
      {granted&&hasLock&&(
        <div style={{ marginTop:14,display:'flex',alignItems:'center',gap:6,padding:'4px 12px',background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:20,fontSize:12,color:'#86EFAC',fontFamily:'monospace',animation:'slideUp .4s ease .4s both' }}>
          <LockClosedIcon style={{ width:12,height:12 }}/> Fechadura aberta
        </div>
      )}
    </div>
  )
}

// ─── IDLE OVERLAY ─────────────────────────────────────────────────────────────
function IdleOverlay({ camError, onEntry, onExit }: { camError:string; onEntry:()=>void; onExit:()=>void }) {
  if (camError) return (
    <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#0A0F1A' }}>
      <XCircleIcon style={{ width:48,height:48,color:'#EF4444',marginBottom:12 }}/>
      <div style={{ fontSize:18,fontWeight:600,color:'#EF4444',marginBottom:8 }}>Câmera indisponível</div>
      <div style={{ fontSize:13,color:'#6B7280',fontFamily:'monospace',maxWidth:280,textAlign:'center' }}>{camError}</div>
    </div>
  )
  return (
    <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column' }}>
      <style>{`@keyframes breathe{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}`}</style>
      {/* Botões manuais ENTRY / EXIT — para uso sem detecção automática */}
      <div style={{ position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(to top,rgba(0,0,0,0.9) 0%,transparent 100%)',padding:'32px 20px 20px',display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap' }}>
        <button onClick={onEntry} style={{ flex:1,maxWidth:200,background:'rgba(16,185,129,0.15)',border:'2px solid rgba(16,185,129,0.5)',borderRadius:12,padding:'14px 20px',color:'#10B981',cursor:'pointer',fontFamily:"'DM Sans',system-ui,sans-serif",fontWeight:700,fontSize:15,display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
          <ArrowRightOnRectangleIcon style={{ width:20,height:20 }}/> Entrada
        </button>
        <button onClick={onExit} style={{ flex:1,maxWidth:200,background:'rgba(239,68,68,0.1)',border:'2px solid rgba(239,68,68,0.4)',borderRadius:12,padding:'14px 20px',color:'#EF4444',cursor:'pointer',fontFamily:"'DM Sans',system-ui,sans-serif",fontWeight:700,fontSize:15,display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
          <ArrowLeftOnRectangleIcon style={{ width:20,height:20 }}/> Saída
        </button>
        <div style={{ width:'100%',textAlign:'center',fontSize:12,color:'#6B7280',marginTop:4 }}>
          Ou posicione-se — detecção automática em 1.5s
        </div>
      </div>
    </div>
  )
}

// ─── STATUS BAR ───────────────────────────────────────────────────────────────
function StatusBar({ phase, frame, direction, onConfig }: { phase:Phase;frame:FrameResult|null;direction:Direction;onConfig:()=>void }) {
  const scanning=phase==='scanning'; const progress=frame?.window_progress??0
  const rate=frame?.session_compliant_rate??0; const rateColor=rate>0.7?'#10B981':rate>0.4?'#F59E0B':'#EF4444'
  return (
    <div style={{ position:'absolute',top:0,left:0,right:0,zIndex:10,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(10px)',display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
      <ShieldCheckIcon style={{ width:18,height:18,color:'#60A5FA',flexShrink:0 }}/>
      <span style={{ fontWeight:700,fontSize:13,color:'#F9FAFB',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>EPI Check</span>
      {scanning && (
        <>
          <div style={{ width:70,height:4,background:'rgba(255,255,255,0.1)',borderRadius:2,overflow:'hidden',flexShrink:0 }}>
            <div style={{ height:'100%',borderRadius:2,transition:'width .3s',background:`linear-gradient(90deg,#3B82F6,${rateColor})`,width:`${progress*100}%` }}/>
          </div>
          <span style={{ fontSize:11,fontFamily:'monospace',color:rateColor,fontWeight:700,flexShrink:0 }}>{Math.round(rate*100)}%</span>
          {frame?.face_recognized && (
            <span style={{ background:'rgba(16,185,129,0.2)',color:'#10B981',border:'1px solid rgba(16,185,129,0.4)',borderRadius:20,padding:'2px 8px',fontSize:10,fontFamily:'monospace',display:'flex',alignItems:'center',gap:3,flexShrink:0 }}>
              <CheckIcon style={{ width:9,height:9 }}/>{frame.face_person_name??frame.face_person_code??'OK'}
            </span>
          )}
        </>
      )}
      {/* Badge de direção */}
      <span style={{ background:direction==='ENTRY'?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)',color:direction==='ENTRY'?'#10B981':'#EF4444',border:`1px solid ${direction==='ENTRY'?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'}`,borderRadius:20,padding:'2px 8px',fontSize:10,fontFamily:'monospace',flexShrink:0,display:'flex',alignItems:'center',gap:3 }}>
        {direction==='ENTRY'?<ArrowRightOnRectangleIcon style={{ width:10,height:10 }}/>:<ArrowLeftOnRectangleIcon style={{ width:10,height:10 }}/>}
        {direction==='ENTRY'?'ENTRADA':'SAÍDA'}
      </span>
      <span style={{ background:scanning?'rgba(245,158,11,0.15)':'rgba(59,130,246,0.12)',color:scanning?'#F59E0B':'#60A5FA',border:`1px solid ${scanning?'rgba(245,158,11,0.3)':'rgba(59,130,246,0.25)'}`,borderRadius:20,padding:'2px 8px',fontSize:10,fontFamily:'monospace',flexShrink:0,display:'flex',alignItems:'center',gap:3 }}>
        {scanning?<><BoltIcon style={{ width:9,height:9 }}/> SCAN</>:<><EyeIcon style={{ width:9,height:9 }}/> IDLE</>}
      </span>
      <button onClick={onConfig} style={{ background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:6,padding:'4px 8px',cursor:'pointer',color:'#9CA3AF',display:'flex',alignItems:'center',gap:3,flexShrink:0 }}>
        <Cog6ToothIcon style={{ width:13,height:13 }}/>
      </button>
    </div>
  )
}

// ─── SIDEBAR RESPONSIVA ───────────────────────────────────────────────────────
function EpiSidebar({ frame, isNarrow }: { frame:FrameResult|null; isNarrow:boolean }) {
  // Acumula o último frame válido para não piscar entre frames
  const lastValidRef = useRef<FrameResult | null>(null)
  if (frame && (frame.detections.length > 0 || frame.missing.length > 0)) {
    lastValidRef.current = frame
  }
  const f = lastValidRef.current  // ← usa o último frame válido

  // const detected = frame?.detections.map(d => d.class_name) ?? []
  // const missing=frame?.missing??[]
  // const rate=frame?.session_compliant_rate??0

  const detected = f?.detections.map(d => d.class_name) ?? []
  const missing  = f?.missing ?? []
  const rate     = f?.session_compliant_rate ?? 0

  // Em modo estreito (portrait mobile/tablet pequeno) — barra horizontal no fundo
  if (isNarrow) return (
    <div style={{ position:'absolute',bottom:5,left:0,right:0,zIndex:6,display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'rgba(10,15,26,0.88)',backdropFilter:'blur(12px)',borderTop:'1px solid rgba(255,255,255,0.07)' }}>
      {/* Boneco mini */}
      <EpiBodyFigure detected={detected} missing={missing} size="sm" showLabels={false}/>
      {/* Labels compactos */}
      <div style={{ flex:1,display:'flex',flexWrap:'wrap',gap:4 }}>
        {['helmet','thermal_coat','thermal_pants','gloves','boots'].map(epi => {
          const ok=detected.includes(epi)&&!missing.includes(epi)
          const unk=detected.length===0&&missing.length===0
          return (
            <span key={epi} style={{ fontSize:10,padding:'2px 7px',borderRadius:6,fontFamily:'monospace',background:unk?'rgba(55,65,81,0.5)':ok?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)',color:unk?'#6B7280':ok?'#86EFAC':'#FCA5A5',border:`1px solid ${unk?'rgba(55,65,81,0.4)':ok?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'}` }}>
              {EPI_LABEL[epi]?.split(' ')[0]}
            </span>
          )
        })}
      </div>
      {/* Face + % */}
      <div style={{ textAlign:'center',flexShrink:0 }}>
        {frame?.face_recognized?<FaceSmileIcon style={{ width:22,height:22,color:'#10B981' }}/>:frame?.face_detected?<UserIcon style={{ width:22,height:22,color:'#F59E0B' }}/>:<UserIcon style={{ width:22,height:22,color:'#6B7280' }}/>}
        <div style={{ fontSize:12,fontWeight:800,color:rate>0.7?'#10B981':rate>0.4?'#F59E0B':'#EF4444',fontFamily:'monospace' }}>{Math.round(rate*100)}%</div>
      </div>
    </div>
  )

  // Sidebar lateral (landscape / telas largas)
  return (
    <div style={{ width:220,background:'rgba(10,15,26,0.92)',backdropFilter:'blur(12px)',borderLeft:'1px solid rgba(255,255,255,0.07)',padding:'60px 12px 12px',display:'flex',flexDirection:'column',alignItems:'center',gap:10,overflowY:'auto' }}>
      <EpiBodyFigure detected={detected} missing={missing} size="md" showLabels={true}/>
      <div style={{ width:'100%',padding:'8px 10px',background:frame?.face_recognized?'rgba(16,185,129,0.08)':'rgba(255,255,255,0.03)',border:`1px solid ${frame?.face_recognized?'rgba(16,185,129,0.3)':'rgba(255,255,255,0.07)'}`,borderRadius:10,textAlign:'center',transition:'all .3s' }}>
        <div style={{ display:'flex',justifyContent:'center',marginBottom:3 }}>
          {frame?.face_recognized?<FaceSmileIcon style={{ width:22,height:22,color:'#10B981' }}/>:frame?.face_detected?<UserIcon style={{ width:22,height:22,color:'#F59E0B' }}/>:<UserIcon style={{ width:22,height:22,color:'#6B7280' }}/>}
        </div>
        <div style={{ fontSize:11,color:frame?.face_recognized?'#86EFAC':'#6B7280',fontFamily:'monospace' }}>
          {frame?.face_recognized?(frame.face_person_name??frame.face_person_code??'Identificado'):frame?.face_detected?'Identificando...':'Sem face'}
        </div>
        {frame?.face_recognized&&<div style={{ fontSize:10,color:'#10B981',fontFamily:'monospace',marginTop:2 }}>{Math.round((frame.face_confidence??0)*100)}% conf.</div>}
      </div>
      <div style={{ width:'100%',padding:'8px',textAlign:'center',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10 }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:3,marginBottom:2 }}>
          {rate>0.7?<ShieldCheckIcon style={{ width:11,height:11,color:'#10B981' }}/>:<ShieldExclamationIcon style={{ width:11,height:11,color:rate>0.4?'#F59E0B':'#EF4444' }}/>}
          <div style={{ fontSize:10,color:'#6B7280',fontFamily:'monospace',textTransform:'uppercase' }}>Conformidade</div>
        </div>
        <div style={{ fontSize:28,fontWeight:800,color:rate>0.7?'#10B981':rate>0.4?'#F59E0B':'#EF4444' }}>{Math.round(rate*100)}%</div>
      </div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function EpiCameraStation() {
  const [stationCfg, setStationCfg] = useState<StationConfig>(loadConfig)
  const [showConfig, setShowConfig] = useState(false)

  const layout = useTabletLayout()
  const isNarrow = layout.orientation === 'portrait' || layout.width < 600

  const cam = useCameraStream(stationCfg)
  const logic = useKioskLogic(stationCfg, cam.captureFrame, cam.ready)

  const containerRef = useRef<HTMLDivElement>(null)
  const [vSize, setVSize] = useState({ w:1280,h:720 })
  const [oSize, setOSize] = useState({ w:0,h:0 })
  const [showName, setShowName]       = useState(false)
  const nameTimerRef  = useRef<ReturnType<typeof setTimeout>|null>(null)
  const lastPersonRef = useRef<string|null>(null)

  useEffect(() => {
    const personId = logic.lastFrame?.face_person_code??logic.lastFrame?.face_person_name??null
    if (logic.phase==='scanning'&&logic.lastFrame?.face_recognized&&personId&&personId!==lastPersonRef.current) {
      lastPersonRef.current=personId; setShowName(true)
      if (nameTimerRef.current) clearTimeout(nameTimerRef.current)
      nameTimerRef.current=setTimeout(()=>setShowName(false),3000)
    }
    if (logic.phase!=='scanning') { setShowName(false); lastPersonRef.current=null; if (nameTimerRef.current) clearTimeout(nameTimerRef.current) }
  }, [logic.phase,logic.lastFrame?.face_recognized,logic.lastFrame?.face_person_code,logic.lastFrame?.face_person_name])

  useEffect(() => {
    const v=cam.videoRef.current; if (!v) return
    const h=()=>setVSize({w:v.videoWidth,h:v.videoHeight})
    v.addEventListener('loadedmetadata',h); return ()=>v.removeEventListener('loadedmetadata',h)
  }, [cam.videoRef])

  useEffect(() => {
    if (!containerRef.current) return
    const ro=new ResizeObserver(e=>{for(const x of e)setOSize({w:x.contentRect.width,h:x.contentRect.height})})
    ro.observe(containerRef.current); return ()=>ro.disconnect()
  }, [])

  const scanning   = logic.phase==='scanning'
  const showResult = logic.phase!=='idle'&&logic.phase!=='scanning'

  return (
    <div style={{ width:'100%',height:'100vh',background:'#000',display:'flex',flexDirection:isNarrow?'column':'row',overflow:'hidden',fontFamily:"'DM Sans',system-ui,sans-serif",userSelect:'none',WebkitUserSelect:'none' }}>
      {showConfig && (
        <ConfigModal onClose={()=>setShowConfig(false)} onSave={cfg=>setStationCfg(cfg)} devices={cam.devices}/>
      )}

      {/* Câmera */}
      <div ref={containerRef} style={{ flex:1,position:'relative',background:'#111',overflow:'hidden' }}>
        <video ref={cam.videoRef} autoPlay playsInline muted style={{ width:'100%',height:'100%',objectFit:'cover',opacity:cam.ready?1:0,transition:'opacity .5s' }}/>
        <canvas ref={cam.canvasRef} style={{ display:'none' }}/>

        {(scanning||logic.phase==='idle')&&cam.ready&&(
          <Overlay frame={logic.lastFrame} vw={vSize.w} vh={vSize.h} ow={oSize.w} oh={oSize.h}/>
        )}
        {logic.phase==='idle'&&(
          <IdleOverlay camError={cam.error} onEntry={()=>logic.openScan('ENTRY')} onExit={()=>logic.openScan('EXIT')}/>
        )}
        {showResult&&<ResultOverlay phase={logic.phase} decision={logic.decision} direction={logic.direction} hasLock={!!stationCfg.lockIp}/>}
        {cam.ready&&<StatusBar phase={logic.phase} frame={logic.lastFrame} direction={logic.direction} onConfig={()=>setShowConfig(true)}/>}

        {/* Nome ao identificar */}
        {scanning&&showName&&logic.lastFrame?.face_recognized&&(
          <div style={{ position:'absolute',bottom:isNarrow?70:40,left:0,right:0,display:'flex',flexDirection:'column',alignItems:'center',pointerEvents:'none',zIndex:5 }}>
            <style>{`@keyframes nameGlow{0%,100%{text-shadow:0 0 30px #10B98188}50%{text-shadow:0 0 50px #10B981cc}}`}</style>
            <div style={{ width:56,height:56,borderRadius:'50%',marginBottom:8,background:'rgba(16,185,129,0.15)',border:'3px solid #10B981',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 30px rgba(16,185,129,0.4)' }}>
              <UserIcon style={{ width:28,height:28,color:'#10B981' }}/>
            </div>
            <div style={{ fontSize:'clamp(28px,6vw,48px)',fontWeight:900,color:'#10B981',letterSpacing:'-0.03em',lineHeight:1,fontFamily:"'DM Sans',system-ui,sans-serif",animation:'nameGlow 2s ease-in-out infinite',textAlign:'center',textShadow:'0 0 30px #10B98188' }}>
              {logic.lastFrame.face_person_name??logic.lastFrame.face_person_code}
            </div>
            <div style={{ fontSize:12,color:'#86EFAC',fontFamily:'monospace',marginTop:5,background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:20,padding:'2px 10px' }}>
              {Math.round((logic.lastFrame.face_confidence??0)*100)}% confiança
            </div>
          </div>
        )}

        {/* Progress bar */}
        {scanning&&(
          <div style={{ position:'absolute',bottom:0,left:0,right:0,height:4,background:'rgba(0,0,0,0.4)' }}>
            <div style={{ height:'100%',background:`linear-gradient(90deg,#3B82F6,${(logic.lastFrame?.session_compliant_rate??0)>0.5?'#10B981':'#EF4444'})`,width:`${(logic.lastFrame?.window_progress??0)*100}%`,transition:'width .3s' }}/>
          </div>
        )}

        {/* Sidebar narrow (portrait) — fica dentro da câmera */}
        {scanning&&isNarrow&&<EpiSidebar frame={logic.lastFrame} isNarrow={true}/>}
      </div>

      {/* Sidebar lateral (landscape) */}
      {scanning&&!isNarrow&&<EpiSidebar frame={logic.lastFrame} isNarrow={false}/>}
    </div>
  )
}