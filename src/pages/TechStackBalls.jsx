import * as THREE from 'three';
import { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, useTexture } from '@react-three/drei';
import { EffectComposer, N8AO, HueSaturation } from '@react-three/postprocessing';
import {
  BallCollider,
  Physics,
  RigidBody,
  CylinderCollider,
} from '@react-three/rapier';
import { publicUrl } from '../utils/publicUrl';

// 1. Categorie e abbinamento esatto con le righe della nuova texture (MyStacks_2.jpg)
const categories = [
  {
    name: 'Design Software',
    color: '#DAFFEF', // Verde sfere (Riga 0)
    row: 0,
    items: ['Photoshop', 'Illustrator', 'After Effects', 'Premiere'],
  },
  {
    name: '3D Art',
    color: '#5D737E', // Grigio sfere (Riga 1)
    row: 1,
    items: ['Blender', 'ZBrush', 'Maya', '3DS Max', 'Painter'],
  },
  {
    name: 'Game Engines',
    color: '#C0FDFB', // Nero sfere (Riga 2)
    row: 2,
    items: ['Unity', 'Unreal', ],
  },
  {
    name: 'Coding',
    color: '#64B6AC', // Blu sfere (Riga 3)
    row: 3,
    items: ['GitHub', 'Three.js', 'WebGL', 'JavaScript', 'C++'],
  },
];

// Costruiamo la lista piatta delle 16 sfere con le coordinate esatte della griglia 4x4
const techList = [];
categories.forEach((cat) => {
  cat.items.forEach((itemName, colIndex) => {
    techList.push({
      name: itemName,
      col: colIndex,
      row: cat.row,
      color: cat.color,
    });
  });
});

const sphereGeometry = new THREE.SphereGeometry(1, 28, 28);

function SphereGeo({ vec = new THREE.Vector3(), scale, r = THREE.MathUtils.randFloatSpread, material, isActive }) {
  const api = useRef(null);

  useFrame((_state, delta) => {
    if (!isActive) return;
    delta = Math.min(0.1, delta);
    const impulse = vec
      .copy(api.current.translation())
      .normalize()
      .multiply(
        new THREE.Vector3(
          -50 * delta * scale,
          -150 * delta * scale,
          -50 * delta * scale
        )
      );
    api.current?.applyImpulse(impulse, true);
  });

  return (
    <RigidBody
      linearDamping={0.75}
      angularDamping={0.15}
      friction={0.2}
      position={[r(20), r(20) - 25, r(20) - 10]}
      ref={api}
      colliders={false}
    >
      <BallCollider args={[scale]} />
      <CylinderCollider
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 1.2 * scale]}
        args={[0.15 * scale, 0.275 * scale]}
      />
      <mesh
        castShadow
        receiveShadow
        scale={scale}
        geometry={sphereGeometry}
        material={material}
        rotation={[0.3, 1, 1]}
      />
    </RigidBody>
  );
}

function Pointer({ vec = new THREE.Vector3(), isActive }) {
  const ref = useRef(null);

  useFrame(({ pointer, viewport }) => {
    if (!isActive) return;
    const targetVec = vec.lerp(
      new THREE.Vector3(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        0
      ),
      0.2
    );
    ref.current?.setNextKinematicTranslation(targetVec);
  });

  return (
    <RigidBody
      position={[100, 100, 100]}
      type="kinematicPosition"
      colliders={false}
      ref={ref}
    >
      <BallCollider args={[2]} />
    </RigidBody>
  );
}

