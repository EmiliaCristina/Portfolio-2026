import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { EmiModel } from './components/EmiModel';
import { BackgroundLogo } from './components/BackgroundLogo'; // <-- Aggiunto import
import Overlay from './components/Overlay';
import HomeModal from './components/HomeModal';
import './emi.css';

function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[3, 4, 5]} intensity={0.5} />
      <directionalLight position={[-4, 2, -3]} intensity={0.3} color="#8fa8ff" />

      {/* 
        Logo posizionato dietro Emy.
      */}
    
<BackgroundLogo position={[0, -0.6, -2.2]} scale={[1.9, 1.9, 1]} />

      <EmiModel position={[0, -1.3, -1.5]} />

      <ContactShadows position={[0, -1.1, 0]} opacity={0.35} blur={2.4} far={2} />
      <Environment preset="studio" environmentIntensity={0.2} />
    </>
  );
}

export default function EmiExperience() {
  return (
    <div className="emi-root">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.3, 1.2], fov: 32 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      <Overlay />
      <HomeModal />
    </div>
  );
}
