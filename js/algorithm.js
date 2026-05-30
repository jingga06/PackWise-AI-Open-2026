function runPackingOptimization(items, vehicle) {
  const vehicleVolume = getVehicleVolume(vehicle);
  const totalVolume = items.reduce((sum, item) => sum + item.volume, 0);
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

  const ffdResult = firstFitDecreasing(items, vehicle);
  const improvedResult = geneticLikeRefinement(items, vehicle, ffdResult);

  const packedVolume = improvedResult.packedItems.reduce((sum, item) => sum + item.volume, 0);
  const utilization = Math.min(99, Math.round((packedVolume / vehicleVolume) * 100));
  const unusedVolume = Math.max(0, vehicleVolume - packedVolume);

  const weightLimitExceeded = totalWeight > vehicle.maxWeight;
  const tripsNeededByVolume = Math.ceil(totalVolume / (vehicleVolume * 0.85));
  const tripsNeededByWeight = Math.ceil(totalWeight / vehicle.maxWeight);
  const tripsNeeded = Math.max(1, tripsNeededByVolume, tripsNeededByWeight);

  const manualTripsEstimate = Math.max(1, Math.ceil(totalVolume / (vehicleVolume * 0.65)));
  const tripsSaved = Math.max(0, manualTripsEstimate - tripsNeeded);

  return {
    utilization,
    unusedVolume,
    tripsNeeded,
    tripsSaved,
    packedItems: improvedResult.packedItems,
    unpackedItems: improvedResult.unpackedItems,
    aiRecommendation: generateRecommendation({
      utilization,
      unusedVolume,
      tripsNeeded,
      tripsSaved,
      weightLimitExceeded,
      vehicle,
      totalVolume,
      totalWeight,
      packedItems: improvedResult.packedItems,
      unpackedItems: improvedResult.unpackedItems
    })
  };
}

function firstFitDecreasing(items, vehicle) {
  const sorted = [...items].sort((a, b) => b.volume - a.volume);
  return packItems(sorted, vehicle);
}

function geneticLikeRefinement(items, vehicle, baselineResult) {
  const candidates = [];

  candidates.push(baselineResult);
  candidates.push(packItems([...items].sort((a, b) => b.weight - a.weight), vehicle));
  candidates.push(packItems([...items].sort((a, b) => b.height - a.height), vehicle));
  candidates.push(packItems([...items].sort((a, b) => b.length - a.length), vehicle));
  candidates.push(packItems([...items].sort((a, b) => b.width - a.width), vehicle));

  for (let i = 0; i < 12; i++) {
    const shuffled = shuffleWithPriority(items);
    candidates.push(packItems(shuffled, vehicle));
  }

  return candidates.sort((a, b) => scoreCandidate(b, vehicle) - scoreCandidate(a, vehicle))[0];
}

function scoreCandidate(candidate, vehicle) {
  const vehicleVolume = getVehicleVolume(vehicle);
  const packedVolume = candidate.packedItems.reduce((sum, item) => sum + item.volume, 0);
  const packedWeight = candidate.packedItems.reduce((sum, item) => sum + item.weight, 0);

  const utilizationScore = packedVolume / vehicleVolume;
  const packedCountScore = candidate.packedItems.length * 0.015;
  const weightBalanceScore = Math.min(1, packedWeight / vehicle.maxWeight) * 0.05;
  const unpackedPenalty = candidate.unpackedItems.length * 0.12;

  return utilizationScore + packedCountScore + weightBalanceScore - unpackedPenalty;
}

function packItems(items, vehicle) {
  const packedItems = [];
  const unpackedItems = [];

  const candidatePoints = [{ x: 0, y: 0, z: 0 }];

  items.forEach(originalItem => {
    const rotations = getValidRotations(originalItem);
    let bestPlacement = null;

    candidatePoints.sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      if (a.z !== b.z) return a.z - b.z;
      return a.x - b.x;
    });

    for (const point of candidatePoints) {
      for (const rotated of rotations) {
        const candidate = {
          ...originalItem,
          length: rotated.length,
          width: rotated.width,
          height: rotated.height,
          originalLength: originalItem.length,
          originalWidth: originalItem.width,
          originalHeight: originalItem.height,
          x: point.x,
          y: point.y,
          z: point.z,
          rotation: rotated.label
        };

        if (isValidPlacement(candidate, vehicle, packedItems)) {
          bestPlacement = candidate;
          break;
        }
      }

      if (bestPlacement) break;
    }

    if (bestPlacement) {
      packedItems.push(bestPlacement);

      candidatePoints.push(
        { x: bestPlacement.x + bestPlacement.length, y: bestPlacement.y, z: bestPlacement.z },
        { x: bestPlacement.x, y: bestPlacement.y, z: bestPlacement.z + bestPlacement.width },
        { x: bestPlacement.x, y: bestPlacement.y + bestPlacement.height, z: bestPlacement.z }
      );

      removeDuplicatePoints(candidatePoints);
    } else {
      unpackedItems.push(originalItem);
    }
  });

  return { packedItems, unpackedItems };
}

