import { useRef, useEffect, useCallback } from 'react';
import type { Agent, Particle, Zone } from '../types';

interface UseCanvasRendererProps {
  agents: Agent[];
  particles: Particle[];
  zones: Record<string, Zone>;
  isPaused: boolean;
}

export const useCanvasRenderer = ({ agents, particles, zones, isPaused }: UseCanvasRendererProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const drawDesk = useCallback((ctx: CanvasRenderingContext2D, zone: Zone) => {
    if (zone.id === 'watercooler') return;
    
    const deskW = zone.w;
    const deskH = zone.h;
    const x = zone.x - deskW/2;
    const y = zone.y - deskH/2;

    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowOffsetY = 10;

    const deskGradient = ctx.createLinearGradient(x, y, x, y + deskH);
    deskGradient.addColorStop(0, '#2a2a3e');
    deskGradient.addColorStop(0.5, '#1f1f2e');
    deskGradient.addColorStop(1, '#1a1a2e');

    ctx.fillStyle = deskGradient;
    ctx.fillRect(x, y, deskW, deskH);

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = zone.color + '60';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, deskW, deskH);

    ctx.fillStyle = zone.color + '20';
    ctx.fillRect(x, y, deskW, 4);

    if (zone.id !== 'meeting') {
      ctx.fillStyle = '#151520';
      ctx.fillRect(x - 10, y, 10, deskH);
      ctx.strokeStyle = '#252535';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 10, y, 10, deskH);
      ctx.fillRect(x + deskW, y, 10, deskH);
      ctx.strokeRect(x + deskW, y, 10, deskH);
    }
  }, []);

  const drawZoneLabel = useCallback((ctx: CanvasRenderingContext2D, zone: Zone) => {
    if (zone.id === 'watercooler') return;
    
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(zone.x - 80, zone.y - zone.h/2 - 45, 160, 32);

    ctx.fillStyle = zone.color;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(zone.label, zone.x, zone.y - zone.h/2 - 23);
  }, []);

  const drawWorker = useCallback((ctx: CanvasRenderingContext2D, agent: Agent, time: number) => {
    const bobOffset = Math.sin(time / 200 + agent.x) * 3;

    ctx.fillStyle = agent.color;
    ctx.beginPath();
    ctx.arc(agent.x, agent.y + bobOffset, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    const initials = agent.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    ctx.fillText(initials, agent.x, agent.y + bobOffset - 20);

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(agent.x - 35, agent.y + bobOffset + 20, 70, 18);
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.fillText(agent.name, agent.x, agent.y + bobOffset + 32);

    const statusColor = agent.targetX !== undefined ? '#feca57' : agent.isWorking ? '#ff6b6b' : '#1dd1a1';
    ctx.fillStyle = statusColor;
    ctx.beginPath();
    ctx.arc(agent.x + 22, agent.y + bobOffset - 35, 5, 0, Math.PI * 2);
    ctx.fill();

    if (agent.currentTask) {
      ctx.fillStyle = '#feca57';
      ctx.beginPath();
      ctx.arc(agent.x - 22, agent.y + bobOffset - 35, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  const drawWaterCooler = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const size = 50;
    ctx.fillStyle = '#74b9ff';
    ctx.beginPath();
    ctx.arc(x, y - size/3, size/3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#a8d8ff';
    ctx.beginPath();
    ctx.arc(x - 8, y - size/3 - 5, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#636e72';
    ctx.fillRect(x - size/2, y, size, size/2);
    
    ctx.fillStyle = '#74b9ff';
    ctx.fillRect(x - 5, y + 5, 10, size/2 - 10);
    
    ctx.fillStyle = '#b2bec3';
    ctx.beginPath();
    ctx.arc(x, y + 8, 6, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const drawCarpet = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#1e1e2e';
    ctx.fillRect(0, 0, width, height);

    const tileSize = 40;
    for (let x = 0; x < width; x += tileSize) {
      for (let y = 0; y < height; y += tileSize) {
        const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
        ctx.fillStyle = isEven ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
        ctx.fillRect(x, y, tileSize, tileSize);
      }
    }

    ctx.strokeStyle = 'rgba(100, 100, 120, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.fillRect(width * 0.12, height * 0.20, width * 0.76, height * 0.70);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = 0;

    const render = (time: number) => {
      const width = canvas.width;
      const height = canvas.height;

      drawCarpet(ctx, width, height);

      Object.values(zones).forEach(zone => {
        drawDesk(ctx, zone);
      });

      if (zones.watercooler) {
        drawWaterCooler(ctx, zones.watercooler.x, zones.watercooler.y);
      }

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Kreative HQ', width / 2, 45);

      ctx.fillStyle = '#666';
      ctx.font = '13px sans-serif';
      ctx.fillText('AI Agency Operations Center', width / 2, 68);

      Object.values(zones).forEach(zone => {
        drawZoneLabel(ctx, zone);
      });

      agents.forEach(agent => drawWorker(ctx, agent, time));

      particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    const loop = (time: number) => {
      if (!isPaused) {
        if (time - lastTime > 16) {
          lastTime = time;
        }
      }
      render(time);
      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [agents, particles, zones, isPaused, drawCarpet, drawDesk, drawZoneLabel, drawWorker, drawWaterCooler]);

  return canvasRef;
};
