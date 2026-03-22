// // // src/components/CamAutomationPeople/components/ConfigModal.tsx
// // // Modal de configuração — MELHORADO

// // import { useState } from 'react';
// // import type { CamRole, CameraHook, SysConfig, ConfigState, CameraSourceType } from '../../../hooks/useCamAutomation';

// // interface ConfigModalProps {
// //   configState: ConfigState;
// //   cameraHook:  CameraHook;
// //   apiBase:     string;
// //   onClose:     () => void;
// // }

// // type TabId = 'cameras' | 'cameras_ip' | 'limits' | 'epi' | 'system';

// // const CAM_ROLE_LIST: { role: CamRole; label: string; desc: string; icon: string }[] = [
// //   { role: 'face',  label: 'Câmera Facial',  icon: '👤', desc: 'Frontal / embutida — reconhecimento facial' },
// //   { role: 'body1', label: 'Câmera Corpo 1', icon: '📷', desc: 'USB externa — corpo superior (jaqueta, luvas, capacete)' },
// //   { role: 'body2', label: 'Câmera Corpo 2', icon: '📷', desc: 'USB externa — corpo inferior (calça, botas) — opcional' },
// // ];

// // const SYSTEM_FIELDS: { label: string; key: keyof SysConfig; type: 'number' | 'text'; icon: string; hint?: string }[] = [
// //   { label: 'Company ID',          key: 'companyId',        type: 'number', icon: '🏢', hint: 'ID da empresa no sistema' },
// //   { label: 'Zone ID',             key: 'zoneId',           type: 'number', icon: '📍', hint: 'ID da zona de acesso' },
// //   { label: 'Door ID',             key: 'doorId',           type: 'text',   icon: '🚪', hint: 'Identificador da porta' },
// //   { label: 'Confiança Facial (%)',key: 'faceConfidenceMin',type: 'number', icon: '🎯', hint: 'Mínimo para reconhecimento (0–1)' },
// //   { label: 'IP da Fechadura',     key: 'lockIpAddress',    type: 'text',   icon: '🔒', hint: 'Ex: 192.168.68.100' },
// //   { label: 'Duração Unlock (ms)', key: 'lockDurationMs',   type: 'number', icon: '⏱', hint: 'Tempo que a fechadura fica aberta' },
// // ];

// // const EPI_ICONS: Record<string, string> = {
// //   thermal_coat:  '🧥',
// //   thermal_pants: '👖',
// //   gloves:        '🧤',
// //   helmet:        '⛑️',
// //   boots:         '👢',
// //   person:        '🧍',
// // };

// // const EPI_LABELS: Record<string, string> = {
// //   thermal_coat:  'Jaqueta Térmica',
// //   thermal_pants: 'Calça Térmica',
// //   gloves:        'Luvas',
// //   helmet:        'Capacete',
// //   boots:         'Botas',
// //   person:        'Pessoa',
// // };

// // const TABS: { id: TabId; label: string; icon: string }[] = [
// //   { id: 'cameras',    label: 'Câmeras USB', icon: '📷' },
// //   { id: 'cameras_ip', label: 'Câmeras IP',  icon: '🌐' },
// //   { id: 'limits',     label: 'Permanência', icon: '⏱' },
// //   { id: 'epi',        label: 'EPIs',        icon: '🦺' },
// //   { id: 'system',     label: 'Sistema',     icon: '⚙' },
// // ];

// // export default function ConfigModal({ configState, cameraHook, apiBase, onClose }: ConfigModalProps) {
// //   const [activeTab, setActiveTab] = useState<TabId>('system');

// //   const {
// //     localConfig, setLocalConfig,
// //     //@ts-ignore
// //     epiConfig,   
// //     //@ts-ignore
// //     setEpiConfig,
// //     saving, saved,
// //     handleSave,
// //   } = configState;

// //   const { devices, assignments, assignDevice, enumerateDevices, sourceTypes, ipUrls, setSourceType, setIpUrl } = cameraHook;

// //   // ─── EPI data from API (banco) ───────────────────────────────────────────
// //   // epiConfig.config = { thermal_coat: { enabled: true, required: true, ... }, ... }
// //   const epiEntries = epiConfig?.config
// //     ? Object.entries(epiConfig.config as Record<string, { enabled: boolean; required: boolean; display_name?: string }>)
// //         .filter(([cls]) => cls !== 'person')
// //     : [];

// //   return (
// //     <div
// //       onClick={(e) => e.target === e.currentTarget && onClose()}
// //       style={{
// //         position: 'fixed', inset: 0, zIndex: 1000,
// //         background: 'rgba(0,0,0,0.75)',
// //         backdropFilter: 'blur(6px)',
// //         display: 'flex', alignItems: 'center', justifyContent: 'center',
// //         padding: 16,
// //       }}
// //     >
// //       <div style={{
// //         background: 'var(--bg-card, #0f1117)',
// //         border: '1px solid var(--border, #2a2d3a)',
// //         borderRadius: 16,
// //         width: '100%', maxWidth: 560,
// //         maxHeight: '90vh',
// //         display: 'flex', flexDirection: 'column',
// //         boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
// //         overflow: 'hidden',
// //       }}>

// //         {/* ── Header ── */}
// //         <div style={{
// //           display: 'flex', alignItems: 'center', justifyContent: 'space-between',
// //           padding: '18px 24px',
// //           borderBottom: '1px solid var(--border, #2a2d3a)',
// //           background: 'rgba(255,255,255,0.02)',
// //         }}>
// //           <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
// //             <div style={{
// //               width: 34, height: 34,
// //               background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
// //               borderRadius: 8,
// //               display: 'flex', alignItems: 'center', justifyContent: 'center',
// //               fontSize: '1rem',
// //             }}>⚙</div>
// //             <div>
// //               <div style={{
// //                 fontFamily: 'var(--font-head, monospace)',
// //                 fontSize: '1rem', fontWeight: 800,
// //                 letterSpacing: '0.06em', textTransform: 'uppercase',
// //                 color: 'var(--white, #fff)',
// //               }}>Configurações</div>
// //               <div style={{ fontSize: '0.65rem', color: 'var(--gray, #666)', fontFamily: 'var(--font-mono, monospace)' }}>
// //                 SmartX EPI System
// //               </div>
// //             </div>
// //           </div>
// //           <button
// //             onClick={onClose}
// //             style={{
// //               background: 'transparent',
// //               border: '1px solid var(--border, #2a2d3a)',
// //               color: 'var(--gray-light, #aaa)',
// //               borderRadius: 8, width: 34, height: 34,
// //               fontSize: '0.9rem', cursor: 'pointer',
// //               display: 'flex', alignItems: 'center', justifyContent: 'center',
// //               transition: 'all 150ms',
// //             }}
// //             onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
// //             onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
// //           >✕</button>
// //         </div>

// //         {/* ── Tabs ── */}
// //         <div style={{
// //           display: 'flex',
// //           padding: '0 24px',
// //           borderBottom: '1px solid var(--border, #2a2d3a)',
// //           background: 'rgba(255,255,255,0.01)',
// //           overflowX: 'auto',
// //           gap: 2,
// //         }}>
// //           {TABS.map((t) => {
// //             const isActive = activeTab === t.id;
// //             return (
// //               <button
// //                 key={t.id}
// //                 onClick={() => setActiveTab(t.id)}
// //                 style={{
// //                   background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
// //                   border: 'none',
// //                   borderBottom: `2px solid ${isActive ? 'var(--blue, #3b82f6)' : 'transparent'}`,
// //                   color: isActive ? 'var(--blue, #3b82f6)' : 'var(--gray, #666)',
// //                   padding: '12px 14px',
// //                   fontSize: '0.7rem',
// //                   fontFamily: 'var(--font-head, monospace)',
// //                   fontWeight: 700,
// //                   cursor: 'pointer',
// //                   letterSpacing: '0.05em',
// //                   whiteSpace: 'nowrap',
// //                   transition: 'all 150ms',
// //                   display: 'flex', alignItems: 'center', gap: 5,
// //                 }}
// //               >
// //                 <span>{t.icon}</span>
// //                 <span>{t.label.toUpperCase()}</span>
// //               </button>
// //             );
// //           })}
// //         </div>

// //         {/* ── Content ── */}
// //         <div style={{
// //           flex: 1, overflowY: 'auto', padding: 24,
// //           display: 'flex', flexDirection: 'column', gap: 16,
// //         }}>

// //           {/* ── CÂMERAS USB ── */}
// //           {activeTab === 'cameras' && (
// //             <>
// //               <InfoBox>
// //                 Atribua cada câmera USB ao seu papel. A câmera facial deve ser a embutida/frontal.
// //               </InfoBox>
// //               <button
// //                 onClick={enumerateDevices}
// //                 style={{
// //                   alignSelf: 'flex-start',
// //                   background: 'rgba(59,130,246,0.1)',
// //                   border: '1px solid rgba(59,130,246,0.3)',
// //                   color: 'var(--blue, #3b82f6)',
// //                   borderRadius: 8, padding: '8px 14px',
// //                   fontSize: '0.7rem', fontFamily: 'var(--font-head, monospace)',
// //                   fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em',
// //                 }}
// //               >
// //                 ↻ REDETECTAR  ({devices.length} encontradas)
// //               </button>
// //               {CAM_ROLE_LIST.map(({ role, label, icon, desc }) => (
// //                 <FieldCard key={role} icon={icon} label={label} hint={desc}>
// //                   <select
// //                     value={assignments[role] || ''}
// //                     onChange={(e) => assignDevice(role, e.target.value)}
// //                     style={selectStyle}
// //                   >
// //                     <option value="">— Não configurada —</option>
// //                     {devices.map((d) => (
// //                       <option key={d.deviceId} value={d.deviceId}>
// //                         {d.label || `Câmera ${d.deviceId.slice(0, 8)}…`}
// //                       </option>
// //                     ))}
// //                   </select>
// //                 </FieldCard>
// //               ))}
// //             </>
// //           )}

// //           {/* ── CÂMERAS IP ── */}
// //           {activeTab === 'cameras_ip' && (
// //             <>
// //               {/* Single Camera Toggle */}
// //               <div
// //                 onClick={() => setLocalConfig({ ...localConfig, useSingleCamera: !localConfig.useSingleCamera })}
// //                 style={{
// //                   display: 'flex', alignItems: 'center', gap: 14,
// //                   padding: '14px 16px', cursor: 'pointer',
// //                   background: localConfig.useSingleCamera ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.02)',
// //                   border: `1px solid ${localConfig.useSingleCamera ? 'rgba(59,130,246,0.4)' : 'var(--border, #2a2d3a)'}`,
// //                   borderRadius: 10, transition: 'all 200ms',
// //                 }}
// //               >
// //                 <div style={{
// //                   width: 20, height: 20, borderRadius: 4,
// //                   background: localConfig.useSingleCamera ? 'var(--blue, #3b82f6)' : 'transparent',
// //                   border: `2px solid ${localConfig.useSingleCamera ? 'var(--blue, #3b82f6)' : 'var(--gray, #666)'}`,
// //                   display: 'flex', alignItems: 'center', justifyContent: 'center',
// //                   fontSize: '0.7rem', color: '#fff', flexShrink: 0,
// //                   transition: 'all 200ms',
// //                 }}>
// //                   {localConfig.useSingleCamera && '✓'}
// //                 </div>
// //                 <div>
// //                   <div style={{ fontFamily: 'var(--font-head, monospace)', fontWeight: 700, fontSize: '0.85rem', color: localConfig.useSingleCamera ? 'var(--blue, #3b82f6)' : 'var(--white, #fff)' }}>
// //                     Usar mesma câmera para Face e EPI
// //                   </div>
// //                   <div style={{ fontSize: '0.65rem', color: 'var(--gray, #666)', fontFamily: 'var(--font-mono, monospace)', marginTop: 2 }}>
// //                     Recomendado quando há apenas uma câmera disponível
// //                   </div>
// //                 </div>
// //               </div>

