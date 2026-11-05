const canvas = document.querySelector('#village-canvas');
const ctx = canvas.getContext('2d');

let zoom = 1;
let selected = null;

const buildings = [
  {
    id: 'hall',
    name: 'Town Hall',
    level: 1,
    x: 0,
    y: -0.1,
    icon: '🏰',
    color: '#bca16b',
    desc: 'Your empire begins here. Protect your Town Hall and grow your kingdom.'
  },
  {
    id: 'gold',
    name: 'Gold Mine',
    level: 1,
    x: -1.05,
    y: 0.25,
    icon: '⛏️',
    color: '#d1a446',
    desc: 'Collects Gold for building and upgrading your empire.'
  },
  {
    id: 'elixir',
    name: 'Elixir Pump',
    level: 1,
    x: 1.02,
    y: 0.22,
    icon: '🧪',
    color: '#aa73bd',
    desc: 'Produces Elixir used to recruit and improve your army.'
  },
  {
    id: 'camp',
    name: 'Army Camp',
    level: 1,
    x: -0.48,
    y: 1.1,
    icon: '⛺',
    color: '#a87851',
    desc: 'A place for your troops to gather before an adventure.'
  },
  {
    id: 'barracks',
    name: 'Barracks',
    level: 1,
    x: 0.62,
    y: 1.05,
    icon: '⚒️',
    color: '#75917c',
    desc: 'Build a barracks to prepare your first troops.'
  }
];

function resize() {
  const rect = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.floor(rect.width * pixelRatio);
  canvas.height = Math.floor(rect.height * pixelRatio);

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  draw();
}

function project(x, y, z = 0, centerX, centerY) {
  return {
    x: centerX + (x - y) * 50 * zoom,
    y: centerY + (x + y) * 25 * zoom - z
  };
}

function drawPolygon(points, fill, stroke = '#1c2b25') {
  ctx.beginPath();

  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });

  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

function drawTile(x, y, centerX, centerY) {
  const point = project(x, y, 0, centerX, centerY);
  const width = 50 * zoom;
  const height = 25 * zoom;

  drawPolygon(
    [
      { x: point.x, y: point.y - height },
      { x: point.x + width, y: point.y },
      { x: point.x, y: point.y + height },
      { x: point.x - width, y: point.y }
    ],
    (x + y) % 2 ? '#8b936f' : '#929879',
    '#c1ae7b55'
  );
}

function drawBuilding(building, centerX, centerY) {
  const point = project(building.x, building.y, 0, centerX, centerY);
  const size = zoom;

  ctx.save();
  ctx.translate(point.x, point.y);

  if (selected === building.id) {
    ctx.beginPath();
    ctx.ellipse(0, 8 * size, 34 * size, 16 * size, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#f2d18a';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Layered sides and roofs give the buildings their 2.5D look.
  drawPolygon(
    [
      { x: -23 * size, y: 0 },
      { x: 0, y: 12 * size },
      { x: 23 * size, y: 0 },
      { x: 0, y: -12 * size }
    ],
    '#b7a47d'
  );

  drawPolygon(
    [
      { x: -23 * size, y: 0 },
      { x: 0, y: 12 * size },
      { x: 0, y: 34 * size },
      { x: -23 * size, y: 22 * size }
    ],
    '#796a51'
  );

  drawPolygon(
    [
      { x: 0, y: 12 * size },
      { x: 23 * size, y: 0 },
      { x: 23 * size, y: 22 * size },
      { x: 0, y: 34 * size }
    ],
    '#5c5946'
  );

  if (building.id === 'hall') {
    drawPolygon(
      [
        { x: -18 * size, y: -13 * size },
        { x: 0, y: -28 * size },
        { x: 18 * size, y: -13 * size },
        { x: 0, y: 0 }
      ],
      '#9c573e'
    );

    drawPolygon(
      [
        { x: -18 * size, y: -13 * size },
        { x: 0, y: 0 },
        { x: 0, y: 12 * size },
        { x: -18 * size, y: size }
      ],
      '#a87955'
    );

    drawPolygon(
      [
        { x: 0, y: 0 },
        { x: 18 * size, y: -13 * size },
        { x: 18 * size, y: size },
        { x: 0, y: 12 * size }
      ],
      '#855e43'
    );
  } else {
    drawPolygon(
      [
        { x: -17 * size, y: -11 * size },
        { x: 0, y: -24 * size },
        { x: 17 * size, y: -11 * size },
        { x: 0, y: size }
      ],
      building.color
    );

    drawPolygon(
      [
        { x: -17 * size, y: -11 * size },
        { x: 0, y: size },
        { x: 0, y: 13 * size },
        { x: -17 * size, y: 2 * size }
      ],
      '#987a58'
    );

    drawPolygon(
      [
        { x: 0, y: size },
        { x: 17 * size, y: -11 * size },
        { x: 17 * size, y: 2 * size },
        { x: 0, y: 13 * size }
      ],
      '#6d5f4e'
    );
  }

  ctx.font = `${building.id === 'hall' ? 20 : 17}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(building.icon, 0, -5 * size);
  ctx.restore();
}

function draw() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (!width || !height) {
    return;
  }

  ctx.clearRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height * 0.48;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(zoom, zoom);
  ctx.translate(-centerX, -centerY);

  for (let y = -3; y <= 3; y++) {
    for (let x = -4; x <= 4; x++) {
      drawTile(x, y, centerX, centerY);
    }
  }

  const decorations = [
    [-3, -2, '🌲'],
    [3, -2, '🌲'],
    [-4, 1, '🌳'],
    [4, 1, '🌲'],
    [-3, 3, '🌳'],
    [3, 3, '🌲'],
    [0, -3, '🌲'],
    [-4, -1, '🪨'],
    [4, -1, '🪨']
  ];

  decorations.forEach(([x, y, emoji]) => {
    const point = project(x, y, 0, centerX, centerY);
    ctx.font = `${24 * zoom}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText(emoji, point.x, point.y - 10 * zoom);
  });

  [...buildings]
    .sort((a, b) => (a.x + a.y) - (b.x + b.y))
    .forEach((building) => drawBuilding(building, centerX, centerY));

  ctx.restore();
}

