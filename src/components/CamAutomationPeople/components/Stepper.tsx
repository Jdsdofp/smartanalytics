// src/components/CamAutomationPeople/components/Stepper.tsx
// Stepper com modo OVERLAY para telas pequenas
// Progress flutuante compacto sobre a câmera (estilo Instagram Stories)

// import React from 'react';
// import {
//   UserIcon,
//   ShieldCheckIcon,
//   SparklesIcon,
//   CheckCircleIcon,
// } from '@heroicons/react/24/outline';

// type StepId = 'face' | 'epi' | 'ia' | 'access';

// interface Step {
//   id: StepId;
//   label: string;
//   number: number;
//   Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
// }

// interface StepperProps {
//   currentStep: StepId;
//   compact?: boolean;
//   overlay?: boolean; // Novo: modo overlay flutuante
// }

// const STEPS: Step[] = [
//   { id: 'face', label: 'Rosto', number: 1, Icon: UserIcon },
//   { id: 'epi', label: 'EPIs', number: 2, Icon: ShieldCheckIcon },
//   { id: 'ia', label: 'IA', number: 3, Icon: SparklesIcon },
//   { id: 'access', label: 'Acesso', number: 4, Icon: CheckCircleIcon },
// ];

// export default function Stepper({ currentStep, compact = false, overlay = false }: StepperProps) {
//   const currentIndex = STEPS.findIndex(s => s.id === currentStep);

//   // MODO OVERLAY - Apenas barras de progresso estilo Instagram Stories
//   if (overlay) {
//     return (
//       <div style={{
//         position: 'absolute',
//         top: 12,
//         left: 12,
//         right: 60, // Espaço para os botões da direita
//         display: 'flex',
//         gap: 4,
//         zIndex: 30,
//       }}>
//         {STEPS.map((step, index) => {
//           const isCompleted = index < currentIndex;
//           const isActive = index === currentIndex;
//           const progress = isCompleted ? 100 : isActive ? 50 : 0;

//           return (
//             <div
//               key={step.id}
//               style={{
//                 flex: 1,
//                 height: 3,
//                 background: 'rgba(255, 255, 255, 0.25)',
//                 borderRadius: 2,
//                 overflow: 'hidden',
//                 position: 'relative',
//                 backdropFilter: 'blur(8px)',
//               }}
//             >
//               {/* Barra de progresso */}
//               <div style={{
//                 position: 'absolute',
//                 left: 0,
//                 top: 0,
//                 bottom: 0,
//                 width: `${progress}%`,
//                 background: isCompleted 
//                   ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
//                   : isActive
//                   ? 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)'
//                   : 'transparent',
//                 transition: 'width 400ms ease',
//                 boxShadow: progress > 0 
//                   ? '0 0 8px rgba(59, 130, 246, 0.6)' 
//                   : 'none',
//               }}>
//                 {/* Shimmer animado */}
//                 {isActive && (
//                   <div style={{
//                     position: 'absolute',
//                     inset: 0,
//                     background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
//                     animation: 'shimmer-overlay 2s infinite',
//                   }} />
//                 )}
//               </div>
//             </div>
//           );
//         })}

//         <style>{`
//           @keyframes shimmer-overlay {
//             0% { transform: translateX(-100%); }
//             100% { transform: translateX(200%); }
//           }
//         `}</style>
//       </div>
//     );
//   }

//   // MODO COMPACT - Versão reduzida com ícones
//   if (compact) {
//     return (
//       <>
//         <div style={{
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           gap: 4,
//           padding: '8px 14px',
//           background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.95) 100%)',
//           backdropFilter: 'blur(12px)',
//           borderRadius: 12,
//           boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.06)',
//           border: '1px solid rgba(255, 255, 255, 0.8)',
//           position: 'relative',
//           overflow: 'hidden',
//         }}>
          
//           {/* Shimmer effect de fundo */}
//           <div style={{
//             position: 'absolute',
//             top: 0,
//             left: '-100%',
//             width: '200%',
//             height: '100%',
//             background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
//             animation: 'shimmer 3s infinite',
//           }} />

//           {STEPS.map((step, index) => {
//             const isActive = index === currentIndex;
//             const isCompleted = index < currentIndex;

