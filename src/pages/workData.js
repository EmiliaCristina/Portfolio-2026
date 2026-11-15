// Dati dei progetti, copiati dal progetto portfolio principale
// (Work.tsx) per mantenere la pagina standalone e autonoma.
export const workProjects = [
  {
    id: 1,
    title: "MYCRO / 3D PRINT",
    category: "Character Modeling / 3D Printing",
    tools: "ZBrush, Blender, STL, Hard-Surface",
    image: "/images/3dPrint.webp",
    detailImage: "/images/3dPrint-1.webp",
    alt: "Anteprima Progetto Uno",
    description:
      "A 2D character concept translated into a production-ready 3D asset for collectible printing. Sculpted in ZBrush, optimized in Blender and engineered as a modular STL assembly for reliable physical production.",
    role: "3D Artist / Character Modeler",
    process: "Sculpt → Retopo → Optimization → STL Assembly",
    output: "Modular, 3D-printable collectible figure",
    // Al posto dell'immagine hero mostra il viewer 3D della pipeline
    // (principio Feather Atlas), vedi src/pages/mycro/.
    atlas: "mycro",
  },
  {
    id: 2,
    title: "3D CHARACTERS",
    category: "Character Design · Modeling · Rigging · Facial Expressions",
    tools: "Blender, Mixamo, Shape Keys, Hand-painted Textures, Three.js",
    image: "/images/Character.webp",
    detailImage: "/images/Character-detail.webp",
    alt: "3D characters by Emilia Duculet",
    description:
      "Characters are the core of my work: creatures, stylised and realistic, young and old. The showreel gives the range; Vira Nyx is the deep dive, from pencil sketch to a real-time character modelled in Blender, rigged on a Mixamo skeleton, given twelve facial shape keys and hand-painted skin, then optimised into a 7.6 MB asset you can turn, animate and make expressions with right here.",
    role: "3D Character Artist",
    process: "Concept → Model → Rig → Facial Shape Keys → Web Optimisation",
    output: "Character showreel + rigged, animated real-time character (glTF)",
    // Testata con lo showreel (estratto in loop + video completo), vedi CharacterReel.
    reel: {
      loop: "/videos/characters-loop.mp4",
      full: "/videos/showreel-full.mp4",
      poster: "/images/reel-poster.webp",
    },
    // Viewer 3D dedicato a Vira, vedi src/pages/vira/.
    atlas: "vira",
  },
  {
    id: 3,
    title: "JUNGLE'S / SCENOGRAPHY",
    category: "Environment Design · 3D Visualization · Spatial Design",
    tools: "Blender, Zbrush, Unity",
    image: "/images/Jungle.webp",
    detailImage: "/images/Jungle-detail.webp",
    alt: "Anteprima Progetto Tre",
    description:
      "A former nightclub redesigned into an immersive jungle-themed restaurant, from 3D concepting and interactive Unity walkthroughs to CNC-milled panels, custom ironwork lighting and a fully realized physical build.",
    role: "Scenographer / 3D Visualizer",
    process: "3D Concept → Unity Walkthrough → Fabrication → Installation",
    output: "Fully built, immersive physical environment",
  },
  {
    id: 4,
    title: "LB / BRAND IDENTITY",
    category: "Branding · Visual Identity · Graphic Design",
    tools: "Wordpress, Tailwind CSS, Illustrator",
    image: "/images/BrandIdentity.webp",
    detailImage: "/images/LB-detail.webp",
    alt: "Anteprima Progetto Quattro",
    description:
      "A corporate identity built from the ground up for an independent financial consultant: a distinct vector logo extended into a clean, professional corporate website.",
    role: "Graphic Designer / Web Designer",
    process: "Logo Design → Visual Identity → Website Build",
    output: "Brand identity + corporate website",
  },
  {
    id: 5,
    title: "DON TOMAS / ADVERTISING",
    category: "Visual Communication · Editorial · Advertising",
    tools: "Blender, Ae, Pr, Ph, Ai",
    image: "/images/ADV.webp",
    detailImage: "/images/ADV-detail.webp",
    alt: "Anteprima Progetto Cinque",
    description:
      "A multimedia advertising campaign combining motion graphics and high-end product rendering into a promotional video built for multiple digital platforms.",
    role: "Motion Designer / 3D Artist",
    process: "3D Product Render → Motion Graphics → Edit",
    output: "Multi-platform promotional video",
  },
  {
    id: 6,
    title: "INTERACTIVE 3D PORTFOLIO",
    category: "Web Design · UI/UX · Three.js · Interactive 3D",
    tools: "React, Code, GLB, css",
    image: "/images/InteractivePortfolio.webp",
    detailImage: "/images/WEB-detail.webp",
    alt: "Anteprima Progetto Sei",
    description:
      "An interactive web portfolio built with React and Three.js: a real-time 3D character that reacts to mouse movement, with responsive hair physics and interactive UI elements.",
    role: "Web Developer / 3D Artist",
    process: "3D Character Prep → React/Three.js Build → Interaction Design",
    output: "Live interactive web portfolio",
  },
];
