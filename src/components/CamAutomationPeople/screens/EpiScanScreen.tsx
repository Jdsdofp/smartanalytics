// // src/screens/EpiScanScreen/index.tsx
// // Tela de verificação de EPI — exibe câmera corpo com detecção de equipamentos
// // Layout otimizado: uma câmera vertical ocupando máximo de espaço com controles sobrepostos
// //@ts-ignore
// import React from 'react';
// import CameraView from '../components/CameraView';
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

//       {/* Título compacto com nome da pessoa */}
//       <div style={{
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         gap: '0.15rem',
//         flexShrink: 0,
//       }}>
//         <div style={{
//           fontSize: '1.3rem',
//           display: 'flex',
//           alignItems: 'center',
//           gap: '0.5rem',
//         }}>
//           <span>🦺</span>
//           <span style={{
//             fontFamily: 'var(--font-head)',
//             fontWeight: 700,
//             color: 'var(--text)',
//           }}>
//             VERIFICAÇÃO DE EPI
//           </span>
//         </div>
//         {person && (
//           <p style={{
//             fontFamily: 'var(--font-mono)',
//             fontSize: '0.65rem',
//             color: 'var(--gray-light)',
//             letterSpacing: '0.05em',
//           }}>
//             {person.name}
//           </p>
//         )}
//       </div>

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
// Tela de verificação de EPI — exibe câmera corpo com detecção de equipamentos
// Layout otimizado: uma câmera vertical ocupando máximo de espaço com controles sobrepostos

//import React from 'react';
import CameraView from '../components/CameraView';
import type { CameraHook } from '../../../hooks/useCamAutomation';

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
      padding: '0.5rem 1rem',
      gap: '0.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Título compacto com nome da pessoa */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.15rem',
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: '1.3rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span>🦺</span>
          <span style={{
            fontFamily: 'var(--font-head)',
            fontWeight: 700,
            color: 'var(--text)',
          }}>
            VERIFICAÇÃO DE EPI
          </span>
        </div>
        {person && (
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--gray-light)',
            letterSpacing: '0.05em',
          }}>
            {person.name}
          </p>
        )}
      </div>

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
                  background: isProcessing 
                    ? 'rgba(100, 116, 139, 0.9)' 
                    : 'rgba(0, 132, 255, 0.9)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  border: isProcessing 
                    ? '2px solid rgba(100, 116, 139, 0.4)' 
                    : '2px solid rgba(0, 132, 255, 0.4)',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>
                  {isProcessing ? '⏳' : '📸'}
                </span>
                <span>
                  {status === 'capturing' 
                    ? 'CAPTURANDO...' 
                    : status === 'analyzing' 
                    ? 'ANALISANDO EPIs...' 
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
      `}</style>

    </div>
  );
}