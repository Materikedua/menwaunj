import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  MAKO_CENTER_COORDS,
  type TacticalOperationNode,
} from '../../data/siteConfig';

interface TacticalOperationCanvas3DProps {
  nodes: TacticalOperationNode[];
  selectedId: string;
  onSelectNode: (node: TacticalOperationNode) => void;
  onWebglUnsupported?: () => void;
}

/**
 * Konversi koordinat geografis Nusantara ke ruang 3D taktis berpusat pada Mako Menwa UNJ Rawamangun (0, 0, 0).
 */
function geoToWorld3D(lat: number, lng: number): THREE.Vector3 {
  const x = (lng - MAKO_CENTER_COORDS.lng) * 0.62;
  const z = -(lat - MAKO_CENTER_COORDS.lat) * 0.72;
  return new THREE.Vector3(x, 0, z);
}

/**
 * Membangun menara komando multi-bagian (composite Group) untuk Mako Menwa UNJ Rawamangun.
 */
function buildMakoCommandBeacon(): THREE.Group {
  const group = new THREE.Group();

  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0x006569,
    metalness: 0.65,
    roughness: 0.28,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffdd00,
    emissive: 0x665200,
    emissiveIntensity: 0.55,
    metalness: 0.8,
    roughness: 0.2,
  });
  const darkCoreMat = new THREE.MeshStandardMaterial({
    color: 0x082830,
    metalness: 0.5,
    roughness: 0.35,
  });

  // 1. Fondasi oktagonal Mako
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.82, 0.22, 8), darkCoreMat);
  base.position.y = 0.11;
  group.add(base);

  // 2. Podium lapis kedua
  const tier = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.58, 0.28, 8), plinthMat);
  tier.position.y = 0.34;
  group.add(tier);

  // 3. Inti menara sinyal
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.26, 1.05, 6), goldMat);
  spire.position.y = 0.98;
  group.add(spire);

  // 4. Cincin orbit radar komando
  const haloRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.045, 12, 32), goldMat);
  haloRing.rotation.x = Math.PI / 2;
  haloRing.position.y = 0.72;
  haloRing.name = 'mako-radar-ring';
  group.add(haloRing);

  // 5. Tiang antena puncak
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 8), goldMat);
  mast.position.y = 1.62;
  group.add(mast);

  return group;
}

/**
 * Membangun penanda posko lapangan / asal kontingen multi-bagian (composite Group).
 */
function buildOperationNodeMarker(isFieldMission: boolean): THREE.Group {
  const group = new THREE.Group();
  const accentHex = isFieldMission ? 0x10b981 : 0x38bdf8;
  const emissiveHex = isFieldMission ? 0x065f46 : 0x0c4a6e;

  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x0b2d36,
    metalness: 0.55,
    roughness: 0.35,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: accentHex,
    emissive: emissiveHex,
    emissiveIntensity: 0.6,
    metalness: 0.65,
    roughness: 0.24,
  });

  // 1. Landasan heksagonal taktis
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.44, 0.14, 6), baseMat);
  pad.position.y = 0.07;
  group.add(pad);

  // 2. Kolom suar
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 0.56, 6), accentMat);
  column.position.y = 0.42;
  group.add(column);

  // 3. Kristal indikator atas
  const cap = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), accentMat);
  cap.position.y = 0.84;
  cap.name = 'node-cap';
  group.add(cap);

  // 4. Cincin dasar berpendar
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.44, 0.54, 24), accentMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.03;
  ring.material.side = THREE.DoubleSide;
  group.add(ring);

  return group;
}

/**
 * Membuat pelat relief kepulauan Nusantara di atas meja peta taktis 3D.
 */
