const canvas = document.querySelector('#village-canvas');
const ctx = canvas.getContext('2d');
const GRID = 20;

const buildings = [
  { id: 'hall', name: 'Town Hall', icon: '🏰', kind: 'hall', category: 'special', price: 0, size: 2, color: '#d6a33e', desc: 'The heart of your empire. Keep it safe.' },
  { id: 'mine', name: 'Gold Mine', icon: '⛏️', kind: 'mine', category: 'resource', price: 180, size: 1, color: '#cf9b35', desc: 'Produces gold for new buildings and upgrades.' },
  { id: 'pump', name: 'Elixir Pump', icon: '🧪', kind: 'pump', category: 'resource', price: 180, size: 1, color: '#c661d0', desc: 'Collects elixir for your growing army.' },
  { id: 'storage', name: 'Gold Store', icon: '🪙', kind: 'storage', category: 'resource', price: 250, size: 1, color: '#e0ad48', desc: 'Keeps the gold your empire has collected.' },
  { id: 'barracks', name: 'Barracks', icon: '⚔️', kind: 'barracks', category: 'army', price: 300, size: 2, color: '#8a563c', desc: 'Recruit the first soldiers for your empire.' },
  { id: 'camp', name: 'Army Camp', icon: '⛺', kind: 'camp', category: 'army', price: 240, size: 2, color: '#97713b', desc: 'Gives your troops a place to gather.' },
  { id: 'cannon', name: 'Cannon', icon: '💣', kind: 'cannon', category: 'defense', price: 350, size: 1, color: '#556575', desc: 'A sturdy defense to protect your village.' },
  { id: 'tower', name: 'Archer Tower', icon: '🏹', kind: 'tower', category: 'defense', price: 420, size: 1, color: '#7553a1', desc: 'A tall lookout that watches over your walls.' },
  { id: 'wall', name: 'Stone Wall', icon: '🧱', kind: 'wall', category: 'defense', price: 45, size: 1, color: '#59626b', desc: 'A strong stone section for your defenses.' }
];

let zoom = 1;
let tileWidth = 52;
let tileHeight = 26;
let centerX = 0;
let centerY = 0;
let selectedBuilding = null;
let pendingBuilding = null;

let placed = [
  { ...buildings[0], x: 9, y: 9, level: 1 },
  { ...buildings[1], x: 6, y: 8, level: 1 },
  { ...buildings[2], x: 12, y: 8, level: 1 },
  { ...buildings[3], x: 6, y: 11, level: 1 },
  { ...buildings[4], x: 12, y: 11, level: 1 },
  { ...buildings[5], x: 8, y: 14, level: 1 },
  { ...buildings[6], x: 5, y: 13, level: 1 },
  { ...buildings[7], x: 14, y: 13, level: 1 }
];

const SAVE_KEY = 'coe-local-village-layout';

function saveVillageLayout() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(placed));
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.floor(rect.width * ratio);
  canvas.height = Math.floor(rect.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const width = rect.width;
  const height = rect.height;

  tileWidth = Math.min(62, Math.max(34, Math.min(width / 24, height / 12))) * zoom;
  tileHeight = tileWidth * 0.52;
  centerX = width / 2;
  centerY = height / 2 - tileHeight * 1.5;

  draw();
}

function iso(x, y, lift = 0) {
  return {
    x: centerX + (x - y) * tileWidth / 2,
    y: centerY + (x + y - GRID) * tileHeight / 2 - lift
  };
}

function polygon(points, fill, stroke = 'rgba(48,59,31,.4)', width = 1) {
  ctx.beginPath();

  points.forEach((point, index) => {
    if (index) {
      ctx.lineTo(point.x, point.y);
    } else {
      ctx.moveTo(point.x, point.y);
    }
  });

  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
}

