import React, { useRef, useEffect } from 'react';
import type { PolarimeterBenchState } from '../types';
import { formatVernierAngle, normalizeAngularMismatch } from '../physicsEngine';

interface PolarimeterCanvasProps {
  benchState: PolarimeterBenchState;
  onAngleChange?: (newAngleDeg: number) => void;
}

export function PolarimeterCanvas({
  benchState,
  onAngleChange,
}: PolarimeterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingDialRef = useRef<boolean>(false);
  const dragCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle dial pointer drag for direct circular rotation
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!onAngleChange) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Analyzer dial region is centered at (x: 580, y: 220)
    const dialX = 580;
    const dialY = 220;
    const dist = Math.hypot(x - dialX, y - dialY);

    if (dist >= 40 && dist <= 130) {
      isDraggingDialRef.current = true;
      dragCenterRef.current = { x: dialX, y: dialY };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      const angleRad = Math.atan2(y - dialY, x - dialX);
      let angleDeg = (angleRad * 180) / Math.PI;
      if (angleDeg < 0) angleDeg += 360;
      onAngleChange(parseFloat(angleDeg.toFixed(2)));
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingDialRef.current || !onAngleChange) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const { x: dialX, y: dialY } = dragCenterRef.current;
    const angleRad = Math.atan2(y - dialY, x - dialX);
    let angleDeg = (angleRad * 180) / Math.PI;
    if (angleDeg < 0) angleDeg += 360;
    onAngleChange(parseFloat(angleDeg.toFixed(2)));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingDialRef.current) {
      isDraggingDialRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // ── Background & Bench Environment ───────────────────────────────────
      ctx.fillStyle = '#080c14';
      ctx.fillRect(0, 0, width, height);

      // Fine workbench engineering grid
      ctx.strokeStyle = '#121a2a';
      ctx.lineWidth = 1;
      const gridSize = 25;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // ── 1. EYEPICCE HALF-SHADE SPLIT FIELD (Left Section) ────────────────
      const eyeX = 220;
      const eyeY = 220;
      const eyeRadius = 135;

      // Outer microscope / polarimeter eyepiece bezel
      const bezelGrad = ctx.createLinearGradient(
        eyeX - eyeRadius - 20,
        eyeY - eyeRadius - 20,
        eyeX + eyeRadius + 20,
        eyeY + eyeRadius + 20
      );
      bezelGrad.addColorStop(0, '#334155');
      bezelGrad.addColorStop(0.5, '#1e293b');
      bezelGrad.addColorStop(1, '#0f172a');

      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeRadius + 18, 0, Math.PI * 2);
      ctx.fillStyle = bezelGrad;
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Brass aperture collar
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeRadius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Eyepiece field clipping circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
      ctx.clip();

      if (!benchState.lampOn) {
        // Darkness when sodium lamp is off
        ctx.fillStyle = '#030509';
        ctx.fillRect(eyeX - eyeRadius, eyeY - eyeRadius, eyeRadius * 2, eyeRadius * 2);

        ctx.fillStyle = '#64748b';
        ctx.font = '12px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SODIUM LAMP OFF', eyeX, eyeY - 8);
        ctx.font = '10px ui-monospace, monospace';
        ctx.fillText('Switch lamp ON to view field', eyeX, eyeY + 12);
      } else {
        const { leftLuminance, rightLuminance, isEqualBrightness } = benchState;

        // Sodium amber base wavelength color (#f59e0b)
        // Left half (Quartz half)
        const leftAlpha = Math.max(0.04, Math.min(1.0, leftLuminance));
        ctx.beginPath();
        ctx.rect(eyeX - eyeRadius, eyeY - eyeRadius, eyeRadius, eyeRadius * 2);
        ctx.fillStyle = `rgba(245, 158, 11, ${leftAlpha})`;
        ctx.fill();

        // Right half (Glass half)
        const rightAlpha = Math.max(0.04, Math.min(1.0, rightLuminance));
        ctx.beginPath();
        ctx.rect(eyeX, eyeY - eyeRadius, eyeRadius, eyeRadius * 2);
        ctx.fillStyle = `rgba(245, 158, 11, ${rightAlpha})`;
        ctx.fill();

        // Soft radial lens glow
        const glow = ctx.createRadialGradient(eyeX, eyeY, 10, eyeX, eyeY, eyeRadius);
        glow.addColorStop(0, 'rgba(254, 240, 138, 0.25)');
        glow.addColorStop(0.7, 'rgba(245, 158, 11, 0.05)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        ctx.fillStyle = glow;
        ctx.fillRect(eyeX - eyeRadius, eyeY - eyeRadius, eyeRadius * 2, eyeRadius * 2);

        // Half-shade central dividing line (disappears at exact balance!)
        if (!isEqualBrightness) {
          ctx.beginPath();
          ctx.moveTo(eyeX, eyeY - eyeRadius);
          ctx.lineTo(eyeX, eyeY + eyeRadius);
          ctx.strokeStyle = 'rgba(15, 23, 42, 0.75)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          // Subtle sparkling ring at match point
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, eyeRadius - 10, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
          ctx.setLineDash([4, 6]);
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Eyepiece crosshairs (fine spider threads)
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(eyeX - eyeRadius, eyeY);
        ctx.lineTo(eyeX + eyeRadius, eyeY);
        ctx.moveTo(eyeX, eyeY - eyeRadius);
        ctx.lineTo(eyeX, eyeY + eyeRadius);
        ctx.stroke();
      }

      ctx.restore();

      // Eyepiece Header & State Label
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 13px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText("Laurent's Half-Shade Eyepiece Field", eyeX, 42);

      // Status pill below eyepiece
      const pillY = eyeY + eyeRadius + 32;
      let statusText = 'Lamp Off';
      let statusColor = '#94a3b8';
      let statusBg = 'rgba(51, 65, 85, 0.4)';
      let statusBorder = '#475569';

      if (benchState.lampOn) {
        if (benchState.isEqualBrightness) {
          statusText = '★ Equal Dim Illumination (Matched Balance)';
          statusColor = '#10b981';
          statusBg = 'rgba(16, 185, 129, 0.15)';
          statusBorder = 'rgba(16, 185, 129, 0.4)';
        } else {
          const mismatch = normalizeAngularMismatch(
            benchState.analyzerAngleDeg,
            benchState.theoreticalMatchAngleDeg
          );
          if (mismatch > 0) {
            statusText = `Left Brighter (Rotate CCW by ${mismatch.toFixed(2)}°)`;
            statusColor = '#f59e0b';
            statusBg = 'rgba(245, 158, 11, 0.15)';
            statusBorder = 'rgba(245, 158, 11, 0.4)';
          } else {
            statusText = `Right Brighter (Rotate CW by ${Math.abs(mismatch).toFixed(2)}°)`;
            statusColor = '#38bdf8';
            statusBg = 'rgba(56, 189, 248, 0.15)';
            statusBorder = 'rgba(56, 189, 248, 0.4)';
          }
        }
      }

      const pillWidth = 270;
      ctx.fillStyle = statusBg;
      ctx.strokeStyle = statusBorder;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(eyeX - pillWidth / 2, pillY - 14, pillWidth, 26, 13);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = statusColor;
      ctx.font = '600 11px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(statusText, eyeX, pillY + 3);

      // ── 2. ROTATABLE ANALYZER CIRCULAR SCALE & VERNIER DIAL (Right Section)
      const dialX = 580;
      const dialY = 220;
      const dialRadius = 115;

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 13px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Analyzer Circular Scale & Vernier', dialX, 42);

      // Outer bezel of dial
      ctx.beginPath();
      ctx.arc(dialX, dialY, dialRadius + 14, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Graduated Protractor Ring
      ctx.beginPath();
      ctx.arc(dialX, dialY, dialRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Degree graduations (0° to 360°)
      const currentAngleDeg = benchState.analyzerAngleDeg;
      for (let deg = 0; deg < 360; deg += 2) {
        const rad = (deg * Math.PI) / 180;
        const isMajor = deg % 30 === 0;
        const isMid = deg % 10 === 0 && !isMajor;

        const innerR = isMajor
          ? dialRadius - 16
          : isMid
          ? dialRadius - 10
          : dialRadius - 6;

        const x1 = dialX + Math.cos(rad) * innerR;
        const y1 = dialY + Math.sin(rad) * innerR;
        const x2 = dialX + Math.cos(rad) * dialRadius;
        const y2 = dialY + Math.sin(rad) * dialRadius;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isMajor ? '#38bdf8' : isMid ? '#cbd5e1' : '#475569';
        ctx.lineWidth = isMajor ? 1.5 : 1;
        ctx.stroke();

        if (isMajor) {
          const textR = dialRadius - 26;
          const tx = dialX + Math.cos(rad) * textR;
          const ty = dialY + Math.sin(rad) * textR;
          ctx.fillStyle = '#94a3b8';
          ctx.font = '9px ui-monospace, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${deg}°`, tx, ty);
        }
      }

      // Rotating Analyzer Pointer Needle
      const needleRad = (currentAngleDeg * Math.PI) / 180;
      const needleLength = dialRadius - 4;
      const nx = dialX + Math.cos(needleRad) * needleLength;
      const ny = dialY + Math.sin(needleRad) * needleLength;

      ctx.beginPath();
      ctx.moveTo(dialX, dialY);
      ctx.lineTo(nx, ny);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Needle center pivot brass hub
      ctx.beginPath();
      ctx.arc(dialX, dialY, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#d97706';
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(dialX, dialY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      // Drag hint prompt
      ctx.fillStyle = '#64748b';
      ctx.font = '10px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Drag dial or use slider to rotate analyzer', dialX, dialY + dialRadius + 22);

      // Vernier Readout Box below Dial
      const vernierInfo = formatVernierAngle(currentAngleDeg);
      const vBoxY = dialY + dialRadius + 36;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(dialX - 130, vBoxY, 260, 48, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('Main Scale Reading (MSR):', dialX - 118, vBoxY + 18);
      ctx.fillText('Vernier (VSR × 0.05°):', dialX - 118, vBoxY + 36);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '700 12px ui-monospace, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${vernierInfo.msr}°`, dialX + 118, vBoxY + 18);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(
        `${vernierInfo.vsr} div = ${(vernierInfo.vsr * 0.05).toFixed(2)}°`,
        dialX + 118,
        vBoxY + 36
      );

      // ── 3. OPTICAL BENCH SCHEMATIC INSET (Bottom Full Width) ──────────────
      const benchY = 430;
      const benchH = 40;

      // Dark glass bench rail
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(20, benchY - 14, width - 40, benchH, 8);
      ctx.fill();
      ctx.stroke();

      // Components along the bench
      const benchComponents = [
        { name: 'Na Lamp (589.3nm)', x: 60, color: benchState.lampOn ? '#f59e0b' : '#475569' },
        { name: 'Collimator', x: 175, color: '#94a3b8' },
        { name: 'Polarizer OP', x: 280, color: '#38bdf8' },
        { name: 'Half-Shade', x: 385, color: '#a855f7' },
        {
          name: `Tube (L=${benchState.tubeLengthDm}dm)`,
          x: 510,
          color: benchState.selectedSolution === 'water' ? '#60a5fa' : '#fbbf24',
        },
        { name: `Analyzer (φ=${currentAngleDeg.toFixed(1)}°)`, x: 650, color: '#ef4444' },
        { name: 'Eyepiece', x: 745, color: '#10b981' },
      ];

      // Ray path line
      ctx.beginPath();
      ctx.moveTo(70, benchY + 6);
      ctx.lineTo(750, benchY + 6);
      ctx.strokeStyle = benchState.lampOn ? 'rgba(245, 158, 11, 0.4)' : '#1e293b';
      ctx.lineWidth = 3;
      ctx.stroke();

      benchComponents.forEach((comp) => {
        // Node marker
        ctx.beginPath();
        ctx.arc(comp.x, benchY + 6, 5, 0, Math.PI * 2);
        ctx.fillStyle = comp.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Node label
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '500 9px ui-sans-serif, system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(comp.name, comp.x, benchY - 1);
      });
    };

    render();
    animId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animId);
  }, [benchState, onAngleChange]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-lg select-none">
      <canvas
        ref={canvasRef}
        width={800}
        height={480}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-auto cursor-grab active:cursor-grabbing block"
      />
    </div>
  );
}
