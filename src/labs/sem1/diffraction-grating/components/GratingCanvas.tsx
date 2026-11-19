import React, { useRef, useEffect } from 'react';
import type { GratingBenchState } from '../types';
import {
  MERCURY_LINES_LIST,
  getAllSpectralPeaks,
  decimalDegToDMS,
} from '../physicsEngine';

interface GratingCanvasProps {
  benchState: GratingBenchState;
}

export function GratingCanvas({ benchState }: GratingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas with dark slate laboratory background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Subtle bench grid pattern
      ctx.strokeStyle = '#141d2e';
      ctx.lineWidth = 1;
      const gridSize = 30;
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

      // ── Layout Geometry ───────────────────────────────────────────────────
      // Left area: Spectrometer Top-down View (x: 0 to ~540)
      // Right area: Eyepiece Crosshair View (top) & Vernier Scale (bottom)
      const specCenterX = 250;
      const specCenterY = height / 2 + 10;
      const specRadius = 170;

      // ── 1. Spectrometer Base Circular Stage ──────────────────────────────
      // Outer brass/aluminum base ring
      const baseGrad = ctx.createRadialGradient(
        specCenterX,
        specCenterY,
        specRadius * 0.4,
        specCenterX,
        specCenterY,
        specRadius
      );
      baseGrad.addColorStop(0, '#1a2233');
      baseGrad.addColorStop(0.85, '#111827');
      baseGrad.addColorStop(1, '#0b0f19');

      ctx.beginPath();
      ctx.arc(specCenterX, specCenterY, specRadius, 0, Math.PI * 2);
      ctx.fillStyle = baseGrad;
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Main circular scale graduated markings (-50° to +50°)
      ctx.save();
      ctx.translate(specCenterX, specCenterY);

      for (let deg = -50; deg <= 50; deg += 2) {
        // In our top-down view: 0° is pointing straight UP (-Math.PI/2)
        // positive angle is clockwise (to right), negative is counter-clockwise (to left)
        const rad = (deg - 90) * (Math.PI / 180);
        const isMajor = deg % 10 === 0;
        const isMid = deg % 5 === 0 && !isMajor;
        const tickLen = isMajor ? 12 : isMid ? 8 : 5;

        const x1 = Math.cos(rad) * (specRadius - 4);
        const y1 = Math.sin(rad) * (specRadius - 4);
        const x2 = Math.cos(rad) * (specRadius - 4 - tickLen);
        const y2 = Math.sin(rad) * (specRadius - 4 - tickLen);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isMajor ? '#94a3b8' : isMid ? '#64748b' : '#334155';
        ctx.lineWidth = isMajor ? 1.5 : 1;
        ctx.stroke();

        if (isMajor) {
          const tx = Math.cos(rad) * (specRadius - 24);
          const ty = Math.sin(rad) * (specRadius - 24);
          ctx.fillStyle = '#64748b';
          ctx.font = '8px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${deg > 0 ? '+' : ''}${deg}°`, tx, ty);
        }
      }
      ctx.restore();

      // ── 2. Fixed Collimator Arm (Bottom pointing Up) ─────────────────────
      const collimatorLength = 110;
      const colStartY = specCenterY + specRadius + collimatorLength - 40;
      const colEndY = specCenterY + 45;

      // Collimator outer metallic tube
      const colGrad = ctx.createLinearGradient(specCenterX - 14, 0, specCenterX + 14, 0);
      colGrad.addColorStop(0, '#1e293b');
      colGrad.addColorStop(0.5, '#475569');
      colGrad.addColorStop(1, '#0f172a');

      ctx.fillStyle = colGrad;
      ctx.fillRect(specCenterX - 12, colEndY, 24, colStartY - colEndY);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.strokeRect(specCenterX - 12, colEndY, 24, colStartY - colEndY);

      // Collimator slit housing & levelling ring
      ctx.fillStyle = '#334155';
      ctx.fillRect(specCenterX - 16, colStartY - 25, 32, 10);
      ctx.strokeRect(specCenterX - 16, colStartY - 25, 32, 10);

      // Mercury Lamp Housing at bottom of collimator
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(specCenterX - 30, colStartY - 10, 60, 40);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(specCenterX - 30, colStartY - 10, 60, 40);

      // Mercury arc glow inside lamp housing
      if (benchState.lampOn) {
        const lampGlow = ctx.createRadialGradient(
          specCenterX,
          colStartY + 10,
          2,
          specCenterX,
          colStartY + 10,
          24
        );
        lampGlow.addColorStop(0, '#ffffff');
        lampGlow.addColorStop(0.3, '#38bdf8');
        lampGlow.addColorStop(0.8, '#0284c7');
        lampGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = lampGlow;
        ctx.beginPath();
        ctx.arc(specCenterX, colStartY + 10, 24, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Hg LAMP', specCenterX, colStartY + 13);
      }

      // Incident Collimated Light Beam (White/cyan parallel rays towards grating)
      if (benchState.lampOn) {
        const beamGrad = ctx.createLinearGradient(
          specCenterX - 6,
          0,
          specCenterX + 6,
          0
        );
        beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
        beamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.55)');
        beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0.15)');

        ctx.fillStyle = beamGrad;
        ctx.fillRect(specCenterX - 5, specCenterY, 10, colEndY - specCenterY);
      }

      // ── 3. Central Prism/Grating Table & Diffraction Grating Plate ─────────
      // Central turntable disk
      ctx.beginPath();
      ctx.arc(specCenterX, specCenterY, 44, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Levelling screws on table (3 points)
      for (let i = 0; i < 3; i++) {
        const ang = (i * 120 * Math.PI) / 180;
        const sx = specCenterX + Math.cos(ang) * 34;
        const sy = specCenterY + Math.sin(ang) * 34;
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
      }

      // Diffraction Grating Plate (mounted horizontally, normal to incident light)
      // Width = 48px, Thickness = 8px
      ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.fillRect(specCenterX - 24, specCenterY - 4, 48, 8);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.strokeRect(specCenterX - 24, specCenterY - 4, 48, 8);

      // Ruled grating lines indicator (fine diamond rulings)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      for (let gx = specCenterX - 20; gx <= specCenterX + 20; gx += 4) {
        ctx.beginPath();
        ctx.moveTo(gx, specCenterY - 4);
        ctx.lineTo(gx, specCenterY + 4);
        ctx.stroke();
      }

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`GRATING (${benchState.gratingLPI.toLocaleString()} LPI)`, specCenterX, specCenterY - 10);

      // ── 4. Diffracted Spectral Rays Fan ──────────────────────────────────
      if (benchState.lampOn) {
        const peaks = getAllSpectralPeaks(benchState.gratingLPI, benchState.selectedOrder);
        const rayLen = specRadius - 10;

        for (const peak of peaks) {
          // Angle in radians (top-down view: 0° is -Math.PI/2)
          const angleRad = (peak.diffractionAngleDeg - 90) * (Math.PI / 180);
          const rx = specCenterX + Math.cos(angleRad) * rayLen;
          const ry = specCenterY + Math.sin(angleRad) * rayLen;

          const isZeroOrder = peak.order === 0;
          const color = isZeroOrder ? 'rgba(255, 255, 255, 0.85)' : peak.line.colorHex;

          ctx.beginPath();
          ctx.moveTo(specCenterX, specCenterY);
          ctx.lineTo(rx, ry);

          // If telescope is close to this peak, make line shine brighter
          const diff = Math.abs(benchState.apparentAngleDeg - peak.diffractionAngleDeg);
          const isAligned = diff < 0.2;

          ctx.strokeStyle = color;
          ctx.lineWidth = isAligned ? 2.5 : isZeroOrder ? 2 : 1.2;
          ctx.globalAlpha = isAligned ? 0.95 : isZeroOrder ? 0.7 : 0.45;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      }

      // ── 5. Rotatable Telescope Arm ────────────────────────────────────────
      const teleAngle = benchState.apparentAngleDeg;
      const teleRad = (teleAngle - 90) * (Math.PI / 180);
      const teleArmLen = specRadius + 30;

      ctx.save();
      ctx.translate(specCenterX, specCenterY);
      ctx.rotate(teleRad + Math.PI / 2); // Rotate to telescope heading

      // Telescope counterweight arm on opposite side
      ctx.fillStyle = '#334155';
      ctx.fillRect(-6, 20, 12, 35);
      ctx.beginPath();
      ctx.arc(0, 58, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#475569';
      ctx.fill();

      // Main Telescope metallic tube
      const teleGrad = ctx.createLinearGradient(-10, 0, 10, 0);
      teleGrad.addColorStop(0, '#334155');
      teleGrad.addColorStop(0.5, '#64748b');
      teleGrad.addColorStop(1, '#1e293b');

      ctx.fillStyle = teleGrad;
      ctx.fillRect(-8, -teleArmLen, 16, teleArmLen - 30);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.strokeRect(-8, -teleArmLen, 16, teleArmLen - 30);

      // Objective lens housing at front
      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(-10, -32, 20, 6);

      // Eyepiece at outer end
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-11, -teleArmLen - 12, 22, 14);
      ctx.strokeStyle = '#f59e0b';
      ctx.strokeRect(-11, -teleArmLen - 12, 22, 14);

      // Vernier pointer line indicating current position on circular scale
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -specRadius + 14);
      ctx.lineTo(0, -specRadius - 6);
      ctx.stroke();

      ctx.restore();

      // ── 6. Live Telescope Eyepiece Crosshair View (Top-Right Section) ──────
      const epCenterX = width - 175;
      const epCenterY = 150;
      const epRadius = 110;

      // Eyepiece dark brass bezel
      ctx.beginPath();
      ctx.arc(epCenterX, epCenterY, epRadius + 12, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Eyepiece dark circular aperture
      ctx.beginPath();
      ctx.arc(epCenterX, epCenterY, epRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#05070c';
      ctx.fill();

      // Eyepiece Field Clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(epCenterX, epCenterY, epRadius, 0, Math.PI * 2);
      ctx.clip();

      // Render spectral lines visible inside field of view
      // Field of view covers ±1.8° around current telescope angle
      const fovDeg = 3.6;
      const pixelsPerDeg = (epRadius * 2) / fovDeg;

      if (benchState.lampOn) {
        const peaks = getAllSpectralPeaks(benchState.gratingLPI, benchState.selectedOrder);

        for (const peak of peaks) {
          const deltaDeg = peak.diffractionAngleDeg - benchState.apparentAngleDeg;

          // If within FOV
          if (Math.abs(deltaDeg) <= fovDeg / 2 + 0.3) {
            const lineX = epCenterX + deltaDeg * pixelsPerDeg;
            const isZero = peak.order === 0;

            const baseWidth = Math.max(2, benchState.slitWidthMm * 8);

            // Spectral line vertical glow
            const lineGlow = ctx.createLinearGradient(lineX - 10, 0, lineX + 10, 0);
            const col = isZero ? '#ffffff' : peak.line.colorHex;

            lineGlow.addColorStop(0, 'transparent');
            lineGlow.addColorStop(0.5, col);
            lineGlow.addColorStop(1, 'transparent');

            ctx.fillStyle = lineGlow;
            ctx.globalAlpha = peak.intensity * 0.9;
            ctx.fillRect(lineX - 12, epCenterY - epRadius, 24, epRadius * 2);

            // Sharp core slit line
            ctx.fillStyle = isZero ? '#ffffff' : col;
            ctx.globalAlpha = 1.0;
            ctx.fillRect(lineX - baseWidth / 2, epCenterY - epRadius, baseWidth, epRadius * 2);

            // Label above line if close to center
            if (Math.abs(deltaDeg) < 0.6) {
              ctx.font = '10px monospace';
              ctx.textAlign = 'center';
              ctx.fillStyle = isZero ? '#ffffff' : peak.line.colorHex;
              const orderLabel = isZero ? 'n=0 (White)' : `n=${peak.order > 0 ? '+' : ''}${peak.order}`;
              ctx.fillText(`${peak.line.name}`, lineX, epCenterY - epRadius + 22);
              ctx.fillStyle = '#94a3b8';
              ctx.font = '8px monospace';
              ctx.fillText(orderLabel, lineX, epCenterY - epRadius + 34);
            }
          }
        }
      }

      // Optical crosshairs (fine reticle)
      const isLocked = benchState.alignmentDiffDeg !== null && Math.abs(benchState.alignmentDiffDeg) <= 0.05;

      ctx.strokeStyle = isLocked ? '#10b981' : '#64748b';
      ctx.lineWidth = isLocked ? 1.5 : 1;

      // Vertical crosshair
      ctx.beginPath();
      ctx.moveTo(epCenterX, epCenterY - epRadius);
      ctx.lineTo(epCenterX, epCenterY + epRadius);
      ctx.stroke();

      // Horizontal crosshair
      ctx.beginPath();
      ctx.moveTo(epCenterX - epRadius, epCenterY);
      ctx.lineTo(epCenterX + epRadius, epCenterY);
      ctx.stroke();

      // Center crosshair alignment ring
      ctx.beginPath();
      ctx.arc(epCenterX, epCenterY, 14, 0, Math.PI * 2);
      ctx.strokeStyle = isLocked ? '#10b981' : 'rgba(100, 116, 139, 0.4)';
      ctx.stroke();

      // Subtle optical lens reflection
      const lensReflect = ctx.createLinearGradient(
        epCenterX - epRadius,
        epCenterY - epRadius,
        epCenterX + epRadius,
        epCenterY + epRadius
      );
      lensReflect.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      lensReflect.addColorStop(0.5, 'transparent');
      lensReflect.addColorStop(1, 'rgba(56, 189, 248, 0.05)');
      ctx.fillStyle = lensReflect;
      ctx.fillRect(epCenterX - epRadius, epCenterY - epRadius, epRadius * 2, epRadius * 2);

      ctx.restore();

      // Eyepiece Title Badge
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.fillRect(epCenterX - 90, epCenterY - epRadius - 28, 180, 22);
      ctx.strokeRect(epCenterX - 90, epCenterY - epRadius - 28, 180, 22);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TELESCOPE EYEPIECE VIEW', epCenterX, epCenterY - epRadius - 14);

      // Alignment status indicator below eyepiece
      ctx.fillStyle = isLocked ? '#064e3b' : '#1e293b';
      ctx.strokeStyle = isLocked ? '#059669' : '#334155';
      ctx.fillRect(epCenterX - 110, epCenterY + epRadius + 14, 220, 26);
      ctx.strokeRect(epCenterX - 110, epCenterY + epRadius + 14, 220, 26);

      if (isLocked && benchState.activeLineNearby) {
        ctx.fillStyle = '#34d399';
        ctx.font = '10px monospace';
        ctx.fillText(
          `ALIGNED: ${benchState.activeLineNearby.name} (n=${benchState.currentOrder})`,
          epCenterX,
          epCenterY + epRadius + 30
        );
      } else if (benchState.activeLineNearby) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = '9px monospace';
        const diffStr = benchState.alignmentDiffDeg! > 0 ? `+${benchState.alignmentDiffDeg!.toFixed(2)}°` : `${benchState.alignmentDiffDeg!.toFixed(2)}°`;
        ctx.fillText(`APPROACHING: ${benchState.activeLineNearby.name} (Δθ = ${diffStr})`, epCenterX, epCenterY + epRadius + 30);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px monospace';
        ctx.fillText('NO SPECTRAL LINE AT CROSSHAIR', epCenterX, epCenterY + epRadius + 30);
      }

      // ── 7. Vernier Scale Magnifier Readout (Bottom-Right Section) ────────
      const magX = width - 175;
      const magY = height - 90;
      const magW = 270;
      const magH = 75;

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.fillRect(magX - magW / 2, magY - magH / 2, magW, magH);
      ctx.strokeRect(magX - magW / 2, magY - magH / 2, magW, magH);

      // Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('VERNIER SCALE MAGNIFIER (V₁)', magX - magW / 2 + 10, magY - magH / 2 + 14);

      const dms = decimalDegToDMS(benchState.apparentAngleDeg);

      // Big DMS readout
      ctx.fillStyle = '#38bdf8';
      ctx.font = '18px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(dms.formatted, magX - magW / 2 + 10, magY + 12);

      // Decimal readout
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText(`(${benchState.apparentAngleDeg.toFixed(3)}°)`, magX - magW / 2 + 10, magY + 28);

      // Visual vernier tick bar
      const barX = magX + 25;
      const barY = magY - 12;
      const barW = 100;

      // Main scale track (top)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(barX, barY, barW, 16);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(barX, barY, barW, 16);

      // Vernier track (bottom)
      ctx.fillStyle = '#111827';
      ctx.fillRect(barX, barY + 16, barW, 16);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(barX, barY + 16, barW, 16);

      // Draw sliding ticks based on current angle minutes
      const minOffset = (dms.minutes / 60) * 20;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      for (let i = 0; i < barW; i += 10) {
        ctx.beginPath();
        ctx.moveTo(barX + i, barY);
        ctx.lineTo(barX + i, barY + 8);
        ctx.stroke();
      }

      ctx.strokeStyle = '#f59e0b';
      for (let i = 0; i < barW; i += 9.5) {
        const vx = barX + i + minOffset;
        if (vx < barX + barW) {
          ctx.beginPath();
          ctx.moveTo(vx, barY + 24);
          ctx.lineTo(vx, barY + 32);
          ctx.stroke();
        }
      }

      // Least count note
      ctx.fillStyle = '#64748b';
      ctx.font = '8px monospace';
      ctx.textAlign = 'right';
      ctx.fillText("L.C. = 1' (0.5° / 30 div)", magX + magW / 2 - 10, magY + magH / 2 - 8);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [benchState]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--border)] bg-[#090d16] shadow-xl">
      <canvas
        ref={canvasRef}
        width={920}
        height={480}
        className="w-full h-auto block select-none"
        style={{ aspectRatio: '920 / 480' }}
      />
    </div>
  );
}
