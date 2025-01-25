// Enhanced City Generation with Curves and Organic Layout
// src/cityGenerator.js
export const generateCityLayout = (width, height) => {
  const buildings = [];
  const parks = [];
  const lakes = [];
  const roads = [];

  // Generate main roads with curves
  for (let i = 0; i < 4; i++) {
    const horizontalY = (i + 1) * (height / 5);
    const verticalX = (i + 1) * (width / 5);

    roads.push({
      start: [0, horizontalY],
      end: [width, horizontalY],
      curved: true,
      control: [Math.random() * width, horizontalY - 50 + Math.random() * 100],
    });

    roads.push({
      start: [verticalX, 0],
      end: [verticalX, height],
      curved: true,
      control: [verticalX - 50 + Math.random() * 100, Math.random() * height],
    });
  }

  // Generate building clusters
  for (let cluster = 0; cluster < 5; cluster++) {
    const clusterCenterX = Math.random() * (width - 200) + 100;
    const clusterCenterY = Math.random() * (height - 200) + 100;

    for (let i = 0; i < 5; i++) {
      const building = {
        x: clusterCenterX + Math.random() * 100 - 50,
        y: clusterCenterY + Math.random() * 100 - 50,
        width: Math.random() * 80 + 40,
        height: Math.random() * 80 + 40,
      };

      if (!buildings.some((b) => overlap(b, building)) && !roads.some((r) => roadOverlap(r, building))) {
        buildings.push(building);

        // Connect buildings to cluster center
        roads.push({
          start: [building.x + building.width / 2, building.y + building.height / 2],
          end: [clusterCenterX, clusterCenterY],
          curved: true,
          control: [
            (building.x + clusterCenterX) / 2 + Math.random() * 50 - 25,
            (building.y + clusterCenterY) / 2 + Math.random() * 50 - 25,
          ],
        });
      }
    }
  }

  // Generate parks
  for (let i = 0; i < 5; i++) {
    const park = {
      x: Math.random() * (width - 200),
      y: Math.random() * (height - 200),
      width: Math.random() * 150 + 50,
      height: Math.random() * 150 + 50,
    };

    if (!parks.some((p) => overlap(p, park)) && !buildings.some((b) => overlap(b, park)) && !roads.some((r) => roadOverlap(r, park))) {
      parks.push(park);
    }
  }

  // Generate lakes with irregular shapes
  for (let i = 0; i < 3; i++) {
    const lakeCenterX = Math.random() * width;
    const lakeCenterY = Math.random() * height;
    const lakePoints = [];

    for (let j = 0; j < 5; j++) {
      const angle = (Math.PI * 2 * j) / 5;
      const radius = Math.random() * 60 + 40;
      lakePoints.push({
        x: lakeCenterX + Math.cos(angle) * radius,
        y: lakeCenterY + Math.sin(angle) * radius,
      });
    }

    const lakeBounds = {
      x: lakeCenterX - 60,
      y: lakeCenterY - 60,
      width: 120,
      height: 120,
    };

    if (!lakes.some((l) => overlap(l, lakeBounds)) && !roads.some((r) => roadOverlap(r, lakeBounds)) && !buildings.some((b) => overlap(b, lakeBounds))) {
      lakes.push({ centerX: lakeCenterX, centerY: lakeCenterY, points: lakePoints });
    }
  }

  return { roads, buildings, parks, lakes };
};

const overlap = (a, b) => {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
};

const roadOverlap = (road, obj) => {
  const roadBounds = {
    x: Math.min(road.start[0], road.end[0]),
    y: Math.min(road.start[1], road.end[1]),
    width: Math.abs(road.end[0] - road.start[0]) + 20,
    height: Math.abs(road.end[1] - road.start[1]) + 20,
  };

  return overlap(roadBounds, obj);
};
