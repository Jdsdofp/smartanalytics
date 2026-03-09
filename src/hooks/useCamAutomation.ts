// // src/hooks/useCamAutomation.ts
// // Hook central da máquina de estados do fluxo de automação EPI Check
// // Responsável por: estado da sessão, câmeras, configuração, todas as chamadas de API
// // Os screens e components NÃO importam a API diretamente — tudo vem deste hook

// import { useState, useEffect, useCallback, useRef } from 'react';
// import axios from 'axios';

// // ─────────────────────────────────────────────────────────────────────────────
// // API LAYER (interno ao hook — nenhum screen/component precisa importar)
// // ─────────────────────────────────────────────────────────────────────────────

// /**
//  * Retorna a URL base da API — mesmo padrão do useAssetAvailability.
//  * Usa sessionStorage['apiEndpoint'] quando disponível,
//  * com fallback para a URL de produção do SmartX.
//  */
// const getApiBaseUrl = (): string => {
//   const saved = sessionStorage.getItem('apiEndpoint');
//   return saved ?? 'https://aihub.smartxhub.cloud';
// };

// /** Cria um axios instance apontando para o endpoint atual */
// const makeHttp = () =>
//   axios.create({ baseURL: getApiBaseUrl(), timeout: 30000 });

// // Prefixo base do router EPI no backend FastAPI
// // Montado em: /api/v1/epi  (router = APIRouter(), incluído com prefix="/api/v1/epi")
// const EPI = '/api/v1/epi';

// const api = {
//   // Não existe endpoint /local/config no backend — retorna objeto vazio silenciosamente
//   getLocalConfig: async (): Promise<Partial<SysConfig>> => {
//     try {
//       const { data } = await makeHttp().get(`${EPI}/local/config`);
//       return data;
//     } catch {
//       return {}; // fallback para DEFAULT_CONFIG
//     }
//   },

//   // GET /api/v1/epi/analytics/dashboard
//   getDashboard: async (): Promise<DashboardData> => {
//     const { data } = await makeHttp().get(`${EPI}/analytics/dashboard`);
//     return data;
//   },

//   // GET /api/v1/epi/analytics/people
//   getPeople: async (activeOnly = false): Promise<{ people?: WorkerRecord[] } | WorkerRecord[]> => {
//     const { data } = await makeHttp().get(`${EPI}/analytics/people`, { params: { active_only: activeOnly } });
//     return data;
//   },

//   // GET /api/v1/epi/config
//   getEpiConfig: async (): Promise<EpiConfig> => {
//     const { data } = await makeHttp().get(`${EPI}/config`);
//     // backend retorna { config, active_classes, all_classes }
//     // mapeia para o formato EpiConfig esperado pelo hook
//     return {
//       required_ppe:       data.config?.required_ppe ?? [],
//       available_classes:  data.all_classes ? Object.values(data.all_classes) as string[] : [],
//       config:             data.config,
//     };
//   },

//   // POST /api/v1/epi/config  — body: { required_ppe: string[] }
//   saveEpiConfig: async (config: { required_ppe: string[] }): Promise<void> => {
//     await makeHttp().post(`${EPI}/config`, config);
//   },

//   // POST /api/v1/epi/validation/start  — Form data (FastAPI usa Form(...))
//   startValidationSession: async (
//     overrides: Record<string, unknown> = {},
//   ): Promise<{ session_uuid: string; sessionUuid?: string }> => {
//     const form = new FormData();
//     form.append('door_id',    String(overrides.door_id  ?? 'DOOR_01'));
//     form.append('direction',  String(overrides.direction ?? 'ENTRY'));
//     form.append('zone_id',    String(overrides.zone_id  ?? ''));
//     form.append('compliance_mode',       'majority');
//     form.append('photo_count_required',  '1');   // 1 foto por captura (face ou body)
//     form.append('timeout_seconds',       '30');
//     const { data } = await makeHttp().post(`${EPI}/validation/start`, form);
//     return data;
//   },

//   // POST /api/v1/epi/validation/photo  — multipart/form-data
//   sendValidationPhoto: async (
//     sessionUuid: string,
//     frameBlob: Blob,
//     opts: { photoType?: string; cameraId?: number } = {},
//   ): Promise<PhotoResult> => {
//     const form = new FormData();
//     form.append('session_uuid', sessionUuid);
//     form.append('file', frameBlob, 'frame.jpg');
//     if (opts.cameraId !== undefined) form.append('camera_id', String(opts.cameraId));
//     if (opts.photoType) form.append('photo_type', opts.photoType);
//     const { data } = await makeHttp().post(`${EPI}/validation/photo`, form, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//     return data;
//   },

//   // POST /api/v1/epi/validation/close  — Form data
//   closeValidationSession: async (sessionUuid: string): Promise<void> => {
//     const form = new FormData();
//     form.append('session_uuid', sessionUuid);
//     await makeHttp().post(`${EPI}/validation/close`, form);
//   },

