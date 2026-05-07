"use client";

import { useEffect, useRef, type FC } from "react";

interface GlobeProps {
  className?: string;
}

export const Globe: FC<GlobeProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let rotation = 0;

    const dots: { x: number; y: number; z: number; baseZ: number }[] = [];

    for (let lat = -90; lat <= 90; lat += 3) {
      const r = 95 * Math.cos((lat * Math.PI) / 180);
      for (let lon = 0; lon < 360; lon += 5) {
        const theta = (lon * Math.PI) / 180;
        dots.push({
          x: r * Math.cos(theta),
          y: 80 * Math.sin((lat * Math.PI) / 180),
          z: r * Math.sin(theta),
          baseZ: r * Math.sin(theta),
        });
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const sortedDots = dots.map((dot) => {
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const newX = dot.x * cos - dot.z * sin;
        const newZ = dot.x * sin + dot.z * cos;
        const scale = 300 / (300 + newZ);
        return {
          x: newX * scale + canvas.width / 2,
          y: dot.y * scale + canvas.height / 2,
          z: newZ,
          scale,
        };
      });

      sortedDots.sort((a, b) => b.z - a.z);

      sortedDots.forEach((dot) => {
        const alpha = Math.max(0.1, Math.min(0.8, (dot.z + 80) / 160));
        const size = Math.max(1.5, 3 * dot.scale);
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      });

      rotation += 0.01;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={300}
      className={className}
    />
  );
};