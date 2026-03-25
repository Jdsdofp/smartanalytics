// src/screens/EpiScanScreen/index.tsx
// Tela de verificação de EPI com Stepper de progresso
// Layout otimizado: uma câmera vertical ocupando máximo de espaço com stepper no topo

// import CameraView from '../components/CameraView';
// import Stepper from '../components/Stepper';
// import type { CameraHook } from '../../../hooks/useCamAutomation';

// export interface EpiScanState {
//   status: 'idle' | 'capturing' | 'analyzing' | 'ok' | 'error';
//   errorMsg?: string;
//   captureUrl?: string | null;
//   detectedEpi?: string[];
// }

// interface EpiScanScreenProps {
//   epiScanState: EpiScanState;
//   cameraHook: CameraHook;
//   person: { name: string; photo?: string } | null;
//   onCapture: () => void;
//   onRetry: () => void;
//   onCancel: () => void;
// }

// export default function EpiScanScreen({
//   epiScanState,
//   cameraHook,
//   person,
//   onCapture,
//   onRetry,
//   onCancel,
// }: EpiScanScreenProps) {
//   const { status, errorMsg, captureUrl, detectedEpi = [] } = epiScanState;

//   const camStatus: 'idle' | 'scanning' | 'ok' | 'fail' =
//     status === 'analyzing' ? 'scanning' :
//     status === 'ok' ? 'ok' :
//     status === 'error' ? 'fail' :
//     'idle';

//   const isProcessing = status === 'capturing' || status === 'analyzing';

//   return (
//     <div style={{
//       flex: 1,
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       justifyContent: 'flex-start',
//       padding: '0.5rem 1rem',
//       gap: '0.5rem',
//       position: 'relative',
//       overflow: 'hidden',
//     }}>

//       {/* Stepper de progresso no topo */}
//       <div style={{
//         width: '100%',
//         display: 'flex',
//         justifyContent: 'center',
//         flexShrink: 0,
//         zIndex: 10,
//       }}>
//         <Stepper currentStep="epi" compact />
//       </div>

//       {/* Nome da pessoa (opcional, pequeno) */}
//       {person && (
//         <p style={{
//           fontFamily: 'var(--font-mono)',
//           fontSize: '0.7rem',
//           color: 'var(--gray-light)',
//           letterSpacing: '0.05em',
//           margin: 0,
//           flexShrink: 0,
//         }}>
//           {person.name}
//         </p>
//       )}

//       {/* Container da câmera ocupando todo espaço vertical disponível */}
//       <div style={{
//         flex: 1,
//         width: '100%',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         position: 'relative',
//         minHeight: 0,
//         overflow: 'hidden',
//       }}>
//         <div style={{
//           width: '100%',
//           height: '100%',
//           maxWidth: '600px',
//           position: 'relative',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}>
//           <CameraView
//             role="body1"
//             cameraHook={cameraHook}
//             scanning={status === 'analyzing'}
//             captureUrl={captureUrl}
//             status={camStatus}
//             autoStart
//             aspectRatio="9/16"
//             dynamicSize={false}
//           />

//           {/* Botão X para cancelar - canto superior direito */}
//           <button
//             onClick={onCancel}
//             style={{
//               position: 'absolute',
//               top: '1rem',
//               right: '1rem',
//               width: '44px',
//               height: '44px',
//               borderRadius: '50%',
//               border: '2px solid rgba(255, 255, 255, 0.3)',
//               background: 'rgba(33, 40, 54, 0.85)',
//               backdropFilter: 'blur(12px)',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               cursor: 'pointer',
//               fontSize: '1.25rem',
//               color: 'var(--gray-light)',
//               transition: 'all 200ms ease',
//               zIndex: 15,
//               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.background = 'rgba(220, 38, 38, 0.85)';
//               e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.6)';
//               e.currentTarget.style.color = '#fff';
//               e.currentTarget.style.transform = 'scale(1.05)';
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.background = 'rgba(33, 40, 54, 0.85)';
//               e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
//               e.currentTarget.style.color = 'var(--gray-light)';
//               e.currentTarget.style.transform = 'scale(1)';
//             }}
//           >
//             ✕
//           </button>

//           {/* EPIs detectados - badge flutuante superior esquerdo */}
//           {detectedEpi.length > 0 && (
//             <div style={{
//               position: 'absolute',
//               top: '1rem',
//               left: '1rem',
//               background: 'rgba(34, 197, 94, 0.9)',
//               backdropFilter: 'blur(12px)',
//               borderRadius: 'var(--radius-md)',
//               padding: '0.5rem 0.75rem',
//               display: 'flex',
//               flexDirection: 'column',
//               gap: '0.25rem',
//               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//               zIndex: 10,
//               maxWidth: '200px',
//             }}>
//               <div style={{
//                 fontFamily: 'var(--font-mono)',
//                 fontSize: '0.65rem',
//                 fontWeight: 700,
//                 color: '#fff',
//                 letterSpacing: '0.05em',
//                 textTransform: 'uppercase',
//               }}>
//                 ✓ Detectados ({detectedEpi.length})
//               </div>
//               <div style={{
//                 display: 'flex',
//                 flexWrap: 'wrap',
//                 gap: '0.25rem',
//               }}>
//                 {detectedEpi.map((epi, idx) => (
//                   <span
//                     key={idx}
//                     style={{
//                       fontFamily: 'var(--font-body)',
//                       fontSize: '0.7rem',
//                       color: 'rgba(255, 255, 255, 0.95)',
//                       background: 'rgba(255, 255, 255, 0.15)',
//                       padding: '2px 6px',
//                       borderRadius: '4px',
//                     }}
//                   >
//                     {epi}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Botões de ação - parte inferior sobreposta */}
//           <div style={{
//             position: 'absolute',
//             bottom: '1.5rem',
//             left: '1rem',
//             right: '1rem',
//             display: 'flex',
//             flexDirection: 'column',
//             gap: '0.75rem',
//             zIndex: 10,
//           }}>
            
//             {/* Mensagem de erro inline */}
//             {status === 'error' && errorMsg && (
//               <div style={{
//                 background: 'rgba(220, 38, 38, 0.95)',
//                 border: '1px solid rgba(220, 38, 38, 0.4)',
//                 borderRadius: 'var(--radius-md)',
//                 padding: '0.75rem',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '0.5rem',
//                 backdropFilter: 'blur(12px)',
//                 boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//               }}>
//                 <span style={{ fontSize: '1.1rem' }}>⚠️</span>
//                 <div style={{
//                   flex: 1,
//                   fontFamily: 'var(--font-body)',
//                   fontSize: '0.8rem',
//                   color: '#fff',
//                 }}>
//                   {errorMsg}
//                 </div>
//               </div>
//             )}

//             {/* Botão principal */}
//             {status === 'error' ? (
//               <button
//                 onClick={onRetry}
//                 className="btn-primary"
//                 style={{
//                   width: '100%',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '0.75rem',
//                   padding: '1rem',
//                   fontSize: '0.95rem',
//                   background: 'rgba(0, 132, 255, 0.9)',
//                   backdropFilter: 'blur(12px)',
//                   boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//                   border: '2px solid rgba(0, 132, 255, 0.4)',
//                 }}
//               >
//                 <span>🔄</span>
//                 <span>TENTAR NOVAMENTE</span>
//               </button>
//             ) : (
//               <button
//                 onClick={onCapture}
//                 disabled={isProcessing}
//                 className="btn-primary"
//                 style={{
//                   width: '100%',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '0.75rem',
//                   padding: '1rem',
//                   fontSize: '0.95rem',
//                   opacity: isProcessing ? 0.6 : 1,
//                   cursor: isProcessing ? 'not-allowed' : 'pointer',
//                   background: isProcessing 
//                     ? 'rgba(100, 116, 139, 0.9)' 
//                     : 'rgba(0, 132, 255, 0.9)',
//                   backdropFilter: 'blur(12px)',
//                   boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//                   border: isProcessing 
//                     ? '2px solid rgba(100, 116, 139, 0.4)' 
//                     : '2px solid rgba(0, 132, 255, 0.4)',
//                 }}
//               >
//                 <span style={{ fontSize: '1.25rem' }}>
//                   {isProcessing ? '⏳' : '📸'}
//                 </span>
//                 <span>
//                   {status === 'capturing' 
//                     ? 'CAPTURANDO...' 
//                     : status === 'analyzing' 
//                     ? 'ANALISANDO EPIs...' 
//                     : 'VERIFICAR EPIs'}
//                 </span>
//               </button>
//             )}
//           </div>

//           {/* Indicador de análise - overlay central */}
//           {status === 'analyzing' && (
//             <div style={{
//               position: 'absolute',
//               top: '50%',
//               left: '50%',
//               transform: 'translate(-50%, -50%)',
//               background: 'rgba(0, 132, 255, 0.15)',
//               backdropFilter: 'blur(8px)',
//               borderRadius: '50%',
//               width: '120px',
//               height: '120px',
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               justifyContent: 'center',
//               gap: '0.5rem',
//               border: '3px solid rgba(0, 132, 255, 0.4)',
//               boxShadow: '0 0 30px rgba(0, 132, 255, 0.3)',
//               animation: 'pulse 1.5s ease-in-out infinite',
//               zIndex: 5,
//             }}>
//               <div style={{
//                 width: '40px',
//                 height: '40px',
//                 border: '4px solid rgba(0, 132, 255, 0.3)',
//                 borderTop: '4px solid var(--blue-bright)',
//                 borderRadius: '50%',
//                 animation: 'spin 1s linear infinite',
//               }} />
//               <span style={{
//                 fontFamily: 'var(--font-mono)',
//                 fontSize: '0.65rem',
//                 color: 'var(--blue-bright)',
//                 fontWeight: 700,
//                 letterSpacing: '0.05em',
//               }}>
//                 ANALISANDO
//               </span>
//             </div>
//           )}

//         </div>
//       </div>

//       {/* Animações CSS */}
//       <style>{`
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//         @keyframes pulse {
//           0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
//           50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
//         }
//       `}</style>

//     </div>
//   );
// }


// src/screens/EpiScanScreen/index.tsx
// Tela de verificação de EPI com Stepper de progresso
// Layout otimizado: uma câmera vertical ocupando máximo de espaço com stepper no topo
// NOVO: Detecção de enquadramento corporal completo com feedback visual

// import { useEffect, useRef } from 'react';
// import CameraView from '../components/CameraView';
// import Stepper from '../components/Stepper';
// import type { CameraHook } from '../../../hooks/useCamAutomation';
// // import { useBodyFramingDetection } from '../../../hooks/useBodyFramingDetection';
// import { useBodyFramingDetectionLocal } from '../../../hooks/useBodyFramingDetectionLocal';

// export interface EpiScanState {
//   status: 'idle' | 'capturing' | 'analyzing' | 'ok' | 'error';
//   errorMsg?: string;
//   captureUrl?: string | null;
//   detectedEpi?: string[];
// }

// interface EpiScanScreenProps {
//   epiScanState: EpiScanState;
//   cameraHook: CameraHook;
//   person: { name: string; photo?: string } | null;
//   onCapture: () => void;
//   onRetry: () => void;
//   onCancel: () => void;
// }

// export default function EpiScanScreen({
//   epiScanState,
//   cameraHook,
//   person,
//   onCapture,
//   onRetry,
//   onCancel,
// }: EpiScanScreenProps) {
//   const { status, errorMsg, captureUrl, detectedEpi = [] } = epiScanState;
//   const videoRef = useRef<HTMLVideoElement | null>(null);

  

//   // Obter referência do vídeo do hook de câmera
//   useEffect(() => {
//     const assignment = cameraHook.getAssignment('body1');
//     if (assignment) {
//       // Assumindo que o hook expõe uma forma de obter a ref do vídeo
//       // Ajuste conforme sua implementação do CameraHook
//       videoRef.current = document.querySelector('video[data-role="body1"]');
//     }
//   }, [cameraHook]);

//   // Hook de detecção de enquadramento
//   //@ts-ignore
//   // const { feedback, isWellFramed, shouldBlock } = useBodyFramingDetection({
//   //   videoElement: videoRef.current,
//   //    enabled: true, // Só verifica quando em idle (antes de capturar)
//   //   checkIntervalMs: 800,
//   //   apiEndpoint: 'https://aihub.smartxhub.cloud/api/v1/epi/camera/analyze-framing', // Ajuste para seu endpoint
//   // });

//   // No componente:
//   const { feedback, isWellFramed, shouldBlock } = useBodyFramingDetectionLocal({
//     videoElement: videoRef.current,
//     enabled: true,
//   });

//   const camStatus: 'idle' | 'scanning' | 'ok' | 'fail' | 'warning' =
//     status === 'analyzing' ? 'scanning' :
//     status === 'ok' ? 'ok' :
//     status === 'error' ? 'fail' :
//     !isWellFramed && status === 'idle' ? 'warning' :
//     'idle';

//   const isProcessing = status === 'capturing' || status === 'analyzing';
  
//   // Bloquear captura se enquadramento não estiver adequado
//   // const canCapture = isWellFramed || status !== 'idle';
//   const canCapture = isWellFramed || status !== 'idle';
//   // IMPORTANTE: Bloquear captura se não estiver bem enquadrado
//   const shouldBlockCapture = !isWellFramed && status === 'idle';

//   // Determinar cor do feedback baseado no status
//   const getFeedbackColor = () => {
//     switch (feedback.status) {
//       case 'well-framed': return 'var(--green)';
//       case 'too-close': return 'var(--red)';
//       case 'partial': return 'var(--amber)';
//       case 'no-person': return 'var(--red)';
//       case 'checking': return 'var(--blue)';
//       default: return 'var(--gray)';
//     }
//   };

//   // Ícone do feedback
//   const getFeedbackIcon = () => {
//     switch (feedback.status) {
//       case 'well-framed': return '✓';
//       case 'too-close': return '←';
//       case 'partial': return '⚠';
//       case 'no-person': return '👤';
//       case 'checking': return '⏳';
//       default: return '•';
//     }
//   };

//   // Adicione depois da declaração do hook
//   useEffect(() => {
//     console.log('🎯 Framing Detection State:', {
//       enabled: status === 'idle',
//       hasVideo: !!videoRef.current,
//       feedback: feedback.status,
//       isWellFramed,
//       shouldBlock
//     });
//   }, [status, feedback, isWellFramed, shouldBlock]);

//   return (
//     <div style={{
//       flex: 1,
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       justifyContent: 'flex-start',
//       padding: '0.5rem 1rem',
//       gap: '0.5rem',
//       position: 'relative',
//       overflow: 'hidden',
//     }}>

//       {/* Stepper de progresso no topo */}
//       <div style={{
//         width: '100%',
//         display: 'flex',
//         justifyContent: 'center',
//         flexShrink: 0,
//         zIndex: 10,
//       }}>
//         <Stepper currentStep="epi" compact />
//       </div>

