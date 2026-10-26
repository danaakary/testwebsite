import { useEffect, useRef } from 'react';

/**
 * Spinning dotted globe with a dense mesh of connecting lines
 * and animated "shooting" arcs between random dots.
 * Pure Canvas 2D – no 3D library required.
 */
export default function Globe({
  dotCount = 1600,        // density of dots on the sphere
  linkDistance = 0.105,   // max 3D distance (unit sphere) for mesh lines
  maxArcs = 45,           // simultaneous shooting lines
  speed = 0.0018,         // auto-rotation speed
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- 1. Build evenly distributed points (Fibonacci sphere) ----
    const pts = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < dotCount; i++) {
      const y = 1 - (i / (dotCount - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const t = golden * i;
      // small jitter makes the mesh look organic instead of perfectly regular
      const j = 0.012;
      const p = [
        Math.cos(t) * rad + (Math.random() - 0.5) * j,
        y + (Math.random() - 0.5) * j,
        Math.sin(t) * rad + (Math.random() - 0.5) * j,
      ];
      const len = Math.hypot(...p);
      pts.push([p[0] / len, p[1] / len, p[2] / len]);
    }

    // ---- 2. Precompute neighbour links (dense interconnected mesh) ----
    const links = [];
    const d2max = linkDistance * linkDistance;
    for (let a = 0; a < pts.length; a++) {
      for (let b = a + 1; b < pts.length; b++) {
        const dx = pts[a][0] - pts[b][0];
        const dy = pts[a][1] - pts[b][1];
        const dz = pts[a][2] - pts[b][2];
        if (dx * dx + dy * dy + dz * dz < d2max) links.push(a, b);
      }
    }

    // ---- 3. Shooting arcs ----
    const arcs = [];
    const spawnArc = () => {
      const a = pts[(Math.random() * pts.length) | 0];
      const b = pts[(Math.random() * pts.length) | 0];
      const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      const omega = Math.acos(Math.min(1, Math.max(-1, dot)));
      if (omega < 0.4 || omega > 2.4) return; // skip too short / antipodal
      arcs.push({
        a, b, omega,
        t: 0,
        speed: 0.006 + Math.random() * 0.008,
        hue: Math.random() < 0.7 ? 'cyan' : 'violet',
      });
    };

    const slerp = (a, b, omega, s) => {
      const so = Math.sin(omega);
      const k1 = Math.sin((1 - s) * omega) / so;
      const k2 = Math.sin(s * omega) / so;
      const lift = 1 + Math.sin(Math.PI * s) * omega * 0.18; // arc rises off surface
      return [
        (a[0] * k1 + b[0] * k2) * lift,
        (a[1] * k1 + b[1] * k2) * lift,
        (a[2] * k1 + b[2] * k2) * lift,
      ];
    };

    // ---- 4. Sizing ----
    let w = 0, h = 0, r = 0, cx = 0, cy = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      r = Math.min(w, h) * 0.42;
      cx = w / 2;
      cy = h / 2;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ---- 5. Interaction (drag to spin) ----
    let rotY = 0, tilt = 0.38, velocity = speed, dragging = false, lastX = 0, lastY = 0;
    const down = (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; };
    const move = (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      rotY += dx * 0.005;
      tilt = Math.max(-1, Math.min(1, tilt + dy * 0.003));
      velocity = dx * 0.0008;
      lastX = e.clientX; lastY = e.clientY;
    };
    const up = () => { dragging = false; };
    canvas.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);

    // ---- 6. Projection ----
    const proj = new Float32Array(pts.length * 3);
    const project = (p, out, i) => {
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
      const x1 = p[0] * cosY + p[2] * sinY;
      const z1 = -p[0] * sinY + p[2] * cosY;
      const y2 = p[1] * cosT - z1 * sinT;
      const z2 = p[1] * sinT + z1 * cosT;
      const persp = 1 + z2 * 0.15;
      out[i] = cx + x1 * r * persp;
      out[i + 1] = cy + y2 * r * persp;
      out[i + 2] = z2; // >0 = front
    };
    const tmp = new Float32Array(3);

    // ---- 7. Render loop ----
    let frame = 0, raf;
    const render = () => {
      frame++;
      if (!dragging) {
        velocity += (speed - velocity) * 0.02; // ease back to auto speed
        rotY += reduceMotion ? speed * 0.25 : velocity;
      }

      ctx.clearRect(0, 0, w, h);

      // atmosphere glow
      const g = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 1.35);
      g.addColorStop(0, 'rgba(79,209,255,0.10)');
      g.addColorStop(0.7, 'rgba(120,90,255,0.05)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < pts.length; i++) project(pts[i], proj, i * 3);

      // mesh lines – batched into back & front paths for speed
      ctx.lineWidth = 0.6;
      const back = new Path2D(), front = new Path2D();
      for (let k = 0; k < links.length; k += 2) {
        const a = links[k] * 3, b = links[k + 1] * 3;
        const path = proj[a + 2] + proj[b + 2] > 0 ? front : back;
        path.moveTo(proj[a], proj[a + 1]);
        path.lineTo(proj[b], proj[b + 1]);
      }
      ctx.strokeStyle = 'rgba(120,160,255,0.06)';
      ctx.stroke(back);
      ctx.strokeStyle = 'rgba(79,209,255,0.22)';
      ctx.stroke(front);

      // dots
      for (let i = 0; i < pts.length; i++) {
        const x = proj[i * 3], y = proj[i * 3 + 1], z = proj[i * 3 + 2];
        const f = (z + 1) / 2; // 0 back → 1 front
        ctx.fillStyle = z > 0
          ? `rgba(160,230,255,${0.35 + f * 0.65})`
          : `rgba(120,140,255,${0.08 + f * 0.2})`;
        const s = 0.6 + f * 1.3;
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }

      // shooting arcs
      if (!reduceMotion && arcs.length < maxArcs && frame % 3 === 0) spawnArc();
      for (let i = arcs.length - 1; i >= 0; i--) {
        const arc = arcs[i];
        arc.t += arc.speed;
        if (arc.t > 1.35) { arcs.splice(i, 1); continue; }
        const head = Math.min(arc.t, 1);
        const tail = Math.max(0, arc.t - 0.35);
        const steps = 22;
        const color = arc.hue === 'cyan' ? '79,209,255' : '167,139,250';

        let prev = null;
        for (let s = 0; s <= steps; s++) {
          const u = tail + (head - tail) * (s / steps);
          project(slerp(arc.a, arc.b, arc.omega, u), tmp, 0);
          if (prev) {
            const alpha = (s / steps) * (tmp[2] > -0.15 ? 0.9 : 0.15);
            ctx.strokeStyle = `rgba(${color},${alpha})`;
            ctx.lineWidth = 0.6 + (s / steps) * 1.4;
            ctx.beginPath();
            ctx.moveTo(prev[0], prev[1]);
            ctx.lineTo(tmp[0], tmp[1]);
            ctx.stroke();
          }
          prev = [tmp[0], tmp[1], tmp[2]];
        }
        // glowing head + landing pulse
        if (arc.t <= 1 && prev && prev[2] > -0.15) {
          ctx.fillStyle = `rgba(${color},1)`;
          ctx.shadowColor = `rgba(${color},1)`;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(prev[0], prev[1], 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (arc.t > 1) {
          project(arc.b, tmp, 0);
          if (tmp[2] > 0) {
            const p = (arc.t - 1) / 0.35;
            ctx.strokeStyle = `rgba(${color},${1 - p})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(tmp[0], tmp[1], 2 + p * 10, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [dotCount, linkDistance, maxArcs, speed]);

  return <canvas ref={canvasRef} className="globe-canvas" aria-label="Animated network globe" />;
}