function buildArchipelagoRelief(): THREE.Group {
  const archipelago = new THREE.Group();

  const landMat = new THREE.MeshStandardMaterial({
    color: 0x0d3b43,
    roughness: 0.55,
    metalness: 0.25,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x1c7885,
    roughness: 0.35,
    metalness: 0.5,
  });

  const islands: Array<Array<[number, number]>> = [
    // Sumatera
    [
      [5.5, 95.3],
      [3.6, 98.7],
      [0.5, 101.5],
      [-2.9, 104.8],
      [-5.4, 105.3],
      [-3.8, 102.2],
      [-0.9, 100.3],
      [2.2, 97.8],
    ],
    // Jawa
    [
      [-6.0, 105.9],
      [-6.2, 106.9],
      [-6.7, 108.6],
      [-7.0, 110.4],
      [-7.3, 112.8],
      [-8.2, 114.3],
      [-8.1, 111.5],
      [-7.6, 108.5],
      [-6.8, 106.4],
    ],
    // Kalimantan
    [
      [1.2, 109.2],
      [3.2, 117.5],
      [0.5, 117.6],
      [-3.3, 116.0],
      [-3.4, 113.0],
      [-2.6, 110.2],
    ],
    // Sulawesi
    [
      [1.4, 124.8],
      [0.6, 121.0],
      [-1.5, 120.2],
      [-5.2, 119.5],
      [-4.2, 122.5],
      [-1.2, 123.1],
    ],
    // Bali & Nusa Tenggara
    [
      [-8.4, 115.1],
      [-8.6, 117.4],
      [-8.6, 121.8],
      [-9.0, 121.6],
      [-8.9, 116.8],
    ],
    // Papua Barat - Tengah
    [
      [-0.9, 131.3],
      [-2.5, 140.5],
      [-6.2, 140.2],
      [-4.8, 136.5],
      [-2.8, 132.5],
    ],
  ];

  for (const coords of islands) {
    const shape = new THREE.Shape();
    coords.forEach(([lat, lng], idx) => {
      const v = geoToWorld3D(lat, lng);
      // Shape berada di bidang XY lalu dirotasi ke XZ: gunakan -v.z agar orientasi Utara-Selatan akurat
      if (idx === 0) shape.moveTo(v.x, -v.z);
      else shape.lineTo(v.x, -v.z);
    });
    shape.closePath();

    const extrudeGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.04,
      bevelSegments: 2,
    });
    const mesh = new THREE.Mesh(extrudeGeo, landMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -0.14;
    archipelago.add(mesh);

    const edges = new THREE.EdgesGeometry(extrudeGeo, 25);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: rimMat.color, transparent: true, opacity: 0.45 })
    );
    line.rotation.x = -Math.PI / 2;
    line.position.y = -0.135;
    archipelago.add(line);
  }

  return archipelago;
}

