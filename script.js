const canvas = document.getElementById("garden-canvas");
const ctx = canvas.getContext("2d");
const centerPrompt = document.querySelector(".center-prompt");

let width = 0;
let height = 0;
let dpr = Math.min(window.devicePixelRatio || 1, 2);

const flowers = [];
const groundParticles = [];
let hasClicked = false;

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  buildGroundParticles();
}

function buildGroundParticles() {
  groundParticles.length = 0;
  const count = Math.floor(width * 0.42);
  for (let i = 0; i < count; i++) {
    groundParticles.push({
      x: Math.random() * width,
      baseY: height - 18 - Math.pow(Math.random(), 2.2) * 72,
      size: 0.8 + Math.random() * 1.6,
      twinkleOffset: Math.random() * Math.PI * 2,
      hue: 225 + Math.random() * 55,
    });
  }
}

function createFlower(targetX, targetY) {
  const groundY = height - 26;
  const clampedTargetY = Math.min(Math.max(targetY, height * 0.22), groundY - 90);
  const stemHeight = Math.max(110, groundY - clampedTargetY);

  // Titik-titik partikel untuk tangkai
  const stemPoints = [];
  const stemCount = Math.floor(stemHeight / 3.2);
  for (let i = 0; i <= stemCount; i++) {
    const t = i / stemCount;
    stemPoints.push({
      t,
      swayAmp: 6 + t * 14,
      size: 1.1 + (1 - t) * 0.9,
      hue: 165 + Math.random() * 65,
    });
  }

  // Titik-titik partikel untuk kelopak bunga (efek partikel biru/ungu seperti video 2)
  const petalPoints = [];
  const petalCount = 260;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2 * 6;
    const petalWave = Math.abs(Math.sin(angle * 3.5));
    const radius = 8 + petalWave * (26 + Math.random() * 14);
    petalPoints.push({
      angle,
      radius,
      size: 0.9 + Math.random() * 1.8,
      hue: 220 + Math.random() * 75,
      lightness: 58 + Math.random() * 24,
    });
  }

  // Lingkaran partikel halus di belakang bunga
  const haloPoints = [];
  const haloCount = 110;
  for (let i = 0; i < haloCount; i++) {
    haloPoints.push({
      angle: (i / haloCount) * Math.PI * 2,
      radius: 46 + (i % 3) * 10,
      size: 0.9 + (i % 2) * 0.6,
    });
  }

  flowers.push({
    x: targetX,
    groundY,
    stemHeight,
    growProgress: 0,
    phase: Math.random() * Math.PI * 2,
    stemPoints,
    petalPoints,
    haloPoints,
  });
}

function drawGround(time) {
  for (const p of groundParticles) {
    const alpha = 0.28 + 0.35 * Math.sin(time * 0.002 + p.twinkleOffset);
    ctx.fillStyle = `hsla(${p.hue}, 85%, 72%, ${alpha})`;
    ctx.fillRect(p.x, p.baseY, p.size, p.size);
  }
}

function drawFlower(flower, time) {
  flower.growProgress = Math.min(1, flower.growProgress + 0.022);
  const g = flower.growProgress;
  const sway = Math.sin(time * 0.0016 + flower.phase) * 8;

  // Gambar tangkai partikel
  for (const pt of flower.stemPoints) {
    if (pt.t > g) continue;
    const y = flower.groundY - pt.t * flower.stemHeight;
    const x = flower.x + Math.sin(time * 0.0016 + flower.phase + pt.t * 2) * pt.swayAmp * pt.t;
    ctx.fillStyle = `hsla(${pt.hue}, 80%, 66%, 0.85)`;
    ctx.fillRect(x, y, pt.size, pt.size);
  }

  // Posisi kepala bunga
  const headX = flower.x + sway;
  const headY = flower.groundY - flower.stemHeight;

  if (g > 0.35) {
    const bloom = Math.min(1, (g - 0.35) / 0.65);

    // Lingkaran orbit partikel
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(time * 0.0004 + flower.phase);
    for (const h of flower.haloPoints) {
      const hx = Math.cos(h.angle) * h.radius * bloom;
      const hy = Math.sin(h.angle) * h.radius * bloom;
      ctx.fillStyle = `rgba(176, 162, 255, ${0.35 * bloom})`;
      ctx.fillRect(hx, hy, h.size, h.size);
    }
    ctx.restore();

    // Kelopak partikel
    for (const p of flower.petalPoints) {
      const pulse = 0.92 + 0.08 * Math.sin(time * 0.003 + p.angle);
      const r = p.radius * bloom * pulse;
      const px = headX + Math.cos(p.angle + time * 0.0005) * r;
      const py = headY + Math.sin(p.angle + time * 0.0005) * r * 0.78;
      ctx.fillStyle = `hsla(${p.hue}, 88%, ${p.lightness}%, ${0.88 * bloom})`;
      ctx.fillRect(px, py, p.size, p.size);
    }
  }
}

function animate(time) {
  ctx.fillStyle = "rgba(5, 5, 8, 0.24)";
  ctx.fillRect(0, 0, width, height);

  drawGround(time);

  for (const flower of flowers) {
    drawFlower(flower, time);
  }

  requestAnimationFrame(animate);
}

canvas.addEventListener("pointerdown", (event) => {
  createFlower(event.clientX, event.clientY);
  if (!hasClicked) {
    hasClicked = true;
    centerPrompt.classList.add("subtle");
  }
});

// Mulai dengan beberapa bunga awal agar layar langsung hidup
resize();
createFlower(width * 0.32, height * 0.42);
createFlower(width * 0.54, height * 0.34);
createFlower(width * 0.72, height * 0.46);
requestAnimationFrame(animate);

window.addEventListener("resize", resize);