//   // Endpoint de porta — não existe no backend atual, silencioso
//   openDoor: async (payload: {
//     personCode?: string;
//     personName?: string;
//     sessionUuid?: string | null;
//     reason: string;
//   }): Promise<void> => {
//     try {
//       const form = new FormData();
//       if (payload.personCode)  form.append('person_code',  payload.personCode);
//       if (payload.personName)  form.append('person_name',  payload.personName);
//       if (payload.sessionUuid) form.append('session_uuid', payload.sessionUuid);
//       form.append('reason', payload.reason);
//       await makeHttp().post(`${EPI}/door/open`, form);
//     } catch (e) {
//       console.warn('[openDoor] endpoint não disponível:', e);
//     }
//   },
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.88): Promise<Blob> {
//   return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', quality));
// }

// export function formatMinutes(mins: number | null | undefined): string {
//   if (mins == null) return '—';
//   const m = Math.round(mins);
//   if (m < 60) return `${m}min`;
//   const h = Math.floor(m / 60);
//   const rem = m % 60;
//   return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // TIPOS PÚBLICOS
// // ─────────────────────────────────────────────────────────────────────────────

// export type Screen =
//   | 'idle'
//   | 'face_scan'
//   | 'time_alert'
//   | 'epi_scan'
//   | 'access_granted'
//   | 'access_denied';

// export type Direction  = 'ENTRY' | 'EXIT';
// export type DoorStatus = 'closed' | 'open' | 'alert' | 'waiting';
// export type CamRole    = 'face' | 'body1' | 'body2';

// export interface Person {
//   personCode: string;
//   personName: string;
//   confidence: number;
// }

// export interface DailyExposure {
//   total_minutes:  number;
//   limit_minutes:  number;
//   entries_today?: number;
// }

// export interface EpiResult {
//   compliant:     boolean;
//   detected?:     string[];
//   detected_ppe?: string[];
//   missing?:      string[];
//   missing_ppe?:  string[];
// }

// export interface Session {
//   sessionUuid:   string | null;
//   person:        Person | null;
//   dailyExposure: DailyExposure | null;
//   epiResult:     EpiResult | null;
//   missingEpi:    string[];
// }

// export interface SysConfig {
//   companyId:         number;
//   zoneId:            number;
//   doorId:            string;
//   dailyLimitMin:     number;
//   overLimitPolicy:   'warn' | 'block';
//   doorOpenMaxMin:    number;
//   faceConfidenceMin: number;
//   apiBase:           string;
// }

// export interface EpiConfig {
//   required_ppe:       string[];
//   available_classes?: string[];
//   config?:            Record<string, unknown>;
// }

// export interface DashboardData {
//   inside_count?:     number;
//   people_inside?:    number;
//   entries_today?:    number;
//   today?:            { total?: number };
//   open_alerts?:      number;
//   alerts_open?:      number;
//   over_limit_count?: number;
// }

// export interface WorkerRecord {
//   person_code:            string;
//   person_name:            string;
//   department?:            string;
//   is_inside?:             boolean;
//   daily_accumulated_min?: number;
//   total_minutes?:         number;
//   total_entries?:         number;
//   sessions_today?:        number;
// }

// export interface CamDevice {
//   deviceId: string;
//   label:    string;
//   kind:     string;
// }

// export interface CameraHook {
//   devices:          CamDevice[];
//   assignments:      Record<CamRole, string | null>;
//   streams:          Partial<Record<CamRole, MediaStream>>;
//   loading:          boolean;
//   error:            string | null;
//   enumerateDevices: () => Promise<CamDevice[]>;
//   startStream:      (role: CamRole) => Promise<MediaStream | null>;
//   stopStream:       (role: CamRole) => void;
//   stopAllStreams:   () => void;
//   captureFrame:     (role: CamRole) => Promise<{ blob: Blob; dataUrl: string; canvas: HTMLCanvasElement }>;
//   assignDevice:     (role: CamRole, deviceId: string | null) => void;
//   setVideoRef:      (role: CamRole, element: HTMLVideoElement | null) => void;
//   hasStream:        (role: CamRole) => boolean;
//   getAssignment:    (role: CamRole) => string | null;
// }

// // ─── Tipos internos da API ────────────────────────────────────────────────────

// interface PhotoResult {
//   // Retorno do /validation/photo (backend real)
//   session_uuid?:          string;
//   photo_seq?:             number;
//   photo_count_received?:  number;
//   photo_count_required?:  number;
//   session_complete?:      boolean;

//   // Face
//   face_detected?:         boolean;
//   face_recognized?:       boolean;   // alias legado
//   face_confidence?:       number;
//   face_person_code?:      string;
//   person_code?:           string;    // alias legado
//   person_name?:           string;
//   confidence?:            number;    // alias legado

//   // EPI
//   epi_compliant?:         boolean;
//   compliant?:             boolean;   // alias legado
//   compliance_score?:      number;
//   missing?:               string[];
//   missing_ppe?:           string[];
//   detected?:              string[];
//   detected_ppe?:          string[];

//   // Sessão finalizada
//   final_decision?: {
//     access_decision:       string;
//     epi_compliant:         boolean;
//     face_confirmed:        boolean;
//     face_confidence_max?:  number;
//     person_code?:          string;
//     person_name?:          string;
//   } | null;

//   daily_exposure?: DailyExposure;
// }

// // ─── Estados por screen/modal (expostos como props prontas) ───────────────────

// export type FaceScanStep = 'ready' | 'capturing' | 'processing' | 'done' | 'error';

// export interface FaceScanState {
//   step:       FaceScanStep;
//   captureUrl: string | null;
//   progress:   number;
//   statusMsg:  string;
//   subMsg:     string;
//   countdown:  number | null;
// }

// export type EpiScanStep = 'ready' | 'capturing' | 'processing' | 'done' | 'error';

// export interface EpiScanState {
//   step:        EpiScanStep;
//   captureUrl1: string | null;
//   captureUrl2: string | null;
//   statusMsg:   string;
//   countdown:   number | null;
//   result:      EpiResult | null;
// }

// export interface IdleState {
//   dashboard:        DashboardData | null;
//   loadingDash:      boolean;
//   refreshDashboard: () => void;
// }

// export interface ConfigState {
//   localConfig:    SysConfig;
//   epiConfig:      EpiConfig | null;
//   saving:         boolean;
//   saved:          boolean;
//   setLocalConfig: (cfg: SysConfig) => void;
//   setEpiConfig:   (cfg: EpiConfig | null) => void;
//   handleSave:     () => Promise<void>;
// }

// export interface PermanenceState {
//   people:      WorkerRecord[];
//   loading:     boolean;
//   fetchPeople: () => Promise<void>;
// }

// // ─── Return do hook ───────────────────────────────────────────────────────────

// export interface UseCamAutomationReturn {
//   // Máquina de estados
//   screen:     Screen;
//   direction:  Direction;
//   doorStatus: DoorStatus;
//   session:    Session;
//   sysConfig:  SysConfig;

//   // Modais
//   showReport:    boolean;
//   showConfig:    boolean;
//   setShowReport: (v: boolean) => void;
//   setShowConfig: (v: boolean) => void;

//   // Câmeras
//   cameraHook: CameraHook;

//   // Estados prontos para cada screen/modal
//   idleState:       IdleState;
//   faceScanState:   FaceScanState;
//   epiScanState:    EpiScanState;
//   configState:     ConfigState;
//   permanenceState: PermanenceState;

//   // Navegação
//   handleStartEntry:      () => void;
//   handleStartExit:       () => void;
//   handleGoIdle:          () => void;
//   handleTimeOverride:    () => void;
//   handleRetryFromDenied: () => void;
//   handleSaveConfig:      (newConfig: Partial<SysConfig>) => void;

//   // Ações (chamam API internamente)
//   handleCaptureFace: () => Promise<void>;
//   handleRetryFace:   () => void;
//   handleCaptureEpi:  () => Promise<void>;
//   handleRetryEpi:    () => void;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // CONSTANTES
// // ─────────────────────────────────────────────────────────────────────────────

// const LS_KEYS: Record<CamRole, string> = {
//   face:  'epi_cam_face',
//   body1: 'epi_cam_body1',
//   body2: 'epi_cam_body2',
// };

// const EMPTY_SESSION: Session = {
//   sessionUuid:   null,
//   person:        null,
//   dailyExposure: null,
//   epiResult:     null,
//   missingEpi:    [],
// };

// const DEFAULT_CONFIG: SysConfig = {
//   companyId:         1,
//   zoneId:            10,
//   doorId:            'DOOR_CAMARA_FRIA_01',
//   dailyLimitMin:     120,
//   overLimitPolicy:   'warn',
//   doorOpenMaxMin:    15,
//   faceConfidenceMin: 70,
//   apiBase:           'https://aihub.smartxhub.cloud',
// };

// const EPI_LABELS_PT: Record<string, string> = {
//   helmet:        'Capacete',
//   vest:          'Colete',
//   gloves:        'Luvas',
//   boots:         'Botas',
//   thermal_coat:  'Jaqueta Térmica',
//   thermal_pants: 'Calça Térmica',
//   glasses:       'Óculos de Proteção',
//   mask:          'Máscara',
//   apron:         'Avental',
//   hardhat:       'Capacete',
// };

// const epiLabel = (k: string) => EPI_LABELS_PT[k] ?? k;

// // ─────────────────────────────────────────────────────────────────────────────
// // HOOK DE CÂMERAS (interno)
// // ─────────────────────────────────────────────────────────────────────────────

// function useCameraInternal(): CameraHook {
//   const [devices,     setDevices]     = useState<CamDevice[]>([]);
//   const [assignments, setAssignments] = useState<Record<CamRole, string | null>>({
//     face:  localStorage.getItem(LS_KEYS.face)  || null,
//     body1: localStorage.getItem(LS_KEYS.body1) || null,
//     body2: localStorage.getItem(LS_KEYS.body2) || null,
//   });
//   const [streams, setStreams] = useState<Partial<Record<CamRole, MediaStream>>>({});
//   const [loading, setLoading] = useState(false);
//   const [error,   setError]   = useState<string | null>(null);
//   const videoRefs = useRef<Partial<Record<CamRole, HTMLVideoElement | null>>>({});

//   const enumerateDevices = useCallback(async (): Promise<CamDevice[]> => {
//     try {
//       await navigator.mediaDevices
//         .getUserMedia({ video: true, audio: false })
//         .then((s) => s.getTracks().forEach((t) => t.stop()))
//         .catch(() => {});
//       const all  = await navigator.mediaDevices.enumerateDevices();
//       const vids = all.filter((d) => d.kind === 'videoinput') as CamDevice[];
//       setDevices(vids);
//       setAssignments((prev) => {
//         const next = { ...prev };
//         if (!next.face  && vids[0]) next.face  = vids[0].deviceId;
//         if (!next.body1 && vids[1]) next.body1 = vids[1].deviceId;
//         if (!next.body2 && vids[2]) next.body2 = vids[2].deviceId;
//         return next;
//       });
//       return vids;
//     } catch (e) {
//       setError(e instanceof Error ? e.message : String(e));
//       return [];
//     }
//   }, []);

//   const startStream = useCallback(async (role: CamRole): Promise<MediaStream | null> => {
//     const deviceId = assignments[role];
//     if (!deviceId) return null;
//     streams[role]?.getTracks().forEach((t) => t.stop());
//     try {
//       setLoading(true);
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
//         audio: false,
//       });
//       setStreams((prev) => ({ ...prev, [role]: stream }));
//       const ref = videoRefs.current[role];
//       if (ref) ref.srcObject = stream;
//       return stream;
//     } catch (e) {
//       setError(e instanceof Error ? e.message : String(e));
//       return null;
//     } finally {
//       setLoading(false);
//     }
//   }, [assignments, streams]);

//   const stopStream = useCallback((role: CamRole) => {
//     streams[role]?.getTracks().forEach((t) => t.stop());
//     setStreams((prev) => { const n = { ...prev }; delete n[role]; return n; });
//     const ref = videoRefs.current[role];
//     if (ref) ref.srcObject = null;
//   }, [streams]);

//   const stopAllStreams = useCallback(() => {
//     Object.values(streams).forEach((s) => s?.getTracks().forEach((t) => t.stop()));
//     setStreams({});
//     Object.values(videoRefs.current).forEach((v) => { if (v) v.srcObject = null; });
//   }, [streams]);

//   const captureFrame = useCallback(async (role: CamRole) => {
//     const video = videoRefs.current[role];
//     if (!video || video.readyState < 2) throw new Error(`Câmera "${role}" não está pronta.`);
//     const canvas = document.createElement('canvas');
//     canvas.width  = video.videoWidth  || 1280;
//     canvas.height = video.videoHeight || 720;
//     canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height);
//     const blob    = await canvasToBlob(canvas, 0.88);
//     const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
//     return { blob, dataUrl, canvas };
//   }, []);

//   const assignDevice = useCallback((role: CamRole, deviceId: string | null) => {
//     setAssignments((prev) => ({ ...prev, [role]: deviceId }));
//     localStorage.setItem(LS_KEYS[role], deviceId || '');
//   }, []);

//   const setVideoRef = useCallback((role: CamRole, element: HTMLVideoElement | null) => {
//     videoRefs.current[role] = element;
//     if (element && streams[role]) element.srcObject = streams[role]!;
//   }, [streams]);

//   useEffect(() => {
//     enumerateDevices();
//     const handler = () => enumerateDevices();
//     navigator.mediaDevices.addEventListener('devicechange', handler);
//     return () => {
//       navigator.mediaDevices.removeEventListener('devicechange', handler);
//       stopAllStreams();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return {
//     devices, assignments, streams, loading, error,
//     enumerateDevices, startStream, stopStream, stopAllStreams,
//     captureFrame, assignDevice, setVideoRef,
//     hasStream:     (role) => !!streams[role],
//     getAssignment: (role) => assignments[role],
//   };
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HOOK PRINCIPAL
// // ─────────────────────────────────────────────────────────────────────────────

// export function useCamAutomation(): UseCamAutomationReturn {

//   // ── Máquina de estados ────────────────────────────────────────────────────
//   const [screen,     setScreen]     = useState<Screen>('idle');
//   const [direction,  setDirection]  = useState<Direction>('ENTRY');
//   const [doorStatus, setDoorStatus] = useState<DoorStatus>('closed');
//   const [session,    setSession]    = useState<Session>(EMPTY_SESSION);
//   const [sysConfig,  setSysConfig]  = useState<SysConfig>(DEFAULT_CONFIG);
//   const [showReport, setShowReport] = useState(false);
//   const [showConfig, setShowConfig] = useState(false);

//   // ── Câmeras ───────────────────────────────────────────────────────────────
//   const cameraHook = useCameraInternal();

//   // ── Idle state ────────────────────────────────────────────────────────────
//   const [dashboard,   setDashboard]   = useState<DashboardData | null>(null);
//   const [loadingDash, setLoadingDash] = useState(true);

//   // ── FaceScan state ────────────────────────────────────────────────────────
//   const [faceStep,       setFaceStep]       = useState<FaceScanStep>('ready');
//   const [faceCaptureUrl, setFaceCaptureUrl] = useState<string | null>(null);
//   const [faceProgress,   setFaceProgress]   = useState(0);
//   const [faceStatusMsg,  setFaceStatusMsg]  = useState('Posicione seu rosto na câmera e toque em Capturar');
//   const [faceSubMsg,     setFaceSubMsg]     = useState('');
//   const [faceCountdown,  setFaceCountdown]  = useState<number | null>(null);
//   const faceAutoCapture = useRef(false);

//   // ── EpiScan state ─────────────────────────────────────────────────────────
//   const [epiStep,        setEpiStep]        = useState<EpiScanStep>('ready');
//   const [epiCaptureUrl1, setEpiCaptureUrl1] = useState<string | null>(null);
//   const [epiCaptureUrl2, setEpiCaptureUrl2] = useState<string | null>(null);
//   const [epiStatusMsg,   setEpiStatusMsg]   = useState('Posicione-se em frente às câmeras de corpo');
//   const [epiCountdown,   setEpiCountdown]   = useState<number | null>(null);
//   const [epiResult,      setEpiResult]      = useState<EpiResult | null>(null);
//   const epiAutoCapture = useRef(false);

//   // ── Config modal state ────────────────────────────────────────────────────
//   const [localConfig, setLocalConfig] = useState<SysConfig>(DEFAULT_CONFIG);
//   const [epiConfig,   setEpiConfig]   = useState<EpiConfig | null>(null);
//   const [saving,      setSaving]      = useState(false);
//   const [saved,       setSaved]       = useState(false);

//   // ── Permanence modal state ────────────────────────────────────────────────
//   const [people,        setPeople]        = useState<WorkerRecord[]>([]);
//   const [loadingPeople, setLoadingPeople] = useState(false);

//   // ─── Helpers de reset ─────────────────────────────────────────────────────

//   const resetSession = useCallback(() => setSession(EMPTY_SESSION), []);

//   const resetFaceScan = useCallback((withAutoCapture = false) => {
//     faceAutoCapture.current = withAutoCapture;
//     setFaceStep('ready');
//     setFaceCaptureUrl(null);
//     setFaceProgress(0);
//     setFaceStatusMsg('Posicione seu rosto na câmera e toque em Capturar');
//     setFaceSubMsg('');
//     setFaceCountdown(null);
//   }, []);

//   const resetEpiScan = useCallback((withAutoCapture = false) => {
//     epiAutoCapture.current = withAutoCapture;
//     setEpiStep('ready');
//     setEpiCaptureUrl1(null);
//     setEpiCaptureUrl2(null);
//     setEpiStatusMsg('Posicione-se em frente às câmeras de corpo');
//     setEpiCountdown(null);
//     setEpiResult(null);
//   }, []);

//   // ─── Carrega config do backend ────────────────────────────────────────────

//   useEffect(() => {
//     api.getLocalConfig()
//       .then((cfg) => {
//         setSysConfig((prev) => ({ ...prev, ...cfg }));
//         setLocalConfig((prev) => ({ ...prev, ...cfg }));
//       })
//       .catch((e: Error) => console.warn('[useCamAutomation] Config load failed:', e.message));
//   }, []);

//   // ─── Dashboard polling (apenas na tela idle) ──────────────────────────────

//   const refreshDashboard = useCallback(async () => {
//     try {
//       const data = await api.getDashboard();
//       setDashboard(data);
//     } catch (e) {
//       console.warn('[useCamAutomation] Dashboard failed:', e);
//     } finally {
//       setLoadingDash(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (screen !== 'idle') return;
//     refreshDashboard();
//     const t = setInterval(refreshDashboard, 30000);
//     return () => clearInterval(t);
//   }, [screen, refreshDashboard]);

//   // ─── EpiConfig ao abrir modal de config ──────────────────────────────────

//   useEffect(() => {
//     if (!showConfig) return;
//     setLocalConfig({ ...sysConfig });
//     api.getEpiConfig().then(setEpiConfig).catch(console.warn);
//   }, [showConfig, sysConfig]);

//   // ─── People ao abrir modal de permanência ─────────────────────────────────

//   const fetchPeople = useCallback(async () => {
//     try {
//       setLoadingPeople(true);
//       const data = await api.getPeople(false);
//       const list = (data as { people?: WorkerRecord[] }).people ?? (data as WorkerRecord[]) ?? [];
//       setPeople(list);
//     } catch (e) {
//       console.error('[useCamAutomation] fetchPeople failed:', e);
//     } finally {
//       setLoadingPeople(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (showReport) fetchPeople();
//   }, [showReport, fetchPeople]);

//   // ─── Auto-capture: face ───────────────────────────────────────────────────

//   useEffect(() => {
//     if (screen !== 'face_scan' || !faceAutoCapture.current || faceStep !== 'ready') return;
//     let n = 3;
//     setFaceCountdown(n);
//     const t = setInterval(() => {
//       n -= 1;
//       if (n <= 0) { clearInterval(t); setFaceCountdown(null); handleCaptureFace(); }
//       else setFaceCountdown(n);
//     }, 1000);
//     return () => { clearInterval(t); setFaceCountdown(null); };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [screen, faceStep]);

//   // ─── Auto-capture: EPI ───────────────────────────────────────────────────

//   useEffect(() => {
//     if (screen !== 'epi_scan' || !epiAutoCapture.current || epiStep !== 'ready') return;
//     let n = 4;
//     setEpiCountdown(n);
//     const t = setInterval(() => {
//       n -= 1;
//       if (n <= 0) { clearInterval(t); setEpiCountdown(null); handleCaptureEpi(); }
//       else setEpiCountdown(n);
//     }, 1000);
//     return () => { clearInterval(t); setEpiCountdown(null); };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [screen, epiStep]);

//   // ─── Navegação ────────────────────────────────────────────────────────────

//   const handleStartEntry = useCallback(() => {
//     setDirection('ENTRY');
//     resetSession();
//     resetFaceScan(true);
//     cameraHook.startStream('face');
//     setScreen('face_scan');
//   }, [resetSession, resetFaceScan, cameraHook]);

//   const handleStartExit = useCallback(() => {
//     setDirection('EXIT');
//     resetSession();
//     resetFaceScan(true);
//     cameraHook.startStream('face');
//     setScreen('face_scan');
//   }, [resetSession, resetFaceScan, cameraHook]);

//   const handleGoIdle = useCallback(() => {
//     cameraHook.stopAllStreams();
//     resetSession();
//     resetFaceScan(false);
//     resetEpiScan(false);
//     setDoorStatus('closed');
//     setScreen('idle');
//   }, [cameraHook, resetSession, resetFaceScan, resetEpiScan]);

//   const handleTimeOverride = useCallback(() => {
//     resetEpiScan(true);
//     cameraHook.startStream('body1');
//     if (cameraHook.getAssignment('body2')) cameraHook.startStream('body2');
//     setScreen('epi_scan');
//   }, [cameraHook, resetEpiScan]);

//   const handleRetryFromDenied = useCallback(() => {
//     setSession((prev) => ({ ...prev, epiResult: null, missingEpi: [] }));
//     resetEpiScan(false);
//     setScreen('epi_scan');
//   }, [resetEpiScan]);

//   const handleSaveConfig = useCallback((newConfig: Partial<SysConfig>) => {
//     setSysConfig((prev) => ({ ...prev, ...newConfig }));
//   }, []);

//   // ─── ACTION: Captura facial ───────────────────────────────────────────────

//   const handleCaptureFace = useCallback(async () => {
//     if (faceStep !== 'ready') return;
//     faceAutoCapture.current = false;

//     try {
//       setFaceStep('capturing');
//       setFaceStatusMsg('Capturando frame…');

//       const { blob, dataUrl } = await cameraHook.captureFrame('face');
//       setFaceCaptureUrl(dataUrl);

//       setFaceStep('processing');
//       setFaceStatusMsg('Iniciando sessão de validação…');
//       setFaceProgress(20);

//       const sessionData = await api.startValidationSession({
//         direction,
//         door_id: sysConfig.doorId,
//         zone_id: sysConfig.zoneId,
//       });
//       const uuid = sessionData.session_uuid || sessionData.sessionUuid!;
//       setFaceProgress(40);

//       setFaceStatusMsg('Reconhecendo rosto…');
//       const photo = await api.sendValidationPhoto(uuid, blob, { photoType: 'face', cameraId: 1 });
//       setFaceProgress(80);

//       if (photo.face_detected || photo.face_recognized || photo.face_person_code || photo.person_code) {
//         setFaceProgress(100);
//         setFaceStep('done');

//         const resolvedCode = photo.face_person_code || photo.person_code || '';
//         const resolvedName = photo.person_name || resolvedCode;
//         const resolvedConf = photo.face_confidence || photo.confidence || 0;

//         setFaceStatusMsg(`Identificado: ${resolvedName}`);
//         setFaceSubMsg(`Confiança: ${Math.round(resolvedConf * 100)}%`);

//         const person: Person = {
//           personCode: resolvedCode,
//           personName: resolvedName,
//           confidence: resolvedConf,
//         };
//         setSession((prev) => ({ ...prev, sessionUuid: uuid, person, dailyExposure: photo.daily_exposure ?? null }));

//         setTimeout(() => {
//           if (direction === 'EXIT') { setScreen('idle'); return; }

//           const totalMin = photo.daily_exposure?.total_minutes ?? 0;
//           const limitMin = photo.daily_exposure?.limit_minutes ?? sysConfig.dailyLimitMin;

//           if (totalMin >= limitMin) {
//             setScreen('time_alert');
//           } else {
//             resetEpiScan(true);
//             cameraHook.startStream('body1');
//             if (cameraHook.getAssignment('body2')) cameraHook.startStream('body2');
//             setScreen('epi_scan');
//           }
//         }, 900);

//       } else {
//         setFaceStep('error');
//         setFaceStatusMsg('Rosto não reconhecido');
//         setFaceSubMsg('Tente novamente ou solicite acesso manual');
//         setFaceProgress(0);
//       }
//     } catch (e) {
//       const err = e as { response?: { data?: { detail?: string } }; message?: string };
//       setFaceStep('error');
//       setFaceStatusMsg('Erro ao processar');
//       setFaceSubMsg(err.response?.data?.detail || err.message || '');
//       setFaceProgress(0);
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [faceStep, cameraHook, direction, sysConfig, resetEpiScan]);

