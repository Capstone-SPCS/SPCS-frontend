import React, { useEffect, useRef, useState, useMemo } from "react";
import { Entity, useCesium } from "resium";
import { 
  Cartesian3, 
  JulianDate, 
  SampledPositionProperty, 
  Color, 
  ClockRange,
  PolylineDashMaterialProperty,
  SampledProperty,
  Quaternion,
} from "cesium";
import { CDM } from "../../types/CDM";

interface ManeuverInput {
  satId: string;
  time: string;
  velocityX: string;
  velocityY: string;
  velocityZ: string;
}

interface SatelliteData {
  satelliteId: string;
  CDMs: CDM[];
}

interface SatelliteTrajectoriesProps {
  satLabel: string;
  satelliteId: string;
  fetchData: () => Promise<SatelliteData | null>;
  updateInterval?: number;
  showPredictedPath: boolean;
  onLastTimeFound?: (time: JulianDate) => void;
  maneuveringInput?: ManeuverInput | null;
}

const createPosition = (cdm: CDM, satLabel: string): Cartesian3 => {
  return satLabel === "sat1"
    ? new Cartesian3(cdm.sat1_x! * 1000, cdm.sat1_y! * 1000, cdm.sat1_z! * 1000)
    : new Cartesian3(cdm.sat2_x! * 1000, cdm.sat2_y! * 1000, cdm.sat2_z! * 1000);
};