const BallsScene = ({ isActive }) => {
  // Caricamento della texture atlas MyStacks.png dalla cartella
  // public/images/: con Vite tutto ciò che sta in "public/" viene
  // servito dalla RADICE del sito, quindi il percorso da usare nel
  // codice è "/images/..." e MAI "public/images/..." (quel prefisso va
  // scritto solo quando ci si riferisce alla cartella su disco, non
  // nell'URL con cui il browser la richiede). Era proprio questo il bug
  // per cui lo Stack non compariva.
  const atlasTexture = useTexture(publicUrl('/images/MyStacks.png'));

  const sphereItems = useMemo(() => {
    if (!atlasTexture || !atlasTexture.image) return [];

    const img = atlasTexture.image;
    const srcCellWidth = img.width / 4;
    const srcCellHeight = img.height / 4;

    return techList.map((tech) => {
      // 1. Creazione canvas temporaneo per ogni sfera
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // 2. Sfondo solido della sfera basato sul colore della categoria
      ctx.fillStyle = tech.color;
      ctx.fillRect(0, 0, 512, 512);

      // 3. Creiamo un sub-canvas per ritagliare la singola cella dal file MyStacks_2.jpg
      const cellCanvas = document.createElement('canvas');
      cellCanvas.width = srcCellWidth;
      cellCanvas.height = srcCellHeight;
      const cellCtx = cellCanvas.getContext('2d');

      cellCtx.drawImage(
        img,
        tech.col * srcCellWidth,
        tech.row * srcCellHeight,
        srcCellWidth,
        srcCellHeight,
        0,
        0,
        srcCellWidth,
        srcCellHeight
      );

      // Rimuoviamo il fondo nero dall'icona per fonderla perfettamente con il colore della sfera
      const imgData = cellCtx.getImageData(0, 0, srcCellWidth, srcCellHeight);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Se il pixel è nero (o quasi), lo rendiamo trasparente
        if (r < 25 && g < 25 && b < 25) {
          data[i + 3] = 0;
        }
      }
      cellCtx.putImageData(imgData, 0, 0);

      // 4. Disegniamo l'icona "pulita" al centro della texture finale come un adesivo
      const padding = 100; // Regola per ingrandire/rimpicciolire l'adesivo sulla sfera
      ctx.drawImage(
        cellCanvas,
        padding,
        padding,
        512 - padding * 2,
        512 - padding * 2
      );

      // 5. Generazione texture Three.js
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;

      // 6. Materiale solido opaco con finitura lucida/clearcoat
      const material = new THREE.MeshPhysicalMaterial({
        map: texture,
        roughness: 0.25,
        metalness: 0.1,
        clearcoat: 0.4,
      });

      return {
        scale: [0.7, 1, 0.8, 1, 1][Math.floor(Math.random() * 5)],
        material,
      };
    });
  }, [atlasTexture]);

  return (
    <Physics gravity={[0, 0, 0]}>
      <Pointer isActive={isActive} />
      {sphereItems.map((item, i) => (
        <SphereGeo
          key={i}
          scale={item.scale}
          material={item.material}
          isActive={isActive}
        />
      ))}
    </Physics>
  );
};

const TechStackBalls = () => {
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsActive(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="tech-balls-container" ref={containerRef}>
      <Canvas
        shadows
        gl={{ alpha: true, stencil: false, depth: false, antialias: false }}
        camera={{ position: [0, 0, 20], fov: 32.5, near: 1, far: 100 }}
        onCreated={(state) => (state.gl.toneMappingExposure = 1.5)}
        className="tech-canvas"
      >
        <ambientLight intensity={1.2} />
        <spotLight
          position={[20, 20, 25]}
          penumbra={1}
          angle={0.2}
          color="white"
          castShadow
          shadow-mapSize={[512, 512]}
        />
        <directionalLight position={[0, 5, -4]} intensity={2} />
        
        <Suspense fallback={null}>
          <BallsScene isActive={isActive} />
        </Suspense>

        <Environment
          files={publicUrl('/models/char_enviorment.hdr')}
          environmentIntensity={0.5}
          environmentRotation={[0, 4, 2]}
        />
        <EffectComposer enableNormalPass={false}>
          <N8AO color="#0f002c" aoRadius={2} intensity={1.15} />
          {/* +10% di saturazione sulle sfere, come richiesto: nessun
              altro cambio di palette/colore. */}
          <HueSaturation saturation={0.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default TechStackBalls;
