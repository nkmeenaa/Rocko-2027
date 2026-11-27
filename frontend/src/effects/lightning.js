/* =====================================================================
   lightning.js — hero lightning (Figma "Transition · Hero lightning")
   Current charges on the letters, releases outward, flickers, fades.
   Bolts start on the real edge pixels of logo.webp. Variant is random per strike:
     0 up-left out of the R · 1 up + down from the middle · 2 out of both ends
     4 burst all round · 5 out of the X diagonally · 8 arcs jumping between letters
   No glow behind the logo; the logo itself brightens while current runs through it.
   ===================================================================== */
import { reduce, createScope } from '../lib/core.js';

export function initLightning() {
  if (reduce) return () => {};
  const scope = createScope();
  const logo = document.getElementById('logo');
  const limg = logo.querySelector('img');
  const cv = document.getElementById('herosky');
  const c = cv.getContext('2d');
  const R = (a, b) => a + Math.random() * (b - a);
  let W, H, dpr, L, variant = 0;
  let edges = [];

  /* find the logo's outline once: sample the alpha channel at 270px wide */
  const img = new Image();
  img.src = limg.getAttribute('src');
  img.onload = () => {
    const w = 270, h = Math.round((w * img.naturalHeight) / img.naturalWidth);
    const o = document.createElement('canvas');
    o.width = w; o.height = h;
    const x = o.getContext('2d');
    x.drawImage(img, 0, 0, w, h);
    let d;
    try { d = x.getImageData(0, 0, w, h).data; } catch (e) {
      // canvas tainted (e.g. opened from file://): fall back to the logo's bounding box
      for (let i = 0; i < 120; i++) { const t = i / 120; edges.push([t, 0.08], [t, 0.92], [0.02, t * 0.84 + 0.08], [0.98, t * 0.84 + 0.08]); }
      return;
    }
    const a = (i, j) => d[(j * w + i) * 4 + 3] > 90;
    for (let j = 1; j < h - 1; j++) for (let i = 1; i < w - 1; i++) {
      if (a(i, j) && (!a(i - 1, j) || !a(i + 1, j) || !a(i, j - 1) || !a(i, j + 1))) edges.push([i / w, j / h]);
    }
  };

  const P = (u, v) => [L.x + u * L.w, L.y + v * L.h];
  function fit() {
    dpr = Math.min(devicePixelRatio || 1, 1.25);
    const r = cv.getBoundingClientRect();
    W = cv.width = Math.round(r.width * dpr);
    H = cv.height = Math.round(r.height * dpr);
  }
  scope.on(window, 'resize', fit);
  fit();
  function measure() {
    const r = limg.getBoundingClientRect(), s = cv.getBoundingClientRect();
    L = { x: (r.left - s.left) * dpr, y: (r.top - s.top) * dpr, w: r.width * dpr, h: r.height * dpr };
  }

  /* ---- bolt geometry: midpoint displacement + forks; each segment has a reveal window [s0,s1] so the bolt grows out ---- */
  function jag(a, b, rough, depth = 7) {
    let pts = [a, b];
    for (let d = 0; d < depth; d++) {
      const n = [pts[0]];
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i - 1], q = pts[i], dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy) || 1;
        const o = R(-1, 1) * len * rough;
        n.push([(p[0] + q[0]) / 2 - (dy / len) * o, (p[1] + q[1]) / 2 + (dx / len) * o], q);
      }
      pts = n;
    }
    return pts;
  }
  function bolt(a, b, { w = 2.2, rough = 0.22, forks = 0.6, depth = 7, alpha = 1, s0 = 0, s1 = 1 } = {}) {
    const pts = jag(a, b, rough, depth), out = [{ pts, w, alpha, s0, s1 }];
    if (forks > 0) {
      for (let i = 4; i < pts.length - 4; i += 4) {
        if (Math.random() >= forks * 0.18) continue;
        const p = pts[i], q = pts[Math.min(pts.length - 1, i + 6)];
        const ang = Math.atan2(q[1] - p[1], q[0] - p[0]) + R(-0.9, 0.9);
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]) * R(0.12, 0.3);
        const f0 = s0 + ((s1 - s0) * i) / pts.length;
        out.push(...bolt(p, [p[0] + Math.cos(ang) * len, p[1] + Math.sin(ang) * len],
          { w: w * 0.55, rough, forks: forks * 0.5, depth: Math.max(3, depth - 2), alpha: alpha * 0.75, s0: f0, s1: f0 + (s1 - f0) * 0.7 }));
      }
    }
    return out;
  }
  function glowBlob(x, y, r, a) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(120,185,255,${a})`);
    g.addColorStop(0.45, `rgba(40,100,230,${a * 0.4})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore();
  }
  function draw(segs, k = 1, grow = 1) {
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.lineJoin = 'round';
    c.lineCap = 'round';
    for (const s of segs) {
      const a = s.alpha * k;
      if (a <= 0.01) continue;
      const loc = Math.max(0, Math.min(1, (grow - s.s0) / Math.max(0.001, s.s1 - s.s0)));
      if (loc <= 0) continue;
      const n = Math.max(2, Math.ceil(loc * s.pts.length));
      c.beginPath();
      c.moveTo(...s.pts[0]);
      for (let i = 1; i < n; i++) c.lineTo(...s.pts[i]);
      c.strokeStyle = `rgba(40,110,255,${0.22 * a})`; c.lineWidth = s.w * 9 * dpr; c.shadowColor = 'rgba(60,140,255,1)'; c.shadowBlur = s.w * 14 * dpr; c.stroke();
      c.strokeStyle = `rgba(110,190,255,${0.55 * a})`; c.lineWidth = s.w * 2.6 * dpr; c.shadowBlur = s.w * 4 * dpr; c.stroke();
      c.strokeStyle = `rgba(240,250,255,${a})`; c.lineWidth = s.w * 0.9 * dpr; c.shadowBlur = 0; c.stroke();
      if (loc < 1) { const tip = s.pts[n - 1]; glowBlob(tip[0], tip[1], s.w * 16 * dpr, 0.5 * a); } // bright leader tip
    }
    c.restore();
  }

  /* ---- where the current leaves the letters (u,v in 0..1 of the wordmark) ---- */
  function edgeIn(u0, u1, v0, v1) {
    if (!edges.length) return [R(u0, u1), R(v0, v1)];
    for (let k = 0; k < 60; k++) {
      const e = edges[Math.floor(Math.random() * edges.length)];
      if (e[0] >= u0 && e[0] <= u1 && e[1] >= v0 && e[1] <= v1) return e;
    }
    return edges[Math.floor(Math.random() * edges.length)];
  }
  const ray = (o, ang, len) => [o[0] + Math.cos(ang) * len, o[1] + Math.sin(ang) * len];
  const D = () => Math.max(L.w, L.h);

  function release() {
    const out = [];
    const push = (e, ang, len, o = {}) => { const p = P(...e); out.push({ at: p, segs: bolt(p, ray(p, ang, len), o) }); };
    switch (variant) {
      case 0: // up-left out of the R
        push(edgeIn(0, 0.22, 0, 0.45), R(-2.7, -2.2), D() * R(0.17, 0.27), { w: 2.4, forks: 1 });
        break;
      case 1: { // up and down from the middle
        push(edgeIn(0.42, 0.58, 0, 0.3), -Math.PI / 2 + R(-0.25, 0.25), L.h * R(0.45, 0.7), { w: 2.6, forks: 1.1 });
        if (Math.random() < 0.8) push(edgeIn(0.42, 0.58, 0.7, 1), Math.PI / 2 + R(-0.25, 0.25), L.h * R(0.4, 0.65), { w: 2.2, forks: 1.1 });
        break;
      }
      case 2: { // out of both ends + a cross current
        push(edgeIn(0, 0.08, 0.3, 0.8), Math.PI + R(-0.18, 0.18), L.w * R(0.12, 0.2), { w: 1.8, rough: 0.14, forks: 1 });
        push(edgeIn(0.92, 1, 0.3, 0.8), R(-0.18, 0.18), L.w * R(0.12, 0.2), { w: 1.8, rough: 0.14, forks: 1 });
        const m = P(...edgeIn(0.4, 0.6, 0.35, 0.7));
        out.push({ at: m, segs: bolt(m, P(-0.02, R(0.35, 0.65)), { w: 1.3, rough: 0.12, forks: 0.6, alpha: 0.8 }).concat(bolt(m, P(1.02, R(0.35, 0.65)), { w: 1.3, rough: 0.12, forks: 0.6, alpha: 0.8 })) });
        break;
      }
      case 4: { // burst outward from all round the letters
        const n = Math.round(R(6, 10));
        for (let i = 0; i < n; i++) {
          const e = edgeIn(0, 1, 0, 1);
          const ang = Math.atan2((e[1] - 0.5) * L.h, (e[0] - 0.5) * L.w) + R(-0.3, 0.3);
          push(e, ang, D() * R(0.1, 0.22), { w: R(1, 1.7), forks: 0.8, alpha: R(0.6, 1) });
        }
        break;
      }
      case 5: // out of the X top-right and the R foot
        push(edgeIn(0.85, 1, 0, 0.3), R(-0.75, -0.45), D() * R(0.16, 0.25), { w: 2.2, rough: 0.16, forks: 1.1 });
        if (Math.random() < 0.75) push(edgeIn(0, 0.15, 0.7, 1), R(2.4, 2.7), D() * R(0.14, 0.22), { w: 2, rough: 0.16, forks: 1.1 });
        break;
      case 8: { // short arcs jumping between nearby edges
        if (!edges.length) break;
        const n = Math.round(R(5, 10));
        for (let i = 0; i < n; i++) {
          const e = edges[Math.floor(Math.random() * edges.length)];
          let f = e, best = 1e9;
          for (let k = 0; k < 40; k++) {
            const g = edges[Math.floor(Math.random() * edges.length)];
            const d = Math.hypot(g[0] - e[0], (g[1] - e[1]) * 0.43);
            if (d > 0.04 && d < 0.13 && d < best) { best = d; f = g; }
          }
          const p = P(...e);
          out.push({ at: p, segs: bolt(p, P(...f), { w: 1.3, rough: 0.32, forks: 0.6, depth: 5 }) });
        }
        break;
      }
    }
    return out;
  }

  /* ---- life cycle: CHARGE → RELEASE (grow) → FLICKER (hold) → FADE ---- */
  const POOL = [0, 1, 2, 4, 5, 8];
  let lastOp = -1;
  let live = [], nextAt = performance.now() + 900, lit = 0, dirty = true, lastFilter = null;
  function spawn(now) {
    variant = POOL[Math.floor(Math.random() * POOL.length)];
    release().forEach((r, i) => live.push({ ...r, t0: now + i * R(30, 160), charge: R(220, 420), grow: R(160, 340), hold: R(180, 520), fade: R(420, 800), fl: 1, nf: 0 }));
  }
  function lifeOf(b, now) {
    const t = now - b.t0;
    if (t < 0) return null;
    if (t < b.charge) return { g: 0, k: 0, ch: t / b.charge };
    const t2 = t - b.charge;
    if (t2 < b.grow) return { g: t2 / b.grow, k: 1, ch: 1 };
    const t3 = t2 - b.grow;
    if (t3 < b.hold) {
      if (now > b.nf) { b.nf = now + R(40, 110); b.fl = Math.random() < 0.12 ? 0.35 : R(0.75, 1); }
      return { g: 1, k: b.fl, ch: 1 };
    }
    const t4 = t3 - b.hold;
    if (t4 < b.fade) { const f = 1 - t4 / b.fade; return { g: 1, k: f * f * (Math.random() < 0.08 ? 0.6 : 1), ch: f }; }
    return false;
  }

  function frame(now) {
    const op = parseFloat(logo.style.opacity || '1');
    if (op !== lastOp) { lastOp = op; cv.style.opacity = op; }
    if (op > 0.02 && scrollY < innerHeight * 2.6 && !document.hidden) {
      if (dirty || live.length) c.clearRect(0, 0, W, H);
      dirty = live.length > 0;
      if (live.length || now >= nextAt - 50) measure();
      let target = 0;
      if (now >= nextAt && edges.length) { spawn(now); nextAt = now + R(1.6, 3.8) * 1000 + 1400; }
      live = live.filter((b) => {
        const s = lifeOf(b, now);
        if (s === false) return false;
        if (!s) return true;
        glowBlob(b.at[0], b.at[1], (14 + 26 * s.ch) * dpr, (s.g ? 0.55 : 0.6 * s.ch) * (s.k || s.ch));
        if (s.g > 0) draw(b.segs, s.k, s.g);
        target = Math.max(target, s.g > 0 ? 0.5 + 0.5 * s.k : 0.35 * s.ch);
        return true;
      });
      // the logo itself brightens while current runs through it
      lit += (target - lit) * (target > lit ? 0.18 : 0.05);
      if (lit < 0.004) lit = 0;
      const f = lit ? `brightness(${(1 + lit * 0.35).toFixed(2)})` : '';
      if (f !== lastFilter) { lastFilter = f; limg.style.filter = f; }
    }
  }

  // the loader fires this on the first riff hit: strike immediately
  scope.on(window, 'rop:drop', () => {
    const n = performance.now();
    if (!edges.length) return;
    spawn(n);
    live.forEach((b) => { b.t0 = n - b.charge * 0.9; });
    nextAt = n + 2600;
  });
  scope.loop(frame);
  return () => scope.dispose();
}
