// LB / Brand & Website: tutti i testi e le immagini della pagina.
// Modifica liberamente il testo tra le virgolette.
// Percorsi relativi a /public.

const I = (n) => `/images/brand/${n}.webp`;

export const LB = {
  url: 'https://lorenzoberardicfa.it/',
  hero: {
    video: '/videos/brand/lb-logo-anim.mp4',
    poster: I('lb-anim-poster'),
    label: 'Logo animation · loop',
    eyebrow: 'Brand identity',
    title: 'From a monogram to a complete brand.',
    text: 'Identity and website for an independent financial advisor in Turin: an L and a B sharing one stroke, closed in a circle, then carried through business cards, logo animation and a WordPress site.',
  },
  mark: {
    title: 'The mark',
    versions: [
      { img: I('lb-icon-outline'), label: 'Outline' },
      { img: I('lb-icon-fill'), label: 'Filled / favicon' },
      { img: I('lb-icon-outline'), label: 'Negative', negative: true },
      { img: I('lb-logo-mono'), label: 'Mono' },
    ],
    horizontal: { img: I('lb-logo-horizontal'), label: 'Horizontal lockup' },
    colors: [
      { name: 'LB Blue', hex: '#1BADE4', ink: '#ffffff' },
      { name: 'Graphite', hex: '#373536', ink: '#ffffff' },
      { name: 'Paper', hex: '#F4F5F6', ink: '#333333' },
    ],
    type: {
      sample: 'Lorenzo Berardi',
      line: "Consulente finanziario autonomo · Il futuro è l'indipendenza",
      label: 'Poppins · Bold / Regular',
    },
  },
  print: { title: 'Print', img: I('lb-cards'), alt: 'LB business cards, front and back' },
  site: {
    eyebrow: 'WordPress website',
    title: 'One page, built to convert.',
    text: 'Clear values, services and a one-tap path to the first consultation, managed end to end in WordPress.',
    laptop: I('lb-laptop'),
    phone: I('lb-phone'),
    features: ['WordPress + Elementor', 'Responsive', 'SEO & alt text', 'WhatsApp booking', 'Privacy & cookies', 'Hosting management'],
    cta: 'Visit the live site',
  },
};

export const MORE = {
  eyebrow: 'More client work',
  title: 'Same method, different brands.',
  items: [
    {
      id: 'erasmus',
      name: 'Erasmus Torino',
      sub: 'Logo · 3D brand visuals · WordPress',
      tags: ['Logo', '3D visuals', 'WordPress'],
      url: 'https://erasmustorino.it/erasmustorino-homepage/',
      laptop: I('erasmus-laptop'),
      phone: I('erasmus-phone'),
      text: 'Logo, 3D brand visuals and the WordPress site of the Erasmus student association in Turin.',
      gallery: [I('erasmus-laptop'), I('erasmus-phone')],
    },
    {
      id: 'sd2',
      name: 'SD2 Engineering',
      sub: '3D logo rendering · bilingual website · LinkedIn',
      tags: ['3D logo render', 'WordPress IT/EN', 'LinkedIn'],
      url: 'https://www.sd2engineering.com/',
      laptop: I('sd2-laptop'),
      phone: I('sd2-phone'),
      text: 'For an engineering studio in Turin, Italy: 3D renderings of the existing logo, a bilingual WordPress website and the LinkedIn company page.',
      gallery: [I('sd2-laptop'), I('sd2-3d-logo'), I('sd2-phone')],
    },
    {
      id: 'om',
      name: 'Officina del Mostro',
      sub: 'My studio · logo, 3D mark, website',
      tags: ['Logo', '3D mark', 'WordPress'],
      url: 'https://officinadelmostro.it/',
      laptop: I('om-laptop'),
      phone: I('om-phone'),
      text: 'My own studio: the OM logo, its 3D mark and the WordPress website.',
      gallery: [I('om-laptop'), I('om-phone')],
    },
  ],
};
