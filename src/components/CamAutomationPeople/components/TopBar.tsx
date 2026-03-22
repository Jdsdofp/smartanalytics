// // // // src/components/CamAutomationPeople/components/TopBar.tsx
// // // // TopBar RESPONSIVO com detecção automática de tela
// // // // Adaptação automática: Desktop (completo) → Tablet (compacto) → Mobile (ícones)

// // // import React, { useState } from 'react';
// // // import { ClockIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

// // // export type DoorStatus = 'locked' | 'unlocked' | 'error';

// // // export interface SysConfig {
// // //   allowedTimeInside: number;
// // //   warnBeforeExpiry: number;
// // // }

// // // interface TopBarProps {
// // //   doorStatus: DoorStatus;
// // //   config?: SysConfig;
// // //   onOpenReport?: () => void;
// // //   onOpenConfig?: () => void;
// // //   minimal?: boolean;
// // //   overlay?: boolean;
// // // }

// // // export default function TopBar({
// // //   doorStatus,
// // //   //@ts-ignore
// // //   config = { allowedTimeInside: 60, warnBeforeExpiry: 5 },
// // //   onOpenReport,
// // //   onOpenConfig,
// // //   minimal = false,
// // //   overlay = false,
// // // }: TopBarProps) {
// // //   const [isSmallScreen, setIsSmallScreen] = React.useState(false);
// // //   const [isMobileScreen, setIsMobileScreen] = React.useState(false);

  
// // //   React.useEffect(() => {
// // //     const checkSize = () => {
// // //       const width = window.innerWidth;
// // //       setIsMobileScreen(width < 768);  
// // //       setIsSmallScreen(width < 1024); 
// // //     };
// // //     checkSize();
// // //     window.addEventListener('resize', checkSize);
// // //     return () => window.removeEventListener('resize', checkSize);
// // //   }, []);
  
// // //   if (overlay) {
// // //     return (
// // //       <div style={{
// // //         position: 'absolute',
// // //         top: 12,
// // //         right: 12,
// // //         display: 'flex',
// // //         gap: 8,
// // //         zIndex: 30,
// // //       }}>
// // //         {onOpenReport && (
// // //           <FloatingButton
// // //             icon={<ClockIcon style={{ width: 20, height: 20, strokeWidth: 2 }} />}
// // //             onClick={onOpenReport}
// // //             label="Permanência"
// // //           />
// // //         )}
// // //         {onOpenConfig && (
// // //           <FloatingButton
// // //             icon={<Cog6ToothIcon style={{ width: 20, height: 20, strokeWidth: 2 }} />}
// // //             onClick={onOpenConfig}
// // //             label="Config"
// // //           />
// // //         )}
// // //       </div>
// // //     );
// // //   }

