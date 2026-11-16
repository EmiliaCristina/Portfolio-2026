// Jungle's: la galleria dei pezzi. Ogni pezzo ha un'immagine "da mostra"
// (render), una targhetta, eventualmente un modello 3D da ruotare e un
// "making of" con le foto e i video della lavorazione.
// Percorsi relativi a /public. Nessuna persona riconoscibile nelle foto.

const I = (n) => `/images/jungle/${n}.webp`;
const V = (n) => `/videos/jungle/${n}.mp4`;
const M = (n) => `/models/jungle/${n}.glb`;

export const HALL = {
  img: I('sala'),
  alt: "Jungle's main hall, 3D render of the finished venue",
  caption: 'The main hall · 3D render of the venue',
};

export const WALK = {
  loop: V('jungle-walk-loop'),
  full: V('jungle-walk-full'),
  poster: I('jungle-walk-poster'),
};

export const PIECES = [
  {
    id: 'pillars',
    name: 'Maya Pillars',
    plate: 'No. 01 · CNC-milled relief · 3 columns',
    text: 'Three columns of the old club, redrawn as Maya stelae. Sculpted in 3D, split into panels for the CNC and mounted on site.',
    img: I('cols-hero'),
    model: { url: M('column'), color: '#7a6750', rough: 0.92, metal: 0, ry: -0.6 },
    making: [
      { img: I('cols-detail'), label: 'Sculpt detail' },
      { img: I('cols-panels'), label: 'Panels for CNC' },
      { img: I('cols-render'), label: 'Column 02' },
      { video: V('maya-cnc'), img: I('maya-cnc-poster'), label: 'CNC milling' },
      { img: I('cols-face'), label: 'Carved face' },
      { img: I('cols-site'), label: 'On site' },
    ],
  },
  {
    id: 'table',
    name: 'Social Table',
    plate: 'No. 02 · Table top, trunk & panther base',
    text: 'A long shared table resting on a crouching black panther and a carved trunk. Modelled in 3D and milled at full scale.',
    img: I('table-hero'),
    model: { url: M('panther'), color: '#151416', rough: 0.3, metal: 0.25, ry: -0.6 },
    making: [
      { img: I('table-side'), label: 'Side view' },
      { img: I('table-back'), label: 'Back view' },
      { img: I('table-top'), label: 'Top view' },
      { img: I('table-sizes'), label: 'Sizes for CNC' },
      { img: I('table-milled'), label: 'Panther, milled' },
      { img: I('table-site'), label: 'On site' },
      { img: I('table-site-2'), label: 'On site, detail' },
    ],
  },
  {
    id: 'heads',
    name: 'Stone Heads',
    plate: 'No. 03 · Milled foam · 3 m',
    text: 'Easter Island heads, modelled in 3D, split into blocks for the CNC and assembled into full-height figures.',
    img: I('moai-hero'),
    model: { url: M('moai'), color: '#8c8170', rough: 0.9, metal: 0, ry: -0.45 },
    making: [
      { img: I('moai-milling'), label: 'Milling' },
      { img: I('moai-milling-2'), label: 'Detail' },
      { img: I('moai-assembled'), label: 'Assembled' },
      { img: I('moai-site'), label: 'On site, the bar' },
    ],
  },
  {
    id: 'mask',
    name: 'The Mask Lamp',
    plate: 'No. 04 · Iron, paint, light',
    text: 'Tribal lamp figures designed in 3D with hand-painted eyes, then cut, bent and welded in iron at full scale.',
    img: I('mask-hero'),
    making: [
      { img: I('mask-alt'), label: 'Mask study' },
      { img: I('mask-figure'), label: 'Lamp figure' },
      { img: I('flamingo'), label: 'Flamingo, same series' },
      { video: V('iron-bend'), img: I('iron-bend-poster'), label: 'Bending' },
      { video: V('iron-weld'), img: I('iron-weld-poster'), label: 'Welding' },
      { img: I('mask-wire'), label: 'Iron frame' },
      { img: I('mask-eyes'), label: 'Hand-painted eyes' },
      { img: I('mask-assembled'), label: 'Assembled' },
    ],
  },
  {
    id: 'elephanto',
    name: 'Elephanto',
    plate: 'No. 05 · Iron, sheet metal, paint',
    text: 'A single-line elephant with a painted eye at its centre, built as an iron frame and clad in sheet metal.',
    img: I('elephanto-hero'),
    making: [
      { img: I('elephanto-eye'), label: 'Painted eye' },
      { img: I('elephanto-frame'), label: 'Iron frame' },
      { img: I('elephanto-sheet'), label: 'Cladding' },
    ],
  },
  {
    id: 'ring',
    name: 'Green Spaces',
    plate: 'No. 06 · Hanging gardens, green ring & rocks',
    text: 'The green design of the hall: hanging gardens along the truss, two suspended rocks and a third one set in a planted ring on the wall, planned module by module.',
    img: I('green-hero'),
    making: [
      { img: I('ring-hero'), label: 'Concept render' },
      { img: I('ring-rocks'), label: 'Rocks, 3D' },
      { img: I('ring-plan'), label: 'Planting plan' },
      { img: I('ring-install'), label: 'Installation' },
      { img: I('ring-lit'), label: 'Lit' },
    ],
  },
];
