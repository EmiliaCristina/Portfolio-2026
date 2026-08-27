import React, { useRef, useEffect, useState } from 'react';
import { useGLTF, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDialogueStore } from '../DialogueEngine';
import { FurEffect } from './FurMaterial';
import { ScreenTexture } from './ScreenTexture';
import { publicUrl } from '../utils/publicUrl';

export function EmiModel(props) {
  const { scene, nodes } = useGLTF(publicUrl('/models/Emy.glb'));
  const start = useDialogueStore((s) => s.start);
  const hasStarted = useDialogueStore((s) => s.hasStarted);
  const selectedOption = useDialogueStore((s) => s.selectedOption);
  const lastChoiceTime = useDialogueStore((s) => s.lastChoiceTime);

  const mousePos = useRef({ x: 0, y: 0 });
  const headTargetRef = useRef();
  
  const [furMeshes, setFurMeshes] = useState([]);
  const [screenMaterial, setScreenMaterial] = useState(null);
  const [expression, setExpression] = useState('off');

  useEffect(() => {
    const foundMeshes = [];
    
    scene.traverse((child) => {
      if (child.isMesh && child.material?.name === 'Screen') {
        setScreenMaterial(child.material);
      }

      if (child.isMesh) {
        if (Array.isArray(child.material)) {
          if (child.material.some((m) => m && m.name === 'Fur')) {
            foundMeshes.push(child);
          }
        } else if (child.material?.name === 'Fur') {
          foundMeshes.push(child);
        }
      }
    });

    setFurMeshes(foundMeshes);
  }, [scene]);

  useEffect(() => {
    if (hasStarted) {
      setExpression('on');
    } else {
      setExpression('off');
    }
  }, [hasStarted]);

  useEffect(() => {
    if (selectedOption) {
      setExpression('happy');
      const timer = setTimeout(() => {
        setExpression('on');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [selectedOption]);

  useEffect(() => {
    if (lastChoiceTime > 0) {
      setExpression('happy');
      const timer = setTimeout(() => {
        setExpression('on');
      }, 2000); 

      return () => clearTimeout(timer);
    }
  }, [lastChoiceTime]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      mousePos.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useFrame((state) => {
    const head = nodes.HeadRotation;
    const earLeft = nodes.EarL; 
    const earRight = nodes.EarR;
    const time = state.clock.elapsedTime;
    
    if (head) {
      const targetX = -mousePos.current.y * 0.35; 
      const targetY = mousePos.current.x * 0.5;

      head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, targetX, 0.1);
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, targetY, 0.1);

      if (headTargetRef.current && !hasStarted) {
        headTargetRef.current.position.copy(head.position);
        headTargetRef.current.rotation.copy(head.rotation);
      }
    }

    if (earLeft && earRight) {
      const twitchL = Math.sin(time * 1.5) * 0.12;
      const twitchR = Math.sin(time * 1.8 + 1.0) * 0.12;

      earLeft.rotation.x = THREE.MathUtils.lerp(earLeft.rotation.x, twitchL, 0.05);
      earRight.rotation.x = THREE.MathUtils.lerp(earRight.rotation.x, twitchR, 0.05);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (e.object.material?.name === 'Screen') {
      start();
    }
  };

  return (
    <group {...props}>
      <ScreenTexture 
        expression={expression} 
        screenMaterial={screenMaterial} 
      />

      <primitive
        object={scene}
        onClick={handleClick}
        onPointerOver={(e) => {
          if (e.object.material?.name === 'Screen') {
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      />

      {furMeshes.length > 0 && (
        <FurEffect 
          targetMeshes={furMeshes} 
          options={{
            shellCount: 40,
            furLength: 0.1,
            density: 500,
            curliness: 0.8,
            thinning: 0.6,
          }}
        />
      )}

      {!hasStarted && (
        <group ref={headTargetRef}>
          <Html
            position={[0, 0.09, 0]} 
            transform
            center
            distanceFactor={0.8}
            zIndexRange={[100, 0]}
          >
            <div 
              className="c-emi_hint_3d" 
              onClick={() => start()}
            >
              [CLICK] TO START
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}

useGLTF.preload(publicUrl('/models/Emy.glb'));
