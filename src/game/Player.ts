import { Action, Hex, HexType, ItemInfo, movementCosts, Weapons } from "./Hex";

export class Player {
  public hex: Hex;
  public reachableHexes: Hex[] = [];
  id: Number;
  alive: boolean = false;
  public actionsPerTurn: number = 4;
  public actionsTaken: number = 0;
  public health: number = 100;
  public armour: number = 0;
  public currentWeapon: Weapons = "HANDS";
  public availableActions: Action[] = [];

  constructor(startingHex: Hex) {
    this.hex = startingHex;
    this.id = Math.round(Math.random() * 10000);
  }

  public updateAvailableActions(
    items: Map<string, ItemInfo>,
    players: Player[]
  ): void {
    this.availableActions = this.getAvailableActions(items, players);
  }

  getAvailableActions(
    items: Map<string, ItemInfo>,
    players: Player[]
  ): Action[] {
    const availableActions: Action[] = ["END_TURN"];
    const currentPosition = this.hex.toString();

    const currentItem = items.get(currentPosition);
    if (currentItem) {
      if (["CLEAVER", "SWORD", "SCISSORS", "ROCK"].includes(currentItem.type)) {
        availableActions.push("SWAP_WEAPON");
      } else if (currentItem.type === "CHEST") {
        availableActions.push("OPEN_CHEST");
      } else if (currentItem.type === "HEALTH") {
        availableActions.push("TAKE_HEALTH");
      } else if (currentItem.type === "ARMOUR") {
        availableActions.push("TAKE_ARMOUR");
      }
    }

    const isPlayerInNeighboringHex = players.some((player) =>
      player.hex.neighbors().some((neighbor) => neighbor.isAdjacent(this.hex))
    );
    if (isPlayerInNeighboringHex) {
      availableActions.push("ATTACK");
    }

    return availableActions;
  }

  private getReachableHexes(
    hex: Hex,
    remainingActions: number,
    hexTypes: Map<string, HexType>,
    visited: Set<string> = new Set<string>()
  ): Hex[] {
    if (visited.has(hex.toString())) return [];
    visited.add(hex.toString());

    const neighbors = hex.neighbors();

    const reachableHexes = neighbors.filter((neighbor) => {
      const neighborType = hexTypes.get(neighbor.toString());
      if (!neighborType) return false;
      const movementCost = movementCosts[neighborType];
      return remainingActions - movementCost >= 0;
    });

    const nextReachableHexes = reachableHexes.flatMap((reachableHex) => {
      const neighborType = hexTypes.get(reachableHex.toString());
      if (!neighborType) return [];
      const movementCost = movementCosts[neighborType];
      const newVisited = new Set(visited);
      newVisited.add(hex.toString());
      return this.getReachableHexes(
        reachableHex,
        remainingActions - movementCost,
        hexTypes,
        newVisited
      );
    });

    return [...reachableHexes, ...nextReachableHexes];
  }

  public setReachableHexes(hexTypes: Map<string, HexType>): void {
    const remainingActions = this.actionsPerTurn - this.actionsTaken;
    this.reachableHexes = this.getReachableHexes(
      this.hex,
      remainingActions,
      hexTypes
    );
  }

  moveTo(hex: Hex, type: HexType): void {
    console.log("Moving to hex", type);
    const movementCost = movementCosts[type];

    if (this.actionsTaken + movementCost > this.actionsPerTurn) {
      console.log("Not enough actions left");
      return;
    }
    this.actionsTaken += movementCost;

    this.hex = hex;
  }
}
