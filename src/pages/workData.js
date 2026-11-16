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
    category: "Scenography · 3D Design · Fabrication",
    tools: "Blender, ZBrush, CNC, Ironwork, Unity",
    image: "/images/Jungle.webp",
    detailImage: "/images/Jungle-detail.webp",
    alt: "Jungle's restaurant, scenography",
    description:
      "A former nightclub redesigned into an immersive jungle-themed restaurant. I followed it from the 3D concept and the interactive Unity walkthrough for the client to the design of every signature piece, CNC files, ironwork lighting and installation on site.",
    role: "Scenographer / 3D Designer",
    process: "3D Concept → Unity Walkthrough → CNC & Ironwork → Installation",
    output: "Fully built, immersive physical environment",
    // Al posto dell'immagine hero: la galleria dei pezzi, vedi src/pages/jungle/.
    atlas: "jungle",
  },
  {
    id: 4,
    title: "LB / BRAND & WEBSITE",
    category: "Brand Identity · WordPress Website · Logo Animation",
    tools: "WordPress, Elementor, Illustrator, After Effects",
    image: "/images/BrandIdentity.webp",
    detailImage: "/images/LB-detail.webp",
    alt: "Lorenzo Berardi brand identity and website on a laptop",
    description:
      "A complete identity for an independent financial advisor in Turin: monogram logo, logo animation, business cards and a WordPress website. Below, the same approach applied to other brands and WordPress sites.",
    role: "Brand Designer / Web Designer",
    process: "Logo Design → Visual Identity → Logo Animation → WordPress Site",
    output: "Brand identity, print and WordPress website",
    // Al posto dell'immagine hero: il brand book, vedi src/pages/brand/.
    atlas: "brand",
  },
  {
    id: 5,
    title: "ADVERTISING & VIDEO",
    category: "3D Animation · Character Design · Motion Graphics · AI Video",
    tools: "Blender, After Effects, Premiere, Kling AI",
    image: "/images/ADV.webp",
    detailImage: "/images/ADV-detail.webp",
    alt: "Anteprima Progetto Cinque",
    description:
      "A 3D advertising spot for Don Tomás Mexican Sauces, from character design to final edit, plus self-initiated AI video concepts that show how a brand message can become loops, social cuts and ledwall content.",
    role: "3D Artist / Motion Designer / AI Video",
    process: "Character & Set in Blender → Toon Render → Motion Graphics & Edit",
    output: "TV & social spot · AI video concepts",
    atlas: "ad",
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
      "An interactive web portfolio built with React and Three.js: a light real-time 3D avatar that follows the cursor, shows expressions and glimpses of my alter ego on its screen, and guides visitors through the site.",
    role: "Web Developer / 3D Artist",
    process: "3D Character Prep → React/Three.js Build → Interaction Design",
    output: "Live interactive web portfolio",
    atlas: "ip",
  },
];
