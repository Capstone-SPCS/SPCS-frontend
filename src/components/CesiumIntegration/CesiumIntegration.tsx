// CesiumIntegration.tsx
import React, { useEffect, useRef } from 'react';
import { Cartesian3, createOsmBuildingsAsync, Ion, Math as CesiumMath, Terrain, Viewer } from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";

// Declare CESIUM_BASE_URL on window
declare global {
  interface Window {
    CESIUM_BASE_URL: string;
  }
}

const CesiumIntegration: React.FC = () => {
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Set the base URL for Cesium's static assets
      window.CESIUM_BASE_URL = '/';

      // Get the token based on the environment
      const cesiumToken = 
        process.env.CESIUM_TOKEN ||
        '';

      if (!cesiumToken) {
        console.error('Cesium Ion token not found. Please check your environment variables.');
        return;
      }

      // Initialize with your Cesium ion access token
      Ion.defaultAccessToken = cesiumToken

      // Create the viewer only if it hasn't been created yet
      if (!viewerRef.current && cesiumContainerRef.current) {
        try {
          // Initialize the Cesium Viewer
          const viewer = new Viewer(cesiumContainerRef.current, {
            terrain: Terrain.fromWorldTerrain(),
          });
          
          viewerRef.current = viewer;

          // Fly to San Francisco
          viewer.camera.flyTo({
            destination: Cartesian3.fromDegrees(-122.4175, 37.655, 400),
            orientation: {
              heading: CesiumMath.toRadians(0.0),
              pitch: CesiumMath.toRadians(-15.0),
            }
          });

          // Add 3D buildings
          const loadBuildings = async () => {
            try {
              const buildingTileset = await createOsmBuildingsAsync();
              if (viewer && !viewer.isDestroyed()) {
                viewer.scene.primitives.add(buildingTileset);
              }
            } catch (error) {
              console.error('Error loading buildings:', error);
            }
          };
          loadBuildings();
        } catch (error) {
          console.error('Error initializing Cesium viewer:', error);
        }
      }
    }

    // Cleanup function to destroy the viewer when component unmounts
    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div 
      ref={cesiumContainerRef} 
      style={{ width: '100%', height: '100%', position: 'absolute' }}
    />
  );
};

export default CesiumIntegration;