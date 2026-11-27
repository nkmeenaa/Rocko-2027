/* =====================================================================
   loader.js — opening sequence. The clock is backinblack.mp3's currentTime
   (the file starts 1.70s into the song, so the stick count-in plays under the loader).
     0 → 3.0   loader.mp4: thunder crosses the grey wordmark and lights it
     3.085     SPLIT: last frame tears into top/bottom halves that slide away (1s),
               the wordmark grows into the hero logo
     4.085     HIT: first riff hit — hero is live, first lightning strike fires
   If the browser blocks sound, ENTER shows over the clip's first frame.
   If the mp3 can't play, a plain timer drives the same sequence.
   ===================================================================== */
import { $, sound, createScope } from '../lib/core.js';

const HIT = 4.085, SPLIT = HIT - 1, VOL = 0.8;
const VW = 1600, VH = 1200;                       // loader.mp4 frame
const LOGO = { x0: 0.4326, x1: 0.5753, cy: 0.5 }; // wordmark box in the clip's last frame
const LOGO_AR = 463 / 1079;                       // logo.webp height / width

export function initLoader({ onDone }) {
  const scope = createScope();
  const root = document.documentElement;
  const ld = $('#loader');
  const go = $('#ldgo');
  const vid = $('#ldvid');
  const lg = $('#ldlogo');
  const cuts = [...ld.querySelectorAll('.ldpanel canvas')];
  const track = sound.track;
  const heroImg = $('#hero .logo img');

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);
  root.classList.add('loading');

  let split = false, done = false, running = false, disposed = false, raf = 0;
  scope.add(() => cancelAnimationFrame(raf));

  function cover() {
    const s = Math.max(innerWidth / VW, innerHeight / VH);
    return { s, ox: (innerWidth - VW * s) / 2, oy: (innerHeight - VH * s) / 2 };
  }

  function doSplit() {
    if (split) return;
    split = true;
    const { s, ox, oy } = cover(), dpr = Math.min(devicePixelRatio || 1, 2);
    // freeze the current frame into both halves
    for (const cv of cuts) {
      cv.width = Math.round(innerWidth * dpr);
      cv.height = Math.round(innerHeight * dpr);
      const c = cv.getContext('2d');
      c.scale(dpr, dpr);
      try { c.drawImage(vid, ox, oy, VW * s, VH * s); } catch (e) { c.fillStyle = '#000'; c.fillRect(0, 0, innerWidth, innerHeight); }
    }
    // wordmark: sit exactly on the clip's wordmark, then fly to the hero logo
    const w = (LOGO.x1 - LOGO.x0) * VW * s, h = w * LOGO_AR;
    const x = ox + LOGO.x0 * VW * s, y = oy + LOGO.cy * VH * s - h / 2;
    lg.style.cssText = `width:${w}px;height:${h}px;transform:translate(${x}px,${y}px)`;
    void lg.offsetWidth;
    ld.classList.add('opening');
    const b = heroImg.getBoundingClientRect();
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => { lg.style.transform = `translate(${b.left}px,${b.top}px) scale(${b.width / w})`; });
    });
  }

  function finish() {
    if (done) return;
    done = true;
    root.classList.remove('loading');
    dispatchEvent(new Event('rop:drop'));
    scope.timeout(onDone, 80);
  }

  function run(clock) {
    if (running || disposed) return;
    running = true;
    ld.classList.remove('ask');
    vid.currentTime = 0;
    vid.play().catch(() => {});
    let synced = false;
    (function tick() {
      if (disposed) return;
      const t = clock();
      if (!synced && t > 0.25 && !vid.paused) { // one resync of the clip to the music
        synced = true;
        if (Math.abs(vid.currentTime - t) > 0.06) vid.currentTime = Math.min(2.99, t);
      }
      if (t >= SPLIT) doSplit();
      if (t >= HIT) { finish(); return; }
      raf = requestAnimationFrame(tick);
    })();
  }
  const runOnTimer = () => { const t0 = performance.now(); run(() => (performance.now() - t0) / 1000); };

  function playTrack() {
    track.volume = VOL;
    track.muted = sound.muted;
    track.currentTime = 0;
    return track.play().then(() => { run(() => track.currentTime); return true; }, () => false);
  }

  // browsers usually block sound until the first click → wait on ENTER
  playTrack().then((ok) => { if (!ok && !running && !disposed) { ld.classList.add('ask'); go.focus(); } });
  scope.on(go, 'click', () => { go.blur(); playTrack().then((ok) => { if (!ok) runOnTimer(); }); });

  return () => {
    disposed = true;
    if (!done) track.pause();
    scope.dispose();
  };
}
