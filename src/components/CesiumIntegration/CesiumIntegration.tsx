import React, { useState, useEffect } from 'react';
import { Viewer as ResiumViewer, ViewerProps } from 'resium';
import { Ion, createWorldTerrainAsync } from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
import SatelliteTrajectories from "./SatelliteTrajectories";

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Ion.defaultAccessToken = process.env.REACT_APP_CESIUM_TOKEN || '';
      const initTerrain = async () => {
        const terrain = await createWorldTerrainAsync();
        setTerrainProvider(terrain);
      };
      initTerrain();
    }
  }, []);

  if (!terrainProvider) {
    return null;
  }

  const viewerProps: ViewerProps = {
    terrainProvider,
    full: true,
    timeline: true, // Enable timeline
    animation: true, // Enable animation controls
    baseLayerPicker: false,
    scene3DOnly: true,
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute' }}>
      <ResiumViewer {...viewerProps}>
        <SatelliteTrajectories
          satelliteId="sat1"
          fetchData={fetchSatellite1Data}
          updateInterval={5000}
        />
        <SatelliteTrajectories
          satelliteId="sat2"
          fetchData={fetchSatellite2Data}
          updateInterval={5000}
        />
      </ResiumViewer>
    </div>
  );
};

export default CesiumIntegration;