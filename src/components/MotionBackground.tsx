import React, { useEffect, useRef } from 'react';
import { ThemeSettings } from '../types';

interface MotionBackgroundProps {
  theme: ThemeSettings;
  className?: string;
  forceTransparent?: boolean;
}

export const MotionBackground: React.FC<MotionBackgroundProps> = ({
  theme,
  className = '',
  forceTransparent = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (forceTransparent || theme.backgroundType === 'transparent') {
    return <div className={`absolute inset-0 bg-transparent ${className}`} />;
  }

  // Particle or wave canvas animation for motion backgrounds
  useEffect(() => {
    if (
      theme.backgroundType !== 'motion_waves' &&
      theme.backgroundType !== 'motion_particles' &&
      theme.backgroundType !== 'motion_stars'
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle system
    interface Particle {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      alphaChange: number;
      color: string;
    }

    const particles: Particle[] = [];
    const count = theme.backgroundType === 'motion_stars' ? 80 : 36;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * (theme.backgroundType === 'motion_stars' ? 1.8 : 3.5) + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: theme.backgroundType === 'motion_particles' ? -Math.random() * 0.6 - 0.2 : (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.6 + 0.2,
        alphaChange: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        color: Math.random() > 0.4 ? '#60a5fa' : '#c084fc',
      });
    }

    let waveTick = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (theme.backgroundType === 'motion_waves') {
        waveTick += 0.015;

        // Base gradient
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, theme.gradientFrom || '#1e1b4b');
        grad.addColorStop(1, theme.gradientTo || '#0f172a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Ambient glowing wave 1
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 20) {
          const y =
            height * 0.65 +
            Math.sin(x * 0.003 + waveTick) * 45 +
            Math.cos(x * 0.002 + waveTick * 0.8) * 30;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        const waveGrad1 = ctx.createLinearGradient(0, height * 0.5, 0, height);
        waveGrad1.addColorStop(0, 'rgba(99, 102, 241, 0.18)');
        waveGrad1.addColorStop(1, 'rgba(15, 23, 42, 0.4)');
        ctx.fillStyle = waveGrad1;
        ctx.fill();
        ctx.restore();

        // Ambient wave 2
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 25) {
          const y =
            height * 0.75 +
            Math.sin(x * 0.004 - waveTick * 1.2) * 40 +
            Math.cos(x * 0.003 + waveTick) * 20;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        const waveGrad2 = ctx.createLinearGradient(0, height * 0.6, 0, height);
        waveGrad2.addColorStop(0, 'rgba(168, 85, 247, 0.14)');
        waveGrad2.addColorStop(1, 'rgba(15, 23, 42, 0.5)');
        ctx.fillStyle = waveGrad2;
        ctx.fill();
        ctx.restore();
      } else {
        // Base dark backdrop
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, theme.gradientFrom || '#090d16');
        grad.addColorStop(1, theme.gradientTo || '#111827');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw floating particles or celestial stars
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaChange;

        if (p.alpha <= 0.1 || p.alpha >= 0.8) {
          p.alphaChange = -p.alphaChange;
        }

        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = theme.backgroundType === 'motion_stars' ? 4 : 12;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme.backgroundType, theme.gradientFrom, theme.gradientTo]);

  if (
    theme.backgroundType === 'motion_waves' ||
    theme.backgroundType === 'motion_particles' ||
    theme.backgroundType === 'motion_stars'
  ) {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    );
  }

  if (theme.backgroundType === 'solid') {
    return (
      <div
        className={`absolute inset-0 ${className}`}
        style={{ backgroundColor: theme.backgroundColor || '#090d16' }}
      />
    );
  }

  if (theme.backgroundType === 'image' && theme.bgImageUrl) {
    return (
      <div
        className={`absolute inset-0 bg-cover bg-center ${className}`}
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${theme.bgImageUrl})`,
        }}
      />
    );
  }

  // Fallback gradient
  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{
        background: `linear-gradient(${theme.gradientAngle || 135}deg, ${
          theme.gradientFrom || '#0f172a'
        }, ${theme.gradientTo || '#1e1b4b'})`,
      }}
    />
  );
};
