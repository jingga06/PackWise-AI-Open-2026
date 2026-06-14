# PackWise - AI Fleet Space Optimization

> **AI Open Innovation Challenge 2026** · Team Oops.exe · PT. Kawan Lama Solution · Case 2: Smart Logistics

PackWise is a web-based Information System that solves a real operational problem at PT. Kawan Lama Solution: cargo loading decisions made by intuition instead of data. Warehouse operators input item dimensions, select a vehicle, and PackWise generates the optimal 3D loading arrangement, complete with a live 3D visualization and a printable loading guide.

---

## The Problem

PT. Kawan Lama Solution handles hundreds of daily shipments across Indonesia. Warehouse crews arrange cargo manually, based on habit and personal judgment. The result: trucks regularly depart at 60–75% capacity, wasting fuel costs and vehicle hours on trips that didn't need to happen.

PackWise fixes this with a two-phase optimization engine and makes the result immediately usable by any warehouse worker — no data science background required.

---

## Live Demo

🔗 **Live demo:** https://jingga06.github.io/PackWise-AI-Open-2026/login.html

---

## Demo Accounts

| Role | Username | Password |
|---|---|---|
| Warehouse Operator | `operator` | `packwise123` |
| Logistics Manager | `manager` | `packwise123` |

---

## Features

### For Warehouse Operators
- **New Loading Session** — create a shipment session with date, route, and notes
- **Product Database Input** — select items by SKU from the built-in product catalogue (PT. Kawan Lama Solution SKU format)
- **Manual Item Input** — add custom items by entering dimensions and weight directly
- **Vehicle Selection** — choose from the fleet database (Box Truck S / M / L)
- **AI Optimization Engine** — runs First Fit Decreasing + Genetic Algorithm-style refinement
- **3D Cargo Visualization** — interactive Three.js render showing exact placement of every item inside the truck
- **Box Inspection** — click any box in the 3D view to see its item name, SKU, dimensions, and rotation
- **Utilization Report** — space utilization %, unused volume, trips needed, estimated trips saved vs. manual loading
- **AI Recommendation** — auto-generated plain-language advice per session
- **Printable Loading Guide** — step-by-step instruction list for the loading crew, formatted for print

### For Logistics Managers
- **Management Dashboard** — Chart.js charts for utilization trends, vehicle usage distribution, estimated cost saved
- **Session History** — browse all past loading sessions with key metrics
- **Fleet Database** — view vehicle specifications (internal dimensions, max weight)
- **3D Visualization Access** — open saved 3D views from any past session
- **Loading Guide Access** — review and reprint loading instructions from past sessions

---

## How the Optimization Works

PackWise runs a **two-phase optimization** on every session:

### Phase 1First Fit Decreasing (FFD)
Items are sorted by volume from largest to smallest, then placed one by one into the virtual cargo space. For each item, PackWise tries all 6 valid rotation orientations and finds the first valid position using a candidate point list (corner-based placement strategy). A position is valid only if:
- The item fits within vehicle boundaries
- It does not overlap any already-placed item
- If elevated, it has ≥ 55% surface area support from boxes below

### Phase 2Genetic Algorithm-style Refinement
PackWise generates 17 candidate arrangements by varying item order across different sorting strategies (volume, weight, height, length, width) and randomized priority shuffles. Each candidate is scored by a fitness function that weighs space utilization, packed item count, weight balance, and unpacked item penalty. The highest-scoring arrangement is selected as the final output.

**Why Genetic Algorithm over Reinforcement Learning?** GA produces useful results without historical training data — critical for a fresh deployment where no prior optimized loading records exist. Physical constraints (weight limits, stacking support ratios) are encoded directly into the fitness function, making every output safe and interpretable for warehouse staff.

---

## Fleet Database

| Vehicle | Type | Dimensions (L × W × H) | Max Weight |
|---|---|---|---|
| Box Truck S 🚐 | Small delivery truck | 4.5 × 2.2 × 1.8 m | 2,500 kg |
| Box Truck M 🚛 | Medium distribution truck | 6.0 × 2.4 × 2.0 m | 5,000 kg |
| Box Truck L 🚚 | Large logistics truck | 8.0 × 2.6 × 2.2 m | 8,000 kg |

---

## Product Database (Sample SKUs)

The prototype includes a sample product catalogue in PT. Kawan Lama Solution's SKU format:

| SKU | Item | Category |
|---|---|---|
| KL-RTC-001 | Retail Carton A | Retail Goods |
| KL-HAB-002 | Home Appliance Box | Appliance |
| KL-HWC-003 | Hardware Crate | Hardware |
| KL-TSB-004 | Tool Storage Box | Tools |
| KL-PFU-005 | Packed Fixture Unit | Fixture |
| KL-SRB-006 | Small Retail Boxes | Retail Goods |
| KL-DRP-007 | Display Rack Package | Display |

