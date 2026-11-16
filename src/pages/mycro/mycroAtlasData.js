// Contenuti del viewer "Mycro Atlas" (principio Feather Atlas applicato
// alla scheda Work di Mycro): ogni tab è una fase della pipeline dello
// stesso modello, invece che una specie diversa.

// Ritagli dell'immagine della pipeline (public/images/3dPrint-1.webp,
// 1536×1024) usati come miniature dei tab e come "lente" del close-up.
export const PIPELINE_IMG = '/images/3dPrint-1.webp';
export const PIPELINE_SIZE = [1536, 1024];

export const STAGES = [
  {
    id: 'sculpt',
    name: 'Sculpt',
    sub: 'ZBrush',
    crop: [405, 650, 220, 285],
    eyebrow: 'Stage 01 of 04',
    tags: ['ZBrush', 'High-poly', 'Hard-surface'],
    desc:
      'Starting from the 2D concept, Mycro was blocked out and sculpted in ZBrush: chunky robot volumes, sharp horns and collar, and the chest turbine as the focal point. What you are turning here is the real print master, shown in clay.',
    traits: [
      { icon: 'tool', label: 'Software', value: 'ZBrush' },
      { icon: 'mesh', label: 'Detail', value: '13.6M triangles (print master)' },
      { icon: 'parts', label: 'Shells', value: '11 separate parts' },
      { icon: 'flow', label: 'Goal', value: 'Concept → solid, printable forms' },
    ],
    caption: 'Clay first. Character second.',
  },
  {
    id: 'retopo',
    name: 'Retopo',
    sub: 'Blender',
    crop: [845, 650, 215, 285],
    eyebrow: 'Stage 02 of 04',
    tags: ['Blender', 'Retopology', 'Real-time'],
    desc:
      'The sculpt was rebuilt in Blender as a clean, light mesh whose edge flow follows the forms. This is the version used for renders, turntables and the viewer you are using right now.',
    traits: [
      { icon: 'tool', label: 'Software', value: 'Blender' },
      { icon: 'mesh', label: 'Mesh', value: '≈12,700 vertices' },
      { icon: 'palette', label: 'Materials', value: '4 (black, red, cream, bronze)' },
      { icon: 'flow', label: 'Used for', value: 'Renders and real-time' },
    ],
    caption: 'Every edge where it needs to be.',
  },
  {
    id: 'print',
    name: 'Print',
    sub: '11 STL parts',
    crop: [1130, 645, 320, 300],
    eyebrow: 'Stage 03 of 04',
    tags: ['STL', 'Modular', 'Print-ready'],
    desc:
      'For production the figure is split into 11 parts (head, V-collar, torso, hips, chest turbine, arms, forearms and legs) so each piece prints cleanly and can be painted before assembly. Use the assemble button to put it back together.',
    traits: [
      { icon: 'tool', label: 'Format', value: 'STL' },
      { icon: 'parts', label: 'Parts', value: '11 printable components' },
      { icon: 'flow', label: 'Process', value: 'Split → Optimise → Export' },
      { icon: 'box', label: 'Output', value: 'Modular collectible figure' },
    ],
    caption: 'Eleven parts, one robot.',
  },
  {
    id: 'final',
    name: 'Final',
    sub: 'Painted figure',
    crop: [965, 40, 320, 410],
    eyebrow: 'Stage 04 of 04',
    tags: ['Painted', 'Collectible', 'Turntable'],
    desc:
      'Assembled and painted: glossy red armour, matte black, warm cream and bronze rivet bands. The finished collectible stays true to the original 2D concept.',
    traits: [
      { icon: 'user', label: 'Role', value: '3D Artist / Character Modeler' },
      { icon: 'flow', label: 'Process', value: 'Sculpt → Retopo → STL' },
      { icon: 'box', label: 'Output', value: 'Painted collectible' },
      { icon: 'palette', label: 'Palette', value: 'swatches' },
    ],
    caption: 'Paint on, horns up.',
  },
];

export const SWATCHES = ['#b2160a', '#111111', '#d6cab4', '#8a5a2b'];

export const CLOSEUP = {
  title: 'Chest turbine',
  text: 'The turbine is its own printed part, set into the chest like a badge.',
  crop: [1083, 186, 94, 94],
};

// Spostamento di ogni pezzo nella vista esplosa (unità mondo, Mycro è
// alto 1) e ritardo dell'animazione (0–0.3) per farli partire a cascata.
export const EXPLODE = {
  head: { off: [0, 0.2, 0.02], d: 0.0 },
  collar: { off: [0, 0.1, 0.13], d: 0.05 },
  turbine: { off: [0, -0.01, 0.32], d: 0.08 },
  torso: { off: [0, 0.02, -0.02], d: 0.12 },
  hips: { off: [0, -0.06, 0], d: 0.16 },
  arm_L: { off: [-0.17, 0.07, 0], d: 0.1 },
  arm_R: { off: [0.17, 0.07, 0], d: 0.1 },
  forearm_L: { off: [-0.28, -0.04, 0.05], d: 0.18 },
  forearm_R: { off: [0.28, -0.04, 0.05], d: 0.18 },
  leg_L: { off: [-0.08, -0.17, 0], d: 0.24 },
  leg_R: { off: [0.08, -0.17, 0], d: 0.24 },
};

// Ritaglio di un'immagine come background CSS "cover" in un box W×H.
export function cropStyle(url, crop, W, H, size = PIPELINE_SIZE) {
  const [x, y, w, h] = crop;
  const s = Math.max(W / w, H / h);
  return {
    backgroundImage: `url('${url}')`,
    backgroundSize: `${size[0] * s}px ${size[1] * s}px`,
    backgroundPosition: `${-x * s + (W - w * s) / 2}px ${-y * s + (H - h * s) / 2}px`,
  };
}

// Foto reali delle stampe, mostrate sotto lo stadio "Print".
export const PRINTS = [
  { img: '/images/mycro/print-resin.webp', label: 'Resin parts' },
  { img: '/images/mycro/print-assembled.webp', label: 'Assembled print' },
];
