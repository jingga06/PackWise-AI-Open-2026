const FLEET = [
  {
    id: "box-s",
    name: "Box Truck S",
    type: "Small delivery truck",
    length: 4.5,
    width: 2.2,
    height: 1.8,
    maxWeight: 2500,
    icon: "🚐"
  },
  {
    id: "box-m",
    name: "Box Truck M",
    type: "Medium distribution truck",
    length: 6.0,
    width: 2.4,
    height: 2.0,
    maxWeight: 5000,
    icon: "🚛"
  },
  {
    id: "box-l",
    name: "Box Truck L",
    type: "Large logistics truck",
    length: 8.0,
    width: 2.6,
    height: 2.2,
    maxWeight: 8000,
    icon: "🚚"
  }
];

function getVehicleVolume(vehicle) {
  return vehicle.length * vehicle.width * vehicle.height;
}