import { asset } from '../lib/core.js';
import { CONTACT, SOCIALS, FOOTER_NAV, CREDITS } from '../data/content.js';
import Icon from './Icon.jsx';

/** Footer (Figma "11 Footer", rev. Nov 3): nav + socials, contact card, credits bar */
export default function Footer() {
  return (
    <footer className="footx" id="contact" data-nav="4">
      <div className="ftin">
        <div className="ftcols">
          <div className="ftcol">
            <h3>Navigation</h3>
            <nav aria-label="Footer">
              {FOOTER_NAV.map((n) => <a key={n.id} href={`#${n.id}`} data-go={n.id}>{n.label}</a>)}
            </nav>
          </div>
          <div className="ftcol">
            <h3>Connect</h3>
            <div className="ftsocial">
              {SOCIALS.map((s) => (
                <a key={s.name} href={s.url} aria-label={s.name} target="_blank" rel="noopener noreferrer"><Icon name={s.icon} /></a>
              ))}
            </div>
          </div>
        </div>

        <div className="ftcard">
          <div className="ftperson">
            <div><h3>{CONTACT.name}</h3><div className="role">{CONTACT.role}</div></div>
            <ul>
              <li><Icon name="phone" /><a href={`tel:+91${CONTACT.phone}`}>{CONTACT.phone}</a></li>
              <li><Icon name="mail" /><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
            </ul>
          </div>
          <div className="ftphoto">
            <img src={asset(CONTACT.photo)} alt={`${CONTACT.name}, ${CONTACT.role}`} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
        </div>

        <div className="ftbar">{CREDITS.map((c) => <span key={c}>{c}</span>)}</div>
      </div>
    </footer>
  );
}
