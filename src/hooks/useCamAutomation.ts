// // src/hooks/useCamAutomation.ts
// // Hook central da máquina de estados do fluxo de automação EPI Check
// // Responsável por: estado da sessão, câmeras, configuração, todas as chamadas de API
// // Os screens e components NÃO importam a API diretamente — tudo vem deste hook

// import { useState, useEffect, useCallback, useRef } from 'react';
// import axios from 'axios';

// // ─────────────────────────────────────────────────────────────────────────────
// // API LAYER (interno ao hook — nenhum screen/component precisa importar)
// // ─────────────────────────────────────────────────────────────────────────────

// const getApiBaseUrl = (): string => {
//   const saved = sessionStorage.getItem('apiEndpoint');
//   return saved ?? 'https://aihub.smartxhub.cloud';
// };

// const makeHttp = () =>
//   axios.create({ baseURL: getApiBaseUrl(), timeout: 30000 });

// const EPI = '/api/v1/epi';

// const api = {
//   getLocalConfig: async (): Promise<Partial<SysConfig>> => {
//     try {
//       const { data } = await makeHttp().get(`${EPI}/local/config`);
//       return data;
//     } catch {
//       return {};
//     }
//   },

//   getDashboard: async (): Promise<DashboardData> => {
//     const { data } = await makeHttp().get(`${EPI}/analytics/dashboard`);
//     return data;
//   },

//   getPeople: async (activeOnly = false): Promise<{ people?: WorkerRecord[] } | WorkerRecord[]> => {
//     const { data } = await makeHttp().get(`${EPI}/analytics/people`, { params: { active_only: activeOnly } });
//     return data;
//   },

//   getEpiConfig: async (): Promise<EpiConfig> => {
//     const { data } = await makeHttp().get(`${EPI}/config`);
//     return {
//       required_ppe:       data.config?.required_ppe ?? [],
//       available_classes:  data.all_classes ? Object.values(data.all_classes) as string[] : [],
//       config:             data.config,
//     };
//   },

//   saveEpiConfig: async (config: { required_ppe: string[] }): Promise<void> => {
//     await makeHttp().post(`${EPI}/config`, config);
//   },

//   startValidationSession: async (
//     overrides: Record<string, unknown> = {},
//   ): Promise<{ session_uuid: string; sessionUuid?: string }> => {
//     const form = new FormData();
//     form.append('door_id',    String(overrides.door_id  ?? 'DOOR_01'));
//     form.append('direction',  String(overrides.direction ?? 'ENTRY'));
//     form.append('zone_id',    String(overrides.zone_id  ?? ''));
//     form.append('compliance_mode',       'majority');
//     form.append('photo_count_required',  '1');
//     form.append('timeout_seconds',       '30');
//     const { data } = await makeHttp().post(`${EPI}/validation/start`, form);
//     return data;
//   },

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

//     const endpoint = `${EPI}/validation/photo`;
//     const { data } = await makeHttp().post(endpoint, form, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//     return data;
//   },

//   closeValidationSession: async (sessionUuid: string): Promise<void> => {
//     const form = new FormData();
//     form.append('session_uuid', sessionUuid);
//     await makeHttp().post(`${EPI}/validation/close`, form);
//   },

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

// export type CameraSourceType = 'local' | 'ip_url';

// export interface CameraSource {
//   type: CameraSourceType;
//   deviceId?: string;
//   url?: string;
// }

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
//   // ✅ Motivo do bloqueio para a tela access_denied
//   deniedReason?: 'user_not_found' | 'epi_incomplete' | null;
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
//   useSingleCamera:   boolean;
//   cameraSourceType:  Record<CamRole, CameraSourceType>;
//   cameraIpUrl:       Record<CamRole, string | null>;
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
//   sourceTypes:   Record<CamRole, CameraSourceType>;
//   ipUrls:        Record<CamRole, string | null>;
//   setSourceType: (role: CamRole, type: CameraSourceType) => void;
//   setIpUrl:      (role: CamRole, url: string | null) => void;
// }

// // ─── Tipos internos da API ────────────────────────────────────────────────────

// interface PhotoResult {
//   session_uuid?:          string;
//   photo_seq?:             number;
//   photo_count_received?:  number;
//   photo_count_required?:  number;
//   session_complete?:      boolean;
//   face_detected?:         boolean;
//   face_recognized?:       boolean;
//   face_confidence?:       number;
//   face_person_code?:      string;
//   person_code?:           string;
//   person_name?:           string;
//   confidence?:            number;
//   epi_compliant?:         boolean;
//   compliant?:             boolean;
//   compliance_score?:      number;
//   missing?:               string[];
//   missing_ppe?:           string[];
//   detected?:              string[];
//   detected_ppe?:          string[];
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

// // ─── Estados por screen/modal ─────────────────────────────────────────────────

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

// export interface UseCamAutomationReturn {
//   screen:     Screen;
//   direction:  Direction;
//   doorStatus: DoorStatus;
//   session:    Session;
//   sysConfig:  SysConfig;
//   showReport:    boolean;
//   showConfig:    boolean;
//   setShowReport: (v: boolean) => void;
//   setShowConfig: (v: boolean) => void;
//   cameraHook: CameraHook;
//   idleState:       IdleState;
//   faceScanState:   FaceScanState;
//   epiScanState:    EpiScanState;
//   configState:     ConfigState;
//   permanenceState: PermanenceState;
//   handleStartEntry:      () => void;
//   handleStartExit:       () => void;
//   handleGoIdle:          () => void;
//   handleTimeOverride:    () => void;
//   handleRetryFromDenied: () => void;
//   handleSaveConfig:      (newConfig: Partial<SysConfig>) => void;
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

// const LS_KEYS_TYPE: Record<CamRole, string> = {
//   face:  'epi_cam_face_type',
//   body1: 'epi_cam_body1_type',
//   body2: 'epi_cam_body2_type',
// };

// const LS_KEYS_URL: Record<CamRole, string> = {
//   face:  'epi_cam_face_url',
//   body1: 'epi_cam_body1_url',
//   body2: 'epi_cam_body2_url',
// };

// const EMPTY_SESSION: Session = {
//   sessionUuid:   null,
//   person:        null,
//   dailyExposure: null,
//   epiResult:     null,
//   missingEpi:    [],
//   deniedReason:  null,
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
//   useSingleCamera:   false,
//   cameraSourceType: {
//     face:  'local',
//     body1: 'local',
//     body2: 'local',
//   },
//   cameraIpUrl: {
//     face:  null,
//     body1: null,
//     body2: null,
//   },
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
// // HELPER: CAPTURA DE FRAME DE CÂMERA IP VIA URL
// // ─────────────────────────────────────────────────────────────────────────────

// async function captureFrameFromUrl(url: string): Promise<Blob> {
//   let finalUrl = url;
//   let authHeader: string | undefined;