//             return (
//               <React.Fragment key={step.id}>
//                 {/* Step Circle */}
//                 <div style={{
//                   display: 'flex',
//                   flexDirection: 'column',
//                   alignItems: 'center',
//                   gap: 3,
//                   position: 'relative',
//                   zIndex: 1,
//                 }}>
//                   {/* Circle com animações */}
//                   <div style={{
//                     position: 'relative',
//                     width: 32,
//                     height: 32,
//                   }}>
//                     {/* Glow pulsante para step ativo */}
//                     {isActive && (
//                       <>
//                         <div style={{
//                           position: 'absolute',
//                           inset: -6,
//                           borderRadius: '50%',
//                           background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
//                           animation: 'pulse-glow 2s ease-in-out infinite',
//                         }} />
//                         <div style={{
//                           position: 'absolute',
//                           inset: -3,
//                           borderRadius: '50%',
//                           border: '2px solid rgba(59, 130, 246, 0.3)',
//                           animation: 'pulse-ring 2s ease-in-out infinite',
//                         }} />
//                       </>
//                     )}

//                     {/* Círculo principal */}
//                     <div style={{
//                       width: '100%',
//                       height: '100%',
//                       borderRadius: '50%',
//                       background: isActive 
//                         ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
//                         : isCompleted 
//                         ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
//                         : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
//                       color: isActive || isCompleted ? '#ffffff' : '#9ca3af',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       fontFamily: 'var(--font-head)',
//                       fontSize: '0.75rem',
//                       fontWeight: 700,
//                       transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
//                       boxShadow: isActive 
//                         ? '0 8px 24px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
//                         : isCompleted
//                         ? '0 4px 12px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
//                         : '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
//                       transform: isActive ? 'scale(1.1)' : 'scale(1)',
//                       animation: isActive ? 'bounce-subtle 2s ease-in-out infinite' : 'none',
//                       position: 'relative',
//                       overflow: 'hidden',
//                     }}>
//                       {/* Brilho interno */}
//                       {(isActive || isCompleted) && (
//                         <div style={{
//                           position: 'absolute',
//                           top: '10%',
//                           left: '10%',
//                           width: '80%',
//                           height: '40%',
//                           borderRadius: '50%',
//                           background: 'rgba(255, 255, 255, 0.3)',
//                           filter: 'blur(4px)',
//                         }} />
//                       )}
                      
//                       {/* Ícone ou número */}
//                       <span style={{ 
//                         position: 'relative', 
//                         zIndex: 1,
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                       }}>
//                         {isCompleted ? (
//                           <CheckCircleIcon style={{ 
//                             width: 16, 
//                             height: 16,
//                             strokeWidth: 2.5,
//                           }} />
//                         ) : isActive ? (
//                           <step.Icon style={{ 
//                             width: 14, 
//                             height: 14,
//                             strokeWidth: 2.5,
//                           }} />
//                         ) : (
//                           <span style={{ fontSize: '0.75rem' }}>
//                             {step.number}
//                           </span>
//                         )}
//                       </span>

//                       {/* Partículas girando (apenas no ativo) */}
//                       {isActive && (
//                         <div style={{
//                           position: 'absolute',
//                           inset: -2,
//                           borderRadius: '50%',
//                           background: 'conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
//                           animation: 'spin-slow 3s linear infinite',
//                         }} />
//                       )}
//                     </div>
//                   </div>

//                   {/* Label com animação */}
//                   <div style={{
//                     fontFamily: 'var(--font-body)',
//                     fontSize: '0.6rem',
//                     fontWeight: isActive ? 700 : 600,
//                     color: isActive 
//                       ? '#3b82f6' 
//                       : isCompleted 
//                       ? '#10b981' 
//                       : '#9ca3af',
//                     transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
//                     textShadow: isActive 
//                       ? '0 0 8px rgba(59, 130, 246, 0.3)'
//                       : 'none',
//                     transform: isActive ? 'scale(1.05)' : 'scale(1)',
//                     letterSpacing: isActive ? '0.05em' : '0.02em',
//                   }}>
//                     {step.label}
//                   </div>
//                 </div>

