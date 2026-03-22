// // src/hooks/useCamAutomation.ts
// // Hook central da máquina de estados do fluxo de automação EPI Check
// // Responsável por: estado da sessão, câmeras, configuração, todas as chamadas de API
// // Os screens e components NÃO importam a API diretamente — tudo vem deste hook

// import { useState, useEffect, useCallback, useRef } from "react";
// import axios from "axios";

// // ─────────────────────────────────────────────────────────────────────────────
// // API LAYER (interno ao hook — nenhum screen/component precisa importar)
// // ─────────────────────────────────────────────────────────────────────────────

// const getApiBaseUrl = (): string => {
//   const saved = sessionStorage.getItem("apiEndpoint");
//   return saved ?? "https://aihub.smartxhub.cloud";
// };

// const makeHttp = () =>
//   axios.create({ baseURL: getApiBaseUrl(), timeout: 60000 });

// const EPI = "https://aihub.smartxhub.cloud/api/v1/epi";

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

//   getPeople: async (
//     activeOnly = false,
//   ): Promise<{ people?: WorkerRecord[] } | WorkerRecord[]> => {
//     const { data } = await makeHttp().get(`${EPI}/analytics/people`, {
//       params: { active_only: activeOnly },
//     });
//     return data;
//   },

//   getEpiConfig: async (): Promise<EpiConfig> => {
//     const { data } = await makeHttp().get(`${EPI}/config`);
//     return {
//       required_ppe: data.config?.required_ppe ?? [],
//       available_classes: data.all_classes
//         ? (Object.values(data.all_classes) as string[])
//         : [],
//       config: data.config,
//     };
//   },

//   saveEpiConfig: async (config: { required_ppe: string[] }): Promise<void> => {
//     await makeHttp().post(`${EPI}/config`, config);
//   },

//   startValidationSession: async (
//     overrides: Record<string, unknown> = {},
//   ): Promise<{ session_uuid: string; sessionUuid?: string }> => {
//     const form = new FormData();
//     form.append("door_id", String(overrides.door_id ?? "DOOR_01"));
//     form.append("direction", String(overrides.direction ?? "ENTRY"));
//     form.append("zone_id", String(overrides.zone_id ?? ""));
//     form.append("compliance_mode", "majority");
//     form.append("photo_count_required", "1");
//     form.append("timeout_seconds", "30");
//     const { data } = await makeHttp().post(`${EPI}/validation/start`, form);
//     return data;
//   },

//   sendValidationPhoto: async (
//     sessionUuid: string,
//     frameBlob: Blob,
//     opts: { photoType?: string; cameraId?: number } = {},
//   ): Promise<PhotoResult> => {
//     const form = new FormData();
//     form.append("session_uuid", sessionUuid);
//     form.append("file", frameBlob, "frame.jpg");
//     if (opts.cameraId !== undefined)
//       form.append("camera_id", String(opts.cameraId));
//     if (opts.photoType) form.append("photo_type", opts.photoType);

//     const endpoint = `${EPI}/validation/photo`;
//     const { data } = await makeHttp().post(endpoint, form, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return data;
//   },

//   closeValidationSession: async (sessionUuid: string): Promise<void> => {
//     const form = new FormData();
//     form.append("session_uuid", sessionUuid);
//     await makeHttp().post(`${EPI}/validation/close`, form);
//   },

//   // ─── Log no backend Python (auditoria) — não controla a fechadura ────────
//   openDoor: async (payload: {
//     personCode?: string;
//     personName?: string;
//     sessionUuid?: string | null;
//     reason: string;
//   }): Promise<void> => {
//     try {
//       const form = new FormData();
//       if (payload.personCode) form.append("person_code", payload.personCode);
//       if (payload.personName) form.append("person_name", payload.personName);
//       if (payload.sessionUuid) form.append("session_uuid", payload.sessionUuid);
//       form.append("reason", payload.reason);
//       await makeHttp().post(`${EPI}/door/open`, form);
//     } catch (e) {
//       console.warn("[openDoor] endpoint não disponível:", e);
//     }
//   },

//   // ─── Chama o ESP32 diretamente via HTTP REST para destrancar ─────────────
//   // POST http://<ip>/unlock  body: { duration_ms: number }
//   // Resposta esperada: { ok: true, message: "Aberta", state: "unlocked", duration_ms: 5000 }
//   unlockDoor: async (lockIp: string, durationMs = 5000): Promise<void> => {
//     console.log(
//       `[unlockDoor] POST http://${lockIp}/unlock { duration_ms: ${durationMs} }`,
//     );

//     const res = await fetch(`http://${lockIp}/unlock`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ duration_ms: durationMs }),
//     });

//     if (!res.ok) {
//       throw new Error(`ESP32 HTTP ${res.status}: ${res.statusText}`);
//     }

//     const data = await res.json();

//     if (!data.ok) {
//       throw new Error(`ESP32 recusou o unlock: ${JSON.stringify(data)}`);
//     }

