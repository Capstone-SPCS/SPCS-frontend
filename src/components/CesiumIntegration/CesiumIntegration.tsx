import React, { useState, useEffect, useMemo } from "react";
import { Viewer as ResiumViewer, ViewerProps } from "resium";
import { Ion, createWorldTerrainAsync, JulianDate } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import SatelliteTrajectories from "./SatelliteTrajectories";
import { event } from "../../types/CDM";
import ManeuveringModal from "./ManeuveringModal";

interface CesiumIntegrationProps {
  data?: event;
}

interface ManeuverInput {
  satId: string;
  time: string;
  velocityX: string;
  velocityY: string;
  velocityZ: string;
}

const CesiumIntegration: React.FC<CesiumIntegrationProps> = ({ data }) => {
  const [terrainProvider, setTerrainProvider] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showPredictedPath, setShowPredictedPath] = useState(false);
  const [lastTime, setLastTime] = useState<JulianDate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const viewerRef = React.useRef<any>(null);
  const [maneuveringInput, setManeuveringInput] = useState<ManeuverInput | null>(null);

  useEffect(() => {
    if (!process.env.REACT_APP_CESIUM_TOKEN) {
      console.error(
        "Cesium API token is missing. Ensure REACT_APP_CESIUM_TOKEN is set in your environment."
      );
      return;
    }

    Ion.defaultAccessToken = process.env.REACT_APP_CESIUM_TOKEN;

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

  const handleLastTimeFound = (time: JulianDate) => {
    setLastTime((prevTime) => {
      if (!prevTime || JulianDate.greaterThan(time, prevTime)) {
        return time;
      }
      return prevTime;
    });
  };

  const togglePrediction = () => {
    setShowPredictedPath((prev) => !prev);
    if (lastTime && viewerRef.current?.cesiumElement) {
      viewerRef.current.cesiumElement.clock.currentTime = lastTime.clone();
    }
  };

  const viewerProps: ViewerProps = useMemo(
    () => ({
      terrainProvider,
      full: true,
      timeline: true,
      animation: true,
      baseLayerPicker: false,
      scene3DOnly: true,
      requestRenderMode: false,
      maximumRenderTimeChange: Infinity,
      ref: viewerRef,
    }),
    [terrainProvider]
  );

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

  const handleManeuveringSave = (maneuverInputs: ManeuverInput) => {
    console.log("Maneuvering options saved:", maneuverInputs);
    setManeuveringInput(maneuverInputs);
    
    // // Optionally, jump to the maneuver time in the viewer
    // if (viewerRef.current?.cesiumElement) {
    //   try {
    //     const maneuverTime = JulianDate.fromIso8601(maneuverInputs.time);
    //     viewerRef.current.cesiumElement.clock.currentTime = maneuverTime.clone();
    //   } catch (error) {
    //     console.error("Error setting clock to maneuver time:", error);
    //   }
    // }
    
    // Close the modal
    setIsModalOpen(false);
  };

  const containerStyle = {
    width: "100%",
    height: "100%",
    position: "relative" as const,
    minHeight: "400px",
  };

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

  const maneuveringButtonStyle = {
    ...buttonStyle,
    top: "50px",
    backgroundColor: "#f39c12",
  };

  const resetManeuverButtonStyle = {
    ...buttonStyle,
    top: "90px",
    backgroundColor: "#e74c3c",
    display: maneuveringInput ? "block" : "none",
  };

  if (!terrainProvider || !isInitialized) {
    return <div style={containerStyle}>Loading...</div>;
  }

  return (
    <div style={containerStyle}>
      <button style={buttonStyle} onClick={togglePrediction}>
        {showPredictedPath ? "Hide Predictions" : "Show Predictions"}
      </button>
      <button style={maneuveringButtonStyle} onClick={() => setIsModalOpen(true)}>
        Maneuvering Option
      </button>
      <button 
        style={resetManeuverButtonStyle} 
        onClick={() => setManeuveringInput(null)}
      >
        Reset Maneuver
      </button>

      <ManeuveringModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleManeuveringSave} />
      
      <ResiumViewer {...viewerProps}>
        <SatelliteTrajectories
          satLabel="sat1"
          satelliteId={data?.sat1_object_designator!}
          fetchData={fetchSatellite1Data}
          updateInterval={100000}
          showPredictedPath={showPredictedPath}
          onLastTimeFound={handleLastTimeFound}
          maneuveringInput={maneuveringInput}
        />
        <SatelliteTrajectories
          satLabel="sat2"
          satelliteId={data?.sat2_object_designator!}
          fetchData={fetchSatellite2Data}
          updateInterval={100000}
          showPredictedPath={showPredictedPath}
          onLastTimeFound={handleLastTimeFound}
          maneuveringInput={maneuveringInput}
        />
      </ResiumViewer>
    </div>
  );
};

export default CesiumIntegration;