import { asset } from '../lib/core.js';

/** 4s intro: thunder clip → split → logo grows into the hero (driven by effects/loader.js) */
export default function Loader() {
  return (
    <div className="loader" id="loader" role="status" aria-label="Loading Rock-o-Phonix">
      <video id="ldvid" muted playsInline preload="auto" poster={asset('loader-poster.webp')} src={asset('loader.mp4')} aria-hidden="true" />
      <div className="ldpanel t"><canvas aria-hidden="true" /></div>
      <div className="ldpanel b"><canvas aria-hidden="true" /></div>
      <div className="ldlogo" id="ldlogo"><img src={asset('logo.webp')} alt="" /></div>
      <button className="ldgo" id="ldgo" type="button">Enter<small>Sound on</small></button>
    </div>
  );
}
