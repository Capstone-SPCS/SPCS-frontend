import React, { useEffect, useRef } from "react";
import styles from "./Probability.module.css";
import {data} from '../utils/mockData'
import * as d3 from "d3";

const Probability = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current) {
      const margin = { top: 20, right: 30, bottom: 40, left: 40 };
      const width = 800 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      // Filter out invalid dates by directly converting timestamps to Date objects
      const validData = data.cdms.filter((d) => {
        const parsedDate = new Date(Number(d.created_at));
        return !isNaN(parsedDate.getTime());
      });

      // Check if validData is empty to avoid passing invalid data to d3.extent()
      if (validData.length === 0) {
        console.error("No valid date data found.");
        return;
      }

      // Create scales
      const x = d3
        .scaleTime()
        .domain(d3.extent(validData, (d) => new Date(Number(d.created_at))) as [Date, Date])
        .range([0, width]);

      const yCollision = d3
        .scaleLinear()
        .domain([0, 1])
        .range([height, 0]);

      // Create line generator
      const lineCollision = d3
        .line<any>()
        .x((d: any) => x(new Date(Number(d.created_at)))) // Use new Date() for correct parsing
        .y((d: any) => yCollision(d.collision_probability));

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
        .attr("d", lineCollision)
        .style("stroke", "steelblue")
        .style("fill", "none")
        .style("stroke-width", 2);

      // Create axes
      chart
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

      chart
        .append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yCollision));

      // Add labels
      chart
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - height / 2)
        .style("text-anchor", "middle")
        .text("Collision Probability");

      chart
        .append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("Time");
    }
  }, [data]);

  return (
    <div className={styles.container}>
      <h2>Collision Probability Over Time</h2>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Probability;
