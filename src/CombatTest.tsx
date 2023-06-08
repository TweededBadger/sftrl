import { useEffect, useRef, useState } from "react";
import { BodyPartRenderer } from "./components/BodyPartRenderer";
import { BodyPartBox, SwipePoint, processSwipe } from "./utils/combat/v1";
import { CombatCharacter, Health } from "./game/Character";
import * as PIXI from "pixi.js";
import { Combat } from "./game/CombatV1";

const bodyPartBoxes: BodyPartBox[] = [
  { bodyPart: "leftArm", x: 5, y: 5, width: 35, height: 20 },
  { bodyPart: "rightArm", x: 60, y: 5, width: 35, height: 20 },
  { bodyPart: "leftLeg", x: 20, y: 40, width: 20, height: 50 },
  { bodyPart: "rightLeg", x: 60, y: 40, width: 20, height: 50 },
  { bodyPart: "torso", x: 40, y: 5, width: 20, height: 60 },
];

const CombatTest = () => {
  const appRef = useRef<HTMLDivElement | null>(null);
  const pixiApp = useRef<PIXI.Application>();
  const combat = useRef<Combat>();

  useEffect(() => {
    if (combat.current) return;
    if (!pixiApp.current) {
      pixiApp.current = new PIXI.Application({
        width: 1200,
        height: 800,
        antialias: true,
        backgroundColor: 0x000000,
      });
    }

    if (appRef.current && pixiApp.current) {
      appRef.current.appendChild(pixiApp.current.view as HTMLCanvasElement);

      const character1: CombatCharacter = new CombatCharacter();
      const character2: CombatCharacter = new CombatCharacter();

      combat.current = new Combat({
        app: pixiApp.current,
        characters: [character1, character2],
        scale: 1,
      });
    }
  }, []);

  return (
    <div>
      <div ref={appRef} />
      {/* <BodyPartRenderer
        bodyParts={bodyPartBoxes}
        size={600}
        onClick={handleClick}
      /> */}
    </div>
  );
};

export default CombatTest;