//       {/* Nome da pessoa (opcional, pequeno) */}
//       {person && (
//         <p style={{
//           fontFamily: 'var(--font-mono)',
//           fontSize: '0.7rem',
//           color: 'var(--gray-light)',
//           letterSpacing: '0.05em',
//           margin: 0,
//           flexShrink: 0,
//         }}>
//           {person.name}
//         </p>
//       )}

//       {/* Container da câmera ocupando todo espaço vertical disponível */}
//       <div style={{
//         flex: 1,
//         width: '100%',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         position: 'relative',
//         minHeight: 0,
//         overflow: 'hidden',
//       }}>
//         <div style={{
//           width: '100%',
//           height: '100%',
//           maxWidth: '600px',
//           position: 'relative',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}>
//           <CameraView
//             role="body1"
//             cameraHook={cameraHook}
//             scanning={status === 'analyzing'}
//             captureUrl={captureUrl}
//             status={camStatus}
//             autoStart
//             aspectRatio="9/16"
//             dynamicSize={false}
//           />

//           {/* Botão X para cancelar - canto superior direito */}
//           <button
//             onClick={onCancel}
//             style={{
//               position: 'absolute',
//               top: '1rem',
//               right: '1rem',
//               width: '44px',
//               height: '44px',
//               borderRadius: '50%',
//               border: '2px solid rgba(255, 255, 255, 0.3)',
//               background: 'rgba(33, 40, 54, 0.85)',
//               backdropFilter: 'blur(12px)',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               cursor: 'pointer',
//               fontSize: '1.25rem',
//               color: 'var(--gray-light)',
//               transition: 'all 200ms ease',
//               zIndex: 15,
//               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.background = 'rgba(220, 38, 38, 0.85)';
//               e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.6)';
//               e.currentTarget.style.color = '#fff';
//               e.currentTarget.style.transform = 'scale(1.05)';
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.background = 'rgba(33, 40, 54, 0.85)';
//               e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
//               e.currentTarget.style.color = 'var(--gray-light)';
//               e.currentTarget.style.transform = 'scale(1)';
//             }}
//           >
//             ✕
//           </button>

//           {/* NOVO: Feedback de enquadramento corporal - topo centralizado */}
//           {status === 'idle' && (
//             <div style={{
//               position: 'absolute',
//               top: '1rem',
//               left: '50%',
//               transform: 'translateX(-50%)',
//               background: `${getFeedbackColor()}22`,
//               backdropFilter: 'blur(12px)',
//               border: `2px solid ${getFeedbackColor()}66`,
//               borderRadius: 'var(--radius-md)',
//               padding: '0.75rem 1rem',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '0.75rem',
//               boxShadow: `0 4px 16px ${getFeedbackColor()}33`,
//               zIndex: 12,
//               maxWidth: '90%',
//               transition: 'all 300ms ease',
//               animation: feedback.status === 'checking' ? 'pulse 2s ease-in-out infinite' : 'none',
//             }}>
//               <div style={{
//                 width: '36px',
//                 height: '36px',
//                 borderRadius: '50%',
//                 background: `${getFeedbackColor()}33`,
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 fontSize: '1.2rem',
//                 color: getFeedbackColor(),
//                 fontWeight: 'bold',
//                 flexShrink: 0,
//               }}>
//                 {getFeedbackIcon()}
//               </div>
//               <div style={{ flex: 1 }}>
//                 <div style={{
//                   fontFamily: 'var(--font-head)',
//                   fontSize: '0.85rem',
//                   fontWeight: 700,
//                   color: getFeedbackColor(),
//                   marginBottom: '0.15rem',
//                 }}>
//                   {feedback.message}
//                 </div>
//                 {feedback.missingParts && feedback.missingParts.length > 0 && (
//                   <div style={{
//                     fontFamily: 'var(--font-mono)',
//                     fontSize: '0.7rem',
//                     color: 'rgba(255, 255, 255, 0.7)',
//                   }}>
//                     {feedback.missingParts.join(' • ')}
//                   </div>
//                 )}
//               </div>
//               {/* Barra de confiança */}
//               <div style={{
//                 width: '4px',
//                 height: '40px',
//                 background: 'rgba(255, 255, 255, 0.1)',
//                 borderRadius: '2px',
//                 position: 'relative',
//                 overflow: 'hidden',
//               }}>
//                 <div style={{
//                   position: 'absolute',
//                   bottom: 0,
//                   left: 0,
//                   right: 0,
//                   height: `${feedback.confidence}%`,
//                   background: getFeedbackColor(),
//                   transition: 'height 300ms ease',
//                 }} />
//               </div>
//             </div>
//           )}

//           {/* Guias visuais de distância - apenas quando muito próximo */}
//           {status === 'idle' && feedback.status === 'too-close' && (
//             <div style={{
//               position: 'absolute',
//               inset: 0,
//               pointerEvents: 'none',
//               zIndex: 5,
//             }}>
//               {/* Setas indicando direção de afastamento */}
//               <div style={{
//                 position: 'absolute',
//                 top: '50%',
//                 left: '50%',
//                 transform: 'translate(-50%, -50%)',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'center',
//                 gap: '1rem',
//                 animation: 'bounce-vertical 1.5s ease-in-out infinite',
//               }}>
//                 <div style={{
//                   fontSize: '3rem',
//                   color: 'var(--red)',
//                   textShadow: '0 0 20px rgba(220, 38, 38, 0.8)',
//                 }}>
//                   ⬇
//                 </div>
//                 <div style={{
//                   fontFamily: 'var(--font-head)',
//                   fontSize: '1.2rem',
//                   fontWeight: 700,
//                   color: 'var(--red)',
//                   textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
//                   background: 'rgba(220, 38, 38, 0.2)',
//                   padding: '0.5rem 1rem',
//                   borderRadius: 'var(--radius-md)',
//                 }}>
//                   AFASTE-SE
//                 </div>
//                 <div style={{
//                   fontSize: '3rem',
//                   color: 'var(--red)',
//                   textShadow: '0 0 20px rgba(220, 38, 38, 0.8)',
//                 }}>
//                   ⬇
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Frame de referência ideal - mostra quando parcialmente visível */}
//           {status === 'idle' && feedback.status === 'partial' && (
//             <div style={{
//               position: 'absolute',
//               inset: '8%',
//               border: '3px dashed var(--amber)',
//               borderRadius: 'var(--radius-lg)',
//               pointerEvents: 'none',
//               opacity: 0.6,
//               animation: 'pulse-border 2s ease-in-out infinite',
//               zIndex: 3,
//             }} />
//           )}

//           {/* EPIs detectados - badge flutuante superior esquerdo */}
//           {detectedEpi.length > 0 && (
//             <div style={{
//               position: 'absolute',
//               top: '1rem',
//               left: '1rem',
//               background: 'rgba(34, 197, 94, 0.9)',
//               backdropFilter: 'blur(12px)',
//               borderRadius: 'var(--radius-md)',
//               padding: '0.5rem 0.75rem',
//               display: 'flex',
//               flexDirection: 'column',
//               gap: '0.25rem',
//               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//               zIndex: 10,
//               maxWidth: '200px',
//             }}>
//               <div style={{
//                 fontFamily: 'var(--font-mono)',
//                 fontSize: '0.65rem',
//                 fontWeight: 700,
//                 color: '#fff',
//                 letterSpacing: '0.05em',
//                 textTransform: 'uppercase',
//               }}>
//                 ✓ Detectados ({detectedEpi.length})
//               </div>
//               <div style={{
//                 display: 'flex',
//                 flexWrap: 'wrap',
//                 gap: '0.25rem',
//               }}>
//                 {detectedEpi.map((epi, idx) => (
//                   <span
//                     key={idx}
//                     style={{
//                       fontFamily: 'var(--font-body)',
//                       fontSize: '0.7rem',
//                       color: 'rgba(255, 255, 255, 0.95)',
//                       background: 'rgba(255, 255, 255, 0.15)',
//                       padding: '2px 6px',
//                       borderRadius: '4px',
//                     }}
//                   >
//                     {epi}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Botões de ação - parte inferior sobreposta */}
//           <div style={{
//             position: 'absolute',
//             bottom: '1.5rem',
//             left: '1rem',
//             right: '1rem',
//             display: 'flex',
//             flexDirection: 'column',
//             gap: '0.75rem',
//             zIndex: 10,
//           }}>
            
//             {/* Mensagem de erro inline */}
//             {status === 'error' && errorMsg && (
//               <div style={{
//                 background: 'rgba(220, 38, 38, 0.95)',
//                 border: '1px solid rgba(220, 38, 38, 0.4)',
//                 borderRadius: 'var(--radius-md)',
//                 padding: '0.75rem',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '0.5rem',
//                 backdropFilter: 'blur(12px)',
//                 boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//               }}>
//                 <span style={{ fontSize: '1.1rem' }}>⚠️</span>
//                 <div style={{
//                   flex: 1,
//                   fontFamily: 'var(--font-body)',
//                   fontSize: '0.8rem',
//                   color: '#fff',
//                 }}>
//                   {errorMsg}
//                 </div>
//               </div>
//             )}

//             {/* Botão principal */}
//             {status === 'error' ? (
//               <button
//                 onClick={onRetry}
//                 className="btn-primary"
//                 style={{
//                   width: '100%',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '0.75rem',
//                   padding: '1rem',
//                   fontSize: '0.95rem',
//                   background: 'rgba(0, 132, 255, 0.9)',
//                   backdropFilter: 'blur(12px)',
//                   boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//                   border: '2px solid rgba(0, 132, 255, 0.4)',
//                 }}
//               >
//                 <span>🔄</span>
//                 <span>TENTAR NOVAMENTE</span>
//               </button>
//             ) : (
//               <button
//                 onClick={onCapture}
//                 // disabled={isProcessing || !canCapture}
//                 disabled={isProcessing || shouldBlockCapture}
//                 className="btn-primary"
//                 style={{
//                   width: '100%',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '0.75rem',
//                   padding: '1rem',
//                   fontSize: '0.95rem',
//                   opacity: (isProcessing || !canCapture) ? 0.6 : 1,
//                   cursor: (isProcessing || !canCapture) ? 'not-allowed' : 'pointer',
//                   background: (isProcessing || !canCapture)
//                     ? 'rgba(100, 116, 139, 0.9)' 
//                     : 'rgba(0, 132, 255, 0.9)',
//                   backdropFilter: 'blur(12px)',
//                   boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//                   border: (isProcessing || !canCapture)
//                     ? '2px solid rgba(100, 116, 139, 0.4)' 
//                     : '2px solid rgba(0, 132, 255, 0.4)',
//                 }}
//               >
//                 <span style={{ fontSize: '1.25rem' }}>
//                   {isProcessing ? '⏳' : !canCapture ? '⚠️' : '📸'}
//                 </span>
//                 <span>
//                   {status === 'capturing' 
//                     ? 'CAPTURANDO...' 
//                     : status === 'analyzing' 
//                     ? 'ANALISANDO EPIs...'
//                     : !canCapture
//                     ? 'AJUSTE SUA POSIÇÃO'
//                     : 'VERIFICAR EPIs'}
//                 </span>
//               </button>
//             )}
//           </div>

//           {/* Indicador de análise - overlay central */}
//           {status === 'analyzing' && (
//             <div style={{
//               position: 'absolute',
//               top: '50%',
//               left: '50%',
//               transform: 'translate(-50%, -50%)',
//               background: 'rgba(0, 132, 255, 0.15)',
//               backdropFilter: 'blur(8px)',
//               borderRadius: '50%',
//               width: '120px',
//               height: '120px',
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               justifyContent: 'center',
//               gap: '0.5rem',
//               border: '3px solid rgba(0, 132, 255, 0.4)',
//               boxShadow: '0 0 30px rgba(0, 132, 255, 0.3)',
//               animation: 'pulse 1.5s ease-in-out infinite',
//               zIndex: 5,
//             }}>
//               <div style={{
//                 width: '40px',
//                 height: '40px',
//                 border: '4px solid rgba(0, 132, 255, 0.3)',
//                 borderTop: '4px solid var(--blue-bright)',
//                 borderRadius: '50%',
//                 animation: 'spin 1s linear infinite',
//               }} />
//               <span style={{
//                 fontFamily: 'var(--font-mono)',
//                 fontSize: '0.65rem',
//                 color: 'var(--blue-bright)',
//                 fontWeight: 700,
//                 letterSpacing: '0.05em',
//               }}>
//                 ANALISANDO
//               </span>
//             </div>
//           )}

//           {/* NOVO: Aviso de bloqueio por enquadramento */}
//           {status === 'idle' && !isWellFramed && (
//             <div style={{
//               position: 'absolute',
//               bottom: '6rem',
//               left: '50%',
//               transform: 'translateX(-50%)',
//               background: 'rgba(220, 38, 38, 0.95)',
//               border: '2px solid rgba(220, 38, 38, 0.6)',
//               borderRadius: 'var(--radius-md)',
//               padding: '1rem 1.5rem',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '0.75rem',
//               backdropFilter: 'blur(12px)',
//               boxShadow: '0 4px 16px rgba(220, 38, 38, 0.5)',
//               zIndex: 11,
//               maxWidth: '85%',
//               animation: 'pulse-warning 2s ease-in-out infinite',
//             }}>
//               <span style={{ fontSize: '1.5rem' }}>🚫</span>
//               <div style={{
//                 fontFamily: 'var(--font-head)',
//                 fontSize: '0.9rem',
//                 fontWeight: 700,
//                 color: '#fff',
//                 textAlign: 'center',
//               }}>
//                 Ajuste o enquadramento antes de capturar
//               </div>
//             </div>
//           )}

//         </div>
//       </div>

//       {/* Animações CSS */}
//       <style>{`
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//         @keyframes pulse {
//           0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
//           50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
//         }
//         @keyframes bounce-vertical {
//           0%, 100% { transform: translate(-50%, -50%) translateY(0); }
//           50% { transform: translate(-50%, -50%) translateY(-15px); }
//         }
//         @keyframes pulse-border {
//           0%, 100% { opacity: 0.6; border-width: 3px; }
//           50% { opacity: 0.9; border-width: 4px; }
//         }

//         @keyframes pulse-warning {
//           0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
//           50% { opacity: 0.85; transform: translateX(-50%) scale(1.02); }
//         }
//       `}</style>

//     </div>
//   );
// }


// src/screens/EpiScanScreen/index.tsx
// Tela de verificação de EPI com Stepper de progresso
// Layout otimizado: uma câmera vertical ocupando máximo de espaço com stepper no topo
// NOVO: Detecção de enquadramento corporal completo com feedback visual usando MediaPipe

