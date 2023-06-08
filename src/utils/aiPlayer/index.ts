import { AIPlayer } from "../../game/AIPlayer";
import { Weapons, weaponStats } from "../../game/Combat";
import {
  Hex,
  hexDirections,
  HexType,
  ItemInfo,
  ItemType,
  movementCosts,
} from "../../game/Hex";
import { HexGrid } from "../../game/HexGrid";
import { Player } from "../../game/Player";
import { performAction } from "../actions";
import { calculateVisibleHexes } from "../hex";
import { iterateGrid } from "../hex/drawing";
import { HexMap } from "../types";

interface GetPlayerInViewDistanceArgs {
  player: AIPlayer;
  players: Player[];
  viewDistance: number;
  hexTypes: HexMap;
  hexGrid: HexGrid;
}

export function getPlayerInViewDistance(
  args: GetPlayerInViewDistanceArgs
): Player | null {
  const { player, players, viewDistance, hexTypes, hexGrid } = args;
  let closestPlayer: Player | null = null;
  let minDistance = Infinity;

  // Calculate visible hexes for the given player
  const visibleHexes = player.visibleHexes;

  for (const otherPlayer of players) {
    const distance = player.hex.distance(otherPlayer.hex);
    // Check if the other player's hex is within the set of visible hexes
    if (
      distance <= viewDistance &&
      distance < minDistance &&
      otherPlayer.id !== player.id &&
      visibleHexes.has(otherPlayer.hex.toString()) &&
      !player.friends.includes(otherPlayer.id)
    ) {
      minDistance = distance;
      closestPlayer = otherPlayer;
    }
  }

  return closestPlayer;
}
export type GetItemsInViewDistanceArgs = {
  player: AIPlayer;
  items: Map<string, ItemInfo>;
  viewDistance: number;
  hexGrid: HexGrid;
};

export function getItemsInViewDistance(
  args: GetItemsInViewDistanceArgs
): { hex: Hex; itemInfo: ItemInfo }[] {
  const { player, items, viewDistance, hexGrid } = args;

  // Calculate visible hexes for the given player
  const visibleHexes = player.visibleHexes;

  const itemsInViewDistance: { hex: Hex; itemInfo: ItemInfo }[] = [];

  items.forEach((itemInfo, itemHexKey) => {
    const itemHex = Hex.hexFromString(itemHexKey);
    const distance = player.hex.distance(itemHex);

    // Check if the item's hex is within the set of visible hexes
    if (distance <= viewDistance && visibleHexes.has(itemHexKey)) {
      itemsInViewDistance.push({ hex: itemHex, itemInfo });
    }
  });

  return itemsInViewDistance;
}

function isWeaponBetter(currentWeapon: Weapons, newWeapon: Weapons): boolean {
  return weaponStats[newWeapon].damage > weaponStats[currentWeapon].damage;
}

export function getTargetItem(
  itemsInViewDistance: { hex: Hex; itemInfo: ItemInfo }[],
  player: AIPlayer
): { hex: Hex; itemInfo: ItemInfo } | null {
  // Filter items based on player's health and priority
  const prioritizedItems = itemsInViewDistance.filter(({ itemInfo }) => {
    if (
      player.health < player.maxHealth / 2 &&
      itemInfo.type === "HEALTH" &&
      player.health !== player.maxHealth
    ) {
      return true;
    }
    if (itemInfo.type === "CHEST" || itemInfo.type === "ARMOUR") {
      return true;
    }
    if (
      itemInfo.isWeapon &&
      isWeaponBetter(player.currentWeapon, itemInfo.type as Weapons)
    ) {
      return true;
    }
    return false;
  });

  if (prioritizedItems.length === 0) {
    return null;
  }

  // Sort items based on their priority and distance to the player
  prioritizedItems.sort((a, b) => {
    const priorityA = getItemPriority(a.itemInfo.type);
    const priorityB = getItemPriority(b.itemInfo.type);
    const distanceA = player.hex.distance(a.hex);
    const distanceB = player.hex.distance(b.hex);

    if (priorityA === priorityB) {
      return distanceA - distanceB;
    }
    return priorityA - priorityB;
  });

  // Return the highest priority item within the view distance
  return prioritizedItems[0];
}

function getItemPriority(itemType: ItemType): number {
  switch (itemType) {
    case "HEALTH":
      return 1;
    case "CHEST":
      return 2;
    case "ARMOUR":
      return 3;
    case "HAMMER_1":
    case "HAMMER_2":
    case "SWORD":
    case "TAZER":
      return 4;
    default:
      return 5;
  }
}

interface DetermineTargetPositionArgs {
  player: AIPlayer;
  aiPlayers: Player[];
  viewDistance: number;

