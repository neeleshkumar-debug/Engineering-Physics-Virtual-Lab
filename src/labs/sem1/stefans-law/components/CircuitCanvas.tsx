import React, { useRef, useEffect } from 'react';
import type { FilamentState } from '../physicsEngine';

interface CircuitCanvasProps {
  filamentState: FilamentState;
  sliderPct: number;
  powerOn: boolean;
}

export function CircuitCanvas({ filamentState, sliderPct, powerOn }: CircuitCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const electronOffsetRef = useRef<number>(0);

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

      // Advance electron current flow animation if power is ON and current > 0
      if (powerOn && filamentState.I > 0) {
        electronOffsetRef.current = (electronOffsetRef.current + (filamentState.I * 1.8 + 0.3)) % 24;
      }

      // Clear canvas with subtle lab bench gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0c0e14');
      bgGrad.addColorStop(1, '#141824');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle bench grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 28;
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

      // Coordinated component positions (responsive based on width & height)
      const scaleX = width / 840;
      const scaleY = height / 440;
      const s = Math.min(scaleX, scaleY);

      // Coordinate anchors
      const psuX = 50 * s + 10;
      const psuY = 80 * s + 15;
      const psuW = 150 * s;
      const psuH = 170 * s;

      const ammX = 270 * s;
      const ammY = 70 * s + 15;
      const meterR = 48 * s;

      const rheoX = 400 * s;
      const rheoY = 75 * s + 15;
      const rheoW = 150 * s;
      const rheoH = 65 * s;

      const bulbX = 680 * s;
      const bulbY = 175 * s;
      const bulbR = 42 * s;

      const voltX = 680 * s;
      const voltY = 325 * s;

      // ─── 1. Wires & Connections ───────────────────────────────────────────
      ctx.lineWidth = 3 * s;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Base wire color
      ctx.strokeStyle = powerOn ? '#38bdf8' : '#334155';

      // Wire path: PSU (+) -> Ammeter (+)
      ctx.beginPath();
      ctx.moveTo(psuX + psuW - 15 * s, psuY + 45 * s);
      ctx.lineTo(ammX - meterR, ammY);
      ctx.stroke();

      // Wire: Ammeter (-) -> Rheostat In
      ctx.beginPath();
      ctx.moveTo(ammX + meterR, ammY);
      ctx.lineTo(rheoX, rheoY + rheoH / 2);
      ctx.stroke();

      // Wire: Rheostat Slider Out -> Bulb (+)
      const sliderContactX = rheoX + (rheoW * (sliderPct / 100));
      ctx.beginPath();
      ctx.moveTo(sliderContactX, rheoY + rheoH);
      ctx.lineTo(sliderContactX, rheoY + rheoH + 25 * s);
      ctx.lineTo(bulbX - bulbR - 15 * s, rheoY + rheoH + 25 * s);
      ctx.lineTo(bulbX - bulbR - 15 * s, bulbY);
      ctx.lineTo(bulbX - 18 * s, bulbY + 30 * s);
      ctx.stroke();

      // Wire: Bulb (-) -> PSU (-) return path
      const returnY = height - 55 * s;
      ctx.beginPath();
      ctx.moveTo(bulbX + 18 * s, bulbY + 30 * s);
      ctx.lineTo(bulbX + bulbR + 25 * s, bulbY + 30 * s);
      ctx.lineTo(bulbX + bulbR + 25 * s, returnY);
      ctx.lineTo(psuX + psuW - 15 * s, returnY);
      ctx.lineTo(psuX + psuW - 15 * s, psuY + psuH - 35 * s);
      ctx.stroke();

      // Voltmeter Parallel Wires across Bulb
      ctx.strokeStyle = powerOn ? '#f59e0b' : '#334155';
      ctx.beginPath();
      ctx.moveTo(bulbX - 18 * s, bulbY + 30 * s);
      ctx.lineTo(bulbX - 45 * s, bulbY + 30 * s);
      ctx.lineTo(bulbX - 45 * s, voltY);
      ctx.lineTo(voltX - meterR, voltY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(bulbX + 18 * s, bulbY + 30 * s);
      ctx.lineTo(bulbX + 45 * s, bulbY + 30 * s);
      ctx.lineTo(bulbX + 45 * s, voltY);
      ctx.lineTo(voltX + meterR, voltY);
      ctx.stroke();

      // Animated current electron flow (dotted traveling pulses)
      if (powerOn && filamentState.I > 0) {
        ctx.save();
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 2 * s;
        ctx.setLineDash([4 * s, 10 * s]);
        ctx.lineDashOffset = -electronOffsetRef.current;

        // Path around main series loop
        ctx.beginPath();
        ctx.moveTo(psuX + psuW - 15 * s, psuY + 45 * s);
        ctx.lineTo(ammX - meterR, ammY);
        ctx.moveTo(ammX + meterR, ammY);
        ctx.lineTo(rheoX, rheoY + rheoH / 2);
        ctx.moveTo(sliderContactX, rheoY + rheoH);
        ctx.lineTo(sliderContactX, rheoY + rheoH + 25 * s);
        ctx.lineTo(bulbX - bulbR - 15 * s, rheoY + rheoH + 25 * s);
        ctx.lineTo(bulbX - bulbR - 15 * s, bulbY);
        ctx.lineTo(bulbX - 18 * s, bulbY + 30 * s);
        ctx.moveTo(bulbX + 18 * s, bulbY + 30 * s);
        ctx.lineTo(bulbX + bulbR + 25 * s, bulbY + 30 * s);
        ctx.lineTo(bulbX + bulbR + 25 * s, returnY);
        ctx.lineTo(psuX + psuW - 15 * s, returnY);
        ctx.stroke();
        ctx.restore();
      }

      // ─── 2. Draw 6V DC Regulated Power Supply ─────────────────────────────
      drawPSU(ctx, psuX, psuY, psuW, psuH, s, powerOn, filamentState.V);

      // ─── 3. Draw DC Ammeter (Series) ──────────────────────────────────────
      drawMeter(ctx, ammX, ammY, meterR, s, 'A', 'DC AMMETER', 0, 1.2, filamentState.I, powerOn, '#38bdf8');

      // ─── 4. Draw Variable Rheostat ────────────────────────────────────────
      drawRheostat(ctx, rheoX, rheoY, rheoW, rheoH, s, sliderPct, powerOn);

      // ─── 5. Draw Tungsten Bulb & Realistic Thermal Glow ───────────────────
      drawBulb(ctx, bulbX, bulbY, bulbR, s, filamentState, powerOn);

      // ─── 6. Draw DC Voltmeter (Parallel) ──────────────────────────────────
      drawMeter(ctx, voltX, voltY, meterR, s, 'V', 'DC VOLTMETER', 0, 6.0, filamentState.V, powerOn, '#f59e0b');

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [filamentState, sliderPct, powerOn]);

  return (
    <div className="w-full relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[#0c0e14] shadow-xl">
      <canvas
        ref={canvasRef}
        className="w-full h-[360px] md:h-[420px] cursor-crosshair block"
      />
      {/* Visual Legend Overlay */}
      <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[11px] text-slate-300 pointer-events-none select-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        Interactive Bench · 60fps Physics Render
      </div>
    </div>
  );
}

