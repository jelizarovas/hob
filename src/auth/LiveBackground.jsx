// src/LiveBackground.js
import React, { useEffect, useRef } from "react";

const LiveBackground = () => {
  const canvasRef = useRef(null);
  const carColors = ["white", "black", "gray", "silver", "red", "blue"];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const cars = [];
    const gridSize = 150; // Larger grid size for roads
    const roadWidth = 40; // Width of the roads
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Initialize cars
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(Math.random() * (canvasWidth / gridSize)) * gridSize + gridSize / 2;
      const y = Math.floor(Math.random() * (canvasHeight / gridSize)) * gridSize + gridSize / 2;
      const isHorizontal = Math.random() > 0.5;
      cars.push({
        x,
        y,
        speed: 0.5 + Math.random() * 0.3, // Slower speed for realistic movement
        color: carColors[Math.floor(Math.random() * carColors.length)],
        isHorizontal,
        direction: Math.random() > 0.5 ? 1 : -1,
        turnCountdown: Math.floor(200 + Math.random() * 300), // Time before turning
      });
    }

    const drawRoads = () => {
      // Draw grass areas
      ctx.fillStyle = "#333";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw roads
      ctx.fillStyle = "#444";
      for (let x = 0; x <= canvasWidth; x += gridSize) {
        ctx.fillRect(x - roadWidth / 2, 0, roadWidth, canvasHeight); // Vertical roads
      }
      for (let y = 0; y <= canvasHeight; y += gridSize) {
        ctx.fillRect(0, y - roadWidth / 2, canvasWidth, roadWidth); // Horizontal roads
      }
    };

    const drawCars = () => {
      cars.forEach((car) => {
        ctx.save();
        ctx.translate(car.x, car.y);
        if (car.isHorizontal) {
          ctx.rotate(car.direction === 1 ? 0 : Math.PI);
        } else {
          ctx.rotate(car.direction === 1 ? Math.PI / 2 : -Math.PI / 2);
        }

        ctx.fillStyle = car.color;
        ctx.beginPath();
        ctx.moveTo(-10, -5);
        ctx.lineTo(10, -5);
        ctx.lineTo(10, 5);
        ctx.lineTo(-10, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
    };

    const updateCars = () => {
      cars.forEach((car) => {
        if (car.isHorizontal) {
          car.x += car.speed * car.direction;
          if (car.x < gridSize / 2) car.x = canvasWidth - gridSize / 2;
          if (car.x > canvasWidth - gridSize / 2) car.x = gridSize / 2;
        } else {
          car.y += car.speed * car.direction;
          if (car.y < gridSize / 2) car.y = canvasHeight - gridSize / 2;
          if (car.y > canvasHeight - gridSize / 2) car.y = gridSize / 2;
        }

        car.turnCountdown--;
        if (car.turnCountdown <= 0) {
          const gridX = Math.round(car.x / gridSize) * gridSize;
          const gridY = Math.round(car.y / gridSize) * gridSize;
          car.x = gridX;
          car.y = gridY;
          car.isHorizontal = !car.isHorizontal;
          car.direction = Math.random() > 0.5 ? 1 : -1;
          car.turnCountdown = Math.floor(200 + Math.random() * 300); // Reset turn countdown
        }
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      drawRoads();
      drawCars();
      updateCars();
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
