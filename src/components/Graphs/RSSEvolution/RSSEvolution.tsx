import React, { useRef, useEffect } from "react";
import styles from "./RSSEvolution.module.css";
import { data } from "../utils/mockData"; // Assuming data is imported from a mockData file
import * as d3 from "d3";

const RSSEvolution = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current) {
      const margin = { top: 20, right: 30, bottom: 40, left: 40 };
      const width = 800 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      // Filter out invalid dates by directly converting timestamps to Date objects
      const validData = data.cdms.filter((d) => {
        const parsedDate = new Date(Number(d.created_at));
        return !isNaN(parsedDate.getTime()) && d.sat1_cn_n !== null && d.sat1_cr_r !== null && d.sat1_ct_t !== null && d.sat2_cn_n !== null && d.sat2_cr_r !== null && d.sat2_ct_t !== null;
      });

      // Check if validData is empty to avoid passing invalid data to d3.extent()
      if (validData.length === 0) {
        console.error("No valid date data found.");
        return;
      }

      // Calculate RSS errors for SAT1 and SAT2
      const rssData = validData.map((d) => ({
        time: d.created_at,
        sat1RSS: Math.sqrt(d.sat1_cn_n! + d.sat1_cr_r! + d.sat1_ct_t!),
        sat2RSS: Math.sqrt(d.sat2_cn_n! + d.sat2_cr_r! + d.sat2_ct_t!),
      }));

      console.log(rssData);


      // Create scales
      const x = d3
        .scaleTime()
        .domain(d3.extent(rssData, (d) => new Date(Number(d.time))) as [Date, Date])
        .range([0, width]);

      const y = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(rssData, (d) => Math.max(d.sat1RSS, d.sat2RSS)) || 0,
        ])
        .range([height, 0]);

      // Create line generators
      const lineSAT1 = d3
        .line<any>()
        .x((d) => x(new Date(Number(d.time))))
        .y((d) => y(d.sat1RSS));

      const lineSAT2 = d3
        .line<any>()
        .x((d) => x(new Date(Number(d.time))))
        .y((d) => y(d.sat2RSS));

      // Clear previous elements
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      // Create the chart group
      const chartGroup = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Plot SAT1 RSS line
      chartGroup
        .append("path")
        .data([rssData])
        .attr("class", "line sat1")
        .attr("d", lineSAT1)
        .style("stroke", "blue")
        .style("fill", "none")
        .style("stroke-width", 2);

      // Plot SAT2 RSS line
      chartGroup
        .append("path")
        .data([rssData])
        .attr("class", "line sat2")
        .attr("d", lineSAT2)
        .style("stroke", "green")
        .style("fill", "none")
        .style("stroke-width", 2);

      // Create axes
      chartGroup
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

      chartGroup
        .append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

      // Add labels
      chartGroup
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - height / 2)
        .style("text-anchor", "middle")
        .text("RSS Error (m)");

      chartGroup
        .append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("Time");

      // Add legend
      chartGroup
        .append("text")
        .attr("x", width - 100)
        .attr("y", 10)
        .attr("fill", "blue")
        .text("SAT1 RSS");

      chartGroup
        .append("text")
        .attr("x", width - 100)
        .attr("y", 30)
        .attr("fill", "green")
        .text("SAT2 RSS");
    }
  }, [data]);

  return (
    <div className={styles.container}>
      <h2>RSS Error Evolution for SAT1 and SAT2</h2>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default RSSEvolution;