function findBuildingAt(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height * 0.48;

  let closestBuilding = null;
  let closestDistance = 38 * zoom;

  for (const building of buildings) {
    const point = project(building.x, building.y, 0, centerX, centerY);
    const distance = Math.hypot(
      clientX - rect.left - point.x,
      clientY - rect.top - point.y
    );

    if (distance < closestDistance) {
      closestBuilding = building;
      closestDistance = distance;
    }
  }

  return closestBuilding;
}

function showBuilding(building) {
  document.querySelector('#building-icon').textContent = building.icon;
  document.querySelector('#building-name').textContent = building.name;
  document.querySelector('#building-level').textContent =
    `Level ${building.level} · ${
      building.id === 'hall' ? 'Empire center' : 'Village building'
    }`;
  document.querySelector('#building-description').textContent = building.desc;
  document.querySelector('#world-hint').textContent =
    `${building.name} selected · Level ${building.level}`;
  document.querySelector('#upgrade-button').innerHTML =
    `Upgrade <span>${building.level * 500} gold</span>`;
}

canvas.addEventListener('click', (event) => {
  const building = findBuildingAt(event.clientX, event.clientY);

  if (building) {
    selected = building.id;
    showBuilding(building);
    draw();
  }
});

export function initVillage() {
  new ResizeObserver(resize).observe(canvas);
  resize();

  document.querySelector('#upgrade-button').addEventListener('click', () => {
    window.showToast('Upgrades will be connected to your saved village next.');
  });

  document.querySelector('#build-button').addEventListener('click', () => {
    window.showToast('Building shop is coming in the next game step.');
  });

  document.querySelectorAll('[data-tool]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-tool]').forEach((tool) => {
        tool.classList.remove('active');
      });

      button.classList.add('active');

      if (button.dataset.tool === 'move') {
        window.showToast('Move mode selected');
      } else {
        window.showToast('Select a building to view it.');
      }
    });
  });

  document.querySelector('#zoom-in').addEventListener('click', () => {
    zoom = Math.min(1.25, zoom + 0.1);
    document.querySelector('#zoom-label').textContent = `${Math.round(zoom * 100)}%`;
    draw();
  });

  document.querySelector('#zoom-out').addEventListener('click', () => {
    zoom = Math.max(0.8, zoom - 0.1);
    document.querySelector('#zoom-label').textContent = `${Math.round(zoom * 100)}%`;
    draw();
  });
}

export function collectResource(kind) {
  const resource = document.querySelector(`#${kind}`);

  if (!resource) {
    return;
  }

  const amount = kind === 'gold' ? 250 : 180;
  const currentAmount = Number(resource.textContent.replaceAll(',', ''));

  resource.textContent = (currentAmount + amount).toLocaleString();

  window.showToast(
    `+${amount} ${kind === 'gold' ? 'Gold' : 'Elixir'} collected`
  );
}
