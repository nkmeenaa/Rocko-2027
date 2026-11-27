/* =====================================================================
   core.js — shared helpers for the effect engines (src/effects/*).
   The engines are plain JS: React renders the markup, the engines drive
   the scroll / canvas / audio animation on top of it (same as the prototype).
   ===================================================================== */

/** URL of a file in public/assets (works under any base path) */
export const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const seg = (p, a, b) => clamp((p - a) / (b - a));
export const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOut3 = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** scroll progress (0 → 1) through a pinned section */
export function prog(el) {
  const r = el.getBoundingClientRect();
  const span = r.height - innerHeight;
  return span > 0 ? clamp(-r.top / span) : r.top < innerHeight / 2 ? 1 : 0;
}

/** Collects listeners / frames / timers so an engine can be torn down cleanly (React unmount, HMR). */
export function createScope() {
  const fns = [];
  return {
    on(target, type, fn, opts) { target.addEventListener(type, fn, opts); fns.push(() => target.removeEventListener(type, fn, opts)); },
    loop(fn) {
      let id = requestAnimationFrame(function step(ts) { fn(ts); id = requestAnimationFrame(step); });
      fns.push(() => cancelAnimationFrame(id));
    },
    timeout(fn, ms) { const id = setTimeout(fn, ms); fns.push(() => clearTimeout(id)); return id; },
    add(fn) { fns.push(fn); },
    dispose() { fns.splice(0).reverse().forEach((f) => f()); },
  };
}

/* ---------- layout: artboard scale + desktop / mobile mode ---------- */
const mobileMQ = typeof matchMedia !== 'undefined' ? matchMedia('(max-width: 767px)') : { matches: false };
const BOARD = { desktop: [1440, 1024], mobile: [430, 932] };
export const layout = { mobile: mobileMQ.matches, s: 1, listeners: new Set() };

export function fitBoard() {
  const root = document.documentElement;
  const [bw, bh] = mobileMQ.matches ? BOARD.mobile : BOARD.desktop;
  layout.s = Math.min(innerWidth / bw, innerHeight / bh);
  root.style.setProperty('--s', layout.s);
  // register + sound buttons are sized off the desktop board, never below 42%
  root.style.setProperty('--sc', Math.max(Math.min(innerWidth / 1440, innerHeight / 1024), 0.42));
  if (mobileMQ.matches !== layout.mobile) {
    layout.mobile = mobileMQ.matches;
    layout.listeners.forEach((fn) => fn(layout.mobile));
  }
}

/* ---------- sound: one mute for the music track and the drum synth ---------- */
export const sound = {
  muted: false,
  track: null,  // <audio id="bgm">, set by initSound
  master: null, // drum synth output gain, created on first hit
  drumVol: 0.8,
  button: null,
  apply() {
    if (this.track) this.track.muted = this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : this.drumVol;
  },
  toggle() {
    this.muted = !this.muted;
    const b = this.button;
    if (b) {
      b.classList.toggle('on', !this.muted);
      b.setAttribute('aria-pressed', String(!this.muted));
      b.setAttribute('aria-label', this.muted ? 'Sound off — click to unmute' : 'Sound on — click to mute');
    }
    this.apply();
  },
};

export function initCore() {
  const scope = createScope();
  sound.track = $('#bgm');
  sound.button = $('#snd');
  scope.on(sound.button, 'click', () => sound.toggle());
  scope.on(window, 'resize', fitBoard);
  fitBoard();
  return () => scope.dispose();
}

/** shared state between engines (e.g. which rail item the story section is on) */
export const shared = { storyNav: 0 };
