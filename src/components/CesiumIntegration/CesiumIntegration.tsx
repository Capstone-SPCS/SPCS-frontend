import React, { useState, useEffect, useMemo } from 'react';
import { Viewer as ResiumViewer, ViewerProps } from 'resium';
import { Ion, createWorldTerrainAsync } from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
import SatelliteTrajectories from "./SatelliteTrajectories";

// Move data fetching functions outside component to prevent recreating on each render
const fetchSatellite1Data = async () => [
  { time: "2024-12-01T00:00:00Z", longitude: -75, latitude: 45, altitude: 500 },
  { time: "2024-12-01T00:30:00Z", longitude: -45, latitude: 45, altitude: 500 },
  { time: "2024-12-01T01:00:00Z", longitude: -15, latitude: 35, altitude: 500 },
  { time: "2024-12-01T01:30:00Z", longitude: 15, latitude: 25, altitude: 500 },
  { time: "2024-12-01T02:00:00Z", longitude: 45, latitude: 15, altitude: 500 },
  { time: "2024-12-01T02:30:00Z", longitude: 75, latitude: 5, altitude: 500 },
  { time: "2024-12-01T03:00:00Z", longitude: 105, latitude: -5, altitude: 500 },
  { time: "2024-12-01T03:30:00Z", longitude: 125, latitude: -15, altitude: 500 },
  { time: "2024-12-01T04:00:00Z", longitude: 150, latitude: -5, altitude: 500 },
];

const fetchSatellite2Data = async () => [
  { time: "2024-12-01T00:00:00Z", longitude: 120, latitude: -10, altitude: 400 },
  { time: "2024-12-01T00:30:00Z", longitude: 150, latitude: -5, altitude: 400 },
  { time: "2024-12-01T01:00:00Z", longitude: 180, latitude: 0, altitude: 400 },
  { time: "2024-12-01T01:30:00Z", longitude: -150, latitude: 5, altitude: 400 },
  { time: "2024-12-01T02:00:00Z", longitude: -120, latitude: 10, altitude: 400 },
  { time: "2024-12-01T02:30:00Z", longitude: -90, latitude: 15, altitude: 400 },
  { time: "2024-12-01T03:00:00Z", longitude: -60, latitude: 20, altitude: 400 },
  { time: "2024-12-01T03:30:00Z", longitude: -60, latitude: 20, altitude: 400 },
  { time: "2024-12-01T04:00:00Z", longitude: -60, latitude: 20, altitude: 400 },
];

const CesiumIntegration: React.FC = () => {
  const [terrainProvider, setTerrainProvider] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Cesium only once
  useEffect(() => {
    let mounted = true;

    const initCesium = async () => {
      if (!isInitialized && typeof window !== 'undefined') {
        try {
          // Set token only once
          if (!Ion.defaultAccessToken) {
            Ion.defaultAccessToken = process.env.REACT_APP_CESIUM_TOKEN || '';
          }

          const terrain = await createWorldTerrainAsync();
          
          if (mounted) {
            setTerrainProvider(terrain);
            setIsInitialized(true);
          }
        } catch (error) {
          console.error('Failed to initialize Cesium:', error);
        }
      }
    };

    initCesium();

    return () => {
      mounted = false;
    };
  }, [isInitialized]);

  // Memoize viewer props to prevent unnecessary re-renders
  const viewerProps: ViewerProps = useMemo(() => ({
    terrainProvider,
    full: true,
    timeline: true,
    animation: true,
    baseLayerPicker: false,
    scene3DOnly: true,
    // Add requestRenderMode to optimize rendering
    requestRenderMode: false,
    maximumRenderTimeChange: Infinity,
  }), [terrainProvider]);

  // Use a container div with explicit dimensions instead of absolute positioning
  const containerStyle = {
    width: '100%',
    height: '100%',
    position: 'relative' as const,
    minHeight: '400px', // Add minimum height to ensure visibility
  };

  if (!terrainProvider || !isInitialized) {
    return <div style={containerStyle}>Loading...</div>;
  }

  return (
    <div style={containerStyle}>
      <ResiumViewer {...viewerProps}>
        <SatelliteTrajectories
          key="sat1"
          satelliteId="sat1"
          fetchData={fetchSatellite1Data}
          updateInterval={5000}
        />
        <SatelliteTrajectories
          key="sat2"
          satelliteId="sat2"
          fetchData={fetchSatellite2Data}
          updateInterval={5000}
        />
      </ResiumViewer>
    </div>
  );
};

export default CesiumIntegration;