// import { useEffect, useRef } from 'react';
// import CameraView from '../components/CameraView';
// import Stepper from '../components/Stepper';
// import type { CameraHook } from '../../../hooks/useCamAutomation';
// import { useBodyFramingDetectionLocal } from '../../../hooks/useBodyFramingDetectionLocal';

// export interface EpiScanState {
//   status: 'idle' | 'capturing' | 'analyzing' | 'ok' | 'error';
//   errorMsg?: string;
//   captureUrl?: string | null;
//   detectedEpi?: string[];
// }

// interface EpiScanScreenProps {
//   epiScanState: EpiScanState;
//   cameraHook: CameraHook;
//   person: { name: string; photo?: string } | null;
//   onCapture: () => void;
//   onRetry: () => void;
//   onCancel: () => void;
// }

// export default function EpiScanScreen({
//   epiScanState,
//   cameraHook,
//   person,
//   onCapture,
//   onRetry,
//   onCancel,
// }: EpiScanScreenProps) {
//   const { status, errorMsg, captureUrl, detectedEpi = [] } = epiScanState;
//   const videoRef = useRef<HTMLVideoElement | null>(null);

//   // Obter referência do vídeo do hook de câmera
//   useEffect(() => {
//     const assignment = cameraHook.getAssignment('body1');
//     if (assignment) {
//       videoRef.current = document.querySelector('video[data-role="body1"]');
//     }
//   }, [cameraHook]);

//   // Hook de detecção de enquadramento usando MediaPipe (local)
//   const { feedback, isWellFramed, shouldBlock } = useBodyFramingDetectionLocal({
//     videoElement: videoRef.current,
//     enabled: true,
//   });

//   const camStatus: 'idle' | 'scanning' | 'ok' | 'fail' | 'warning' =
//     status === 'analyzing' ? 'scanning' :
//     status === 'ok' ? 'ok' :
//     status === 'error' ? 'fail' :
//     !isWellFramed && status === 'idle' ? 'warning' :
//     'idle';

//   const isProcessing = status === 'capturing' || status === 'analyzing';
  
//   // Bloquear captura se não estiver bem enquadrado OU se estiver processando
//   const shouldBlockCapture = !isWellFramed || isProcessing;

//   // Determinar cor do feedback baseado no status
//   const getFeedbackColor = () => {
//     switch (feedback.status) {
//       case 'well-framed': return 'var(--green)';
//       case 'too-close': return 'var(--red)';
//       case 'partial': return 'var(--amber)';
//       case 'no-person': return 'var(--red)';
//       case 'checking': return 'var(--blue)';
//       default: return 'var(--gray)';
//     }
//   };

//   // Ícone do feedback
//   const getFeedbackIcon = () => {
//     switch (feedback.status) {
//       case 'well-framed': return '✓';
//       case 'too-close': return '←';
//       case 'partial': return '⚠';
//       case 'no-person': return '👤';
//       case 'checking': return '⏳';
//       default: return '•';
//     }
//   };

//   // Debug: Log do estado (remover em produção)
//   useEffect(() => {
//     console.log('🎯 Framing Detection State:', {
//       status,
//       hasVideo: !!videoRef.current,
//       feedback: feedback.status,
//       isWellFramed,
//       shouldBlock,
//       shouldBlockCapture
//     });
//   }, [status, feedback, isWellFramed, shouldBlock, shouldBlockCapture]);

//   return (
//     <div style={{
//       flex: 1,
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       justifyContent: 'flex-start',
//       padding: '0.5rem 1rem',
//       gap: '0.5rem',
//       position: 'relative',
//       overflow: 'hidden',
//     }}>

//       {/* Stepper de progresso no topo */}
//       <div style={{
//         width: '100%',
//         display: 'flex',
//         justifyContent: 'center',
//         flexShrink: 0,
//         zIndex: 10,
//       }}>
//         <Stepper currentStep="epi" compact />
//       </div>

//       {/* Nome da pessoa (opcional, pequeno) */}
//       {person && (
//         <p style={{
//           fontFamily: 'var(--font-mono)',
//           fontSize: '0.7rem',
//           color: 'var(--gray-light)',
//           letterSpacing: '0.05em',
//           margin: 0,
//           flexShrink: 0,
//         }}>
//           {person.name}
//         </p>
//       )}

//       {/* Container da câmera ocupando todo espaço vertical disponível */}
//       <div style={{
//         flex: 1,
//         width: '100%',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         position: 'relative',
//         minHeight: 0,
//         overflow: 'hidden',
//       }}>
//         <div style={{
//           width: '100%',
//           height: '100%',
//           maxWidth: '600px',
//           position: 'relative',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}>
//           <CameraView
//             role="body1"
//             cameraHook={cameraHook}
//             scanning={status === 'analyzing'}
//             captureUrl={captureUrl}
//             status={camStatus}
//             autoStart
//             aspectRatio="9/16"
//             dynamicSize={false}
//           />

//           {/* Botão X para cancelar - canto superior direito */}
//           <button
//             onClick={onCancel}
//             style={{
//               position: 'absolute',
//               top: '1rem',
//               right: '1rem',
//               width: '44px',
//               height: '44px',
//               borderRadius: '50%',
//               border: '2px solid rgba(255, 255, 255, 0.3)',
//               background: 'rgba(33, 40, 54, 0.85)',
//               backdropFilter: 'blur(12px)',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               cursor: 'pointer',
//               fontSize: '1.25rem',
//               color: 'var(--gray-light)',
//               transition: 'all 200ms ease',
//               zIndex: 15,
//               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.background = 'rgba(220, 38, 38, 0.85)';
//               e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.6)';
//               e.currentTarget.style.color = '#fff';
//               e.currentTarget.style.transform = 'scale(1.05)';
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.background = 'rgba(33, 40, 54, 0.85)';
//               e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
//               e.currentTarget.style.color = 'var(--gray-light)';
//               e.currentTarget.style.transform = 'scale(1)';
//             }}
//           >
//             ✕
//           </button>

//           {/* NOVO: Feedback de enquadramento corporal - topo centralizado */}
//           {status === 'idle' && (
//             <div style={{
//               position: 'absolute',
//               top: '1rem',
//               left: '50%',
//               transform: 'translateX(-50%)',
//               background: `${getFeedbackColor()}22`,
//               backdropFilter: 'blur(12px)',
//               border: `2px solid ${getFeedbackColor()}66`,
//               borderRadius: 'var(--radius-md)',
//               padding: '0.75rem 1rem',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '0.75rem',
//               boxShadow: `0 4px 16px ${getFeedbackColor()}33`,
//               zIndex: 12,
//               maxWidth: '90%',
//               transition: 'all 300ms ease',
//               animation: feedback.status === 'checking' ? 'pulse 2s ease-in-out infinite' : 'none',
//             }}>
//               <div style={{
//                 width: '36px',
//                 height: '36px',
//                 borderRadius: '50%',
//                 background: `${getFeedbackColor()}33`,
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 fontSize: '1.2rem',
//                 color: getFeedbackColor(),
//                 fontWeight: 'bold',
//                 flexShrink: 0,
//               }}>
//                 {getFeedbackIcon()}
//               </div>
//               <div style={{ flex: 1 }}>
//                 <div style={{
//                   fontFamily: 'var(--font-head)',
//                   fontSize: '0.85rem',
//                   fontWeight: 700,
//                   color: getFeedbackColor(),
//                   marginBottom: '0.15rem',
//                 }}>
//                   {feedback.message}
//                 </div>
//                 {feedback.missingParts && feedback.missingParts.length > 0 && (
//                   <div style={{
//                     fontFamily: 'var(--font-mono)',
//                     fontSize: '0.7rem',
//                     color: 'rgba(255, 255, 255, 0.7)',
//                   }}>
//                     {feedback.missingParts.join(' • ')}
//                   </div>
//                 )}
//               </div>
//               {/* Barra de confiança */}
//               <div style={{
//                 width: '4px',
//                 height: '40px',
//                 background: 'rgba(255, 255, 255, 0.1)',
//                 borderRadius: '2px',
//                 position: 'relative',
//                 overflow: 'hidden',
//               }}>
//                 <div style={{
//                   position: 'absolute',
//                   bottom: 0,
//                   left: 0,
//                   right: 0,
//                   height: `${feedback.confidence}%`,
//                   background: getFeedbackColor(),
//                   transition: 'height 300ms ease',
//                 }} />
//               </div>
//             </div>
//           )}

//           {/* Guias visuais de distância - apenas quando muito próximo */}
//           {status === 'idle' && feedback.status === 'too-close' && (
//             <div style={{
//               position: 'absolute',
//               inset: 0,
//               pointerEvents: 'none',
//               zIndex: 5,
//             }}>
//               {/* Setas indicando direção de afastamento */}
//               <div style={{
//                 position: 'absolute',
//                 top: '50%',
//                 left: '50%',
//                 transform: 'translate(-50%, -50%)',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'center',
//                 gap: '1rem',
//                 animation: 'bounce-vertical 1.5s ease-in-out infinite',
//               }}>
//                 <div style={{
//                   fontSize: '3rem',
//                   color: 'var(--red)',
//                   textShadow: '0 0 20px rgba(220, 38, 38, 0.8)',
//                 }}>
//                   ⬇
//                 </div>
//                 <div style={{
//                   fontFamily: 'var(--font-head)',
//                   fontSize: '1.2rem',
//                   fontWeight: 700,
//                   color: 'var(--red)',
//                   textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
//                   background: 'rgba(220, 38, 38, 0.2)',
//                   padding: '0.5rem 1rem',
//                   borderRadius: 'var(--radius-md)',
//                 }}>
//                   AFASTE-SE
//                 </div>
//                 <div style={{
//                   fontSize: '3rem',
//                   color: 'var(--red)',
//                   textShadow: '0 0 20px rgba(220, 38, 38, 0.8)',
//                 }}>
//                   ⬇
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Frame de referência ideal - mostra quando parcialmente visível */}
//           {status === 'idle' && feedback.status === 'partial' && (
//             <div style={{
//               position: 'absolute',
//               inset: '8%',
//               border: '3px dashed var(--amber)',
//               borderRadius: 'var(--radius-lg)',
//               pointerEvents: 'none',
//               opacity: 0.6,
//               animation: 'pulse-border 2s ease-in-out infinite',
//               zIndex: 3,
//             }} />
//           )}

//           {/* EPIs detectados - badge flutuante superior esquerdo */}
//           {detectedEpi.length > 0 && (
//             <div style={{
//               position: 'absolute',
//               top: '1rem',
//               left: '1rem',
//               background: 'rgba(34, 197, 94, 0.9)',
//               backdropFilter: 'blur(12px)',
//               borderRadius: 'var(--radius-md)',
//               padding: '0.5rem 0.75rem',
//               display: 'flex',
//               flexDirection: 'column',
//               gap: '0.25rem',
//               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//               zIndex: 10,
//               maxWidth: '200px',
//             }}>
//               <div style={{
//                 fontFamily: 'var(--font-mono)',
//                 fontSize: '0.65rem',
//                 fontWeight: 700,
//                 color: '#fff',
//                 letterSpacing: '0.05em',
//                 textTransform: 'uppercase',
//               }}>
//                 ✓ Detectados ({detectedEpi.length})
//               </div>
//               <div style={{
//                 display: 'flex',
//                 flexWrap: 'wrap',
//                 gap: '0.25rem',
//               }}>
//                 {detectedEpi.map((epi, idx) => (
//                   <span
//                     key={idx}
//                     style={{
//                       fontFamily: 'var(--font-body)',
//                       fontSize: '0.7rem',
//                       color: 'rgba(255, 255, 255, 0.95)',
//                       background: 'rgba(255, 255, 255, 0.15)',
//                       padding: '2px 6px',
//                       borderRadius: '4px',
//                     }}
//                   >
//                     {epi}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Botões de ação - parte inferior sobreposta */}
//           <div style={{
//             position: 'absolute',
//             bottom: '1.5rem',
//             left: '1rem',
//             right: '1rem',
//             display: 'flex',
//             flexDirection: 'column',
//             gap: '0.75rem',
//             zIndex: 10,
//           }}>
            
//             {/* Mensagem de erro inline */}
//             {status === 'error' && errorMsg && (
//               <div style={{
//                 background: 'rgba(220, 38, 38, 0.95)',
//                 border: '1px solid rgba(220, 38, 38, 0.4)',
//                 borderRadius: 'var(--radius-md)',
//                 padding: '0.75rem',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '0.5rem',
//                 backdropFilter: 'blur(12px)',
//                 boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//               }}>
//                 <span style={{ fontSize: '1.1rem' }}>⚠️</span>
//                 <div style={{
//                   flex: 1,
//                   fontFamily: 'var(--font-body)',
//                   fontSize: '0.8rem',
//                   color: '#fff',
//                 }}>
//                   {errorMsg}
//                 </div>
//               </div>
//             )}

//             {/* Botão principal */}
//             {status === 'error' ? (
//               <button
//                 onClick={onRetry}
//                 className="btn-primary"
//                 style={{
//                   width: '100%',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '0.75rem',
//                   padding: '1rem',
//                   fontSize: '0.95rem',
//                   background: 'rgba(0, 132, 255, 0.9)',
//                   backdropFilter: 'blur(12px)',
//                   boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//                   border: '2px solid rgba(0, 132, 255, 0.4)',
//                 }}
//               >
//                 <span>🔄</span>
//                 <span>TENTAR NOVAMENTE</span>
//               </button>
//             ) : (
//               <button
//                 onClick={onCapture}
//                 disabled={shouldBlockCapture}
//                 className="btn-primary"
//                 style={{
//                   width: '100%',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '0.75rem',
//                   padding: '1rem',
//                   fontSize: '0.95rem',
//                   opacity: shouldBlockCapture ? 0.6 : 1,
//                   cursor: shouldBlockCapture ? 'not-allowed' : 'pointer',
//                   background: shouldBlockCapture
//                     ? 'rgba(100, 116, 139, 0.9)' 
//                     : 'rgba(0, 132, 255, 0.9)',
//                   backdropFilter: 'blur(12px)',
//                   boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//                   border: shouldBlockCapture
//                     ? '2px solid rgba(100, 116, 139, 0.4)' 
//                     : '2px solid rgba(0, 132, 255, 0.4)',
//                 }}
//               >
//                 <span style={{ fontSize: '1.25rem' }}>
//                   {isProcessing ? '⏳' : !isWellFramed ? '⚠️' : '📸'}
//                 </span>
//                 <span>
//                   {status === 'capturing' 
//                     ? 'CAPTURANDO...' 
//                     : status === 'analyzing' 
//                     ? 'ANALISANDO EPIs...'
//                     : !isWellFramed
//                     ? 'AJUSTE SUA POSIÇÃO'
//                     : 'VERIFICAR EPIs'}
//                 </span>
//               </button>
//             )}
//           </div>

