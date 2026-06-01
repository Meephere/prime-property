"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check prefers reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prefersReducedMotion = mediaQuery.matches;

    // 1. Setup Scene, Camera, and Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1a1a1a, 0.04);

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);

    // 2. Add Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xc9a961, 2, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // 3. Create floating 3D wireframe structures (a group of luxury modern houses)
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Color definitions
    const goldColor = 0xc9a961;
    const darkGoldColor = 0x8f7236;

    // Helper to create wireframe box
    const createWireframeBox = (w: number, h: number, d: number, x: number, y: number, z: number) => {
      const geometry = new THREE.BoxGeometry(w, h, d);
      // Create wireframe geometry
      const wireframe = new THREE.EdgesGeometry(geometry);
      const material = new THREE.LineBasicMaterial({ color: goldColor, linewidth: 2 });
      const line = new THREE.LineSegments(wireframe, material);
      
      // Also add slightly translucent faces to give visual weight
      const faceMat = new THREE.MeshBasicMaterial({
        color: darkGoldColor,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geometry, faceMat);
      
      const boxGroup = new THREE.Group();
      boxGroup.add(line);
      boxGroup.add(mesh);
      boxGroup.position.set(x, y, z);
      return boxGroup;
    };

    // Construct a futuristic modern compound (isometric architectural grid)
    const house1 = createWireframeBox(2, 1.5, 2, -1.5, 0, 0);       // Main block
    const house1Roof = createWireframeBox(2, 0.8, 2, -1.5, 1.15, 0);  // Upper block
    
    const house2 = createWireframeBox(1.5, 3, 1.5, 1.5, 0.75, -0.5); // High commercial tower block
    
    const compoundWall = createWireframeBox(4.5, 0.2, 4.5, 0, -0.85, -0.2); // Base platform

    mainGroup.add(house1);
    mainGroup.add(house1Roof);
    mainGroup.add(house2);
    mainGroup.add(compoundWall);

    // Rotate the group to get a premium isometric view angle
    mainGroup.rotation.x = 0.3;
    mainGroup.rotation.y = -0.6;

    // 4. Create floating dots particle system
    const particleCount = 40;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 12;     // x
      positions[i + 1] = (Math.random() - 0.5) * 8; // y
      positions[i + 2] = (Math.random() - 0.5) * 8; // z
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: goldColor,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Interaction variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse coordinates (-1 to 1)
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 6. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Floating drift animation
      if (!prefersReducedMotion) {
        mainGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.15;
        
        // Gentle auto rotation
        mainGroup.rotation.y += 0.002;
        
        // Dynamic hover tilt adjustment (interpolation for smoothness)
        targetX = mouseX * 0.25;
        targetY = mouseY * 0.2;
        
        mainGroup.rotation.x += (targetY - mainGroup.rotation.x) * 0.05;
        mainGroup.rotation.y += (targetX - mainGroup.rotation.y) * 0.05;

        // Particle floating
        particles.rotation.y = elapsedTime * 0.02;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Handle Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Cleanups
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometryCleanups(scene);
    };
  }, []);

  // Recurse and clean geometries/materials to avoid memory leaks
  const geometryCleanups = (object: THREE.Object3D) => {
    object.traverse((child: any) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material: any) => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[300px] relative pointer-events-none select-none"
    />
  );
}