//   const handleRetryFace = useCallback(() => resetFaceScan(false), [resetFaceScan]);

//   // ─── ACTION: Captura EPI ──────────────────────────────────────────────────

//   const handleCaptureEpi = useCallback(async () => {
//     if (epiStep !== 'ready' || !session.sessionUuid) return;
//     epiAutoCapture.current = false;

//     const hasBody2 = !!cameraHook.getAssignment('body2');

//     try {
//       setEpiStep('capturing');
//       setEpiStatusMsg('Capturando frames…');

//       const { blob: blob1, dataUrl: url1 } = await cameraHook.captureFrame('body1');
//       setEpiCaptureUrl1(url1);

//       let blob2: Blob | null = null;
//       if (hasBody2) {
//         try {
//           const f2 = await cameraHook.captureFrame('body2');
//           setEpiCaptureUrl2(f2.dataUrl);
//           blob2 = f2.blob;
//         } catch (e2) {
//           console.warn('[useCamAutomation] Body2 capture failed:', (e2 as Error).message);
//         }
//       }

//       setEpiStep('processing');
//       setEpiStatusMsg('Detectando EPIs… aguarde');

//       const photo1 = await api.sendValidationPhoto(session.sessionUuid, blob1, { photoType: 'body', cameraId: 2 });
//       let finalResult: EpiResult = { ...photo1, compliant: photo1.compliant ?? false };

//       if (blob2) {
//         try {
//           const photo2 = await api.sendValidationPhoto(session.sessionUuid, blob2, { photoType: 'body', cameraId: 3 });
//           if (!photo2.compliant) finalResult = { ...photo2, compliant: photo2.compliant ?? false };
//         } catch (e3) {
//           console.warn('[useCamAutomation] Body2 send failed:', (e3 as Error).message);
//         }
//       }

//       try { await api.closeValidationSession(session.sessionUuid); } catch (_) { /* silencioso */ }

//       setEpiResult(finalResult);
//       setEpiStep('done');
//       setSession((prev) => ({ ...prev, epiResult: finalResult }));

//       if (finalResult.compliant) {
//         setEpiStatusMsg('✅ EPI Completo — Acesso liberado');
//         try {
//           await api.openDoor({
//             personCode:  session.person?.personCode,
//             personName:  session.person?.personName,
//             sessionUuid: session.sessionUuid,
//             reason:      'EPI_COMPLIANT',
//           });
//           setDoorStatus('open');
//         } catch (e) {
//           console.error('[useCamAutomation] Door open failed:', e);
//         }
//         setTimeout(() => setScreen('access_granted'), 1200);
//       } else {
//         setEpiStatusMsg('❌ EPI Incompleto — Acesso negado');
//         const missing = (finalResult.missing || finalResult.missing_ppe || []).map(epiLabel);
//         setSession((prev) => ({ ...prev, missingEpi: missing }));
//         setDoorStatus('closed');
//         setTimeout(() => setScreen('access_denied'), 1200);
//       }
//     } catch (e) {
//       console.error('[useCamAutomation] EPI capture failed:', e);
//       setEpiStep('error');
//       setEpiStatusMsg('Erro na detecção de EPI');
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [epiStep, session, cameraHook]);

//   const handleRetryEpi = useCallback(() => resetEpiScan(false), [resetEpiScan]);

//   // ─── ACTION: Salva config (modal) ─────────────────────────────────────────

//   const handleSaveConfigModal = useCallback(async () => {
//     try {
//       setSaving(true);
//       handleSaveConfig(localConfig);
//       if (epiConfig?.required_ppe) {
//         await api.saveEpiConfig({ required_ppe: epiConfig.required_ppe });
//       }
//       setSaved(true);
//       setTimeout(() => setSaved(false), 2000);
//     } catch (e) {
//       console.error('[useCamAutomation] saveConfig failed:', e);
//     } finally {
//       setSaving(false);
//     }
//   }, [localConfig, epiConfig, handleSaveConfig]);

//   // ─── Return ───────────────────────────────────────────────────────────────

//   return {
//     screen,
//     direction,
//     doorStatus,
//     session,
//     sysConfig,
//     showReport,
//     showConfig,
//     setShowReport,
//     setShowConfig,
//     cameraHook,

//     idleState: {
//       dashboard,
//       loadingDash,
//       refreshDashboard,
//     },

//     faceScanState: {
//       step:       faceStep,
//       captureUrl: faceCaptureUrl,
//       progress:   faceProgress,
//       statusMsg:  faceStatusMsg,
//       subMsg:     faceSubMsg,
//       countdown:  faceCountdown,
//     },

//     epiScanState: {
//       step:        epiStep,
//       captureUrl1: epiCaptureUrl1,
//       captureUrl2: epiCaptureUrl2,
//       statusMsg:   epiStatusMsg,
//       countdown:   epiCountdown,
//       result:      epiResult,
//     },

//     configState: {
//       localConfig,
//       epiConfig,
//       saving,
//       saved,
//       setLocalConfig,
//       setEpiConfig,
//       handleSave: handleSaveConfigModal,
//     },

//     permanenceState: {
//       people,
//       loading: loadingPeople,
//       fetchPeople,
//     },

//     handleStartEntry,
//     handleStartExit,
//     handleGoIdle,
//     handleTimeOverride,
//     handleRetryFromDenied,
//     handleSaveConfig,

//     handleCaptureFace,
//     handleRetryFace,
//     handleCaptureEpi,
//     handleRetryEpi,
//   };
// }



// // src/hooks/useCamAutomation.ts
// // Hook central da máquina de estados do fluxo de automação EPI Check
// // Responsável por: estado da sessão, câmeras, configuração, todas as chamadas de API
// // Os screens e components NÃO importam a API diretamente — tudo vem deste hook
// // ⚠️  VERSÃO COM DEBUG ATIVO - Ver logs com 🔍 [DEBUG] no console

// import { useState, useEffect, useCallback, useRef } from 'react';
// import axios from 'axios';

// // ─────────────────────────────────────────────────────────────────────────────
// // API LAYER (interno ao hook — nenhum screen/component precisa importar)
// // ─────────────────────────────────────────────────────────────────────────────

// /**
//  * Retorna a URL base da API — mesmo padrão do useAssetAvailability.
//  * Usa sessionStorage['apiEndpoint'] quando disponível,
//  * com fallback para a URL de produção do SmartX.
//  */
// const getApiBaseUrl = (): string => {
//   const saved = sessionStorage.getItem('apiEndpoint');
//   return saved ?? 'https://aihub.smartxhub.cloud';
// };

// /** Cria um axios instance apontando para o endpoint atual */
// const makeHttp = () =>
//   axios.create({ baseURL: getApiBaseUrl(), timeout: 30000 });

// // Prefixo base do router EPI no backend FastAPI
// // Montado em: /api/v1/epi  (router = APIRouter(), incluído com prefix="/api/v1/epi")
// const EPI = '/api/v1/epi';

// const api = {
//   // Não existe endpoint /local/config no backend — retorna objeto vazio silenciosamente
//   getLocalConfig: async (): Promise<Partial<SysConfig>> => {
//     try {
//       const { data } = await makeHttp().get(`${EPI}/local/config`);
//       return data;
//     } catch {
//       return {}; // fallback para DEFAULT_CONFIG
//     }
//   },

//   // GET /api/v1/epi/analytics/dashboard
//   getDashboard: async (): Promise<DashboardData> => {
//     const { data } = await makeHttp().get(`${EPI}/analytics/dashboard`);
//     return data;
//   },

//   // GET /api/v1/epi/analytics/people
//   getPeople: async (activeOnly = false): Promise<{ people?: WorkerRecord[] } | WorkerRecord[]> => {
//     const { data } = await makeHttp().get(`${EPI}/analytics/people`, { params: { active_only: activeOnly } });
//     return data;
//   },

//   // GET /api/v1/epi/config
//   getEpiConfig: async (): Promise<EpiConfig> => {
//     const { data } = await makeHttp().get(`${EPI}/config`);
//     // backend retorna { config, active_classes, all_classes }
//     // mapeia para o formato EpiConfig esperado pelo hook
//     return {
//       required_ppe:       data.config?.required_ppe ?? [],
//       available_classes:  data.all_classes ? Object.values(data.all_classes) as string[] : [],
//       config:             data.config,
//     };
//   },

//   // POST /api/v1/epi/config  — body: { required_ppe: string[] }
//   saveEpiConfig: async (config: { required_ppe: string[] }): Promise<void> => {
//     await makeHttp().post(`${EPI}/config`, config);
//   },

//   // POST /api/v1/epi/validation/start  — Form data (FastAPI usa Form(...))
//   startValidationSession: async (
//     overrides: Record<string, unknown> = {},
//   ): Promise<{ session_uuid: string; sessionUuid?: string }> => {
//     const form = new FormData();
//     form.append('door_id',    String(overrides.door_id  ?? 'DOOR_01'));
//     form.append('direction',  String(overrides.direction ?? 'ENTRY'));
//     form.append('zone_id',    String(overrides.zone_id  ?? ''));
//     form.append('compliance_mode',       'majority');
//     form.append('photo_count_required',  '1');   // 1 foto por captura (face ou body)
//     form.append('timeout_seconds',       '30');
//     const { data } = await makeHttp().post(`${EPI}/validation/start`, form);
//     return data;
//   },

//   // POST /api/v1/epi/validation/photo  — multipart/form-data
//   // ⚠️  COM LOGS DE DEBUG
//   sendValidationPhoto: async (
//     sessionUuid: string,
//     frameBlob: Blob,
//     opts: { photoType?: string; cameraId?: number } = {},
//   ): Promise<PhotoResult> => {
//     console.log('🔍 [API] ========================================');
//     console.log('🔍 [API] sendValidationPhoto CHAMADA');
//     console.log('🔍 [API] ========================================');
//     console.log('🔍 [API] sessionUuid:', sessionUuid);
//     console.log('🔍 [API] frameBlob:', {
//       size: frameBlob.size,
//       type: frameBlob.type,
//     });
//     console.log('🔍 [API] opts:', opts);

//     const form = new FormData();
//     form.append('session_uuid', sessionUuid);
//     form.append('file', frameBlob, 'frame.jpg');
//     if (opts.cameraId !== undefined) form.append('camera_id', String(opts.cameraId));
//     if (opts.photoType) form.append('photo_type', opts.photoType);

//     // Log de todos os campos do FormData
//     console.log('🔍 [API] FormData fields:');
//     for (const [key, value] of form.entries()) {
//       if (value instanceof Blob) {
//         console.log(`  ${key}: Blob(${value.size} bytes, ${value.type})`);
//       } else {
//         console.log(`  ${key}:`, value);
//       }
//     }

//     const endpoint = `${EPI}/validation/photo`;
//     const fullUrl = `${getApiBaseUrl()}${endpoint}`;
//     console.log('🔍 [API] Full URL:', fullUrl);

//     try {
//       const { data } = await makeHttp().post(endpoint, form, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
      
//       console.log('🔍 [API] ✅ SUCCESS');
//       console.log('🔍 [API] Response data:', data);
//       return data;
      
//     } catch (error) {
//       console.error('🔍 [API] ========================================');
//       console.error('🔍 [API] ❌ REQUEST FAILED');
//       console.error('🔍 [API] ========================================');
//       console.error('🔍 [API] Error:', error);
      
//       const axiosError = error as any;
//       if (axiosError.response) {
//         console.error('🔍 [API] Status:', axiosError.response.status);
//         console.error('🔍 [API] Data:', axiosError.response.data);
//         console.error('🔍 [API] Headers:', axiosError.response.headers);
//       }
      
//       throw error;
//     }
//   },

//   // POST /api/v1/epi/validation/close  — Form data
//   closeValidationSession: async (sessionUuid: string): Promise<void> => {
//     const form = new FormData();
//     form.append('session_uuid', sessionUuid);
//     await makeHttp().post(`${EPI}/validation/close`, form);
//   },