// //               {CAM_ROLE_LIST.map(({ role, label, icon }) => {
// //                 if (localConfig.useSingleCamera && role !== 'face') return null;
// //                 const sourceType = sourceTypes[role];
// //                 const isLocal = sourceType === 'local';
// //                 return (
// //                   <div key={role} style={{
// //                     padding: 16,
// //                     background: 'rgba(255,255,255,0.02)',
// //                     border: '1px solid var(--border, #2a2d3a)',
// //                     borderRadius: 10,
// //                   }}>
// //                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
// //                       <div style={{ fontFamily: 'var(--font-head, monospace)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--white, #fff)' }}>
// //                         {icon} {label}
// //                       </div>
// //                       <select
// //                         value={sourceType}
// //                         onChange={(e) => setSourceType(role, e.target.value as CameraSourceType)}
// //                         style={{ ...selectStyle, width: 'auto', padding: '5px 10px', fontSize: '0.7rem' }}
// //                       >
// //                         <option value="local">📹 Local (USB)</option>
// //                         <option value="ip_url">🌐 IP (URL)</option>
// //                       </select>
// //                     </div>
// //                     {isLocal ? (
// //                       <select value={assignments[role] || ''} onChange={(e) => assignDevice(role, e.target.value)} style={selectStyle}>
// //                         <option value="">— Selecione —</option>
// //                         {devices.map((d) => (
// //                           <option key={d.deviceId} value={d.deviceId}>
// //                             {d.label || `Câmera ${d.deviceId.slice(0, 8)}…`}
// //                           </option>
// //                         ))}
// //                       </select>
// //                     ) : (
// //                       <>
// //                         <input
// //                           type="text"
// //                           placeholder="http://admin:senha@192.168.1.100:8070/snapshot.cgi"
// //                           value={ipUrls[role] || ''}
// //                           onChange={(e) => setIpUrl(role, e.target.value)}
// //                           style={{ ...inputStyle, width: '100%' }}
// //                         />
// //                         <div style={{ fontSize: '0.6rem', color: 'var(--gray, #666)', fontFamily: 'var(--font-mono, monospace)', marginTop: 6 }}>
// //                           💡 Ex: http://admin:mixhub123@177.139.51.174:8056/cgi-bin/snapshot.cgi?channel=1
// //                         </div>
// //                       </>
// //                     )}
// //                   </div>
// //                 );
// //               })}

// //               <WarnBox>
// //                 Se houver erro de CORS, o backend faz proxy via <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 4px', borderRadius: 3 }}>/api/v1/epi/camera/snapshot</code>
// //               </WarnBox>
// //             </>
// //           )}

// //           {/* ── PERMANÊNCIA ── */}
// //           {activeTab === 'limits' && (
// //             <>
// //               <FieldCard icon="⏰" label="Limite Diário" hint="Tempo máximo de permanência por dia (minutos)">
// //                 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
// //                   <input
// //                     type="number" min={30} max={480}
// //                     value={localConfig.dailyLimitMin || 120}
// //                     onChange={(e) => setLocalConfig({ ...localConfig, dailyLimitMin: parseInt(e.target.value) })}
// //                     style={{ ...inputStyle, maxWidth: 120 }}
// //                   />
// //                   <span style={{ fontSize: '0.75rem', color: 'var(--gray, #666)', fontFamily: 'var(--font-mono, monospace)' }}>minutos</span>
// //                 </div>
// //                 <div style={{ fontSize: '0.6rem', color: 'var(--gray, #666)', fontFamily: 'var(--font-mono, monospace)', marginTop: 4 }}>
// //                   Min: 30 · Max: 480 min (8h)
// //                 </div>
// //               </FieldCard>

// //               <div>
// //                 <div style={{ fontFamily: 'var(--font-head, monospace)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--white, #fff)', marginBottom: 10 }}>
// //                   ⚡ Política ao Exceder
// //                 </div>
// //                 <div style={{ display: 'flex', gap: 10 }}>
// //                   {[
// //                     { id: 'warn',  label: 'Avisar e Liberar', icon: '⚠️', color: '#f59e0b', desc: 'Exibe alerta mas permite acesso' },
// //                     { id: 'block', label: 'Bloquear Acesso',  icon: '🚫', color: '#ef4444', desc: 'Nega entrada, requer supervisor' },
// //                   ].map((p) => {
// //                     const isActive = localConfig.overLimitPolicy === p.id;
// //                     return (
// //                       <div
// //                         key={p.id}
// //                         onClick={() => setLocalConfig({ ...localConfig, overLimitPolicy: p.id as 'warn' | 'block' })}
// //                         style={{
// //                           flex: 1, padding: '14px 16px', cursor: 'pointer', borderRadius: 10,
// //                           border: `2px solid ${isActive ? p.color : 'var(--border, #2a2d3a)'}`,
// //                           background: isActive ? `${p.color}12` : 'rgba(255,255,255,0.02)',
// //                           transition: 'all 200ms',
// //                         }}
// //                       >
// //                         <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{p.icon}</div>
// //                         <div style={{ fontFamily: 'var(--font-head, monospace)', fontWeight: 700, fontSize: '0.8rem', color: isActive ? p.color : 'var(--gray-light, #aaa)', marginBottom: 4 }}>
// //                           {p.label}
// //                         </div>
// //                         <div style={{ fontSize: '0.65rem', color: 'var(--gray, #666)', fontFamily: 'var(--font-mono, monospace)' }}>
// //                           {p.desc}
// //                         </div>
// //                       </div>
// //                     );
// //                   })}
// //                 </div>
// //               </div>

// //               <FieldCard icon="🚪" label="Tempo máx. porta aberta" hint="Máximo de minutos que a porta pode ficar aberta">
// //                 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
// //                   <input
// //                     type="number" min={1} max={60}
// //                     value={localConfig.doorOpenMaxMin || 15}
// //                     onChange={(e) => setLocalConfig({ ...localConfig, doorOpenMaxMin: parseInt(e.target.value) })}
// //                     style={{ ...inputStyle, maxWidth: 100 }}
// //                   />
// //                   <span style={{ fontSize: '0.75rem', color: 'var(--gray, #666)', fontFamily: 'var(--font-mono, monospace)' }}>minutos</span>
// //                 </div>
// //               </FieldCard>
// //             </>
// //           )}

// //           {/* ── EPI ── */}
// //           {activeTab === 'epi' && (
// //             <>
// //               <InfoBox>
// //                 Configuração lida do banco de dados. Gerencie via SmartX HUB → Configurações → EPI.
// //               </InfoBox>

// //               {!epiConfig ? (
// //                 <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px', color: 'var(--gray, #666)', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem' }}>
// //                   <div style={{ width: 16, height: 16, border: '2px solid var(--blue, #3b82f6)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
// //                   Carregando configuração de EPIs…
// //                 </div>
// //               ) : epiEntries.length === 0 ? (
// //                 <WarnBox>Nenhum EPI configurado no banco.</WarnBox>
// //               ) : (
// //                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
// //                   {epiEntries.map(([cls, cfg]) => {
// //                     const icon = EPI_ICONS[cls] || '🔲';
// //                     const label = EPI_LABELS[cls] || cls;
// //                     const enabled = cfg.enabled;
// //                     const required = cfg.required;

// //                     return (
// //                       <div key={cls} style={{
// //                         display: 'flex', alignItems: 'center', justifyContent: 'space-between',
// //                         padding: '12px 16px',
// //                         background: enabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
// //                         border: `1px solid ${enabled ? 'var(--border, #2a2d3a)' : 'rgba(255,255,255,0.05)'}`,
// //                         borderRadius: 10,
// //                         opacity: enabled ? 1 : 0.5,
// //                         transition: 'all 200ms',
// //                       }}>
// //                         {/* Left */}
// //                         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
// //                           <div style={{
// //                             width: 38, height: 38,
// //                             background: enabled ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)',
// //                             borderRadius: 8,
// //                             display: 'flex', alignItems: 'center', justifyContent: 'center',
// //                             fontSize: '1.2rem',
// //                           }}>{icon}</div>
// //                           <div>
// //                             <div style={{ fontFamily: 'var(--font-head, monospace)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--white, #fff)' }}>
// //                               {label}
// //                             </div>
// //                             <div style={{ fontSize: '0.6rem', color: 'var(--gray, #666)', fontFamily: 'var(--font-mono, monospace)', marginTop: 2 }}>
// //                               {cls}
// //                             </div>
// //                           </div>
// //                         </div>

// //                         {/* Right — badges */}
// //                         <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
// //                           <StatusBadge active={enabled} activeColor="#3b82f6" activeLabel="HABILITADO" inactiveLabel="DESATIVADO" />
// //                           {enabled && <StatusBadge active={required} activeColor="#ef4444" activeLabel="OBRIGATÓRIO" inactiveLabel="OPCIONAL" />}
// //                         </div>
// //                       </div>
// //                     );
// //                   })}

// //                   <div style={{
// //                     marginTop: 8, padding: '10px 14px',
// //                     background: 'rgba(59,130,246,0.06)',
// //                     border: '1px solid rgba(59,130,246,0.2)',
// //                     borderRadius: 8,
// //                     fontSize: '0.65rem', color: 'var(--gray, #666)',
// //                     fontFamily: 'var(--font-mono, monospace)', lineHeight: 1.6,
// //                   }}>
// //                     💡 Para alterar, acesse <strong style={{ color: 'var(--blue, #3b82f6)' }}>SmartX HUB → EPI → Configurações</strong> e salve. As alterações são aplicadas automaticamente na próxima validação.
// //                   </div>
// //                 </div>
// //               )}
// //             </>
// //           )}

// //           {/* ── SYSTEM ── */}
// //           {activeTab === 'system' && (
// //             <>
// //               {/* Seção API / Acesso */}
// //               <SectionLabel label="🔧 Identificação do Sistema" />
// //               {SYSTEM_FIELDS.slice(0, 4).map((f) => (
// //                 <FieldCard key={f.key} icon={f.icon} label={f.label} hint={f.hint}>
// //                   <input
// //                     type={f.type}
// //                     value={String(localConfig[f.key] ?? '')}
// //                     onChange={(e) => setLocalConfig({ ...localConfig, [f.key]: f.type === 'number' ? parseFloat(e.target.value) : e.target.value })}
// //                     style={{ ...inputStyle, maxWidth: 260 }}
// //                   />
// //                 </FieldCard>
// //               ))}

