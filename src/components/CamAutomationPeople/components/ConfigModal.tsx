// src/components/CamAutomationPeople/components/ConfigModal.tsx
// Modal de configuração — ATUALIZADO COM ABA DE CÂMERAS IP
// Tudo vem de configState + cameraHook via useCamAutomation

import { useState } from 'react';
import type { CamRole, CameraHook, SysConfig, ConfigState, CameraSourceType } from '../../../hooks/useCamAutomation';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ConfigModalProps {
  configState: ConfigState;
  cameraHook:  CameraHook;
  apiBase:     string;
  onClose:     () => void;
}

type TabId = 'cameras' | 'cameras_ip' | 'limits' | 'epi' | 'system';

// ─── Constantes ───────────────────────────────────────────────────────────────

const CAM_ROLE_LIST: { role: CamRole; label: string; desc: string }[] = [
  { role: 'face',  label: '👤 Câmera Facial',  desc: 'Frontal / embutida — reconhecimento facial' },
  { role: 'body1', label: '📷 Câmera Corpo 1', desc: 'USB externa — corpo superior (jaqueta, luvas, capacete)' },
  { role: 'body2', label: '📷 Câmera Corpo 2', desc: 'USB externa — corpo inferior (calça, botas) — opcional' },
];

const SYSTEM_FIELDS: { label: string; key: keyof SysConfig; type: 'number' | 'text' }[] = [
  { label: 'ID da Empresa (Company ID)',  key: 'companyId',        type: 'number' },
  { label: 'ID da Zona (Zone ID)',        key: 'zoneId',           type: 'number' },
  { label: 'ID da Porta (Door ID)',       key: 'doorId',           type: 'text'   },
  { label: 'Confiança Mínima Facial (%)', key: 'faceConfidenceMin',type: 'number' },
];