//           {/* Indicador de análise - overlay central */}
//           {status === 'analyzing' && (
//             <div style={{
//               position: 'absolute',
//               top: '50%',
//               left: '50%',
//               transform: 'translate(-50%, -50%)',
//               background: 'rgba(0, 132, 255, 0.15)',
//               backdropFilter: 'blur(8px)',
//               borderRadius: '50%',
//               width: '120px',
//               height: '120px',
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               justifyContent: 'center',
//               gap: '0.5rem',
//               border: '3px solid rgba(0, 132, 255, 0.4)',
//               boxShadow: '0 0 30px rgba(0, 132, 255, 0.3)',
//               animation: 'pulse 1.5s ease-in-out infinite',
//               zIndex: 5,
//             }}>
//               <div style={{
//                 width: '40px',
//                 height: '40px',
//                 border: '4px solid rgba(0, 132, 255, 0.3)',
//                 borderTop: '4px solid var(--blue-bright)',
//                 borderRadius: '50%',
//                 animation: 'spin 1s linear infinite',
//               }} />
//               <span style={{
//                 fontFamily: 'var(--font-mono)',
//                 fontSize: '0.65rem',
//                 color: 'var(--blue-bright)',
//                 fontWeight: 700,
//                 letterSpacing: '0.05em',
//               }}>
//                 ANALISANDO
//               </span>
//             </div>
//           )}

//           {/* NOVO: Aviso de bloqueio por enquadramento */}
//           {status === 'idle' && !isWellFramed && (
//             <div style={{
//               position: 'absolute',
//               bottom: '6rem',
//               left: '50%',
//               transform: 'translateX(-50%)',
//               background: 'rgba(220, 38, 38, 0.95)',
//               border: '2px solid rgba(220, 38, 38, 0.6)',
//               borderRadius: 'var(--radius-md)',
//               padding: '1rem 1.5rem',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '0.75rem',
//               backdropFilter: 'blur(12px)',
//               boxShadow: '0 4px 16px rgba(220, 38, 38, 0.5)',
//               zIndex: 11,
//               maxWidth: '85%',
//               animation: 'pulse-warning 2s ease-in-out infinite',
//             }}>
//               <span style={{ fontSize: '1.5rem' }}>🚫</span>
//               <div style={{
//                 fontFamily: 'var(--font-head)',
//                 fontSize: '0.9rem',
//                 fontWeight: 700,
//                 color: '#fff',
//                 textAlign: 'center',
//               }}>
//                 Ajuste o enquadramento antes de capturar
//               </div>
//             </div>
//           )}

//         </div>
//       </div>

//       {/* Animações CSS */}
//       <style>{`
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//         @keyframes pulse {
//           0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
//           50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
//         }
//         @keyframes bounce-vertical {
//           0%, 100% { transform: translate(-50%, -50%) translateY(0); }
//           50% { transform: translate(-50%, -50%) translateY(-15px); }
//         }
//         @keyframes pulse-border {
//           0%, 100% { opacity: 0.6; border-width: 3px; }
//           50% { opacity: 0.9; border-width: 4px; }
//         }
//         @keyframes pulse-warning {
//           0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
//           50% { opacity: 0.85; transform: translateX(-50%) scale(1.02); }
//         }
//       `}</style>

//     </div>
//   );
// }




// src/screens/EpiScanScreen/index.tsx
// Tela de verificação de EPI com Stepper de progresso
// Layout otimizado: uma câmera vertical ocupando máximo de espaço com stepper no topo
// NOVO: Detecção de enquadramento corporal completo com feedback visual usando MediaPipe
// NOVO: Auto-captura quando bem posicionado

// import { useEffect, useRef, useState } from 'react';
// import CameraView from '../components/CameraView';
// import Stepper from '../components/Stepper';
// import type { CameraHook } from '../../../hooks/useCamAutomation';
// import { useBodyFramingDetectionLocal } from '../../../hooks/useBodyFramingDetectionLocal';

// export interface EpiScanState {
//   status: 'idle' | 'capturing' | 'analyzing' | 'ok' | 'error';
//   errorMsg?: string;
//   captureUrl?: string | null;
//   detectedEpi?: string[];
// }

// interface EpiScanScreenProps {
//   epiScanState: EpiScanState;
//   cameraHook: CameraHook;
//   person: { name: string; photo?: string } | null;
//   onCapture: () => void;
//   onRetry: () => void;
//   onCancel: () => void;
//   enableAutoCapture?: boolean;        // Habilitar auto-captura?
//   autoCaptureDuration?: number;       // Duração em ms (padrão: 3000ms = 3s)
// }

// export default function EpiScanScreen({
//   epiScanState,
//   cameraHook,
//   person,
//   onCapture,
//   onRetry,
//   onCancel,
//   enableAutoCapture = true,           // Auto-captura habilitada por padrão
//   autoCaptureDuration = 3000,         // 3 segundos por padrão
// }: EpiScanScreenProps) {
//   const { status, errorMsg, captureUrl, detectedEpi = [] } = epiScanState;
//   const videoRef = useRef<HTMLVideoElement | null>(null);
  
//   // Estados para controle de auto-captura
//   const [autoCaptureProgress, setAutoCaptureProgress] = useState(0);
//   const [isCountingDown, setIsCountingDown] = useState(false);
//   //@ts-ignore
//   const autoCaptureTimerRef = useRef<NodeJS.Timeout | null>(null);
//   const autoCaptureStartTimeRef = useRef<number | null>(null);
//   const animationFrameRef = useRef<number | null>(null);

//   // Obter referência do vídeo do hook de câmera
//   useEffect(() => {
//     const assignment = cameraHook.getAssignment('body1');
//     if (assignment) {
//       videoRef.current = document.querySelector('video[data-role="body1"]');
//     }
//   }, [cameraHook]);

//   // Hook de detecção de enquadramento usando MediaPipe (local)
//   //@ts-ignore
//   const { feedback, isWellFramed, shouldBlock } = useBodyFramingDetectionLocal({
//     videoElement: videoRef.current,
//     enabled: status === 'idle', // Só detecta quando em idle
//   });

//   const camStatus: 'idle' | 'scanning' | 'ok' | 'fail' | 'warning' =
//     status === 'analyzing' ? 'scanning' :
//     status === 'ok' ? 'ok' :
//     status === 'error' ? 'fail' :
//     !isWellFramed && status === 'idle' ? 'warning' :
//     'idle';

//   const isProcessing = status === 'capturing' || status === 'analyzing';
  
//   // Bloquear captura se não estiver bem enquadrado OU se estiver processando
//   const shouldBlockCapture = !isWellFramed || isProcessing;

//   // ═══════════════════════════════════════════════════════════════════════════
//   // AUTO-CAPTURA: Inicia contagem quando bem posicionado
//   // ═══════════════════════════════════════════════════════════════════════════

//   useEffect(() => {
//     // Só ativa auto-captura se:
//     // 1. Recurso habilitado
//     // 2. Status = idle (aguardando captura)
//     // 3. Pessoa bem posicionada
//     // 4. Não está processando
//     if (!enableAutoCapture || status !== 'idle' || !isWellFramed || isProcessing) {
//       // Limpa qualquer contagem em andamento
//       if (autoCaptureTimerRef.current) {
//         clearTimeout(autoCaptureTimerRef.current);
//         autoCaptureTimerRef.current = null;
//       }
//       if (animationFrameRef.current) {
//         cancelAnimationFrame(animationFrameRef.current);
//         animationFrameRef.current = null;
//       }
//       setAutoCaptureProgress(0);
//       setIsCountingDown(false);
//       autoCaptureStartTimeRef.current = null;
//       return;
//     }

//     // Pessoa está bem posicionada - inicia contagem regressiva
//     if (!autoCaptureStartTimeRef.current) {
//       console.log('🎯 Auto-captura: Iniciando contagem regressiva');
//       autoCaptureStartTimeRef.current = Date.now();
//       setIsCountingDown(true);
//     }

//     // Atualiza progresso em loop
//     const updateProgress = () => {
//       if (!autoCaptureStartTimeRef.current) return;

//       const elapsed = Date.now() - autoCaptureStartTimeRef.current;
//       const progress = Math.min((elapsed / autoCaptureDuration) * 100, 100);
      
//       setAutoCaptureProgress(progress);

//       if (progress >= 100) {
//         // Chegou aos 100% - executa captura!
//         console.log('✅ Auto-captura: Executando captura automática');
//         setIsCountingDown(false);
//         autoCaptureStartTimeRef.current = null;
//         onCapture();
//       } else {
//         // Continua atualizando
//         animationFrameRef.current = requestAnimationFrame(updateProgress);
//       }
//     };

//     // Inicia o loop de atualização
//     updateProgress();

//     // Cleanup
//     return () => {
//       if (animationFrameRef.current) {
//         cancelAnimationFrame(animationFrameRef.current);
//       }
//     };
//   }, [enableAutoCapture, status, isWellFramed, isProcessing, autoCaptureDuration, onCapture]);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // HELPERS DE UI
//   // ═══════════════════════════════════════════════════════════════════════════

//   // Determinar cor do feedback baseado no status
//   const getFeedbackColor = () => {
//     switch (feedback.status) {
//       case 'well-framed': return 'var(--green)';
//       case 'too-close': return 'var(--red)';
//       case 'partial': return 'var(--amber)';
//       case 'no-person': return 'var(--red)';
//       case 'checking': return 'var(--blue)';
//       default: return 'var(--gray)';
//     }
//   };

//   // Ícone do feedback
//   const getFeedbackIcon = () => {
//     switch (feedback.status) {
//       case 'well-framed': return '✓';
//       case 'too-close': return '←';
//       case 'partial': return '⚠';
//       case 'no-person': return '👤';
//       case 'checking': return '⏳';
//       default: return '•';
//     }
//   };

//   // Calcular tempo restante para auto-captura
//   const getCountdownSeconds = () => {
//     return Math.ceil((100 - autoCaptureProgress) / (100 / (autoCaptureDuration / 1000)));
//   };

//   // Debug: Log do estado (remover em produção)
//   useEffect(() => {
//     if (enableAutoCapture && status === 'idle') {
//       console.log('🎯 Auto-Capture State:', {
//         isWellFramed,
//         progress: autoCaptureProgress.toFixed(1),
//         countdown: getCountdownSeconds(),
//         isCountingDown,
//       });
//     }
//   }, [enableAutoCapture, status, isWellFramed, autoCaptureProgress, isCountingDown]);

//   return (
//     <div style={{
//       flex: 1,
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       justifyContent: 'flex-start',
//       padding: '0.5rem 1rem',
//       gap: '0.5rem',
//       position: 'relative',
//       overflow: 'hidden',
//     }}>

//       {/* Stepper de progresso no topo */}
//       <div style={{
//         width: '100%',
//         display: 'flex',
//         justifyContent: 'center',
//         flexShrink: 0,
//         zIndex: 10,
//       }}>
//         <Stepper currentStep="epi" compact />
//       </div>

//       {/* Nome da pessoa (opcional, pequeno) */}
//       {person && (
//         <p style={{
//           fontFamily: 'var(--font-mono)',
//           fontSize: '0.7rem',
//           color: 'var(--gray-light)',
//           letterSpacing: '0.05em',
//           margin: 0,
//           flexShrink: 0,
//         }}>
//           {person.name}
//         </p>
//       )}

//       {/* Container da câmera ocupando todo espaço vertical disponível */}
//       <div style={{
//         flex: 1,
//         width: '100%',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         position: 'relative',
//         minHeight: 0,
//         overflow: 'hidden',
//       }}>
//         <div style={{
//           width: '100%',
//           height: '100%',
//           maxWidth: '600px',
//           position: 'relative',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}>
//           <CameraView
//             role="body1"
//             cameraHook={cameraHook}
//             scanning={status === 'analyzing'}
//             captureUrl={captureUrl}
//             status={camStatus}
//             autoStart
//             aspectRatio="9/16"
//             dynamicSize={false}
//           />

//           {/* ══════════════════════════════════════════════════════════════════ */}
//           {/* BARRA DE PROGRESSO AUTO-CAPTURA (topo) */}
//           {/* ══════════════════════════════════════════════════════════════════ */}
//           {enableAutoCapture && isCountingDown && autoCaptureProgress > 0 && (
//             <div style={{
//               position: 'absolute',
//               top: 0,
//               left: 0,
//               right: 0,
//               height: '6px',
//               background: 'rgba(0, 0, 0, 0.5)',
//               overflow: 'hidden',
//               zIndex: 20,
//             }}>
//               <div style={{
//                 height: '100%',
//                 width: `${autoCaptureProgress}%`,
//                 background: 'linear-gradient(90deg, #00FF00, #00CC00)',
//                 transition: 'width 50ms linear',
//                 boxShadow: '0 0 12px rgba(0, 255, 0, 0.6)',
//               }} />
//             </div>
//           )}

//           {/* Botão X para cancelar - canto superior direito */}
//           <button
//             onClick={onCancel}
//             style={{
//               position: 'absolute',
//               top: '1rem',
//               right: '1rem',
//               width: '44px',
//               height: '44px',
//               borderRadius: '50%',
//               border: '2px solid rgba(255, 255, 255, 0.3)',
//               background: 'rgba(33, 40, 54, 0.85)',
//               backdropFilter: 'blur(12px)',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               cursor: 'pointer',
//               fontSize: '1.25rem',
//               color: 'var(--gray-light)',
//               transition: 'all 200ms ease',
//               zIndex: 15,
//               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.background = 'rgba(220, 38, 38, 0.85)';
//               e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.6)';
//               e.currentTarget.style.color = '#fff';
//               e.currentTarget.style.transform = 'scale(1.05)';
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.background = 'rgba(33, 40, 54, 0.85)';
//               e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
//               e.currentTarget.style.color = 'var(--gray-light)';
//               e.currentTarget.style.transform = 'scale(1)';
//             }}
//           >
//             ✕
//           </button>