// //               {/* Divisor */}
// //               <div style={{ margin: '4px 0' }}>
// //                 <SectionLabel label="🔒 Fechadura ESP32 (MIXHUB)" />
// //               </div>

// //               {/* Lock fields */}
// //               {SYSTEM_FIELDS.slice(4).map((f) => (
// //                 <FieldCard key={f.key} icon={f.icon} label={f.label} hint={f.hint}>
// //                   <input
// //                     type={f.type}
// //                     value={String(localConfig[f.key] ?? '')}
// //                     onChange={(e) => setLocalConfig({ ...localConfig, [f.key]: f.type === 'number' ? parseFloat(e.target.value) : e.target.value })}
// //                     style={{ ...inputStyle, maxWidth: 260 }}
// //                     placeholder={f.key === 'lockIpAddress' ? '192.168.68.100' : '5000'}
// //                   />
// //                 </FieldCard>
// //               ))}

// //               {/* Endpoint preview */}
// //               <div style={{
// //                 padding: '12px 14px',
// //                 background: 'rgba(255,255,255,0.02)',
// //                 border: '1px solid var(--border, #2a2d3a)',
// //                 borderRadius: 8,
// //                 fontFamily: 'var(--font-mono, monospace)',
// //                 fontSize: '0.65rem', lineHeight: 1.8,
// //                 color: 'var(--gray, #666)',
// //               }}>
// //                 <div style={{ color: 'var(--gray-light, #aaa)', marginBottom: 4, fontWeight: 600 }}>📡 Endpoints Ativos</div>
// //                 <div>API Base: <span style={{ color: 'var(--blue, #3b82f6)' }}>{apiBase || '—'}</span></div>
// //                 <div>Unlock: <span style={{ color: '#10b981' }}>
// //                   POST http://{String(localConfig.lockIpAddress || '…')}/unlock
// //                 </span></div>
// //                 <div style={{ marginTop: 4, color: 'var(--gray, #555)' }}>Versão: SmartX EPI Tablet v1.0</div>
// //               </div>
// //             </>
// //           )}
// //         </div>

// //         {/* ── Footer ── */}
// //         <div style={{
// //           display: 'flex', justifyContent: 'flex-end', gap: 10,
// //           padding: '14px 24px',
// //           borderTop: '1px solid var(--border, #2a2d3a)',
// //           background: 'rgba(255,255,255,0.01)',
// //         }}>
// //           <button
// //             onClick={onClose}
// //             style={{
// //               background: 'transparent',
// //               border: '1px solid var(--border, #2a2d3a)',
// //               color: 'var(--gray-light, #aaa)',
// //               borderRadius: 8, padding: '9px 20px',
// //               fontSize: '0.75rem', fontFamily: 'var(--font-head, monospace)',
// //               fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em',
// //             }}
// //           >CANCELAR</button>
// //           <button
// //             onClick={handleSave}
// //             disabled={saving}
// //             style={{
// //               background: saved ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
// //               border: `1px solid ${saved ? 'rgba(16,185,129,0.4)' : 'transparent'}`,
// //               color: '#fff',
// //               borderRadius: 8, padding: '9px 24px',
// //               fontSize: '0.75rem', fontFamily: 'var(--font-head, monospace)',
// //               fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
// //               letterSpacing: '0.05em', opacity: saving ? 0.7 : 1,
// //               display: 'flex', alignItems: 'center', gap: 8,
// //               minWidth: 140, justifyContent: 'center',
// //               transition: 'all 200ms',
// //             }}
// //           >
// //             {saving
// //               ? <><Spinner /> SALVANDO…</>
// //               : saved
// //                 ? '✅ SALVO!'
// //                 : '💾 SALVAR'}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ─── Sub-componentes ──────────────────────────────────────────────────────────

// // function FieldCard({ icon, label, hint, children }: { icon: string; label: string; hint?: string; children: React.ReactNode }) {
// //   return (
// //     <div style={{
// //       padding: '14px 16px',
// //       background: 'rgba(255,255,255,0.02)',
// //       border: '1px solid var(--border, #2a2d3a)',
// //       borderRadius: 10,
// //     }}>
// //       <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
// //         <span style={{ fontSize: '1rem' }}>{icon}</span>
// //         <div>
// //           <div style={{ fontFamily: 'var(--font-head, monospace)', fontWeight: 700, fontSize: '0.82rem', color: 'var(--white, #fff)' }}>
// //             {label}
// //           </div>
// //           {hint && (
// //             <div style={{ fontSize: '0.6rem', color: 'var(--gray, #666)', fontFamily: 'var(--font-mono, monospace)', marginTop: 1 }}>
// //               {hint}
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //       {children}
// //     </div>
// //   );
// // }

// // function SectionLabel({ label }: { label: string }) {
// //   return (
// //     <div style={{
// //       fontFamily: 'var(--font-head, monospace)',
// //       fontWeight: 800, fontSize: '0.7rem',
// //       letterSpacing: '0.08em', textTransform: 'uppercase',
// //       color: 'var(--gray, #666)',
// //       paddingBottom: 6,
// //       borderBottom: '1px solid var(--border, #2a2d3a)',
// //     }}>
// //       {label}
// //     </div>
// //   );
// // }

// // function StatusBadge({ active, activeColor, activeLabel, inactiveLabel }: { active: boolean; activeColor: string; activeLabel: string; inactiveLabel: string }) {
// //   return (
// //     <span style={{
// //       padding: '3px 8px',
// //       borderRadius: 4,
// //       fontSize: '0.58rem',
// //       fontFamily: 'var(--font-head, monospace)',
// //       fontWeight: 700,
// //       letterSpacing: '0.05em',
// //       background: active ? `${activeColor}18` : 'rgba(255,255,255,0.04)',
// //       border: `1px solid ${active ? `${activeColor}40` : 'rgba(255,255,255,0.08)'}`,
// //       color: active ? activeColor : 'var(--gray, #666)',
// //     }}>
// //       {active ? activeLabel : inactiveLabel}
// //     </span>
// //   );
// // }

// // function InfoBox({ children }: { children: React.ReactNode }) {
// //   return (
// //     <div style={{
// //       padding: '10px 14px',
// //       background: 'rgba(59,130,246,0.06)',
// //       border: '1px solid rgba(59,130,246,0.2)',
// //       borderRadius: 8,
// //       fontSize: '0.68rem', color: 'var(--gray-light, #aaa)',
// //       fontFamily: 'var(--font-mono, monospace)', lineHeight: 1.5,
// //     }}>
// //       ℹ️ {children}
// //     </div>
// //   );
// // }

// // function WarnBox({ children }: { children: React.ReactNode }) {
// //   return (
// //     <div style={{
// //       padding: '10px 14px',
// //       background: 'rgba(251,191,36,0.06)',
// //       border: '1px solid rgba(251,191,36,0.25)',
// //       borderRadius: 8,
// //       fontSize: '0.68rem', color: 'var(--gray-light, #aaa)',
// //       fontFamily: 'var(--font-mono, monospace)', lineHeight: 1.5,
// //     }}>
// //       ⚠️ {children}
// //     </div>
// //   );
// // }

// // function Spinner() {
// //   return (
// //     <div style={{
// //       width: 14, height: 14,
// //       border: '2px solid rgba(255,255,255,0.3)',
// //       borderTopColor: '#fff',
// //       borderRadius: '50%',
// //       animation: 'spin 0.7s linear infinite',
// //     }} />
// //   );
// // }

// // // ─── Shared styles ────────────────────────────────────────────────────────────

// // const inputStyle: React.CSSProperties = {
// //   background: 'rgba(255,255,255,0.04)',
// //   border: '1px solid var(--border, #2a2d3a)',
// //   borderRadius: 8,
// //   color: 'var(--white, #fff)',
// //   padding: '8px 12px',
// //   fontSize: '0.8rem',
// //   fontFamily: 'var(--font-mono, monospace)',
// //   outline: 'none',
// //   width: '100%',
// // };

// // const selectStyle: React.CSSProperties = {
// //   background: 'rgba(255,255,255,0.04)',
// //   border: '1px solid var(--border, #2a2d3a)',
// //   borderRadius: 8,
// //   color: 'var(--white, #fff)',
// //   padding: '8px 12px',
// //   fontSize: '0.8rem',
// //   fontFamily: 'var(--font-mono, monospace)',
// //   outline: 'none',
// //   width: '100%',
// //   cursor: 'pointer',
// // };


// // src/components/CamAutomationPeople/components/ConfigModal.tsx

// import { useState } from 'react';
// import type { CamRole, CameraHook, SysConfig, ConfigState, CameraSourceType } from '../../../hooks/useCamAutomation';

// interface ConfigModalProps {
//   configState: ConfigState;
//   cameraHook:  CameraHook;
//   apiBase:     string;
//   onClose:     () => void;
// }

// type TabId = 'cameras' | 'cameras_ip' | 'limits' | 'epi' | 'system';

// const CAM_ROLE_LIST: { role: CamRole; label: string; desc: string }[] = [
//   { role: 'face',  label: 'Câmera Facial',  desc: 'Frontal / embutida — reconhecimento facial' },
//   { role: 'body1', label: 'Câmera Corpo 1', desc: 'USB externa — corpo superior (jaqueta, luvas, capacete)' },
//   { role: 'body2', label: 'Câmera Corpo 2', desc: 'USB externa — corpo inferior (calça, botas) — opcional' },
// ];

// const SYSTEM_FIELDS: { label: string; key: keyof SysConfig; type: 'number' | 'text'; hint?: string; placeholder?: string }[] = [
//   { label: 'Company ID',           key: 'companyId',         type: 'number', hint: 'ID da empresa no sistema' },
//   { label: 'Zone ID',              key: 'zoneId',            type: 'number', hint: 'ID da zona de acesso' },
//   { label: 'Door ID',              key: 'doorId',            type: 'text',   hint: 'Identificador da porta', placeholder: 'DOOR_01' },
//   { label: 'Confiança Facial (%)', key: 'faceConfidenceMin', type: 'number', hint: 'Mínimo para reconhecimento (0–100)' },
//   { label: 'IP da Fechadura',      key: 'lockIpAddress',     type: 'text',   hint: 'Endereço IP do ESP32', placeholder: '192.168.68.100' },
//   { label: 'Duração Unlock (ms)',  key: 'lockDurationMs',    type: 'number', hint: 'Tempo que a fechadura fica aberta', placeholder: '5000' },
// ];

// const EPI_ICONS: Record<string, string> = {
//   thermal_coat: '🧥', thermal_pants: '👖', gloves: '🧤',
//   helmet: '⛑️', boots: '👢', person: '🧍', vest: '🦺', mask: '😷',
// };
// const EPI_LABELS: Record<string, string> = {
//   thermal_coat: 'Jaqueta Térmica', thermal_pants: 'Calça Térmica',
//   gloves: 'Luvas', helmet: 'Capacete', boots: 'Botas',
//   person: 'Pessoa', vest: 'Colete', mask: 'Máscara',
// };

