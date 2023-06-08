import { BodyPartBox } from ".";
import { BodyPart } from "../../../game/Character";
import { SwipeEntryExitPointsMap } from "./calculateSwipeEntryExitPoints";

interface CalculateHitCentralityParams {
  entryExitPoints: SwipeEntryExitPointsMap;
  bodyPartBoxes: BodyPartBox[];
}
export function calculateHitCentrality(
  params: CalculateHitCentralityParams
): Map<BodyPart, number> {
  const hitCentralities = new Map<BodyPart, number>();

  for (const bodyPartBox of params.bodyPartBoxes) {
    const entryExit = params.entryExitPoints.get(bodyPartBox.bodyPart);

    if (!entryExit) {
      hitCentralities.set(bodyPartBox.bodyPart, 0);
      continue;
    }

    const [entryPoint, exitPoint] = entryExit.points;

    const result = calculateHitStrengthForBodyPart({
      bodyPartBox,
      entryPoint,
      exitPoint,
    });
    hitCentralities.set(bodyPartBox.bodyPart, result);
  }

  return hitCentralities;
}

function projectPointOntoLine(
  point: Point,
  linePoint: Point,
  lineVector: Point
): Point {
  const t =
    ((point.x - linePoint.x) * lineVector.x +
      (point.y - linePoint.y) * lineVector.y) /
    (lineVector.x ** 2 + lineVector.y ** 2);
  return {
    x: linePoint.x + t * lineVector.x,
    y: linePoint.y + t * lineVector.y,
  };
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

type Point = { x: number; y: number };

function triangleArea(a: Point, b: Point, c: Point): number {
  const area = Math.abs(
    (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2
  );
  return area;
}

function polygonArea(points: Point[]) {
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y - points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

function pointsEqual(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

function sortPointsIntoPolygon(points: Point[]): Point[] {
  // Calculate the centroid
  let centroid: Point = { x: 0, y: 0 };
  for (const point of points) {
    centroid.x += point.x;
    centroid.y += point.y;
  }
  centroid.x /= points.length;
  centroid.y /= points.length;

  // Sort the points by their angle relative to the centroid
  points.sort((a, b) => {
    const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
    const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
    return angleA - angleB;
  });

  return points;
}

interface CalculateHitStrengthParams {
  entryPoint: Point;
  exitPoint: Point;
  bodyPartBox: BodyPartBox;
}

function calculateHitStrengthForBodyPart(
  args: CalculateHitStrengthParams
): number {
  const { entryPoint, exitPoint, bodyPartBox } = args;
  let isVerticalLine = false;
  let swipeLineSlope: number = 0;
  let swipeLineIntercept: number = 0;
  if (entryPoint.x === exitPoint.x) {
    isVerticalLine = true;
  } else {
    swipeLineSlope =
      (exitPoint.y - entryPoint.y) / (exitPoint.x - entryPoint.x);
    swipeLineIntercept = entryPoint.y - swipeLineSlope * entryPoint.x;
  }

  const topLeft: Point = { x: bodyPartBox.x, y: bodyPartBox.y };
  const topRight: Point = {
    x: bodyPartBox.x + bodyPartBox.width,
    y: bodyPartBox.y,
  };
  const bottomLeft: Point = {
    x: bodyPartBox.x,
    y: bodyPartBox.y + bodyPartBox.height,
  };
  const bottomRight: Point = {
    x: bodyPartBox.x + bodyPartBox.width,
    y: bodyPartBox.y + bodyPartBox.height,
  };

  const corners = [topLeft, topRight, bottomRight, bottomLeft];
  const polygon1 = [entryPoint, exitPoint];
  const polygon2 = [exitPoint, entryPoint];

  for (const corner of corners) {
    if (isVerticalLine) {
      if (corner.x <= entryPoint.x) {
        polygon1.push(corner);
      }
      if (corner.x >= entryPoint.x) {
        polygon2.push(corner);
      }
    } else {
      const position =
        swipeLineSlope * corner.x - corner.y + swipeLineIntercept;

      if (position <= 0) {
        polygon1.push(corner);
      } else {
        polygon2.push(corner);
      }
    }
  }
  const polygon1Area = polygonArea(sortPointsIntoPolygon(polygon1));
  const polygon2Area = polygonArea(sortPointsIntoPolygon(polygon2));
  const smallestArea = Math.min(polygon1Area, polygon2Area);
  const largestArea = Math.max(polygon1Area, polygon2Area);

  return smallestArea / largestArea;
}
