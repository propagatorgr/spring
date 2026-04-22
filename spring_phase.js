// =================== ΣΤΑΘΕΡΕΣ ===================
let k = 0.04;
let m = 1;
let omega;

// =================== ΚΙΝΗΣΗ ===================
let A = 100;
let t = 0;
let dt = 0.05;
let running = false;

let periodMode = "none"; // none | full | half
let periodEndTime = 0;

// =================== ΜΕΓΕΘΗ ===================
let x, u, a, F;

// =================== LAYOUT ===================
let originX, originY, anchorX;
let phaseCX, phaseCY, phaseR;
let canvasW, canvasH;

// =================== UI ===================
let startBtn, onePeriodBtn, halfPeriodBtn, resetBtn;
let aSlider, phaseSelect;
let phaseLocked = false;

// ===== ΕΜΦΑΝΙΣΗ ΔΙΑΝΥΣΜΑΤΩΝ =====
let showF = true;
let showU = true;
let showA = true;
let cbForce, cbVelocity, cbAcceleration;

// =================== ΦΑΣΕΙΣ ===================
const phaseOptions = {
  "0": 0,
  "π/2": Math.PI / 2,
  "3π/2": 3 * Math.PI / 2,
  "π/4": Math.PI / 4,
  "π/6": Math.PI / 6,
  "5π/6": 5 * Math.PI / 6,
  "7π/6": 7 * Math.PI / 6,
  "11π/6": 11 * Math.PI / 6
};

// =================== SETUP ===================
function setup() {
  calculateCanvasSize();
  createCanvas(canvasW, canvasH);

  omega = sqrt(k / m);
  updateLayout();
  computeMotion();
  createUI();
}

// =================== DRAW ===================
function draw() {
  background(245);

  if (!running) A = aSlider.value();

  if (running) {
    t += dt;
    if (periodMode !== "none" && t >= periodEndTime) {
      running = false;
      periodMode = "none";
      updatePhaseSelectState();
    }
  }

  computeMotion();

  drawReferenceLines();
  drawSpring();
  drawMass();
  drawVectors();
  drawLegend();
  drawPhaseCircle();
  drawText();
}

// =================== RESPONSIVE ===================
function windowResized() {
  calculateCanvasSize();
  resizeCanvas(canvasW, canvasH);
  updateLayout();
  positionUI();
}

function calculateCanvasSize() {
  canvasW = min(windowWidth * 0.96, 1200);
  canvasH = min(windowHeight * 0.85, 720);
}

function updateLayout() {
  originX = width * 0.5;
  originY = height * 0.45;
  anchorX = width * 0.12;

  phaseCX = width * 0.82;
  phaseCY = height * 0.22;
  phaseR  = min(width, height) * 0.05;
}

// =================== ΦΥΣΙΚΗ ===================
function computeMotion() {
  x = A * sin(omega * t);
  u = omega * A * cos(omega * t);
  a = -omega * omega * A * sin(omega * t);
  F = -k * x;
}

// =================== ΓΡΑΜΜΕΣ ===================
function drawReferenceLines() {
  stroke(0);
  drawingContext.setLineDash([6, 6]);
  line(originX, 0, originX, height);
  line(originX + A, 0, originX + A, height);
  line(originX - A, 0, originX - A, height);
  drawingContext.setLineDash([]);
}

// =================== ΕΛΑΤΗΡΙΟ ===================
function drawSpring() {
  stroke(0); noFill();
  let massX = originX + x;
  let coils = 14, amp = 10;
  let step = (massX - anchorX) / coils;

  beginShape();
  vertex(anchorX, originY);
  for (let i = 1; i < coils; i++) {
    vertex(anchorX + i * step, originY + (i % 2 ? -amp : amp));
  }
  vertex(massX, originY);
  endShape();

  fill(0);
  ellipse(anchorX, originY, 8);
}

// =================== ΣΩΜΑ ===================
function drawMass() {
  fill(130, 180, 255);
  rectMode(CENTER);
  rect(originX + x, originY, 50, 40);
}

// =================== ΔΙΑΝΥΣΜΑΤΑ ===================
function drawVectors() {
  let px = originX + x;
  let py = originY;

  if (showF) drawArrow(px, py, F, 35, color(200, 0, 0));
  if (showU) drawArrow(px, py, u, 12, color(0, 150, 0));
  if (showA) drawArrow(px, py, a, 20, color(0, 0, 200));
}

function drawArrow(x0, y0, v, s, c) {
  let L = s * v;
  stroke(c); strokeWeight(3);
  line(x0, y0, x0 + L, y0);
  if (abs(L) > 3) {
    push();
    translate(x0 + L, y0);
    rotate(L > 0 ? 0 : PI);
    line(0, 0, -8, -5);
    line(0, 0, -8, 5);
    pop();
  }
}

