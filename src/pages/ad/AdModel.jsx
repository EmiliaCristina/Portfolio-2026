import { Suspense, useLayoutEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { publicUrl } from '../../utils/publicUrl';

/* Don Tomás in clay: gira da solo, si ruota col mouse.
   I colori (clay caldo + dettagli rossi/arancio) sono già nel modello. */

function Figure({ url }) {
  const { scene } = useGLTF(publicUrl(url));
  const { camera, size } = useThree();

  const obj = useMemo(() => {
    const o = scene.clone(true);
    o.traverse((m) => {
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
        if (m.material) m.material.side = THREE.DoubleSide;
      }
    });
    const b = new THREE.Box3().setFromObject(o);
    const s = b.getSize(new THREE.Vector3());
    o.scale.setScalar(1 / s.y);
    const b2 = new THREE.Box3().setFromObject(o);
    const c = b2.getCenter(new THREE.Vector3());
    o.position.set(-c.x, -b2.min.y, -c.z);
    const g = new THREE.Group();
    g.add(o);
    return g;
  }, [scene]);

  useLayoutEffect(() => {
    const vf = THREE.MathUtils.degToRad(camera.fov / 2);
    const aspect = size.width / size.height;
    const d = Math.max(0.5 / Math.tan(vf), 0.35 / (Math.tan(vf) * aspect)) * 1.42;
    camera.position.set(0, 0.4, d);
    camera.lookAt(0, 0.5, 0);
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return (
    <>
      <primitive object={obj} />
      <mesh rotation-x={-Math.PI / 2} position-y={0.001} receiveShadow>
        <planeGeometry args={[4, 4]} />
        <shadowMaterial opacity={0.28} transparent />
      </mesh>
      <directionalLight
        position={[-1.2, 2.4, 1.6]}
        intensity={2.4}
        color="#fff1dc"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-1}
        shadow-camera-right={1}
        shadow-camera-top={1.5}
        shadow-camera-bottom={-0.5}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[1.2, 1.4, -1.6]} intensity={2.2} color="#ff9a3c" />
      <hemisphereLight args={["#fff4e0", "#c98a2a", 1.5]} />
      <OrbitControls
        makeDefault
        target={[0, 0.5, 0]}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={0.9}
        maxPolarAngle={Math.PI / 2 - 0.05}
        autoRotate
        autoRotateSpeed={1.4}
        enableDamping
      />
    </>
  );
}

export default function AdModel({ url }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: 30, near: 0.01, far: 50, position: [0, 0.5, 3] }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.setClearColor('#000000', 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
      }}
    >
      <Suspense fallback={null}>
        <Figure url={url} />
      </Suspense>
    </Canvas>
  );
}
