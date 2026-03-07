// src/components/CamAutomationPeople/screens/EpiScanScreen.tsx
// Tela de verificação de EPI — sem estado próprio, sem chamadas de API
// Tudo vem de epiScanState + handleCaptureEpi + handleRetryEpi via useCamAutomation

import CameraView from '../components/CameraView';
import type {
  CameraHook,
  Person,
  EpiScanState,
} from '../../../hooks/useCamAutomation';

// ─── Props ────────────────────────────────────────────────────────────────────

interface EpiScanScreenProps {
  epiScanState:     EpiScanState;
  cameraHook:       CameraHook;
  person:           Person | null;
  onCapture:        () => Promise<void>;
  onRetry:          () => void;
  onCancel:         () => void;
}

// ─── Labels PT ────────────────────────────────────────────────────────────────

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

const label = (k: string) => EPI_LABELS_PT[k] ?? k;

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EpiScanScreen({
  epiScanState,
  cameraHook,
  person,
  onCapture,
  onRetry,
  onCancel,
}: EpiScanScreenProps) {
  const { step, captureUrl1, captureUrl2, statusMsg, countdown, result } = epiScanState;

  const hasBody2  = !!cameraHook.getAssignment('body2');
  const camStatus = step === 'done'
    ? (result?.compliant ? 'ok' : 'fail')
    : step === 'error' ? 'fail' : 'scanning';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 24px', gap: 16, animation: 'fadeIn 300ms ease' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            🦺 VERIFICAÇÃO DE EPI
          </h2>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gray-light)', marginTop: 2 }}>
            {person?.personName} · {person?.personCode}
          </div>
        </div>

        {countdown !== null && (
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            border: '3px solid var(--blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-head)', fontSize: '1.6rem', fontWeight: 900, color: 'var(--blue)',
          }}>
            {countdown}
          </div>
        )}
      </div>

      {/* Cameras grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: hasBody2 ? '1fr 1fr' : '1fr',
        gap: 12, flex: 1, minHeight: 0,
      }}>
        <CameraView
          role="body1"
          cameraHook={cameraHook}
          scanning={step === 'ready' || step === 'processing'}
          status={camStatus}
          label="CÂMERA CORPO 1 · USB"
          captureUrl={captureUrl1}
          autoStart={true}
          aspectRatio="16/9"
        />
        {hasBody2 && (
          <CameraView
            role="body2"
            cameraHook={cameraHook}
            scanning={step === 'ready' || step === 'processing'}
            status={camStatus}
            label="CÂMERA CORPO 2 · USB"
            captureUrl={captureUrl2}
            autoStart={true}
            aspectRatio="16/9"
          />
        )}
      </div>

      {/* Bottom bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '14px 16px',
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
      }}>
        {/* Status + chips */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-head)', fontSize: '1rem', fontWeight: 700,
            color: step === 'done'
              ? (result?.compliant ? 'var(--green)' : 'var(--red)')
              : step === 'error' ? 'var(--red)' : 'var(--white)',
          }}>
            {statusMsg}
          </div>

          {step === 'done' && result && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {(result.detected || result.detected_ppe || []).map((k) => (
                <span key={k} className="epi-chip ok">✓ {label(k)}</span>
              ))}
              {(result.missing || result.missing_ppe || []).map((k) => (
                <span key={k} className="epi-chip missing">✗ {label(k)}</span>
              ))}
            </div>
          )}
        </div>

        {step === 'processing' && <div className="spinner" />}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {step === 'ready' && (
            <button className="btn-primary" onClick={onCapture} style={{ height: 48, padding: '0 24px' }}>
              📸 VERIFICAR EPI
            </button>
          )}
          {step === 'error' && (
            <button className="btn-primary" onClick={onRetry} style={{ height: 48, padding: '0 24px' }}>
              🔄 TENTAR
            </button>
          )}
          <button className="btn-ghost" onClick={onCancel} disabled={step === 'processing'} style={{ height: 48 }}>
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}