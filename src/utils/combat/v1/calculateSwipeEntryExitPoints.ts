import { BodyPartBox, SwipePoint } from ".";
import { BodyPart } from "../../../game/Character";

function lineRectIntersection(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): SwipePoint[] {
  const left = lineLineIntersection(x1, y1, x2, y2, rx, ry, rx, ry + rh);
  const right = lineLineIntersection(
    x1,
    y1,
    x2,
    y2,
    rx + rw,
    ry,
    rx + rw,
    ry + rh
  );
  const top = lineLineIntersection(x1, y1, x2, y2, rx, ry, rx + rw, ry);
  const bottom = lineLineIntersection(
    x1,
    y1,
    x2,
    y2,
    rx,
    ry + rh,
    rx + rw,
    ry + rh
  );

  const intersections = [left, right, top, bottom].filter(
    Boolean
  ) as SwipePoint[];
  return intersections.filter((intersection, index, self) => {
    return (
      index ===
      self.findIndex(
        (other) =>
          Math.abs(intersection.x - other.x) < 1e-10 &&
          Math.abs(intersection.y - other.y) < 1e-10
      )
    );
  });
}

function lineLineIntersection(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number
): SwipePoint | null {
  const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  if (denominator === 0) return null;

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    const px = x1 + t * (x2 - x1);
    const py = y1 + t * (y2 - y1);
    return { x: px, y: py };
  }

  return null;
}

export type SwipeEntryExitData = {
  points: [SwipePoint, SwipePoint];
  swipeLength: number;
};
export type SwipeEntryExitPointsMap = Map<BodyPart, SwipeEntryExitData>;

type EntryExitData = {
  bodyPart: BodyPart;
  data: SwipeEntryExitData;
  entryDistance: number;
};

export function calculateSwipeEntryExitPoints({
  swipeStart,
  swipeEnd,
  bodyPartBoxes,
}: {
  swipeStart: SwipePoint;
  swipeEnd: SwipePoint;
  bodyPartBoxes: BodyPartBox[];
}): { entryExitPoints: SwipeEntryExitPointsMap; order: BodyPart[] } {
  const swipeEntryExitPoints: SwipeEntryExitPointsMap = new Map();
  const entryData: EntryExitData[] = [];

  bodyPartBoxes.forEach((box) => {
    const intersections = lineRectIntersection(
      swipeStart.x,
      swipeStart.y,
      swipeEnd.x,
      swipeEnd.y,
      box.x,
      box.y,
      box.width,
      box.height
    );

    if (intersections.length === 2) {
      const [entry, exit] = intersections.sort((a, b) => {
        const distA = Math.hypot(a.x - swipeStart.x, a.y - swipeStart.y);
        const distB = Math.hypot(b.x - swipeStart.x, b.y - swipeStart.y);
        return distA - distB;
      });

      const swipeLength = Math.hypot(exit.x - entry.x, exit.y - entry.y);

      const data: SwipeEntryExitData = {
        points: [entry, exit],
        swipeLength,
      };

      swipeEntryExitPoints.set(box.bodyPart, data);

      entryData.push({
        bodyPart: box.bodyPart,
        data,
        entryDistance: Math.hypot(
          entry.x - swipeStart.x,
          entry.y - swipeStart.y
        ),
      });
    }
  });

  // Sort by entry distance
  entryData.sort((a, b) => a.entryDistance - b.entryDistance);

  // Create the order array
  const order = entryData.map((data) => data.bodyPart);

  return { entryExitPoints: swipeEntryExitPoints, order };
}