//           {/* ══════════════════════════════════════════════════════════════════ */}
//           {/* FEEDBACK DE ENQUADRAMENTO CORPORAL - topo centralizado */}
//           {/* ══════════════════════════════════════════════════════════════════ */}
//           {status === 'idle' && (
//             <div style={{
//               position: 'absolute',
//               top: '1rem',
//               left: '50%',
//               transform: 'translateX(-50%)',
//               background: `${getFeedbackColor()}22`,
//               backdropFilter: 'blur(12px)',
//               border: `2px solid ${getFeedbackColor()}66`,
//               borderRadius: 'var(--radius-md)',
//               padding: '0.75rem 1rem',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '0.75rem',
//               boxShadow: `0 4px 16px ${getFeedbackColor()}33`,
//               zIndex: 12,
//               maxWidth: '90%',
//               transition: 'all 300ms ease',
//               animation: feedback.status === 'checking' ? 'pulse 2s ease-in-out infinite' : 'none',
//             }}>
//               <div style={{
//                 width: '36px',
//                 height: '36px',
//                 borderRadius: '50%',
//                 background: `${getFeedbackColor()}33`,
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 fontSize: '1.2rem',
//                 color: getFeedbackColor(),
//                 fontWeight: 'bold',
//                 flexShrink: 0,
//               }}>
//                 {getFeedbackIcon()}
//               </div>
//               <div style={{ flex: 1 }}>
//                 <div style={{
//                   fontFamily: 'var(--font-head)',
//                   fontSize: '0.85rem',
//                   fontWeight: 700,
//                   color: getFeedbackColor(),
//                   marginBottom: '0.15rem',
//                 }}>
//                   {feedback.message}
//                 </div>
//                 {feedback.missingParts && feedback.missingParts.length > 0 && (
//                   <div style={{
//                     fontFamily: 'var(--font-mono)',
//                     fontSize: '0.7rem',
//                     color: 'rgba(255, 255, 255, 0.7)',
//                   }}>
//                     {feedback.missingParts.join(' • ')}
//                   </div>
//                 )}
//               </div>
//               {/* Barra de confiança */}
//               <div style={{
//                 width: '4px',
//                 height: '40px',
//                 background: 'rgba(255, 255, 255, 0.1)',
//                 borderRadius: '2px',
//                 position: 'relative',
//                 overflow: 'hidden',
//               }}>
//                 <div style={{
//                   position: 'absolute',
//                   bottom: 0,
//                   left: 0,
//                   right: 0,
//                   height: `${feedback.confidence}%`,
//                   background: getFeedbackColor(),
//                   transition: 'height 300ms ease',
//                 }} />
//               </div>
//             </div>
//           )}

//           {/* ══════════════════════════════════════════════════════════════════ */}
//           {/* INDICADOR DE AUTO-CAPTURA - centro da tela */}
//           {/* ══════════════════════════════════════════════════════════════════ */}
//           {enableAutoCapture && isCountingDown && autoCaptureProgress > 0 && (
//             <div style={{
//               position: 'absolute',
//               top: '50%',
//               left: '50%',
//               transform: 'translate(-50%, -50%)',
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               gap: '1rem',
//               zIndex: 8,
//               animation: 'pulse-gentle 1.5s ease-in-out infinite',
//             }}>
//               {/* Círculo de progresso */}
//               <div style={{
//                 position: 'relative',
//                 width: '140px',
//                 height: '140px',
//               }}>
//                 {/* Círculo de fundo */}
//                 <svg
//                   style={{
//                     position: 'absolute',
//                     top: 0,
//                     left: 0,
//                     width: '100%',
//                     height: '100%',
//                     transform: 'rotate(-90deg)',
//                   }}
//                 >
//                   <circle
//                     cx="70"
//                     cy="70"
//                     r="60"
//                     fill="none"
//                     stroke="rgba(255, 255, 255, 0.1)"
//                     strokeWidth="8"
//                   />
//                   <circle
//                     cx="70"
//                     cy="70"
//                     r="60"
//                     fill="none"
//                     stroke="#00FF00"
//                     strokeWidth="8"
//                     strokeDasharray={`${2 * Math.PI * 60}`}
//                     strokeDashoffset={`${2 * Math.PI * 60 * (1 - autoCaptureProgress / 100)}`}
//                     strokeLinecap="round"
//                     style={{
//                       transition: 'stroke-dashoffset 50ms linear',
//                       filter: 'drop-shadow(0 0 8px rgba(0, 255, 0, 0.6))',
//                     }}
//                   />
//                 </svg>
                
//                 {/* Contador numérico */}
//                 <div style={{
//                   position: 'absolute',
//                   top: '50%',
//                   left: '50%',
//                   transform: 'translate(-50%, -50%)',
//                   display: 'flex',
//                   flexDirection: 'column',
//                   alignItems: 'center',
//                   gap: '0.25rem',
//                 }}>
//                   <div style={{
//                     fontFamily: 'var(--font-head)',
//                     fontSize: '3rem',
//                     fontWeight: 700,
//                     color: '#00FF00',
//                     lineHeight: 1,
//                     textShadow: '0 0 20px rgba(0, 255, 0, 0.8)',
//                   }}>
//                     {getCountdownSeconds()}
//                   </div>
//                   <div style={{
//                     fontFamily: 'var(--font-mono)',
//                     fontSize: '0.7rem',
//                     color: 'rgba(255, 255, 255, 0.8)',
//                     letterSpacing: '0.1em',
//                     textTransform: 'uppercase',
//                   }}>
//                     segundos
//                   </div>
//                 </div>
//               </div>

//               {/* Mensagem */}
//               <div style={{
//                 background: 'rgba(0, 255, 0, 0.15)',
//                 backdropFilter: 'blur(12px)',
//                 border: '2px solid rgba(0, 255, 0, 0.4)',
//                 borderRadius: 'var(--radius-md)',
//                 padding: '0.75rem 1.5rem',
//                 fontFamily: 'var(--font-head)',
//                 fontSize: '0.9rem',
//                 fontWeight: 700,
//                 color: '#00FF00',
//                 textAlign: 'center',
//                 boxShadow: '0 4px 16px rgba(0, 255, 0, 0.3)',
//               }}>
//                 🎯 Captura Automática
//               </div>
//             </div>
//           )}

//           {/* Guias visuais de distância - apenas quando muito próximo */}
//           {status === 'idle' && feedback.status === 'too-close' && (
//             <div style={{
//               position: 'absolute',
//               inset: 0,
//               pointerEvents: 'none',
//               zIndex: 5,
//             }}>
//               <div style={{
//                 position: 'absolute',
//                 top: '50%',
//                 left: '50%',
//                 transform: 'translate(-50%, -50%)',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'center',
//                 gap: '1rem',
//                 animation: 'bounce-vertical 1.5s ease-in-out infinite',
//               }}>
//                 <div style={{
//                   fontSize: '3rem',
//                   color: 'var(--red)',
//                   textShadow: '0 0 20px rgba(220, 38, 38, 0.8)',
//                 }}>
//                   ⬇
//                 </div>
//                 <div style={{
//                   fontFamily: 'var(--font-head)',
//                   fontSize: '1.2rem',
//                   fontWeight: 700,
//                   color: 'var(--red)',
//                   textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
//                   background: 'rgba(220, 38, 38, 0.2)',
//                   padding: '0.5rem 1rem',
//                   borderRadius: 'var(--radius-md)',
//                 }}>
//                   AFASTE-SE
//                 </div>
//                 <div style={{
//                   fontSize: '3rem',
//                   color: 'var(--red)',
//                   textShadow: '0 0 20px rgba(220, 38, 38, 0.8)',
//                 }}>
//                   ⬇
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Frame de referência ideal - mostra quando parcialmente visível */}
//           {status === 'idle' && feedback.status === 'partial' && (
//             <div style={{
//               position: 'absolute',
//               inset: '8%',
//               border: '3px dashed var(--amber)',
//               borderRadius: 'var(--radius-lg)',
//               pointerEvents: 'none',
//               opacity: 0.6,
//               animation: 'pulse-border 2s ease-in-out infinite',
//               zIndex: 3,
//             }} />
//           )}

//           {/* EPIs detectados - badge flutuante superior esquerdo */}
//           {detectedEpi.length > 0 && (
//             <div style={{
//               position: 'absolute',
//               top: '1rem',
//               left: '1rem',
//               background: 'rgba(34, 197, 94, 0.9)',
//               backdropFilter: 'blur(12px)',
//               borderRadius: 'var(--radius-md)',
//               padding: '0.5rem 0.75rem',
//               display: 'flex',
//               flexDirection: 'column',
//               gap: '0.25rem',
//               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//               zIndex: 10,
//               maxWidth: '200px',
//             }}>
//               <div style={{
//                 fontFamily: 'var(--font-mono)',
//                 fontSize: '0.65rem',
//                 fontWeight: 700,
//                 color: '#fff',
//                 letterSpacing: '0.05em',
//                 textTransform: 'uppercase',
//               }}>
//                 ✓ Detectados ({detectedEpi.length})
//               </div>
//               <div style={{
//                 display: 'flex',
//                 flexWrap: 'wrap',
//                 gap: '0.25rem',
//               }}>
//                 {detectedEpi.map((epi, idx) => (
//                   <span
//                     key={idx}
//                     style={{
//                       fontFamily: 'var(--font-body)',
//                       fontSize: '0.7rem',
//                       color: 'rgba(255, 255, 255, 0.95)',
//                       background: 'rgba(255, 255, 255, 0.15)',
//                       padding: '2px 6px',
//                       borderRadius: '4px',
//                     }}
//                   >
//                     {epi}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Botões de ação - parte inferior sobreposta */}
//           <div style={{
//             position: 'absolute',
//             bottom: '1.5rem',
//             left: '1rem',
//             right: '1rem',
//             display: 'flex',
//             flexDirection: 'column',
//             gap: '0.75rem',
//             zIndex: 10,
//           }}>
            
//             {/* Mensagem de erro inline */}
//             {status === 'error' && errorMsg && (
//               <div style={{
//                 background: 'rgba(220, 38, 38, 0.95)',
//                 border: '1px solid rgba(220, 38, 38, 0.4)',
//                 borderRadius: 'var(--radius-md)',
//                 padding: '0.75rem',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '0.5rem',
//                 backdropFilter: 'blur(12px)',
//                 boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//               }}>
//                 <span style={{ fontSize: '1.1rem' }}>⚠️</span>
//                 <div style={{
//                   flex: 1,
//                   fontFamily: 'var(--font-body)',
//                   fontSize: '0.8rem',
//                   color: '#fff',
//                 }}>
//                   {errorMsg}
//                 </div>
//               </div>
//             )}

//             {/* Botão principal */}
//             {status === 'error' ? (
//               <button
//                 onClick={onRetry}
//                 className="btn-primary"
//                 style={{
//                   width: '100%',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '0.75rem',
//                   padding: '1rem',
//                   fontSize: '0.95rem',
//                   background: 'rgba(0, 132, 255, 0.9)',
//                   backdropFilter: 'blur(12px)',
//                   boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//                   border: '2px solid rgba(0, 132, 255, 0.4)',
//                 }}
//               >
//                 <span>🔄</span>
//                 <span>TENTAR NOVAMENTE</span>
//               </button>
//             ) : (
//               <button
//                 onClick={onCapture}
//                 disabled={shouldBlockCapture}
//                 className="btn-primary"
//                 style={{
//                   width: '100%',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '0.75rem',
//                   padding: '1rem',
//                   fontSize: '0.95rem',
//                   opacity: shouldBlockCapture ? 0.6 : 1,
//                   cursor: shouldBlockCapture ? 'not-allowed' : 'pointer',
//                   background: shouldBlockCapture
//                     ? 'rgba(100, 116, 139, 0.9)' 
//                     : isCountingDown
//                     ? 'rgba(0, 200, 100, 0.9)'  // Verde quando auto-captura ativa
//                     : 'rgba(0, 132, 255, 0.9)',
//                   backdropFilter: 'blur(12px)',
//                   boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//                   border: shouldBlockCapture
//                     ? '2px solid rgba(100, 116, 139, 0.4)' 
//                     : isCountingDown
//                     ? '2px solid rgba(0, 200, 100, 0.6)'
//                     : '2px solid rgba(0, 132, 255, 0.4)',
//                 }}
//               >
//                 <span style={{ fontSize: '1.25rem' }}>
//                   {isProcessing ? '⏳' : 
//                    !isWellFramed ? '⚠️' : 
//                    isCountingDown ? '⏱️' : 
//                    '📸'}
//                 </span>
//                 <span>
//                   {status === 'capturing' 
//                     ? 'CAPTURANDO...' 
//                     : status === 'analyzing' 
//                     ? 'ANALISANDO EPIs...'
//                     : !isWellFramed
//                     ? 'AJUSTE SUA POSIÇÃO'
//                     : isCountingDown
//                     ? `CAPTURANDO EM ${getCountdownSeconds()}s`
//                     : 'VERIFICAR EPIs'}
//                 </span>
//               </button>
//             )}

//             {/* Dica de captura manual */}
//             {enableAutoCapture && !isCountingDown && isWellFramed && status === 'idle' && (
//               <div style={{
//                 textAlign: 'center',
//                 fontFamily: 'var(--font-mono)',
//                 fontSize: '0.7rem',
//                 color: 'rgba(255, 255, 255, 0.6)',
//               }}>
//                 💡 Mantenha a posição para captura automática
//               </div>
//             )}
//           </div>

//           {/* Indicador de análise - overlay central */}
//           {status === 'analyzing' && (
//             <div style={{
//               position: 'absolute',
//               top: '50%',
//               left: '50%',
//               transform: 'translate(-50%, -50%)',
//               background: 'rgba(0, 132, 255, 0.15)',
//               backdropFilter: 'blur(8px)',
//               borderRadius: '50%',
//               width: '120px',
//               height: '120px',
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               justifyContent: 'center',
//               gap: '0.5rem',
//               border: '3px solid rgba(0, 132, 255, 0.4)',
//               boxShadow: '0 0 30px rgba(0, 132, 255, 0.3)',
//               animation: 'pulse 1.5s ease-in-out infinite',
//               zIndex: 5,
//             }}>
//               <div style={{
//                 width: '40px',
//                 height: '40px',
//                 border: '4px solid rgba(0, 132, 255, 0.3)',
//                 borderTop: '4px solid var(--blue-bright)',
//                 borderRadius: '50%',
//                 animation: 'spin 1s linear infinite',
//               }} />
//               <span style={{
//                 fontFamily: 'var(--font-mono)',
//                 fontSize: '0.65rem',
//                 color: 'var(--blue-bright)',
//                 fontWeight: 700,
//                 letterSpacing: '0.05em',
//               }}>
//                 ANALISANDO
//               </span>
//             </div>
//           )}

//           {/* Aviso de bloqueio por enquadramento */}
//           {status === 'idle' && !isWellFramed && !isCountingDown && (
//             <div style={{
//               position: 'absolute',
//               bottom: '6rem',
//               left: '50%',
//               transform: 'translateX(-50%)',
//               background: 'rgba(220, 38, 38, 0.95)',
//               border: '2px solid rgba(220, 38, 38, 0.6)',
//               borderRadius: 'var(--radius-md)',
//               padding: '1rem 1.5rem',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '0.75rem',
//               backdropFilter: 'blur(12px)',
//               boxShadow: '0 4px 16px rgba(220, 38, 38, 0.5)',
//               zIndex: 11,
//               maxWidth: '85%',
//               animation: 'pulse-warning 2s ease-in-out infinite',
//             }}>
//               <span style={{ fontSize: '1.5rem' }}>🚫</span>
//               <div style={{
//                 fontFamily: 'var(--font-head)',
//                 fontSize: '0.9rem',
//                 fontWeight: 700,
//                 color: '#fff',
//                 textAlign: 'center',
//               }}>
//                 Ajuste o enquadramento antes de capturar
//               </div>
//             </div>
//           )}

