import React from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { publicUrl } from '../utils/publicUrl';

export function BackgroundLogo(props) {
  // Carica l'immagine dalla cartella public/
  const texture = useTexture(publicUrl('/Asset 4.png'));

  return (
    <mesh
      position={[0, 0, -2]} // Posizionato dietro al modello 3D
      scale={[3.5, 3.5, 1]}  // Dimensione del logo
      {...props}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent={true}
        opacity={1} // Regola l'opacità (es. 0.15 watermark, 0.8 visibile, 1.0 pieno)
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