//   // Endpoint de porta — não existe no backend atual, silencioso
//   openDoor: async (payload: {
//     personCode?: string;
//     personName?: string;
//     sessionUuid?: string | null;
//     reason: string;
//   }): Promise<void> => {
//     try {
//       const form = new FormData();
//       if (payload.personCode)  form.append('person_code',  payload.personCode);
//       if (payload.personName)  form.append('person_name',  payload.personName);
//       if (payload.sessionUuid) form.append('session_uuid', payload.sessionUuid);
//       form.append('reason', payload.reason);
//       await makeHttp().post(`${EPI}/door/open`, form);
//     } catch (e) {
//       console.warn('[openDoor] endpoint não disponível:', e);
//     }
//   },
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.88): Promise<Blob> {
//   return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', quality));
// }

// export function formatMinutes(mins: number | null | undefined): string {
//   if (mins == null) return '—';
//   const m = Math.round(mins);
//   if (m < 60) return `${m}min`;
//   const h = Math.floor(m / 60);
//   const rem = m % 60;
//   return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // TIPOS PÚBLICOS
// // ─────────────────────────────────────────────────────────────────────────────

// export type Screen =
//   | 'idle'
//   | 'face_scan'
//   | 'time_alert'
//   | 'epi_scan'
//   | 'access_granted'
//   | 'access_denied';

// export type Direction  = 'ENTRY' | 'EXIT';
// export type DoorStatus = 'closed' | 'open' | 'alert' | 'waiting';
// export type CamRole    = 'face' | 'body1' | 'body2';

// export interface Person {
//   personCode: string;
//   personName: string;
//   confidence: number;
// }

// export interface DailyExposure {
//   total_minutes:  number;
//   limit_minutes:  number;
//   entries_today?: number;
// }

// export interface EpiResult {
//   compliant:     boolean;
//   detected?:     string[];
//   detected_ppe?: string[];
//   missing?:      string[];
//   missing_ppe?:  string[];
// }

// export interface Session {
//   sessionUuid:   string | null;
//   person:        Person | null;
//   dailyExposure: DailyExposure | null;
//   epiResult:     EpiResult | null;
//   missingEpi:    string[];
// }

// export interface SysConfig {
//   companyId:         number;
//   zoneId:            number;
//   doorId:            string;
//   dailyLimitMin:     number;
//   overLimitPolicy:   'warn' | 'block';
//   doorOpenMaxMin:    number;
//   faceConfidenceMin: number;
//   apiBase:           string;
// }

// export interface EpiConfig {
//   required_ppe:       string[];
//   available_classes?: string[];
//   config?:            Record<string, unknown>;
// }

// export interface DashboardData {
//   inside_count?:     number;
//   people_inside?:    number;
//   entries_today?:    number;
//   today?:            { total?: number };
//   open_alerts?:      number;
//   alerts_open?:      number;
//   over_limit_count?: number;
// }

// export interface WorkerRecord {
//   person_code:            string;
//   person_name:            string;
//   department?:            string;
//   is_inside?:             boolean;
//   daily_accumulated_min?: number;
//   total_minutes?:         number;
//   total_entries?:         number;
//   sessions_today?:        number;
// }

// export interface CamDevice {
//   deviceId: string;
//   label:    string;
//   kind:     string;
// }

// export interface CameraHook {
//   devices:          CamDevice[];
//   assignments:      Record<CamRole, string | null>;
//   streams:          Partial<Record<CamRole, MediaStream>>;
//   loading:          boolean;
//   error:            string | null;
//   enumerateDevices: () => Promise<CamDevice[]>;
//   startStream:      (role: CamRole) => Promise<MediaStream | null>;
//   stopStream:       (role: CamRole) => void;
//   stopAllStreams:   () => void;
//   captureFrame:     (role: CamRole) => Promise<{ blob: Blob; dataUrl: string; canvas: HTMLCanvasElement }>;
//   assignDevice:     (role: CamRole, deviceId: string | null) => void;
//   setVideoRef:      (role: CamRole, element: HTMLVideoElement | null) => void;
//   hasStream:        (role: CamRole) => boolean;
//   getAssignment:    (role: CamRole) => string | null;
// }

// // ─── Tipos internos da API ────────────────────────────────────────────────────

// interface PhotoResult {
//   // Retorno do /validation/photo (backend real)
//   session_uuid?:          string;
//   photo_seq?:             number;
//   photo_count_received?:  number;
//   photo_count_required?:  number;
//   session_complete?:      boolean;

//   // Face
//   face_detected?:         boolean;
//   face_recognized?:       boolean;   // alias legado
//   face_confidence?:       number;
//   face_person_code?:      string;
//   person_code?:           string;    // alias legado
//   person_name?:           string;
//   confidence?:            number;    // alias legado

//   // EPI
//   epi_compliant?:         boolean;
//   compliant?:             boolean;   // alias legado
//   compliance_score?:      number;
//   missing?:               string[];
//   missing_ppe?:           string[];
//   detected?:              string[];
//   detected_ppe?:          string[];

//   // Sessão finalizada
//   final_decision?: {
//     access_decision:       string;
//     epi_compliant:         boolean;
//     face_confirmed:        boolean;
//     face_confidence_max?:  number;
//     person_code?:          string;
//     person_name?:          string;
//   } | null;

//   daily_exposure?: DailyExposure;
// }

// // ─── Estados por screen/modal (expostos como props prontas) ───────────────────

// export type FaceScanStep = 'ready' | 'capturing' | 'processing' | 'done' | 'error';

// export interface FaceScanState {
//   step:       FaceScanStep;
//   captureUrl: string | null;
//   progress:   number;
//   statusMsg:  string;
//   subMsg:     string;
//   countdown:  number | null;
// }

// export type EpiScanStep = 'ready' | 'capturing' | 'processing' | 'done' | 'error';

// export interface EpiScanState {
//   step:        EpiScanStep;
//   captureUrl1: string | null;
//   captureUrl2: string | null;
//   statusMsg:   string;
//   countdown:   number | null;
//   result:      EpiResult | null;
// }

// export interface IdleState {
//   dashboard:        DashboardData | null;
//   loadingDash:      boolean;
//   refreshDashboard: () => void;
// }

// export interface ConfigState {
//   localConfig:    SysConfig;
//   epiConfig:      EpiConfig | null;
//   saving:         boolean;
//   saved:          boolean;
//   setLocalConfig: (cfg: SysConfig) => void;
//   setEpiConfig:   (cfg: EpiConfig | null) => void;
//   handleSave:     () => Promise<void>;
// }

// export interface PermanenceState {
//   people:      WorkerRecord[];
//   loading:     boolean;
//   fetchPeople: () => Promise<void>;
// }

// // ─── Return do hook ───────────────────────────────────────────────────────────

// export interface UseCamAutomationReturn {
//   // Máquina de estados
//   screen:     Screen;
//   direction:  Direction;
//   doorStatus: DoorStatus;
//   session:    Session;
//   sysConfig:  SysConfig;

//   // Modais
//   showReport:    boolean;
//   showConfig:    boolean;
//   setShowReport: (v: boolean) => void;
//   setShowConfig: (v: boolean) => void;

//   // Câmeras
//   cameraHook: CameraHook;

//   // Estados prontos para cada screen/modal
//   idleState:       IdleState;
//   faceScanState:   FaceScanState;
//   epiScanState:    EpiScanState;
//   configState:     ConfigState;
//   permanenceState: PermanenceState;

//   // Navegação
//   handleStartEntry:      () => void;
//   handleStartExit:       () => void;
//   handleGoIdle:          () => void;
//   handleTimeOverride:    () => void;
//   handleRetryFromDenied: () => void;
//   handleSaveConfig:      (newConfig: Partial<SysConfig>) => void;

//   // Ações (chamam API internamente)
//   handleCaptureFace: () => Promise<void>;
//   handleRetryFace:   () => void;
//   handleCaptureEpi:  () => Promise<void>;
//   handleRetryEpi:    () => void;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // CONSTANTES
// // ─────────────────────────────────────────────────────────────────────────────

// const LS_KEYS: Record<CamRole, string> = {
//   face:  'epi_cam_face',
//   body1: 'epi_cam_body1',
//   body2: 'epi_cam_body2',
// };

// const EMPTY_SESSION: Session = {
//   sessionUuid:   null,
//   person:        null,
//   dailyExposure: null,
//   epiResult:     null,
//   missingEpi:    [],
// };

// const DEFAULT_CONFIG: SysConfig = {
//   companyId:         1,
//   zoneId:            10,
//   doorId:            'DOOR_CAMARA_FRIA_01',
//   dailyLimitMin:     120,
//   overLimitPolicy:   'warn',
//   doorOpenMaxMin:    15,
//   faceConfidenceMin: 70,
//   apiBase:           'https://aihub.smartxhub.cloud',
// };

// const EPI_LABELS_PT: Record<string, string> = {
//   helmet:        'Capacete',
//   vest:          'Colete',
//   gloves:        'Luvas',
//   boots:         'Botas',
//   thermal_coat:  'Jaqueta Térmica',
//   thermal_pants: 'Calça Térmica',
//   glasses:       'Óculos de Proteção',
//   mask:          'Máscara',
//   apron:         'Avental',
//   hardhat:       'Capacete',
// };

// const epiLabel = (k: string) => EPI_LABELS_PT[k] ?? k;

// // ─────────────────────────────────────────────────────────────────────────────
// // HOOK DE CÂMERAS (interno)
// // ─────────────────────────────────────────────────────────────────────────────

// function useCameraInternal(): CameraHook {
//   const [devices,     setDevices]     = useState<CamDevice[]>([]);
//   const [assignments, setAssignments] = useState<Record<CamRole, string | null>>({
//     face:  localStorage.getItem(LS_KEYS.face)  || null,
//     body1: localStorage.getItem(LS_KEYS.body1) || null,
//     body2: localStorage.getItem(LS_KEYS.body2) || null,
//   });
//   const [streams, setStreams] = useState<Partial<Record<CamRole, MediaStream>>>({});
//   const [loading, setLoading] = useState(false);
//   const [error,   setError]   = useState<string | null>(null);
//   const videoRefs = useRef<Partial<Record<CamRole, HTMLVideoElement | null>>>({});

//   const enumerateDevices = useCallback(async (): Promise<CamDevice[]> => {
//     try {
//       await navigator.mediaDevices
//         .getUserMedia({ video: true, audio: false })
//         .then((s) => s.getTracks().forEach((t) => t.stop()))
//         .catch(() => {});
//       const all  = await navigator.mediaDevices.enumerateDevices();
//       const vids = all.filter((d) => d.kind === 'videoinput') as CamDevice[];
//       setDevices(vids);
//       setAssignments((prev) => {
//         const next = { ...prev };
//         if (!next.face  && vids[0]) next.face  = vids[0].deviceId;
//         if (!next.body1 && vids[1]) next.body1 = vids[1].deviceId;
//         if (!next.body2 && vids[2]) next.body2 = vids[2].deviceId;
//         return next;
//       });
//       return vids;
//     } catch (e) {
//       setError(e instanceof Error ? e.message : String(e));
//       return [];
//     }
//   }, []);

//   const startStream = useCallback(async (role: CamRole): Promise<MediaStream | null> => {
//     const deviceId = assignments[role];
//     if (!deviceId) return null;
//     streams[role]?.getTracks().forEach((t) => t.stop());
//     try {
//       setLoading(true);
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
//         audio: false,
//       });
//       setStreams((prev) => ({ ...prev, [role]: stream }));
//       const ref = videoRefs.current[role];
//       if (ref) ref.srcObject = stream;
//       return stream;
//     } catch (e) {
//       setError(e instanceof Error ? e.message : String(e));
//       return null;
//     } finally {
//       setLoading(false);
//     }
//   }, [assignments, streams]);

//   const stopStream = useCallback((role: CamRole) => {
//     streams[role]?.getTracks().forEach((t) => t.stop());
//     setStreams((prev) => { const n = { ...prev }; delete n[role]; return n; });
//     const ref = videoRefs.current[role];
//     if (ref) ref.srcObject = null;
//   }, [streams]);

//   const stopAllStreams = useCallback(() => {
//     Object.values(streams).forEach((s) => s?.getTracks().forEach((t) => t.stop()));
//     setStreams({});
//     Object.values(videoRefs.current).forEach((v) => { if (v) v.srcObject = null; });
//   }, [streams]);

//   const captureFrame = useCallback(async (role: CamRole) => {
//     const video = videoRefs.current[role];
//     if (!video || video.readyState < 2) throw new Error(`Câmera "${role}" não está pronta.`);
//     const canvas = document.createElement('canvas');
//     canvas.width  = video.videoWidth  || 1280;
//     canvas.height = video.videoHeight || 720;
//     canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height);
//     const blob    = await canvasToBlob(canvas, 0.88);
//     const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
//     return { blob, dataUrl, canvas };
//   }, []);

//   const assignDevice = useCallback((role: CamRole, deviceId: string | null) => {
//     setAssignments((prev) => ({ ...prev, [role]: deviceId }));
//     localStorage.setItem(LS_KEYS[role], deviceId || '');
//   }, []);

//   const setVideoRef = useCallback((role: CamRole, element: HTMLVideoElement | null) => {
//     videoRefs.current[role] = element;
//     if (element && streams[role]) element.srcObject = streams[role]!;
//   }, [streams]);

//   useEffect(() => {
//     enumerateDevices();
//     const handler = () => enumerateDevices();
//     navigator.mediaDevices.addEventListener('devicechange', handler);
//     return () => {
//       navigator.mediaDevices.removeEventListener('devicechange', handler);
//       stopAllStreams();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return {
//     devices, assignments, streams, loading, error,
//     enumerateDevices, startStream, stopStream, stopAllStreams,
//     captureFrame, assignDevice, setVideoRef,
//     hasStream:     (role) => !!streams[role],
//     getAssignment: (role) => assignments[role],
//   };
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HOOK PRINCIPAL
// // ─────────────────────────────────────────────────────────────────────────────

// export function useCamAutomation(): UseCamAutomationReturn {

//   // ── Máquina de estados ────────────────────────────────────────────────────
//   const [screen,     setScreen]     = useState<Screen>('idle');
//   const [direction,  setDirection]  = useState<Direction>('ENTRY');
//   const [doorStatus, setDoorStatus] = useState<DoorStatus>('closed');
//   const [session,    setSession]    = useState<Session>(EMPTY_SESSION);
//   const [sysConfig,  setSysConfig]  = useState<SysConfig>(DEFAULT_CONFIG);
//   const [showReport, setShowReport] = useState(false);
//   const [showConfig, setShowConfig] = useState(false);

//   // ── Câmeras ───────────────────────────────────────────────────────────────
//   const cameraHook = useCameraInternal();

//   // ── Idle state ────────────────────────────────────────────────────────────
//   const [dashboard,   setDashboard]   = useState<DashboardData | null>(null);
//   const [loadingDash, setLoadingDash] = useState(true);

//   // ── FaceScan state ────────────────────────────────────────────────────────
//   const [faceStep,       setFaceStep]       = useState<FaceScanStep>('ready');
//   const [faceCaptureUrl, setFaceCaptureUrl] = useState<string | null>(null);
//   const [faceProgress,   setFaceProgress]   = useState(0);
//   const [faceStatusMsg,  setFaceStatusMsg]  = useState('Posicione seu rosto na câmera e toque em Capturar');
//   const [faceSubMsg,     setFaceSubMsg]     = useState('');
//   const [faceCountdown,  setFaceCountdown]  = useState<number | null>(null);
//   const faceAutoCapture = useRef(false);

//   // ── EpiScan state ─────────────────────────────────────────────────────────
//   const [epiStep,        setEpiStep]        = useState<EpiScanStep>('ready');
//   const [epiCaptureUrl1, setEpiCaptureUrl1] = useState<string | null>(null);
//   const [epiCaptureUrl2, setEpiCaptureUrl2] = useState<string | null>(null);
//   const [epiStatusMsg,   setEpiStatusMsg]   = useState('Posicione-se em frente às câmeras de corpo');
//   const [epiCountdown,   setEpiCountdown]   = useState<number | null>(null);
//   const [epiResult,      setEpiResult]      = useState<EpiResult | null>(null);
//   const epiAutoCapture = useRef(false);

//   // ── Config modal state ────────────────────────────────────────────────────
//   const [localConfig, setLocalConfig] = useState<SysConfig>(DEFAULT_CONFIG);
//   const [epiConfig,   setEpiConfig]   = useState<EpiConfig | null>(null);
//   const [saving,      setSaving]      = useState(false);
//   const [saved,       setSaved]       = useState(false);

//   // ── Permanence modal state ────────────────────────────────────────────────
//   const [people,        setPeople]        = useState<WorkerRecord[]>([]);
//   const [loadingPeople, setLoadingPeople] = useState(false);

//   // ─── Helpers de reset ─────────────────────────────────────────────────────

//   const resetSession = useCallback(() => setSession(EMPTY_SESSION), []);

//   const resetFaceScan = useCallback((withAutoCapture = false) => {
//     faceAutoCapture.current = withAutoCapture;
//     setFaceStep('ready');
//     setFaceCaptureUrl(null);
//     setFaceProgress(0);
//     setFaceStatusMsg('Posicione seu rosto na câmera e toque em Capturar');
//     setFaceSubMsg('');
//     setFaceCountdown(null);
//   }, []);

//   const resetEpiScan = useCallback((withAutoCapture = false) => {
//     epiAutoCapture.current = withAutoCapture;
//     setEpiStep('ready');
//     setEpiCaptureUrl1(null);
//     setEpiCaptureUrl2(null);
//     setEpiStatusMsg('Posicione-se em frente às câmeras de corpo');
//     setEpiCountdown(null);
//     setEpiResult(null);
//   }, []);

//   // ─── Carrega config do backend ────────────────────────────────────────────

//   useEffect(() => {
//     api.getLocalConfig()
//       .then((cfg) => {
//         setSysConfig((prev) => ({ ...prev, ...cfg }));
//         setLocalConfig((prev) => ({ ...prev, ...cfg }));
//       })
//       .catch((e: Error) => console.warn('[useCamAutomation] Config load failed:', e.message));
//   }, []);

//   // ─── Dashboard polling (apenas na tela idle) ──────────────────────────────

//   const refreshDashboard = useCallback(async () => {
//     try {
//       const data = await api.getDashboard();
//       setDashboard(data);
//     } catch (e) {
//       console.warn('[useCamAutomation] Dashboard failed:', e);
//     } finally {
//       setLoadingDash(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (screen !== 'idle') return;
//     refreshDashboard();
//     const t = setInterval(refreshDashboard, 30000);
//     return () => clearInterval(t);
//   }, [screen, refreshDashboard]);

//   // ─── EpiConfig ao abrir modal de config ──────────────────────────────────

//   useEffect(() => {
//     if (!showConfig) return;
//     setLocalConfig({ ...sysConfig });
//     api.getEpiConfig().then(setEpiConfig).catch(console.warn);
//   }, [showConfig, sysConfig]);

//   // ─── People ao abrir modal de permanência ─────────────────────────────────

//   const fetchPeople = useCallback(async () => {
//     try {
//       setLoadingPeople(true);
//       const data = await api.getPeople(false);
//       const list = (data as { people?: WorkerRecord[] }).people ?? (data as WorkerRecord[]) ?? [];
//       setPeople(list);
//     } catch (e) {
//       console.error('[useCamAutomation] fetchPeople failed:', e);
//     } finally {
//       setLoadingPeople(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (showReport) fetchPeople();
//   }, [showReport, fetchPeople]);

//   // ─── Auto-capture: face ───────────────────────────────────────────────────

//   useEffect(() => {
//     if (screen !== 'face_scan' || !faceAutoCapture.current || faceStep !== 'ready') return;
//     let n = 3;
//     setFaceCountdown(n);
//     const t = setInterval(() => {
//       n -= 1;
//       if (n <= 0) { clearInterval(t); setFaceCountdown(null); handleCaptureFace(); }
//       else setFaceCountdown(n);
//     }, 1000);
//     return () => { clearInterval(t); setFaceCountdown(null); };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [screen, faceStep]);

//   // ─── Auto-capture: EPI ───────────────────────────────────────────────────

//   useEffect(() => {
//     if (screen !== 'epi_scan' || !epiAutoCapture.current || epiStep !== 'ready') return;
//     let n = 4;
//     setEpiCountdown(n);
//     const t = setInterval(() => {
//       n -= 1;
//       if (n <= 0) { clearInterval(t); setEpiCountdown(null); handleCaptureEpi(); }
//       else setEpiCountdown(n);
//     }, 1000);
//     return () => { clearInterval(t); setEpiCountdown(null); };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [screen, epiStep]);

//   // ─── Navegação ────────────────────────────────────────────────────────────

//   const handleStartEntry = useCallback(() => {
//     setDirection('ENTRY');
//     resetSession();
//     resetFaceScan(true);
//     cameraHook.startStream('face');
//     setScreen('face_scan');
//   }, [resetSession, resetFaceScan, cameraHook]);

//   const handleStartExit = useCallback(() => {
//     setDirection('EXIT');
//     resetSession();
//     resetFaceScan(true);
//     cameraHook.startStream('face');
//     setScreen('face_scan');
//   }, [resetSession, resetFaceScan, cameraHook]);

//   const handleGoIdle = useCallback(() => {
//     cameraHook.stopAllStreams();
//     resetSession();
//     resetFaceScan(false);
//     resetEpiScan(false);
//     setDoorStatus('closed');
//     setScreen('idle');
//   }, [cameraHook, resetSession, resetFaceScan, resetEpiScan]);

//   const handleTimeOverride = useCallback(() => {
//     resetEpiScan(true);
//     cameraHook.startStream('body1');
//     if (cameraHook.getAssignment('body2')) cameraHook.startStream('body2');
//     setScreen('epi_scan');
//   }, [cameraHook, resetEpiScan]);

//   const handleRetryFromDenied = useCallback(() => {
//     setSession((prev) => ({ ...prev, epiResult: null, missingEpi: [] }));
//     resetEpiScan(false);
//     setScreen('epi_scan');
//   }, [resetEpiScan]);

//   const handleSaveConfig = useCallback((newConfig: Partial<SysConfig>) => {
//     setSysConfig((prev) => ({ ...prev, ...newConfig }));
//   }, []);

//   // ─── ACTION: Captura facial ───────────────────────────────────────────────

//   const handleCaptureFace = useCallback(async () => {
//     if (faceStep !== 'ready') return;
//     faceAutoCapture.current = false;

//     try {
//       setFaceStep('capturing');
//       setFaceStatusMsg('Capturando frame…');

//       const { blob, dataUrl } = await cameraHook.captureFrame('face');
//       setFaceCaptureUrl(dataUrl);

//       setFaceStep('processing');
//       setFaceStatusMsg('Iniciando sessão de validação…');
//       setFaceProgress(20);

//       const sessionData = await api.startValidationSession({
//         direction,
//         door_id: sysConfig.doorId,
//         zone_id: sysConfig.zoneId,
//       });
//       const uuid = sessionData.session_uuid || sessionData.sessionUuid!;
//       setFaceProgress(40);

//       setFaceStatusMsg('Reconhecendo rosto…');
//       const photo = await api.sendValidationPhoto(uuid, blob, { photoType: 'face', cameraId: 1 });
//       setFaceProgress(80);

//       if (photo.face_detected || photo.face_recognized || photo.face_person_code || photo.person_code) {
//         setFaceProgress(100);
//         setFaceStep('done');

//         const resolvedCode = photo.face_person_code || photo.person_code || '';
//         const resolvedName = photo.person_name || resolvedCode;
//         const resolvedConf = photo.face_confidence || photo.confidence || 0;

//         setFaceStatusMsg(`Identificado: ${resolvedName}`);
//         setFaceSubMsg(`Confiança: ${Math.round(resolvedConf * 100)}%`);

//         const person: Person = {
//           personCode: resolvedCode,
//           personName: resolvedName,
//           confidence: resolvedConf,
//         };
//         setSession((prev) => ({ ...prev, sessionUuid: uuid, person, dailyExposure: photo.daily_exposure ?? null }));

//         setTimeout(() => {
//           if (direction === 'EXIT') { setScreen('idle'); return; }

//           const totalMin = photo.daily_exposure?.total_minutes ?? 0;
//           const limitMin = photo.daily_exposure?.limit_minutes ?? sysConfig.dailyLimitMin;

//           if (totalMin >= limitMin) {
//             setScreen('time_alert');
//           } else {
//             resetEpiScan(true);
//             cameraHook.startStream('body1');
//             if (cameraHook.getAssignment('body2')) cameraHook.startStream('body2');
//             setScreen('epi_scan');
//           }
//         }, 900);

//       } else {
//         setFaceStep('error');
//         setFaceStatusMsg('Rosto não reconhecido');
//         setFaceSubMsg('Tente novamente ou solicite acesso manual');
//         setFaceProgress(0);
//       }
//     } catch (e) {
//       const err = e as { response?: { data?: { detail?: string } }; message?: string };
//       setFaceStep('error');
//       setFaceStatusMsg('Erro ao processar');
//       setFaceSubMsg(err.response?.data?.detail || err.message || '');
//       setFaceProgress(0);
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [faceStep, cameraHook, direction, sysConfig, resetEpiScan]);

