import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeHeroCanvas = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera (Dark Moody Cinematic 3D Engine)
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.015);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Cinematic Warm Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const warmSun = new THREE.DirectionalLight(0xDEDBC8, 2.5);
    warmSun.position.set(15, 20, 15);
    scene.add(warmSun);

    const pointLight = new THREE.PointLight(0x6366f1, 2.0, 40);
    pointLight.position.set(-10, -10, 10);
    scene.add(pointLight);

    // 3. Central Interactive 3D CS Node / Logic Core
    const masterGroup = new THREE.Group();

    // Core Geometry: Metallic TorusKnot Logic Ring
    const knotGeo = new THREE.TorusKnotGeometry(3.2, 0.8, 128, 32);
    const knotMat = new THREE.MeshStandardMaterial({
      color: 0xDEDBC8,
      metalness: 0.85,
      roughness: 0.2,
      wireframe: true,
      emissive: 0x44403c,
      emissiveIntensity: 0.2
    });
    const knotMesh = new THREE.Mesh(knotGeo, knotMat);
    masterGroup.add(knotMesh);

    // Inner Glowing Translucent Glass Core
    const glassGeo = new THREE.IcosahedronGeometry(2.2, 3);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xE1E0CC,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.9,
      thickness: 1.5,
      transparent: true,
      opacity: 0.85
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    masterGroup.add(glassMesh);

    // Orbital Ring 1
    const ring1Geo = new THREE.TorusGeometry(5.8, 0.03, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0xDEDBC8, transparent: true, opacity: 0.4 });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Mesh.rotation.x = Math.PI / 3;
    masterGroup.add(ring1Mesh);

    // Orbital Ring 2
    const ring2Geo = new THREE.TorusGeometry(7.2, 0.02, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.35 });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.y = Math.PI / 4;
    masterGroup.add(ring2Mesh);

    scene.add(masterGroup);

    // 4. Starlight Particle Dust
    const pCount = 350;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 60;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xDEDBC8, size: 0.2, transparent: true, opacity: 0.5 });
    const pSystem = new THREE.Points(pGeo, pMat);
    scene.add(pSystem);

    // 5. Interactive Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = (e.clientX - rect.left - rect.width / 2) * 0.001;
      mouseY = (e.clientY - rect.top - rect.height / 2) * 0.001;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // 6. Animation Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      knotMesh.rotation.x = t * 0.2;
      knotMesh.rotation.y = t * 0.25;
      glassMesh.rotation.y = -t * 0.3;

      ring1Mesh.rotation.z = t * 0.08;
      ring2Mesh.rotation.z = -t * 0.1;
      masterGroup.position.y = Math.sin(t * 0.8) * 0.3;

      // Damped mouse parallax
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      masterGroup.rotation.y = targetX * 1.5;
      masterGroup.rotation.x = targetY * 1.5;

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
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full absolute inset-0 pointer-events-none z-1" />
  );
};
