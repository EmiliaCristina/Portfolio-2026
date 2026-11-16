import { Suspense, useEffect, useLayoutEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { publicUrl } from '../../utils/publicUrl';

/* Vista 3D di un pezzo: modello "clay" su un piano scuro, luce a faro
   calda dall'alto e un controluce freddo, come nella galleria. */

function Piece({ model }) {
  const { scene } = useGLTF(publicUrl(model.url));
  const { camera, size } = useThree();

  const obj = useMemo(() => {
    const o = scene.clone(true);
    const mat = new THREE.MeshStandardMaterial({
      color: model.color, roughness: model.rough, metalness: model.metal,
    });
    o.traverse((m) => {
      if (m.isMesh) { m.material = mat; m.castShadow = true; m.receiveShadow = true; }
    });
    // altezza 1, appoggiato a terra, centrato
    const b = new THREE.Box3().setFromObject(o);
    const s = b.getSize(new THREE.Vector3());
    o.scale.setScalar(1 / Math.max(s.x, s.y, s.z));
    const b2 = new THREE.Box3().setFromObject(o);
    const c = b2.getCenter(new THREE.Vector3());
    o.position.set(-c.x, -b2.min.y, -c.z);
    const g = new THREE.Group();
    g.add(o);
    g.rotation.y = model.ry || 0;
    return g;
  }, [scene, model]);

  const box = useMemo(() => new THREE.Box3().setFromObject(obj), [obj]);
  const dims = useMemo(() => box.getSize(new THREE.Vector3()), [box]);

  useLayoutEffect(() => {
    const vf = THREE.MathUtils.degToRad(camera.fov / 2);
    const aspect = size.width / size.height;
    const hf = Math.atan(Math.tan(vf) * aspect);
    const w = Math.max(dims.x, dims.z);
    const d = Math.max((dims.y * 0.5) / Math.tan(vf), (w * 0.5) / Math.tan(hf)) * 1.35 + Math.min(dims.x, dims.z) * 0.5;
    camera.position.set(0, dims.y * 0.5 + d * 0.12, d);
    camera.lookAt(0, dims.y * 0.42, 0);
    camera.updateProjectionMatrix();
  }, [camera, dims, size]);

  const h = dims.y;
  // pozza di luce del faro sul pavimento, sfuma nel buio
  const pool = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgba(120,96,64,0.55)');
    gr.addColorStop(0.45, 'rgba(70,56,38,0.25)');
    gr.addColorStop(1, 'rgba(12,11,9,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const span = Math.max(dims.x, dims.z);
  return (
    <>
      <primitive object={obj} />
      <mesh rotation-x={-Math.PI / 2} position-y={0.001}>
        <planeGeometry args={[span * 4 + 1, span * 4 + 1]} />
        <meshBasicMaterial map={pool} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.002} receiveShadow>
        <planeGeometry args={[span * 4 + 1, span * 4 + 1]} />
        <shadowMaterial opacity={0.55} transparent />
      </mesh>
      <spotLight
        position={[h * 0.35, h * 2.6, h * 0.9]}
        angle={0.42}
        penumbra={0.75}
        decay={0}
        intensity={7}
        color="#ffe2b8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-h * 1.2, h * 1.1, -h * 1.5]} intensity={0.8} color="#9db9e6" />
      <directionalLight position={[-h * 1.4, h * 0.6, h * 1.2]} intensity={0.55} color="#d8c3a2" />
      <hemisphereLight args={['#4a3e30', '#0a0806', 1.1]} />
      <OrbitControls
        makeDefault
        target={[0, h * 0.42, 0]}
        enablePan={false}
        minDistance={0.4}
        maxDistance={4}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2 - 0.04}
        autoRotate
        autoRotateSpeed={0.6}
        enableDamping
      />
    </>
  );
}

function Env() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    // ambiente tenue per i riflessi della pantera
    const room = new THREE.Scene();
    room.background = new THREE.Color('#2a241c');
    const tex = pm.fromScene(room, 0.04).texture;
    scene.environment = tex;
    scene.environmentIntensity = 0.5;
    return () => { tex.dispose(); pm.dispose(); };
  }, [gl, scene]);
  return null;
}

export default function JungleModel({ model }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: 28, near: 0.01, far: 50, position: [0, 0.5, 3] }}
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.setClearColor('#0c0b09', 1);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
      }}
    >
      <Env />
      <Suspense fallback={null}>
        <Piece model={model} />
      </Suspense>
    </Canvas>
  );
}
