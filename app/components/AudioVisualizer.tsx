'use client';

import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioData?: Uint8Array;
}

export default function AudioVisualizer({ audioData }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !audioData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'rgb(243, 244, 246)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Josh will implement the actual visualization logic here
    // This is just a placeholder
  }, [audioData]);

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