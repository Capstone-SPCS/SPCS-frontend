import React, { useEffect, useRef, useState } from "react";
import { Entity, useCesium } from "resium";
import { Cartesian3, JulianDate, SampledPositionProperty, Color, ClockRange } from "cesium";
import { CDM } from "../../types/CDM";

interface SatelliteData {
  satelliteId: string;
  CDMs: CDM[];
}

interface SatelliteTrajectoriesProps {
  satLabel : string;
  satelliteId: string;
  fetchData: () => Promise<SatelliteData | null>;
  updateInterval?: number;
}

const SatelliteTrajectories: React.FC<SatelliteTrajectoriesProps> = ({
  satLabel,
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
        const satelliteData = await fetchData();
        
        if (!satelliteData || !satelliteData.CDMs || satelliteData.CDMs.length === 0) {
          console.warn(`No valid data received for satellite ${satelliteId}`);
          return;
        }

        // Remove duplicates by creation_date
        const uniqueCDMs = Array.from(
          new Map(
            satelliteData.CDMs.map((cdm) => [cdm.creation_date, cdm])
          ).values()
        );

        // Sort CDMs by creation_date
        const sortedCDMs = uniqueCDMs.sort((a, b) =>
          new Date(a.creation_date!).getTime() - new Date(b.creation_date!).getTime()
        );

        // Clear existing samples
        positionProperty.current = new SampledPositionProperty();
        
        // Initialize clock once when component mounts
        if (viewer && !isClockInitialized) {
          const start = JulianDate.fromIso8601(sortedCDMs[0].creation_date!);
          const stop = JulianDate.fromIso8601(sortedCDMs[sortedCDMs.length - 1].creation_date!);
          
          viewer.clock.startTime = start.clone();
          viewer.clock.stopTime = stop.clone();
          viewer.clock.currentTime = start.clone();
          viewer.clock.clockRange = ClockRange.LOOP_STOP;
          viewer.clock.multiplier = 1;
          
          viewer.timeline.zoomTo(start, stop);
          setIsClockInitialized(true);
        }

        // Add position samples for each CDM
        sortedCDMs.forEach((cdm) => {
          const time = JulianDate.fromIso8601(cdm.creation_date!);
          const position = satLabel === "sat1"
            ? new Cartesian3(cdm.sat1_x!*1000, cdm.sat1_y!*1000, cdm.sat1_z!*1000)
            : new Cartesian3(cdm.sat2_x!*1000, cdm.sat2_y!*1000, cdm.sat2_z!*1000);
          
          positionProperty.current.addSample(time, position);
        });

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
        color: satLabel === "sat1" ? Color.YELLOW.withAlpha(0.7) : Color.RED.withAlpha(0.7),
        outlineColor: Color.WHITE,
        outlineWidth: 2,
      }}
      path={{
        width: 3,
        material: satLabel === "sat1" ? Color.YELLOW.withAlpha(0.7) : Color.RED.withAlpha(0.7),
        leadTime: 0,
        trailTime: Infinity,
      }}
    />
  );
};

export default SatelliteTrajectories;