import React, { useRef, useEffect, useCallback } from 'react';
import type { CareyFosterBenchState } from '../types';

interface CareyFosterCanvasProps {
  benchState: CareyFosterBenchState;
  onJockeyMove?: (newPosCm: number) => void;
}

export function CareyFosterCanvas({
  benchState,
  onJockeyMove,
}: CareyFosterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Convert canvas X coordinate on the wire into centimeters (0 to 100 cm)
  const getWireCoords = (canvasWidth: number) => {
    const wireStartX = 70;
    const wireEndX = canvasWidth - 70;
    const wireLengthPx = wireEndX - wireStartX;
    const wireY = 270;
    return { wireStartX, wireEndX, wireLengthPx, wireY };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!onJockeyMove) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const { wireStartX, wireLengthPx, wireY } = getWireCoords(canvas.width);

    // If click is near the wire / meter scale region (Y between 220 and 320)
    if (y >= 210 && y <= 330 && x >= wireStartX - 15 && x <= wireStartX + wireLengthPx + 15) {
      isDraggingRef.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      const clampedX = Math.max(wireStartX, Math.min(wireStartX + wireLengthPx, x));
      const cm = ((clampedX - wireStartX) / wireLengthPx) * 100.0;
      onJockeyMove(parseFloat(cm.toFixed(1)));
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !onJockeyMove) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const x = (e.clientX - rect.left) * scaleX;

    const { wireStartX, wireLengthPx } = getWireCoords(canvas.width);
    const clampedX = Math.max(wireStartX, Math.min(wireStartX + wireLengthPx, x));
    const cm = ((clampedX - wireStartX) / wireLengthPx) * 100.0;
    onJockeyMove(parseFloat(cm.toFixed(1)));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear Canvas with rich dark laboratory bench background
    ctx.fillStyle = '#0c1017';
    ctx.fillRect(0, 0, width, height);

    // ── 1. Carey Foster's Teakwood Board ────────────────────────────────────
    const boardX = 20;
    const boardY = 20;
    const boardW = width - 40;
    const boardH = 360;

    // Wood base shadow & fill
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#1e140d'; // Deep teakwood tone
    ctx.strokeStyle = '#3b2514';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(boardX, boardY, boardW, boardH, 12);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Wood grain highlight line
    ctx.strokeStyle = 'rgba(255, 200, 150, 0.05)';
    ctx.lineWidth = 1;
    for (let gy = boardY + 15; gy < boardY + boardH - 10; gy += 25) {
      ctx.beginPath();
      ctx.moveTo(boardX + 10, gy);
      ctx.lineTo(boardX + boardW - 10, gy);
      ctx.stroke();
    }

    // ── 2. Heavy Brass Strips and 4 Gaps ────────────────────────────────────
    // Strip configuration: Outer Left, Inner Left-Center, Inner Right-Center, Outer Right
    const brassGradient = ctx.createLinearGradient(0, 40, 0, 100);
    brassGradient.addColorStop(0, '#fef08a');
    brassGradient.addColorStop(0.5, '#ca8a04');
    brassGradient.addColorStop(1, '#854d0e');

    ctx.fillStyle = brassGradient;
    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = 2;

    // Gap coordinates along top brass rail
    const gap1LeftX = 45;
    const gap1RightX = 180;

    const gap2LeftX = 240;
    const gap2RightX = 370;

    const gap3LeftX = 430;
    const gap3RightX = 560;

    const gap4LeftX = 620;
    const gap4RightX = width - 45;

    // Draw brass segments
    const drawBrassBar = (x1: number, y1: number, w: number, h: number) => {
      ctx.beginPath();
      ctx.roundRect(x1, y1, w, h, 4);
      ctx.fill();
      ctx.stroke();

      // Brass screws / binding posts
      ctx.fillStyle = '#fef9c3';
      ctx.beginPath();
      ctx.arc(x1 + 8, y1 + h / 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x1 + w - 8, y1 + h / 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = brassGradient;
    };

    // Horizontal top brass plates
    drawBrassBar(gap1LeftX, 50, 45, 18);
    drawBrassBar(gap1RightX, 50, 60, 18);
    drawBrassBar(gap2RightX, 50, 60, 18);
    drawBrassBar(gap3RightX, 50, 60, 18);
    drawBrassBar(gap4RightX - 45, 50, 45, 18);

    // Left vertical strip going down to wire terminal A
    ctx.beginPath();
    ctx.roundRect(gap1LeftX, 50, 18, 220, 3);
    ctx.fill();
    ctx.stroke();

    // Right vertical strip going down to wire terminal B
    ctx.beginPath();
    ctx.roundRect(gap4RightX - 18, 50, 18, 220, 3);
    ctx.fill();
    ctx.stroke();

    // ── 3. The 4 Gaps Content & Labels ──────────────────────────────────────
    const isNormal = benchState.gapConfig === 'normal';
    const isPartA = benchState.part === 'partA';

    // Left gap component: X if normal, Strip/Y if interchanged
    const leftComponentName = isNormal
      ? `Fractional Box X (${benchState.resistanceX_ohm.toFixed(1)} Ω)`
      : isPartA
      ? 'Thick Cu Strip (0.00 Ω)'
      : `Wire Y (${benchState.activeSpecimen.name})`;

    // Right gap component: Strip/Y if normal, X if interchanged
    const rightComponentName = isNormal
      ? isPartA
        ? 'Thick Cu Strip (0.00 Ω)'
        : `Wire Y (${benchState.activeSpecimen.name})`
      : `Fractional Box X (${benchState.resistanceX_ohm.toFixed(1)} Ω)`;

    // Draw Gap 1 (Outer Left)
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = isNormal ? '#38bdf8' : '#a855f7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(gap1LeftX + 35, 42, gap1RightX - gap1LeftX - 25, 34, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = isNormal ? '#38bdf8' : '#c084fc';
    ctx.textAlign = 'center';
    ctx.fillText('GAP 1 (Outer Left)', gap1LeftX + 35 + (gap1RightX - gap1LeftX - 25) / 2, 54);
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(leftComponentName, gap1LeftX + 35 + (gap1RightX - gap1LeftX - 25) / 2, 68);

    // Draw Gap 2 (Inner Left - Ratio Arm P)
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(gap1RightX + 50, 42, gap2RightX - gap1RightX - 40, 34, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('GAP 2 (Ratio P)', gap1RightX + 50 + (gap2RightX - gap1RightX - 40) / 2, 54);
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('P = 2.0 Ω', gap1RightX + 50 + (gap2RightX - gap1RightX - 40) / 2, 68);

    // Draw Gap 3 (Inner Right - Ratio Arm Q)
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#64748b';
    ctx.beginPath();
    ctx.roundRect(gap2RightX + 50, 42, gap3RightX - gap2RightX - 40, 34, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('GAP 3 (Ratio Q)', gap2RightX + 50 + (gap3RightX - gap2RightX - 40) / 2, 54);
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('Q = 2.0 Ω', gap2RightX + 50 + (gap3RightX - gap2RightX - 40) / 2, 68);

    // Draw Gap 4 (Outer Right)
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = !isNormal ? '#38bdf8' : '#a855f7';
    ctx.beginPath();
    ctx.roundRect(gap3RightX + 50, 42, gap4RightX - gap3RightX - 40, 34, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = !isNormal ? '#38bdf8' : '#c084fc';
    ctx.fillText('GAP 4 (Outer Right)', gap3RightX + 50 + (gap4RightX - gap3RightX - 40) / 2, 54);
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(rightComponentName, gap3RightX + 50 + (gap4RightX - gap3RightX - 40) / 2, 68);

    // ── 4. Center Node & Galvanometer Connection ────────────────────────────
    const centralJunctionX = (gap2RightX + gap2RightX + 50) / 2 + 5;
    const centralJunctionY = 59;

    // Terminal Post at center of P & Q
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(centralJunctionX, centralJunctionY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ── 5. Galvanometer Meter Display (Upper Center) ────────────────────────
    const galvoX = width / 2;
    const galvoY = 150;
    const galvoR = 52;

    // Galvo outer metallic bezel
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(galvoX, galvoY, galvoR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Galvo scale dial
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(galvoX, galvoY, galvoR - 5, 0, Math.PI * 2);
    ctx.fill();

    // Zero-center dial tick marks (-30 to +30 divs)
    ctx.strokeStyle = '#0f172a';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const maxDeflDiv = 30;
    const maxAngleRad = Math.PI * 0.42; // +/- 75 degrees sweep

    for (let div = -maxDeflDiv; div <= maxDeflDiv; div += 5) {
      const angle = (div / maxDeflDiv) * maxAngleRad - Math.PI / 2;
      const isMajor = div % 10 === 0;
      const rInner = galvoR - (isMajor ? 16 : 12);
      const rOuter = galvoR - 7;

      const x1 = galvoX + rInner * Math.cos(angle);
      const y1 = galvoY + rInner * Math.sin(angle);
      const x2 = galvoX + rOuter * Math.cos(angle);
      const y2 = galvoY + rOuter * Math.sin(angle);

      ctx.lineWidth = isMajor ? 1.5 : 0.8;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      if (isMajor) {
        const textR = rInner - 7;
        const tx = galvoX + textR * Math.cos(angle);
        const ty = galvoY + textR * Math.sin(angle);
        ctx.font = 'bold 7px "JetBrains Mono", monospace';
        ctx.fillText(`${div > 0 ? '+' : ''}${div}`, tx, ty);
      }
    }

    // Galvanometer needle angle
    const needleDiv = Math.max(-30, Math.min(30, benchState.galvoDeflectionDiv));
    const needleAngle = (needleDiv / maxDeflDiv) * maxAngleRad - Math.PI / 2;

    // Draw Needle
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(galvoX, galvoY + 4);
    ctx.lineTo(
      galvoX + (galvoR - 10) * Math.cos(needleAngle),
      galvoY + (galvoR - 10) * Math.sin(needleAngle)
    );
    ctx.stroke();

    // Center pivot button
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(galvoX, galvoY + 4, 4, 0, Math.PI * 2);
    ctx.fill();

    // "G" brand text
    ctx.font = 'bold 8px system-ui, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('GALVANOMETER', galvoX, galvoY + 22);

    ctx.restore();

    // Galvo status badge below dial
    ctx.fillStyle = benchState.isAtNull
      ? 'rgba(16, 185, 129, 0.2)'
      : 'rgba(239, 68, 68, 0.15)';
    ctx.strokeStyle = benchState.isAtNull ? '#10b981' : '#f87171';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(galvoX - 70, galvoY + 58, 140, 20, 4);
    ctx.fill();
    ctx.stroke();

    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = benchState.isAtNull ? '#34d399' : '#f87171';
    ctx.textAlign = 'center';
    ctx.fillText(
      benchState.isAtNull
        ? '✦ NULL BALANCED (0.0 div)'
        : `Deflection: ${benchState.galvoDeflectionDiv > 0 ? '+' : ''}${benchState.galvoDeflectionDiv.toFixed(1)} div`,
      galvoX,
      galvoY + 72
    );

    // ── 6. 100 cm Wooden Meter Scale & Bridge Wire ──────────────────────────
    const { wireStartX, wireEndX, wireLengthPx, wireY } = getWireCoords(width);

    // Wooden Meter Ruler Base
    const rulerH = 34;
    const rulerY = wireY - 14;

    ctx.fillStyle = '#d4a373'; // Polished beechwood ruler
    ctx.strokeStyle = '#8c5932';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(wireStartX - 8, rulerY, wireLengthPx + 16, rulerH, 3);
    ctx.fill();
    ctx.stroke();

    // Meter scale mm/cm tick marks
    ctx.fillStyle = '#271c14';
    ctx.strokeStyle = '#271c14';
    ctx.textAlign = 'center';

    for (let cm = 0; cm <= 100; cm++) {
      const x = wireStartX + (cm / 100.0) * wireLengthPx;
      const is10cm = cm % 10 === 0;
      const is5cm = cm % 5 === 0;
      const tickH = is10cm ? 14 : is5cm ? 9 : 5;

      ctx.lineWidth = is10cm ? 1.2 : 0.6;
      ctx.beginPath();
      ctx.moveTo(x, rulerY);
      ctx.lineTo(x, rulerY + tickH);
      ctx.stroke();

      if (is10cm) {
        ctx.font = 'bold 8px "JetBrains Mono", monospace';
        ctx.fillText(`${cm}`, x, rulerY + tickH + 8);
      }
    }

    // Stretched Bridge Wire (Manganin / Constantan)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(wireStartX, wireY + 12);
    ctx.lineTo(wireEndX, wireY + 12);
    ctx.stroke();

    // Terminals A (0 cm) and B (100 cm)
    const drawTerminalPost = (x: number, y: number, label: string) => {
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y);
    };

    drawTerminalPost(wireStartX, wireY + 12, 'A');
    drawTerminalPost(wireEndX, wireY + 12, 'B');

    // Wire labels
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText('0.0 cm (Left End)', wireStartX, wireY + 32);
    ctx.textAlign = 'right';
    ctx.fillText('100.0 cm (Right End)', wireEndX, wireY + 32);

    // ── 7. Sliding Jockey on the Wire ───────────────────────────────────────
    const jockeyX = wireStartX + (benchState.jockeyPosCm / 100.0) * wireLengthPx;
    const jockeyY = wireY + 12;

    // Lead wire from central junction through galvanometer down to Jockey
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.4;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(centralJunctionX, centralJunctionY + 5);
    ctx.lineTo(galvoX, galvoY - galvoR);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(galvoX, galvoY + galvoR + 25);
    ctx.lineTo(galvoX, rulerY - 10);
    ctx.lineTo(jockeyX, rulerY - 10);
    ctx.lineTo(jockeyX, jockeyY - 16);
    ctx.stroke();
    ctx.setLineDash([]);

    // Jockey Handle & Knife Edge
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 6;

    // Jockey cylindrical brass handle
    const handleGradient = ctx.createLinearGradient(jockeyX - 8, 0, jockeyX + 8, 0);
    handleGradient.addColorStop(0, '#fef08a');
    handleGradient.addColorStop(0.5, '#ca8a04');
    handleGradient.addColorStop(1, '#854d0e');

    ctx.fillStyle = handleGradient;
    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(jockeyX - 6, jockeyY - 30, 12, 18, 3);
    ctx.fill();
    ctx.stroke();

    // Knife-edge contact tip
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(jockeyX - 4, jockeyY - 12);
    ctx.lineTo(jockeyX + 4, jockeyY - 12);
    ctx.lineTo(jockeyX, jockeyY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Jockey live readout tag
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = benchState.isAtNull ? '#10b981' : '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(jockeyX - 40, jockeyY - 50, 80, 17, 3);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = benchState.isAtNull ? '#34d399' : '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText(`l = ${benchState.jockeyPosCm.toFixed(1)} cm`, jockeyX, jockeyY - 38);

    // ── 8. Status Overlay / Mode Indicator ──────────────────────────────────
    // Bottom banner with bench telemetry
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(25, height - 38, width - 50, 28, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.textAlign = 'left';
    ctx.fillText(
      `Mode: ${benchState.part === 'partA' ? 'PART A (Calibration ρ_w)' : 'PART B (Unknown Wire Y)'}  |  Config: ${benchState.gapConfig.toUpperCase()}  |  Box X: ${benchState.resistanceX_ohm.toFixed(1)} Ω`,
      40,
      height - 20
    );

    ctx.textAlign = 'right';
    ctx.fillStyle = benchState.isAtNull ? '#34d399' : '#94a3b8';
    ctx.fillText(
      benchState.isAtNull
        ? `✦ EXACT NULL POINT FOUND AT ${benchState.nullPointCm.toFixed(1)} cm`
        : `Target Null: ≈ ${benchState.nullPointCm.toFixed(1)} cm (imbalance: ${benchState.galvoImbalanceOhm > 0 ? '+' : ''}${benchState.galvoImbalanceOhm.toFixed(3)} Ω)`,
      width - 40,
      height - 20
    );
  }, [benchState]);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      render();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [render]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[#0c1017] shadow-xl">
      <canvas
        ref={canvasRef}
        width={880}
        height={390}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-auto block select-none cursor-crosshair touch-none"
      />
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <span className="px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-[var(--text-muted)] border border-white/10 backdrop-blur-sm">
          Interactive Carey Foster Bridge &bull; Click/Drag Jockey on Wire
        </span>
      </div>
    </div>
  );
}
