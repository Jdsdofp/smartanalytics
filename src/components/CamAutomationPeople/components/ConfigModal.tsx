// src/components/CamAutomationPeople/components/ConfigModal.tsx
// Modal de configuração — MELHORADO

import { useState } from 'react';
import type { CamRole, CameraHook, SysConfig, ConfigState, CameraSourceType } from '../../../hooks/useCamAutomation';

interface ConfigModalProps {
  configState: ConfigState;
  cameraHook:  CameraHook;
  apiBase:     string;
  onClose:     () => void;
}

type TabId = 'cameras' | 'cameras_ip' | 'limits' | 'epi' | 'system';

const CAM_ROLE_LIST: { role: CamRole; label: string; desc: string; icon: string }[] = [
  { role: 'face',  label: 'Câmera Facial',  icon: '👤', desc: 'Frontal / embutida — reconhecimento facial' },
  { role: 'body1', label: 'Câmera Corpo 1', icon: '📷', desc: 'USB externa — corpo superior (jaqueta, luvas, capacete)' },
  { role: 'body2', label: 'Câmera Corpo 2', icon: '📷', desc: 'USB externa — corpo inferior (calça, botas) — opcional' },
];

const SYSTEM_FIELDS: { label: string; key: keyof SysConfig; type: 'number' | 'text'; icon: string; hint?: string }[] = [
  { label: 'Company ID',          key: 'companyId',        type: 'number', icon: '🏢', hint: 'ID da empresa no sistema' },
  { label: 'Zone ID',             key: 'zoneId',           type: 'number', icon: '📍', hint: 'ID da zona de acesso' },
  { label: 'Door ID',             key: 'doorId',           type: 'text',   icon: '🚪', hint: 'Identificador da porta' },
  { label: 'Confiança Facial (%)',key: 'faceConfidenceMin',type: 'number', icon: '🎯', hint: 'Mínimo para reconhecimento (0–1)' },
  { label: 'IP da Fechadura',     key: 'lockIpAddress',    type: 'text',   icon: '🔒', hint: 'Ex: 192.168.68.100' },
  { label: 'Duração Unlock (ms)', key: 'lockDurationMs',   type: 'number', icon: '⏱', hint: 'Tempo que a fechadura fica aberta' },
];

const EPI_ICONS: Record<string, string> = {
  thermal_coat:  '🧥',
  thermal_pants: '👖',
  gloves:        '🧤',
  helmet:        '⛑️',
  boots:         '👢',
  person:        '🧍',
};

const EPI_LABELS: Record<string, string> = {
  thermal_coat:  'Jaqueta Térmica',
  thermal_pants: 'Calça Térmica',
  gloves:        'Luvas',
  helmet:        'Capacete',
  boots:         'Botas',
  person:        'Pessoa',
};

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'cameras',    label: 'Câmeras USB', icon: '📷' },
  { id: 'cameras_ip', label: 'Câmeras IP',  icon: '🌐' },
  { id: 'limits',     label: 'Permanência', icon: '⏱' },
  { id: 'epi',        label: 'EPIs',        icon: '🦺' },
  { id: 'system',     label: 'Sistema',     icon: '⚙' },
];

