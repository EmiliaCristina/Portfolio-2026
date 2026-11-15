import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { publicUrl } from '../../utils/publicUrl';
import { EXPLODE } from './mycroAtlasData';

/* ================================================================
   Scena del viewer: quattro "viste" dello stesso Mycro, una per fase.
   - sculpt  -> STL della stampa, materiale clay
   - retopo  -> GLB low-poly, base chiara + wireframe a quad
   - print   -> STL della stampa, verde PLA con linee di layer, esploso
   - final   -> GLB dipinto con i suoi materiali
   Il passaggio tra due fasi è uno "scan" orizzontale: due clipping
   plane complementari, la vista nuova appare dall'alto verso il basso.
   Tutto lo stato di interazione vive nel ref `ctl` condiviso col DOM.
   ================================================================ */

export const PHASES = ['sculpt', 'retopo', 'print', 'final'];
const ACCENT = new THREE.Color('#0f7e6f');
const WIPE_MS = 1300;
const TOP = 0.74;
const BOTTOM = -0.74;
const RADIUS = 0.74;
const NO_CLIP = 50;

// Rotazione "a giradischi": yaw libero, inclinazione limitata, così Mycro
// non può mai finire sottosopra.
export const HOME = { yaw: 0.5, pitch: 0.1 };
export const PITCH_MAX = 0.42;
const eTmp = new THREE.Euler(0, 0, 0, 'YXZ');

export function rotateBy(c, yaw, pitch) {
  c.yaw += yaw;
  c.pitch = Math.max(-PITCH_MAX, Math.min(PITCH_MAX, c.pitch + pitch));
}
const wrapPi = (a) => Math.atan2(Math.sin(a), Math.cos(a));

const LIGHTS = {
  day: { env: 0.9, key: 1.7, keyCol: new THREE.Color('#fff4e2'), rim: 0.55, exp: 1.0 },
  dusk: { env: 0.25, key: 2.6, keyCol: new THREE.Color('#ffc98a'), rim: 2.0, exp: 1.0 },
};

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const outBack = (t) => { const u = t - 1; return 1 + 2.2 * u * u * u + 1.2 * u * u; };
const smooth = (t) => { const x = Math.min(1, Math.max(0, t)); return x * x * (3 - 2 * x); };

/* ---------- wireframe "a quad" ----------
   Il GLB è triangolato: per far vedere la topologia come in Blender
   scarto le diagonali dei quad, cioè gli spigoli condivisi che sono il
   lato più lungo per entrambi i triangoli che li toccano. */
function quadWire(geom) {
  const pos = geom.attributes.position;
  const idx = geom.index ? geom.index.array : null;
  const triCount = idx ? idx.length / 3 : pos.count / 3;
  const ids = new Map();
  const vid = new Uint32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    const k = `${Math.round(pos.getX(i) * 1e4)},${Math.round(pos.getY(i) * 1e4)},${Math.round(pos.getZ(i) * 1e4)}`;
    let v = ids.get(k);
    if (v === undefined) { v = ids.size; ids.set(k, v); }
    vid[i] = v;
  }
  const edges = new Map();
  const a = new THREE.Vector3(), b = new THREE.Vector3();
  for (let t = 0; t < triCount; t++) {
    const tv = [0, 1, 2].map((j) => (idx ? idx[t * 3 + j] : t * 3 + j));
    let longest = -1, best = -1;
    const lens = [0, 1, 2].map((j) => {
      a.fromBufferAttribute(pos, tv[j]); b.fromBufferAttribute(pos, tv[(j + 1) % 3]);
      return a.distanceToSquared(b);
    });
    lens.forEach((l, j) => { if (l > longest) { longest = l; best = j; } });
    for (let j = 0; j < 3; j++) {
      const p = tv[j], q = tv[(j + 1) % 3];
      const ip = vid[p], iq = vid[q];
      const ek = ip < iq ? `${ip}_${iq}` : `${iq}_${ip}`;
      let e = edges.get(ek);
      if (!e) { e = { p, q, n: 0, l: 0 }; edges.set(ek, e); }
      e.n++;
      if (j === best) e.l++;
    }
  }
  const out = [];
  edges.forEach((e) => {
    if (e.n === 2 && e.l === 2) return;
    a.fromBufferAttribute(pos, e.p); b.fromBufferAttribute(pos, e.q);
    out.push(a.x, a.y, a.z, b.x, b.y, b.z);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
  return g;
}

/* ---------- materiale "PLA" con linee di layer ----------
   Le linee sono calcolate nello spazio del modello assemblato (uM è la
   matrice del pezzo a riposo), così restano solidali al pezzo quando
   la vista si esplode e non scorrono. */
function makePrintMaterial(plane, uM) {
  const m = new THREE.MeshStandardMaterial({
    color: '#8fdc72', roughness: 0.62, metalness: 0, clippingPlanes: [plane],
  });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uM = { value: uM };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform mat4 uM;\nvarying float vLY;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLY = (uM * vec4(transformed, 1.0)).y;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vLY;')
      .replace(
        '#include <dithering_fragment>',
        `float lf = vLY * 260.0;
        float lw = fwidth(lf);
        float ld = abs(fract(lf) - 0.5) * 2.0;
        float ll = smoothstep(0.55, 1.0, ld) * clamp(1.0 - lw * 1.6, 0.0, 1.0);
        gl_FragColor.rgb *= 1.0 - 0.16 * ll;
        #include <dithering_fragment>`
      );
  };
  m.customProgramCacheKey = () => 'mycro-pla';
  return m;
}

