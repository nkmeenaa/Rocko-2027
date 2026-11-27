import { asset } from '../lib/core.js';
import { GALLERY } from '../data/content.js';

/** Gallery: 6 tiles, strobe chase while pinned (effects/scroll.js) */
export default function Gallery() {
  return (
    <section className="scene" id="gallery" data-nav="2">
      <div className="stick">
        <div className="grid" id="grid">
          {GALLERY.map((src, i) => <img key={i} src={asset(src)} alt="" loading="lazy" />)}
        </div>
      </div>
    </section>
  );
}
