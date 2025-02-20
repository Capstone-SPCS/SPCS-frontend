import React, { useState, useEffect, useMemo } from "react";
import { Viewer as ResiumViewer, ViewerProps } from "resium";
import { Ion, createWorldTerrainAsync, JulianDate } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import SatelliteTrajectories from "./SatelliteTrajectories";
import { event } from "../../types/CDM";

interface CesiumIntegrationProps {
  data?: event;
}

const CesiumIntegration: React.FC<CesiumIntegrationProps> = ({ data }) => {
  const [terrainProvider, setTerrainProvider] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showPredictedPath, setShowPredictedPath] = useState(false);
  const [lastTime, setLastTime] = useState<JulianDate | null>(null);
  const viewerRef = React.useRef<any>(null);

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

  // Handle updating the latest time found
  const handleLastTimeFound = (time: JulianDate) => {
    setLastTime((prevTime) => {
      // Keep the latest time between satellites
      if (!prevTime || JulianDate.greaterThan(time, prevTime)) {
        return time;
      }
      return prevTime;
    });
  };

  // Toggle predicted path and jump to last frame
  const togglePrediction = () => {
    setShowPredictedPath((prev) => !prev);
    
    // Jump to last frame if we have a last time
    if (lastTime && viewerRef.current?.cesiumElement) {
      viewerRef.current.cesiumElement.clock.currentTime = lastTime.clone();
    }
  };

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
      ref: viewerRef,
    }),
    [terrainProvider]
  );

  // Fetch Satellite 1 data
  const fetchSatellite1Data = async () => {
    if (!data) {
      console.warn("No event data provided for Satellite 1.");
      return null;
    }
    else {console.log("fetched cds sat 1" , data.cdms);}
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

  // Button styles
  const buttonStyle = {
    position: "absolute" as const,
    top: "10px",
    left: "10px",
    zIndex: 1000,
    padding: "10px",
    fontSize: "16px",
    backgroundColor: showPredictedPath ? "#4CAF50" : "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
  };

  // Show a loading message until Cesium is initialized
  if (!terrainProvider || !isInitialized) {
    return <div style={containerStyle}>Loading...</div>;
  }

  // Render the Cesium viewer and satellite trajectories
  return (
    <div style={containerStyle}>
      {/* Prediction toggle button */}
      <button 
        style={buttonStyle}
        onClick={togglePrediction}
      >
        {showPredictedPath ? "Hide Predictions" : "Show Predictions"}
      </button>

      <ResiumViewer {...viewerProps}>
        <SatelliteTrajectories
          satLabel="sat1"
          satelliteId={data?.sat1_object_designator!}
          fetchData={fetchSatellite1Data}
          updateInterval={100000}
          showPredictedPath={showPredictedPath}
          onLastTimeFound={handleLastTimeFound}
        />
        <SatelliteTrajectories
          satLabel="sat2"
          satelliteId={data?.sat2_object_designator!}
          fetchData={fetchSatellite2Data}
          updateInterval={100000}
          showPredictedPath={showPredictedPath}
          onLastTimeFound={handleLastTimeFound}
        />
      </ResiumViewer>
    </div>
  );
};

export default CesiumIntegration;