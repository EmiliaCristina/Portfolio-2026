/* Testi e file della pagina "Interactive 3D Portfolio".
   Per cambiare un testo basta modificarlo qui. */

export const HERO = {
  // quando c'è la registrazione della home: '/videos/ip/home-loop.mp4' (null = solo immagine)
  video: '/videos/ip/home-loop.mp4',
  poster: '/images/ip/home-poster.webp',
  badge: 'The home page, live',
  cta: 'Try it live',
};

export const EVOLUTION = {
  eyebrow: 'Designed for the web',
  title: 'She lives on the screen.',
  text:
    'My alter ego, in her fur hoodie, is a render-only character: millions of fur strands are far too heavy for a browser. So the home has its own light, real-time avatar with a monitor head, and she still shows up inside its screen, between the glitches.',
  before: { img: '/images/ip/alter-ego.webp', label: 'Alter ego · offline render', tag: 'Millions of fur strands' },
  after: { img: '/images/ip/avatar-screen.webp', label: 'Web avatar · real time', tag: 'She appears on the screen' },
  stats: [
    { value: '51k', label: 'triangles' },
    { value: '3.6 MB', label: 'whole character' },
    { value: 'Touch', label: 'works on phones' },
  ],
};

export const HOOD = {
  eyebrow: 'Under the hood',
  title: 'Turn it, strip it, make it talk.',
  model: '/models/Emy.glb',
  modes: [
    { id: 'clay', label: 'Clay' },
    { id: 'wire', label: 'Wireframe' },
    { id: 'face', label: 'Expressions' },
  ],
  // ordine di quello che appare sullo schermo a ogni clic su "Expressions":
  // occhi, sorriso, il mio alter ego, il logo DEC, schermo spento
  expressions: ['on', 'happy', 'ego', 'logo', 'off'],
  features: [
    { icon: '◎', title: 'Follows your cursor', text: 'The head turns smoothly toward the mouse, or the finger on touch screens.' },
    { icon: '◉', title: 'Eyes on a screen', text: 'Expressions are drawn live on the monitor face, no extra geometry.' },
    { icon: '∿', title: 'Soft ears', text: 'A light secondary motion keeps the bunny ears alive.' },
    { icon: '✎', title: 'Typed dialogue', text: 'She introduces herself and offers choices that lead into the site.' },
    { icon: '⇣', title: 'Loads what you need', text: 'Compressed models, and each project scene loads only when opened.' },
    { icon: '▢', title: 'One code base', text: 'React, React Three Fiber and Vite, deployed on GitHub Pages.' },
  ],
};