//                 {/* Connector Line Animado com Efeitos Visuais */}
//                 {index < STEPS.length - 1 && (
//                   <div style={{
//                     position: 'relative',
//                     width: 20,
//                     height: 3,
//                     marginBottom: 16,
//                     overflow: 'visible',
//                     borderRadius: 2,
//                   }}>
//                     {/* Linha de fundo */}
//                     <div style={{
//                       position: 'absolute',
//                       inset: 0,
//                       background: '#e5e7eb',
//                       borderRadius: 2,
//                     }} />
                    
//                     {/* Linha de progresso com gradiente animado */}
//                     <div style={{
//                       position: 'absolute',
//                       inset: 0,
//                       background: isCompleted || index === currentIndex - 1
//                         ? 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #10b981 100%)' 
//                         : 'transparent',
//                       backgroundSize: '200% 100%',
//                       borderRadius: 2,
//                       transition: 'all 600ms cubic-bezier(0.4, 0, 0.2, 1)',
//                       boxShadow: isCompleted || index === currentIndex - 1
//                         ? '0 0 12px rgba(16, 185, 129, 0.6), 0 0 6px rgba(16, 185, 129, 0.4)'
//                         : 'none',
//                       animation: isCompleted || index === currentIndex - 1 
//                         ? 'gradient-flow 3s ease-in-out infinite'
//                         : 'none',
//                     }} />

//                     {/* Shimmer deslizante */}
//                     {(isCompleted || index === currentIndex - 1) && (
//                       <div style={{
//                         position: 'absolute',
//                         top: 0,
//                         left: 0,
//                         width: '100%',
//                         height: '100%',
//                         background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)',
//                         animation: 'slide-through 2s ease-in-out infinite',
//                         borderRadius: 2,
//                       }} />
//                     )}

//                     {/* Partículas brilhantes */}
//                     {(isCompleted || index === currentIndex - 1) && (
//                       <>
//                         <div style={{
//                           position: 'absolute',
//                           top: -2,
//                           left: '20%',
//                           width: 4,
//                           height: 4,
//                           borderRadius: '50%',
//                           background: '#10b981',
//                           boxShadow: '0 0 6px rgba(16, 185, 129, 0.8)',
//                           animation: 'particle-float-1 2s ease-in-out infinite',
//                         }} />
//                         <div style={{
//                           position: 'absolute',
//                           top: -2,
//                           left: '50%',
//                           width: 3,
//                           height: 3,
//                           borderRadius: '50%',
//                           background: '#34d399',
//                           boxShadow: '0 0 4px rgba(52, 211, 153, 0.8)',
//                           animation: 'particle-float-2 2.5s ease-in-out infinite',
//                         }} />
//                         <div style={{
//                           position: 'absolute',
//                           top: -2,
//                           left: '80%',
//                           width: 3,
//                           height: 3,
//                           borderRadius: '50%',
//                           background: '#6ee7b7',
//                           boxShadow: '0 0 4px rgba(110, 231, 183, 0.8)',
//                           animation: 'particle-float-3 3s ease-in-out infinite',
//                         }} />
//                       </>
//                     )}

//                     {/* Pulso de energia */}
//                     {index === currentIndex - 1 && (
//                       <div style={{
//                         position: 'absolute',
//                         right: -2,
//                         top: -1,
//                         width: 5,
//                         height: 5,
//                         borderRadius: '50%',
//                         background: '#10b981',
//                         boxShadow: '0 0 8px rgba(16, 185, 129, 1), 0 0 12px rgba(16, 185, 129, 0.6)',
//                         animation: 'energy-pulse 1.5s ease-in-out infinite',
//                       }} />
//                     )}
//                   </div>
//                 )}
//               </React.Fragment>
//             );
//           })}
//         </div>

//         {/* Animações CSS */}
//         <style>{`
//           @keyframes shimmer {
//             0% { transform: translateX(0); }
//             100% { transform: translateX(50%); }
//           }

//           @keyframes pulse-glow {
//             0%, 100% { 
//               opacity: 0.6;
//               transform: scale(1);
//             }
//             50% { 
//               opacity: 0.9;
//               transform: scale(1.1);
//             }
//           }

//           @keyframes pulse-ring {
//             0%, 100% { 
//               opacity: 0.3;
//               transform: scale(1);
//             }
//             50% { 
//               opacity: 0.6;
//               transform: scale(1.15);
//             }
//           }

//           @keyframes bounce-subtle {
//             0%, 100% { 
//               transform: scale(1.1) translateY(0);
//             }
//             50% { 
//               transform: scale(1.1) translateY(-2px);
//             }
//           }