// const TABS: { id: TabId; label: string; icon: string }[] = [
//   { id: 'cameras',    label: 'Câmeras USB', icon: '📷' },
//   { id: 'cameras_ip', label: 'Câmeras IP',  icon: '🌐' },
//   { id: 'limits',     label: 'Permanência', icon: '⏱' },
//   { id: 'epi',        label: 'EPIs',        icon: '🦺' },
//   { id: 'system',     label: 'Sistema',     icon: '⚙️' },
// ];

// export default function ConfigModal({ configState, cameraHook, apiBase, onClose }: ConfigModalProps) {
//   const [activeTab, setActiveTab] = useState<TabId>('system');

//   const {
//     localConfig, setLocalConfig,
//     //@ts-ignore
//     epiConfig,
//     //@ts-ignore
//     setEpiConfig,
//     saving, saved, handleSave,
//   } = configState;

//   const { devices, assignments, assignDevice, enumerateDevices, sourceTypes, ipUrls, setSourceType, setIpUrl } = cameraHook;

//   const epiEntries = epiConfig?.config
//     ? Object.entries(epiConfig.config as Record<string, { enabled: boolean; required: boolean; display_name?: string }>)
//         .filter(([cls]) => cls !== 'person')
//     : [];

//   return (
//     <>
//       <style>{`
//         .cfg-overlay {
//           position: fixed; inset: 0; z-index: 9999;
//           background: rgba(0,0,0,0.35);
//           backdrop-filter: blur(6px);
//           display: flex; align-items: center; justify-content: center;
//           padding: 16px; box-sizing: border-box;
//           animation: cfgFade 180ms ease;
//         }
//         @keyframes cfgFade { from { opacity:0 } to { opacity:1 } }

//         .cfg-modal {
//           width: 100%; max-width: 560px;
//           max-height: 90vh;
//           display: flex; flex-direction: column;
//           background: #fff;
//           border-radius: 16px;
//           box-shadow: 0 24px 64px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08);
//           overflow: hidden;
//           animation: cfgSlide 220ms cubic-bezier(0.16,1,0.3,1);
//         }
//         @keyframes cfgSlide {
//           from { opacity:0; transform:translateY(20px) scale(0.98) }
//           to   { opacity:1; transform:translateY(0) scale(1) }
//         }

//         /* Header */
//         .cfg-header {
//           display: flex; align-items: center; justify-content: space-between;
//           padding: 18px 20px 14px; gap: 12px;
//           border-bottom: 1px solid #f1f5f9; flex-shrink: 0;
//         }
//         .cfg-header-left { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; }
//         .cfg-icon {
//           width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
//           background: linear-gradient(135deg, #3b82f6, #6366f1);
//           display: flex; align-items: center; justify-content: center;
//           font-size: 1rem; box-shadow: 0 4px 10px rgba(99,102,241,0.25);
//         }
//         .cfg-title { font-size: 1rem; font-weight: 700; color: #0f172a; }
//         .cfg-sub   { font-size: 0.65rem; color: #94a3b8; margin-top: 2px; }
//         .cfg-close {
//           width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
//           background: #f8fafc; border: 1px solid #e2e8f0; color: #94a3b8;
//           font-size: 0.85rem; cursor: pointer;
//           display: flex; align-items: center; justify-content: center;
//           transition: all 130ms;
//         }
//         .cfg-close:hover { background: #fee2e2; border-color: #fecaca; color: #ef4444; }

//         /* Tabs */
//         .cfg-tabs {
//           display: flex; border-bottom: 1px solid #f1f5f9;
//           overflow-x: auto; flex-shrink: 0;
//           scrollbar-width: none;
//         }
//         .cfg-tabs::-webkit-scrollbar { display: none; }
//         .cfg-tab {
//           display: flex; align-items: center; gap: 5px;
//           padding: 11px 14px; font-size: 0.7rem; font-weight: 600;
//           border: none; border-bottom: 2px solid transparent;
//           background: transparent; color: #94a3b8;
//           cursor: pointer; transition: all 130ms; white-space: nowrap;
//         }
//         .cfg-tab:hover { color: #475569; }
//         .cfg-tab.active { color: #3b82f6; border-bottom-color: #3b82f6; background: #f0f9ff; }

//         /* Body */
//         .cfg-body {
//           flex: 1; overflow-y: auto; padding: 16px;
//           display: flex; flex-direction: column; gap: 10px;
//           min-height: 0;
//         }
//         .cfg-body::-webkit-scrollbar { width: 4px; }
//         .cfg-body::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

//         /* Field card */
//         .cfg-card {
//           padding: 14px; border-radius: 10px;
//           background: #f8fafc; border: 1px solid #f1f5f9;
//         }
//         .cfg-card-head { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; }
//         .cfg-card-icon { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }
//         .cfg-card-label { font-size: 0.82rem; font-weight: 600; color: #0f172a; }
//         .cfg-card-hint  { font-size: 0.62rem; color: #94a3b8; margin-top: 2px; }

//         /* Input / Select */
//         .cfg-input, .cfg-select {
//           padding: 8px 11px; border-radius: 8px; font-size: 0.8rem;
//           background: #fff; border: 1.5px solid #e2e8f0; color: #0f172a;
//           outline: none; transition: border-color 130ms; width: 100%; box-sizing: border-box;
//         }
//         .cfg-input:focus, .cfg-select:focus { border-color: #3b82f6; }
//         .cfg-input::placeholder { color: #cbd5e1; }
//         .cfg-select { cursor: pointer; }

//         /* Info / Warn box */
//         .cfg-info {
//           padding: 10px 13px; border-radius: 8px; font-size: 0.68rem;
//           line-height: 1.5; color: #64748b;
//           background: #eff6ff; border: 1px solid #bfdbfe;
//         }
//         .cfg-warn {
//           padding: 10px 13px; border-radius: 8px; font-size: 0.68rem;
//           line-height: 1.5; color: #92400e;
//           background: #fffbeb; border: 1px solid #fde68a;
//         }

//         /* Section label */
//         .cfg-section {
//           font-size: 0.62rem; font-weight: 700; color: #94a3b8;
//           text-transform: uppercase; letter-spacing: 0.08em;
//           padding-bottom: 6px; border-bottom: 1px solid #f1f5f9;
//         }

//         /* Toggle row */
//         .cfg-toggle-row {
//           display: flex; align-items: center; gap: 12px;
//           padding: 12px 14px; border-radius: 10px;
//           border: 1.5px solid #e2e8f0; background: #fff;
//           cursor: pointer; transition: all 130ms;
//         }
//         .cfg-toggle-row:hover { border-color: #cbd5e1; background: #f8fafc; }
//         .cfg-toggle-row.on { border-color: #bfdbfe; background: #eff6ff; }
//         .cfg-checkbox {
//           width: 20px; height: 20px; border-radius: 5px; flex-shrink: 0;
//           border: 2px solid #e2e8f0; background: #fff;
//           display: flex; align-items: center; justify-content: center;
//           font-size: 0.72rem; font-weight: 700; color: #fff;
//           transition: all 130ms;
//         }
//         .cfg-checkbox.checked { background: #3b82f6; border-color: #3b82f6; }
//         .cfg-toggle-label { font-size: 0.82rem; font-weight: 600; color: #0f172a; }
//         .cfg-toggle-hint  { font-size: 0.62rem; color: #94a3b8; margin-top: 1px; }

//         /* Policy cards */
//         .cfg-policy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
//         .cfg-policy {
//           padding: 12px 14px; border-radius: 10px; cursor: pointer;
//           border: 1.5px solid #e2e8f0; background: #fff;
//           transition: all 130ms;
//         }
//         .cfg-policy:hover { border-color: #cbd5e1; }
//         .cfg-policy.warn-on  { border-color: #fde68a; background: #fffbeb; }
//         .cfg-policy.block-on { border-color: #fecaca; background: #fff5f5; }
//         .cfg-policy-icon  { font-size: 1.3rem; margin-bottom: 6px; }
//         .cfg-policy-label { font-size: 0.78rem; font-weight: 700; color: #0f172a; margin-bottom: 3px; }
//         .cfg-policy-desc  { font-size: 0.62rem; color: #94a3b8; }

//         /* EPI row */
//         .cfg-epi-row {
//           display: flex; align-items: center; justify-content: space-between;
//           padding: 11px 14px; border-radius: 10px;
//           border: 1px solid #f1f5f9; background: #fff;
//           transition: opacity 130ms;
//         }
//         .cfg-epi-row.disabled { opacity: 0.45; }
//         .cfg-epi-left { display: flex; align-items: center; gap: 10px; }
//         .cfg-epi-av {
//           width: 36px; height: 36px; border-radius: 8px;
//           background: #eff6ff; display: flex; align-items: center; justify-content: center;
//           font-size: 1rem; flex-shrink: 0;
//         }
//         .cfg-epi-name { font-size: 0.82rem; font-weight: 600; color: #0f172a; }
//         .cfg-epi-cls  { font-size: 0.6rem; color: #94a3b8; margin-top: 1px; }
//         .cfg-epi-badges { display: flex; gap: 5px; }

//         /* Badges */
//         .cfg-badge {
//           padding: 2px 7px; border-radius: 5px;
//           font-size: 0.58rem; font-weight: 700;
//           letter-spacing: 0.05em; white-space: nowrap;
//         }
//         .b-blue  { background: #dbeafe; color: #1d4ed8; }
//         .b-gray  { background: #f1f5f9; color: #94a3b8; }
//         .b-red   { background: #fee2e2; color: #dc2626; }
//         .b-green { background: #dcfce7; color: #15803d; }

//         /* Endpoint box */
//         .cfg-endpoint {
//           padding: 12px 14px; border-radius: 8px;
//           background: #f8fafc; border: 1px solid #f1f5f9;
//           font-size: 0.65rem; line-height: 1.8; color: #94a3b8;
//         }
//         .cfg-endpoint strong { color: #64748b; }
//         .cfg-ep-blue  { color: #3b82f6; }
//         .cfg-ep-green { color: #10b981; }

//         /* Footer */
//         .cfg-footer {
//           display: flex; justify-content: flex-end; gap: 8px;
//           padding: 12px 16px; border-top: 1px solid #f1f5f9; flex-shrink: 0;
//           background: #fff;
//         }
//         .cfg-btn-cancel {
//           padding: 8px 18px; border-radius: 8px; font-size: 0.75rem; font-weight: 600;
//           background: #f8fafc; border: 1.5px solid #e2e8f0; color: #64748b;
//           cursor: pointer; transition: all 130ms;
//         }
//         .cfg-btn-cancel:hover { border-color: #cbd5e1; color: #334155; }
//         .cfg-btn-save {
//           padding: 8px 24px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;
//           background: linear-gradient(135deg, #3b82f6, #6366f1);
//           border: none; color: #fff; cursor: pointer;
//           display: flex; align-items: center; gap: 7px;
//           transition: all 130ms; min-width: 120px; justify-content: center;
//         }
//         .cfg-btn-save:hover { opacity: 0.9; transform: translateY(-1px); }
//         .cfg-btn-save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
//         .cfg-btn-save.saved { background: #dcfce7; color: #15803d; border: 1.5px solid #bbf7d0; }

