import { Health, Armor } from "../../../game/Character";
import { DamageMap } from "./calculateDameage";

export function applyDamage(
  health: Health,
  armor: Armor,
  damageMap: DamageMap
): { newHealth: Health; newArmor: Armor } {
  const newHealth: Health = { ...health };
  const newArmor: Armor = { ...armor };

  for (const [bodyPart, damage] of damageMap.entries()) {
    let remainingDamage = damage;

    // If armor exists for the body part, reduce it first
    if (newArmor[bodyPart] !== undefined) {
      if (newArmor[bodyPart] >= remainingDamage) {
        // If the armor is more than or equal to the damage, completely absorb it
        newArmor[bodyPart] -= remainingDamage;
        remainingDamage = 0;
      } else {
        // If the armor is less than the damage, absorb what it can and reduce the remaining damage
        remainingDamage -= newArmor[bodyPart];
        newArmor[bodyPart] = 0;
      }
    }

    // If there is any damage remaining, reduce health
    if (remainingDamage > 0 && newHealth[bodyPart] !== undefined) {
      newHealth[bodyPart] = Math.max(0, newHealth[bodyPart] - remainingDamage);
    }
  }

  return { newHealth, newArmor };
}