//           @keyframes spin-slow {
//             from { transform: rotate(0deg); }
//             to { transform: rotate(360deg); }
//           }

//           @keyframes slide-through {
//             0% { transform: translateX(-100%); }
//             100% { transform: translateX(200%); }
//           }

//           @keyframes gradient-flow {
//             0%, 100% { 
//               background-position: 0% 50%;
//             }
//             50% { 
//               background-position: 100% 50%;
//             }
//           }

//           @keyframes particle-float-1 {
//             0%, 100% { 
//               transform: translateY(0) scale(1);
//               opacity: 0.8;
//             }
//             50% { 
//               transform: translateY(-4px) scale(1.2);
//               opacity: 1;
//             }
//           }

//           @keyframes particle-float-2 {
//             0%, 100% { 
//               transform: translateY(0) scale(1);
//               opacity: 0.6;
//             }
//             50% { 
//               transform: translateY(-3px) scale(1.3);
//               opacity: 1;
//             }
//           }

//           @keyframes particle-float-3 {
//             0%, 100% { 
//               transform: translateY(0) scale(1);
//               opacity: 0.7;
//             }
//             50% { 
//               transform: translateY(-5px) scale(1.1);
//               opacity: 1;
//             }
//           }

//           @keyframes energy-pulse {
//             0%, 100% { 
//               transform: scale(1);
//               opacity: 1;
//             }
//             50% { 
//               transform: scale(1.5);
//               opacity: 0.6;
//             }
//           }
//         `}</style>
//       </>
//     );
//   }

//   // MODO NORMAL - Versão completa (não implementado aqui, use compact)
//   return null;
// }

// // Helper function para mapear screen para step
// export function getStepFromScreen(screen: string): StepId {
//   switch (screen) {
//     case 'face_scan':
//       return 'face';
//     case 'epi_scan':
//       return 'epi';
//     case 'time_alert':
//       return 'ia';
//     case 'access_granted':
//     case 'access_denied':
//       return 'access';
//     default:
//       return 'face';
//   }
// }

// src/components/CamAutomationPeople/components/Stepper.tsx
// Stepper com modo OVERLAY para telas pequenas
// Progress flutuante compacto sobre a câmera (estilo Instagram Stories)

