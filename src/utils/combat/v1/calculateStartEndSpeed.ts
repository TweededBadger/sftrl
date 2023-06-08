import { SwipePoint } from ".";
import { BodyPart } from "../../../game/Character";
import { SwipeEntryExitPointsMap } from "./calculateSwipeEntryExitPoints";

export type StartEndSpeedData = {
  startSpeed: number;
  endSpeed: number;
};

export type StartEndSpeedMap = Map<BodyPart, StartEndSpeedData>;

export function calculateStartEndSpeed(
  swipeStartPoint: SwipePoint,
  swipeEntryExitPoints: SwipeEntryExitPointsMap,
  order: BodyPart[]
): StartEndSpeedMap {
  const speedMap: StartEndSpeedMap = new Map();

  let currentSpeed = 0;
  let firstHit = true;

  // This is our acceleration - change it if you want a different speed up!
  const acceleration = 1.5;

  for (const bodyPart of order) {
    const entryExitData = swipeEntryExitPoints.get(bodyPart);
    if (!entryExitData) continue;

    const {
      points: [entryPoint],
      swipeLength,
    } = entryExitData;

    // We measure the distance from the start to the first hit - that's our "time"
    const distanceToEntryPoint = Math.sqrt(
      Math.pow(swipeStartPoint.x - entryPoint.x, 2) +
        Math.pow(swipeStartPoint.y - entryPoint.y, 2)
    );

    // Calculate the start speed for this body part using our acceleration equation
    let startSpeed = firstHit
      ? acceleration * distanceToEntryPoint
      : currentSpeed;
    if (startSpeed < 0) startSpeed = 0;

    // The end speed is the start speed minus the swipe length through the body part
    let endSpeed = startSpeed - swipeLength * 0.5;
    if (endSpeed < 0) endSpeed = 0;

    speedMap.set(bodyPart, {
      startSpeed: startSpeed,
      endSpeed: endSpeed,
    });

    // The current speed for the next body part is the end speed of the current one
    currentSpeed = endSpeed;
    firstHit = false;
  }

  return speedMap;
}
