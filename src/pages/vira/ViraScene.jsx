import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { publicUrl } from '../../utils/publicUrl';

/* ================================================================
   Scena del viewer di Vira. Quattro "viste" dello stesso personaggio:
   - concept -> foglio con lo sketch a matita
   - model   -> clay + wireframe a quad sul corpo
   - rig     -> mesh "fantasma" + scheletro con giunti
   - final   -> materiali finali (usata anche dalla fase Face)
   Le viste sono cloni con SkeletonUtils: condividono la geometria, ogni
   clone ha il suo scheletro e il suo mixer, tutti sincronizzati.
   Il cambio fase è lo stesso "scan" di Mycro (clipping plane).
   ================================================================ */

export const VIEW_OF = { concept: 'concept', model: 'model', rig: 'rig', face: 'final', final: 'final' };
const VIEWS = ['concept', 'model', 'rig', 'final'];
const ACCENT = new THREE.Color('#0f7e6f');
const WIPE_MS = 1300;
const TOP = 0.62;
const BOTTOM = -0.62;
const RADIUS = 0.56;
const NO_CLIP = 50;
const FADE = 0.35;

// Rotazione "a giradischi": yaw libero, inclinazione limitata, così il
// personaggio non può mai finire sottosopra.
export const HOME = { yaw: 0.32, pitch: 0.04 };
export const FACE_HOME = { yaw: 0.12, pitch: 0.02 };
export const PITCH_MAX = 0.42;
const eTmp = new THREE.Euler(0, 0, 0, 'YXZ');

export function rotateBy(c, yaw, pitch) {
  c.yaw += yaw;
  c.pitch = Math.max(-PITCH_MAX, Math.min(PITCH_MAX, c.pitch + pitch));
}
const wrapPi = (a) => Math.atan2(Math.sin(a), Math.cos(a));

const LIGHTS = {
  day: { env: 0.85, key: 1.8, keyCol: new THREE.Color('#fff2e2'), rim: 0.6 },
  dusk: { env: 0.22, key: 2.6, keyCol: new THREE.Color('#ffc98a'), rim: 2.2 },
};

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const outBack = (t) => { const u = t - 1; return 1 + 2.2 * u * u * u + 1.2 * u * u; };

const meshesOf = (root) => { const out = []; root.traverse((o) => { if (o.isMesh) out.push(o); }); return out; };
const matsOf = (m) => (Array.isArray(m.material) ? m.material : [m.material]);
const inNode = (o, prefix) => { for (let p = o; p; p = p.parent) if (p.name && p.name.startsWith(prefix)) return true; return false; };

/* ---------- clip "sul posto": blocco lo spostamento orizzontale dei fianchi ---------- */
function inPlace(clip) {
  const c = clip.clone();
  c.tracks.forEach((t) => {
    if (!/Hips\.position$/.test(t.name)) return;
    const v = t.values;
    const means = [0, 1, 2].map((i) => { let s = 0; for (let k = i; k < v.length; k += 3) s += Math.abs(v[k]); return s; });
    const up = means.indexOf(Math.max(...means));
    for (let k = 0; k < v.length; k += 3) {
      for (let i = 0; i < 3; i++) if (i !== up) v[k + i] = v[i];
    }
  });
  return c;
}

/* ---------- wireframe a quad che segue lo skinning ----------
   Una SkinnedMesh che condivide gli attributi del corpo e ha come indice
   triangoli degeneri (a, b, b) per ogni spigolo visibile: in modalità
   wireframe three disegna esattamente quegli spigoli, deformati dalle
   stesse ossa. Le diagonali dei quad (spigolo più lungo di entrambi i
   triangoli) vengono scartate. */