// =================== ΚΥΚΛΟΣ ΦΑΣΗΣ ===================
function drawPhaseCircle() {
  let phi = (omega * t) % TWO_PI;

  stroke(0); noFill();
  ellipse(phaseCX, phaseCY, 2 * phaseR);

  stroke(150, 0, 150);
  strokeWeight(3);
  arc(phaseCX, phaseCY, 2 * phaseR, 2 * phaseR, 0, -phi);

  let px = phaseCX + phaseR * cos(phi);
  let py = phaseCY - phaseR * sin(phi);
  stroke(0);
  line(phaseCX, phaseCY, px, py);

  drawPhaseMark(phaseCX, phaseCY, phaseR, HALF_PI, "π/2");
  drawPhaseMark(phaseCX, phaseCY, phaseR, PI, "π");
  drawPhaseMark(phaseCX, phaseCY, phaseR, 3 * HALF_PI, "3π/2");

  noStroke(); fill(0); textSize(11);
  text("0", phaseCX + phaseR + 10, phaseCY + 4);
  text("2π", phaseCX + phaseR + 30, phaseCY + 4);

  textSize(12);
  text("Φάση", phaseCX - 16, phaseCY + phaseR + 30);
}

function drawPhaseMark(cx, cy, R, ang, lbl) {
  let x1 = cx + R * cos(ang);
  let y1 = cy - R * sin(ang);
  let x2 = cx + (R + 6) * cos(ang);
  let y2 = cy - (R + 6) * sin(ang);
  stroke(0);
  line(x1, y1, x2, y2);
  noStroke(); fill(0); textSize(11);
  text(lbl,
       cx + (R + 14) * cos(ang) - 6,
       cy - (R + 14) * sin(ang) + 4);
}

// =================== ΥΠΟΜΝΗΜΑ ===================
function drawLegend() {
  let y = height * 0.2;
  strokeWeight(3);

  stroke(200, 0, 0);
  line(20, y, 50, y);
  noStroke(); fill(0);
  text("Δύναμη F", 65, y + 4);

  y += 28;
  stroke(0, 150, 0);
  line(20, y, 50, y);
  noStroke();
  text("Ταχύτητα u", 65, y + 4);

  y += 28;
  stroke(0, 0, 200);
  line(20, y, 50, y);
  noStroke();
  text("Επιτάχυνση a", 65, y + 4);
}

// =================== ΚΕΙΜΕΝΑ ===================
function drawText() {
  noStroke(); fill(0); textSize(14);
  text(`x = ${x.toFixed(1)}`, 20, 30);
  text(`u = ${u.toFixed(1)}`, 20, 50);
  text(`a = ${a.toFixed(1)}`, 20, 70);
  text(`A = ${A}`, 20, height - 60);
  text(`φ = ${(omega * t).toFixed(2)} rad`, 20, height - 40);
}

// =================== UI ===================
function createUI() {
  startBtn = createButton("START / STOP");
  onePeriodBtn = createButton("Μία περίοδος");
  halfPeriodBtn = createButton("½ περίοδος");
  resetBtn = createButton("RESET");
  aSlider = createSlider(30, 160, A, 1);
  phaseSelect = createSelect();

  phaseSelect.option("Αρχική φάση");
  for (let p in phaseOptions) phaseSelect.option(p);
  phaseSelect.value("Αρχική φάση");

  cbForce = createCheckbox(" Δύναμη F", true);
  cbVelocity = createCheckbox(" Ταχύτητα u", true);
  cbAcceleration = createCheckbox(" Επιτάχυνση a", true);

  cbForce.changed(() => showF = cbForce.checked());
  cbVelocity.changed(() => showU = cbVelocity.checked());
  cbAcceleration.changed(() => showA = cbAcceleration.checked());

  startBtn.mousePressed(toggleStart);
  onePeriodBtn.mousePressed(() => startPeriod("full"));
  halfPeriodBtn.mousePressed(() => startPeriod("half"));
  resetBtn.mousePressed(resetSimulation);

  phaseSelect.changed(() => {
    if (!phaseLocked && phaseOptions[phaseSelect.value()] !== undefined) {
      t = phaseOptions[phaseSelect.value()] / omega;
    }
  });

  positionUI();
  updatePhaseSelectState();
}
function positionUI() {
  // Κουμπιά ελέγχου
  startBtn.position(20, height - 35);
  onePeriodBtn.position(140, height - 35);
  halfPeriodBtn.position(260, height - 35);
  resetBtn.position(380, height - 35);
  aSlider.position(460, height - 35);
  phaseSelect.position(640, height - 35);

  // Υπόμνημα βρίσκεται στο x ≈ 20–65
  // Τοποθετούμε τα checkboxes ΔΕΞΙΑ από αυτό
  let yBase = height * 0.2;
  let xBoxes = 180;   // 🔑 το σημαντικό offset

  cbForce.position(xBoxes, yBase - 10);
  cbVelocity.position(xBoxes, yBase + 18);
  cbAcceleration.position(xBoxes, yBase + 46);
}


// =================== CONTROLS ===================
function toggleStart() {
  running = !running;
  phaseLocked = true;
  updatePhaseSelectState();
}

function startPeriod(type) {
  if (!running) {
    running = true;
    phaseLocked = true;
    periodMode = type;
    periodEndTime = t + (type === "full" ? TWO_PI : PI) / omega;
    updatePhaseSelectState();
  }
}

function resetSimulation() {
  running = false;
  periodMode = "none";
  phaseLocked = false;
  t = 0;
  phaseSelect.value("Αρχική φάση");
  updatePhaseSelectState();
}

function updatePhaseSelectState() {
  if (phaseSelect && phaseSelect.elt) {
    phaseSelect.elt.disabled = phaseLocked;
  }
}