//   try {
//     const urlObj = new URL(url);
//     if (urlObj.username || urlObj.password) {
//       const username = decodeURIComponent(urlObj.username);
//       const password = decodeURIComponent(urlObj.password);
//       authHeader = 'Basic ' + btoa(`${username}:${password}`);
//       urlObj.username = '';
//       urlObj.password = '';
//       finalUrl = urlObj.toString();
//     }
//   } catch (e) {
//     console.warn('[CAM] Erro ao parsear URL, usando como está:', e);
//   }

//   const response = await fetch(finalUrl, {
//     method: 'GET',
//     mode: 'cors',
//     headers: authHeader ? { 'Authorization': authHeader } : undefined,
//   });

//   if (!response.ok) {
//     throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//   }

//   return response.blob();
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HOOK DE CÂMERAS (interno)
// // ─────────────────────────────────────────────────────────────────────────────
// //@ts-ignore
// function useCameraInternal(sysConfig: SysConfig): CameraHook {
//   const [devices,     setDevices]     = useState<CamDevice[]>([]);
//   const [assignments, setAssignments] = useState<Record<CamRole, string | null>>({
//     face:  localStorage.getItem(LS_KEYS.face)  || null,
//     body1: localStorage.getItem(LS_KEYS.body1) || null,
//     body2: localStorage.getItem(LS_KEYS.body2) || null,
//   });

//   const [sourceTypes, setSourceTypes] = useState<Record<CamRole, CameraSourceType>>({
//     face:  (localStorage.getItem(LS_KEYS_TYPE.face)  as CameraSourceType) || 'local',
//     body1: (localStorage.getItem(LS_KEYS_TYPE.body1) as CameraSourceType) || 'local',
//     body2: (localStorage.getItem(LS_KEYS_TYPE.body2) as CameraSourceType) || 'local',
//   });

//   const [ipUrls, setIpUrls] = useState<Record<CamRole, string | null>>({
//     face:  localStorage.getItem(LS_KEYS_URL.face)  || null,
//     body1: localStorage.getItem(LS_KEYS_URL.body1) || null,
//     body2: localStorage.getItem(LS_KEYS_URL.body2) || null,
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
//     const sourceType = sourceTypes[role];
//     if (sourceType === 'ip_url') return null;

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
//   }, [assignments, sourceTypes, streams]);

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
//     const sourceType = sourceTypes[role];

//     if (sourceType === 'ip_url') {
//       const url = ipUrls[role];
//       if (!url) throw new Error(`URL não configurada para câmera ${role}`);
//       const blob = await captureFrameFromUrl(url);
//       const dataUrl = URL.createObjectURL(blob);
//       const canvas = document.createElement('canvas');
//       return { blob, dataUrl, canvas };
//     }

//     const video = videoRefs.current[role];
//     if (!video || video.readyState < 2) throw new Error(`Câmera "${role}" não está pronta.`);
//     const canvas = document.createElement('canvas');
//     canvas.width  = video.videoWidth  || 1280;
//     canvas.height = video.videoHeight || 720;
//     canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height);
//     const blob    = await canvasToBlob(canvas, 0.88);
//     const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
//     return { blob, dataUrl, canvas };
//   }, [sourceTypes, ipUrls]);

//   const assignDevice = useCallback((role: CamRole, deviceId: string | null) => {
//     setAssignments((prev) => ({ ...prev, [role]: deviceId }));
//     localStorage.setItem(LS_KEYS[role], deviceId || '');
//   }, []);

//   const setVideoRef = useCallback((role: CamRole, element: HTMLVideoElement | null) => {
//     videoRefs.current[role] = element;
//     if (element && streams[role]) element.srcObject = streams[role]!;
//   }, [streams]);

//   const setSourceType = useCallback((role: CamRole, type: CameraSourceType) => {
//     setSourceTypes((prev) => ({ ...prev, [role]: type }));
//     localStorage.setItem(LS_KEYS_TYPE[role], type);
//   }, []);

//   const setIpUrl = useCallback((role: CamRole, url: string | null) => {
//     setIpUrls((prev) => ({ ...prev, [role]: url }));
//     if (url) {
//       localStorage.setItem(LS_KEYS_URL[role], url);
//     } else {
//       localStorage.removeItem(LS_KEYS_URL[role]);
//     }
//   }, []);

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
//     sourceTypes,
//     ipUrls,
//     setSourceType,
//     setIpUrl,
//   };
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HOOK PRINCIPAL
// // ─────────────────────────────────────────────────────────────────────────────

// export function useCamAutomation(): UseCamAutomationReturn {

//   const [screen,     setScreen]     = useState<Screen>('idle');
//   const [direction,  setDirection]  = useState<Direction>('ENTRY');
//   const [doorStatus, setDoorStatus] = useState<DoorStatus>('closed');
//   const [session,    setSession]    = useState<Session>(EMPTY_SESSION);
//   const [sysConfig,  setSysConfig]  = useState<SysConfig>(DEFAULT_CONFIG);
//   const [showReport, setShowReport] = useState(false);
//   const [showConfig, setShowConfig] = useState(false);

//   const cameraHook = useCameraInternal(sysConfig);

//   const [dashboard,   setDashboard]   = useState<DashboardData | null>(null);
//   const [loadingDash, setLoadingDash] = useState(true);

//   const [faceStep,       setFaceStep]       = useState<FaceScanStep>('ready');
//   const [faceCaptureUrl, setFaceCaptureUrl] = useState<string | null>(null);
//   const [faceProgress,   setFaceProgress]   = useState(0);
//   const [faceStatusMsg,  setFaceStatusMsg]  = useState('Posicione seu rosto na câmera e toque em Capturar');
//   const [faceSubMsg,     setFaceSubMsg]     = useState('');
//   const [faceCountdown,  setFaceCountdown]  = useState<number | null>(null);
//   const faceAutoCapture = useRef(false);

//   const [epiStep,        setEpiStep]        = useState<EpiScanStep>('ready');
//   const [epiCaptureUrl1, setEpiCaptureUrl1] = useState<string | null>(null);
//   const [epiCaptureUrl2, setEpiCaptureUrl2] = useState<string | null>(null);
//   const [epiStatusMsg,   setEpiStatusMsg]   = useState('Posicione-se em frente às câmeras de corpo');
//   const [epiCountdown,   setEpiCountdown]   = useState<number | null>(null);
//   const [epiResult,      setEpiResult]      = useState<EpiResult | null>(null);
//   const epiAutoCapture = useRef(false);

//   // Keep session in sync with a ref to avoid stale closure in async callbacks
//   const sessionRef = useRef<Session>(EMPTY_SESSION);

//   const [localConfig, setLocalConfig] = useState<SysConfig>(DEFAULT_CONFIG);
//   const [epiConfig,   setEpiConfig]   = useState<EpiConfig | null>(null);
//   const [saving,      setSaving]      = useState(false);
//   const [saved,       setSaved]       = useState(false);

