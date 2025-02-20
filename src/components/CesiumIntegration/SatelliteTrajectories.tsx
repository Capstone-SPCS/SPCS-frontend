import React, { useEffect, useRef, useState, useMemo } from "react";
import { Entity, useCesium } from "resium";
import { 
  Cartesian3, 
  JulianDate, 
  SampledPositionProperty, 
  Color, 
  ClockRange,
  PolylineDashMaterialProperty,
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
  showPredictedPath: boolean; // Control from parent
  onLastTimeFound?: (time: JulianDate) => void; // Callback to inform parent about last time
}

const createPosition = (cdm: CDM, satLabel: string): Cartesian3 => {
  return satLabel === "sat1"
    ? new Cartesian3(cdm.sat1_x! * 1000, cdm.sat1_y! * 1000, cdm.sat1_z! * 1000)
    : new Cartesian3(cdm.sat2_x! * 1000, cdm.sat2_y! * 1000, cdm.sat2_z! * 1000);
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
  const [lastTime, setLastTime] = useState<JulianDate | null>(null);
  const [isClockInitialized, setIsClockInitialized] = useState(false);

  const colors = useMemo(() => ({
    main: satLabel === "sat1" ? Color.YELLOW.withAlpha(0.7) : Color.RED.withAlpha(0.7),
    predicted: Color.CYAN.withAlpha(0.7),
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
      show: showPredictedPath, // Controlled by parent component
    },
  }), [colors, showPredictedPath]);

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
        predictedPositionProperty.current = new SampledPositionProperty(); // Reset predicted
  
        uniqueCDMs.forEach((cdm, index) => {
          const time = JulianDate.fromIso8601(cdm.creation_date!);
          const position = createPosition(cdm, satLabel);
          positionProperty.current.addSample(time, position);
  
          if (index === uniqueCDMs.length - 1) {
            console.log(`Generating predicted positions for ${satLabel}:`);
            for (let i = 1; i <= 5; i++) {
              const futureTime = JulianDate.addSeconds(time, i * 600, new JulianDate());
              const futurePosition = Cartesian3.multiplyByScalar(position, 1 + i * 0.01, new Cartesian3());
              predictedPositionProperty.current.addSample(futureTime, futurePosition);
              console.log(`Future Time: ${JulianDate.toIso8601(futureTime)}, Position:`, futurePosition);
            }
          }
        });
  
        setLastTime(stop);
        // Inform parent about the last time
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
    </>
  );
};

export default React.memo(SatelliteTrajectories);