const TABS: { id: TabId; label: string }[] = [
  { id: 'cameras',    label: '📷 Câmeras USB'  },
  { id: 'cameras_ip', label: '🌐 Câmeras IP'   },
  { id: 'limits',     label: '⏱ Permanência'  },
  { id: 'epi',        label: '🦺 EPIs'         },
  { id: 'system',     label: '⚙ Sistema'      },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ConfigModal({ configState, cameraHook, apiBase, onClose }: ConfigModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('cameras');

  const {
    localConfig, setLocalConfig,
    epiConfig,   setEpiConfig,
    saving, saved,
    handleSave,
  } = configState;

  const { devices, assignments, assignDevice, enumerateDevices, sourceTypes, ipUrls, setSourceType, setIpUrl } = cameraHook;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            ⚙ Configurações
          </h2>
          <button onClick={onClose} style={{
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--gray-light)', borderRadius: 8,
            width: 36, height: 36, fontSize: '1rem', cursor: 'pointer',
          }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '12px 24px 0', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                background:   activeTab === t.id ? 'var(--blue)' : 'transparent',
                border:       `1px solid ${activeTab === t.id ? 'var(--blue)' : 'transparent'}`,
                borderBottom: 'none',
                color:        activeTab === t.id ? '#fff' : 'var(--gray-light)',
                borderRadius: '8px 8px 0 0',
                padding: '8px 12px', fontSize: '0.75rem',
                fontFamily: 'var(--font-head)', fontWeight: 600,
                cursor: 'pointer', letterSpacing: '0.04em', marginBottom: -1,
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: 24, minHeight: 280, maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>

          {/* ── CÂMERAS USB ── */}
          {activeTab === 'cameras' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gray-light)', lineHeight: 1.5 }}>
                Atribua cada câmera USB ao seu papel. A câmera facial deve ser a embutida/frontal.
                As câmeras de corpo são as USB externas conectadas via hub.
              </p>

              <button
                onClick={enumerateDevices}
                style={{
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--gray-light)', borderRadius: 8, padding: '8px 16px',
                  fontSize: '0.75rem', fontFamily: 'var(--font-head)',
                  fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start', letterSpacing: '0.04em',
                }}
              >
                ↻ REDETECTAR CÂMERAS ({devices.length} encontradas)
              </button>

              {CAM_ROLE_LIST.map(({ role, label, desc }) => (
                <div key={role}>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--white)', marginBottom: 2 }}>
                    {label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray-light)', marginBottom: 8 }}>
                    {desc}
                  </div>
                  <select
                    value={assignments[role] || ''}
                    onChange={(e) => assignDevice(role, e.target.value)}
                  >
                    <option value="">— Não configurada —</option>
                    {devices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Câmera ${d.deviceId.slice(0, 8)}…`}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* ── CÂMERAS IP ── */}
          {activeTab === 'cameras_ip' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Single Camera Mode */}
              <div style={{ 
                padding: '12px 16px', 
                background: 'rgba(59, 130, 246, 0.1)', 
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: 8 
              }}>
                <label style={{ display: 'flex', alignItems: 'start', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={localConfig.useSingleCamera}
                    onChange={(e) => setLocalConfig({ ...localConfig, useSingleCamera: e.target.checked })}
                    style={{ marginTop: 2, width: 18, height: 18 }}
                  />
                  <div>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--blue)' }}>
                      ✅ Usar Mesma Câmera para Face e EPI
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray-light)', marginTop: 4 }}>
                      Recomendado quando há apenas uma câmera. A câmera Face será usada tanto para reconhecimento facial quanto para detecção de EPI.
                    </div>
                  </div>
                </label>
              </div>

              {/* Configuração de cada câmera */}
              {CAM_ROLE_LIST.map(({ role, label }) => {
                // Se single camera mode, só mostra Face
                if (localConfig.useSingleCamera && role !== 'face') return null;

                const sourceType = sourceTypes[role];
                const isLocal = sourceType === 'local';

                return (
                  <div key={role} style={{ 
                    padding: 16, 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border)',
                    borderRadius: 8 
                  }}>
                    
                    {/* Header */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: 12 
                    }}>
                      <div style={{ 
                        fontFamily: 'var(--font-head)', 
                        fontWeight: 700, 
                        fontSize: '0.9rem', 
                        color: 'var(--white)' 
                      }}>
                        {label}
                      </div>
                      
                      {/* Tipo de Câmera */}
                      <select
                        value={sourceType}
                        onChange={(e) => setSourceType(role, e.target.value as CameraSourceType)}
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        <option value="local">📹 Local (USB)</option>
                        <option value="ip_url">🌐 IP (URL)</option>
                      </select>
                    </div>

                    {/* Config Local */}
                    {isLocal && (
                      <div>
                        <div style={{ 
                          fontFamily: 'var(--font-mono)', 
                          fontSize: '0.65rem', 
                          color: 'var(--gray-light)',
                          marginBottom: 6 
                        }}>
                          Dispositivo USB:
                        </div>
                        <select
                          value={assignments[role] || ''}
                          onChange={(e) => assignDevice(role, e.target.value)}
                        >
                          <option value="">— Selecione —</option>
                          {devices.map((d) => (
                            <option key={d.deviceId} value={d.deviceId}>
                              {d.label || `Câmera ${d.deviceId.slice(0, 8)}…`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Config IP */}
                    {!isLocal && (
                      <div>
                        <div style={{ 
                          fontFamily: 'var(--font-mono)', 
                          fontSize: '0.65rem', 
                          color: 'var(--gray-light)',
                          marginBottom: 6 
                        }}>
                          URL da Câmera IP:
                        </div>
                        <input
                          type="text"
                          placeholder="http://admin:senha@192.168.1.100:8070/snapshot.cgi"
                          value={ipUrls[role] || ''}
                          onChange={(e) => setIpUrl(role, e.target.value)}
                          style={{ 
                            width: '100%',
                            fontFamily: 'var(--font-mono)', 
                            fontSize: '0.75rem' 
                          }}
                        />
                        <div style={{ 
                          fontFamily: 'var(--font-mono)', 
                          fontSize: '0.6rem', 
                          color: 'var(--gray)',
                          marginTop: 6 
                        }}>
                          💡 Exemplo: http://usuario:senha@177.62.189.25:8070/cgi-bin/snapshot.cgi?channel=1
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Avisos */}
              <div style={{
                padding: '10px 14px',
                background: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: 8,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: 'var(--gray-light)',
                lineHeight: 1.5
              }}>
                ⚠️ <strong>Câmeras IP:</strong> Se houver erro de CORS, configure o backend para fazer proxy das requisições de imagem.
              </div>
            </div>
          )}

          {/* ── PERMANÊNCIA ── */}
          {activeTab === 'limits' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <div>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--white)', marginBottom: 8 }}>
                  Limite Diário (minutos)
                </div>
                <input
                  type="number" min={30} max={480}
                  value={localConfig.dailyLimitMin || 120}
                  onChange={(e) => setLocalConfig({ ...localConfig, dailyLimitMin: parseInt(e.target.value) })}
                  style={{ maxWidth: 160 }}
                />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray-light)', marginTop: 4 }}>
                  Mínimo: 30 min · Máximo: 480 min (8h)
                </div>
              </div>

              <div>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--white)', marginBottom: 10 }}>
                  Política ao Exceder
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { id: 'warn',  label: '⚠ Avisar e liberar', color: 'var(--amber)', desc: 'Exibe alerta mas permite acesso' },
                    { id: 'block', label: '🚫 Bloquear acesso',  color: 'var(--red)',   desc: 'Nega entrada, requer supervisor' },
                  ].map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setLocalConfig({ ...localConfig, overLimitPolicy: p.id as 'warn' | 'block' })}
                      style={{
                        flex: 1, padding: '14px 16px', cursor: 'pointer',
                        border: `2px solid ${localConfig.overLimitPolicy === p.id ? p.color : 'var(--border)'}`,
                        borderRadius: 'var(--radius)',
                        background: localConfig.overLimitPolicy === p.id ? `${p.color}15` : 'transparent',
                        transition: 'all 200ms',
                      }}
                    >
                      <div style={{
                        fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', marginBottom: 4,
                        color: localConfig.overLimitPolicy === p.id ? p.color : 'var(--gray-light)',
                      }}>
                        {p.label}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray)' }}>
                        {p.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--white)', marginBottom: 8 }}>
                  Tempo Máximo de Porta Aberta (min)
                </div>
                <input
                  type="number" min={1} max={60}
                  value={localConfig.doorOpenMaxMin || 15}
                  onChange={(e) => setLocalConfig({ ...localConfig, doorOpenMaxMin: parseInt(e.target.value) })}
                  style={{ maxWidth: 120 }}
                />
              </div>
            </div>
          )}

          {/* ── EPI ── */}
          {activeTab === 'epi' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gray-light)' }}>
                EPIs obrigatórios para acesso à câmara fria. Configure no SmartX HUB.
              </p>

              {!epiConfig ? (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--gray)' }}>
                  Carregando configuração de EPIs…
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(epiConfig.available_classes || Object.keys(epiConfig.config || {})).map((cls) => {
                    const isRequired = epiConfig.required_ppe.includes(cls);
                    return (
                      <div
                        key={cls}
                        onClick={() =>
                          setEpiConfig({
                            ...epiConfig,
                            required_ppe: isRequired
                              ? epiConfig.required_ppe.filter((c) => c !== cls)
                              : [...epiConfig.required_ppe, cls],
                          })
                        }
                        style={{
                          padding: '8px 14px', cursor: 'pointer',
                          border: `1px solid ${isRequired ? 'var(--green)' : 'var(--border)'}`,
                          borderRadius: 'var(--radius-sm)',
                          background: isRequired ? 'rgba(0,230,118,0.08)' : 'transparent',
                          fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.8rem',
                          color: isRequired ? 'var(--green)' : 'var(--gray-light)',
                          transition: 'all 200ms',
                        }}
                      >
                        {isRequired ? '✓ ' : ''}{cls}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── SYSTEM ── */}
          {activeTab === 'system' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {SYSTEM_FIELDS.map((f) => (
                <div key={f.key}>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--white)', marginBottom: 6 }}>
                    {f.label}
                  </div>
                  <input
                    type={f.type}
                    value={String(localConfig[f.key] ?? '')}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        [f.key]: f.type === 'number' ? parseFloat(e.target.value) : e.target.value,
                      })
                    }
                    style={{ maxWidth: 280 }}
                  />
                </div>
              ))}
              <div style={{
                marginTop: 8, padding: '12px 14px',
                background: 'var(--bg-card)', borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                color: 'var(--gray-light)', lineHeight: 1.6,
              }}>
                API Base: {apiBase || '—'}<br />
                Versão: SmartX EPI Tablet v1.0
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          padding: '16px 24px', borderTop: '1px solid var(--border)',
        }}>
          <button className="btn-ghost" onClick={onClose}>CANCELAR</button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ minWidth: 140 }}
          >
            {saving
              ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Salvando…</>
              : saved ? '✅ Salvo!' : '💾 SALVAR'}
          </button>
        </div>

      </div>
    </div>
  );
}