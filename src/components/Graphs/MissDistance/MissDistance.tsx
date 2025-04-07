import React, { useRef, useEffect } from "react";
import styles from "./MissDistance.module.css";
import { data } from '../utils/mockData'
import * as d3 from "d3";
import { event } from "../../../types/CDM";

const MissDistance = (data: event | undefined) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (data?.id) {
      if (svgRef.current) {
        const margin = { top: 20, right: 30, bottom: 40, left: 70 };
        const width = window.innerWidth / 4.5 - margin.left - margin.right;
        const height = 250 - margin.top - margin.bottom;

        // Filter out invalid dates by directly converting timestamps to Date objects
        const validData = data?.cdms?.filter?.((d) => {
          const parsedDate = new Date(d.creation_date!);
          return !isNaN(parsedDate.getTime()) && d.creation_date != null;
        });

        // Check if validData is empty to avoid passing invalid data to d3.extent()
        if (validData?.length === 0) {
          console.error("No valid date data found.");
          return;
        }

        // sort the data based on time
        validData?.sort((a, b) => {
          return new Date(a.creation_date!).getTime() - new Date(b.creation_date!).getTime();
        });

        // Create scales
        const x = d3
          .scaleTime()
          .domain(d3.extent(validData!, (d) => new Date(d.creation_date!)) as [Date, Date])
          .range([0, width]);

        const yMissDistance = d3
          .scaleLinear()
          .domain([0, d3.max(validData!, (d) => d.miss_distance) || 0])
          .range([height, 0]);

        // Create line generator
        const lineMissDistance = d3
          .line<any>()
          .x((d: any) => x(new Date(d.creation_date!))) // Use new Date() for correct parsing
          .y((d: any) => yMissDistance(d.miss_distance));

        // Clear the previous chart elements before re-rendering
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Removes all child elements, including paths and axes

        // SVG container for miss distance graph
        const chart = svg
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

        // Pass the transformed data to the line generator
        chart
          .append("path")
          .data([validData]) // Make sure it's an array of objects with the correct structure
          .attr("class", "line")
          .attr("d", lineMissDistance as any)
          .style("stroke", "green")
          .style("fill", "none")
          .style("stroke-width", 2);

        // Create axes
        chart
          .append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x).ticks(5));

        chart
          .append("g")
          .attr("class", "y-axis")
          .call(d3.axisLeft(yMissDistance).tickFormat(d3.format(".1e"))); // ".1e" keeps 1 decimal in scientific notation


        // Add labels
        chart
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left/2 - 20)
          .attr("x", 0 - height / 2)
          .style("text-anchor", "middle")
          .text("Miss Distance (m)");

        chart
          .append("text")
          .attr("x", width / 2)
          .attr("y", height + margin.bottom - 10)
          .style("text-anchor", "middle")
          .text("Time");
      }
    }
  }, [data, window.innerWidth]);

  return (
    <div className={styles.container}>
      <h3>Miss Distance Over Time</h3>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default MissDistance;