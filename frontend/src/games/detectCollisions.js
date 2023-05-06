import Konva from "konva";

export function detectCollisions(thisShape, shapes) {
  // Loop through all other shapes in the game
  for (const otherShape of shapes) {
    // Skip the current shape
    if (otherShape === thisShape) {
      continue;
    }

    const dx = thisShape.x - otherShape.x;
    const dy = thisShape.y - otherShape.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < thisShape.radius + otherShape.radius) {
      return otherShape;
    }
  }

  // No collisions found
  return thisShape;
}