//   const [people,        setPeople]        = useState<WorkerRecord[]>([]);
//   const [loadingPeople, setLoadingPeople] = useState(false);

//   // ─── Helpers de reset ─────────────────────────────────────────────────────

//   // Mantém sessionRef sempre sincronizado para uso em callbacks com closure stale
//   useEffect(() => { sessionRef.current = session; }, [session]);

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

//   // ─── Config ───────────────────────────────────────────────────────────────

//   useEffect(() => {
//     api.getLocalConfig()
//       .then((cfg) => {
//         setSysConfig((prev) => ({ ...prev, ...cfg }));
//         setLocalConfig((prev) => ({ ...prev, ...cfg }));
//       })
//       .catch((e: Error) => console.warn('[useCamAutomation] Config load failed:', e.message));
//   }, []);

//   // ─── Dashboard polling ────────────────────────────────────────────────────

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

//   useEffect(() => {
//     if (!showConfig) return;
//     setLocalConfig({ ...sysConfig });
//     api.getEpiConfig().then(setEpiConfig).catch(console.warn);
//   }, [showConfig, sysConfig]);

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
//     if (sysConfig.useSingleCamera) {
//       // câmera face já está ativa
//     } else {
//       cameraHook.startStream('body1');
//       if (cameraHook.getAssignment('body2')) cameraHook.startStream('body2');
//     }
//     setScreen('epi_scan');
//   }, [cameraHook, resetEpiScan, sysConfig.useSingleCamera]);

//   const handleRetryFromDenied = useCallback(() => {
//     setSession((prev) => ({ ...prev, epiResult: null, missingEpi: [], deniedReason: null }));
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
//     if (epiStep !== 'ready') return;
//     epiAutoCapture.current = false;

//     // ✅ BLOQUEIO: pessoa não identificada → acesso negado imediato, sem câmera EPI
//     // Usa sessionRef para evitar closure stale quando chamado pelo auto-capture (setInterval)
//     const personCode = sessionRef.current.person?.personCode?.trim();
//     const personName = sessionRef.current.person?.personName?.trim();
//     if (!personCode && !personName) {
//       console.warn('[EPI] Pessoa não identificada — acesso negado sem leitura EPI');
//       epiAutoCapture.current = false;
//       setEpiStep('error');
//       setEpiStatusMsg('❌ Usuário não encontrado — Acesso negado');
//       setDoorStatus('closed');
//       setSession((prev) => ({
//         ...prev,
//         missingEpi:   [],
//         deniedReason: 'user_not_found',
//         epiResult:    { compliant: false },
//       }));
//       setTimeout(() => setScreen('access_denied'), 1500);
//       return;
//     }

//     const hasBody2 = !sysConfig.useSingleCamera && !!cameraHook.getAssignment('body2');

//     try {
//       setEpiStep('capturing');
//       setEpiStatusMsg('Capturando frames…');

//       const captureRole: CamRole = sysConfig.useSingleCamera ? 'face' : 'body1';
//       const { blob: blob1, dataUrl: url1 } = await cameraHook.captureFrame(captureRole);
//       setEpiCaptureUrl1(url1);

//       let blob2: Blob | null = null;
//       if (hasBody2) {
//         try {
//           const f2 = await cameraHook.captureFrame('body2');
//           setEpiCaptureUrl2(f2.dataUrl);
//           blob2 = f2.blob;
//         } catch (e2) {
//           console.warn('[EPI] Body2 capture failed:', (e2 as Error).message);
//         }
//       }

//       setEpiStep('processing');
//       setEpiStatusMsg('Detectando EPIs… aguarde');

//       const epiSessionData = await api.startValidationSession({
//         direction,
//         door_id: sysConfig.doorId,
//         zone_id: sysConfig.zoneId,
//       });
//       const epiSessionUuid = epiSessionData.session_uuid || epiSessionData.sessionUuid!;

//       const photo1 = await api.sendValidationPhoto(epiSessionUuid, blob1, { photoType: 'body', cameraId: 2 });
//       let finalResult: EpiResult = { ...photo1, compliant: photo1.compliant ?? false };

//       if (blob2) {
//         try {
//           const photo2 = await api.sendValidationPhoto(epiSessionUuid, blob2, { photoType: 'body', cameraId: 3 });
//           if (!photo2.compliant) finalResult = { ...photo2, compliant: photo2.compliant ?? false };
//         } catch (e3) {
//           console.warn('[EPI] Body2 send failed:', (e3 as Error).message);
//         }
//       }

//       try {
//         await api.closeValidationSession(epiSessionUuid);
//       } catch (_) {
//         // ignorado
//       }

//       setEpiResult(finalResult);
//       setEpiStep('done');
//       setSession((prev) => ({ ...prev, epiResult: finalResult, deniedReason: null }));

//       if (finalResult.compliant) {
//         setEpiStatusMsg('✅ EPI Completo — Acesso liberado');
//         try {
//           await api.openDoor({
//             personCode:  sessionRef.current.person?.personCode,
//             personName:  sessionRef.current.person?.personName,
//             sessionUuid: epiSessionUuid,
//             reason:      'EPI_COMPLIANT',
//           });
//           setDoorStatus('open');
//         } catch (e) {
//           console.error('[EPI] Erro ao abrir porta:', e);
//         }
//         setTimeout(() => setScreen('access_granted'), 1200);
//       } else {
//         setEpiStatusMsg('❌ EPI Incompleto — Acesso negado');
//         const missing = (finalResult.missing || finalResult.missing_ppe || []).map(epiLabel);
//         setSession((prev) => ({ ...prev, missingEpi: missing, deniedReason: 'epi_incomplete' }));
//         setDoorStatus('closed');
//         setTimeout(() => setScreen('access_denied'), 1200);
//       }

//     } catch (e) {
//       console.error('[useCamAutomation] EPI capture failed:', e);
//       setEpiStep('error');
//       const errorMsg = (e as any)?.response?.data?.detail || (e as Error)?.message || 'Erro desconhecido';
//       setEpiStatusMsg(`Erro na detecção de EPI: ${errorMsg}`);
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [epiStep, cameraHook, direction, sysConfig]);

//   const handleRetryEpi = useCallback(() => resetEpiScan(false), [resetEpiScan]);

//   // ─── ACTION: Salva config ─────────────────────────────────────────────────

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

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

// ─────────────────────────────────────────────────────────────────────────────
// API LAYER (interno ao hook — nenhum screen/component precisa importar)
// ─────────────────────────────────────────────────────────────────────────────

const getApiBaseUrl = (): string => {
  const saved = sessionStorage.getItem("apiEndpoint");
  return saved ?? "https://aihub.smartxhub.cloud";
};

const makeHttp = () =>
  axios.create({ baseURL: getApiBaseUrl(), timeout: 30000 });

const EPI = "/api/v1/epi";

