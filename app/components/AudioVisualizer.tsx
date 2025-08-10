'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioVisualizerProps {
  audioData?: Uint8Array;
  isRecording?: boolean;
}

export default function AudioVisualizer({ audioData, isRecording = false }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [mockBars] = useState(() => Array(32).fill(0).map(() => Math.random()));

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawBars = (timestamp: number) => {
      // Clear canvas
      ctx.fillStyle = 'rgb(249, 250, 251)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (isRecording) {
        const barWidth = canvas.width / mockBars.length;
        const maxHeight = canvas.height * 0.8;

        mockBars.forEach((baseHeight, i) => {
          // Animate bars with sine wave
          const offset = timestamp * 0.001;
          const height = Math.abs(Math.sin(offset + i * 0.3)) * baseHeight * maxHeight;

          // Draw bar
          const x = i * barWidth;
          const y = canvas.height - height;

          // Gradient based on height
          const intensity = height / maxHeight;
          if (intensity > 0.8) {
            ctx.fillStyle = 'rgb(239, 68, 68)'; // red-500
          } else if (intensity > 0.5) {
            ctx.fillStyle = 'rgb(251, 146, 60)'; // orange-400
          } else {
            ctx.fillStyle = 'rgb(34, 197, 94)'; // green-500
          }

          ctx.fillRect(x + 2, y, barWidth - 4, height);
        });
      } else {
        // Draw flat line when not recording
        ctx.strokeStyle = 'rgb(209, 213, 219)'; // gray-300
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(drawBars);
    };

    animationRef.current = requestAnimationFrame(drawBars);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, mockBars]);

  return (
    <canvas
      ref={canvasRef}
      id="audioVisualizer"
      className="w-full h-48 bg-gray-50"
      width={800}
      height={192}
    />
  );
}