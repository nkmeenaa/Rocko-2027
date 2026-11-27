/* =====================================================================
   hero.js — hero clip + glitch partitions, stage-light flashes, light beam,
   and the scroll-out: video blurs/dims → fades to black → logo blurs out.
   Returns { update(t), dispose() }; update is called by the scroll loop.
   ===================================================================== */
import { $, clamp, lerp, seg, ease, reduce, prog, createScope } from '../lib/core.js';

export function initHero() {
  const scope = createScope();
  const heroEl = $('#hero');
  const src = $('#herosrc');          // <video>
  const cv = $('#herovid');           // canvas, visible only during a glitch
  const c = cv.getContext('2d');
  const shade = $('#hero .heroshade');
  const logo = $('#logo');
  const cue = $('#hero .cue');
  const FS = $('#heroflash').style;
  const both = [cv, src];

  // only play the hero loop while it's on screen
  const io = new IntersectionObserver(([e]) => {
    if (reduce) return;
    if (e.isIntersecting) src.play().catch(() => {}); else src.pause();
  });
  io.observe(heroEl);
  scope.add(() => io.disconnect());

  function fitCanvas() {
    const d = Math.min(1, 1280 / innerWidth);
    cv.width = Math.round(innerWidth * d);
    cv.height = Math.round(innerHeight * d);
  }
  scope.on(window, 'resize', fitCanvas);
  fitCanvas();

  const flash = { f: 0, beat: 0, beamT: -9 };

  /* ---- glitch: every ~0.9–2.3s the clip breaks into columns / rows / grid / mirror for 0.2–0.6s ---- */
  let part = null, nextPart = 1.2;
  function drawGlitch(t) {
    if (src.readyState < 2) return false;
    if (!reduce && t > nextPart && !part) {
      const modes = ['cols', 'rows', 'grid', 'split', 'cols', 'rows'];
      part = { m: modes[(Math.random() * modes.length) | 0], t0: t, d: 0.22 + Math.random() * 0.35, n: 3 + ((Math.random() * 3) | 0), r: Array.from({ length: 12 }, () => Math.random() - 0.5) };
      flash.f = 1;
    }
    if (part && t - part.t0 > part.d) { part = null; nextPart = t + 0.9 + Math.random() * 1.4; }
    if (!part) return false;

    const W = cv.width, H = cv.height;
    c.fillStyle = '#0b0d10';
    c.fillRect(0, 0, W, H);
    const vw = src.videoWidth || 1280, vh = src.videoHeight || 720;
    const S = Math.max(W / vw, H / vh), DX = (W - vw * S) / 2, DY = (H - vh * S) / 2;
    // draw a region of the cover-fitted clip into a rect, optionally offset / zoomed
    const reg = (x, y, w, h, ox = 0, oy = 0, z = 1) => {
      const cx = x + w / 2 - ox, cy = y + h / 2 - oy, sw = w / S / z, sh = h / S / z;
      c.drawImage(src, (cx - DX) / S - sw / 2, (cy - DY) / S - sh / 2, sw, sh, x, y, w, h);
    };
    const g = Math.round(6 * (W / 1440) + 2), r = part.r;
    if (part.m === 'cols') {
      const cw = W / part.n;
      for (let i = 0; i < part.n; i++) reg(i * cw + g / 2, 0, cw - g, H, 0, r[i] * H * 0.22, 1 + Math.abs(r[i + 4]) * 0.4);
    } else if (part.m === 'rows') {
      const n = part.n * 3, rh = H / n;
      for (let i = 0; i < n; i++) reg(0, i * rh, W, rh + 1, r[i % 12] * W * 0.14, 0);
    } else if (part.m === 'grid') {
      const pw = (W - g) / 2, ph = (H - g) / 2;
      [[0, 0], [pw + g, 0], [0, ph + g], [pw + g, ph + g]].forEach(([x, y], i) => {
        c.save(); c.beginPath(); c.rect(x, y, pw, ph); c.clip();
        c.drawImage(src, x + (pw - vw * S * 0.55) / 2, y + (ph - vh * S * 0.55) / 2, vw * S * 0.55, vh * S * 0.55);
        if (i === 1 || i === 2) { c.globalCompositeOperation = 'screen'; c.fillStyle = 'rgba(70,150,255,.35)'; c.fillRect(x, y, pw, ph); }
        c.restore();
      });
    } else { // mirrored split
      const hw = W / 2;
      reg(0, 0, hw - g / 2, H, W * 0.12, 0, 1.1);
      c.save(); c.translate(W, 0); c.scale(-1, 1); reg(0, 0, hw - g / 2, H, W * 0.12, 0, 1.1); c.restore();
    }
    return true;
  }

  // only write styles when the value changes
  const last = {};
  const set = (key, v, apply) => { if (last[key] !== v) { last[key] = v; apply(v); } };

  function update(t) {
    const p = prog(heroEl);
    // step 1 (0–.4): video blurs + dims and zooms slightly
    const vb = ease(seg(p, 0, 0.4));
    set('f', vb ? `blur(${(vb * 18).toFixed(1)}px) brightness(${lerp(0.95, 0.3, vb).toFixed(2)})` : '', (v) => both.forEach((e) => (e.style.filter = v)));
    set('tf', `scale(${lerp(1, 1.08, vb).toFixed(4)})`, (v) => both.forEach((e) => (e.style.transform = v)));
    // then fade to solid black so hero and the next section share one background
    const blk = 1 - ease(seg(p, 0.25, 0.45));
    set('blk', blk.toFixed(3), (v) => { both.forEach((e) => (e.style.opacity = v)); shade.style.opacity = v; });
    if (blk > 0) set('cv', drawGlitch(t) ? 'visible' : 'hidden', (v) => (cv.style.visibility = v));

    // stage-light pulses on a 120bpm grid + a light beam every 3.6s
    if (!reduce && blk > 0) {
      last.fz = 0;
      if (t - flash.beat > 0.25) {
        flash.beat = t;
        if (Math.random() < 0.45) {
          flash.f = 0.7 + Math.random() * 0.3;
          FS.setProperty('--fx', `${(15 + Math.random() * 70).toFixed(0)}%`);
          FS.setProperty('--fy', `${(15 + Math.random() * 60).toFixed(0)}%`);
        }
      }
      if (t - flash.beamT > 3.6) flash.beamT = t;
      flash.f *= 0.86;
      if (flash.f < 0.01) flash.f = 0;
      const bt = clamp((t - flash.beamT) / 0.9);
      FS.setProperty('--f', (flash.f * blk).toFixed(3));
      FS.setProperty('--edge', (flash.f * 0.6 * blk).toFixed(3));
      FS.setProperty('--bx', `${lerp(-120, 560, bt).toFixed(0)}%`);
      FS.setProperty('--bo', ((bt > 0 && bt < 1 ? Math.sin(bt * Math.PI) : 0) * blk).toFixed(3));
    } else {
      if (last.fz !== 1) { last.fz = 1; FS.setProperty('--f', 0); FS.setProperty('--bo', 0); }
    }

    // step 2 (.45–.9): logo grows slightly, blurs and fades (lightning reads logo.style.opacity)
    const lb = ease(seg(p, 0.45, 0.9));
    set('lt', `scale(${lerp(1, 1.12, lb).toFixed(4)})`, (v) => (logo.style.transform = v));
    set('lo', String(1 - lb), (v) => (logo.style.opacity = v));
    set('lf', lb ? `blur(${(lb * 14).toFixed(1)}px)` : 'none', (v) => (logo.style.filter = v));
    set('cue', String(1 - seg(p, 0, 0.12)), (v) => (cue.style.opacity = v));
  }

  return { update, dispose: () => scope.dispose() };
}