function diamond(x, y, color, stroke) {
  const point = iso(x, y);

  polygon([
    { x: point.x, y: point.y - tileHeight / 2 },
    { x: point.x + tileWidth / 2, y: point.y },
    { x: point.x, y: point.y + tileHeight / 2 },
    { x: point.x - tileWidth / 2, y: point.y }
  ], color, stroke, 0.8);
}

function drawGround() {
  const grass = ['#79b849', '#82bd50', '#76ad43', '#8ac357', '#70a83e'];

  for (let sum = 0; sum <= GRID * 2 - 2; sum++) {
    for (
      let x = Math.max(0, sum - GRID + 1);
      x <= Math.min(GRID - 1, sum);
      x++
    ) {
      const y = sum - x;
      const variation = (x * 17 + y * 31 + x * y) % grass.length;

      diamond(x, y, grass[variation], 'rgba(220,239,154,.12)');

      if ((x * 7 + y * 11) % 17 === 0) {
        const point = iso(x, y);

        ctx.fillStyle = '#deeb91a8';
        ctx.beginPath();
        ctx.arc(
          point.x + ((x % 3) - 1) * 8,
          point.y + ((y % 3) - 1) * 3,
          1.4,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }

  const path = [
    [9, 18], [9, 17], [9, 16], [10, 15], [10, 14],
    [10, 13], [10, 12], [10, 11], [10, 10]
  ];

  path.forEach(([x, y]) => {
    diamond(x, y, '#b6995b', 'rgba(97,70,34,.16)');
  });
}

function drawTree(x, y, variant = 0) {
  const point = iso(x, y);
  const size = tileWidth * 0.17;

  ctx.fillStyle = '#254c2e55';
  ctx.beginPath();
  ctx.ellipse(point.x + 4, point.y + 5, size * 1.2, size * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = variant % 2 ? '#79502c' : '#8e6033';
  ctx.fillRect(point.x - size * 0.16, point.y - size * 0.65, size * 0.32, size * 0.9);

  const colors = variant % 3 === 0
    ? ['#326b37', '#438744', '#70ad4d']
    : ['#287547', '#3a9558', '#70bd65'];

  for (let layer = 0; layer < 3; layer++) {
    const yPosition = point.y - size * (1.5 + layer * 0.57);

    ctx.fillStyle = colors[layer];
    ctx.beginPath();
    ctx.moveTo(point.x, yPosition - size * 0.75);
    ctx.lineTo(point.x + size * (0.82 - layer * 0.13), yPosition + size * 0.32);
    ctx.lineTo(point.x - size * (0.82 - layer * 0.13), yPosition + size * 0.32);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#2c612f55';
    ctx.stroke();
  }
}

function drawDecorations() {
  const trees = [
    [1, 4], [2, 15], [3, 2], [4, 18], [16, 2], [17, 5], [18, 15],
    [16, 18], [2, 10], [18, 9], [5, 3], [14, 3], [3, 17], [17, 17]
  ];

  trees.forEach(([x, y], index) => drawTree(x, y, index));

  const flowers = [[2, 7], [17, 12], [4, 5], [15, 16], [3, 13]];

  for (const [x, y] of flowers) {
    const point = iso(x, y);

    ctx.fillStyle = '#f7dd7b';
    ctx.beginPath();
    ctx.arc(point.x, point.y - 4, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e56f67';
    ctx.beginPath();
    ctx.arc(point.x + 4, point.y - 2, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function buildingBase(x, y, size = 1) {
  const a = iso(x, y);
  const b = iso(x + size, y);
  const c = iso(x + size, y + size);
  const d = iso(x, y + size);

  ctx.fillStyle = '#315a2a55';
  ctx.beginPath();
  ctx.ellipse(
    (a.x + c.x) / 2 + 3,
    (a.y + c.y) / 2 + 7,
    tileWidth * size * 0.48,
    tileHeight * size * 0.42,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  polygon([a, b, c, d], '#7d8c58', '#4c653a', 1.5);

  return {
    mid: {
      x: (a.x + c.x) / 2,
      y: (a.y + c.y) / 2
    }
  };
}

function drawWalls() {
  const wallTiles = [
    [8, 8], [9, 8], [10, 8], [11, 8],
    [8, 9], [11, 9], [8, 10], [11, 10],
    [8, 11], [9, 11], [10, 11], [11, 11]
  ];

  for (const [x, y] of wallTiles) {
    const point = iso(x, y);
    const width = tileWidth * 0.37;
    const height = tileHeight * 0.34;

    polygon([
      { x: point.x, y: point.y - height },
      { x: point.x + width, y: point.y },
      { x: point.x, y: point.y + height },
      { x: point.x - width, y: point.y }
    ], '#66727a', '#313e42', 1.4);

    polygon([
      { x: point.x - width, y: point.y },
      { x: point.x, y: point.y + height },
      { x: point.x, y: point.y + height + 4 },
      { x: point.x - width, y: point.y + 4 }
    ], '#424d54', '#313e42', 0.8);

    polygon([
      { x: point.x, y: point.y + height },
      { x: point.x + width, y: point.y },
      { x: point.x + width, y: point.y + 4 },
      { x: point.x, y: point.y + height + 4 }
    ], '#536067', '#313e42', 0.8);

    ctx.fillStyle = '#a6b2ae';
    ctx.fillRect(point.x - 3, point.y - 1, 6, 2);
  }
}

function drawBuilding(building) {
  const size = building.size || 1;
  const base = buildingBase(building.x, building.y, size);
  const point = base.mid;
  const scale = tileWidth / 56;
  const lift = size === 2 ? 34 * scale : 25 * scale;

  if (building.kind === 'wall') {
    polygon([
      { x: point.x - 15 * scale, y: point.y - 5 * scale },
      { x: point.x, y: point.y - 13 * scale },
      { x: point.x + 15 * scale, y: point.y - 5 * scale },
      { x: point.x, y: point.y + 3 * scale }
    ], '#9ba5a8', '#485257', 1.4);

    polygon([
      { x: point.x - 15 * scale, y: point.y - 5 * scale },
      { x: point.x, y: point.y + 3 * scale },
      { x: point.x, y: point.y + 13 * scale },
      { x: point.x - 15 * scale, y: point.y + 5 * scale }
    ], '#59636a', '#414a4e');

    polygon([
      { x: point.x, y: point.y + 3 * scale },
      { x: point.x + 15 * scale, y: point.y - 5 * scale },
      { x: point.x + 15 * scale, y: point.y + 5 * scale },
      { x: point.x, y: point.y + 13 * scale }
    ], '#737e82', '#414a4e');

    return;
  }

  polygon([
    { x: point.x - 18 * scale, y: point.y - 6 * scale },
    { x: point.x, y: point.y + 4 * scale },
    { x: point.x + 18 * scale, y: point.y - 6 * scale },
    { x: point.x, y: point.y - 16 * scale }
  ], '#c6b783', '#594b32', 1.2);

  polygon([
    { x: point.x - 18 * scale, y: point.y - 6 * scale },
    { x: point.x, y: point.y + 4 * scale },
    { x: point.x, y: point.y + 4 * scale + lift },
    { x: point.x - 18 * scale, y: point.y - 6 * scale + lift }
  ], '#8b6842', '#56452e');

  polygon([
    { x: point.x, y: point.y + 4 * scale },
    { x: point.x + 18 * scale, y: point.y - 6 * scale },
    { x: point.x + 18 * scale, y: point.y - 6 * scale + lift },
    { x: point.x, y: point.y + 4 * scale + lift }
  ], '#604c38', '#443927');

  if (building.kind === 'hall') {
    polygon([
      { x: point.x - 20 * scale, y: point.y - 10 * scale },
      { x: point.x, y: point.y - 25 * scale },
      { x: point.x + 20 * scale, y: point.y - 10 * scale },
      { x: point.x, y: point.y + 2 * scale }
    ], '#c75737', '#633d2c', 1.6);

    polygon([
      { x: point.x - 13 * scale, y: point.y - 8 * scale },
      { x: point.x, y: point.y - 18 * scale },
      { x: point.x, y: point.y - 4 * scale },
      { x: point.x - 13 * scale, y: point.y + 3 * scale }
    ], '#ddb873', '#5a442e');

    polygon([
      { x: point.x, y: point.y - 18 * scale },
      { x: point.x + 13 * scale, y: point.y - 8 * scale },
      { x: point.x + 13 * scale, y: point.y + 3 * scale },
      { x: point.x, y: point.y - 4 * scale }
    ], '#ba8b48', '#5a442e');

    ctx.fillStyle = '#f4d878';
    ctx.fillRect(point.x - 3 * scale, point.y - 12 * scale, 6 * scale, 8 * scale);
    ctx.fillStyle = '#6f3929';
    ctx.fillRect(point.x - 4 * scale, point.y - 1 * scale, 8 * scale, 9 * scale);
    ctx.fillStyle = '#f7dd81';
    ctx.fillRect(point.x + 16 * scale, point.y - 29 * scale, 2 * scale, 16 * scale);
    ctx.fillStyle = '#d84a38';
    ctx.beginPath();
    ctx.moveTo(point.x + 18 * scale, point.y - 28 * scale);
    ctx.lineTo(point.x + 29 * scale, point.y - 25 * scale);
    ctx.lineTo(point.x + 18 * scale, point.y - 21 * scale);
    ctx.fill();
  } else if (building.kind === 'mine') {
    ctx.fillStyle = '#745039';
    ctx.beginPath();
    ctx.ellipse(point.x, point.y - 17 * scale, 15 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#dbad48';
    ctx.beginPath();
    ctx.ellipse(point.x, point.y - 18 * scale, 12 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#674328';
    ctx.fillRect(point.x - 3 * scale, point.y - 36 * scale, 6 * scale, 20 * scale);
    ctx.fillStyle = '#f5d278';
    ctx.fillRect(point.x - 14 * scale, point.y - 29 * scale, 28 * scale, 4 * scale);
    ctx.fillStyle = '#56402a';
    ctx.fillRect(point.x - 2 * scale, point.y - 38 * scale, 4 * scale, 15 * scale);

    ctx.fillStyle = '#fff0a8';
    ctx.beginPath();
    ctx.arc(point.x, point.y - 39 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.fill();
  } else if (building.kind === 'pump') {
    ctx.fillStyle = '#854e99';
    ctx.fillRect(point.x - 11 * scale, point.y - 27 * scale, 22 * scale, 24 * scale);
    ctx.fillStyle = '#ca5ed0';
    ctx.beginPath();
    ctx.ellipse(point.x, point.y - 27 * scale, 11 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#efb4fa';
    ctx.beginPath();
    ctx.ellipse(point.x, point.y - 28 * scale, 7 * scale, 3 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#7d4690';
    ctx.fillRect(point.x - 14 * scale, point.y - 5 * scale, 28 * scale, 5 * scale);
    ctx.fillStyle = '#f5d889';
    ctx.fillRect(point.x - 2 * scale, point.y - 38 * scale, 4 * scale, 12 * scale);
  } else if (building.kind === 'storage') {
    ctx.fillStyle = '#b47932';
    ctx.beginPath();
    ctx.ellipse(point.x, point.y - 17 * scale, 13 * scale, 9 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e0aa3b';
    ctx.beginPath();
    ctx.ellipse(point.x, point.y - 21 * scale, 12 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffde77';
    ctx.beginPath();
    ctx.ellipse(point.x, point.y - 21 * scale, 7 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (building.kind === 'barracks') {
    polygon([
      { x: point.x - 18 * scale, y: point.y - 16 * scale },
      { x: point.x, y: point.y - 31 * scale },
      { x: point.x + 18 * scale, y: point.y - 16 * scale },
      { x: point.x, y: point.y - 5 * scale }
    ], '#a34e32', '#583a2b', 1.4);

    polygon([
      { x: point.x - 14 * scale, y: point.y - 14 * scale },
      { x: point.x, y: point.y - 3 * scale },
      { x: point.x, y: point.y + 9 * scale },
      { x: point.x - 14 * scale, y: point.y - 1 * scale }
    ], '#d1a26a');

    polygon([
      { x: point.x, y: point.y - 3 * scale },
      { x: point.x + 14 * scale, y: point.y - 14 * scale },
      { x: point.x + 14 * scale, y: point.y - 1 * scale },
      { x: point.x, y: point.y + 9 * scale }
    ], '#8d633e');

    ctx.fillStyle = '#50392b';
    ctx.fillRect(point.x - 4 * scale, point.y - 12 * scale, 8 * scale, 17 * scale);
    ctx.fillStyle = '#ffd77d';
    ctx.fillRect(point.x - 13 * scale, point.y - 11 * scale, 4 * scale, 4 * scale);
    ctx.fillRect(point.x + 9 * scale, point.y - 11 * scale, 4 * scale, 4 * scale);
  } else if (building.kind === 'camp') {
    polygon([
      { x: point.x - 22 * scale, y: point.y - 5 * scale },
      { x: point.x, y: point.y - 30 * scale },
      { x: point.x + 22 * scale, y: point.y - 5 * scale }
    ], '#c49a4b', '#68492c', 1.5);

    polygon([
      { x: point.x - 22 * scale, y: point.y - 5 * scale },
      { x: point.x, y: point.y - 30 * scale },
      { x: point.x, y: point.y + 2 * scale }
    ], '#e0bc6c', '#68492c');

    polygon([
      { x: point.x, y: point.y - 30 * scale },
      { x: point.x + 22 * scale, y: point.y - 5 * scale },
      { x: point.x, y: point.y + 2 * scale }
    ], '#9d6337', '#68492c');

    ctx.fillStyle = '#f3a63e';
    ctx.beginPath();
    ctx.arc(point.x + 22 * scale, point.y - 1 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffe07c';
    ctx.beginPath();
    ctx.arc(point.x + 22 * scale, point.y - 2 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.fill();
  } else if (building.kind === 'cannon') {
    ctx.fillStyle = '#4c5962';
    ctx.beginPath();
    ctx.ellipse(point.x, point.y - 10 * scale, 14 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#88959b';
    ctx.beginPath();
    ctx.ellipse(point.x, point.y - 14 * scale, 11 * scale, 7 * scale, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(point.x + 7 * scale, point.y - 20 * scale);
    ctx.rotate(-0.55);
    ctx.fillStyle = '#55626a';
    ctx.fillRect(-3 * scale, -14 * scale, 7 * scale, 17 * scale);
    ctx.fillStyle = '#b3bdba';
    ctx.fillRect(-3 * scale, -14 * scale, 7 * scale, 3 * scale);
    ctx.restore();

    ctx.fillStyle = '#343e45';
    ctx.beginPath();
    ctx.arc(point.x - 11 * scale, point.y - 5 * scale, 5 * scale, 0, Math.PI * 2);
    ctx.arc(point.x + 11 * scale, point.y - 5 * scale, 5 * scale, 0, Math.PI * 2);
    ctx.fill();
  } else if (building.kind === 'tower') {
    ctx.fillStyle = '#7353a0';
    ctx.fillRect(point.x - 8 * scale, point.y - 49 * scale, 16 * scale, 47 * scale);
    ctx.fillStyle = '#a88ad0';
    ctx.fillRect(point.x - 7 * scale, point.y - 46 * scale, 5 * scale, 40 * scale);
    ctx.fillStyle = '#543d79';
    ctx.fillRect(point.x - 14 * scale, point.y - 53 * scale, 28 * scale, 7 * scale);
    ctx.fillStyle = '#cfb4e9';
    ctx.fillRect(point.x - 17 * scale, point.y - 57 * scale, 7 * scale, 11 * scale);
    ctx.fillRect(point.x + 10 * scale, point.y - 57 * scale, 7 * scale, 11 * scale);
    ctx.fillStyle = '#f1cd6d';
    ctx.fillRect(point.x - 2 * scale, point.y - 41 * scale, 4 * scale, 8 * scale);
  }

  if (building.level > 1) {
    ctx.fillStyle = '#fff0a1';
    ctx.beginPath();
    ctx.arc(point.x + tileWidth * 0.24, point.y - 15 * scale, 5 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  if (selectedBuilding === building) {
    ctx.strokeStyle = '#fff4a6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(point.x, point.y + 3, tileWidth * 0.42, tileHeight * 0.34, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function draw() {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  ctx.clearRect(0, 0, rect.width, rect.height);
  drawGround();
  drawDecorations();
  drawWalls();

  [...placed]
    .sort((a, b) => (a.x + a.y) - (b.x + b.y))
    .forEach(drawBuilding);

  if (pendingBuilding) {
    ctx.fillStyle = '#fff3a0';
    ctx.font = '900 15px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TAP AN EMPTY TILE TO PLACE', rect.width / 2, rect.height - 104);
  }
}

function gridFromPointer(event) {
  const rect = canvas.getBoundingClientRect();
  const dx = (event.clientX - rect.left - centerX) / (tileWidth / 2);
  const dy = (event.clientY - rect.top - centerY) / (tileHeight / 2) + GRID;

  return {
    x: Math.floor((dx + dy) / 2),
    y: Math.floor((dy - dx) / 2)
  };
}

function buildingAt(x, y) {
  return [...placed].reverse().find((building) =>
    x >= building.x &&
    x < building.x + (building.size || 1) &&
    y >= building.y &&
    y < building.y + (building.size || 1)
  );
}

function tileIsFree(x, y, size = 1) {
  if (x < 0 || y < 0 || x + size > GRID || y + size > GRID) {
    return false;
  }

  return !placed.some((building) => {
    const otherSize = building.size || 1;

    return (
      x < building.x + otherSize &&
      x + size > building.x &&
      y < building.y + otherSize &&
      y + size > building.y
    );
  });
}

function resourceElement(kind) {
  return document.querySelector(`#${kind}`);
}

function canAfford(building) {
  const kind = building.id === 'pump' ? 'elixir' : 'gold';
  const amount = Number(resourceElement(kind).textContent.replaceAll(',', ''));

  return amount >= building.price;
}

function spend(building) {
  const kind = building.id === 'pump' ? 'elixir' : 'gold';
  const element = resourceElement(kind);
  const current = Number(element.textContent.replaceAll(',', ''));

  element.textContent = (current - building.price).toLocaleString();
}

function showSelected(building) {
  selectedBuilding = building;

  const panel = document.querySelector('#selected-building');
  panel.hidden = false;

  document.querySelector('#building-icon').textContent = building.icon;
  document.querySelector('#building-name').textContent = building.name;
  document.querySelector('#building-description').textContent = building.desc;
  document.querySelector('#upgrade-button').innerHTML =
    `Upgrade <b>${building.level * 500} 🪙</b>`;

  draw();
}

function createShopItem(building) {
  const button = document.createElement('button');
  button.className = 'shop-item';
  button.innerHTML =
    `<span class="shop-icon">${building.icon}</span>` +
    `<span><strong>${building.name}</strong>` +
    `<small>${building.price} ${building.id === 'pump' ? '🧪' : '🪙'}</small></span>`;

  button.addEventListener('click', () => {
    if (building.id === 'hall') return;

    if (!canAfford(building)) {
      window.showToast('You need more resources for that building.');
      return;
    }

    pendingBuilding = building;
    document.querySelector('#build-panel').hidden = true;
    window.showToast(`Tap an empty tile to place your ${building.name}.`);
    draw();
  });

  return button;
}

function fillShop(category = 'all') {
  const list = document.querySelector('#building-list');
  list.replaceChildren();

  buildings
    .filter((building) =>
      building.price > 0 &&
      (category === 'all' || building.category === category)
    )
    .forEach((building) => list.append(createShopItem(building)));
}

function handleCanvasClick(event) {
  const tile = gridFromPointer(event);

  if (pendingBuilding) {
    const size = pendingBuilding.size || 1;

    if (!tileIsFree(tile.x, tile.y, size)) {
      window.showToast('That spot is occupied. Choose an empty tile.');
      return;
    }

    spend(pendingBuilding);

    const newBuilding = {
      ...pendingBuilding,
      x: tile.x,
      y: tile.y,
      level: 1
    };

    placed.push(newBuilding);
    saveVillageLayout();
    pendingBuilding = null;
    document.querySelector('#selected-building').hidden = true;
    window.showToast(`${newBuilding.name} placed in your empire!`);
    draw();
    return;
  }

  const building = buildingAt(tile.x, tile.y);

  if (building) {
    showSelected(building);
  } else {
    selectedBuilding = null;
    document.querySelector('#selected-building').hidden = true;
    draw();
  }
}

export function initVillage() {
  try {
    const savedLayout = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');

    if (Array.isArray(savedLayout) && savedLayout.length) {
      placed = savedLayout;
    }
  } catch {
    localStorage.removeItem(SAVE_KEY);
  }

  new ResizeObserver(resizeCanvas).observe(canvas);
  resizeCanvas();
  canvas.addEventListener('click', handleCanvasClick);

  document.querySelector('#build-button').addEventListener('click', () => {
    document.querySelector('#selected-building').hidden = true;
    fillShop();
    document.querySelector('#build-panel').hidden = false;
  });

  document.querySelector('#close-build').addEventListener('click', () => {
    document.querySelector('#build-panel').hidden = true;
  });

  document.querySelectorAll('[data-category]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-category]').forEach((tab) => {
        tab.classList.remove('active');
      });

      button.classList.add('active');
      fillShop(button.dataset.category);
    });
  });

  document.querySelector('#close-selected').addEventListener('click', () => {
    selectedBuilding = null;
    document.querySelector('#selected-building').hidden = true;
    draw();
  });

  document.querySelector('#upgrade-button').addEventListener('click', () => {
    if (!selectedBuilding) return;

    const gold = resourceElement('gold');
    const cost = selectedBuilding.level * 500;
    const amount = Number(gold.textContent.replaceAll(',', ''));

    if (amount < cost) {
      window.showToast('You need more gold to upgrade this building.');
      return;
    }

    gold.textContent = (amount - cost).toLocaleString();
    selectedBuilding.level += 1;
    saveVillageLayout();
    showSelected(selectedBuilding);
    window.showToast(
      `${selectedBuilding.name} upgraded to level ${selectedBuilding.level}!`
    );
  });

  document.querySelector('#attack-button').addEventListener('click', () => {
    window.showToast('The frontier battles are coming next.');
  });

  document.querySelector('#army-button').addEventListener('click', () => {
    window.showToast('Build a Barracks to begin training troops.');
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      pendingBuilding = null;
      document.querySelector('#build-panel').hidden = true;
      draw();
    }
  });
}

export function collectResource(kind) {
  const resource = resourceElement(kind);

  if (!resource || !['gold', 'elixir'].includes(kind)) {
    window.showToast('That resource will be available later.');
    return;
  }

  const amount = kind === 'gold' ? 250 : 180;
  const current = Number(resource.textContent.replaceAll(',', ''));

  resource.textContent = (current + amount).toLocaleString();
  window.showToast(`+${amount} ${kind === 'gold' ? 'Gold' : 'Elixir'} collected!`);
}