// Ensure a value is within safe bounds
const boundValue = (value: number, min: number, max: number): number => {
  if (isNaN(value) || !isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
};

// A simpler approach for calculating ellipsoid dimensions with safety bounds
const calculateEllipsoidDimensions = (cdm: CDM, satLabel: string): { radii: Cartesian3, orientation: Quaternion } => {
  // Default minimum and maximum values for ellipsoid dimensions in meters
  const MIN_AXIS = 100; // 100 meters minimum size
  const MAX_AXIS = 100000; // 100 km maximum size
  
  // Get covariance values based on satellite label
  let radial = satLabel === "sat1" ? cdm.sat1_cn_r : cdm.sat2_cn_r;
  let tangential = satLabel === "sat1" ? cdm.sat1_cn_t : cdm.sat2_cn_t;
  let normal = satLabel === "sat1" ? cdm.sat1_cn_n : cdm.sat2_cn_n;
  
  // Safety checks - ensure values exist and are numeric
  if (radial === undefined || isNaN(Number(radial))) radial = 0.01;
  if (tangential === undefined || isNaN(Number(tangential))) tangential = 0.01;
  if (normal === undefined || isNaN(Number(normal))) normal = 0.01;
  
  // Scale factor (smaller to prevent errors)
  const scaleFactor = 1000;
  
  // Calculate semi-axis lengths with bounds checking
  const semiMajorAxis = boundValue(Math.sqrt(Number(radial)) * scaleFactor, MIN_AXIS, MAX_AXIS);
  const semiMinorAxis = boundValue(Math.sqrt(Number(tangential)) * scaleFactor, MIN_AXIS, MAX_AXIS);
  const semiVerticalAxis = boundValue(Math.sqrt(Number(normal)) * scaleFactor, MIN_AXIS, MAX_AXIS);
  
  // Create radii vector
  const radii = new Cartesian3(semiMajorAxis, semiMinorAxis, semiVerticalAxis);
  
  // Default orientation (no rotation)
  const orientation = Quaternion.IDENTITY.clone();
  
  return { radii, orientation };
};

const SatelliteTrajectories: React.FC<SatelliteTrajectoriesProps> = ({
  satLabel,
  satelliteId,
  fetchData,
  updateInterval = 5000,
  showPredictedPath,
  onLastTimeFound,
  maneuveringInput,
}) => {
  const { viewer } = useCesium();
  const positionProperty = useRef(new SampledPositionProperty());
  const predictedPositionProperty = useRef(new SampledPositionProperty());
  const maneuverPositionProperty = useRef(new SampledPositionProperty());
  const ellipsoidRadiiProperty = useRef(new SampledProperty(Cartesian3));
  const ellipsoidOrientationProperty = useRef(new SampledProperty(Quaternion));
  const [lastTime, setLastTime] = useState<JulianDate | null>(null);
  const [isClockInitialized, setIsClockInitialized] = useState(false);
  const [hasValidCovariance, setHasValidCovariance] = useState(false);
  const [hasManeuverData, setHasManeuverData] = useState(false);
  const [lastManeuverTime, setLastManeuverTime] = useState<string | null>(null);
  
  // Flag to avoid duplicate data fetching after maneuver
  const pendingManeuverUpdate = useRef(false);

  const colors = useMemo(() => ({
    main: satLabel === "sat1" ? Color.YELLOW.withAlpha(0.7) : Color.RED.withAlpha(0.7),
    predicted: Color.CYAN.withAlpha(0.7),
    ellipsoid: satLabel === "sat1" ? Color.YELLOW.withAlpha(0.3) : Color.RED.withAlpha(0.3),
    maneuver: Color.GREEN.withAlpha(0.7),
  }), [satLabel]);

  // Check if the current maneuver input is for this satellite
  const isManeuverForThisSatellite = useMemo(() => {
    return maneuveringInput && maneuveringInput.satId === satLabel;
  }, [maneuveringInput, satLabel]);

  // Determine if we should show the maneuver path
  const shouldShowManeuverPath = useMemo(() => {
    return hasManeuverData && isManeuverForThisSatellite;
  }, [hasManeuverData, isManeuverForThisSatellite]);

  const entityStyles = useMemo(() => ({
    point: {
      pixelSize: 30,
      color: colors.main,
      outlineColor: Color.WHITE,
      outlineWidth: 2,
    },
    pastPath: {
      width: 3,
      material: colors.main,
      leadTime: 0,
      trailTime: 86400 * 7,
      resolution: 60,
      show: true,
    },
    futurePath: {
      width: 3,
      material: new PolylineDashMaterialProperty({
        color: colors.main,
        dashLength: 16.0,
      }),
      leadTime: 86400 * 7,
      trailTime: 0,
      resolution: 60,
      show: true,
    },
    predictedPath: {
      width: 3,
      material: new PolylineDashMaterialProperty({
        color: colors.predicted,
        dashLength: 8.0,
      }),
      leadTime: 86400 * 7,
      trailTime: 0,
      resolution: 60,
      show: showPredictedPath,
    },
    maneuverPath: {
      width: 4,
      material: new PolylineDashMaterialProperty({
        color: colors.maneuver,
        dashLength: 8.0,
      }),
      leadTime: 86400 * 7,
      trailTime: 0,
      resolution: 60,
      show: shouldShowManeuverPath || false, // Convert to boolean to fix the type error
    },
    ellipsoid: {
      radii: ellipsoidRadiiProperty.current,
      material: colors.ellipsoid,
      outline: true,
      outlineColor: colors.main,
      outlineWidth: 1,
      show: showPredictedPath && hasValidCovariance,
      slicePartitions: 24,
      stackPartitions: 24,
      orientation: ellipsoidOrientationProperty.current,
    },
  }), [colors, showPredictedPath, hasValidCovariance, shouldShowManeuverPath]);

  // Reset maneuver data when the satellite changes or when maneuver input is cleared
  useEffect(() => {
    if (!maneuveringInput) {
      // Reset maneuver data when input is cleared
      console.log(`${satLabel}: No maneuver input, resetting maneuver data`);
      setHasManeuverData(false);
      setLastManeuverTime(null);
      pendingManeuverUpdate.current = false;
      // Reset the maneuver position property
      maneuverPositionProperty.current = new SampledPositionProperty();
    }
  }, [maneuveringInput, satLabel]);

  // Function to update maneuver based on position data
  const updateManeuverData = (positionData: SampledPositionProperty, maneuverTimeStr: string, velocityData: { x: number, y: number, z: number }) => {
    console.log(`${satLabel}: Attempting to update maneuver data`, {
      velocityData
    });
    
    try {
      if (!lastTime) {
        console.warn(`${satLabel}: No last time available yet`);
        return false;
      }
      
      // Use the last time from the trajectory
      const startTime = lastTime;
      const startPosition = positionData.getValue(startTime);
      
      if (startPosition) {
        console.log(`${satLabel}: Using last trajectory position as maneuver start point`, startPosition);
        
        // Create a new maneuver position property
        const newManeuverPositionProperty = new SampledPositionProperty();
        
        // Add the starting point
        newManeuverPositionProperty.addSample(startTime, startPosition);
        
        // Calculate new positions based on velocity changes
        for (let i = 1; i <= 10; i++) {
          const futureTime = JulianDate.addSeconds(startTime, i * 600, new JulianDate());
          
          // Simple linear projection based on velocity input
          const deltaX = velocityData.x * (i * 600);
          const deltaY = velocityData.y * (i * 600);
          const deltaZ = velocityData.z * (i * 600);
          
          const newPosition = new Cartesian3(
            startPosition.x + deltaX * 1000, // Convert to meters
            startPosition.y + deltaY * 1000,
            startPosition.z + deltaZ * 1000
          );
          
          newManeuverPositionProperty.addSample(futureTime, newPosition);
        }
        
        // Update the ref after all samples have been added
        maneuverPositionProperty.current = newManeuverPositionProperty;
        setHasManeuverData(true);
        
        console.log(`${satLabel}: Updated maneuver path successfully using last trajectory position`);
        return true;
      } else {
        console.warn(`${satLabel}: Could not find position at the last trajectory time`);
        return false;
      }
    } catch (error) {
      console.error(`${satLabel}: Error updating maneuver:`, error);
      return false;
    }
  };

  // Effect to handle maneuver inputs
  useEffect(() => {
    // Log the input for debugging
    console.log(`${satLabel} checking maneuver input:`, {
      maneuveringInput,
      currentSatLabel: satLabel,
      inputSatId: maneuveringInput?.satId,
      matches: maneuveringInput?.satId === satLabel
    });
    
    // First check if we have any maneuver input at all
    if (!maneuveringInput) {
      console.log(`${satLabel}: No maneuver input provided`);
      return;
    }
    
    // Now check if this input is meant for this satellite
    if (maneuveringInput.satId !== satLabel) {
      console.log(`${satLabel}: Maneuver input is for ${maneuveringInput.satId}, not for this satellite`);
      // Clear any existing maneuver data if it's not for this satellite
      if (hasManeuverData) {
        console.log(`${satLabel}: Clearing existing maneuver data since input is for different satellite`);
        setHasManeuverData(false);
        maneuverPositionProperty.current = new SampledPositionProperty();
      }
      return;
    }
    
    console.log(`${satLabel}: Processing maneuver input`, maneuveringInput);
    
    // Check if this is a new maneuver input (prevent duplicate processing)
    if (lastManeuverTime !== maneuveringInput.time) {
      console.log(`${satLabel}: New maneuver time detected`, {
        lastManeuverTime,
        newTime: maneuveringInput.time
      });
      
      setLastManeuverTime(maneuveringInput.time);
      
      const velocityData = {
        x: parseFloat(maneuveringInput.velocityX),
        y: parseFloat(maneuveringInput.velocityY),
        z: parseFloat(maneuveringInput.velocityZ)
      };
      
      // Check if all velocity components are zero - if so, clear the maneuver
      if (velocityData.x === 0 && velocityData.y === 0 && velocityData.z === 0) {
        console.log(`${satLabel}: Zero velocity detected, clearing maneuver`);
        setHasManeuverData(false);
        maneuverPositionProperty.current = new SampledPositionProperty();
        return;
      }
      
      // Attempt to update the maneuver data
      const success = updateManeuverData(
        positionProperty.current, 
        maneuveringInput.time,
        velocityData
      );
      
      if (!success) {
        // If it failed (likely because position data not loaded yet),
        // set flag to try again after next data load
        pendingManeuverUpdate.current = true;
        console.log(`${satLabel}: Scheduled maneuver update for next data load`);
      }
    } else {
      console.log(`${satLabel}: Ignoring duplicate maneuver time`, maneuveringInput.time);
    }
  }, [maneuveringInput, satLabel, lastManeuverTime, hasManeuverData]);

  useEffect(() => {
    let mounted = true;
  
    const updateTrajectory = async () => {
      try {
        const satelliteData = await fetchData();
        if (!mounted || !satelliteData?.CDMs?.length) return;
  
        const uniqueCDMs = Array.from(
          new Map(satelliteData.CDMs.map((cdm) => [cdm.creation_date, cdm])).values()
        ).sort((a, b) => 
          new Date(a.creation_date!).getTime() - new Date(b.creation_date!).getTime()
        );
  
        if (uniqueCDMs.length === 0) return;
  
        const start = JulianDate.fromIso8601(uniqueCDMs[0].creation_date!);
        const stop = JulianDate.fromIso8601(uniqueCDMs[uniqueCDMs.length - 1].creation_date!);
  
        if (viewer && !isClockInitialized) {
          viewer.clock.startTime = start.clone();
          viewer.clock.stopTime = stop.clone();
          viewer.clock.currentTime = start.clone();
          viewer.clock.clockRange = ClockRange.LOOP_STOP;
          viewer.clock.multiplier = 1;
          viewer.timeline.zoomTo(start, stop);
          setIsClockInitialized(true);
        }
  
        // Create new position properties without losing any existing maneuver data
        const newPositionProperty = new SampledPositionProperty();
        const newPredictedPositionProperty = new SampledPositionProperty();
        const newEllipsoidRadiiProperty = new SampledProperty(Cartesian3);
        const newEllipsoidOrientationProperty = new SampledProperty(Quaternion);
        
        let foundValidCovariance = false;
  
        uniqueCDMs.forEach((cdm, index) => {
          const time = JulianDate.fromIso8601(cdm.creation_date!);
          const position = createPosition(cdm, satLabel);
          newPositionProperty.addSample(time, position);
          
          // Check if CDM has required covariance data before calculating ellipsoid
          const hasCovarianceData = (satLabel === "sat1" && 
                                   cdm.sat1_cn_r !== undefined && 
                                   cdm.sat1_cn_t !== undefined && 
                                   cdm.sat1_cn_n !== undefined) || 
                                  (satLabel === "sat2" && 
                                   cdm.sat2_cn_r !== undefined && 
                                   cdm.sat2_cn_t !== undefined && 
                                   cdm.sat2_cn_n !== undefined);
          
          if (hasCovarianceData) {
            try {
              const { radii, orientation } = calculateEllipsoidDimensions(cdm, satLabel);
              newEllipsoidRadiiProperty.addSample(time, radii);
              newEllipsoidOrientationProperty.addSample(time, orientation);
              foundValidCovariance = true;
            } catch (error) {
              console.error(`Error calculating ellipsoid for ${satLabel}:`, error);
            }
          }
  
          if (index === uniqueCDMs.length - 1) {
            console.log(`Generating predicted positions for ${satLabel}`);
            
            // Use the last valid covariance data for predictions if available
            let latestRadii: Cartesian3 | undefined;
            let latestOrientation: Quaternion | undefined;
            
            try {
              latestRadii = newEllipsoidRadiiProperty.getValue(time);
              latestOrientation = newEllipsoidOrientationProperty.getValue(time);
            } catch (error) {
              console.log(`No valid covariance data available for ${satLabel}`);
            }
            
            for (let i = 0; i <= 5; i++) {
              const futureTime = JulianDate.addSeconds(time, i * 600, new JulianDate());
              const futurePosition = Cartesian3.multiplyByScalar(position, 1 + i * 0.01, new Cartesian3());
              newPredictedPositionProperty.addSample(futureTime, futurePosition);
              
              // Add future ellipsoid properties if we have covariance data
              if (latestRadii && latestOrientation) {
                try {
                  // For predictions, make the ellipsoid grow slightly with time
                  const growthFactor = 1 + (i * 0.05);
                  const futureRadii = Cartesian3.multiplyByScalar(latestRadii, growthFactor, new Cartesian3());
                  
                  // Safety check on predicted dimensions
                  const x = boundValue(futureRadii.x, 100, 100000);
                  const y = boundValue(futureRadii.y, 100, 100000);
                  const z = boundValue(futureRadii.z, 100, 100000);
                  
                  const safeFutureRadii = new Cartesian3(x, y, z);
                  
                  newEllipsoidRadiiProperty.addSample(futureTime, safeFutureRadii);
                  newEllipsoidOrientationProperty.addSample(futureTime, latestOrientation);
                } catch (error) {
                  console.error(`Error adding future ellipsoid for ${satLabel}:`, error);
                }
              }
            }
          }
        });
  
        // Only after all processing is successful, update the ref objects
        positionProperty.current = newPositionProperty;
        predictedPositionProperty.current = newPredictedPositionProperty;
        ellipsoidRadiiProperty.current = newEllipsoidRadiiProperty;
        ellipsoidOrientationProperty.current = newEllipsoidOrientationProperty;
        
        setHasValidCovariance(foundValidCovariance);
        setLastTime(stop);
        if (onLastTimeFound) {
          onLastTimeFound(stop);
        }
        
        // If we had a pending maneuver update, try again now that we have position data
        if (pendingManeuverUpdate.current && lastManeuverTime && maneuveringInput && maneuveringInput.satId === satLabel) {
          console.log(`${satLabel}: Attempting previously scheduled maneuver update`);
          
          const velocityData = {
            x: parseFloat(maneuveringInput.velocityX),
            y: parseFloat(maneuveringInput.velocityY),
            z: parseFloat(maneuveringInput.velocityZ)
          };
          
          // Check if all velocity components are zero - if so, clear the maneuver
          if (velocityData.x === 0 && velocityData.y === 0 && velocityData.z === 0) {
            console.log(`${satLabel}: Zero velocity detected, clearing maneuver`);
            setHasManeuverData(false);
            maneuverPositionProperty.current = new SampledPositionProperty();
            pendingManeuverUpdate.current = false;
            return;
          }
          
          const success = updateManeuverData(
            newPositionProperty, 
            lastManeuverTime,
            velocityData
          );
          
          if (success) {
            pendingManeuverUpdate.current = false;
          }
        }
  
      } catch (error) {
        console.error(`Error updating trajectory for satellite ${satelliteId}:`, error);
      }
    };
  
    updateTrajectory();
    const interval = setInterval(updateTrajectory, updateInterval);
  
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [satelliteId, fetchData, updateInterval, viewer, isClockInitialized, satLabel, onLastTimeFound, maneuveringInput]);  

  return (
    <>
      <Entity
        name={`Satellite-${satelliteId}`}
        position={positionProperty.current}
        point={entityStyles.point}
      />
      <Entity
        name={`Past-Path-${satelliteId}`}
        position={positionProperty.current}
        path={entityStyles.pastPath}
      />
      <Entity
        name={`Future-Path-${satelliteId}`}
        position={positionProperty.current}
        path={entityStyles.futurePath}
      />
      {showPredictedPath && (
        <Entity
          name={`Predicted-Path-${satelliteId}`}
          position={predictedPositionProperty.current}
          path={entityStyles.predictedPath}
        />
      )}
      {showPredictedPath && hasValidCovariance && (
        <Entity
          name={`Uncertainty-Ellipsoid-${satelliteId}`}
          position={positionProperty.current}
          ellipsoid={entityStyles.ellipsoid}
        />
      )}
      {shouldShowManeuverPath && (
        <Entity
          name={`Maneuver-Path-${satLabel}`}
          position={maneuverPositionProperty.current}
          path={entityStyles.maneuverPath}
        />
      )}
    </>
  );
};

export default React.memo(SatelliteTrajectories);