//         /* Spinner */
//         .cfg-spin {
//           width: 13px; height: 13px; border-radius: 50%;
//           border: 2px solid rgba(255,255,255,0.4);
//           border-top-color: #fff;
//           animation: cfgSpin 0.7s linear infinite;
//         }
//         @keyframes cfgSpin { to { transform: rotate(360deg) } }

//         /* Responsive */
//         @media (max-width: 480px) {
//           .cfg-modal { max-height: 95vh; border-radius: 12px; }
//           .cfg-tab span:first-child { display: none; }
//           .cfg-policy-grid { grid-template-columns: 1fr; }
//         }
//       `}</style>

//       <div className="cfg-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
//         <div className="cfg-modal">

//           {/* Header */}
//           <div className="cfg-header">
//             <div className="cfg-header-left">
//               <div className="cfg-icon">⚙️</div>
//               <div style={{ minWidth: 0 }}>
//                 <div className="cfg-title">Configurações</div>
//                 <div className="cfg-sub">SmartX EPI System · {apiBase}</div>
//               </div>
//             </div>
//             <button className="cfg-close" onClick={onClose}>✕</button>
//           </div>

//           {/* Tabs */}
//           <div className="cfg-tabs">
//             {TABS.map((t) => (
//               <button
//                 key={t.id}
//                 className={`cfg-tab ${activeTab === t.id ? 'active' : ''}`}
//                 onClick={() => setActiveTab(t.id)}
//               >
//                 <span>{t.icon}</span>
//                 <span>{t.label}</span>
//               </button>
//             ))}
//           </div>

//           {/* Body */}
//           <div className="cfg-body">

//             {/* ── CÂMERAS USB ── */}
//             {activeTab === 'cameras' && (
//               <>
//                 <div className="cfg-info">
//                   ℹ️ Atribua cada câmera USB ao seu papel. A câmera facial deve ser a embutida ou frontal.
//                 </div>
//                 <button
//                   onClick={enumerateDevices}
//                   style={{
//                     alignSelf: 'flex-start', padding: '7px 13px', borderRadius: 8,
//                     background: '#eff6ff', border: '1.5px solid #bfdbfe', color: '#3b82f6',
//                     fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
//                   }}
//                 >
//                   ↻ Redetectar ({devices.length} encontrada{devices.length !== 1 ? 's' : ''})
//                 </button>
//                 {CAM_ROLE_LIST.map(({ role, label, desc }) => (
//                   <div key={role} className="cfg-card">
//                     <div className="cfg-card-head">
//                       <span className="cfg-card-icon">📷</span>
//                       <div>
//                         <div className="cfg-card-label">{label}</div>
//                         <div className="cfg-card-hint">{desc}</div>
//                       </div>
//                     </div>
//                     <select
//                       className="cfg-select"
//                       value={assignments[role] || ''}
//                       onChange={(e) => assignDevice(role, e.target.value)}
//                     >
//                       <option value="">— Não configurada —</option>
//                       {devices.map((d) => (
//                         <option key={d.deviceId} value={d.deviceId}>
//                           {d.label || `Câmera ${d.deviceId.slice(0, 8)}…`}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 ))}
//               </>
//             )}

//             {/* ── CÂMERAS IP ── */}
//             {activeTab === 'cameras_ip' && (
//               <>
//                 <div
//                   className={`cfg-toggle-row ${localConfig.useSingleCamera ? 'on' : ''}`}
//                   onClick={() => setLocalConfig({ ...localConfig, useSingleCamera: !localConfig.useSingleCamera })}
//                 >
//                   <div className={`cfg-checkbox ${localConfig.useSingleCamera ? 'checked' : ''}`}>
//                     {localConfig.useSingleCamera && '✓'}
//                   </div>
//                   <div>
//                     <div className="cfg-toggle-label">Usar mesma câmera para Face e EPI</div>
//                     <div className="cfg-toggle-hint">Recomendado quando há apenas uma câmera disponível</div>
//                   </div>
//                 </div>

//                 {CAM_ROLE_LIST.map(({ role, label }) => {
//                   if (localConfig.useSingleCamera && role !== 'face') return null;
//                   const isLocal = sourceTypes[role] === 'local';
//                   return (
//                     <div key={role} className="cfg-card">
//                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
//                         <div className="cfg-card-label">📷 {label}</div>
//                         <select
//                           className="cfg-select"
//                           value={sourceTypes[role]}
//                           onChange={(e) => setSourceType(role, e.target.value as CameraSourceType)}
//                           style={{ width: 'auto', padding: '5px 8px', fontSize: '0.7rem' }}
//                         >
//                           <option value="local">📹 USB Local</option>
//                           <option value="ip_url">🌐 IP URL</option>
//                         </select>
//                       </div>
//                       {isLocal ? (
//                         <select
//                           className="cfg-select"
//                           value={assignments[role] || ''}
//                           onChange={(e) => assignDevice(role, e.target.value)}
//                         >
//                           <option value="">— Selecione —</option>
//                           {devices.map((d) => (
//                             <option key={d.deviceId} value={d.deviceId}>
//                               {d.label || `Câmera ${d.deviceId.slice(0, 8)}…`}
//                             </option>
//                           ))}
//                         </select>
//                       ) : (
//                         <>
//                           <input
//                             className="cfg-input"
//                             type="text"
//                             placeholder="http://admin:senha@192.168.1.100:8070/snapshot.cgi"
//                             value={ipUrls[role] || ''}
//                             onChange={(e) => setIpUrl(role, e.target.value)}
//                           />
//                           <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: 5 }}>
//                             Ex: http://admin:mixhub123@177.139.51.174:8056/cgi-bin/snapshot.cgi?channel=1
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   );
//                 })}

//                 <div className="cfg-warn">
//                   ⚠️ Se houver erro de CORS, o backend faz proxy via <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 4px', borderRadius: 3 }}>/api/v1/epi/camera/snapshot</code>
//                 </div>
//               </>
//             )}

//             {/* ── PERMANÊNCIA ── */}
//             {activeTab === 'limits' && (
//               <>
//                 <div className="cfg-card">
//                   <div className="cfg-card-head">
//                     <span className="cfg-card-icon">⏰</span>
//                     <div>
//                       <div className="cfg-card-label">Limite Diário</div>
//                       <div className="cfg-card-hint">Tempo máximo de permanência por dia (minutos)</div>
//                     </div>
//                   </div>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                     <input
//                       className="cfg-input"
//                       type="number" min={30} max={480}
//                       value={localConfig.dailyLimitMin || 120}
//                       onChange={(e) => setLocalConfig({ ...localConfig, dailyLimitMin: parseInt(e.target.value) })}
//                       style={{ maxWidth: 110 }}
//                     />
//                     <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>minutos · máx 480 (8h)</span>
//                   </div>
//                 </div>

//                 <div>
//                   <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
//                     Política ao Exceder
//                   </div>
//                   <div className="cfg-policy-grid">
//                     {[
//                       { id: 'warn',  label: 'Avisar e Liberar', icon: '⚠️', desc: 'Exibe alerta mas permite acesso', cls: 'warn-on'  },
//                       { id: 'block', label: 'Bloquear Acesso',  icon: '🚫', desc: 'Nega entrada, requer supervisor',  cls: 'block-on' },
//                     ].map((p) => {
//                       const isActive = localConfig.overLimitPolicy === p.id;
//                       return (
//                         <div
//                           key={p.id}
//                           className={`cfg-policy ${isActive ? p.cls : ''}`}
//                           onClick={() => setLocalConfig({ ...localConfig, overLimitPolicy: p.id as 'warn' | 'block' })}
//                         >
//                           <div className="cfg-policy-icon">{p.icon}</div>
//                           <div className="cfg-policy-label">{p.label}</div>
//                           <div className="cfg-policy-desc">{p.desc}</div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>

//                 <div className="cfg-card">
//                   <div className="cfg-card-head">
//                     <span className="cfg-card-icon">🚪</span>
//                     <div>
//                       <div className="cfg-card-label">Tempo máx. porta aberta</div>
//                       <div className="cfg-card-hint">Máximo de minutos que a porta pode ficar aberta</div>
//                     </div>
//                   </div>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                     <input
//                       className="cfg-input"
//                       type="number" min={1} max={60}
//                       value={localConfig.doorOpenMaxMin || 15}
//                       onChange={(e) => setLocalConfig({ ...localConfig, doorOpenMaxMin: parseInt(e.target.value) })}
//                       style={{ maxWidth: 100 }}
//                     />
//                     <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>minutos</span>
//                   </div>
//                 </div>
//               </>
//             )}

//             {/* ── EPIs ── */}
//             {activeTab === 'epi' && (
//               <>
//                 <div className="cfg-info">
//                   ℹ️ Configuração lida do banco de dados. Gerencie via <strong>SmartX HUB → Configurações → EPI</strong>.
//                 </div>

//                 {!epiConfig ? (
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', color: '#94a3b8', fontSize: '0.8rem' }}>
//                     <div className="cfg-spin" style={{ borderColor: 'rgba(59,130,246,0.2)', borderTopColor: '#3b82f6' }} />
//                     Carregando configuração de EPIs…
//                   </div>
//                 ) : epiEntries.length === 0 ? (
//                   <div className="cfg-warn">⚠️ Nenhum EPI configurado no banco.</div>
//                 ) : (
//                   epiEntries.map(([cls, cfg]) => (
//                     <div key={cls} className={`cfg-epi-row ${cfg.enabled ? '' : 'disabled'}`}>
//                       <div className="cfg-epi-left">
//                         <div className="cfg-epi-av">{EPI_ICONS[cls] || '🔲'}</div>
//                         <div>
//                           <div className="cfg-epi-name">{EPI_LABELS[cls] || cls}</div>
//                           <div className="cfg-epi-cls">{cls}</div>
//                         </div>
//                       </div>
//                       <div className="cfg-epi-badges">
//                         <span className={`cfg-badge ${cfg.enabled ? 'b-blue' : 'b-gray'}`}>
//                           {cfg.enabled ? 'ATIVO' : 'INATIVO'}
//                         </span>
//                         {cfg.enabled && (
//                           <span className={`cfg-badge ${cfg.required ? 'b-red' : 'b-green'}`}>
//                             {cfg.required ? 'OBRIGATÓRIO' : 'OPCIONAL'}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </>
//             )}