  items: Map<string, ItemInfo>;
  deathMap: Map<string, boolean>;
  gridSize: number;
  hexTypes: HexMap;
  hexGrid: HexGrid;
}
export function determineTargetPosition(
  args: DetermineTargetPositionArgs
): Hex {
  const {
    player,
    aiPlayers,
    items,
    viewDistance,
    hexTypes,
    hexGrid,
    gridSize,
    deathMap,
  } = args;

  let targetPosition = player.targetHex;

  const targetHexType = hexTypes.get(targetPosition.toString());
  const isTargetReached = player.hex.equals(targetPosition);
  const isTargetUnreachable =
    (targetHexType && movementCosts[targetHexType.type] > 4) ||
    !targetHexType ||
    deathMap.get(targetPosition.toString());

  let visiblePlayer = getPlayerInViewDistance({
    player,
    players: aiPlayers,
    viewDistance,
    hexTypes,
    hexGrid,
  });
  if (visiblePlayer && deathMap.get(visiblePlayer.hex.toString()))
    visiblePlayer = null;

  let itemsInViewDistance = getItemsInViewDistance({
    player,
    items,
    viewDistance,
    hexGrid,
  });
  itemsInViewDistance = itemsInViewDistance.filter(
    (item) => !deathMap.get(item.hex.toString())
  );

  const targetItem = getTargetItem(itemsInViewDistance, player);

  if (isTargetReached || isTargetUnreachable || visiblePlayer || targetItem) {
    if (targetItem) {
      targetPosition = targetItem.hex;
    } else if (visiblePlayer) {
      const shouldFollow = shouldPlayerFollow({
        player,
        visiblePlayer,
      });

      if (shouldFollow) {
        player.lastSeenPlayer = visiblePlayer.hex;
        targetPosition = visiblePlayer.hex;
      } else {
        targetPosition = getRandomWalkableHexInViewDistance({
          startPosition: player.hex,
          viewDistance: viewDistance,
          avoidHex: visiblePlayer.hex,
          hexTypes: hexTypes,
          deathMap,
        });
      }
    } else if (player.lastSeenPlayer) {
      if (
        player.hex.equals(player.lastSeenPlayer) ||
        deathMap.get(player.lastSeenPlayer.toString())
      ) {
        player.lastSeenPlayer = undefined;
      } else {
        targetPosition = player.lastSeenPlayer;
      }
    } else {
      targetPosition = getRandomWalkableHexInViewDistance({
        startPosition: player.hex,
        viewDistance: viewDistance,
        hexTypes: hexTypes,
        deathMap,
      });
      // targetPosition = getRandomWalkableHexTowardsLeastExploredArea({
      //   player: player,
      //   startPosition: player.hex,
      //   hexTypes: hexTypes,
      //   gridSize: gridSize,
      //   hexGrid: hexGrid,
      //   deathMap
      // });
    }
  }

  return targetPosition;
}

export function shouldFormAllianceWithPlayer(args: {
  player: Player;
  visiblePlayer: Player;
}): boolean {
  const { player, visiblePlayer } = args;

  if (player.traits.attack < 0.4 && visiblePlayer.traits.attack < 0.4) {
    if (!player.friends.includes(visiblePlayer.id))
      player.friends.push(visiblePlayer.id);
    if (!visiblePlayer.friends.includes(player.id))
      visiblePlayer.friends.push(player.id);

    console.log(`${player.id} Formed alliance with ${visiblePlayer.id}`);

    return true;
  }
  return false;
}

function shouldPlayerFollow(args: {
  player: AIPlayer;
  visiblePlayer: Player;
}): boolean {
  const { player, visiblePlayer } = args;

  const playerAttack = player.traits.attack;
  const playerHealth = player.health;
  const playerWeapon = player.currentWeapon;

  const visiblePlayerHealth = visiblePlayer.health;
  const visiblePlayerWeapon = visiblePlayer.currentWeapon;

  const playerWeaponDamage = weaponStats[playerWeapon].damage;
  const visiblePlayerWeaponDamage = weaponStats[visiblePlayerWeapon].damage;

  const playerTotalPower = playerAttack * playerWeaponDamage * playerHealth;
  const visiblePlayerTotalPower =
    visiblePlayer.traits.attack *
    visiblePlayerWeaponDamage *
    visiblePlayerHealth;

  // Don't follow if the player has less than 30% health
  if (playerHealth / player.maxHealth < 0.3) {
    return false;
  }

  // Don't follow if the other player's weapon can kill the player in (3 * (1 - traits.attack)) hits
  if (playerHealth <= visiblePlayerWeaponDamage * (3 * (1 - playerAttack))) {
    return false;
  }

  // Follow if the player's weapon can kill the other player in (3 * traits.attack) hits
  if (visiblePlayerHealth <= playerWeaponDamage * (3 * playerAttack)) {
    return true;
  }

  // Follow if the player's total power is greater than or equal to the visible player's total power
  return playerTotalPower >= visiblePlayerTotalPower;
}

