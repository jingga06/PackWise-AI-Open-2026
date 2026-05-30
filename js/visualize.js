let scene;
let camera;
let renderer;
let raycaster;
let mouse;

let cargoMeshes = [];

let controlsState = {
  dragging: false,
  prevX: 0,
  prevY: 0,
  rotY: 0.75,
  rotX: 0.35,
  distance: 1
};

let selectedSession = null;

function initVisualizationPage() {
  selectedSession = getSelectedSession();

  if (!selectedSession) {
    document.getElementById("sessionSubtitle").textContent =
      "No loading session found. Please create a new session first.";
    return;
  }

  renderSessionInfo();
  renderLegend();
  initThreeScene();
}

function renderSessionInfo() {
  document.getElementById("sessionSubtitle").textContent =
    `${selectedSession.shipmentId} · ${selectedSession.destination} · ${selectedSession.vehicleName}`;

  document.getElementById("utilizationValue").textContent = `${selectedSession.utilization}%`;
  document.getElementById("unusedVolume").textContent = formatVolume(selectedSession.unusedVolume);
  document.getElementById("tripsNeeded").textContent = selectedSession.tripsNeeded;
  document.getElementById("tripsSaved").textContent = selectedSession.tripsSaved;
  document.getElementById("packedItems").textContent = selectedSession.packedItems.length;
  document.getElementById("aiRecommendation").textContent = selectedSession.aiRecommendation;
}

function renderLegend() {
  const list = document.getElementById("legendList");

  if (!selectedSession.packedItems.length) {
    list.innerHTML = `<div class="empty-state">No packed cargo items.</div>`;
    return;
  }

  list.innerHTML = selectedSession.packedItems.map(item => `
    <div class="legend-item">
      <div class="legend-dot" style="background:${item.color}"></div>
      <div>
        <strong>${item.name}</strong>
        <span>${formatVolume(item.volume)} · ${formatWeight(item.weight)}</span>
      </div>
    </div>
  `).join("");
}

function initThreeScene() {
  const canvas = document.getElementById("cargoCanvas");
  const frame = canvas.parentElement;
  const width = frame.clientWidth;
  const height = frame.clientHeight;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x141a22);

  camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
  });

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  addLighting();
  addTruckContainer();
  addCargoItems();
  setupInteraction(canvas);
  animateScene();

  window.addEventListener("resize", resizeRenderer);
}

function addLighting() {
  const ambient = new THREE.AmbientLight(0xffffff, 0.62);
  scene.add(ambient);

  const mainLight = new THREE.DirectionalLight(0xffffff, 0.85);
  mainLight.position.set(8, 10, 8);
  scene.add(mainLight);

  const sideLight = new THREE.DirectionalLight(0xffd7d7, 0.35);
  sideLight.position.set(-8, 4, -6);
  scene.add(sideLight);
}

function addTruckContainer() {
  const vehicle = selectedSession.vehicle;

  const geometry = new THREE.BoxGeometry(vehicle.length, vehicle.height, vehicle.width);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.045
  });

  const container = new THREE.Mesh(geometry, material);
  container.position.set(vehicle.length / 2, vehicle.height / 2, vehicle.width / 2);
  scene.add(container);

  const edges = new THREE.EdgesGeometry(geometry);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.58
  });

  const wireframe = new THREE.LineSegments(edges, lineMaterial);
  wireframe.position.copy(container.position);
  scene.add(wireframe);

  const grid = new THREE.GridHelper(
    Math.max(vehicle.length, vehicle.width) * 1.6,
    20,
    0x3b4654,
    0x27313d
  );

  grid.position.set(vehicle.length / 2, -0.01, vehicle.width / 2);
  scene.add(grid);
}

function addCargoItems() {
  cargoMeshes = [];

  selectedSession.packedItems.forEach(item => {
    const geometry = new THREE.BoxGeometry(item.length, item.height, item.width);
    const material = new THREE.MeshLambertMaterial({
      color: new THREE.Color(item.color),
      transparent: true,
      opacity: 0.9
    });

    const box = new THREE.Mesh(geometry, material);
    box.position.set(
      item.x + item.length / 2,
      item.y + item.height / 2,
      item.z + item.width / 2
    );

    box.userData = {
      cargoItem: item,
      originalColor: item.color
    };

    scene.add(box);
    cargoMeshes.push(box);

    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.28
    });

    const outline = new THREE.LineSegments(edges, edgeMaterial);
    outline.position.copy(box.position);
    scene.add(outline);
  });
}

function setupInteraction(canvas) {
  canvas.addEventListener("mousedown", event => {
    controlsState.dragging = true;
    controlsState.prevX = event.clientX;
    controlsState.prevY = event.clientY;
  });

  window.addEventListener("mouseup", () => {
    controlsState.dragging = false;
  });

  window.addEventListener("mousemove", event => {
    if (!controlsState.dragging) return;

    controlsState.rotY += (event.clientX - controlsState.prevX) * 0.01;
    controlsState.rotX += (event.clientY - controlsState.prevY) * 0.006;
    controlsState.rotX = Math.max(-1.05, Math.min(1.05, controlsState.rotX));

    controlsState.prevX = event.clientX;
    controlsState.prevY = event.clientY;
  });

  canvas.addEventListener("click", event => {
    selectCargoByClick(event, canvas);
  });

  canvas.addEventListener("wheel", event => {
    controlsState.distance += event.deltaY * 0.0015;
    controlsState.distance = Math.max(0.6, Math.min(1.8, controlsState.distance));
  });

  canvas.addEventListener("touchstart", event => {
    controlsState.prevX = event.touches[0].clientX;
    controlsState.prevY = event.touches[0].clientY;
  });

  canvas.addEventListener("touchmove", event => {
    event.preventDefault();

    controlsState.rotY += (event.touches[0].clientX - controlsState.prevX) * 0.01;
    controlsState.rotX += (event.touches[0].clientY - controlsState.prevY) * 0.006;
    controlsState.rotX = Math.max(-1.05, Math.min(1.05, controlsState.rotX));

    controlsState.prevX = event.touches[0].clientX;
    controlsState.prevY = event.touches[0].clientY;
  }, { passive: false });
}

