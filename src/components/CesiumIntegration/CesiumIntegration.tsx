import React, { useState, useEffect, useMemo } from 'react';
import { Viewer as ResiumViewer, ViewerProps } from 'resium';
import { Ion, createWorldTerrainAsync } from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
import SatelliteTrajectories from "./SatelliteTrajectories";
import { event } from "../../types/CDM"

interface CesiumIntegrationProps {
  data?: event;
}

const CesiumIntegration: React.FC<CesiumIntegrationProps> = ({ data }) => {
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

  // Fetch data functions that use the passed data
  const fetchSatellite1Data = async () => {
    if (!data) {
      console.warn('No event data provided for Satellite 1.');
      return null;
    }

    // Logic to fetch data using the `data` prop for Satellite 1
    //console.log('Fetching data for Satellite 1 with event:', data);
    return { satelliteId: data.sat1_object_designator , CDMs: data.cdms };
  };

  const fetchSatellite2Data = async () => {
    if (!data) {
      console.warn('No event data provided for Satellite 2.');
      return null;
    }

    // Logic to fetch data using the `data` prop for Satellite 2
    //console.log('Fetching data for Satellite 2 with event:', data);
    return { satelliteId: data.sat2_object_designator, CDMs: data.cdms };
  };

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
          satLabel="sat1"
          satelliteId={data?.sat1_object_designator!}
          fetchData={fetchSatellite1Data}
          updateInterval={5000}
        />
        <SatelliteTrajectories 
          satLabel="sat2"
          satelliteId={data?.sat2_object_designator!}
          fetchData={fetchSatellite2Data}
          updateInterval={5000}
        />
      </ResiumViewer>
    </div>
  );
};

export default CesiumIntegration;