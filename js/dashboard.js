let utilizationChartInstance = null;
let vehicleChartInstance = null;

function renderDashboard() {
  const sessions = loadSessions();

  const totalSessions = sessions.length;
  const today = todayLabel();

  const todayShipments = sessions.filter(session => session.date === today).length;

  const avgUtil = totalSessions
    ? Math.round(sessions.reduce((sum, s) => sum + s.utilization, 0) / totalSessions)
    : 0;

  const bestUtil = totalSessions
    ? Math.max(...sessions.map(s => s.utilization))
    : 0;

  const tripsSaved = sessions.reduce((sum, s) => sum + (s.tripsSaved || 0), 0);
  const estimatedCostSaved = tripsSaved * 350000;

  document.getElementById("todayShipments").textContent = todayShipments;
  document.getElementById("avgUtil").textContent = `${avgUtil}%`;
  document.getElementById("costSaved").textContent = formatRupiah(estimatedCostSaved);
  document.getElementById("bestUtil").textContent = `${bestUtil}%`;

  renderInsight(avgUtil, totalSessions, tripsSaved);
  renderSessionList(sessions);
  renderUtilizationChart(sessions);
  renderVehicleChart(sessions);
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value).replace("IDR", "Rp");
}

function renderInsight(avgUtil, totalSessions, tripsSaved) {
  const box = document.getElementById("aiInsight");

  if (!totalSessions) {
    box.textContent = "No sessions yet. Create a loading session to generate insights.";
    return;
  }

  if (avgUtil >= 85) {
    box.textContent =
      `Excellent fleet performance. Average utilization is ${avgUtil}%, above the target range. PackWise estimates ${tripsSaved} trip(s) saved from optimized loading. Maintain this loading standard and monitor consistency between routes.`;
  } else if (avgUtil >= 75) {
    box.textContent =
      `Operational performance is good, but not yet optimal. Average utilization is ${avgUtil}%. Review sessions below 80% and consider consolidating low-volume shipments before dispatch.`;
  } else {
    box.textContent =
      `Average utilization is still below target at ${avgUtil}%. PackWise recommends reviewing vehicle selection, grouping small shipments, and using smaller trucks for low-volume delivery routes.`;
  }
}

function renderSessionList(sessions) {
  const list = document.getElementById("sessionList");

  if (!sessions.length) {
    list.innerHTML = `<div class="empty-state">No loading sessions saved yet.</div>`;
    return;
  }

  list.innerHTML = sessions.slice(0, 7).map(session => {
    const priorityClass = getPriorityClass(session.priority);

    return `
      <div class="session-item">
        <div>
          <h4>${session.shipmentId || session.vehicleName}</h4>
          <p>
            ${session.destination || "No destination"} · 
            ${session.vehicleName} · 
            ${session.items.length} items · 
            ${formatVolume(session.totalVolume)}
          </p>
        </div>

        <div class="util-pill">${session.utilization}%</div>

        <div class="priority-chip ${priorityClass}">
          ${session.priority || "Normal"}
        </div>

        <button class="btn btn-ghost" onclick="openSession('${session.id}')">View</button>
      </div>
    `;
  }).join("");
}

function getPriorityClass(priority) {
  if (priority === "Urgent") return "priority-urgent";
  if (priority === "High") return "priority-high";
  return "priority-normal";
}

function openSession(id) {
  const sessions = loadSessions();
  const selected = sessions.find(s => s.id === id);

  if (!selected) return;

  saveSelectedSession(selected);
  goTo("visualize.html");
}

function renderUtilizationChart(sessions) {
  const ctx = document.getElementById("utilChart");

  if (utilizationChartInstance) {
    utilizationChartInstance.destroy();
  }

  const chartData = sessions.slice().reverse();

  utilizationChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: chartData.map(s => s.date),
      datasets: [{
        label: "Utilization %",
        data: chartData.map(s => s.utilization),
        borderWidth: 3,
        tension: 0.35,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#6b7280"
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            color: "#6b7280"
          },
          grid: {
            color: "rgba(31,41,51,0.08)"
          }
        },
        x: {
          ticks: {
            color: "#6b7280"
          },
          grid: {
            color: "rgba(31,41,51,0.05)"
          }
        }
      }
    }
  });
}

