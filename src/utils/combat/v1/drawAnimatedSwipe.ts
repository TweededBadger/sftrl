import * as PIXI from "pixi.js";
import { drawSwipe } from "./drawSwipe";
import { animateMask } from "./animateMask";
import { BodyPart } from "../../../game/Character";
import { SwipeEntryExitPointsMap } from "./calculateSwipeEntryExitPoints";
import { StartEndSpeedMap } from "./calculateStartEndSpeed";
import { gsap } from "gsap";
import { SwipePoint } from ".";

export function drawAnimatedSwipe({
  swipeStart,
  swipeEnd,
  swipeEntryExitPoints,
  startEndSpeed,
  order,
  multiplier,
}: DrawAnimatedSwipeProps): PIXI.Graphics {
  const swipe = drawSwipe(
    swipeStart,
    swipeEnd,
    swipeEntryExitPoints,
    startEndSpeed,
    order,
    multiplier
  );

  const swipeHitStart = swipeEntryExitPoints.get(order[0])!.points[0];
  const swipeHitEnd = swipeEntryExitPoints.get(order[order.length - 1])!
    .points[1];

  const swipeAngle = Math.atan2(
    swipeHitEnd.y - swipeHitStart.y,
    swipeHitEnd.x - swipeHitStart.x
  );

  animateMask(swipe, swipeAngle, 0.3);

  gsap.to(swipe, {
    alpha: 0,
    duration: 1,
    delay: 0.3,
  });

  return swipe;
}

interface DrawAnimatedSwipeProps {
  app: PIXI.Application;
  swipeEntryExitPoints: SwipeEntryExitPointsMap;
  startEndSpeed: StartEndSpeedMap;
  swipeStart: SwipePoint;
  swipeEnd: SwipePoint;
  order: BodyPart[];
  multiplier: number;
}
