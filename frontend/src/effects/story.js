/* =====================================================================
   story.js — the long pinned scene (#about, 1460vh):
     CD spins in → shatter.mp4 scrubbed by scroll (About copy shows through the cracks)
     → skull clock: needle walks the 5 dates, date copy tilts toward the cursor
     → hold → needle makes one full turn: wipes the skull, reveals the drum kit
   Scroll map of #about: 0–74 = About + timeline, 74–94 = hold, 94–136 = needle sweep.
   ===================================================================== */
import { $, $$, clamp, lerp, seg, ease, easeOut, easeInOut3, reduce, createScope, shared } from '../lib/core.js';
import { TIMELINE } from '../data/content.js';

export function initStory() {
  const scope = createScope();
  const aEl = $('#about');
  const aboutCopy = $('#aboutcopy');
  const vid = $('#shatter');
  const skull = $('#about .skull');
  const handSvg = $('#handsvg');
  const hand = $('#hand');
  const hub = $('#handhub');
  const dials = $$('#about .dial');
  const infoWrap = $('#infowrap');
  const info = $('#info');
  const infoP = $('#infoP');
  const dStick = $('#drums .stick');

  const VIDEO_AR = 1440 / 1018;               // shatter.mp4 frame
  const ANG = TIMELINE.map((d) => d.angle);   // needle angle for each date
  const INFO = TIMELINE.map((d) => d.text);


  /* load the clip as a blob so scroll-scrubbing can seek instantly */
  const clipUrl = vid.dataset.src;
  let blobUrl = null, alive = true;
  fetch(clipUrl)
    .then((r) => (r.ok ? r.blob() : Promise.reject()))
    .then((b) => { if (!alive) return; const t = vid.currentTime; blobUrl = URL.createObjectURL(b); vid.src = blobUrl; vid.currentTime = t; })
    .catch(() => {});
  scope.add(() => { alive = false; if (blobUrl) { vid.src = clipUrl; URL.revokeObjectURL(blobUrl); } });
  let lastSeek = -1;
  function scrub(t) {
    if (!vid.duration || vid.seeking) return;
    t = Math.min(t, vid.duration - 0.04);
    if (Math.abs(t - lastSeek) < 1 / 48) return;
    lastSeek = t;
    vid.currentTime = t;
  }

  /* date copy: swaps with the lit date, tilts toward the pointer */
  let infoIdx = -1, irx = 0, iry = 0, trx = 0, tryy = 0;
  function setInfo(i) { if (i !== infoIdx) { infoIdx = i; infoP.textContent = INFO[i]; } }
  scope.on(infoWrap, 'pointermove', (e) => {
    const r = infoWrap.getBoundingClientRect();
    tryy = ((e.clientX - r.left) / r.width - 0.5) * 28;
    trx = -((e.clientY - r.top) / r.height - 0.5) * 22;
  });
  scope.on(infoWrap, 'pointerleave', () => { trx = tryy = 0; });

  let sy = scrollY, lastMaskR = -1, handA = ANG[0], litIdx = -1;

  function setMask(el, v) { el.style.webkitMaskImage = v; el.style.maskImage = v; }

  function update(t) {
    // eased (inertia) scroll position so wheel steps don't make the CD jump
    if (Math.abs(scrollY - sy) > innerHeight * 2) sy = scrollY; // big jumps (nav links) snap instead of gliding
    sy += (scrollY - sy) * (reduce ? 1 : 0.14);
    if (Math.abs(scrollY - sy) < 0.3) sy = scrollY;
    const aTop = aEl.offsetTop - sy;
    const aSpan = aEl.offsetHeight - innerHeight;
    const pRaw = clamp(-aTop / aSpan);
    const ex = seg(pRaw, 94 / 136, 1);  // exit: needle sweep into the drums
    let p = clamp((pRaw * 136) / 74);   // About + timeline

    /* --- CD: spins + grows while the section slides up, settled before it pins --- */
    const en = easeOut(clamp((innerHeight - aTop) / (innerHeight * 0.8)));
    const rot = lerp(-150, 0, en), sc = lerp(0.62, 1, en);
    // mask the clip to the disc while it spins; opens once the shatter starts
    const vw = vid.offsetWidth, vh = vid.offsetHeight;
    const discW = Math.max(vw, vh * VIDEO_AR);
    const mr = Math.round(lerp(discW * 0.255, Math.hypot(vw, vh) * 0.75, ease(seg(p, 0.07, 0.16))));
    if (mr !== lastMaskR) { lastMaskR = mr; setMask(vid, `radial-gradient(circle ${mr}px at 50% 50%,#000 96%,transparent 100%)`); }
    const clipT = seg(p, 0.06, 0.4) * (vid.duration || 5.17);
    scrub(clipT);
    // the CD cracks open 0.29s into the clip: show the About copy on exactly that frame
    aboutCopy.style.opacity = clipT >= 0.29 && p < 0.44 ? '1' : '0';
    // shards fly past the camera
    const z = ease(seg(p, 0.4, 0.56));
    vid.style.transform = `rotate(${rot}deg) scale(${sc * (1 + z * 1.8)})`;
    vid.style.opacity = 1 - z;
    vid.style.filter = z ? `url(#lumakey) blur(${z * 8}px)` : 'url(#lumakey)';
    shared.storyNav = p < 0.5 ? 0 : 1;

    /* --- skull rises through the shards --- */
    skull.style.opacity = p < 0.5 ? 0.3 * ease(seg(p, 0.4, 0.5)) : lerp(0.3, 1, ease(seg(p, 0.5, 0.58)));
    skull.style.transform = `scale(${lerp(0.92, 1, ease(seg(p, 0.4, 0.58))).toFixed(3)})`;

    /* --- timeline (own 0–1 progress) --- */
    p = seg(p, 0.5, 1);
    const k = ease(seg(p, 0.06, 0.18));
    const fadeOut = 1 - ease(seg(ex, 0, 0.18));
    const sweep = easeInOut3(seg(ex, 0.12, 0.86)) * 360; // one slow, weighted full turn
    handSvg.style.opacity = k * (1 - ease(seg(ex, 0.86, 1)));
    const tp = seg(p, 0.3, 0.95) * 4;
    // needle eases between dates and glides toward its target every frame, so it never jumps
    const target = lerp(ANG[Math.floor(tp)], ANG[Math.min(4, Math.ceil(tp))], ease(tp % 1));
    handA += (target - handA) * (reduce ? 1 : 0.12);
    if (Math.abs(target - handA) < 0.05) handA = target;
    const a = handA;
    hand.setAttribute('transform', `rotate(${a + sweep} 712 505) translate(712 505) scale(${k}) translate(-712 -505)`);
    infoWrap.style.opacity = ex ? String(fadeOut) : '';
    // light the date the needle is resting on; keep it lit while it travels to the next one
    if (k < 0.999) litIdx = -1;
    else { const j = ANG.findIndex((g) => Math.abs(handA - g) < 1.2); if (j >= 0) litIdx = j; }
    const placed = litIdx >= 0, cur = Math.max(0, litIdx);
    dials.forEach((d, i) => d.classList.toggle('on', placed && i === cur));
    infoWrap.classList.toggle('show', placed);
    setInfo(cur);
    irx += (trx - irx) * 0.12;
    iry += (tryy - iry) * 0.12;
    if (placed) {
      const f = reduce ? 0 : 1;
      info.style.transform = `translateY(${(Math.sin(t * 1.2) * 3 * f).toFixed(1)}px) rotateX(${(irx * 0.35 + Math.cos(t * 0.7) * 1.2 * f).toFixed(2)}deg) rotateY(${(iry * 0.35 + Math.sin(t * 0.9) * 1.8 * f).toFixed(2)}deg)`;
    }

    /* --- needle sweep: behind the turning hand the skull is wiped and the kit revealed (radar-style) --- */
    const passed = aEl.getBoundingClientRect().bottom < innerHeight;
    const A0 = (a + 90).toFixed(1), S = sweep.toFixed(1);
    if (ex > 0 && !passed && sweep < 360) {
      setMask(skull, `conic-gradient(from ${A0}deg at 313px 505px,transparent 0deg ${S}deg,#000 ${S}deg)`);
      const hr = hub.getBoundingClientRect(), dr = dStick.getBoundingClientRect();
      const hx = hr.left + hr.width / 2 - dr.left, hy = hr.top + hr.height / 2 - dr.top;
      setMask(dStick, `conic-gradient(from ${A0}deg at ${hx.toFixed(0)}px ${hy.toFixed(0)}px,#000 0deg ${S}deg,transparent ${S}deg)`);
    } else {
      setMask(skull, sweep >= 360 ? 'linear-gradient(transparent,transparent)' : '');
      setMask(dStick, '');
    }
    dStick.style.opacity = passed || ex > 0 ? '1' : '0';
    dStick.classList.toggle('live', passed || ex > 0.6);
  }

  return { update, dispose: () => scope.dispose() };
}
