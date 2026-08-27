import React from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { publicUrl } from '../utils/publicUrl';

export function BackgroundLogo(props) {
  const texture = useTexture(publicUrl('/Asset 4.png'));

  return (
    <mesh
      position={[0, 0, -2]}
      scale={[3.5, 3.5, 1]}
      {...props}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent={true}
        opacity={1}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
