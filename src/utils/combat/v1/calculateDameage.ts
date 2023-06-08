import { BodyPart } from "../../../game/Character";
import { StartEndSpeedMap } from "./calculateStartEndSpeed";

export type DamageMap = Map<BodyPart, number>;

export function calculateDamage(
  hitCentralityMap: Map<BodyPart, number>,
  speedMap: StartEndSpeedMap
): DamageMap {
  const damageMap: DamageMap = new Map();

  for (const [bodyPart, speedData] of speedMap.entries()) {
    const hitCentrality = hitCentralityMap.get(bodyPart);
    if (hitCentrality === undefined) continue;

    const { startSpeed, endSpeed } = speedData;
    const damage = ((startSpeed + endSpeed) / 2) * hitCentrality;

    damageMap.set(bodyPart, damage);
  }

  return damageMap;
}