//         </div>
//       </div>

//       {/* Animações CSS */}
//       <style>{`
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//         @keyframes pulse {
//           0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
//           50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
//         }
//         @keyframes pulse-gentle {
//           0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
//           50% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.02); }
//         }
//         @keyframes bounce-vertical {
//           0%, 100% { transform: translate(-50%, -50%) translateY(0); }
//           50% { transform: translate(-50%, -50%) translateY(-15px); }
//         }
//         @keyframes pulse-border {
//           0%, 100% { opacity: 0.6; border-width: 3px; }
//           50% { opacity: 0.9; border-width: 4px; }
//         }
//         @keyframes pulse-warning {
//           0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
//           50% { opacity: 0.85; transform: translateX(-50%) scale(1.02); }
//         }
//       `}</style>

//     </div>
//   );
// }




// // src/screens/EpiScanScreen/index.tsx
// // Tela de verificação de EPI com Stepper de progresso
// // ✅ Detecção de enquadramento corporal com MediaPipe
// // ✅ Auto-captura quando bem posicionado
// // ✅ NOVO: Visualização dos 33 pontos do corpo em tempo real

// import { useEffect, useRef, useState } from 'react';
// import CameraView from '../components/CameraView';
// import Stepper from '../components/Stepper';
// import PoseOverlay from '../components/PoseOverlay';  // ✅ NOVO
// import type { CameraHook } from '../../../hooks/useCamAutomation';
// import { useBodyFramingDetectionLocal } from '../../../hooks/useBodyFramingDetectionLocal';

// export interface EpiScanState {
//   status: 'idle' | 'capturing' | 'analyzing' | 'ok' | 'error';
//   errorMsg?: string;
//   captureUrl?: string | null;
//   detectedEpi?: string[];
// }

// interface EpiScanScreenProps {
//   epiScanState: EpiScanState;
//   cameraHook: CameraHook;
//   person: { name: string; photo?: string } | null;
//   onCapture: () => void;
//   onRetry: () => void;
//   onCancel: () => void;
//   enableAutoCapture?: boolean;
//   autoCaptureDuration?: number;
//   showPoseLandmarks?: boolean;     // ✅ NOVO: Mostrar pontos do corpo
//   showPoseSkeleton?: boolean;      // ✅ NOVO: Mostrar skeleton
//   showPoseLabels?: boolean;        // ✅ NOVO: Mostrar labels dos pontos
// }

// export default function EpiScanScreen({
//   epiScanState,
//   cameraHook,
//   person,
//   onCapture,
//   onRetry,
//   onCancel,
//   enableAutoCapture = true,
//   autoCaptureDuration = 3000,
//   showPoseLandmarks = true,        // ✅ Ativado por padrão
//   showPoseSkeleton = true,         // ✅ Ativado por padrão
//   showPoseLabels = false,          // ✅ Desativado por padrão (muito poluído)
// }: EpiScanScreenProps) {
//   const { status, errorMsg, captureUrl, detectedEpi = [] } = epiScanState;
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });
  
//   // Estados para controle de auto-captura
//   const [autoCaptureProgress, setAutoCaptureProgress] = useState(0);
//   const [isCountingDown, setIsCountingDown] = useState(false);
//   //@ts-ignore
//   const autoCaptureTimerRef = useRef<NodeJS.Timeout | null>(null);
//   const autoCaptureStartTimeRef = useRef<number | null>(null);
//   const animationFrameRef = useRef<number | null>(null);

//   // Obter referência do vídeo do hook de câmera
//   useEffect(() => {
//     const assignment = cameraHook.getAssignment('body1');
//     if (assignment) {
//       const video = document.querySelector('video[data-role="body1"]') as HTMLVideoElement;
//       videoRef.current = video;

//       // Atualiza dimensões do vídeo quando carregar
//       if (video) {
//         const updateVideoSize = () => {
//           setVideoSize({
//             width: video.videoWidth,
//             height: video.videoHeight,
//           });
//         };

//         video.addEventListener('loadedmetadata', updateVideoSize);
//         if (video.readyState >= 2) {
//           updateVideoSize();
//         }

//         return () => {
//           video.removeEventListener('loadedmetadata', updateVideoSize);
//         };
//       }
//     }
//   }, [cameraHook]);

//   // Hook de detecção de enquadramento usando MediaPipe (local)
//   //@ts-ignore
//   const { feedback, isWellFramed, shouldBlock, landmarks } = useBodyFramingDetectionLocal({
//     videoElement: videoRef.current,
//     enabled: status === 'idle',
//   });

//   const camStatus: 'idle' | 'scanning' | 'ok' | 'fail' | 'warning' =
//     status === 'analyzing' ? 'scanning' :
//     status === 'ok' ? 'ok' :
//     status === 'error' ? 'fail' :
//     !isWellFramed && status === 'idle' ? 'warning' :
//     'idle';

//   const isProcessing = status === 'capturing' || status === 'analyzing';
//   const shouldBlockCapture = !isWellFramed || isProcessing;

//   // ═══════════════════════════════════════════════════════════════════════════
//   // AUTO-CAPTURA
//   // ═══════════════════════════════════════════════════════════════════════════

//   useEffect(() => {
//     if (!enableAutoCapture || status !== 'idle' || !isWellFramed || isProcessing) {
//       if (autoCaptureTimerRef.current) {
//         clearTimeout(autoCaptureTimerRef.current);
//         autoCaptureTimerRef.current = null;
//       }
//       if (animationFrameRef.current) {
//         cancelAnimationFrame(animationFrameRef.current);
//         animationFrameRef.current = null;
//       }
//       setAutoCaptureProgress(0);
//       setIsCountingDown(false);
//       autoCaptureStartTimeRef.current = null;
//       return;
//     }

//     if (!autoCaptureStartTimeRef.current) {
//       autoCaptureStartTimeRef.current = Date.now();
//       setIsCountingDown(true);
//     }

//     const updateProgress = () => {
//       if (!autoCaptureStartTimeRef.current) return;

//       const elapsed = Date.now() - autoCaptureStartTimeRef.current;
//       const progress = Math.min((elapsed / autoCaptureDuration) * 100, 100);
      
//       setAutoCaptureProgress(progress);

//       if (progress >= 100) {
//         setIsCountingDown(false);
//         autoCaptureStartTimeRef.current = null;
//         onCapture();
//       } else {
//         animationFrameRef.current = requestAnimationFrame(updateProgress);
//       }
//     };

//     updateProgress();

//     return () => {
//       if (animationFrameRef.current) {
//         cancelAnimationFrame(animationFrameRef.current);
//       }
//     };
//   }, [enableAutoCapture, status, isWellFramed, isProcessing, autoCaptureDuration, onCapture]);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // HELPERS
//   // ═══════════════════════════════════════════════════════════════════════════

//   const getFeedbackColor = () => {
//     switch (feedback.status) {
//       case 'well-framed': return 'var(--green)';
//       case 'too-close': return 'var(--red)';
//       case 'partial': return 'var(--amber)';
//       case 'no-person': return 'var(--red)';
//       case 'checking': return 'var(--blue)';
//       default: return 'var(--gray)';
//     }
//   };

//   const getFeedbackIcon = () => {
//     switch (feedback.status) {
//       case 'well-framed': return '✓';
//       case 'too-close': return '←';
//       case 'partial': return '⚠';
//       case 'no-person': return '👤';
//       case 'checking': return '⏳';
//       default: return '•';
//     }
//   };

//   const getCountdownSeconds = () => {
//     return Math.ceil((100 - autoCaptureProgress) / (100 / (autoCaptureDuration / 1000)));
//   };

//   return (
//     <div style={{
//       flex: 1,
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       justifyContent: 'flex-start',
//       padding: '0.5rem 1rem',
//       gap: '0.5rem',
//       position: 'relative',
//       overflow: 'hidden',
//     }}>

//       {/* Stepper de progresso no topo */}
//       <div style={{
//         width: '100%',
//         display: 'flex',
//         justifyContent: 'center',
//         flexShrink: 0,
//         zIndex: 10,
//       }}>
//         <Stepper currentStep="epi" compact />
//       </div>

//       {/* Nome da pessoa */}
//       {person && (
//         <p style={{
//           fontFamily: 'var(--font-mono)',
//           fontSize: '0.7rem',
//           color: 'var(--gray-light)',
//           letterSpacing: '0.05em',
//           margin: 0,
//           flexShrink: 0,
//         }}>
//           {person.name}
//         </p>
//       )}

//       {/* Container da câmera */}
//       <div style={{
//         flex: 1,
//         width: '100%',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         position: 'relative',
//         minHeight: 0,
//         overflow: 'hidden',
//       }}>
//         <div style={{
//           width: '100%',
//           height: '100%',
//           maxWidth: '600px',
//           position: 'relative',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}>
//           <CameraView
//             role="body1"
//             cameraHook={cameraHook}
//             scanning={status === 'analyzing'}
//             captureUrl={captureUrl}
//             status={camStatus}
//             autoStart
//             aspectRatio="9/16"
//             dynamicSize={false}
//           />

//           {/* ══════════════════════════════════════════════════════════════════ */}
//           {/* ✅ NOVO: OVERLAY COM PONTOS DO CORPO (MediaPipe Landmarks) */}
//           {/* ══════════════════════════════════════════════════════════════════ */}
//           {status === 'idle' && landmarks && videoSize.width > 0 && (
//             <PoseOverlay
//               landmarks={landmarks}
//               videoWidth={videoSize.width}
//               videoHeight={videoSize.height}
//               showPoints={showPoseLandmarks}
//               showSkeleton={showPoseSkeleton}
//               showLabels={showPoseLabels}
//               lineColor={isWellFramed ? 'rgba(0, 255, 0, 0.8)' : 'rgba(255, 165, 0, 0.8)'}
//               pointSize={5}
//               lineWidth={2}
//             />
//           )}

//           {/* Barra de progresso auto-captura */}
//           {enableAutoCapture && isCountingDown && autoCaptureProgress > 0 && (
//             <div style={{
//               position: 'absolute',
//               top: 0,
//               left: 0,
//               right: 0,
//               height: '6px',
//               background: 'rgba(0, 0, 0, 0.5)',
//               overflow: 'hidden',
//               zIndex: 20,
//             }}>
//               <div style={{
//                 height: '100%',
//                 width: `${autoCaptureProgress}%`,
//                 background: 'linear-gradient(90deg, #00FF00, #00CC00)',
//                 transition: 'width 50ms linear',
//                 boxShadow: '0 0 12px rgba(0, 255, 0, 0.6)',
//               }} />
//             </div>
//           )}

//           {/* Botão cancelar */}
//           <button
//             onClick={onCancel}
//             style={{
//               position: 'absolute',
//               top: '1rem',
//               right: '1rem',
//               width: '44px',
//               height: '44px',
//               borderRadius: '50%',
//               border: '2px solid rgba(255, 255, 255, 0.3)',
//               background: 'rgba(33, 40, 54, 0.85)',
//               backdropFilter: 'blur(12px)',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               cursor: 'pointer',
//               fontSize: '1.25rem',
//               color: 'var(--gray-light)',
//               transition: 'all 200ms ease',
//               zIndex: 15,
//               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.background = 'rgba(220, 38, 38, 0.85)';
//               e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.6)';
//               e.currentTarget.style.color = '#fff';
//               e.currentTarget.style.transform = 'scale(1.05)';
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.background = 'rgba(33, 40, 54, 0.85)';
//               e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
//               e.currentTarget.style.color = 'var(--gray-light)';
//               e.currentTarget.style.transform = 'scale(1)';
//             }}
//           >
//             ✕
//           </button>

//           {/* Feedback de enquadramento */}
//           {status === 'idle' && (
//             <div style={{
//               position: 'absolute',
//               top: '1rem',
//               left: '50%',
//               transform: 'translateX(-50%)',
//               background: `${getFeedbackColor()}22`,
//               backdropFilter: 'blur(12px)',
//               border: `2px solid ${getFeedbackColor()}66`,
//               borderRadius: 'var(--radius-md)',
//               padding: '0.75rem 1rem',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '0.75rem',
//               boxShadow: `0 4px 16px ${getFeedbackColor()}33`,
//               zIndex: 12,
//               maxWidth: '90%',
//               transition: 'all 300ms ease',
//             }}>
//               <div style={{
//                 width: '36px',
//                 height: '36px',
//                 borderRadius: '50%',
//                 background: `${getFeedbackColor()}33`,
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 fontSize: '1.2rem',
//                 color: getFeedbackColor(),
//                 fontWeight: 'bold',
//                 flexShrink: 0,
//               }}>
//                 {getFeedbackIcon()}
//               </div>
//               <div style={{ flex: 1 }}>
//                 <div style={{
//                   fontFamily: 'var(--font-head)',
//                   fontSize: '0.85rem',
//                   fontWeight: 700,
//                   color: getFeedbackColor(),
//                   marginBottom: '0.15rem',
//                 }}>
//                   {feedback.message}
//                 </div>
//                 {feedback.missingParts && feedback.missingParts.length > 0 && (
//                   <div style={{
//                     fontFamily: 'var(--font-mono)',
//                     fontSize: '0.7rem',
//                     color: 'rgba(255, 255, 255, 0.7)',
//                   }}>
//                     {feedback.missingParts.join(' • ')}
//                   </div>
//                 )}
//               </div>
//               <div style={{
//                 width: '4px',
//                 height: '40px',
//                 background: 'rgba(255, 255, 255, 0.1)',
//                 borderRadius: '2px',
//                 position: 'relative',
//                 overflow: 'hidden',
//               }}>
//                 <div style={{
//                   position: 'absolute',
//                   bottom: 0,
//                   left: 0,
//                   right: 0,
//                   height: `${feedback.confidence}%`,
//                   background: getFeedbackColor(),
//                   transition: 'height 300ms ease',
//                 }} />
//               </div>
//             </div>
//           )}

