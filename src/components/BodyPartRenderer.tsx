import { useEffect, useRef, useState } from "react";
import { BodyPartBox, SwipePoint, processSwipe } from "../utils/combat/v1";
import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { Health } from "../game/Character";
import { drawSwipe } from "../utils/combat/v1/drawSwipe";
import { animateMask } from "../utils/combat/v1/animateMask";

type BodyPartRendererProps = {
  bodyParts: BodyPartBox[];
  size?: number;
  onClick: (point: SwipePoint) => void;
};

export const BodyPartRenderer = ({
  bodyParts,
  size = 100,
  onClick,
}: BodyPartRendererProps) => {
  const multiplier = size / 100;
  const appRef = useRef<HTMLDivElement | null>(null);
  const pixiApp = useRef<PIXI.Application>();
  const [healthMap, setHealth] = useState<Health>({
    leftArm: 100,
    rightArm: 100,
    leftLeg: 100,
    rightLeg: 100,
    torso: 100,
  });

  const [point1, setPoint1] = useState<SwipePoint | null>(null);
  const [point2, setPoint2] = useState<SwipePoint | null>(null);

  useEffect(() => {
    if (!pixiApp.current) {
      pixiApp.current = new PIXI.Application({
        width: size,
        height: size,
        antialias: true,
        backgroundColor: 0x000000,
      });
    }

    if (appRef.current && pixiApp.current) {
      appRef.current.appendChild(pixiApp.current.view as HTMLCanvasElement);
    }
  }, []);

  useEffect(() => {
    if (!pixiApp.current) return;
    const app = pixiApp.current;
    drawParts(app, bodyParts, healthMap, multiplier);
  }, [bodyParts, pixiApp]);

  useEffect(() => {
    if (!appRef.current || !pixiApp.current || !point1 || !point2) return;
    const app = pixiApp.current;
    const result = processSwipe({
      swipeStart: point1,
      swipeEnd: point2,
      bodyPartBoxes: bodyParts,
      playerHealth: healthMap,
      initialWeaponSpeed: 50,
    });

    drawParts(app, bodyParts, result.newHealth, multiplier);
    const { swipeEntryExitPoints, startEndSpeed } = result;
    const swipe = drawSwipe(
      app,
      swipeEntryExitPoints.entryExitPoints,
      startEndSpeed,
      swipeEntryExitPoints.order,
      multiplier
    );

    const swipeStart = swipeEntryExitPoints.entryExitPoints.get(
      swipeEntryExitPoints.order[0]
    )!.points[0];
    const swipeEnd = swipeEntryExitPoints.entryExitPoints.get(
      swipeEntryExitPoints.order[swipeEntryExitPoints.order.length - 1]
    )!.points[1];

    const swipeAngle = Math.atan2(
      swipeEnd.y - swipeStart.y,
      swipeEnd.x - swipeStart.x
    );

    animateMask(swipe, swipeAngle, 0.3);

    gsap.to(swipe, {
      alpha: 0,
      duration: 1,
      delay: 0.3,
    });

    setHealth(result.newHealth);

    console.log(result);

    setPoint1(null);
    setPoint2(null);
  }, [point1, point2]);

  const handleClick = (event: React.MouseEvent<any>) => {
    if (!appRef.current) return;
    const multiplier = 100 / size;
    // editorRef.current?.handleClick(event);
    const rect = appRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) * multiplier;
    const y = (event.clientY - rect.top) * multiplier;
    console.log(x, y);

    if (!point1) {
      setPoint1({ x, y });
    } else if (!point2) {
      setPoint2({ x, y });
    }

    onClick({ x, y });
  };

  return (
    <div>
      <pre>{JSON.stringify({ point1, point2 })}</pre>
      <div ref={appRef} onClick={handleClick} />
      {/* <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ border: "1px solid white" }}
        onClick={handleClick}
        // onClick={onClick}
      /> */}
    </div>
  );
};

function drawParts(
  app: PIXI.Application,
  bodyParts: BodyPartBox[],
  healthMap: Health,
  multiplier: number = 1
) {
  bodyParts.forEach((bodyPart) => {
    const rectangle = new PIXI.Graphics();
    const health = healthMap[bodyPart.bodyPart];
    const color =
      health !== undefined ? getFillColorByHealth(health) : 0xff00ff;

    rectangle.beginFill(color);
    rectangle.drawRect(
      bodyPart.x * multiplier,
      bodyPart.y * multiplier,
      bodyPart.width * multiplier,
      bodyPart.height * multiplier
    );
    rectangle.endFill();
    app.stage.addChild(rectangle);
  });
}
