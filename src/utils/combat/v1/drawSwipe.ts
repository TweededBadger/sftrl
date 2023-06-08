import * as PIXI from "pixi.js";
import { SwipeEntryExitPointsMap } from "./calculateSwipeEntryExitPoints";
import { StartEndSpeedMap } from "./calculateStartEndSpeed";
import { SwipePoint } from ".";
import { BodyPart } from "../../../game/Character";

export function drawSwipe(
  swipeStartPoint: SwipePoint,
  swipeEndPoint: SwipePoint,
  swipeEntryExitPoints: SwipeEntryExitPointsMap,
  startEndSpeedMap: StartEndSpeedMap,
  order: BodyPart[],
  multiplier: number = 1
) {
  const swipe = new PIXI.Graphics();

  //   const bodyPartsInOrder = Array.from(swipeEntryExitPoints.keys()).sort(
  //     (a, b) => swipeEntryExitPoints.get(a)!.order - swipeEntryExitPoints.get(b)!.order
  //   );

  // const bodyPartsInOrder = order.map((bodyPart) => bodyPart);

  // const swipeStart = swipeEntryExitPoints.get(order[0])!.points[0];
  const swipeStart = swipeStartPoint;
  // const swipeEnd = swipeEntryExitPoints.get(order[order.length - 1])!.points[1];
  const swipeEnd = swipeEndPoint;

  const direction = new PIXI.Point(
    swipeEnd.x - swipeStart.x,
    swipeEnd.y - swipeStart.y
  );

  // Normalize the direction
  const magnitude = Math.sqrt(
    direction.x * direction.x + direction.y * direction.y
  );
  const normalizedDirection = new PIXI.Point(
    direction.x / magnitude,
    direction.y / magnitude
  );

  // Extend the swipeStart
  // const extendedStart = new PIXI.Point(
  //   swipeStart.x - normalizedDirection.x * 20,
  //   swipeStart.y - normalizedDirection.y * 20
  // );

  // const extendedEnd = new PIXI.Point(
  //   swipeEnd.x + normalizedDirection.x * 20,
  //   swipeEnd.y + normalizedDirection.y * 20
  // );

  const leftPoints: SwipePoint[] = [swipeStart];
  const rightPoints: SwipePoint[] = [swipeStart];

  const swipeAngle = Math.atan2(
    swipeEnd.y - swipeStart.y,
    swipeEnd.x - swipeStart.x
  );

  order.forEach((bodyPart, index) => {
    const entryExitData = swipeEntryExitPoints.get(bodyPart);
    if (!entryExitData) return;
    const { points } = entryExitData;
    let [entry, exit] = points;
    // if (index === 0) {
    //   entry = extendedStart;
    // }
    const { startSpeed, endSpeed } = startEndSpeedMap.get(bodyPart)!;

    // Calculate width of the swipe at the entry and exit points
    const entryWidth = startSpeed * 0.01 * multiplier + 2;
    const exitWidth = endSpeed * 0.01 * multiplier + 2;

    // Calculate perpendicular points for entry
    const entryPerpendicular = calculatePerpendicularPoints(
      entry,
      entryWidth,
      swipeAngle
    );
    leftPoints.push(entryPerpendicular.left);
    rightPoints.push(entryPerpendicular.right);

    // If it's the last body part, calculate perpendicular points for exit as well
    if (index === order.length - 1) {
      const exitPerpendicular = calculatePerpendicularPoints(
        exit,
        exitWidth,
        swipeAngle
      );
      leftPoints.push(exitPerpendicular.left);
      rightPoints.push(exitPerpendicular.right);
    }
  });

  leftPoints.push(swipeEndPoint);
  rightPoints.push(swipeEndPoint);

  // Reverse the rightPoints array
  rightPoints.reverse();

  // Begin the fill
  swipe.beginFill(0xffffff);

  // Draw the swipe shape
  swipe.moveTo(leftPoints[0].x * multiplier, leftPoints[0].y * multiplier);
  leftPoints.forEach((point, index) => {
    if (index < leftPoints.length - 2) {
      const nextPoint = leftPoints[index + 1];
      const afterNextPoint = leftPoints[index + 2];
      const controlPoint = new PIXI.Point(
        (nextPoint.x + afterNextPoint.x) / 2,
        (nextPoint.y + afterNextPoint.y) / 2
      );
      swipe.bezierCurveTo(
        nextPoint.x * multiplier,
        nextPoint.y * multiplier,
        controlPoint.x * multiplier,
        controlPoint.y * multiplier,
        afterNextPoint.x * multiplier,
        afterNextPoint.y * multiplier
      );
    } else if (index === leftPoints.length - 2) {
      // Directly draw a line to the last point if it's the second last point
      const nextPoint = leftPoints[index + 1];
      swipe.lineTo(nextPoint.x * multiplier, nextPoint.y * multiplier);
    }
  });

  swipe.lineTo(rightPoints[0].x * multiplier, rightPoints[0].y * multiplier);

  rightPoints.forEach((point, index) => {
    if (index < rightPoints.length - 2) {
      const nextPoint = rightPoints[index + 1];
      const afterNextPoint = rightPoints[index + 2];
      const controlPoint = new PIXI.Point(
        (nextPoint.x + afterNextPoint.x) / 2,
        (nextPoint.y + afterNextPoint.y) / 2
      );
      swipe.bezierCurveTo(
        nextPoint.x * multiplier,
        nextPoint.y * multiplier,
        controlPoint.x * multiplier,
        controlPoint.y * multiplier,
        afterNextPoint.x * multiplier,
        afterNextPoint.y * multiplier
      );
    } else if (index === rightPoints.length - 2) {
      // Directly draw a line to the last point if it's the second last point
      const nextPoint = rightPoints[index + 1];
      swipe.lineTo(nextPoint.x * multiplier, nextPoint.y * multiplier);
    }
  });
  swipe.closePath();

  // End the fill
  swipe.endFill();

  // Add the swipe shape to the stage
  // app.stage.addChild(swipe);

  return swipe;
}

function calculatePerpendicularPoints(
  center: SwipePoint,
  width: number,
  swipeAngle: number
): { left: PIXI.Point; right: PIXI.Point } {
  const perpendicularAngle = swipeAngle + Math.PI / 2;
  const xOffset = (width / 2) * Math.cos(perpendicularAngle);
  const yOffset = (width / 2) * Math.sin(perpendicularAngle);

  const leftPoint = new PIXI.Point(center.x - xOffset, center.y - yOffset);
  const rightPoint = new PIXI.Point(center.x + xOffset, center.y + yOffset);

  return { left: leftPoint, right: rightPoint };
}
