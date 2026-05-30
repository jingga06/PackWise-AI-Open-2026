let selectedVehicle = FLEET[0];
let cargoItems = [];

const itemColors = [
  "#c9252d",
  "#16825d",
  "#c78318",
  "#1f5f99",
  "#7c3aed",
  "#db2777",
  "#0f766e",
  "#b45309"
];

function initSessionPage() {
  renderVehicles();
  renderProductOptions();
  previewSelectedProduct();
  updateSummary();

  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && document.activeElement.tagName === "INPUT") {
      addCargoItem();
    }
  });
}

function renderVehicles() {
  const grid = document.getElementById("vehicleGrid");

  grid.innerHTML = FLEET.map(vehicle => {
    const volume = getVehicleVolume(vehicle);
    const activeClass = vehicle.id === selectedVehicle.id ? "active" : "";

    return `
      <div class="vehicle-card ${activeClass}" onclick="selectVehicle('${vehicle.id}')">
        <div class="vehicle-icon">${vehicle.icon}</div>
        <h4>${vehicle.name}</h4>
        <p>${vehicle.length}m × ${vehicle.width}m × ${vehicle.height}m</p>
        <strong>${formatVolume(volume)}</strong>
      </div>
    `;
  }).join("");
}

function selectVehicle(vehicleId) {
  selectedVehicle = FLEET.find(vehicle => vehicle.id === vehicleId);
  renderVehicles();
  updateSummary();
}

function addCargoItem() {
  const name = document.getElementById("itemName").value.trim();
  const length = Number(document.getElementById("itemLength").value);
  const width = Number(document.getElementById("itemWidth").value);
  const height = Number(document.getElementById("itemHeight").value);
  const weight = Number(document.getElementById("itemWeight").value);

  if (!name || !length || !width || !height || !weight) {
    alert("Please complete item name, dimensions, and weight.");
    return;
  }

  if (length <= 0 || width <= 0 || height <= 0 || weight <= 0) {
    alert("All item dimensions and weight must be greater than zero.");
    return;
  }

  const item = {
    id: "ITEM-" + Date.now(),
    name,
    length,
    width,
    height,
    weight,
    volume: length * width * height,
    color: itemColors[cargoItems.length % itemColors.length]
  };

  cargoItems.push(item);

  document.getElementById("itemName").value = "";
  document.getElementById("itemLength").value = "";
  document.getElementById("itemWidth").value = "";
  document.getElementById("itemHeight").value = "";
  document.getElementById("itemWeight").value = "";
  document.getElementById("itemName").focus();

  renderCargoList();
  updateSummary();
}

function removeCargoItem(itemId) {
  cargoItems = cargoItems.filter(item => item.id !== itemId);
  cargoItems.forEach((item, index) => {
    item.color = itemColors[index % itemColors.length];
  });

  renderCargoList();
  updateSummary();
}

function renderCargoList() {
  const list = document.getElementById("cargoList");

  if (!cargoItems.length) {
    list.innerHTML = `<div class="empty-state">No cargo items added yet.</div>`;
    return;
  }

  list.innerHTML = cargoItems.map(item => `
    <div class="cargo-item">
      <div>
        <h4>${item.name}</h4>
        <p>
  ${item.sku ? item.sku + " · " : ""}
  ${item.length}m × ${item.width}m × ${item.height}m · 
  ${formatVolume(item.volume)} · 
  ${formatWeight(item.weight)}
</p>
      </div>
      <button class="delete-btn" onclick="removeCargoItem('${item.id}')">Remove</button>
    </div>
  `).join("");
}

function updateSummary() {
  const totalVolume = cargoItems.reduce((sum, item) => sum + item.volume, 0);
  const totalWeight = cargoItems.reduce((sum, item) => sum + item.weight, 0);
  const vehicleVolume = getVehicleVolume(selectedVehicle);
  const fill = vehicleVolume ? Math.min(100, Math.round((totalVolume / vehicleVolume) * 100)) : 0;

  document.getElementById("summaryItems").textContent = cargoItems.length;
  document.getElementById("summaryVolume").textContent = formatVolume(totalVolume);
  document.getElementById("summaryWeight").textContent = formatWeight(totalWeight);
  document.getElementById("summaryVehicle").textContent = selectedVehicle.name;
  document.getElementById("fillPercent").textContent = `${fill}%`;
  document.getElementById("fillBar").style.width = `${fill}%`;
}

