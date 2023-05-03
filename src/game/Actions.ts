import { Player } from "./Player";
import { Main } from "./Main";
import { Action, ItemInfo, HexType, ItemType } from "./Hex";
import { startCombatWithNeighbours } from "../utils/combat";
import { Weapons } from "./Combat";

export class Actions {
  constructor(private main: Main) {}

  // public performAction(action: Action, player: Player): void {
  //   const currentPosition = player.hex.toString();
  //   // const currentItem = this.main.items.get(currentPosition);
  //   const currentItem = this.main.items.get(player.hex.toString());

  //   switch (action) {
  //     case "SWAP_WEAPON":
  //     case "TAKE_HEALTH":
  //     case "TAKE_ARMOUR":
  //       if (player.actionsTaken + 1 > player.actionsPerTurn) {
  //         console.log("Not enough actions left");
  //         return;
  //       }

  //     case "OPEN_CHEST":
  //       if (player.actionsTaken + 2 > player.actionsPerTurn) {
  //         console.log("Not enough actions left");
  //         return;
  //       }
  //   }

  //   switch (action) {
  //     case "SWAP_WEAPON":
  //       if (
  //         currentItem &&
  //         ["CLEAVER", "SWORD", "SCISSORS", "ROCK"].includes(currentItem.type)
  //       ) {
  //         if (player.currentWeapon !== "HANDS") {
  //           // Add the player's existing weapon to the items map
  //           this.main.items.set(player.hex.toString(), {
  //             type: player.currentWeapon,
  //           });
  //         } else {
  //           // Remove the item from the items map
  //           this.main.items.delete(player.hex.toString());
  //         }

  //         // Swap the weapon
  //         player.currentWeapon = currentItem.type as Weapons;
  //       }
  //       break;
  //     case "OPEN_CHEST":
  //       if (currentItem && currentItem.type === "CHEST") {
  //         // Add chest opening logic here
  //         this.main.items.delete(currentPosition);
  //       }
  //       break;
  //     case "TAKE_HEALTH":
  //       if (currentItem && currentItem.type === "HEALTH") {
  //         player.health += currentItem.amount || 0;
  //         this.main.items.delete(currentPosition);
  //       }
  //       break;
  //     case "TAKE_ARMOUR":
  //       if (currentItem && currentItem.type === "ARMOUR") {
  //         player.armour += currentItem.amount || 0;
  //         this.main.items.delete(currentPosition);
  //       }
  //       break;
  //     case "ATTACK":
  //       this.main.currentCombat = startCombatWithNeighbours(
  //         player,
  //         this.main.aiPlayers
  //       );
  //       this.main.emitCurrentState();
  //       break;
  //     case "END_TURN":
  //       player.actionsTaken = 0;
  //       break;
  //     default:
  //       console.error(`Unknown action: ${action}`);
  //   }
  // }
}
