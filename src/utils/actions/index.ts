import { AIPlayer } from "../../game/AIPlayer";
import { Combat, Weapons } from "../../game/Combat";
import { Action, ItemInfo } from "../../game/Hex";
import { Player } from "../../game/Player";
import { startCombatWithNeighbours } from "../combat";
// Create an actionCost map
export const actionCosts: Record<Action, number> = {
  SWAP_WEAPON: 1,
  OPEN_CHEST: 2,
  TAKE_HEALTH: 1,
  TAKE_ARMOUR: 1,
  ATTACK: 1,
  END_TURN: 0,
};

export function performAction(
  action: Action,
  player: Player,
  items: Map<string, ItemInfo>,
  aiPlayers: AIPlayer[]
): {
  combat?: Combat;
} | void {
  const currentPosition = player.hex.toString();
  const currentItem = items.get(player.hex.toString());

  // Check if the player has enough actions left for the chosen action
  if (player.actionsTaken + actionCosts[action] > player.actionsPerTurn) {
    return;
  }

  switch (action) {
    case "SWAP_WEAPON":
      if (
        currentItem &&
        ["CLEAVER", "SWORD", "SCISSORS", "ROCK"].includes(currentItem.type)
      ) {
        if (player.currentWeapon !== "HANDS") {
          items.set(player.hex.toString(), {
            type: player.currentWeapon,
          });
        } else {
          items.delete(player.hex.toString());
        }
        player.currentWeapon = currentItem.type as Weapons;
      }
      break;
    case "OPEN_CHEST":
      if (currentItem && currentItem.type === "CHEST") {
        items.delete(currentPosition);
      }
      break;
    case "TAKE_HEALTH":
      if (currentItem && currentItem.type === "HEALTH") {
        player.health += currentItem.amount || 0;
        if (player.health > player.maxHealth) {
          player.health = player.maxHealth;
        }
        items.delete(currentPosition);
      }
      break;
    case "TAKE_ARMOUR":
      if (currentItem && currentItem.type === "ARMOUR") {
        player.armour += currentItem.amount || 0;
        items.delete(currentPosition);
      }
      break;
    case "ATTACK":
      const currentCombat = startCombatWithNeighbours(player, aiPlayers);

      return {
        combat: currentCombat,
      };
    case "END_TURN":
      player.actionsTaken = 0;
      break;
    default:
      console.error(`Unknown action: ${action}`);
  }

  // Apply the action cost to the player's actions taken
  player.actionsTaken += actionCosts[action];
}