/* ---------- texture della linea di scan ---------- */
function scanTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const g = c.getContext('2d');
  const h = g.createLinearGradient(0, 0, 256, 0);
  h.addColorStop(0, 'rgba(255,255,255,0)');
  h.addColorStop(0.2, 'rgba(255,255,255,1)');
  h.addColorStop(0.8, 'rgba(255,255,255,1)');
  h.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = h; g.fillRect(0, 0, 256, 64);
  g.globalCompositeOperation = 'destination-in';
  const v = g.createLinearGradient(0, 0, 0, 64);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(0.5, 'rgba(0,0,0,1)');
  v.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = v; g.fillRect(0, 0, 256, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default function MycroScene({ ctl, onUi }) {
  const finalGltf = useGLTF(publicUrl('/models/mycro.glb'));
  const partsGltf = useGLTF(publicUrl('/models/mycro-parts.glb'));
  const { gl, scene, camera } = useThree();

  const pivot = useRef();
  const spin = useRef();
  const scanLine = useRef();
  const scanGlow = useRef();

  /* ---- ambiente: RoomEnvironment, niente HDR da scaricare ---- */
  useEffect(() => {
    gl.localClippingEnabled = true;
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = LIGHTS.day.env;
    return () => { scene.environment = null; env.dispose(); pmrem.dispose(); };
  }, [gl, scene]);

  /* ---- costruzione delle quattro viste ---- */
  const views = useMemo(() => {
    const planes = {};
    PHASES.forEach((p) => { planes[p] = new THREE.Plane(new THREE.Vector3(0, 1, 0), NO_CLIP); });

    // Final: materiali originali, clonati per aggiungere il clipping.
    const final = finalGltf.scene.clone(true);
    final.traverse((o) => {
      if (!o.isMesh) return;
      o.material = o.material.clone();
      o.material.clippingPlanes = [planes.final];
      o.material.side = THREE.FrontSide;
    });

    // Retopo: base chiara + linee a quad sopra.
    const retopo = finalGltf.scene.clone(true);
    const baseMat = new THREE.MeshStandardMaterial({
      color: '#ece8df', roughness: 0.85, clippingPlanes: [planes.retopo],
      polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
    });
    const lineMat = new THREE.LineBasicMaterial({
      color: ACCENT, transparent: true, opacity: 0.75, clippingPlanes: [planes.retopo],
    });
    const meshes = [];
    retopo.traverse((o) => { if (o.isMesh) meshes.push(o); });
    meshes.forEach((o) => {
      o.material = baseMat;
      o.add(new THREE.LineSegments(quadWire(o.geometry), lineMat));
    });

    // Sculpt: clay grigio caldo, tipo ZBrush.
    const sculpt = partsGltf.scene.clone(true);
    const clay = new THREE.MeshStandardMaterial({
      color: '#aaa59c', roughness: 0.7, metalness: 0, clippingPlanes: [planes.sculpt],
    });
    sculpt.traverse((o) => { if (o.isMesh) o.material = clay; });

    // Print: verde PLA, pezzi separabili.
    const print = partsGltf.scene.clone(true);
    print.updateMatrixWorld(true);
    const rootInv = new THREE.Matrix4().copy(print.matrixWorld).invert();
    const parts = [];
    print.traverse((o) => {
      if (!o.isMesh) return;
      const uM = new THREE.Matrix4().multiplyMatrices(rootInv, o.matrixWorld);
      o.material = makePrintMaterial(planes.print, uM);
      let node = o;
      while (node.parent && node.parent !== print && !EXPLODE[node.name]) node = node.parent;
      const ex = EXPLODE[node.name] || EXPLODE[o.name];
      if (ex && !parts.find((p) => p.node === node)) {
        parts.push({ node, base: node.position.clone(), off: new THREE.Vector3(...ex.off), d: ex.d, parentInv: null });
      }
    });
    // Gli offset sono in spazio mondo: li riporto nello spazio del
    // genitore di ogni pezzo (che può avere una scala propria).
    parts.forEach((p) => {
      const inv = new THREE.Matrix4().copy(p.node.parent.matrixWorld).invert();
      inv.multiply(print.matrixWorld);
      const o0 = new THREE.Vector3(0, 0, 0).applyMatrix4(inv);
      p.off.applyMatrix4(inv).sub(o0);
    });

    const group = { sculpt, retopo, print, final };
    PHASES.forEach((p) => { group[p].visible = false; group[p].position.y = -0.5; });
    return { group, planes, parts };
  }, [finalGltf, partsGltf]);

  const scanTex = useMemo(scanTexture, []);

  useEffect(() => {
    ctl.current.spin = spin.current;
    ctl.current.loadedAt = performance.now();
    onUi({ loaded: true });
    return () => { ctl.current.spin = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const key = useRef();
  const rim = useRef();
  const ui = useRef({ zi: null, cu: null });

  useFrame((state, rawDt) => {
    const c = ctl.current;
    const dt = Math.min(0.05, Math.max(0, rawDt));
    const now = performance.now();
    const { group, planes, parts } = views;

    /* ---- zoom e inquadratura ---- */
    c.zoom += (c.zoomT - c.zoom) * (1 - Math.exp(-dt * 6));
    const fitT = c.phase === 'print' && !c.assembled ? 0.78 : 1;
    c.fit += (fitT - c.fit) * (1 - Math.exp(-dt * 4));

    /* ---- rotazione: inerzia, giri in coda, ritorno a casa ---- */
    if (!c.dragging && (Math.abs(c.vel.x) > 1e-4 || Math.abs(c.vel.y) > 1e-4)) {
      rotateBy(c, c.vel.y * dt, c.vel.x * dt);
      const d = Math.exp(-dt * 4.5);
      c.vel.x *= d; c.vel.y *= d;
    }
    if (Math.abs(c.queue) > 1e-4) {
      const step = c.queue * (1 - Math.exp(-dt * 4.2));
      c.queue -= step;
      rotateBy(c, step, 0);
    } else c.queue = 0;
    if (c.homing) {
      const k = 1 - Math.exp(-dt * 6);
      // yaw: la via più corta verso casa (anche dopo molti giri)
      c.yaw += wrapPi(HOME.yaw - c.yaw) * k;
      c.pitch += (HOME.pitch - c.pitch) * k;
      if (Math.abs(wrapPi(HOME.yaw - c.yaw)) < 1e-3 && Math.abs(HOME.pitch - c.pitch) < 1e-3) {
        c.yaw = HOME.yaw; c.pitch = HOME.pitch; c.homing = false;
      }
    }
    if (spin.current) spin.current.quaternion.setFromEuler(eTmp.set(c.pitch, c.yaw, 0, 'YXZ'));

    /* ---- scan tra le fasi ---- */
    let h = null;
    if (c.wipe) {
      const t = c.reduced ? 1 : Math.min(1, (now - c.wipe.t0) / WIPE_MS);
      h = TOP + (BOTTOM - TOP) * easeInOut(t);
      if (t >= 1) { c.wipe = null; h = null; }
    }
    PHASES.forEach((p) => {
      const pl = planes[p];
      if (h !== null && p === c.wipe.to) {
        group[p].visible = true; pl.normal.set(0, 1, 0); pl.constant = -h;
      } else if (h !== null && p === c.wipe.from) {
        group[p].visible = true; pl.normal.set(0, -1, 0); pl.constant = h;
      } else {
        group[p].visible = p === c.phase; pl.normal.set(0, 1, 0); pl.constant = NO_CLIP;
      }
    });
    const scanOn = h !== null ? Math.min(1, Math.sin(Math.PI * ((TOP - h) / (TOP - BOTTOM))) * 1.6) : 0;
    if (scanLine.current) {
      scanLine.current.visible = scanGlow.current.visible = scanOn > 0.01;
      scanLine.current.position.y = scanGlow.current.position.y = h ?? 0;
      scanLine.current.material.opacity = scanOn;
      scanGlow.current.material.opacity = scanOn * 0.35;
    }

    /* ---- vista esplosa ---- */
    const exT = c.phase === 'print' && !c.wipe && !c.assembled ? 1 : 0;
    const exRate = exT ? 1.1 : 2.2;
    c.ex = c.reduced ? exT : c.ex + Math.sign(exT - c.ex) * Math.min(Math.abs(exT - c.ex), dt * exRate);
    parts.forEach((p) => {
      const k = smooth((c.ex * 1.3 - p.d) / 1.0);
      p.node.position.copy(p.base).addScaledVector(p.off, k);
    });

    /* ---- intro: entra scalando, come gli uccelli di Feather Atlas ---- */
    if (pivot.current) {
      const ti = c.reduced ? 1 : Math.min(1, (now - (c.loadedAt || now)) / 900);
      const e = 1 - Math.pow(1 - ti, 3);
      pivot.current.scale.setScalar(Math.max(1e-4, outBack(ti) * (0.3 + 0.7 * e)));

      /* ---- vita in idle ---- */
      const idleOn = !c.reduced && !c.dragging && c.pts === 0 && now - c.lastInteract > 1800;
      c.idle = idleOn ? Math.min(1, c.idle + dt / 1.5) : Math.max(0, c.idle - dt / 0.35);
      const ie = c.idle * c.idle * (3 - 2 * c.idle);
      const ts = now / 1000;
      pivot.current.rotation.y = ie * Math.sin(ts * 0.55) * 0.18 + (1 - e) * 1.2;
      pivot.current.rotation.x = ie * Math.sin(ts * 0.9) * 0.03;
      pivot.current.position.y = c.reduced ? 0 : Math.sin(ts * 1.3) * 0.012;
    }

    /* ---- luci giorno / sera ---- */
    const L = c.dusk ? LIGHTS.dusk : LIGHTS.day;
    const a4 = 1 - Math.exp(-dt * 4);
    scene.environmentIntensity += (L.env - scene.environmentIntensity) * a4;
    if (key.current) {
      key.current.intensity += (L.key - key.current.intensity) * a4;
      key.current.color.lerp(L.keyCol, a4);
      rim.current.intensity += (L.rim - rim.current.intensity) * a4;
    }

    /* ---- camera ---- */
    const aspect = state.size.width / Math.max(1, state.size.height);
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const fitDist = (RADIUS / tan) / Math.min(1, aspect * 1.1);
    // Mycro sta un po' sopra il centro, per lasciare spazio a
    // barra dei giri e didascalia (come in Feather Atlas, 44%).
    const lift = -0.07 / c.zoom;
    const dist = fitDist / (c.zoom * c.fit);
    // scorrimento su/giù: solo da ingranditi, limitato al modello
    c.canPan = c.zoomT > 1.12;
    c.viewH = 2 * dist * tan;
    const panRange = Math.max(0, (c.phase === 'print' && !c.assembled ? 0.68 : 0.5) - c.viewH * 0.35);
    if (!c.canPan) c.panT = 0;
    c.panT = Math.max(-panRange - lift, Math.min(panRange - lift, c.panT));
    c.pan += (c.panT - c.pan) * (1 - Math.exp(-Math.min(0.25, rawDt) * 9));
    camera.position.set(0, lift + c.pan, dist);
    camera.lookAt(0, lift + c.pan, 0);

    /* ---- stato dei pulsanti (solo quando cambia) ---- */
    const zi = c.zoomT >= 1;
    const cu = c.zoomT > 2.2;
    if (zi !== ui.current.zi || cu !== ui.current.cu) {
      ui.current.zi = zi; ui.current.cu = cu;
      onUi({ zi, cu });
    }
  });

  return (
    <>
      <directionalLight ref={key} position={[2.5, 4, 5]} intensity={LIGHTS.day.key} color="#fff4e2" />
      <directionalLight ref={rim} position={[-4, 2, -3]} intensity={LIGHTS.day.rim} color="#bfd8ff" />

      <group ref={pivot}>
        <group ref={spin}>
          {PHASES.map((p) => (
            <primitive key={p} object={views.group[p]} />
          ))}
        </group>
      </group>

      {/* linea di scan: sta fuori dal gruppo che ruota, resta orizzontale */}
      <mesh ref={scanGlow} visible={false} renderOrder={10}>
        <planeGeometry args={[1.5, 0.12]} />
        <meshBasicMaterial map={scanTex} color={ACCENT} transparent depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh ref={scanLine} visible={false} renderOrder={11}>
        <planeGeometry args={[1.5, 0.006]} />
        <meshBasicMaterial map={scanTex} color="#7ff5df" transparent depthWrite={false} depthTest={false} toneMapped={false} />
      </mesh>
    </>
  );
}

useGLTF.preload(publicUrl('/models/mycro.glb'));
useGLTF.preload(publicUrl('/models/mycro-parts.glb'));
