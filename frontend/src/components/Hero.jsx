import { asset, reduce } from '../lib/core.js';

/** Hero: graded clip (+ glitch canvas), stage flashes, logo, lightning canvas. Driven by effects/hero.js + lightning.js */
export default function Hero() {
  return (
    <section className="scene" id="hero" data-nav="-1">
      <div className="stick">
        <video className="herosrc" id="herosrc" autoPlay={!reduce} muted loop playsInline preload="auto"
          poster={asset('hero-poster.webp')} src={asset('hero-graded.mp4')} aria-hidden="true" />
        <canvas className="herovid" id="herovid" aria-hidden="true" />
        <div className="heroshade" />
        <div className="flash" id="heroflash"><i className="beam" /></div>
        <div className="board">
          <div className="abs logo" id="logo"><img src={asset('logo.webp')} alt="Rock-o-Phonix" /></div>
          <div className="abs cue">SCROLL ↓</div>
        </div>
        <canvas className="herosky" id="herosky" aria-hidden="true" />
      </div>
    </section>
  );
}
