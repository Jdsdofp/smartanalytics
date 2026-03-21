// src/components/CamAutomationPeople/index.tsx
// Orquestrador principal — apenas conecta o hook aos screens e modais
// Sem lógica de negócio, sem chamadas de API
// Usa adaptadores para converter estados do hook para formatos esperados pelos screens

import TopBar          from './components/TopBar';
import ConfigModal     from './components/ConfigModal';
import PermanenceModal from './components/PermanenceModal';
import IdleScreen      from './screens/IdleScreen';
import FaceScanScreen  from './screens/FaceScanScreen';
import TimeAlertScreen from './screens/TimeAlertScreen';
import EpiScanScreen   from './screens/EpiScanScreen';
import { AccessGrantedScreen, AccessDeniedScreen } from './screens/ResultScreens';
import { useCamAutomation, type Screen, type SysConfig } from '../../hooks/useCamAutomation';
import { adaptFaceScanState, adaptEpiScanState } from '../../adapters/screenStateAdapters';

// ─── Props ────────────────────────────────────────────────────────────────────

interface CamAutomationPeopleProps {
  configOverrides?: Partial<SysConfig>;
}

// ─── ScreenGuard — erro de compilação se Screen ganhar novo valor ─────────────

type ScreenGuard = Record<Screen, true>;
const _: ScreenGuard = {
  idle: true, face_scan: true, time_alert: true,
  epi_scan: true, access_granted: true, access_denied: true,
};
void _;

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CamAutomationPeople({ configOverrides }: CamAutomationPeopleProps) {
  const {
    screen,
    direction,
    //@ts-ignore
    doorStatus,
    session,
    sysConfig,
    showReport,
    showConfig,
    setShowReport,
    setShowConfig,
    cameraHook,

    idleState,
    faceScanState,
    epiScanState,
    configState,
    permanenceState,

    handleStartEntry,
    handleStartExit,
    handleGoIdle,
    handleTimeOverride,
    handleRetryFromDenied,

    handleCaptureFace,
    handleRetryFace,
    handleCaptureEpi,
    handleRetryEpi,
  } = useCamAutomation();

  // Mescla overrides externos se fornecidos
  const mergedConfig: SysConfig = configOverrides
    ? { ...sysConfig, ...configOverrides }
    : sysConfig;

  // Adapta estados do hook para formatos esperados pelos screens
  const adaptedFaceScanState = adaptFaceScanState(faceScanState);
  const adaptedEpiScanState = adaptEpiScanState(epiScanState);

  // Determina se deve usar TopBar minimal (apenas botões flutuantes)
  const useMinimalTopBar = screen === 'face_scan' || screen === 'epi_scan';

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg-deep)', overflow: 'hidden',
    }}>

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
        <TopBar
          // doorStatus="locked"
          doorStatus={doorStatus}
          //@ts-ignore
          config={mergedConfig}
          onOpenReport={() => setShowReport(true)}
          onOpenConfig={() => setShowConfig(true)}
          minimal={useMinimalTopBar}
        />

      {/* ── Conteúdo ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

        {screen === 'idle' && (
          <IdleScreen
            idleState={idleState}
            sysConfig={mergedConfig}
            onStartEntry={handleStartEntry}
            onStartExit={handleStartExit}
            onStartSupply={() => console.log('Abastecimento: funcionalidade a ser implementada')}
          />
        )}

        {/* {screen === 'face_scan' && (
          <FaceScanScreen
            faceScanState={adaptedFaceScanState}
            cameraHook={cameraHook}
            direction={direction}
            onCapture={handleCaptureFace}
            onRetry={handleRetryFace}
            onCancel={handleGoIdle}
          />
        )} */}


        {screen === 'face_scan' && (
        <FaceScanScreen
          faceScanState={{
            ...adaptedFaceScanState,
            personCode: session.person?.personCode,
            personName: session.person?.personName,
          }}
          cameraHook={cameraHook}
          direction={direction}
          onCapture={handleCaptureFace}
          onRetry={handleRetryFace}
          onCancel={handleGoIdle}
        />
      )}


        {screen === 'time_alert' && (
          <TimeAlertScreen
            person={session.person}
            dailyExposure={session.dailyExposure}
            sysConfig={mergedConfig}
            onDeny={handleGoIdle}
            onOverride={handleTimeOverride}
          />
        )}

        {screen === 'epi_scan' && (
          <EpiScanScreen
            epiScanState={adaptedEpiScanState}
            cameraHook={cameraHook}
            //@ts-ignore
            person={session.person}
            onCapture={handleCaptureEpi}
            onRetry={handleRetryEpi}
            onCancel={handleGoIdle}
          />
        )}

        {screen === 'access_granted' && (
          <AccessGrantedScreen
            person={session.person}
            result={session.epiResult}
            sysConfig={mergedConfig}
            onDone={handleGoIdle}
          />
        )}

        {screen === 'access_denied' && (
          <AccessDeniedScreen
            person={session.person}
            missing={session.missingEpi}
            reason="EPI obrigatório não detectado"
            onRetry={handleRetryFromDenied}
            onDone={handleGoIdle}
          />
        )}

      </div>

      {/* ── Modais ───────────────────────────────────────────────────────── */}
      {showReport && (
        <PermanenceModal
          permanenceState={permanenceState}
          sysConfig={mergedConfig}
          onClose={() => setShowReport(false)}
        />
      )}

      {showConfig && (
        <ConfigModal
          configState={configState}
          cameraHook={cameraHook}
          apiBase={mergedConfig.apiBase}
          onClose={() => setShowConfig(false)}
        />
      )}

    </div>
  );
}