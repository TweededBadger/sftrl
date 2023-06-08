import * as PIXI from "pixi.js";
import { GlowFilter } from "@pixi/filter-glow";

import { BodyPartBox } from ".";
import { Armor, Health } from "../../../game/Character";

function getFillColorByHealth(health: number): number {
  const green = Math.floor(255 * (health / 100));
  const red = 255 - green;
  return (red << 16) | (green << 8);
}
interface DrawPartsProps {
  bodyParts: BodyPartBox[];
  healthMap: Health;
  armorMap: Armor;
  multiplier: number;
  isActivePlayer?: boolean;
}

export function drawParts({
  bodyParts,
  healthMap,
  armorMap,
  multiplier,
  isActivePlayer,
}: DrawPartsProps): PIXI.Graphics {
  const graphic = new PIXI.Graphics();

  bodyParts.forEach((bodyPart) => {
    const health = healthMap[bodyPart.bodyPart];
    const armor = armorMap[bodyPart.bodyPart];
    const color =
      health !== undefined ? getFillColorByHealth(health) : 0xff00ff;

    // Draw the body part with the health color
    graphic.beginFill(color);
    const armorWidth = armor * 0.5;
    graphic.lineStyle(armorWidth, 0xffffff, 1);
    graphic.drawRect(
      bodyPart.x * multiplier,
      bodyPart.y * multiplier,
      bodyPart.width * multiplier,
      bodyPart.height * multiplier
    );
    graphic.endFill();
    const label = new PIXI.Text(Math.round(health), {
      fill: ["#000000"], // gradient
      align: "center",
      fontSize: 20,
    });
    label.x = bodyPart.x * multiplier;
    label.y = bodyPart.y * multiplier;
    graphic.addChild(label);
  });

  // If this player is the active player, add a glow effect
  if (isActivePlayer) {
    const glowFilter = new GlowFilter({ color: 0x0000ff, distance: 15 });
    graphic.filters = [glowFilter];
  }

  //   container.addChild(graphic);

  return graphic;
}
