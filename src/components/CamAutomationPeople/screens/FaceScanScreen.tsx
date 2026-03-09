// // src/screens/FaceScanScreen/index.tsx
// // Tela de captura facial — exibe câmera frontal com botão de captura
// // Mostra estado atual e permite retry em caso de erro
// // Layout otimizado: câmera vertical ocupando quase 100% da tela com botões sobrepostos

// //import React from 'react';
// import CameraView from '../components/CameraView';
// import type { CameraHook } from '../../../hooks/useCamAutomation';

// export interface FaceScanState {
//   status: 'idle' | 'capturing' | 'analyzing' | 'ok' | 'error';
//   errorMsg?: string;
//   captureUrl?: string | null;
// }

// interface FaceScanScreenProps {
//   faceScanState: FaceScanState;
//   cameraHook: CameraHook;
//   direction: 'entry' | 'exit';
//   onCapture: () => void;
//   onRetry: () => void;
//   onCancel: () => void;
// }

// export default function FaceScanScreen({
//   faceScanState,
//   cameraHook,
//   //@ts-ignore
//   direction,
//   onCapture,
//   onRetry,
//   onCancel,
// }: FaceScanScreenProps) {
//   const { status, errorMsg, captureUrl } = faceScanState;

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
//       padding: '0.75rem 1rem',
//       gap: '0.75rem',
//       position: 'relative',
//       overflow: 'hidden',
//     }}>

//       {/* Título compacto */}
//       <div style={{
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         gap: '0.25rem',
//         flexShrink: 0,
//       }}>
//         <div style={{
//           fontSize: '1.4rem',
//           display: 'flex',
//           alignItems: 'center',
//           gap: '0.5rem',
//         }}>
//           <span>🔍</span>
//           <span style={{
//             fontFamily: 'var(--font-head)',
//             fontWeight: 700,
//             color: 'var(--text)',
//           }}>
//             IDENTIFICAÇÃO
//           </span>
//         </div>
//         <p style={{
//           fontFamily: 'var(--font-mono)',
//           fontSize: '0.65rem',
//           color: 'var(--gray-light)',
//           letterSpacing: '0.08em',
//           textTransform: 'uppercase',
//         }}>
//           Câmera Frontal - Reconhecimento Facial
//         </p>
//       </div>

//       {/* Container da câmera ocupando quase toda altura restante */}
//       <div style={{
//         flex: 1,
//         width: '100%',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         position: 'relative',
//         minHeight: 0, // permite flex shrink
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
//             role="face"
//             cameraHook={cameraHook}
//             scanning={status === 'analyzing'}
//             captureUrl={captureUrl}
//             status={camStatus}
//             autoStart
//             aspectRatio="9/16" // Vertical para pegar corpo/busto
//             dynamicSize={false}
//           />

//           {/* Botões sobrepostos na parte inferior da câmera */}
//           <div style={{
//             position: 'absolute',
//             bottom: '1.5rem',
//             left: '1rem',
//             right: '1rem',
//             display: 'flex',
//             gap: '0.75rem',
//             zIndex: 10,
//           }}>
//             {status === 'error' ? (
//               <>
//                 <button
//                   onClick={onRetry}
//                   className="btn-primary"
//                   style={{
//                     flex: 1,
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '0.5rem',
//                     padding: '0.875rem',
//                     fontSize: '0.85rem',
//                     background: 'rgba(0, 132, 255, 0.95)',
//                     backdropFilter: 'blur(12px)',
//                     boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//                   }}
//                 >
//                   <span>🔄</span>
//                   <span>TENTAR NOVAMENTE</span>
//                 </button>
//                 <button
//                   onClick={onCancel}
//                   className="btn-secondary"
//                   style={{
//                     flex: 1,
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '0.5rem',
//                     padding: '0.875rem',
//                     fontSize: '0.85rem',
//                     background: 'rgba(33, 40, 54, 0.95)',
//                     backdropFilter: 'blur(12px)',
//                     boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//                   }}
//                 >
//                   <span>✕</span>
//                   <span>CANCELAR</span>
//                 </button>
//               </>
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
//                   background: 'rgba(0, 132, 255, 0.95)',
//                   backdropFilter: 'blur(12px)',
//                   boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//                 }}
//               >
//                 <span style={{ fontSize: '1.25rem' }}>📸</span>
//                 <span>{isProcessing ? 'PROCESSANDO...' : 'CAPTURAR ROSTO'}</span>
//               </button>
//             )}
//           </div>

