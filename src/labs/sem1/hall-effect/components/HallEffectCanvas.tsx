import React, { useRef, useEffect } from 'react';
import type { HallEffectBenchState } from '../types';

interface HallEffectCanvasProps {
  benchState: HallEffectBenchState;
}

interface CarrierParticle {
  x: number; // longitudinal position (0 to 1)
  y: number; // transverse position (0 to 1)
  speed: number;
}

export function HallEffectCanvas({ benchState }: HallEffectCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const pulseRef = useRef<number>(0);
  const particlesRef = useRef<CarrierParticle[]>([]);

  // Initialize carrier particles for micro-animation inside crystal
  useEffect(() => {
    const count = 32;
    const initial: CarrierParticle[] = [];
    for (let i = 0; i < count; i++) {
      initial.push({
        x: Math.random(),
        y: 0.15 + Math.random() * 0.7,
        speed: 0.004 + Math.random() * 0.004,
      });
    }
    particlesRef.current = initial;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || 800;
      const height = rect.height || 430;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Pulse ticker
      if (benchState.powerOn && benchState.currentI_mA > 0) {
        pulseRef.current = (pulseRef.current + 0.03 * (benchState.currentI_mA / 5.0)) % 1;
      }

      // Responsive coordinate scalers
      const sx = width / 840;
      const sy = height / 430;
      const s = Math.min(sx, sy);

      // ── 1. Background Grid & Lab Bench Surface ─────────────────────────────
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(1, '#111827');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Instrument bench grid lines
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

      // ── 2. Left Instrument: Constant Current & Hall Voltage Unit (AE-208) ───
      const unitX = 22 * sx;
      const unitY = 35 * sy;
      const unitW = 220 * sx;
      const unitH = 355 * sy;

      // Chassis
      ctx.fillStyle = '#161e2e';
      ctx.strokeStyle = '#2d3748';
      ctx.lineWidth = 2;
      roundRect(ctx, unitX, unitY, unitW, unitH, 10);
      ctx.fill();
      ctx.stroke();

      // Top title bar
      ctx.fillStyle = '#1f293d';
      roundRect(ctx, unitX + 4, unitY + 4, unitW - 8, 30 * sy, 6);
      ctx.fill();

      ctx.font = `bold ${Math.max(10, 11 * s)}px sans-serif`;
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('HALL EFFECT SETUP (AE-208)', unitX + unitW / 2, unitY + 22 * sy);

      // Display 1: Sample Current (mA)
      const disp1X = unitX + 16 * sx;
      const disp1Y = unitY + 48 * sy;
      const disp1W = unitW - 32 * sx;
      const disp1H = 48 * sy;

      ctx.fillStyle = '#050b14';
      ctx.strokeStyle = '#1e293b';
      roundRect(ctx, disp1X, disp1Y, disp1W, disp1H, 6);
      ctx.fill();
      ctx.stroke();

      ctx.font = `bold ${Math.max(16, 20 * s)}px monospace`;
      ctx.fillStyle = benchState.powerOn ? '#38bdf8' : '#1e3a5f';
      ctx.textAlign = 'center';
      const currentText = benchState.powerOn ? benchState.currentI_mA.toFixed(2) : '0.00';
      ctx.fillText(currentText, disp1X + disp1W / 2 - 14 * sx, disp1Y + 32 * sy);

      ctx.font = `bold ${Math.max(9, 11 * s)}px sans-serif`;
      ctx.fillStyle = benchState.powerOn ? '#7dd3fc' : '#334155';
      ctx.textAlign = 'left';
      ctx.fillText('mA', disp1X + disp1W - 28 * sx, disp1Y + 30 * sy);

      ctx.font = `${Math.max(8, 9 * s)}px sans-serif`;
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText('Sample Current (I)', unitX + unitW / 2, disp1Y + disp1H + 13 * sy);

      // Display 2: Hall Millivoltmeter (VH)
      const disp2Y = unitY + 125 * sy;
      ctx.fillStyle = '#050b14';
      ctx.strokeStyle = '#1e293b';
      roundRect(ctx, disp1X, disp2Y, disp1W, disp1H, 6);
      ctx.fill();
      ctx.stroke();

      const vhVal = benchState.powerOn ? benchState.hallVoltage_mV : 0;
      const vhText = benchState.powerOn ? vhVal.toFixed(2) : '0.00';
      ctx.font = `bold ${Math.max(16, 20 * s)}px monospace`;
      ctx.fillStyle = benchState.powerOn
        ? (vhVal < 0 ? '#818cf8' : '#34d399')
        : '#1e3a5f';
      ctx.textAlign = 'center';
      ctx.fillText(vhText, disp1X + disp1W / 2 - 14 * sx, disp2Y + 32 * sy);

      ctx.font = `bold ${Math.max(9, 11 * s)}px sans-serif`;
      ctx.fillStyle = benchState.powerOn ? '#a5b4fc' : '#334155';
      ctx.textAlign = 'left';
      ctx.fillText('mV', disp1X + disp1W - 28 * sx, disp2Y + 30 * sy);

      ctx.font = `${Math.max(8, 9 * s)}px sans-serif`;
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText('Hall Voltage (V_H)', unitX + unitW / 2, disp2Y + disp1H + 13 * sy);

      // Carrier Polarity Indicator Tag
      const tagY = unitY + 204 * sy;
      ctx.fillStyle = benchState.specimenType === 'n-type' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)';
      ctx.strokeStyle = benchState.specimenType === 'n-type' ? '#6366f1' : '#10b981';
      roundRect(ctx, disp1X, tagY, disp1W, 26 * sy, 4);
      ctx.fill();
      ctx.stroke();

      ctx.font = `bold ${Math.max(9, 10 * s)}px sans-serif`;
      ctx.fillStyle = benchState.specimenType === 'n-type' ? '#a5b4fc' : '#6ee7b7';
      ctx.textAlign = 'center';
      ctx.fillText(
        `Germanium (${benchState.specimenType.toUpperCase()})`,
        unitX + unitW / 2,
        tagY + 17 * sy
      );

      // Binding Posts on AE-208:
      // Current Posts: Red (+) and Black (-)
      const postRadius = 8 * s;
      const postI_Y = unitY + 270 * sy;
      const postI_Pos_X = unitX + unitW * 0.3;
      const postI_Neg_X = unitX + unitW * 0.7;

      drawBindingPost(ctx, postI_Pos_X, postI_Y, postRadius, '#ef4444', '+I', s);
      drawBindingPost(ctx, postI_Neg_X, postI_Y, postRadius, '#1e293b', '-I', s);

      ctx.font = `${Math.max(8, 9 * s)}px sans-serif`;
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText('Current Leads (mA)', unitX + unitW / 2, postI_Y + 18 * sy);

      // Hall Voltage Posts: Yellow (+) and Green (-)
      const postV_Y = unitY + 315 * sy;
      const postV_Pos_X = unitX + unitW * 0.3;
      const postV_Neg_X = unitX + unitW * 0.7;

      drawBindingPost(ctx, postV_Pos_X, postV_Y, postRadius, '#f59e0b', '+Vh', s);
      drawBindingPost(ctx, postV_Neg_X, postV_Y, postRadius, '#10b981', '-Vh', s);

      // ── 3. Center: Heavy Electromagnet with Air Gap & Semiconductor Insert ──
      const emCenterX = 455 * sx;
      const emCenterY = 205 * sy;
      const gapWidth = 65 * sx;
      const poleW = 85 * sx;
      const poleH = 140 * sy;

      // Heavy Iron Yoke Base
      ctx.fillStyle = '#1e2638';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      roundRect(ctx, emCenterX - 180 * sx, emCenterY + 70 * sy, 360 * sx, 45 * sy, 8);
      ctx.fill();
      ctx.stroke();

      // Electromagnet Coils (Left and Right Cylinders with copper winding grooves)
      const coilW = 55 * sx;
      const coilH = 110 * sy;
      drawSolenoidCoil(ctx, emCenterX - gapWidth / 2 - poleW - coilW, emCenterY - coilH / 2, coilW, coilH, benchState.powerOn && benchState.magneticFieldB_T > 0, s);
      drawSolenoidCoil(ctx, emCenterX + gapWidth / 2 + poleW, emCenterY - coilH / 2, coilW, coilH, benchState.powerOn && benchState.magneticFieldB_T > 0, s);

      // North Pole (Left)
      const leftPoleX = emCenterX - gapWidth / 2 - poleW;
      const poleY = emCenterY - poleH / 2;
      drawPolePiece(ctx, leftPoleX, poleY, poleW, poleH, 'N', '#3b82f6', s);

      // South Pole (Right)
      const rightPoleX = emCenterX + gapWidth / 2;
      drawPolePiece(ctx, rightPoleX, poleY, poleW, poleH, 'S', '#ef4444', s);

      // Magnetic Flux Lines across air gap (Cyan glowing arrows)
      if (benchState.powerOn && benchState.magneticFieldB_T > 0) {
        const fluxCount = 6;
        const bRatio = Math.min(1, benchState.magneticFieldB_kG / 5.0);
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.25 + 0.5 * bRatio})`;
        ctx.fillStyle = `rgba(56, 189, 248, ${0.4 + 0.5 * bRatio})`;
        ctx.lineWidth = 1.5 * s;

        for (let i = 0; i < fluxCount; i++) {
          const fy = poleY + 20 * sy + (i * (poleH - 40 * sy)) / (fluxCount - 1);
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.moveTo(emCenterX - gapWidth / 2, fy);
          ctx.lineTo(emCenterX + gapWidth / 2, fy);
          ctx.stroke();
          ctx.setLineDash([]);

          // Arrowhead pointing from N (left) to S (right)
          ctx.beginPath();
          ctx.moveTo(emCenterX + 8 * sx, fy);
          ctx.lineTo(emCenterX, fy - 3 * sy);
          ctx.lineTo(emCenterX, fy + 3 * sy);
          ctx.closePath();
          ctx.fill();
        }

        // B-field vector banner
        ctx.font = `bold ${Math.max(9, 10 * s)}px monospace`;
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText(`B-Field → (${benchState.magneticFieldB_kG.toFixed(1)} kG)`, emCenterX, poleY - 8 * sy);
      }

      // Semiconductor Sample Card / Probe Holder in air gap
      const sampleCardW = 34 * sx;
      const sampleCardH = 95 * sy;
      const sampleCardX = emCenterX - sampleCardW / 2;
      const sampleCardY = emCenterY - sampleCardH / 2;

      // PCB / Probe card mount
      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 1.5;
      roundRect(ctx, sampleCardX, sampleCardY, sampleCardW, sampleCardH, 4);
      ctx.fill();
      ctx.stroke();

      // Germanium Crystal Slice (dark metallic slice inside card)
      const cryW = 20 * sx;
      const cryH = 50 * sy;
      const cryX = emCenterX - cryW / 2;
      const cryY = emCenterY - cryH / 2;

      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      roundRect(ctx, cryX, cryY, cryW, cryH, 2);
      ctx.fill();
      ctx.stroke();

      // Sample Crystal label
      ctx.font = `bold ${Math.max(7, 8 * s)}px sans-serif`;
      ctx.fillStyle = '#cbd5e1';
      ctx.textAlign = 'center';
      ctx.fillText('Ge', emCenterX, cryY + 12 * sy);

      // Microscopic Charge Carrier Drift & Lorentz Deflection Animation
      if (benchState.powerOn && benchState.currentI_mA > 0) {
        const isNType = benchState.specimenType === 'n-type';
        const bField = benchState.magneticFieldB_T;
        // Lorentz sideways deflection factor (-1 to +1)
        const deflection = isNType ? -0.35 * Math.min(1, bField / 0.5) : 0.35 * Math.min(1, bField / 0.5);

        ctx.fillStyle = isNType ? '#818cf8' : '#f87171';
        particlesRef.current.forEach((p) => {
          // Advance longitudinal drift
          p.x = (p.x + p.speed * (benchState.currentI_mA / 5.0)) % 1;

          // Transverse deflection towards edge due to Lorentz force
          const targetY = 0.5 + deflection * 0.4 + (p.y - 0.5) * (1 - Math.abs(deflection));
          const px = cryX + 2 + p.x * (cryW - 4);
          const py = cryY + 4 + targetY * (cryH - 8);

          ctx.beginPath();
          ctx.arc(px, py, 1.6 * s, 0, Math.PI * 2);
          ctx.fill();
        });

        // Lateral Hall Charge Accumulation Badges on Crystal Edges
        if (bField > 0.05) {
          const topSign = isNType ? '–' : '+';
          const btmSign = isNType ? '+' : '–';
          ctx.font = `bold ${Math.max(8, 9 * s)}px monospace`;
          ctx.fillStyle = isNType ? '#818cf8' : '#34d399';
          ctx.textAlign = 'center';
          ctx.fillText(topSign, emCenterX, cryY - 3 * sy);
          ctx.fillText(btmSign, emCenterX, cryY + cryH + 9 * sy);
        }
      }

      // Contact Terminals on Sample
      // Longitudinal Current Contacts (Top & Bottom of crystal)
      const termI_Top_X = emCenterX;
      const termI_Top_Y = sampleCardY + 4 * sy;
      const termI_Btm_X = emCenterX;
      const termI_Btm_Y = sampleCardY + sampleCardH - 4 * sy;

      drawContactDot(ctx, termI_Top_X, termI_Top_Y, '#ef4444', s);
      drawContactDot(ctx, termI_Btm_X, termI_Btm_Y, '#38bdf8', s);

      // Transverse Hall Voltage Contacts (Left & Right of crystal)
      const termV_L_X = sampleCardX + 4 * sx;
      const termV_L_Y = emCenterY;
      const termV_R_X = sampleCardX + sampleCardW - 4 * sx;
      const termV_R_Y = emCenterY;

      drawContactDot(ctx, termV_L_X, termV_L_Y, '#f59e0b', s);
      drawContactDot(ctx, termV_R_X, termV_R_Y, '#10b981', s);

      // ── 4. Right Instrument: Digital Gaussmeter Unit ───────────────────────
      const gmX = 645 * sx;
      const gmY = 50 * sy;
      const gmW = 175 * sx;
      const gmH = 320 * sy;

      // Chassis
      ctx.fillStyle = '#161e2e';
      ctx.strokeStyle = '#2d3748';
      ctx.lineWidth = 2;
      roundRect(ctx, gmX, gmY, gmW, gmH, 10);
      ctx.fill();
      ctx.stroke();

      // Top title
      ctx.fillStyle = '#1f293d';
      roundRect(ctx, gmX + 4, gmY + 4, gmW - 8, 30 * sy, 6);
      ctx.fill();

      ctx.font = `bold ${Math.max(10, 11 * s)}px sans-serif`;
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('DIGITAL GAUSSMETER', gmX + gmW / 2, gmY + 22 * sy);

      // Display: Magnetic Flux Density
      const gmDispY = gmY + 50 * sy;
      const gmDispW = gmW - 30 * sx;
      const gmDispX = gmX + 15 * sx;
      const gmDispH = 60 * sy;

      ctx.fillStyle = '#050b14';
      ctx.strokeStyle = '#1e293b';
      roundRect(ctx, gmDispX, gmDispY, gmDispW, gmDispH, 6);
      ctx.fill();
      ctx.stroke();

      const bVal = benchState.powerOn ? benchState.magneticFieldB_kG : 0;
      ctx.font = `bold ${Math.max(18, 22 * s)}px monospace`;
      ctx.fillStyle = benchState.powerOn && bVal > 0 ? '#34d399' : '#1e3a5f';
      ctx.textAlign = 'center';
      ctx.fillText(bVal.toFixed(2), gmDispX + gmDispW / 2 - 12 * sx, gmDispY + 36 * sy);

      ctx.font = `bold ${Math.max(9, 11 * s)}px sans-serif`;
      ctx.fillStyle = benchState.powerOn && bVal > 0 ? '#6ee7b7' : '#334155';
      ctx.textAlign = 'left';
      ctx.fillText('kG', gmDispX + gmDispW - 24 * sx, gmDispY + 34 * sy);

      // Tesla Secondary Readout
      ctx.font = `bold ${Math.max(9, 11 * s)}px monospace`;
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      const bTeslaText = benchState.powerOn ? `${benchState.magneticFieldB_T.toFixed(3)} Tesla` : '0.000 Tesla';
      ctx.fillText(bTeslaText, gmX + gmW / 2, gmDispY + gmDispH + 16 * sy);

      // Range Selector Switch indicator
      const switchY = gmY + 160 * sy;
      ctx.fillStyle = '#0f172a';
      roundRect(ctx, gmDispX, switchY, gmDispW, 40 * sy, 6);
      ctx.fill();

      ctx.font = `${Math.max(8, 9 * s)}px sans-serif`;
      ctx.fillStyle = '#64748b';
      ctx.fillText('Range: 0–20 kG | Probe: InAs Hall', gmX + gmW / 2, switchY + 24 * sy);

      // Probe Connector Socket
      const gmSocketX = gmX + gmW / 2;
      const gmSocketY = gmY + 250 * sy;
      drawBindingPost(ctx, gmSocketX, gmSocketY, 9 * s, '#0284c7', 'Probe', s);

      // ── 5. Cable Wiring Across Instruments ─────────────────────────────────
      // Wire 1: AE-208 (+I Red) -> Sample Top Contact
      drawSmoothWire(ctx, postI_Pos_X, postI_Y, termI_Top_X, termI_Top_Y, '#ef4444', 2.2 * s);

      // Wire 2: AE-208 (-I Dark) -> Sample Bottom Contact
      drawSmoothWire(ctx, postI_Neg_X, postI_Y, termI_Btm_X, termI_Btm_Y, '#0284c7', 2.2 * s);

      // Wire 3: AE-208 (+Vh Yellow) -> Sample Left Contact
      drawSmoothWire(ctx, postV_Pos_X, postV_Y, termV_L_X, termV_L_Y, '#f59e0b', 2.0 * s);

      // Wire 4: AE-208 (-Vh Green) -> Sample Right Contact
      drawSmoothWire(ctx, postV_Neg_X, postV_Y, termV_R_X, termV_R_Y, '#10b981', 2.0 * s);

      // Wire 5: Gaussmeter Probe Cable -> Air gap adjacent to crystal
      const probeHeadX = emCenterX + sampleCardW / 2 + 10 * sx;
      const probeHeadY = emCenterY + 15 * sy;
      drawSmoothWire(ctx, gmSocketX, gmSocketY, probeHeadX, probeHeadY, '#38bdf8', 2.5 * s);

      // Gaussmeter Wand Tip
      ctx.fillStyle = '#0284c7';
      roundRect(ctx, probeHeadX - 4 * sx, probeHeadY - 14 * sy, 8 * sx, 28 * sy, 2);
      ctx.fill();

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
    <div className="w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[#090d16] shadow-md">
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

function drawBindingPost(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  label: string,
  s: number
) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#475569';
  ctx.stroke();

  ctx.font = `bold ${Math.max(7, 8 * s)}px sans-serif`;
  ctx.fillStyle = '#e2e8f0';
  ctx.textAlign = 'center';
  ctx.fillText(label, x, y - radius - 3);
}

function drawContactDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  s: number
) {
  ctx.beginPath();
  ctx.arc(x, y, 3 * s, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#fff';
  ctx.stroke();
}

function drawPolePiece(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  pole: 'N' | 'S',
  color: string,
  s: number
) {
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 6);
  ctx.fill();
  ctx.stroke();

  // Pole label face
  ctx.fillStyle = color;
  ctx.font = `bold ${Math.max(16, 20 * s)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(pole, x + w / 2, y + h / 2 + 7 * s);
}

function drawSolenoidCoil(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  active: boolean,
  s: number
) {
  // Coil core
  ctx.fillStyle = active ? '#b45309' : '#78350f';
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, w, h, 4);
  ctx.fill();
  ctx.stroke();

  // Copper turn ridges
  ctx.strokeStyle = active ? '#f59e0b' : '#92400e';
  ctx.lineWidth = 1;
  for (let ly = y + 8; ly < y + h - 8; ly += 7 * s) {
    ctx.beginPath();
    ctx.moveTo(x + 2, ly);
    ctx.lineTo(x + w - 2, ly);
    ctx.stroke();
  }
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

  const midX = (x1 + x2) / 2;
  const sag = Math.max(25, Math.abs(x2 - x1) * 0.14);
  const midY = Math.max(y1, y2) + sag;

  ctx.bezierCurveTo(x1, midY, x2, midY, x2, y2);
  ctx.stroke();
  ctx.restore();
}
