function initGuidePage() {
  const session = getSelectedSession();

  if (!session) {
    document.getElementById("loadingSteps").innerHTML =
      `<div class="empty-state">No loading session found. Please create a session first.</div>`;
    return;
  }

  renderGuideMeta(session);
  renderLoadingSteps(session);
}

function renderGuideMeta(session) {
  document.getElementById("gShipmentId").textContent = session.shipmentId;
  document.getElementById("gDestination").textContent = session.destination;
  document.getElementById("gVehicle").textContent = session.vehicleName;
  document.getElementById("gPriority").textContent = session.priority;
  document.getElementById("gUtilization").textContent = `${session.utilization}%`;
  document.getElementById("gItems").textContent = session.packedItems.length;
  document.getElementById("gWeight").textContent = formatWeight(session.totalWeight);
  document.getElementById("gRecommendation").textContent = session.aiRecommendation;

  const crew = session.totalWeight > 2500 || session.packedItems.length > 12
    ? "3 operators"
    : "2 operators";

  document.getElementById("gCrew").textContent = crew;
}

function renderLoadingSteps(session) {
  const container = document.getElementById("loadingSteps");

  const sorted = [...session.packedItems].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    if (a.x !== b.x) return a.x - b.x;
    return a.z - b.z;
  });

  container.innerHTML = sorted.map((item, index) => {
    const position = getReadablePosition(item, session.vehicle);

    return `
      <div class="loading-step">
        <div class="step-number">${index + 1}</div>

        <div class="step-main">
          <h3>${item.name}</h3>
          <p>
            ${item.length}m × ${item.width}m × ${item.height}m · 
            ${formatWeight(item.weight)} · Rotation: ${item.rotation}
          </p>
        </div>

        <div class="step-position">${position}</div>
      </div>
    `;
  }).join("");
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
    ? "Bottom layer"
    : item.y < vehicle.height / 2
      ? "Middle layer"
      : "Top layer";

  return `${frontBack} · ${leftRight} · ${layer}`;
}

initGuidePage();