export function takeActionIfAvailable(
  player: Player,
  items: Map<string, ItemInfo>
): void {
  const availableActions = player.getAvailableActions(items, []);
  const nonEndTurnActions = availableActions.filter(
    (action) => action !== "END_TURN" && action !== "ATTACK"
  );

  if (nonEndTurnActions.length > 0) {
    const chosenAction = nonEndTurnActions[0];
    performAction(chosenAction, player, items, []);
  }
}

interface GetRandomWalkableHexInViewDistanceArgs {
  startPosition: Hex;
  avoidHex?: Hex;
  viewDistance: number;
  hexTypes: HexMap;

  deathMap: Map<string, boolean>;
}

export function getRandomWalkableHexInViewDistance(
  args: GetRandomWalkableHexInViewDistanceArgs
): Hex {
  const { startPosition, viewDistance, hexTypes, avoidHex, deathMap } = args;
  let targetPosition: Hex = startPosition;
  let isValidTarget: boolean;
  let attempts = 0;

  const avoidDirection = avoidHex
    ? avoidHex.subtract(startPosition).normalize()
    : null;

  do {
    const randomDirectionIndex = Math.floor(
      Math.random() * hexDirections.length
    );
    const randomDirection = hexDirections[randomDirectionIndex];
    const randomDistance = Math.floor(Math.random() * viewDistance) + 1;

    targetPosition = new Hex(
      startPosition.q + randomDirection[0] * randomDistance,
      startPosition.r + randomDirection[1] * randomDistance
    );

    const candidateType = hexTypes.get(targetPosition.toString());
    isValidTarget = !!candidateType && movementCosts[candidateType.type] < 4;

    if (isValidTarget && avoidDirection) {
      const candidateDirection = targetPosition
        .subtract(startPosition)
        .normalize();
      const directionDotProduct = avoidDirection.dot(candidateDirection);
      isValidTarget = directionDotProduct <= 0;
    }

    isValidTarget = isValidTarget
      ? !deathMap.get(targetPosition.toString())
      : false;

    attempts++;
    if (attempts >= 100) {
      console.warn("Could not find a valid target hex within view distance.");
      return startPosition;
    }
  } while (!isValidTarget);

  return targetPosition;
}

interface GetRandomWalkableHexTowardsLeastExploredAreaArgs {
  player: AIPlayer;
  startPosition: Hex;
  hexTypes: HexMap;
  gridSize: number;
  hexGrid: HexGrid;
  deathMap: Map<string, boolean>;
}

export function getRandomWalkableHexTowardsLeastExploredArea(
  args: GetRandomWalkableHexTowardsLeastExploredAreaArgs
): Hex {
  const { player, startPosition, hexTypes, gridSize, deathMap } = args;
  let leastExploredAreaDirection: Hex | null = null;
  let maxUnexploredCount = 0;
  const explorationRadius = 5;
  const maxSearchDistance = 20;

  for (const hex of iterateGrid(gridSize)) {
    let unexploredCount = 0;
    for (const neighbor of hex.neighborsWithinRadius(explorationRadius)) {
      if (!player.visibilityMap.get(neighbor.toString())) {
        unexploredCount++;
      }
    }

    if (unexploredCount > maxUnexploredCount) {
      maxUnexploredCount = unexploredCount;
      leastExploredAreaDirection = hex;
    }
  }

  if (leastExploredAreaDirection) {
    const direction = leastExploredAreaDirection
      .subtract(startPosition)
      .normalize();

    let targetPosition = startPosition;
    for (let i = 1; i <= maxSearchDistance; i++) {
      const candidateHex = startPosition.add(direction.scale(i)).round();
      const candidateType = hexTypes.get(candidateHex.toString());
      let isValidTarget =
        !!candidateType && movementCosts[candidateType.type] < 4;
      if (deathMap.get(candidateHex.toString())) isValidTarget = false;

      if (isValidTarget && !player.visibilityMap.get(candidateHex.toString())) {
        targetPosition = candidateHex;
        break;
      }
    }

    if (targetPosition.equals(player.hex)) {
      return getRandomWalkableHexInViewDistance({
        startPosition,
        viewDistance: 5,
        hexTypes,
        deathMap,
      });
    }

    return targetPosition;
  } else {
    // If no unexplored area is found, fallback to the original method
    return getRandomWalkableHexInViewDistance({
      startPosition,
      viewDistance: 5,
      hexTypes,
      deathMap,
    });
  }
}
