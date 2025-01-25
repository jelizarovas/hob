// Building Generator for LiveBackground
// src/LiveBackground.js
import React, { useEffect, useRef } from "react";

const LiveBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Generate decorations (buildings and grass areas)
    const decorations = createDecorations(canvasWidth, canvasHeight);

    // Generate roads
    const roads = createRoads(decorations, canvasWidth, canvasHeight);

    const drawBackground = () => {
      ctx.fillStyle = "#222"; // Dark background
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    };

    const drawDecorations = () => {
      decorations.forEach((decoration) => {
        ctx.fillStyle = decoration.type === "building" ? "#333" : "#2a2a2a";
        ctx.fillRect(
          decoration.x,
          decoration.y,
          decoration.width,
          decoration.height
        );
      });
    };

    const drawRoads = () => {
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 20; // Thicker roads for visibility
      roads.forEach((road) => {
        ctx.beginPath();
        ctx.moveTo(road.start[0], road.start[1]);
        ctx.lineTo(road.end[0], road.end[1]);
        ctx.stroke();
      });
    };

    const animate = () => {
      drawBackground();
      drawDecorations();
      drawRoads();
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />;
};

export default LiveBackground;

const createDecorations = (width, height) => {
  const decorations = [];
  for (let i = 0; i < 30; i++) { // Reduced number of decorations
    const x = Math.random() * width;
    const y = Math.random() * height;
    const widthDec = Math.random() * 100 + 50;
    const heightDec = Math.random() * 100 + 50;
    const type = Math.random() > 0.5 ? "building" : "grass";

    decorations.push({ x, y, width: widthDec, height: heightDec, type });
  }
  return decorations;
};

const createRoads = (decorations, width, height) => {
  const roads = [];
  const mainRoadSpacing = 400; // Wider spacing for major roads
  const padding = 50; // Increased padding around buildings

  // Generate main grid-like roads
  for (let x = 0; x < width; x += mainRoadSpacing) {
    roads.push({ start: [x, 0], end: [x, height], curved: false });
  }
  for (let y = 0; y < height; y += mainRoadSpacing) {
    roads.push({ start: [0, y], end: [width, y], curved: false });
  }

  // Connect key points (buildings or clusters)
  decorations.forEach((decoration) => {
    if (decoration.type === "building") {
      const centerX = decoration.x + decoration.width / 2;
      const centerY = decoration.y + decoration.height / 2;

      // Connect to the nearest main road
      const nearestRoad = roads.reduce((closest, road) => {
        const distance = Math.min(
          Math.hypot(centerX - road.start[0], centerY - road.start[1]),
          Math.hypot(centerX - road.end[0], centerY - road.end[1])
        );
        return distance < closest.distance ? { road, distance } : closest;
      }, { road: null, distance: Infinity });

      if (nearestRoad.road) {
        roads.push({
          start: [centerX, centerY],
          end: nearestRoad.road.start,
          curved: false, // Curved roads can be added here
        });
      }
    }
  });

  // Avoid overlaps with decorations
  return roads.filter((road) => {
    return !decorations.some((dec) => isRoadOverlapping(road, dec, padding));
  });
};

const isRoadOverlapping = (road, decoration, padding) => {
  const [startX, startY] = road.start;
  const [endX, endY] = road.end;

  const roadBounds = {
    x: Math.min(startX, endX) - padding,
    y: Math.min(startY, endY) - padding,
    width: Math.abs(endX - startX) + padding * 2,
    height: Math.abs(endY - startY) + padding * 2,
  };

  return (
    roadBounds.x < decoration.x + decoration.width &&
    roadBounds.x + roadBounds.width > decoration.x &&
    roadBounds.y < decoration.y + decoration.height &&
    roadBounds.y + roadBounds.height > decoration.y
  );
};
