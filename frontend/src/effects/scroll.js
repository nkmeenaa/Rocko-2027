/* =====================================================================
   scroll.js — the one animation loop for everything scroll-driven:
   hero, About/timeline story, gallery strobe chase, and the rail's active item.
   Also: smooth-scroll for [data-go] links and the Register screen strobe.
   ===================================================================== */
import { $, $$, reduce, prog, layout, createScope, shared } from '../lib/core.js';

export function initScroll({ hero, story }) {
  const scope = createScope();

  /* ---------- in-page navigation ---------- */
  $$('[data-go]').forEach((el) => scope.on(el, 'click', (e) => {
    e.preventDefault();
    document.getElementById(el.dataset.go).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ---------- rail active state ---------- */
  const navLinks = $$('.rail a');
  const scenes = $$('.scene, .faqx, .footx');
  let lastCur = null;
  function updateNav() {
    let cur = -1;
    for (const s of scenes) {
      const r = s.getBoundingClientRect();
      if (r.top <= innerHeight * 0.5 && r.bottom > innerHeight * 0.5) cur = s.id === 'about' ? shared.storyNav : +s.dataset.nav;
    }
    if (cur === lastCur) return;
    lastCur = cur;
    navLinks.forEach((a) => {
      const on = +a.dataset.nav === cur;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }

  /* ---------- Register: whole-screen strobe on hover ---------- */
  const regScreen = $('#regscreen');
  scope.on($('.reg'), 'pointerenter', () => {
    regScreen.classList.remove('go'); void regScreen.offsetWidth; regScreen.classList.add('go');
  });

  /* ---------- gallery: checker strobe chase driven by scroll ---------- */
  const galleryEl = $('#gallery');
  const tiles = $$('#grid img');
  function updateGallery(t) {
    const r = galleryEl.getBoundingClientRect();
    if (r.top >= innerHeight || r.bottom <= 0) return;
    const p = prog(galleryEl);
    const cols = layout.mobile ? 2 : 3;
    tiles.forEach((im, i) => {
      const row = Math.floor(i / cols), col = i % cols;
      const w = Math.sin(p * Math.PI * 8 + (row + col) * 1.3 + (reduce ? 0 : t * 1.5));
      const checker = (row + col) % 2 === Math.floor(p * 6) % 2 ? 1 : 0;
      const f = `brightness(${(0.3 + 0.55 * checker + 0.25 * Math.max(0, w)).toFixed(2)}) saturate(${checker ? 1.1 : 0.7})`;
      if (im._f !== f) { im._f = f; im.style.filter = f; }
    });
  }

  /* ---------- the loop: only sections near the viewport do any work ---------- */
  const heroEl = $('#hero'), aboutEl = $('#about'), drumsEl = $('#drums');
  const near = (el) => { const r = el.getBoundingClientRect(); return r.bottom > -innerHeight && r.top < innerHeight * 2; };
  hero.update(0);
  story.update(0);
  scope.loop(() => {
    const t = performance.now() / 1000;
    if (near(heroEl)) hero.update(t);
    if (near(aboutEl) || near(drumsEl)) story.update(t);
    updateGallery(t);
    updateNav();
  });

  return () => scope.dispose();
}
