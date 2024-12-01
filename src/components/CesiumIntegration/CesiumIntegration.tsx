import React, { useEffect, useRef } from 'react';
import { Cartesian3, createOsmBuildingsAsync, Ion, Math as CesiumMath, Viewer, Terrain } from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";



const CesiumIntegration: React.FC = () => {
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Ion.defaultAccessToken = process.env.REACT_APP_CESIUM_TOKEN || ''
      if (!viewerRef.current && cesiumContainerRef.current) {
        try {
          const viewer = new Viewer(cesiumContainerRef.current, {
            terrain: Terrain.fromWorldTerrain(),
          });
          viewerRef.current = viewer;

          viewer.camera.flyTo({
            destination: Cartesian3.fromDegrees(-122.4175, 37.655, 400),
            orientation: {
              heading: CesiumMath.toRadians(0.0),
              pitch: CesiumMath.toRadians(-15.0),
            },
          });

        } catch (error) {
          console.error('Error initializing Cesium viewer:', error);
        }
      }
    }

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  return <div ref={cesiumContainerRef} style={{ width: '100%', height: '100%', position: 'absolute' }} />;
};

export default CesiumIntegration;
