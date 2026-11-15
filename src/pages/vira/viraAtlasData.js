// Contenuti del viewer di Vira Nyx (scheda "3D Character").
// Stesso principio di Mycro Atlas: ogni tab è una fase della pipeline
// dello stesso personaggio.

export const VIRA_STAGES = [
  {
    id: 'concept',
    name: 'Concept',
    sub: 'Pencil sketch',
    thumb: '/images/vira/tab-concept.webp',
    eyebrow: 'Stage 01 of 05',
    tags: ['Pencil', 'Character design', 'Silhouette'],
    desc:
      'Vira Nyx started on paper: a pencil study to lock in her silhouette, outfit and attitude, with the cropped jacket, twin holsters, utility straps and tall boots.',
    traits: [
      { icon: 'pen', label: 'Medium', value: 'Pencil on paper' },
      { icon: 'user', label: 'Character', value: 'Vira Nyx' },
      { icon: 'flow', label: 'Focus', value: 'Silhouette and outfit' },
      { icon: 'box', label: 'Next', value: 'Blocking the 3D model' },
    ],
    caption: 'Every character starts as a line.',
  },
  {
    id: 'model',
    name: 'Model',
    sub: 'Blender',
    thumb: '/images/vira/tab-model.webp',
    eyebrow: 'Stage 02 of 05',
    tags: ['Blender', 'Game-ready', 'Quad topology'],
    desc:
      'Modelled in Blender as a game-ready character, with separate meshes for jacket, belt, holsters, boots, weapons and jewellery. Toggle the wireframe to read the edge flow of the body.',
    traits: [
      { icon: 'tool', label: 'Software', value: 'Blender' },
      { icon: 'mesh', label: 'Body', value: '63,480 vertices' },
      { icon: 'parts', label: 'Meshes', value: '22 separate parts' },
      { icon: 'flow', label: 'Hair', value: 'Alpha hair cards' },
    ],
    caption: 'Clean edges, ready to move.',
  },
  {
    id: 'rig',
    name: 'Rig',
    sub: 'Mixamo',
    thumb: '/images/vira/tab-rig.webp',
    eyebrow: 'Stage 03 of 05',
    tags: ['Mixamo', 'Skinning', 'Animation'],
    desc:
      'Rigged on a 65-bone Mixamo skeleton and tested with locomotion clips. Pick an animation to see how body, outfit and props follow the bones.',
    traits: [
      { icon: 'bone', label: 'Rig', value: 'Mixamo, 65 bones' },
      { icon: 'play', label: 'Clips', value: 'Idle, Walk, Run, Roll' },
      { icon: 'parts', label: 'Skinning', value: 'Body, outfit and props' },
      { icon: 'box', label: 'Export', value: 'FBX / glTF' },
    ],
    caption: 'Bones first, then attitude.',
  },
  {
    id: 'face',
    name: 'Face',
    sub: 'Shape keys',
    thumb: '/images/vira/tab-face.webp',
    eyebrow: 'Stage 04 of 05',
    tags: ['Shape keys', 'Expressions', 'Real-time'],
    desc:
      'Twelve facial shape keys drive blinks, brows, jaw and mouth shapes. Mix them with the sliders or pick a preset. Her eyes follow your cursor.',
    traits: [],
    caption: 'Say something, Vira.',
  },
  {
    id: 'final',
    name: 'Final',
    sub: 'Textured',
    thumb: '/images/vira/tab-final.webp',
    eyebrow: 'Stage 05 of 05',
    tags: ['Hand-painted skin', 'Materials', 'Web-ready'],
    desc:
      'Hand-painted skin textures with leather, rubber and metal materials, optimised from 45 MB to a 7.6 MB asset that runs right here in the browser.',
    traits: [
      { icon: 'palette', label: 'Skin', value: 'Hand-painted textures' },
      { icon: 'parts', label: 'Materials', value: 'Leather, rubber, metal' },
      { icon: 'box', label: 'Web asset', value: '7.6 MB · glTF, meshopt, WebP' },
      { icon: 'tool', label: 'Engine', value: 'Three.js / React Three Fiber' },
    ],
    caption: 'Ready for her close-up.',
  },
];

export const CLIPS = [
  { id: 'idle', label: 'Idle' },
  { id: 'walk', label: 'Walk' },
  { id: 'run', label: 'Run' },
  { id: 'roll', label: 'Roll' },
];

// Shape keys nel GLB (nomi esatti) con l'etichetta mostrata.
export const MORPHS = [
  { id: 'blink_L', label: 'Blink left' },
  { id: 'blink_R', label: 'Blink right' },
  { id: 'squint', label: 'Squint' },
  { id: 'eyes_wide', label: 'Eyes wide' },
  { id: 'brows_up', label: 'Brows up' },
  { id: 'brows_frown', label: 'Brows frown' },
  { id: 'jaw_open', label: 'Jaw open' },
  { id: 'mouth_A', label: 'Mouth "A"' },
  { id: 'mouth_O', label: 'Mouth "O"' },
  { id: 'smile', label: 'Smile' },
  { id: 'frown', label: 'Frown' },
  { id: 'pout', label: 'Pout' },
];

export const PRESETS = [
  { id: 'neutral', label: 'Neutral', mix: {} },
  { id: 'happy', label: 'Happy', mix: { smile: 1, squint: 0.35, brows_up: 0.2 } },
  { id: 'surprise', label: 'Surprise', mix: { brows_up: 1, eyes_wide: 1, mouth_O: 0.6 } },
  { id: 'determined', label: 'Determined', mix: { brows_frown: 0.9, squint: 0.3, frown: 0.35 } },
  { id: 'wink', label: 'Wink', mix: { blink_L: 1, smile: 0.6, brows_frown: 0.15 } },
];
