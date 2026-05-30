function initFleetPage() {
  renderFleetTable();
}

function renderFleetTable() {
  const tbody = document.getElementById("fleetTableBody");

  tbody.innerHTML = FLEET.map(vehicle => {
    const volume = getVehicleVolume(vehicle);

    return `
      <tr>
        <td>
          <div class="vehicle-name">
            <span>${vehicle.icon}</span>
            <div>
              ${vehicle.name}
              <div class="vehicle-type">${vehicle.id}</div>
            </div>
          </div>
        </td>
        <td>${vehicle.type}</td>
        <td>${vehicle.length} m</td>
        <td>${vehicle.width} m</td>
        <td>${vehicle.height} m</td>
        <td><strong>${formatVolume(volume)}</strong></td>
        <td>${formatWeight(vehicle.maxWeight)}</td>
        <td><span class="status-chip">Active</span></td>
      </tr>
    `;
  }).join("");
}

initFleetPage();