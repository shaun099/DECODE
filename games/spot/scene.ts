'use client';
/**
 * Canvas renderer for The Observatory.
 * Extracted from the original single-file game. Contains only the drawing
 * code — the difference coordinates live server-side in ./logic.ts.
 */

export const SCENE_WIDTH = 1000;
export const SCENE_HEIGHT = 700;

export function renderCanvasScene(ctx: CanvasRenderingContext2D, variant: 'A' | 'B') {
  ctx.save();
  ctx.clearRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);

  // 1. Background Wall & Floor
  drawRoomAtmosphere(ctx);

  // 2. Arched Observatory Window & Sky (Binary Companion Star in B)
  drawObservatoryWindow(ctx, variant);

  // 3. Astronomical Clock (Counterweight: Lance-point in B vs Moon in A)
  drawAstronomicalClock(ctx, variant);

  // 4. Upper Bookshelf (Grimoire Ribbon: 2 beads in B vs 3 in A)
  drawUpperBookshelf(ctx, variant);

  // 5. Slate Blackboard (Angle Symbol: φ in B vs θ in A)
  drawChalkboard(ctx, variant);

  // 6. Hanging Botanical Herbs (Twine: 3 wraps in B vs 4 in A)
  drawHangingHerbs(ctx, variant);

  // 7. Main Worktable
  drawMainWorktable(ctx);

  // 8. Armillary Sphere (Horizon Ring: Missing 15° tick notch in B)
  drawArmillarySphere(ctx, variant);

  // 9. Distillation Apparatus (Collar Scale: 5 ticks in B vs 6 in A)
  drawDistillationApparatus(ctx, variant);

  // 10. Alembic Flask (Suspended Flakes: 5 in B vs 3 in A)
  drawAlembicBurner(ctx, variant);

  // 11. Specimen Bell Jar (Crystal Fracture Vein in B)
  drawSpecimenJar(ctx, variant);

  // 12. Scholar's Rolltop Desk (Wax Seal: Double Concentric Ring in B)
  drawScholarDesk(ctx, variant);

  // 13. Atmospheric Vignette & Warm Lighting
  drawAtmosphericLighting(ctx);

  ctx.restore();
}

function drawRoomAtmosphere(ctx: CanvasRenderingContext2D) {
  const wallGrad = ctx.createLinearGradient(0, 0, 0, 480);
  wallGrad.addColorStop(0, '#191822');
  wallGrad.addColorStop(1, '#272534');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, SCENE_WIDTH, 480);

  ctx.strokeStyle = '#15141d';
  ctx.lineWidth = 1.5;
  for (let y = 40; y < 480; y += 45) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(SCENE_WIDTH, y);
    ctx.stroke();

    const offset = (y / 45) % 2 === 0 ? 0 : 50;
    for (let x = offset; x < SCENE_WIDTH; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 45);
      ctx.stroke();
    }
  }

  const floorGrad = ctx.createLinearGradient(0, 480, 0, SCENE_HEIGHT);
  floorGrad.addColorStop(0, '#1c150f');
  floorGrad.addColorStop(1, '#0e0a07');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, 480, SCENE_WIDTH, SCENE_HEIGHT - 480);

  ctx.strokeStyle = '#2b1f16';
  ctx.lineWidth = 2;
  for (let x = 60; x < SCENE_WIDTH; x += 90) {
    ctx.beginPath();
    ctx.moveTo(x, 480);
    ctx.lineTo(x - 40, SCENE_HEIGHT);
    ctx.stroke();
  }

  ctx.fillStyle = '#3a2b1f';
  ctx.fillRect(0, 472, SCENE_WIDTH, 14);
  ctx.fillStyle = '#4d3929';
  ctx.fillRect(0, 470, SCENE_WIDTH, 3);
}

