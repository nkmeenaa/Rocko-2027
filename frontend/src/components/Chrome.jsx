import { asset } from '../lib/core.js';
import { RAIL, REGISTER_URL } from '../data/content.js';

/** Fixed UI: home logo, section rail, Register (+ screen strobe), sound toggle */
export default function Chrome() {
  return (
    <>
      <a className="home" href="#hero" data-go="hero" aria-label="Back to top">
        <img src={asset('demon.webp')} alt="" />
      </a>
      <nav className="rail" aria-label="Page navigation">
        {RAIL.map((r, i) => (
          <a key={r.id} href={`#${r.id}`} data-nav={i} data-go={r.id}><span className="lbl">{r.label}</span></a>
        ))}
      </nav>
      <div id="regscreen" aria-hidden="true" />
      <a className="reg" href={REGISTER_URL} style={{ '--regtex': `url(${asset('regtex.webp')})` }}>REGISTER</a>
      <button className="snd on" id="snd" aria-label="Sound on — click to mute" aria-pressed="true">
        <i /><i /><i /><i />
      </button>
    </>
  );
}