function quadWireMesh(src, material) {
  const g = src.geometry;
  const pos = g.attributes.position;
  const idx = g.index.array;
  const ids = new Map();
  const vid = new Uint32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    const k = `${Math.round(pos.getX(i) * 1e4)},${Math.round(pos.getY(i) * 1e4)},${Math.round(pos.getZ(i) * 1e4)}`;
    let v = ids.get(k);
    if (v === undefined) { v = ids.size; ids.set(k, v); }
    vid[i] = v;
  }
  const a = new THREE.Vector3(), b = new THREE.Vector3();
  const edges = new Map();
  for (let t = 0; t < idx.length; t += 3) {
    const tv = [idx[t], idx[t + 1], idx[t + 2]];
    let best = 0, bl = -1;
    for (let j = 0; j < 3; j++) {
      a.fromBufferAttribute(pos, tv[j]); b.fromBufferAttribute(pos, tv[(j + 1) % 3]);
      const l = a.distanceToSquared(b);
      if (l > bl) { bl = l; best = j; }
    }
    for (let j = 0; j < 3; j++) {
      const p = tv[j], q = tv[(j + 1) % 3];
      const ek = vid[p] < vid[q] ? `${vid[p]}_${vid[q]}` : `${vid[q]}_${vid[p]}`;
      let e = edges.get(ek);
      if (!e) { e = { p, q, n: 0, l: 0 }; edges.set(ek, e); }
      e.n++;
      if (j === best) e.l++;
    }
  }
  const out = [];
  edges.forEach((e) => { if (!(e.n === 2 && e.l === 2)) out.push(e.p, e.q, e.q); });
  const wg = new THREE.BufferGeometry();
  ['position', 'skinIndex', 'skinWeight'].forEach((k) => wg.setAttribute(k, g.attributes[k]));
  wg.setIndex(out);
  wg.boundingSphere = g.boundingSphere;
  const w = new THREE.SkinnedMesh(wg, material);
  w.bind(src.skeleton, src.bindMatrix);
  w.frustumCulled = false;
  w.renderOrder = 2;
  return w;
}

/* ---------- materiale clay che usa solo l'alpha di una texture (capelli) ---------- */
function clayAlpha(color, map, planes, extra = {}) {
  const m = new THREE.MeshStandardMaterial({
    color, roughness: 0.75, map, alphaTest: 0.35, side: THREE.DoubleSide, clippingPlanes: planes, ...extra,
  });
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace(
      '#include <map_fragment>',
      '#include <map_fragment>\n diffuseColor.rgb = diffuse;'
    );
  };
  m.customProgramCacheKey = () => 'vira-clay-alpha';
  return m;
}

/* ---------- occhi che seguono il puntatore ----------
   Le mesh degli occhi sono skinned: ruotarne l'oggetto non serve, quindi
   ruoto i vertici attorno al centro del bulbo prima dello skinning. */
function eyeRig(meshes) {
  const box = new THREE.Box3();
  meshes.forEach((m) => { m.geometry.computeBoundingBox(); box.union(m.geometry.boundingBox); });
  const center = box.getCenter(new THREE.Vector3());
  const rot = { value: new THREE.Matrix3() };
  meshes.forEach((m) => {
    m.material = matsOf(m).length > 1 ? matsOf(m).map((x) => x.clone()) : m.material.clone();
    matsOf(m).forEach((mat) => {
      const prev = mat.onBeforeCompile;
      mat.onBeforeCompile = (sh, r) => {
        prev?.(sh, r);
        sh.uniforms.uEyeRot = rot;
        sh.uniforms.uEyeC = { value: center };
        sh.vertexShader = sh.vertexShader
          .replace('#include <common>', '#include <common>\nuniform mat3 uEyeRot;\nuniform vec3 uEyeC;')
          .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nobjectNormal = uEyeRot * objectNormal;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed = uEyeRot * (transformed - uEyeC) + uEyeC;');
      };
      mat.customProgramCacheKey = () => `vira-eye-${mat.name}`;
    });
  });
  return rot;
}

function scanTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const g = c.getContext('2d');
  const h = g.createLinearGradient(0, 0, 256, 0);
  h.addColorStop(0, 'rgba(255,255,255,0)'); h.addColorStop(0.2, 'rgba(255,255,255,1)');
  h.addColorStop(0.8, 'rgba(255,255,255,1)'); h.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = h; g.fillRect(0, 0, 256, 64);
  g.globalCompositeOperation = 'destination-in';
  const v = g.createLinearGradient(0, 0, 0, 64);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(0.5, 'rgba(0,0,0,1)'); v.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = v; g.fillRect(0, 0, 256, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default function ViraScene({ ctl, onUi }) {
  const gltf = useGLTF(publicUrl('/models/vira.glb'));
  const sketch = useTexture(publicUrl('/images/vira/vira-sketch.webp'));
  const { gl, scene, camera } = useThree();

  const pivot = useRef();
  const spin = useRef();
  const scanLine = useRef();
  const scanGlow = useRef();
  const key = useRef();
  const rim = useRef();
  const ui = useRef({ zi: null, cu: null });

  useEffect(() => {
    gl.localClippingEnabled = true;
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = LIGHTS.day.env;
    return () => { scene.environment = null; env.dispose(); pmrem.dispose(); };
  }, [gl, scene]);

  const built = useMemo(() => {
    const planes = {};
    VIEWS.forEach((v) => { planes[v] = new THREE.Plane(new THREE.Vector3(0, 1, 0), NO_CLIP); });
    const clips = gltf.animations.map(inPlace);

    // normalizzazione: altezza 1, centrata sull'origine
    const probe = gltf.scene;
    probe.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(probe, true);
    const size = box.getSize(new THREE.Vector3());
    const s = 1 / size.y;
    const ctr = box.getCenter(new THREE.Vector3());

    const wrap = (obj) => {
      const g = new THREE.Group();
      obj.scale.setScalar(s);
      obj.position.set(-ctr.x * s, -ctr.y * s, -ctr.z * s);
      g.add(obj);
      g.visible = false;
      return g;
    };

    const views = {};
    const mixers = [];
    const actions = {};

    const character = (name) => {
      const root = skeletonClone(gltf.scene);
      const mixer = new THREE.AnimationMixer(root);
      mixers.push(mixer);
      actions[name] = {};
      clips.forEach((cl) => { actions[name][cl.name] = mixer.clipAction(cl); });
      return root;
    };

    // ---- final (anche per la fase Face)
    const final = character('final');
    const morphMeshes = [];
    meshesOf(final).forEach((m) => {
      m.frustumCulled = false;
      m.material = Array.isArray(m.material) ? m.material.map((x) => x.clone()) : m.material.clone();
      matsOf(m).forEach((mat) => {
        mat.clippingPlanes = [planes.final];
        if (mat.name === 'hair') {
          mat.transparent = false; mat.alphaTest = 0.35; mat.depthWrite = true; mat.side = THREE.DoubleSide;
          mat.envMapIntensity = 0.45;   // meno riflesso: capelli più naturali
        }
        if (mat.name === 'lashes') { mat.depthWrite = false; }
      });
      if (m.morphTargetDictionary) morphMeshes.push(m);
    });
    const eyes = {
      L: eyeRig(meshesOf(final).filter((m) => inNode(m, 'EyeSX'))),
      R: eyeRig(meshesOf(final).filter((m) => inNode(m, 'EyeDX'))),
    };
    meshesOf(final).filter((m) => inNode(m, 'Eye') && !inNode(m, 'Eyelash')).forEach((m) => {
      matsOf(m).forEach((mat) => { mat.clippingPlanes = [planes.final]; });
    });
    views.final = wrap(final);

    // ---- model: clay + wireframe a quad
    const model = character('model');
    const clay = new THREE.MeshStandardMaterial({ color: '#b6afa5', roughness: 0.72, clippingPlanes: [planes.model] });
    const clayEye = new THREE.MeshStandardMaterial({ color: '#4a4846', roughness: 0.3, clippingPlanes: [planes.model] });
    const wireMat = new THREE.MeshBasicMaterial({
      color: ACCENT, wireframe: true, transparent: true, opacity: 0.55, clippingPlanes: [planes.model],
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
    });
    let hairMap = null;
    meshesOf(final).forEach((m) => matsOf(m).forEach((mat) => { if (mat.name === 'hair') hairMap = mat.map; }));
    const hairClay = clayAlpha('#b6afa5', hairMap, [planes.model]);
    const hidden = new THREE.MeshBasicMaterial({ visible: false });
    meshesOf(model).forEach((m) => {
      m.frustumCulled = false;
      if (inNode(m, 'Eyelash')) { m.visible = false; return; }          // card con alpha: nel clay disturbano
      if (inNode(m, 'Hairs')) { m.material = hairClay; return; }
      if (inNode(m, 'Eye')) { m.material = matsOf(m).some((x) => x.transparent) ? hidden : clayEye; return; }
      m.material = clay;
    });
    // il corpo è diviso per materiale (una mesh per tile): wireframe su ognuna
    const bodyParts = meshesOf(model).filter((m) => inNode(m, 'Body') && m.isSkinnedMesh);
    const wires = bodyParts.map((m) => { const w = quadWireMesh(m, wireMat); m.parent.add(w); return w; });
    views.model = wrap(model);

    // ---- rig: fantasma + scheletro
    const rig = character('rig');
    const ghost = new THREE.MeshStandardMaterial({
      color: '#c9d6d3', roughness: 0.6, transparent: true, opacity: 0.2, depthWrite: false, clippingPlanes: [planes.rig],
    });
    const ghostHair = clayAlpha('#c9d6d3', hairMap, [planes.rig], { transparent: true, opacity: 0.16, depthWrite: false, alphaTest: 0.4 });
    meshesOf(rig).forEach((m) => {
      m.frustumCulled = false;
      if (inNode(m, 'Eyelash')) { m.visible = false; return; }
      m.material = inNode(m, 'Hairs') ? ghostHair : ghost;
    });
    const bones = [];
    rig.traverse((o) => { if (o.isBone) bones.push(o); });
    const boneLines = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(bones.length * 6), 3)),
      new THREE.LineBasicMaterial({ color: ACCENT, depthTest: false, transparent: true, clippingPlanes: [planes.rig] })
    );
    boneLines.renderOrder = 5;
    boneLines.frustumCulled = false;
    const joints = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.0055, 10, 8),
      new THREE.MeshBasicMaterial({ color: '#e8fffa', depthTest: false, transparent: true, clippingPlanes: [planes.rig] }),
      bones.length
    );
    joints.renderOrder = 6;
    joints.frustumCulled = false;
    views.rig = wrap(rig);

    // ---- concept: foglio con lo sketch
    const concept = new THREE.Group();
    const img = sketch.image;
    const aspect = img ? img.width / img.height : 0.57;
    const H = 1.04, W = H * aspect;
    sketch.colorSpace = THREE.SRGBColorSpace;
    const front = new THREE.Mesh(
      new THREE.PlaneGeometry(W, H),
      new THREE.MeshStandardMaterial({ map: sketch, roughness: 0.95, clippingPlanes: [planes.concept] })
    );
    const back = new THREE.Mesh(
      new THREE.PlaneGeometry(W, H),
      new THREE.MeshStandardMaterial({ color: '#f1eee7', roughness: 0.95, clippingPlanes: [planes.concept] })
    );
    back.rotation.y = Math.PI;
    back.position.z = -0.001;
    concept.add(front, back);
    concept.visible = false;
    views.concept = concept;

    const head = final.getObjectByName('mixamorigHead');
    return { planes, views, mixers, actions, morphMeshes, eyes, wires, bones, boneLines, joints, head };
  }, [gltf, sketch]);

  const scanTex = useMemo(scanTexture, []);
  const tmp = useMemo(() => ({ v: new THREE.Vector3(), w: new THREE.Vector3(), m: new THREE.Matrix4(), head: new THREE.Vector3(), tgt: new THREE.Vector3(), q: new THREE.Quaternion(), e: new THREE.Euler(), m4: new THREE.Matrix4() }), []);

  /* ---- avvio: clip iniziale, registrazione nel controller ---- */
  useEffect(() => {
    const c = ctl.current;
    c.spin = spin.current;
    c.loadedAt = performance.now();
    c.playClip = (id) => {
      if (c.clip === id) return;
      const prev = c.clip;
      Object.values(built.actions).forEach((acts) => {
        const next = acts[id];
        if (!next) return;
        next.reset().setEffectiveWeight(1).fadeIn(prev ? FADE : 0).play();
        if (prev && acts[prev]) acts[prev].fadeOut(FADE);
      });
      c.clip = id;
    };
    c.playClip('idle');
    onUi({ loaded: true });
    return () => { c.spin = null; c.playClip = null; built.mixers.forEach((m) => m.stopAllAction()); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((state, rawDt) => {
    const c = ctl.current;
    const dt = Math.min(0.05, Math.max(0, rawDt));
    const now = performance.now();
    const { planes, views, mixers, morphMeshes, eyes, wires, bones, boneLines, joints, head } = built;
    const view = VIEW_OF[c.phase];

    /* ---- animazione: tutti i mixer avanzano insieme ---- */
    mixers.forEach((m) => m.update(c.reduced && c.phase !== 'rig' ? 0 : dt));

    /* ---- zoom, inquadratura, focus sul viso ---- */
    c.zoom += (c.zoomT - c.zoom) * (1 - Math.exp(-dt * 6));
    c.canPan = c.zoomT > 1.12 || c.phase === 'face';
    const focusT = c.phase === 'face' ? 1 : 0;
    // tempo reale (non limitato): su dispositivi lenti il viso arriva comunque in ~1 s
    c.focus += (focusT - c.focus) * (1 - Math.exp(-Math.min(0.25, rawDt) * 3.2));

    /* ---- rotazione ---- */
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
      const h = c.home || HOME;
      const k = 1 - Math.exp(-dt * 5);
      // yaw: la via più corta verso casa (anche dopo molti giri)
      c.yaw += wrapPi(h.yaw - c.yaw) * k;
      c.pitch += (h.pitch - c.pitch) * k;
      if (Math.abs(wrapPi(h.yaw - c.yaw)) < 1e-3 && Math.abs(h.pitch - c.pitch) < 1e-3) {
        c.yaw = h.yaw; c.pitch = h.pitch; c.homing = false;
      }
    }
    if (spin.current) spin.current.quaternion.setFromEuler(eTmp.set(c.pitch, c.yaw, 0, 'YXZ'));

    /* ---- scan tra le viste ---- */
    let h = null;
    if (c.wipe) {
      const t = c.reduced ? 1 : Math.min(1, (now - c.wipe.t0) / WIPE_MS);
      h = TOP + (BOTTOM - TOP) * easeInOut(t);
      if (t >= 1) { c.wipe = null; h = null; }
    }
    VIEWS.forEach((v) => {
      const pl = planes[v];
      if (h !== null && v === c.wipe.to) {
        views[v].visible = true; pl.normal.set(0, 1, 0); pl.constant = -h;
      } else if (h !== null && v === c.wipe.from) {
        views[v].visible = true; pl.normal.set(0, -1, 0); pl.constant = h;
      } else {
        views[v].visible = v === view; pl.normal.set(0, 1, 0); pl.constant = NO_CLIP;
      }
    });
    const scanOn = h !== null ? Math.min(1, Math.sin(Math.PI * ((TOP - h) / (TOP - BOTTOM))) * 1.6) : 0;
    if (scanLine.current) {
      scanLine.current.visible = scanGlow.current.visible = scanOn > 0.01;
      scanLine.current.position.y = scanGlow.current.position.y = h ?? 0;
      scanLine.current.material.opacity = scanOn;
      scanGlow.current.material.opacity = scanOn * 0.35;
    }

    /* ---- wireframe on/off ---- */
    wires.forEach((w) => { w.visible = c.wire; });

    /* ---- scheletro: linee osso -> genitore e giunti ---- */
    if (views.rig.visible) {
      const pos = boneLines.geometry.attributes.position;
      bones.forEach((b, i) => {
        b.getWorldPosition(tmp.v);
        (b.parent && b.parent.isBone ? b.parent.getWorldPosition(tmp.w) : tmp.w.copy(tmp.v));
        pos.setXYZ(i * 2, tmp.v.x, tmp.v.y, tmp.v.z);
        pos.setXYZ(i * 2 + 1, tmp.w.x, tmp.w.y, tmp.w.z);
        tmp.m.makeTranslation(tmp.v.x, tmp.v.y, tmp.v.z);
        joints.setMatrixAt(i, tmp.m);
      });
      pos.needsUpdate = true;
      joints.instanceMatrix.needsUpdate = true;
      boneLines.visible = joints.visible = true;
    } else {
      boneLines.visible = joints.visible = false;
    }

    /* ---- espressioni: interpolazione + blink spontaneo ---- */
    const a6 = 1 - Math.exp(-dt * 9);
    Object.keys(c.morphT).forEach((k) => { c.morph[k] = (c.morph[k] || 0) + ((c.morphT[k] || 0) - (c.morph[k] || 0)) * a6; });
    if (!c.reduced && (c.phase === 'face' || c.phase === 'final')) {
      if (now > c.nextBlink) { c.blinkT0 = now; c.nextBlink = now + 2600 + Math.random() * 3400; }
    }
    const bt = (now - (c.blinkT0 || -1e9)) / 170;
    const blink = bt >= 0 && bt < 2 ? Math.sin((bt / 2) * Math.PI) : 0;
    morphMeshes.forEach((m) => {
      const dict = m.morphTargetDictionary;
      const inf = m.morphTargetInfluences;
      for (const k in dict) {
        let v = c.morph[k] || 0;
        if (k === 'blink_L' || k === 'blink_R') v = Math.max(v, blink);
        inf[dict[k]] = v;
      }
    });

    /* ---- sguardo ---- */
    const lookOn = c.phase === 'face' || c.phase === 'final' ? 1 : 0;
    c.lookS.x += ((c.look.x * lookOn) - c.lookS.x) * (1 - Math.exp(-dt * 8));
    c.lookS.y += ((c.look.y * lookOn) - c.lookS.y) * (1 - Math.exp(-dt * 8));
    tmp.e.set(-c.lookS.y * 0.28, c.lookS.x * 0.42, 0, 'YXZ');
    tmp.m4.makeRotationFromEuler(tmp.e);
    eyes.L.value.setFromMatrix4(tmp.m4);
    eyes.R.value.setFromMatrix4(tmp.m4);

    /* ---- intro ---- */
    if (pivot.current) {
      const ti = c.reduced ? 1 : Math.min(1, (now - (c.loadedAt || now)) / 900);
      const e = 1 - Math.pow(1 - ti, 3);
      pivot.current.scale.setScalar(Math.max(1e-4, outBack(ti) * (0.3 + 0.7 * e)));
      pivot.current.rotation.y = (1 - e) * 1.2;
    }

    /* ---- luci ---- */
    const L = c.dusk ? LIGHTS.dusk : LIGHTS.day;
    const a4 = 1 - Math.exp(-dt * 4);
    scene.environmentIntensity += (L.env - scene.environmentIntensity) * a4;
    if (key.current) {
      key.current.intensity += (L.key - key.current.intensity) * a4;
      key.current.color.lerp(L.keyCol, a4);
      rim.current.intensity += (L.rim - rim.current.intensity) * a4;
    }

    /* ---- camera: corpo intero oppure viso ---- */
    const aspect = state.size.width / Math.max(1, state.size.height);
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const fitDist = (RADIUS / tan) / Math.min(1, aspect * 1.25);
    if (head) head.getWorldPosition(tmp.head); else tmp.head.set(0, 0.42, 0);
    // l'osso Head di Mixamo è alla base della testa: il viso sta ~6% più su
    tmp.tgt.set(0, -0.02 / c.zoom, 0).lerp(tmp.v.set(tmp.head.x, tmp.head.y + 0.062, tmp.head.z), c.focus);
    const dist = fitDist / (c.zoom * (1 + c.focus * 4.2));
    // scorrimento su/giù: possibile solo da ingranditi, limitato al personaggio
    c.viewH = 2 * dist * tan;
    const panRange = Math.max(0, 0.5 - c.viewH * 0.35);
    if (!c.canPan) c.panT = 0;
    c.panT = Math.max(-panRange - tmp.tgt.y, Math.min(panRange - tmp.tgt.y, c.panT));
    c.pan += (c.panT - c.pan) * (1 - Math.exp(-Math.min(0.25, rawDt) * 9));
    tmp.tgt.y += c.pan;
    camera.position.set(tmp.tgt.x, tmp.tgt.y, tmp.tgt.z + dist);
    camera.lookAt(tmp.tgt);

    const zi = c.zoomT >= 1;
    const cu = c.phase === 'face';
    if (zi !== ui.current.zi || cu !== ui.current.cu) {
      ui.current.zi = zi; ui.current.cu = cu;
      onUi({ zi, cu });
    }
  });

  return (
    <>
      <directionalLight ref={key} position={[2.5, 4, 5]} intensity={LIGHTS.day.key} color="#fff2e2" />
      <directionalLight ref={rim} position={[-4, 2, -3]} intensity={LIGHTS.day.rim} color="#bfd8ff" />
      <group ref={pivot}>
        <group ref={spin}>
          {VIEWS.map((v) => <primitive key={v} object={built.views[v]} />)}
        </group>
      </group>
      <primitive object={built.boneLines} />
      <primitive object={built.joints} />
      <mesh ref={scanGlow} visible={false} renderOrder={10}>
        <planeGeometry args={[1.2, 0.1]} />
        <meshBasicMaterial map={scanTex} color={ACCENT} transparent depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh ref={scanLine} visible={false} renderOrder={11}>
        <planeGeometry args={[1.2, 0.005]} />
        <meshBasicMaterial map={scanTex} color="#7ff5df" transparent depthWrite={false} depthTest={false} toneMapped={false} />
      </mesh>
    </>
  );
}

useGLTF.preload(publicUrl('/models/vira.glb'));