// ─── Helper Drawing Functions ────────────────────────────────────────────────

function drawPSU(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  s: number, powerOn: boolean, v: number
) {
  // Main unit casing
  ctx.save();
  ctx.fillStyle = '#1e2330';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2 * s;
  roundRect(ctx, x, y, w, h, 10 * s);
  ctx.fill();
  ctx.stroke();

  // Top header bar
  ctx.fillStyle = '#0f172a';
  roundRect(ctx, x + 4 * s, y + 4 * s, w - 8 * s, 26 * s, 6 * s);
  ctx.fill();

  ctx.fillStyle = '#94a3b8';
  ctx.font = `bold ${10 * s}px ui-sans-serif, system-ui`;
  ctx.textAlign = 'center';
  ctx.fillText('DC REGULATED SUPPLY', x + w / 2, y + 21 * s);

  // Digital LED Display panel
  ctx.fillStyle = '#05070a';
  ctx.fillRect(x + 15 * s, y + 38 * s, w - 30 * s, 42 * s);
  ctx.strokeStyle = '#1e293b';
  ctx.strokeRect(x + 15 * s, y + 38 * s, w - 30 * s, 42 * s);

  // LED Readout
  ctx.font = `bold ${18 * s}px monospace`;
  ctx.textAlign = 'right';
  if (powerOn) {
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = 'rgba(239, 68, 68, 0.6)';
    ctx.shadowBlur = 6 * s;
    ctx.fillText(`${v.toFixed(2)} V`, x + w - 24 * s, y + 66 * s);
    ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = '#331010';
    ctx.fillText('0.00 V', x + w - 24 * s, y + 66 * s);
  }

  // Master Power Rocker Switch
  const switchY = y + 96 * s;
  ctx.fillStyle = '#0f172a';
  roundRect(ctx, x + 18 * s, switchY, 44 * s, 24 * s, 4 * s);
  ctx.fill();

  ctx.fillStyle = powerOn ? '#22c55e' : '#475569';
  roundRect(ctx, powerOn ? x + 40 * s : x + 20 * s, switchY + 2 * s, 20 * s, 20 * s, 3 * s);
  ctx.fill();

  ctx.fillStyle = '#94a3b8';
  ctx.font = `${8 * s}px ui-sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('POWER', x + 68 * s, switchY + 16 * s);

  // Terminals (+) Red and (-) Black
  const termY = y + h - 25 * s;
  // Positive (+)
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(x + w - 25 * s, y + 45 * s, 7 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${9 * s}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('+', x + w - 25 * s, y + 48 * s);

  // Negative (-)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(x + w - 25 * s, termY, 7 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${9 * s}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('−', x + w - 25 * s, termY + 3 * s);

  ctx.restore();
}

function drawMeter(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number, s: number,
  symbol: string, label: string, min: number, max: number,
  val: number, powerOn: boolean, accentColor: string
) {
  ctx.save();

  // Outer bezel
  ctx.fillStyle = '#1e2433';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Dial face
  ctx.fillStyle = '#0a0d14';
  ctx.beginPath();
  ctx.arc(cx, cy, r - 5 * s, 0, Math.PI * 2);
  ctx.fill();

  // Dial scale arc (from -135deg to -45deg)
  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 2.25;
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 16 * s, startAngle, endAngle);
  ctx.stroke();

  // Ticks
  const numTicks = 8;
  for (let i = 0; i <= numTicks; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / numTicks);
    const inner = r - 22 * s;
    const outer = r - 15 * s;
    ctx.strokeStyle = i % 2 === 0 ? '#94a3b8' : '#475569';
    ctx.lineWidth = (i % 2 === 0 ? 1.5 : 1) * s;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
    ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
    ctx.stroke();
  }

  // Needle angle
  const clampedVal = powerOn ? Math.max(min, Math.min(max, val)) : min;
  const valFraction = (clampedVal - min) / (max - min);
  const needleAngle = startAngle + (endAngle - startAngle) * valFraction;

  // Needle line
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(needleAngle) * (r - 18 * s), cy + Math.sin(needleAngle) * (r - 18 * s));
  ctx.stroke();

  // Center needle hub cap
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.arc(cx, cy, 4 * s, 0, Math.PI * 2);
  ctx.fill();

  // Symbol letter (A or V)
  ctx.font = `bold ${12 * s}px ui-sans-serif, system-ui`;
  ctx.fillStyle = accentColor;
  ctx.textAlign = 'center';
  ctx.fillText(symbol, cx, cy - 8 * s);

  // Digital readout below
  ctx.font = `bold ${11 * s}px monospace`;
  ctx.fillStyle = powerOn ? '#ffffff' : '#64748b';
  ctx.fillText(powerOn ? `${val.toFixed(3)} ${symbol}` : `0.000 ${symbol}`, cx, cy + 26 * s);

  // Bottom label
  ctx.font = `${8 * s}px ui-sans-serif`;
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(label, cx, cy + r + 14 * s);

  ctx.restore();
}

function drawRheostat(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  s: number, sliderPct: number, powerOn: boolean
) {
  ctx.save();

  // Ceramic tube / base
  ctx.fillStyle = '#262d3d';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5 * s;
  roundRect(ctx, x, y + 10 * s, w, h - 20 * s, 6 * s);
  ctx.fill();
  ctx.stroke();

  // Coiled wire winding lines
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1 * s;
  const turns = 24;
  for (let i = 0; i < turns; i++) {
    const wx = x + 8 * s + (w - 16 * s) * (i / (turns - 1));
    ctx.beginPath();
    ctx.moveTo(wx, y + 10 * s);
    ctx.lineTo(wx, y + h - 10 * s);
    ctx.stroke();
  }

  // Top metallic guide rod
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(x + 5 * s, y + 4 * s, w - 10 * s, 4 * s);

  // Slider contact head position
  const sliderX = x + 6 * s + (w - 18 * s) * (sliderPct / 100);

  // Slider contact assembly
  ctx.fillStyle = powerOn ? '#38bdf8' : '#e2e8f0';
  roundRect(ctx, sliderX - 6 * s, y, 12 * s, h + 4 * s, 3 * s);
  ctx.fill();

  // Contact knob
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(sliderX - 8 * s, y - 6 * s, 16 * s, 8 * s);

  // Slider label
  ctx.font = `${8 * s}px ui-sans-serif`;
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'center';
  ctx.fillText(`RHEOSTAT: ${sliderPct.toFixed(1)}%`, x + w / 2, y + h + 16 * s);

  ctx.restore();
}

function drawBulb(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  s: number, filamentState: FilamentState, powerOn: boolean
) {
  ctx.save();

  const { T, bulbColor, glowIntensity } = filamentState;

  // 1. Radial bloom around bulb (screen blend for realistic photographic glow)
  if (powerOn && glowIntensity > 0.05) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const bloomRadius = r * (1.5 + glowIntensity * 2.5);
    const grad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, bloomRadius);

    // Fade from bulb color to transparent
    grad.addColorStop(0, bulbColor);
    grad.addColorStop(0.35, `${bulbColor.replace('rgb', 'rgba').replace(')', ', 0.45)')}`);
    grad.addColorStop(0.7, `${bulbColor.replace('rgb', 'rgba').replace(')', ', 0.15)')}`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, bloomRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 2. Glass Bulb Envelope
  const glassGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
  glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
  glassGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.05)');
  glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.15)');

  ctx.fillStyle = glassGrad;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2 * s;

  ctx.beginPath();
  // Bulb pear shape
  ctx.arc(cx, cy, r, Math.PI * 0.25, Math.PI * 0.75, true);
  ctx.lineTo(cx - 16 * s, cy + r * 1.15);
  ctx.lineTo(cx + 16 * s, cy + r * 1.15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Metallic Bayonet Base
  const baseY = cy + r * 1.15;
  ctx.fillStyle = '#64748b';
  ctx.fillRect(cx - 15 * s, baseY, 30 * s, 14 * s);

  // Base screw threads
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5 * s;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(cx - 15 * s, baseY + (i + 1) * 4 * s);
    ctx.lineTo(cx + 15 * s, baseY + (i + 1) * 4 * s);
    ctx.stroke();
  }

  // Internal Filament Support Lead Wires
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  // Left lead
  ctx.moveTo(cx - 10 * s, baseY);
  ctx.lineTo(cx - 10 * s, cy + 10 * s);
  ctx.lineTo(cx - 8 * s, cy - 6 * s);
  // Right lead
  ctx.moveTo(cx + 10 * s, baseY);
  ctx.lineTo(cx + 10 * s, cy + 10 * s);
  ctx.lineTo(cx + 8 * s, cy - 6 * s);
  ctx.stroke();

  // 3. Glowing Tungsten Coiled Filament
  ctx.save();
  ctx.lineWidth = (2.5 + glowIntensity * 1.5) * s;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.strokeStyle = powerOn ? bulbColor : '#334155';

  if (powerOn && glowIntensity > 0.1) {
    ctx.shadowColor = bulbColor;
    ctx.shadowBlur = (6 + glowIntensity * 18) * s;
  }

  // Inverted M coiled filament path
  ctx.beginPath();
  ctx.moveTo(cx - 8 * s, cy - 6 * s);
  ctx.lineTo(cx - 4 * s, cy - 14 * s);
  ctx.lineTo(cx, cy - 8 * s);
  ctx.lineTo(cx + 4 * s, cy - 14 * s);
  ctx.lineTo(cx + 8 * s, cy - 6 * s);
  ctx.stroke();

  ctx.restore();

  // Temperature / Glow state badge below
  ctx.font = `bold ${9 * s}px ui-sans-serif`;
  ctx.fillStyle = powerOn ? bulbColor : '#64748b';
  ctx.textAlign = 'center';
  const labelT = powerOn ? `${Math.round(T)} K` : 'OFF (300 K)';
  ctx.fillText(`TUNGSTEN BULB: ${labelT}`, cx, baseY + 28 * s);

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
