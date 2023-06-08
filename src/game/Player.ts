import { actionCosts } from "../utils/actions";
import { shouldFormAllianceWithPlayer } from "../utils/aiPlayer";
import { HexMap } from "../utils/types";
import { getRandomColor } from "../utils/utils";
import { Weapons, weaponStats, weapons } from "./Combat";
import { Action, Hex, HexType, ItemInfo, movementCosts } from "./Hex";

type Traits = {
  attack: number;
};

export class Player {
  public hex: Hex;
  public reachableHexes: Hex[] = [];
  id: number;
  alive: boolean = false;
  public color: string;
  public actionsPerTurn: number = 2;
  public actionsTaken: number = 0;
  public maxHealth: number = 100;
  public health: number = 100;
  public armour: number = 0;
  public currentWeapon: Weapons = "FIST";
  public availableActions: Action[] = [];
  public name: string = "Player";
  public sprite: string = "PLAYER";
  public visibilityMap: Map<string, boolean>;
  public visibleHexes: Set<string> = new Set();
  public friends: number[] = [];

  public isAiPlayer: boolean = false;
  public traits: Traits = {
    attack: Math.random(),
  };

  constructor(startingHex: Hex) {
    this.hex = startingHex;
    this.id = Math.round(Math.random() * 10000);
    this.name = "Player " + this.id;
    this.visibilityMap = new Map<string, boolean>();
    this.color = getRandomColor();
  }

  public reset = (): void => {
    this.actionsTaken = 0;
    this.alive = true;
    this.health = this.maxHealth;
    this.armour = 0;
    this.currentWeapon = "FIST";
  };

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
    const availableActions: Action[] = [];
    const currentPosition = this.hex.toString();

    const currentItem = items.get(currentPosition);
    if (currentItem) {
      if (weapons.includes(currentItem.type as Weapons)) {
        let shouldAllowSwap = true;
        if (this.isAiPlayer) {
          const currentWeaponDamage = weaponStats[this.currentWeapon].damage;
          const newWeaponDamage =
            weaponStats[currentItem.type as Weapons].damage;
          if (newWeaponDamage <= currentWeaponDamage) {
            shouldAllowSwap = false;
          }
        }
        if (shouldAllowSwap) availableActions.push("SWAP_WEAPON");
      } else if (currentItem.type === "CHEST") {
        availableActions.push("OPEN_CHEST");
      } else if (currentItem.type === "HEALTH") {
        availableActions.push("TAKE_HEALTH");
      } else if (currentItem.type === "ARMOUR") {
        availableActions.push("TAKE_ARMOUR");
      }
    }

    const neighboringPlayers = players.filter((player) =>
      player.hex.neighbors().some((neighbor) => neighbor.equals(this.hex))
    );

    if (neighboringPlayers.length > 0) {
      if (this.isAiPlayer) {
        for (const player of neighboringPlayers) {
          if (
            shouldFormAllianceWithPlayer({
              player: this,
              visiblePlayer: player,
            })
          ) {
          } else {
            availableActions.push("ATTACK");
          }
        }
      } else {
        availableActions.push("ATTACK");
      }
    }

    // const isPlayerInNeighboringHex = players.some((player) =>
    //   player.hex.neighbors().some((neighbor) => neighbor.equals(this.hex))
    // );
    // if (isPlayerInNeighboringHex) {
    //   availableActions.push("ATTACK");
    // }

    availableActions.push("END_TURN");

    // Filter out actions the player cannot perform due to insufficient remaining actions
    const allowedActions = availableActions.filter(
      (action) => this.actionsTaken + actionCosts[action] <= this.actionsPerTurn
    );

    return allowedActions;
  }

  private getReachableHexes(
    hex: Hex,
    remainingActions: number,
    hexTypes: HexMap,
    deathZoneMap: Map<string, boolean>,
    visited: Set<string> = new Set<string>()
  ): Hex[] {
    if (visited.has(hex.toString())) return [];
    visited.add(hex.toString());

    const neighbors = hex.neighbors();

    const reachableHexes = neighbors.filter((neighbor) => {
      // if (deathZoneMap.get(neighbor.toString())) return false;
      const neighborType = hexTypes.get(neighbor.toString());
      if (!neighborType) return false;
      const movementCost = movementCosts[neighborType.type];
      return remainingActions - movementCost >= 0;
    });

    const nextReachableHexes = reachableHexes.flatMap((reachableHex) => {
      const neighborType = hexTypes.get(reachableHex.toString());
      if (!neighborType) return [];
      const movementCost = movementCosts[neighborType.type];
      const newVisited = new Set(visited);
      newVisited.add(hex.toString());
      return this.getReachableHexes(
        reachableHex,
        remainingActions - movementCost,
        hexTypes,
        deathZoneMap,
        newVisited
      );
    });

    return [...reachableHexes, ...nextReachableHexes];
  }

  public setReachableHexes(
    hexTypes: HexMap,
    deathZoneMap: Map<string, boolean>
  ): void {
    const remainingActions = this.actionsPerTurn - this.actionsTaken;
    this.reachableHexes = this.getReachableHexes(
      this.hex,
      remainingActions,
      hexTypes,
      deathZoneMap
    );
  }

  public moveTo(path: Hex[], movementCost: number): void {
    if (this.actionsTaken + movementCost > this.actionsPerTurn) {
      return;
    }
    this.actionsTaken += movementCost;
    this.hex = path[path.length - 1];
  }
}