//     console.log(
//       `[unlockDoor] ✅ ESP32 destrancado — state: ${data.state}, duration: ${data.duration_ms}ms`,
//     );
//   },
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function canvasToBlob(
//   canvas: HTMLCanvasElement,
//   quality = 0.88,
// ): Promise<Blob> {
//   return new Promise((resolve) =>
//     canvas.toBlob((b) => resolve(b!), "image/jpeg", quality),
//   );
// }

// export function formatMinutes(mins: number | null | undefined): string {
//   if (mins == null) return "—";
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
//   | "idle"
//   | "face_scan"
//   | "time_alert"
//   | "epi_scan"
//   | "access_granted"
//   | "access_denied";

// export type Direction = "ENTRY" | "EXIT";
// export type DoorStatus = "closed" | "open" | "alert" | "waiting";
// export type CamRole = "face" | "body1" | "body2";
// export type CameraSourceType = "local" | "ip_url";

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
//   total_minutes: number;
//   limit_minutes: number;
//   entries_today?: number;
// }

// export interface EpiResult {
//   compliant: boolean;
//   detected?: string[];
//   detected_ppe?: string[];
//   missing?: string[];
//   missing_ppe?: string[];
// }

// export interface Session {
//   sessionUuid: string | null;
//   person: Person | null;
//   dailyExposure: DailyExposure | null;
//   epiResult: EpiResult | null;
//   missingEpi: string[];
//   deniedReason?: "user_not_found" | "epi_incomplete" | null;
// }

// export interface SysConfig {
//   companyId: number;
//   zoneId: number;
//   doorId: string;
//   dailyLimitMin: number;
//   overLimitPolicy: "warn" | "block";
//   doorOpenMaxMin: number;
//   faceConfidenceMin: number;
//   apiBase: string;
//   useSingleCamera: boolean;
//   cameraSourceType: Record<CamRole, CameraSourceType>;
//   cameraIpUrl: Record<CamRole, string | null>;
//   // ─── Fechadura ESP32 (MIXHUB IoT) ─────────────────────────────────────────
//   lockIpAddress: string;
//   lockDurationMs: number;
// }

// export interface EpiConfig {
//   required_ppe: string[];
//   available_classes?: string[];
//   config?: Record<string, unknown>;
// }

// export interface DashboardData {
//   inside_count?: number;
//   people_inside?: number;
//   entries_today?: number;
//   today?: { total?: number };
//   open_alerts?: number;
//   alerts_open?: number;
//   over_limit_count?: number;
// }

// export interface WorkerRecord {
//   person_code: string;
//   person_name: string;
//   department?: string;
//   is_inside?: boolean;
//   daily_accumulated_min?: number;
//   total_minutes?: number;
//   total_entries?: number;
//   sessions_today?: number;
// }

// export interface CamDevice {
//   deviceId: string;
//   label: string;
//   kind: string;
// }

// export interface CameraHook {
//   devices: CamDevice[];
//   assignments: Record<CamRole, string | null>;
//   streams: Partial<Record<CamRole, MediaStream>>;
//   loading: boolean;
//   error: string | null;
//   enumerateDevices: () => Promise<CamDevice[]>;
//   startStream: (role: CamRole) => Promise<MediaStream | null>;
//   stopStream: (role: CamRole) => void;
//   stopAllStreams: () => void;
//   captureFrame: (
//     role: CamRole,
//   ) => Promise<{ blob: Blob; dataUrl: string; canvas: HTMLCanvasElement }>;
//   assignDevice: (role: CamRole, deviceId: string | null) => void;
//   setVideoRef: (role: CamRole, element: HTMLVideoElement | null) => void;
//   hasStream: (role: CamRole) => boolean;
//   getAssignment: (role: CamRole) => string | null;
//   sourceTypes: Record<CamRole, CameraSourceType>;
//   ipUrls: Record<CamRole, string | null>;
//   setSourceType: (role: CamRole, type: CameraSourceType) => void;
//   setIpUrl: (role: CamRole, url: string | null) => void;
// }

// // ─── Tipos internos da API ────────────────────────────────────────────────────

// interface PhotoResult {
//   session_uuid?: string;
//   photo_seq?: number;
//   photo_count_received?: number;
//   photo_count_required?: number;
//   session_complete?: boolean;
//   face_detected?: boolean;
//   face_recognized?: boolean;
//   face_confidence?: number;
//   face_person_code?: string;
//   person_code?: string;
//   person_name?: string;
//   confidence?: number;
//   // ✅ Campo correto retornado pelo backend Python
//   epi_compliant?: boolean;
//   // Fallback para versões antigas
//   compliant?: boolean;
//   compliance_score?: number;
//   missing?: string[];
//   missing_ppe?: string[];
//   detected?: string[];
//   detected_ppe?: string[];
//   final_decision?: {
//     access_decision: string;
//     epi_compliant: boolean;
//     face_confirmed: boolean;
//     face_confidence_max?: number;
//     person_code?: string;
//     person_name?: string;
//   } | null;
//   daily_exposure?: DailyExposure;
// }

// // ─── Estados por screen/modal ─────────────────────────────────────────────────

// export type FaceScanStep =
//   | "ready"
//   | "capturing"
//   | "processing"
//   | "done"
//   | "error";

// export interface FaceScanState {
//   step: FaceScanStep;
//   captureUrl: string | null;
//   progress: number;
//   statusMsg: string;
//   subMsg: string;
//   countdown: number | null;
// }

// export type EpiScanStep =
//   | "ready"
//   | "capturing"
//   | "processing"
//   | "done"
//   | "error";

// export interface EpiScanState {
//   step: EpiScanStep;
//   captureUrl1: string | null;
//   captureUrl2: string | null;
//   statusMsg: string;
//   countdown: number | null;
//   result: EpiResult | null;
// }

// export interface IdleState {
//   dashboard: DashboardData | null;
//   loadingDash: boolean;
//   refreshDashboard: () => void;
// }

// export interface ConfigState {
//   localConfig: SysConfig;
//   epiConfig: EpiConfig | null;
//   saving: boolean;
//   saved: boolean;
//   setLocalConfig: (cfg: SysConfig) => void;
//   setEpiConfig: (cfg: EpiConfig | null) => void;
//   handleSave: () => Promise<void>;
// }

// export interface PermanenceState {
//   people: WorkerRecord[];
//   loading: boolean;
//   fetchPeople: () => Promise<void>;
// }

// export interface UseCamAutomationReturn {
//   screen: Screen;
//   direction: Direction;
//   doorStatus: DoorStatus;
//   session: Session;
//   sysConfig: SysConfig;
//   showReport: boolean;
//   showConfig: boolean;
//   setShowReport: (v: boolean) => void;
//   setShowConfig: (v: boolean) => void;
//   cameraHook: CameraHook;
//   idleState: IdleState;
//   faceScanState: FaceScanState;
//   epiScanState: EpiScanState;
//   configState: ConfigState;
//   permanenceState: PermanenceState;
//   handleStartEntry: () => void;
//   handleStartExit: () => void;
//   handleGoIdle: () => void;
//   handleTimeOverride: () => void;
//   handleRetryFromDenied: () => void;
//   handleSaveConfig: (newConfig: Partial<SysConfig>) => void;
//   handleCaptureFace: () => Promise<void>;
//   handleRetryFace: () => void;
//   handleCaptureEpi: () => Promise<void>;
//   handleRetryEpi: () => void;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // CONSTANTES
// // ─────────────────────────────────────────────────────────────────────────────

// const LS_KEYS: Record<CamRole, string> = {
//   face: "epi_cam_face",
//   body1: "epi_cam_body1",
//   body2: "epi_cam_body2",
// };

// const LS_KEYS_TYPE: Record<CamRole, string> = {
//   face: "epi_cam_face_type",
//   body1: "epi_cam_body1_type",
//   body2: "epi_cam_body2_type",
// };

// const LS_KEYS_URL: Record<CamRole, string> = {
//   face: "epi_cam_face_url",
//   body1: "epi_cam_body1_url",
//   body2: "epi_cam_body2_url",
// };

// const EMPTY_SESSION: Session = {
//   sessionUuid: null,
//   person: null,
//   dailyExposure: null,
//   epiResult: null,
//   missingEpi: [],
//   deniedReason: null,
// };

// const DEFAULT_CONFIG: SysConfig = {
//   companyId: 1,
//   zoneId: 10,
//   doorId: "DOOR_CAMARA_FRIA_01",
//   dailyLimitMin: 120,
//   overLimitPolicy: "warn",
//   doorOpenMaxMin: 15,
//   faceConfidenceMin: 70,
//   apiBase: "https://aihub.smartxhub.cloud",
//   useSingleCamera: false,
//   cameraSourceType: {
//     face: "local",
//     body1: "local",
//     body2: "local",
//   },
//   cameraIpUrl: {
//     face: null,
//     body1: null,
//     body2: null,
//   },
//   // ─── Fechadura ESP32 ───────────────────────────────────────────────────────
//   lockIpAddress: "192.168.68.100",
//   lockDurationMs: 5000,
// };

// const EPI_LABELS_PT: Record<string, string> = {
//   helmet: "Capacete",
//   vest: "Colete",
//   gloves: "Luvas",
//   boots: "Botas",
//   thermal_coat: "Jaqueta Térmica",
//   thermal_pants: "Calça Térmica",
//   glasses: "Óculos de Proteção",
//   mask: "Máscara",
//   apron: "Avental",
//   hardhat: "Capacete",
// };

// const epiLabel = (k: string) => EPI_LABELS_PT[k] ?? k;

// // ─────────────────────────────────────────────────────────────────────────────
// // HELPER: captura de frame de câmera IP via URL
// // ─────────────────────────────────────────────────────────────────────────────

// async function captureFrameFromUrl(url: string): Promise<Blob> {
//   // Usa proxy do backend para evitar CORS
//   const proxyUrl = `${getApiBaseUrl()}/api/v1/epi/camera/snapshot/v4?url=${encodeURIComponent(url)}`;
//   const response = await fetch(proxyUrl);
//   if (!response.ok) {
//     throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//   }
//   return response.blob();
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HELPER: resolve campo compliant de qualquer formato de resposta do backend
// //
// // O backend Python retorna "epi_compliant" (snake_case com prefixo).
// // Versões antigas podem retornar "compliant" ou via "final_decision.epi_compliant".
// // Esta função garante que todos os casos são cobertos.
// // ─────────────────────────────────────────────────────────────────────────────

// function resolveCompliant(photo: PhotoResult): boolean {
//   return (
//     photo.epi_compliant ??
//     photo.final_decision?.epi_compliant ??
//     photo.compliant ??
//     false
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HOOK DE CÂMERAS (interno)
// // ─────────────────────────────────────────────────────────────────────────────
// //@ts-ignore
// function useCameraInternal(sysConfig: SysConfig): CameraHook {
//   const [devices, setDevices] = useState<CamDevice[]>([]);
//   const [assignments, setAssignments] = useState<Record<CamRole, string | null>>({
//     face: localStorage.getItem(LS_KEYS.face) || null,
//     body1: localStorage.getItem(LS_KEYS.body1) || null,
//     body2: localStorage.getItem(LS_KEYS.body2) || null,
//   });

//   const [sourceTypes, setSourceTypes] = useState<Record<CamRole, CameraSourceType>>({
//     face: (localStorage.getItem(LS_KEYS_TYPE.face) as CameraSourceType) || "local",
//     body1: (localStorage.getItem(LS_KEYS_TYPE.body1) as CameraSourceType) || "local",
//     body2: (localStorage.getItem(LS_KEYS_TYPE.body2) as CameraSourceType) || "local",
//   });

//   const [ipUrls, setIpUrls] = useState<Record<CamRole, string | null>>({
//     face: localStorage.getItem(LS_KEYS_URL.face) || null,
//     body1: localStorage.getItem(LS_KEYS_URL.body1) || null,
//     body2: localStorage.getItem(LS_KEYS_URL.body2) || null,
//   });

//   const [streams, setStreams] = useState<Partial<Record<CamRole, MediaStream>>>({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const videoRefs = useRef<Partial<Record<CamRole, HTMLVideoElement | null>>>({});

//   const enumerateDevices = useCallback(async (): Promise<CamDevice[]> => {
//     try {
//       await navigator.mediaDevices
//         .getUserMedia({ video: true, audio: false })
//         .then((s) => s.getTracks().forEach((t) => t.stop()))
//         .catch(() => {});
//       const all = await navigator.mediaDevices.enumerateDevices();
//       const vids = all.filter((d) => d.kind === "videoinput") as CamDevice[];
//       setDevices(vids);
//       setAssignments((prev) => {
//         const next = { ...prev };
//         if (!next.face && vids[0]) next.face = vids[0].deviceId;
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

//   const startStream = useCallback(
//     async (role: CamRole): Promise<MediaStream | null> => {
//       const sourceType = sourceTypes[role];
//       if (sourceType === "ip_url") return null;

//       const deviceId = assignments[role];
//       if (!deviceId) return null;
//       streams[role]?.getTracks().forEach((t) => t.stop());
//       try {
//         setLoading(true);
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: {
//             deviceId: { exact: deviceId },
//             width: { ideal: 1280 },
//             height: { ideal: 720 },
//             frameRate: { ideal: 30 },
//             //@ts-ignore
//             zoom: 1.0,
//           },
//           audio: false,
//         });
//         setStreams((prev) => ({ ...prev, [role]: stream }));
//         const ref = videoRefs.current[role];
//         if (ref) ref.srcObject = stream;
//         return stream;
//       } catch (e) {
//         setError(e instanceof Error ? e.message : String(e));
//         return null;
//       } finally {
//         setLoading(false);
//       }
//     },
//     [assignments, sourceTypes, streams],
//   );

//   const stopStream = useCallback(
//     (role: CamRole) => {
//       streams[role]?.getTracks().forEach((t) => t.stop());
//       setStreams((prev) => {
//         const n = { ...prev };
//         delete n[role];
//         return n;
//       });
//       const ref = videoRefs.current[role];
//       if (ref) ref.srcObject = null;
//     },
//     [streams],
//   );

//   const stopAllStreams = useCallback(() => {
//     Object.values(streams).forEach((s) => s?.getTracks().forEach((t) => t.stop()));
//     setStreams({});
//     Object.values(videoRefs.current).forEach((v) => {
//       if (v) v.srcObject = null;
//     });
//   }, [streams]);

//   const captureFrame = useCallback(
//     async (role: CamRole) => {
//       const sourceType = sourceTypes[role];

//       if (sourceType === "ip_url") {
//         const url = ipUrls[role];
//         if (!url) throw new Error(`URL não configurada para câmera ${role}`);
//         const blob = await captureFrameFromUrl(url);
//         const dataUrl = URL.createObjectURL(blob);
//         const canvas = document.createElement("canvas");
//         return { blob, dataUrl, canvas };
//       }

//       const video = videoRefs.current[role];
//       if (!video || video.readyState < 2)
//         throw new Error(`Câmera "${role}" não está pronta.`);
//       const canvas = document.createElement("canvas");
//       canvas.width = video.videoWidth || 1280;
//       canvas.height = video.videoHeight || 720;
//       canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
//       const blob = await canvasToBlob(canvas, 0.88);
//       const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
//       return { blob, dataUrl, canvas };
//     },
//     [sourceTypes, ipUrls],
//   );

//   const assignDevice = useCallback((role: CamRole, deviceId: string | null) => {
//     setAssignments((prev) => ({ ...prev, [role]: deviceId }));
//     localStorage.setItem(LS_KEYS[role], deviceId || "");
//   }, []);

//   const setVideoRef = useCallback(
//     (role: CamRole, element: HTMLVideoElement | null) => {
//       videoRefs.current[role] = element;
//       if (element && streams[role]) element.srcObject = streams[role]!;
//     },
//     [streams],
//   );

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
//     navigator.mediaDevices.addEventListener("devicechange", handler);
//     return () => {
//       navigator.mediaDevices.removeEventListener("devicechange", handler);
//       stopAllStreams();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return {
//     devices,
//     assignments,
//     streams,
//     loading,
//     error,
//     enumerateDevices,
//     startStream,
//     stopStream,
//     stopAllStreams,
//     captureFrame,
//     assignDevice,
//     setVideoRef,
//     hasStream: (role) => !!streams[role],
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
//   const [screen, setScreen] = useState<Screen>("idle");
//   const [direction, setDirection] = useState<Direction>("ENTRY");
//   const [doorStatus, setDoorStatus] = useState<DoorStatus>("closed");
//   const [session, setSession] = useState<Session>(EMPTY_SESSION);
//   const [sysConfig, setSysConfig] = useState<SysConfig>(DEFAULT_CONFIG);
//   const [showReport, setShowReport] = useState(false);
//   const [showConfig, setShowConfig] = useState(false);

//   const cameraHook = useCameraInternal(sysConfig);

//   const [dashboard, setDashboard] = useState<DashboardData | null>(null);
//   const [loadingDash, setLoadingDash] = useState(true);

//   const [faceStep, setFaceStep] = useState<FaceScanStep>("ready");
//   const [faceCaptureUrl, setFaceCaptureUrl] = useState<string | null>(null);
//   const [faceProgress, setFaceProgress] = useState(0);
//   const [faceStatusMsg, setFaceStatusMsg] = useState(
//     "Posicione seu rosto na câmera e toque em Capturar",
//   );
//   const [faceSubMsg, setFaceSubMsg] = useState("");
//   const [faceCountdown, setFaceCountdown] = useState<number | null>(null);
//   const faceAutoCapture = useRef(false);

//   const [epiStep, setEpiStep] = useState<EpiScanStep>("ready");
//   const [epiCaptureUrl1, setEpiCaptureUrl1] = useState<string | null>(null);
//   const [epiCaptureUrl2, setEpiCaptureUrl2] = useState<string | null>(null);
//   const [epiStatusMsg, setEpiStatusMsg] = useState(
//     "Posicione-se em frente às câmeras de corpo",
//   );
//   const [epiCountdown, setEpiCountdown] = useState<number | null>(null);
//   const [epiResult, setEpiResult] = useState<EpiResult | null>(null);
//   const epiAutoCapture = useRef(false);

//   // Mantém session em ref para evitar stale closure em callbacks async
//   const sessionRef = useRef<Session>(EMPTY_SESSION);

//   // Guard para evitar double-trigger do unlock (StrictMode, re-renders)
//   const unlockFiredRef = useRef(false);

//   const [localConfig, setLocalConfig] = useState<SysConfig>(DEFAULT_CONFIG);
//   const [epiConfig, setEpiConfig] = useState<EpiConfig | null>(null);
//   const [saving, setSaving] = useState(false);
//   const [saved, setSaved] = useState(false);

//   const [people, setPeople] = useState<WorkerRecord[]>([]);
//   const [loadingPeople, setLoadingPeople] = useState(false);

//   // ─── Sync session → sessionRef ────────────────────────────────────────────

//   useEffect(() => {
//     sessionRef.current = session;
//   }, [session]);

//   // ─── Helpers de reset ─────────────────────────────────────────────────────

//   const resetSession = useCallback(() => setSession(EMPTY_SESSION), []);

//   const resetFaceScan = useCallback((withAutoCapture = false) => {
//     faceAutoCapture.current = withAutoCapture;
//     setFaceStep("ready");
//     setFaceCaptureUrl(null);
//     setFaceProgress(0);
//     setFaceStatusMsg("Posicione seu rosto na câmera e toque em Capturar");
//     setFaceSubMsg("");
//     setFaceCountdown(null);
//   }, []);

//   const resetEpiScan = useCallback((withAutoCapture = false) => {
//     epiAutoCapture.current = withAutoCapture;
//     setEpiStep("ready");
//     setEpiCaptureUrl1(null);
//     setEpiCaptureUrl2(null);
//     setEpiStatusMsg("Posicione-se em frente às câmeras de corpo");
//     setEpiCountdown(null);
//     setEpiResult(null);
//   }, []);

//   // ─── Config inicial ───────────────────────────────────────────────────────

//   useEffect(() => {
//     api
//       .getLocalConfig()
//       .then((cfg) => {
//         setSysConfig((prev) => ({ ...prev, ...cfg }));
//         setLocalConfig((prev) => ({ ...prev, ...cfg }));
//       })
//       .catch((e: Error) =>
//         console.warn("[useCamAutomation] Config load failed:", e.message),
//       );
//   }, []);

//   // ─── Dashboard polling ────────────────────────────────────────────────────

//   const refreshDashboard = useCallback(async () => {
//     try {
//       const data = await api.getDashboard();
//       setDashboard(data);
//     } catch (e) {
//       console.warn("[useCamAutomation] Dashboard failed:", e);
//     } finally {
//       setLoadingDash(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (screen !== "idle") return;
//     refreshDashboard();
//     const t = setInterval(refreshDashboard, 30000);
//     return () => clearInterval(t);
//   }, [screen, refreshDashboard]);

//   // ─── Config modal ─────────────────────────────────────────────────────────

//   useEffect(() => {
//     if (!showConfig) return;
//     setLocalConfig({ ...sysConfig });
//     api.getEpiConfig().then(setEpiConfig).catch(console.warn);
//   }, [showConfig, sysConfig]);

//   // ─── People (relatório) ───────────────────────────────────────────────────

//   const fetchPeople = useCallback(async () => {
//     try {
//       setLoadingPeople(true);
//       const data = await api.getPeople(false);
//       const list =
//         (data as { people?: WorkerRecord[] }).people ??
//         (data as WorkerRecord[]) ??
//         [];
//       setPeople(list);
//     } catch (e) {
//       console.error("[useCamAutomation] fetchPeople failed:", e);
//     } finally {
//       setLoadingPeople(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (showReport) fetchPeople();
//   }, [showReport, fetchPeople]);

//   // ─────────────────────────────────────────────────────────────────────────
//   // ✅ UNLOCK DA PORTA — disparado ao entrar na tela access_granted
//   //
//   // Fluxo correto:
//   //   handleCaptureEpi() → compliant=true → setScreen("access_granted")
//   //                                              ↓
//   //                               este effect detecta a mudança de tela
//   //                                              ↓
//   //                               POST http://<lockIp>/unlock (ESP32)
//   //                                              ↓
//   //                               setDoorStatus("open") ou "alert"
//   //
//   // Isso garante que a porta só abre APÓS navegar para a tela de sucesso,
//   // e não durante o processamento do EPI scan.
//   // ─────────────────────────────────────────────────────────────────────────

//   useEffect(() => {
//     // Reseta o guard ao sair da tela de acesso liberado
//     if (screen !== "access_granted") {
//       unlockFiredRef.current = false;
//       return;
//     }

//     // Evita double-trigger (React StrictMode monta effects duas vezes em dev)
//     if (unlockFiredRef.current) return;
//     unlockFiredRef.current = true;

//     const lockIp = sysConfig.lockIpAddress;
//     const lockMs = sysConfig.lockDurationMs;

//     console.log(`[unlock] Tela access_granted — acionando ESP32 em http://${lockIp}/unlock`);

//     // 1. Aciona a fechadura física ESP32
//     api
//       .unlockDoor(lockIp, lockMs)
//       .then(() => {
//         setDoorStatus("open");
//         console.log("[unlock] ✅ Porta aberta");
//       })
//       .catch((e) => {
//         console.error("[unlock] ❌ Falha ao acionar ESP32:", e);
//         // Validação ok mas fechadura falhou → alerta visual no TopBar
//         setDoorStatus("alert");
//       });

//     // 2. Log de auditoria no backend Python (fire-and-forget, não crítico)
//     api
//       .openDoor({
//         personCode: sessionRef.current.person?.personCode,
//         personName: sessionRef.current.person?.personName,
//         sessionUuid: sessionRef.current.sessionUuid,
//         reason: "EPI_COMPLIANT",
//       })
//       .catch((e) => console.warn("[unlock] Backend audit log falhou:", e));

//   }, [screen, sysConfig.lockIpAddress, sysConfig.lockDurationMs]);

//   // ─── Auto-capture: face ───────────────────────────────────────────────────

//   useEffect(() => {
//     if (screen !== "face_scan" || !faceAutoCapture.current || faceStep !== "ready")
//       return;
//     let n = 3;
//     setFaceCountdown(n);
//     const t = setInterval(() => {
//       n -= 1;
//       if (n <= 0) {
//         clearInterval(t);
//         setFaceCountdown(null);
//         handleCaptureFace();
//       } else setFaceCountdown(n);
//     }, 1000);
//     return () => {
//       clearInterval(t);
//       setFaceCountdown(null);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [screen, faceStep]);

//   // ─── Auto-capture: EPI ───────────────────────────────────────────────────

//   useEffect(() => {
//     if (screen !== "epi_scan" || !epiAutoCapture.current || epiStep !== "ready")
//       return;
//     let n = 4;
//     setEpiCountdown(n);
//     const t = setInterval(() => {
//       n -= 1;
//       if (n <= 0) {
//         clearInterval(t);
//         setEpiCountdown(null);
//         handleCaptureEpi();
//       } else setEpiCountdown(n);
//     }, 1000);
//     return () => {
//       clearInterval(t);
//       setEpiCountdown(null);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [screen, epiStep]);

//   // ─── Navegação ────────────────────────────────────────────────────────────

//   const handleStartEntry = useCallback(() => {
//     setDirection("ENTRY");
//     resetSession();
//     resetFaceScan(true);
//     cameraHook.startStream("face");
//     setScreen("face_scan");
//   }, [resetSession, resetFaceScan, cameraHook]);

//   const handleStartExit = useCallback(() => {
//     setDirection("EXIT");
//     resetSession();
//     resetFaceScan(true);
//     cameraHook.startStream("face");
//     setScreen("face_scan");
//   }, [resetSession, resetFaceScan, cameraHook]);

//   const handleGoIdle = useCallback(() => {
//     cameraHook.stopAllStreams();
//     resetSession();
//     resetFaceScan(false);
//     resetEpiScan(false);
//     setDoorStatus("closed");
//     setScreen("idle");
//   }, [cameraHook, resetSession, resetFaceScan, resetEpiScan]);

//   const handleTimeOverride = useCallback(() => {
//     resetEpiScan(true);
//     if (!sysConfig.useSingleCamera) {
//       cameraHook.startStream("body1");
//       if (cameraHook.getAssignment("body2")) cameraHook.startStream("body2");
//     }
//     setScreen("epi_scan");
//   }, [cameraHook, resetEpiScan, sysConfig.useSingleCamera]);

//   const handleRetryFromDenied = useCallback(() => {
//     setSession((prev) => ({
//       ...prev,
//       epiResult: null,
//       missingEpi: [],
//       deniedReason: null,
//     }));
//     resetEpiScan(false);
//     setScreen("epi_scan");
//   }, [resetEpiScan]);

//   const handleSaveConfig = useCallback((newConfig: Partial<SysConfig>) => {
//     setSysConfig((prev) => ({ ...prev, ...newConfig }));
//   }, []);

//   // ─── ACTION: Captura facial ───────────────────────────────────────────────

//   const handleCaptureFace = useCallback(async () => {
//     if (faceStep !== "ready") return;
//     faceAutoCapture.current = false;

//     try {
//       setFaceStep("capturing");
//       setFaceStatusMsg("Capturando frame…");

//       const { blob, dataUrl } = await cameraHook.captureFrame("face");
//       setFaceCaptureUrl(dataUrl);

//       setFaceStep("processing");
//       setFaceStatusMsg("Iniciando sessão de validação…");
//       setFaceProgress(20);

//       const sessionData = await api.startValidationSession({
//         direction,
//         door_id: sysConfig.doorId,
//         zone_id: sysConfig.zoneId,
//       });
//       const uuid = sessionData.session_uuid || sessionData.sessionUuid!;
//       setFaceProgress(40);

//       setFaceStatusMsg("Reconhecendo rosto…");
//       const photo = await api.sendValidationPhoto(uuid, blob, {
//         photoType: "face",
//         cameraId: 1,
//       });
//       setFaceProgress(80);

//       const resolvedCode = (
//         photo.face_person_code ||
//         photo.person_code ||
//         photo.final_decision?.person_code ||
//         ""
//       ).trim();

//       const resolvedName = (
//         photo.person_name ||
//         photo.final_decision?.person_name ||
//         ""
//       ).trim();

//       if (resolvedCode && resolvedName) {
//         setFaceProgress(100);
//         setFaceStep("done");

//         const resolvedConf =
//           photo.face_confidence ||
//           photo.confidence ||
//           photo.final_decision?.face_confidence_max ||
//           0;

//         setFaceStatusMsg(`Identificado: ${resolvedName}`);
//         setFaceSubMsg(`Confiança: ${Math.round(resolvedConf * 100)}%`);

//         const person: Person = {
//           personCode: resolvedCode,
//           personName: resolvedName,
//           confidence: resolvedConf,
//         };
//         setSession((prev) => ({
//           ...prev,
//           sessionUuid: uuid,
//           person,
//           dailyExposure: photo.daily_exposure ?? null,
//         }));

//         setTimeout(() => {
//           if (direction === "EXIT") {
//             setScreen("idle");
//             return;
//           }

//           const totalMin = photo.daily_exposure?.total_minutes ?? 0;
//           const limitMin =
//             photo.daily_exposure?.limit_minutes ?? sysConfig.dailyLimitMin;

//           if (totalMin >= limitMin) {
//             setScreen("time_alert");
//           } else {
//             resetEpiScan(true);
//             cameraHook.startStream("body1");
//             if (cameraHook.getAssignment("body2"))
//               cameraHook.startStream("body2");
//             setScreen("epi_scan");
//           }
//         }, 900);
//       } else {
//         setFaceStep("error");
//         setFaceStatusMsg("Rosto não reconhecido");
//         setFaceSubMsg("Usuário não encontrado — solicite acesso manual");
//         setFaceProgress(0);
//         setSession((prev) => ({
//           ...prev,
//           person: null,
//           deniedReason: "user_not_found",
//         }));
//       }
//     } catch (e) {
//       const err = e as {
//         response?: { data?: { detail?: string } };
//         message?: string;
//       };
//       setFaceStep("error");
//       setFaceStatusMsg("Erro ao processar");
//       setFaceSubMsg(err.response?.data?.detail || err.message || "");
//       setFaceProgress(0);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [faceStep, cameraHook, direction, sysConfig, resetEpiScan]);

//   const handleRetryFace = useCallback(
//     () => resetFaceScan(false),
//     [resetFaceScan],
//   );

//   // ─── ACTION: Captura EPI ──────────────────────────────────────────────────

//   const handleCaptureEpi = useCallback(async () => {
//     if (epiStep !== "ready") return;
//     epiAutoCapture.current = false;

//     // BLOQUEIO DUPLO: pessoa não identificada → acesso negado imediato, sem câmera EPI
//     // Usa sessionRef para evitar stale closure quando chamado pelo auto-capture
//     const personCode = sessionRef.current.person?.personCode?.trim();
//     const personName = sessionRef.current.person?.personName?.trim();
//     if (!personCode || !personName) {
//       console.warn("[EPI] Pessoa não identificada — acesso negado sem leitura EPI");
//       epiAutoCapture.current = false;
//       setEpiStep("error");
//       setEpiStatusMsg("❌ Usuário não encontrado — Acesso negado");
//       setDoorStatus("closed");
//       setSession((prev) => ({
//         ...prev,
//         missingEpi: [],
//         deniedReason: "user_not_found",
//         epiResult: { compliant: false },
//       }));
//       setTimeout(() => setScreen("access_denied"), 1500);
//       return;
//     }

//     const hasBody2 =
//       !sysConfig.useSingleCamera && !!cameraHook.getAssignment("body2");

//     try {
//       setEpiStep("capturing");
//       setEpiStatusMsg("Capturando frames…");

//       const captureRole: CamRole = sysConfig.useSingleCamera ? "face" : "body1";
//       const { blob: blob1, dataUrl: url1 } =
//         await cameraHook.captureFrame(captureRole);
//       setEpiCaptureUrl1(url1);

//       let blob2: Blob | null = null;
//       if (hasBody2) {
//         try {
//           const f2 = await cameraHook.captureFrame("body2");
//           setEpiCaptureUrl2(f2.dataUrl);
//           blob2 = f2.blob;
//         } catch (e2) {
//           console.warn("[EPI] Body2 capture failed:", (e2 as Error).message);
//         }
//       }

//       setEpiStep("processing");
//       setEpiStatusMsg("Detectando EPIs… aguarde");

//       const epiSessionData = await api.startValidationSession({
//         direction,
//         door_id: sysConfig.doorId,
//         zone_id: sysConfig.zoneId,
//       });
//       const epiSessionUuid =
//         epiSessionData.session_uuid || epiSessionData.sessionUuid!;

//       const photo1 = await api.sendValidationPhoto(epiSessionUuid, blob1, {
//         photoType: "body",
//         cameraId: 2,
//       });

//       // ✅ CORREÇÃO 1: usa resolveCompliant() que lê epi_compliant primeiro.
//       // O backend retorna "epi_compliant", não "compliant".
//       let finalResult: EpiResult = {
//         ...photo1,
//         compliant: resolveCompliant(photo1),
//       };

//       console.log(`[EPI] photo1 — epi_compliant: ${photo1.epi_compliant}, compliant: ${photo1.compliant}, resolved: ${finalResult.compliant}`);

//       if (blob2) {
//         try {
//           const photo2 = await api.sendValidationPhoto(epiSessionUuid, blob2, {
//             photoType: "body",
//             cameraId: 3,
//           });
//           // ✅ CORREÇÃO 2: mesma lógica para photo2
//           const photo2Compliant = resolveCompliant(photo2);
//           if (!photo2Compliant) {
//             finalResult = { ...photo2, compliant: photo2Compliant };
//           }
//         } catch (e3) {
//           console.warn("[EPI] Body2 send failed:", (e3 as Error).message);
//         }
//       }

//       try {
//         await api.closeValidationSession(epiSessionUuid);
//       } catch (_) {
//         // ignorado
//       }

//       setEpiResult(finalResult);
//       setEpiStep("done");
//       setSession((prev) => ({
//         ...prev,
//         epiResult: finalResult,
//         sessionUuid: epiSessionUuid, // atualiza com uuid da sessão EPI para o audit log
//         deniedReason: null,
//       }));

//       console.log(`[EPI] Resultado final — compliant: ${finalResult.compliant}`);

//       if (finalResult.compliant) {
//         // ─────────────────────────────────────────────────────────────────
//         // ✅ ACESSO LIBERADO — apenas navega para a tela.
//         //
//         // O unlock da fechadura ESP32 é disparado pelo useEffect que observa
//         // screen === "access_granted", NÃO aqui.
//         //
//         // Isso garante:
//         //   1. A tela de sucesso é exibida primeiro
//         //   2. O unlock é chamado uma única vez (unlockFiredRef guard)
//         //   3. Falha no unlock não impede exibir a tela de sucesso
//         // ─────────────────────────────────────────────────────────────────
//         setEpiStatusMsg("✅ EPI Completo — Acesso liberado");
//         setTimeout(() => setScreen("access_granted"), 1200);
//       } else {
//         // ─── ACESSO NEGADO — EPI incompleto ───────────────────────────────
//         setEpiStatusMsg("❌ EPI Incompleto — Acesso negado");
//         const missing = (
//           finalResult.missing ||
//           finalResult.missing_ppe ||
//           []
//         ).map(epiLabel);
//         setSession((prev) => ({
//           ...prev,
//           missingEpi: missing,
//           deniedReason: "epi_incomplete",
//         }));
//         setDoorStatus("closed");
//         setTimeout(() => setScreen("access_denied"), 1200);
//       }
//     } catch (e) {
//       console.error("[useCamAutomation] EPI capture failed:", e);
//       setEpiStep("error");
//       const errorMsg =
//         (e as any)?.response?.data?.detail ||
//         (e as Error)?.message ||
//         "Erro desconhecido";
//       setEpiStatusMsg(`Erro na detecção de EPI: ${errorMsg}`);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
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
//       console.error("[useCamAutomation] saveConfig failed:", e);
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
//       step: faceStep,
//       captureUrl: faceCaptureUrl,
//       progress: faceProgress,
//       statusMsg: faceStatusMsg,
//       subMsg: faceSubMsg,
//       countdown: faceCountdown,
//     },

//     epiScanState: {
//       step: epiStep,
//       captureUrl1: epiCaptureUrl1,
//       captureUrl2: epiCaptureUrl2,
//       statusMsg: epiStatusMsg,
//       countdown: epiCountdown,
//       result: epiResult,
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

// import { useState, useEffect, useCallback, useRef } from "react";
// import axios from "axios";

// // ─────────────────────────────────────────────────────────────────────────────
// // API LAYER (interno ao hook — nenhum screen/component precisa importar)
// // ─────────────────────────────────────────────────────────────────────────────

// const getApiBaseUrl = (): string => {
//   const saved = sessionStorage.getItem("apiEndpoint");
//   return saved ?? "https://aihub.smartxhub.cloud";
// };

// const makeHttp = () =>
//   axios.create({ baseURL: getApiBaseUrl(), timeout: 60000 });

// const EPI = "https://aihub.smartxhub.cloud/api/v1/epi";

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

//   getPeople: async (
//     activeOnly = false,
//   ): Promise<{ people?: WorkerRecord[] } | WorkerRecord[]> => {
//     const { data } = await makeHttp().get(`${EPI}/analytics/people`, {
//       params: { active_only: activeOnly },
//     });
//     return data;
//   },

//   getEpiConfig: async (): Promise<EpiConfig> => {
//     const { data } = await makeHttp().get(`${EPI}/config`);
//     return {
//       required_ppe: data.config?.required_ppe ?? [],
//       available_classes: data.all_classes
//         ? (Object.values(data.all_classes) as string[])
//         : [],
//       config: data.config,
//     };
//   },

//   saveEpiConfig: async (config: { required_ppe: string[] }): Promise<void> => {
//     await makeHttp().post(`${EPI}/config`, config);
//   },

//   startValidationSession: async (
//     overrides: Record<string, unknown> = {},
//   ): Promise<{ session_uuid: string; sessionUuid?: string }> => {
//     const form = new FormData();
//     form.append("door_id", String(overrides.door_id ?? "DOOR_01"));
//     form.append("direction", String(overrides.direction ?? "ENTRY"));
//     form.append("zone_id", String(overrides.zone_id ?? ""));
//     form.append("compliance_mode", "majority");
//     form.append("photo_count_required", "1");
//     form.append("timeout_seconds", "30");
//     const { data } = await makeHttp().post(`${EPI}/validation/start`, form);
//     return data;
//   },

//   sendValidationPhoto: async (
//     sessionUuid: string,
//     frameBlob: Blob,
//     opts: { photoType?: string; cameraId?: number } = {},
//   ): Promise<PhotoResult> => {
//     const form = new FormData();
//     form.append("session_uuid", sessionUuid);
//     form.append("file", frameBlob, "frame.jpg");
//     if (opts.cameraId !== undefined)
//       form.append("camera_id", String(opts.cameraId));
//     if (opts.photoType) form.append("photo_type", opts.photoType);

//     const endpoint = `${EPI}/validation/photo`;
//     const { data } = await makeHttp().post(endpoint, form, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return data;
//   },

//   closeValidationSession: async (sessionUuid: string, personCode?: string): Promise<void> => {
//     const form = new FormData();
//     form.append("session_uuid", sessionUuid);
//     // Envia person_code para o backend registrar entrada/saída em vision_people
//     if (personCode) form.append("person_code_override", personCode);
//     await makeHttp().post(`${EPI}/validation/close`, form);
//   },

//   // ─── Log no backend Python (auditoria) — não controla a fechadura ────────
//   openDoor: async (payload: {
//     personCode?: string;
//     personName?: string;
//     sessionUuid?: string | null;
//     reason: string;
//   }): Promise<void> => {
//     try {
//       const form = new FormData();
//       if (payload.personCode) form.append("person_code", payload.personCode);
//       if (payload.personName) form.append("person_name", payload.personName);
//       if (payload.sessionUuid) form.append("session_uuid", payload.sessionUuid);
//       form.append("reason", payload.reason);
//       await makeHttp().post(`${EPI}/door/open`, form);
//     } catch (e) {
//       console.warn("[openDoor] endpoint não disponível:", e);
//     }
//   },

//   // ─── Chama o ESP32 diretamente via HTTP REST para destrancar ─────────────
//   // POST http://<ip>/unlock  body: { duration_ms: number }
//   // Resposta esperada: { ok: true, message: "Aberta", state: "unlocked", duration_ms: 5000 }
//   unlockDoor: async (lockIp: string, durationMs = 5000): Promise<void> => {
//     console.log(
//       `[unlockDoor] POST http://${lockIp}/unlock { duration_ms: ${durationMs} }`,
//     );

//     const res = await fetch(`http://${lockIp}/unlock`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ duration_ms: durationMs }),
//     });

//     if (!res.ok) {
//       throw new Error(`ESP32 HTTP ${res.status}: ${res.statusText}`);
//     }

//     const data = await res.json();

//     if (!data.ok) {
//       throw new Error(`ESP32 recusou o unlock: ${JSON.stringify(data)}`);
//     }

//     console.log(
//       `[unlockDoor] ✅ ESP32 destrancado — state: ${data.state}, duration: ${data.duration_ms}ms`,
//     );
//   },
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function canvasToBlob(
//   canvas: HTMLCanvasElement,
//   quality = 0.88,
// ): Promise<Blob> {
//   return new Promise((resolve) =>
//     canvas.toBlob((b) => resolve(b!), "image/jpeg", quality),
//   );
// }

// export function formatMinutes(mins: number | null | undefined): string {
//   if (mins == null) return "—";
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
//   | "idle"
//   | "face_scan"
//   | "time_alert"
//   | "epi_scan"
//   | "access_granted"
//   | "access_denied";

// export type Direction = "ENTRY" | "EXIT";
// export type DoorStatus = "closed" | "open" | "alert" | "waiting";
// export type CamRole = "face" | "body1" | "body2";
// export type CameraSourceType = "local" | "ip_url";

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
//   total_minutes: number;
//   limit_minutes: number;
//   entries_today?: number;
// }

// export interface EpiResult {
//   compliant: boolean;
//   detected?: string[];
//   detected_ppe?: string[];
//   missing?: string[];
//   missing_ppe?: string[];
// }

// export interface Session {
//   sessionUuid: string | null;
//   person: Person | null;
//   dailyExposure: DailyExposure | null;
//   epiResult: EpiResult | null;
//   missingEpi: string[];
//   deniedReason?: "user_not_found" | "epi_incomplete" | null;
// }

// export interface SysConfig {
//   companyId: number;
//   zoneId: number;
//   doorId: string;
//   dailyLimitMin: number;
//   overLimitPolicy: "warn" | "block";
//   doorOpenMaxMin: number;
//   faceConfidenceMin: number;
//   apiBase: string;
//   useSingleCamera: boolean;
//   cameraSourceType: Record<CamRole, CameraSourceType>;
//   cameraIpUrl: Record<CamRole, string | null>;
//   // ─── Fechadura ESP32 (MIXHUB IoT) ─────────────────────────────────────────
//   lockIpAddress: string;
//   lockDurationMs: number;
// }

// export interface EpiConfig {
//   required_ppe: string[];
//   available_classes?: string[];
//   config?: Record<string, unknown>;
// }

// export interface DashboardData {
//   inside_count?: number;
//   people_inside?: number;
//   entries_today?: number;
//   today?: { total?: number };
//   open_alerts?: number;
//   alerts_open?: number;
//   over_limit_count?: number;
// }

// export interface WorkerRecord {
//   person_code: string;
//   person_name: string;
//   department?: string;
//   is_inside?: boolean;
//   daily_accumulated_min?: number;
//   total_minutes?: number;
//   total_entries?: number;
//   sessions_today?: number;
// }

// export interface CamDevice {
//   deviceId: string;
//   label: string;
//   kind: string;
// }

// export interface CameraHook {
//   devices: CamDevice[];
//   assignments: Record<CamRole, string | null>;
//   streams: Partial<Record<CamRole, MediaStream>>;
//   loading: boolean;
//   error: string | null;
//   enumerateDevices: () => Promise<CamDevice[]>;
//   startStream: (role: CamRole) => Promise<MediaStream | null>;
//   stopStream: (role: CamRole) => void;
//   stopAllStreams: () => void;
//   captureFrame: (
//     role: CamRole,
//   ) => Promise<{ blob: Blob; dataUrl: string; canvas: HTMLCanvasElement }>;
//   assignDevice: (role: CamRole, deviceId: string | null) => void;
//   setVideoRef: (role: CamRole, element: HTMLVideoElement | null) => void;
//   hasStream: (role: CamRole) => boolean;
//   getAssignment: (role: CamRole) => string | null;
//   sourceTypes: Record<CamRole, CameraSourceType>;
//   ipUrls: Record<CamRole, string | null>;
//   setSourceType: (role: CamRole, type: CameraSourceType) => void;
//   setIpUrl: (role: CamRole, url: string | null) => void;
// }

// // ─── Tipos internos da API ────────────────────────────────────────────────────

// interface PhotoResult {
//   session_uuid?: string;
//   photo_seq?: number;
//   photo_count_received?: number;
//   photo_count_required?: number;
//   session_complete?: boolean;
//   face_detected?: boolean;
//   face_recognized?: boolean;
//   face_confidence?: number;
//   face_person_code?: string;
//   person_code?: string;
//   person_name?: string;
//   confidence?: number;
//   // ✅ Campo correto retornado pelo backend Python
//   epi_compliant?: boolean;
//   // Fallback para versões antigas
//   compliant?: boolean;
//   compliance_score?: number;
//   missing?: string[];
//   missing_ppe?: string[];
//   detected?: string[];
//   detected_ppe?: string[];
//   final_decision?: {
//     access_decision: string;
//     epi_compliant: boolean;
//     face_confirmed: boolean;
//     face_confidence_max?: number;
//     person_code?: string;
//     person_name?: string;
//   } | null;
//   daily_exposure?: DailyExposure;
// }

// // ─── Estados por screen/modal ─────────────────────────────────────────────────

// export type FaceScanStep =
//   | "ready"
//   | "capturing"
//   | "processing"
//   | "done"
//   | "error";

// export interface FaceScanState {
//   step: FaceScanStep;
//   captureUrl: string | null;
//   progress: number;
//   statusMsg: string;
//   subMsg: string;
//   countdown: number | null;
// }

// export type EpiScanStep =
//   | "ready"
//   | "capturing"
//   | "processing"
//   | "done"
//   | "error";

// export interface EpiScanState {
//   step: EpiScanStep;
//   captureUrl1: string | null;
//   captureUrl2: string | null;
//   statusMsg: string;
//   countdown: number | null;
//   result: EpiResult | null;
// }

// export interface IdleState {
//   dashboard: DashboardData | null;
//   loadingDash: boolean;
//   refreshDashboard: () => void;
// }

// export interface ConfigState {
//   localConfig: SysConfig;
//   epiConfig: EpiConfig | null;
//   saving: boolean;
//   saved: boolean;
//   setLocalConfig: (cfg: SysConfig) => void;
//   setEpiConfig: (cfg: EpiConfig | null) => void;
//   handleSave: () => Promise<void>;
// }

// export interface PermanenceState {
//   people: WorkerRecord[];
//   loading: boolean;
//   fetchPeople: () => Promise<void>;
// }

// export interface UseCamAutomationReturn {
//   screen: Screen;
//   direction: Direction;
//   doorStatus: DoorStatus;
//   session: Session;
//   sysConfig: SysConfig;
//   showReport: boolean;
//   showConfig: boolean;
//   setShowReport: (v: boolean) => void;
//   setShowConfig: (v: boolean) => void;
//   cameraHook: CameraHook;
//   idleState: IdleState;
//   faceScanState: FaceScanState;
//   epiScanState: EpiScanState;
//   configState: ConfigState;
//   permanenceState: PermanenceState;
//   handleStartEntry: () => void;
//   handleStartExit: () => void;
//   handleGoIdle: () => void;
//   handleTimeOverride: () => void;
//   handleRetryFromDenied: () => void;
//   handleSaveConfig: (newConfig: Partial<SysConfig>) => void;
//   handleCaptureFace: () => Promise<void>;
//   handleRetryFace: () => void;
//   handleCaptureEpi: () => Promise<void>;
//   handleRetryEpi: () => void;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // CONSTANTES
// // ─────────────────────────────────────────────────────────────────────────────

// const LS_KEYS: Record<CamRole, string> = {
//   face: "epi_cam_face",
//   body1: "epi_cam_body1",
//   body2: "epi_cam_body2",
// };

// const LS_KEYS_TYPE: Record<CamRole, string> = {
//   face: "epi_cam_face_type",
//   body1: "epi_cam_body1_type",
//   body2: "epi_cam_body2_type",
// };

// const LS_KEYS_URL: Record<CamRole, string> = {
//   face: "epi_cam_face_url",
//   body1: "epi_cam_body1_url",
//   body2: "epi_cam_body2_url",
// };

// const EMPTY_SESSION: Session = {
//   sessionUuid: null,
//   person: null,
//   dailyExposure: null,
//   epiResult: null,
//   missingEpi: [],
//   deniedReason: null,
// };

// const DEFAULT_CONFIG: SysConfig = {
//   companyId: 1,
//   zoneId: 10,
//   doorId: "DOOR_CAMARA_FRIA_01",
//   dailyLimitMin: 120,
//   overLimitPolicy: "warn",
//   doorOpenMaxMin: 15,
//   faceConfidenceMin: 70,
//   apiBase: "https://aihub.smartxhub.cloud",
//   useSingleCamera: false,
//   cameraSourceType: {
//     face: "local",
//     body1: "local",
//     body2: "local",
//   },
//   cameraIpUrl: {
//     face: null,
//     body1: null,
//     body2: null,
//   },
//   // ─── Fechadura ESP32 ───────────────────────────────────────────────────────
//   lockIpAddress: "192.168.68.100",
//   lockDurationMs: 5000,
// };

// const EPI_LABELS_PT: Record<string, string> = {
//   helmet: "Capacete",
//   vest: "Colete",
//   gloves: "Luvas",
//   boots: "Botas",
//   thermal_coat: "Jaqueta Térmica",
//   thermal_pants: "Calça Térmica",
//   glasses: "Óculos de Proteção",
//   mask: "Máscara",
//   apron: "Avental",
//   hardhat: "Capacete",
// };

// const epiLabel = (k: string) => EPI_LABELS_PT[k] ?? k;

// // ─────────────────────────────────────────────────────────────────────────────
// // HELPER: captura de frame de câmera IP via URL
// // ─────────────────────────────────────────────────────────────────────────────

// async function captureFrameFromUrl(url: string): Promise<Blob> {
//   // Usa proxy do backend para evitar CORS
//   const proxyUrl = `${getApiBaseUrl()}/api/v1/epi/camera/snapshot/v4?url=${encodeURIComponent(url)}`;
//   const response = await fetch(proxyUrl);
//   if (!response.ok) {
//     throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//   }
//   return response.blob();
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HELPER: resolve campo compliant de qualquer formato de resposta do backend
// //
// // O backend Python retorna "epi_compliant" (snake_case com prefixo).
// // Versões antigas podem retornar "compliant" ou via "final_decision.epi_compliant".
// // Esta função garante que todos os casos são cobertos.
// // ─────────────────────────────────────────────────────────────────────────────

// function resolveCompliant(photo: PhotoResult): boolean {
//   return (
//     photo.epi_compliant ??
//     photo.final_decision?.epi_compliant ??
//     photo.compliant ??
//     false
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HOOK DE CÂMERAS (interno)
// // ─────────────────────────────────────────────────────────────────────────────
// //@ts-ignore
// function useCameraInternal(sysConfig: SysConfig): CameraHook {
//   const [devices, setDevices] = useState<CamDevice[]>([]);
//   const [assignments, setAssignments] = useState<Record<CamRole, string | null>>({
//     face: localStorage.getItem(LS_KEYS.face) || null,
//     body1: localStorage.getItem(LS_KEYS.body1) || null,
//     body2: localStorage.getItem(LS_KEYS.body2) || null,
//   });

//   const [sourceTypes, setSourceTypes] = useState<Record<CamRole, CameraSourceType>>({
//     face: (localStorage.getItem(LS_KEYS_TYPE.face) as CameraSourceType) || "local",
//     body1: (localStorage.getItem(LS_KEYS_TYPE.body1) as CameraSourceType) || "local",
//     body2: (localStorage.getItem(LS_KEYS_TYPE.body2) as CameraSourceType) || "local",
//   });

//   const [ipUrls, setIpUrls] = useState<Record<CamRole, string | null>>({
//     face: localStorage.getItem(LS_KEYS_URL.face) || null,
//     body1: localStorage.getItem(LS_KEYS_URL.body1) || null,
//     body2: localStorage.getItem(LS_KEYS_URL.body2) || null,
//   });

//   const [streams, setStreams] = useState<Partial<Record<CamRole, MediaStream>>>({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const videoRefs = useRef<Partial<Record<CamRole, HTMLVideoElement | null>>>({});

//   const enumerateDevices = useCallback(async (): Promise<CamDevice[]> => {
//     try {
//       await navigator.mediaDevices
//         .getUserMedia({ video: true, audio: false })
//         .then((s) => s.getTracks().forEach((t) => t.stop()))
//         .catch(() => {});
//       const all = await navigator.mediaDevices.enumerateDevices();
//       const vids = all.filter((d) => d.kind === "videoinput") as CamDevice[];
//       setDevices(vids);
//       setAssignments((prev) => {
//         const next = { ...prev };
//         if (!next.face && vids[0]) next.face = vids[0].deviceId;
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

//   const startStream = useCallback(
//     async (role: CamRole): Promise<MediaStream | null> => {
//       const sourceType = sourceTypes[role];
//       if (sourceType === "ip_url") return null;

//       const deviceId = assignments[role];
//       if (!deviceId) return null;
//       streams[role]?.getTracks().forEach((t) => t.stop());
//       try {
//         setLoading(true);
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: {
//             deviceId: { exact: deviceId },
//             width: { ideal: 1280 },
//             height: { ideal: 720 },
//             frameRate: { ideal: 30 },
//             //@ts-ignore
//             zoom: 1.0,
//           },
//           audio: false,
//         });
//         setStreams((prev) => ({ ...prev, [role]: stream }));
//         const ref = videoRefs.current[role];
//         if (ref) ref.srcObject = stream;
//         return stream;
//       } catch (e) {
//         setError(e instanceof Error ? e.message : String(e));
//         return null;
//       } finally {
//         setLoading(false);
//       }
//     },
//     [assignments, sourceTypes, streams],
//   );

//   const stopStream = useCallback(
//     (role: CamRole) => {
//       streams[role]?.getTracks().forEach((t) => t.stop());
//       setStreams((prev) => {
//         const n = { ...prev };
//         delete n[role];
//         return n;
//       });
//       const ref = videoRefs.current[role];
//       if (ref) ref.srcObject = null;
//     },
//     [streams],
//   );

//   const stopAllStreams = useCallback(() => {
//     Object.values(streams).forEach((s) => s?.getTracks().forEach((t) => t.stop()));
//     setStreams({});
//     Object.values(videoRefs.current).forEach((v) => {
//       if (v) v.srcObject = null;
//     });
//   }, [streams]);

//   const captureFrame = useCallback(
//     async (role: CamRole) => {
//       const sourceType = sourceTypes[role];

//       if (sourceType === "ip_url") {
//         const url = ipUrls[role];
//         if (!url) throw new Error(`URL não configurada para câmera ${role}`);
//         const blob = await captureFrameFromUrl(url);
//         const dataUrl = URL.createObjectURL(blob);
//         const canvas = document.createElement("canvas");
//         return { blob, dataUrl, canvas };
//       }

//       const video = videoRefs.current[role];
//       if (!video || video.readyState < 2)
//         throw new Error(`Câmera "${role}" não está pronta.`);
//       const canvas = document.createElement("canvas");
//       canvas.width = video.videoWidth || 1280;
//       canvas.height = video.videoHeight || 720;
//       canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
//       const blob = await canvasToBlob(canvas, 0.88);
//       const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
//       return { blob, dataUrl, canvas };
//     },
//     [sourceTypes, ipUrls],
//   );

//   const assignDevice = useCallback((role: CamRole, deviceId: string | null) => {
//     setAssignments((prev) => ({ ...prev, [role]: deviceId }));
//     localStorage.setItem(LS_KEYS[role], deviceId || "");
//   }, []);

//   const setVideoRef = useCallback(
//     (role: CamRole, element: HTMLVideoElement | null) => {
//       videoRefs.current[role] = element;
//       if (element && streams[role]) element.srcObject = streams[role]!;
//     },
//     [streams],
//   );

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
//     navigator.mediaDevices.addEventListener("devicechange", handler);
//     return () => {
//       navigator.mediaDevices.removeEventListener("devicechange", handler);
//       stopAllStreams();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return {
//     devices,
//     assignments,
//     streams,
//     loading,
//     error,
//     enumerateDevices,
//     startStream,
//     stopStream,
//     stopAllStreams,
//     captureFrame,
//     assignDevice,
//     setVideoRef,
//     hasStream: (role) => !!streams[role],
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
//   const [screen, setScreen] = useState<Screen>("idle");
//   const [direction, setDirection] = useState<Direction>("ENTRY");
//   const [doorStatus, setDoorStatus] = useState<DoorStatus>("closed");
//   const [session, setSession] = useState<Session>(EMPTY_SESSION);
//   const [sysConfig, setSysConfig] = useState<SysConfig>(DEFAULT_CONFIG);
//   const [showReport, setShowReport] = useState(false);
//   const [showConfig, setShowConfig] = useState(false);

//   const cameraHook = useCameraInternal(sysConfig);

//   const [dashboard, setDashboard] = useState<DashboardData | null>(null);
//   const [loadingDash, setLoadingDash] = useState(true);

//   const [faceStep, setFaceStep] = useState<FaceScanStep>("ready");
//   const [faceCaptureUrl, setFaceCaptureUrl] = useState<string | null>(null);
//   const [faceProgress, setFaceProgress] = useState(0);
//   const [faceStatusMsg, setFaceStatusMsg] = useState(
//     "Posicione seu rosto na câmera e toque em Capturar",
//   );
//   const [faceSubMsg, setFaceSubMsg] = useState("");
//   const [faceCountdown, setFaceCountdown] = useState<number | null>(null);
//   const faceAutoCapture = useRef(false);

//   const [epiStep, setEpiStep] = useState<EpiScanStep>("ready");
//   const [epiCaptureUrl1, setEpiCaptureUrl1] = useState<string | null>(null);
//   const [epiCaptureUrl2, setEpiCaptureUrl2] = useState<string | null>(null);
//   const [epiStatusMsg, setEpiStatusMsg] = useState(
//     "Posicione-se em frente às câmeras de corpo",
//   );
//   const [epiCountdown, setEpiCountdown] = useState<number | null>(null);
//   const [epiResult, setEpiResult] = useState<EpiResult | null>(null);
//   const epiAutoCapture = useRef(false);

//   // Mantém session em ref para evitar stale closure em callbacks async
//   const sessionRef = useRef<Session>(EMPTY_SESSION);

//   // Guard para evitar double-trigger do unlock (StrictMode, re-renders)
//   const unlockFiredRef = useRef(false);

//   const [localConfig, setLocalConfig] = useState<SysConfig>(DEFAULT_CONFIG);
//   const [epiConfig, setEpiConfig] = useState<EpiConfig | null>(null);
//   const [saving, setSaving] = useState(false);
//   const [saved, setSaved] = useState(false);

//   const [people, setPeople] = useState<WorkerRecord[]>([]);
//   const [loadingPeople, setLoadingPeople] = useState(false);

//   // ─── Sync session → sessionRef ────────────────────────────────────────────

//   useEffect(() => {
//     sessionRef.current = session;
//   }, [session]);

//   // ─── Helpers de reset ─────────────────────────────────────────────────────

//   const resetSession = useCallback(() => setSession(EMPTY_SESSION), []);

//   const resetFaceScan = useCallback((withAutoCapture = false) => {
//     faceAutoCapture.current = withAutoCapture;
//     setFaceStep("ready");
//     setFaceCaptureUrl(null);
//     setFaceProgress(0);
//     setFaceStatusMsg("Posicione seu rosto na câmera e toque em Capturar");
//     setFaceSubMsg("");
//     setFaceCountdown(null);
//   }, []);

//   const resetEpiScan = useCallback((withAutoCapture = false) => {
//     epiAutoCapture.current = withAutoCapture;
//     setEpiStep("ready");
//     setEpiCaptureUrl1(null);
//     setEpiCaptureUrl2(null);
//     setEpiStatusMsg("Posicione-se em frente às câmeras de corpo");
//     setEpiCountdown(null);
//     setEpiResult(null);
//   }, []);

//   // ─── Config inicial ───────────────────────────────────────────────────────

//   useEffect(() => {
//     api
//       .getLocalConfig()
//       .then((cfg) => {
//         setSysConfig((prev) => ({ ...prev, ...cfg }));
//         setLocalConfig((prev) => ({ ...prev, ...cfg }));
//       })
//       .catch((e: Error) =>
//         console.warn("[useCamAutomation] Config load failed:", e.message),
//       );
//   }, []);

//   // ─── Dashboard polling ────────────────────────────────────────────────────

//   const refreshDashboard = useCallback(async () => {
//     try {
//       const data = await api.getDashboard();
//       setDashboard(data);
//     } catch (e) {
//       console.warn("[useCamAutomation] Dashboard failed:", e);
//     } finally {
//       setLoadingDash(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (screen !== "idle") return;
//     refreshDashboard();
//     const t = setInterval(refreshDashboard, 30000);
//     return () => clearInterval(t);
//   }, [screen, refreshDashboard]);

//   // ─── Config modal ─────────────────────────────────────────────────────────

//   useEffect(() => {
//     if (!showConfig) return;
//     setLocalConfig({ ...sysConfig });
//     api.getEpiConfig().then(setEpiConfig).catch(console.warn);
//   }, [showConfig, sysConfig]);

//   // ─── People (relatório) ───────────────────────────────────────────────────

//   const fetchPeople = useCallback(async () => {
//     try {
//       setLoadingPeople(true);
//       const data = await api.getPeople(false);
//       const list =
//         (data as { people?: WorkerRecord[] }).people ??
//         (data as WorkerRecord[]) ??
//         [];
//       setPeople(list);
//     } catch (e) {
//       console.error("[useCamAutomation] fetchPeople failed:", e);
//     } finally {
//       setLoadingPeople(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (showReport) fetchPeople();
//   }, [showReport, fetchPeople]);

//   // ─────────────────────────────────────────────────────────────────────────
//   // ✅ UNLOCK DA PORTA — disparado ao entrar na tela access_granted
//   //
//   // Fluxo correto:
//   //   handleCaptureEpi() → compliant=true → setScreen("access_granted")
//   //                                              ↓
//   //                               este effect detecta a mudança de tela
//   //                                              ↓
//   //                               POST http://<lockIp>/unlock (ESP32)
//   //                                              ↓
//   //                               setDoorStatus("open") ou "alert"
//   //
//   // Isso garante que a porta só abre APÓS navegar para a tela de sucesso,
//   // e não durante o processamento do EPI scan.
//   // ─────────────────────────────────────────────────────────────────────────

//   useEffect(() => {
//     // Reseta o guard ao sair da tela de acesso liberado
//     if (screen !== "access_granted") {
//       unlockFiredRef.current = false;
//       return;
//     }

//     // Evita double-trigger (React StrictMode monta effects duas vezes em dev)
//     if (unlockFiredRef.current) return;
//     unlockFiredRef.current = true;

//     const lockIp = sysConfig.lockIpAddress;
//     const lockMs = sysConfig.lockDurationMs;

//     console.log(`[unlock] Tela access_granted — acionando ESP32 em http://${lockIp}/unlock`);

//     // 1. Aciona a fechadura física ESP32
//     api
//       .unlockDoor(lockIp, lockMs)
//       .then(() => {
//         setDoorStatus("open");
//         console.log("[unlock] ✅ Porta aberta");
//       })
//       .catch((e) => {
//         console.error("[unlock] ❌ Falha ao acionar ESP32:", e);
//         // Validação ok mas fechadura falhou → alerta visual no TopBar
//         setDoorStatus("alert");
//       });

//     // 2. Log de auditoria no backend Python (fire-and-forget, não crítico)
//     api
//       .openDoor({
//         personCode: sessionRef.current.person?.personCode,
//         personName: sessionRef.current.person?.personName,
//         sessionUuid: sessionRef.current.sessionUuid,
//         reason: "EPI_COMPLIANT",
//       })
//       .catch((e) => console.warn("[unlock] Backend audit log falhou:", e));

//   }, [screen, sysConfig.lockIpAddress, sysConfig.lockDurationMs]);

//   // ─── Auto-capture: face ───────────────────────────────────────────────────

//   useEffect(() => {
//     if (screen !== "face_scan" || !faceAutoCapture.current || faceStep !== "ready")
//       return;
//     let n = 3;
//     setFaceCountdown(n);
//     const t = setInterval(() => {
//       n -= 1;
//       if (n <= 0) {
//         clearInterval(t);
//         setFaceCountdown(null);
//         handleCaptureFace();
//       } else setFaceCountdown(n);
//     }, 1000);
//     return () => {
//       clearInterval(t);
//       setFaceCountdown(null);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [screen, faceStep]);

//   // ─── Auto-capture: EPI ───────────────────────────────────────────────────

//   useEffect(() => {
//     if (screen !== "epi_scan" || !epiAutoCapture.current || epiStep !== "ready")
//       return;
//     let n = 4;
//     setEpiCountdown(n);
//     const t = setInterval(() => {
//       n -= 1;
//       if (n <= 0) {
//         clearInterval(t);
//         setEpiCountdown(null);
//         handleCaptureEpi();
//       } else setEpiCountdown(n);
//     }, 1000);
//     return () => {
//       clearInterval(t);
//       setEpiCountdown(null);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [screen, epiStep]);

//   // ─── Navegação ────────────────────────────────────────────────────────────

//   const handleStartEntry = useCallback(() => {
//     setDirection("ENTRY");
//     resetSession();
//     resetFaceScan(true);
//     cameraHook.startStream("face");
//     setScreen("face_scan");
//   }, [resetSession, resetFaceScan, cameraHook]);

//   const handleStartExit = useCallback(() => {
//     setDirection("EXIT");
//     resetSession();
//     resetFaceScan(true);
//     cameraHook.startStream("face");
//     setScreen("face_scan");
//   }, [resetSession, resetFaceScan, cameraHook]);

//   const handleGoIdle = useCallback(() => {
//     cameraHook.stopAllStreams();
//     resetSession();
//     resetFaceScan(false);
//     resetEpiScan(false);
//     setDoorStatus("closed");
//     setScreen("idle");
//   }, [cameraHook, resetSession, resetFaceScan, resetEpiScan]);

//   const handleTimeOverride = useCallback(() => {
//     resetEpiScan(true);
//     if (!sysConfig.useSingleCamera) {
//       cameraHook.startStream("body1");
//       if (cameraHook.getAssignment("body2")) cameraHook.startStream("body2");
//     }
//     setScreen("epi_scan");
//   }, [cameraHook, resetEpiScan, sysConfig.useSingleCamera]);

//   const handleRetryFromDenied = useCallback(() => {
//     setSession((prev) => ({
//       ...prev,
//       epiResult: null,
//       missingEpi: [],
//       deniedReason: null,
//     }));
//     resetEpiScan(false);
//     setScreen("epi_scan");
//   }, [resetEpiScan]);

//   const handleSaveConfig = useCallback((newConfig: Partial<SysConfig>) => {
//     setSysConfig((prev) => ({ ...prev, ...newConfig }));
//   }, []);

//   // ─── ACTION: Captura facial ───────────────────────────────────────────────

//   const handleCaptureFace = useCallback(async () => {
//     if (faceStep !== "ready") return;
//     faceAutoCapture.current = false;

//     try {
//       setFaceStep("capturing");
//       setFaceStatusMsg("Capturando frame…");

//       const { blob, dataUrl } = await cameraHook.captureFrame("face");
//       setFaceCaptureUrl(dataUrl);

//       setFaceStep("processing");
//       setFaceStatusMsg("Iniciando sessão de validação…");
//       setFaceProgress(20);

//       const sessionData = await api.startValidationSession({
//         direction,
//         door_id: sysConfig.doorId,
//         zone_id: sysConfig.zoneId,
//       });
//       const uuid = sessionData.session_uuid || sessionData.sessionUuid!;
//       setFaceProgress(40);

//       setFaceStatusMsg("Reconhecendo rosto…");
//       const photo = await api.sendValidationPhoto(uuid, blob, {
//         photoType: "face",
//         cameraId: 1,
//       });
//       setFaceProgress(80);

//       const resolvedCode = (
//         photo.face_person_code ||
//         photo.person_code ||
//         photo.final_decision?.person_code ||
//         ""
//       ).trim();

//       const resolvedName = (
//         photo.person_name ||
//         photo.final_decision?.person_name ||
//         ""
//       ).trim();

//       if (resolvedCode && resolvedName) {
//         setFaceProgress(100);
//         setFaceStep("done");

//         const resolvedConf =
//           photo.face_confidence ||
//           photo.confidence ||
//           photo.final_decision?.face_confidence_max ||
//           0;

//         setFaceStatusMsg(`Identificado: ${resolvedName}`);
//         setFaceSubMsg(`Confiança: ${Math.round(resolvedConf * 100)}%`);

//         const person: Person = {
//           personCode: resolvedCode,
//           personName: resolvedName,
//           confidence: resolvedConf,
//         };
//         setSession((prev) => ({
//           ...prev,
//           sessionUuid: uuid,
//           person,
//           dailyExposure: photo.daily_exposure ?? null,
//         }));

//         setTimeout(() => {
//           if (direction === "EXIT") {
//             setScreen("idle");
//             return;
//           }

//           const totalMin = photo.daily_exposure?.total_minutes ?? 0;
//           const limitMin =
//             photo.daily_exposure?.limit_minutes ?? sysConfig.dailyLimitMin;

//           if (totalMin >= limitMin) {
//             setScreen("time_alert");
//           } else {
//             resetEpiScan(true);
//             cameraHook.startStream("body1");
//             if (cameraHook.getAssignment("body2"))
//               cameraHook.startStream("body2");
//             setScreen("epi_scan");
//           }
//         }, 900);
//       } else {
//         setFaceStep("error");
//         setFaceStatusMsg("Rosto não reconhecido");
//         setFaceSubMsg("Usuário não encontrado — solicite acesso manual");
//         setFaceProgress(0);
//         setSession((prev) => ({
//           ...prev,
//           person: null,
//           deniedReason: "user_not_found",
//         }));
//       }
//     } catch (e) {
//       const err = e as {
//         response?: { data?: { detail?: string } };
//         message?: string;
//       };
//       setFaceStep("error");
//       setFaceStatusMsg("Erro ao processar");
//       setFaceSubMsg(err.response?.data?.detail || err.message || "");
//       setFaceProgress(0);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [faceStep, cameraHook, direction, sysConfig, resetEpiScan]);

//   const handleRetryFace = useCallback(
//     () => resetFaceScan(false),
//     [resetFaceScan],
//   );

//   // ─── ACTION: Captura EPI ──────────────────────────────────────────────────

//   const handleCaptureEpi = useCallback(async () => {
//     if (epiStep !== "ready") return;
//     epiAutoCapture.current = false;

//     // BLOQUEIO DUPLO: pessoa não identificada → acesso negado imediato, sem câmera EPI
//     // Usa sessionRef para evitar stale closure quando chamado pelo auto-capture
//     const personCode = sessionRef.current.person?.personCode?.trim();
//     const personName = sessionRef.current.person?.personName?.trim();
//     if (!personCode || !personName) {
//       console.warn("[EPI] Pessoa não identificada — acesso negado sem leitura EPI");
//       epiAutoCapture.current = false;
//       setEpiStep("error");
//       setEpiStatusMsg("❌ Usuário não encontrado — Acesso negado");
//       setDoorStatus("closed");
//       setSession((prev) => ({
//         ...prev,
//         missingEpi: [],
//         deniedReason: "user_not_found",
//         epiResult: { compliant: false },
//       }));
//       setTimeout(() => setScreen("access_denied"), 1500);
//       return;
//     }

//     const hasBody2 =
//       !sysConfig.useSingleCamera && !!cameraHook.getAssignment("body2");

//     try {
//       setEpiStep("capturing");
//       setEpiStatusMsg("Capturando frames…");

//       const captureRole: CamRole = sysConfig.useSingleCamera ? "face" : "body1";
//       const { blob: blob1, dataUrl: url1 } =
//         await cameraHook.captureFrame(captureRole);
//       setEpiCaptureUrl1(url1);

//       let blob2: Blob | null = null;
//       if (hasBody2) {
//         try {
//           const f2 = await cameraHook.captureFrame("body2");
//           setEpiCaptureUrl2(f2.dataUrl);
//           blob2 = f2.blob;
//         } catch (e2) {
//           console.warn("[EPI] Body2 capture failed:", (e2 as Error).message);
//         }
//       }

//       setEpiStep("processing");
//       setEpiStatusMsg("Detectando EPIs… aguarde");

//       const epiSessionData = await api.startValidationSession({
//         direction,
//         door_id: sysConfig.doorId,
//         zone_id: sysConfig.zoneId,
//       });
//       const epiSessionUuid =
//         epiSessionData.session_uuid || epiSessionData.sessionUuid!;

//       const photo1 = await api.sendValidationPhoto(epiSessionUuid, blob1, {
//         photoType: "body",
//         cameraId: 2,
//       });

//       // ✅ CORREÇÃO 1: usa resolveCompliant() que lê epi_compliant primeiro.
//       // O backend retorna "epi_compliant", não "compliant".
//       let finalResult: EpiResult = {
//         ...photo1,
//         compliant: resolveCompliant(photo1),
//       };

//       console.log(`[EPI] photo1 — epi_compliant: ${photo1.epi_compliant}, compliant: ${photo1.compliant}, resolved: ${finalResult.compliant}`);

//       if (blob2) {
//         try {
//           const photo2 = await api.sendValidationPhoto(epiSessionUuid, blob2, {
//             photoType: "body",
//             cameraId: 3,
//           });
//           // ✅ CORREÇÃO 2: mesma lógica para photo2
//           const photo2Compliant = resolveCompliant(photo2);
//           if (!photo2Compliant) {
//             finalResult = { ...photo2, compliant: photo2Compliant };
//           }
//         } catch (e3) {
//           console.warn("[EPI] Body2 send failed:", (e3 as Error).message);
//         }
//       }

//       try {
//         // Passa person_code para o backend registrar entrada/saída em vision_people
//         await api.closeValidationSession(
//           epiSessionUuid,
//           sessionRef.current.person?.personCode,
//         );
//       } catch (_) {
//         // ignorado
//       }

//       setEpiResult(finalResult);
//       setEpiStep("done");
//       setSession((prev) => ({
//         ...prev,
//         epiResult: finalResult,
//         sessionUuid: epiSessionUuid, // atualiza com uuid da sessão EPI para o audit log
//         deniedReason: null,
//       }));

//       console.log(`[EPI] Resultado final — compliant: ${finalResult.compliant}`);

//       if (finalResult.compliant) {
//         // ─────────────────────────────────────────────────────────────────
//         // ✅ ACESSO LIBERADO — apenas navega para a tela.
//         //
//         // O unlock da fechadura ESP32 é disparado pelo useEffect que observa
//         // screen === "access_granted", NÃO aqui.
//         //
//         // Isso garante:
//         //   1. A tela de sucesso é exibida primeiro
//         //   2. O unlock é chamado uma única vez (unlockFiredRef guard)
//         //   3. Falha no unlock não impede exibir a tela de sucesso
//         // ─────────────────────────────────────────────────────────────────
//         setEpiStatusMsg("✅ EPI Completo — Acesso liberado");
//         setTimeout(() => setScreen("access_granted"), 1200);
//       } else {
//         // ─── ACESSO NEGADO — EPI incompleto ───────────────────────────────
//         setEpiStatusMsg("❌ EPI Incompleto — Acesso negado");
//         const missing = (
//           finalResult.missing ||
//           finalResult.missing_ppe ||
//           []
//         ).map(epiLabel);
//         setSession((prev) => ({
//           ...prev,
//           missingEpi: missing,
//           deniedReason: "epi_incomplete",
//         }));
//         setDoorStatus("closed");
//         setTimeout(() => setScreen("access_denied"), 1200);
//       }
//     } catch (e) {
//       console.error("[useCamAutomation] EPI capture failed:", e);
//       setEpiStep("error");
//       const errorMsg =
//         (e as any)?.response?.data?.detail ||
//         (e as Error)?.message ||
//         "Erro desconhecido";
//       setEpiStatusMsg(`Erro na detecção de EPI: ${errorMsg}`);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
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
//       console.error("[useCamAutomation] saveConfig failed:", e);
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
//       step: faceStep,
//       captureUrl: faceCaptureUrl,
//       progress: faceProgress,
//       statusMsg: faceStatusMsg,
//       subMsg: faceSubMsg,
//       countdown: faceCountdown,
//     },

//     epiScanState: {
//       step: epiStep,
//       captureUrl1: epiCaptureUrl1,
//       captureUrl2: epiCaptureUrl2,
//       statusMsg: epiStatusMsg,
//       countdown: epiCountdown,
//       result: epiResult,
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

// import { useState, useEffect, useCallback, useRef } from "react";
// import axios from "axios";

// // ─────────────────────────────────────────────────────────────────────────────
// // API LAYER (interno ao hook — nenhum screen/component precisa importar)
// // ─────────────────────────────────────────────────────────────────────────────

// const getApiBaseUrl = (): string => {
//   const saved = sessionStorage.getItem("apiEndpoint");
//   return saved ?? "https://aihub.smartxhub.cloud";
// };

// const makeHttp = () =>
//   axios.create({ baseURL: getApiBaseUrl(), timeout: 60000 });

// const EPI = "https://aihub.smartxhub.cloud/api/v1/epi";

// // ─── Parâmetros de filtro para getPeople ─────────────────────────────────────
// export interface PeopleFilters {
//   activeOnly?: boolean;
//   isInside?: boolean;
//   hasPhotos?: boolean;
//   search?: string;
//   limit?: number;
//   offset?: number;
// }

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

//   // ── ATUALIZADO: aceita filtros completos, retorna array direto ────────────
//   getPeople: async (params: PeopleFilters = {}): Promise<WorkerRecord[]> => {
//     const { data } = await makeHttp().get(`${EPI}/analytics/people`, {
//       params: {
//         active_only: params.activeOnly ?? false,
//         is_inside:   params.isInside,
//         has_photos:  params.hasPhotos,
//         search:      params.search,
//         limit:       params.limit  ?? 500,
//         offset:      params.offset ?? 0,
//       },
//     });
//     // Endpoint retorna array direto; fallback para shape antigo { people: [] }
//     return Array.isArray(data) ? data : ((data as { people?: WorkerRecord[] }).people ?? []);
//   },

//   getEpiConfig: async (): Promise<EpiConfig> => {
//     const { data } = await makeHttp().get(`${EPI}/config`);
//     return {
//       required_ppe: data.config?.required_ppe ?? [],
//       available_classes: data.all_classes
//         ? (Object.values(data.all_classes) as string[])
//         : [],
//       config: data.config,
//     };
//   },

//   saveEpiConfig: async (config: { required_ppe: string[] }): Promise<void> => {
//     await makeHttp().post(`${EPI}/config`, config);
//   },

//   startValidationSession: async (
//     overrides: Record<string, unknown> = {},
//   ): Promise<{ session_uuid: string; sessionUuid?: string }> => {
//     const form = new FormData();
//     form.append("door_id", String(overrides.door_id ?? "DOOR_01"));
//     form.append("direction", String(overrides.direction ?? "ENTRY"));
//     form.append("zone_id", String(overrides.zone_id ?? ""));
//     form.append("compliance_mode", "majority");
//     form.append("photo_count_required", "1");
//     form.append("timeout_seconds", "30");
//     const { data } = await makeHttp().post(`${EPI}/validation/start`, form);
//     return data;
//   },

//   sendValidationPhoto: async (
//     sessionUuid: string,
//     frameBlob: Blob,
//     opts: { photoType?: string; cameraId?: number } = {},
//   ): Promise<PhotoResult> => {
//     const form = new FormData();
//     form.append("session_uuid", sessionUuid);
//     form.append("file", frameBlob, "frame.jpg");
//     if (opts.cameraId !== undefined)
//       form.append("camera_id", String(opts.cameraId));
//     if (opts.photoType) form.append("photo_type", opts.photoType);

//     const endpoint = `${EPI}/validation/photo`;
//     const { data } = await makeHttp().post(endpoint, form, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return data;
//   },

//   closeValidationSession: async (sessionUuid: string, personCode?: string): Promise<void> => {
//     const form = new FormData();
//     form.append("session_uuid", sessionUuid);
//     if (personCode) form.append("person_code_override", personCode);
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
//       if (payload.personCode) form.append("person_code", payload.personCode);
//       if (payload.personName) form.append("person_name", payload.personName);
//       if (payload.sessionUuid) form.append("session_uuid", payload.sessionUuid);
//       form.append("reason", payload.reason);
//       await makeHttp().post(`${EPI}/door/open`, form);
//     } catch (e) {
//       console.warn("[openDoor] endpoint não disponível:", e);
//     }
//   },

//   unlockDoor: async (lockIp: string, durationMs = 5000): Promise<void> => {
//     console.log(
//       `[unlockDoor] POST http://${lockIp}/unlock { duration_ms: ${durationMs} }`,
//     );
//     const res = await fetch(`http://${lockIp}/unlock`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ duration_ms: durationMs }),
//     });
//     if (!res.ok) {
//       throw new Error(`ESP32 HTTP ${res.status}: ${res.statusText}`);
//     }
//     const data = await res.json();
//     if (!data.ok) {
//       throw new Error(`ESP32 recusou o unlock: ${JSON.stringify(data)}`);
//     }
//     console.log(
//       `[unlockDoor] ✅ ESP32 destrancado — state: ${data.state}, duration: ${data.duration_ms}ms`,
//     );
//   },
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function canvasToBlob(
//   canvas: HTMLCanvasElement,
//   quality = 0.88,
// ): Promise<Blob> {
//   return new Promise((resolve) =>
//     canvas.toBlob((b) => resolve(b!), "image/jpeg", quality),
//   );
// }

// export function formatMinutes(mins: number | null | undefined): string {
//   if (mins == null) return "—";
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
//   | "idle"
//   | "face_scan"
//   | "time_alert"
//   | "epi_scan"
//   | "access_granted"
//   | "access_denied";

// export type Direction = "ENTRY" | "EXIT";
// export type DoorStatus = "closed" | "open" | "alert" | "waiting";
// export type CamRole = "face" | "body1" | "body2";
// export type CameraSourceType = "local" | "ip_url";

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
//   total_minutes: number;
//   limit_minutes: number;
//   entries_today?: number;
// }

// export interface EpiResult {
//   compliant: boolean;
//   detected?: string[];
//   detected_ppe?: string[];
//   missing?: string[];
//   missing_ppe?: string[];
// }

// export interface Session {
//   sessionUuid: string | null;
//   person: Person | null;
//   dailyExposure: DailyExposure | null;
//   epiResult: EpiResult | null;
//   missingEpi: string[];
//   deniedReason?: "user_not_found" | "epi_incomplete" | null;
// }

// export interface SysConfig {
//   companyId: number;
//   zoneId: number;
//   doorId: string;
//   dailyLimitMin: number;
//   overLimitPolicy: "warn" | "block";
//   doorOpenMaxMin: number;
//   faceConfidenceMin: number;
//   apiBase: string;
//   useSingleCamera: boolean;
//   cameraSourceType: Record<CamRole, CameraSourceType>;
//   cameraIpUrl: Record<CamRole, string | null>;
//   lockIpAddress: string;
//   lockDurationMs: number;
// }

// export interface EpiConfig {
//   required_ppe: string[];
//   available_classes?: string[];
//   config?: Record<string, unknown>;
// }

// export interface DashboardData {
//   inside_count?: number;
//   people_inside?: number;
//   entries_today?: number;
//   today?: { total?: number };
//   open_alerts?: number;
//   alerts_open?: number;
//   over_limit_count?: number;
// }

// // ── ATUALIZADO: campos completos do novo endpoint ─────────────────────────────
// export interface WorkerRecord {
//   person_code: string;
//   person_name: string;
//   department?: string;
//   badge_id?: string;
//   is_inside?: boolean;
//   face_photos_count?: number;
//   last_entry_at?: string | null;
//   last_exit_at?: string | null;
//   active?: boolean;
//   created_at?: string;
//   // Campos de permanência (calculados ou vindos de outro endpoint)
//   daily_accumulated_min?: number;
//   total_minutes?: number;
//   total_entries?: number;
//   sessions_today?: number;
// }

// export interface CamDevice {
//   deviceId: string;
//   label: string;
//   kind: string;
// }

// export interface CameraHook {
//   devices: CamDevice[];
//   assignments: Record<CamRole, string | null>;
//   streams: Partial<Record<CamRole, MediaStream>>;
//   loading: boolean;
//   error: string | null;
//   enumerateDevices: () => Promise<CamDevice[]>;
//   startStream: (role: CamRole) => Promise<MediaStream | null>;
//   stopStream: (role: CamRole) => void;
//   stopAllStreams: () => void;
//   captureFrame: (
//     role: CamRole,
//   ) => Promise<{ blob: Blob; dataUrl: string; canvas: HTMLCanvasElement }>;
//   assignDevice: (role: CamRole, deviceId: string | null) => void;
//   setVideoRef: (role: CamRole, element: HTMLVideoElement | null) => void;
//   hasStream: (role: CamRole) => boolean;
//   getAssignment: (role: CamRole) => string | null;
//   sourceTypes: Record<CamRole, CameraSourceType>;
//   ipUrls: Record<CamRole, string | null>;
//   setSourceType: (role: CamRole, type: CameraSourceType) => void;
//   setIpUrl: (role: CamRole, url: string | null) => void;
// }

// // ─── Tipos internos da API ────────────────────────────────────────────────────

// interface PhotoResult {
//   session_uuid?: string;
//   photo_seq?: number;
//   photo_count_received?: number;
//   photo_count_required?: number;
//   session_complete?: boolean;
//   face_detected?: boolean;
//   face_recognized?: boolean;
//   face_confidence?: number;
//   face_person_code?: string;
//   person_code?: string;
//   person_name?: string;
//   confidence?: number;
//   epi_compliant?: boolean;
//   compliant?: boolean;
//   compliance_score?: number;
//   missing?: string[];
//   missing_ppe?: string[];
//   detected?: string[];
//   detected_ppe?: string[];
//   final_decision?: {
//     access_decision: string;
//     epi_compliant: boolean;
//     face_confirmed: boolean;
//     face_confidence_max?: number;
//     person_code?: string;
//     person_name?: string;
//   } | null;
//   daily_exposure?: DailyExposure;
// }

// // ─── Estados por screen/modal ─────────────────────────────────────────────────

// export type FaceScanStep =
//   | "ready"
//   | "capturing"
//   | "processing"
//   | "done"
//   | "error";

// export interface FaceScanState {
//   step: FaceScanStep;
//   captureUrl: string | null;
//   progress: number;
//   statusMsg: string;
//   subMsg: string;
//   countdown: number | null;
// }

// export type EpiScanStep =
//   | "ready"
//   | "capturing"
//   | "processing"
//   | "done"
//   | "error";

// export interface EpiScanState {
//   step: EpiScanStep;
//   captureUrl1: string | null;
//   captureUrl2: string | null;
//   statusMsg: string;
//   countdown: number | null;
//   result: EpiResult | null;
// }

// export interface IdleState {
//   dashboard: DashboardData | null;
//   loadingDash: boolean;
//   refreshDashboard: () => void;
// }

// export interface ConfigState {
//   localConfig: SysConfig;
//   epiConfig: EpiConfig | null;
//   saving: boolean;
//   saved: boolean;
//   setLocalConfig: (cfg: SysConfig) => void;
//   setEpiConfig: (cfg: EpiConfig | null) => void;
//   handleSave: () => Promise<void>;
// }

// // ── ATUALIZADO: fetchPeople aceita filtros opcionais ──────────────────────────
// export interface PermanenceState {
//   people: WorkerRecord[];
//   loading: boolean;
//   fetchPeople: (filters?: PeopleFilters) => Promise<void>;
// }

// export interface UseCamAutomationReturn {
//   screen: Screen;
//   direction: Direction;
//   doorStatus: DoorStatus;
//   session: Session;
//   sysConfig: SysConfig;
//   showReport: boolean;
//   showConfig: boolean;
//   setShowReport: (v: boolean) => void;
//   setShowConfig: (v: boolean) => void;
//   cameraHook: CameraHook;
//   idleState: IdleState;
//   faceScanState: FaceScanState;
//   epiScanState: EpiScanState;
//   configState: ConfigState;
//   permanenceState: PermanenceState;
//   handleStartEntry: () => void;
//   handleStartExit: () => void;
//   handleGoIdle: () => void;
//   handleTimeOverride: () => void;
//   handleRetryFromDenied: () => void;
//   handleSaveConfig: (newConfig: Partial<SysConfig>) => void;
//   handleCaptureFace: () => Promise<void>;
//   handleRetryFace: () => void;
//   handleCaptureEpi: () => Promise<void>;
//   handleRetryEpi: () => void;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // CONSTANTES
// // ─────────────────────────────────────────────────────────────────────────────

// const LS_KEYS: Record<CamRole, string> = {
//   face: "epi_cam_face",
//   body1: "epi_cam_body1",
//   body2: "epi_cam_body2",
// };

// const LS_KEYS_TYPE: Record<CamRole, string> = {
//   face: "epi_cam_face_type",
//   body1: "epi_cam_body1_type",
//   body2: "epi_cam_body2_type",
// };

// const LS_KEYS_URL: Record<CamRole, string> = {
//   face: "epi_cam_face_url",
//   body1: "epi_cam_body1_url",
//   body2: "epi_cam_body2_url",
// };

// const EMPTY_SESSION: Session = {
//   sessionUuid: null,
//   person: null,
//   dailyExposure: null,
//   epiResult: null,
//   missingEpi: [],
//   deniedReason: null,
// };

// const DEFAULT_CONFIG: SysConfig = {
//   companyId: 1,
//   zoneId: 10,
//   doorId: "DOOR_CAMARA_FRIA_01",
//   dailyLimitMin: 120,
//   overLimitPolicy: "warn",
//   doorOpenMaxMin: 15,
//   faceConfidenceMin: 70,
//   apiBase: "https://aihub.smartxhub.cloud",
//   useSingleCamera: false,
//   cameraSourceType: {
//     face: "local",
//     body1: "local",
//     body2: "local",
//   },
//   cameraIpUrl: {
//     face: null,
//     body1: null,
//     body2: null,
//   },
//   lockIpAddress: "192.168.68.100",
//   lockDurationMs: 5000,
// };

// const EPI_LABELS_PT: Record<string, string> = {
//   helmet: "Capacete",
//   vest: "Colete",
//   gloves: "Luvas",
//   boots: "Botas",
//   thermal_coat: "Jaqueta Térmica",
//   thermal_pants: "Calça Térmica",
//   glasses: "Óculos de Proteção",
//   mask: "Máscara",
//   apron: "Avental",
//   hardhat: "Capacete",
// };

// const epiLabel = (k: string) => EPI_LABELS_PT[k] ?? k;

// // ─────────────────────────────────────────────────────────────────────────────
// // HELPER: captura de frame de câmera IP via URL
// // ─────────────────────────────────────────────────────────────────────────────

// async function captureFrameFromUrl(url: string): Promise<Blob> {
//   const proxyUrl = `${getApiBaseUrl()}/api/v1/epi/camera/snapshot/v4?url=${encodeURIComponent(url)}`;
//   const response = await fetch(proxyUrl);
//   if (!response.ok) {
//     throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//   }
//   return response.blob();
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HELPER: resolve campo compliant de qualquer formato de resposta do backend
// // ─────────────────────────────────────────────────────────────────────────────

// function resolveCompliant(photo: PhotoResult): boolean {
//   return (
//     photo.epi_compliant ??
//     photo.final_decision?.epi_compliant ??
//     photo.compliant ??
//     false
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HOOK DE CÂMERAS (interno)
// // ─────────────────────────────────────────────────────────────────────────────
// //@ts-ignore
// function useCameraInternal(sysConfig: SysConfig): CameraHook {
//   const [devices, setDevices] = useState<CamDevice[]>([]);
//   const [assignments, setAssignments] = useState<Record<CamRole, string | null>>({
//     face: localStorage.getItem(LS_KEYS.face) || null,
//     body1: localStorage.getItem(LS_KEYS.body1) || null,
//     body2: localStorage.getItem(LS_KEYS.body2) || null,
//   });

//   const [sourceTypes, setSourceTypes] = useState<Record<CamRole, CameraSourceType>>({
//     face: (localStorage.getItem(LS_KEYS_TYPE.face) as CameraSourceType) || "local",
//     body1: (localStorage.getItem(LS_KEYS_TYPE.body1) as CameraSourceType) || "local",
//     body2: (localStorage.getItem(LS_KEYS_TYPE.body2) as CameraSourceType) || "local",
//   });

//   const [ipUrls, setIpUrls] = useState<Record<CamRole, string | null>>({
//     face: localStorage.getItem(LS_KEYS_URL.face) || null,
//     body1: localStorage.getItem(LS_KEYS_URL.body1) || null,
//     body2: localStorage.getItem(LS_KEYS_URL.body2) || null,
//   });

//   const [streams, setStreams] = useState<Partial<Record<CamRole, MediaStream>>>({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const videoRefs = useRef<Partial<Record<CamRole, HTMLVideoElement | null>>>({});

//   const enumerateDevices = useCallback(async (): Promise<CamDevice[]> => {
//     try {
//       await navigator.mediaDevices
//         .getUserMedia({ video: true, audio: false })
//         .then((s) => s.getTracks().forEach((t) => t.stop()))
//         .catch(() => {});
//       const all = await navigator.mediaDevices.enumerateDevices();
//       const vids = all.filter((d) => d.kind === "videoinput") as CamDevice[];
//       setDevices(vids);
//       setAssignments((prev) => {
//         const next = { ...prev };
//         if (!next.face && vids[0]) next.face = vids[0].deviceId;
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

//   const startStream = useCallback(
//     async (role: CamRole): Promise<MediaStream | null> => {
//       const sourceType = sourceTypes[role];
//       if (sourceType === "ip_url") return null;
//       const deviceId = assignments[role];
//       if (!deviceId) return null;
//       streams[role]?.getTracks().forEach((t) => t.stop());
//       try {
//         setLoading(true);
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: {
//             deviceId: { exact: deviceId },
//             width: { ideal: 1280 },
//             height: { ideal: 720 },
//             frameRate: { ideal: 30 },
//             //@ts-ignore
//             zoom: 1.0,
//           },
//           audio: false,
//         });
//         setStreams((prev) => ({ ...prev, [role]: stream }));
//         const ref = videoRefs.current[role];
//         if (ref) ref.srcObject = stream;
//         return stream;
//       } catch (e) {
//         setError(e instanceof Error ? e.message : String(e));
//         return null;
//       } finally {
//         setLoading(false);
//       }
//     },
//     [assignments, sourceTypes, streams],
//   );

//   const stopStream = useCallback(
//     (role: CamRole) => {
//       streams[role]?.getTracks().forEach((t) => t.stop());
//       setStreams((prev) => {
//         const n = { ...prev };
//         delete n[role];
//         return n;
//       });
//       const ref = videoRefs.current[role];
//       if (ref) ref.srcObject = null;
//     },
//     [streams],
//   );

//   const stopAllStreams = useCallback(() => {
//     Object.values(streams).forEach((s) => s?.getTracks().forEach((t) => t.stop()));
//     setStreams({});
//     Object.values(videoRefs.current).forEach((v) => {
//       if (v) v.srcObject = null;
//     });
//   }, [streams]);

//   const captureFrame = useCallback(
//     async (role: CamRole) => {
//       const sourceType = sourceTypes[role];
//       if (sourceType === "ip_url") {
//         const url = ipUrls[role];
//         if (!url) throw new Error(`URL não configurada para câmera ${role}`);
//         const blob = await captureFrameFromUrl(url);
//         const dataUrl = URL.createObjectURL(blob);
//         const canvas = document.createElement("canvas");
//         return { blob, dataUrl, canvas };
//       }
//       const video = videoRefs.current[role];
//       if (!video || video.readyState < 2)
//         throw new Error(`Câmera "${role}" não está pronta.`);
//       const canvas = document.createElement("canvas");
//       canvas.width = video.videoWidth || 1280;
//       canvas.height = video.videoHeight || 720;
//       canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
//       const blob = await canvasToBlob(canvas, 0.88);
//       const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
//       return { blob, dataUrl, canvas };
//     },
//     [sourceTypes, ipUrls],
//   );

//   const assignDevice = useCallback((role: CamRole, deviceId: string | null) => {
//     setAssignments((prev) => ({ ...prev, [role]: deviceId }));
//     localStorage.setItem(LS_KEYS[role], deviceId || "");
//   }, []);

//   const setVideoRef = useCallback(
//     (role: CamRole, element: HTMLVideoElement | null) => {
//       videoRefs.current[role] = element;
//       if (element && streams[role]) element.srcObject = streams[role]!;
//     },
//     [streams],
//   );

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
//     navigator.mediaDevices.addEventListener("devicechange", handler);
//     return () => {
//       navigator.mediaDevices.removeEventListener("devicechange", handler);
//       stopAllStreams();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return {
//     devices,
//     assignments,
//     streams,
//     loading,
//     error,
//     enumerateDevices,
//     startStream,
//     stopStream,
//     stopAllStreams,
//     captureFrame,
//     assignDevice,
//     setVideoRef,
//     hasStream: (role) => !!streams[role],
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
//   const [screen, setScreen] = useState<Screen>("idle");
//   const [direction, setDirection] = useState<Direction>("ENTRY");
//   const [doorStatus, setDoorStatus] = useState<DoorStatus>("closed");
//   const [session, setSession] = useState<Session>(EMPTY_SESSION);
//   const [sysConfig, setSysConfig] = useState<SysConfig>(DEFAULT_CONFIG);
//   const [showReport, setShowReport] = useState(false);
//   const [showConfig, setShowConfig] = useState(false);

//   const cameraHook = useCameraInternal(sysConfig);

//   const [dashboard, setDashboard] = useState<DashboardData | null>(null);
//   const [loadingDash, setLoadingDash] = useState(true);

//   const [faceStep, setFaceStep] = useState<FaceScanStep>("ready");
//   const [faceCaptureUrl, setFaceCaptureUrl] = useState<string | null>(null);
//   const [faceProgress, setFaceProgress] = useState(0);
//   const [faceStatusMsg, setFaceStatusMsg] = useState(
//     "Posicione seu rosto na câmera e toque em Capturar",
//   );
//   const [faceSubMsg, setFaceSubMsg] = useState("");
//   const [faceCountdown, setFaceCountdown] = useState<number | null>(null);
//   const faceAutoCapture = useRef(false);

//   const [epiStep, setEpiStep] = useState<EpiScanStep>("ready");
//   const [epiCaptureUrl1, setEpiCaptureUrl1] = useState<string | null>(null);
//   const [epiCaptureUrl2, setEpiCaptureUrl2] = useState<string | null>(null);
//   const [epiStatusMsg, setEpiStatusMsg] = useState(
//     "Posicione-se em frente às câmeras de corpo",
//   );
//   const [epiCountdown, setEpiCountdown] = useState<number | null>(null);
//   const [epiResult, setEpiResult] = useState<EpiResult | null>(null);
//   const epiAutoCapture = useRef(false);

//   const sessionRef = useRef<Session>(EMPTY_SESSION);
//   const unlockFiredRef = useRef(false);

//   const [localConfig, setLocalConfig] = useState<SysConfig>(DEFAULT_CONFIG);
//   const [epiConfig, setEpiConfig] = useState<EpiConfig | null>(null);
//   const [saving, setSaving] = useState(false);
//   const [saved, setSaved] = useState(false);

//   const [people, setPeople] = useState<WorkerRecord[]>([]);
//   const [loadingPeople, setLoadingPeople] = useState(false);

//   // ─── Sync session → sessionRef ────────────────────────────────────────────

//   useEffect(() => {
//     sessionRef.current = session;
//   }, [session]);

//   // ─── Helpers de reset ─────────────────────────────────────────────────────

//   const resetSession = useCallback(() => setSession(EMPTY_SESSION), []);

//   const resetFaceScan = useCallback((withAutoCapture = false) => {
//     faceAutoCapture.current = withAutoCapture;
//     setFaceStep("ready");
//     setFaceCaptureUrl(null);
//     setFaceProgress(0);
//     setFaceStatusMsg("Posicione seu rosto na câmera e toque em Capturar");
//     setFaceSubMsg("");
//     setFaceCountdown(null);
//   }, []);

//   const resetEpiScan = useCallback((withAutoCapture = false) => {
//     epiAutoCapture.current = withAutoCapture;
//     setEpiStep("ready");
//     setEpiCaptureUrl1(null);
//     setEpiCaptureUrl2(null);
//     setEpiStatusMsg("Posicione-se em frente às câmeras de corpo");
//     setEpiCountdown(null);
//     setEpiResult(null);
//   }, []);

//   // ─── Config inicial ───────────────────────────────────────────────────────

//   useEffect(() => {
//     api
//       .getLocalConfig()
//       .then((cfg) => {
//         setSysConfig((prev) => ({ ...prev, ...cfg }));
//         setLocalConfig((prev) => ({ ...prev, ...cfg }));
//       })
//       .catch((e: Error) =>
//         console.warn("[useCamAutomation] Config load failed:", e.message),
//       );
//   }, []);

//   // ─── Dashboard polling ────────────────────────────────────────────────────

//   const refreshDashboard = useCallback(async () => {
//     try {
//       const data = await api.getDashboard();
//       setDashboard(data);
//     } catch (e) {
//       console.warn("[useCamAutomation] Dashboard failed:", e);
//     } finally {
//       setLoadingDash(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (screen !== "idle") return;
//     refreshDashboard();
//     const t = setInterval(refreshDashboard, 30000);
//     return () => clearInterval(t);
//   }, [screen, refreshDashboard]);

//   // ─── Config modal ─────────────────────────────────────────────────────────

//   useEffect(() => {
//     if (!showConfig) return;
//     setLocalConfig({ ...sysConfig });
//     api.getEpiConfig().then(setEpiConfig).catch(console.warn);
//   }, [showConfig, sysConfig]);

//   // ─── People (relatório) ───────────────────────────────────────────────────
//   // ATUALIZADO: aceita PeopleFilters opcionais, passa direto para api.getPeople

//   const fetchPeople = useCallback(async (filters: PeopleFilters = {}) => {
//     try {
//       setLoadingPeople(true);
//       const list = await api.getPeople({ activeOnly: false, ...filters });
//       setPeople(list);
//     } catch (e) {
//       console.error("[useCamAutomation] fetchPeople failed:", e);
//     } finally {
//       setLoadingPeople(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (showReport) fetchPeople();
//   }, [showReport, fetchPeople]);

//   // ─────────────────────────────────────────────────────────────────────────
//   // UNLOCK DA PORTA
//   // ─────────────────────────────────────────────────────────────────────────

//   useEffect(() => {
//     if (screen !== "access_granted") {
//       unlockFiredRef.current = false;
//       return;
//     }
//     if (unlockFiredRef.current) return;
//     unlockFiredRef.current = true;

//     const lockIp = sysConfig.lockIpAddress;
//     const lockMs = sysConfig.lockDurationMs;

//     console.log(`[unlock] Tela access_granted — acionando ESP32 em http://${lockIp}/unlock`);

//     api
//       .unlockDoor(lockIp, lockMs)
//       .then(() => {
//         setDoorStatus("open");
//         console.log("[unlock] ✅ Porta aberta");
//       })
//       .catch((e) => {
//         console.error("[unlock] ❌ Falha ao acionar ESP32:", e);
//         setDoorStatus("alert");
//       });

//     api
//       .openDoor({
//         personCode: sessionRef.current.person?.personCode,
//         personName: sessionRef.current.person?.personName,
//         sessionUuid: sessionRef.current.sessionUuid,
//         reason: "EPI_COMPLIANT",
//       })
//       .catch((e) => console.warn("[unlock] Backend audit log falhou:", e));

//   }, [screen, sysConfig.lockIpAddress, sysConfig.lockDurationMs]);

//   // ─── Auto-capture: face ───────────────────────────────────────────────────

//   useEffect(() => {
//     if (screen !== "face_scan" || !faceAutoCapture.current || faceStep !== "ready")
//       return;
//     let n = 3;
//     setFaceCountdown(n);
//     const t = setInterval(() => {
//       n -= 1;
//       if (n <= 0) {
//         clearInterval(t);
//         setFaceCountdown(null);
//         handleCaptureFace();
//       } else setFaceCountdown(n);
//     }, 1000);
//     return () => {
//       clearInterval(t);
//       setFaceCountdown(null);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [screen, faceStep]);

//   // ─── Auto-capture: EPI ───────────────────────────────────────────────────

//   useEffect(() => {
//     if (screen !== "epi_scan" || !epiAutoCapture.current || epiStep !== "ready")
//       return;
//     let n = 4;
//     setEpiCountdown(n);
//     const t = setInterval(() => {
//       n -= 1;
//       if (n <= 0) {
//         clearInterval(t);
//         setEpiCountdown(null);
//         handleCaptureEpi();
//       } else setEpiCountdown(n);
//     }, 1000);
//     return () => {
//       clearInterval(t);
//       setEpiCountdown(null);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [screen, epiStep]);

//   // ─── Navegação ────────────────────────────────────────────────────────────

//   const handleStartEntry = useCallback(() => {
//     setDirection("ENTRY");
//     resetSession();
//     resetFaceScan(true);
//     cameraHook.startStream("face");
//     setScreen("face_scan");
//   }, [resetSession, resetFaceScan, cameraHook]);

//   const handleStartExit = useCallback(() => {
//     setDirection("EXIT");
//     resetSession();
//     resetFaceScan(true);
//     cameraHook.startStream("face");
//     setScreen("face_scan");
//   }, [resetSession, resetFaceScan, cameraHook]);

//   const handleGoIdle = useCallback(() => {
//     cameraHook.stopAllStreams();
//     resetSession();
//     resetFaceScan(false);
//     resetEpiScan(false);
//     setDoorStatus("closed");
//     setScreen("idle");
//   }, [cameraHook, resetSession, resetFaceScan, resetEpiScan]);

//   const handleTimeOverride = useCallback(() => {
//     resetEpiScan(true);
//     if (!sysConfig.useSingleCamera) {
//       cameraHook.startStream("body1");
//       if (cameraHook.getAssignment("body2")) cameraHook.startStream("body2");
//     }
//     setScreen("epi_scan");
//   }, [cameraHook, resetEpiScan, sysConfig.useSingleCamera]);

//   const handleRetryFromDenied = useCallback(() => {
//     setSession((prev) => ({
//       ...prev,
//       epiResult: null,
//       missingEpi: [],
//       deniedReason: null,
//     }));
//     resetEpiScan(false);
//     setScreen("epi_scan");
//   }, [resetEpiScan]);

//   const handleSaveConfig = useCallback((newConfig: Partial<SysConfig>) => {
//     setSysConfig((prev) => ({ ...prev, ...newConfig }));
//   }, []);

//   // ─── ACTION: Captura facial ───────────────────────────────────────────────

//   const handleCaptureFace = useCallback(async () => {
//     if (faceStep !== "ready") return;
//     faceAutoCapture.current = false;

//     try {
//       setFaceStep("capturing");
//       setFaceStatusMsg("Capturando frame…");

//       const { blob, dataUrl } = await cameraHook.captureFrame("face");
//       setFaceCaptureUrl(dataUrl);

//       setFaceStep("processing");
//       setFaceStatusMsg("Iniciando sessão de validação…");
//       setFaceProgress(20);

//       const sessionData = await api.startValidationSession({
//         direction,
//         door_id: sysConfig.doorId,
//         zone_id: sysConfig.zoneId,
//       });
//       const uuid = sessionData.session_uuid || sessionData.sessionUuid!;
//       setFaceProgress(40);

//       setFaceStatusMsg("Reconhecendo rosto…");
//       const photo = await api.sendValidationPhoto(uuid, blob, {
//         photoType: "face",
//         cameraId: 1,
//       });
//       setFaceProgress(80);

//       const resolvedCode = (
//         photo.face_person_code ||
//         photo.person_code ||
//         photo.final_decision?.person_code ||
//         ""
//       ).trim();

//       const resolvedName = (
//         photo.person_name ||
//         photo.final_decision?.person_name ||
//         ""
//       ).trim();

//       if (resolvedCode && resolvedName) {
//         setFaceProgress(100);
//         setFaceStep("done");

//         const resolvedConf =
//           photo.face_confidence ||
//           photo.confidence ||
//           photo.final_decision?.face_confidence_max ||
//           0;

//         setFaceStatusMsg(`Identificado: ${resolvedName}`);
//         setFaceSubMsg(`Confiança: ${Math.round(resolvedConf * 100)}%`);

//         const person: Person = {
//           personCode: resolvedCode,
//           personName: resolvedName,
//           confidence: resolvedConf,
//         };
//         setSession((prev) => ({
//           ...prev,
//           sessionUuid: uuid,
//           person,
//           dailyExposure: photo.daily_exposure ?? null,
//         }));

//         setTimeout(() => {
//           if (direction === "EXIT") {
//             setScreen("idle");
//             return;
//           }

//           const totalMin = photo.daily_exposure?.total_minutes ?? 0;
//           const limitMin =
//             photo.daily_exposure?.limit_minutes ?? sysConfig.dailyLimitMin;

//           if (totalMin >= limitMin) {
//             setScreen("time_alert");
//           } else {
//             resetEpiScan(true);
//             cameraHook.startStream("body1");
//             if (cameraHook.getAssignment("body2"))
//               cameraHook.startStream("body2");
//             setScreen("epi_scan");
//           }
//         }, 900);
//       } else {
//         setFaceStep("error");
//         setFaceStatusMsg("Rosto não reconhecido");
//         setFaceSubMsg("Usuário não encontrado — solicite acesso manual");
//         setFaceProgress(0);
//         setSession((prev) => ({
//           ...prev,
//           person: null,
//           deniedReason: "user_not_found",
//         }));
//       }
//     } catch (e) {
//       const err = e as {
//         response?: { data?: { detail?: string } };
//         message?: string;
//       };
//       setFaceStep("error");
//       setFaceStatusMsg("Erro ao processar");
//       setFaceSubMsg(err.response?.data?.detail || err.message || "");
//       setFaceProgress(0);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [faceStep, cameraHook, direction, sysConfig, resetEpiScan]);

//   const handleRetryFace = useCallback(
//     () => resetFaceScan(false),
//     [resetFaceScan],
//   );

//   // ─── ACTION: Captura EPI ──────────────────────────────────────────────────

//   const handleCaptureEpi = useCallback(async () => {
//     if (epiStep !== "ready") return;
//     epiAutoCapture.current = false;

//     const personCode = sessionRef.current.person?.personCode?.trim();
//     const personName = sessionRef.current.person?.personName?.trim();
//     if (!personCode || !personName) {
//       console.warn("[EPI] Pessoa não identificada — acesso negado sem leitura EPI");
//       epiAutoCapture.current = false;
//       setEpiStep("error");
//       setEpiStatusMsg("❌ Usuário não encontrado — Acesso negado");
//       setDoorStatus("closed");
//       setSession((prev) => ({
//         ...prev,
//         missingEpi: [],
//         deniedReason: "user_not_found",
//         epiResult: { compliant: false },
//       }));
//       setTimeout(() => setScreen("access_denied"), 1500);
//       return;
//     }

//     const hasBody2 =
//       !sysConfig.useSingleCamera && !!cameraHook.getAssignment("body2");

//     try {
//       setEpiStep("capturing");
//       setEpiStatusMsg("Capturando frames…");

//       const captureRole: CamRole = sysConfig.useSingleCamera ? "face" : "body1";
//       const { blob: blob1, dataUrl: url1 } =
//         await cameraHook.captureFrame(captureRole);
//       setEpiCaptureUrl1(url1);

//       let blob2: Blob | null = null;
//       if (hasBody2) {
//         try {
//           const f2 = await cameraHook.captureFrame("body2");
//           setEpiCaptureUrl2(f2.dataUrl);
//           blob2 = f2.blob;
//         } catch (e2) {
//           console.warn("[EPI] Body2 capture failed:", (e2 as Error).message);
//         }
//       }

//       setEpiStep("processing");
//       setEpiStatusMsg("Detectando EPIs… aguarde");

//       const epiSessionData = await api.startValidationSession({
//         direction,
//         door_id: sysConfig.doorId,
//         zone_id: sysConfig.zoneId,
//       });
//       const epiSessionUuid =
//         epiSessionData.session_uuid || epiSessionData.sessionUuid!;

//       const photo1 = await api.sendValidationPhoto(epiSessionUuid, blob1, {
//         photoType: "body",
//         cameraId: 2,
//       });

//       let finalResult: EpiResult = {
//         ...photo1,
//         compliant: resolveCompliant(photo1),
//       };

//       console.log(`[EPI] photo1 — epi_compliant: ${photo1.epi_compliant}, compliant: ${photo1.compliant}, resolved: ${finalResult.compliant}`);

//       if (blob2) {
//         try {
//           const photo2 = await api.sendValidationPhoto(epiSessionUuid, blob2, {
//             photoType: "body",
//             cameraId: 3,
//           });
//           const photo2Compliant = resolveCompliant(photo2);
//           if (!photo2Compliant) {
//             finalResult = { ...photo2, compliant: photo2Compliant };
//           }
//         } catch (e3) {
//           console.warn("[EPI] Body2 send failed:", (e3 as Error).message);
//         }
//       }

//       try {
//         await api.closeValidationSession(
//           epiSessionUuid,
//           sessionRef.current.person?.personCode,
//         );
//       } catch (_) {
//         // ignorado
//       }

//       setEpiResult(finalResult);
//       setEpiStep("done");
//       setSession((prev) => ({
//         ...prev,
//         epiResult: finalResult,
//         sessionUuid: epiSessionUuid,
//         deniedReason: null,
//       }));

//       console.log(`[EPI] Resultado final — compliant: ${finalResult.compliant}`);

//       if (finalResult.compliant) {
//         setEpiStatusMsg("✅ EPI Completo — Acesso liberado");
//         setTimeout(() => setScreen("access_granted"), 1200);
//       } else {
//         setEpiStatusMsg("❌ EPI Incompleto — Acesso negado");
//         const missing = (
//           finalResult.missing ||
//           finalResult.missing_ppe ||
//           []
//         ).map(epiLabel);
//         setSession((prev) => ({
//           ...prev,
//           missingEpi: missing,
//           deniedReason: "epi_incomplete",
//         }));
//         setDoorStatus("closed");
//         setTimeout(() => setScreen("access_denied"), 1200);
//       }
//     } catch (e) {
//       console.error("[useCamAutomation] EPI capture failed:", e);
//       setEpiStep("error");
//       const errorMsg =
//         (e as any)?.response?.data?.detail ||
//         (e as Error)?.message ||
//         "Erro desconhecido";
//       setEpiStatusMsg(`Erro na detecção de EPI: ${errorMsg}`);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
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
//       console.error("[useCamAutomation] saveConfig failed:", e);
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
//       step: faceStep,
//       captureUrl: faceCaptureUrl,
//       progress: faceProgress,
//       statusMsg: faceStatusMsg,
//       subMsg: faceSubMsg,
//       countdown: faceCountdown,
//     },

//     epiScanState: {
//       step: epiStep,
//       captureUrl1: epiCaptureUrl1,
//       captureUrl2: epiCaptureUrl2,
//       statusMsg: epiStatusMsg,
//       countdown: epiCountdown,
//       result: epiResult,
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

// import { useState, useEffect, useCallback, useRef } from "react";
// import axios from "axios";

// // ─────────────────────────────────────────────────────────────────────────────
// // API LAYER (interno ao hook — nenhum screen/component precisa importar)
// // ─────────────────────────────────────────────────────────────────────────────

// const getApiBaseUrl = (): string => {
//   const saved = sessionStorage.getItem("apiEndpoint");
//   return saved ?? "https://aihub.smartxhub.cloud";
// };

// const makeHttp = () =>
//   axios.create({ baseURL: getApiBaseUrl(), timeout: 60000 });

// const EPI = "https://aihub.smartxhub.cloud/api/v1/epi";

// // ─── Parâmetros de filtro para getPeople ─────────────────────────────────────
// export interface PeopleFilters {
//   activeOnly?: boolean;
//   isInside?: boolean;
//   hasPhotos?: boolean;
//   search?: string;
//   limit?: number;
//   offset?: number;
// }

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

//   getPeople: async (params: PeopleFilters = {}): Promise<WorkerRecord[]> => {
//     const { data } = await makeHttp().get(`${EPI}/analytics/people`, {
//       params: {
//         active_only: params.activeOnly ?? false,
//         is_inside:   params.isInside,
//         has_photos:  params.hasPhotos,
//         search:      params.search,
//         limit:       params.limit  ?? 500,
//         offset:      params.offset ?? 0,
//       },
//     });
//     return Array.isArray(data) ? data : ((data as { people?: WorkerRecord[] }).people ?? []);
//   },

//   getEpiConfig: async (): Promise<EpiConfig> => {
//     const { data } = await makeHttp().get(`${EPI}/config`);
//     return {
//       required_ppe: data.config?.required_ppe ?? [],
//       available_classes: data.all_classes
//         ? (Object.values(data.all_classes) as string[])
//         : [],
//       config: data.config,
//     };
//   },

//   saveEpiConfig: async (config: { required_ppe: string[] }): Promise<void> => {
//     await makeHttp().post(`${EPI}/config`, config);
//   },

//   startValidationSession: async (
//     overrides: Record<string, unknown> = {},
//   ): Promise<{ session_uuid: string; sessionUuid?: string }> => {
//     const form = new FormData();
//     form.append("door_id", String(overrides.door_id ?? "DOOR_01"));
//     form.append("direction", String(overrides.direction ?? "ENTRY"));
//     form.append("zone_id", String(overrides.zone_id ?? ""));
//     form.append("compliance_mode", "majority");
//     form.append("photo_count_required", "1");
//     form.append("timeout_seconds", "30");
//     const { data } = await makeHttp().post(`${EPI}/validation/start`, form);
//     return data;
//   },

//   sendValidationPhoto: async (
//     sessionUuid: string,
//     frameBlob: Blob,
//     opts: { photoType?: string; cameraId?: number } = {},
//   ): Promise<PhotoResult> => {
//     const form = new FormData();
//     form.append("session_uuid", sessionUuid);
//     form.append("file", frameBlob, "frame.jpg");
//     if (opts.cameraId !== undefined)
//       form.append("camera_id", String(opts.cameraId));
//     if (opts.photoType) form.append("photo_type", opts.photoType);
//     const { data } = await makeHttp().post(`${EPI}/validation/photo`, form, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return data;
//   },

//   closeValidationSession: async (sessionUuid: string, personCode?: string): Promise<void> => {
//     const form = new FormData();
//     form.append("session_uuid", sessionUuid);
//     if (personCode) form.append("person_code_override", personCode);
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
//       if (payload.personCode) form.append("person_code", payload.personCode);
//       if (payload.personName) form.append("person_name", payload.personName);
//       if (payload.sessionUuid) form.append("session_uuid", payload.sessionUuid);
//       form.append("reason", payload.reason);
//       await makeHttp().post(`${EPI}/door/open`, form);
//     } catch (e) {
//       console.warn("[openDoor] endpoint não disponível:", e);
//     }
//   },

//   // HTTP REST fallback — usado apenas se WebSocket não estiver disponível
//   unlockDoor: async (lockIp: string, durationMs = 5000): Promise<void> => {
//     console.log(`[unlockDoor] POST http://${lockIp}/unlock { duration_ms: ${durationMs} }`);
//     const res = await fetch(`http://${lockIp}/unlock`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ duration_ms: durationMs }),
//     });
//     if (!res.ok) throw new Error(`ESP32 HTTP ${res.status}: ${res.statusText}`);
//     const data = await res.json();
//     if (!data.ok) throw new Error(`ESP32 recusou o unlock: ${JSON.stringify(data)}`);
//     console.log(`[unlockDoor] ✅ ESP32 destrancado — state: ${data.state}, duration: ${data.duration_ms}ms`);
//   },
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.88): Promise<Blob> {
//   return new Promise((resolve) =>
//     canvas.toBlob((b) => resolve(b!), "image/jpeg", quality),
//   );
// }

// export function formatMinutes(mins: number | null | undefined): string {
//   if (mins == null) return "—";
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
//   | "idle"
//   | "face_scan"
//   | "time_alert"
//   | "epi_scan"
//   | "access_granted"
//   | "access_denied";

// export type Direction = "ENTRY" | "EXIT";

// /**
//  * DoorStatus — agora reflete o estado REAL do ESP32 via WebSocket
//  *
//  * closed      → lock_state=locked  + door_state=closed  (estado normal)
//  * open        → lock_state=unlocked                      (fechadura destravada)
//  * door_open   → door_state=open    (porta fisicamente aberta, reed switch)
//  * alert       → falha de comunicação ou unlock negado
//  * waiting     → aguardando primeira resposta do WebSocket
//  */
// export type DoorStatus = "closed" | "open" | "door_open" | "alert" | "waiting";

// export type CamRole = "face" | "body1" | "body2";
// export type CameraSourceType = "local" | "ip_url";

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
//   total_minutes: number;
//   limit_minutes: number;
//   entries_today?: number;
// }

// export interface EpiResult {
//   compliant: boolean;
//   detected?: string[];
//   detected_ppe?: string[];
//   missing?: string[];
//   missing_ppe?: string[];
// }

// export interface Session {
//   sessionUuid: string | null;
//   person: Person | null;
//   dailyExposure: DailyExposure | null;
//   epiResult: EpiResult | null;
//   missingEpi: string[];
//   deniedReason?: "user_not_found" | "epi_incomplete" | null;
// }

// export interface SysConfig {
//   companyId: number;
//   zoneId: number;
//   doorId: string;
//   dailyLimitMin: number;
//   overLimitPolicy: "warn" | "block";
//   doorOpenMaxMin: number;
//   faceConfidenceMin: number;
//   apiBase: string;
//   useSingleCamera: boolean;
//   cameraSourceType: Record<CamRole, CameraSourceType>;
//   cameraIpUrl: Record<CamRole, string | null>;
//   lockIpAddress: string;
//   lockDurationMs: number;
// }

// export interface EpiConfig {
//   required_ppe: string[];
//   available_classes?: string[];
//   config?: Record<string, unknown>;
// }

// export interface DashboardData {
//   inside_count?: number;
//   people_inside?: number;
//   entries_today?: number;
//   today?: { total?: number };
//   open_alerts?: number;
//   alerts_open?: number;
//   over_limit_count?: number;
// }

// export interface WorkerRecord {
//   person_code: string;
//   person_name: string;
//   department?: string;
//   badge_id?: string;
//   is_inside?: boolean;
//   face_photos_count?: number;
//   last_entry_at?: string | null;
//   last_exit_at?: string | null;
//   active?: boolean;
//   created_at?: string;
//   daily_accumulated_min?: number;
//   total_minutes?: number;
//   total_entries?: number;
//   sessions_today?: number;
// }

// export interface CamDevice {
//   deviceId: string;
//   label: string;
//   kind: string;
// }

// export interface CameraHook {
//   devices: CamDevice[];
//   assignments: Record<CamRole, string | null>;
//   streams: Partial<Record<CamRole, MediaStream>>;
//   loading: boolean;
//   error: string | null;
//   enumerateDevices: () => Promise<CamDevice[]>;
//   startStream: (role: CamRole) => Promise<MediaStream | null>;
//   stopStream: (role: CamRole) => void;
//   stopAllStreams: () => void;
//   captureFrame: (role: CamRole) => Promise<{ blob: Blob; dataUrl: string; canvas: HTMLCanvasElement }>;
//   assignDevice: (role: CamRole, deviceId: string | null) => void;
//   setVideoRef: (role: CamRole, element: HTMLVideoElement | null) => void;
//   hasStream: (role: CamRole) => boolean;
//   getAssignment: (role: CamRole) => string | null;
//   sourceTypes: Record<CamRole, CameraSourceType>;
//   ipUrls: Record<CamRole, string | null>;
//   setSourceType: (role: CamRole, type: CameraSourceType) => void;
//   setIpUrl: (role: CamRole, url: string | null) => void;
// }

// // ─── Tipos do WebSocket MIXHUB ────────────────────────────────────────────────

// export type LockWsEvent =
//   | "connected"
//   | "status"
//   | "locked"
//   | "unlocked"
//   | "door_open"
//   | "door_closed"
//   | "button_press";

// export interface LockWsMessage {
//   event: LockWsEvent;
//   lock_state?: "locked" | "unlocked";
//   door_state?: "open" | "closed";
//   led?: string;
//   duration_ms?: number;
//   event_count?: number;
//   btn_count?: number;
//   btn_exit_count?: number;
//   uptime_ms?: number;
//   ip?: string;
//   version?: string;
//   ws_clients?: number;
// }

// /**
//  * Estado completo do WebSocket da fechadura MIXHUB.
//  * Exposto via useCamAutomation → lockState
//  */
// export interface LockState {
//   /** true = WebSocket conectado ao ESP32 */
//   connected: boolean;
//   /** Estado atual da fechadura: "locked" | "unlocked" */
//   lockState: "locked" | "unlocked" | null;
//   /** Estado físico da porta (reed switch): "open" | "closed" */
//   doorState: "open" | "closed" | null;
//   /** Cor do LED atual */
//   led: string | null;
//   /** Versão do firmware */
//   version: string | null;
//   /** Número de destrancamentos desde o boot */
//   eventCount: number;
//   /** Último evento recebido */
//   lastEvent: LockWsEvent | null;
//   /** Timestamp do último evento */
//   lastEventAt: Date | null;
//   /** Erro de conexão, se houver */
//   error: string | null;
//   /** Envia comando de unlock via WebSocket */
//   sendUnlock: (durationMs?: number) => void;
//   /** Envia comando de lock via WebSocket */
//   sendLock: () => void;
//   /** Envia comando de LED via WebSocket */
//   sendLed: (color: "red" | "green" | "blue" | "yellow" | "off") => void;
// }

// // ─── Tipos internos da API ────────────────────────────────────────────────────

// interface PhotoResult {
//   session_uuid?: string;
//   photo_seq?: number;
//   photo_count_received?: number;
//   photo_count_required?: number;
//   session_complete?: boolean;
//   face_detected?: boolean;
//   face_recognized?: boolean;
//   face_confidence?: number;
//   face_person_code?: string;
//   person_code?: string;
//   person_name?: string;
//   confidence?: number;
//   epi_compliant?: boolean;
//   compliant?: boolean;
//   compliance_score?: number;
//   missing?: string[];
//   missing_ppe?: string[];
//   detected?: string[];
//   detected_ppe?: string[];
//   final_decision?: {
//     access_decision: string;
//     epi_compliant: boolean;
//     face_confirmed: boolean;
//     face_confidence_max?: number;
//     person_code?: string;
//     person_name?: string;
//   } | null;
//   daily_exposure?: DailyExposure;
// }

// // ─── Estados por screen/modal ─────────────────────────────────────────────────

// export type FaceScanStep = "ready" | "capturing" | "processing" | "done" | "error";

// export interface FaceScanState {
//   step: FaceScanStep;
//   captureUrl: string | null;
//   progress: number;
//   statusMsg: string;
//   subMsg: string;
//   countdown: number | null;
// }

// export type EpiScanStep = "ready" | "capturing" | "processing" | "done" | "error";

// export interface EpiScanState {
//   step: EpiScanStep;
//   captureUrl1: string | null;
//   captureUrl2: string | null;
//   statusMsg: string;
//   countdown: number | null;
//   result: EpiResult | null;
// }

// export interface IdleState {
//   dashboard: DashboardData | null;
//   loadingDash: boolean;
//   refreshDashboard: () => void;
// }

// export interface ConfigState {
//   localConfig: SysConfig;
//   epiConfig: EpiConfig | null;
//   saving: boolean;
//   saved: boolean;
//   setLocalConfig: (cfg: SysConfig) => void;
//   setEpiConfig: (cfg: EpiConfig | null) => void;
//   handleSave: () => Promise<void>;
// }

// export interface PermanenceState {
//   people: WorkerRecord[];
//   loading: boolean;
//   fetchPeople: (filters?: PeopleFilters) => Promise<void>;
// }

// export interface UseCamAutomationReturn {
//   screen: Screen;
//   direction: Direction;
//   doorStatus: DoorStatus;
//   session: Session;
//   sysConfig: SysConfig;
//   showReport: boolean;
//   showConfig: boolean;
//   setShowReport: (v: boolean) => void;
//   setShowConfig: (v: boolean) => void;
//   cameraHook: CameraHook;
//   idleState: IdleState;
//   faceScanState: FaceScanState;
//   epiScanState: EpiScanState;
//   configState: ConfigState;
//   permanenceState: PermanenceState;
//   /** Estado completo do WebSocket da fechadura MIXHUB */
//   lockState: LockState;
//   handleStartEntry: () => void;
//   handleStartExit: () => void;
//   handleGoIdle: () => void;
//   handleTimeOverride: () => void;
//   handleRetryFromDenied: () => void;
//   handleSaveConfig: (newConfig: Partial<SysConfig>) => void;
//   handleCaptureFace: () => Promise<void>;
//   handleRetryFace: () => void;
//   handleCaptureEpi: () => Promise<void>;
//   handleRetryEpi: () => void;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // CONSTANTES
// // ─────────────────────────────────────────────────────────────────────────────

// const LS_KEYS: Record<CamRole, string> = {
//   face: "epi_cam_face",
//   body1: "epi_cam_body1",
//   body2: "epi_cam_body2",
// };
// const LS_KEYS_TYPE: Record<CamRole, string> = {
//   face: "epi_cam_face_type",
//   body1: "epi_cam_body1_type",
//   body2: "epi_cam_body2_type",
// };
// const LS_KEYS_URL: Record<CamRole, string> = {
//   face: "epi_cam_face_url",
//   body1: "epi_cam_body1_url",
//   body2: "epi_cam_body2_url",
// };

// const EMPTY_SESSION: Session = {
//   sessionUuid: null,
//   person: null,
//   dailyExposure: null,
//   epiResult: null,
//   missingEpi: [],
//   deniedReason: null,
// };

// const DEFAULT_CONFIG: SysConfig = {
//   companyId: 1,
//   zoneId: 10,
//   doorId: "DOOR_CAMARA_FRIA_01",
//   dailyLimitMin: 120,
//   overLimitPolicy: "warn",
//   doorOpenMaxMin: 15,
//   faceConfidenceMin: 70,
//   apiBase: "https://aihub.smartxhub.cloud",
//   useSingleCamera: false,
//   cameraSourceType: { face: "local", body1: "local", body2: "local" },
//   cameraIpUrl: { face: null, body1: null, body2: null },
//   lockIpAddress: "192.168.68.100",
//   lockDurationMs: 5000,
// };

// const EPI_LABELS_PT: Record<string, string> = {
//   helmet: "Capacete", vest: "Colete", gloves: "Luvas", boots: "Botas",
//   thermal_coat: "Jaqueta Térmica", thermal_pants: "Calça Térmica",
//   glasses: "Óculos de Proteção", mask: "Máscara", apron: "Avental", hardhat: "Capacete",
// };

// const epiLabel = (k: string) => EPI_LABELS_PT[k] ?? k;

// // ─────────────────────────────────────────────────────────────────────────────
// // HELPER: captura de frame de câmera IP via URL
// // ─────────────────────────────────────────────────────────────────────────────

// async function captureFrameFromUrl(url: string): Promise<Blob> {
//   const proxyUrl = `${getApiBaseUrl()}/api/v1/epi/camera/snapshot/v4?url=${encodeURIComponent(url)}`;
//   const response = await fetch(proxyUrl);
//   if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//   return response.blob();
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HELPER: resolve campo compliant
// // ─────────────────────────────────────────────────────────────────────────────

// function resolveCompliant(photo: PhotoResult): boolean {
//   return (
//     photo.epi_compliant ??
//     photo.final_decision?.epi_compliant ??
//     photo.compliant ??
//     false
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HOOK: useLockWebSocket — WebSocket MIXHUB ESP32 (ws://<ip>:81)
// //
// // Eventos recebidos (Servidor → Cliente):
// //   connected   → status completo ao conectar
// //   status      → broadcast automático a cada 10s
// //   locked      → fechadura travada
// //   unlocked    → fechadura destravada { duration_ms, event_count }
// //   door_open   → reed switch: porta aberta fisicamente
// //   door_closed → reed switch: porta fechada fisicamente
// //   button_press→ botão de saída pressionado
// //
// // Comandos enviados (Cliente → Servidor):
// //   { action: "unlock", duration_ms: 5000 }
// //   { action: "lock" }
// //   { action: "led", color: "green" }
// //   { action: "status" }
// // ─────────────────────────────────────────────────────────────────────────────

// function useLockWebSocket(
//   lockIp: string,
//   onDoorStatusChange?: (status: DoorStatus) => void,
// ): LockState {
//   const [connected, setConnected] = useState(false);
//   const [lockState, setLockState] = useState<"locked" | "unlocked" | null>(null);
//   const [doorState, setDoorState] = useState<"open" | "closed" | null>(null);
//   const [led, setLed] = useState<string | null>(null);
//   const [version, setVersion] = useState<string | null>(null);
//   const [eventCount, setEventCount] = useState(0);
//   const [lastEvent, setLastEvent] = useState<LockWsEvent | null>(null);
//   const [lastEventAt, setLastEventAt] = useState<Date | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const wsRef = useRef<WebSocket | null>(null);
//   const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const reconnectDelay = useRef(2000);
//   // Ref para o callback para evitar stale closure no listener
//   const onStatusChangeRef = useRef(onDoorStatusChange);
//   onStatusChangeRef.current = onDoorStatusChange;

//   const connect = useCallback(() => {
//     if (!lockIp) return;
//     const url = `ws://${lockIp}:81`;
//     console.log(`[LockWS] Conectando a ${url}`);

//     const ws = new WebSocket(url);
//     wsRef.current = ws;

//     ws.onopen = () => {
//       console.log("[LockWS] ✅ Conectado");
//       setConnected(true);
//       setError(null);
//       reconnectDelay.current = 2000;
//     };

//     ws.onmessage = (ev) => {
//       let msg: LockWsMessage;
//       try {
//         msg = JSON.parse(ev.data);
//       } catch {
//         console.warn("[LockWS] Mensagem não-JSON:", ev.data);
//         return;
//       }

//       console.log("[LockWS] ←", msg);
//       setLastEvent(msg.event);
//       setLastEventAt(new Date());

//       // Atualiza estado completo nos eventos que carregam status
//       if (msg.event === "connected" || msg.event === "status") {
//         if (msg.lock_state) setLockState(msg.lock_state);
//         if (msg.door_state) setDoorState(msg.door_state);
//         if (msg.led)        setLed(msg.led);
//         if (msg.version)    setVersion(msg.version);
//         if (msg.event_count !== undefined) setEventCount(msg.event_count);

//         // Notifica DoorStatus para a máquina de estados principal
//         if (msg.lock_state === "unlocked") {
//           onStatusChangeRef.current?.("open");
//         } else if (msg.door_state === "open") {
//           onStatusChangeRef.current?.("door_open");
//         } else {
//           onStatusChangeRef.current?.("closed");
//         }
//       }

//       if (msg.event === "unlocked") {
//         setLockState("unlocked");
//         if (msg.event_count !== undefined) setEventCount(msg.event_count);
//         onStatusChangeRef.current?.("open");
//       }

//       if (msg.event === "locked") {
//         setLockState("locked");
//         // Mantém door_open se a porta ainda está fisicamente aberta
//         if (doorState !== "open") {
//           onStatusChangeRef.current?.("closed");
//         }
//       }

//       if (msg.event === "door_open") {
//         setDoorState("open");
//         onStatusChangeRef.current?.("door_open");
//       }

//       if (msg.event === "door_closed") {
//         setDoorState("closed");
//         // Só volta a "closed" se a fechadura também estiver travada
//         if (lockState !== "unlocked") {
//           onStatusChangeRef.current?.("closed");
//         }
//       }

//       if (msg.event === "button_press") {
//         console.log(`[LockWS] Botão de saída pressionado (count: ${msg.btn_count})`);
//       }
//     };

//     ws.onerror = (ev) => {
//       console.error("[LockWS] Erro:", ev);
//       setError("Erro de conexão com a fechadura");
//       onStatusChangeRef.current?.("alert");
//     };

//     ws.onclose = (ev) => {
//       console.warn(`[LockWS] Conexão fechada (code: ${ev.code}). Reconectando em ${reconnectDelay.current}ms…`);
//       setConnected(false);
//       wsRef.current = null;

//       // Reconnect com backoff exponencial (máx 30s)
//       reconnectTimer.current = setTimeout(() => {
//         reconnectDelay.current = Math.min(reconnectDelay.current * 1.5, 30000);
//         connect();
//       }, reconnectDelay.current);
//     };
//   }, [lockIp]); // eslint-disable-line react-hooks/exhaustive-deps

//   // Inicia/reinicia conexão quando o IP muda
//   useEffect(() => {
//     if (!lockIp) return;

//     // Limpa conexão anterior
//     if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
//     if (wsRef.current) {
//       wsRef.current.onclose = null; // evita reconexão automática
//       wsRef.current.close();
//       wsRef.current = null;
//     }

//     setConnected(false);
//     setLockState(null);
//     setDoorState(null);
//     setError(null);

//     connect();

//     return () => {
//       if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
//       if (wsRef.current) {
//         wsRef.current.onclose = null;
//         wsRef.current.close();
//         wsRef.current = null;
//       }
//     };
//   }, [lockIp, connect]);

//   // ── Comandos → ESP32 via WebSocket ────────────────────────────────────────

//   const send = useCallback((payload: object) => {
//     if (wsRef.current?.readyState === WebSocket.OPEN) {
//       wsRef.current.send(JSON.stringify(payload));
//       console.log("[LockWS] →", payload);
//     } else {
//       console.warn("[LockWS] WebSocket não conectado — comando ignorado:", payload);
//     }
//   }, []);

//   const sendUnlock = useCallback((durationMs?: number) => {
//     send({ action: "unlock", duration_ms: durationMs ?? DEFAULT_CONFIG.lockDurationMs });
//   }, [send]);

//   const sendLock = useCallback(() => {
//     send({ action: "lock" });
//   }, [send]);

//   const sendLed = useCallback((color: "red" | "green" | "blue" | "yellow" | "off") => {
//     send({ action: "led", color });
//   }, [send]);

//   return {
//     connected,
//     lockState,
//     doorState,
//     led,
//     version,
//     eventCount,
//     lastEvent,
//     lastEventAt,
//     error,
//     sendUnlock,
//     sendLock,
//     sendLed,
//   };
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HOOK DE CÂMERAS (interno)
// // ─────────────────────────────────────────────────────────────────────────────
// //@ts-ignore
// function useCameraInternal(sysConfig: SysConfig): CameraHook {
//   const [devices, setDevices] = useState<CamDevice[]>([]);
//   const [assignments, setAssignments] = useState<Record<CamRole, string | null>>({
//     face: localStorage.getItem(LS_KEYS.face) || null,
//     body1: localStorage.getItem(LS_KEYS.body1) || null,
//     body2: localStorage.getItem(LS_KEYS.body2) || null,
//   });
//   const [sourceTypes, setSourceTypes] = useState<Record<CamRole, CameraSourceType>>({
//     face:  (localStorage.getItem(LS_KEYS_TYPE.face)  as CameraSourceType) || "local",
//     body1: (localStorage.getItem(LS_KEYS_TYPE.body1) as CameraSourceType) || "local",
//     body2: (localStorage.getItem(LS_KEYS_TYPE.body2) as CameraSourceType) || "local",
//   });
//   const [ipUrls, setIpUrls] = useState<Record<CamRole, string | null>>({
//     face:  localStorage.getItem(LS_KEYS_URL.face)  || null,
//     body1: localStorage.getItem(LS_KEYS_URL.body1) || null,
//     body2: localStorage.getItem(LS_KEYS_URL.body2) || null,
//   });
//   const [streams, setStreams] = useState<Partial<Record<CamRole, MediaStream>>>({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const videoRefs = useRef<Partial<Record<CamRole, HTMLVideoElement | null>>>({});

//   const enumerateDevices = useCallback(async (): Promise<CamDevice[]> => {
//     try {
//       await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
//         .then((s) => s.getTracks().forEach((t) => t.stop())).catch(() => {});
//       const all = await navigator.mediaDevices.enumerateDevices();
//       const vids = all.filter((d) => d.kind === "videoinput") as CamDevice[];
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
//     if (sourceTypes[role] === "ip_url") return null;
//     const deviceId = assignments[role];
//     if (!deviceId) return null;
//     streams[role]?.getTracks().forEach((t) => t.stop());
//     try {
//       setLoading(true);
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 }, //@ts-ignore
//           zoom: 1.0 },
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
//     if (sourceTypes[role] === "ip_url") {
//       const url = ipUrls[role];
//       if (!url) throw new Error(`URL não configurada para câmera ${role}`);
//       const blob = await captureFrameFromUrl(url);
//       const dataUrl = URL.createObjectURL(blob);
//       const canvas = document.createElement("canvas");
//       return { blob, dataUrl, canvas };
//     }
//     const video = videoRefs.current[role];
//     if (!video || video.readyState < 2) throw new Error(`Câmera "${role}" não está pronta.`);
//     const canvas = document.createElement("canvas");
//     canvas.width = video.videoWidth || 1280;
//     canvas.height = video.videoHeight || 720;
//     canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
//     const blob = await canvasToBlob(canvas, 0.88);
//     const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
//     return { blob, dataUrl, canvas };
//   }, [sourceTypes, ipUrls]);

//   const assignDevice = useCallback((role: CamRole, deviceId: string | null) => {
//     setAssignments((prev) => ({ ...prev, [role]: deviceId }));
//     localStorage.setItem(LS_KEYS[role], deviceId || "");
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
//     if (url) localStorage.setItem(LS_KEYS_URL[role], url);
//     else     localStorage.removeItem(LS_KEYS_URL[role]);
//   }, []);

//   useEffect(() => {
//     enumerateDevices();
//     const handler = () => enumerateDevices();
//     navigator.mediaDevices.addEventListener("devicechange", handler);
//     return () => {
//       navigator.mediaDevices.removeEventListener("devicechange", handler);
//       stopAllStreams();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return {
//     devices, assignments, streams, loading, error,
//     enumerateDevices, startStream, stopStream, stopAllStreams,
//     captureFrame, assignDevice, setVideoRef,
//     hasStream: (role) => !!streams[role],
//     getAssignment: (role) => assignments[role],
//     sourceTypes, ipUrls, setSourceType, setIpUrl,
//   };
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HOOK PRINCIPAL
// // ─────────────────────────────────────────────────────────────────────────────

// export function useCamAutomation(): UseCamAutomationReturn {
//   const [screen, setScreen] = useState<Screen>("idle");
//   const [direction, setDirection] = useState<Direction>("ENTRY");
//   const [doorStatus, setDoorStatus] = useState<DoorStatus>("closed");
//   const [session, setSession] = useState<Session>(EMPTY_SESSION);
//   const [sysConfig, setSysConfig] = useState<SysConfig>(DEFAULT_CONFIG);
//   const [showReport, setShowReport] = useState(false);
//   const [showConfig, setShowConfig] = useState(false);

//   const cameraHook = useCameraInternal(sysConfig);

//   const [dashboard, setDashboard] = useState<DashboardData | null>(null);
//   const [loadingDash, setLoadingDash] = useState(true);

//   const [faceStep, setFaceStep] = useState<FaceScanStep>("ready");
//   const [faceCaptureUrl, setFaceCaptureUrl] = useState<string | null>(null);
//   const [faceProgress, setFaceProgress] = useState(0);
//   const [faceStatusMsg, setFaceStatusMsg] = useState("Posicione seu rosto na câmera e toque em Capturar");
//   const [faceSubMsg, setFaceSubMsg] = useState("");
//   const [faceCountdown, setFaceCountdown] = useState<number | null>(null);
//   const faceAutoCapture = useRef(false);

//   const [epiStep, setEpiStep] = useState<EpiScanStep>("ready");
//   const [epiCaptureUrl1, setEpiCaptureUrl1] = useState<string | null>(null);
//   const [epiCaptureUrl2, setEpiCaptureUrl2] = useState<string | null>(null);
//   const [epiStatusMsg, setEpiStatusMsg] = useState("Posicione-se em frente às câmeras de corpo");
//   const [epiCountdown, setEpiCountdown] = useState<number | null>(null);
//   const [epiResult, setEpiResult] = useState<EpiResult | null>(null);
//   const epiAutoCapture = useRef(false);

//   const sessionRef = useRef<Session>(EMPTY_SESSION);
//   const unlockFiredRef = useRef(false);

//   const [localConfig, setLocalConfig] = useState<SysConfig>(DEFAULT_CONFIG);
//   const [epiConfig, setEpiConfig] = useState<EpiConfig | null>(null);
//   const [saving, setSaving] = useState(false);
//   const [saved, setSaved] = useState(false);

//   const [people, setPeople] = useState<WorkerRecord[]>([]);
//   const [loadingPeople, setLoadingPeople] = useState(false);

//   // ─── WebSocket MIXHUB ─────────────────────────────────────────────────────
//   //
//   // Callback que atualiza doorStatus com base nos eventos reais do ESP32.
//   // Separado do unlockFiredRef para não interferir com a lógica de unlock HTTP.

//   const handleLockStatusChange = useCallback((status: DoorStatus) => {
//     setDoorStatus(status);
//   }, []);

//   const lockState = useLockWebSocket(
//     sysConfig.lockIpAddress,
//     handleLockStatusChange,
//   );

//   // ─── Sync session → sessionRef ────────────────────────────────────────────
//   useEffect(() => { sessionRef.current = session; }, [session]);

//   // ─── Helpers de reset ─────────────────────────────────────────────────────
//   const resetSession = useCallback(() => setSession(EMPTY_SESSION), []);

//   const resetFaceScan = useCallback((withAutoCapture = false) => {
//     faceAutoCapture.current = withAutoCapture;
//     setFaceStep("ready");
//     setFaceCaptureUrl(null);
//     setFaceProgress(0);
//     setFaceStatusMsg("Posicione seu rosto na câmera e toque em Capturar");
//     setFaceSubMsg("");
//     setFaceCountdown(null);
//   }, []);

//   const resetEpiScan = useCallback((withAutoCapture = false) => {
//     epiAutoCapture.current = withAutoCapture;
//     setEpiStep("ready");
//     setEpiCaptureUrl1(null);
//     setEpiCaptureUrl2(null);
//     setEpiStatusMsg("Posicione-se em frente às câmeras de corpo");
//     setEpiCountdown(null);
//     setEpiResult(null);
//   }, []);

//   // ─── Config inicial ───────────────────────────────────────────────────────
//   useEffect(() => {
//     api.getLocalConfig()
//       .then((cfg) => {
//         setSysConfig((prev) => ({ ...prev, ...cfg }));
//         setLocalConfig((prev) => ({ ...prev, ...cfg }));
//       })
//       .catch((e: Error) => console.warn("[useCamAutomation] Config load failed:", e.message));
//   }, []);

//   // ─── Dashboard polling ────────────────────────────────────────────────────
//   const refreshDashboard = useCallback(async () => {
//     try {
//       const data = await api.getDashboard();
//       setDashboard(data);
//     } catch (e) {
//       console.warn("[useCamAutomation] Dashboard failed:", e);
//     } finally {
//       setLoadingDash(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (screen !== "idle") return;
//     refreshDashboard();
//     const t = setInterval(refreshDashboard, 30000);
//     return () => clearInterval(t);
//   }, [screen, refreshDashboard]);

//   // ─── Config modal ─────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!showConfig) return;
//     setLocalConfig({ ...sysConfig });
//     api.getEpiConfig().then(setEpiConfig).catch(console.warn);
//   }, [showConfig, sysConfig]);

//   // ─── People ───────────────────────────────────────────────────────────────
//   const fetchPeople = useCallback(async (filters: PeopleFilters = {}) => {
//     try {
//       setLoadingPeople(true);
//       const list = await api.getPeople({ activeOnly: false, ...filters });
//       setPeople(list);
//     } catch (e) {
//       console.error("[useCamAutomation] fetchPeople failed:", e);
//     } finally {
//       setLoadingPeople(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (showReport) fetchPeople();
//   }, [showReport, fetchPeople]);

//   // ─────────────────────────────────────────────────────────────────────────
//   // UNLOCK DA PORTA — ao entrar em access_granted
//   //
//   // Usa WebSocket preferenciamente (lockState.sendUnlock).
//   // Fallback para HTTP REST se o WebSocket não estiver conectado.
//   // ─────────────────────────────────────────────────────────────────────────

//   useEffect(() => {
//     if (screen !== "access_granted") {
//       unlockFiredRef.current = false;
//       return;
//     }
//     if (unlockFiredRef.current) return;
//     unlockFiredRef.current = true;

//     const lockMs = sysConfig.lockDurationMs;
//     const lockIp = sysConfig.lockIpAddress;

//     console.log("[unlock] Tela access_granted — acionando fechadura");

//     if (lockState.connected) {
//       // ── Prefere WebSocket (mais confiável, sem CORS, bidirecional) ────────
//       console.log("[unlock] Via WebSocket");
//       lockState.sendUnlock(lockMs);
//       // LED verde por feedback visual
//       lockState.sendLed("green");
//       // doorStatus será atualizado automaticamente pelo evento "unlocked" do WS
//     } else {
//       // ── Fallback: HTTP REST ───────────────────────────────────────────────
//       console.log("[unlock] WebSocket offline — fallback HTTP REST");
//       api.unlockDoor(lockIp, lockMs)
//         .then(() => {
//           setDoorStatus("open");
//           console.log("[unlock] ✅ HTTP unlock OK");
//         })
//         .catch((e) => {
//           console.error("[unlock] ❌ HTTP unlock falhou:", e);
//           setDoorStatus("alert");
//         });
//     }

//     // Log de auditoria no backend Python (fire-and-forget)
//     api.openDoor({
//       personCode: sessionRef.current.person?.personCode,
//       personName: sessionRef.current.person?.personName,
//       sessionUuid: sessionRef.current.sessionUuid,
//       reason: "EPI_COMPLIANT",
//     }).catch((e) => console.warn("[unlock] Backend audit log falhou:", e));

//   }, [screen, sysConfig.lockIpAddress, sysConfig.lockDurationMs, lockState.connected]); // eslint-disable-line react-hooks/exhaustive-deps

//   // ─── Auto-capture: face ───────────────────────────────────────────────────
//   useEffect(() => {
//     if (screen !== "face_scan" || !faceAutoCapture.current || faceStep !== "ready") return;
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
//     if (screen !== "epi_scan" || !epiAutoCapture.current || epiStep !== "ready") return;
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
//     setDirection("ENTRY"); resetSession(); resetFaceScan(true);
//     cameraHook.startStream("face"); setScreen("face_scan");
//   }, [resetSession, resetFaceScan, cameraHook]);

//   const handleStartExit = useCallback(() => {
//     setDirection("EXIT"); resetSession(); resetFaceScan(true);
//     cameraHook.startStream("face"); setScreen("face_scan");
//   }, [resetSession, resetFaceScan, cameraHook]);

//   const handleGoIdle = useCallback(() => {
//     cameraHook.stopAllStreams(); resetSession();
//     resetFaceScan(false); resetEpiScan(false);
//     setDoorStatus("closed"); setScreen("idle");
//   }, [cameraHook, resetSession, resetFaceScan, resetEpiScan]);

//   const handleTimeOverride = useCallback(() => {
//     resetEpiScan(true);
//     if (!sysConfig.useSingleCamera) {
//       cameraHook.startStream("body1");
//       if (cameraHook.getAssignment("body2")) cameraHook.startStream("body2");
//     }
//     setScreen("epi_scan");
//   }, [cameraHook, resetEpiScan, sysConfig.useSingleCamera]);

//   const handleRetryFromDenied = useCallback(() => {
//     setSession((prev) => ({ ...prev, epiResult: null, missingEpi: [], deniedReason: null }));
//     resetEpiScan(false); setScreen("epi_scan");
//   }, [resetEpiScan]);

//   const handleSaveConfig = useCallback((newConfig: Partial<SysConfig>) => {
//     setSysConfig((prev) => ({ ...prev, ...newConfig }));
//   }, []);

//   // ─── ACTION: Captura facial ───────────────────────────────────────────────
//   const handleCaptureFace = useCallback(async () => {
//     if (faceStep !== "ready") return;
//     faceAutoCapture.current = false;
//     try {
//       setFaceStep("capturing"); setFaceStatusMsg("Capturando frame…");
//       const { blob, dataUrl } = await cameraHook.captureFrame("face");
//       setFaceCaptureUrl(dataUrl);
//       setFaceStep("processing"); setFaceStatusMsg("Iniciando sessão de validação…"); setFaceProgress(20);

//       const sessionData = await api.startValidationSession({ direction, door_id: sysConfig.doorId, zone_id: sysConfig.zoneId });
//       const uuid = sessionData.session_uuid || sessionData.sessionUuid!;
//       setFaceProgress(40);

//       setFaceStatusMsg("Reconhecendo rosto…");
//       const photo = await api.sendValidationPhoto(uuid, blob, { photoType: "face", cameraId: 1 });
//       setFaceProgress(80);

//       const resolvedCode = (photo.face_person_code || photo.person_code || photo.final_decision?.person_code || "").trim();
//       const resolvedName = (photo.person_name || photo.final_decision?.person_name || "").trim();

//       if (resolvedCode && resolvedName) {
//         setFaceProgress(100); setFaceStep("done");
//         const resolvedConf = photo.face_confidence || photo.confidence || photo.final_decision?.face_confidence_max || 0;
//         setFaceStatusMsg(`Identificado: ${resolvedName}`);
//         setFaceSubMsg(`Confiança: ${Math.round(resolvedConf * 100)}%`);
//         const person: Person = { personCode: resolvedCode, personName: resolvedName, confidence: resolvedConf };
//         setSession((prev) => ({ ...prev, sessionUuid: uuid, person, dailyExposure: photo.daily_exposure ?? null }));

//         setTimeout(() => {
//           if (direction === "EXIT") { setScreen("idle"); return; }
//           const totalMin = photo.daily_exposure?.total_minutes ?? 0;
//           const limitMin = photo.daily_exposure?.limit_minutes ?? sysConfig.dailyLimitMin;
//           if (totalMin >= limitMin) { setScreen("time_alert"); }
//           else {
//             resetEpiScan(true);
//             cameraHook.startStream("body1");
//             if (cameraHook.getAssignment("body2")) cameraHook.startStream("body2");
//             setScreen("epi_scan");
//           }
//         }, 900);
//       } else {
//         setFaceStep("error"); setFaceStatusMsg("Rosto não reconhecido");
//         setFaceSubMsg("Usuário não encontrado — solicite acesso manual"); setFaceProgress(0);
//         setSession((prev) => ({ ...prev, person: null, deniedReason: "user_not_found" }));
//       }
//     } catch (e) {
//       const err = e as { response?: { data?: { detail?: string } }; message?: string };
//       setFaceStep("error"); setFaceStatusMsg("Erro ao processar");
//       setFaceSubMsg(err.response?.data?.detail || err.message || ""); setFaceProgress(0);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [faceStep, cameraHook, direction, sysConfig, resetEpiScan]);

//   const handleRetryFace = useCallback(() => resetFaceScan(false), [resetFaceScan]);

//   // ─── ACTION: Captura EPI ──────────────────────────────────────────────────
//   const handleCaptureEpi = useCallback(async () => {
//     if (epiStep !== "ready") return;
//     epiAutoCapture.current = false;

//     const personCode = sessionRef.current.person?.personCode?.trim();
//     const personName = sessionRef.current.person?.personName?.trim();
//     if (!personCode || !personName) {
//       console.warn("[EPI] Pessoa não identificada — acesso negado");
//       epiAutoCapture.current = false;
//       setEpiStep("error"); setEpiStatusMsg("❌ Usuário não encontrado — Acesso negado");
//       setDoorStatus("closed");
//       setSession((prev) => ({ ...prev, missingEpi: [], deniedReason: "user_not_found", epiResult: { compliant: false } }));
//       setTimeout(() => setScreen("access_denied"), 1500);
//       return;
//     }

//     const hasBody2 = !sysConfig.useSingleCamera && !!cameraHook.getAssignment("body2");
//     try {
//       setEpiStep("capturing"); setEpiStatusMsg("Capturando frames…");
//       const captureRole: CamRole = sysConfig.useSingleCamera ? "face" : "body1";
//       const { blob: blob1, dataUrl: url1 } = await cameraHook.captureFrame(captureRole);
//       setEpiCaptureUrl1(url1);

//       let blob2: Blob | null = null;
//       if (hasBody2) {
//         try {
//           const f2 = await cameraHook.captureFrame("body2");
//           setEpiCaptureUrl2(f2.dataUrl); blob2 = f2.blob;
//         } catch (e2) { console.warn("[EPI] Body2 capture failed:", (e2 as Error).message); }
//       }

//       setEpiStep("processing"); setEpiStatusMsg("Detectando EPIs… aguarde");
//       const epiSessionData = await api.startValidationSession({ direction, door_id: sysConfig.doorId, zone_id: sysConfig.zoneId });
//       const epiSessionUuid = epiSessionData.session_uuid || epiSessionData.sessionUuid!;
//       const photo1 = await api.sendValidationPhoto(epiSessionUuid, blob1, { photoType: "body", cameraId: 2 });
//       let finalResult: EpiResult = { ...photo1, compliant: resolveCompliant(photo1) };
//       console.log(`[EPI] photo1 — resolved: ${finalResult.compliant}`);

//       if (blob2) {
//         try {
//           const photo2 = await api.sendValidationPhoto(epiSessionUuid, blob2, { photoType: "body", cameraId: 3 });
//           const photo2Compliant = resolveCompliant(photo2);
//           if (!photo2Compliant) finalResult = { ...photo2, compliant: photo2Compliant };
//         } catch (e3) { console.warn("[EPI] Body2 send failed:", (e3 as Error).message); }
//       }

//       try { await api.closeValidationSession(epiSessionUuid, sessionRef.current.person?.personCode); } catch (_) {}

//       setEpiResult(finalResult); setEpiStep("done");
//       setSession((prev) => ({ ...prev, epiResult: finalResult, sessionUuid: epiSessionUuid, deniedReason: null }));

//       if (finalResult.compliant) {
//         setEpiStatusMsg("✅ EPI Completo — Acesso liberado");
//         setTimeout(() => setScreen("access_granted"), 1200);
//       } else {
//         setEpiStatusMsg("❌ EPI Incompleto — Acesso negado");
//         const missing = (finalResult.missing || finalResult.missing_ppe || []).map(epiLabel);
//         setSession((prev) => ({ ...prev, missingEpi: missing, deniedReason: "epi_incomplete" }));
//         setDoorStatus("closed");
//         // LED vermelho via WebSocket para feedback visual na fechadura
//         if (lockState.connected) lockState.sendLed("red");
//         setTimeout(() => setScreen("access_denied"), 1200);
//       }
//     } catch (e) {
//       console.error("[useCamAutomation] EPI capture failed:", e);
//       setEpiStep("error");
//       const errorMsg = (e as any)?.response?.data?.detail || (e as Error)?.message || "Erro desconhecido";
//       setEpiStatusMsg(`Erro na detecção de EPI: ${errorMsg}`);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [epiStep, cameraHook, direction, sysConfig, lockState.connected, lockState.sendLed]);

//   const handleRetryEpi = useCallback(() => resetEpiScan(false), [resetEpiScan]);

//   // ─── ACTION: Salva config ─────────────────────────────────────────────────
//   const handleSaveConfigModal = useCallback(async () => {
//     try {
//       setSaving(true);
//       handleSaveConfig(localConfig);
//       if (epiConfig?.required_ppe) await api.saveEpiConfig({ required_ppe: epiConfig.required_ppe });
//       setSaved(true);
//       setTimeout(() => setSaved(false), 2000);
//     } catch (e) {
//       console.error("[useCamAutomation] saveConfig failed:", e);
//     } finally {
//       setSaving(false);
//     }
//   }, [localConfig, epiConfig, handleSaveConfig]);

//   // ─── Return ───────────────────────────────────────────────────────────────
//   return {
//     screen, direction, doorStatus, session, sysConfig,
//     showReport, showConfig, setShowReport, setShowConfig,
//     cameraHook, lockState,

//     idleState: { dashboard, loadingDash, refreshDashboard },

//     faceScanState: {
//       step: faceStep, captureUrl: faceCaptureUrl, progress: faceProgress,
//       statusMsg: faceStatusMsg, subMsg: faceSubMsg, countdown: faceCountdown,
//     },

//     epiScanState: {
//       step: epiStep, captureUrl1: epiCaptureUrl1, captureUrl2: epiCaptureUrl2,
//       statusMsg: epiStatusMsg, countdown: epiCountdown, result: epiResult,
//     },

//     configState: {
//       localConfig, epiConfig, saving, saved,
//       setLocalConfig, setEpiConfig, handleSave: handleSaveConfigModal,
//     },

//     permanenceState: { people, loading: loadingPeople, fetchPeople },

//     handleStartEntry, handleStartExit, handleGoIdle,
//     handleTimeOverride, handleRetryFromDenied, handleSaveConfig,
//     handleCaptureFace, handleRetryFace, handleCaptureEpi, handleRetryEpi,
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
  axios.create({ baseURL: getApiBaseUrl(), timeout: 60000 });

const EPI = "https://aihub.smartxhub.cloud/api/v1/epi";

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: resolve URL do WebSocket da fechadura
//
// Problema: Mixed Content — página HTTPS não pode conectar em ws:// (inseguro).
//
// Solução:
//   HTTPS → usa proxy do backend: wss://aihub.smartxhub.cloud/api/v1/epi/ws/lock?lock_ip=<ip>
//   HTTP  → conecta direto no ESP32: ws://<ip>:81  (desenvolvimento local)
//
// O proxy FastAPI faz bridge transparente: Frontend (WSS) ↔ Backend ↔ ESP32 (WS:81)
// Ver: app/projects/epi_check/api/ws_proxy.py
// ─────────────────────────────────────────────────────────────────────────────

function getLockWsUrl(lockIp: string): string {
  const isSecure = window.location.protocol === "https:";
  if (isSecure) {
    // Proxy backend — evita Mixed Content
    const base = getApiBaseUrl().replace(/^http/, "ws"); // https→wss, http→ws
    return `${base}/api/v1/epi/ws/lock?lock_ip=${encodeURIComponent(lockIp)}`;
  }
  // Desenvolvimento local — conecta direto
  return `ws://${lockIp}:81`;
}

// ─── Parâmetros de filtro para getPeople ─────────────────────────────────────
export interface PeopleFilters {
  activeOnly?: boolean;
  isInside?: boolean;
  hasPhotos?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

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

  getPeople: async (params: PeopleFilters = {}): Promise<WorkerRecord[]> => {
    const { data } = await makeHttp().get(`${EPI}/analytics/people`, {
      params: {
        active_only: params.activeOnly ?? false,
        is_inside:   params.isInside,
        has_photos:  params.hasPhotos,
        search:      params.search,
        limit:       params.limit  ?? 500,
        offset:      params.offset ?? 0,
      },
    });
    return Array.isArray(data) ? data : ((data as { people?: WorkerRecord[] }).people ?? []);
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
    const { data } = await makeHttp().post(`${EPI}/validation/photo`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  closeValidationSession: async (sessionUuid: string, personCode?: string): Promise<void> => {
    const form = new FormData();
    form.append("session_uuid", sessionUuid);
    if (personCode) form.append("person_code_override", personCode);
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

  // HTTP REST fallback — usado apenas se WebSocket não estiver disponível
  unlockDoor: async (lockIp: string, durationMs = 5000): Promise<void> => {
    console.log(`[unlockDoor] POST http://${lockIp}/unlock { duration_ms: ${durationMs} }`);
    const res = await fetch(`http://${lockIp}/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duration_ms: durationMs }),
    });
    if (!res.ok) throw new Error(`ESP32 HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    if (!data.ok) throw new Error(`ESP32 recusou o unlock: ${JSON.stringify(data)}`);
    console.log(`[unlockDoor] ✅ ESP32 destrancado — state: ${data.state}, duration: ${data.duration_ms}ms`);
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.88): Promise<Blob> {
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

/**
 * DoorStatus — reflete o estado REAL do ESP32 via WebSocket
 *
 * closed    → lock_state=locked  + door_state=closed  (estado normal)
 * open      → lock_state=unlocked                      (fechadura destravada)
 * door_open → door_state=open    (porta fisicamente aberta, reed switch)
 * alert     → falha de comunicação ou unlock negado
 * waiting   → aguardando primeira resposta do WebSocket
 */
export type DoorStatus = "closed" | "open" | "door_open" | "alert" | "waiting";

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
  lockIpAddress: string;
  lockDurationMs: number;
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
  badge_id?: string;
  is_inside?: boolean;
  face_photos_count?: number;
  last_entry_at?: string | null;
  last_exit_at?: string | null;
  active?: boolean;
  created_at?: string;
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
  captureFrame: (role: CamRole) => Promise<{ blob: Blob; dataUrl: string; canvas: HTMLCanvasElement }>;
  assignDevice: (role: CamRole, deviceId: string | null) => void;
  setVideoRef: (role: CamRole, element: HTMLVideoElement | null) => void;
  hasStream: (role: CamRole) => boolean;
  getAssignment: (role: CamRole) => string | null;
  sourceTypes: Record<CamRole, CameraSourceType>;
  ipUrls: Record<CamRole, string | null>;
  setSourceType: (role: CamRole, type: CameraSourceType) => void;
  setIpUrl: (role: CamRole, url: string | null) => void;
}

// ─── Tipos do WebSocket MIXHUB ────────────────────────────────────────────────

export type LockWsEvent =
  | "connected"
  | "status"
  | "locked"
  | "unlocked"
  | "door_open"
  | "door_closed"
  | "button_press"
  | "proxy_connected"
  | "proxy_error"
  | "proxy_esp_disconnected";

export interface LockWsMessage {
  event: LockWsEvent;
  lock_state?: "locked" | "unlocked";
  door_state?: "open" | "closed";
  led?: string;
  duration_ms?: number;
  event_count?: number;
  btn_count?: number;
  btn_exit_count?: number;
  uptime_ms?: number;
  ip?: string;
  version?: string;
  ws_clients?: number;
  // campos do proxy
  esp_url?: string;
  lock_ip?: string;
  error?: string;
  detail?: string;
  reason?: string;
}

export interface LockState {
  /** true = WebSocket conectado (ao proxy ou diretamente ao ESP32) */
  connected: boolean;
  /** Estado atual da fechadura: "locked" | "unlocked" */
  lockState: "locked" | "unlocked" | null;
  /** Estado físico da porta (reed switch): "open" | "closed" */
  doorState: "open" | "closed" | null;
  /** Cor do LED atual */
  led: string | null;
  /** Versão do firmware */
  version: string | null;
  /** Número de destrancamentos desde o boot */
  eventCount: number;
  /** Último evento recebido */
  lastEvent: LockWsEvent | null;
  /** Timestamp do último evento */
  lastEventAt: Date | null;
  /** Erro de conexão, se houver */
  error: string | null;
  /** URL efetiva usada (proxy ou direta) */
  wsUrl: string | null;
  /** Envia comando de unlock via WebSocket */
  sendUnlock: (durationMs?: number) => void;
  /** Envia comando de lock via WebSocket */
  sendLock: () => void;
  /** Envia comando de LED via WebSocket */
  sendLed: (color: "red" | "green" | "blue" | "yellow" | "off") => void;
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

export type FaceScanStep = "ready" | "capturing" | "processing" | "done" | "error";

export interface FaceScanState {
  step: FaceScanStep;
  captureUrl: string | null;
  progress: number;
  statusMsg: string;
  subMsg: string;
  countdown: number | null;
}

export type EpiScanStep = "ready" | "capturing" | "processing" | "done" | "error";

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
  fetchPeople: (filters?: PeopleFilters) => Promise<void>;
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
  lockState: LockState;
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
  face: "epi_cam_face", body1: "epi_cam_body1", body2: "epi_cam_body2",
};
const LS_KEYS_TYPE: Record<CamRole, string> = {
  face: "epi_cam_face_type", body1: "epi_cam_body1_type", body2: "epi_cam_body2_type",
};
const LS_KEYS_URL: Record<CamRole, string> = {
  face: "epi_cam_face_url", body1: "epi_cam_body1_url", body2: "epi_cam_body2_url",
};

const EMPTY_SESSION: Session = {
  sessionUuid: null, person: null, dailyExposure: null,
  epiResult: null, missingEpi: [], deniedReason: null,
};

const DEFAULT_CONFIG: SysConfig = {
  companyId: 1, zoneId: 10, doorId: "DOOR_CAMARA_FRIA_01",
  dailyLimitMin: 120, overLimitPolicy: "warn", doorOpenMaxMin: 15,
  faceConfidenceMin: 70, apiBase: "https://aihub.smartxhub.cloud",
  useSingleCamera: false,
  cameraSourceType: { face: "local", body1: "local", body2: "local" },
  cameraIpUrl: { face: null, body1: null, body2: null },
  lockIpAddress: "192.168.68.100", lockDurationMs: 5000,
};

const EPI_LABELS_PT: Record<string, string> = {
  helmet: "Capacete", vest: "Colete", gloves: "Luvas", boots: "Botas",
  thermal_coat: "Jaqueta Térmica", thermal_pants: "Calça Térmica",
  glasses: "Óculos de Proteção", mask: "Máscara", apron: "Avental", hardhat: "Capacete",
};

const epiLabel = (k: string) => EPI_LABELS_PT[k] ?? k;

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: captura de frame de câmera IP via URL
// ─────────────────────────────────────────────────────────────────────────────

async function captureFrameFromUrl(url: string): Promise<Blob> {
  const proxyUrl = `${getApiBaseUrl()}/api/v1/epi/camera/snapshot/v4?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  return response.blob();
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: resolve campo compliant
// ─────────────────────────────────────────────────────────────────────────────

function resolveCompliant(photo: PhotoResult): boolean {
  return (
    photo.epi_compliant ??
    photo.final_decision?.epi_compliant ??
    photo.compliant ??
    false
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK: useLockWebSocket
//
// Mixed Content fix:
//   HTTPS → conecta via proxy do backend (wss://aihub.../ws/lock?lock_ip=<ip>)
//   HTTP  → conecta direto no ESP32 (ws://<ip>:81) — desenvolvimento local
//
// Eventos recebidos do ESP32 (via proxy ou direto):
//   connected        → status completo ao conectar
//   status           → broadcast automático a cada 10s
//   locked           → fechadura travada
//   unlocked         → fechadura destravada { duration_ms, event_count }
//   door_open        → reed switch: porta aberta fisicamente
//   door_closed      → reed switch: porta fechada fisicamente
//   button_press     → botão de saída pressionado
//
// Eventos do proxy (apenas quando via HTTPS):
//   proxy_connected          → proxy conectou ao ESP32 com sucesso
//   proxy_error              → proxy falhou ao conectar ao ESP32
//   proxy_esp_disconnected   → ESP32 desconectou do proxy
//
// Comandos enviados (Client → ESP32 via proxy):
//   { action: "unlock", duration_ms: 5000 }
//   { action: "lock" }
//   { action: "led", color: "green" }
//   { action: "status" }
// ─────────────────────────────────────────────────────────────────────────────

function useLockWebSocket(
  lockIp: string,
  onDoorStatusChange?: (status: DoorStatus) => void,
): LockState {
  const [connected, setConnected] = useState(false);
  const [lockState, setLockState] = useState<"locked" | "unlocked" | null>(null);
  const [doorState, setDoorState] = useState<"open" | "closed" | null>(null);
  const [led, setLed] = useState<string | null>(null);
  const [version, setVersion] = useState<string | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const [lastEvent, setLastEvent] = useState<LockWsEvent | null>(null);
  const [lastEventAt, setLastEventAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelay = useRef(2000);
  const onStatusChangeRef = useRef(onDoorStatusChange);
  onStatusChangeRef.current = onDoorStatusChange;

  // Refs para evitar stale closure nos event handlers
  const lockStateRef  = useRef(lockState);
  const doorStateRef  = useRef(doorState);
  lockStateRef.current = lockState;
  doorStateRef.current = doorState;

  const connect = useCallback(() => {
    if (!lockIp) return;

    const url = getLockWsUrl(lockIp);
    setWsUrl(url);
    console.log(`[LockWS] Conectando: ${url}`);

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[LockWS] ✅ WebSocket aberto");
      // connected=true só após receber "connected", "status" ou "proxy_connected"
      setError(null);
      reconnectDelay.current = 2000;
    };

    ws.onmessage = (ev) => {
      let msg: LockWsMessage;
      try {
        msg = JSON.parse(ev.data);
      } catch {
        console.warn("[LockWS] Mensagem não-JSON:", ev.data);
        return;
      }

      console.log("[LockWS] ←", msg);
      setLastEvent(msg.event);
      setLastEventAt(new Date());

      // ── Eventos do proxy ──────────────────────────────────────────────────
      if (msg.event === "proxy_connected") {
        console.log(`[LockWS] Proxy conectado ao ESP32: ${msg.esp_url}`);
        setConnected(true);
        setError(null);
        return;
      }

      if (msg.event === "proxy_error") {
        console.error(`[LockWS] Proxy erro: ${msg.error} — ${msg.detail}`);
        setError(msg.error ?? "Erro no proxy");
        setConnected(false);
        onStatusChangeRef.current?.("alert");
        return;
      }

      if (msg.event === "proxy_esp_disconnected") {
        console.warn(`[LockWS] ESP32 desconectou do proxy: ${msg.reason}`);
        setConnected(false);
        onStatusChangeRef.current?.("alert");
        return;
      }

      // ── Eventos reais do ESP32 ────────────────────────────────────────────
      if (msg.event === "connected" || msg.event === "status") {
        setConnected(true); // conexão direta (sem proxy)
        if (msg.lock_state) setLockState(msg.lock_state);
        if (msg.door_state) setDoorState(msg.door_state);
        if (msg.led)        setLed(msg.led);
        if (msg.version)    setVersion(msg.version);
        if (msg.event_count !== undefined) setEventCount(msg.event_count);

        if (msg.lock_state === "unlocked") {
          onStatusChangeRef.current?.("open");
        } else if (msg.door_state === "open") {
          onStatusChangeRef.current?.("door_open");
        } else {
          onStatusChangeRef.current?.("closed");
        }
        return;
      }

      if (msg.event === "unlocked") {
        setLockState("unlocked");
        if (msg.event_count !== undefined) setEventCount(msg.event_count);
        onStatusChangeRef.current?.("open");
        return;
      }

      if (msg.event === "locked") {
        setLockState("locked");
        if (doorStateRef.current !== "open") {
          onStatusChangeRef.current?.("closed");
        }
        return;
      }

      if (msg.event === "door_open") {
        setDoorState("open");
        onStatusChangeRef.current?.("door_open");
        return;
      }

      if (msg.event === "door_closed") {
        setDoorState("closed");
        if (lockStateRef.current !== "unlocked") {
          onStatusChangeRef.current?.("closed");
        }
        return;
      }

      if (msg.event === "button_press") {
        console.log(`[LockWS] Botão de saída pressionado (count: ${msg.btn_count})`);
      }
    };

    ws.onerror = (ev) => {
      console.error("[LockWS] Erro WebSocket:", ev);
      setError("Erro de conexão com a fechadura");
      onStatusChangeRef.current?.("alert");
    };

    ws.onclose = (ev) => {
      console.warn(`[LockWS] Fechado (code: ${ev.code}). Reconectando em ${reconnectDelay.current}ms…`);
      setConnected(false);
      wsRef.current = null;

      // Backoff exponencial: 2s → 3s → 4.5s … máx 30s
      reconnectTimer.current = setTimeout(() => {
        reconnectDelay.current = Math.min(reconnectDelay.current * 1.5, 30000);
        connect();
      }, reconnectDelay.current);
    };
  }, [lockIp]); // eslint-disable-line react-hooks/exhaustive-deps

  // Inicia/reinicia conexão quando o IP muda
  useEffect(() => {
    if (!lockIp) return;

    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnected(false);
    setLockState(null);
    setDoorState(null);
    setError(null);
    reconnectDelay.current = 2000;

    connect();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [lockIp, connect]);

  // ── Comandos → ESP32 ──────────────────────────────────────────────────────

  const send = useCallback((payload: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
      console.log("[LockWS] →", payload);
    } else {
      console.warn("[LockWS] WebSocket não conectado — comando ignorado:", payload);
    }
  }, []);

  const sendUnlock = useCallback((durationMs?: number) => {
    send({ action: "unlock", duration_ms: durationMs ?? DEFAULT_CONFIG.lockDurationMs });
  }, [send]);

  const sendLock  = useCallback(() => send({ action: "lock" }), [send]);

  const sendLed   = useCallback((color: "red" | "green" | "blue" | "yellow" | "off") => {
    send({ action: "led", color });
  }, [send]);

  return {
    connected, lockState, doorState, led, version,
    eventCount, lastEvent, lastEventAt, error, wsUrl,
    sendUnlock, sendLock, sendLed,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK DE CÂMERAS (interno)
// ─────────────────────────────────────────────────────────────────────────────
//@ts-ignore
function useCameraInternal(sysConfig: SysConfig): CameraHook {
  const [devices, setDevices] = useState<CamDevice[]>([]);
  const [assignments, setAssignments] = useState<Record<CamRole, string | null>>({
    face: localStorage.getItem(LS_KEYS.face) || null,
    body1: localStorage.getItem(LS_KEYS.body1) || null,
    body2: localStorage.getItem(LS_KEYS.body2) || null,
  });
  const [sourceTypes, setSourceTypes] = useState<Record<CamRole, CameraSourceType>>({
    face:  (localStorage.getItem(LS_KEYS_TYPE.face)  as CameraSourceType) || "local",
    body1: (localStorage.getItem(LS_KEYS_TYPE.body1) as CameraSourceType) || "local",
    body2: (localStorage.getItem(LS_KEYS_TYPE.body2) as CameraSourceType) || "local",
  });
  const [ipUrls, setIpUrls] = useState<Record<CamRole, string | null>>({
    face:  localStorage.getItem(LS_KEYS_URL.face)  || null,
    body1: localStorage.getItem(LS_KEYS_URL.body1) || null,
    body2: localStorage.getItem(LS_KEYS_URL.body2) || null,
  });
  const [streams, setStreams] = useState<Partial<Record<CamRole, MediaStream>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRefs = useRef<Partial<Record<CamRole, HTMLVideoElement | null>>>({});

  const enumerateDevices = useCallback(async (): Promise<CamDevice[]> => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((s) => s.getTracks().forEach((t) => t.stop())).catch(() => {});
      const all = await navigator.mediaDevices.enumerateDevices();
      const vids = all.filter((d) => d.kind === "videoinput") as CamDevice[];
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
    if (sourceTypes[role] === "ip_url") return null;
    const deviceId = assignments[role];
    if (!deviceId) return null;
    streams[role]?.getTracks().forEach((t) => t.stop());
    try {
      setLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId }, width: { ideal: 1280 },
          height: { ideal: 720 }, frameRate: { ideal: 30 },
          //@ts-ignore
          zoom: 1.0,
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
  }, [assignments, sourceTypes, streams]);

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
    if (sourceTypes[role] === "ip_url") {
      const url = ipUrls[role];
      if (!url) throw new Error(`URL não configurada para câmera ${role}`);
      const blob = await captureFrameFromUrl(url);
      const dataUrl = URL.createObjectURL(blob);
      const canvas = document.createElement("canvas");
      return { blob, dataUrl, canvas };
    }
    const video = videoRefs.current[role];
    if (!video || video.readyState < 2) throw new Error(`Câmera "${role}" não está pronta.`);
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await canvasToBlob(canvas, 0.88);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    return { blob, dataUrl, canvas };
  }, [sourceTypes, ipUrls]);

  const assignDevice = useCallback((role: CamRole, deviceId: string | null) => {
    setAssignments((prev) => ({ ...prev, [role]: deviceId }));
    localStorage.setItem(LS_KEYS[role], deviceId || "");
  }, []);

  const setVideoRef = useCallback((role: CamRole, element: HTMLVideoElement | null) => {
    videoRefs.current[role] = element;
    if (element && streams[role]) element.srcObject = streams[role]!;
  }, [streams]);

  const setSourceType = useCallback((role: CamRole, type: CameraSourceType) => {
    setSourceTypes((prev) => ({ ...prev, [role]: type }));
    localStorage.setItem(LS_KEYS_TYPE[role], type);
  }, []);

  const setIpUrl = useCallback((role: CamRole, url: string | null) => {
    setIpUrls((prev) => ({ ...prev, [role]: url }));
    if (url) localStorage.setItem(LS_KEYS_URL[role], url);
    else     localStorage.removeItem(LS_KEYS_URL[role]);
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
    devices, assignments, streams, loading, error,
    enumerateDevices, startStream, stopStream, stopAllStreams,
    captureFrame, assignDevice, setVideoRef,
    hasStream: (role) => !!streams[role],
    getAssignment: (role) => assignments[role],
    sourceTypes, ipUrls, setSourceType, setIpUrl,
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
  const [faceStatusMsg, setFaceStatusMsg] = useState("Posicione seu rosto na câmera e toque em Capturar");
  const [faceSubMsg, setFaceSubMsg] = useState("");
  const [faceCountdown, setFaceCountdown] = useState<number | null>(null);
  const faceAutoCapture = useRef(false);

  const [epiStep, setEpiStep] = useState<EpiScanStep>("ready");
  const [epiCaptureUrl1, setEpiCaptureUrl1] = useState<string | null>(null);
  const [epiCaptureUrl2, setEpiCaptureUrl2] = useState<string | null>(null);
  const [epiStatusMsg, setEpiStatusMsg] = useState("Posicione-se em frente às câmeras de corpo");
  const [epiCountdown, setEpiCountdown] = useState<number | null>(null);
  const [epiResult, setEpiResult] = useState<EpiResult | null>(null);
  const epiAutoCapture = useRef(false);

  const sessionRef = useRef<Session>(EMPTY_SESSION);
  const unlockFiredRef = useRef(false);

  const [localConfig, setLocalConfig] = useState<SysConfig>(DEFAULT_CONFIG);
  const [epiConfig, setEpiConfig] = useState<EpiConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [people, setPeople] = useState<WorkerRecord[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(false);

  // ─── WebSocket MIXHUB ─────────────────────────────────────────────────────
  const handleLockStatusChange = useCallback((status: DoorStatus) => {
    setDoorStatus(status);
  }, []);

  const lockState = useLockWebSocket(sysConfig.lockIpAddress, handleLockStatusChange);

  // ─── Sync session → sessionRef ────────────────────────────────────────────
  useEffect(() => { sessionRef.current = session; }, [session]);

  // ─── Helpers de reset ─────────────────────────────────────────────────────
  const resetSession = useCallback(() => setSession(EMPTY_SESSION), []);

  const resetFaceScan = useCallback((withAutoCapture = false) => {
    faceAutoCapture.current = withAutoCapture;
    setFaceStep("ready"); setFaceCaptureUrl(null); setFaceProgress(0);
    setFaceStatusMsg("Posicione seu rosto na câmera e toque em Capturar");
    setFaceSubMsg(""); setFaceCountdown(null);
  }, []);

  const resetEpiScan = useCallback((withAutoCapture = false) => {
    epiAutoCapture.current = withAutoCapture;
    setEpiStep("ready"); setEpiCaptureUrl1(null); setEpiCaptureUrl2(null);
    setEpiStatusMsg("Posicione-se em frente às câmeras de corpo");
    setEpiCountdown(null); setEpiResult(null);
  }, []);

  // ─── Config inicial ───────────────────────────────────────────────────────
  useEffect(() => {
    api.getLocalConfig()
      .then((cfg) => {
        setSysConfig((prev) => ({ ...prev, ...cfg }));
        setLocalConfig((prev) => ({ ...prev, ...cfg }));
      })
      .catch((e: Error) => console.warn("[useCamAutomation] Config load failed:", e.message));
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

  // ─── Config modal ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showConfig) return;
    setLocalConfig({ ...sysConfig });
    api.getEpiConfig().then(setEpiConfig).catch(console.warn);
  }, [showConfig, sysConfig]);

  // ─── People ───────────────────────────────────────────────────────────────
  const fetchPeople = useCallback(async (filters: PeopleFilters = {}) => {
    try {
      setLoadingPeople(true);
      const list = await api.getPeople({ activeOnly: false, ...filters });
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

  // ─────────────────────────────────────────────────────────────────────────
  // UNLOCK DA PORTA
  //
  // Prioridade:
  //   1. WebSocket conectado → sendUnlock() + LED verde
  //   2. Fallback HTTP REST  → POST http://<ip>/unlock
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "access_granted") {
      unlockFiredRef.current = false;
      return;
    }
    if (unlockFiredRef.current) return;
    unlockFiredRef.current = true;

    const lockMs = sysConfig.lockDurationMs;
    const lockIp = sysConfig.lockIpAddress;

    if (lockState.connected) {
      console.log("[unlock] Via WebSocket (proxy ou direto)");
      lockState.sendUnlock(lockMs);
      lockState.sendLed("green");
    } else {
      console.log("[unlock] WebSocket offline — fallback HTTP REST");
      api.unlockDoor(lockIp, lockMs)
        .then(() => { setDoorStatus("open"); console.log("[unlock] ✅ HTTP OK"); })
        .catch((e) => { console.error("[unlock] ❌ HTTP falhou:", e); setDoorStatus("alert"); });
    }

    api.openDoor({
      personCode: sessionRef.current.person?.personCode,
      personName: sessionRef.current.person?.personName,
      sessionUuid: sessionRef.current.sessionUuid,
      reason: "EPI_COMPLIANT",
    }).catch((e) => console.warn("[unlock] Audit log falhou:", e));

  }, [screen, sysConfig.lockIpAddress, sysConfig.lockDurationMs, lockState.connected]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Auto-capture: face ───────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "face_scan" || !faceAutoCapture.current || faceStep !== "ready") return;
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
    if (screen !== "epi_scan" || !epiAutoCapture.current || epiStep !== "ready") return;
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
    setDirection("ENTRY"); resetSession(); resetFaceScan(true);
    cameraHook.startStream("face"); setScreen("face_scan");
  }, [resetSession, resetFaceScan, cameraHook]);

  const handleStartExit = useCallback(() => {
    setDirection("EXIT"); resetSession(); resetFaceScan(true);
    cameraHook.startStream("face"); setScreen("face_scan");
  }, [resetSession, resetFaceScan, cameraHook]);

  const handleGoIdle = useCallback(() => {
    cameraHook.stopAllStreams(); resetSession();
    resetFaceScan(false); resetEpiScan(false);
    setDoorStatus("closed"); setScreen("idle");
  }, [cameraHook, resetSession, resetFaceScan, resetEpiScan]);

  const handleTimeOverride = useCallback(() => {
    resetEpiScan(true);
    if (!sysConfig.useSingleCamera) {
      cameraHook.startStream("body1");
      if (cameraHook.getAssignment("body2")) cameraHook.startStream("body2");
    }
    setScreen("epi_scan");
  }, [cameraHook, resetEpiScan, sysConfig.useSingleCamera]);

  const handleRetryFromDenied = useCallback(() => {
    setSession((prev) => ({ ...prev, epiResult: null, missingEpi: [], deniedReason: null }));
    resetEpiScan(false); setScreen("epi_scan");
  }, [resetEpiScan]);

  const handleSaveConfig = useCallback((newConfig: Partial<SysConfig>) => {
    setSysConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  // ─── ACTION: Captura facial ───────────────────────────────────────────────
  const handleCaptureFace = useCallback(async () => {
    if (faceStep !== "ready") return;
    faceAutoCapture.current = false;
    try {
      setFaceStep("capturing"); setFaceStatusMsg("Capturando frame…");
      const { blob, dataUrl } = await cameraHook.captureFrame("face");
      setFaceCaptureUrl(dataUrl);
      setFaceStep("processing"); setFaceStatusMsg("Iniciando sessão de validação…"); setFaceProgress(20);

      const sessionData = await api.startValidationSession({
        direction, door_id: sysConfig.doorId, zone_id: sysConfig.zoneId,
      });
      const uuid = sessionData.session_uuid || sessionData.sessionUuid!;
      setFaceProgress(40);

      setFaceStatusMsg("Reconhecendo rosto…");
      const photo = await api.sendValidationPhoto(uuid, blob, { photoType: "face", cameraId: 1 });
      setFaceProgress(80);

      const resolvedCode = (
        photo.face_person_code || photo.person_code || photo.final_decision?.person_code || ""
      ).trim();
      const resolvedName = (
        photo.person_name || photo.final_decision?.person_name || ""
      ).trim();

      if (resolvedCode && resolvedName) {
        setFaceProgress(100); setFaceStep("done");
        const resolvedConf = photo.face_confidence || photo.confidence || photo.final_decision?.face_confidence_max || 0;
        setFaceStatusMsg(`Identificado: ${resolvedName}`);
        setFaceSubMsg(`Confiança: ${Math.round(resolvedConf * 100)}%`);
        const person: Person = { personCode: resolvedCode, personName: resolvedName, confidence: resolvedConf };
        setSession((prev) => ({ ...prev, sessionUuid: uuid, person, dailyExposure: photo.daily_exposure ?? null }));

        setTimeout(() => {
          if (direction === "EXIT") { setScreen("idle"); return; }
          const totalMin = photo.daily_exposure?.total_minutes ?? 0;
          const limitMin = photo.daily_exposure?.limit_minutes ?? sysConfig.dailyLimitMin;
          if (totalMin >= limitMin) { setScreen("time_alert"); }
          else {
            resetEpiScan(true);
            cameraHook.startStream("body1");
            if (cameraHook.getAssignment("body2")) cameraHook.startStream("body2");
            setScreen("epi_scan");
          }
        }, 900);
      } else {
        setFaceStep("error"); setFaceStatusMsg("Rosto não reconhecido");
        setFaceSubMsg("Usuário não encontrado — solicite acesso manual"); setFaceProgress(0);
        setSession((prev) => ({ ...prev, person: null, deniedReason: "user_not_found" }));
      }
    } catch (e) {
      const err = e as { response?: { data?: { detail?: string } }; message?: string };
      setFaceStep("error"); setFaceStatusMsg("Erro ao processar");
      setFaceSubMsg(err.response?.data?.detail || err.message || ""); setFaceProgress(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faceStep, cameraHook, direction, sysConfig, resetEpiScan]);

  const handleRetryFace = useCallback(() => resetFaceScan(false), [resetFaceScan]);

  // ─── ACTION: Captura EPI ──────────────────────────────────────────────────
  const handleCaptureEpi = useCallback(async () => {
    if (epiStep !== "ready") return;
    epiAutoCapture.current = false;

    const personCode = sessionRef.current.person?.personCode?.trim();
    const personName = sessionRef.current.person?.personName?.trim();
    if (!personCode || !personName) {
      console.warn("[EPI] Pessoa não identificada — acesso negado");
      epiAutoCapture.current = false;
      setEpiStep("error"); setEpiStatusMsg("❌ Usuário não encontrado — Acesso negado");
      setDoorStatus("closed");
      setSession((prev) => ({ ...prev, missingEpi: [], deniedReason: "user_not_found", epiResult: { compliant: false } }));
      setTimeout(() => setScreen("access_denied"), 1500);
      return;
    }

    const hasBody2 = !sysConfig.useSingleCamera && !!cameraHook.getAssignment("body2");
    try {
      setEpiStep("capturing"); setEpiStatusMsg("Capturando frames…");
      const captureRole: CamRole = sysConfig.useSingleCamera ? "face" : "body1";
      const { blob: blob1, dataUrl: url1 } = await cameraHook.captureFrame(captureRole);
      setEpiCaptureUrl1(url1);

      let blob2: Blob | null = null;
      if (hasBody2) {
        try {
          const f2 = await cameraHook.captureFrame("body2");
          setEpiCaptureUrl2(f2.dataUrl); blob2 = f2.blob;
        } catch (e2) { console.warn("[EPI] Body2 capture failed:", (e2 as Error).message); }
      }

      setEpiStep("processing"); setEpiStatusMsg("Detectando EPIs… aguarde");
      const epiSessionData = await api.startValidationSession({
        direction, door_id: sysConfig.doorId, zone_id: sysConfig.zoneId,
      });
      const epiSessionUuid = epiSessionData.session_uuid || epiSessionData.sessionUuid!;
      const photo1 = await api.sendValidationPhoto(epiSessionUuid, blob1, { photoType: "body", cameraId: 2 });
      let finalResult: EpiResult = { ...photo1, compliant: resolveCompliant(photo1) };

      if (blob2) {
        try {
          const photo2 = await api.sendValidationPhoto(epiSessionUuid, blob2, { photoType: "body", cameraId: 3 });
          const photo2Compliant = resolveCompliant(photo2);
          if (!photo2Compliant) finalResult = { ...photo2, compliant: photo2Compliant };
        } catch (e3) { console.warn("[EPI] Body2 send failed:", (e3 as Error).message); }
      }

      try { await api.closeValidationSession(epiSessionUuid, sessionRef.current.person?.personCode); } catch (_) {}

      setEpiResult(finalResult); setEpiStep("done");
      setSession((prev) => ({ ...prev, epiResult: finalResult, sessionUuid: epiSessionUuid, deniedReason: null }));

      if (finalResult.compliant) {
        setEpiStatusMsg("✅ EPI Completo — Acesso liberado");
        setTimeout(() => setScreen("access_granted"), 1200);
      } else {
        setEpiStatusMsg("❌ EPI Incompleto — Acesso negado");
        const missing = (finalResult.missing || finalResult.missing_ppe || []).map(epiLabel);
        setSession((prev) => ({ ...prev, missingEpi: missing, deniedReason: "epi_incomplete" }));
        setDoorStatus("closed");
        if (lockState.connected) lockState.sendLed("red");
        setTimeout(() => setScreen("access_denied"), 1200);
      }
    } catch (e) {
      console.error("[useCamAutomation] EPI capture failed:", e);
      setEpiStep("error");
      const errorMsg = (e as any)?.response?.data?.detail || (e as Error)?.message || "Erro desconhecido";
      setEpiStatusMsg(`Erro na detecção de EPI: ${errorMsg}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epiStep, cameraHook, direction, sysConfig, lockState.connected, lockState.sendLed]);

  const handleRetryEpi = useCallback(() => resetEpiScan(false), [resetEpiScan]);

  // ─── ACTION: Salva config ─────────────────────────────────────────────────
  const handleSaveConfigModal = useCallback(async () => {
    try {
      setSaving(true);
      handleSaveConfig(localConfig);
      if (epiConfig?.required_ppe) await api.saveEpiConfig({ required_ppe: epiConfig.required_ppe });
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
    screen, direction, doorStatus, session, sysConfig,
    showReport, showConfig, setShowReport, setShowConfig,
    cameraHook, lockState,

    idleState: { dashboard, loadingDash, refreshDashboard },

    faceScanState: {
      step: faceStep, captureUrl: faceCaptureUrl, progress: faceProgress,
      statusMsg: faceStatusMsg, subMsg: faceSubMsg, countdown: faceCountdown,
    },

    epiScanState: {
      step: epiStep, captureUrl1: epiCaptureUrl1, captureUrl2: epiCaptureUrl2,
      statusMsg: epiStatusMsg, countdown: epiCountdown, result: epiResult,
    },

    configState: {
      localConfig, epiConfig, saving, saved,
      setLocalConfig, setEpiConfig, handleSave: handleSaveConfigModal,
    },

    permanenceState: { people, loading: loadingPeople, fetchPeople },

    handleStartEntry, handleStartExit, handleGoIdle,
    handleTimeOverride, handleRetryFromDenied, handleSaveConfig,
    handleCaptureFace, handleRetryFace, handleCaptureEpi, handleRetryEpi,
  };
}