//   const handleRetryFace = useCallback(() => resetFaceScan(false), [resetFaceScan]);

//   // ─── ACTION: Captura EPI ──────────────────────────────────────────────────
//   // ⚠️  COM LOGS DE DEBUG

//   const handleCaptureEpi = useCallback(async () => {
//     if (epiStep !== 'ready' || !session.sessionUuid) {
//       console.log('🔍 [DEBUG] handleCaptureEpi abortado:', {
//         epiStep,
//         hasSessionUuid: !!session.sessionUuid
//       });
//       return;
//     }
//     epiAutoCapture.current = false;

//     const hasBody2 = !!cameraHook.getAssignment('body2');

//     // ===== LOGS DE DEBUG DETALHADOS =====
//     console.log('🔍 [DEBUG] ========================================');
//     console.log('🔍 [DEBUG] INICIANDO CAPTURA EPI');
//     console.log('🔍 [DEBUG] ========================================');
//     console.log('🔍 [DEBUG] Session UUID:', session.sessionUuid);
//     console.log('🔍 [DEBUG] Person:', session.person);
//     console.log('🔍 [DEBUG] SysConfig:', {
//       companyId: sysConfig.companyId,
//       zoneId: sysConfig.zoneId,
//       doorId: sysConfig.doorId,
//       apiBase: sysConfig.apiBase,
//     });
//     console.log('🔍 [DEBUG] Has Body2:', hasBody2);
//     console.log('🔍 [DEBUG] ========================================');

//     try {
//       setEpiStep('capturing');
//       setEpiStatusMsg('Capturando frames…');

//       // Captura body1
//       console.log('🔍 [DEBUG] Capturando body1...');
//       const { blob: blob1, dataUrl: url1 } = await cameraHook.captureFrame('body1');
//       setEpiCaptureUrl1(url1);
      
//       console.log('🔍 [DEBUG] ✅ Body1 capturado:', {
//         size: blob1.size,
//         type: blob1.type,
//       });

//       // Captura body2 (opcional)
//       let blob2: Blob | null = null;
//       if (hasBody2) {
//         try {
//           console.log('🔍 [DEBUG] Capturando body2...');
//           const f2 = await cameraHook.captureFrame('body2');
//           setEpiCaptureUrl2(f2.dataUrl);
//           blob2 = f2.blob;
//           console.log('🔍 [DEBUG] ✅ Body2 capturado:', {
//             size: f2.blob.size,
//             type: f2.blob.type,
//           });
//         } catch (e2) {
//           console.warn('🔍 [DEBUG] ⚠️  Body2 capture failed:', (e2 as Error).message);
//         }
//       }

//       setEpiStep('processing');
//       setEpiStatusMsg('Detectando EPIs… aguarde');

//       // ===== ENVIO PARA API - BODY1 =====
//       console.log('🔍 [DEBUG] ========================================');
//       console.log('🔍 [DEBUG] ENVIANDO BODY1 PARA API');
//       console.log('🔍 [DEBUG] ========================================');
//       console.log('🔍 [DEBUG] Endpoint:', `${sysConfig.apiBase}/api/v1/epi/validation/photo`);
//       console.log('🔍 [DEBUG] Params enviados:', {
//         session_uuid: session.sessionUuid,
//         photoType: 'body',
//         cameraId: 2,
//         blobSize: blob1.size,
//         blobType: blob1.type,
//       });

//       try {
//         const photo1 = await api.sendValidationPhoto(session.sessionUuid, blob1, { photoType: 'body', cameraId: 2 });
//         console.log('🔍 [DEBUG] ✅ Body1 API response:', photo1);
        
//         let finalResult: EpiResult = { ...photo1, compliant: photo1.compliant ?? false };

//         // ===== ENVIO PARA API - BODY2 (se existir) =====
//         if (blob2) {
//           console.log('🔍 [DEBUG] ========================================');
//           console.log('🔍 [DEBUG] ENVIANDO BODY2 PARA API');
//           console.log('🔍 [DEBUG] ========================================');
//           try {
//             const photo2 = await api.sendValidationPhoto(session.sessionUuid, blob2, { photoType: 'body', cameraId: 3 });
//             console.log('🔍 [DEBUG] ✅ Body2 API response:', photo2);
//             if (!photo2.compliant) finalResult = { ...photo2, compliant: photo2.compliant ?? false };
//           } catch (e3) {
//             console.error('🔍 [DEBUG] ❌ Body2 API error:', e3);
//             console.warn('[useCamAutomation] Body2 send failed:', (e3 as Error).message);
//           }
//         }

//         // ===== FECHAR SESSÃO =====
//         console.log('🔍 [DEBUG] Fechando sessão...');
//         try { 
//           await api.closeValidationSession(session.sessionUuid);
//           console.log('🔍 [DEBUG] ✅ Sessão fechada');
//         } catch (_) { 
//           console.log('🔍 [DEBUG] ⚠️  Erro ao fechar sessão (ignorado)');
//         }

//         // ===== PROCESSAR RESULTADO =====
//         console.log('🔍 [DEBUG] ========================================');
//         console.log('🔍 [DEBUG] RESULTADO FINAL');
//         console.log('🔍 [DEBUG] ========================================');
//         console.log('🔍 [DEBUG] finalResult:', finalResult);

//         setEpiResult(finalResult);
//         setEpiStep('done');
//         setSession((prev) => ({ ...prev, epiResult: finalResult }));

