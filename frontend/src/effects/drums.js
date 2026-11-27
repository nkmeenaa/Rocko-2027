/* =====================================================================
   drums.js — interactive kit (Web Audio synth, no sample files),
   hit flashes, rhythm burst, beat trainer.
   ===================================================================== */
import { $, $$, reduce, layout, sound, createScope } from '../lib/core.js';
import { SONGS } from '../data/content.js';

export function initDrums() {
  const scope = createScope();
  /* pads on the kit image (1084×873 px): key, name, centre x, y, diameter, sound.
     ' ' = kick (space bar). Keys starting with X are click-only. */
  const PADS = [
    ['A', 'Low tom', 240, 490, 240, 'tomL'], ['S', 'Snare', 465, 515, 200, 'snare'], ['D', 'High-mid tom', 628, 343, 170, 'tomHM'],
    ['L', 'Crash', 820, 213, 270, 'crash'], ['K', 'Ride', 910, 495, 296, 'ride'], ['J', 'Splash', 660, 672, 286, 'splash'],
    ['X1', 'High tom', 238, 212, 190, 'tomH'], ['H', 'Rack tom', 497, 165, 220, 'tomR'], [' ', 'Kick drum', 450, 365, 150, 'kick'],
  ];
  // letters printed on the drums: key, x, y, font size
  const LETTERS = [['H', 497, 165, 105], ['A', 260, 488, 105], ['S', 473, 512, 86], ['D', 635, 340, 75], ['L', 900, 207, 105], ['K', 987, 478, 106], ['J', 760, 658, 124]];
  // where the kit image sits on the artboard (must match #drums .kit in the CSS)
  const KIT = { desktop: { x: 65, y: 60, s: 0.95 }, mobile: { x: 8, y: 96, s: 0.38 } };

  const padsEl = $('#pads');
  const kitImg = $('#kit');
  const kickGlow = $('#kickglow');
  let padMap = {}, letMap = {};

  function buildPads() {
    padsEl.innerHTML = '';
    padMap = {}; letMap = {};
    const K = layout.mobile ? KIT.mobile : KIT.desktop;
    PADS.forEach(([k, name, x, y, d, snd]) => {
      const b = document.createElement('button');
      b.className = 'pad';
      b.style.cssText = `left:${K.x + x * K.s}px;top:${K.y + y * K.s}px;width:${d * K.s}px;height:${d * K.s}px`;
      b.setAttribute('aria-label', k.startsWith('X') ? name : `${name} (key ${k === ' ' ? 'space' : k})`);
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); play(k); });
      b.addEventListener('keydown', (e) => { if (e.key === 'Enter') play(k); });
      padsEl.appendChild(b);
      padMap[k] = { el: b, snd };
    });
    LETTERS.forEach(([k, x, y, fs]) => {
      const l = document.createElement('span');
      l.className = 'klet';
      l.textContent = k;
      l.style.cssText = `left:${K.x + x * K.s}px;top:${K.y + y * K.s}px;font-size:${fs * K.s}px`;
      padsEl.appendChild(l);
      letMap[k] = l;
    });
  }

  /* ---------- synth ---------- */
  let ctx = null, noiseBuf = null;
  const vol = $('#vol');

  function ac() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      sound.master = ctx.createGain();
      sound.master.connect(ctx.destination);
    }
    sound.apply();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  scope.on(vol, 'input', () => { sound.drumVol = +vol.value; sound.apply(); });

  function noise() {
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    return s;
  }
  const env = (g, t, peak, dec) => { g.gain.setValueAtTime(peak, t); g.gain.exponentialRampToValueAtTime(0.001, t + dec); };
  function tone(f0, f1, dec, peak = 1) {
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dec * 0.8);
    env(g, t, peak, dec); o.connect(g).connect(sound.master); o.start(t); o.stop(t + dec + 0.05);
  }
  function hiss(type, freq, dec, peak, q = 1) {
    const t = ctx.currentTime, s = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    env(g, t, peak, dec); s.connect(f).connect(g).connect(sound.master); s.start(t); s.stop(t + dec + 0.05);
  }
  function metal(base, dec, peak) {
    const t = ctx.currentTime, g = ctx.createGain(), hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 6000; env(g, t, peak, dec); hp.connect(g).connect(sound.master);
    [2, 3, 4.16, 5.43, 6.79, 8.21].forEach((r) => {
      const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = base * r; o.connect(hp); o.start(t); o.stop(t + dec + 0.05);
    });
  }
  const SND = {
    kick: () => { tone(150, 45, 0.45, 1.2); hiss('lowpass', 800, 0.03, 0.4); },
    snare: () => { tone(220, 180, 0.12, 0.5); hiss('highpass', 1500, 0.22, 0.8); },
    tomL: () => tone(110, 70, 0.5, 0.9),
    tomHM: () => tone(210, 140, 0.32, 0.8),
    tomH: () => tone(260, 170, 0.28, 0.8),
    tomR: () => tone(190, 125, 0.36, 0.8),
    crash: () => { metal(40, 1.6, 0.35); hiss('highpass', 5000, 1.5, 0.5); },
    ride: () => { metal(60, 1.1, 0.3); hiss('bandpass', 8000, 0.6, 0.25, 2); },
    splash: () => { metal(50, 0.7, 0.35); hiss('highpass', 7000, 0.6, 0.45); },
  };

  /* ---------- hit feedback ---------- */
  const restart = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  const dflash = $('#dflash');
  let hitTimes = [];
  function bgFlash(k) {
    const now = performance.now();
    hitTimes = hitTimes.filter((t) => now - t < 1400);
    hitTimes.push(now);
    const combo = hitTimes.length, I = Math.min(1, 0.32 + combo * 0.11); // more hits in a row → bigger, brighter
    const st = dflash.parentElement.getBoundingClientRect();
    const el = k === ' ' ? kitImg : padMap[k] && padMap[k].el;
    if (!el) return;
    const r = el.getBoundingClientRect(), S = dflash.style;
    S.setProperty('--fx', `${r.left + r.width / 2 - st.left}px`);
    S.setProperty('--fy', `${(k === ' ' ? r.top + r.height * 0.62 : r.top + r.height / 2) - st.top}px`);
    S.setProperty('--fi', I.toFixed(2));
    S.setProperty('--fr', `${(30 + I * 45).toFixed(0)}vmax`);
    S.setProperty('--fe', combo >= 4 ? `${(I * 140).toFixed(0)}px` : '0px');
    restart(dflash, 'go');
  }
  function pulseLetter(k) {
    const l = letMap[k];
    if (!l) return;
    l.classList.add('hit');
    setTimeout(() => l.classList.remove('hit'), 90);
  }
  function play(k, fromDemo) {
    ac();
    if (!reduce) bgFlash(k);
    const p = padMap[k];
    if (!p) return;
    SND[p.snd]();
    restart(p.el, 'hit');
    pulseLetter(k);
    if (k === ' ') {
      restart(kickGlow, 'hit');
      kitImg.classList.add('kick');
      setTimeout(() => kitImg.classList.remove('kick'), 70);
    }
    game.hit(k, fromDemo);
  }

  /* ---------- beat trainer (songs live in src/data/content.js) ---------- */

  const game = (() => {
    const songsEl = $('#songs'), track = $('#track'), lane = $('#lane'), bar = $('#bar'), demoBtn = $('#demo');
    let si = 0, li = 0, ni = 0, demo = null, lineEls = [];
    const total = () => SONGS[si].lines.reduce((a, l) => a + l.length, 0);

    SONGS.forEach((s, i) => {
      const b = document.createElement('button');
      b.setAttribute('role', 'tab');
      b.innerHTML = `<i>${String(i + 1).padStart(2, '0')}</i><span>${s.title}</span><small>${s.artist} · ${s.bpm} BPM</small>`;
      b.onclick = () => load(i);
      songsEl.appendChild(b);
    });

    function load(i) {
      stopDemo();
      si = i; li = ni = 0;
      [...songsEl.children].forEach((b, j) => b.setAttribute('aria-selected', String(j === i)));
      track.innerHTML = '';
      lineEls = SONGS[i].lines.map((l) => {
        const d = document.createElement('div');
        d.className = 'line';
        l.forEach(([k, b]) => {
          const n = document.createElement('span');
          n.className = `n ${b >= 2 ? 'h' : b >= 1 ? 'q' : 'w'}${k === ' ' ? ' kk' : ''}`;
          n.textContent = k === ' ' ? 'KICK' : k;
          d.appendChild(n);
        });
        track.appendChild(d);
        return d;
      });
      draw();
      requestAnimationFrame(fitLines);
      if (document.fonts) document.fonts.ready.then(fitLines);
    }
    // shrink any beat line that would overflow the lane so big type never gets cut off
    function fitLines() {
      lineEls.forEach((d) => {
        if (!d.isConnected) return; // song changed or engine torn down meanwhile
        d.style.zoom = '';
        const w = d.parentElement.clientWidth;
        if (d.scrollWidth > w) d.style.zoom = ((w / d.scrollWidth) * 0.92).toFixed(3);
      });
    }
    function draw() {
      const s = SONGS[si];
      lineEls.forEach((d, i) => {
        d.classList.toggle('cur', i === li);
        d.classList.toggle('done', i < li);
        [...d.children].forEach((n, j) => {
          n.classList.toggle('hit', i < li || (i === li && j < ni));
          n.classList.toggle('next', i === li && j === ni);
        });
      });
      const lineH = (lineEls[0] && lineEls[0].offsetHeight) || 130;
      track.style.transform = `translateY(${-(Math.min(li, lineEls.length - 1) * lineH + lineH / 2)}px)`;
      let doneN = ni;
      for (let i = 0; i < li; i++) doneN += s.lines[i].length;
      bar.style.width = `${(doneN / total()) * 100}%`;
      // cue ring on the drum to hit next (the kick pad included)
      $$('.pad.cue').forEach((p) => p.classList.remove('cue'));
      if (li < s.lines.length) {
        const p = padMap[s.lines[li][ni][0]];
        if (p) p.el.classList.add('cue');
      }
    }
    function hit(k, fromDemo) {
      if (demo && !fromDemo) return;
      const s = SONGS[si];
      if (li >= s.lines.length) return;
      if (k === s.lines[li][ni][0]) {
        ni++;
        if (ni >= s.lines[li].length) { li++; ni = 0; }
        draw();
        if (li >= s.lines.length && !fromDemo) setTimeout(() => load(si), 700); // song done: start over
      } else if (!fromDemo) {
        restart(lane, 'miss');
      }
    }
    function stopDemo() {
      if (!demo) return;
      demo.forEach(clearTimeout);
      demo = null;
      demoBtn.textContent = '▶ Hear it';
    }
    demoBtn.onclick = () => {
      if (demo) { stopDemo(); load(si); return; }
      load(si);
      const s = SONGS[si], beat = 60000 / s.bpm;
      let t = 300;
      demo = [];
      demoBtn.textContent = '■ Stop';
      s.lines.flat().forEach(([k, b]) => { demo.push(setTimeout(() => play(k, true), t)); t += b * beat; });
      demo.push(setTimeout(() => { demo = null; demoBtn.textContent = '▶ Hear it'; load(si); }, t + 600));
    };
    $('#restart').onclick = () => load(si);

    return { load, draw, hit, fitLines, stopDemo };
  })();

  buildPads();
  game.load(0);
  const onMode = () => { buildPads(); game.draw(); game.fitLines(); };
  layout.listeners.add(onMode);
  scope.add(() => layout.listeners.delete(onMode));
  scope.add(() => { if (ctx) { ctx.close(); sound.master = null; } });
  scope.add(() => { game.stopDemo(); padsEl.innerHTML = ''; $('#songs').innerHTML = ''; $('#track').innerHTML = ''; });

  /* keyboard — only while the kit is on screen and live */
  scope.on(window, 'keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    const r = $('#drums').getBoundingClientRect();
    if (r.bottom < innerHeight * 0.3 || r.top > innerHeight * 0.7 || !$('#drums .stick.live')) return;
    const k = e.key === ' ' ? ' ' : e.key.toUpperCase();
    if (padMap[k]) { e.preventDefault(); play(k); }
  });
  return () => scope.dispose();
}