function getValidRotations(item) {
  const rotations = [
    { length: item.length, width: item.width, height: item.height, label: "LWH" },
    { length: item.width, width: item.length, height: item.height, label: "WLH" },
    { length: item.length, width: item.height, height: item.width, label: "LHW" },
    { length: item.height, width: item.width, height: item.length, label: "HWL" },
    { length: item.width, width: item.height, height: item.length, label: "WHL" },
    { length: item.height, width: item.length, height: item.width, label: "HLW" }
  ];

  const unique = [];

  rotations.forEach(rotation => {
    const key = `${rotation.length}-${rotation.width}-${rotation.height}`;
    if (!unique.some(item => `${item.length}-${item.width}-${item.height}` === key)) {
      unique.push(rotation);
    }
  });

  return unique;
}

function isValidPlacement(item, vehicle, packedItems) {
  const insideVehicle =
    item.x + item.length <= vehicle.length + 0.0001 &&
    item.z + item.width <= vehicle.width + 0.0001 &&
    item.y + item.height <= vehicle.height + 0.0001;

  if (!insideVehicle) return false;

  const overlaps = packedItems.some(packed => boxesOverlap(item, packed));

  if (overlaps) return false;

  const isOnFloor = item.y === 0;

  if (!isOnFloor) {
    const supportedArea = calculateSupportedArea(item, packedItems);
    const baseArea = item.length * item.width;
    const supportRatio = supportedArea / baseArea;

    if (supportRatio < 0.55) return false;
  }

  return true;
}

function boxesOverlap(a, b) {
  const separated =
    a.x + a.length <= b.x ||
    b.x + b.length <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y ||
    a.z + a.width <= b.z ||
    b.z + b.width <= a.z;

  return !separated;
}

function calculateSupportedArea(item, packedItems) {
  let supportedArea = 0;
  const itemBottomY = item.y;

  packedItems.forEach(base => {
    const baseTopY = base.y + base.height;

    if (Math.abs(baseTopY - itemBottomY) > 0.0001) return;

    const overlapX = Math.max(
      0,
      Math.min(item.x + item.length, base.x + base.length) - Math.max(item.x, base.x)
    );

    const overlapZ = Math.max(
      0,
      Math.min(item.z + item.width, base.z + base.width) - Math.max(item.z, base.z)
    );

    supportedArea += overlapX * overlapZ;
  });

  return supportedArea;
}

function removeDuplicatePoints(points) {
  const seen = new Set();

  for (let i = points.length - 1; i >= 0; i--) {
    const key = `${points[i].x.toFixed(3)}-${points[i].y.toFixed(3)}-${points[i].z.toFixed(3)}`;

    if (seen.has(key)) {
      points.splice(i, 1);
    } else {
      seen.add(key);
    }
  }
}

function shuffleWithPriority(items) {
  const sorted = [...items].sort((a, b) => b.volume - a.volume);

  for (let i = 1; i < sorted.length - 1; i++) {
    if (Math.random() > 0.55) {
      const temp = sorted[i];
      sorted[i] = sorted[i + 1];
      sorted[i + 1] = temp;
    }
  }

  return sorted;
}

function generateRecommendation(data) {
  const {
    utilization,
    unusedVolume,
    tripsNeeded,
    tripsSaved,
    weightLimitExceeded,
    vehicle,
    totalVolume,
    totalWeight,
    unpackedItems
  } = data;

  if (weightLimitExceeded) {
    return `Total cargo weight exceeds ${vehicle.name}'s maximum load capacity. PackWise recommends splitting the shipment or selecting a larger vehicle before dispatch.`;
  }

  if (unpackedItems.length > 0) {
    return `${unpackedItems.length} item(s) could not be packed into ${vehicle.name}. Consider using a larger vehicle or splitting this shipment into ${tripsNeeded} trips.`;
  }

  if (utilization >= 85) {
    return `Excellent loading plan. ${vehicle.name} reaches ${utilization}% utilization with only ${formatVolume(unusedVolume)} unused space. This session is ready for warehouse execution.`;
  }

  if (utilization >= 70) {
    return `Good loading plan, but there is still ${formatVolume(unusedVolume)} unused space. PackWise recommends checking whether nearby low-volume shipment items can be combined to improve dispatch efficiency.`;
  }

  if (tripsSaved > 0) {
    return `PackWise estimates this optimized arrangement can save ${tripsSaved} trip(s) compared with manual loading assumptions. Utilization is ${utilization}%, with improvement potential through item consolidation.`;
  }

  return `Utilization is still low at ${utilization}%. Consider using a smaller vehicle, consolidating this route with another shipment, or reviewing item grouping before dispatch.`;
}