//         if (finalResult.compliant) {
//           setEpiStatusMsg('✅ EPI Completo — Acesso liberado');
//           console.log('🔍 [DEBUG] ✅ EPI COMPLETO - Abrindo porta');
//           try {
//             await api.openDoor({
//               personCode:  session.person?.personCode,
//               personName:  session.person?.personName,
//               sessionUuid: session.sessionUuid,
//               reason:      'EPI_COMPLIANT',
//             });
//             setDoorStatus('open');
//             console.log('🔍 [DEBUG] ✅ Porta aberta');
//           } catch (e) {
//             console.error('🔍 [DEBUG] ❌ Erro ao abrir porta:', e);
//           }
//           setTimeout(() => setScreen('access_granted'), 1200);
//         } else {
//           setEpiStatusMsg('❌ EPI Incompleto — Acesso negado');
//           console.log('🔍 [DEBUG] ❌ EPI INCOMPLETO');
//           const missing = (finalResult.missing || finalResult.missing_ppe || []).map(epiLabel);
//           console.log('🔍 [DEBUG] EPIs faltando:', missing);
//           setSession((prev) => ({ ...prev, missingEpi: missing }));
//           setDoorStatus('closed');
//           setTimeout(() => setScreen('access_denied'), 1200);
//         }

//       } catch (apiError) {
//         // ===== CAPTURAR ERRO 400 DETALHADO =====
//         console.error('🔍 [DEBUG] ========================================');
//         console.error('🔍 [DEBUG] ❌ ERRO 400 NA API');
//         console.error('🔍 [DEBUG] ========================================');
//         console.error('🔍 [DEBUG] Error object:', apiError);
        
//         const axiosError = apiError as any;
        
//         if (axiosError.response) {
//           console.error('🔍 [DEBUG] Response status:', axiosError.response.status);
//           console.error('🔍 [DEBUG] Response data:', axiosError.response.data);
//           console.error('🔍 [DEBUG] Response headers:', axiosError.response.headers);
//         }
        
//         if (axiosError.config) {
//           console.error('🔍 [DEBUG] Request URL:', axiosError.config.url);
//           console.error('🔍 [DEBUG] Request method:', axiosError.config.method);
//           console.error('🔍 [DEBUG] Request headers:', axiosError.config.headers);
//         }
        
//         if (axiosError.request) {
//           console.error('🔍 [DEBUG] Request object:', axiosError.request);
//         }
        
//         throw apiError; // Re-throw para cair no catch externo
//       }

//     } catch (e) {
//       console.error('🔍 [DEBUG] ========================================');
//       console.error('🔍 [DEBUG] ❌ ERRO GERAL NO FLUXO EPI');
//       console.error('🔍 [DEBUG] ========================================');
//       console.error('[useCamAutomation] EPI capture failed:', e);
      
//       setEpiStep('error');
//       setEpiStatusMsg('Erro na detecção de EPI');
      
//       const errorMsg = (e as any)?.response?.data?.detail 
//         || (e as Error)?.message 
//         || 'Erro desconhecido';
      
//       console.error('🔍 [DEBUG] Error message:', errorMsg);
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [epiStep, session, cameraHook]);

//   const handleRetryEpi = useCallback(() => resetEpiScan(false), [resetEpiScan]);

//   // ─── ACTION: Salva config (modal) ─────────────────────────────────────────

//   const handleSaveConfigModal = useCallback(async () => {
//     try {
//       setSaving(true);
//       handleSaveConfig(localConfig);
//       if (epiConfig?.required_ppe) {
//         await api.saveEpiConfig({ required_ppe: epiConfig.required_ppe });
//       }
//       setSaved(true);
//       setTimeout(() => setSaved(false), 2000);
//     } catch (e) {
//       console.error('[useCamAutomation] saveConfig failed:', e);
//     } finally {
//       setSaving(false);
//     }
//   }, [localConfig, epiConfig, handleSaveConfig]);

//   // ─── Return ───────────────────────────────────────────────────────────────

//   return {
//     screen,
//     direction,
//     doorStatus,
//     session,
//     sysConfig,
//     showReport,
//     showConfig,
//     setShowReport,
//     setShowConfig,
//     cameraHook,

//     idleState: {
//       dashboard,
//       loadingDash,
//       refreshDashboard,
//     },

//     faceScanState: {
//       step:       faceStep,
//       captureUrl: faceCaptureUrl,
//       progress:   faceProgress,
//       statusMsg:  faceStatusMsg,
//       subMsg:     faceSubMsg,
//       countdown:  faceCountdown,
//     },

//     epiScanState: {
//       step:        epiStep,
//       captureUrl1: epiCaptureUrl1,
//       captureUrl2: epiCaptureUrl2,
//       statusMsg:   epiStatusMsg,
//       countdown:   epiCountdown,
//       result:      epiResult,
//     },

//     configState: {
//       localConfig,
//       epiConfig,
//       saving,
//       saved,
//       setLocalConfig,
//       setEpiConfig,
//       handleSave: handleSaveConfigModal,
//     },

//     permanenceState: {
//       people,
//       loading: loadingPeople,
//       fetchPeople,
//     },

//     handleStartEntry,
//     handleStartExit,
//     handleGoIdle,
//     handleTimeOverride,
//     handleRetryFromDenied,
//     handleSaveConfig,

//     handleCaptureFace,
//     handleRetryFace,
//     handleCaptureEpi,
//     handleRetryEpi,
//   };
// }



// src/hooks/useCamAutomation.ts
// Hook central da máquina de estados do fluxo de automação EPI Check
// Responsável por: estado da sessão, câmeras, configuração, todas as chamadas de API
// Os screens e components NÃO importam a API diretamente — tudo vem deste hook
// ⚠️  VERSÃO COM DEBUG ATIVO - Ver logs com 🔍 [DEBUG] no console

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// API LAYER (interno ao hook — nenhum screen/component precisa importar)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retorna a URL base da API — mesmo padrão do useAssetAvailability.
 * Usa sessionStorage['apiEndpoint'] quando disponível,
 * com fallback para a URL de produção do SmartX.
 */
const getApiBaseUrl = (): string => {
  const saved = sessionStorage.getItem('apiEndpoint');
  return saved ?? 'https://aihub.smartxhub.cloud';
};

/** Cria um axios instance apontando para o endpoint atual */
const makeHttp = () =>
  axios.create({ baseURL: getApiBaseUrl(), timeout: 30000 });

// Prefixo base do router EPI no backend FastAPI
// Montado em: /api/v1/epi  (router = APIRouter(), incluído com prefix="/api/v1/epi")
const EPI = '/api/v1/epi';

