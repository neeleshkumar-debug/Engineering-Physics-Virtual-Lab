import React, { useRef, useEffect } from 'react';
import type { FourProbeBenchState } from '../types';

interface FourProbeCanvasProps {
  benchState: FourProbeBenchState;
}

export function FourProbeCanvas({ benchState }: FourProbeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const pulseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      // Handle HiDPI scaling
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || 800;
      const height = rect.height || 420;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Pulse ticker for current flow animation
      if (benchState.powerOn && benchState.I_mA > 0) {
        pulseRef.current = (pulseRef.current + 0.04 * (benchState.I_mA / 3.0)) % 1;
      }

      // ── 1. Background Bench Canvas ───────────────────────────────────────────
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0a0d14');
      bgGrad.addColorStop(1, '#121824');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle bench grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 26;
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

      // Responsive scale factor
      const sx = width / 820;
      const sy = height / 420;
      const s = Math.min(sx, sy);

      // ── 2. Left Instrument: Constant Current Source ──────────────────────────
      const ccsX = 25 * sx;
      const ccsY = 40 * sy;
      const ccsW = 190 * sx;
      const ccsH = 340 * sy;

      // Instrument body
      ctx.fillStyle = '#181e2b';
      ctx.strokeStyle = '#2d3748';
      ctx.lineWidth = 2;
      roundRect(ctx, ccsX, ccsY, ccsW, ccsH, 10);
      ctx.fill();
      ctx.stroke();

      // Top header banner
      ctx.fillStyle = '#222b3d';
      roundRect(ctx, ccsX + 4, ccsY + 4, ccsW - 8, 30 * sy, 6);
      ctx.fill();

      ctx.font = `bold ${Math.max(10, 11 * s)}px sans-serif`;
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('CONSTANT CURRENT SOURCE', ccsX + ccsW / 2, ccsY + 22 * sy);

      // Digital 7-Segment style Display for Current
      const dispX = ccsX + 16 * sx;
      const dispY = ccsY + 50 * sy;
      const dispW = ccsW - 32 * sx;
      const dispH = 55 * sy;

      ctx.fillStyle = '#050b14';
      ctx.strokeStyle = '#1e293b';
      roundRect(ctx, dispX, dispY, dispW, dispH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.font = `bold ${Math.max(18, 24 * s)}px monospace`;
      ctx.fillStyle = benchState.powerOn ? '#38bdf8' : '#1e3a5f';
      ctx.textAlign = 'center';
      const currentText = benchState.powerOn ? `${benchState.I_mA.toFixed(2)}` : '0.00';
      ctx.fillText(currentText, dispX + dispW / 2 - 14 * sx, dispY + 36 * sy);

      ctx.font = `bold ${Math.max(9, 11 * s)}px sans-serif`;
      ctx.fillStyle = benchState.powerOn ? '#7dd3fc' : '#334155';
      ctx.textAlign = 'left';
      ctx.fillText('mA', dispX + dispW - 28 * sx, dispY + 34 * sy);

      // Current Source Sub-label
      ctx.font = `${Math.max(9, 10 * s)}px sans-serif`;
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText('Output Range: 1.0 – 5.0 mA', ccsX + ccsW / 2, ccsY + 130 * sy);

      // Output Binding Posts (+ and -)
      const postRadius = 9 * s;
      const postY = ccsY + 280 * sy;

      // Positive Red Post (Probe 1)
      const post1X = ccsX + ccsW * 0.32;
      ctx.beginPath();
      ctx.arc(post1X, postY, postRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#991b1b';
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${10 * s}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('+', post1X, postY + 4 * s);
      ctx.font = `${9 * s}px sans-serif`;
      ctx.fillStyle = '#ef4444';
      ctx.fillText('I +', post1X, postY + 22 * sy);

      // Negative Black Post (Probe 4)
      const post4X = ccsX + ccsW * 0.68;
      ctx.beginPath();
      ctx.arc(post4X, postY, postRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${10 * s}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('−', post4X, postY + 3 * s);
      ctx.font = `${9 * s}px sans-serif`;
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('I −', post4X, postY + 22 * sy);

      // Power status LED on CCS
      ctx.beginPath();
      ctx.arc(ccsX + 24 * sx, ccsY + 170 * sy, 5 * s, 0, Math.PI * 2);
      ctx.fillStyle = benchState.powerOn ? '#22c55e' : '#475569';
      ctx.fill();
      ctx.font = `${9 * s}px sans-serif`;
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'left';
      ctx.fillText('STABILIZED', ccsX + 36 * sx, ccsY + 173 * sy);

      // ── 3. Right Instrument: Digital Milli-Voltmeter ─────────────────────────
      const dvmX = width - (215 * sx);
      const dvmY = 40 * sy;
      const dvmW = 190 * sx;
      const dvmH = 340 * sy;

      ctx.fillStyle = '#181e2b';
      ctx.strokeStyle = '#2d3748';
      ctx.lineWidth = 2;
      roundRect(ctx, dvmX, dvmY, dvmW, dvmH, 10);
      ctx.fill();
      ctx.stroke();

      // Top banner
      ctx.fillStyle = '#222b3d';
      roundRect(ctx, dvmX + 4, dvmY + 4, dvmW - 8, 30 * sy, 6);
      ctx.fill();

      ctx.font = `bold ${Math.max(10, 11 * s)}px sans-serif`;
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('DIGITAL MILLI-VOLTMETER', dvmX + dvmW / 2, dvmY + 22 * sy);

      // DVM Display
      const dvmDispX = dvmX + 16 * sx;
      const dvmDispY = dvmY + 50 * sy;
      const dvmDispW = dvmW - 32 * sx;
      const dvmDispH = 55 * sy;

      ctx.fillStyle = '#050b14';
      ctx.strokeStyle = benchState.isOverRange ? '#ef4444' : '#1e293b';
      ctx.lineWidth = benchState.isOverRange ? 1.5 : 1;
      roundRect(ctx, dvmDispX, dvmDispY, dvmDispW, dvmDispH, 6);
      ctx.fill();
      ctx.stroke();

      // Voltage Text
      ctx.font = `bold ${Math.max(18, 24 * s)}px monospace`;
      ctx.fillStyle = !benchState.powerOn
        ? '#3f2b18'
        : benchState.isOverRange
        ? '#f87171'
        : '#fbbf24';
      ctx.textAlign = 'center';

      ctx.fillText(
        benchState.powerOn ? benchState.displayVoltageText : '000.0',
        dvmDispX + dvmDispW / 2 - 14 * sx,
        dvmDispY + 36 * sy
      );

      ctx.font = `bold ${Math.max(9, 11 * s)}px sans-serif`;
      ctx.fillStyle = benchState.powerOn ? '#fcd34d' : '#451a03';
      ctx.textAlign = 'left';
      ctx.fillText('mV', dvmDispX + dvmDispW - 28 * sx, dvmDispY + 34 * sy);

      // Range indicator status
      ctx.font = `bold ${Math.max(9, 10 * s)}px sans-serif`;
      ctx.fillStyle = benchState.voltmeterRange === 'x1' ? '#38bdf8' : '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(
        `Range: ${benchState.voltmeterRange.toUpperCase()} (${
          benchState.voltmeterRange === 'x1' ? '0–199.9 mV' : '0–1999 mV'
        })`,
        dvmX + dvmW / 2,
        dvmY + 128 * sy
      );

      if (benchState.isOverRange) {
        ctx.font = `bold ${Math.max(9, 10 * s)}px sans-serif`;
        ctx.fillStyle = '#ef4444';
        ctx.fillText('OVERFLOW! Switch to ×10', dvmX + dvmW / 2, dvmY + 150 * sy);
      }

      // DVM Binding Posts (Probes 2 & 3)
      const post2X = dvmX + dvmW * 0.32;
      const post3X = dvmX + dvmW * 0.68;

      // Positive Voltage Post (Probe 2 - Orange)
      ctx.beginPath();
      ctx.arc(post2X, postY, postRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#f97316';
      ctx.fill();
      ctx.strokeStyle = '#c2410c';
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${10 * s}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('+', post2X, postY + 4 * s);
      ctx.font = `${9 * s}px sans-serif`;
      ctx.fillStyle = '#f97316';
      ctx.fillText('V +', post2X, postY + 22 * sy);

      // Negative Voltage Post (Probe 3 - Emerald Green)
      ctx.beginPath();
      ctx.arc(post3X, postY, postRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.strokeStyle = '#047857';
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${10 * s}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('−', post3X, postY + 3 * s);
      ctx.font = `${9 * s}px sans-serif`;
      ctx.fillStyle = '#10b981';
      ctx.fillText('V −', post3X, postY + 22 * sy);

      // ── 4. Center Stage: Heating Oven Chamber & Four-Probe Assembly ──────────
      const ovenX = width * 0.5 - 170 * sx;
      const ovenY = 30 * sy;
      const ovenW = 340 * sx;
      const ovenH = 350 * sy;

      // Outer insulated oven housing
      const ovenGrad = ctx.createLinearGradient(ovenX, ovenY, ovenX, ovenY + ovenH);
      ovenGrad.addColorStop(0, '#334155');
      ovenGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = ovenGrad;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      roundRect(ctx, ovenX, ovenY, ovenW, ovenH, 16);
      ctx.fill();
      ctx.stroke();

      // Oven Header / Digital Temp Readout Bar
      const tempBarH = 46 * sy;
      ctx.fillStyle = '#0f172a';
      roundRect(ctx, ovenX + 10 * sx, ovenY + 10 * sy, ovenW - 20 * sx, tempBarH, 8);
      ctx.fill();

      // Temp readout
      ctx.font = `bold ${Math.max(14, 18 * s)}px monospace`;
      ctx.fillStyle = benchState.isHeating ? '#f97316' : '#22c55e';
      ctx.textAlign = 'left';
      ctx.fillText(
        `T: ${benchState.currentTempC.toFixed(1)} °C (${benchState.currentTempK.toFixed(1)} K)`,
        ovenX + 22 * sx,
        ovenY + 38 * sy
      );

      // Heating status badge
      ctx.beginPath();
      ctx.arc(ovenX + ovenW - 32 * sx, ovenY + 33 * sy, 6 * s, 0, Math.PI * 2);
      ctx.fillStyle = benchState.isHeating
        ? (Math.floor(Date.now() / 400) % 2 === 0 ? '#ef4444' : '#f97316')
        : '#22c55e';
      ctx.fill();

      ctx.font = `bold ${Math.max(9, 10 * s)}px sans-serif`;
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'right';
      ctx.fillText(
        benchState.isHeating ? 'HEATER ACTIVE' : 'EQUILIBRIUM',
        ovenX + ovenW - 46 * sx,
        ovenY + 37 * sy
      );

      // Oven Inner Inspection Chamber (Dark Cavity with thermal glow)
      const chamberX = ovenX + 20 * sx;
      const chamberY = ovenY + 68 * sy;
      const chamberW = ovenW - 40 * sx;
      const chamberH = 260 * sy;

      // Thermal glow intensity inside chamber
      const tempNormalized = Math.max(0, Math.min(1, (benchState.currentTempC - 30) / 130));
      const chamberGrad = ctx.createRadialGradient(
        chamberX + chamberW / 2,
        chamberY + chamberH * 0.75,
        15 * s,
        chamberX + chamberW / 2,
        chamberY + chamberH * 0.75,
        chamberW * 0.7
      );
      // Dark to warm amber/red glow as temp rises
      const r = Math.round(15 + tempNormalized * 85);
      const g = Math.round(18 + tempNormalized * 35);
      const b = Math.round(25 - tempNormalized * 15);
      chamberGrad.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
      chamberGrad.addColorStop(1, '#070a10');

      ctx.fillStyle = chamberGrad;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      roundRect(ctx, chamberX, chamberY, chamberW, chamberH, 10);
      ctx.fill();
      ctx.stroke();

      // Heating hotplate base element inside chamber
      const plateX = chamberX + 25 * sx;
      const plateY = chamberY + chamberH - 55 * sy;
      const plateW = chamberW - 50 * sx;
      const plateH = 28 * sy;

      ctx.fillStyle = '#27272a';
      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 1.5;
      roundRect(ctx, plateX, plateY, plateW, plateH, 4);
      ctx.fill();
      ctx.stroke();

      // Mica sheet (Electrical Insulating Base - White/Cream)
      const micaX = plateX + 16 * sx;
      const micaY = plateY - 10 * sy;
      const micaW = plateW - 32 * sx;
      const micaH = 10 * sy;

      ctx.fillStyle = '#fef3c7'; // Creamy mica sheet
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      roundRect(ctx, micaX, micaY, micaW, micaH, 3);
      ctx.fill();
      ctx.stroke();

      ctx.font = `${Math.max(8, 9 * s)}px sans-serif`;
      ctx.fillStyle = '#78350f';
      ctx.textAlign = 'left';
      ctx.fillText('MICA SHEET (Insulator)', micaX + 6 * sx, micaY + 8 * sy);

      // Germanium Crystal Slice (w = 0.05 cm)
      const crystalX = chamberX + chamberW / 2 - 70 * sx;
      const crystalY = micaY - 14 * sy;
      const crystalW = 140 * sx;
      const crystalH = 14 * sy;

      // Dark crystalline metallic gradient
      const crystalGrad = ctx.createLinearGradient(crystalX, crystalY, crystalX, crystalY + crystalH);
      crystalGrad.addColorStop(0, '#64748b');
      crystalGrad.addColorStop(0.5, '#475569');
      crystalGrad.addColorStop(1, '#334155');
      ctx.fillStyle = crystalGrad;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      roundRect(ctx, crystalX, crystalY, crystalW, crystalH, 3);
      ctx.fill();
      ctx.stroke();

      ctx.font = `bold ${Math.max(8, 10 * s)}px sans-serif`;
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'center';
      ctx.fillText('Ge Crystal (w ≈ 0.05 cm)', crystalX + crystalW / 2, crystalY + 10 * sy);

      // ── Four Collinear Probes Assembly ──────────────────────────────────────
      const probeHeadY = chamberY + 22 * sy;
      const probeHolderW = 130 * sx;
      const probeHolderH = 18 * sy;
      const probeHolderX = chamberX + chamberW / 2 - probeHolderW / 2;

      // Brass Probe Holder bar
      const brassGrad = ctx.createLinearGradient(probeHolderX, probeHeadY, probeHolderX, probeHeadY + probeHolderH);
      brassGrad.addColorStop(0, '#fef08a');
      brassGrad.addColorStop(0.5, '#ca8a04');
      brassGrad.addColorStop(1, '#854d0e');
      ctx.fillStyle = brassGrad;
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 1;
      roundRect(ctx, probeHolderX, probeHeadY, probeHolderW, probeHolderH, 4);
      ctx.fill();
      ctx.stroke();

      ctx.font = `bold ${Math.max(8, 9 * s)}px sans-serif`;
      ctx.fillStyle = '#422006';
      ctx.textAlign = 'center';
      ctx.fillText('FOUR-PROBE HEAD (s = 0.2 cm)', probeHolderX + probeHolderW / 2, probeHeadY + 12 * sy);

      // Four Collinear Probe Tips
      // Probes 1, 2, 3, 4
      const probeSpacing = 28 * sx;
      const probeStartX = chamberX + chamberW / 2 - (1.5 * probeSpacing);
      const probeTipY = crystalY;

      const probeColors = ['#ef4444', '#f97316', '#10b981', '#38bdf8'];
      const probeLabels = ['1 (I+)', '2 (V+)', '3 (V−)', '4 (I−)'];

      for (let i = 0; i < 4; i++) {
        const px = probeStartX + i * probeSpacing;

        // Spring-loaded probe shaft
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 3 * s;
        ctx.beginPath();
        ctx.moveTo(px, probeHeadY + probeHolderH);
        ctx.lineTo(px, probeTipY - 22 * sy);
        ctx.stroke();

        // Tension spring coils
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const springTop = probeTipY - 22 * sy;
        const springBottom = probeTipY - 8 * sy;
        for (let y = springTop; y < springBottom; y += 3) {
          const zig = (Math.floor(y / 3) % 2 === 0 ? -3 : 3) * s;
          ctx.lineTo(px + zig, y);
        }
        ctx.stroke();

        // Sharp Tungsten Needle Tip
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(px - 2.5 * s, probeTipY - 8 * sy);
        ctx.lineTo(px + 2.5 * s, probeTipY - 8 * sy);
        ctx.lineTo(px, probeTipY);
        ctx.closePath();
        ctx.fill();

        // Contact point indicator
        ctx.beginPath();
        ctx.arc(px, probeTipY, 2 * s, 0, Math.PI * 2);
        ctx.fillStyle = probeColors[i];
        ctx.fill();

        // Probe label text above holder
        ctx.font = `bold ${Math.max(8, 9 * s)}px monospace`;
        ctx.fillStyle = probeColors[i];
        ctx.textAlign = 'center';
        ctx.fillText(probeLabels[i], px, probeHeadY - 5 * sy);
      }

      // Probe spacing measurement arrow (s = 0.2 cm) between Probe 2 and 3
      const p2x = probeStartX + probeSpacing;
      const p3x = probeStartX + 2 * probeSpacing;
      const arrowY = crystalY + 20 * sy;

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p2x, arrowY);
      ctx.lineTo(p3x, arrowY);
      ctx.stroke();

      ctx.font = `${Math.max(8, 9 * s)}px sans-serif`;
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('s = 0.2 cm', (p2x + p3x) / 2, arrowY + 11 * sy);

      // Animated Current Flow within Crystal between Probe 1 and Probe 4
      if (benchState.powerOn && benchState.I_mA > 0) {
        const p1x = probeStartX;
        const p4x = probeStartX + 3 * probeSpacing;
        const pulseT = pulseRef.current;

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(p1x, crystalY + 4 * sy);
        ctx.lineTo(p4x, crystalY + 4 * sy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Pulsing electron dot
        const dotX = p1x + (p4x - p1x) * pulseT;
        ctx.beginPath();
        ctx.arc(dotX, crystalY + 4 * sy, 2.5 * s, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── 5. Connecting Wires ──────────────────────────────────────────────────
      // Wire 1: CCS (+) -> Probe 1 (Red)
      drawSmoothWire(ctx, post1X, postY, probeStartX, probeHeadY + 4 * sy, '#ef4444', 2.5 * s);

      // Wire 4: CCS (-) -> Probe 4 (Blue/Dark)
      drawSmoothWire(ctx, post4X, postY, probeStartX + 3 * probeSpacing, probeHeadY + 4 * sy, '#0284c7', 2.5 * s);

      // Wire 2: DVM (+) -> Probe 2 (Orange)
      drawSmoothWire(ctx, post2X, postY, probeStartX + probeSpacing, probeHeadY + 4 * sy, '#f97316', 2.5 * s);

      // Wire 3: DVM (-) -> Probe 3 (Emerald Green)
      drawSmoothWire(ctx, post3X, postY, probeStartX + 2 * probeSpacing, probeHeadY + 4 * sy, '#10b981', 2.5 * s);

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [benchState]);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[#0a0d14] shadow-md">
      <canvas
        ref={canvasRef}
        className="w-full h-[360px] sm:h-[400px] md:h-[430px] block"
      />
    </div>
  );
}

// ─── Canvas Helper Functions ─────────────────────────────────────────────────

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawSmoothWire(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  lineWidth: number
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);

  // Bezier sag for realistic lab bench cable drape
  const midX = (x1 + x2) / 2;
  const sag = Math.max(30, Math.abs(x2 - x1) * 0.15);
  const midY = Math.max(y1, y2) + sag;

  ctx.bezierCurveTo(x1, midY, x2, midY, x2, y2);
  ctx.stroke();
  ctx.restore();
}
