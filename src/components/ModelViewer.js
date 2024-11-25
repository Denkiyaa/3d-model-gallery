import React, { useEffect, useContext, useState, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { DarkModeContext } from './Context/DarkModeContext';
import { FaExpand, FaCompress, FaCube, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { modelsData } from '../data/models';
import WebGL from 'three/examples/jsm/capabilities/WebGL.js';

const ModelViewer = () => {
  const { isDarkMode: darkMode } = useContext(DarkModeContext);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentView, setCurrentView] = useState('model');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const location = useLocation();
  const modelId = location.state?.modelId;
  
  // Get the current model data
  const currentModel = modelsData.find(model => model.id === modelId) || {};
  
  const modelPath = currentModel.modelPath;
  const modelName = currentModel.name;
  const modelDescription = currentModel.description;
  const images = currentModel.images || [];

  console.log("Location state:", location.state);
  console.log("Model path:", location.state?.modelPath);
  console.log("Model name:", location.state?.modelName);

  const relatedModels = modelsData.filter(model => model.id !== parseInt(location.state?.modelId));

  // Add ref to store scene and renderer
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);

  // Function to initialize/reinitialize the 3D model
  const initializeModel = useCallback(() => {
    if (!modelPath) return;

    const container = document.getElementById('model-container');
    if (!container) return;

    // Clear previous content
    container.innerHTML = '';

    // Check for WebGL support
    if (!WebGL.isWebGLAvailable()) {
      const warning = WebGL.getWebGLErrorMessage();
      container.appendChild(warning);
      return;
    }

    try {
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      
      const aspectRatio = container.clientWidth / container.clientHeight;
      const camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 2000);
      camera.position.set(100, 100, 150);
      camera.lookAt(0, 0, 0);

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false,
          alpha: true
        });
        rendererRef.current = renderer;
      } catch (error) {
        console.error('WebGL Error:', error);
        return;
      }

      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.shadowMap.enabled = false;
      renderer.setClearColor(new THREE.Color(darkMode ? '#1e1e1e' : '#f5f5f5'));

      container.appendChild(renderer.domElement);

      // Add CSS2D renderer for labels
      const labelRenderer = new CSS2DRenderer();
      labelRenderer.setSize(container.clientWidth, container.clientHeight);
      labelRenderer.domElement.style.position = 'absolute';
      labelRenderer.domElement.style.top = '0';
      labelRenderer.domElement.style.pointerEvents = 'none';
      container.appendChild(labelRenderer.domElement);

      // Orbit Controls with optimized settings for smoother and longer spins
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true; // Enable damping for smooth interaction
      controls.rotateSpeed = 1.2; // Adjust rotate speed for more control
      controls.dampingFactor = 0.05; // Damping factor for smoother rotation
      controls.minDistance = 10; // Minimum distance from the model
      controls.maxDistance = 500; // Maximum distance from the model
      controls.update();

      // Ambient Light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Increase intensity to make everything brighter
      scene.add(ambientLight);

      // Directional Light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 3); // Increase intensity to highlight reflection
      directionalLight.position.set(10, 20, 10);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      // Move createDynamicGround inside useEffect
      const createDynamicGround = (scene, mesh) => {
        const boundingBox = new THREE.Box3().setFromObject(mesh);
        const size = boundingBox.getSize(new THREE.Vector3());
        const groundPaddingFactor = 2;
        const groundSize = Math.max(size.x, size.z) * groundPaddingFactor;

        let tileSize = Math.max(size.x, size.z) / 10;
        tileSize = Math.min(tileSize, 50);
        tileSize = Math.max(tileSize, 5);

        const divisions = Math.round(groundSize / tileSize);
        const checkeredCanvas = document.createElement('canvas');
        checkeredCanvas.width = divisions;
        checkeredCanvas.height = divisions;
        const ctx = checkeredCanvas.getContext('2d');

        const groundDarkColor = darkMode ? '#282828' : '#e8e8e8';
        const groundLightColor = darkMode ? '#323232' : '#ffffff';

        for (let i = 0; i < divisions; i++) {
          for (let j = 0; j < divisions; j++) {
            ctx.fillStyle = (i + j) % 2 === 0 ? groundDarkColor : groundLightColor;
            ctx.fillRect(i, j, 1, 1);
          }
        }

        const checkeredTexture = new THREE.CanvasTexture(checkeredCanvas);
        checkeredTexture.magFilter = THREE.NearestFilter;
        checkeredTexture.minFilter = THREE.LinearMipMapLinearFilter;

        const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
        const groundMaterial = new THREE.MeshStandardMaterial({ map: checkeredTexture });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.01;
        ground.receiveShadow = true;

        scene.add(ground);
      };

      // Load STL model
      const loader = new STLLoader();
      loader.load(
        modelPath,
        (geometry) => {
          geometry.center();
          const material = new THREE.MeshStandardMaterial({
            color: '#dcdcdc',
            metalness: 0.1,
            roughness: 0.5,
            clearcoat: 0.1,
            reflectivity: 0.2,
          });

          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = false;
          mesh.receiveShadow = true;
          scene.add(mesh);

          adjustModel(mesh, scene);
          createDynamicGround(scene, mesh);

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
        if (currentView === 'model') {
          requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        }
      };
      animate();

      // Handle window resizing
      const handleResize = () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
        labelRenderer.setSize(newWidth, newHeight);
      };
      window.addEventListener('resize', handleResize);

      // Cleanup on unmount
      return () => {
        if (rendererRef.current) {
          rendererRef.current.dispose();
        }
        if (sceneRef.current) {
          sceneRef.current.clear();
        }
        if (labelRenderer && labelRenderer.domElement && container.contains(labelRenderer.domElement)) {
          container.removeChild(labelRenderer.domElement);
        }
        window.removeEventListener('resize', handleResize);
      };
    } catch (error) {
      console.error('Setup Error:', error);
      const errorMessage = document.createElement('div');
      errorMessage.style.padding = '20px';
      errorMessage.style.color = darkMode ? '#fff' : '#000';
      errorMessage.innerHTML = `
        <h3>Error Loading Model Viewer</h3>
        <p>There was an error initializing the 3D viewer. Please try refreshing the page.</p>
      `;
      container.appendChild(errorMessage);
    }
  }, [modelPath, darkMode, currentView]);

  // Initialize model when switching to model view
  useEffect(() => {
    if (currentView === 'model') {
      initializeModel();
    }
    
    // Cleanup function
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, [currentView, initializeModel]);

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

  const toggleFullscreen = () => {
    const container = document.getElementById('viewer-container');
    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const nextView = useCallback(() => {
    if (currentView === 'model') {
      if (images.length > 0) {
        setCurrentView('image');
        setCurrentImageIndex(0);
      }
    } else {
      if (currentImageIndex >= images.length - 1) {
        setCurrentView('model');
      } else {
        setCurrentImageIndex(prev => prev + 1);
      }
    }
  }, [images.length, currentView, currentImageIndex]);

  const previousView = useCallback(() => {
    if (currentView === 'model') {
      if (images.length > 0) {
        setCurrentView('image');
        setCurrentImageIndex(images.length - 1);
      }
    } else {
      if (currentImageIndex === 0) {
        setCurrentView('model');
      } else {
        setCurrentImageIndex(prev => prev - 1);
      }
    }
  }, [images.length, currentView, currentImageIndex]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') previousView();
      if (e.key === 'ArrowRight') nextView();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nextView, previousView]);

  // Add this effect to clean up the model container when switching views
  useEffect(() => {
    const container = document.getElementById('model-container');
    if (currentView === 'image' && container) {
      container.innerHTML = '';
    }
  }, [currentView]);

  // Reset view to model when route/model changes
  useEffect(() => {
    setCurrentView('model');
    setCurrentImageIndex(0);
  }, [modelId]); // Add modelId as dependency to reset when model changes

  return (
    <>
      <Helmet>
        <title>{modelName ? `${modelName} - 3D Model Viewer` : '3D Model Viewer'}</title>
        <meta name="description" content={`View the 3D model of ${modelName}`} />
      </Helmet>
      <div 
        id="viewer-container" 
        style={{ 
          display: 'flex',
          height: '85vh',
          maxHeight: '800px',
          background: darkMode ? '#1a1a1a' : '#f8f9fa',
          padding: '16px',
          gap: '16px',
          margin: '20px',
          borderRadius: '16px',
          boxShadow: darkMode 
            ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Model Viewer Section - Made narrower */}
        <div style={{ 
          width: '60%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          minWidth: 0,
        }}>
          <div
            id="viewer-content"
            style={{
              flex: 1,
              position: 'relative',
              background: darkMode ? '#242424' : '#ffffff',
              borderRadius: '12px',
              overflow: 'hidden',
              minHeight: '400px',
              width: '100%',
              height: '100%',
            }}
          >
            {/* Navigation Arrows */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '16px',
              transform: 'translateY(-50%)',
              zIndex: 1000,
            }}>
              <button
                onClick={previousView}
                style={{
                  background: darkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  color: darkMode ? '#fff' : '#1a202c'
                }}
              >
                <FaArrowLeft />
              </button>
            </div>

            <div style={{
              position: 'absolute',
              top: '50%',
              right: '16px',
              transform: 'translateY(-50%)',
              zIndex: 1000,
            }}>
              <button
                onClick={nextView}
                style={{
                  background: darkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  color: darkMode ? '#fff' : '#1a202c'
                }}
              >
                <FaArrowRight />
              </button>
            </div>

            {/* Content Display - Separate containers */}
            {currentView === 'model' && (
              <div 
                id="model-container"
                style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%', 
                  height: '100%',
                  zIndex: 1
                }} 
              />
            )}
            
            {currentView === 'image' && (
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: darkMode ? '#242424' : '#ffffff',
                  zIndex: 2
                }}
              >
                <img
                  src={images[currentImageIndex]}
                  alt={`View ${currentImageIndex + 1}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </div>
            )}

            {/* Viewer Controls */}
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              display: 'flex',
              gap: '8px',
              background: darkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)',
              padding: '8px',
              borderRadius: '8px',
              zIndex: 1000,
            }}>
              <button
                onClick={toggleFullscreen}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: darkMode ? '#fff' : '#1a202c'
                }}
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          <div style={{
            display: 'flex',
            gap: '8px',
            padding: '12px',
            background: darkMode ? '#2d2d2d' : '#f0f0f0',
            borderRadius: '8px',
            overflowX: 'auto',
          }}>
            {/* Model thumbnail - Updated icon and styling */}
            <div
              onClick={() => setCurrentView('model')}
              style={{
                width: '80px',
                height: '80px',
                flexShrink: 0,
                borderRadius: '8px',
                border: currentView === 'model' 
                  ? `2px solid ${darkMode ? '#60a5fa' : '#3b82f6'}` 
                  : `1px solid ${darkMode ? '#404040' : '#e5e7eb'}`,
                overflow: 'hidden',
                cursor: 'pointer',
                background: darkMode ? '#333' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <FaCube size={28} color={darkMode ? '#fff' : '#666'} />
              <span style={{ 
                fontSize: '10px', 
                color: darkMode ? '#fff' : '#666',
                textAlign: 'center' 
              }}>
                3D Model
              </span>
            </div>
            
            {/* Image thumbnails */}
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`View ${index + 1}`}
                onClick={() => {
                  setCurrentView('image');
                  setCurrentImageIndex(index);
                }}
                style={{
                  width: '80px',
                  height: '80px',
                  flexShrink: 0,
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: currentView === 'image' && currentImageIndex === index 
                    ? `2px solid ${darkMode ? '#60a5fa' : '#3b82f6'}` 
                    : `1px solid ${darkMode ? '#404040' : '#e5e7eb'}`,
                  cursor: 'pointer',
                  padding: '2px',
                }}
              />
            ))}
          </div>
        </div>

        {/* Right Side Panel - Wider and horizontal layout */}
        <div style={{
          flex: 1, // Takes remaining space
          display: 'flex',
          gap: '20px',
          minWidth: '600px', // Ensure minimum width for readability
        }}>
          {/* Info Panel */}
          <div
            id="model-info"
            style={{
              flex: '1',
              padding: '24px', // Increased padding
              color: darkMode ? '#e5e7eb' : '#1f2937',
              backgroundColor: darkMode ? '#242424' : '#ffffff',
              borderRadius: '12px',
              height: 'fit-content',
            }}
          >
            <h2 style={{ 
              marginTop: 0,
              marginBottom: '24px',
              fontSize: '26px', // Increased size
              fontWeight: '600'
            }}>
              Model Information
            </h2>
            <div className="info-section">
              <h3 style={{ 
                fontSize: '18px', // Increased size
                color: darkMode ? '#9ca3af' : '#666',
                marginBottom: '12px' 
              }}>
                Model Name
              </h3>
              <p style={{ 
                fontSize: '20px', // Increased size
                marginBottom: '24px' 
              }}>
                {modelName}
              </p>
              
              <h3 style={{ 
                fontSize: '18px',
                color: darkMode ? '#9ca3af' : '#666',
                marginBottom: '12px' 
              }}>
                Description
              </h3>
              <p style={{ 
                fontSize: '16px',
                lineHeight: '1.6',
                color: darkMode ? '#d1d5db' : '#4b5563' 
              }}>
                {modelDescription || 'No description available.'}
              </p>
            </div>
          </div>

          {/* Related Models Section */}
          <div
            style={{
              width: '280px', // Fixed width for related models
              padding: '24px',
              color: darkMode ? '#e5e7eb' : '#1f2937',
              backgroundColor: darkMode ? '#242424' : '#ffffff',
              borderRadius: '12px',
              height: 'fit-content',
            }}
          >
            <h2 style={{ 
              marginTop: 0,
              marginBottom: '20px',
              fontSize: '22px',
              fontWeight: '600'
            }}>
              Other Models
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxHeight: '600px', // Add scrolling if many models
              overflowY: 'auto',
            }}>
              {relatedModels
                .filter(model => model.id !== parseInt(location.state?.modelId))
                .map(model => (
                  <Link
                    key={model.id}
                    to={`/model/${model.id}`}
                    state={{ 
                      modelPath: model.modelPath, 
                      modelName: model.name,
                      modelId: model.id
                    }}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px',
                      borderRadius: '8px',
                      background: darkMode ? '#333' : '#f3f4f6',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      ':hover': {
                        background: darkMode ? '#404040' : '#e5e7eb'
                      }
                    }}>
                      <img 
                        src={model.thumbnailPath}
                        alt={model.name}
                        style={{
                          width: '70px', // Slightly larger thumbnails
                          height: '70px',
                          objectFit: 'cover',
                          borderRadius: '6px'
                        }}
                      />
                      <div style={{
                        color: darkMode ? '#e5e7eb' : '#1f2937',
                        fontSize: '15px',
                        fontWeight: '500'
                      }}>
                        {model.name}
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModelViewer;