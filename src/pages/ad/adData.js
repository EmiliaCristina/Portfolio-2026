/* Testi, immagini e video della pagina "Advertising & Video".
   Per cambiare un testo basta modificarlo qui. */

export const SPOT = {
  client: 'Don Tomás · Mexican Sauces',
  video: '/videos/ad/dt-spot.mp4',
  poster: '/images/ad/dt-poster.webp',
  duration: '0:43 · with sound',
  eyebrow: 'TV & social spot',
  title: 'A sauce brand, brought to life in 3D.',
  text:
    'A 43-second spot built entirely in Blender: the Don Tomás character, a cartoon Mexican village, every ingredient and dish, in a hand-drawn toon style, then animated type and edit in After Effects and Premiere.',
  tags: ['Character design', '3D modelling & rigging', 'Toon shading', 'Motion graphics', 'Edit & sound'],
  youtube: 'https://www.youtube.com/watch?v=da5qtHZCplQ',
};

/* La griglia "mondo di Don Tomás".
   kind: 'model' = 3D interattivo - 'loop' = video in loop - 'hover' = video che parte al passaggio del mouse */
export const WORLD = {
  model: { url: '/models/ad/dontomas.glb', label: 'Character · 3D model', hint: 'Drag to rotate' },
  tiles: [
    { id: 'jars', label: 'Hero product', img: '/images/ad/dt-jars.webp', area: 'jars', sticker: 'y' },
    { id: 'smile', label: 'In the spot', img: '/images/ad/dt-smile.webp', video: '/videos/ad/dt-smile-loop.mp4', kind: 'loop', area: 'smile' },
    { id: 'chili', label: 'Ingredients', img: '/images/ad/dt-chili.webp', area: 'chili', pos: '60% 30%' },
    { id: 'end', label: 'End card · logo animation', img: '/images/ad/dt-endcard.webp', video: '/videos/ad/dt-endcard.mp4', kind: 'hover', area: 'end' },
    { id: 'dishes', label: 'Dishes & props', img: '/images/ad/dt-dishes.webp', area: 'dishes', pos: '50% 55%', sticker: 'y' },
  ],
};

export const COMPARE = {
  final: '/images/ad/dt-final.webp',
  clay: '/images/ad/dt-clay.webp',
  left: 'Final frame',
  right: 'Blender · clay',
};

/* Spot narrativo AI "A year looking for a parking spot" (concept, Kling).
   seasons: riquadri che fanno partire la clip al passaggio del mouse */
export const CAR = {
  badge: 'Concept · AI',
  label: 'Car dealership spot',
  video: '/videos/ad/car-spot.mp4',
  poster: '/images/ad/car-poster.webp',
  duration: '0:36 · with sound',
  eyebrow: 'AI short film · Kling',
  title: 'A year looking for a parking spot.',
  text:
    'A narrative car commercial set in Turin: Marco circles the same street through four seasons, until a small city car slips into the spot he passed by. Images in Kling Image 4.0, shots from start and end frames, then edit, grade, end card and sound design.',
  tags: ['Storytelling', 'AI image & video', 'Character consistency', 'Edit & color', 'Sound design'],
  seasonsTitle: 'Four seasons, one shot',
  seasons: [
    { id: 'winter', label: 'Winter', img: '/images/ad/car-winter.webp', video: '/videos/ad/car-winter.mp4' },
    { id: 'spring', label: 'Spring', img: '/images/ad/car-spring.webp', video: '/videos/ad/car-spring.mp4' },
    { id: 'summer', label: 'Summer', img: '/images/ad/car-summer.webp', video: '/videos/ad/car-summer.mp4' },
    { id: 'autumn', label: 'Autumn', img: '/images/ad/car-autumn.webp', video: '/videos/ad/car-autumn.mp4' },
  ],
  frames: [
    { id: 'payoff', label: 'The payoff', img: '/images/ad/car-payoff.webp' },
    { id: 'claim', label: 'Claim & end card', img: '/images/ad/car-claim.webp' },
  ],
};

export const PHARMA = {
  badge: 'Concept · self-initiated',
  eyebrow: 'AI video · Pharmacy',
  title: 'One message, three formats.',
  text:
    'A ready-to-customise campaign for pharmacies and health brands: AI-generated footage, 3D product scenes and motion graphics, delivered in three lengths for in-store screens, ledwalls and social.',
  items: [
    { id: 'ess', name: 'Essenziale', time: '0:10', img: '/images/ad/ph-ess.webp', video: '/videos/ad/ph-essenziale.mp4',
      text: 'Problem, product, call to action. Built for loops on in-store screens.', tags: ['Loop', 'Shop window'] },
    { id: 'rac', name: 'Racconto', time: '0:17', img: '/images/ad/ph-rac.webp', video: '/videos/ad/ph-racconto.mp4',
      text: 'Adds the "how it works" moment with an anatomical 3D view.', tags: ['Social', 'Ledwall'] },
    { id: 'esp', name: 'Esperienza', time: '0:31', img: '/images/ad/ph-esp.webp', video: '/videos/ad/ph-esperienza.mp4',
      text: 'Full story: season, anatomy, three-step routine and relief.', tags: ['Campaign', 'Website hero'] },
  ],
};

export const CTA = {
  title: 'Need a video for your brand?',
  text: 'Spots, loops and AI campaigns, tailored to your sector.',
  button: "Let's talk",
  href: 'mailto:duculetemilia@gmail.com?subject=Video%20for%20my%20brand',
};
