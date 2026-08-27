import React, { useLayoutEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const furVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying float vShellT;
  varying vec3 vNormalW;
  varying vec3 vViewPosition;

  uniform float uShellT;
  uniform float uFurLength;
  uniform vec3 uGravity;
  uniform float uTime;
  uniform float uSwayAmp;
  uniform float uSwayFreq;

  uniform vec3 uMovementForce;
  uniform vec2 uMousePos;
  uniform float uAspect;

  #include <common>
  #include <skinning_pars_vertex>

  void main() {
    vUv = uv;
    vShellT = uShellT;

    vec3 frizz = vec3(
      sin(position.x * 50.0) * cos(position.y * 50.0),
      cos(position.x * 40.0) * sin(position.z * 40.0),
      sin(position.z * 60.0) * cos(position.y * 60.0)
    );

    vec3 growthDir = normalize(normal + frizz * 0.15);
    vec3 transformed = position + growthDir * ( uFurLength * uShellT );

    transformed += uGravity * ( uShellT * uShellT );
    transformed -= uMovementForce * pow(uShellT, 1.5);

    float swayPhase = dot( uv, vec2( 12.9898, 78.233 ) ) * 6.2831853;
    float sway = sin( uTime * uSwayFreq + swayPhase ) * uSwayAmp * ( uShellT * uShellT );
    vec3 windDir = normalize( vec3( 1.0, 0.15, 0.4 ) );
    transformed += windDir * sway;

    #include <beginnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <skinning_vertex>

    vNormalW = normalize( mat3( modelMatrix ) * objectNormal );

    vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
    vViewPosition = -mvPosition.xyz;

    vec4 clipPos = projectionMatrix * mvPosition;
    vec2 screenPos = clipPos.xy / clipPos.w;

    screenPos.x *= uAspect;
    vec2 mousePos = uMousePos;
    mousePos.x *= uAspect;

    float distToMouse = distance(screenPos, mousePos);
    float hoverStrength = smoothstep(0.35, 0.0, distToMouse);

    vec2 pushDir = normalize(screenPos - mousePos + 0.00001);

    mvPosition.x += pushDir.x * hoverStrength * 0.04 * uShellT;
    mvPosition.y += pushDir.y * hoverStrength * 0.01 * uShellT;
    mvPosition.z -= hoverStrength * 0.002 * uShellT;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const furFragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  varying float vShellT;
  varying vec3 vNormalW;
  varying vec3 vViewPosition;

  uniform sampler2D uMap;
  uniform bool uUseMap;
  uniform vec3 uBaseColor;
  uniform float uDensity;
  uniform float uThinning;
  uniform vec3 uLightDir;
  uniform float uCurliness;
  uniform float uOpacity;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    vec2 grid = vUv * uDensity;
    vec2 cellId = floor(grid);
    vec2 cellUv = fract(grid) - 0.5;

    float strandRand = hash21(cellId);

    vec2 jitter = vec2(
      hash21(cellId + 11.3) - 0.5,
      hash21(cellId + 47.7) - 0.5
    ) * 0.4;

    vec2 leanDir = vec2(
      hash21(cellId + 88.1) - 0.5,
      hash21(cellId + 22.4) - 0.5
    ) * 2.0;

    vec2 curlOffset = leanDir * pow(vShellT, 1.5) * uCurliness;
    float dist = length(cellUv - jitter - curlOffset);

    float radius = mix(0.7, 0.05, pow(vShellT, uThinning)) * mix(0.7, 1.2, strandRand);

    float alpha = smoothstep(radius, radius * 0.1, dist);

    float tipFade = 1.0 - pow(vShellT, 2.5);
    alpha *= tipFade;
    alpha *= 0.75;

    if (vShellT > 0.02 && alpha < 0.005) discard;

    vec3 texColor = uUseMap ? texture2D(uMap, vUv).rgb : uBaseColor;
    vec3 base = mix(texColor, uBaseColor, 0.2);

    float rootShade = mix(0.4, 1.0, vShellT);
    float ndl = clamp(dot(normalize(vNormalW), normalize(uLightDir)) * 0.5 + 0.5, 0.0, 1.0);

    vec3 viewDir = normalize(vViewPosition);
    float rim = 1.0 - max(dot(viewDir, normalize(vNormalW)), 0.0);
    rim = smoothstep(0.4, 1.0, rim);

    vec3 rimLight = base * rim * 1.5 * vShellT;

    vec3 color = base * rootShade * (0.4 + 0.6 * ndl);
    color += rimLight;

    gl_FragColor = vec4(color, alpha * uOpacity);
  }
`;

export function FurEffect({ targetMeshes, options = {} }) {
  const { size } = useThree();
  const materialsRef = useRef([]);

  const defaultOptions = {
    shellCount: 40,
    furLength: 0.75,
    density: 500,
    gravity: 0.0035,
    thinning: 2,
    lightDir: new THREE.Vector3(0.4, 1, 0.6),
    swayAmp: 0.0015,
    swayFreq: 1.6,
    curliness: 0.7,
  };

  const opts = { ...defaultOptions, ...options };

  useLayoutEffect(() => {
    if (!targetMeshes || targetMeshes.length === 0) return;

    const createdGroups = [];
    const shellMaterials = [];

    targetMeshes.forEach((mesh) => {
      if (!mesh || !mesh.geometry) return;

      const sourceMaterial = Array.isArray(mesh.material)
        ? mesh.material.find((m) => m && m.name === 'Fur') || mesh.material[0]
        : mesh.material;

      const map = sourceMaterial?.map ?? null;
      const baseColor = sourceMaterial?.color?.clone() ?? new THREE.Color(0xffffff);

      const furGroup = new THREE.Group();
      furGroup.name = 'ShaderFurGroup';

      const oldGroup = mesh.getObjectByName('ShaderFurGroup');
      if (oldGroup) mesh.remove(oldGroup);

      for (let i = 1; i <= opts.shellCount; i++) {
        const t = i / opts.shellCount;

        const material = new THREE.ShaderMaterial({
          vertexShader: furVertexShader,
          fragmentShader: furFragmentShader,
          uniforms: {
            uShellT: { value: t },
            uFurLength: { value: opts.furLength },
            uGravity: { value: new THREE.Vector3(0, -opts.gravity, 0) },
            uMap: { value: map },
            uUseMap: { value: !!map },
            uBaseColor: { value: baseColor },
            uDensity: { value: opts.density },
            uThinning: { value: opts.thinning },
            uLightDir: { value: opts.lightDir.clone().normalize() },
            uTime: { value: 0 },
            uSwayAmp: { value: opts.swayAmp },
            uSwayFreq: { value: opts.swayFreq },
            uCurliness: { value: opts.curliness },
            uMovementForce: { value: new THREE.Vector3(0, 0, 0) },
            uMousePos: { value: new THREE.Vector2(999.0, 999.0) },
            uAspect: { value: size.width / size.height },
            uOpacity: { value: 1.0 },
          },
          transparent: true,
          depthWrite: false,
          blending: THREE.NormalBlending,
          side: THREE.FrontSide,
        });

        shellMaterials.push(material);

        let shell;
        if (mesh.isSkinnedMesh) {
          shell = new THREE.SkinnedMesh(mesh.geometry, material);
          shell.bind(mesh.skeleton, mesh.bindMatrix);
        } else {
          shell = new THREE.Mesh(mesh.geometry, material);
        }

        shell.frustumCulled = false;
        furGroup.add(shell);
      }

      mesh.add(furGroup);
      createdGroups.push({ parent: mesh, group: furGroup });
    });

    materialsRef.current = shellMaterials;

    return () => {
      createdGroups.forEach(({ parent, group }) => {
        parent.remove(group);
      });
      materialsRef.current = [];
    };
  }, [targetMeshes]);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    const aspect = size.width / size.height;

    const mouseX = state.pointer.x;
    const mouseY = state.pointer.y;

    materialsRef.current.forEach((material) => {
      material.uniforms.uTime.value = elapsed;
      material.uniforms.uAspect.value = aspect;
      material.uniforms.uMousePos.value.set(mouseX, mouseY);
    });
  });

  return null;
}