function renderVehicleChart(sessions) {
  const ctx = document.getElementById("vehicleChart");

  if (vehicleChartInstance) {
    vehicleChartInstance.destroy();
  }

  const counts = FLEET.map(vehicle => {
    return sessions.filter(session => session.vehicleId === vehicle.id).length;
  });

  vehicleChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: FLEET.map(vehicle => vehicle.name),
      datasets: [{
        label: "Sessions",
        data: counts,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            color: "#6b7280"
          },
          grid: {
            color: "rgba(31,41,51,0.08)"
          }
        },
        x: {
          ticks: {
            color: "#6b7280"
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function loadDemoData() {
  const demoSessions = [
    {
      id: "DEMO-001",
      shipmentId: "KL-2026-001",
      destination: "Jakarta Distribution Center",
      priority: "High",
      routeType: "Urban Delivery",
      date: todayLabel(),
      vehicleId: "box-m",
      vehicleName: "Box Truck M",
      vehicle: FLEET[1],
      items: [
        { id: "A", name: "Retail Box A", length: 1.2, width: 0.8, height: 0.7, weight: 120, volume: 0.672, color: "#c9252d" },
        { id: "B", name: "Pallet B", length: 1.4, width: 1.0, height: 0.9, weight: 220, volume: 1.26, color: "#16825d" }
      ],
      totalVolume: 24.8,
      totalWeight: 3180,
      utilization: 86,
      unusedVolume: 4.03,
      tripsNeeded: 1,
      tripsSaved: 1,
      packedItems: [],
      unpackedItems: [],
      aiRecommendation: "Excellent loading plan. Box Truck M reaches 86% utilization and is ready for warehouse execution."
    },
    {
      id: "DEMO-002",
      shipmentId: "KL-2026-002",
      destination: "Bekasi Retail Outlet",
      priority: "Normal",
      routeType: "Retail Replenishment",
      date: "28 May 2026",
      vehicleId: "box-s",
      vehicleName: "Box Truck S",
      vehicle: FLEET[0],
      items: [
        { id: "C", name: "Box C", length: 1.0, width: 0.7, height: 0.6, weight: 90, volume: 0.42, color: "#c78318" }
      ],
      totalVolume: 13.2,
      totalWeight: 1900,
      utilization: 74,
      unusedVolume: 4.62,
      tripsNeeded: 1,
      tripsSaved: 0,
      packedItems: [],
      unpackedItems: [],
      aiRecommendation: "Good loading plan, but this route can still be consolidated with nearby low-volume shipments."
    },
    {
      id: "DEMO-003",
      shipmentId: "KL-2026-003",
      destination: "Cikarang Industrial Client",
      priority: "Urgent",
      routeType: "Industrial Delivery",
      date: "27 May 2026",
      vehicleId: "box-l",
      vehicleName: "Box Truck L",
      vehicle: FLEET[2],
      items: [
        { id: "D", name: "Industrial Crate D", length: 1.8, width: 1.2, height: 1.0, weight: 460, volume: 2.16, color: "#1f5f99" }
      ],
      totalVolume: 40.1,
      totalWeight: 6200,
      utilization: 88,
      unusedVolume: 5.66,
      tripsNeeded: 1,
      tripsSaved: 1,
      packedItems: [],
      unpackedItems: [],
      aiRecommendation: "High utilization achieved. Keep using Box Truck L for this industrial delivery pattern."
    },
    {
      id: "DEMO-004",
      shipmentId: "KL-2026-004",
      destination: "Tangerang Store Cluster",
      priority: "High",
      routeType: "Retail Replenishment",
      date: "26 May 2026",
      vehicleId: "box-m",
      vehicleName: "Box Truck M",
      vehicle: FLEET[1],
      items: [
        { id: "E", name: "Mixed Retail Box E", length: 1.1, width: 0.8, height: 0.7, weight: 110, volume: 0.616, color: "#7c3aed" }
      ],
      totalVolume: 20.7,
      totalWeight: 2850,
      utilization: 79,
      unusedVolume: 6.05,
      tripsNeeded: 1,
      tripsSaved: 1,
      packedItems: [],
      unpackedItems: [],
      aiRecommendation: "Utilization is acceptable. PackWise recommends combining this route with another small delivery batch if dispatch timing allows."
    }
  ];

  saveSessions(demoSessions);
  renderDashboard();
}

renderDashboard();