export const TacticalOperationCanvas3D: React.FC<TacticalOperationCanvas3DProps> = ({
  nodes,
  selectedId,
  onSelectNode,
  onWebglUnsupported,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedIdRef = useRef<string>(selectedId);
  const nodesRef = useRef<TacticalOperationNode[]>(nodes);
  const onSelectRef = useRef(onSelectNode);
  const requestRenderRef = useRef<(() => void) | null>(null);
  const markerGroupsRef = useRef<Map<string, THREE.Group>>(new Map());

  selectedIdRef.current = selectedId;
  nodesRef.current = nodes;
  onSelectRef.current = onSelectNode;

  // Perbarui sorotan penanda saat selectedId atau daftar filter berubah
  useEffect(() => {
    const visibleIds = new Set(nodes.map((n) => n.id));
    markerGroupsRef.current.forEach((grp, id) => {
      grp.visible = visibleIds.has(id);
      const isSel = id === selectedId;
      grp.scale.setScalar(isSel ? 1.32 : 1.0);
    });
    requestRenderRef.current?.();
  }, [nodes, selectedId]);

  useEffect(() => {
    const mountEl = containerRef.current;
    if (!mountEl) return undefined;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      onWebglUnsupported?.();
      return undefined;
    }

    const gl = renderer.getContext();
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr);

    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setClearColor(0x031117, 1);

    const initW = Math.max(300, mountEl.clientWidth || 800);
    const initH = Math.max(320, mountEl.clientHeight || 460);
    renderer.setSize(initW, initH);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    mountEl.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x031117);
    scene.fog = new THREE.FogExp2(0x031117, 0.016);

    // Lingkungan reflektif PBR (RoomEnvironment)
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    const camera = new THREE.PerspectiveCamera(42, initW / initH, 0.1, 140);
    camera.position.set(1.2, 11.8, 14.5);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.maxPolarAngle = Math.PI * 0.44;
    controls.minPolarAngle = Math.PI * 0.14;
    controls.minDistance = 5.5;
    controls.maxDistance = 28;
    controls.target.set(2.2, 0, 0.4);
    controls.update();

    // Pencahayaan Tiga Titik (Warm Key + Cool Sky/Ground Fill + Rim)
    const hemiLight = new THREE.HemisphereLight(0x6ec3d8, 0x06191e, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff2dc, 2.2);
    keyLight.position.set(8, 16, 10);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x2dd4bf, 1.1);
    rimLight.position.set(-10, 8, -12);
    scene.add(rimLight);

    // Meja Laut Taktis & Grid Koordinat
    const seaFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(68, 42),
      new THREE.MeshStandardMaterial({
        color: 0x041820,
        roughness: 0.72,
        metalness: 0.25,
      })
    );
    seaFloor.rotation.x = -Math.PI / 2;
    seaFloor.position.y = -0.16;
    scene.add(seaFloor);

    const gridHelper = new THREE.GridHelper(54, 36, 0x165e68, 0x0a2e36);
    gridHelper.position.y = -0.14;
    scene.add(gridHelper);

    // Relief Kepulauan Nusantara
    const archipelagoGroup = buildArchipelagoRelief();
    scene.add(archipelagoGroup);

    // Cincin Radar Terpusat di Mako UNJ Rawamangun (0, 0, 0)
    const radarPulseMesh = new THREE.Mesh(
      new THREE.RingGeometry(0.9, 1.08, 48),
      new THREE.MeshBasicMaterial({
        color: 0xffdd00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55,
      })
    );
    radarPulseMesh.rotation.x = -Math.PI / 2;
    radarPulseMesh.position.y = 0.02;
    scene.add(radarPulseMesh);

    // Penanda Lokasi & Busur Operasi 3D
    const pickableMeshes: THREE.Object3D[] = [];
    const markerMap = new Map<string, THREE.Group>();
    const pulsePackets: Array<{ mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; speed: number; offset: number }> = [];

    const allNodes = nodesRef.current;
    const makoVec = geoToWorld3D(MAKO_CENTER_COORDS.lat, MAKO_CENTER_COORDS.lng);

    allNodes.forEach((node, index) => {
      const pos = geoToWorld3D(node.lat, node.lng);
      const isMako = node.category === 'mako_pusat';
      const isField = node.category === 'pengabdian_bencana';

      const marker = isMako ? buildMakoCommandBeacon() : buildOperationNodeMarker(isField);
      marker.position.copy(pos);
      marker.userData = { nodeId: node.id };

      if (node.id === selectedIdRef.current) {
        marker.scale.setScalar(1.32);
      }

      marker.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.userData = { nodeId: node.id };
          pickableMeshes.push(child);
        }
      });

      scene.add(marker);
      markerMap.set(node.id, marker);

      // Busur lintasan dari Mako Rawamangun menuju titik operasi / kontingen
      if (!isMako) {
        const dist = makoVec.distanceTo(pos);
        const mid = makoVec.clone().lerp(pos, 0.5);
        mid.y = Math.min(3.8, Math.max(0.95, dist * 0.24));

        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(makoVec.x, 0.55, makoVec.z),
          mid,
          new THREE.Vector3(pos.x, 0.45, pos.z)
        );

        const arcPoints = curve.getPoints(36);
        const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
        const arcColor = isField ? 0x34d399 : 0x38bdf8;
        const arcLine = new THREE.Line(
          arcGeo,
          new THREE.LineBasicMaterial({
            color: arcColor,
            transparent: true,
            opacity: 0.65,
          })
        );
        scene.add(arcLine);

        // Paket pulsa bergerak di sepanjang busur
        const packet = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 10, 10),
          new THREE.MeshBasicMaterial({ color: isField ? 0xffdd00 : 0x7dd3fc })
        );
        scene.add(packet);
        pulsePackets.push({
          mesh: packet,
          curve,
          speed: 0.22 + (index % 4) * 0.04,
          offset: (index * 0.17) % 1,
        });
      }
    });

    markerGroupsRef.current = markerMap;

    // Interaksi Raycasting Klik & Kursor
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const getHitNodeId = (clientX: number, clientY: number): string | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(pickableMeshes, false);
      for (const hit of hits) {
        const nid = hit.object.userData?.nodeId as string | undefined;
        if (nid) {
          const grp = markerMap.get(nid);
          if (grp && grp.visible) return nid;
        }
      }
      return null;
    };

    const onPointerDown = (ev: PointerEvent) => {
      pointerDownPos = { x: ev.clientX, y: ev.clientY };
    };

    const onPointerMove = (ev: PointerEvent) => {
      const hitId = getHitNodeId(ev.clientX, ev.clientY);
      renderer.domElement.style.cursor = hitId ? 'pointer' : 'grab';
    };

    const onPointerUp = (ev: PointerEvent) => {
      const moved = Math.hypot(ev.clientX - pointerDownPos.x, ev.clientY - pointerDownPos.y);
      if (moved > 7) return;
      const hitId = getHitNodeId(ev.clientX, ev.clientY);
      if (hitId) {
        const found = nodesRef.current.find((n) => n.id === hitId);
        if (found) {
          onSelectRef.current(found);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // Pacing frame aman untuk Software WebGL (mencegah antrean GPU membekukan browser headless)
    let disposed = false;
    let rafId = 0;

    const afterDraw = (): Promise<void> =>
      new Promise((resolve) => {
        if (!isSoftwareGl || !(gl instanceof WebGL2RenderingContext)) {
          resolve();
          return;
        }
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        if (!sync) {
          resolve();
          return;
        }
        const poll = () => {
          if (disposed) {
            gl.deleteSync(sync);
            resolve();
            return;
          }
          const st = gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (st === gl.SIGNALED || gl.isContextLost()) {
            gl.deleteSync(sync);
            resolve();
          } else {
            setTimeout(poll, 16);
          }
        };
        setTimeout(poll, 0);
      });

    const clock = new THREE.Clock();

    const renderFrame = (elapsedSec: number) => {
      controls.update();

      // Animasi halus cincin radar Mako & paket sinyal
      const pulsePhase = (elapsedSec * 0.55) % 1;
      radarPulseMesh.scale.setScalar(1 + pulsePhase * 2.4);
      (radarPulseMesh.material as THREE.MeshBasicMaterial).opacity = Math.max(
        0,
        0.55 * (1 - pulsePhase)
      );

      const makoGrp = markerMap.get('NODE-MAKO-UNJ');
      const makoRing = makoGrp?.getObjectByName('mako-radar-ring');
      if (makoRing) {
        makoRing.rotation.z = elapsedSec * 1.1;
      }

      pulsePackets.forEach((pkt) => {
        const t = (elapsedSec * pkt.speed + pkt.offset) % 1;
        pkt.curve.getPoint(t, pkt.mesh.position);
      });

      renderer.render(scene, camera);
    };

    requestRenderRef.current = () => {
      if (!disposed && isSoftwareGl) {
        renderFrame(clock.getElapsedTime());
      }
    };

    if (isSoftwareGl) {
      // Pada Software WebGL, gunakan pacing ringan ~12 fps dengan sinkronisasi fenceSync
      const pacedLoop = async () => {
        while (!disposed) {
          if (!document.hidden) {
            renderFrame(clock.getElapsedTime());
            await afterDraw();
          }
          await new Promise((r) => setTimeout(r, 90));
        }
      };
      pacedLoop();
    } else {
      const animate = () => {
        if (disposed) return;
        rafId = requestAnimationFrame(animate);
        if (document.hidden) return;
        renderFrame(clock.getElapsedTime());
      };
      rafId = requestAnimationFrame(animate);
    }

    // Responsif ResizeObserver
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect || rect.width <= 0 || rect.height <= 0) return;
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.setSize(rect.width, rect.height, false);
      if (isSoftwareGl) renderFrame(clock.getElapsedTime());
    });
    ro.observe(mountEl);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      controls.dispose();
      pmrem.dispose();
      envTex.dispose();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
          else m.material?.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mountEl) {
        mountEl.removeChild(renderer.domElement);
      }
    };
  }, [onWebglUnsupported]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[420px] sm:h-[480px] rounded-2xl border border-[#006569]/60 bg-[#031117] overflow-hidden"
      aria-label="Kanvas 3D Peta Taktis Operasi Menwa UNJ"
    />
  );
};

export default TacticalOperationCanvas3D;
