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
  const DEFAULT_SIZE = 1000; // 1 km default size
  
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
  
  console.log(`Ellipsoid dimensions for ${satLabel}:`, {
    radial: Number(radial),
    tangential: Number(tangential),
    normal: Number(normal),
    semiMajorAxis,
    semiMinorAxis, 
    semiVerticalAxis
  });
  
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
}) => {
  const { viewer } = useCesium();
  const positionProperty = useRef(new SampledPositionProperty());
  const predictedPositionProperty = useRef(new SampledPositionProperty());
  const ellipsoidRadiiProperty = useRef(new SampledProperty(Cartesian3));
  const ellipsoidOrientationProperty = useRef(new SampledProperty(Quaternion));
  const [lastTime, setLastTime] = useState<JulianDate | null>(null);
  const [isClockInitialized, setIsClockInitialized] = useState(false);
  const [hasValidCovariance, setHasValidCovariance] = useState(false);

  const colors = useMemo(() => ({
    main: satLabel === "sat1" ? Color.YELLOW.withAlpha(0.7) : Color.RED.withAlpha(0.7),
    predicted: Color.CYAN.withAlpha(0.7),
    ellipsoid: satLabel === "sat1" ? Color.YELLOW.withAlpha(0.3) : Color.RED.withAlpha(0.3),
  }), [satLabel]);

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
  }), [colors, showPredictedPath, hasValidCovariance]);

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
  
        positionProperty.current = new SampledPositionProperty();
        predictedPositionProperty.current = new SampledPositionProperty();
        ellipsoidRadiiProperty.current = new SampledProperty(Cartesian3);
        ellipsoidOrientationProperty.current = new SampledProperty(Quaternion);
        
        let foundValidCovariance = false;
  
        uniqueCDMs.forEach((cdm, index) => {
          const time = JulianDate.fromIso8601(cdm.creation_date!);
          const position = createPosition(cdm, satLabel);
          positionProperty.current.addSample(time, position);
          
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
              ellipsoidRadiiProperty.current.addSample(time, radii);
              ellipsoidOrientationProperty.current.addSample(time, orientation);
              foundValidCovariance = true;
            } catch (error) {
              console.error(`Error calculating ellipsoid for ${satLabel}:`, error);
            }
          }
  
          if (index === uniqueCDMs.length - 1) {
            console.log(`Generating predicted positions for ${satLabel}:`);
            
            // Use the last valid covariance data for predictions if available
            let latestRadii: Cartesian3 | undefined;
            let latestOrientation: Quaternion | undefined;
            
            try {
              latestRadii = ellipsoidRadiiProperty.current.getValue(time);
              latestOrientation = ellipsoidOrientationProperty.current.getValue(time);
            } catch (error) {
              console.log(`No valid covariance data available for ${satLabel}`);
            }
            
            for (let i = 1; i <= 5; i++) {
              const futureTime = JulianDate.addSeconds(time, i * 600, new JulianDate());
              const futurePosition = Cartesian3.multiplyByScalar(position, 1 + i * 0.01, new Cartesian3());
              predictedPositionProperty.current.addSample(futureTime, futurePosition);
              
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
                  
                  ellipsoidRadiiProperty.current.addSample(futureTime, safeFutureRadii);
                  ellipsoidOrientationProperty.current.addSample(futureTime, latestOrientation);
                } catch (error) {
                  console.error(`Error adding future ellipsoid for ${satLabel}:`, error);
                }
              }
              
              console.log(`Future Time: ${JulianDate.toIso8601(futureTime)}, Position:`, futurePosition);
            }
          }
        });
  
        setHasValidCovariance(foundValidCovariance);
        setLastTime(stop);
        if (onLastTimeFound) {
          onLastTimeFound(stop);
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
  }, [satelliteId, fetchData, updateInterval, viewer, isClockInitialized, satLabel, onLastTimeFound]);  

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
    </>
  );
};

export default React.memo(SatelliteTrajectories);