import { useState } from 'react';
import { FAQ } from '../data/content.js';

/** FAQ — one row open at a time; rows grow 0fr → 1fr in .35s, plus turns into minus */
export default function Faq() {
  const [open, setOpen] = useState(-1);
  return (
    <section className="faqx" id="faq" data-nav="3">
      <div className="fxframe">
        <div className="fxhead"><h2>Frequently asked questions</h2></div>
        <div className="fxlist">
          {FAQ.map(({ q, a }, i) => (
            <div key={q} className={`qx${open === i ? ' open' : ''}`}>
              <button className="qh" aria-expanded={open === i} aria-controls={`qa${i}`} id={`qb${i}`}
                onClick={() => setOpen(open === i ? -1 : i)}>
                <span className="qt">{q}</span><span className="qi" aria-hidden="true" />
              </button>
              <div className="qa" id={`qa${i}`} role="region" aria-labelledby={`qb${i}`}><p>{a}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
