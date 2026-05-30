# PackWise — AI Fleet Space Optimization

PackWise is a proof-of-concept web prototype for PT. Kawan Lama Solution's Smart Logistics case in AI Open Innovation Challenge 2026. The system helps warehouse operators optimize cargo arrangement inside delivery trucks using a 3D Bin Packing workflow.

## Live Demo

Live demo link: coming soon

## Prototype Accounts

### Warehouse Operator
Username: `operator`  
Password: `packwise123`

### Logistics Manager
Username: `manager`  
Password: `packwise123`

## Main Features

- Role-based login for warehouse operator and logistics manager
- New loading session with shipment details
- Product database / SKU-based item input
- Manual cargo item input for custom items
- Vehicle fleet database
- AI optimization engine using First Fit Decreasing and Genetic Algorithm-style refinement
- 3D cargo visualization using Three.js
- Cargo detail inspection by clicking 3D boxes
- Utilization report
- Printable loading guide
- Management dashboard using Chart.js

## User Flow

### Warehouse Operator
1. Login as `operator`
2. Open New Session
3. Add cargo items manually or from the product database
4. Select vehicle
5. Run PackWise AI Engine
6. View 3D cargo arrangement
7. Open printable loading guide

### Logistics Manager
1. Login as `manager`
2. View dashboard
3. Monitor utilization, estimated cost saved, and vehicle usage
4. Review fleet database
5. Open saved 3D visualization and loading guide

## Prototype Notes

This prototype uses HTML, CSS, JavaScript, Three.js, Chart.js, and browser localStorage. localStorage is used as a mock database for proof-of-concept purposes.

In the production version, PackWise will use React.js, Django REST Framework, Python optimization services, and PostgreSQL as described in the proposal.

## Project Structure

```text
packwise/
├── login.html
├── index.html
├── session.html
├── visualize.html
├── guide.html
├── fleet.html
├── css/
│   ├── main.css
│   ├── dashboard.css
│   ├── session.css
│   ├── visualize.css
│   ├── guide.css
│   ├── fleet.css
│   └── auth.css
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── dashboard.js
│   ├── session.js
│   ├── algorithm.js
│   ├── visualize.js
│   ├── guide.js
│   └── fleet.js
└── data/
    ├── fleet.js
    └── products.js