// src/screens/FaceScanScreen/index.tsx
// Tela de captura facial com Stepper de progresso
// NOVO: Card de identificação quando pessoa for reconhecida

import CameraView from '../components/CameraView';
import Stepper from '../components/Stepper';
import type { CameraHook } from '../../../hooks/useCamAutomation';

export interface FaceScanState {
  status: 'idle' | 'capturing' | 'analyzing' | 'ok' | 'error';
  errorMsg?: string;
  captureUrl?: string | null;
  // Novos campos para identificação da pessoa
  personCode?: string;
  personName?: string;
  personPhoto?: string | null;
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
  const { status, errorMsg, captureUrl, personCode, personName, personPhoto } = faceScanState;

  const camStatus: 'idle' | 'scanning' | 'ok' | 'fail' =
    status === 'analyzing' ? 'scanning' :
    status === 'ok' ? 'ok' :
    status === 'error' ? 'fail' :
    'idle';

  const isProcessing = status === 'capturing' || status === 'analyzing';

  // Pessoa identificada (quando status === 'ok')
  const personIdentified = status === 'ok' && personCode && personName;

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '0.5vh 0.5vw',
      gap: '0.75rem',
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
        <Stepper 
          currentStep="face" 
          overlay={true}
        />
      </div>

      {/* Container da câmera ocupando quase toda altura restante */}
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
          maxWidth: '640px',
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
            aspectRatio="9/16"
            dynamicSize={false}
          />

          {/* Card de Identificação da Pessoa (quando reconhecida) */}
          {personIdentified && (
            <div style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              right: '1rem',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%)',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              borderRadius: 16,
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4), 0 4px 16px rgba(0, 0, 0, 0.3)',
              zIndex: 15,
              animation: 'slideInDown 400ms ease',
            }}>
              {/* Foto da pessoa (se disponível) */}
              {personPhoto ? (
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid rgba(255, 255, 255, 0.5)',
                  flexShrink: 0,
                  background: '#fff',
                }}>
                  <img 
                    src={personPhoto} 
                    alt={personName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              ) : (
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.3)',
                  border: '3px solid rgba(255, 255, 255, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  flexShrink: 0,
                }}>
                  👤
                </div>
              )}

              {/* Informações da pessoa */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}>
                  ✓ Identificado
                </div>
                <div style={{
                  fontFamily: 'var(--font-head)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#fff',
                  lineHeight: 1.2,
                }}>
                  {personName}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                  letterSpacing: '0.03em',
                }}>
                  Código: {personCode}
                </div>
              </div>

              {/* Ícone de sucesso */}
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                flexShrink: 0,
                animation: 'pulse 2s ease-in-out infinite',
              }}>
                ✓
              </div>
            </div>
          )}

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
                  background: 'rgba(0, 132, 255, 0.25)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '12px',
                  boxShadow: `
                    0 4px 20px rgba(0,132,255,0.35),
                    inset 0 1px 0 rgba(255,255,255,0.35)
                  `,
                  color: '#fff',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>📸</span>
                <span>{isProcessing ? 'PROCESSANDO...' : 'CAPTURAR ROSTO'}</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Animações CSS */}
      <style>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      `}</style>

    </div>
  );
}