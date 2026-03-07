// src/components/CamAutomationPeople/screens/FaceScanScreen.tsx
// Tela de reconhecimento facial — sem estado próprio, sem chamadas de API
// Tudo vem de faceScanState + handleCaptureFace + handleRetryFace via useCamAutomation

import CameraView from '../components/CameraView';
import type { CameraHook, Direction, FaceScanState } from '../../../hooks/useCamAutomation';

// ─── Props ────────────────────────────────────────────────────────────────────

interface FaceScanScreenProps {
  faceScanState: FaceScanState;
  cameraHook:    CameraHook;
  direction:     Direction;
  onCapture:     () => Promise<void>;
  onRetry:       () => void;
  onCancel:      () => void;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

type CamStatus = 'idle' | 'scanning' | 'ok' | 'fail';

const STEP_TO_STATUS: Record<FaceScanState['step'], CamStatus> = {
  ready:      'scanning',
  capturing:  'scanning',
  processing: 'scanning',
  done:       'ok',
  error:      'fail',
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function FaceScanScreen({
  faceScanState,
  cameraHook,
  direction,
  onCapture,
  onRetry,
  onCancel,
}: FaceScanScreenProps) {
  const { step, captureUrl, progress, statusMsg, subMsg, countdown } = faceScanState;

  const camStatus = STEP_TO_STATUS[step] ?? 'idle';

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '20px 32px', gap: 20,
      animation: 'fadeIn 300ms ease',
    }}>

      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{
          fontFamily: 'var(--font-head)', fontSize: '1.8rem', fontWeight: 800,
          letterSpacing: '0.06em', color: 'var(--white)', textTransform: 'uppercase',
        }}>
          {direction === 'ENTRY' ? '🔍 IDENTIFICAÇÃO' : '↩ SAÍDA — IDENTIFICAÇÃO'}
        </h2>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--gray-light)', marginTop: 4, letterSpacing: '0.08em' }}>
          CÂMERA FRONTAL · RECONHECIMENTO FACIAL
        </div>
      </div>

      {/* Camera + status layout */}
      <div style={{ display: 'flex', gap: 24, width: '100%', maxWidth: 700, alignItems: 'flex-start' }}>

        {/* Camera */}
        <div style={{ flex: '0 0 55%' }}>
          <CameraView
            role="face"
            cameraHook={cameraHook}
            scanning={step === 'ready' || step === 'processing'}
            status={camStatus}
            label="CÂMERA FACIAL"
            captureUrl={captureUrl}
            autoStart={true}
          />
        </div>

        {/* Status panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Status card */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{
              fontFamily: 'var(--font-head)', fontSize: '1.1rem', fontWeight: 700,
              color: step === 'done' ? 'var(--green)' : step === 'error' ? 'var(--red)' : 'var(--white)',
              marginBottom: 6,
            }}>
              {statusMsg}
            </div>
            {subMsg && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--gray-light)' }}>
                {subMsg}
              </div>
            )}
            {step === 'processing' && (
              <div className="progress-bar" style={{ marginTop: 14 }}>
                <div className="progress-bar-fill" style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, var(--blue-dim), var(--blue-bright))',
                }} />
              </div>
            )}
          </div>

          {/* Countdown */}
          {countdown !== null && step === 'ready' && (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: 20, textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '3rem', fontWeight: 900, color: 'var(--blue)', lineHeight: 1 }}>
                {countdown}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gray-light)', marginTop: 6 }}>
                Captura automática
              </div>
            </div>
          )}

          {/* Instructions */}
          {step === 'ready' && countdown === null && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--gray)', lineHeight: 1.6 }}>
              • Olhe diretamente para a câmera<br />
              • Mantenha rosto centralizado no óvalo<br />
              • Remova óculos escuros e máscaras
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
            {step === 'ready' && (
              <button className="btn-primary" onClick={onCapture} style={{ width: '100%', height: 54 }}>
                📸 CAPTURAR AGORA
              </button>
            )}
            {step === 'error' && (
              <button className="btn-primary" onClick={onRetry} style={{ width: '100%', height: 54 }}>
                🔄 TENTAR NOVAMENTE
              </button>
            )}
            {step === 'processing' && (
              <button disabled className="btn-primary" style={{ width: '100%', height: 54 }}>
                <div className="spinner" /> PROCESSANDO…
              </button>
            )}
            <button className="btn-ghost" onClick={onCancel} style={{ width: '100%' }} disabled={step === 'processing'}>
              ✕ CANCELAR
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}