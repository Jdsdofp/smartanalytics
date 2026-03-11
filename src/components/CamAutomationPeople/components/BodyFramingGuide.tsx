// src/components/BodyFramingGuide/index.tsx
// Componente de overlay visual para guiar o posicionamento correto do corpo
// Mostra silhueta de referência e feedback em tempo real

// import React from 'react';
import type { FramingStatus } from '../../../hooks/useBodyFramingDetection';

interface BodyFramingGuideProps {
  status: FramingStatus;
  confidence: number;
  missingParts?: string[];
  showSilhouette?: boolean;
}

export default function BodyFramingGuide({
  status,
  confidence,
  missingParts = [],
  showSilhouette = true,
}: BodyFramingGuideProps) {
  
  if (status === 'well-framed') {
    // Não mostra overlay quando bem enquadrado
    return null;
  }

  const getStatusColor = () => {
    switch (status) {
      case 'too-close': return '#dc2626'; // red
      case 'partial': return '#f59e0b'; // amber
      case 'no-person': return '#6b7280'; // gray
      case 'checking': return '#0084ff'; // blue
      default: return '#6b7280';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'too-close': return '⬇️';
      case 'partial': return '⚠️';
      case 'no-person': return '👤';
      case 'checking': return '🔍';
      default: return '•';
    }
  };

  const getMessage = () => {
    switch (status) {
      case 'too-close': 
        return 'Afaste-se para que todo o corpo fique visível';
      case 'partial': 
        return missingParts.length > 0 
          ? `Ajuste para mostrar: ${missingParts.join(', ')}`
          : 'Ajuste sua posição';
      case 'no-person': 
        return 'Posicione-se em frente à câmera';
      case 'checking': 
        return 'Verificando posicionamento...';
      default: 
        return 'Ajuste sua posição';
    }
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 8,
    }}>
      
      {/* Silhueta de referência - mostra formato ideal */}
      {showSilhouette && status !== 'checking' && (
        <svg
          style={{
            position: 'absolute',
            inset: '5%',
            width: '90%',
            height: '90%',
            opacity: 0.3,
          }}
          viewBox="0 0 100 200"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Silhueta humana simplificada */}
          <defs>
            <linearGradient id="silhouetteGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={getStatusColor()} stopOpacity="0.4" />
              <stop offset="100%" stopColor={getStatusColor()} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Cabeça */}
          <ellipse 
            cx="50" 
            cy="15" 
            rx="8" 
            ry="10" 
            fill="url(#silhouetteGradient)"
            stroke={getStatusColor()}
            strokeWidth="1"
            strokeDasharray={missingParts.includes('Cabeça') ? '4,2' : '0'}
            opacity={missingParts.includes('Cabeça') ? 0.6 : 1}
          />
          
          {/* Pescoço */}
          <rect 
            x="48" 
            y="25" 
            width="4" 
            height="8" 
            fill="url(#silhouetteGradient)"
            stroke={getStatusColor()}
            strokeWidth="0.5"
          />
          
          {/* Tronco */}
          <path
            d="M 35 35 L 35 90 L 42 100 L 58 100 L 65 90 L 65 35 Z"
            fill="url(#silhouetteGradient)"
            stroke={getStatusColor()}
            strokeWidth="1"
            strokeDasharray={missingParts.includes('Tronco') ? '4,2' : '0'}
            opacity={missingParts.includes('Tronco') ? 0.6 : 1}
          />
          
          {/* Braço esquerdo */}
          <path
            d="M 35 40 L 20 45 L 18 70 L 22 72 L 24 48 L 38 43 Z"
            fill="url(#silhouetteGradient)"
            stroke={getStatusColor()}
            strokeWidth="0.8"
            strokeDasharray={missingParts.includes('Braços') ? '4,2' : '0'}
            opacity={missingParts.includes('Braços') ? 0.6 : 1}
          />
          
          {/* Braço direito */}
          <path
            d="M 65 40 L 80 45 L 82 70 L 78 72 L 76 48 L 62 43 Z"
            fill="url(#silhouetteGradient)"
            stroke={getStatusColor()}
            strokeWidth="0.8"
            strokeDasharray={missingParts.includes('Braços') ? '4,2' : '0'}
            opacity={missingParts.includes('Braços') ? 0.6 : 1}
          />
          
          {/* Perna esquerda */}
          <path
            d="M 42 100 L 40 150 L 38 190 L 44 192 L 46 152 L 48 100 Z"
            fill="url(#silhouetteGradient)"
            stroke={getStatusColor()}
            strokeWidth="0.8"
            strokeDasharray={missingParts.includes('Pernas/Pés') ? '4,2' : '0'}
            opacity={missingParts.includes('Pernas/Pés') ? 0.6 : 1}
          />
          
          {/* Perna direita */}
          <path
            d="M 58 100 L 60 150 L 62 190 L 56 192 L 54 152 L 52 100 Z"
            fill="url(#silhouetteGradient)"
            stroke={getStatusColor()}
            strokeWidth="0.8"
            strokeDasharray={missingParts.includes('Pernas/Pés') ? '4,2' : '0'}
            opacity={missingParts.includes('Pernas/Pés') ? 0.6 : 1}
          />
        </svg>
      )}

      {/* Indicadores de direção - apenas quando muito próximo */}
      {status === 'too-close' && (
        <>
          {/* Seta superior */}
          <div style={{
            position: 'absolute',
            top: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'bounce-down 1.5s ease-in-out infinite',
          }}>
            <div style={{
              fontSize: '2.5rem',
              color: getStatusColor(),
              filter: `drop-shadow(0 0 10px ${getStatusColor()})`,
            }}>
              ⬇
            </div>
          </div>

          {/* Seta inferior */}
          <div style={{
            position: 'absolute',
            bottom: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'bounce-down 1.5s ease-in-out infinite 0.3s',
          }}>
            <div style={{
              fontSize: '2.5rem',
              color: getStatusColor(),
              filter: `drop-shadow(0 0 10px ${getStatusColor()})`,
            }}>
              ⬇
            </div>
          </div>

          {/* Texto central */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: `${getStatusColor()}22`,
            backdropFilter: 'blur(8px)',
            border: `2px solid ${getStatusColor()}`,
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            fontFamily: 'var(--font-head)',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#fff',
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            animation: 'pulse-text 2s ease-in-out infinite',
          }}>
            AFASTE-SE
          </div>
        </>
      )}

      {/* Frame de referência - quando parcialmente visível */}
      {status === 'partial' && (
        <div style={{
          position: 'absolute',
          inset: '8%',
          border: `3px dashed ${getStatusColor()}`,
          borderRadius: '16px',
          animation: 'pulse-border 2s ease-in-out infinite',
        }}>
          {/* Cantos destacados */}
          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => {
            const isTop = corner.includes('top');
            const isLeft = corner.includes('left');
            return (
              <div
                key={corner}
                style={{
                  position: 'absolute',
                  [isTop ? 'top' : 'bottom']: '-3px',
                  [isLeft ? 'left' : 'right']: '-3px',
                  width: '30px',
                  height: '30px',
                  borderTop: isTop ? `4px solid ${getStatusColor()}` : 'none',
                  borderBottom: !isTop ? `4px solid ${getStatusColor()}` : 'none',
                  borderLeft: isLeft ? `4px solid ${getStatusColor()}` : 'none',
                  borderRight: !isLeft ? `4px solid ${getStatusColor()}` : 'none',
                  borderRadius: corner === 'top-left' ? '16px 0 0 0' : 
                               corner === 'top-right' ? '0 16px 0 0' :
                               corner === 'bottom-left' ? '0 0 0 16px' :
                               '0 0 16px 0',
                }}
              />
            );
          })}
        </div>
      )}

      {/* Barra de progresso de confiança */}
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        maxWidth: '300px',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        borderRadius: '8px',
        padding: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: '#fff',
        }}>
          <span>{getStatusIcon()} {getMessage()}</span>
          <span style={{ opacity: 0.7 }}>{confidence}%</span>
        </div>
        <div style={{
          width: '100%',
          height: '6px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '3px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${confidence}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${getStatusColor()}, ${getStatusColor()}dd)`,
            borderRadius: '3px',
            transition: 'width 300ms ease',
            boxShadow: `0 0 10px ${getStatusColor()}88`,
          }} />
        </div>
      </div>

      {/* Animações CSS */}
      <style>{`
        @keyframes bounce-down {
          0%, 100% { transform: translateX(-50%) translateY(0); opacity: 1; }
          50% { transform: translateX(-50%) translateY(10px); opacity: 0.7; }
        }
        @keyframes pulse-border {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes pulse-text {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.05); }
        }
      `}</style>
    </div>
  );
}