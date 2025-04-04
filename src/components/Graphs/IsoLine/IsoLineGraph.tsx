import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

// Define our types
interface Vector3D {
  x: number;
  y: number;
  z: number;
}

interface ManeuverResult {
  deltaV: number;
  timeBeforeTCA: number;
  missDistance: number;
  probability: number;
}

// Helper functions for vector operations
const vectorNorm = (v: Vector3D): number => {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
};

const vectorUnit = (v: Vector3D): Vector3D => {
  const norm = vectorNorm(v);
  return {
    x: v.x / norm,
    y: v.y / norm,
    z: v.z / norm
  };
};

const vectorAdd = (v1: Vector3D, v2: Vector3D): Vector3D => {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y,
    z: v1.z + v2.z
  };
};

const vectorSubtract = (v1: Vector3D, v2: Vector3D): Vector3D => {
  return {
    x: v1.x - v2.x,
    y: v1.y - v2.y,
    z: v1.z - v2.z
  };
};

const vectorScale = (v: Vector3D, scalar: number): Vector3D => {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
    z: v.z * scalar
  };
};

const dotProduct = (v1: Vector3D, v2: Vector3D): number => {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
};

const CollisionAvoidanceTradespace: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [viewMode, setViewMode] = useState<'heatmap' | 'isoline'>('heatmap');

  useEffect(() => {
    if (!svgRef.current) return;
    
    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Define example initial vectors and parameters
    const Va: Vector3D = { x: 7.2, y: 0.1, z: -0.3 }; // Primary velocity at close approach (km/s)
    const Ra: Vector3D = { x: 6500, y: 200, z: -350 }; // Primary position at close approach (km)
    const Vd: Vector3D = { x: 7.3, y: 0.0, z: -0.2 }; // Secondary velocity at close approach (km/s)
    const Rd: Vector3D = { x: 6500.5, y: 200.1, z: -350.05 }; // Secondary position at close approach (km)
    
    // Calculate initial relative vectors
    const Vrel = vectorSubtract(Vd, Va);
    const Rrel = vectorSubtract(Rd, Ra);
    
    // Initial miss distance calculation using equation 12
    const initialMissDistance = calculateMissDistance(Rrel, Vrel);
    
    // Define ranges for deltaV and times
    const deltaVs = d3.range(-0.1, 0.11, 0.01); // From -0.1 to 0.1 m/s in steps of 0.01 m/s
    const timesBeforeTCA = d3.range(0, 24.25, 0.25).reverse(); // From 0 to 24 hours in steps of 15 minutes (reversed to have earlier times first)
    
    // Calculate results for all combinations
    const results: ManeuverResult[] = [];
    
    deltaVs.forEach(deltaV => {
      timesBeforeTCA.forEach(timeBeforeTCA => {
        // For simplicity, we'll apply deltaV along the unit vector of Va
        const VaUnit = vectorUnit(Va);
        const deltaVVector = vectorScale(VaUnit, deltaV / 1000); // Convert to km/s
        
        // Time in seconds
        const timeInSeconds = timeBeforeTCA * 3600;
        
        // Calculate new position and velocity after maneuver (simplified)
        // Using equation 8: Va+ = Va + ΔV·Va^
        const newVa = vectorAdd(Va, deltaVVector);
        
        // Simplified position propagation: Ra+ = Ra - 3ΔVT·Va^
        // This is a simplified version that assumes constant acceleration
        const deltaRa = vectorScale(VaUnit, -3 * deltaV / 1000 * timeInSeconds);
        const newRa = vectorAdd(Ra, deltaRa);
        
        // Calculate new relative vectors using equation 9
        const newVrel = vectorSubtract(Vd, newVa);
        const newRrel = vectorSubtract(Rd, newRa);
        
        // Calculate new miss distance using equation 12
        const missDistance = calculateMissDistance(newRrel, newVrel);
        
        // Simplified probability calculation (would use NASA formula in real implementation)
        // For demo purposes, we'll use an inverse relationship with miss distance
        const probability = Math.min(1, 100 / (missDistance * missDistance));
        
        results.push({
          deltaV,
          timeBeforeTCA,
          missDistance,
          probability
        });
      });
    });
    
    // Set up dimensions and margins
    const margin = { top: 40, right: 80, bottom: 60, left: 60 };
    const width = 700 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    // Create SVG element
    const svg = d3.select(svgRef.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)  // This maintains the aspect ratio
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Set up scales - FLIPPED AXES
    const yScale = d3.scaleLinear()
      .domain([d3.min(timesBeforeTCA) || 0, d3.max(timesBeforeTCA) || 24])
      .range([height, 0]);  // Flipped to have 0 at the bottom
    
    const xScale = d3.scaleLinear()
      .domain([d3.min(deltaVs) || -0.1, d3.max(deltaVs) || 0.1])
      .range([0, width]);   // Left to right: -0.1 to 0.1
    
    // Determine color scale based on miss distances
    const minMissDistance = d3.min(results, d => d.missDistance) || 0;
    const maxMissDistance = d3.max(results, d => d.missDistance) || 10;
    
    const colorScale = d3.scaleLinear<string>()
      .domain([minMissDistance, (minMissDistance + maxMissDistance) / 2, maxMissDistance])
      .range(["#ff0000", "#ffff00", "#00ff00"]);
      
    if (viewMode === 'heatmap') {
      // Calculate cell dimensions
      const cellWidth = width / deltaVs.length;
      const cellHeight = height / timesBeforeTCA.length;
      
      // Create the heatmap cells
      svg.selectAll(".cell")
        .data(results)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("x", d => xScale(d.deltaV) - cellWidth / 2)
        .attr("y", d => yScale(d.timeBeforeTCA) - cellHeight / 2)
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .attr("fill", d => colorScale(d.missDistance))
        .attr("stroke", "#999")
        .attr("stroke-width", 0.5)
        .append("title")
        .text(d => `ΔV: ${d.deltaV.toFixed(2)} m/s\nTime: ${d.timeBeforeTCA.toFixed(2)} hours\nMiss Distance: ${d.missDistance.toFixed(2)} km\nProbability: ${(d.probability * 100).toFixed(4)}%`);
    } else {
      // Create a 2D array for the isoline data
      const cellsX = deltaVs.length;
      const cellsY = timesBeforeTCA.length;
      const gridData = new Array(cellsY).fill(0).map(() => new Array(cellsX).fill(0));
      
      // Fill the grid with miss distance values
      results.forEach(d => {
        const xIndex = deltaVs.indexOf(d.deltaV);
        const yIndex = timesBeforeTCA.indexOf(d.timeBeforeTCA);
        if (xIndex >= 0 && yIndex >= 0) {
          gridData[yIndex][xIndex] = d.missDistance;
        }
      });
      
      // Create contour generator
      const contourGenerator = d3.contours()
        .size([cellsX, cellsY])
        .thresholds(d3.range(1, 21, 1)); // Create contours at 1km intervals
      
      // Generate contours
      const contours = contourGenerator(gridData.flat());
      
      // Scale for mapping contour coordinates to our SVG space
      const contourXScale = d3.scaleLinear()
        .domain([0, cellsX])
        .range([0, width]);
        
      const contourYScale = d3.scaleLinear()
        .domain([0, cellsY])
        .range([height, 0]);
      
      // Draw the contours
      svg.selectAll(".contour")
        .data(contours)
        .enter()
        .append("path")
        .attr("class", "contour")
        .attr("d", d3.geoPath()
          .projection(d3.geoTransform({
            point: function(x, y) {
              this.stream.point(contourXScale(x), contourYScale(y));
            }
          }))
        )
        .attr("fill", "none")
        .attr("stroke", (d: any) => colorScale(d.value))
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.8);
      
      // Add labels to some of the contours (not every one to avoid clutter)
      svg.selectAll(".contour-label")
        .data(contours.filter((d: any, i: number) => i % 3 === 0)) // Label every third contour
        .enter()
        .append("text")
        .attr("class", "contour-label")
        .attr("transform", (d: any) => {
          // Find a good point on the contour for the label
          const [x, y] = d3.geoCentroid(d);
          return `translate(${contourXScale(x)},${contourYScale(y)})`;
        })
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("fill", "black")
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("paint-order", "stroke")
        .text((d: any) => `${d.value.toFixed(1)} km`);
    }
    
    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    
    // Add x-axis
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);
    
    // Add y-axis
    svg.append("g")
      .attr("class", "y-axis")
      .call(yAxis);
    
    // Add axis labels
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .text("ΔV (m/s)");  // X-axis is now deltaV
    
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .text("Time Before TCA (hours)");  // Y-axis is now time
    
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Collision Avoidance Maneuver Tradespace");
      
    // Add color legend
    const legendWidth = 20;
    const legendHeight = height / 2;
    
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width + 20}, ${height/4})`);
      
    // Create gradient for legend
    const defs = svg.append("defs");
    
    const gradient = defs.append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");
      
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorScale(minMissDistance));
      
    gradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", colorScale((minMissDistance + maxMissDistance) / 2));
      
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorScale(maxMissDistance));
    
    // Draw legend rectangle
    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)");
    
    // Add legend scale and labels
    const legendScale = d3.scaleLinear()
      .domain([minMissDistance, maxMissDistance])
      .range([legendHeight, 0]);
      
    const legendAxis = d3.axisRight(legendScale)
      .ticks(5);
      
    legend.append("g")
      .attr("transform", `translate(${legendWidth}, 0)`)
      .call(legendAxis);
      
    legend.append("text")
      .attr("transform", `translate(${legendWidth + 30}, ${legendHeight / 2}) rotate(90)`)
      .attr("text-anchor", "middle")
      .text("Miss Distance (km)");
      
    // Add initial miss distance reference
    svg.append("text")
      .attr("x", 10)
      .attr("y", 20)
      .text(`Initial Miss Distance: ${initialMissDistance.toFixed(2)} km`)
      .style("font-size", "12px");
  }, [viewMode]);
  
  // Function to calculate miss distance using equation 12
  const calculateMissDistance = (Rrel: Vector3D, Vrel: Vector3D): number => {
    const VrelSquared = dotProduct(Vrel, Vrel);
    
    // Calculate the factor (Rrel · Vrel) / |Vrel|²
    const factor = dotProduct(Rrel, Vrel) / VrelSquared;
    
    // Calculate Rmiss = Rrel - Vrel · (Rrel · Vrel) / |Vrel|²
    const term = vectorScale(Vrel, factor);
    const Rmiss = vectorSubtract(Rrel, term);
    
    // Return the magnitude of the miss distance vector
    return vectorNorm(Rmiss);
  };
  
// In your CollisionAvoidanceTradespace component
return (
  <div className="flex justify-center items-center flex-col p-4" style={{ width: '100%', height: '100%' }}>
    <div className="mb-4">
      <button 
        className={`px-4 py-2 mr-2 ${viewMode === 'heatmap' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        onClick={() => setViewMode('heatmap')}
      >
        Heatmap View
      </button>
      <button 
        className={`px-4 py-2 ${viewMode === 'isoline' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        onClick={() => setViewMode('isoline')}
      >
        Isoline View
      </button>
    </div>
    <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
  </div>
);
};

export default CollisionAvoidanceTradespace;