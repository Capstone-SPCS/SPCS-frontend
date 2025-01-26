import React, { useState, useEffect, useMemo } from "react";
import { Viewer as ResiumViewer, ViewerProps } from "resium";
import { Ion, createWorldTerrainAsync } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import SatelliteTrajectories from "./SatelliteTrajectories";
import { event } from "../../types/CDM";

interface CesiumIntegrationProps {
  data?: event;
}

const CesiumIntegration: React.FC<CesiumIntegrationProps> = ({ data }) => {
  const [terrainProvider, setTerrainProvider] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Set the Cesium token explicitly and validate it
  useEffect(() => {
    if (!process.env.REACT_APP_CESIUM_TOKEN) {
      console.error(
        "Cesium API token is missing. Ensure REACT_APP_CESIUM_TOKEN is set in your environment."
      );
      return;
    }

    // Set the token directly
    Ion.defaultAccessToken = process.env.REACT_APP_CESIUM_TOKEN;

    // Initialize Cesium with error handling
    const initCesium = async () => {
      try {
        const terrain = await createWorldTerrainAsync();
        setTerrainProvider(terrain);
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize Cesium:", error);
      }
    };

    initCesium();
  }, []);

  // Memoize viewer props to optimize rendering and prevent unnecessary re-renders
  const viewerProps: ViewerProps = useMemo(
    () => ({
      terrainProvider,
      full: true,
      timeline: true,
      animation: true,
      baseLayerPicker: false,
      scene3DOnly: true,
      requestRenderMode: false, // Optimize rendering performance
      maximumRenderTimeChange: Infinity,
    }),
    [terrainProvider]
  );

  // Fetch Satellite 1 data
  const fetchSatellite1Data = async () => {
    if (!data) {
      console.warn("No event data provided for Satellite 1.");
      return null;
    }
    return {
      satelliteId: data.sat1_object_designator,
      CDMs: data.cdms,
    };
  };

  // Fetch Satellite 2 data
  const fetchSatellite2Data = async () => {
    if (!data) {
      console.warn("No event data provided for Satellite 2.");
      return null;
    }
    return {
      satelliteId: data.sat2_object_designator,
      CDMs: data.cdms,
    };
  };

  // Styles for the container
  const containerStyle = {
    width: "100%",
    height: "100%",
    position: "relative" as const,
    minHeight: "400px", // Ensures visibility
  };

  // Show a loading message until Cesium is initialized
  if (!terrainProvider || !isInitialized) {
    return <div style={containerStyle}>Loading...</div>;
  }

  // Render the Cesium viewer and satellite trajectories
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
