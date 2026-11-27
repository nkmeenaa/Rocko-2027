/* =====================================================================
   content.js — all copy, links and lists in one place.
   Anything marked TODO is still a placeholder (see README → "Still missing").
   ===================================================================== */

export const REGISTER_URL = '/register/'; // Django registration form (server/urls.py)

export const ABOUT = {
  title: 'About',
  text: 'Alcheringa is the annual cultural festival of the Indian Institute of Technology, Guwahati. A splendid idea realized by a group of students in 1996 at IITG marked dawn of one of Asia’s most exhilarating and significant cultural college fests as we know it today.',
};

/* Timeline: the dates and names are baked into skull3base.webp / dial0–4.webp.
   `angle` = needle angle for that date, measured from the clock hub on the Figma dial.
   `text`  = copy shown beside the skull when the needle rests on the date. */
export const TIMELINE = [
  { date: '23 JAN', label: 'Registration', angle: -64.1,
    text: 'Alcheringa is the annual cultural festival of the Indian Institute of Technology, Guwahati. A splendid idea realized by a group of students in 1996 at IITG marked dawn of one of Asia’s most exhilarating and significant cultural college fests as we know it today.' }, // TODO: registration copy
  { date: '25 JAN', label: 'Round 1', angle: -28.8,
    text: 'Round one opens the gates. Bands from across the country send in their sound, and the judges listen for tightness, raw energy and originality. Only the sharpest acts make it through to the stage at IIT Guwahati.' },
  { date: '25 JAN', label: 'Results', angle: 6.6,
    text: 'The shortlist drops. Bands that made the cut are announced on Alcheringa socials and contacted directly the same night. Pack the gear, tune the strings and get ready to face the biggest crowd of the year.' },
  { date: '26 JAN', label: 'Round 2', angle: 39,
    text: 'Round two is live. Shortlisted bands take the Rock-o-Phonix stage at IIT Guwahati and play to a packed crowd and a panel of judges. No second takes, no safety net. Just the band, the amps and the noise.' },
  { date: '27 JAN', label: 'Final results', angle: 69.5,
    text: 'The final night. One band walks away with the Rock-o-Phonix crown and prizes worth ₹10,000, closing out three days of rock at Alcheringa. Be there when the last chord rings out.' },
];

/* Dial overlays that light up on the skull, in the 847×1024 skull frame */
export const DIALS = [
  { src: 'dial0.webp', left: 363, top: 156 },
  { src: 'dial1.webp', left: 368, top: 319 },
  { src: 'dial2.webp', left: 359, top: 491 },
  { src: 'dial3.webp', left: 477, top: 632 },
  { src: 'dial4.webp', left: 373, top: 723 },
];

/* Beat trainer: simplified rock drum parts. Each note = [key, beats]; ' ' = kick (space). */
export const SONGS = [
  { title: 'We Will Rock You', artist: 'Queen', bpm: 81, lines: [
    [[' ', .5], [' ', .5], ['S', 1], [' ', .5], [' ', .5], ['S', 1]],
    [[' ', .5], [' ', .5], ['S', 1], [' ', .5], [' ', .5], ['S', 1]],
    [[' ', .5], [' ', .5], ['S', 1], [' ', .5], [' ', .5], ['L', 1]]] },
  { title: 'Seven Nation Army', artist: 'The White Stripes', bpm: 120, lines: [
    [[' ', 1], [' ', 1], [' ', 1], [' ', 1]],
    [[' ', 1], [' ', 1], [' ', 1], ['L', 1]],
    [[' ', 1], [' ', 1], [' ', 1], [' ', 1]],
    [[' ', .5], [' ', .5], [' ', .5], [' ', .5], ['L', 2]]] },
  { title: 'Back in Black', artist: 'AC/DC', bpm: 94, lines: [
    [[' ', 1], ['S', 1], [' ', .5], [' ', .5], ['S', 1]],
    [[' ', 1], ['S', 1], [' ', .5], [' ', .5], ['S', 1]],
    [['K', .5], [' ', .5], ['S', 1], ['K', .5], [' ', .5], ['S', 1]],
    [['D', .25], ['D', .25], ['A', .25], ['A', .25], ['L', 2]]] },
  { title: 'Enter Sandman', artist: 'Metallica', bpm: 123, lines: [
    [[' ', 1], ['S', 1], [' ', 1], ['S', 1]],
    [[' ', .5], [' ', .5], ['S', 1], [' ', 1], ['S', 1]],
    [['D', .5], ['D', .5], ['D', .5], ['D', .5], ['A', .5], ['A', .5], ['A', .5], ['A', .5]],
    [['L', 1], ['S', 1], ['J', 1], ['S', 1]]] },
];

/* Gallery: 6 tiles. TODO: replace with real photos (put them in public/assets/gallery/) */
export const GALLERY = Array.from({ length: 6 }, () => 'stage.webp');

export const FAQ = [ // TODO: real answers
  { q: 'Who can participate?', a: 'Any college or independent band. Add the real eligibility rules here.' },
  { q: 'How do the rounds work?', a: 'Round 1 is an online submission, Round 2 is live at Alcheringa. Replace with the actual format.' },
  { q: 'Is there a registration fee?', a: 'Add fee details and the registration link.' },
  { q: 'How many members per band?', a: 'Add the minimum and maximum line-up size here.' },
  { q: 'Can we play original songs?', a: 'Covers and originals are both welcome. Add any rules on set length or language.' },
  { q: 'What do winners get?', a: 'Prizes worth ₹10,000. Add the split by position.' },
];

export const CONTACT = { // TODO: real contact
  name: 'Raftaar',
  role: 'Event Head',
  phone: '967456377278',
  email: 'name_person@yahoo.com',
  photo: 'contact-photo.jpg',
};

export const SOCIALS = [ // TODO: real URLs
  { name: 'Instagram', icon: 'instagram', url: '#' },
  { name: 'YouTube', icon: 'youtube', url: '#' },
  { name: 'X (Twitter)', icon: 'x', url: '#' },
  { name: 'Facebook', icon: 'facebook', url: '#' },
];

/* Page sections for the rail + footer nav. `nav` = rail index used for the active state. */
export const RAIL = [
  { id: 'about', label: 'About us' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact us' },
];
export const FOOTER_NAV = [
  { id: 'hero', label: 'Home' }, { id: 'about', label: 'About' }, { id: 'timeline', label: 'Timeline' },
  { id: 'drums', label: 'Drum kit' }, { id: 'gallery', label: 'Gallery' }, { id: 'faq', label: 'FAQ' },
];

export const CREDITS = ['2027 Alcheringa', 'Designed By Team Creatives Developed By Team Webops', 'All Rights Reserved'];