import React from 'react';
import {
  UserIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

type StepId = 'face' | 'epi' | 'ia' | 'access';

interface Step {
  id: StepId;
  label: string;
  number: number;
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

interface StepperProps {
  currentStep: StepId;
  compact?: boolean;
  overlay?: boolean; // Novo: modo overlay flutuante
}

const STEPS: Step[] = [
  { id: 'face', label: 'Rosto', number: 1, Icon: UserIcon },
  { id: 'epi', label: 'EPIs', number: 2, Icon: ShieldCheckIcon },
  { id: 'ia', label: 'IA', number: 3, Icon: SparklesIcon },
  { id: 'access', label: 'Acesso', number: 4, Icon: CheckCircleIcon },
];

export default function Stepper({ currentStep, compact = false, overlay = false }: StepperProps) {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  // MODO OVERLAY - Apenas barras de progresso estilo Instagram Stories
  if (overlay) {
    return (
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        right: 80, // Ajustado: mais espaço para os botões
        display: 'flex',
        gap: 4,
        zIndex: 50, // Aumentado: garante que fique acima de tudo
        pointerEvents: 'none', // Não interfere com cliques
      }}>
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const progress = isCompleted ? 100 : isActive ? 50 : 0;

          return (
            <div
              key={step.id}
              style={{
                flex: 1,
                height: 4, // Aumentado de 3 para 4px - mais visível
                background: 'rgba(255, 255, 255, 0.3)', // Mais opaco
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', // Sombra para destacar
              }}
            >
              {/* Barra de progresso */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${progress}%`,
                background: isCompleted 
                  ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                  : isActive
                  ? 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)'
                  : 'transparent',
                transition: 'width 400ms ease',
                boxShadow: progress > 0 
                  ? '0 0 8px rgba(59, 130, 246, 0.6)' 
                  : 'none',
              }}>
                {/* Shimmer animado */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
                    animation: 'shimmer-overlay 2s infinite',
                  }} />
                )}
              </div>
            </div>
          );
        })}

        <style>{`
          @keyframes shimmer-overlay {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}</style>
      </div>
    );
  }

  // MODO COMPACT - Versão reduzida com ícones
  if (compact) {
    return (
      <>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          padding: '8px 14px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.95) 100%)',
          backdropFilter: 'blur(12px)',
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          
          {/* Shimmer effect de fundo */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '200%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
            animation: 'shimmer 3s infinite',
          }} />

          {STEPS.map((step, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <React.Fragment key={step.id}>
                {/* Step Circle */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {/* Circle com animações */}
                  <div style={{
                    position: 'relative',
                    width: 32,
                    height: 32,
                  }}>
                    {/* Glow pulsante para step ativo */}
                    {isActive && (
                      <>
                        <div style={{
                          position: 'absolute',
                          inset: -6,
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
                          animation: 'pulse-glow 2s ease-in-out infinite',
                        }} />
                        <div style={{
                          position: 'absolute',
                          inset: -3,
                          borderRadius: '50%',
                          border: '2px solid rgba(59, 130, 246, 0.3)',
                          animation: 'pulse-ring 2s ease-in-out infinite',
                        }} />
                      </>
                    )}

                    {/* Círculo principal */}
                    <div style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: isActive 
                        ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
                        : isCompleted 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                        : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                      color: isActive || isCompleted ? '#ffffff' : '#9ca3af',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-head)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isActive 
                        ? '0 8px 24px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        : isCompleted
                        ? '0 4px 12px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        : '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                      transform: isActive ? 'scale(1.1)' : 'scale(1)',
                      animation: isActive ? 'bounce-subtle 2s ease-in-out infinite' : 'none',
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      {/* Brilho interno */}
                      {(isActive || isCompleted) && (
                        <div style={{
                          position: 'absolute',
                          top: '10%',
                          left: '10%',
                          width: '80%',
                          height: '40%',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.3)',
                          filter: 'blur(4px)',
                        }} />
                      )}
                      
                      {/* Ícone ou número */}
                      <span style={{ 
                        position: 'relative', 
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {isCompleted ? (
                          <CheckCircleIcon style={{ 
                            width: 16, 
                            height: 16,
                            strokeWidth: 2.5,
                          }} />
                        ) : isActive ? (
                          <step.Icon style={{ 
                            width: 14, 
                            height: 14,
                            strokeWidth: 2.5,
                          }} />
                        ) : (
                          <span style={{ fontSize: '0.75rem' }}>
                            {step.number}
                          </span>
                        )}
                      </span>

                      {/* Partículas girando (apenas no ativo) */}
                      {isActive && (
                        <div style={{
                          position: 'absolute',
                          inset: -2,
                          borderRadius: '50%',
                          background: 'conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                          animation: 'spin-slow 3s linear infinite',
                        }} />
                      )}
                    </div>
                  </div>

                  {/* Label com animação */}
                  <div style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.6rem',
                    fontWeight: isActive ? 700 : 600,
                    color: isActive 
                      ? '#3b82f6' 
                      : isCompleted 
                      ? '#10b981' 
                      : '#9ca3af',
                    transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                    textShadow: isActive 
                      ? '0 0 8px rgba(59, 130, 246, 0.3)'
                      : 'none',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    letterSpacing: isActive ? '0.05em' : '0.02em',
                  }}>
                    {step.label}
                  </div>
                </div>

                {/* Connector Line Animado com Efeitos Visuais */}
                {index < STEPS.length - 1 && (
                  <div style={{
                    position: 'relative',
                    width: 20,
                    height: 3,
                    marginBottom: 16,
                    overflow: 'visible',
                    borderRadius: 2,
                  }}>
                    {/* Linha de fundo */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: '#e5e7eb',
                      borderRadius: 2,
                    }} />
                    
                    {/* Linha de progresso com gradiente animado */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: isCompleted || index === currentIndex - 1
                        ? 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #10b981 100%)' 
                        : 'transparent',
                      backgroundSize: '200% 100%',
                      borderRadius: 2,
                      transition: 'all 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isCompleted || index === currentIndex - 1
                        ? '0 0 12px rgba(16, 185, 129, 0.6), 0 0 6px rgba(16, 185, 129, 0.4)'
                        : 'none',
                      animation: isCompleted || index === currentIndex - 1 
                        ? 'gradient-flow 3s ease-in-out infinite'
                        : 'none',
                    }} />

                    {/* Shimmer deslizante */}
                    {(isCompleted || index === currentIndex - 1) && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)',
                        animation: 'slide-through 2s ease-in-out infinite',
                        borderRadius: 2,
                      }} />
                    )}

                    {/* Partículas brilhantes */}
                    {(isCompleted || index === currentIndex - 1) && (
                      <>
                        <div style={{
                          position: 'absolute',
                          top: -2,
                          left: '20%',
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          background: '#10b981',
                          boxShadow: '0 0 6px rgba(16, 185, 129, 0.8)',
                          animation: 'particle-float-1 2s ease-in-out infinite',
                        }} />
                        <div style={{
                          position: 'absolute',
                          top: -2,
                          left: '50%',
                          width: 3,
                          height: 3,
                          borderRadius: '50%',
                          background: '#34d399',
                          boxShadow: '0 0 4px rgba(52, 211, 153, 0.8)',
                          animation: 'particle-float-2 2.5s ease-in-out infinite',
                        }} />
                        <div style={{
                          position: 'absolute',
                          top: -2,
                          left: '80%',
                          width: 3,
                          height: 3,
                          borderRadius: '50%',
                          background: '#6ee7b7',
                          boxShadow: '0 0 4px rgba(110, 231, 183, 0.8)',
                          animation: 'particle-float-3 3s ease-in-out infinite',
                        }} />
                      </>
                    )}

                    {/* Pulso de energia */}
                    {index === currentIndex - 1 && (
                      <div style={{
                        position: 'absolute',
                        right: -2,
                        top: -1,
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: '#10b981',
                        boxShadow: '0 0 8px rgba(16, 185, 129, 1), 0 0 12px rgba(16, 185, 129, 0.6)',
                        animation: 'energy-pulse 1.5s ease-in-out infinite',
                      }} />
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Animações CSS */}
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(0); }
            100% { transform: translateX(50%); }
          }

          @keyframes pulse-glow {
            0%, 100% { 
              opacity: 0.6;
              transform: scale(1);
            }
            50% { 
              opacity: 0.9;
              transform: scale(1.1);
            }
          }

          @keyframes pulse-ring {
            0%, 100% { 
              opacity: 0.3;
              transform: scale(1);
            }
            50% { 
              opacity: 0.6;
              transform: scale(1.15);
            }
          }

          @keyframes bounce-subtle {
            0%, 100% { 
              transform: scale(1.1) translateY(0);
            }
            50% { 
              transform: scale(1.1) translateY(-2px);
            }
          }

          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes slide-through {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }

          @keyframes gradient-flow {
            0%, 100% { 
              background-position: 0% 50%;
            }
            50% { 
              background-position: 100% 50%;
            }
          }

          @keyframes particle-float-1 {
            0%, 100% { 
              transform: translateY(0) scale(1);
              opacity: 0.8;
            }
            50% { 
              transform: translateY(-4px) scale(1.2);
              opacity: 1;
            }
          }

          @keyframes particle-float-2 {
            0%, 100% { 
              transform: translateY(0) scale(1);
              opacity: 0.6;
            }
            50% { 
              transform: translateY(-3px) scale(1.3);
              opacity: 1;
            }
          }

          @keyframes particle-float-3 {
            0%, 100% { 
              transform: translateY(0) scale(1);
              opacity: 0.7;
            }
            50% { 
              transform: translateY(-5px) scale(1.1);
              opacity: 1;
            }
          }

          @keyframes energy-pulse {
            0%, 100% { 
              transform: scale(1);
              opacity: 1;
            }
            50% { 
              transform: scale(1.5);
              opacity: 0.6;
            }
          }
        `}</style>
      </>
    );
  }

  // MODO NORMAL - Versão completa (não implementado aqui, use compact)
  return null;
}

// Helper function para mapear screen para step
export function getStepFromScreen(screen: string): StepId {
  switch (screen) {
    case 'face_scan':
      return 'face';
    case 'epi_scan':
      return 'epi';
    case 'time_alert':
      return 'ia';
    case 'access_granted':
    case 'access_denied':
      return 'access';
    default:
      return 'face';
  }
}