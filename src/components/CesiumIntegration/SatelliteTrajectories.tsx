import React, { useEffect, useRef, useState } from "react";
import { Entity, useCesium } from "resium";
import { Cartesian3, JulianDate, SampledPositionProperty, Color, ClockRange } from "cesium";

interface SatelliteDataPoint {
  time: string;
  longitude: number;
  latitude: number;
  altitude: number;
}

interface SatelliteTrajectoriesProps {
  satelliteId: string;
  fetchData: () => Promise<SatelliteDataPoint[]>;
  updateInterval?: number;
}

const SatelliteTrajectories: React.FC<SatelliteTrajectoriesProps> = ({
  satelliteId,
  fetchData,
  updateInterval = 5000,
}) => {
  const { viewer } = useCesium();
  const positionProperty = useRef(new SampledPositionProperty());
  const [isClockInitialized, setIsClockInitialized] = useState(false);

  useEffect(() => {
    const updateTrajectory = async () => {
      try {
        const data = await fetchData();
        
        if (data && data.length > 0) {
          // Clear existing samples
          positionProperty.current = new SampledPositionProperty();
          
          // Only initialize clock once when component mounts
          if (viewer && !isClockInitialized) {
            const start = JulianDate.fromIso8601(data[0].time);
            const stop = JulianDate.fromIso8601(data[data.length - 1].time);
            
            viewer.clock.startTime = start.clone();
            viewer.clock.stopTime = stop.clone();
            viewer.clock.currentTime = start.clone();
            viewer.clock.clockRange = ClockRange.LOOP_STOP;
            viewer.clock.multiplier = 1;
            
            viewer.timeline.zoomTo(start, stop);
            setIsClockInitialized(true);
          }

          data.forEach((point) => {
            const time = JulianDate.fromIso8601(point.time);
            const position = Cartesian3.fromDegrees(
              point.longitude,
              point.latitude,
              point.altitude * 1000
            );
            positionProperty.current.addSample(time, position);
          });
        }
      } catch (error) {
        console.error(`Error updating trajectory for satellite ${satelliteId}:`, error);
      }
    };

    updateTrajectory();
    const interval = setInterval(updateTrajectory, updateInterval);
    return () => clearInterval(interval);
  }, [satelliteId, fetchData, updateInterval, viewer, isClockInitialized]);

  return (
    <Entity
      name={`Satellite-${satelliteId}`}
      position={positionProperty.current}
      point={{
        pixelSize: 30,
        color: satelliteId === "sat1" ? Color.YELLOW : Color.RED,
        outlineColor: Color.WHITE,
        outlineWidth: 2,
      }}
      path={{
        width: 3,
        material: satelliteId === "sat1" ? Color.YELLOW.withAlpha(0.7) : Color.RED.withAlpha(0.7),
        leadTime: 0,
        trailTime: Infinity,
      }}
    />
  );
};

export default SatelliteTrajectories;