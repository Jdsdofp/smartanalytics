// src/components/PoseOverlay/index.tsx
// Overlay visual dos keypoints do MediaPipe Pose
// Mostra skeleton e bounding box sobre o vídeo

import { useEffect, useRef } from 'react';
import type { Results } from '@mediapipe/pose';
import { POSE_CONNECTIONS } from '@mediapipe/pose';

interface PoseOverlayProps {
  results: Results | null;
  videoWidth: number;
  videoHeight: number;
}

export default function PoseOverlay({ results, videoWidth, videoHeight }: PoseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !results?.poseLandmarks) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const landmarks = results.poseLandmarks;

    // 1. DESENHAR CONEXÕES (skeleton)
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 3;

    POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];

      if (start && end && (start.visibility ?? 0) > 0.5 && (end.visibility ?? 0) > 0.5) {
        ctx.beginPath();
        ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
        ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
        ctx.stroke();
      }
    });

    // 2. DESENHAR PONTOS (keypoints)
    //@ts-ignore
    landmarks.forEach((landmark, idx) => {
      if ((landmark.visibility ?? 0) > 0.5) {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;

        // Círculo externo (borda)
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();

        // Círculo interno (centro)
        ctx.fillStyle = '#00FFFF';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // 3. DESENHAR BOUNDING BOX
    const visiblePoints = landmarks.filter(l => (l.visibility ?? 0) > 0.5);
    if (visiblePoints.length > 0) {
      const xs = visiblePoints.map(l => l.x * canvas.width);
      const ys = visiblePoints.map(l => l.y * canvas.height);

      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      const padding = 20;

      ctx.strokeStyle = '#FF6B00';
      ctx.lineWidth = 3;
      ctx.strokeRect(
        minX - padding,
        minY - padding,
        maxX - minX + padding * 2,
        maxY - minY + padding * 2
      );

      // Label "PERSON"
      ctx.fillStyle = '#FF6B00';
      ctx.fillRect(minX - padding, minY - padding - 30, 80, 25);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('PERSON', minX - padding + 5, minY - padding - 10);
    }

  }, [results, videoWidth, videoHeight]);

  return (
    <canvas
      ref={canvasRef}
      width={videoWidth}
      height={videoHeight}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 4,
      }}
    />
  );
}