function drawObservatoryWindow(ctx: CanvasRenderingContext2D, variant: 'A' | 'B') {
  const wx = 500;
  const wy = 135;
  const wr = 115;

  ctx.save();
  ctx.fillStyle = '#14131b';
  ctx.beginPath();
  ctx.arc(wx, wy, wr + 14, Math.PI, 0, false);
  ctx.lineTo(wx + wr + 14, 285);
  ctx.lineTo(wx - wr - 14, 285);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.arc(wx, wy, wr, Math.PI, 0, false);
  ctx.lineTo(wx + wr, 280);
  ctx.lineTo(wx - wr, 280);
  ctx.closePath();
  ctx.clip();

  const skyGrad = ctx.createLinearGradient(0, 20, 0, 280);
  skyGrad.addColorStop(0, '#060a17');
  skyGrad.addColorStop(0.7, '#0b1633');
  skyGrad.addColorStop(1, '#15254d');
  ctx.fillStyle = skyGrad;
  ctx.fill();

  ctx.fillStyle = '#e8f0fe';
  ctx.shadowColor = '#80b3ff';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(wx - 65, wy - 45, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#070c1b';
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(wx - 58, wy - 48, 20, 0, Math.PI * 2);
  ctx.fill();

  const bgStars = [
    [420, 60], [450, 95], [550, 65], [575, 105], [440, 190],
    [560, 210], [530, 240], [470, 250], [410, 140]
  ];
  ctx.fillStyle = '#ffffff';
  bgStars.forEach(([sx, sy]) => {
    ctx.beginPath();
    ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
    ctx.fill();
  });

  const constellation = [
    { x: 475, y: 145 },
    { x: 488, y: 120 },
    { x: 502, y: 138 },
    { x: 518, y: 115 },
    { x: 532, y: 135 }
  ];

  ctx.strokeStyle = 'rgba(120, 190, 255, 0.65)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(constellation[0].x, constellation[0].y);
  for (let i = 1; i < constellation.length; i++) {
    ctx.lineTo(constellation[i].x, constellation[i].y);
  }
  ctx.stroke();

  constellation.forEach((s, idx) => {
    ctx.fillStyle = '#a6d4ff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Micro-Difference #2: Binary companion star
    if (idx === 3 && variant === 'B') {
      ctx.fillStyle = '#ffe57f';
      ctx.beginPath();
      ctx.arc(s.x - 3.5, s.y - 3.2, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  ctx.strokeStyle = '#1d1926';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(wx, wy - wr);
  ctx.lineTo(wx, 280);
  ctx.moveTo(wx - wr, wy);
  ctx.lineTo(wx + wr, wy);
  ctx.stroke();

  ctx.restore();
}

function drawAstronomicalClock(ctx: CanvasRenderingContext2D, variant: 'A' | 'B') {
  const cx = 145;
  const cy = 110;
  const cr = 48;

  ctx.save();
  ctx.fillStyle = '#261a10';
  ctx.beginPath();
  ctx.arc(cx, cy, cr + 6, 0, Math.PI * 2);
  ctx.fill();

  const rimGrad = ctx.createRadialGradient(cx - 10, cy - 10, 10, cx, cy, cr);
  rimGrad.addColorStop(0, '#e5be6a');
  rimGrad.addColorStop(0.7, '#a98030');
  rimGrad.addColorStop(1, '#563e12');
  ctx.fillStyle = rimGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, cr, 0, Math.PI * 2);
  ctx.fill();

  const faceGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, cr - 8);
  faceGrad.addColorStop(0, '#fff6de');
  faceGrad.addColorStop(1, '#d8c29d');
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, cr - 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#4a3821';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const x1 = cx + Math.cos(angle) * (cr - 14);
    const y1 = cy + Math.sin(angle) * (cr - 14);
    const x2 = cx + Math.cos(angle) * (cr - 9);
    const y2 = cy + Math.sin(angle) * (cr - 9);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  const hourAngle = -2.55;
  ctx.strokeStyle = '#2b1b11';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(hourAngle) * 20, cy + Math.sin(hourAngle) * 20);
  ctx.stroke();

  const minAngle = -0.52;
  ctx.strokeStyle = '#1f130b';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(minAngle) * 30, cy + Math.sin(minAngle) * 30);
  ctx.stroke();

  // Micro-Difference #4: Counterweight shape
  const backAngle = minAngle + Math.PI;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(backAngle);

  if (variant === 'B') {
    ctx.fillStyle = '#1f130b';
    ctx.beginPath();
    ctx.moveTo(7, -3);
    ctx.lineTo(15, 0);
    ctx.lineTo(7, 3);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.strokeStyle = '#1f130b';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(11, 0, 4.5, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = '#ffe082';
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#b28b3c';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(cx, cy + cr + 4);
  ctx.lineTo(cx, cy + cr + 30);
  ctx.stroke();
  ctx.fillStyle = '#d4af37';
  ctx.beginPath();
  ctx.arc(cx, cy + cr + 32, 6.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawUpperBookshelf(ctx: CanvasRenderingContext2D, variant: 'A' | 'B') {
  const sx = 760;
  const sy = 120;
  const sw = 215;

  ctx.save();
  ctx.fillStyle = '#3e2717';
  ctx.fillRect(sx, sy, sw, 14);
  ctx.fillStyle = '#22150c';
  ctx.fillRect(sx, sy + 14, sw, 8);

  const books = [
    { x: 770, w: 16, h: 58, color: '#882222' },
    { x: 788, w: 14, h: 52, color: '#1e3d59' },
    { x: 804, w: 22, h: 64, color: '#385934' },
    { x: 828, w: 18, h: 55, color: '#6a381f' },
    { x: 848, w: 24, h: 66, color: '#4a2545', isTarget: true },
    { x: 874, w: 16, h: 50, color: '#1b3b44' },
    { x: 892, w: 20, h: 60, color: '#7a4e21' },
    { x: 914, w: 15, h: 54, color: '#424242' },
    { x: 931, w: 25, h: 48, color: '#556b2f' }
  ];

  books.forEach(b => {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, sy - b.h, b.w, b.h);

    ctx.fillStyle = 'rgba(212, 175, 55, 0.45)';
    ctx.fillRect(b.x, sy - b.h + 8, b.w, 2);
    ctx.fillRect(b.x, sy - 10, b.w, 2);

    if (b.isTarget) {
      const ax = b.x + b.w / 2;
      const ay = sy - b.h / 2;
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(ax, ay + 6);
      ctx.lineTo(ax, ay - 2);
      ctx.moveTo(ax, ay - 2);
      ctx.bezierCurveTo(ax - 6, ay - 7, ax - 7, ay - 2, ax - 6, ay);
      ctx.moveTo(ax, ay - 2);
      ctx.bezierCurveTo(ax + 6, ay - 7, ax + 7, ay - 2, ax + 6, ay);
      ctx.stroke();

      // Micro-Difference #9: Silk ribbon knot beads
      const rx = b.x + 12;
      const ry = sy + 14;

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.bezierCurveTo(rx - 2, ry + 10, rx + 4, ry + 16, rx + 1, ry + 26);
      ctx.stroke();

      const beadCount = variant === 'B' ? 2 : 3;
      const beadPositions = [ry + 10, ry + 18, ry + 25];
      ctx.fillStyle = '#fde047';
      for (let i = 0; i < beadCount; i++) {
        ctx.beginPath();
        ctx.arc(rx + (i === 1 ? 3 : 0), beadPositions[i], 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  ctx.restore();
}

function drawChalkboard(ctx: CanvasRenderingContext2D, variant: 'A' | 'B') {
  const bx = 165;
  const by = 340;
  const bw = 150;
  const bh = 110;

  ctx.save();
  ctx.strokeStyle = '#4e3620';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(bx - bw / 2 + 10, by - bh / 2 - 20);
  ctx.lineTo(bx - bw / 2 - 15, by + bh / 2 + 45);
  ctx.moveTo(bx + bw / 2 - 10, by - bh / 2 - 20);
  ctx.lineTo(bx + bw / 2 + 15, by + bh / 2 + 45);
  ctx.stroke();

  ctx.fillStyle = '#3a2717';
  ctx.fillRect(bx - bw / 2 - 5, by - bh / 2 - 5, bw + 10, bh + 10);
  ctx.fillStyle = '#22302b';
  ctx.fillRect(bx - bw / 2, by - bh / 2, bw, bh);

  ctx.strokeStyle = 'rgba(235, 245, 240, 0.7)';
  ctx.fillStyle = 'rgba(235, 245, 240, 0.7)';
  ctx.font = '10px monospace';
  ctx.fillText('∇ × B = μ₀J', bx - bw / 2 + 10, by - bh / 2 + 20);
  ctx.fillText('ψ(r,θ) = R(r)Y(θ)', bx - bw / 2 + 10, by - bh / 2 + 35);

  const gx = bx + 28;
  const gy = by + 12;
  const gr = 26;

  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(gx, gy, gr, 0, Math.PI * 2);
  ctx.stroke();

  drawStar(ctx, gx, gy, 5, gr, gr * 0.42);

  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx + gr * 0.7, gy - gr * 0.7);
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx + gr, gy);
  ctx.stroke();

  // Micro-Difference #10: Angle notation θ vs φ
  ctx.font = 'bold 9px serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  if (variant === 'B') {
    ctx.fillText('φ', gx + 11, gy - 4);
  } else {
    ctx.fillText('θ', gx + 11, gy - 4);
  }

  ctx.restore();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.stroke();
}

function drawHangingHerbs(ctx: CanvasRenderingContext2D, variant: 'A' | 'B') {
  const hx = 75;
  const hy = 490;

  ctx.save();
  ctx.fillStyle = '#362415';
  ctx.fillRect(0, 420, 150, 10);

  ctx.strokeStyle = '#c4a478';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(hx, 430);
  ctx.lineTo(hx, hy - 25);
  ctx.stroke();

  // Micro-Difference #1: Twine wrap count (3 in B vs 4 in A)
  const wrapCount = variant === 'B' ? 3 : 4;
  ctx.fillStyle = '#8d6e63';
  ctx.fillRect(hx - 6, hy - 26, 12, 12);

  ctx.strokeStyle = '#d7ccc8';
  ctx.lineWidth = 1.5;
  for (let w = 0; w < wrapCount; w++) {
    const wy = hy - 24 + w * 3.2;
    ctx.beginPath();
    ctx.moveTo(hx - 6, wy);
    ctx.lineTo(hx + 6, wy);
    ctx.stroke();
  }

  const angles = [-0.45, -0.22, 0.05, 0.32, 0.55];
  ctx.lineWidth = 1.8;
  for (let i = 0; i < 5; i++) {
    const ang = angles[i];
    const len = 32 + (i % 2) * 8;
    const endX = hx + Math.sin(ang) * len;
    const endY = hy - 14 + Math.cos(ang) * len;

    ctx.strokeStyle = '#4e6b41';
    ctx.beginPath();
    ctx.moveTo(hx, hy - 14);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.fillStyle = '#678d56';
    ctx.beginPath();
    ctx.ellipse(endX, endY, 5, 2.8, ang, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#b39ddb';
    ctx.beginPath();
    ctx.arc(endX + 2, endY + 2, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawMainWorktable(ctx: CanvasRenderingContext2D) {
  ctx.save();
  const tx = 310;
  const ty = 430;
  const tw = 660;
  const th = 28;

  ctx.fillStyle = '#533722';
  ctx.fillRect(tx, ty, tw, 7);
  ctx.fillStyle = '#3c2616';
  ctx.fillRect(tx, ty + 7, tw, th);

  ctx.fillStyle = '#2d1b0f';
  ctx.fillRect(tx + 20, ty + th + 7, 24, 180);
  ctx.fillRect(tx + 320, ty + th + 7, 20, 180);
  ctx.fillRect(tx + tw - 40, ty + th + 7, 24, 180);

  ctx.restore();
}

function drawArmillarySphere(ctx: CanvasRenderingContext2D, variant: 'A' | 'B') {
  const ax = 495;
  const ay = 360;
  const ar = 44;

  ctx.save();
  ctx.fillStyle = '#2c190d';
  ctx.fillRect(ax - 20, ay + ar + 18, 40, 18);
  ctx.fillStyle = '#3d2516';
  ctx.fillRect(ax - 28, ay + ar + 34, 56, 12);

  ctx.strokeStyle = '#c59d3f';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(ax, ay + ar);
  ctx.lineTo(ax, ay + ar + 20);
  ctx.stroke();

  ctx.strokeStyle = '#e2ba55';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(ax, ay, ar, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#b88d30';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(ax, ay, ar, ar * 0.45, Math.PI / 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(ax, ay, ar, ar * 0.45, -Math.PI / 4, 0, Math.PI * 2);
  ctx.stroke();

  const ringRadii = [ar * 0.78, ar * 0.54, ar * 0.32];
  ctx.strokeStyle = '#f5cf6d';
  ctx.lineWidth = 1.8;
  ringRadii.forEach(r => {
    ctx.beginPath();
    ctx.ellipse(ax, ay, r, r * 0.35, 0, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.fillStyle = '#ffe082';
  ctx.shadowColor = '#ffd54f';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(ax, ay, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Micro-Difference #7: Calibration tick notch missing
  ctx.strokeStyle = '#3e2712';
  ctx.lineWidth = 1.4;
  const tickAngles = [-0.45, -0.32, -0.18, -0.05, 0.08];
  tickAngles.forEach((ang, idx) => {
    if (variant === 'B' && idx === 2) {
      return;
    }
    const r1 = ar - 3.5;
    const r2 = ar + 3.5;
    ctx.beginPath();
    ctx.moveTo(ax + Math.cos(ang) * r1, ay + Math.sin(ang) * r1);
    ctx.lineTo(ax + Math.cos(ang) * r2, ay + Math.sin(ang) * r2);
    ctx.stroke();
  });

  ctx.restore();
}

function drawDistillationApparatus(ctx: CanvasRenderingContext2D, variant: 'A' | 'B') {
  const rx = 825;
  const ry = 345;

  ctx.save();
  ctx.fillStyle = 'rgba(150, 210, 240, 0.25)';
  ctx.strokeStyle = 'rgba(210, 240, 255, 0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(rx - 45, ry + 15, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(rx - 45, ry - 5);
  ctx.bezierCurveTo(rx - 45, ry - 35, rx - 15, ry - 35, rx - 10, ry - 25);
  ctx.stroke();

  ctx.fillStyle = 'rgba(180, 230, 255, 0.18)';
  ctx.strokeStyle = 'rgba(210, 240, 255, 0.65)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.rect(rx - 15, ry - 25, 36, 75);
  ctx.fill();
  ctx.stroke();

  const loopSpacing = 15;
  ctx.strokeStyle = '#4fc3f7';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(rx + 3, ry - 20);
  for (let i = 0; i < 4; i++) {
    const topY = ry - 20 + i * loopSpacing;
    const midY = topY + loopSpacing * 0.5;
    const botY = topY + loopSpacing;
    ctx.bezierCurveTo(rx + 16, topY + 2, rx + 16, midY, rx + 3, midY);
    ctx.bezierCurveTo(rx - 10, midY, rx - 10, botY - 2, rx + 3, botY);
  }
  ctx.stroke();

  ctx.strokeStyle = 'rgba(210, 240, 255, 0.8)';
  ctx.beginPath();
  ctx.moveTo(rx + 3, ry + 50);
  ctx.lineTo(rx + 3, ry + 70);
  ctx.stroke();

  ctx.fillStyle = 'rgba(41, 182, 246, 0.65)';
  ctx.fillRect(rx - 8, ry + 72, 22, 14);
  ctx.strokeRect(rx - 9, ry + 68, 24, 18);

  // Micro-Difference #5: Collar calibration scale ticks (5 in B vs 6 in A)
  ctx.fillStyle = '#b08d42';
  ctx.fillRect(rx - 19, ry - 24, 6, 20);

  const scaleTicks = variant === 'B' ? 5 : 6;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  for (let s = 0; s < scaleTicks; s++) {
    const ty = ry - 22 + s * 3.4;
    ctx.beginPath();
    ctx.moveTo(rx - 19, ty);
    ctx.lineTo(rx - 15, ty);
    ctx.stroke();
  }

  ctx.restore();
}

function drawAlembicBurner(ctx: CanvasRenderingContext2D, variant: 'A' | 'B') {
  const fx = 335;
  const fy = 525;

  ctx.save();
  ctx.strokeStyle = '#1e1d24';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(fx - 24, fy + 45);
  ctx.lineTo(fx - 14, fy + 8);
  ctx.lineTo(fx + 14, fy + 8);
  ctx.lineTo(fx + 24, fy + 45);
  ctx.moveTo(fx, fy + 8);
  ctx.lineTo(fx, fy + 45);
  ctx.stroke();

  ctx.fillStyle = '#b58b35';
  ctx.fillRect(fx - 12, fy + 32, 24, 12);
  ctx.fillStyle = '#ff9100';
  ctx.shadowColor = '#ff6d00';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.ellipse(fx, fy + 24, 5, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff59d';
  ctx.beginPath();
  ctx.ellipse(fx, fy + 26, 2.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = 'rgba(230, 245, 255, 0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(fx, fy - 2, 26, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeRect(fx - 6, fy - 40, 12, 16);

  ctx.save();
  ctx.beginPath();
  ctx.arc(fx, fy - 2, 24, 0, Math.PI, false);
  ctx.closePath();
  ctx.fillStyle = 'rgba(16, 185, 129, 0.72)';
  ctx.shadowColor = '#34d399';
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.restore();

  const baseBubbles = [
    { x: fx - 8, y: fy + 12, r: 2.2 },
    { x: fx + 6, y: fy + 15, r: 2.5 },
    { x: fx - 2, y: fy + 6, r: 2.8 }
  ];
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  baseBubbles.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Micro-Difference #8: Suspended luminescent gold micro-flakes (5 in B vs 3 in A)
  const flakePoints = variant === 'B'
    ? [
        { x: fx - 12, y: fy + 8 },
        { x: fx + 2, y: fy + 11 },
        { x: fx + 10, y: fy + 6 },
        { x: fx + 15, y: fy + 12 },
        { x: fx - 6, y: fy + 16 }
      ]
    : [
        { x: fx - 12, y: fy + 8 },
        { x: fx + 2, y: fy + 11 },
        { x: fx + 10, y: fy + 6 }
      ];

  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 4;
  flakePoints.forEach(p => {
    ctx.fillRect(p.x - 1, p.y - 1, 2.2, 2.2);
  });
  ctx.shadowBlur = 0;

  ctx.restore();
}

function drawSpecimenJar(ctx: CanvasRenderingContext2D, variant: 'A' | 'B') {
  const jx = 660;
  const jy = 520;
  const jw = 54;
  const jh = 76;

  ctx.save();
  ctx.fillStyle = '#3d2817';
  ctx.fillRect(jx - jw / 2 - 8, jy + jh / 2 - 4, jw + 16, 12);
  ctx.fillStyle = '#c89d38';
  ctx.fillRect(jx - jw / 2 - 4, jy + jh / 2 - 10, jw + 8, 7);

  ctx.fillStyle = 'rgba(180, 230, 255, 0.16)';
  ctx.strokeStyle = 'rgba(220, 245, 255, 0.75)';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(jx, jy - jh / 2 + jw / 2, jw / 2, Math.PI, 0, false);
  ctx.lineTo(jx + jw / 2, jy + jh / 2 - 10);
  ctx.lineTo(jx - jw / 2, jy + jh / 2 - 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffd54f';
  ctx.beginPath();
  ctx.arc(jx, jy - jh / 2 + jw / 2 - 14, 5, 0, Math.PI * 2);
  ctx.fill();

  const cx = jx;
  const cy = jy - 2;
  ctx.fillStyle = '#38bdf8';
  ctx.shadowColor = '#0284c7';
  ctx.shadowBlur = 12;

  ctx.beginPath();
  ctx.moveTo(cx, cy - 18);
  ctx.lineTo(cx + 10, cy);
  ctx.lineTo(cx, cy + 18);
  ctx.lineTo(cx - 10, cy);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#bae6fd';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 18);
  ctx.lineTo(cx + 10, cy);
  ctx.lineTo(cx, cy);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Micro-Difference #6: Internal prismatic cleavage vein in B
  if (variant === 'B') {
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy + 8);
    ctx.lineTo(cx + 4, cy - 6);
    ctx.lineTo(cx + 7, cy - 11);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx + 4, cy - 6, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawScholarDesk(ctx: CanvasRenderingContext2D, variant: 'A' | 'B') {
  const dx = 890;
  const dy = 575;

  ctx.save();
  ctx.fillStyle = '#edd6b1';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.rect(dx - 55, dy - 20, 65, 45);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = '#85694c';
  ctx.lineWidth = 1.2;
  for (let l = 0; l < 4; l++) {
    ctx.beginPath();
    ctx.moveTo(dx - 48, dy - 10 + l * 9);
    ctx.lineTo(dx - 5, dy - 10 + l * 9);
    ctx.stroke();
  }

  // Micro-Difference #3: Crimson Wax Signet Seal (Double Concentric Ring in B)
  const sx = dx - 42;
  const sy = dy + 14;

  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.arc(sx, sy, 7.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#fca5a5';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(sx, sy, 5.5, 0, Math.PI * 2);
  ctx.stroke();

  if (variant === 'B') {
    ctx.strokeStyle = '#fee2e2';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = '#5c4524';
  ctx.fillRect(dx + 18, dy - 8, 22, 20);
  ctx.fillStyle = '#221508';
  ctx.fillRect(dx + 20, dy - 12, 18, 5);

  const qx = dx + 28;
  const qy = dy - 10;
  ctx.save();
  ctx.translate(qx, qy);
  ctx.rotate(-0.55);

  ctx.strokeStyle = '#e0ded3';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -58);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.bezierCurveTo(12, -26, 14, -50, 0, -58);
  ctx.bezierCurveTo(-10, -50, -8, -26, 0, -14);
  ctx.fill();

  ctx.restore();
  ctx.restore();
}

function drawAtmosphericLighting(ctx: CanvasRenderingContext2D) {
  ctx.save();
  const lightGrad = ctx.createRadialGradient(500, 40, 20, 500, 300, 580);
  lightGrad.addColorStop(0, 'rgba(255, 235, 170, 0.12)');
  lightGrad.addColorStop(0.5, 'rgba(255, 200, 100, 0.04)');
  lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
  ctx.fillStyle = lightGrad;
  ctx.fillRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);

  const vigGrad = ctx.createRadialGradient(
    SCENE_WIDTH / 2, SCENE_HEIGHT / 2, 350,
    SCENE_WIDTH / 2, SCENE_HEIGHT / 2, 600
  );
  vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vigGrad.addColorStop(1, 'rgba(4, 3, 7, 0.55)');
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);

  ctx.restore();
}