//             {/* ── SISTEMA ── */}
//             {activeTab === 'system' && (
//               <>
//                 <div className="cfg-section">🔧 Identificação do Sistema</div>
//                 {SYSTEM_FIELDS.slice(0, 4).map((f) => (
//                   <div key={f.key} className="cfg-card">
//                     <div className="cfg-card-label" style={{ marginBottom: 6 }}>{f.label}</div>
//                     {f.hint && <div className="cfg-card-hint" style={{ marginBottom: 8 }}>{f.hint}</div>}
//                     <input
//                       className="cfg-input"
//                       type={f.type}
//                       value={String(localConfig[f.key] ?? '')}
//                       placeholder={f.placeholder}
//                       onChange={(e) =>
//                         setLocalConfig({ ...localConfig, [f.key]: f.type === 'number' ? parseFloat(e.target.value) : e.target.value })
//                       }
//                       style={{ maxWidth: 260 }}
//                     />
//                   </div>
//                 ))}

//                 <div className="cfg-section" style={{ marginTop: 4 }}>🔒 Fechadura ESP32 (MIXHUB)</div>
//                 {SYSTEM_FIELDS.slice(4).map((f) => (
//                   <div key={f.key} className="cfg-card">
//                     <div className="cfg-card-label" style={{ marginBottom: 6 }}>{f.label}</div>
//                     {f.hint && <div className="cfg-card-hint" style={{ marginBottom: 8 }}>{f.hint}</div>}
//                     <input
//                       className="cfg-input"
//                       type={f.type}
//                       value={String(localConfig[f.key] ?? '')}
//                       placeholder={f.placeholder}
//                       onChange={(e) =>
//                         setLocalConfig({ ...localConfig, [f.key]: f.type === 'number' ? parseFloat(e.target.value) : e.target.value })
//                       }
//                       style={{ maxWidth: 260 }}
//                     />
//                   </div>
//                 ))}

//                 <div className="cfg-endpoint">
//                   <div style={{ marginBottom: 4 }}><strong>📡 Endpoints Ativos</strong></div>
//                   <div>API Base: <span className="cfg-ep-blue">{apiBase || '—'}</span></div>
//                   <div>Unlock: <span className="cfg-ep-green">POST http://{String(localConfig.lockIpAddress || '…')}/unlock</span></div>
//                   <div style={{ marginTop: 4 }}>Versão: SmartX EPI Tablet v1.0</div>
//                 </div>
//               </>
//             )}

//           </div>

//           {/* Footer */}
//           <div className="cfg-footer">
//             <button className="cfg-btn-cancel" onClick={onClose}>Cancelar</button>
//             <button
//               className={`cfg-btn-save ${saved ? 'saved' : ''}`}
//               onClick={handleSave}
//               disabled={saving}
//             >
//               {saving
//                 ? <><div className="cfg-spin" /> Salvando…</>
//                 : saved
//                 ? '✅ Salvo!'
//                 : '💾 Salvar'}
//             </button>
//           </div>

//         </div>
//       </div>
//     </>
//   );
// }

// src/components/CamAutomationPeople/components/ConfigModal.tsx

import { useState } from 'react';
import type { CamRole, CameraHook, SysConfig, ConfigState, CameraSourceType } from '../../../hooks/useCamAutomation';

interface ConfigModalProps {
  configState: ConfigState;
  cameraHook:  CameraHook;
  apiBase:     string;
  onClose:     () => void;
}

type TabId = 'cameras' | 'cameras_ip' | 'limits' | 'epi' | 'system';

// ─── Heroicons SVG inline ─────────────────────────────────────────────────────

const Icon = {
  Cog: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
      <path fillRule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25L2.795 4.48a1 1 0 0 1 1.187-.447l1.598.54A6.993 6.993 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd"/>
    </svg>
  ),
  X: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/>
    </svg>
  ),
  Camera: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path fillRule="evenodd" d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd"/>
    </svg>
  ),
  Globe: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM4.332 8.027a6.012 6.012 0 0 1 1.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 0 1 9 7.5V8a2 2 0 0 0 4 0 2 2 0 0 1 1.523-1.943A5.977 5.977 0 0 1 16 10c0 .34-.028.675-.083 1H15a2 2 0 0 0-2 2v2.197A5.973 5.973 0 0 1 10 16v-2a2 2 0 0 0-2-2 2 2 0 0 1-2-2 2 2 0 0 0-1.668-1.973Z" clipRule="evenodd"/>
    </svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd"/>
    </svg>
  ),
  ShieldCheck: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 0 1 .678 0 11.947 11.947 0 0 0 7.078 2.749.5.5 0 0 1 .479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 0 1-.332 0C5.26 16.564 2 12.162 2 7c0-.539.035-1.069.104-1.589a.5.5 0 0 1 .48-.425 11.947 11.947 0 0 0 7.077-2.749Zm4.196 5.954a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd"/>
    </svg>
  ),
  WrenchScrewdriver: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path fillRule="evenodd" d="M14.5 10a4.5 4.5 0 0 0 4.284-5.882c-.105-.324-.51-.391-.752-.15L15.34 6.66a.454.454 0 0 1-.493.11 3.01 3.01 0 0 1-1.618-1.616.455.455 0 0 1 .11-.494l2.694-2.692c.24-.241.174-.647-.15-.752a4.5 4.5 0 0 0-5.873 4.575c.055.873-.128 1.808-.8 2.368l-7.23 6.024a2.724 2.724 0 1 0 3.837 3.837l6.024-7.23c.56-.672 1.495-.855 2.368-.8.096.007.193.01.291.01ZM5 16a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd"/>
    </svg>
  ),
  ArrowPath: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
      <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd"/>
    </svg>
  ),
  InformationCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd"/>
    </svg>
  ),
  ExclamationTriangle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd"/>
    </svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd"/>
    </svg>
  ),
  Signal: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
      <path fillRule="evenodd" d="M10 2a.75.75 0 0 1 .75.75v.258a33.186 33.186 0 0 1 6.668 1.813.75.75 0 1 1-.499 1.416 31.683 31.683 0 0 0-6.169-1.669v2.927a33.136 33.136 0 0 1 6.15 1.81.75.75 0 0 1-.5 1.413 31.636 31.636 0 0 0-5.65-1.67v2.929a33.19 33.19 0 0 1 5.626 1.81.75.75 0 0 1-.499 1.416 31.73 31.73 0 0 0-5.127-1.67v2.928a33.136 33.136 0 0 1 5.102 1.81.75.75 0 0 1-.5 1.413 31.69 31.69 0 0 0-4.602-1.668v.937a.75.75 0 0 1-1.5 0V2.75A.75.75 0 0 1 10 2Z" clipRule="evenodd"/>
    </svg>
  ),
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd"/>
    </svg>
  ),
  Building: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
      <path fillRule="evenodd" d="M1 2.75A.75.75 0 0 1 1.75 2h16.5a.75.75 0 0 1 0 1.5H18v8.75A2.75 2.75 0 0 1 15.25 15h-1.072l.798 3.06a.75.75 0 0 1-1.452.38L13.41 18H6.59l-.114.44a.75.75 0 0 1-1.452-.38L5.823 15H4.75A2.75 2.75 0 0 1 2 12.25V3.5h-.25A.75.75 0 0 1 1 2.75ZM7.373 15l-.391 1.5h6.037l-.392-1.5H7.373ZM13.25 5a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5a.75.75 0 0 1 .75-.75ZM10 5a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5A.75.75 0 0 1 10 5ZM6.75 5a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd"/>
    </svg>
  ),
  MapPin: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
      <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd"/>
    </svg>
  ),
  Door: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
      <path fillRule="evenodd" d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Zm8.5 3a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" clipRule="evenodd"/>
    </svg>
  ),
  BellAlert: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
      <path fillRule="evenodd" d="M4 8a6 6 0 1 1 11.93 1.17 7.008 7.008 0 0 0-.762 1.605A5.5 5.5 0 0 1 10 14.3a5.5 5.5 0 0 1-5.168-3.528A7.008 7.008 0 0 0 4.07 9.17 5.97 5.97 0 0 1 4 8ZM10 17a2 2 0 0 1-1.95-1.557A1 1 0 0 1 9 15h2a1 1 0 0 1 .95.443A2 2 0 0 1 10 17ZM10 1a.75.75 0 0 1 .75.75V3.5a.75.75 0 0 1-1.5 0V1.75A.75.75 0 0 1 10 1Z" clipRule="evenodd"/>
    </svg>
  ),
  NoSymbol: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
      <path fillRule="evenodd" d="M5.965 4.904l9.131 9.131a6.5 6.5 0 0 0-9.131-9.131Zm8.07 10.196-9.131-9.131a6.5 6.5 0 0 0 9.131 9.131ZM4.904 5.965a8 8 0 1 0 10.131 10.131A8 8 0 0 0 4.904 5.965Z" clipRule="evenodd"/>
    </svg>
  ),
  Floppy: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
      <path d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 1 .439 1.061V15a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 3 15V3.5ZM6 2.25v3.75a.25.25 0 0 0 .25.25h5.5a.25.25 0 0 0 .25-.25V2.25H13v3.75A1.75 1.75 0 0 1 11.25 7.75H6.75A1.75 1.75 0 0 1 5 6V2.25H6ZM10.5 2.25V5.5a.25.25 0 0 1-.5 0V2.25h.5Z"/>
    </svg>
  ),
  Target: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
      <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192.019.019 1.962 1.962.018.018 1.185-.237a1 1 0 0 0 0-1.96l-1-.196ZM4.73 4.73a1 1 0 0 0-1.415 1.415l1.414-1.414ZM14.5 10a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"/>
    </svg>
  ),
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CAM_ROLE_LIST: { role: CamRole; label: string; desc: string }[] = [
  { role: 'face',  label: 'Câmera Facial',  desc: 'Frontal / embutida — reconhecimento facial' },
  { role: 'body1', label: 'Câmera Corpo 1', desc: 'USB externa — corpo superior' },
  { role: 'body2', label: 'Câmera Corpo 2', desc: 'USB externa — corpo inferior — opcional' },
];

const SYSTEM_FIELDS: { label: string; key: keyof SysConfig; type: 'number' | 'text'; hint?: string; placeholder?: string; icon: React.ReactNode }[] = [
  { label: 'Company ID',           key: 'companyId',         type: 'number', hint: 'ID da empresa no sistema',          icon: <Icon.Building />,  placeholder: '1'   },
  { label: 'Zone ID',              key: 'zoneId',            type: 'number', hint: 'ID da zona de acesso',              icon: <Icon.MapPin />,    placeholder: '10'  },
  { label: 'Door ID',              key: 'doorId',            type: 'text',   hint: 'Identificador da porta',            icon: <Icon.Door />,      placeholder: 'DOOR_01' },
  { label: 'Confiança Facial (%)', key: 'faceConfidenceMin', type: 'number', hint: 'Mínimo para reconhecimento (0–100)',icon: <Icon.Target />,    placeholder: '70'  },
  { label: 'IP da Fechadura',      key: 'lockIpAddress',     type: 'text',   hint: 'Endereço IP do ESP32',              icon: <Icon.Lock />,      placeholder: '192.168.68.100' },
  { label: 'Duração Unlock (ms)',  key: 'lockDurationMs',    type: 'number', hint: 'Tempo que a fechadura fica aberta', icon: <Icon.Clock />,     placeholder: '5000' },
];

