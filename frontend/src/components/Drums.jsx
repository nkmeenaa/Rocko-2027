import { asset } from '../lib/core.js';

/**
 * Drum kit, pinned under the clock and revealed by the needle sweep.
 * Pads, key letters, setlist and beat line are built by effects/drums.js.
 */
export default function Drums() {
  return (
    <section className="scene" id="drums" data-nav="-1">
      <div className="stick">
        <div className="dflash" id="dflash" aria-hidden="true" />
        <div className="board">
          <img className="abs kit" id="kit" src={asset('drums2.webp')} alt="Interactive drum kit" />
          <div className="abs kickglow" id="kickglow" />
          <div id="pads" />

          <div className="abs jam" id="jam">
            <div className="eb">PLAY THE BEAT</div>
            <div className="songs" id="songs" role="tablist" aria-label="Choose a song" />
            <div className="ctrl">
              <button className="btn" id="demo">▶ Hear it</button>
              <button className="btn primary" id="restart">↺ Restart</button>
            </div>
            <p className="hint">
              <span className="for-keys">Hit the glowing drum or press the key shown. The beat rolls along under the kit as you play.</span>
              <span className="for-touch">Tap the glowing drum. The beat rolls along above as you play.</span>
            </p>
            <div className="drumbar">
              <span className="for-keys">PLAY {['A', 'S', 'D', 'H', 'J', 'K', 'L'].map((k) => <kbd key={k}>{k}</kbd>)}</span>
              <span className="kickrow for-keys">KICK <kbd>SPACE</kbd></span>
              <label htmlFor="vol">VOL</label>
              <input id="vol" type="range" min="0" max="1" step="0.05" defaultValue="0.8" />
            </div>
          </div>

          <div className="abs lanebox">
            <div className="lane" id="lane" aria-live="polite"><div className="track" id="track" /></div>
            <div className="bar"><i id="bar" /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