// // //   if (minimal) {
// // //     return (
// // //       <div style={{
// // //         position: 'absolute',
// // //         top: 12,
// // //         right: 12,
// // //         display: 'flex',
// // //         gap: 8,
// // //         zIndex: 20,
// // //       }}>
// // //         {onOpenReport && (
// // //           <button
// // //             onClick={onOpenReport}
// // //             style={{
// // //               width: 44,
// // //               height: 44,
// // //               borderRadius: '50%',
// // //               border: 'none',
// // //               background: 'rgba(33, 40, 54, 0.85)',
// // //               backdropFilter: 'blur(12px)',
// // //               display: 'flex',
// // //               alignItems: 'center',
// // //               justifyContent: 'center',
// // //               cursor: 'pointer',
// // //               color: '#fff',
// // //               transition: 'all 200ms ease',
// // //               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
// // //             }}
// // //             onMouseEnter={(e) => {
// // //               e.currentTarget.style.background = 'rgba(0, 132, 255, 0.85)';
// // //               e.currentTarget.style.transform = 'scale(1.1)';
// // //             }}
// // //             onMouseLeave={(e) => {
// // //               e.currentTarget.style.background = 'rgba(33, 40, 54, 0.85)';
// // //               e.currentTarget.style.transform = 'scale(1)';
// // //             }}
// // //           >
// // //             <ClockIcon style={{ width: 22, height: 22 }} />
// // //           </button>
// // //         )}
// // //         {onOpenConfig && (
// // //           <button
// // //             onClick={onOpenConfig}
// // //             style={{
// // //               width: 44,
// // //               height: 44,
// // //               borderRadius: '50%',
// // //               border: 'none',
// // //               background: 'rgba(33, 40, 54, 0.85)',
// // //               backdropFilter: 'blur(12px)',
// // //               display: 'flex',
// // //               alignItems: 'center',
// // //               justifyContent: 'center',
// // //               cursor: 'pointer',
// // //               color: '#fff',
// // //               transition: 'all 200ms ease',
// // //               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
// // //             }}
// // //             onMouseEnter={(e) => {
// // //               e.currentTarget.style.background = 'rgba(0, 132, 255, 0.85)';
// // //               e.currentTarget.style.transform = 'scale(1.1)';
// // //             }}
// // //             onMouseLeave={(e) => {
// // //               e.currentTarget.style.background = 'rgba(33, 40, 54, 0.85)';
// // //               e.currentTarget.style.transform = 'scale(1)';
// // //             }}
// // //           >
// // //             <Cog6ToothIcon style={{ width: 22, height: 22 }} />
// // //           </button>
// // //         )}
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div style={{
// // //       width: '100%',
// // //       height: isMobileScreen ? 'auto' : 60,
// // //       minHeight: isMobileScreen ? 44 : 60,
// // //       background: 'var(--bg-panel)',
// // //       borderBottom: '1px solid var(--border)',
// // //       display: 'flex',
// // //       flexDirection: isMobileScreen ? 'column' : 'row',
// // //       alignItems: 'center',
// // //       justifyContent: 'space-between',
// // //       padding: isMobileScreen ? '0.5rem 0.75rem' : isSmallScreen ? '0 1rem' : '0 1.5rem',
// // //       gap: isMobileScreen ? '0.5rem' : '1rem',
// // //       flexShrink: 0,
// // //     }}>

// // //       <div style={{
// // //         display: 'flex',
// // //         alignItems: 'center',
// // //         gap: isMobileScreen ? '0.5rem' : isSmallScreen ? '0.75rem' : '1rem',
// // //         width: isMobileScreen ? '100%' : 'auto',
// // //         justifyContent: isMobileScreen ? 'space-between' : 'flex-start',
// // //         flexWrap: isMobileScreen ? 'nowrap' : 'wrap',
// // //       }}>
  
// // //         <img 
// // //           src="/logoSmartx.png" 
// // //           alt="SmartX Logo"
// // //           style={{
// // //             height: isMobileScreen ? 28 : isSmallScreen ? 32 : 40,
// // //             width: 'auto',
// // //             objectFit: 'contain',
// // //             flexShrink: 0,
// // //           }}
// // //         />
        

// // //         {!isSmallScreen && (
// // //           <div style={{
// // //             width: 1,
// // //             height: 32,
// // //             background: 'var(--border)',
// // //             flexShrink: 0,
// // //           }} />
// // //         )}

// // //         <h1 style={{
// // //           fontFamily: 'var(--font-head)',
// // //           fontSize: isMobileScreen ? '0.8rem' : isSmallScreen ? '0.9rem' : '1.1rem',
// // //           fontWeight: 600,
// // //           color: '#18181b',
// // //           margin: 0,
// // //           whiteSpace: 'nowrap',
// // //           overflow: 'hidden',
// // //           textOverflow: 'ellipsis',
// // //           flex: isMobileScreen ? 1 : 'none',
// // //         }}>
// // //           {isMobileScreen ? 'EPI Check' : 'EPI Check - Câmara Fria'}
// // //         </h1>
        
// // //         <DoorStatusBadge status={doorStatus} compact={isMobileScreen} />
// // //       </div>

  
// // //       <div style={{
// // //         display: 'flex',
// // //         gap: isMobileScreen ? '0.5rem' : '0.75rem',
// // //         alignItems: 'center',
// // //         width: isMobileScreen ? '100%' : 'auto',
// // //         flexShrink: 0,
// // //       }}>
// // //         {onOpenReport && (
// // //           <button
// // //             onClick={onOpenReport}
// // //             style={{
// // //               display: 'flex',
// // //               alignItems: 'center',
// // //               justifyContent: 'center',
// // //               gap: isSmallScreen ? '0.25rem' : '0.5rem',
// // //               padding: isMobileScreen ? '0.5rem' : isSmallScreen ? '0.4rem 0.75rem' : '0.5rem 1rem',
// // //               background: '#fff',
// // //               border: '1px solid var(--border)',
// // //               borderRadius: 8,
// // //               cursor: 'pointer',
// // //               fontFamily: 'var(--font-body)',
// // //               fontSize: isMobileScreen ? '0.7rem' : isSmallScreen ? '0.75rem' : '0.85rem',
// // //               fontWeight: 500,
// // //               color: '#3b82f6',
// // //               transition: 'all 200ms ease',
// // //               flex: isMobileScreen ? 1 : 'none',
// // //               whiteSpace: 'nowrap',
// // //             }}
// // //             onMouseEnter={(e) => {
// // //               e.currentTarget.style.background = '#f0f9ff';
// // //               e.currentTarget.style.borderColor = '#3b82f6';
// // //             }}
// // //             onMouseLeave={(e) => {
// // //               e.currentTarget.style.background = '#fff';
// // //               e.currentTarget.style.borderColor = 'var(--border)';
// // //             }}
// // //           >
// // //             <ClockIcon style={{ 
// // //               width: isMobileScreen ? 14 : isSmallScreen ? 16 : 18, 
// // //               height: isMobileScreen ? 14 : isSmallScreen ? 16 : 18 
// // //             }} />
// // //             {isMobileScreen ? '' : <span>Permanência</span>}
// // //           </button>
// // //         )}
        
// // //         {onOpenConfig && (
// // //           <button
// // //             onClick={onOpenConfig}
// // //             style={{
// // //               display: 'flex',
// // //               alignItems: 'center',
// // //               justifyContent: 'center',
// // //               gap: isSmallScreen ? '0.25rem' : '0.5rem',
// // //               padding: isMobileScreen ? '0.5rem' : isSmallScreen ? '0.4rem 0.75rem' : '0.5rem 1rem',
// // //               background: '#fff',
// // //               border: '1px solid var(--border)',
// // //               borderRadius: 8,
// // //               cursor: 'pointer',
// // //               fontFamily: 'var(--font-body)',
// // //               fontSize: isMobileScreen ? '0.7rem' : isSmallScreen ? '0.75rem' : '0.85rem',
// // //               fontWeight: 500,
// // //               color: '#71717a',
// // //               transition: 'all 200ms ease',
// // //               flex: isMobileScreen ? 1 : 'none',
// // //               whiteSpace: 'nowrap',
// // //             }}
// // //             onMouseEnter={(e) => {
// // //               e.currentTarget.style.background = '#fafafa';
// // //               e.currentTarget.style.borderColor = '#71717a';
// // //             }}
// // //             onMouseLeave={(e) => {
// // //               e.currentTarget.style.background = '#fff';
// // //               e.currentTarget.style.borderColor = 'var(--border)';
// // //             }}
// // //           >
// // //             <Cog6ToothIcon style={{ 
// // //               width: isMobileScreen ? 14 : isSmallScreen ? 16 : 18, 
// // //               height: isMobileScreen ? 14 : isSmallScreen ? 16 : 18 
// // //             }} />
// // //             {isMobileScreen ? '' : <span>Config</span>}
// // //           </button>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // // Componente de botão flutuante com tooltip
// // // interface FloatingButtonProps {
// // //   icon: React.ReactNode;
// // //   onClick: () => void;
// // //   label: string;
// // // }

// // // function FloatingButton({ icon, onClick, label }: FloatingButtonProps) {
// // //   const [hovered, setHovered] = useState(false);
// // //   const [showTooltip, setShowTooltip] = useState(false);

// // //   return (
// // //     <div style={{ position: 'relative' }}>
// // //       <button
// // //         onClick={onClick}
// // //         onMouseEnter={() => {
// // //           setHovered(true);
// // //           setShowTooltip(true);
// // //         }}
// // //         onMouseLeave={() => {
// // //           setHovered(false);
// // //           setShowTooltip(false);
// // //         }}
// // //         style={{
// // //           width: 40,
// // //           height: 40,
// // //           borderRadius: '50%',
// // //           border: '2px solid rgba(255, 255, 255, 0.25)',
// // //           background: hovered 
// // //             ? 'rgba(0, 132, 255, 0.9)' 
// // //             : 'rgba(33, 40, 54, 0.75)',
// // //           backdropFilter: 'blur(16px)',
// // //           display: 'flex',
// // //           alignItems: 'center',
// // //           justifyContent: 'center',
// // //           cursor: 'pointer',
// // //           color: '#fff',
// // //           transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
// // //           boxShadow: hovered
// // //             ? '0 8px 24px rgba(0, 132, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
// // //             : '0 4px 16px rgba(0, 0, 0, 0.3)',
// // //           transform: hovered ? 'scale(1.15)' : 'scale(1)',
// // //           position: 'relative',
// // //           overflow: 'hidden',
// // //         }}
// // //       >
// // //         {/* Brilho interno */}
// // //         {hovered && (
// // //           <div style={{
// // //             position: 'absolute',
// // //             top: '10%',
// // //             left: '10%',
// // //             width: '80%',
// // //             height: '40%',
// // //             borderRadius: '50%',
// // //             background: 'rgba(255, 255, 255, 0.25)',
// // //             filter: 'blur(4px)',
// // //             pointerEvents: 'none',
// // //           }} />
// // //         )}
        
// // //         {/* Ícone */}
// // //         <div style={{ position: 'relative', zIndex: 1 }}>
// // //           {icon}
// // //         </div>
// // //       </button>

// // //       {/* Tooltip */}
// // //       {showTooltip && (
// // //         <div style={{
// // //           position: 'absolute',
// // //           top: '100%',
// // //           right: 0,
// // //           marginTop: 8,
// // //           padding: '6px 12px',
// // //           background: 'rgba(33, 40, 54, 0.95)',
// // //           backdropFilter: 'blur(12px)',
// // //           borderRadius: 6,
// // //           fontSize: '0.75rem',
// // //           fontFamily: 'var(--font-body)',
// // //           fontWeight: 500,
// // //           color: '#fff',
// // //           whiteSpace: 'nowrap',
// // //           boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
// // //           animation: 'fadeIn 200ms ease',
// // //           pointerEvents: 'none',
// // //         }}>
// // //           {label}
// // //           {/* Seta */}
// // //           <div style={{
// // //             position: 'absolute',
// // //             bottom: '100%',
// // //             right: 12,
// // //             width: 0,
// // //             height: 0,
// // //             borderLeft: '6px solid transparent',
// // //             borderRight: '6px solid transparent',
// // //             borderBottom: '6px solid rgba(33, 40, 54, 0.95)',
// // //           }} />
// // //         </div>
// // //       )}

// // //       <style>{`
// // //         @keyframes fadeIn {
// // //           from { opacity: 0; transform: translateY(-4px); }
// // //           to { opacity: 1; transform: translateY(0); }
// // //         }
// // //       `}</style>
// // //     </div>
// // //   );
// // // }

// // // // Badge de status da porta RESPONSIVO
// // // interface DoorStatusBadgeProps {
// // //   status: DoorStatus;
// // //   compact?: boolean;
// // // }

// // // function DoorStatusBadge({ status, compact = false }: DoorStatusBadgeProps) {
// // //   const statusConfig = {
// // //     locked: { icon: '🔒', text: 'Trancada', color: '#ef4444' },
// // //     unlocked: { icon: '🔓', text: 'Aberta', color: '#10b981' },
// // //     error: { icon: '⚠️', text: 'Erro', color: '#f59e0b' },
// // //   };

// // //   const config = statusConfig[status] || statusConfig.locked;
  
// // //   return (
// // //     <div style={{
// // //       display: 'flex',
// // //       alignItems: 'center',
// // //       gap: compact ? '0.25rem' : '0.5rem',
// // //       padding: compact ? '0.25rem 0.5rem' : '0.375rem 0.75rem',
// // //       background: `${config.color}15`,
// // //       border: `1px solid ${config.color}40`,
// // //       borderRadius: 6,
// // //       fontSize: compact ? '0.7rem' : '0.8rem',
// // //       fontFamily: 'var(--font-body)',
// // //       fontWeight: 500,
// // //       color: config.color,
// // //       flexShrink: 0,
// // //     }}>
// // //       <span>{config.icon}</span>
// // //       {!compact && <span>{config.text}</span>}
// // //     </div>
// // //   );
// // // }



// // // src/components/CamAutomationPeople/components/TopBar.tsx
// // // TopBar RESPONSIVO com detecção automática de tela
// // // Adaptação automática: Desktop (completo) → Tablet (compacto) → Mobile (ícones)

// // import React, { useState } from 'react';
// // import { ClockIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

// // // Alinhado com o DoorStatus do hook useCamAutomation
// // export type DoorStatus = 'closed' | 'open' | 'alert' | 'waiting';

// // export interface SysConfig {
// //   allowedTimeInside: number;
// //   warnBeforeExpiry: number;
// // }

// // interface TopBarProps {
// //   doorStatus: DoorStatus;
// //   config?: SysConfig;
// //   onOpenReport?: () => void;
// //   onOpenConfig?: () => void;
// //   minimal?: boolean;
// //   overlay?: boolean;
// // }

// // export default function TopBar({
// //   doorStatus,
// //   //@ts-ignore
// //   config = { allowedTimeInside: 60, warnBeforeExpiry: 5 },
// //   onOpenReport,
// //   onOpenConfig,
// //   minimal = false,
// //   overlay = false,
// // }: TopBarProps) {
// //   const [isSmallScreen, setIsSmallScreen] = React.useState(false);
// //   const [isMobileScreen, setIsMobileScreen] = React.useState(false);

// //   React.useEffect(() => {
// //     const checkSize = () => {
// //       const width = window.innerWidth;
// //       setIsMobileScreen(width < 768);
// //       setIsSmallScreen(width < 1024);
// //     };
// //     checkSize();
// //     window.addEventListener('resize', checkSize);
// //     return () => window.removeEventListener('resize', checkSize);
// //   }, []);

// //   if (overlay) {
// //     return (
// //       <div style={{
// //         position: 'absolute',
// //         top: 12,
// //         right: 12,
// //         display: 'flex',
// //         gap: 8,
// //         zIndex: 30,
// //       }}>
// //         {onOpenReport && (
// //           <FloatingButton
// //             icon={<ClockIcon style={{ width: 20, height: 20, strokeWidth: 2 }} />}
// //             onClick={onOpenReport}
// //             label="Permanência"
// //           />
// //         )}
// //         {onOpenConfig && (
// //           <FloatingButton
// //             icon={<Cog6ToothIcon style={{ width: 20, height: 20, strokeWidth: 2 }} />}
// //             onClick={onOpenConfig}
// //             label="Config"
// //           />
// //         )}
// //       </div>
// //     );
// //   }

// //   if (minimal) {
// //     return (
// //       <div style={{
// //         position: 'absolute',
// //         top: 12,
// //         right: 12,
// //         display: 'flex',
// //         gap: 8,
// //         zIndex: 20,
// //       }}>
// //         {onOpenReport && (
// //           <button
// //             onClick={onOpenReport}
// //             style={{
// //               width: 44,
// //               height: 44,
// //               borderRadius: '50%',
// //               border: 'none',
// //               background: 'rgba(33, 40, 54, 0.85)',
// //               backdropFilter: 'blur(12px)',
// //               display: 'flex',
// //               alignItems: 'center',
// //               justifyContent: 'center',
// //               cursor: 'pointer',
// //               color: '#fff',
// //               transition: 'all 200ms ease',
// //               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
// //             }}
// //             onMouseEnter={(e) => {
// //               e.currentTarget.style.background = 'rgba(0, 132, 255, 0.85)';
// //               e.currentTarget.style.transform = 'scale(1.1)';
// //             }}
// //             onMouseLeave={(e) => {
// //               e.currentTarget.style.background = 'rgba(33, 40, 54, 0.85)';
// //               e.currentTarget.style.transform = 'scale(1)';
// //             }}
// //           >
// //             <ClockIcon style={{ width: 22, height: 22 }} />
// //           </button>
// //         )}
// //         {onOpenConfig && (
// //           <button
// //             onClick={onOpenConfig}
// //             style={{
// //               width: 44,
// //               height: 44,
// //               borderRadius: '50%',
// //               border: 'none',
// //               background: 'rgba(33, 40, 54, 0.85)',
// //               backdropFilter: 'blur(12px)',
// //               display: 'flex',
// //               alignItems: 'center',
// //               justifyContent: 'center',
// //               cursor: 'pointer',
// //               color: '#fff',
// //               transition: 'all 200ms ease',
// //               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
// //             }}
// //             onMouseEnter={(e) => {
// //               e.currentTarget.style.background = 'rgba(0, 132, 255, 0.85)';
// //               e.currentTarget.style.transform = 'scale(1.1)';
// //             }}
// //             onMouseLeave={(e) => {
// //               e.currentTarget.style.background = 'rgba(33, 40, 54, 0.85)';
// //               e.currentTarget.style.transform = 'scale(1)';
// //             }}
// //           >
// //             <Cog6ToothIcon style={{ width: 22, height: 22 }} />
// //           </button>
// //         )}
// //       </div>
// //     );
// //   }

// //   return (
// //     <div style={{
// //       width: '100%',
// //       height: isMobileScreen ? 'auto' : 60,
// //       minHeight: isMobileScreen ? 44 : 60,
// //       background: 'var(--bg-panel)',
// //       borderBottom: '1px solid var(--border)',
// //       display: 'flex',
// //       flexDirection: isMobileScreen ? 'column' : 'row',
// //       alignItems: 'center',
// //       justifyContent: 'space-between',
// //       padding: isMobileScreen ? '0.5rem 0.75rem' : isSmallScreen ? '0 1rem' : '0 1.5rem',
// //       gap: isMobileScreen ? '0.5rem' : '1rem',
// //       flexShrink: 0,
// //     }}>

// //       <div style={{
// //         display: 'flex',
// //         alignItems: 'center',
// //         gap: isMobileScreen ? '0.5rem' : isSmallScreen ? '0.75rem' : '1rem',
// //         width: isMobileScreen ? '100%' : 'auto',
// //         justifyContent: isMobileScreen ? 'space-between' : 'flex-start',
// //         flexWrap: isMobileScreen ? 'nowrap' : 'wrap',
// //       }}>

// //         <img
// //           src="/logoSmartx.png"
// //           alt="SmartX Logo"
// //           style={{
// //             height: isMobileScreen ? 28 : isSmallScreen ? 32 : 40,
// //             width: 'auto',
// //             objectFit: 'contain',
// //             flexShrink: 0,
// //           }}
// //         />

// //         {!isSmallScreen && (
// //           <div style={{
// //             width: 1,
// //             height: 32,
// //             background: 'var(--border)',
// //             flexShrink: 0,
// //           }} />
// //         )}

// //         <h1 style={{
// //           fontFamily: 'var(--font-head)',
// //           fontSize: isMobileScreen ? '0.8rem' : isSmallScreen ? '0.9rem' : '1.1rem',
// //           fontWeight: 600,
// //           color: '#18181b',
// //           margin: 0,
// //           whiteSpace: 'nowrap',
// //           overflow: 'hidden',
// //           textOverflow: 'ellipsis',
// //           flex: isMobileScreen ? 1 : 'none',
// //         }}>
// //           {isMobileScreen ? 'EPI Check' : 'EPI Check - Câmara Fria'}
// //         </h1>

// //         <DoorStatusBadge status={doorStatus} compact={isMobileScreen} />
// //       </div>

// //       <div style={{
// //         display: 'flex',
// //         gap: isMobileScreen ? '0.5rem' : '0.75rem',
// //         alignItems: 'center',
// //         width: isMobileScreen ? '100%' : 'auto',
// //         flexShrink: 0,
// //       }}>
// //         {onOpenReport && (
// //           <button
// //             onClick={onOpenReport}
// //             style={{
// //               display: 'flex',
// //               alignItems: 'center',
// //               justifyContent: 'center',
// //               gap: isSmallScreen ? '0.25rem' : '0.5rem',
// //               padding: isMobileScreen ? '0.5rem' : isSmallScreen ? '0.4rem 0.75rem' : '0.5rem 1rem',
// //               background: '#fff',
// //               border: '1px solid var(--border)',
// //               borderRadius: 8,
// //               cursor: 'pointer',
// //               fontFamily: 'var(--font-body)',
// //               fontSize: isMobileScreen ? '0.7rem' : isSmallScreen ? '0.75rem' : '0.85rem',
// //               fontWeight: 500,
// //               color: '#3b82f6',
// //               transition: 'all 200ms ease',
// //               flex: isMobileScreen ? 1 : 'none',
// //               whiteSpace: 'nowrap',
// //             }}
// //             onMouseEnter={(e) => {
// //               e.currentTarget.style.background = '#f0f9ff';
// //               e.currentTarget.style.borderColor = '#3b82f6';
// //             }}
// //             onMouseLeave={(e) => {
// //               e.currentTarget.style.background = '#fff';
// //               e.currentTarget.style.borderColor = 'var(--border)';
// //             }}
// //           >
// //             <ClockIcon style={{
// //               width: isMobileScreen ? 14 : isSmallScreen ? 16 : 18,
// //               height: isMobileScreen ? 14 : isSmallScreen ? 16 : 18,
// //             }} />
// //             {isMobileScreen ? '' : <span>Permanência</span>}
// //           </button>
// //         )}

// //         {onOpenConfig && (
// //           <button
// //             onClick={onOpenConfig}
// //             style={{
// //               display: 'flex',
// //               alignItems: 'center',
// //               justifyContent: 'center',
// //               gap: isSmallScreen ? '0.25rem' : '0.5rem',
// //               padding: isMobileScreen ? '0.5rem' : isSmallScreen ? '0.4rem 0.75rem' : '0.5rem 1rem',
// //               background: '#fff',
// //               border: '1px solid var(--border)',
// //               borderRadius: 8,
// //               cursor: 'pointer',
// //               fontFamily: 'var(--font-body)',
// //               fontSize: isMobileScreen ? '0.7rem' : isSmallScreen ? '0.75rem' : '0.85rem',
// //               fontWeight: 500,
// //               color: '#71717a',
// //               transition: 'all 200ms ease',
// //               flex: isMobileScreen ? 1 : 'none',
// //               whiteSpace: 'nowrap',
// //             }}
// //             onMouseEnter={(e) => {
// //               e.currentTarget.style.background = '#fafafa';
// //               e.currentTarget.style.borderColor = '#71717a';
// //             }}
// //             onMouseLeave={(e) => {
// //               e.currentTarget.style.background = '#fff';
// //               e.currentTarget.style.borderColor = 'var(--border)';
// //             }}
// //           >
// //             <Cog6ToothIcon style={{
// //               width: isMobileScreen ? 14 : isSmallScreen ? 16 : 18,
// //               height: isMobileScreen ? 14 : isSmallScreen ? 16 : 18,
// //             }} />
// //             {isMobileScreen ? '' : <span>Config</span>}
// //           </button>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // // ─── Botão flutuante com tooltip ──────────────────────────────────────────────

// // interface FloatingButtonProps {
// //   icon: React.ReactNode;
// //   onClick: () => void;
// //   label: string;
// // }

// // function FloatingButton({ icon, onClick, label }: FloatingButtonProps) {
// //   const [hovered, setHovered] = useState(false);
// //   const [showTooltip, setShowTooltip] = useState(false);

// //   return (
// //     <div style={{ position: 'relative' }}>
// //       <button
// //         onClick={onClick}
// //         onMouseEnter={() => { setHovered(true); setShowTooltip(true); }}
// //         onMouseLeave={() => { setHovered(false); setShowTooltip(false); }}
// //         style={{
// //           width: 40,
// //           height: 40,
// //           borderRadius: '50%',
// //           border: '2px solid rgba(255, 255, 255, 0.25)',
// //           background: hovered
// //             ? 'rgba(0, 132, 255, 0.9)'
// //             : 'rgba(33, 40, 54, 0.75)',
// //           backdropFilter: 'blur(16px)',
// //           display: 'flex',
// //           alignItems: 'center',
// //           justifyContent: 'center',
// //           cursor: 'pointer',
// //           color: '#fff',
// //           transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
// //           boxShadow: hovered
// //             ? '0 8px 24px rgba(0, 132, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
// //             : '0 4px 16px rgba(0, 0, 0, 0.3)',
// //           transform: hovered ? 'scale(1.15)' : 'scale(1)',
// //           position: 'relative',
// //           overflow: 'hidden',
// //         }}
// //       >
// //         {hovered && (
// //           <div style={{
// //             position: 'absolute',
// //             top: '10%',
// //             left: '10%',
// //             width: '80%',
// //             height: '40%',
// //             borderRadius: '50%',
// //             background: 'rgba(255, 255, 255, 0.25)',
// //             filter: 'blur(4px)',
// //             pointerEvents: 'none',
// //           }} />
// //         )}
// //         <div style={{ position: 'relative', zIndex: 1 }}>
// //           {icon}
// //         </div>
// //       </button>

// //       {showTooltip && (
// //         <div style={{
// //           position: 'absolute',
// //           top: '100%',
// //           right: 0,
// //           marginTop: 8,
// //           padding: '6px 12px',
// //           background: 'rgba(33, 40, 54, 0.95)',
// //           backdropFilter: 'blur(12px)',
// //           borderRadius: 6,
// //           fontSize: '0.75rem',
// //           fontFamily: 'var(--font-body)',
// //           fontWeight: 500,
// //           color: '#fff',
// //           whiteSpace: 'nowrap',
// //           boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
// //           animation: 'fadeIn 200ms ease',
// //           pointerEvents: 'none',
// //         }}>
// //           {label}
// //           <div style={{
// //             position: 'absolute',
// //             bottom: '100%',
// //             right: 12,
// //             width: 0,
// //             height: 0,
// //             borderLeft: '6px solid transparent',
// //             borderRight: '6px solid transparent',
// //             borderBottom: '6px solid rgba(33, 40, 54, 0.95)',
// //           }} />
// //         </div>
// //       )}

// //       <style>{`
// //         @keyframes fadeIn {
// //           from { opacity: 0; transform: translateY(-4px); }
// //           to   { opacity: 1; transform: translateY(0); }
// //         }
// //       `}</style>
// //     </div>
// //   );
// // }

// // // ─── Badge de status da porta ─────────────────────────────────────────────────

// // interface DoorStatusBadgeProps {
// //   status: DoorStatus;
// //   compact?: boolean;
// // }

// // function DoorStatusBadge({ status, compact = false }: DoorStatusBadgeProps) {
// //   const statusConfig: Record<DoorStatus, { icon: string; text: string; color: string }> = {
// //     closed:  { icon: '🔒', text: 'Trancada',   color: '#ef4444' },
// //     open:    { icon: '🔓', text: 'Aberta',     color: '#10b981' },
// //     alert:   { icon: '⚠️', text: 'Atenção',    color: '#f59e0b' },
// //     waiting: { icon: '⏳', text: 'Aguardando', color: '#3b82f6' },
// //   };

// //   const cfg = statusConfig[status] ?? statusConfig.closed;

// //   return (
// //     <div style={{
// //       display: 'flex',
// //       alignItems: 'center',
// //       gap: compact ? '0.25rem' : '0.5rem',
// //       padding: compact ? '0.25rem 0.5rem' : '0.375rem 0.75rem',
// //       background: `${cfg.color}15`,
// //       border: `1px solid ${cfg.color}40`,
// //       borderRadius: 6,
// //       fontSize: compact ? '0.7rem' : '0.8rem',
// //       fontFamily: 'var(--font-body)',
// //       fontWeight: 500,
// //       color: cfg.color,
// //       flexShrink: 0,
// //     }}>
// //       <span>{cfg.icon}</span>
// //       {!compact && <span>{cfg.text}</span>}
// //     </div>
// //   );
// // }


// // src/components/CamAutomationPeople/components/TopBar.tsx
// // TopBar RESPONSIVO com detecção automática de tela
// // Adaptação automática: Desktop (completo) → Tablet (compacto) → Mobile (ícones)
// // Integrado com WebSocket MIXHUB para status real da fechadura em tempo real

// import React, { useState } from 'react';
// import {
//   ClockIcon,
//   Cog6ToothIcon,
//   LockClosedIcon,
//   LockOpenIcon,
//   ExclamationTriangleIcon,
//   SignalIcon,
//   SignalSlashIcon
// } from '@heroicons/react/24/outline';
// import type { LockState } from '../../../hooks/useCamAutomation';
// import { BookOpenIcon } from '@heroicons/react/24/solid';

// // Alinhado com o DoorStatus do hook useCamAutomation (inclui door_open)
// export type DoorStatus = 'closed' | 'open' | 'door_open' | 'alert' | 'waiting';

// export interface SysConfig {
//   allowedTimeInside: number;
//   warnBeforeExpiry: number;
// }

// interface TopBarProps {
//   doorStatus: DoorStatus;
//   config?: SysConfig;
//   onOpenReport?: () => void;
//   onOpenConfig?: () => void;
//   minimal?: boolean;
//   overlay?: boolean;
//   /** Estado completo do WebSocket MIXHUB — opcional, enriquece o badge */
//   lockState?: LockState;
// }

// export default function TopBar({
//   doorStatus,
//   config = { allowedTimeInside: 60, warnBeforeExpiry: 5 },
//   onOpenReport,
//   onOpenConfig,
//   minimal = false,
//   overlay = false,
//   lockState,
// }: TopBarProps) {
//   const [isSmallScreen, setIsSmallScreen] = React.useState(false);
//   const [isMobileScreen, setIsMobileScreen] = React.useState(false);

//   React.useEffect(() => {
//     const checkSize = () => {
//       const width = window.innerWidth;
//       setIsMobileScreen(width < 768);
//       setIsSmallScreen(width < 1024);
//     };
//     checkSize();
//     window.addEventListener('resize', checkSize);
//     return () => window.removeEventListener('resize', checkSize);
//   }, []);

//   if (overlay) {
//     return (
//       <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8, zIndex: 30 }}>
//         {onOpenReport && (
//           <FloatingButton
//             icon={<ClockIcon style={{ width: 20, height: 20, strokeWidth: 2 }} />}
//             onClick={onOpenReport}
//             label="Permanência"
//           />
//         )}
//         {onOpenConfig && (
//           <FloatingButton
//             icon={<Cog6ToothIcon style={{ width: 20, height: 20, strokeWidth: 2 }} />}
//             onClick={onOpenConfig}
//             label="Config"
//           />
//         )}
//       </div>
//     );
//   }

//   if (minimal) {
//     return (
//       <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8, zIndex: 20 }}>
//         {onOpenReport && (
//           <MinimalButton onClick={onOpenReport}>
//             <ClockIcon style={{ width: 22, height: 22 }} />
//           </MinimalButton>
//         )}
//         {onOpenConfig && (
//           <MinimalButton onClick={onOpenConfig}>
//             <Cog6ToothIcon style={{ width: 22, height: 22 }} />
//           </MinimalButton>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div style={{
//       width: '100%',
//       height: isMobileScreen ? 'auto' : 60,
//       minHeight: isMobileScreen ? 44 : 60,
//       background: 'var(--bg-panel)',
//       borderBottom: '1px solid var(--border)',
//       display: 'flex',
//       flexDirection: isMobileScreen ? 'column' : 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       padding: isMobileScreen ? '0.5rem 0.75rem' : isSmallScreen ? '0 1rem' : '0 1.5rem',
//       gap: isMobileScreen ? '0.5rem' : '1rem',
//       flexShrink: 0,
//     }}>

//       {/* ── Esquerda: logo + título + badge ────────────────────────────── */}
//       <div style={{
//         display: 'flex', alignItems: 'center',
//         gap: isMobileScreen ? '0.5rem' : isSmallScreen ? '0.75rem' : '1rem',
//         width: isMobileScreen ? '100%' : 'auto',
//         justifyContent: isMobileScreen ? 'space-between' : 'flex-start',
//         flexWrap: isMobileScreen ? 'nowrap' : 'wrap',
//       }}>
//         <img
//           src="/logoSmartx.png"
//           alt="SmartX Logo"
//           style={{
//             height: isMobileScreen ? 28 : isSmallScreen ? 32 : 40,
//             width: 'auto', objectFit: 'contain', flexShrink: 0,
//           }}
//         />

//         {!isSmallScreen && (
//           <div style={{ width: 1, height: 32, background: 'var(--border)', flexShrink: 0 }} />
//         )}

//         <h1 style={{
//           fontFamily: 'var(--font-head)',
//           fontSize: isMobileScreen ? '0.8rem' : isSmallScreen ? '0.9rem' : '1.1rem',
//           fontWeight: 600, color: '#18181b', margin: 0,
//           whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
//           flex: isMobileScreen ? 1 : 'none',
//         }}>
//           {isMobileScreen ? 'EPI Check' : 'EPI Check - Câmara Fria'}
//         </h1>

//         {/* Badge de status — usa lockState se disponível, fallback para doorStatus */}
//         <DoorStatusBadge
//           status={doorStatus}
//           lockState={lockState}
//           compact={isMobileScreen}
//         />
//       </div>

//       {/* ── Direita: botões ─────────────────────────────────────────────── */}
//       <div style={{
//         display: 'flex', gap: isMobileScreen ? '0.5rem' : '0.75rem',
//         alignItems: 'center',
//         width: isMobileScreen ? '100%' : 'auto', flexShrink: 0,
//       }}>
//         {onOpenReport && (
//           <BarButton
//             onClick={onOpenReport}
//             icon={<ClockIcon style={{ width: isMobileScreen ? 14 : isSmallScreen ? 16 : 18, height: isMobileScreen ? 14 : isSmallScreen ? 16 : 18 }} />}
//             label="Permanência"
//             color="#3b82f6"
//             hoverBg="#f0f9ff"
//             mobile={isMobileScreen}
//             small={isSmallScreen}
//           />
//         )}
//         {onOpenConfig && (
//           <BarButton
//             onClick={onOpenConfig}
//             icon={<Cog6ToothIcon style={{ width: isMobileScreen ? 14 : isSmallScreen ? 16 : 18, height: isMobileScreen ? 14 : isSmallScreen ? 16 : 18 }} />}
//             label="Config"
//             color="#71717a"
//             hoverBg="#fafafa"
//             mobile={isMobileScreen}
//             small={isSmallScreen}
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── BarButton ────────────────────────────────────────────────────────────────

// function BarButton({ onClick, icon, label, color, hoverBg, mobile, small }: {
//   onClick: () => void; icon: React.ReactNode; label: string;
//   color: string; hoverBg: string; mobile: boolean; small: boolean;
// }) {
//   const [hovered, setHovered] = useState(false);
//   return (
//     <button
//       onClick={onClick}
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       style={{
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         gap: small ? '0.25rem' : '0.5rem',
//         padding: mobile ? '0.5rem' : small ? '0.4rem 0.75rem' : '0.5rem 1rem',
//         background: hovered ? hoverBg : '#fff',
//         border: `1px solid ${hovered ? color : 'var(--border)'}`,
//         borderRadius: 8, cursor: 'pointer',
//         fontFamily: 'var(--font-body)',
//         fontSize: mobile ? '0.7rem' : small ? '0.75rem' : '0.85rem',
//         fontWeight: 500, color,
//         transition: 'all 200ms ease',
//         flex: mobile ? 1 : 'none', whiteSpace: 'nowrap',
//       }}
//     >
//       {icon}
//       {!mobile && <span>{label}</span>}
//     </button>
//   );
// }

// // ─── MinimalButton ────────────────────────────────────────────────────────────

// function MinimalButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
//   const [hovered, setHovered] = useState(false);
//   return (
//     <button
//       onClick={onClick}
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       style={{
//         width: 44, height: 44, borderRadius: '50%', border: 'none',
//         background: hovered ? 'rgba(0,132,255,0.85)' : 'rgba(33,40,54,0.85)',
//         backdropFilter: 'blur(12px)',
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         cursor: 'pointer', color: '#fff', transition: 'all 200ms ease',
//         boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
//         transform: hovered ? 'scale(1.1)' : 'scale(1)',
//       }}
//     >
//       {children}
//     </button>
//   );
// }

// // ─── FloatingButton com tooltip ───────────────────────────────────────────────

// interface FloatingButtonProps {
//   icon: React.ReactNode;
//   onClick: () => void;
//   label: string;
// }

// function FloatingButton({ icon, onClick, label }: FloatingButtonProps) {
//   const [hovered, setHovered] = useState(false);
//   const [showTooltip, setShowTooltip] = useState(false);

//   return (
//     <div style={{ position: 'relative' }}>
//       <button
//         onClick={onClick}
//         onMouseEnter={() => { setHovered(true); setShowTooltip(true); }}
//         onMouseLeave={() => { setHovered(false); setShowTooltip(false); }}
//         style={{
//           width: 40, height: 40, borderRadius: '50%',
//           border: '2px solid rgba(255,255,255,0.25)',
//           background: hovered ? 'rgba(0,132,255,0.9)' : 'rgba(33,40,54,0.75)',
//           backdropFilter: 'blur(16px)',
//           display: 'flex', alignItems: 'center', justifyContent: 'center',
//           cursor: 'pointer', color: '#fff', transition: 'all 250ms cubic-bezier(0.4,0,0.2,1)',
//           boxShadow: hovered
//             ? '0 8px 24px rgba(0,132,255,0.4), 0 4px 12px rgba(0,0,0,0.3)'
//             : '0 4px 16px rgba(0,0,0,0.3)',
//           transform: hovered ? 'scale(1.15)' : 'scale(1)',
//           position: 'relative', overflow: 'hidden',
//         }}
//       >
//         {hovered && (
//           <div style={{
//             position: 'absolute', top: '10%', left: '10%',
//             width: '80%', height: '40%', borderRadius: '50%',
//             background: 'rgba(255,255,255,0.25)', filter: 'blur(4px)', pointerEvents: 'none',
//           }} />
//         )}
//         <div style={{ position: 'relative', zIndex: 1 }}>{icon}</div>
//       </button>

//       {showTooltip && (
//         <div style={{
//           position: 'absolute', top: '100%', right: 0, marginTop: 8,
//           padding: '6px 12px', background: 'rgba(33,40,54,0.95)',
//           backdropFilter: 'blur(12px)', borderRadius: 6,
//           fontSize: '0.75rem', fontFamily: 'var(--font-body)', fontWeight: 500,
//           color: '#fff', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
//           animation: 'fadeIn 200ms ease', pointerEvents: 'none',
//         }}>
//           {label}
//           <div style={{
//             position: 'absolute', bottom: '100%', right: 12,
//             width: 0, height: 0,
//             borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
//             borderBottom: '6px solid rgba(33,40,54,0.95)',
//           }} />
//         </div>
//       )}

//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(-4px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//       `}</style>
//     </div>
//   );
// }

// // ─── DoorStatusBadge ─────────────────────────────────────────────────────────
// //
// // Prioridade de informação:
// //   1. lockState (WebSocket real) — se disponível e conectado
// //   2. doorStatus (estado interno do hook) — fallback
// //
// // Exibe adicionalmente:
// //   - Indicador de conexão WebSocket (ponto verde/cinza)
// //   - door_state físico (reed switch) quando diferente do lock_state

// interface DoorStatusBadgeProps {
//   status: DoorStatus;
//   lockState?: LockState;
//   compact?: boolean;
// }

// function DoorStatusBadge({ status, lockState, compact = false }: DoorStatusBadgeProps) {

//   // ── Configuração visual por status ────────────────────────────────────────
//   type StatusCfg = { icon: React.ReactNode; text: string; color: string; pulse?: boolean };

//   const statusConfig: Record<DoorStatus, StatusCfg> = {
//     closed: {
//       icon: <LockClosedIcon style={{ width: 14, height: 14, strokeWidth: 2 }} />,
//       text: 'Trancada', color: '#ef4444',
//     },
//     open: {
//       icon: <LockOpenIcon style={{ width: 14, height: 14, strokeWidth: 2 }} />,
//       text: 'Destrancada', color: '#10b981', pulse: true,
//     },
//     door_open: {
//       icon: <BookOpenIcon style={{ width: 14, height: 14, strokeWidth: 2 }} />,
//       text: 'Porta aberta', color: '#f59e0b', pulse: true,
//     },
//     alert: {
//       icon: <ExclamationTriangleIcon style={{ width: 14, height: 14, strokeWidth: 2 }} />,
//       text: 'Atenção', color: '#f59e0b',
//     },
//     waiting: {
//       icon: <LockClosedIcon style={{ width: 14, height: 14, strokeWidth: 2 }} />,
//       text: 'Aguardando', color: '#3b82f6',
//     },
//   };

//   // ── Determina status efetivo a partir do lockState (WebSocket) ────────────
//   let effectiveStatus = status;
//   let extraLabel: string | null = null;

//   if (lockState?.connected) {
//     if (lockState.lockState === 'unlocked') {
//       effectiveStatus = 'open';
//     } else if (lockState.doorState === 'open') {
//       effectiveStatus = 'door_open';
//       extraLabel = 'fechadura travada';
//     } else {
//       effectiveStatus = 'closed';
//     }
//   } else if (lockState && !lockState.connected) {
//     // WS configurado mas desconectado — mostra alerta de conexão
//     effectiveStatus = 'alert';
//   }

//   const cfg = statusConfig[effectiveStatus] ?? statusConfig.closed;
//   const wsConnected = lockState?.connected ?? null; // null = WS não configurado

//   return (
//     <div style={{
//       display: 'flex', alignItems: 'center',
//       gap: compact ? '0.3rem' : '0.5rem',
//       flexShrink: 0,
//     }}>

//       {/* Badge principal */}
//       <div style={{
//         display: 'flex', alignItems: 'center',
//         gap: compact ? '0.25rem' : '0.4rem',
//         padding: compact ? '3px 8px' : '4px 10px',
//         background: `${cfg.color}12`,
//         border: `1px solid ${cfg.color}35`,
//         borderRadius: 20,
//         fontSize: compact ? '0.65rem' : '0.75rem',
//         fontWeight: 600, color: cfg.color,
//         position: 'relative',
//       }}>
//         {cfg.icon}
//         {!compact && <span>{cfg.text}</span>}
//         {compact && (
//           // Ponto pulsante no modo compacto
//           <span style={{
//             width: 6, height: 6, borderRadius: '50%',
//             background: cfg.color,
//             display: 'inline-block',
//             animation: cfg.pulse ? 'tbPulse 1.8s ease infinite' : 'none',
//           }} />
//         )}
//         {!compact && cfg.pulse && (
//           <span style={{
//             width: 6, height: 6, borderRadius: '50%',
//             background: cfg.color, display: 'inline-block',
//             animation: 'tbPulse 1.8s ease infinite',
//           }} />
//         )}
//       </div>

//       {/* Sub-label: info física (ex: "fechadura travada" enquanto porta aberta) */}
//       {!compact && extraLabel && (
//         <span style={{
//           fontSize: '0.62rem', color: '#94a3b8', fontStyle: 'italic',
//         }}>
//           {extraLabel}
//         </span>
//       )}

//       {/* Indicador de conexão WebSocket — só exibe se lockState foi passado */}
//       {wsConnected !== null && (
//         <div
//           title={wsConnected
//             ? `WebSocket conectado · v${lockState?.version ?? '?'} · ${lockState?.eventCount ?? 0} eventos`
//             : 'WebSocket desconectado — tentando reconectar…'}
//           style={{
//             display: 'flex', alignItems: 'center',
//             color: wsConnected ? '#10b981' : '#94a3b8',
//             cursor: 'help',
//           }}
//         >
//           {wsConnected
//             ? <SignalIcon style={{ width: 14, height: 14, strokeWidth: 2 }} />
//             : <SignalSlashIcon style={{ width: 14, height: 14, strokeWidth: 2 }} />}
//         </div>
//       )}

//       <style>{`
//         @keyframes tbPulse {
//           0%, 100% { opacity: 1; transform: scale(1); }
//           50%       { opacity: 0.5; transform: scale(0.8); }
//         }
//       `}</style>
//     </div>
//   );
// }


// src/components/CamAutomationPeople/components/TopBar.tsx
// TopBar RESPONSIVO com detecção automática de tela
// Adaptação automática: Desktop (completo) → Tablet (compacto) → Mobile (ícones)
// Integrado com WebSocket MIXHUB para status real da fechadura em tempo real

import React, { useState } from 'react';
import {
  ClockIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  LockOpenIcon,
  ExclamationTriangleIcon,
  SignalIcon,
  SignalSlashIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

// Importa os tipos do hook — fonte única de verdade
import type { LockState, SysConfig } from '../../../hooks/useCamAutomation';

// Alinhado com o DoorStatus do hook useCamAutomation (inclui door_open)
export type DoorStatus = 'closed' | 'open' | 'door_open' | 'alert' | 'waiting';

interface TopBarProps {
  doorStatus: DoorStatus;
  /** Recebe o SysConfig completo do hook — sem tipo local separado */
  config?: SysConfig;
  onOpenReport?: () => void;
  onOpenConfig?: () => void;
  minimal?: boolean;
  overlay?: boolean;
  /** Estado completo do WebSocket MIXHUB — opcional, enriquece o badge */
  lockState?: LockState;
}

export default function TopBar({
  doorStatus,
  config,
  onOpenReport,
  onOpenConfig,
  minimal = false,
  overlay = false,
  lockState,
}: TopBarProps) {
  const [isSmallScreen, setIsSmallScreen] = React.useState(false);
  const [isMobileScreen, setIsMobileScreen] = React.useState(false);

  React.useEffect(() => {
    const checkSize = () => {
      const width = window.innerWidth;
      setIsMobileScreen(width < 768);
      setIsSmallScreen(width < 1024);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  if (overlay) {
    return (
      <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8, zIndex: 30 }}>
        {onOpenReport && (
          <FloatingButton
            icon={<ClockIcon style={{ width: 20, height: 20, strokeWidth: 2 }} />}
            onClick={onOpenReport}
            label="Permanência"
          />
        )}
        {onOpenConfig && (
          <FloatingButton
            icon={<Cog6ToothIcon style={{ width: 20, height: 20, strokeWidth: 2 }} />}
            onClick={onOpenConfig}
            label="Config"
          />
        )}
      </div>
    );
  }

  if (minimal) {
    return (
      <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8, zIndex: 20 }}>
        {onOpenReport && (
          <MinimalButton onClick={onOpenReport}>
            <ClockIcon style={{ width: 22, height: 22 }} />
          </MinimalButton>
        )}
        {onOpenConfig && (
          <MinimalButton onClick={onOpenConfig}>
            <Cog6ToothIcon style={{ width: 22, height: 22 }} />
          </MinimalButton>
        )}
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      height: isMobileScreen ? 'auto' : 60,
      minHeight: isMobileScreen ? 44 : 60,
      background: 'var(--bg-panel)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      flexDirection: isMobileScreen ? 'column' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobileScreen ? '0.5rem 0.75rem' : isSmallScreen ? '0 1rem' : '0 1.5rem',
      gap: isMobileScreen ? '0.5rem' : '1rem',
      flexShrink: 0,
    }}>

      {/* ── Esquerda: logo + título + badge ────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: isMobileScreen ? '0.5rem' : isSmallScreen ? '0.75rem' : '1rem',
        width: isMobileScreen ? '100%' : 'auto',
        justifyContent: isMobileScreen ? 'space-between' : 'flex-start',
        flexWrap: isMobileScreen ? 'nowrap' : 'wrap',
      }}>
        <img
          src="/logoSmartx.png"
          alt="SmartX Logo"
          style={{
            height: isMobileScreen ? 28 : isSmallScreen ? 32 : 40,
            width: 'auto', objectFit: 'contain', flexShrink: 0,
          }}
        />

        {!isSmallScreen && (
          <div style={{ width: 1, height: 32, background: 'var(--border)', flexShrink: 0 }} />
        )}

        <h1 style={{
          fontFamily: 'var(--font-head)',
          fontSize: isMobileScreen ? '0.8rem' : isSmallScreen ? '0.9rem' : '1.1rem',
          fontWeight: 600, color: '#18181b', margin: 0,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          flex: isMobileScreen ? 1 : 'none',
        }}>
          {isMobileScreen ? 'EPI Check' : `EPI Check${config?.doorId ? ` · ${config.doorId}` : ' - Câmara Fria'}`}
        </h1>

        {/* Badge de status — usa lockState se disponível, fallback para doorStatus */}
        <DoorStatusBadge
          status={doorStatus}
          lockState={lockState}
          compact={isMobileScreen}
        />
      </div>

      {/* ── Direita: botões ─────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: isMobileScreen ? '0.5rem' : '0.75rem',
        alignItems: 'center',
        width: isMobileScreen ? '100%' : 'auto', flexShrink: 0,
      }}>
        {onOpenReport && (
          <BarButton
            onClick={onOpenReport}
            icon={
              <ClockIcon style={{
                width: isMobileScreen ? 14 : isSmallScreen ? 16 : 18,
                height: isMobileScreen ? 14 : isSmallScreen ? 16 : 18,
              }} />
            }
            label="Permanência"
            color="#3b82f6"
            hoverBg="#f0f9ff"
            mobile={isMobileScreen}
            small={isSmallScreen}
          />
        )}
        {onOpenConfig && (
          <BarButton
            onClick={onOpenConfig}
            icon={
              <Cog6ToothIcon style={{
                width: isMobileScreen ? 14 : isSmallScreen ? 16 : 18,
                height: isMobileScreen ? 14 : isSmallScreen ? 16 : 18,
              }} />
            }
            label="Config"
            color="#71717a"
            hoverBg="#fafafa"
            mobile={isMobileScreen}
            small={isSmallScreen}
          />
        )}
      </div>
    </div>
  );
}

// ─── BarButton ────────────────────────────────────────────────────────────────

function BarButton({ onClick, icon, label, color, hoverBg, mobile, small }: {
  onClick: () => void; icon: React.ReactNode; label: string;
  color: string; hoverBg: string; mobile: boolean; small: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: small ? '0.25rem' : '0.5rem',
        padding: mobile ? '0.5rem' : small ? '0.4rem 0.75rem' : '0.5rem 1rem',
        background: hovered ? hoverBg : '#fff',
        border: `1px solid ${hovered ? color : 'var(--border)'}`,
        borderRadius: 8, cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        fontSize: mobile ? '0.7rem' : small ? '0.75rem' : '0.85rem',
        fontWeight: 500, color,
        transition: 'all 200ms ease',
        flex: mobile ? 1 : 'none', whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {!mobile && <span>{label}</span>}
    </button>
  );
}

// ─── MinimalButton ────────────────────────────────────────────────────────────

function MinimalButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 44, height: 44, borderRadius: '50%', border: 'none',
        background: hovered ? 'rgba(0,132,255,0.85)' : 'rgba(33,40,54,0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#fff', transition: 'all 200ms ease',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transform: hovered ? 'scale(1.1)' : 'scale(1)',
      }}
    >
      {children}
    </button>
  );
}

// ─── FloatingButton com tooltip ───────────────────────────────────────────────

interface FloatingButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
}

function FloatingButton({ icon, onClick, label }: FloatingButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onClick}
        onMouseEnter={() => { setHovered(true); setShowTooltip(true); }}
        onMouseLeave={() => { setHovered(false); setShowTooltip(false); }}
        style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.25)',
          background: hovered ? 'rgba(0,132,255,0.9)' : 'rgba(33,40,54,0.75)',
          backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff',
          transition: 'all 250ms cubic-bezier(0.4,0,0.2,1)',
          boxShadow: hovered
            ? '0 8px 24px rgba(0,132,255,0.4), 0 4px 12px rgba(0,0,0,0.3)'
            : '0 4px 16px rgba(0,0,0,0.3)',
          transform: hovered ? 'scale(1.15)' : 'scale(1)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {hovered && (
          <div style={{
            position: 'absolute', top: '10%', left: '10%',
            width: '80%', height: '40%', borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)', filter: 'blur(4px)', pointerEvents: 'none',
          }} />
        )}
        <div style={{ position: 'relative', zIndex: 1 }}>{icon}</div>
      </button>

      {showTooltip && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 8,
          padding: '6px 12px', background: 'rgba(33,40,54,0.95)',
          backdropFilter: 'blur(12px)', borderRadius: 6,
          fontSize: '0.75rem', fontFamily: 'var(--font-body)', fontWeight: 500,
          color: '#fff', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          animation: 'fadeIn 200ms ease', pointerEvents: 'none',
        }}>
          {label}
          <div style={{
            position: 'absolute', bottom: '100%', right: 12,
            width: 0, height: 0,
            borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
            borderBottom: '6px solid rgba(33,40,54,0.95)',
          }} />
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── DoorStatusBadge ─────────────────────────────────────────────────────────
//
// Prioridade de informação:
//   1. lockState (WebSocket real) — se disponível e conectado
//   2. doorStatus (estado interno do hook) — fallback
//
// Exibe adicionalmente:
//   - Indicador de conexão WebSocket (SignalIcon/SignalSlashIcon)
//   - door_state físico (reed switch) quando diferente do lock_state

interface DoorStatusBadgeProps {
  status: DoorStatus;
  lockState?: LockState;
  compact?: boolean;
}

function DoorStatusBadge({ status, lockState, compact = false }: DoorStatusBadgeProps) {

  type StatusCfg = { icon: React.ReactNode; text: string; color: string; pulse?: boolean };

  const statusConfig: Record<DoorStatus, StatusCfg> = {
    closed: {
      icon: <LockClosedIcon style={{ width: 13, height: 13, strokeWidth: 2.5 }} />,
      text: 'Trancada', color: '#ef4444',
    },
    open: {
      icon: <LockOpenIcon style={{ width: 13, height: 13, strokeWidth: 2.5 }} />,
      text: 'Destrancada', color: '#10b981', pulse: true,
    },
    door_open: {
      icon: <ArrowRightOnRectangleIcon style={{ width: 13, height: 13, strokeWidth: 2.5 }} />,
      text: 'Porta aberta', color: '#f59e0b', pulse: true,
    },
    alert: {
      icon: <ExclamationTriangleIcon style={{ width: 13, height: 13, strokeWidth: 2.5 }} />,
      text: 'Atenção', color: '#f59e0b',
    },
    waiting: {
      icon: <LockClosedIcon style={{ width: 13, height: 13, strokeWidth: 2.5 }} />,
      text: 'Aguardando', color: '#3b82f6',
    },
  };

  // ── Determina status efetivo via WebSocket (prioritário) ──────────────────
  let effectiveStatus: DoorStatus = status;
  let extraLabel: string | null = null;

  if (lockState?.connected) {
    if (lockState.lockState === 'unlocked') {
      effectiveStatus = 'open';
    } else if (lockState.doorState === 'open') {
      effectiveStatus = 'door_open';
      extraLabel = 'fechadura travada';
    } else {
      effectiveStatus = 'closed';
    }
  } else if (lockState && !lockState.connected) {
    effectiveStatus = 'alert';
  }

  const cfg = statusConfig[effectiveStatus] ?? statusConfig.closed;
  const wsConfigured = lockState !== undefined; // WS foi passado como prop?
  const wsConnected  = lockState?.connected ?? false;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

      {/* Badge principal */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: compact ? 4 : 5,
        padding: compact ? '3px 7px' : '4px 9px',
        background: `${cfg.color}12`,
        border: `1px solid ${cfg.color}35`,
        borderRadius: 20,
        fontSize: compact ? '0.62rem' : '0.72rem',
        fontWeight: 600, color: cfg.color,
      }}>
        {cfg.icon}

        {/* Texto — só no modo completo */}
        {!compact && <span>{cfg.text}</span>}

        {/* Ponto pulsante */}
        {cfg.pulse && (
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: cfg.color, display: 'inline-block',
            animation: 'tbPulse 1.8s ease infinite', flexShrink: 0,
          }} />
        )}
      </div>

      {/* Sub-label — ex: "fechadura travada" quando porta aberta mas já re-travou */}
      {!compact && extraLabel && (
        <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontStyle: 'italic' }}>
          {extraLabel}
        </span>
      )}

      {/* Indicador WebSocket — só exibe se lockState foi passado */}
      {wsConfigured && (
        <div
          title={wsConnected
            ? `WebSocket conectado · firmware v${lockState?.version ?? '?'} · ${lockState?.eventCount ?? 0} eventos`
            : 'WebSocket desconectado — reconectando…'}
          style={{
            display: 'flex', alignItems: 'center',
            color: wsConnected ? '#10b981' : '#cbd5e1',
            transition: 'color 300ms',
            cursor: 'help',
          }}
        >
          {wsConnected
            ? <SignalIcon style={{ width: 13, height: 13, strokeWidth: 2 }} />
            : <SignalSlashIcon style={{ width: 13, height: 13, strokeWidth: 2 }} />}
        </div>
      )}

      <style>{`
        @keyframes tbPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.45; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
}