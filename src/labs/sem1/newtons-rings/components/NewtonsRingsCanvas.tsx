import React, { useRef, useEffect, useCallback } from 'react';
import type { NewtonsRingsBenchState } from '../types';
import {
  computeDarkRingRadiusCm,
  SODIUM_D_LINE_NM,
} from '../physicsEngine';

interface NewtonsRingsCanvasProps {
  benchState: NewtonsRingsBenchState;
  onMicrometerMove?: (newPosCm: number) => void;
}

export function NewtonsRingsCanvas({
  benchState,
  onMicrometerMove,
}: NewtonsRingsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const initialPosRef = useRef<number>(benchState.micrometerPosCm);

  // Optical scaling: cm in real lab to pixels on canvas eyepiece
  // Real ring r_16 for R=100cm is ~0.307 cm (~3.07 mm).
  // In the eyepiece, with 20x magnification, 0.307 cm corresponds to ~120px radius.
  const EYEPIECE_PIXELS_PER_CM = 380; // 1 cm = 380 px in eyepiece view

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!onMicrometerMove) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Eyepiece drag region or vernier scale region
    isDraggingRef.current = true;
    dragStartXRef.current = x;
    initialPosRef.current = benchState.micrometerPosCm;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !onMicrometerMove) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    const deltaX = x - dragStartXRef.current;

    // Converting pixel drag to micrometer travel (sensible sensitivity)
    // 200px drag = ~0.20 cm travel
    const deltaCm = -(deltaX / 1000.0);
    const newPos = Math.max(3.0, Math.min(7.0, initialPosRef.current + deltaCm));
    onMicrometerMove(parseFloat(newPos.toFixed(3)));
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

    // Laboratory instrument dark background
    ctx.fillStyle = '#0a0d13';
    ctx.fillRect(0, 0, width, height);

    const {
      lampOn,
      apparentPosCm,
      centerPosCm,
      radiusOfCurvatureCm,
      contactOffsetCm2,
      vernier,
      ringUnderCrosshair,
      selectedRing,
    } = benchState;

    // ──────────────────────────────────────────────────────────────────────────
    // 1. LEFT PANE: TRAVELING MICROSCOPE EYEPIECE VIEW
    // ──────────────────────────────────────────────────────────────────────────
    const eyeCenterX = 240;
    const eyeCenterY = 250;
    const eyeRadius = 190;

    // Eyepiece outer brass/black metallic housing
    const housingGrad = ctx.createRadialGradient(eyeCenterX, eyeCenterY, eyeRadius - 10, eyeCenterX, eyeCenterY, eyeRadius + 30);
    housingGrad.addColorStop(0, '#1c212d');
    housingGrad.addColorStop(0.5, '#283143');
    housingGrad.addColorStop(1, '#0e121a');
    ctx.fillStyle = housingGrad;
    ctx.beginPath();
    ctx.arc(eyeCenterX, eyeCenterY, eyeRadius + 25, 0, Math.PI * 2);
    ctx.fill();

    // Metallic bezel screw ring
    ctx.strokeStyle = '#3b455b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Clip to eyepiece circular aperture
    ctx.save();
    ctx.beginPath();
    ctx.arc(eyeCenterX, eyeCenterY, eyeRadius, 0, Math.PI * 2);
    ctx.clip();

    // Eyepiece field background: dark amber / black when lamp on, pitch black when off
    if (lampOn) {
      const fieldGlow = ctx.createRadialGradient(
        eyeCenterX,
        eyeCenterY,
        20,
        eyeCenterX,
        eyeCenterY,
        eyeRadius
      );
      fieldGlow.addColorStop(0, 'rgba(255, 185, 45, 0.28)');
      fieldGlow.addColorStop(0.7, 'rgba(220, 140, 20, 0.12)');
      fieldGlow.addColorStop(1, 'rgba(10, 10, 15, 0.95)');
      ctx.fillStyle = fieldGlow;
      ctx.fillRect(eyeCenterX - eyeRadius, eyeCenterY - eyeRadius, eyeRadius * 2, eyeRadius * 2);

      // Horizontal displacement of ring system relative to microscope crosshair:
      // When microscope moves right (apparentPosCm > centerPosCm), rings shift to the left in eyepiece.
      const shiftCm = apparentPosCm - centerPosCm;
      const patternCenterX = eyeCenterX - shiftCm * EYEPIECE_PIXELS_PER_CM;
      const patternCenterY = eyeCenterY;

      // Draw concentric Newton's rings
      // Maximum order to render: n = 28
      const maxN = 28;
      const lambdaCm = SODIUM_D_LINE_NM * 1e-7;

      // Draw each dark ring as a crisp anti-aliased circular fringe
      // Ring spacing rn = sqrt(n * lambda * R)
      for (let n = maxN; n >= 1; n--) {
        const rnCm = computeDarkRingRadiusCm(n, SODIUM_D_LINE_NM, radiusOfCurvatureCm, contactOffsetCm2);
        const rnPx = rnCm * EYEPIECE_PIXELS_PER_CM;

        // Bright ring radius just outside dark ring: (n - 0.5)
        const rBrightCm = Math.sqrt(Math.max(0, (n - 0.5) * lambdaCm * radiusOfCurvatureCm + contactOffsetCm2 / 4));
        const rBrightPx = rBrightCm * EYEPIECE_PIXELS_PER_CM;

        // Fringe thickness decreases with order n
        const fringeWidthPx = Math.max(1.8, (rBrightPx - rnPx) * 0.95);

        // Bright golden sodium halo between dark rings
        ctx.strokeStyle = n === selectedRing
          ? 'rgba(255, 235, 120, 0.85)'
          : 'rgba(245, 180, 40, 0.55)';
        ctx.lineWidth = fringeWidthPx;
        ctx.beginPath();
        ctx.arc(patternCenterX, patternCenterY, rBrightPx, 0, Math.PI * 2);
        ctx.stroke();

        // Dark interference ring (destructive interference minimum)
        ctx.strokeStyle = '#05070a';
        ctx.lineWidth = Math.max(1.5, fringeWidthPx * 0.7);
        ctx.beginPath();
        ctx.arc(patternCenterX, patternCenterY, rnPx, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Central dark spot (contact point t = 0)
      const r0Cm = Math.sqrt(Math.max(0, contactOffsetCm2 / 4));
      const centralSpotPx = Math.max(4, r0Cm * EYEPIECE_PIXELS_PER_CM);
      const darkSpotGrad = ctx.createRadialGradient(
        patternCenterX,
        patternCenterY,
        0,
        patternCenterX,
        patternCenterY,
        centralSpotPx + 6
      );
      darkSpotGrad.addColorStop(0, 'rgba(5, 7, 10, 0.98)');
      darkSpotGrad.addColorStop(0.7, 'rgba(10, 12, 18, 0.95)');
      darkSpotGrad.addColorStop(1, 'rgba(240, 170, 30, 0.1)');
      ctx.fillStyle = darkSpotGrad;
      ctx.beginPath();
      ctx.arc(patternCenterX, patternCenterY, centralSpotPx + 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Lamp is off
      ctx.fillStyle = '#05070a';
      ctx.fillRect(eyeCenterX - eyeRadius, eyeCenterY - eyeRadius, eyeRadius * 2, eyeRadius * 2);
      ctx.fillStyle = '#64748b';
      ctx.font = '13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Sodium Vapor Lamp is OFF', eyeCenterX, eyeCenterY);
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText('Switch ON lamp in Bench Controls to view interference rings', eyeCenterX, eyeCenterY + 20);
    }

    // ── Eyepiece Crosshairs Reticle ──
    // Fine vertical and horizontal spider silk crosshairs
    ctx.strokeStyle = 'rgba(15, 20, 28, 0.85)';
    ctx.lineWidth = 1.2;

    // Shadow line for high contrast
    ctx.shadowColor = 'rgba(255, 255, 255, 0.25)';
    ctx.shadowBlur = 1;

    // Vertical crosshair wire (used for reading alignment)
    ctx.beginPath();
    ctx.moveTo(eyeCenterX, eyeCenterY - eyeRadius);
    ctx.lineTo(eyeCenterX, eyeCenterY + eyeRadius);
    ctx.stroke();

    // Horizontal crosshair wire
    ctx.beginPath();
    ctx.moveTo(eyeCenterX - eyeRadius, eyeCenterY);
    ctx.lineTo(eyeCenterX + eyeRadius, eyeCenterY);
    ctx.stroke();

    // Reset shadow
    ctx.shadowBlur = 0;

    // Small reticle alignment circle at crosshair center
    ctx.strokeStyle = 'rgba(20, 25, 35, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(eyeCenterX, eyeCenterY, 8, 0, Math.PI * 2);
    ctx.stroke();

    // Aperture glass vignette rim
    const rimGrad = ctx.createRadialGradient(eyeCenterX, eyeCenterY, eyeRadius - 15, eyeCenterX, eyeCenterY, eyeRadius);
    rimGrad.addColorStop(0, 'rgba(0,0,0,0)');
    rimGrad.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.arc(eyeCenterX, eyeCenterY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // Exit clip

    // Eyepiece title badge
    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 13px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText("Traveling Microscope Eyepiece View", 40, 36);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText("Concentric sodium rings (λ = 589.3 nm) · rn ∝ √n", 40, 52);

    // Live crosshair alignment indicator badge in eyepiece
    if (lampOn && ringUnderCrosshair) {
      const isAligned = ringUnderCrosshair.isAligned;
      const order = ringUnderCrosshair.order;
      const side = ringUnderCrosshair.side;

      ctx.fillStyle = isAligned ? 'rgba(16, 185, 129, 0.18)' : 'rgba(30, 41, 59, 0.85)';
      ctx.strokeStyle = isAligned ? '#10b981' : '#334155';
      ctx.lineWidth = 1;
      const badgeW = 210;
      const badgeH = 26;
      const badgeX = eyeCenterX - badgeW / 2;
      const badgeY = eyeCenterY + eyeRadius - 38;

      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isAligned ? '#34d399' : '#cbd5e1';
      ctx.font = '600 11px system-ui, sans-serif';
      ctx.textAlign = 'center';

      let label = '';
      if (side === 'center') {
        label = `Central Dark Spot (n = 0)`;
      } else {
        label = `Dark Ring n = ${order} (${side.toUpperCase()}) ${isAligned ? '✓ ALIGNED' : 'Nearby'}`;
      }
      ctx.fillText(label, eyeCenterX, badgeY + 17);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. RIGHT UPPER PANE: LIVE TRAVELING MICROSCOPE VERNIER SCALE MAGNIFIER
    // ──────────────────────────────────────────────────────────────────────────
    const vernierBoxX = 490;
    const vernierBoxY = 25;
    const vernierBoxW = width - vernierBoxX - 25;
    const vernierBoxH = 220;

    // Card background
    ctx.fillStyle = '#111622';
    ctx.strokeStyle = '#232c3f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(vernierBoxX, vernierBoxY, vernierBoxW, vernierBoxH, 10);
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 13px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText("Vernier Scale Magnifier (Least Count = 0.001 cm)", vernierBoxX + 16, vernierBoxY + 24);

    // Live digital measurement readout
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 18px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${vernier.formatted}`, vernierBoxX + vernierBoxW - 16, vernierBoxY + 24);

    // Subtitle breakdown: MSR + (VSR * LC)
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(
      `MSR: ${vernier.msrCm.toFixed(2)} cm + (${vernier.vsrDiv} × 0.001) = ${vernier.totalCm.toFixed(3)} cm`,
      vernierBoxX + vernierBoxW - 16,
      vernierBoxY + 42
    );

    // Scale display viewport
    const scaleAreaX = vernierBoxX + 16;
    const scaleAreaY = vernierBoxY + 60;
    const scaleAreaW = vernierBoxW - 32;
    const scaleAreaH = 135;

    ctx.fillStyle = '#0a0d14';
    ctx.strokeStyle = '#1e2638';
    ctx.beginPath();
    ctx.roundRect(scaleAreaX, scaleAreaY, scaleAreaW, scaleAreaH, 6);
    ctx.fill();
    ctx.stroke();

    // ── Main Scale (Fixed Upper Steel Bar) ──
    const mainScaleY = scaleAreaY + 45;
    const msPxPerCm = 340; // 1 cm = 340 px in vernier magnifier window
    const scaleWindowCenterPosCm = apparentPosCm; // center view around current reading
    const windowCenterX = scaleAreaX + scaleAreaW / 2;

    // Stainless steel bar fill
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(scaleAreaX + 2, scaleAreaY + 10, scaleAreaW - 4, 35);
    ctx.fillStyle = '#334155';
    ctx.fillRect(scaleAreaX + 2, mainScaleY - 2, scaleAreaW - 4, 2);

    // Draw main scale graduations: pitch = 0.05 cm (0.5 mm)
    // Range to show around apparentPosCm
    const halfRangeCm = (scaleAreaW / 2) / msPxPerCm;
    const startCm = Math.max(0, Math.floor((scaleWindowCenterPosCm - halfRangeCm) / 0.05) * 0.05);
    const endCm = Math.ceil((scaleWindowCenterPosCm + halfRangeCm) / 0.05) * 0.05;

    ctx.strokeStyle = '#cbd5e1';
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';

    for (let cm = startCm; cm <= endCm; cm += 0.05) {
      const curCmRounded = parseFloat(cm.toFixed(2));
      const tickX = windowCenterX + (curCmRounded - scaleWindowCenterPosCm) * msPxPerCm;
      if (tickX < scaleAreaX + 5 || tickX > scaleAreaX + scaleAreaW - 5) continue;

      const isCmMark = Math.abs(curCmRounded - Math.round(curCmRounded)) < 0.001;
      const isHalfCm = Math.abs(curCmRounded * 10 - Math.round(curCmRounded * 10)) < 0.001;

      let tickHeight = 8;
      if (isCmMark) {
        tickHeight = 20;
        ctx.fillText(`${Math.round(curCmRounded)}`, tickX, mainScaleY - tickHeight - 4);
      } else if (isHalfCm) {
        tickHeight = 13;
      }

      ctx.beginPath();
      ctx.moveTo(tickX, mainScaleY);
      ctx.lineTo(tickX, mainScaleY - tickHeight);
      ctx.stroke();
    }

    // Label: Main Scale (cm)
    ctx.fillStyle = '#64748b';
    ctx.font = '9px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('MAIN SCALE (cm, 1 div = 0.05 cm)', scaleAreaX + 8, scaleAreaY + 22);

    // ── Vernier Scale (Sliding Lower Plate) ──
    const vernierY = mainScaleY + 2;
    ctx.fillStyle = '#222f46';
    ctx.fillRect(scaleAreaX + 2, vernierY, scaleAreaW - 4, 45);

    // Vernier scale has 50 divisions spanning 49 main scale divisions = 2.45 cm
    // Vernier 0 mark is at apparentPosCm (which is at windowCenterX)
    const vernierZeroX = windowCenterX;

    ctx.strokeStyle = '#93c5fd';
    ctx.fillStyle = '#93c5fd';
    ctx.font = '9px monospace';

    // Draw vernier scale divisions 0 to 50
    // Vernier division width = 49 * 0.05 / 50 = 0.049 cm
    const vernierDivWidthCm = (49 * 0.05) / 50;

    for (let div = 0; div <= 50; div++) {
      const vTickX = vernierZeroX + div * vernierDivWidthCm * msPxPerCm;
      if (vTickX < scaleAreaX + 5 || vTickX > scaleAreaX + scaleAreaW - 5) continue;

      const isFive = div % 5 === 0;
      const isTen = div % 10 === 0;
      const isCoincident = div === vernier.vsrDiv;

      let vTickH = 7;
      if (isTen) {
        vTickH = 16;
        ctx.fillText(`${div}`, vTickX, vernierY + vTickH + 11);
      } else if (isFive) {
        vTickH = 11;
      }

      // Highlight coincident vernier line with bright emerald color
      if (isCoincident) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 1;
      }

      ctx.beginPath();
      ctx.moveTo(vTickX, vernierY);
      ctx.lineTo(vTickX, vernierY + vTickH);
      ctx.stroke();
    }

    // Coincidence pointer arrow above vernier
    const coincidentX = vernierZeroX + vernier.vsrDiv * vernierDivWidthCm * msPxPerCm;
    if (coincidentX >= scaleAreaX + 5 && coincidentX <= scaleAreaX + scaleAreaW - 5) {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(coincidentX, vernierY + 28);
      ctx.lineTo(coincidentX - 4, vernierY + 34);
      ctx.lineTo(coincidentX + 4, vernierY + 34);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#34d399';
      ctx.font = '600 9px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Coincident Line: div #${vernier.vsrDiv}`, coincidentX, vernierY + 44);
    }

    // Reset styles
    ctx.lineWidth = 1;

    // ──────────────────────────────────────────────────────────────────────────
    // 3. RIGHT LOWER PANE: OPTICAL RAY DIAGRAM INSET
    // ──────────────────────────────────────────────────────────────────────────
    const rayBoxX = 490;
    const rayBoxY = 260;
    const rayBoxW = width - rayBoxX - 25;
    const rayBoxH = height - rayBoxY - 20;

    // Inset container
    ctx.fillStyle = '#111622';
    ctx.strokeStyle = '#232c3f';
    ctx.beginPath();
    ctx.roundRect(rayBoxX, rayBoxY, rayBoxW, rayBoxH, 10);
    ctx.fill();
    ctx.stroke();

    // Diagram title
    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 12px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText("Side-View Optical Ray Diagram (Division of Amplitude)", rayBoxX + 16, rayBoxY + 22);

    // Optical Components Geometry
    // 1. Sodium lamp (left side of diagram)
    const lampX = rayBoxX + 40;
    const lampY = rayBoxY + 115;

    // Sodium bulb glow
    if (lampOn) {
      const bulbGlow = ctx.createRadialGradient(lampX, lampY, 3, lampX, lampY, 24);
      bulbGlow.addColorStop(0, '#fef08a');
      bulbGlow.addColorStop(0.5, '#f59e0b');
      bulbGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = bulbGlow;
      ctx.beginPath();
      ctx.arc(lampX, lampY, 24, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = lampOn ? '#fbbf24' : '#475569';
    ctx.beginPath();
    ctx.arc(lampX, lampY, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Na Lamp', lampX, lampY + 20);

    // 2. Collimating lens L1
    const lens1X = rayBoxX + 90;
    const lens1Y = lampY;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(lens1X, lens1Y, 4, 22, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '9px system-ui, sans-serif';
    ctx.fillText('Lens L₁', lens1X, lens1Y + 32);

    // 3. 45° inclined glass beam splitter G
    const splitterX = rayBoxX + 175;
    const splitterY = lampY;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(splitterX - 18, splitterY - 18);
    ctx.lineTo(splitterX + 18, splitterY + 18);
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('45° Glass Plate (G)', splitterX + 22, splitterY - 6);

    // 4. Traveling Microscope Objective above splitter
    const scopeX = splitterX;
    const scopeY = rayBoxY + 45;
    ctx.fillStyle = '#334155';
    ctx.fillRect(scopeX - 16, scopeY - 12, 32, 24);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(scopeX - 16, scopeY - 12, 32, 24);

    // Microscope tube barrel
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(scopeX - 8, scopeY - 30, 16, 20);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Microscope (M)', scopeX, scopeY - 16);

    // 5. Plano-Convex Lens (L) and Plane Glass Plate (P) below splitter
    const stageX = splitterX;
    const stageY = rayBoxY + 175;

    // Plane Glass Plate P (bottom flat substrate)
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.fillRect(stageX - 45, stageY + 6, 90, 8);
    ctx.strokeRect(stageX - 45, stageY + 6, 90, 8);

    // Plano-Convex Lens (convex surface facing down, touching plate at center)
    ctx.fillStyle = 'rgba(147, 197, 253, 0.2)';
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // Flat top surface
    ctx.moveTo(stageX - 40, stageY - 4);
    ctx.lineTo(stageX + 40, stageY - 4);
    // Convex curved bottom surface touching plate at stageX, stageY + 6
    ctx.quadraticCurveTo(stageX, stageY + 12, stageX - 40, stageY - 4);
    ctx.fill();
    ctx.stroke();

    // Labels for Lens & Plate
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Plano-Convex Lens (R ≈ 100 cm)', stageX + 48, stageY + 2);
    ctx.fillText('Air Film (t)', stageX + 48, stageY + 11);
    ctx.fillText('Flat Glass Plate (P)', stageX + 48, stageY + 20);

    // 6. Ray Paths (when lamp is ON)
    if (lampOn) {
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);

      // Rays from lamp through collimator L1 to 45° plate G (Horizontal yellow rays)
      ctx.strokeStyle = '#facc15';
      ctx.beginPath();
      // Upper ray
      ctx.moveTo(lampX + 8, lampY - 6);
      ctx.lineTo(splitterX, lampY - 6);
      // Central ray
      ctx.moveTo(lampX + 8, lampY);
      ctx.lineTo(splitterX, lampY);
      // Lower ray
      ctx.moveTo(lampX + 8, lampY + 6);
      ctx.lineTo(splitterX, lampY + 6);
      ctx.stroke();

      // Reflected rays downwards normally onto lens-plate air film
      ctx.beginPath();
      ctx.moveTo(splitterX - 6, lampY);
      ctx.lineTo(splitterX - 6, stageY + 4);
      ctx.moveTo(splitterX, lampY);
      ctx.lineTo(splitterX, stageY + 5);
      ctx.moveTo(splitterX + 6, lampY);
      ctx.lineTo(splitterX + 6, stageY + 4);
      ctx.stroke();

      // Reflected interference rays going up through 45° plate into microscope objective
      ctx.strokeStyle = '#34d399';
      ctx.beginPath();
      ctx.moveTo(splitterX - 4, stageY + 4);
      ctx.lineTo(splitterX - 4, scopeY + 10);
      ctx.moveTo(splitterX + 4, stageY + 4);
      ctx.lineTo(splitterX + 4, scopeY + 10);
      ctx.stroke();

      ctx.setLineDash([]); // Reset line dash
    }

  }, [benchState]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <div className="w-full flex flex-col items-center select-none">
      <div className="w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[#0c1017] shadow-xl">
        <canvas
          ref={canvasRef}
          width={900}
          height={480}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-auto cursor-ew-resize block"
          style={{ touchAction: 'none' }}
        />
      </div>

      <div className="w-full mt-2 flex items-center justify-between text-xs text-[var(--text-muted)] px-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Click & Drag across canvas to pan traveling microscope horizontally</span>
        </div>
        <div className="font-mono text-[11px] text-[var(--text)]">
          Eyepiece Reticle: Fixed &bull; Scale Resolution: 0.001 cm (10 &mu;m)
        </div>
      </div>
    </div>
  );
}
