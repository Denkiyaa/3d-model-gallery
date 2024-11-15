import React, { useEffect } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useLocation } from 'react-router-dom';

const ModelViewer = () => {
  const location = useLocation();
  const modelPath = location.state?.modelPath;

  useEffect(() => {
    if (!modelPath) {
      console.error('No model path provided.');
      return;
    }

    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    const container = document.getElementById('model-container');
    if (!container) return;

    const aspectRatio = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 2000);
    camera.position.set(100, 100, 150);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);
    renderer.setClearColor(new THREE.Color('#2e2e30')); // Light gray background


    // Orbit Controls with optimized settings for smoother and longer spins
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;           // Enable damping for smooth interaction
    controls.rotateSpeed = 1.0;              // Adjust rotate speed for more control
    controls.maxPolarAngle = Math.PI;        // Allow the camera to rotate fully to view under the model
    controls.minDistance = 10;               // Minimum distance from the model
    controls.maxDistance = 500;              // Maximum distance from the model
    controls.update();


    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Increase intensity to make everything brighter
    scene.add(ambientLight);

    // Directional Light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3); // Increase intensity to highlight reflection
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);


    // Load STL model
    const loader = new STLLoader();
    loader.load(modelPath, (geometry) => {

      geometry.center(); // Center the model geometry
      const material = new THREE.MeshStandardMaterial({
        color: "#dcdcdc", // Model color
        metalness: 0.1,  // Increase reflectivity
        roughness: 0.5,  // Decrease roughness for a smoother, shinier surface
        clearcoat: 0.1,  // Yüzeye ek bir parlaklık sağlar
        reflectivity: 0.2  // Yansıma oranını artırır   
      }); const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      scene.add(mesh);

      adjustModel(mesh, scene); // Rotate and adjust model position
      createDynamicGround(scene, mesh); // Create dynamic ground

      // Camera adjustments
      const boundingBox = new THREE.Box3().setFromObject(mesh);
      const size = boundingBox.getSize(new THREE.Vector3());
      const center = boundingBox.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fitHeightDistance = maxDim / (2 * Math.atan((Math.PI * camera.fov) / 360));
      const fitWidthDistance = fitHeightDistance / camera.aspect;
      const distance = Math.max(fitHeightDistance, fitWidthDistance);

      camera.position.set(center.x, center.y + size.y / 2, distance * 4);
      camera.lookAt(center);
      controls.maxDistance = distance * 6;
      controls.minDistance = distance * 0.5;
      controls.update();
    },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
        alert('Model could not be loaded.');
      }
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resizing
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
    };
  }, [modelPath]);

  // Helper function to rotate the model onto its flat side and adjust vertical position
  function adjustModel(mesh, scene) {
    mesh.geometry.computeBoundingBox();
    let boundingBox = new THREE.Box3().setFromObject(mesh);
    const size = boundingBox.getSize(new THREE.Vector3());

    // Rotate model to lay flat
    if (size.y < size.x && size.y < size.z) {
      console.log('Model is already flat on the XZ plane.');
    } else if (size.x < size.y && size.x < size.z) {
      mesh.rotation.z = Math.PI / 2;
      mesh.rotation.y = Math.PI;
    } else if (size.z < size.x && size.z < size.y) {
      mesh.rotation.x = Math.PI / 2;
      mesh.rotation.y = Math.PI;
    }

    mesh.geometry.computeBoundingBox();
    boundingBox = new THREE.Box3().setFromObject(mesh);
    const minY = boundingBox.min.y;
    mesh.position.y -= minY;
  }

  // Helper function to create dynamic ground based on the model size
  function createDynamicGround(scene, mesh) {
    const boundingBox = new THREE.Box3().setFromObject(mesh);
    const size = boundingBox.getSize(new THREE.Vector3());

    const groundPaddingFactor = 2; // Ground size is larger to give some padding around the model
    const groundSize = Math.max(size.x, size.z) * groundPaddingFactor;

    // Create checkered texture for ground
    const divisions = Math.round(groundSize / 10);
    const checkeredCanvas = document.createElement('canvas');
    checkeredCanvas.width = divisions;
    checkeredCanvas.height = divisions;
    const ctx = checkeredCanvas.getContext('2d');

    for (let i = 0; i < divisions; i++) {
      for (let j = 0; j < divisions; j++) {
        ctx.fillStyle = (i + j) % 2 === 0 ? '#444444' : '#888888'; // Create a checkered pattern
        ctx.fillRect(i, j, 1, 1);
      }
    }

    const checkeredTexture = new THREE.CanvasTexture(checkeredCanvas);
    checkeredTexture.magFilter = THREE.NearestFilter;
    checkeredTexture.minFilter = THREE.LinearMipMapLinearFilter;

    // Create ground plane with checkered texture
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
    const groundMaterial = new THREE.MeshStandardMaterial({ map: checkeredTexture });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;

    scene.add(ground);
  }

  return (
    <div id="viewer-container" style={{ display: 'flex', height: '100vh', background: '#333' }}>
      <div id="model-container" style={{ width: '60%', height: '100vh', background: '#222' }}></div>
      <div id="model-info" style={{ width: '40%', padding: '20px', color: '#fff', backgroundColor: '#2c2c2c' }}>
        <h2>Model Information</h2>
        <p><strong>Model Name:</strong> d20_fair_chamfered</p>
        <p><strong>Description:</strong> Detailed information about the model can be provided here.</p>
        <p><strong>Dimensions:</strong> Placeholder for dimensions, etc.</p>
      </div>
    </div>
  );
};

export default ModelViewer;