function optimizeSession() {
  const shipmentId = document.getElementById("shipmentId").value.trim() || "KL-" + Date.now();
  const destination = document.getElementById("destination").value.trim() || "Unassigned destination";
  const priority = document.getElementById("priority").value;
  const routeType = document.getElementById("routeType").value;

  if (!cargoItems.length) {
    alert("Please add at least one cargo item before running optimization.");
    return;
  }

  const result = runPackingOptimization(cargoItems, selectedVehicle);

  const session = {
    id: "SESSION-" + Date.now(),
    shipmentId,
    destination,
    priority,
    routeType,
    date: todayLabel(),
    vehicleId: selectedVehicle.id,
    vehicleName: selectedVehicle.name,
    vehicle: selectedVehicle,
    items: cargoItems,
    totalVolume: cargoItems.reduce((sum, item) => sum + item.volume, 0),
    totalWeight: cargoItems.reduce((sum, item) => sum + item.weight, 0),
    utilization: result.utilization,
    unusedVolume: result.unusedVolume,
    tripsNeeded: result.tripsNeeded,
    tripsSaved: result.tripsSaved,
    packedItems: result.packedItems,
    unpackedItems: result.unpackedItems,
    aiRecommendation: result.aiRecommendation
  };

  const sessions = loadSessions();
  sessions.unshift(session);
  saveSessions(sessions);
  saveSelectedSession(session);

  goTo("visualize.html");
}

function loadSampleCargo() {
  cargoItems = [];

  const samplePlan = [
    { sku: "KL-RTC-001", qty: 2 },
    { sku: "KL-HAB-002", qty: 1 },
    { sku: "KL-HWC-003", qty: 1 },
    { sku: "KL-TSB-004", qty: 2 },
    { sku: "KL-PFU-005", qty: 1 },
    { sku: "KL-DRP-007", qty: 1 }
  ];

  samplePlan.forEach(plan => {
    const product = PRODUCT_DATABASE.find(item => item.sku === plan.sku);

    if (!product) return;

    for (let i = 0; i < plan.qty; i++) {
      const itemIndex = cargoItems.length;

      cargoItems.push({
        id: `${product.sku}-SAMPLE-${i}-${Date.now()}`,
        sku: product.sku,
        name: plan.qty > 1 ? `${product.name} #${i + 1}` : product.name,
        length: product.length,
        width: product.width,
        height: product.height,
        weight: product.weight,
        volume: product.length * product.width * product.height,
        color: itemColors[itemIndex % itemColors.length]
      });
    }
  });

  document.getElementById("shipmentId").value = "KL-2026-009";
  document.getElementById("destination").value = "Kawan Lama Retail Cluster - Jakarta";
  document.getElementById("priority").value = "High";
  document.getElementById("routeType").value = "Retail Replenishment";

  renderCargoList();
  updateSummary();
}

function renderProductOptions() {
  const select = document.getElementById("productSelect");

  if (!select) return;

  select.innerHTML = PRODUCT_DATABASE.map(product => {
    return `
      <option value="${product.sku}">
        ${product.sku} — ${product.name}
      </option>
    `;
  }).join("");
}

function previewSelectedProduct() {
  const select = document.getElementById("productSelect");
  const preview = document.getElementById("productPreview");

  if (!select || !preview) return;

  const product = PRODUCT_DATABASE.find(item => item.sku === select.value);

  if (!product) {
    preview.textContent = "Select a product to preview its dimensions.";
    return;
  }

  const volume = product.length * product.width * product.height;

  preview.innerHTML = `
    <div class="product-preview-grid">
      <div class="product-preview-item">
        <span>Product</span>
        <strong>${product.name}</strong>
      </div>

      <div class="product-preview-item">
        <span>Category</span>
        <strong>${product.category}</strong>
      </div>

      <div class="product-preview-item">
        <span>Dimensions</span>
        <strong>${product.length}m × ${product.width}m × ${product.height}m</strong>
      </div>

      <div class="product-preview-item">
        <span>Weight</span>
        <strong>${formatWeight(product.weight)}</strong>
      </div>
    </div>

    <p style="margin-top:10px">
      SKU <strong>${product.sku}</strong> will add ${formatVolume(volume)} per unit to this shipment.
    </p>
  `;
}

function addProductFromDatabase() {
  const selectedSku = document.getElementById("productSelect").value;
  const quantity = Number(document.getElementById("productQty").value);

  const product = PRODUCT_DATABASE.find(item => item.sku === selectedSku);

  if (!product) {
    alert("Please select a valid product.");
    return;
  }

  if (!quantity || quantity <= 0) {
    alert("Quantity must be at least 1.");
    return;
  }

  for (let i = 0; i < quantity; i++) {
    const itemIndex = cargoItems.length;

    const item = {
      id: `${product.sku}-${Date.now()}-${i}`,
      sku: product.sku,
      name: quantity > 1 ? `${product.name} #${i + 1}` : product.name,
      length: product.length,
      width: product.width,
      height: product.height,
      weight: product.weight,
      volume: product.length * product.width * product.height,
      color: itemColors[itemIndex % itemColors.length]
    };

    cargoItems.push(item);
  }

  renderCargoList();
  updateSummary();

  document.getElementById("productQty").value = 1;
}

initSessionPage();