//           {/* Mensagem de erro sobreposta */}
//           {status === 'error' && errorMsg && (
//             <div style={{
//               position: 'absolute',
//               top: '1rem',
//               left: '1rem',
//               right: '1rem',
//               background: 'rgba(220, 38, 38, 0.95)',
//               border: '1px solid var(--red)',
//               borderRadius: 'var(--radius-md)',
//               padding: '0.75rem 1rem',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '0.75rem',
//               backdropFilter: 'blur(12px)',
//               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//               zIndex: 10,
//             }}>
//               <span style={{ fontSize: '1.25rem' }}>⚠️</span>
//               <div style={{
//                 flex: 1,
//                 fontFamily: 'var(--font-body)',
//                 fontSize: '0.875rem',
//                 color: '#fff',
//               }}>
//                 <strong>Erro ao processar</strong><br />
//                 <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>{errorMsg}</span>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//     </div>
//   );
// }


// src/screens/FaceScanScreen/index.tsx
// Tela de captura facial — exibe câmera frontal com botão de captura
// Mostra estado atual e permite retry em caso de erro
// Layout otimizado: câmera vertical ocupando quase 100% da tela com botões sobrepostos

//import React from 'react';
import CameraView from '../components/CameraView';
import type { CameraHook } from '../../../hooks/useCamAutomation';

export interface FaceScanState {
  status: 'idle' | 'capturing' | 'analyzing' | 'ok' | 'error';
  errorMsg?: string;
  captureUrl?: string | null;
}

interface FaceScanScreenProps {
  faceScanState: FaceScanState;
  cameraHook: CameraHook;
  direction: 'ENTRY' | 'EXIT';
  onCapture: () => void;
  onRetry: () => void;
  onCancel: () => void;
}

export default function FaceScanScreen({
  faceScanState,
  cameraHook,
  //@ts-ignore
  direction,
  onCapture,
  onRetry,
  onCancel,
}: FaceScanScreenProps) {
  const { status, errorMsg, captureUrl } = faceScanState;

  const camStatus: 'idle' | 'scanning' | 'ok' | 'fail' =
    status === 'analyzing' ? 'scanning' :
    status === 'ok' ? 'ok' :
    status === 'error' ? 'fail' :
    'idle';

  const isProcessing = status === 'capturing' || status === 'analyzing';

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '0.75rem 1rem',
      gap: '0.75rem',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Título compacto */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: '1.4rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span>🔍</span>
          <span style={{
            fontFamily: 'var(--font-head)',
            fontWeight: 700,
            color: 'var(--text)',
          }}>
            IDENTIFICAÇÃO
          </span>
        </div>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'var(--gray-light)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          Câmera Frontal - Reconhecimento Facial
        </p>
      </div>

      {/* Container da câmera ocupando quase toda altura restante */}
      <div style={{
        flex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        minHeight: 0, // permite flex shrink
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
            role="face"
            cameraHook={cameraHook}
            scanning={status === 'analyzing'}
            captureUrl={captureUrl}
            status={camStatus}
            autoStart
            aspectRatio="9/16" // Vertical para pegar corpo/busto
            dynamicSize={false}
          />

          {/* Botões sobrepostos na parte inferior da câmera */}
          <div style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '1rem',
            right: '1rem',
            display: 'flex',
            gap: '0.75rem',
            zIndex: 10,
          }}>
            {status === 'error' ? (
              <>
                <button
                  onClick={onRetry}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.875rem',
                    fontSize: '0.85rem',
                    background: 'rgba(0, 132, 255, 0.95)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <span>🔄</span>
                  <span>TENTAR NOVAMENTE</span>
                </button>
                <button
                  onClick={onCancel}
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.875rem',
                    fontSize: '0.85rem',
                    background: 'rgba(33, 40, 54, 0.95)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <span>✕</span>
                  <span>CANCELAR</span>
                </button>
              </>
            ) : (
              <button
                onClick={onCapture}
                disabled={isProcessing}
                className="btn-primary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  fontSize: '0.95rem',
                  opacity: isProcessing ? 0.6 : 1,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  background: 'rgba(0, 132, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>📸</span>
                <span>{isProcessing ? 'PROCESSANDO...' : 'CAPTURAR ROSTO'}</span>
              </button>
            )}
          </div>

          {/* Mensagem de erro sobreposta */}
          {status === 'error' && errorMsg && (
            <div style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              right: '1rem',
              background: 'rgba(220, 38, 38, 0.95)',
              border: '1px solid var(--red)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              zIndex: 10,
            }}>
              <span style={{ fontSize: '1.25rem' }}>⚠️</span>
              <div style={{
                flex: 1,
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                color: '#fff',
              }}>
                <strong>Erro ao processar</strong><br />
                <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>{errorMsg}</span>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}