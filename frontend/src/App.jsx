import { useEffect, useState } from 'react';
import { asset } from './lib/core.js';
import { initCore } from './lib/core.js';
import { initDrums } from './effects/drums.js';
import { initStory } from './effects/story.js';
import { initHero } from './effects/hero.js';
import { initLightning } from './effects/lightning.js';
import { initScroll } from './effects/scroll.js';
import { initLoader } from './effects/loader.js';

import Loader from './components/Loader.jsx';
import Chrome from './components/Chrome.jsx';
import Hero from './components/Hero.jsx';
import AboutTimeline from './components/AboutTimeline.jsx';
import Drums from './components/Drums.jsx';
import Gallery from './components/Gallery.jsx';
import Faq from './components/Faq.jsx';
import Footer from './components/Footer.jsx';

/**
 * React renders the page structure. The effect engines in src/effects/ then
 * drive the scroll-scrubbed animation, canvases and audio on top of that DOM,
 * exactly like the prototype. Order matters: core (scale + sound) first,
 * loader last (it starts the intro).
 */
export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const offCore = initCore();
    const offDrums = initDrums();
    const story = initStory();
    const hero = initHero();
    const offLightning = initLightning();
    const offScroll = initScroll({ hero, story });
    const offLoader = initLoader({ onDone: () => setLoading(false) });
    return () => {
      offLoader();
      offScroll();
      offLightning();
      hero.dispose();
      story.dispose();
      offDrums();
      offCore();
    };
  }, []);

  return (
    <>
      {loading && <Loader />}
      <audio id="bgm" src={asset('backinblack.mp3')} preload="auto" loop />
      <Chrome />
      <LumaKey />
      <main>
        <Hero />
        <AboutTimeline />
        <Drums />
        <Gallery />
        <Faq />
      </main>
      <Footer />
    </>
  );
}

/** SVG filter that turns the black of shatter.mp4 transparent */
function LumaKey() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <filter id="lumakey" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1.4 2.6 0.6 0 -0.22" />
      </filter>
    </svg>
  );
}