const api = {
  // Não existe endpoint /local/config no backend — retorna objeto vazio silenciosamente
  getLocalConfig: async (): Promise<Partial<SysConfig>> => {
    try {
      const { data } = await makeHttp().get(`${EPI}/local/config`);
      return data;
    } catch {
      return {}; // fallback para DEFAULT_CONFIG
    }
  },

  // GET /api/v1/epi/analytics/dashboard
  getDashboard: async (): Promise<DashboardData> => {
    const { data } = await makeHttp().get(`${EPI}/analytics/dashboard`);
    return data;
  },

  // GET /api/v1/epi/analytics/people
  getPeople: async (activeOnly = false): Promise<{ people?: WorkerRecord[] } | WorkerRecord[]> => {
    const { data } = await makeHttp().get(`${EPI}/analytics/people`, { params: { active_only: activeOnly } });
    return data;
  },

  // GET /api/v1/epi/config
  getEpiConfig: async (): Promise<EpiConfig> => {
    const { data } = await makeHttp().get(`${EPI}/config`);
    // backend retorna { config, active_classes, all_classes }
    // mapeia para o formato EpiConfig esperado pelo hook
    return {
      required_ppe:       data.config?.required_ppe ?? [],
      available_classes:  data.all_classes ? Object.values(data.all_classes) as string[] : [],
      config:             data.config,
    };
  },

  // POST /api/v1/epi/config  — body: { required_ppe: string[] }
  saveEpiConfig: async (config: { required_ppe: string[] }): Promise<void> => {
    await makeHttp().post(`${EPI}/config`, config);
  },

  // POST /api/v1/epi/validation/start  — Form data (FastAPI usa Form(...))
  startValidationSession: async (
    overrides: Record<string, unknown> = {},
  ): Promise<{ session_uuid: string; sessionUuid?: string }> => {
    const form = new FormData();
    form.append('door_id',    String(overrides.door_id  ?? 'DOOR_01'));
    form.append('direction',  String(overrides.direction ?? 'ENTRY'));
    form.append('zone_id',    String(overrides.zone_id  ?? ''));
    form.append('compliance_mode',       'majority');
    form.append('photo_count_required',  '1');   // 1 foto por captura (face ou body)
    form.append('timeout_seconds',       '30');
    const { data } = await makeHttp().post(`${EPI}/validation/start`, form);
    return data;
  },

  // POST /api/v1/epi/validation/photo  — multipart/form-data
  // ⚠️  COM LOGS DE DEBUG
  sendValidationPhoto: async (
    sessionUuid: string,
    frameBlob: Blob,
    opts: { photoType?: string; cameraId?: number } = {},
  ): Promise<PhotoResult> => {
    console.log('🔍 [API] ========================================');
    console.log('🔍 [API] sendValidationPhoto CHAMADA');
    console.log('🔍 [API] ========================================');
    console.log('🔍 [API] sessionUuid:', sessionUuid);
    console.log('🔍 [API] frameBlob:', {
      size: frameBlob.size,
      type: frameBlob.type,
    });
    console.log('🔍 [API] opts:', opts);

    const form = new FormData();
    form.append('session_uuid', sessionUuid);
    form.append('file', frameBlob, 'frame.jpg');
    if (opts.cameraId !== undefined) form.append('camera_id', String(opts.cameraId));
    if (opts.photoType) form.append('photo_type', opts.photoType);

    // Log de todos os campos do FormData
    console.log('🔍 [API] FormData fields:');
    for (const [key, value] of form.entries()) {
      if (value instanceof Blob) {
        console.log(`  ${key}: Blob(${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    const endpoint = `${EPI}/validation/photo`;
    const fullUrl = `${getApiBaseUrl()}${endpoint}`;
    console.log('🔍 [API] Full URL:', fullUrl);

    try {
      const { data } = await makeHttp().post(endpoint, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log('🔍 [API] ✅ SUCCESS');
      console.log('🔍 [API] Response data:', data);
      return data;
      
    } catch (error) {
      console.error('🔍 [API] ========================================');
      console.error('🔍 [API] ❌ REQUEST FAILED');
      console.error('🔍 [API] ========================================');
      console.error('🔍 [API] Error:', error);
      
      const axiosError = error as any;
      if (axiosError.response) {
        console.error('🔍 [API] Status:', axiosError.response.status);
        console.error('🔍 [API] Data:', axiosError.response.data);
        console.error('🔍 [API] Headers:', axiosError.response.headers);
      }
      
      throw error;
    }
  },

  // POST /api/v1/epi/validation/close  — Form data
  closeValidationSession: async (sessionUuid: string): Promise<void> => {
    const form = new FormData();
    form.append('session_uuid', sessionUuid);
    await makeHttp().post(`${EPI}/validation/close`, form);
  },

  // Endpoint de porta — não existe no backend atual, silencioso
  openDoor: async (payload: {
    personCode?: string;
    personName?: string;
    sessionUuid?: string | null;
    reason: string;
  }): Promise<void> => {
    try {
      const form = new FormData();
      if (payload.personCode)  form.append('person_code',  payload.personCode);
      if (payload.personName)  form.append('person_name',  payload.personName);
      if (payload.sessionUuid) form.append('session_uuid', payload.sessionUuid);
      form.append('reason', payload.reason);
      await makeHttp().post(`${EPI}/door/open`, form);
    } catch (e) {
      console.warn('[openDoor] endpoint não disponível:', e);
    }
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.88): Promise<Blob> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', quality));
}

export function formatMinutes(mins: number | null | undefined): string {
  if (mins == null) return '—';
  const m = Math.round(mins);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
}

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS PÚBLICOS
// ─────────────────────────────────────────────────────────────────────────────

export type Screen =
  | 'idle'
  | 'face_scan'
  | 'time_alert'
  | 'epi_scan'
  | 'access_granted'
  | 'access_denied';

export type Direction  = 'ENTRY' | 'EXIT';
export type DoorStatus = 'closed' | 'open' | 'alert' | 'waiting';
export type CamRole    = 'face' | 'body1' | 'body2';

export interface Person {
  personCode: string;
  personName: string;
  confidence: number;
}

export interface DailyExposure {
  total_minutes:  number;
  limit_minutes:  number;
  entries_today?: number;
}

export interface EpiResult {
  compliant:     boolean;
  detected?:     string[];
  detected_ppe?: string[];
  missing?:      string[];
  missing_ppe?:  string[];
}

export interface Session {
  sessionUuid:   string | null;
  person:        Person | null;
  dailyExposure: DailyExposure | null;
  epiResult:     EpiResult | null;
  missingEpi:    string[];
}

export interface SysConfig {
  companyId:         number;
  zoneId:            number;
  doorId:            string;
  dailyLimitMin:     number;
  overLimitPolicy:   'warn' | 'block';
  doorOpenMaxMin:    number;
  faceConfidenceMin: number;
  apiBase:           string;
}

export interface EpiConfig {
  required_ppe:       string[];
  available_classes?: string[];
  config?:            Record<string, unknown>;
}

export interface DashboardData {
  inside_count?:     number;
  people_inside?:    number;
  entries_today?:    number;
  today?:            { total?: number };
  open_alerts?:      number;
  alerts_open?:      number;
  over_limit_count?: number;
}

export interface WorkerRecord {
  person_code:            string;
  person_name:            string;
  department?:            string;
  is_inside?:             boolean;
  daily_accumulated_min?: number;
  total_minutes?:         number;
  total_entries?:         number;
  sessions_today?:        number;
}

export interface CamDevice {
  deviceId: string;
  label:    string;
  kind:     string;
}

export interface CameraHook {
  devices:          CamDevice[];
  assignments:      Record<CamRole, string | null>;
  streams:          Partial<Record<CamRole, MediaStream>>;
  loading:          boolean;
  error:            string | null;
  enumerateDevices: () => Promise<CamDevice[]>;
  startStream:      (role: CamRole) => Promise<MediaStream | null>;
  stopStream:       (role: CamRole) => void;
  stopAllStreams:   () => void;
  captureFrame:     (role: CamRole) => Promise<{ blob: Blob; dataUrl: string; canvas: HTMLCanvasElement }>;
  assignDevice:     (role: CamRole, deviceId: string | null) => void;
  setVideoRef:      (role: CamRole, element: HTMLVideoElement | null) => void;
  hasStream:        (role: CamRole) => boolean;
  getAssignment:    (role: CamRole) => string | null;
}

// ─── Tipos internos da API ────────────────────────────────────────────────────

interface PhotoResult {
  // Retorno do /validation/photo (backend real)
  session_uuid?:          string;
  photo_seq?:             number;
  photo_count_received?:  number;
  photo_count_required?:  number;
  session_complete?:      boolean;

  // Face
  face_detected?:         boolean;
  face_recognized?:       boolean;   // alias legado
  face_confidence?:       number;
  face_person_code?:      string;
  person_code?:           string;    // alias legado
  person_name?:           string;
  confidence?:            number;    // alias legado

  // EPI
  epi_compliant?:         boolean;
  compliant?:             boolean;   // alias legado
  compliance_score?:      number;
  missing?:               string[];
  missing_ppe?:           string[];
  detected?:              string[];
  detected_ppe?:          string[];

  // Sessão finalizada
  final_decision?: {
    access_decision:       string;
    epi_compliant:         boolean;
    face_confirmed:        boolean;
    face_confidence_max?:  number;
    person_code?:          string;
    person_name?:          string;
  } | null;

  daily_exposure?: DailyExposure;
}

// ─── Estados por screen/modal (expostos como props prontas) ───────────────────

export type FaceScanStep = 'ready' | 'capturing' | 'processing' | 'done' | 'error';

export interface FaceScanState {
  step:       FaceScanStep;
  captureUrl: string | null;
  progress:   number;
  statusMsg:  string;
  subMsg:     string;
  countdown:  number | null;
}

export type EpiScanStep = 'ready' | 'capturing' | 'processing' | 'done' | 'error';

export interface EpiScanState {
  step:        EpiScanStep;
  captureUrl1: string | null;
  captureUrl2: string | null;
  statusMsg:   string;
  countdown:   number | null;
  result:      EpiResult | null;
}

export interface IdleState {
  dashboard:        DashboardData | null;
  loadingDash:      boolean;
  refreshDashboard: () => void;
}

export interface ConfigState {
  localConfig:    SysConfig;
  epiConfig:      EpiConfig | null;
  saving:         boolean;
  saved:          boolean;
  setLocalConfig: (cfg: SysConfig) => void;
  setEpiConfig:   (cfg: EpiConfig | null) => void;
  handleSave:     () => Promise<void>;
}

export interface PermanenceState {
  people:      WorkerRecord[];
  loading:     boolean;
  fetchPeople: () => Promise<void>;
}

// ─── Return do hook ───────────────────────────────────────────────────────────

export interface UseCamAutomationReturn {
  // Máquina de estados
  screen:     Screen;
  direction:  Direction;
  doorStatus: DoorStatus;
  session:    Session;
  sysConfig:  SysConfig;

  // Modais
  showReport:    boolean;
  showConfig:    boolean;
  setShowReport: (v: boolean) => void;
  setShowConfig: (v: boolean) => void;

  // Câmeras
  cameraHook: CameraHook;

  // Estados prontos para cada screen/modal
  idleState:       IdleState;
  faceScanState:   FaceScanState;
  epiScanState:    EpiScanState;
  configState:     ConfigState;
  permanenceState: PermanenceState;

  // Navegação
  handleStartEntry:      () => void;
  handleStartExit:       () => void;
  handleGoIdle:          () => void;
  handleTimeOverride:    () => void;
  handleRetryFromDenied: () => void;
  handleSaveConfig:      (newConfig: Partial<SysConfig>) => void;

  // Ações (chamam API internamente)
  handleCaptureFace: () => Promise<void>;
  handleRetryFace:   () => void;
  handleCaptureEpi:  () => Promise<void>;
  handleRetryEpi:    () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const LS_KEYS: Record<CamRole, string> = {
  face:  'epi_cam_face',
  body1: 'epi_cam_body1',
  body2: 'epi_cam_body2',
};

const EMPTY_SESSION: Session = {
  sessionUuid:   null,
  person:        null,
  dailyExposure: null,
  epiResult:     null,
  missingEpi:    [],
};

const DEFAULT_CONFIG: SysConfig = {
  companyId:         1,
  zoneId:            10,
  doorId:            'DOOR_CAMARA_FRIA_01',
  dailyLimitMin:     120,
  overLimitPolicy:   'warn',
  doorOpenMaxMin:    15,
  faceConfidenceMin: 70,
  apiBase:           'https://aihub.smartxhub.cloud',
};

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

const epiLabel = (k: string) => EPI_LABELS_PT[k] ?? k;

// ─────────────────────────────────────────────────────────────────────────────
// HOOK DE CÂMERAS (interno)
// ─────────────────────────────────────────────────────────────────────────────

function useCameraInternal(): CameraHook {
  const [devices,     setDevices]     = useState<CamDevice[]>([]);
  const [assignments, setAssignments] = useState<Record<CamRole, string | null>>({
    face:  localStorage.getItem(LS_KEYS.face)  || null,
    body1: localStorage.getItem(LS_KEYS.body1) || null,
    body2: localStorage.getItem(LS_KEYS.body2) || null,
  });
  const [streams, setStreams] = useState<Partial<Record<CamRole, MediaStream>>>({});
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const videoRefs = useRef<Partial<Record<CamRole, HTMLVideoElement | null>>>({});

  const enumerateDevices = useCallback(async (): Promise<CamDevice[]> => {
    try {
      await navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((s) => s.getTracks().forEach((t) => t.stop()))
        .catch(() => {});
      const all  = await navigator.mediaDevices.enumerateDevices();
      const vids = all.filter((d) => d.kind === 'videoinput') as CamDevice[];
      setDevices(vids);
      setAssignments((prev) => {
        const next = { ...prev };
        if (!next.face  && vids[0]) next.face  = vids[0].deviceId;
        if (!next.body1 && vids[1]) next.body1 = vids[1].deviceId;
        if (!next.body2 && vids[2]) next.body2 = vids[2].deviceId;
        return next;
      });
      return vids;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return [];
    }
  }, []);

  const startStream = useCallback(async (role: CamRole): Promise<MediaStream | null> => {
    const deviceId = assignments[role];
    if (!deviceId) return null;
    streams[role]?.getTracks().forEach((t) => t.stop());
    try {
      setLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
        audio: false,
      });
      setStreams((prev) => ({ ...prev, [role]: stream }));
      const ref = videoRefs.current[role];
      if (ref) ref.srcObject = stream;
      return stream;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, [assignments, streams]);

  const stopStream = useCallback((role: CamRole) => {
    streams[role]?.getTracks().forEach((t) => t.stop());
    setStreams((prev) => { const n = { ...prev }; delete n[role]; return n; });
    const ref = videoRefs.current[role];
    if (ref) ref.srcObject = null;
  }, [streams]);

  const stopAllStreams = useCallback(() => {
    Object.values(streams).forEach((s) => s?.getTracks().forEach((t) => t.stop()));
    setStreams({});
    Object.values(videoRefs.current).forEach((v) => { if (v) v.srcObject = null; });
  }, [streams]);

  const captureFrame = useCallback(async (role: CamRole) => {
    const video = videoRefs.current[role];
    if (!video || video.readyState < 2) throw new Error(`Câmera "${role}" não está pronta.`);
    const canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth  || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob    = await canvasToBlob(canvas, 0.88);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    return { blob, dataUrl, canvas };
  }, []);

  const assignDevice = useCallback((role: CamRole, deviceId: string | null) => {
    setAssignments((prev) => ({ ...prev, [role]: deviceId }));
    localStorage.setItem(LS_KEYS[role], deviceId || '');
  }, []);

  const setVideoRef = useCallback((role: CamRole, element: HTMLVideoElement | null) => {
    videoRefs.current[role] = element;
    if (element && streams[role]) element.srcObject = streams[role]!;
  }, [streams]);

  useEffect(() => {
    enumerateDevices();
    const handler = () => enumerateDevices();
    navigator.mediaDevices.addEventListener('devicechange', handler);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handler);
      stopAllStreams();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    devices, assignments, streams, loading, error,
    enumerateDevices, startStream, stopStream, stopAllStreams,
    captureFrame, assignDevice, setVideoRef,
    hasStream:     (role) => !!streams[role],
    getAssignment: (role) => assignments[role],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export function useCamAutomation(): UseCamAutomationReturn {

  // ── Máquina de estados ────────────────────────────────────────────────────
  const [screen,     setScreen]     = useState<Screen>('idle');
  const [direction,  setDirection]  = useState<Direction>('ENTRY');
  const [doorStatus, setDoorStatus] = useState<DoorStatus>('closed');
  const [session,    setSession]    = useState<Session>(EMPTY_SESSION);
  const [sysConfig,  setSysConfig]  = useState<SysConfig>(DEFAULT_CONFIG);
  const [showReport, setShowReport] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // ── Câmeras ───────────────────────────────────────────────────────────────
  const cameraHook = useCameraInternal();

  // ── Idle state ────────────────────────────────────────────────────────────
  const [dashboard,   setDashboard]   = useState<DashboardData | null>(null);
  const [loadingDash, setLoadingDash] = useState(true);

  // ── FaceScan state ────────────────────────────────────────────────────────
  const [faceStep,       setFaceStep]       = useState<FaceScanStep>('ready');
  const [faceCaptureUrl, setFaceCaptureUrl] = useState<string | null>(null);
  const [faceProgress,   setFaceProgress]   = useState(0);
  const [faceStatusMsg,  setFaceStatusMsg]  = useState('Posicione seu rosto na câmera e toque em Capturar');
  const [faceSubMsg,     setFaceSubMsg]     = useState('');
  const [faceCountdown,  setFaceCountdown]  = useState<number | null>(null);
  const faceAutoCapture = useRef(false);

  // ── EpiScan state ─────────────────────────────────────────────────────────
  const [epiStep,        setEpiStep]        = useState<EpiScanStep>('ready');
  const [epiCaptureUrl1, setEpiCaptureUrl1] = useState<string | null>(null);
  const [epiCaptureUrl2, setEpiCaptureUrl2] = useState<string | null>(null);
  const [epiStatusMsg,   setEpiStatusMsg]   = useState('Posicione-se em frente às câmeras de corpo');
  const [epiCountdown,   setEpiCountdown]   = useState<number | null>(null);
  const [epiResult,      setEpiResult]      = useState<EpiResult | null>(null);
  const epiAutoCapture = useRef(false);

  // ── Config modal state ────────────────────────────────────────────────────
  const [localConfig, setLocalConfig] = useState<SysConfig>(DEFAULT_CONFIG);
  const [epiConfig,   setEpiConfig]   = useState<EpiConfig | null>(null);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);

  // ── Permanence modal state ────────────────────────────────────────────────
  const [people,        setPeople]        = useState<WorkerRecord[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(false);

  // ─── Helpers de reset ─────────────────────────────────────────────────────

  const resetSession = useCallback(() => setSession(EMPTY_SESSION), []);

  const resetFaceScan = useCallback((withAutoCapture = false) => {
    faceAutoCapture.current = withAutoCapture;
    setFaceStep('ready');
    setFaceCaptureUrl(null);
    setFaceProgress(0);
    setFaceStatusMsg('Posicione seu rosto na câmera e toque em Capturar');
    setFaceSubMsg('');
    setFaceCountdown(null);
  }, []);

  const resetEpiScan = useCallback((withAutoCapture = false) => {
    epiAutoCapture.current = withAutoCapture;
    setEpiStep('ready');
    setEpiCaptureUrl1(null);
    setEpiCaptureUrl2(null);
    setEpiStatusMsg('Posicione-se em frente às câmeras de corpo');
    setEpiCountdown(null);
    setEpiResult(null);
  }, []);

  // ─── Carrega config do backend ────────────────────────────────────────────

  useEffect(() => {
    api.getLocalConfig()
      .then((cfg) => {
        setSysConfig((prev) => ({ ...prev, ...cfg }));
        setLocalConfig((prev) => ({ ...prev, ...cfg }));
      })
      .catch((e: Error) => console.warn('[useCamAutomation] Config load failed:', e.message));
  }, []);

  // ─── Dashboard polling (apenas na tela idle) ──────────────────────────────

  const refreshDashboard = useCallback(async () => {
    try {
      const data = await api.getDashboard();
      setDashboard(data);
    } catch (e) {
      console.warn('[useCamAutomation] Dashboard failed:', e);
    } finally {
      setLoadingDash(false);
    }
  }, []);

  useEffect(() => {
    if (screen !== 'idle') return;
    refreshDashboard();
    const t = setInterval(refreshDashboard, 30000);
    return () => clearInterval(t);
  }, [screen, refreshDashboard]);

  // ─── EpiConfig ao abrir modal de config ──────────────────────────────────

  useEffect(() => {
    if (!showConfig) return;
    setLocalConfig({ ...sysConfig });
    api.getEpiConfig().then(setEpiConfig).catch(console.warn);
  }, [showConfig, sysConfig]);

  // ─── People ao abrir modal de permanência ─────────────────────────────────

  const fetchPeople = useCallback(async () => {
    try {
      setLoadingPeople(true);
      const data = await api.getPeople(false);
      const list = (data as { people?: WorkerRecord[] }).people ?? (data as WorkerRecord[]) ?? [];
      setPeople(list);
    } catch (e) {
      console.error('[useCamAutomation] fetchPeople failed:', e);
    } finally {
      setLoadingPeople(false);
    }
  }, []);

  useEffect(() => {
    if (showReport) fetchPeople();
  }, [showReport, fetchPeople]);

  // ─── Auto-capture: face ───────────────────────────────────────────────────

  useEffect(() => {
    if (screen !== 'face_scan' || !faceAutoCapture.current || faceStep !== 'ready') return;
    let n = 3;
    setFaceCountdown(n);
    const t = setInterval(() => {
      n -= 1;
      if (n <= 0) { clearInterval(t); setFaceCountdown(null); handleCaptureFace(); }
      else setFaceCountdown(n);
    }, 1000);
    return () => { clearInterval(t); setFaceCountdown(null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, faceStep]);

  // ─── Auto-capture: EPI ───────────────────────────────────────────────────

  useEffect(() => {
    if (screen !== 'epi_scan' || !epiAutoCapture.current || epiStep !== 'ready') return;
    let n = 4;
    setEpiCountdown(n);
    const t = setInterval(() => {
      n -= 1;
      if (n <= 0) { clearInterval(t); setEpiCountdown(null); handleCaptureEpi(); }
      else setEpiCountdown(n);
    }, 1000);
    return () => { clearInterval(t); setEpiCountdown(null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, epiStep]);

  // ─── Navegação ────────────────────────────────────────────────────────────

  const handleStartEntry = useCallback(() => {
    setDirection('ENTRY');
    resetSession();
    resetFaceScan(true);
    cameraHook.startStream('face');
    setScreen('face_scan');
  }, [resetSession, resetFaceScan, cameraHook]);

  const handleStartExit = useCallback(() => {
    setDirection('EXIT');
    resetSession();
    resetFaceScan(true);
    cameraHook.startStream('face');
    setScreen('face_scan');
  }, [resetSession, resetFaceScan, cameraHook]);

  const handleGoIdle = useCallback(() => {
    cameraHook.stopAllStreams();
    resetSession();
    resetFaceScan(false);
    resetEpiScan(false);
    setDoorStatus('closed');
    setScreen('idle');
  }, [cameraHook, resetSession, resetFaceScan, resetEpiScan]);

  const handleTimeOverride = useCallback(() => {
    resetEpiScan(true);
    cameraHook.startStream('body1');
    if (cameraHook.getAssignment('body2')) cameraHook.startStream('body2');
    setScreen('epi_scan');
  }, [cameraHook, resetEpiScan]);

  const handleRetryFromDenied = useCallback(() => {
    setSession((prev) => ({ ...prev, epiResult: null, missingEpi: [] }));
    resetEpiScan(false);
    setScreen('epi_scan');
  }, [resetEpiScan]);

  const handleSaveConfig = useCallback((newConfig: Partial<SysConfig>) => {
    setSysConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  // ─── ACTION: Captura facial ───────────────────────────────────────────────

  const handleCaptureFace = useCallback(async () => {
    if (faceStep !== 'ready') return;
    faceAutoCapture.current = false;

    try {
      setFaceStep('capturing');
      setFaceStatusMsg('Capturando frame…');

      const { blob, dataUrl } = await cameraHook.captureFrame('face');
      setFaceCaptureUrl(dataUrl);

      setFaceStep('processing');
      setFaceStatusMsg('Iniciando sessão de validação…');
      setFaceProgress(20);

      const sessionData = await api.startValidationSession({
        direction,
        door_id: sysConfig.doorId,
        zone_id: sysConfig.zoneId,
      });
      const uuid = sessionData.session_uuid || sessionData.sessionUuid!;
      setFaceProgress(40);

      setFaceStatusMsg('Reconhecendo rosto…');
      const photo = await api.sendValidationPhoto(uuid, blob, { photoType: 'face', cameraId: 1 });
      setFaceProgress(80);

      if (photo.face_detected || photo.face_recognized || photo.face_person_code || photo.person_code) {
        setFaceProgress(100);
        setFaceStep('done');

        const resolvedCode = photo.face_person_code || photo.person_code || '';
        const resolvedName = photo.person_name || resolvedCode;
        const resolvedConf = photo.face_confidence || photo.confidence || 0;

        setFaceStatusMsg(`Identificado: ${resolvedName}`);
        setFaceSubMsg(`Confiança: ${Math.round(resolvedConf * 100)}%`);

        const person: Person = {
          personCode: resolvedCode,
          personName: resolvedName,
          confidence: resolvedConf,
        };
        setSession((prev) => ({ ...prev, sessionUuid: uuid, person, dailyExposure: photo.daily_exposure ?? null }));

        setTimeout(() => {
          if (direction === 'EXIT') { setScreen('idle'); return; }

          const totalMin = photo.daily_exposure?.total_minutes ?? 0;
          const limitMin = photo.daily_exposure?.limit_minutes ?? sysConfig.dailyLimitMin;

          if (totalMin >= limitMin) {
            setScreen('time_alert');
          } else {
            resetEpiScan(true);
            cameraHook.startStream('body1');
            if (cameraHook.getAssignment('body2')) cameraHook.startStream('body2');
            setScreen('epi_scan');
          }
        }, 900);

      } else {
        setFaceStep('error');
        setFaceStatusMsg('Rosto não reconhecido');
        setFaceSubMsg('Tente novamente ou solicite acesso manual');
        setFaceProgress(0);
      }
    } catch (e) {
      const err = e as { response?: { data?: { detail?: string } }; message?: string };
      setFaceStep('error');
      setFaceStatusMsg('Erro ao processar');
      setFaceSubMsg(err.response?.data?.detail || err.message || '');
      setFaceProgress(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faceStep, cameraHook, direction, sysConfig, resetEpiScan]);

  const handleRetryFace = useCallback(() => resetFaceScan(false), [resetFaceScan]);

  // ─── ACTION: Captura EPI ──────────────────────────────────────────────────
  // ⚠️  COM LOGS DE DEBUG

  const handleCaptureEpi = useCallback(async () => {
    if (epiStep !== 'ready') {
      console.log('🔍 [DEBUG] handleCaptureEpi abortado - epiStep:', epiStep);
      return;
    }
    epiAutoCapture.current = false;

    const hasBody2 = !!cameraHook.getAssignment('body2');

    // ===== LOGS DE DEBUG DETALHADOS =====
    console.log('🔍 [DEBUG] ========================================');
    console.log('🔍 [DEBUG] INICIANDO CAPTURA EPI');
    console.log('🔍 [DEBUG] ========================================');
    console.log('🔍 [DEBUG] Person:', session.person);
    console.log('🔍 [DEBUG] Previous Session UUID (facial):', session.sessionUuid);
    console.log('🔍 [DEBUG] SysConfig:', {
      companyId: sysConfig.companyId,
      zoneId: sysConfig.zoneId,
      doorId: sysConfig.doorId,
      apiBase: sysConfig.apiBase,
    });
    console.log('🔍 [DEBUG] Has Body2:', hasBody2);
    console.log('🔍 [DEBUG] ========================================');

    try {
      setEpiStep('capturing');
      setEpiStatusMsg('Capturando frames…');

      // Captura body1
      console.log('🔍 [DEBUG] Capturando body1...');
      const { blob: blob1, dataUrl: url1 } = await cameraHook.captureFrame('body1');
      setEpiCaptureUrl1(url1);
      
      console.log('🔍 [DEBUG] ✅ Body1 capturado:', {
        size: blob1.size,
        type: blob1.type,
      });

      // Captura body2 (opcional)
      let blob2: Blob | null = null;
      if (hasBody2) {
        try {
          console.log('🔍 [DEBUG] Capturando body2...');
          const f2 = await cameraHook.captureFrame('body2');
          setEpiCaptureUrl2(f2.dataUrl);
          blob2 = f2.blob;
          console.log('🔍 [DEBUG] ✅ Body2 capturado:', {
            size: f2.blob.size,
            type: f2.blob.type,
          });
        } catch (e2) {
          console.warn('🔍 [DEBUG] ⚠️  Body2 capture failed:', (e2 as Error).message);
        }
      }

      setEpiStep('processing');
      setEpiStatusMsg('Detectando EPIs… aguarde');

      // ===== ✅ CRIAR NOVA SESSÃO PARA EPI =====
      console.log('🔍 [DEBUG] ========================================');
      console.log('🔍 [DEBUG] CRIANDO NOVA SESSÃO PARA VALIDAÇÃO EPI');
      console.log('🔍 [DEBUG] ========================================');

      const epiSessionData = await api.startValidationSession({
        direction,
        door_id: sysConfig.doorId,
        zone_id: sysConfig.zoneId,
      });
      const epiSessionUuid = epiSessionData.session_uuid || epiSessionData.sessionUuid!;
      
      console.log('🔍 [DEBUG] ✅ Nova sessão EPI criada:', epiSessionUuid);

      // ===== ENVIO PARA API - BODY1 =====
      console.log('🔍 [DEBUG] ========================================');
      console.log('🔍 [DEBUG] ENVIANDO BODY1 PARA API');
      console.log('🔍 [DEBUG] ========================================');
      console.log('🔍 [DEBUG] Endpoint:', `${sysConfig.apiBase}/api/v1/epi/validation/photo`);
      console.log('🔍 [DEBUG] Params enviados:', {
        session_uuid: epiSessionUuid,
        photoType: 'body',
        cameraId: 2,
        blobSize: blob1.size,
        blobType: blob1.type,
      });

      try {
        const photo1 = await api.sendValidationPhoto(epiSessionUuid, blob1, { photoType: 'body', cameraId: 2 });
        console.log('🔍 [DEBUG] ✅ Body1 API response:', photo1);
        
        let finalResult: EpiResult = { ...photo1, compliant: photo1.compliant ?? false };

        // ===== ENVIO PARA API - BODY2 (se existir) =====
        if (blob2) {
          console.log('🔍 [DEBUG] ========================================');
          console.log('🔍 [DEBUG] ENVIANDO BODY2 PARA API');
          console.log('🔍 [DEBUG] ========================================');
          try {
            const photo2 = await api.sendValidationPhoto(epiSessionUuid, blob2, { photoType: 'body', cameraId: 3 });
            console.log('🔍 [DEBUG] ✅ Body2 API response:', photo2);
            if (!photo2.compliant) finalResult = { ...photo2, compliant: photo2.compliant ?? false };
          } catch (e3) {
            console.error('🔍 [DEBUG] ❌ Body2 API error:', e3);
            console.warn('[useCamAutomation] Body2 send failed:', (e3 as Error).message);
          }
        }

        // ===== FECHAR SESSÃO =====
        console.log('🔍 [DEBUG] Fechando sessão...');
        try { 
          await api.closeValidationSession(epiSessionUuid);
          console.log('🔍 [DEBUG] ✅ Sessão fechada');
        } catch (_) { 
          console.log('🔍 [DEBUG] ⚠️  Erro ao fechar sessão (ignorado)');
        }

        // ===== PROCESSAR RESULTADO =====
        console.log('🔍 [DEBUG] ========================================');
        console.log('🔍 [DEBUG] RESULTADO FINAL');
        console.log('🔍 [DEBUG] ========================================');
        console.log('🔍 [DEBUG] finalResult:', finalResult);

        setEpiResult(finalResult);
        setEpiStep('done');
        setSession((prev) => ({ ...prev, epiResult: finalResult }));

        if (finalResult.compliant) {
          setEpiStatusMsg('✅ EPI Completo — Acesso liberado');
          console.log('🔍 [DEBUG] ✅ EPI COMPLETO - Abrindo porta');
          try {
            await api.openDoor({
              personCode:  session.person?.personCode,
              personName:  session.person?.personName,
              sessionUuid: epiSessionUuid,
              reason:      'EPI_COMPLIANT',
            });
            setDoorStatus('open');
            console.log('🔍 [DEBUG] ✅ Porta aberta');
          } catch (e) {
            console.error('🔍 [DEBUG] ❌ Erro ao abrir porta:', e);
          }
          setTimeout(() => setScreen('access_granted'), 1200);
        } else {
          setEpiStatusMsg('❌ EPI Incompleto — Acesso negado');
          console.log('🔍 [DEBUG] ❌ EPI INCOMPLETO');
          const missing = (finalResult.missing || finalResult.missing_ppe || []).map(epiLabel);
          console.log('🔍 [DEBUG] EPIs faltando:', missing);
          setSession((prev) => ({ ...prev, missingEpi: missing }));
          setDoorStatus('closed');
          setTimeout(() => setScreen('access_denied'), 1200);
        }

      } catch (apiError) {
        // ===== CAPTURAR ERRO 400 DETALHADO =====
        console.error('🔍 [DEBUG] ========================================');
        console.error('🔍 [DEBUG] ❌ ERRO 400 NA API');
        console.error('🔍 [DEBUG] ========================================');
        console.error('🔍 [DEBUG] Error object:', apiError);
        
        const axiosError = apiError as any;
        
        if (axiosError.response) {
          console.error('🔍 [DEBUG] Response status:', axiosError.response.status);
          console.error('🔍 [DEBUG] Response data:', axiosError.response.data);
          console.error('🔍 [DEBUG] Response headers:', axiosError.response.headers);
        }
        
        if (axiosError.config) {
          console.error('🔍 [DEBUG] Request URL:', axiosError.config.url);
          console.error('🔍 [DEBUG] Request method:', axiosError.config.method);
          console.error('🔍 [DEBUG] Request headers:', axiosError.config.headers);
        }
        
        if (axiosError.request) {
          console.error('🔍 [DEBUG] Request object:', axiosError.request);
        }
        
        throw apiError; // Re-throw para cair no catch externo
      }

    } catch (e) {
      console.error('🔍 [DEBUG] ========================================');
      console.error('🔍 [DEBUG] ❌ ERRO GERAL NO FLUXO EPI');
      console.error('🔍 [DEBUG] ========================================');
      console.error('[useCamAutomation] EPI capture failed:', e);
      
      setEpiStep('error');
      setEpiStatusMsg('Erro na detecção de EPI');
      
      const errorMsg = (e as any)?.response?.data?.detail 
        || (e as Error)?.message 
        || 'Erro desconhecido';
      
      console.error('🔍 [DEBUG] Error message:', errorMsg);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epiStep, session, cameraHook, direction, sysConfig]);

  const handleRetryEpi = useCallback(() => resetEpiScan(false), [resetEpiScan]);

  // ─── ACTION: Salva config (modal) ─────────────────────────────────────────

  const handleSaveConfigModal = useCallback(async () => {
    try {
      setSaving(true);
      handleSaveConfig(localConfig);
      if (epiConfig?.required_ppe) {
        await api.saveEpiConfig({ required_ppe: epiConfig.required_ppe });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('[useCamAutomation] saveConfig failed:', e);
    } finally {
      setSaving(false);
    }
  }, [localConfig, epiConfig, handleSaveConfig]);

  // ─── Return ───────────────────────────────────────────────────────────────

  return {
    screen,
    direction,
    doorStatus,
    session,
    sysConfig,
    showReport,
    showConfig,
    setShowReport,
    setShowConfig,
    cameraHook,

    idleState: {
      dashboard,
      loadingDash,
      refreshDashboard,
    },

    faceScanState: {
      step:       faceStep,
      captureUrl: faceCaptureUrl,
      progress:   faceProgress,
      statusMsg:  faceStatusMsg,
      subMsg:     faceSubMsg,
      countdown:  faceCountdown,
    },

    epiScanState: {
      step:        epiStep,
      captureUrl1: epiCaptureUrl1,
      captureUrl2: epiCaptureUrl2,
      statusMsg:   epiStatusMsg,
      countdown:   epiCountdown,
      result:      epiResult,
    },

    configState: {
      localConfig,
      epiConfig,
      saving,
      saved,
      setLocalConfig,
      setEpiConfig,
      handleSave: handleSaveConfigModal,
    },

    permanenceState: {
      people,
      loading: loadingPeople,
      fetchPeople,
    },

    handleStartEntry,
    handleStartExit,
    handleGoIdle,
    handleTimeOverride,
    handleRetryFromDenied,
    handleSaveConfig,

    handleCaptureFace,
    handleRetryFace,
    handleCaptureEpi,
    handleRetryEpi,
  };
}