//           {/* Indicador de auto-captura */}
//           {enableAutoCapture && isCountingDown && autoCaptureProgress > 0 && (
//             <div style={{
//               position: 'absolute',
//               top: '50%',
//               left: '50%',
//               transform: 'translate(-50%, -50%)',
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               gap: '1rem',
//               zIndex: 8,
//             }}>
//               <div style={{ position: 'relative', width: '140px', height: '140px' }}>
//                 <svg style={{
//                   position: 'absolute',
//                   top: 0,
//                   left: 0,
//                   width: '100%',
//                   height: '100%',
//                   transform: 'rotate(-90deg)',
//                 }}>
//                   <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="8" />
//                   <circle
//                     cx="70"
//                     cy="70"
//                     r="60"
//                     fill="none"
//                     stroke="#00FF00"
//                     strokeWidth="8"
//                     strokeDasharray={`${2 * Math.PI * 60}`}
//                     strokeDashoffset={`${2 * Math.PI * 60 * (1 - autoCaptureProgress / 100)}`}
//                     strokeLinecap="round"
//                     style={{
//                       transition: 'stroke-dashoffset 50ms linear',
//                       filter: 'drop-shadow(0 0 8px rgba(0, 255, 0, 0.6))',
//                     }}
//                   />
//                 </svg>
//                 <div style={{
//                   position: 'absolute',
//                   top: '50%',
//                   left: '50%',
//                   transform: 'translate(-50%, -50%)',
//                   display: 'flex',
//                   flexDirection: 'column',
//                   alignItems: 'center',
//                   gap: '0.25rem',
//                 }}>
//                   <div style={{
//                     fontFamily: 'var(--font-head)',
//                     fontSize: '3rem',
//                     fontWeight: 700,
//                     color: '#00FF00',
//                     lineHeight: 1,
//                     textShadow: '0 0 20px rgba(0, 255, 0, 0.8)',
//                   }}>
//                     {getCountdownSeconds()}
//                   </div>
//                   <div style={{
//                     fontFamily: 'var(--font-mono)',
//                     fontSize: '0.7rem',
//                     color: 'rgba(255, 255, 255, 0.8)',
//                     letterSpacing: '0.1em',
//                     textTransform: 'uppercase',
//                   }}>
//                     segundos
//                   </div>
//                 </div>
//               </div>
//               <div style={{
//                 background: 'rgba(0, 255, 0, 0.15)',
//                 backdropFilter: 'blur(12px)',
//                 border: '2px solid rgba(0, 255, 0, 0.4)',
//                 borderRadius: 'var(--radius-md)',
//                 padding: '0.75rem 1.5rem',
//                 fontFamily: 'var(--font-head)',
//                 fontSize: '0.9rem',
//                 fontWeight: 700,
//                 color: '#00FF00',
//                 textAlign: 'center',
//                 boxShadow: '0 4px 16px rgba(0, 255, 0, 0.3)',
//               }}>
//                 🎯 Captura Automática
//               </div>
//             </div>
//           )}

//           {/* EPIs detectados */}
//           {detectedEpi.length > 0 && (
//             <div style={{
//               position: 'absolute',
//               top: '1rem',
//               left: '1rem',
//               background: 'rgba(34, 197, 94, 0.9)',
//               backdropFilter: 'blur(12px)',
//               borderRadius: 'var(--radius-md)',
//               padding: '0.5rem 0.75rem',
//               display: 'flex',
//               flexDirection: 'column',
//               gap: '0.25rem',
//               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//               zIndex: 10,
//               maxWidth: '200px',
//             }}>
//               <div style={{
//                 fontFamily: 'var(--font-mono)',
//                 fontSize: '0.65rem',
//                 fontWeight: 700,
//                 color: '#fff',
//                 letterSpacing: '0.05em',
//                 textTransform: 'uppercase',
//               }}>
//                 ✓ Detectados ({detectedEpi.length})
//               </div>
//               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
//                 {detectedEpi.map((epi, idx) => (
//                   <span
//                     key={idx}
//                     style={{
//                       fontFamily: 'var(--font-body)',
//                       fontSize: '0.7rem',
//                       color: 'rgba(255, 255, 255, 0.95)',
//                       background: 'rgba(255, 255, 255, 0.15)',
//                       padding: '2px 6px',
//                       borderRadius: '4px',
//                     }}
//                   >
//                     {epi}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Botões de ação */}
//           <div style={{
//             position: 'absolute',
//             bottom: '1.5rem',
//             left: '1rem',
//             right: '1rem',
//             display: 'flex',
//             flexDirection: 'column',
//             gap: '0.75rem',
//             zIndex: 10,
//           }}>
//             {status === 'error' && errorMsg && (
//               <div style={{
//                 background: 'rgba(220, 38, 38, 0.95)',
//                 border: '1px solid rgba(220, 38, 38, 0.4)',
//                 borderRadius: 'var(--radius-md)',
//                 padding: '0.75rem',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '0.5rem',
//                 backdropFilter: 'blur(12px)',
//                 boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//               }}>
//                 <span style={{ fontSize: '1.1rem' }}>⚠️</span>
//                 <div style={{
//                   flex: 1,
//                   fontFamily: 'var(--font-body)',
//                   fontSize: '0.8rem',
//                   color: '#fff',
//                 }}>
//                   {errorMsg}
//                 </div>
//               </div>
//             )}

//             {status === 'error' ? (
//               <button onClick={onRetry} className="btn-primary" style={{
//                 width: '100%',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 gap: '0.75rem',
//                 padding: '1rem',
//                 fontSize: '0.95rem',
//                 background: 'rgba(0, 132, 255, 0.9)',
//                 backdropFilter: 'blur(12px)',
//                 boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//                 border: '2px solid rgba(0, 132, 255, 0.4)',
//               }}>
//                 <span>🔄</span>
//                 <span>TENTAR NOVAMENTE</span>
//               </button>
//             ) : (
//               <button
//                 onClick={onCapture}
//                 disabled={shouldBlockCapture}
//                 className="btn-primary"
//                 style={{
//                   width: '100%',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '0.75rem',
//                   padding: '1rem',
//                   fontSize: '0.95rem',
//                   opacity: shouldBlockCapture ? 0.6 : 1,
//                   cursor: shouldBlockCapture ? 'not-allowed' : 'pointer',
//                   background: shouldBlockCapture ? 'rgba(100, 116, 139, 0.9)' : 
//                              isCountingDown ? 'rgba(0, 200, 100, 0.9)' :
//                              'rgba(0, 132, 255, 0.9)',
//                   backdropFilter: 'blur(12px)',
//                   boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//                   border: shouldBlockCapture ? '2px solid rgba(100, 116, 139, 0.4)' :
//                          isCountingDown ? '2px solid rgba(0, 200, 100, 0.6)' :
//                          '2px solid rgba(0, 132, 255, 0.4)',
//                 }}
//               >
//                 <span style={{ fontSize: '1.25rem' }}>
//                   {isProcessing ? '⏳' : !isWellFramed ? '⚠️' : isCountingDown ? '⏱️' : '📸'}
//                 </span>
//                 <span>
//                   {status === 'capturing' ? 'CAPTURANDO...' :
//                    status === 'analyzing' ? 'ANALISANDO EPIs...' :
//                    !isWellFramed ? 'AJUSTE SUA POSIÇÃO' :
//                    isCountingDown ? `CAPTURANDO EM ${getCountdownSeconds()}s` :
//                    'VERIFICAR EPIs'}
//                 </span>
//               </button>
//             )}

//             {enableAutoCapture && !isCountingDown && isWellFramed && status === 'idle' && (
//               <div style={{
//                 textAlign: 'center',
//                 fontFamily: 'var(--font-mono)',
//                 fontSize: '0.7rem',
//                 color: 'rgba(255, 255, 255, 0.6)',
//               }}>
//                 💡 Mantenha a posição para captura automática
//               </div>
//             )}
//           </div>

//           {/* Indicador de análise */}
//           {status === 'analyzing' && (
//             <div style={{
//               position: 'absolute',
//               top: '50%',
//               left: '50%',
//               transform: 'translate(-50%, -50%)',
//               background: 'rgba(0, 132, 255, 0.15)',
//               backdropFilter: 'blur(8px)',
//               borderRadius: '50%',
//               width: '120px',
//               height: '120px',
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               justifyContent: 'center',
//               gap: '0.5rem',
//               border: '3px solid rgba(0, 132, 255, 0.4)',
//               boxShadow: '0 0 30px rgba(0, 132, 255, 0.3)',
//               animation: 'pulse 1.5s ease-in-out infinite',
//               zIndex: 5,
//             }}>
//               <div style={{
//                 width: '40px',
//                 height: '40px',
//                 border: '4px solid rgba(0, 132, 255, 0.3)',
//                 borderTop: '4px solid var(--blue-bright)',
//                 borderRadius: '50%',
//                 animation: 'spin 1s linear infinite',
//               }} />
//               <span style={{
//                 fontFamily: 'var(--font-mono)',
//                 fontSize: '0.65rem',
//                 color: 'var(--blue-bright)',
//                 fontWeight: 700,
//                 letterSpacing: '0.05em',
//               }}>
//                 ANALISANDO
//               </span>
//             </div>
//           )}

//         </div>
//       </div>

//       <style>{`
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//         @keyframes pulse {
//           0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
//           50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
//         }
//       `}</style>

//     </div>
//   );
// }


// src/screens/EpiScanScreen/index.tsx
// Tela de verificação de EPI com Stepper de progresso
// ✅ Detecção de enquadramento corporal com MediaPipe
// ✅ Auto-captura quando bem posicionado
// ✅ NOVO: Visualização dos 33 pontos do corpo em tempo real
// ✅ NOVO: Feedback SSE em tempo real (validationStream)

import { useEffect, useRef, useState } from 'react';
import CameraView from '../components/CameraView';
import Stepper from '../components/Stepper';
import PoseOverlay from '../components/PoseOverlay';
import type { CameraHook, ValidationStreamState } from '../../../hooks/useCamAutomation';
import { useBodyFramingDetectionLocal } from '../../../hooks/useBodyFramingDetectionLocal';

export interface EpiScanState {
  status: 'idle' | 'capturing' | 'analyzing' | 'ok' | 'error';
  errorMsg?: string;
  captureUrl?: string | null;
  detectedEpi?: string[];
}

interface EpiScanScreenProps {
  epiScanState: EpiScanState;
  cameraHook: CameraHook;
  person: { name: string; photo?: string } | null;
  onCapture: () => void;
  onRetry: () => void;
  onCancel: () => void;
  enableAutoCapture?: boolean;
  autoCaptureDuration?: number;
  showPoseLandmarks?: boolean;
  showPoseSkeleton?: boolean;
  showPoseLabels?: boolean;
  /** Stream SSE — feedback em tempo real de cada foto processada */
  validationStream?: ValidationStreamState;
}

// ─── Labels PT ────────────────────────────────────────────────────────────────
const EPI_LABELS_PT: Record<string, string> = {
  helmet: 'Capacete', vest: 'Colete', gloves: 'Luvas', boots: 'Botas',
  thermal_coat: 'Jaqueta Térmica', thermal_pants: 'Calça Térmica',
  glasses: 'Óculos', mask: 'Máscara', apron: 'Avental', hardhat: 'Capacete',
};
const epiLabel = (k: string) => EPI_LABELS_PT[k] ?? k;

