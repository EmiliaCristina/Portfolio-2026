import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import glitch1 from '../assets/glitch1.jpg';
import glitch2 from '../assets/glitch2.png';
import artSketch from '../assets/art_sketch.jpg';

// Import ES veri (non stringhe): questi file vivono in src/assets/, non in
// public/assets/, quindi devono passare dal bundler per avere l'URL corretto
// sia in locale sia sotto il "base" path di GitHub Pages.
const IMAGE_URLS = [glitch1, glitch2, artSketch];

export function ScreenTexture({ expression = 'off', screenMaterial }) {
  const canvasRef = useRef(document.createElement('canvas'));
  const textureRef = useRef();
  const loadedImagesRef = useRef([]);

  // Pre-caricamento sicuro in background senza alterare lo stato React
  useEffect(() => {
    loadedImagesRef.current = [];
    IMAGE_URLS.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loadedImagesRef.current.push(img);
      };
      img.onerror = () => {
        console.error("Impossibile caricare l'immagine da:", url);
      };
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!textureRef.current) {
      const texture = new THREE.CanvasTexture(canvas);
      texture.center.set(0.5, 0.5);
      texture.rotation = Math.PI / 2;
      texture.colorSpace = THREE.SRGBColorSpace;
      textureRef.current = texture;
    }

    const drawBaseFace = () => {
      ctx.fillStyle = expression === 'off' ? '#040406' : '#0a0d18';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = 36;
      ctx.lineCap = 'round';

      const drawX = (x, y, size) => {
        ctx.beginPath();
        ctx.moveTo(x - size, y - size);
        ctx.lineTo(x + size, y + size);
        ctx.moveTo(x + size, y - size);
        ctx.lineTo(x - size, y + size);
        ctx.stroke();
      };

      const drawCircle = (x, y, radius) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
      };

      const drawHappy = (x, y, radius) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, Math.PI, 0, false);
        ctx.stroke();
      };

      if (expression === 'off') {
        drawX(160, 256, 50);
        drawX(352, 256, 50);
      } else if (expression === 'happy') {
        drawHappy(160, 260, 55);
        drawHappy(352, 260, 55);
      } else {
        drawCircle(160, 256, 55);
        drawCircle(352, 256, 55);
      }
    };

    const drawScanlines = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      for (let i = 0; i < canvas.height; i += 4) {
        ctx.fillRect(0, i, canvas.width, 2);
      }
    };

    let animId;
    let isGlitching = false;
    let glitchFramesLeft = 0;
    let currentRandomImage = null;
    let nextGlitchTime = Date.now() + 2000; // Primo glitch rapido di prova

    const render = () => {
      const now = Date.now();

      // Trigger Glitch
      if (!isGlitching && now > nextGlitchTime) {
        isGlitching = true;
        glitchFramesLeft = Math.floor(Math.random() * 20) + 15; // Durata visibile

        const available = loadedImagesRef.current;
        if (available.length > 0 && Math.random() > 0.2) {
          const randomIndex = Math.floor(Math.random() * available.length);
          currentRandomImage = available[randomIndex];
        } else {
          currentRandomImage = null;
        }

        nextGlitchTime = now + Math.random() * 3000 + 2000;
      }

      // 1. Disegna Immagine o Faccia base
      if (isGlitching && currentRandomImage) {
        ctx.drawImage(currentRandomImage, 0, 0, canvas.width, canvas.height);
      } else {
        drawBaseFace();
      }

      // 2. Effetto Glitch (Slices)
      if (isGlitching && glitchFramesLeft > 0) {
        glitchFramesLeft--;

        const numSlices = Math.floor(Math.random() * 4) + 2;
        for (let i = 0; i < numSlices; i++) {
          const sliceY = Math.floor(Math.random() * canvas.height);
          const sliceH = Math.floor(Math.random() * 30) + 10;
          const offsetX = (Math.random() - 0.5) * 50;

          try {
            const slice = ctx.getImageData(0, sliceY, canvas.width, sliceH);
            ctx.putImageData(slice, offsetX, sliceY);
          } catch (e) {
            // Ignora errori di coordinate fuori limite
          }
        }

        if (screenMaterial) {
          screenMaterial.emissiveIntensity = Math.random() > 0.5 ? 2.0 : 0.4;
        }

        if (glitchFramesLeft <= 0) {
          isGlitching = false;
          currentRandomImage = null;
          if (screenMaterial) screenMaterial.emissiveIntensity = 1.0;
        }
      } else {
        if (screenMaterial) screenMaterial.emissiveIntensity = 1.0;
      }

      // 3. Scanlines CRT
      drawScanlines();

      // 4. Aggiorna la texture in Three.js
      textureRef.current.needsUpdate = true;

      animId = requestAnimationFrame(render);
    };

    render();

    if (screenMaterial) {
      screenMaterial.color = new THREE.Color('#ffffff');
      screenMaterial.map = textureRef.current;
      screenMaterial.emissive = new THREE.Color('#ffffff');
      screenMaterial.emissiveMap = textureRef.current;
      screenMaterial.emissiveIntensity = 1.0;
      screenMaterial.needsUpdate = true;
    }

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [expression, screenMaterial]);

  return null;
}
