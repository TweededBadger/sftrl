import { Armor, BodyPart, Health } from "../../../game/Character";
import { applyDamage } from "./applyDamage";
import { DamageMap, calculateDamage } from "./calculateDameage";
import { calculateHitCentrality } from "./calculateHitCentrality";
import {
  StartEndSpeedMap,
  calculateStartEndSpeed,
} from "./calculateStartEndSpeed";
import {
  SwipeEntryExitPointsMap,
  calculateSwipeEntryExitPoints,
} from "./calculateSwipeEntryExitPoints";

export { calculateSwipeEntryExitPoints } from "./calculateSwipeEntryExitPoints";

export type SwipePoint = {
  x: number;
  y: number;
};

export type BodyPartBox = {
  bodyPart: BodyPart;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type HitCentralityMap = Map<BodyPart, number>;

interface ProcessSwipeResult {
  // newPlayerHealth: Health;
  hitCentrality: HitCentralityMap;
  swipeEntryExitPoints: {
    entryExitPoints: SwipeEntryExitPointsMap;
    order: BodyPart[];
  };
  startEndSpeed: StartEndSpeedMap;
  damageMap: DamageMap;
  newHealth: Health;
  newArmor: Armor;
  // swipeData: {
  //   bodyPart: BodyPart;
  //   entryPoint: SwipePoint;
  //   exitPoint: SwipePoint;
  //   entrySpeed: number;
  //   exitSpeed: number;
  // }[];
}

export function processSwipe(params: {
  swipeStart: SwipePoint;
  swipeEnd: SwipePoint;
  bodyPartBoxes: BodyPartBox[];
  weaponAttributes?: any;
  playerHealth: Health;
  playerArmor: Armor;
}): ProcessSwipeResult {
  const { bodyPartBoxes, playerHealth, playerArmor } = params;
  const swipeEntryExitPoints = calculateSwipeEntryExitPoints({
    swipeStart: params.swipeStart,
    swipeEnd: params.swipeEnd,
    bodyPartBoxes: params.bodyPartBoxes,
  });

  const hitCentrality = calculateHitCentrality({
    entryExitPoints: swipeEntryExitPoints.entryExitPoints,
    bodyPartBoxes,
  });

  const startEndSpeed = calculateStartEndSpeed(
    params.swipeStart,
    swipeEntryExitPoints.entryExitPoints,
    swipeEntryExitPoints.order
  );
  const damageMap = calculateDamage(hitCentrality, startEndSpeed);

  const { newArmor, newHealth } = applyDamage(
    playerHealth,
    playerArmor,
    damageMap
  );

  return {
    hitCentrality,
    swipeEntryExitPoints,
    startEndSpeed,
    damageMap,
    newHealth,
    newArmor,
  };
}
