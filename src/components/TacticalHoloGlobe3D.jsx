import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Key Menwa tactical coordinates around Indonesia (lat, lon, label)
const SATELLITE_NODES = [
  { lat: -6.19, lon: 106.88, label: 'Mako Satuan UNJ (Pusat)', color: 0xffdd00 },
  { lat: -6.25, lon: 106.87, label: 'Skomen Jayakarta', color: 0x38bdf8 },
  { lat: -6.32, lon: 107.15, label: 'Batalyon Taipur (Cikarang)', color: 0x34d399 },
  { lat: -6.23, lon: 106.86, label: 'GOR Otista (Venue KC VIII)', color: 0xfbbf24 },
  { lat: -6.30, lon: 106.82, label: 'Posko Ragunan', color: 0x38bdf8 },
  { lat: -7.25, lon: 112.75, label: 'Kontingen Surabaya', color: 0x93c5fd },
  { lat: 3.59, lon: 98.67, label: 'Kontingen Medan', color: 0x93c5fd },
  { lat: -5.14, lon: 119.43, label: 'Kontingen Makassar', color: 0x93c5fd },
  { lat: -2.53, lon: 140.71, label: 'Kontingen Jayapura', color: 0x93c5fd },
];

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export function TacticalHoloGlobe3D({ className = '', onNodeHover = null }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02080c, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 2. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x004d50, 1.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffdd00, 2.0);
    keyLight.position.set(5, 7, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    fillLight.position.set(-6, -2, -4);
    scene.add(fillLight);

    const coreLight = new THREE.PointLight(0x006569, 3, 10);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    // 3. Composite 3D Tactical Globe (THREE.Group)
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Part 1: Core Sphere (PBR Metallic surface)
    const coreGeo = new THREE.SphereGeometry(1.6, 48, 48);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x011a1f,
      roughness: 0.25,
      metalness: 0.85,
      emissive: 0x002c30,
      emissiveIntensity: 0.6,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    // Part 2: Holographic Wireframe Cage
    const wireGeo = new THREE.SphereGeometry(1.62, 28, 28);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00a3a8,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireMesh);

    // Part 3: Procedural Archipelago Dots
    const dotCount = 800;
    const dotPositions = new Float32Array(dotCount * 3);
    for (let i = 0; i < dotCount; i++) {
      // Concentrate dots near equator (Indonesia: -10 to +6 lat, 95 to 141 lon)
      const isIndo = Math.random() > 0.45;
      const lat = isIndo ? -10 + Math.random() * 16 : -70 + Math.random() * 140;
      const lon = isIndo ? 95 + Math.random() * 46 : -180 + Math.random() * 360;
      const pos = latLonToVector3(lat, lon, 1.63);
      dotPositions[i * 3] = pos.x;
      dotPositions[i * 3 + 1] = pos.y;
      dotPositions[i * 3 + 2] = pos.z;
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
    const dotMat = new THREE.PointsMaterial({
      color: 0xffdd00,
      size: 0.04,
      transparent: true,
      opacity: 0.75,
    });
    const dotPoints = new THREE.Points(dotGeo, dotMat);
    globeGroup.add(dotPoints);

    // Part 4: Primary Equator Ring
    const equatorGeo = new THREE.RingGeometry(1.95, 2.05, 64);
    const equatorMat = new THREE.MeshBasicMaterial({
      color: 0x00a3a8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const equatorRing = new THREE.Mesh(equatorGeo, equatorMat);
    equatorRing.rotation.x = Math.PI / 2;
    globeGroup.add(equatorRing);

    // Part 5: Outer Tilted Orbit Ring
    const orbitGeo = new THREE.TorusGeometry(2.35, 0.015, 16, 100);
    const orbitMat = new THREE.MeshBasicMaterial({
      color: 0xffdd00,
      transparent: true,
      opacity: 0.6,
    });
    const orbitRing = new THREE.Mesh(orbitGeo, orbitMat);
    orbitRing.rotation.x = Math.PI / 3;
    orbitRing.rotation.y = Math.PI / 6;
    scene.add(orbitRing);

    // Part 6: Satellite Node Markers & Pulses
    const nodeMarkers = [];
    SATELLITE_NODES.forEach((node) => {
      const pos = latLonToVector3(node.lat, node.lon, 1.64);

      // Marker beacon
      const beaconGeo = new THREE.SphereGeometry(0.04, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({ color: node.color });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.copy(pos);
      globeGroup.add(beaconMesh);

      // Pulse ring around beacon
      const pulseGeo = new THREE.RingGeometry(0.04, 0.08, 16);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: node.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      pulseMesh.position.copy(pos.clone().multiplyScalar(1.01));
      pulseMesh.lookAt(pos.clone().multiplyScalar(2));
      globeGroup.add(pulseMesh);

      nodeMarkers.push({ beacon: beaconMesh, pulse: pulseMesh, initialScale: 1 });
    });

    // 4. Mouse Damped Interaction
    let targetRotationX = 0.2;
    let targetRotationY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        targetRotationY += deltaX * 0.005;
        targetRotationX += deltaY * 0.005;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        const rect = container.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 5. 60fps Animation Loop with Exponential Damping
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Continuous rotation + damped mouse response
      if (!isDragging) {
        targetRotationY += delta * 0.2;
      }

      globeGroup.rotation.y += (targetRotationY - globeGroup.rotation.y) * 0.08;
      globeGroup.rotation.x += (targetRotationX - globeGroup.rotation.x) * 0.08;

      // Orbit ring slow counter-rotation
      orbitRing.rotation.z += delta * 0.15;

      // Beacon pulses
      const pulseScale = 1 + Math.sin(elapsedTime * 4) * 0.35;
      const pulseOpacity = 0.7 - Math.sin(elapsedTime * 4) * 0.3;
      nodeMarkers.forEach((m) => {
        m.pulse.scale.set(pulseScale, pulseScale, pulseScale);
        m.pulse.material.opacity = Math.max(0.2, pulseOpacity);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      // Dispose geometries and materials
      coreGeo.dispose();
      coreMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      dotGeo.dispose();
      dotMat.dispose();
      equatorGeo.dispose();
      equatorMat.dispose();
      orbitGeo.dispose();
      orbitMat.dispose();
      nodeMarkers.forEach((m) => {
        m.beacon.geometry.dispose();
        m.beacon.material.dispose();
        m.pulse.geometry.dispose();
        m.pulse.material.dispose();
      });

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing ${className}`}>
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-[#006569] backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] font-mono font-bold text-slate-200">
          3D HOLO SAT-GRID // ONLINE
        </span>
      </div>
      <div className="absolute bottom-3 right-3 pointer-events-none text-right">
        <span className="text-[10px] font-mono text-[#FFDD00] block">
          Pusat Komando: Jakarta (UNJ)
        </span>
        <span className="text-[9px] font-mono text-slate-400 block">
          Frekuensi Taktis 142.85 MHz
        </span>
      </div>
    </div>
  );
}