function selectCargoByClick(event, canvas) {
  const rect = canvas.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(cargoMeshes);

  resetCargoHighlight();

  if (!intersects.length) {
    return;
  }

  const selectedMesh = intersects[0].object;
  const item = selectedMesh.userData.cargoItem;

  selectedMesh.material.emissive = new THREE.Color(0xffffff);
  selectedMesh.material.emissiveIntensity = 0.18;

  renderSelectedCargoDetail(item);
}

function resetCargoHighlight() {
  cargoMeshes.forEach(mesh => {
    if (mesh.material.emissive) {
      mesh.material.emissive = new THREE.Color(0x000000);
      mesh.material.emissiveIntensity = 0;
    }
  });
}

function renderSelectedCargoDetail(item) {
  const container = document.getElementById("selectedCargoDetail");
  const position = getReadablePosition(item, selectedSession.vehicle);

  container.className = "cargo-detail-box";

  container.innerHTML = `
    <div class="cargo-detail-title">
      <div class="cargo-detail-color" style="background:${item.color}"></div>
      <strong>${item.name}</strong>
    </div>

    <div class="detail-row">
      <span>Dimensions</span>
      <strong>${item.length}m × ${item.width}m × ${item.height}m</strong>
    </div>

    <div class="detail-row">
      <span>Original Size</span>
      <strong>${item.originalLength || item.length}m × ${item.originalWidth || item.width}m × ${item.originalHeight || item.height}m</strong>
    </div>

    <div class="detail-row">
      <span>Volume</span>
      <strong>${formatVolume(item.volume)}</strong>
    </div>

    <div class="detail-row">
      <span>Weight</span>
      <strong>${formatWeight(item.weight)}</strong>
    </div>

    <div class="detail-row">
      <span>Position</span>
      <strong>${position}</strong>
    </div>

    <div class="detail-row">
      <span>Coordinates</span>
      <strong>X:${item.x.toFixed(2)} · Y:${item.y.toFixed(2)} · Z:${item.z.toFixed(2)}</strong>
    </div>

    <div class="detail-row">
      <span>Rotation</span>
      <strong>${item.rotation || "LWH"}</strong>
    </div>
  `;
}

function getReadablePosition(item, vehicle) {
  const frontBack = item.x < vehicle.length / 3
    ? "Front"
    : item.x > vehicle.length * 2 / 3
      ? "Rear"
      : "Middle";

  const leftRight = item.z < vehicle.width / 3
    ? "Left"
    : item.z > vehicle.width * 2 / 3
      ? "Right"
      : "Center";

  const layer = item.y < 0.1
    ? "Bottom Layer"
    : item.y < vehicle.height / 2
      ? "Middle Layer"
      : "Top Layer";

  return `${frontBack} · ${leftRight} · ${layer}`;
}

function animateScene() {
  requestAnimationFrame(animateScene);

  if (!controlsState.dragging) {
    controlsState.rotY += 0.002;
  }

  updateCamera();
  renderer.render(scene, camera);
}

function updateCamera() {
  const vehicle = selectedSession.vehicle;
  const centerX = vehicle.length / 2;
  const centerY = vehicle.height / 2;
  const centerZ = vehicle.width / 2;

  const baseDistance = Math.max(vehicle.length, vehicle.width, vehicle.height) * 2.15;
  const radius = baseDistance * controlsState.distance;

  camera.position.x = centerX + radius * Math.sin(controlsState.rotY) * Math.cos(controlsState.rotX);
  camera.position.y = centerY + radius * Math.sin(controlsState.rotX);
  camera.position.z = centerZ + radius * Math.cos(controlsState.rotY) * Math.cos(controlsState.rotX);

  camera.lookAt(centerX, centerY, centerZ);
}

function resetCameraView() {
  controlsState.rotY = 0.75;
  controlsState.rotX = 0.35;
  controlsState.distance = 1;
}

function resizeRenderer() {
  const canvas = document.getElementById("cargoCanvas");
  const frame = canvas.parentElement;
  const width = frame.clientWidth;
  const height = frame.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

function setViewMode(mode) {
  if (mode === "iso") {
    controlsState.rotY = 0.75;
    controlsState.rotX = 0.35;
    controlsState.distance = 1;
  }

  if (mode === "top") {
    controlsState.rotY = 0.01;
    controlsState.rotX = 1.25;
    controlsState.distance = 1.1;
  }

  if (mode === "front") {
    controlsState.rotY = Math.PI / 2;
    controlsState.rotX = 0.15;
    controlsState.distance = 1;
  }

  if (mode === "side") {
    controlsState.rotY = 0;
    controlsState.rotX = 0.15;
    controlsState.distance = 1;
  }
}
initVisualizationPage();