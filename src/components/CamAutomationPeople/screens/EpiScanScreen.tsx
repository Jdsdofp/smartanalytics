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

import { useEffect, useRef } from 'react';
import CameraView from '../components/CameraView';
import Stepper from '../components/Stepper';
import type { CameraHook } from '../../../hooks/useCamAutomation';
import { useBodyFramingDetection } from '../../../hooks/useBodyFramingDetection';

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
}

export default function EpiScanScreen({
  epiScanState,
  cameraHook,
  person,
  onCapture,
  onRetry,
  onCancel,
}: EpiScanScreenProps) {
  const { status, errorMsg, captureUrl, detectedEpi = [] } = epiScanState;
  const videoRef = useRef<HTMLVideoElement | null>(null);

  

  // Obter referência do vídeo do hook de câmera
  useEffect(() => {
    const assignment = cameraHook.getAssignment('body1');
    if (assignment) {
      // Assumindo que o hook expõe uma forma de obter a ref do vídeo
      // Ajuste conforme sua implementação do CameraHook
      videoRef.current = document.querySelector('video[data-role="body1"]');
    }
  }, [cameraHook]);

  // Hook de detecção de enquadramento
  //@ts-ignore
  const { feedback, isWellFramed, shouldBlock } = useBodyFramingDetection({
    videoElement: videoRef.current,
    enabled: status === 'idle', // Só verifica quando em idle (antes de capturar)
    checkIntervalMs: 800,
    apiEndpoint: 'https://aihub.smartxhub.cloud/api/v1/epi/camera/analyze-framing', // Ajuste para seu endpoint
  });

  const camStatus: 'idle' | 'scanning' | 'ok' | 'fail' | 'warning' =
    status === 'analyzing' ? 'scanning' :
    status === 'ok' ? 'ok' :
    status === 'error' ? 'fail' :
    !isWellFramed && status === 'idle' ? 'warning' :
    'idle';

  const isProcessing = status === 'capturing' || status === 'analyzing';
  
  // Bloquear captura se enquadramento não estiver adequado
  // const canCapture = isWellFramed || status !== 'idle';
  const canCapture = isWellFramed || status !== 'idle';
  // IMPORTANTE: Bloquear captura se não estiver bem enquadrado
  const shouldBlockCapture = !isWellFramed && status === 'idle';

  // Determinar cor do feedback baseado no status
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

  // Ícone do feedback
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

  // Adicione depois da declaração do hook
  useEffect(() => {
    console.log('🎯 Framing Detection State:', {
      enabled: status === 'idle',
      hasVideo: !!videoRef.current,
      feedback: feedback.status,
      isWellFramed,
      shouldBlock
    });
  }, [status, feedback, isWellFramed, shouldBlock]);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '0.5rem 1rem',
      gap: '0.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Stepper de progresso no topo */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        flexShrink: 0,
        zIndex: 10,
      }}>
        <Stepper currentStep="epi" compact />
      </div>

      {/* Nome da pessoa (opcional, pequeno) */}
      {person && (
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: 'var(--gray-light)',
          letterSpacing: '0.05em',
          margin: 0,
          flexShrink: 0,
        }}>
          {person.name}
        </p>
      )}

      {/* Container da câmera ocupando todo espaço vertical disponível */}
      <div style={{
        flex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        minHeight: 0,
        overflow: 'hidden',
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          maxWidth: '600px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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

          {/* Botão X para cancelar - canto superior direito */}
          <button
            onClick={onCancel}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              background: 'rgba(33, 40, 54, 0.85)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.25rem',
              color: 'var(--gray-light)',
              transition: 'all 200ms ease',
              zIndex: 15,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(220, 38, 38, 0.85)';
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.6)';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(33, 40, 54, 0.85)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.color = 'var(--gray-light)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ✕
          </button>

          {/* NOVO: Feedback de enquadramento corporal - topo centralizado */}
          {status === 'idle' && (
            <div style={{
              position: 'absolute',
              top: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: `${getFeedbackColor()}22`,
              backdropFilter: 'blur(12px)',
              border: `2px solid ${getFeedbackColor()}66`,
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: `0 4px 16px ${getFeedbackColor()}33`,
              zIndex: 12,
              maxWidth: '90%',
              transition: 'all 300ms ease',
              animation: feedback.status === 'checking' ? 'pulse 2s ease-in-out infinite' : 'none',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: `${getFeedbackColor()}33`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                color: getFeedbackColor(),
                fontWeight: 'bold',
                flexShrink: 0,
              }}>
                {getFeedbackIcon()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'var(--font-head)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: getFeedbackColor(),
                  marginBottom: '0.15rem',
                }}>
                  {feedback.message}
                </div>
                {feedback.missingParts && feedback.missingParts.length > 0 && (
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}>
                    {feedback.missingParts.join(' • ')}
                  </div>
                )}
              </div>
              {/* Barra de confiança */}
              <div style={{
                width: '4px',
                height: '40px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '2px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${feedback.confidence}%`,
                  background: getFeedbackColor(),
                  transition: 'height 300ms ease',
                }} />
              </div>
            </div>
          )}

          {/* Guias visuais de distância - apenas quando muito próximo */}
          {status === 'idle' && feedback.status === 'too-close' && (
            <div style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 5,
            }}>
              {/* Setas indicando direção de afastamento */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                animation: 'bounce-vertical 1.5s ease-in-out infinite',
              }}>
                <div style={{
                  fontSize: '3rem',
                  color: 'var(--red)',
                  textShadow: '0 0 20px rgba(220, 38, 38, 0.8)',
                }}>
                  ⬇
                </div>
                <div style={{
                  fontFamily: 'var(--font-head)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'var(--red)',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
                  background: 'rgba(220, 38, 38, 0.2)',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                }}>
                  AFASTE-SE
                </div>
                <div style={{
                  fontSize: '3rem',
                  color: 'var(--red)',
                  textShadow: '0 0 20px rgba(220, 38, 38, 0.8)',
                }}>
                  ⬇
                </div>
              </div>
            </div>
          )}

          {/* Frame de referência ideal - mostra quando parcialmente visível */}
          {status === 'idle' && feedback.status === 'partial' && (
            <div style={{
              position: 'absolute',
              inset: '8%',
              border: '3px dashed var(--amber)',
              borderRadius: 'var(--radius-lg)',
              pointerEvents: 'none',
              opacity: 0.6,
              animation: 'pulse-border 2s ease-in-out infinite',
              zIndex: 3,
            }} />
          )}

          {/* EPIs detectados - badge flutuante superior esquerdo */}
          {detectedEpi.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              background: 'rgba(34, 197, 94, 0.9)',
              backdropFilter: 'blur(12px)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem 0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              zIndex: 10,
              maxWidth: '200px',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                ✓ Detectados ({detectedEpi.length})
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.25rem',
              }}>
                {detectedEpi.map((epi, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.7rem',
                      color: 'rgba(255, 255, 255, 0.95)',
                      background: 'rgba(255, 255, 255, 0.15)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {epi}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Botões de ação - parte inferior sobreposta */}
          <div style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '1rem',
            right: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            zIndex: 10,
          }}>
            
            {/* Mensagem de erro inline */}
            {status === 'error' && errorMsg && (
              <div style={{
                background: 'rgba(220, 38, 38, 0.95)',
                border: '1px solid rgba(220, 38, 38, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}>
                <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                <div style={{
                  flex: 1,
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8rem',
                  color: '#fff',
                }}>
                  {errorMsg}
                </div>
              </div>
            )}

            {/* Botão principal */}
            {status === 'error' ? (
              <button
                onClick={onRetry}
                className="btn-primary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  fontSize: '0.95rem',
                  background: 'rgba(0, 132, 255, 0.9)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  border: '2px solid rgba(0, 132, 255, 0.4)',
                }}
              >
                <span>🔄</span>
                <span>TENTAR NOVAMENTE</span>
              </button>
            ) : (
              <button
                onClick={onCapture}
                // disabled={isProcessing || !canCapture}
                disabled={isProcessing || shouldBlockCapture}
                className="btn-primary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  fontSize: '0.95rem',
                  opacity: (isProcessing || !canCapture) ? 0.6 : 1,
                  cursor: (isProcessing || !canCapture) ? 'not-allowed' : 'pointer',
                  background: (isProcessing || !canCapture)
                    ? 'rgba(100, 116, 139, 0.9)' 
                    : 'rgba(0, 132, 255, 0.9)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  border: (isProcessing || !canCapture)
                    ? '2px solid rgba(100, 116, 139, 0.4)' 
                    : '2px solid rgba(0, 132, 255, 0.4)',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>
                  {isProcessing ? '⏳' : !canCapture ? '⚠️' : '📸'}
                </span>
                <span>
                  {status === 'capturing' 
                    ? 'CAPTURANDO...' 
                    : status === 'analyzing' 
                    ? 'ANALISANDO EPIs...'
                    : !canCapture
                    ? 'AJUSTE SUA POSIÇÃO'
                    : 'VERIFICAR EPIs'}
                </span>
              </button>
            )}
          </div>

          {/* Indicador de análise - overlay central */}
          {status === 'analyzing' && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0, 132, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              borderRadius: '50%',
              width: '120px',
              height: '120px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              border: '3px solid rgba(0, 132, 255, 0.4)',
              boxShadow: '0 0 30px rgba(0, 132, 255, 0.3)',
              animation: 'pulse 1.5s ease-in-out infinite',
              zIndex: 5,
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid rgba(0, 132, 255, 0.3)',
                borderTop: '4px solid var(--blue-bright)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: 'var(--blue-bright)',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}>
                ANALISANDO
              </span>
            </div>
          )}

          {/* NOVO: Aviso de bloqueio por enquadramento */}
          {status === 'idle' && !isWellFramed && (
            <div style={{
              position: 'absolute',
              bottom: '6rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(220, 38, 38, 0.95)',
              border: '2px solid rgba(220, 38, 38, 0.6)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 16px rgba(220, 38, 38, 0.5)',
              zIndex: 11,
              maxWidth: '85%',
              animation: 'pulse-warning 2s ease-in-out infinite',
            }}>
              <span style={{ fontSize: '1.5rem' }}>🚫</span>
              <div style={{
                fontFamily: 'var(--font-head)',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#fff',
                textAlign: 'center',
              }}>
                Ajuste o enquadramento antes de capturar
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Animações CSS */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
        }
        @keyframes bounce-vertical {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-15px); }
        }
        @keyframes pulse-border {
          0%, 100% { opacity: 0.6; border-width: 3px; }
          50% { opacity: 0.9; border-width: 4px; }
        }

        @keyframes pulse-warning {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.85; transform: translateX(-50%) scale(1.02); }
        }
      `}</style>

    </div>
  );
}