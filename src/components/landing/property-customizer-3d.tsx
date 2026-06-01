"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Sparkles, Sun, Moon, Palette, TreePine, Eye } from "lucide-react";

interface CustomizerProps {
  tipe: string; // "Ruko" | "Villa"
  nama: string;
}

export default function PropertyCustomizer3D({ tipe, nama }: CustomizerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Customization States
  const [facadeColor, setFacadeColor] = useState<"white" | "gold" | "charcoal">("white");
  const [landscape, setLandscape] = useState<"garden" | "pool">("garden");
  const [lighting, setLighting] = useState<"day" | "night">("day");

  // References to dynamically updated Three.js meshes/lights
  const sceneRef = useRef<THREE.Scene | null>(null);
  const wallMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const landscapeMeshRef = useRef<THREE.Group | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const windowsMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = 300; // Fixed height inside drawer

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xfbfbfb);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(5, 4.5, 7.5);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 3);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // 3. Materials Setup
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.1
    });
    wallMaterialRef.current = wallMaterial;

    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a4a4a,
      roughness: 0.7
    });

    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.6
    });

    const windowsMaterial = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      emissive: 0x000000,
      roughness: 0.2
    });
    windowsMaterialRef.current = windowsMaterial;

    // 4. Build House Group
    const houseGroup = new THREE.Group();
    scene.add(houseGroup);

    // Base Platform / Ground
    const groundGeo = new THREE.BoxGeometry(4.5, 0.1, 4.5);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    houseGroup.add(ground);

    const isRuko = tipe === "Ruko";

    if (isRuko) {
      // Build Ruko (3-floor business block)
      const buildRuko = () => {
        // Main block
        const bodyGeo = new THREE.BoxGeometry(1.8, 2.5, 2.2);
        const body = new THREE.Mesh(bodyGeo, wallMaterial);
        body.position.y = 1.25;
        body.castShadow = true;
        body.receiveShadow = true;
        houseGroup.add(body);

        // Storefront glass (first floor)
        const storeGlassGeo = new THREE.BoxGeometry(1.9, 0.8, 1.2);
        const storeGlass = new THREE.Mesh(storeGlassGeo, glassMaterial);
        storeGlass.position.set(0.05, 0.45, 0.6);
        houseGroup.add(storeGlass);

        // Floor separators (stripes representing high-end architecture)
        const stripeGeo = new THREE.BoxGeometry(1.85, 0.08, 2.25);
        const stripe1 = new THREE.Mesh(stripeGeo, roofMaterial);
        stripe1.position.y = 0.9;
        const stripe2 = new THREE.Mesh(stripeGeo, roofMaterial);
        stripe2.position.y = 1.7;
        houseGroup.add(stripe1);
        houseGroup.add(stripe2);

        // Windows (2nd & 3rd floor)
        const winGeo = new THREE.BoxGeometry(0.1, 0.5, 0.6);
        const win1 = new THREE.Mesh(winGeo, windowsMaterial);
        win1.position.set(0.91, 1.3, 0.4);
        const win2 = new THREE.Mesh(winGeo, windowsMaterial);
        win2.position.set(0.91, 2.1, 0.4);
        houseGroup.add(win1);
        houseGroup.add(win2);
      };
      buildRuko();
    } else {
      // Build Villa (Modern sloped roof luxury villa)
      const buildVilla = () => {
        // Main block
        const bodyGeo = new THREE.BoxGeometry(2.2, 1.2, 2.2);
        const body = new THREE.Mesh(bodyGeo, wallMaterial);
        body.position.y = 0.6;
        body.castShadow = true;
        body.receiveShadow = true;
        houseGroup.add(body);

        // Upper floor (smaller block offset)
        const upperGeo = new THREE.BoxGeometry(1.6, 1.0, 1.6);
        const upper = new THREE.Mesh(upperGeo, wallMaterial);
        upper.position.set(-0.2, 1.7, -0.2);
        upper.castShadow = true;
        upper.receiveShadow = true;
        houseGroup.add(upper);

        // Sloped roof on upper floor
        const roofGeo = new THREE.ConeGeometry(1.4, 0.8, 4);
        const roof = new THREE.Mesh(roofGeo, roofMaterial);
        roof.rotation.y = Math.PI / 4;
        roof.position.set(-0.2, 2.6, -0.2);
        roof.castShadow = true;
        houseGroup.add(roof);

        // Balcony glass
        const balcGeo = new THREE.BoxGeometry(1.75, 0.3, 1.75);
        const balc = new THREE.Mesh(balcGeo, glassMaterial);
        balc.position.set(-0.2, 1.35, -0.2);
        houseGroup.add(balc);

        // Large glass windows
        const windowGeo = new THREE.BoxGeometry(0.8, 0.6, 0.1);
        const win = new THREE.Mesh(windowGeo, windowsMaterial);
        win.position.set(0.3, 0.6, 1.06);
        houseGroup.add(win);
      };
      buildVilla();
    }

    // 5. Landscaping Sub-group (Garden or Pool)
    const landscapeGroup = new THREE.Group();
    landscapeMeshRef.current = landscapeGroup;
    houseGroup.add(landscapeGroup);

    // Initial landscape load
    updateLandscape("garden");

    // 6. Animation and interaction loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      
      // Auto rotate slightly to give interactive 3D feel
      houseGroup.rotation.y += 0.003;

      renderer.render(scene, camera);
    };
    animate();

    // Cleanups
    return () => {
      cancelAnimationFrame(animId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      groundGeo.dispose();
      groundMat.dispose();
      wallMaterial.dispose();
      roofMaterial.dispose();
      glassMaterial.dispose();
      windowsMaterial.dispose();
    };
  }, [tipe]);

  // Dynamic landscape model swapper
  const updateLandscape = (type: "garden" | "pool") => {
    const group = landscapeMeshRef.current;
    if (!group) return;

    // Clear previous children
    while (group.children.length > 0) {
      const child = group.children[0] as any;
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
      group.remove(child);
    }

    if (type === "garden") {
      // Add green grass turf lawn
      const grassGeo = new THREE.BoxGeometry(1.6, 0.05, 4.3);
      const grassMat = new THREE.MeshStandardMaterial({ color: 0x66bb6a, roughness: 0.9 });
      const grass = new THREE.Mesh(grassGeo, grassMat);
      grass.position.set(-1.35, 0.025, 0);
      grass.receiveShadow = true;
      group.add(grass);

      // Add a simple stylized tree
      const trunkGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x795548 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(-1.4, 0.35, 1.2);
      trunk.castShadow = true;
      group.add(trunk);

      const leavesGeo = new THREE.SphereGeometry(0.3, 8, 8);
      const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6 });
      const leaves = new THREE.Mesh(leavesGeo, leavesMat);
      leaves.position.set(-1.4, 0.7, 1.2);
      leaves.castShadow = true;
      group.add(leaves);
    } else {
      // Add a shiny swimming pool
      const poolFrameGeo = new THREE.BoxGeometry(1.6, 0.06, 3.2);
      const poolFrameMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae, roughness: 0.5 });
      const poolFrame = new THREE.Mesh(poolFrameGeo, poolFrameMat);
      poolFrame.position.set(-1.35, 0.03, 0);
      group.add(poolFrame);

      const waterGeo = new THREE.BoxGeometry(1.3, 0.07, 2.9);
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x00b0ff,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.8
      });
      const water = new THREE.Mesh(waterGeo, waterMat);
      water.position.set(-1.35, 0.035, 0);
      group.add(water);
    }
  };

  // 7. Watchers to apply dynamic changes to Three.js materials/lights
  useEffect(() => {
    if (!wallMaterialRef.current) return;
    
    // Update colors
    const colors = {
      white: 0xf5f5f5,
      gold: 0xc9a961,
      charcoal: 0x2a2a2a
    };
    
    wallMaterialRef.current.color.setHex(colors[facadeColor]);
  }, [facadeColor]);

  useEffect(() => {
    updateLandscape(landscape);
  }, [landscape]);

  useEffect(() => {
    const scene = sceneRef.current;
    const dirLight = dirLightRef.current;
    const ambientLight = ambientLightRef.current;
    const windows = windowsMaterialRef.current;

    if (!scene || !dirLight || !ambientLight || !windows) return;

    if (lighting === "day") {
      scene.background = new THREE.Color(0xfbfbfb);
      ambientLight.intensity = 0.6;
      dirLight.intensity = 1.2;
      dirLight.color.setHex(0xffffff);
      windows.color.setHex(0xdddddd);
      windows.emissive.setHex(0x000000);
    } else {
      scene.background = new THREE.Color(0x111115);
      ambientLight.intensity = 0.2;
      dirLight.intensity = 0.4;
      dirLight.color.setHex(0x3f51b5); // Cool night sky blue light
      windows.color.setHex(0xffe082); // Bright yellow glowing windows
      windows.emissive.setHex(0xffb300);
    }
  }, [lighting]);

  return (
    <div className="border border-zinc-200 bg-white p-4 space-y-4">
      
      {/* 3D Viewport container */}
      <div className="relative w-full h-[250px] overflow-hidden bg-zinc-50 border border-zinc-150">
        <div ref={mountRef} className="w-full h-full" />
        
        {/* Floating Indicator */}
        <div className="absolute top-3 left-3 bg-[#1A1A1A]/85 backdrop-blur-sm px-2.5 py-1 border border-zinc-800 flex items-center text-[9px] uppercase font-bold tracking-wider text-[#C9A961] space-x-1.5">
          <Eye className="h-3 w-3" />
          <span>Interactive 3D Configurator</span>
        </div>
      </div>

      {/* Control Panel (Glassmorphic options) */}
      <div className="grid grid-cols-3 gap-3 text-[10px] text-zinc-650">
        
        {/* Facade Color */}
        <div className="space-y-1.5">
          <label className="font-bold uppercase tracking-wider text-zinc-400 flex items-center">
            <Palette className="h-3.5 w-3.5 mr-1 text-[#C9A961]" />
            Dinding
          </label>
          <div className="flex gap-1.5">
            {["white", "gold", "charcoal"].map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => setFacadeColor(col as any)}
                className={`w-6 h-6 border flex items-center justify-center cursor-pointer transition-all ${
                  facadeColor === col ? "border-[#C9A961] ring-1 ring-[#C9A961]" : "border-zinc-250 hover:border-zinc-400"
                }`}
                style={{
                  backgroundColor: col === "white" ? "#f3f3f3" : col === "gold" ? "#C9A961" : "#2a2a2a"
                }}
                title={col}
              />
            ))}
          </div>
        </div>

        {/* Landscaping options */}
        <div className="space-y-1.5">
          <label className="font-bold uppercase tracking-wider text-zinc-400 flex items-center">
            <TreePine className="h-3.5 w-3.5 mr-1 text-[#C9A961]" />
            Lanskap
          </label>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setLandscape("garden")}
              className={`px-2 py-1 border text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                landscape === "garden" ? "border-[#C9A961] text-[#C9A961] bg-[#C9A961]/5" : "border-zinc-200 text-zinc-600 hover:border-zinc-350"
              }`}
            >
              Taman
            </button>
            <button
              type="button"
              onClick={() => setLandscape("pool")}
              className={`px-2 py-1 border text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                landscape === "pool" ? "border-[#C9A961] text-[#C9A961] bg-[#C9A961]/5" : "border-zinc-200 text-zinc-600 hover:border-zinc-350"
              }`}
            >
              Kolam
            </button>
          </div>
        </div>

        {/* Lighting times */}
        <div className="space-y-1.5">
          <label className="font-bold uppercase tracking-wider text-zinc-400 flex items-center">
            <Sparkles className="h-3.5 w-3.5 mr-1 text-[#C9A961]" />
            Waktu
          </label>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setLighting("day")}
              className={`p-1.5 border transition-all cursor-pointer ${
                lighting === "day" ? "border-[#C9A961] text-[#C9A961]" : "border-zinc-200 text-zinc-600"
              }`}
              title="Siang Hari"
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLighting("night")}
              className={`p-1.5 border transition-all cursor-pointer ${
                lighting === "night" ? "border-[#C9A961] text-[#C9A961]" : "border-zinc-200 text-zinc-600"
              }`}
              title="Malam Hari"
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
