/**
 * Utility to generate a high-definition 16:9 cinematic multi-panel storyboard canvas
 * Fulfills Section 32: 5-panel martial arts battle storyboard
 */
export function generateSampleStoryboardDataUrl(): { dataUrl: string; width: number; height: number } {
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return { dataUrl: '', width: 1920, height: 1080 };
  }

  // Dark cinematic background
  const bgGrad = ctx.createLinearGradient(0, 0, 1920, 1080);
  bgGrad.addColorStop(0, '#0c0e14');
  bgGrad.addColorStop(0.5, '#121520');
  bgGrad.addColorStop(1, '#080a0e');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1920, 1080);

  // Header banner on storyboard sheet
  ctx.fillStyle = '#1e2333';
  ctx.fillRect(40, 30, 1840, 70);
  ctx.strokeStyle = '#384260';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 30, 1840, 70);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 28px Inter, system-ui, sans-serif';
  ctx.fillText('PRODUCTION STORYBOARD : SEQUENCE 04 — DUEL IN THE TEMPLE COURTYARD', 70, 74);

  ctx.font = '16px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('TARGET: 10.0 SECONDS | 5 PANELS | ASPECT: 16:9 | REF: MASTER VISUAL', 1250, 74);

  // 5 Panels layout: 3 on top row, 2 on bottom row (or 5 sequential panels across grid)
  // Let's make 5 cinematic panels:
  // Top row: Panel 1, Panel 2, Panel 3
  // Bottom row: Panel 4, Panel 5, plus a Production Notes box!
  const panels = [
    {
      num: 1,
      time: '0.0s - 2.0s',
      title: 'SCENE 1: TENSE STANDOFF',
      sub: 'Wide 2-Shot | Golden Hour backlight',
      draw: (cx: number, cy: number, w: number, h: number) => {
        // Floor & stone walls
        ctx.fillStyle = '#1b1d28';
        ctx.fillRect(cx, cy + h * 0.65, w, h * 0.35);
        // Sun glow
        const sun = ctx.createRadialGradient(cx + w * 0.2, cy + h * 0.3, 10, cx + w * 0.2, cy + h * 0.3, 180);
        sun.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
        sun.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = sun;
        ctx.fillRect(cx, cy, w, h);

        // Fighter A (Dark robes, left)
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(cx + w * 0.28, cy + h * 0.45, 18, 0, Math.PI * 2); // head
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx + w * 0.25, cy + h * 0.52, 28, 55); // torso
        ctx.fillRect(cx + w * 0.22, cy + h * 0.72, 14, 45); // left leg
        ctx.fillRect(cx + w * 0.31, cy + h * 0.72, 14, 45); // right leg

        // Fighter B (White robes, right)
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(cx + w * 0.72, cy + h * 0.45, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(cx + w * 0.69, cy + h * 0.52, 26, 55);
        ctx.fillRect(cx + w * 0.66, cy + h * 0.72, 14, 45);
        ctx.fillRect(cx + w * 0.75, cy + h * 0.72, 14, 45);

        // Tension vector line
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(cx + w * 0.35, cy + h * 0.55);
        ctx.lineTo(cx + w * 0.65, cy + h * 0.55);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    },
    {
      num: 2,
      time: '2.0s - 4.0s',
      title: 'SCENE 2: RAPID FORWARD CHARGE',
      sub: 'Low Angle Tracking | Forward Kinetic Rush',
      draw: (cx: number, cy: number, w: number, h: number) => {
        ctx.fillStyle = '#1e1c26';
        ctx.fillRect(cx, cy + h * 0.65, w, h * 0.35);

        // Speed lines
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(cx + 20, cy + 60 + i * 45);
          ctx.lineTo(cx + w * 0.5, cy + 60 + i * 45);
          ctx.stroke();
        }

        // Fighter A lunging forward rightward
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(cx + w * 0.55, cy + h * 0.5, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx + w * 0.45, cy + h * 0.55, 45, 30); // leaning forward

        // Forward motion arrow (Vector direction)
        ctx.strokeStyle = '#ef4444';
        ctx.fillStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx + w * 0.25, cy + h * 0.75);
        ctx.lineTo(cx + w * 0.65, cy + h * 0.75);
        ctx.stroke();
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(cx + w * 0.65, cy + h * 0.75);
        ctx.lineTo(cx + w * 0.62, cy + h * 0.72);
        ctx.lineTo(cx + w * 0.62, cy + h * 0.78);
        ctx.closePath();
        ctx.fill();
      }
    },
    {
      num: 3,
      time: '4.0s - 6.0s',
      title: 'SCENE 3: HEAVY FIST IMPACT',
      sub: 'Tight Medium Close-Up | Shockwave Burst',
      draw: (cx: number, cy: number, w: number, h: number) => {
        // Shockwave burst rings
        const blast = ctx.createRadialGradient(cx + w * 0.5, cy + h * 0.5, 5, cx + w * 0.5, cy + h * 0.5, 150);
        blast.addColorStop(0, 'rgba(239, 68, 68, 0.7)');
        blast.addColorStop(0.4, 'rgba(245, 158, 11, 0.4)');
        blast.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = blast;
        ctx.fillRect(cx, cy, w, h);

        // Clashing silhouettes
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(cx + w * 0.35, cy + h * 0.45, 30, 20); // fist
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(cx + w * 0.62, cy + h * 0.38, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(cx + w * 0.58, cy + h * 0.46, 32, 50); // buckling body

        // Impact spark star
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 3;
        for (let a = 0; a < 8; a++) {
          const ang = (a * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(cx + w * 0.48, cy + h * 0.5);
          ctx.lineTo(cx + w * 0.48 + Math.cos(ang) * 45, cy + h * 0.5 + Math.sin(ang) * 45);
          ctx.stroke();
        }
      }
    },
    {
      num: 4,
      time: '6.0s - 8.0s',
      title: 'SCENE 4: OPPONENT BLOWN BACK',
      sub: 'Tracking Side Profile | Skid Deceleration',
      draw: (cx: number, cy: number, w: number, h: number) => {
        ctx.fillStyle = '#1c1f2e';
        ctx.fillRect(cx, cy + h * 0.68, w, h * 0.32);

        // Dust clouds
        ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
        for (let d = 0; d < 4; d++) {
          ctx.beginPath();
          ctx.arc(cx + w * 0.3 + d * 55, cy + h * 0.75, 25 + d * 10, 0, Math.PI * 2);
          ctx.fill();
        }

        // Fighter B sliding back on right
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(cx + w * 0.65, cy + h * 0.6, 40, 25);
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(cx + w * 0.72, cy + h * 0.52, 16, 0, Math.PI * 2);
        ctx.fill();

        // Rightward recoil arrow
        ctx.strokeStyle = '#f59e0b';
        ctx.fillStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx + w * 0.35, cy + h * 0.4);
        ctx.lineTo(cx + w * 0.65, cy + h * 0.4);
        ctx.stroke();
      }
    },
    {
      num: 5,
      time: '8.0s - 10.0s',
      title: 'SCENE 5: CLOSING & READY STANCE',
      sub: 'Over-The-Shoulder Pull-Back | Resolution',
      draw: (cx: number, cy: number, w: number, h: number) => {
        ctx.fillStyle = '#171922';
        ctx.fillRect(cx, cy + h * 0.65, w, h * 0.35);

        // Foreground silhouette of Fighter A
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cx + w * 0.22, cy + h * 0.52, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(cx + w * 0.14, cy + h * 0.62, 70, 95);

        // Distant standing Fighter B
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(cx + w * 0.75, cy + h * 0.5, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(cx + w * 0.72, cy + h * 0.56, 18, 45);

        // Atmospheric sun flare
        const flare = ctx.createLinearGradient(cx + w * 0.5, cy, cx + w * 0.75, cy + h * 0.6);
        flare.addColorStop(0, 'rgba(251, 191, 36, 0.3)');
        flare.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = flare;
        ctx.fillRect(cx, cy, w, h);
      }
    }
  ];

  // Grid coordinates:
  // Row 1 (Panels 1, 2, 3): y = 130, h = 420, w = 580 each
  // Row 2 (Panels 4, 5, Notes): y = 580, h = 440, w = 580 each
  const w = 580;
  const h = 415;
  const gap = 30;
  const startX = 50;

  panels.forEach((p, idx) => {
    let px = 0;
    let py = 0;

    if (idx < 3) {
      px = startX + idx * (w + gap);
      py = 130;
    } else {
      px = startX + (idx - 3) * (w + gap);
      py = 580;
    }

    // Panel container frame
    ctx.fillStyle = '#10131d';
    ctx.fillRect(px, py, w, h);
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 3;
    ctx.strokeRect(px, py, w, h);

    // Drawing area inside panel
    const drawH = h - 85;
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, w, drawH);
    ctx.clip();
    p.draw(px, py, w, drawH);
    ctx.restore();

    // Panel border between drawing & meta
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, py + drawH);
    ctx.lineTo(px + w, py + drawH);
    ctx.stroke();

    // Panel metadata footer
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(px, py + drawH, w, 85);

    // Scene badge
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(px + 14, py + drawH + 12, 100, 24);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(`SCENE ${p.num}`, px + 22, py + drawH + 28);

    // Timing
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(p.time, px + 125, py + drawH + 29);

    // Title & details
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillText(p.title, px + 14, py + drawH + 54);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(p.sub, px + 14, py + drawH + 73);
  });

  // 6th cell in grid: Production continuity & direction specifications
  const notesX = startX + 2 * (w + gap);
  const notesY = 580;
  ctx.fillStyle = '#0f131f';
  ctx.fillRect(notesX, notesY, w, h);
  ctx.strokeStyle = '#4f46e5';
  ctx.lineWidth = 2;
  ctx.strokeRect(notesX, notesY, w, h);

  ctx.fillStyle = '#818cf8';
  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.fillText('DIRECTOR & CONTINUITY NOTES', notesX + 25, notesY + 45);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '14px Inter, sans-serif';
  const notes = [
    '• Total Sequence Duration: 10.0 Seconds Locked',
    '• Characters: Fighter A (Dark attire) vs Fighter B (White attire)',
    '• Spatial Anchor: Fighter A moves Left-to-Right',
    '• Kinetic Law: Sudden lunge -> Impact -> Recoil slide',
    '• Lighting: Preserved Golden Hour sunset cast shadows',
    '• Rule: No morphing, identity strictly preserved'
  ];

  notes.forEach((nt, i) => {
    ctx.fillText(nt, notesX + 25, notesY + 95 + i * 40);
  });

  // Watermark / Source of truth banner stamp
  ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
  ctx.fillRect(notesX + 25, notesY + 340, w - 50, 48);
  ctx.strokeStyle = '#6366f1';
  ctx.strokeRect(notesX + 25, notesY + 340, w - 50, 48);
  ctx.fillStyle = '#a5b4fc';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('STORYBOARD ORIGINAL — SOURCE OF TRUTH', notesX + 45, notesY + 370);

  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.95),
    width: 1920,
    height: 1080
  };
}
