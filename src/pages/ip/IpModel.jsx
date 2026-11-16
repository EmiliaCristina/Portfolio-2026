import { Suspense, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as THREE from 'three';
import glitchEgo from '../../assets/glitch1.jpg';
import glitchLogo from '../../assets/glitch2.png';
import { publicUrl } from '../../utils/publicUrl';

/* Emi da girare: clay, wireframe o materiali originali con le espressioni.
   Lavora su una copia del modello e dei materiali, così la home non cambia. */

const CLAY = new THREE.MeshStandardMaterial({ color: '#d8d3cc', roughness: 0.75, metalness: 0, side: THREE.DoubleSide });
const WIRE = new THREE.MeshBasicMaterial({ color: '#12806f', wireframe: true });

/* Lo schermo della pagina progetto: occhi (off, on, happy), il mio alter ego
   e il logo DEC, con i glitch a fette come nella home. Non tocca la home. */
const IMAGES = { ego: glitchEgo, logo: glitchLogo };

function Screen({ material, expression }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const t = new THREE.CanvasTexture(c);
    t.center.set(0.5, 0.5);
    t.rotation = Math.PI / 2;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const imgs = useMemo(() => {
    const o = {};
    Object.entries(IMAGES).forEach(([k, url]) => { const im = new Image(); im.src = url; o[k] = im; });
    return o;
  }, []);

  useEffect(() => {
    if (!material) return undefined;
    material.color = new THREE.Color('#ffffff');
    material.map = tex;
    material.emissive = new THREE.Color('#ffffff');
    material.emissiveMap = tex;
    material.emissiveIntensity = 1;
    material.needsUpdate = true;
    const ctx = tex.image.getContext('2d', { willReadFrequently: true });
    let raf;
    let glitch = 14; // ogni cambio parte con un glitch
    let next = performance.now() + 1500;
    const draw = () => {
      const now = performance.now();
      if (now > next) { glitch = 10 + Math.floor(Math.random() * 12); next = now + 1400 + Math.random() * 2200; }
      const im = imgs[expression];
      if (im) {
        if (im.complete) ctx.drawImage(im, 0, 0, 512, 512);
        else { ctx.fillStyle = '#0a0d18'; ctx.fillRect(0, 0, 512, 512); }
      } else {
        ctx.fillStyle = expression === 'off' ? '#040406' : '#0a0d18';
        ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = '#00ffcc';
        ctx.lineWidth = 36;
        ctx.lineCap = 'round';
        [160, 352].forEach((x) => {
          ctx.beginPath();
          if (expression === 'off') { ctx.moveTo(x - 50, 206); ctx.lineTo(x + 50, 306); ctx.moveTo(x + 50, 206); ctx.lineTo(x - 50, 306); }
          else if (expression === 'happy') ctx.arc(x, 260, 55, Math.PI, 0, false);
          else ctx.arc(x, 256, 55, 0, Math.PI * 2);
          ctx.stroke();
        });
      }
      if (glitch > 0) {
        glitch -= 1;
        const n = 2 + Math.floor(Math.random() * 4);
        for (let i = 0; i < n; i += 1) {
          const y = Math.floor(Math.random() * 512);
          const h = 10 + Math.floor(Math.random() * 30);
          try { ctx.putImageData(ctx.getImageData(0, y, 512, h), (Math.random() - 0.5) * 50, y); } catch { /* fuori dai bordi */ }
        }
        material.emissiveIntensity = Math.random() > 0.5 ? 1.8 : 0.5;
      } else {
        material.emissiveIntensity = 1;
      }
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      for (let y = 0; y < 512; y += 4) ctx.fillRect(0, y, 512, 2);
      tex.needsUpdate = true;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [material, expression, tex, imgs]);

  useEffect(() => () => tex.dispose(), [tex]);
  return null;
}

function Avatar({ url, mode, expression }) {
  const { scene } = useGLTF(publicUrl(url));
  const { camera, size } = useThree();

  const { obj, meshes, screen, ears, h } = useMemo(() => {
    const o = skeletonClone(scene);
    const list = [];
    let scr = null;
    o.traverse((m) => {
      if (!m.isMesh) return;
      if (m.name === 'Icosphere') { m.visible = false; return; }
      const orig = Array.isArray(m.material) ? m.material.map((x) => x.clone()) : m.material.clone();
      (Array.isArray(orig) ? orig : [orig]).forEach((x) => { if (x.name === 'Screen') scr = x; });
      list.push({ m, orig });
      m.material = orig;
    });
    // box "preciso": misura i vertici veri (anche quelli mossi dallo scheletro),
    // così l'asse di rotazione passa per il centro del personaggio
    o.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(o, true);
    const c = b.getCenter(new THREE.Vector3());
    const hh = b.max.y - b.min.y;
    o.position.set(-c.x, -b.min.y, -c.z);
    const g = new THREE.Group();
    g.add(o);
    return { obj: g, meshes: list, screen: scr, ears: [o.getObjectByName('EarL'), o.getObjectByName('EarR')], h: hh };
  }, [scene]);

  useEffect(() => {
    meshes.forEach(({ m, orig }) => {
      if (mode === 'face') m.material = orig;
      else if (mode === 'wire') m.material = Array.isArray(orig) ? orig.map(() => WIRE) : WIRE;
      else m.material = Array.isArray(orig) ? orig.map(() => CLAY) : CLAY;
    });
  }, [mode, meshes]);

  const controls = useThree((st) => st.controls);
  useLayoutEffect(() => {
    const vf = THREE.MathUtils.degToRad(camera.fov / 2);
    const d = Math.max((h * 0.66) / Math.tan(vf), (h * 0.5) / (Math.tan(vf) * (size.width / size.height)));
    camera.position.set(0, h * 0.55, d);
    camera.lookAt(0, h * 0.5, 0);
    camera.updateProjectionMatrix();
    controls?.update();
  }, [camera, size, h, mode === 'face', controls]);

  // lo stesso leggero movimento delle orecchie della home
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const [l, r] = ears;
    if (l) l.rotation.x = THREE.MathUtils.lerp(l.rotation.x, Math.sin(t * 1.5) * 0.12, 0.05);
    if (r) r.rotation.x = THREE.MathUtils.lerp(r.rotation.x, Math.sin(t * 1.8 + 1) * 0.12, 0.05);
  });

  return (
    <>
      {mode === 'face' && screen && <Screen material={screen} expression={expression} />}
      <primitive object={obj} />
      <OrbitControls
        makeDefault
        target={[0, h * 0.5, 0]}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={0.9}
        maxPolarAngle={Math.PI / 2 + 0.1}
        autoRotate={mode !== 'face'}
        autoRotateSpeed={0.9}
        enableDamping
      />
    </>
  );
}

export default function IpModel({ url, mode, expression }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 30, near: 0.01, far: 50, position: [0, 1, 4] }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.setClearColor('#000000', 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
      }}
      onError={() => setOk(false)}
    >
      <ambientLight intensity={0.6} />
      <hemisphereLight args={['#ffffff', '#8a8f8d', 1.1]} />
      <directionalLight position={[2, 3, 3]} intensity={2.2} />
      <directionalLight position={[-3, 2, -2]} intensity={1.2} color="#cfe9e4" />
      <Suspense fallback={null}>
        <Avatar url={url} mode={mode} expression={expression} />
      </Suspense>
    </Canvas>
  );
}