In production, item dimensions would be retrieved automatically from PT. Kawan Lama Solution's product master database via SKU, barcode, RFID, or CSV import.

---

## User Flow

### Warehouse Operator
```
Login → New Session → Add Items (SKU or manual) → Select Vehicle
→ Run PackWise AI Engine → View 3D Visualization → Inspect boxes
→ Review Utilization Report → Print Loading Guide
```

### Logistics Manager
```
Login → Dashboard (charts & KPIs) → Session History
→ Open saved 3D View / Loading Guide → Fleet Database
```

---

## Tech Stack

### Prototype (Current)
| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (custom, no framework) |
| Logic | Vanilla JavaScript |
| 3D Visualization | Three.js |
| Charts | Chart.js |
| Storage | Browser `localStorage` (mock database) |

### Production Architecture (Proposed)
| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend & API | Python · Django REST Framework |
| Optimization Engine | Python (FFD + GA) |
| 3D Visualization | Three.js |
| Charts | Chart.js |
| Database | PostgreSQL |
| Auth | Role-based access (Operator / Manager) |

> **Why localStorage for the prototype?** The prototype uses browser `localStorage` as a mock database to demonstrate the full end-to-end workflow without requiring a server setup. In production, all session data will be stored in PostgreSQL connected through Django REST Framework.

---

## Project Structure

```
packwise/
├── login.html              # Authentication page
├── index.html              # Manager dashboard
├── session.html            # New loading session / operator main page
├── visualize.html          # 3D cargo visualization
├── guide.html              # Printable loading guide
├── fleet.html              # Fleet database view
│
├── css/
│   ├── main.css            # Global layout, sidebar, shared components
│   ├── auth.css            # Login page styles
│   ├── dashboard.css       # Manager dashboard charts and KPI cards
│   ├── session.css         # Session form, item list, vehicle selector
│   ├── visualize.css       # 3D view layout and overlay panels
│   ├── guide.css           # Printable guide formatting
│   └── fleet.css           # Fleet table and vehicle cards
│
├── js/
│   ├── app.js              # Shared utilities (storage, formatting, auth helpers)
│   ├── auth.js             # Login logic and role-based routing
│   ├── dashboard.js        # KPI calculation and Chart.js rendering
│   ├── session.js          # Session creation, item management, vehicle selection
│   ├── algorithm.js        # FFD + GA optimization engine (core logic)
│   ├── visualize.js        # Three.js 3D scene, camera, box rendering, interaction
│   ├── guide.js            # Loading instruction generation and print handler
│   └── fleet.js            # Fleet database rendering
│
└── data/
    ├── fleet.js            # Vehicle specifications (dimensions, weight limits)
    └── products.js         # Sample product catalogue (SKU, dimensions, weight)
```

---

## Running the Prototype

No build tools or server required. Open directly in a browser:

```bash
# Clone the repository
git clone https://github.com/jingga06/packwise.git
cd packwise

# Open in browser
open login.html
# or just double-click login.html in your file explorer
```

> Works on any modern browser (Chrome, Firefox, Edge, Safari). No installation needed.

---

## Expected Impact

| Metric | Before PackWise | With PackWise |
|---|---|---|
| Average fleet utilization | ~60–75% (manual) | ~80–85% (optimized) |
| Loading decision basis | Worker intuition | Algorithm output |
| Historical data available | None | Per-session dashboard |
| Logistics cost reduction | - | Projected 10–20% |

Based on benchmark improvements reported in 3D bin packing optimization literature (Martello, Pisinger & Vigo, 2000).

---

## Team

**Team Oops.exe** · President University · Information Systems

| Name | Role |
|---|---|
| Fatwa Putri Jingga | Team Leader · Backend Developer · Algorithm Engineer |
| Marsha Aulia Rizky | UI/UX Designer · Dashboard Developer |
| Syakira Lathifa Awliya | Research · Documentation · System Testing |
| Regan Albion | Frontend Developer (React.js & Three.js) |
| Yose Elvis Saputra | Database Engineer · API Integration |

---

## References

- Martello, S., Pisinger, D., & Vigo, D. (2000). The three-dimensional bin packing problem. *Operations Research, 48*(2), 256–267.
- World Bank. (2023). *Connecting to compete 2023: Trade logistics in the global economy.* The World Bank Group.
- Crainic, T. G., Perboli, G., & Tadei, R. (2008). Extreme point-based heuristics for three-dimensional bin packing. *INFORMS Journal on Computing, 20*(3), 368–384.

---

<div align="center">
  Built for AI Open Innovation Challenge 2026 · Sponsored by Kemenko Perekonomian RI, Jababeka & Co., and President University
</div>
