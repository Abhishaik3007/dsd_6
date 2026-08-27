import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useHub } from '../../context/HubContext';

export const ThreeBackgroundCanvas = () => {
  const containerRef = useRef(null);
  const { themeMode } = useHub();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isDark = themeMode === 'dark';
    const bgHex = isDark ? 0x090d16 : 0xf0f4fd;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(bgHex, 0.012);

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 24);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDark ? 1.1 : 1.0;
    container.appendChild(renderer.domElement);

    // 2. Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(isDark ? 0x1e1b4b : 0xffffff, isDark ? 1.8 : 2.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(isDark ? 0x38bdf8 : 0x0284c7, 3.0, 60);
    pointLight1.position.set(-15, 12, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(isDark ? 0xa855f7 : 0x9333ea, 2.5, 55);
    pointLight2.position.set(15, -10, 8);
    scene.add(pointLight2);

    // 3. Central 3D Minimalist Geometric Sculptural Centerpiece
    const masterGroup = new THREE.Group();

    // TorusKnot Outer Wireframe Rings
    const torusKnotGeo = new THREE.TorusKnotGeometry(3.6, 0.9, 128, 32);
    const torusKnotMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x38bdf8 : 0x0284c7,
      metalness: 0.85,
      roughness: 0.15,
      wireframe: true,
      emissive: isDark ? 0x0369a1 : 0x0e7490,
      emissiveIntensity: 0.3
    });
    const torusKnotMesh = new THREE.Mesh(torusKnotGeo, torusKnotMat);
    masterGroup.add(torusKnotMesh);

    // Inner Translucent Glass Core
    const coreGeo = new THREE.IcosahedronGeometry(2.4, 4);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0x8b5cf6 : 0x7c3aed,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
      thickness: 1.8,
      ior: 1.5,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.9
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    masterGroup.add(coreMesh);

    // Orbital Ring 1
    const ring1Geo = new THREE.TorusGeometry(6.5, 0.04, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x38bdf8 : 0x2563eb,
      transparent: true,
      opacity: 0.4
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Mesh.rotation.x = Math.PI / 3;
    masterGroup.add(ring1Mesh);

    // Orbital Ring 2
    const ring2Geo = new THREE.TorusGeometry(8.2, 0.03, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: isDark ? 0xc084fc : 0x7e22ce,
      transparent: true,
      opacity: 0.35
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.y = Math.PI / 4;
    masterGroup.add(ring2Mesh);

    // Floating Satellite Shapes (Dodecahedron & Octahedron)
    const sat1Geo = new THREE.DodecahedronGeometry(1.5, 0);
    const sat1Mat = new THREE.MeshStandardMaterial({
      color: isDark ? 0xc084fc : 0x9333ea,
      metalness: 0.8,
      roughness: 0.2
    });
    const sat1Mesh = new THREE.Mesh(sat1Geo, sat1Mat);
    sat1Mesh.position.set(-13, 6, -4);
    masterGroup.add(sat1Mesh);

    const sat2Geo = new THREE.OctahedronGeometry(1.6, 0);
    const sat2Mat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x38bdf8 : 0x2563eb,
      metalness: 0.8,
      roughness: 0.2
    });
    const sat2Mesh = new THREE.Mesh(sat2Geo, sat2Mat);
    sat2Mesh.position.set(14, -5, -3);
    masterGroup.add(sat2Mesh);

    scene.add(masterGroup);

    // 4. Floating Dust/Star Particle Motes
    const particleCount = 500;
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 80;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: isDark ? 0x38bdf8 : 0x2563eb,
      size: 0.25,
      transparent: true,
      opacity: isDark ? 0.6 : 0.4,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 5. Interactive Mouse Parallax (Silky Smooth Damping)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 6. Animation Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Silky smooth rotation & floating physics
      torusKnotMesh.rotation.x = t * 0.2;
      torusKnotMesh.rotation.y = t * 0.25;

      coreMesh.rotation.y = -t * 0.3;
      coreMesh.rotation.z = t * 0.15;

      ring1Mesh.rotation.z = t * 0.08;
      ring2Mesh.rotation.z = -t * 0.1;

      sat1Mesh.rotation.x = t * 0.4;
      sat1Mesh.position.y = 6 + Math.sin(t * 1.5) * 0.6;

      sat2Mesh.rotation.y = t * 0.35;
      sat2Mesh.position.y = -5 + Math.cos(t * 1.5) * 0.6;

      masterGroup.position.y = Math.sin(t * 0.8) * 0.3;
      particleSystem.rotation.y = t * 0.01;

      // Mouse Parallax Smooth Damping
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      camera.position.x = targetX * 10;
      camera.position.y = -targetY * 10;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [themeMode]);

  return (
    <div className={`three-bg-wrapper ${themeMode}`}>
      <div ref={containerRef} className="three-canvas-container" />
      <div className="three-overlay-vignette" />
    </div>
  );
};
