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

interface CollisionAvoidanceTradespaceProps {
  // Primary object state vectors
  primaryPosition?: Vector3D;
  primaryVelocity?: Vector3D;
  
  // Secondary object state vectors
  secondaryPosition?: Vector3D;
  secondaryVelocity?: Vector3D;
  
  // Optional customization
  deltaVRange?: {min: number; max: number; step: number};
  timeBeforeTCARange?: {min: number; max: number; step: number};
  initialViewMode?: 'heatmap' | 'isoline';
  numberOfIsolines?: number; // Control isoline count
  displayMode: 'missDistance' | 'probability'; // Flag to switch between miss distance and probability
  title?: string; // Custom title for the visualization
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

const CollisionAvoidanceTradespace: React.FC<CollisionAvoidanceTradespaceProps> = ({
  primaryPosition,
  primaryVelocity,
  secondaryPosition,
  secondaryVelocity,
  deltaVRange,
  timeBeforeTCARange,
  initialViewMode = 'heatmap',
  numberOfIsolines = 15,
  displayMode,
  title
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [viewMode, setViewMode] = useState<'heatmap' | 'isoline'>(initialViewMode);

  useEffect(() => {
    if (!svgRef.current) return;
    
    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Define initial vectors and parameters
    // Use provided props or default values
    const Va: Vector3D = primaryVelocity || { x: 7.2, y: 0.1, z: -0.3 }; // Primary velocity at close approach (km/s)
    const Ra: Vector3D = primaryPosition || { x: 6500, y: 200, z: -350 }; // Primary position at close approach (km)
    const Vd: Vector3D = secondaryVelocity || { x: 7.3, y: 0.0, z: -0.2 }; // Secondary velocity at close approach (km/s)
    const Rd: Vector3D = secondaryPosition || { x: 6500.5, y: 200.1, z: -350.05 }; // Secondary position at close approach (km)
    
    // Calculate initial relative vectors
    const Vrel = vectorSubtract(Vd, Va);
    const Rrel = vectorSubtract(Rd, Ra);
    
    // Initial miss distance calculation using equation 12
    const initialMissDistance = calculateMissDistance(Rrel, Vrel);
    const initialProbability = Math.min(1, 100 / (initialMissDistance * initialMissDistance));
    
    // Define ranges for deltaV and times
    const dVRange = deltaVRange || { min: -0.1, max: 0.11, step: 0.01 };
    const tcaRange = timeBeforeTCARange || { min: 0, max: 24.25, step: 0.25 };
    
    const deltaVs = d3.range(dVRange.min, dVRange.max, dVRange.step); // From min to max in specified steps
    const timesBeforeTCA = d3.range(tcaRange.min, tcaRange.max, tcaRange.step).reverse(); // Reversed to have earlier times first
    
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
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Set up scales - FLIPPED AXES
    const yScale = d3.scaleLinear()
      .domain([d3.min(timesBeforeTCA) || 0, d3.max(timesBeforeTCA) || 24])
      .range([height, 0]);  // Flipped to have 0 at the bottom
    
    const xScale = d3.scaleLinear()
      .domain([d3.min(deltaVs) || -0.1, d3.max(deltaVs) || 0.1])
      .range([0, width]);   // Left to right: -0.1 to 0.1
    
    // Get the appropriate values based on displayMode
    // For probability, we use logarithmic scale to handle very small values
    const getValue = (d: ManeuverResult) => {
      if (displayMode === 'missDistance') {
        return d.missDistance;
      } else {
        // For probability, use logarithmic scale to make small differences visible
        // We add a small epsilon to avoid log(0)
        const epsilon = 1e-15;
        return Math.max(epsilon, d.probability);
      }
    };
    
    // Determine min and max values based on displayMode
    let minValue = d3.min(results, getValue) || 0;
    let maxValue = d3.max(results, getValue) || 
      (displayMode === 'missDistance' ? 10 : 1);
    
    let initialValue = displayMode === 'missDistance' 
      ? initialMissDistance 
      : initialProbability;
      
    // For probability, if the values are very small, use logarithmic scale
    let useLogScale = false;
    let logMinValue = 0;
    let logMaxValue = 0;
    let logTransform = (x: number) => x;
    let logInverse = (x: number) => x;
    
    if (displayMode === 'probability' && maxValue < 0.01) {
      useLogScale = true;
      const epsilon = 1e-15; // To avoid log(0)
      
      // Use log10 scale for probability to make small differences visible
      minValue = Math.max(epsilon, minValue);
      initialValue = Math.max(epsilon, initialValue);
      
      logMinValue = Math.log10(minValue);
      logMaxValue = Math.log10(maxValue);
      
      // Transform function to convert actual values to log space
      logTransform = (x: number) => Math.log10(Math.max(epsilon, x));
      
      // Inverse function to convert from log space back to actual values
      logInverse = (x: number) => Math.pow(10, x);
    }
    
    // Check if we have a large miss distance case
    const isLargeMissDistance = displayMode === 'missDistance' && initialMissDistance > 1000;
    
    // Create dynamic color scales based on displayMode
    let colorScale: d3.ScaleLinear<string, string>;
    
    if (isLargeMissDistance) {
      // Find min and max values
      const values = results.map(getValue);
      const sortedValues = [...values].sort((a, b) => a - b);
      
      // Get quartiles for a more dynamic distribution
      const q1 = d3.quantile(sortedValues, 0.25) || minValue;
      const q2 = d3.quantile(sortedValues, 0.5) || (minValue + maxValue) / 2;
      const q3 = d3.quantile(sortedValues, 0.75) || maxValue;
      
      // For miss distance: Red for lower miss distances, Green for higher
      colorScale = d3.scaleLinear<string>()
        .domain([minValue, q1, q2, q3, maxValue])
        .range([
          "#ff0000", // Lowest value (red)
          "#ffaa00", // Low
          "#ffff00", // Medium
          "#8aff8a", // High
          "#00ff00"  // Highest value (green)
        ]);
    } else if (displayMode === 'probability') {
      if (useLogScale) {
        // For probability with log scale: Green for lower probability, Red for higher
        colorScale = d3.scaleLinear<string>()
          .domain([logMinValue, (logMinValue + logMaxValue) / 2, logMaxValue])
          .range(["#00ff00", "#ffff00", "#ff0000"]);
      } else {
        // Regular probability: Green for lower probability, Red for higher
        colorScale = d3.scaleLinear<string>()
          .domain([minValue, (minValue + maxValue) / 2, maxValue])
          .range(["#00ff00", "#ffff00", "#ff0000"]);
      }
    } else {
      // Regular miss distance: Red for lower miss distances, Green for higher
      colorScale = d3.scaleLinear<string>()
        .domain([minValue, (minValue + maxValue) / 2, maxValue])
        .range(["#ff0000", "#ffff00", "#00ff00"]);
    }
      
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
        .attr("fill", d => {
          const value = getValue(d);
          return useLogScale 
            ? colorScale(logTransform(value)) 
            : colorScale(value);
        })
        .attr("stroke", "#999")
        .attr("stroke-width", 0.5)
        .append("title")
        .text(d => {
          const missDistanceText = isLargeMissDistance 
            ? `${(d.missDistance / 1000).toFixed(2)} Mm` 
            : `${d.missDistance.toFixed(2)} km`;
          
          const probabilityText = `${(d.probability * 100).toExponential(4)}%`;
          
          let changePercentText = '';
          if (displayMode === 'missDistance') {
            const changePercent = ((d.missDistance - initialMissDistance) / initialMissDistance * 100).toFixed(2);
            changePercentText = `\nChange from Initial: ${changePercent}%`;
          } else {
            const changeRatio = d.probability / initialProbability;
            const changePercent = ((changeRatio - 1) * 100).toFixed(2);
            changePercentText = `\nChange from Initial: ${changePercent}%`;
          }
            
          return `ΔV: ${d.deltaV.toFixed(2)} m/s\nTime: ${d.timeBeforeTCA.toFixed(2)} hours\nMiss Distance: ${missDistanceText}\nProbability: ${probabilityText}${changePercentText}`;
        });
    } else {
      // Create a 2D array for the isoline data
      const cellsX = deltaVs.length;
      const cellsY = timesBeforeTCA.length;
      const gridData = new Array(cellsY).fill(0).map(() => new Array(cellsX).fill(0));
      
      // Fill the grid with values (miss distance or probability) but in REVERSED order for Y
      // This fixes the isoline orientation issue
      results.forEach(d => {
        const xIndex = deltaVs.indexOf(d.deltaV);
        const yIndex = timesBeforeTCA.indexOf(d.timeBeforeTCA);
        if (xIndex >= 0 && yIndex >= 0) {
          // Invert the Y index to fix the isoline orientation
          const value = getValue(d);
          // For probability, use log scale if needed
          const processedValue = useLogScale ? logTransform(value) : value;
          gridData[cellsY - 1 - yIndex][xIndex] = processedValue;
        }
      });
      
      // Create dynamic thresholds based on the scale of values
      let minContourValue, maxContourValue;
      
      if (useLogScale) {
        minContourValue = logMinValue;
        maxContourValue = logMaxValue;
      } else {
        minContourValue = Math.floor(minValue * 1000) / 1000;
        maxContourValue = Math.ceil(maxValue * 1000) / 1000;
      }
      
      // For probability, create a set of meaningful thresholds
      let contourThresholds;
      if (displayMode === 'probability') {
        if (useLogScale) {
          // Generate evenly spaced thresholds in log space for very small probabilities
          contourThresholds = Array.from({ length: numberOfIsolines }, (_, i) => {
            const t = i / (numberOfIsolines - 1);
            return minContourValue + t * (maxContourValue - minContourValue);
          });
        } else {
          // For probabilities in normal range, use standard exponential thresholds
          contourThresholds = [
            0.0001, 0.001, 0.01, 0.02, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0
          ].filter(t => t >= minValue && t <= maxValue);
          
          // If not enough thresholds, add more
          if (contourThresholds.length < 5) {
            // Generate evenly spaced thresholds
            contourThresholds = Array.from({ length: numberOfIsolines }, (_, i) => {
              const t = i / (numberOfIsolines - 1);
              return minValue + t * (maxValue - minValue);
            });
          }
        }
      } else {
        // For miss distance, generate evenly spaced contour thresholds
        const contourStep = (maxContourValue - minContourValue) / numberOfIsolines;
        contourThresholds = Array.from({ length: numberOfIsolines + 1 }, (_, i) => 
          minContourValue + i * contourStep
        );
      }
      
      const contourGenerator = d3.contours()
        .size([cellsX, cellsY])
        .thresholds(contourThresholds);
      
      // Generate contours
      const contours = contourGenerator(gridData.flat());
      
      // Scale for mapping contour coordinates to our SVG space
      const contourXScale = d3.scaleLinear()
        .domain([0, cellsX])
        .range([0, width]);
        
      const contourYScale = d3.scaleLinear()
        .domain([0, cellsY])
        .range([height, 0]);
      
      // Create a contour color scale based on displayMode
      const contourColorScale = d3.scaleSequential(
        displayMode === 'probability'
          ? (t) => d3.interpolateRgb("#00ff00", "#ff0000")(t) // Green to Red for probability
          : (t) => d3.interpolateRgb("#ff0000", "#00ff00")(t) // Red to Green for miss distance
      ).domain([minContourValue, maxContourValue]);
      
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
        .attr("stroke", (d: any) => contourColorScale(d.value))
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.8);
      
      // Add labels to a subset of the contours
      // Set a fixed number of labels to avoid clutter
      const labelCount = Math.min(8, contours.length);
      const labelStep = Math.max(1, Math.floor(contours.length / labelCount));
      
      svg.selectAll(".contour-label")
        .data(contours.filter((_, i) => i % labelStep === 0))
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
        .text((d: any) => {
          const value = d.value;
          if (displayMode === 'missDistance') {
            // Format for miss distance
            if (value >= 1000) {
              return `${(value/1000).toFixed(1)} Mm`;
            } else {
              return `${value.toFixed(1)} km`;
            }
          } else {
            // Format for probability
            if (useLogScale) {
              // Convert from log space back to actual probability
              const actualValue = logInverse(value);
              return `${(actualValue * 100).toExponential(1)}%`;
            } else {
              return `${(value * 100).toExponential(1)}%`;
            }
          }
        });
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
    const defaultTitle = displayMode === 'missDistance' 
      ? "Miss Distance Tradespace" 
      : "Collision Probability Tradespace";
      
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(title || defaultTitle);
      
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
      
    // Create gradient stops with appropriate colors based on display mode
    [0, 0.25, 0.5, 0.75, 1].forEach((stop, i) => {
      let color;
      if (displayMode === 'probability') {
        // Green to Yellow to Red for probability (inverse of miss distance)
        if (stop < 0.5) {
          color = d3.interpolateRgb("#00ff00", "#ffff00")(stop * 2);
        } else {
          color = d3.interpolateRgb("#ffff00", "#ff0000")((stop - 0.5) * 2);
        }
      } else {
        // Red to Yellow to Green for miss distance
        if (stop < 0.5) {
          color = d3.interpolateRgb("#ff0000", "#ffff00")(stop * 2);
        } else {
          color = d3.interpolateRgb("#ffff00", "#00ff00")((stop - 0.5) * 2);
        }
      }
      gradient.append("stop")
        .attr("offset", `${stop * 100}%`)
        .attr("stop-color", color);
    });
    
    // Draw legend rectangle
    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)");
    
    // Add legend scale and labels
    // For log scale, use a special scale for the legend
    let legendScale;
    if (useLogScale) {
      // Create a logarithmic scale for the legend
      legendScale = d3.scaleLog()
        .domain([logInverse(logMinValue), logInverse(logMaxValue)])
        .range([legendHeight, 0]);
    } else {
      // Linear scale for normal values
      legendScale = d3.scaleLinear()
        .domain([minValue, maxValue])
        .range([legendHeight, 0]);
    }
    
    // Format the legend ticks appropriately
    const legendAxis = d3.axisRight(legendScale)
      .ticks(5)
      .tickFormat((d: any) => {
        if (displayMode === 'missDistance') {
          if (isLargeMissDistance && d >= 1000) {
            return `${(d/1000).toFixed(1)} Mm`;
          }
          return `${d.toFixed(1)} km`;
        } else {
          return `${(d * 100).toExponential(1)}%`;
        }
      });
      
    legend.append("g")
      .attr("transform", `translate(${legendWidth}, 0)`)
      .call(legendAxis);
      
    legend.append("text")
      .attr("transform", `translate(${legendWidth + 30}, ${legendHeight / 2}) rotate(90)`)
      .attr("text-anchor", "middle")
      .text(displayMode === 'missDistance' 
        ? (isLargeMissDistance ? "Miss Distance (Mm)" : "Miss Distance (km)") 
        : "Collision Probability (%)");
      
    // Add initial value reference with appropriate units
    let initialValueText = '';
    if (displayMode === 'missDistance') {
      initialValueText = isLargeMissDistance 
        ? `Initial Miss Distance: ${(initialMissDistance/1000).toFixed(2)} Mm` 
        : `Initial Miss Distance: ${initialMissDistance.toFixed(2)} km`;
    } else {
      initialValueText = `Initial Collision Probability: ${(initialProbability * 100).toExponential(4)}%`;
    }
      
    svg.append("text")
      .attr("x", 10)
      .attr("y", 20)
      .text(initialValueText)
      .style("font-size", "12px");
      
    // Add information about the visualization
    svg.append("text")
      .attr("x", 10)
      .attr("y", 40)
      .text(displayMode === 'missDistance' 
        ? "Red indicates lower miss distance, green indicates higher" 
        : "Green indicates lower probability, red indicates higher")
      .style("font-size", "12px")
      .style("fill", "#555");
      
    // Add extra information for log-scale probability
    if (useLogScale) {
      svg.append("text")
        .attr("x", 10)
        .attr("y", 60)
        .text("Using logarithmic scale for better visualization of small probability values")
        .style("font-size", "12px")
        .style("fill", "#555");
    }
  }, [viewMode, primaryPosition, primaryVelocity, secondaryPosition, secondaryVelocity, deltaVRange, timeBeforeTCARange, numberOfIsolines, displayMode, title]);
  
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