export default function EpiScanScreen({
  epiScanState,
  cameraHook,
  person,
  onCapture,
  onRetry,
  onCancel,
  enableAutoCapture = true,
  autoCaptureDuration = 3000,
  showPoseLandmarks = true,
  showPoseSkeleton = true,
  showPoseLabels = false,
  validationStream,
}: EpiScanScreenProps) {
  const { status, errorMsg, captureUrl, detectedEpi = [] } = epiScanState;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });

  const [autoCaptureProgress, setAutoCaptureProgress] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  //@ts-ignore
  const autoCaptureTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoCaptureStartTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const assignment = cameraHook.getAssignment('body1');
    if (assignment) {
      const video = document.querySelector('video[data-role="body1"]') as HTMLVideoElement;
      videoRef.current = video;
      if (video) {
        const updateVideoSize = () => setVideoSize({ width: video.videoWidth, height: video.videoHeight });
        video.addEventListener('loadedmetadata', updateVideoSize);
        if (video.readyState >= 2) updateVideoSize();
        return () => video.removeEventListener('loadedmetadata', updateVideoSize);
      }
    }
  }, [cameraHook]);

  //@ts-ignore
  const { feedback, isWellFramed, shouldBlock, landmarks } = useBodyFramingDetectionLocal({
    videoElement: videoRef.current,
    enabled: status === 'idle',
  });

  const camStatus: 'idle' | 'scanning' | 'ok' | 'fail' | 'warning' =
    status === 'analyzing' ? 'scanning' :
    status === 'ok' ? 'ok' :
    status === 'error' ? 'fail' :
    !isWellFramed && status === 'idle' ? 'warning' : 'idle';

  const isProcessing = status === 'capturing' || status === 'analyzing';
  const shouldBlockCapture = !isWellFramed || isProcessing;

  // ── SSE live event ────────────────────────────────────────────────────────
  const liveEvent = validationStream?.latest;
  const isStreaming = validationStream?.streaming ?? false;

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTO-CAPTURA
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!enableAutoCapture || status !== 'idle' || !isWellFramed || isProcessing) {
      if (autoCaptureTimerRef.current) { clearTimeout(autoCaptureTimerRef.current); autoCaptureTimerRef.current = null; }
      if (animationFrameRef.current) { cancelAnimationFrame(animationFrameRef.current); animationFrameRef.current = null; }
      setAutoCaptureProgress(0);
      setIsCountingDown(false);
      autoCaptureStartTimeRef.current = null;
      return;
    }
    if (!autoCaptureStartTimeRef.current) { autoCaptureStartTimeRef.current = Date.now(); setIsCountingDown(true); }
    const updateProgress = () => {
      if (!autoCaptureStartTimeRef.current) return;
      const elapsed = Date.now() - autoCaptureStartTimeRef.current;
      const progress = Math.min((elapsed / autoCaptureDuration) * 100, 100);
      setAutoCaptureProgress(progress);
      if (progress >= 100) { setIsCountingDown(false); autoCaptureStartTimeRef.current = null; onCapture(); }
      else animationFrameRef.current = requestAnimationFrame(updateProgress);
    };
    updateProgress();
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [enableAutoCapture, status, isWellFramed, isProcessing, autoCaptureDuration, onCapture]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  const getFeedbackColor = () => {
    switch (feedback.status) {
      case 'well-framed': return 'var(--green)';
      case 'too-close': return 'var(--red)';
      case 'partial': return 'var(--amber)';
      case 'no-person': return 'var(--red)';
      case 'checking': return 'var(--blue)';
      default: return 'var(--gray)';
    }
  };

  const getFeedbackIcon = () => {
    switch (feedback.status) {
      case 'well-framed': return '✓';
      case 'too-close': return '←';
      case 'partial': return '⚠';
      case 'no-person': return '👤';
      case 'checking': return '⏳';
      default: return '•';
    }
  };

  const getCountdownSeconds = () =>
    Math.ceil((100 - autoCaptureProgress) / (100 / (autoCaptureDuration / 1000)));

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      padding: '0.5rem 1rem', gap: '0.5rem',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Stepper */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', flexShrink: 0, zIndex: 10 }}>
        <Stepper currentStep="epi" compact />
      </div>

      {/* Nome */}
      {person && (
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
          color: 'var(--gray-light)', letterSpacing: '0.05em', margin: 0, flexShrink: 0,
        }}>
          {person.name}
        </p>
      )}

      {/* Container câmera */}
      <div style={{
        flex: 1, width: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', minHeight: 0, overflow: 'hidden',
      }}>
        <div style={{
          width: '100%', height: '100%', maxWidth: '600px',
          position: 'relative', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <CameraView
            role="body1"
            cameraHook={cameraHook}
            scanning={status === 'analyzing'}
            captureUrl={captureUrl}
            status={camStatus}
            autoStart
            aspectRatio="9/16"
            dynamicSize={false}
          />

          {/* PoseOverlay */}
          {status === 'idle' && landmarks && videoSize.width > 0 && (
            <PoseOverlay
              landmarks={landmarks}
              videoWidth={videoSize.width}
              videoHeight={videoSize.height}
              showPoints={showPoseLandmarks}
              showSkeleton={showPoseSkeleton}
              showLabels={showPoseLabels}
              lineColor={isWellFramed ? 'rgba(0, 255, 0, 0.8)' : 'rgba(255, 165, 0, 0.8)'}
              pointSize={5}
              lineWidth={2}
            />
          )}

          {/* Barra de progresso auto-captura */}
          {enableAutoCapture && isCountingDown && autoCaptureProgress > 0 && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: '6px', background: 'rgba(0,0,0,0.5)', overflow: 'hidden', zIndex: 20,
            }}>
              <div style={{
                height: '100%', width: `${autoCaptureProgress}%`,
                background: 'linear-gradient(90deg, #00FF00, #00CC00)',
                transition: 'width 50ms linear', boxShadow: '0 0 12px rgba(0,255,0,0.6)',
              }} />
            </div>
          )}

          {/* Botão cancelar */}
          <button
            onClick={onCancel}
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              width: '44px', height: '44px', borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.3)',
              background: 'rgba(33,40,54,0.85)', backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '1.25rem', color: 'var(--gray-light)',
              transition: 'all 200ms ease', zIndex: 15,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(220,38,38,0.85)';
              e.currentTarget.style.borderColor = 'rgba(220,38,38,0.6)';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(33,40,54,0.85)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              e.currentTarget.style.color = 'var(--gray-light)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >✕</button>

          {/* Feedback de enquadramento */}
          {status === 'idle' && (
            <div style={{
              position: 'absolute', top: '1rem', left: '50%',
              transform: 'translateX(-50%)',
              background: `${getFeedbackColor()}22`, backdropFilter: 'blur(12px)',
              border: `2px solid ${getFeedbackColor()}66`,
              borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              boxShadow: `0 4px 16px ${getFeedbackColor()}33`,
              zIndex: 12, maxWidth: '90%', transition: 'all 300ms ease',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: `${getFeedbackColor()}33`, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem', color: getFeedbackColor(),
                fontWeight: 'bold', flexShrink: 0,
              }}>
                {getFeedbackIcon()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'var(--font-head)', fontSize: '0.85rem',
                  fontWeight: 700, color: getFeedbackColor(), marginBottom: '0.15rem',
                }}>
                  {feedback.message}
                </div>
                {feedback.missingParts && feedback.missingParts.length > 0 && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>
                    {feedback.missingParts.join(' • ')}
                  </div>
                )}
              </div>
              <div style={{
                width: '4px', height: '40px', background: 'rgba(255,255,255,0.1)',
                borderRadius: '2px', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: `${feedback.confidence}%`, background: getFeedbackColor(),
                  transition: 'height 300ms ease',
                }} />
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* PAINEL SSE — Feedback em tempo real do stream de validação      */}
          {/* Aparece durante status === 'analyzing' se validationStream ativo */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {(status === 'analyzing' || isStreaming) && validationStream && (
            <div style={{
              position: 'absolute',
              bottom: '7rem',
              left: '1rem',
              right: '1rem',
              background: 'rgba(10, 14, 26, 0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 132, 255, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              zIndex: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              boxShadow: '0 4px 24px rgba(0, 132, 255, 0.15)',
            }}>
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                {/* Indicador pulsante de live */}
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: isStreaming ? '#00FF00' : 'rgba(255,255,255,0.3)',
                  boxShadow: isStreaming ? '0 0 8px rgba(0,255,0,0.8)' : 'none',
                  animation: isStreaming ? 'ssePulse 1.2s ease-in-out infinite' : 'none',
                  flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                  color: isStreaming ? '#00FF00' : 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  fontWeight: 700,
                }}>
                  {isStreaming ? 'Analisando ao vivo' : 'Análise concluída'}
                </span>
                {liveEvent && (
                  <span style={{
                    marginLeft: 'auto',
                    fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                    color: 'rgba(255,255,255,0.35)',
                  }}>
                    {liveEvent.processing_ms}ms
                  </span>
                )}
              </div>

              {liveEvent ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>

                  {/* Linha: Face */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.4rem 0.6rem',
                    background: liveEvent.face_detected
                      ? 'rgba(0, 200, 100, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                    borderRadius: '6px',
                    border: `1px solid ${liveEvent.face_detected
                      ? 'rgba(0,200,100,0.25)' : 'rgba(220,38,38,0.25)'}`,
                  }}>
                    <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>
                      {liveEvent.face_detected ? '🟢' : '🔴'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                        color: liveEvent.face_detected ? '#00C864' : '#EF4444',
                        fontWeight: 600,
                      }}>
                        {liveEvent.face_detected
                          ? liveEvent.face_person_code
                            ? `Identificado: ${liveEvent.face_person_code}`
                            : 'Rosto detectado'
                          : 'Rosto não detectado'}
                      </div>
                      {liveEvent.face_confidence !== null && liveEvent.face_confidence > 0 && (
                        <div style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                          color: 'rgba(255,255,255,0.4)',
                        }}>
                          confiança {Math.round(liveEvent.face_confidence * 100)}%
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Linha: EPI */}
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                    padding: '0.4rem 0.6rem',
                    background: liveEvent.epi_compliant
                      ? 'rgba(0, 200, 100, 0.1)' : 'rgba(251, 146, 60, 0.1)',
                    borderRadius: '6px',
                    border: `1px solid ${liveEvent.epi_compliant
                      ? 'rgba(0,200,100,0.25)' : 'rgba(251,146,60,0.25)'}`,
                  }}>
                    <span style={{ fontSize: '0.9rem', flexShrink: 0, paddingTop: '1px' }}>
                      {liveEvent.epi_compliant ? '✅' : '⚠️'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                        color: liveEvent.epi_compliant ? '#00C864' : '#FB923C',
                        fontWeight: 600, marginBottom: '0.2rem',
                      }}>
                        {liveEvent.epi_compliant ? 'EPIs completos' : 'EPIs incompletos'}
                        {liveEvent.compliance_score > 0 && (
                          <span style={{
                            marginLeft: '0.4rem',
                            fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                            color: 'rgba(255,255,255,0.4)', fontWeight: 400,
                          }}>
                            {Math.round(liveEvent.compliance_score * 100)}%
                          </span>
                        )}
                      </div>
                      {/* EPIs faltando */}
                      {liveEvent.missing.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {liveEvent.missing.map((item) => (
                            <span key={item} style={{
                              fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                              color: '#FB923C',
                              background: 'rgba(251,146,60,0.15)',
                              border: '1px solid rgba(251,146,60,0.3)',
                              padding: '1px 6px', borderRadius: '4px',
                            }}>
                              ✗ {epiLabel(item)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Decisão final (session_complete) */}
                  {liveEvent.session_complete && liveEvent.final_decision && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      background: liveEvent.final_decision.access_decision === 'GRANTED'
                        ? 'rgba(0,200,100,0.15)' : 'rgba(220,38,38,0.15)',
                      borderRadius: '6px',
                      border: `1px solid ${liveEvent.final_decision.access_decision === 'GRANTED'
                        ? 'rgba(0,200,100,0.4)' : 'rgba(220,38,38,0.4)'}`,
                    }}>
                      <span style={{ fontSize: '1.1rem' }}>
                        {liveEvent.final_decision.access_decision === 'GRANTED' ? '🔓' : '🔒'}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-head)', fontSize: '0.8rem', fontWeight: 700,
                        color: liveEvent.final_decision.access_decision === 'GRANTED'
                          ? '#00C864' : '#EF4444',
                        letterSpacing: '0.05em',
                      }}>
                        {liveEvent.final_decision.access_decision === 'GRANTED'
                          ? 'ACESSO LIBERADO'
                          : liveEvent.final_decision.access_decision === 'DENIED_FACE'
                            ? 'NEGADO — ROSTO'
                            : 'NEGADO — EPI'}
                      </span>
                    </div>
                  )}

                </div>
              ) : (
                /* Skeleton enquanto aguarda primeiro evento */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {[1, 2].map((i) => (
                    <div key={i} style={{
                      height: '42px', borderRadius: '6px',
                      background: 'rgba(255,255,255,0.05)',
                      animation: 'sseSkeleton 1.4s ease-in-out infinite',
                      animationDelay: `${i * 0.15}s`,
                    }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Indicador de auto-captura */}
          {enableAutoCapture && isCountingDown && autoCaptureProgress > 0 && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '1rem', zIndex: 8,
            }}>
              <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                <svg style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: '100%', transform: 'rotate(-90deg)',
                }}>
                  <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <circle
                    cx="70" cy="70" r="60" fill="none" stroke="#00FF00" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 60}`}
                    strokeDashoffset={`${2 * Math.PI * 60 * (1 - autoCaptureProgress / 100)}`}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 50ms linear',
                      filter: 'drop-shadow(0 0 8px rgba(0,255,0,0.6))',
                    }}
                  />
                </svg>
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%,-50%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-head)', fontSize: '3rem', fontWeight: 700,
                    color: '#00FF00', lineHeight: 1, textShadow: '0 0 20px rgba(0,255,0,0.8)',
                  }}>
                    {getCountdownSeconds()}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                    color: 'rgba(255,255,255,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>
                    segundos
                  </div>
                </div>
              </div>
              <div style={{
                background: 'rgba(0,255,0,0.15)', backdropFilter: 'blur(12px)',
                border: '2px solid rgba(0,255,0,0.4)', borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1.5rem', fontFamily: 'var(--font-head)',
                fontSize: '0.9rem', fontWeight: 700, color: '#00FF00',
                textAlign: 'center', boxShadow: '0 4px 16px rgba(0,255,0,0.3)',
              }}>
                🎯 Captura Automática
              </div>
            </div>
          )}

          {/* EPIs detectados */}
          {detectedEpi.length > 0 && (
            <div style={{
              position: 'absolute', top: '1rem', left: '1rem',
              background: 'rgba(34,197,94,0.9)', backdropFilter: 'blur(12px)',
              borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem',
              display: 'flex', flexDirection: 'column', gap: '0.25rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 10, maxWidth: '200px',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
                color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>
                ✓ Detectados ({detectedEpi.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                {detectedEpi.map((epi, idx) => (
                  <span key={idx} style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.7rem',
                    color: 'rgba(255,255,255,0.95)', background: 'rgba(255,255,255,0.15)',
                    padding: '2px 6px', borderRadius: '4px',
                  }}>
                    {epi}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div style={{
            position: 'absolute', bottom: '1.5rem', left: '1rem', right: '1rem',
            display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 10,
          }}>
            {status === 'error' && errorMsg && (
              <div style={{
                background: 'rgba(220,38,38,0.95)', border: '1px solid rgba(220,38,38,0.4)',
                borderRadius: 'var(--radius-md)', padding: '0.75rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                backdropFilter: 'blur(12px)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}>
                <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                <div style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#fff' }}>
                  {errorMsg}
                </div>
              </div>
            )}

            {status === 'error' ? (
              <button onClick={onRetry} className="btn-primary" style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '0.75rem', padding: '1rem', fontSize: '0.95rem',
                background: 'rgba(0,132,255,0.9)', backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '2px solid rgba(0,132,255,0.4)',
              }}>
                <span>🔄</span><span>TENTAR NOVAMENTE</span>
              </button>
            ) : (
              <button
                onClick={onCapture}
                disabled={shouldBlockCapture}
                className="btn-primary"
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '0.75rem', padding: '1rem', fontSize: '0.95rem',
                  opacity: shouldBlockCapture ? 0.6 : 1,
                  cursor: shouldBlockCapture ? 'not-allowed' : 'pointer',
                  background: shouldBlockCapture ? 'rgba(100,116,139,0.9)' :
                    isCountingDown ? 'rgba(0,200,100,0.9)' : 'rgba(0,132,255,0.9)',
                  backdropFilter: 'blur(12px)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  border: shouldBlockCapture ? '2px solid rgba(100,116,139,0.4)' :
                    isCountingDown ? '2px solid rgba(0,200,100,0.6)' : '2px solid rgba(0,132,255,0.4)',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>
                  {isProcessing ? '⏳' : !isWellFramed ? '⚠️' : isCountingDown ? '⏱️' : '📸'}
                </span>
                <span>
                  {status === 'capturing' ? 'CAPTURANDO...' :
                   status === 'analyzing' ? 'ANALISANDO EPIs...' :
                   !isWellFramed ? 'AJUSTE SUA POSIÇÃO' :
                   isCountingDown ? `CAPTURANDO EM ${getCountdownSeconds()}s` :
                   'VERIFICAR EPIs'}
                </span>
              </button>
            )}

            {enableAutoCapture && !isCountingDown && isWellFramed && status === 'idle' && (
              <div style={{
                textAlign: 'center', fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)',
              }}>
                💡 Mantenha a posição para captura automática
              </div>
            )}
          </div>

          {/* Indicador de análise (spinner — só quando não tem stream ativo) */}
          {status === 'analyzing' && !isStreaming && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              background: 'rgba(0,132,255,0.15)', backdropFilter: 'blur(8px)',
              borderRadius: '50%', width: '120px', height: '120px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '0.5rem',
              border: '3px solid rgba(0,132,255,0.4)',
              boxShadow: '0 0 30px rgba(0,132,255,0.3)',
              animation: 'pulse 1.5s ease-in-out infinite', zIndex: 5,
            }}>
              <div style={{
                width: '40px', height: '40px',
                border: '4px solid rgba(0,132,255,0.3)',
                borderTop: '4px solid var(--blue-bright)',
                borderRadius: '50%', animation: 'spin 1s linear infinite',
              }} />
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                color: 'var(--blue-bright)', fontWeight: 700, letterSpacing: '0.05em',
              }}>
                ANALISANDO
              </span>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
        }
        @keyframes ssePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes sseSkeleton {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.12; }
        }
      `}</style>

    </div>
  );
}