export function detectCollisions(thisShape, shapes) {
  if (!thisShape || !shapes) return;

  // Loop through all other shapes in the game
  for (const id in shapes) {
    const otherShape = shapes[id];

    // Skip the current shape
    if (otherShape === thisShape) {
      continue;
    }

    const dx = thisShape.x() - otherShape.x();
    const dy = thisShape.y() - otherShape.y();
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < thisShape.radius() + otherShape.radius()) {
      return id;
    }
  }

  // No collisions found
  return null;
}