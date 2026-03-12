// src/components/CamAutomationPeople/components/PoseOverlay.tsx
// Componente que desenha os landmarks do MediaPipe em tempo real sobre o vídeo
// Mostra os 33 pontos do corpo + conexões (skeleton)

import { useEffect, useRef } from 'react';

// Tipo para landmark do MediaPipe
interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface PoseOverlayProps {
  landmarks?: PoseLandmark[];
  videoWidth: number;
  videoHeight: number;
  showPoints?: boolean;        // Mostrar pontos individuais
  showSkeleton?: boolean;      // Mostrar linhas de conexão
  showLabels?: boolean;        // Mostrar nomes dos pontos
  pointColor?: string;
  lineColor?: string;
  pointSize?: number;
  lineWidth?: number;
}

// Conexões do corpo humano (índices dos landmarks)
const POSE_CONNECTIONS = [
  // Rosto
  [0, 1], [1, 2], [2, 3], [3, 7],     // Lado esquerdo do rosto
  [0, 4], [4, 5], [5, 6], [6, 8],     // Lado direito do rosto
  [9, 10],                             // Boca
  
  // Torso
  [11, 12],                            // Ombros
  [11, 23], [12, 24],                  // Ombros → Quadris
  [23, 24],                            // Quadris
  
  // Braço esquerdo
  [11, 13], [13, 15],                  // Ombro → Cotovelo → Pulso
  [15, 17], [15, 19], [15, 21],        // Pulso → Dedos
  [17, 19],                            // Indicador → Mindinho
  
  // Braço direito
  [12, 14], [14, 16],                  // Ombro → Cotovelo → Pulso
  [16, 18], [16, 20], [16, 22],        // Pulso → Dedos
  [18, 20],                            // Indicador → Mindinho
  
  // Perna esquerda
  [23, 25], [25, 27],                  // Quadril → Joelho → Tornozelo
  [27, 29], [27, 31],                  // Tornozelo → Pé
  [29, 31],                            // Calcanhar → Dedos
  
  // Perna direita
  [24, 26], [26, 28],                  // Quadril → Joelho → Tornozelo
  [28, 30], [28, 32],                  // Tornozelo → Pé
  [30, 32],                            // Calcanhar → Dedos
];

// Nomes dos landmarks (33 pontos)
const LANDMARK_NAMES = [
  'Nariz', 'Olho Esq Int', 'Olho Esq', 'Olho Esq Ext',
  'Olho Dir Int', 'Olho Dir', 'Olho Dir Ext',
  'Orelha Esq', 'Orelha Dir', 'Boca Esq', 'Boca Dir',
  'Ombro Esq', 'Ombro Dir', 'Cotovelo Esq', 'Cotovelo Dir',
  'Pulso Esq', 'Pulso Dir', 'Mindinho Esq', 'Mindinho Dir',
  'Indicador Esq', 'Indicador Dir', 'Polegar Esq', 'Polegar Dir',
  'Quadril Esq', 'Quadril Dir', 'Joelho Esq', 'Joelho Dir',
  'Tornozelo Esq', 'Tornozelo Dir', 'Calcanhar Esq', 'Calcanhar Dir',
  'Dedos Esq', 'Dedos Dir'
];

// Cores específicas por região do corpo
const getPointColorByIndex = (index: number): string => {
  if (index <= 10) return '#00FFFF';        // Rosto - Ciano
  if (index >= 11 && index <= 22) return '#00FF00';  // Braços - Verde
  if (index >= 23 && index <= 24) return '#FFFF00';  // Quadris - Amarelo
  if (index >= 25 && index <= 32) return '#FF00FF';  // Pernas - Magenta
  return '#FFFFFF';
};

export default function PoseOverlay({
  landmarks,
  videoWidth,
  videoHeight,
  showPoints = true,
  showSkeleton = true,
  showLabels = false,
  pointColor,
  lineColor = 'rgba(0, 255, 0, 0.8)',
  pointSize = 6,
  lineWidth = 3,
}: PoseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!landmarks || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajusta canvas ao tamanho do vídeo
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    // Limpa canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ════════════════════════════════════════════════════════════
    // DESENHA SKELETON (linhas de conexão)
    // ════════════════════════════════════════════════════════════
    if (showSkeleton) {
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';

      POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
        const start = landmarks[startIdx];
        const end = landmarks[endIdx];

        // Só desenha se ambos os pontos forem visíveis
        if (
          start && end &&
          (start.visibility ?? 1) > 0.5 &&
          (end.visibility ?? 1) > 0.5
        ) {
          ctx.beginPath();
          ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
          ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
          ctx.stroke();
        }
      });
    }

    // ════════════════════════════════════════════════════════════
    // DESENHA PONTOS (landmarks)
    // ════════════════════════════════════════════════════════════
    if (showPoints) {
      landmarks.forEach((landmark, index) => {
        const visibility = landmark.visibility ?? 1;
        
        // Só desenha se visível
        if (visibility > 0.5) {
          const x = landmark.x * canvas.width;
          const y = landmark.y * canvas.height;

          // Cor do ponto
          const color = pointColor || getPointColorByIndex(index);

          // Círculo externo (glow)
          ctx.fillStyle = `${color}44`;
          ctx.beginPath();
          ctx.arc(x, y, pointSize + 4, 0, 2 * Math.PI);
          ctx.fill();

          // Círculo principal
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, pointSize, 0, 2 * Math.PI);
          ctx.fill();

          // Borda branca
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Label (nome do ponto)
          if (showLabels) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(x + 8, y - 10, 80, 16);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '10px monospace';
            ctx.fillText(LANDMARK_NAMES[index], x + 10, y + 2);
          }
        }
      });
    }

    // ════════════════════════════════════════════════════════════
    // DESTAQUE PONTOS-CHAVE (cabeça, mãos, pés)
    // ════════════════════════════════════════════════════════════
    const keyPoints = [
      { idx: 0, label: '👃', color: '#00FFFF' },    // Nariz
      { idx: 15, label: '🤚', color: '#00FF00' },   // Pulso esquerdo
      { idx: 16, label: '🤚', color: '#00FF00' },   // Pulso direito
      { idx: 27, label: '👟', color: '#FF00FF' },   // Tornozelo esquerdo
      { idx: 28, label: '👟', color: '#FF00FF' },   // Tornozelo direito
    ];

    keyPoints.forEach(({ idx, label, color }) => {
      const landmark = landmarks[idx];
      if (landmark && (landmark.visibility ?? 1) > 0.5) {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;

        // Emoji com background
        ctx.fillStyle = `${color}44`;
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, 2 * Math.PI);
        ctx.fill();

        ctx.font = '20px sans-serif';
        ctx.fillText(label, x - 10, y + 8);
      }
    });

  }, [landmarks, videoWidth, videoHeight, showPoints, showSkeleton, showLabels, pointColor, lineColor, pointSize, lineWidth]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    />
  );
}