export default function ConfigModal({ configState, cameraHook, apiBase, onClose }: ConfigModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('system');

  const {
    localConfig, setLocalConfig,
    //@ts-ignore
    epiConfig,   
    //@ts-ignore
    setEpiConfig,
    saving, saved,
    handleSave,
  } = configState;

  const { devices, assignments, assignDevice, enumerateDevices, sourceTypes, ipUrls, setSourceType, setIpUrl } = cameraHook;

  // ─── EPI data from API (banco) ───────────────────────────────────────────
  // epiConfig.config = { thermal_coat: { enabled: true, required: true, ... }, ... }
  const epiEntries = epiConfig?.config
    ? Object.entries(epiConfig.config as Record<string, { enabled: boolean; required: boolean; display_name?: string }>)
        .filter(([cls]) => cls !== 'person')
    : [];

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{
        background: 'var(--bg-card, #0f1117)',
        border: '1px solid var(--border, #2a2d3a)',
        borderRadius: 16,
        width: '100%', maxWidth: 560,
        maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid var(--border, #2a2d3a)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34,
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem',
            }}>⚙</div>
            <div>
              <div style={{
                fontFamily: 'var(--font-head, monospace)',
                fontSize: '1rem', fontWeight: 800,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: 'var(--white, #fff)',
              }}>Configurações</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--gray, #666)', fontFamily: 'var(--font-mono, monospace)' }}>
                SmartX EPI System
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--border, #2a2d3a)',
              color: 'var(--gray-light, #aaa)',
              borderRadius: 8, width: 34, height: 34,
              fontSize: '0.9rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 150ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >✕</button>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: 'flex',
          padding: '0 24px',
          borderBottom: '1px solid var(--border, #2a2d3a)',
          background: 'rgba(255,255,255,0.01)',
          overflowX: 'auto',
          gap: 2,
        }}>
          {TABS.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${isActive ? 'var(--blue, #3b82f6)' : 'transparent'}`,
                  color: isActive ? 'var(--blue, #3b82f6)' : 'var(--gray, #666)',
                  padding: '12px 14px',
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-head, monospace)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                  transition: 'all 150ms',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <span>{t.icon}</span>
                <span>{t.label.toUpperCase()}</span>
              </button>
            );
          })}
        </div>

        {/* ── Content ── */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: 24,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>

          {/* ── CÂMERAS USB ── */}
          {activeTab === 'cameras' && (
            <>
              <InfoBox>
                Atribua cada câmera USB ao seu papel. A câmera facial deve ser a embutida/frontal.
              </InfoBox>
              <button
                onClick={enumerateDevices}
                style={{
                  alignSelf: 'flex-start',
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.3)',
                  color: 'var(--blue, #3b82f6)',
                  borderRadius: 8, padding: '8px 14px',
                  fontSize: '0.7rem', fontFamily: 'var(--font-head, monospace)',
                  fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em',
                }}
              >
                ↻ REDETECTAR  ({devices.length} encontradas)
              </button>
              {CAM_ROLE_LIST.map(({ role, label, icon, desc }) => (
                <FieldCard key={role} icon={icon} label={label} hint={desc}>
                  <select
                    value={assignments[role] || ''}
                    onChange={(e) => assignDevice(role, e.target.value)}
                    style={selectStyle}
                  >
                    <option value="">— Não configurada —</option>
                    {devices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Câmera ${d.deviceId.slice(0, 8)}…`}
                      </option>
                    ))}
                  </select>
                </FieldCard>
              ))}
            </>
          )}

          {/* ── CÂMERAS IP ── */}
          {activeTab === 'cameras_ip' && (
            <>
              {/* Single Camera Toggle */}
              <div
                onClick={() => setLocalConfig({ ...localConfig, useSingleCamera: !localConfig.useSingleCamera })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', cursor: 'pointer',
                  background: localConfig.useSingleCamera ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${localConfig.useSingleCamera ? 'rgba(59,130,246,0.4)' : 'var(--border, #2a2d3a)'}`,
                  borderRadius: 10, transition: 'all 200ms',
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 4,
                  background: localConfig.useSingleCamera ? 'var(--blue, #3b82f6)' : 'transparent',
                  border: `2px solid ${localConfig.useSingleCamera ? 'var(--blue, #3b82f6)' : 'var(--gray, #666)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', color: '#fff', flexShrink: 0,
                  transition: 'all 200ms',
                }}>
                  {localConfig.useSingleCamera && '✓'}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-head, monospace)', fontWeight: 700, fontSize: '0.85rem', color: localConfig.useSingleCamera ? 'var(--blue, #3b82f6)' : 'var(--white, #fff)' }}>
                    Usar mesma câmera para Face e EPI
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--gray, #666)', fontFamily: 'var(--font-mono, monospace)', marginTop: 2 }}>
                    Recomendado quando há apenas uma câmera disponível
                  </div>
                </div>
              </div>

              {CAM_ROLE_LIST.map(({ role, label, icon }) => {
                if (localConfig.useSingleCamera && role !== 'face') return null;
                const sourceType = sourceTypes[role];
                const isLocal = sourceType === 'local';
                return (
                  <div key={role} style={{
                    padding: 16,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border, #2a2d3a)',
                    borderRadius: 10,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ fontFamily: 'var(--font-head, monospace)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--white, #fff)' }}>
                        {icon} {label}
                      </div>
                      <select
                        value={sourceType}
                        onChange={(e) => setSourceType(role, e.target.value as CameraSourceType)}
                        style={{ ...selectStyle, width: 'auto', padding: '5px 10px', fontSize: '0.7rem' }}
                      >
                        <option value="local">📹 Local (USB)</option>
                        <option value="ip_url">🌐 IP (URL)</option>
                      </select>
                    </div>
                    {isLocal ? (
                      <select value={assignments[role] || ''} onChange={(e) => assignDevice(role, e.target.value)} style={selectStyle}>
                        <option value="">— Selecione —</option>
                        {devices.map((d) => (
                          <option key={d.deviceId} value={d.deviceId}>
                            {d.label || `Câmera ${d.deviceId.slice(0, 8)}…`}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="http://admin:senha@192.168.1.100:8070/snapshot.cgi"
                          value={ipUrls[role] || ''}
                          onChange={(e) => setIpUrl(role, e.target.value)}
                          style={{ ...inputStyle, width: '100%' }}
                        />
                        <div style={{ fontSize: '0.6rem', color: 'var(--gray, #666)', fontFamily: 'var(--font-mono, monospace)', marginTop: 6 }}>
                          💡 Ex: http://admin:mixhub123@177.139.51.174:8056/cgi-bin/snapshot.cgi?channel=1
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              <WarnBox>
                Se houver erro de CORS, o backend faz proxy via <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 4px', borderRadius: 3 }}>/api/v1/epi/camera/snapshot</code>
              </WarnBox>
            </>
          )}

          {/* ── PERMANÊNCIA ── */}
          {activeTab === 'limits' && (
            <>
              <FieldCard icon="⏰" label="Limite Diário" hint="Tempo máximo de permanência por dia (minutos)">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="number" min={30} max={480}
                    value={localConfig.dailyLimitMin || 120}
                    onChange={(e) => setLocalConfig({ ...localConfig, dailyLimitMin: parseInt(e.target.value) })}
                    style={{ ...inputStyle, maxWidth: 120 }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray, #666)', fontFamily: 'var(--font-mono, monospace)' }}>minutos</span>
                </div>
                <div style={{ fontSize: '0.6rem', color: 'var(--gray, #666)', fontFamily: 'var(--font-mono, monospace)', marginTop: 4 }}>
                  Min: 30 · Max: 480 min (8h)
                </div>
              </FieldCard>

              <div>
                <div style={{ fontFamily: 'var(--font-head, monospace)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--white, #fff)', marginBottom: 10 }}>
                  ⚡ Política ao Exceder
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { id: 'warn',  label: 'Avisar e Liberar', icon: '⚠️', color: '#f59e0b', desc: 'Exibe alerta mas permite acesso' },
                    { id: 'block', label: 'Bloquear Acesso',  icon: '🚫', color: '#ef4444', desc: 'Nega entrada, requer supervisor' },
                  ].map((p) => {
                    const isActive = localConfig.overLimitPolicy === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setLocalConfig({ ...localConfig, overLimitPolicy: p.id as 'warn' | 'block' })}
                        style={{
                          flex: 1, padding: '14px 16px', cursor: 'pointer', borderRadius: 10,
                          border: `2px solid ${isActive ? p.color : 'var(--border, #2a2d3a)'}`,
                          background: isActive ? `${p.color}12` : 'rgba(255,255,255,0.02)',
                          transition: 'all 200ms',
                        }}
                      >
                        <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{p.icon}</div>
                        <div style={{ fontFamily: 'var(--font-head, monospace)', fontWeight: 700, fontSize: '0.8rem', color: isActive ? p.color : 'var(--gray-light, #aaa)', marginBottom: 4 }}>
                          {p.label}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--gray, #666)', fontFamily: 'var(--font-mono, monospace)' }}>
                          {p.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <FieldCard icon="🚪" label="Tempo máx. porta aberta" hint="Máximo de minutos que a porta pode ficar aberta">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="number" min={1} max={60}
                    value={localConfig.doorOpenMaxMin || 15}
                    onChange={(e) => setLocalConfig({ ...localConfig, doorOpenMaxMin: parseInt(e.target.value) })}
                    style={{ ...inputStyle, maxWidth: 100 }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray, #666)', fontFamily: 'var(--font-mono, monospace)' }}>minutos</span>
                </div>
              </FieldCard>
            </>
          )}

          {/* ── EPI ── */}
          {activeTab === 'epi' && (
            <>
              <InfoBox>
                Configuração lida do banco de dados. Gerencie via SmartX HUB → Configurações → EPI.
              </InfoBox>

              {!epiConfig ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px', color: 'var(--gray, #666)', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem' }}>
                  <div style={{ width: 16, height: 16, border: '2px solid var(--blue, #3b82f6)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Carregando configuração de EPIs…
                </div>
              ) : epiEntries.length === 0 ? (
                <WarnBox>Nenhum EPI configurado no banco.</WarnBox>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {epiEntries.map(([cls, cfg]) => {
                    const icon = EPI_ICONS[cls] || '🔲';
                    const label = EPI_LABELS[cls] || cls;
                    const enabled = cfg.enabled;
                    const required = cfg.required;

                    return (
                      <div key={cls} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: enabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                        border: `1px solid ${enabled ? 'var(--border, #2a2d3a)' : 'rgba(255,255,255,0.05)'}`,
                        borderRadius: 10,
                        opacity: enabled ? 1 : 0.5,
                        transition: 'all 200ms',
                      }}>
                        {/* Left */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 38, height: 38,
                            background: enabled ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)',
                            borderRadius: 8,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.2rem',
                          }}>{icon}</div>
                          <div>
                            <div style={{ fontFamily: 'var(--font-head, monospace)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--white, #fff)' }}>
                              {label}
                            </div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--gray, #666)', fontFamily: 'var(--font-mono, monospace)', marginTop: 2 }}>
                              {cls}
                            </div>
                          </div>
                        </div>

                        {/* Right — badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <StatusBadge active={enabled} activeColor="#3b82f6" activeLabel="HABILITADO" inactiveLabel="DESATIVADO" />
                          {enabled && <StatusBadge active={required} activeColor="#ef4444" activeLabel="OBRIGATÓRIO" inactiveLabel="OPCIONAL" />}
                        </div>
                      </div>
                    );
                  })}

                  <div style={{
                    marginTop: 8, padding: '10px 14px',
                    background: 'rgba(59,130,246,0.06)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    borderRadius: 8,
                    fontSize: '0.65rem', color: 'var(--gray, #666)',
                    fontFamily: 'var(--font-mono, monospace)', lineHeight: 1.6,
                  }}>
                    💡 Para alterar, acesse <strong style={{ color: 'var(--blue, #3b82f6)' }}>SmartX HUB → EPI → Configurações</strong> e salve. As alterações são aplicadas automaticamente na próxima validação.
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── SYSTEM ── */}
          {activeTab === 'system' && (
            <>
              {/* Seção API / Acesso */}
              <SectionLabel label="🔧 Identificação do Sistema" />
              {SYSTEM_FIELDS.slice(0, 4).map((f) => (
                <FieldCard key={f.key} icon={f.icon} label={f.label} hint={f.hint}>
                  <input
                    type={f.type}
                    value={String(localConfig[f.key] ?? '')}
                    onChange={(e) => setLocalConfig({ ...localConfig, [f.key]: f.type === 'number' ? parseFloat(e.target.value) : e.target.value })}
                    style={{ ...inputStyle, maxWidth: 260 }}
                  />
                </FieldCard>
              ))}

              {/* Divisor */}
              <div style={{ margin: '4px 0' }}>
                <SectionLabel label="🔒 Fechadura ESP32 (MIXHUB)" />
              </div>

              {/* Lock fields */}
              {SYSTEM_FIELDS.slice(4).map((f) => (
                <FieldCard key={f.key} icon={f.icon} label={f.label} hint={f.hint}>
                  <input
                    type={f.type}
                    value={String(localConfig[f.key] ?? '')}
                    onChange={(e) => setLocalConfig({ ...localConfig, [f.key]: f.type === 'number' ? parseFloat(e.target.value) : e.target.value })}
                    style={{ ...inputStyle, maxWidth: 260 }}
                    placeholder={f.key === 'lockIpAddress' ? '192.168.68.100' : '5000'}
                  />
                </FieldCard>
              ))}

              {/* Endpoint preview */}
              <div style={{
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border, #2a2d3a)',
                borderRadius: 8,
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.65rem', lineHeight: 1.8,
                color: 'var(--gray, #666)',
              }}>
                <div style={{ color: 'var(--gray-light, #aaa)', marginBottom: 4, fontWeight: 600 }}>📡 Endpoints Ativos</div>
                <div>API Base: <span style={{ color: 'var(--blue, #3b82f6)' }}>{apiBase || '—'}</span></div>
                <div>Unlock: <span style={{ color: '#10b981' }}>
                  POST http://{String(localConfig.lockIpAddress || '…')}/unlock
                </span></div>
                <div style={{ marginTop: 4, color: 'var(--gray, #555)' }}>Versão: SmartX EPI Tablet v1.0</div>
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          padding: '14px 24px',
          borderTop: '1px solid var(--border, #2a2d3a)',
          background: 'rgba(255,255,255,0.01)',
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--border, #2a2d3a)',
              color: 'var(--gray-light, #aaa)',
              borderRadius: 8, padding: '9px 20px',
              fontSize: '0.75rem', fontFamily: 'var(--font-head, monospace)',
              fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em',
            }}
          >CANCELAR</button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: saved ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
              border: `1px solid ${saved ? 'rgba(16,185,129,0.4)' : 'transparent'}`,
              color: '#fff',
              borderRadius: 8, padding: '9px 24px',
              fontSize: '0.75rem', fontFamily: 'var(--font-head, monospace)',
              fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
              letterSpacing: '0.05em', opacity: saving ? 0.7 : 1,
              display: 'flex', alignItems: 'center', gap: 8,
              minWidth: 140, justifyContent: 'center',
              transition: 'all 200ms',
            }}
          >
            {saving
              ? <><Spinner /> SALVANDO…</>
              : saved
                ? '✅ SALVO!'
                : '💾 SALVAR'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function FieldCard({ icon, label, hint, children }: { icon: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{
      padding: '14px 16px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid var(--border, #2a2d3a)',
      borderRadius: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: '1rem' }}>{icon}</span>
        <div>
          <div style={{ fontFamily: 'var(--font-head, monospace)', fontWeight: 700, fontSize: '0.82rem', color: 'var(--white, #fff)' }}>
            {label}
          </div>
          {hint && (
            <div style={{ fontSize: '0.6rem', color: 'var(--gray, #666)', fontFamily: 'var(--font-mono, monospace)', marginTop: 1 }}>
              {hint}
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{
      fontFamily: 'var(--font-head, monospace)',
      fontWeight: 800, fontSize: '0.7rem',
      letterSpacing: '0.08em', textTransform: 'uppercase',
      color: 'var(--gray, #666)',
      paddingBottom: 6,
      borderBottom: '1px solid var(--border, #2a2d3a)',
    }}>
      {label}
    </div>
  );
}

function StatusBadge({ active, activeColor, activeLabel, inactiveLabel }: { active: boolean; activeColor: string; activeLabel: string; inactiveLabel: string }) {
  return (
    <span style={{
      padding: '3px 8px',
      borderRadius: 4,
      fontSize: '0.58rem',
      fontFamily: 'var(--font-head, monospace)',
      fontWeight: 700,
      letterSpacing: '0.05em',
      background: active ? `${activeColor}18` : 'rgba(255,255,255,0.04)',
      border: `1px solid ${active ? `${activeColor}40` : 'rgba(255,255,255,0.08)'}`,
      color: active ? activeColor : 'var(--gray, #666)',
    }}>
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '10px 14px',
      background: 'rgba(59,130,246,0.06)',
      border: '1px solid rgba(59,130,246,0.2)',
      borderRadius: 8,
      fontSize: '0.68rem', color: 'var(--gray-light, #aaa)',
      fontFamily: 'var(--font-mono, monospace)', lineHeight: 1.5,
    }}>
      ℹ️ {children}
    </div>
  );
}

function WarnBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '10px 14px',
      background: 'rgba(251,191,36,0.06)',
      border: '1px solid rgba(251,191,36,0.25)',
      borderRadius: 8,
      fontSize: '0.68rem', color: 'var(--gray-light, #aaa)',
      fontFamily: 'var(--font-mono, monospace)', lineHeight: 1.5,
    }}>
      ⚠️ {children}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 14, height: 14,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--border, #2a2d3a)',
  borderRadius: 8,
  color: 'var(--white, #fff)',
  padding: '8px 12px',
  fontSize: '0.8rem',
  fontFamily: 'var(--font-mono, monospace)',
  outline: 'none',
  width: '100%',
};

const selectStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--border, #2a2d3a)',
  borderRadius: 8,
  color: 'var(--white, #fff)',
  padding: '8px 12px',
  fontSize: '0.8rem',
  fontFamily: 'var(--font-mono, monospace)',
  outline: 'none',
  width: '100%',
  cursor: 'pointer',
};