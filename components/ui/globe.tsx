"use client";

import { useEffect, useRef, useState, type FC } from "react";

interface GlobeProps {
  className?: string;
}

export const Globe: FC<GlobeProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size with devicePixelRatio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = 300;
    const logicalHeight = 300;
    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    canvas.style.width = `${logicalWidth}px`;
    canvas.style.height = `${logicalHeight}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Scale for DPR
    ctx.scale(dpr, dpr);

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animationId: number;
    let rotation = 0;

    const dots: { x: number; y: number; z: number }[] = [];

    for (let lat = -90; lat <= 90; lat += 3) {
      const r = 95 * Math.cos((lat * Math.PI) / 180);
      for (let lon = 0; lon < 360; lon += 5) {
        const theta = (lon * Math.PI) / 180;
        dots.push({
          x: r * Math.cos(theta),
          y: 80 * Math.sin((lat * Math.PI) / 180),
          z: r * Math.sin(theta),
        });
      }
    }

    const draw = () => {
      if (!isVisible) return;

      ctx.clearRect(0, 0, logicalWidth, logicalHeight);

      const sortedDots = dots.map((dot) => {
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const newX = dot.x * cos - dot.z * sin;
        const newZ = dot.x * sin + dot.z * cos;
        const scale = 300 / (300 + newZ);
        return {
          x: newX * scale + logicalWidth / 2,
          y: dot.y * scale + logicalHeight / 2,
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

      if (!prefersReducedMotion) {
        rotation += 0.01;
      }
      animationId = requestAnimationFrame(draw);
    };

    // Intersection Observer to pause when off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, [isVisible]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
    />
  )
};