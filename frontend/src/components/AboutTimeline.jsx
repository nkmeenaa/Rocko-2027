import { asset } from '../lib/core.js';
import { ABOUT, TIMELINE, DIALS } from '../data/content.js';

/**
 * About (CD shatter) → Timeline (skull clock) → needle sweep into the drums.
 * One pinned 1460vh scene, driven by effects/story.js.
 */
export default function AboutTimeline() {
  const timelineLabel = 'Timeline: ' + TIMELINE.map((d) => `${d.date} ${d.label}`).join(', ');
  return (
    <section className="scene" id="about" data-nav="0">
      <span id="timeline" aria-hidden="true" />
      <div className="stick">
        <div className="board">
          <div className="abs aboutcopy" id="aboutcopy">
            <h2>{ABOUT.title}</h2>
            <p>{ABOUT.text}</p>
          </div>

          {/* clock: 847×1024 skull frame, hub at (313, 505) */}
          <div className="abs clockbox">
            <div className="skull" role="img" aria-label={timelineLabel}>
              <img className="sb" src={asset('skull3base.webp')} alt="" />
              {DIALS.map((d) => (
                <img key={d.src} className="dial" src={asset(d.src)} alt="" style={{ left: d.left, top: d.top }} />
              ))}
            </div>
            <svg className="hand" id="handsvg" viewBox="0 0 1440 1024" aria-hidden="true">
              <g id="hand" transform="rotate(-64.1 712 505)">
                <polygon points="712,497 870,490 868,474 912,505 868,536 870,520 712,513" fill="#e2e6ea" />
              </g>
              <circle id="handhub" cx="712" cy="505" r="30" fill="#3b4a5c" />
            </svg>
          </div>

          <div className="abs infowrap" id="infowrap" aria-live="polite">
            <div className="info" id="info"><div className="face"><p id="infoP" /></div></div>
          </div>
        </div>
        <video className="vid" id="shatter" muted playsInline preload="auto"
          poster={asset('shatter-poster.webp')} src={asset('shatter.mp4')} data-src={asset('shatter.mp4')}
          aria-label="A CD printed with 3 days, 50+ artists, Guwahati Assam, prizes worth ₹10,000 shatters into pieces" />
      </div>
    </section>
  );
}