const EPI_LABELS: Record<string, string> = {
  thermal_coat: 'Jaqueta Térmica', thermal_pants: 'Calça Térmica',
  gloves: 'Luvas', helmet: 'Capacete', boots: 'Botas',
  person: 'Pessoa', vest: 'Colete', mask: 'Máscara', glasses: 'Óculos',
};

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'cameras',    label: 'Câmeras USB', icon: <Icon.Camera /> },
  { id: 'cameras_ip', label: 'Câmeras IP',  icon: <Icon.Globe /> },
  { id: 'limits',     label: 'Permanência', icon: <Icon.Clock /> },
  { id: 'epi',        label: 'EPIs',        icon: <Icon.ShieldCheck /> },
  { id: 'system',     label: 'Sistema',     icon: <Icon.WrenchScrewdriver /> },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function ConfigModal({ configState, cameraHook, apiBase, onClose }: ConfigModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('system');

  const {
    localConfig, setLocalConfig,
    //@ts-ignore
    epiConfig,
    saving, saved, handleSave,
  } = configState;

  const { devices, assignments, assignDevice, enumerateDevices, sourceTypes, ipUrls, setSourceType, setIpUrl } = cameraHook;

  const epiEntries = epiConfig?.config
    ? Object.entries(epiConfig.config as Record<string, { enabled: boolean; required: boolean }>)
        .filter(([cls]) => cls !== 'person')
    : [];

  return (
    <>
      <style>{`
        .cfg-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.35); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px; box-sizing: border-box;
          animation: cfgFade 180ms ease;
        }
        @keyframes cfgFade { from { opacity:0 } to { opacity:1 } }

        .cfg-modal {
          width: 100%; max-width: 560px; max-height: 90vh;
          display: flex; flex-direction: column;
          background: #fff; border-radius: 16px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.07);
          overflow: hidden;
          animation: cfgSlide 220ms cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes cfgSlide {
          from { opacity:0; transform:translateY(20px) scale(0.98) }
          to   { opacity:1; transform:translateY(0) scale(1) }
        }

        /* Header */
        .cfg-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 20px 14px; gap: 12px;
          border-bottom: 1px solid #f1f5f9; flex-shrink: 0;
        }
        .cfg-hl { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; }
        .cfg-hicon {
          width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          display: flex; align-items: center; justify-content: center; color: #fff;
          box-shadow: 0 4px 10px rgba(99,102,241,0.25);
        }
        .cfg-htitle { font-size: 1rem; font-weight: 700; color: #0f172a; }
        .cfg-hsub   { font-size: 0.62rem; color: #94a3b8; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cfg-close {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          background: #f8fafc; border: 1px solid #e2e8f0; color: #94a3b8;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 130ms;
        }
        .cfg-close:hover { background: #fee2e2; border-color: #fecaca; color: #ef4444; }

        /* Tabs */
        .cfg-tabs {
          display: flex; border-bottom: 1px solid #f1f5f9;
          overflow-x: auto; flex-shrink: 0; scrollbar-width: none;
        }
        .cfg-tabs::-webkit-scrollbar { display: none; }
        .cfg-tab {
          display: flex; align-items: center; gap: 5px;
          padding: 10px 13px; font-size: 0.7rem; font-weight: 600;
          border: none; border-bottom: 2px solid transparent;
          background: transparent; color: #94a3b8;
          cursor: pointer; transition: all 130ms; white-space: nowrap;
        }
        .cfg-tab:hover { color: #475569; }
        .cfg-tab.active { color: #3b82f6; border-bottom-color: #3b82f6; background: #f0f9ff; }

        /* Body */
        .cfg-body {
          flex: 1; overflow-y: auto; padding: 14px;
          display: flex; flex-direction: column; gap: 10px; min-height: 0;
        }
        .cfg-body::-webkit-scrollbar { width: 4px; }
        .cfg-body::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

        /* Cards */
        .cfg-card {
          padding: 13px; border-radius: 10px;
          background: #f8fafc; border: 1px solid #f1f5f9;
        }
        .cfg-card-head { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; }
        .cfg-card-ico { color: #94a3b8; flex-shrink: 0; margin-top: 1px; display: flex; }
        .cfg-card-label { font-size: 0.82rem; font-weight: 600; color: #0f172a; }
        .cfg-card-hint  { font-size: 0.61rem; color: #94a3b8; margin-top: 1px; }

        /* Inputs */
        .cfg-input, .cfg-select {
          padding: 8px 11px; border-radius: 8px; font-size: 0.8rem;
          background: #fff; border: 1.5px solid #e2e8f0; color: #0f172a;
          outline: none; transition: border-color 130ms;
          width: 100%; box-sizing: border-box;
        }
        .cfg-input:focus, .cfg-select:focus { border-color: #3b82f6; }
        .cfg-input::placeholder { color: #cbd5e1; }
        .cfg-select { cursor: pointer; }

        /* Info/Warn */
        .cfg-info {
          display: flex; gap: 8px; align-items: flex-start;
          padding: 10px 12px; border-radius: 8px; font-size: 0.68rem;
          line-height: 1.5; color: #1d4ed8;
          background: #eff6ff; border: 1px solid #bfdbfe;
        }
        .cfg-info-ico { flex-shrink: 0; margin-top: 1px; }
        .cfg-warn {
          display: flex; gap: 8px; align-items: flex-start;
          padding: 10px 12px; border-radius: 8px; font-size: 0.68rem;
          line-height: 1.5; color: #92400e;
          background: #fffbeb; border: 1px solid #fde68a;
        }

        /* Section */
        .cfg-section {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.62rem; font-weight: 700; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.08em;
          padding-bottom: 6px; border-bottom: 1px solid #f1f5f9;
        }

        /* Toggle */
        .cfg-toggle {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 10px;
          border: 1.5px solid #e2e8f0; background: #fff;
          cursor: pointer; transition: all 130ms;
        }
        .cfg-toggle:hover { border-color: #cbd5e1; background: #f8fafc; }
        .cfg-toggle.on { border-color: #bfdbfe; background: #eff6ff; }
        .cfg-check {
          width: 20px; height: 20px; border-radius: 5px; flex-shrink: 0;
          border: 2px solid #e2e8f0; background: #fff;
          display: flex; align-items: center; justify-content: center;
          color: #fff; transition: all 130ms;
        }
        .cfg-check.on { background: #3b82f6; border-color: #3b82f6; }
        .cfg-tl { font-size: 0.82rem; font-weight: 600; color: #0f172a; }
        .cfg-th { font-size: 0.61rem; color: #94a3b8; margin-top: 1px; }

        /* Policy */
        .cfg-pgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .cfg-policy {
          padding: 12px; border-radius: 10px; cursor: pointer;
          border: 1.5px solid #e2e8f0; background: #fff; transition: all 130ms;
        }
        .cfg-policy:hover { border-color: #cbd5e1; }
        .cfg-policy.pw { border-color: #fde68a; background: #fffbeb; }
        .cfg-policy.pb { border-color: #fecaca; background: #fff5f5; }
        .cfg-policy-ico  { margin-bottom: 6px; color: #94a3b8; }
        .cfg-policy-ico.pw { color: #b45309; }
        .cfg-policy-ico.pb { color: #dc2626; }
        .cfg-policy-lbl  { font-size: 0.78rem; font-weight: 700; color: #0f172a; margin-bottom: 3px; }
        .cfg-policy-desc { font-size: 0.62rem; color: #94a3b8; }

        /* EPI row */
        .cfg-epi {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 13px; border-radius: 10px;
          border: 1px solid #f1f5f9; background: #fff; transition: opacity 130ms;
        }
        .cfg-epi.off { opacity: 0.45; }
        .cfg-epi-l { display: flex; align-items: center; gap: 10px; }
        .cfg-epi-av {
          width: 34px; height: 34px; border-radius: 8px;
          background: #eff6ff; border: 1px solid #bfdbfe;
          display: flex; align-items: center; justify-content: center; color: #3b82f6;
          flex-shrink: 0;
        }
        .cfg-epi-name { font-size: 0.8rem; font-weight: 600; color: #0f172a; }
        .cfg-epi-cls  { font-size: 0.6rem; color: #94a3b8; margin-top: 1px; }
        .cfg-epi-badges { display: flex; gap: 4px; }

        /* Badges */
        .cfg-bdg {
          padding: 2px 7px; border-radius: 4px;
          font-size: 0.58rem; font-weight: 700; letter-spacing: 0.05em;
        }
        .b-blue  { background: #dbeafe; color: #1d4ed8; }
        .b-gray  { background: #f1f5f9; color: #94a3b8; }
        .b-red   { background: #fee2e2; color: #dc2626; }
        .b-green { background: #dcfce7; color: #15803d; }

        /* Endpoint */
        .cfg-ep {
          padding: 12px 13px; border-radius: 8px;
          background: #f8fafc; border: 1px solid #f1f5f9;
          font-size: 0.65rem; line-height: 1.8; color: #94a3b8;
        }
        .cfg-ep strong { color: #64748b; }
        .ep-blue  { color: #3b82f6; }
        .ep-green { color: #10b981; }

        /* Redetect btn */
        .cfg-rdet {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 7px 12px; border-radius: 8px;
          background: #eff6ff; border: 1.5px solid #bfdbfe; color: #3b82f6;
          font-size: 0.72rem; font-weight: 700; cursor: pointer; transition: all 130ms;
        }
        .cfg-rdet:hover { background: #dbeafe; }

        /* Footer */
        .cfg-footer {
          display: flex; justify-content: flex-end; gap: 8px;
          padding: 12px 16px; border-top: 1px solid #f1f5f9; flex-shrink: 0;
        }
        .cfg-cancel {
          display: flex; align-items: center; gap: 5px;
          padding: 8px 16px; border-radius: 8px; font-size: 0.75rem; font-weight: 600;
          background: #f8fafc; border: 1.5px solid #e2e8f0; color: #64748b;
          cursor: pointer; transition: all 130ms;
        }
        .cfg-cancel:hover { border-color: #cbd5e1; color: #334155; }
        .cfg-save {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 20px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border: none; color: #fff; cursor: pointer; transition: all 130ms;
          min-width: 110px; justify-content: center;
        }
        .cfg-save:hover { opacity: 0.9; transform: translateY(-1px); }
        .cfg-save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .cfg-save.saved { background: #dcfce7; color: #15803d; border: 1.5px solid #bbf7d0; }

        /* Spinner */
        .cfg-spin {
          width: 13px; height: 13px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.35); border-top-color: #fff;
          animation: cfgSpin 0.7s linear infinite; flex-shrink: 0;
        }
        @keyframes cfgSpin { to { transform:rotate(360deg) } }

        @media (max-width: 480px) {
          .cfg-modal { max-height: 95vh; border-radius: 12px; }
          .cfg-tab span:not(.cfg-tab-icon) { display: none; }
          .cfg-pgrid { grid-template-columns: 1fr; }
          .cfg-hsub { display: none; }
        }
      `}</style>

      <div className="cfg-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="cfg-modal">

          {/* Header */}
          <div className="cfg-header">
            <div className="cfg-hl">
              <div className="cfg-hicon"><Icon.Cog /></div>
              <div style={{ minWidth: 0 }}>
                <div className="cfg-htitle">Configurações</div>
                <div className="cfg-hsub">SmartX EPI System · {apiBase}</div>
              </div>
            </div>
            <button className="cfg-close" onClick={onClose}><Icon.X /></button>
          </div>

          {/* Tabs */}
          <div className="cfg-tabs">
            {TABS.map((t) => (
              <button key={t.id} className={`cfg-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                <span className="cfg-tab-icon">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="cfg-body">

            {/* ── CÂMERAS USB ── */}
            {activeTab === 'cameras' && (
              <>
                <div className="cfg-info">
                  <span className="cfg-info-ico"><Icon.InformationCircle /></span>
                  <span>Atribua cada câmera USB ao seu papel. A câmera facial deve ser a embutida ou frontal.</span>
                </div>
                <button className="cfg-rdet" onClick={enumerateDevices}>
                  <Icon.ArrowPath />
                  Redetectar ({devices.length} encontrada{devices.length !== 1 ? 's' : ''})
                </button>
                {CAM_ROLE_LIST.map(({ role, label, desc }) => (
                  <div key={role} className="cfg-card">
                    <div className="cfg-card-head">
                      <span className="cfg-card-ico"><Icon.Camera /></span>
                      <div>
                        <div className="cfg-card-label">{label}</div>
                        <div className="cfg-card-hint">{desc}</div>
                      </div>
                    </div>
                    <select className="cfg-select" value={assignments[role] || ''} onChange={(e) => assignDevice(role, e.target.value)}>
                      <option value="">— Não configurada —</option>
                      {devices.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || `Câmera ${d.deviceId.slice(0, 8)}…`}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </>
            )}

            {/* ── CÂMERAS IP ── */}
            {activeTab === 'cameras_ip' && (
              <>
                <div
                  className={`cfg-toggle ${localConfig.useSingleCamera ? 'on' : ''}`}
                  onClick={() => setLocalConfig({ ...localConfig, useSingleCamera: !localConfig.useSingleCamera })}
                >
                  <div className={`cfg-check ${localConfig.useSingleCamera ? 'on' : ''}`}>
                    {localConfig.useSingleCamera && <Icon.Check />}
                  </div>
                  <div>
                    <div className="cfg-tl">Usar mesma câmera para Face e EPI</div>
                    <div className="cfg-th">Recomendado quando há apenas uma câmera disponível</div>
                  </div>
                </div>

                {CAM_ROLE_LIST.map(({ role, label }) => {
                  if (localConfig.useSingleCamera && role !== 'face') return null;
                  const isLocal = sourceTypes[role] === 'local';
                  return (
                    <div key={role} className="cfg-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div className="cfg-card-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Icon.Camera /> {label}
                        </div>
                        <select
                          className="cfg-select"
                          value={sourceTypes[role]}
                          onChange={(e) => setSourceType(role, e.target.value as CameraSourceType)}
                          style={{ width: 'auto', padding: '5px 8px', fontSize: '0.7rem' }}
                        >
                          <option value="local">USB Local</option>
                          <option value="ip_url">IP URL</option>
                        </select>
                      </div>
                      {isLocal ? (
                        <select className="cfg-select" value={assignments[role] || ''} onChange={(e) => assignDevice(role, e.target.value)}>
                          <option value="">— Selecione —</option>
                          {devices.map((d) => (
                            <option key={d.deviceId} value={d.deviceId}>
                              {d.label || `Câmera ${d.deviceId.slice(0, 8)}…`}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <>
                          <input className="cfg-input" type="text" placeholder="http://admin:senha@192.168.1.100:8070/snapshot.cgi" value={ipUrls[role] || ''} onChange={(e) => setIpUrl(role, e.target.value)} />
                          <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: 5 }}>
                            Ex: http://admin:mixhub123@177.139.51.174:8056/cgi-bin/snapshot.cgi?channel=1
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

                <div className="cfg-warn">
                  <span className="cfg-info-ico"><Icon.ExclamationTriangle /></span>
                  <span>Se houver erro de CORS, o backend faz proxy via <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 4px', borderRadius: 3 }}>/api/v1/epi/camera/snapshot</code></span>
                </div>
              </>
            )}

            {/* ── PERMANÊNCIA ── */}
            {activeTab === 'limits' && (
              <>
                <div className="cfg-card">
                  <div className="cfg-card-head">
                    <span className="cfg-card-ico"><Icon.Clock /></span>
                    <div>
                      <div className="cfg-card-label">Limite Diário</div>
                      <div className="cfg-card-hint">Tempo máximo de permanência por dia (minutos)</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input className="cfg-input" type="number" min={30} max={480} value={localConfig.dailyLimitMin || 120} onChange={(e) => setLocalConfig({ ...localConfig, dailyLimitMin: parseInt(e.target.value) })} style={{ maxWidth: 110 }} />
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>minutos · máx 480 (8h)</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon.BellAlert /> Política ao Exceder
                  </div>
                  <div className="cfg-pgrid">
                    {[
                      { id: 'warn',  label: 'Avisar e Liberar', cls: 'pw', icoClass: 'pw', icon: <Icon.ExclamationTriangle />, desc: 'Exibe alerta mas permite acesso' },
                      { id: 'block', label: 'Bloquear Acesso',  cls: 'pb', icoClass: 'pb', icon: <Icon.NoSymbol />,            desc: 'Nega entrada, requer supervisor' },
                    ].map((p) => {
                      const isActive = localConfig.overLimitPolicy === p.id;
                      return (
                        <div key={p.id} className={`cfg-policy ${isActive ? p.cls : ''}`} onClick={() => setLocalConfig({ ...localConfig, overLimitPolicy: p.id as 'warn' | 'block' })}>
                          <div className={`cfg-policy-ico ${isActive ? p.icoClass : ''}`}>{p.icon}</div>
                          <div className="cfg-policy-lbl">{p.label}</div>
                          <div className="cfg-policy-desc">{p.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="cfg-card">
                  <div className="cfg-card-head">
                    <span className="cfg-card-ico"><Icon.Door /></span>
                    <div>
                      <div className="cfg-card-label">Tempo máx. porta aberta</div>
                      <div className="cfg-card-hint">Máximo de minutos que a porta pode ficar aberta</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input className="cfg-input" type="number" min={1} max={60} value={localConfig.doorOpenMaxMin || 15} onChange={(e) => setLocalConfig({ ...localConfig, doorOpenMaxMin: parseInt(e.target.value) })} style={{ maxWidth: 100 }} />
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>minutos</span>
                  </div>
                </div>
              </>
            )}

            {/* ── EPIs ── */}
            {activeTab === 'epi' && (
              <>
                <div className="cfg-info">
                  <span className="cfg-info-ico"><Icon.InformationCircle /></span>
                  <span>Configuração lida do banco de dados. Gerencie via <strong>SmartX HUB → Configurações → EPI</strong>.</span>
                </div>

                {!epiConfig ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                    <div className="cfg-spin" style={{ borderColor: 'rgba(59,130,246,0.2)', borderTopColor: '#3b82f6' }} />
                    Carregando configuração de EPIs…
                  </div>
                ) : epiEntries.length === 0 ? (
                  <div className="cfg-warn">
                    <span className="cfg-info-ico"><Icon.ExclamationTriangle /></span>
                    <span>Nenhum EPI configurado no banco.</span>
                  </div>
                ) : epiEntries.map(([cls, cfg]) => (
                  <div key={cls} className={`cfg-epi ${cfg.enabled ? '' : 'off'}`}>
                    <div className="cfg-epi-l">
                      <div className="cfg-epi-av"><Icon.ShieldCheck /></div>
                      <div>
                        <div className="cfg-epi-name">{EPI_LABELS[cls] || cls}</div>
                        <div className="cfg-epi-cls">{cls}</div>
                      </div>
                    </div>
                    <div className="cfg-epi-badges">
                      <span className={`cfg-bdg ${cfg.enabled ? 'b-blue' : 'b-gray'}`}>{cfg.enabled ? 'ATIVO' : 'INATIVO'}</span>
                      {cfg.enabled && <span className={`cfg-bdg ${cfg.required ? 'b-red' : 'b-green'}`}>{cfg.required ? 'OBRIGATÓRIO' : 'OPCIONAL'}</span>}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ── SISTEMA ── */}
            {activeTab === 'system' && (
              <>
                <div className="cfg-section">
                  <Icon.Building /> Identificação do Sistema
                </div>
                {SYSTEM_FIELDS.slice(0, 4).map((f) => (
                  <div key={f.key} className="cfg-card">
                    <div className="cfg-card-head">
                      <span className="cfg-card-ico">{f.icon}</span>
                      <div>
                        <div className="cfg-card-label">{f.label}</div>
                        {f.hint && <div className="cfg-card-hint">{f.hint}</div>}
                      </div>
                    </div>
                    <input
                      className="cfg-input" type={f.type} placeholder={f.placeholder}
                      value={String(localConfig[f.key] ?? '')}
                      onChange={(e) => setLocalConfig({ ...localConfig, [f.key]: f.type === 'number' ? parseFloat(e.target.value) : e.target.value })}
                      style={{ maxWidth: 260 }}
                    />
                  </div>
                ))}

                <div className="cfg-section" style={{ marginTop: 4 }}>
                  <Icon.Lock /> Fechadura ESP32 (MIXHUB)
                </div>
                {SYSTEM_FIELDS.slice(4).map((f) => (
                  <div key={f.key} className="cfg-card">
                    <div className="cfg-card-head">
                      <span className="cfg-card-ico">{f.icon}</span>
                      <div>
                        <div className="cfg-card-label">{f.label}</div>
                        {f.hint && <div className="cfg-card-hint">{f.hint}</div>}
                      </div>
                    </div>
                    <input
                      className="cfg-input" type={f.type} placeholder={f.placeholder}
                      value={String(localConfig[f.key] ?? '')}
                      onChange={(e) => setLocalConfig({ ...localConfig, [f.key]: f.type === 'number' ? parseFloat(e.target.value) : e.target.value })}
                      style={{ maxWidth: 260 }}
                    />
                  </div>
                ))}

                <div className="cfg-ep">
                  <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Icon.Signal /><strong>Endpoints Ativos</strong>
                  </div>
                  <div>API Base: <span className="ep-blue">{apiBase || '—'}</span></div>
                  <div>Unlock: <span className="ep-green">POST http://{String(localConfig.lockIpAddress || '…')}/unlock</span></div>
                  <div style={{ marginTop: 4 }}>Versão: SmartX EPI Tablet v1.0</div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="cfg-footer">
            <button className="cfg-cancel" onClick={onClose}>
              <Icon.X /> Cancelar
            </button>
            <button className={`cfg-save ${saved ? 'saved' : ''}`} onClick={handleSave} disabled={saving}>
              {saving
                ? <><div className="cfg-spin" /> Salvando…</>
                : saved
                ? <><Icon.Check /> Salvo!</>
                : <><Icon.Floppy /> Salvar</>}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}