const api = {
  getLocalConfig: async (): Promise<Partial<SysConfig>> => {
    try {
      const { data } = await makeHttp().get(`${EPI}/local/config`);
      return data;
    } catch {
      return {};
    }
  },

  getDashboard: async (): Promise<DashboardData> => {
    const { data } = await makeHttp().get(`${EPI}/analytics/dashboard`);
    return data;
  },

  getPeople: async (
    activeOnly = false,
  ): Promise<{ people?: WorkerRecord[] } | WorkerRecord[]> => {
    const { data } = await makeHttp().get(`${EPI}/analytics/people`, {
      params: { active_only: activeOnly },
    });
    return data;
  },

  getEpiConfig: async (): Promise<EpiConfig> => {
    const { data } = await makeHttp().get(`${EPI}/config`);
    return {
      required_ppe: data.config?.required_ppe ?? [],
      available_classes: data.all_classes
        ? (Object.values(data.all_classes) as string[])
        : [],
      config: data.config,
    };
  },

  saveEpiConfig: async (config: { required_ppe: string[] }): Promise<void> => {
    await makeHttp().post(`${EPI}/config`, config);
  },

  startValidationSession: async (
    overrides: Record<string, unknown> = {},
  ): Promise<{ session_uuid: string; sessionUuid?: string }> => {
    const form = new FormData();
    form.append("door_id", String(overrides.door_id ?? "DOOR_01"));
    form.append("direction", String(overrides.direction ?? "ENTRY"));
    form.append("zone_id", String(overrides.zone_id ?? ""));
    form.append("compliance_mode", "majority");
    form.append("photo_count_required", "1");
    form.append("timeout_seconds", "30");
    const { data } = await makeHttp().post(`${EPI}/validation/start`, form);
    return data;
  },

  sendValidationPhoto: async (
    sessionUuid: string,
    frameBlob: Blob,
    opts: { photoType?: string; cameraId?: number } = {},
  ): Promise<PhotoResult> => {
    const form = new FormData();
    form.append("session_uuid", sessionUuid);
    form.append("file", frameBlob, "frame.jpg");
    if (opts.cameraId !== undefined)
      form.append("camera_id", String(opts.cameraId));
    if (opts.photoType) form.append("photo_type", opts.photoType);

    const endpoint = `${EPI}/validation/photo`;
    const { data } = await makeHttp().post(endpoint, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  closeValidationSession: async (sessionUuid: string): Promise<void> => {
    const form = new FormData();
    form.append("session_uuid", sessionUuid);
    await makeHttp().post(`${EPI}/validation/close`, form);
  },

  openDoor: async (payload: {
    personCode?: string;
    personName?: string;
    sessionUuid?: string | null;
    reason: string;
  }): Promise<void> => {
    try {
      const form = new FormData();
      if (payload.personCode) form.append("person_code", payload.personCode);
      if (payload.personName) form.append("person_name", payload.personName);
      if (payload.sessionUuid) form.append("session_uuid", payload.sessionUuid);
      form.append("reason", payload.reason);
      await makeHttp().post(`${EPI}/door/open`, form);
    } catch (e) {
      console.warn("[openDoor] endpoint não disponível:", e);
    }
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality = 0.88,
): Promise<Blob> {
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/jpeg", quality),
  );
}

export function formatMinutes(mins: number | null | undefined): string {
  if (mins == null) return "—";
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
  | "idle"
  | "face_scan"
  | "time_alert"
  | "epi_scan"
  | "access_granted"
  | "access_denied";

export type Direction = "ENTRY" | "EXIT";
export type DoorStatus = "closed" | "open" | "alert" | "waiting";
export type CamRole = "face" | "body1" | "body2";

export type CameraSourceType = "local" | "ip_url";

export interface CameraSource {
  type: CameraSourceType;
  deviceId?: string;
  url?: string;
}

export interface Person {
  personCode: string;
  personName: string;
  confidence: number;
}

export interface DailyExposure {
  total_minutes: number;
  limit_minutes: number;
  entries_today?: number;
}

export interface EpiResult {
  compliant: boolean;
  detected?: string[];
  detected_ppe?: string[];
  missing?: string[];
  missing_ppe?: string[];
}

export interface Session {
  sessionUuid: string | null;
  person: Person | null;
  dailyExposure: DailyExposure | null;
  epiResult: EpiResult | null;
  missingEpi: string[];
  // Motivo do bloqueio para a tela access_denied
  deniedReason?: "user_not_found" | "epi_incomplete" | null;
}

export interface SysConfig {
  companyId: number;
  zoneId: number;
  doorId: string;
  dailyLimitMin: number;
  overLimitPolicy: "warn" | "block";
  doorOpenMaxMin: number;
  faceConfidenceMin: number;
  apiBase: string;
  useSingleCamera: boolean;
  cameraSourceType: Record<CamRole, CameraSourceType>;
  cameraIpUrl: Record<CamRole, string | null>;
}

export interface EpiConfig {
  required_ppe: string[];
  available_classes?: string[];
  config?: Record<string, unknown>;
}

export interface DashboardData {
  inside_count?: number;
  people_inside?: number;
  entries_today?: number;
  today?: { total?: number };
  open_alerts?: number;
  alerts_open?: number;
  over_limit_count?: number;
}

export interface WorkerRecord {
  person_code: string;
  person_name: string;
  department?: string;
  is_inside?: boolean;
  daily_accumulated_min?: number;
  total_minutes?: number;
  total_entries?: number;
  sessions_today?: number;
}

export interface CamDevice {
  deviceId: string;
  label: string;
  kind: string;
}

export interface CameraHook {
  devices: CamDevice[];
  assignments: Record<CamRole, string | null>;
  streams: Partial<Record<CamRole, MediaStream>>;
  loading: boolean;
  error: string | null;
  enumerateDevices: () => Promise<CamDevice[]>;
  startStream: (role: CamRole) => Promise<MediaStream | null>;
  stopStream: (role: CamRole) => void;
  stopAllStreams: () => void;
  captureFrame: (
    role: CamRole,
  ) => Promise<{ blob: Blob; dataUrl: string; canvas: HTMLCanvasElement }>;
  assignDevice: (role: CamRole, deviceId: string | null) => void;
  setVideoRef: (role: CamRole, element: HTMLVideoElement | null) => void;
  hasStream: (role: CamRole) => boolean;
  getAssignment: (role: CamRole) => string | null;
  sourceTypes: Record<CamRole, CameraSourceType>;
  ipUrls: Record<CamRole, string | null>;
  setSourceType: (role: CamRole, type: CameraSourceType) => void;
  setIpUrl: (role: CamRole, url: string | null) => void;
}

// ─── Tipos internos da API ────────────────────────────────────────────────────

interface PhotoResult {
  session_uuid?: string;
  photo_seq?: number;
  photo_count_received?: number;
  photo_count_required?: number;
  session_complete?: boolean;
  face_detected?: boolean;
  face_recognized?: boolean;
  face_confidence?: number;
  face_person_code?: string;
  person_code?: string;
  person_name?: string;
  confidence?: number;
  epi_compliant?: boolean;
  compliant?: boolean;
  compliance_score?: number;
  missing?: string[];
  missing_ppe?: string[];
  detected?: string[];
  detected_ppe?: string[];
  final_decision?: {
    access_decision: string;
    epi_compliant: boolean;
    face_confirmed: boolean;
    face_confidence_max?: number;
    person_code?: string;
    person_name?: string;
  } | null;
  daily_exposure?: DailyExposure;
}

// ─── Estados por screen/modal ─────────────────────────────────────────────────

export type FaceScanStep =
  | "ready"
  | "capturing"
  | "processing"
  | "done"
  | "error";

export interface FaceScanState {
  step: FaceScanStep;
  captureUrl: string | null;
  progress: number;
  statusMsg: string;
  subMsg: string;
  countdown: number | null;
}

export type EpiScanStep =
  | "ready"
  | "capturing"
  | "processing"
  | "done"
  | "error";

export interface EpiScanState {
  step: EpiScanStep;
  captureUrl1: string | null;
  captureUrl2: string | null;
  statusMsg: string;
  countdown: number | null;
  result: EpiResult | null;
}

export interface IdleState {
  dashboard: DashboardData | null;
  loadingDash: boolean;
  refreshDashboard: () => void;
}

export interface ConfigState {
  localConfig: SysConfig;
  epiConfig: EpiConfig | null;
  saving: boolean;
  saved: boolean;
  setLocalConfig: (cfg: SysConfig) => void;
  setEpiConfig: (cfg: EpiConfig | null) => void;
  handleSave: () => Promise<void>;
}

export interface PermanenceState {
  people: WorkerRecord[];
  loading: boolean;
  fetchPeople: () => Promise<void>;
}

export interface UseCamAutomationReturn {
  screen: Screen;
  direction: Direction;
  doorStatus: DoorStatus;
  session: Session;
  sysConfig: SysConfig;
  showReport: boolean;
  showConfig: boolean;
  setShowReport: (v: boolean) => void;
  setShowConfig: (v: boolean) => void;
  cameraHook: CameraHook;
  idleState: IdleState;
  faceScanState: FaceScanState;
  epiScanState: EpiScanState;
  configState: ConfigState;
  permanenceState: PermanenceState;
  handleStartEntry: () => void;
  handleStartExit: () => void;
  handleGoIdle: () => void;
  handleTimeOverride: () => void;
  handleRetryFromDenied: () => void;
  handleSaveConfig: (newConfig: Partial<SysConfig>) => void;
  handleCaptureFace: () => Promise<void>;
  handleRetryFace: () => void;
  handleCaptureEpi: () => Promise<void>;
  handleRetryEpi: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const LS_KEYS: Record<CamRole, string> = {
  face: "epi_cam_face",
  body1: "epi_cam_body1",
  body2: "epi_cam_body2",
};

const LS_KEYS_TYPE: Record<CamRole, string> = {
  face: "epi_cam_face_type",
  body1: "epi_cam_body1_type",
  body2: "epi_cam_body2_type",
};

const LS_KEYS_URL: Record<CamRole, string> = {
  face: "epi_cam_face_url",
  body1: "epi_cam_body1_url",
  body2: "epi_cam_body2_url",
};

const EMPTY_SESSION: Session = {
  sessionUuid: null,
  person: null,
  dailyExposure: null,
  epiResult: null,
  missingEpi: [],
  deniedReason: null,
};

const DEFAULT_CONFIG: SysConfig = {
  companyId: 1,
  zoneId: 10,
  doorId: "DOOR_CAMARA_FRIA_01",
  dailyLimitMin: 120,
  overLimitPolicy: "warn",
  doorOpenMaxMin: 15,
  faceConfidenceMin: 70,
  apiBase: "https://aihub.smartxhub.cloud",
  useSingleCamera: false,
  cameraSourceType: {
    face: "local",
    body1: "local",
    body2: "local",
  },
  cameraIpUrl: {
    face: null,
    body1: null,
    body2: null,
  },
};

const EPI_LABELS_PT: Record<string, string> = {
  helmet: "Capacete",
  vest: "Colete",
  gloves: "Luvas",
  boots: "Botas",
  thermal_coat: "Jaqueta Térmica",
  thermal_pants: "Calça Térmica",
  glasses: "Óculos de Proteção",
  mask: "Máscara",
  apron: "Avental",
  hardhat: "Capacete",
};

const epiLabel = (k: string) => EPI_LABELS_PT[k] ?? k;

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: CAPTURA DE FRAME DE CÂMERA IP VIA URL
// ─────────────────────────────────────────────────────────────────────────────

async function captureFrameFromUrl(url: string): Promise<Blob> {
  // Extrai credenciais da URL se existirem e passa junto ao proxy
  //@ts-ignore
  let cleanUrl = url;
  try {
    const urlObj = new URL(url);
    if (urlObj.username || urlObj.password) {
      urlObj.username = "";
      urlObj.password = "";
      cleanUrl = urlObj.toString();
    }
  } catch (e) {
    console.warn("[CAM] Erro ao parsear URL:", e);
  }

  // Usa proxy do backend para evitar CORS
  const proxyUrl = `${getApiBaseUrl()}/api/v1/epi/camera/snapshot/v4?url=${encodeURIComponent(url)}`;

  const response = await fetch(proxyUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.blob();
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK DE CÂMERAS (interno)
// ─────────────────────────────────────────────────────────────────────────────
//@ts-ignore
function useCameraInternal(sysConfig: SysConfig): CameraHook {
  const [devices, setDevices] = useState<CamDevice[]>([]);
  const [assignments, setAssignments] = useState<
    Record<CamRole, string | null>
  >({
    face: localStorage.getItem(LS_KEYS.face) || null,
    body1: localStorage.getItem(LS_KEYS.body1) || null,
    body2: localStorage.getItem(LS_KEYS.body2) || null,
  });

  const [sourceTypes, setSourceTypes] = useState<
    Record<CamRole, CameraSourceType>
  >({
    face:
      (localStorage.getItem(LS_KEYS_TYPE.face) as CameraSourceType) || "local",
    body1:
      (localStorage.getItem(LS_KEYS_TYPE.body1) as CameraSourceType) || "local",
    body2:
      (localStorage.getItem(LS_KEYS_TYPE.body2) as CameraSourceType) || "local",
  });

  const [ipUrls, setIpUrls] = useState<Record<CamRole, string | null>>({
    face: localStorage.getItem(LS_KEYS_URL.face) || null,
    body1: localStorage.getItem(LS_KEYS_URL.body1) || null,
    body2: localStorage.getItem(LS_KEYS_URL.body2) || null,
  });

  const [streams, setStreams] = useState<Partial<Record<CamRole, MediaStream>>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRefs = useRef<Partial<Record<CamRole, HTMLVideoElement | null>>>(
    {},
  );

  const enumerateDevices = useCallback(async (): Promise<CamDevice[]> => {
    try {
      await navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((s) => s.getTracks().forEach((t) => t.stop()))
        .catch(() => {});
      const all = await navigator.mediaDevices.enumerateDevices();
      const vids = all.filter((d) => d.kind === "videoinput") as CamDevice[];
      setDevices(vids);
      setAssignments((prev) => {
        const next = { ...prev };
        if (!next.face && vids[0]) next.face = vids[0].deviceId;
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

  const startStream = useCallback(
    async (role: CamRole): Promise<MediaStream | null> => {
      const sourceType = sourceTypes[role];
      if (sourceType === "ip_url") return null;

      const deviceId = assignments[role];
      if (!deviceId) return null;
      streams[role]?.getTracks().forEach((t) => t.stop());
      try {
        setLoading(true);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: deviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
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
    },
    [assignments, sourceTypes, streams],
  );

  const stopStream = useCallback(
    (role: CamRole) => {
      streams[role]?.getTracks().forEach((t) => t.stop());
      setStreams((prev) => {
        const n = { ...prev };
        delete n[role];
        return n;
      });
      const ref = videoRefs.current[role];
      if (ref) ref.srcObject = null;
    },
    [streams],
  );

  const stopAllStreams = useCallback(() => {
    Object.values(streams).forEach((s) =>
      s?.getTracks().forEach((t) => t.stop()),
    );
    setStreams({});
    Object.values(videoRefs.current).forEach((v) => {
      if (v) v.srcObject = null;
    });
  }, [streams]);

  const captureFrame = useCallback(
    async (role: CamRole) => {
      const sourceType = sourceTypes[role];

      if (sourceType === "ip_url") {
        const url = ipUrls[role];
        if (!url) throw new Error(`URL não configurada para câmera ${role}`);
        const blob = await captureFrameFromUrl(url);
        const dataUrl = URL.createObjectURL(blob);
        const canvas = document.createElement("canvas");
        return { blob, dataUrl, canvas };
      }

      const video = videoRefs.current[role];
      if (!video || video.readyState < 2)
        throw new Error(`Câmera "${role}" não está pronta.`);
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      canvas
        .getContext("2d")!
        .drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await canvasToBlob(canvas, 0.88);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
      return { blob, dataUrl, canvas };
    },
    [sourceTypes, ipUrls],
  );

  const assignDevice = useCallback((role: CamRole, deviceId: string | null) => {
    setAssignments((prev) => ({ ...prev, [role]: deviceId }));
    localStorage.setItem(LS_KEYS[role], deviceId || "");
  }, []);

  const setVideoRef = useCallback(
    (role: CamRole, element: HTMLVideoElement | null) => {
      videoRefs.current[role] = element;
      if (element && streams[role]) element.srcObject = streams[role]!;
    },
    [streams],
  );

  const setSourceType = useCallback((role: CamRole, type: CameraSourceType) => {
    setSourceTypes((prev) => ({ ...prev, [role]: type }));
    localStorage.setItem(LS_KEYS_TYPE[role], type);
  }, []);

  const setIpUrl = useCallback((role: CamRole, url: string | null) => {
    setIpUrls((prev) => ({ ...prev, [role]: url }));
    if (url) {
      localStorage.setItem(LS_KEYS_URL[role], url);
    } else {
      localStorage.removeItem(LS_KEYS_URL[role]);
    }
  }, []);

  useEffect(() => {
    enumerateDevices();
    const handler = () => enumerateDevices();
    navigator.mediaDevices.addEventListener("devicechange", handler);
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", handler);
      stopAllStreams();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    devices,
    assignments,
    streams,
    loading,
    error,
    enumerateDevices,
    startStream,
    stopStream,
    stopAllStreams,
    captureFrame,
    assignDevice,
    setVideoRef,
    hasStream: (role) => !!streams[role],
    getAssignment: (role) => assignments[role],
    sourceTypes,
    ipUrls,
    setSourceType,
    setIpUrl,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export function useCamAutomation(): UseCamAutomationReturn {
  const [screen, setScreen] = useState<Screen>("idle");
  const [direction, setDirection] = useState<Direction>("ENTRY");
  const [doorStatus, setDoorStatus] = useState<DoorStatus>("closed");
  const [session, setSession] = useState<Session>(EMPTY_SESSION);
  const [sysConfig, setSysConfig] = useState<SysConfig>(DEFAULT_CONFIG);
  const [showReport, setShowReport] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const cameraHook = useCameraInternal(sysConfig);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loadingDash, setLoadingDash] = useState(true);

  const [faceStep, setFaceStep] = useState<FaceScanStep>("ready");
  const [faceCaptureUrl, setFaceCaptureUrl] = useState<string | null>(null);
  const [faceProgress, setFaceProgress] = useState(0);
  const [faceStatusMsg, setFaceStatusMsg] = useState(
    "Posicione seu rosto na câmera e toque em Capturar",
  );
  const [faceSubMsg, setFaceSubMsg] = useState("");
  const [faceCountdown, setFaceCountdown] = useState<number | null>(null);
  const faceAutoCapture = useRef(false);

  const [epiStep, setEpiStep] = useState<EpiScanStep>("ready");
  const [epiCaptureUrl1, setEpiCaptureUrl1] = useState<string | null>(null);
  const [epiCaptureUrl2, setEpiCaptureUrl2] = useState<string | null>(null);
  const [epiStatusMsg, setEpiStatusMsg] = useState(
    "Posicione-se em frente às câmeras de corpo",
  );
  const [epiCountdown, setEpiCountdown] = useState<number | null>(null);
  const [epiResult, setEpiResult] = useState<EpiResult | null>(null);
  const epiAutoCapture = useRef(false);

  // Keep session in sync with a ref to avoid stale closure in async callbacks
  const sessionRef = useRef<Session>(EMPTY_SESSION);

  const [localConfig, setLocalConfig] = useState<SysConfig>(DEFAULT_CONFIG);
  const [epiConfig, setEpiConfig] = useState<EpiConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [people, setPeople] = useState<WorkerRecord[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(false);

  // ─── Helpers de reset ─────────────────────────────────────────────────────

  // Mantém sessionRef sempre sincronizado para uso em callbacks com closure stale
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const resetSession = useCallback(() => setSession(EMPTY_SESSION), []);

  const resetFaceScan = useCallback((withAutoCapture = false) => {
    faceAutoCapture.current = withAutoCapture;
    setFaceStep("ready");
    setFaceCaptureUrl(null);
    setFaceProgress(0);
    setFaceStatusMsg("Posicione seu rosto na câmera e toque em Capturar");
    setFaceSubMsg("");
    setFaceCountdown(null);
  }, []);

  const resetEpiScan = useCallback((withAutoCapture = false) => {
    epiAutoCapture.current = withAutoCapture;
    setEpiStep("ready");
    setEpiCaptureUrl1(null);
    setEpiCaptureUrl2(null);
    setEpiStatusMsg("Posicione-se em frente às câmeras de corpo");
    setEpiCountdown(null);
    setEpiResult(null);
  }, []);

  // ─── Config ───────────────────────────────────────────────────────────────

  useEffect(() => {
    api
      .getLocalConfig()
      .then((cfg) => {
        setSysConfig((prev) => ({ ...prev, ...cfg }));
        setLocalConfig((prev) => ({ ...prev, ...cfg }));
      })
      .catch((e: Error) =>
        console.warn("[useCamAutomation] Config load failed:", e.message),
      );
  }, []);

  // ─── Dashboard polling ────────────────────────────────────────────────────

  const refreshDashboard = useCallback(async () => {
    try {
      const data = await api.getDashboard();
      setDashboard(data);
    } catch (e) {
      console.warn("[useCamAutomation] Dashboard failed:", e);
    } finally {
      setLoadingDash(false);
    }
  }, []);

  useEffect(() => {
    if (screen !== "idle") return;
    refreshDashboard();
    const t = setInterval(refreshDashboard, 30000);
    return () => clearInterval(t);
  }, [screen, refreshDashboard]);

  useEffect(() => {
    if (!showConfig) return;
    setLocalConfig({ ...sysConfig });
    api.getEpiConfig().then(setEpiConfig).catch(console.warn);
  }, [showConfig, sysConfig]);

  const fetchPeople = useCallback(async () => {
    try {
      setLoadingPeople(true);
      const data = await api.getPeople(false);
      const list =
        (data as { people?: WorkerRecord[] }).people ??
        (data as WorkerRecord[]) ??
        [];
      setPeople(list);
    } catch (e) {
      console.error("[useCamAutomation] fetchPeople failed:", e);
    } finally {
      setLoadingPeople(false);
    }
  }, []);

  useEffect(() => {
    if (showReport) fetchPeople();
  }, [showReport, fetchPeople]);

  // ─── Auto-capture: face ───────────────────────────────────────────────────

  useEffect(() => {
    if (
      screen !== "face_scan" ||
      !faceAutoCapture.current ||
      faceStep !== "ready"
    )
      return;
    let n = 3;
    setFaceCountdown(n);
    const t = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(t);
        setFaceCountdown(null);
        handleCaptureFace();
      } else setFaceCountdown(n);
    }, 1000);
    return () => {
      clearInterval(t);
      setFaceCountdown(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, faceStep]);

  // ─── Auto-capture: EPI ───────────────────────────────────────────────────

  useEffect(() => {
    if (screen !== "epi_scan" || !epiAutoCapture.current || epiStep !== "ready")
      return;
    let n = 4;
    setEpiCountdown(n);
    const t = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(t);
        setEpiCountdown(null);
        handleCaptureEpi();
      } else setEpiCountdown(n);
    }, 1000);
    return () => {
      clearInterval(t);
      setEpiCountdown(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, epiStep]);

  // ─── Navegação ────────────────────────────────────────────────────────────

  const handleStartEntry = useCallback(() => {
    setDirection("ENTRY");
    resetSession();
    resetFaceScan(true);
    cameraHook.startStream("face");
    setScreen("face_scan");
  }, [resetSession, resetFaceScan, cameraHook]);

  const handleStartExit = useCallback(() => {
    setDirection("EXIT");
    resetSession();
    resetFaceScan(true);
    cameraHook.startStream("face");
    setScreen("face_scan");
  }, [resetSession, resetFaceScan, cameraHook]);

  const handleGoIdle = useCallback(() => {
    cameraHook.stopAllStreams();
    resetSession();
    resetFaceScan(false);
    resetEpiScan(false);
    setDoorStatus("closed");
    setScreen("idle");
  }, [cameraHook, resetSession, resetFaceScan, resetEpiScan]);

  const handleTimeOverride = useCallback(() => {
    resetEpiScan(true);
    if (sysConfig.useSingleCamera) {
      // câmera face já está ativa
    } else {
      cameraHook.startStream("body1");
      if (cameraHook.getAssignment("body2")) cameraHook.startStream("body2");
    }
    setScreen("epi_scan");
  }, [cameraHook, resetEpiScan, sysConfig.useSingleCamera]);

  const handleRetryFromDenied = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      epiResult: null,
      missingEpi: [],
      deniedReason: null,
    }));
    resetEpiScan(false);
    setScreen("epi_scan");
  }, [resetEpiScan]);

  const handleSaveConfig = useCallback((newConfig: Partial<SysConfig>) => {
    setSysConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  // ─── ACTION: Captura facial ───────────────────────────────────────────────

  const handleCaptureFace = useCallback(async () => {
    if (faceStep !== "ready") return;
    faceAutoCapture.current = false;

    try {
      setFaceStep("capturing");
      setFaceStatusMsg("Capturando frame…");

      const { blob, dataUrl } = await cameraHook.captureFrame("face");
      setFaceCaptureUrl(dataUrl);

      setFaceStep("processing");
      setFaceStatusMsg("Iniciando sessão de validação…");
      setFaceProgress(20);

      const sessionData = await api.startValidationSession({
        direction,
        door_id: sysConfig.doorId,
        zone_id: sysConfig.zoneId,
      });
      const uuid = sessionData.session_uuid || sessionData.sessionUuid!;
      setFaceProgress(40);

      setFaceStatusMsg("Reconhecendo rosto…");
      const photo = await api.sendValidationPhoto(uuid, blob, {
        photoType: "face",
        cameraId: 1,
      });
      setFaceProgress(80);

      // ✅ GUARD: só avança se pessoa foi identificada com código E nome preenchidos
      // Impede que face_detected=true sem reconhecimento avance para EPI
      const resolvedCode = (
        photo.face_person_code ||
        photo.person_code ||
        photo.final_decision?.person_code ||
        ""
      ).trim();

      const resolvedName = (
        photo.person_name ||
        photo.final_decision?.person_name ||
        ""
      ).trim();

      // const resolvedCode = (photo.face_person_code || photo.person_code || '').trim();
      // const resolvedName = (photo.person_name || '').trim();

      if (resolvedCode && resolvedName) {
        setFaceProgress(100);
        setFaceStep("done");

        // const resolvedConf = photo.face_confidence || photo.confidence || 0;

        const resolvedConf =
          photo.face_confidence ||
          photo.confidence ||
          photo.final_decision?.face_confidence_max ||
          0;

        setFaceStatusMsg(`Identificado: ${resolvedName}`);
        setFaceSubMsg(`Confiança: ${Math.round(resolvedConf * 100)}%`);

        const person: Person = {
          personCode: resolvedCode,
          personName: resolvedName,
          confidence: resolvedConf,
        };
        setSession((prev) => ({
          ...prev,
          sessionUuid: uuid,
          person,
          dailyExposure: photo.daily_exposure ?? null,
        }));

        setTimeout(() => {
          if (direction === "EXIT") {
            setScreen("idle");
            return;
          }

          const totalMin = photo.daily_exposure?.total_minutes ?? 0;
          const limitMin =
            photo.daily_exposure?.limit_minutes ?? sysConfig.dailyLimitMin;

          if (totalMin >= limitMin) {
            setScreen("time_alert");
          } else {
            resetEpiScan(true);
            cameraHook.startStream("body1");
            if (cameraHook.getAssignment("body2"))
              cameraHook.startStream("body2");
            setScreen("epi_scan");
          }
        }, 900);
      } else {
        // Rosto detectado mas não reconhecido como pessoa cadastrada → nega acesso
        setFaceStep("error");
        setFaceStatusMsg("Rosto não reconhecido");
        setFaceSubMsg("Usuário não encontrado — solicite acesso manual");
        setFaceProgress(0);
        // Garante que session.person permanece null, bloqueando qualquer avanço para EPI
        setSession((prev) => ({
          ...prev,
          person: null,
          deniedReason: "user_not_found",
        }));
      }
    } catch (e) {
      const err = e as {
        response?: { data?: { detail?: string } };
        message?: string;
      };
      setFaceStep("error");
      setFaceStatusMsg("Erro ao processar");
      setFaceSubMsg(err.response?.data?.detail || err.message || "");
      setFaceProgress(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faceStep, cameraHook, direction, sysConfig, resetEpiScan]);

  const handleRetryFace = useCallback(
    () => resetFaceScan(false),
    [resetFaceScan],
  );

  // ─── ACTION: Captura EPI ──────────────────────────────────────────────────

  const handleCaptureEpi = useCallback(async () => {
    if (epiStep !== "ready") return;
    epiAutoCapture.current = false;

    // ✅ BLOQUEIO DUPLO: pessoa não identificada → acesso negado imediato, sem câmera EPI
    // Usa sessionRef para evitar closure stale quando chamado pelo auto-capture (setInterval)
    const personCode = sessionRef.current.person?.personCode?.trim();
    const personName = sessionRef.current.person?.personName?.trim();
    if (!personCode || !personName) {
      console.warn(
        "[EPI] Pessoa não identificada — acesso negado sem leitura EPI",
      );
      epiAutoCapture.current = false;
      setEpiStep("error");
      setEpiStatusMsg("❌ Usuário não encontrado — Acesso negado");
      setDoorStatus("closed");
      setSession((prev) => ({
        ...prev,
        missingEpi: [],
        deniedReason: "user_not_found",
        epiResult: { compliant: false },
      }));
      setTimeout(() => setScreen("access_denied"), 1500);
      return;
    }

    const hasBody2 =
      !sysConfig.useSingleCamera && !!cameraHook.getAssignment("body2");

    try {
      setEpiStep("capturing");
      setEpiStatusMsg("Capturando frames…");

      const captureRole: CamRole = sysConfig.useSingleCamera ? "face" : "body1";
      const { blob: blob1, dataUrl: url1 } =
        await cameraHook.captureFrame(captureRole);
      setEpiCaptureUrl1(url1);

      let blob2: Blob | null = null;
      if (hasBody2) {
        try {
          const f2 = await cameraHook.captureFrame("body2");
          setEpiCaptureUrl2(f2.dataUrl);
          blob2 = f2.blob;
        } catch (e2) {
          console.warn("[EPI] Body2 capture failed:", (e2 as Error).message);
        }
      }

      setEpiStep("processing");
      setEpiStatusMsg("Detectando EPIs… aguarde");

      const epiSessionData = await api.startValidationSession({
        direction,
        door_id: sysConfig.doorId,
        zone_id: sysConfig.zoneId,
      });
      const epiSessionUuid =
        epiSessionData.session_uuid || epiSessionData.sessionUuid!;

      const photo1 = await api.sendValidationPhoto(epiSessionUuid, blob1, {
        photoType: "body",
        cameraId: 2,
      });
      let finalResult: EpiResult = {
        ...photo1,
        compliant: photo1.compliant ?? false,
      };

      if (blob2) {
        try {
          const photo2 = await api.sendValidationPhoto(epiSessionUuid, blob2, {
            photoType: "body",
            cameraId: 3,
          });
          if (!photo2.compliant)
            finalResult = { ...photo2, compliant: photo2.compliant ?? false };
        } catch (e3) {
          console.warn("[EPI] Body2 send failed:", (e3 as Error).message);
        }
      }

      try {
        await api.closeValidationSession(epiSessionUuid);
      } catch (_) {
        // ignorado
      }

      setEpiResult(finalResult);
      setEpiStep("done");
      setSession((prev) => ({
        ...prev,
        epiResult: finalResult,
        deniedReason: null,
      }));

      if (finalResult.compliant) {
        setEpiStatusMsg("✅ EPI Completo — Acesso liberado");
        try {
          await api.openDoor({
            personCode: sessionRef.current.person?.personCode,
            personName: sessionRef.current.person?.personName,
            sessionUuid: epiSessionUuid,
            reason: "EPI_COMPLIANT",
          });
          setDoorStatus("open");
        } catch (e) {
          console.error("[EPI] Erro ao abrir porta:", e);
        }
        setTimeout(() => setScreen("access_granted"), 1200);
      } else {
        setEpiStatusMsg("❌ EPI Incompleto — Acesso negado");
        const missing = (
          finalResult.missing ||
          finalResult.missing_ppe ||
          []
        ).map(epiLabel);
        setSession((prev) => ({
          ...prev,
          missingEpi: missing,
          deniedReason: "epi_incomplete",
        }));
        setDoorStatus("closed");
        setTimeout(() => setScreen("access_denied"), 1200);
      }
    } catch (e) {
      console.error("[useCamAutomation] EPI capture failed:", e);
      setEpiStep("error");
      const errorMsg =
        (e as any)?.response?.data?.detail ||
        (e as Error)?.message ||
        "Erro desconhecido";
      setEpiStatusMsg(`Erro na detecção de EPI: ${errorMsg}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epiStep, cameraHook, direction, sysConfig]);

  const handleRetryEpi = useCallback(() => resetEpiScan(false), [resetEpiScan]);

  // ─── ACTION: Salva config ─────────────────────────────────────────────────

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
      console.error("[useCamAutomation] saveConfig failed:", e);
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
      step: faceStep,
      captureUrl: faceCaptureUrl,
      progress: faceProgress,
      statusMsg: faceStatusMsg,
      subMsg: faceSubMsg,
      countdown: faceCountdown,
    },

    epiScanState: {
      step: epiStep,
      captureUrl1: epiCaptureUrl1,
      captureUrl2: epiCaptureUrl2,
      statusMsg: epiStatusMsg,
      countdown: epiCountdown,
      result: epiResult,
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
