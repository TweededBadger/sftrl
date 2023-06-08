import { SwipePoint } from ".";

export function calculateEndPoint(
  start: SwipePoint,
  end: SwipePoint,
  maxDistance: number
): { distance: number; endPoint: SwipePoint } {
  // Calculate the distance between the start point and the end point
  let dx = end.x - start.x;
  let dy = end.y - start.y;
  let distance = Math.sqrt(dx * dx + dy * dy);

  // If the distance exceeds the maximum distance, adjust the end point
  if (distance > maxDistance) {
    let ratio = maxDistance / distance;
    dx *= ratio;
    dy *= ratio;
    end.x = start.x + dx;
    end.y = start.y + dy;
  }

  dx = end.x - start.x;
  dy = end.y - start.y;
  distance = Math.sqrt(dx * dx + dy * dy);

  return { distance, endPoint: end };
}
