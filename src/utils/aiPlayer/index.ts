import { AIPlayer } from "../../game/AIPlayer";
import { Hex, hexDirections, movementCosts } from "../../game/Hex";
import { HexGrid } from "../../game/HexGrid";
import { Player } from "../../game/Player";
import { calculateVisibleHexes } from "../hex";
import { HexMap } from "../types";

interface GetPlayerHexInViewDistanceArgs {
  player: AIPlayer;
  players: Player[];
  viewDistance: number;
  hexTypes: HexMap;
  hexGrid: HexGrid;
}

export function getPlayerHexInViewDistance(args: GetPlayerHexInViewDistanceArgs): Hex | null {
  const { player, players, viewDistance, hexTypes, hexGrid } = args;
  let closestPlayerHex: Hex | null = null;
  let minDistance = Infinity;

  // Calculate visible hexes for the given player
  const visibleHexes = calculateVisibleHexes(
    player.hex,
    viewDistance,
    hexTypes
  );

  for (const otherPlayer of players) {
    const distance = player.hex.distance(otherPlayer.hex);
    // Check if the other player's hex is within the set of visible hexes
    if (
      distance <= viewDistance &&
      distance < minDistance &&
      otherPlayer.id !== player.id &&
      visibleHexes.has(otherPlayer.hex.toString())
    ) {
      minDistance = distance;
      closestPlayerHex = otherPlayer.hex;
    }
  }

  return closestPlayerHex;
}


interface DetermineTargetPositionArgs {
  player: AIPlayer;
  aiPlayers: Player[];
  viewDistance: number;
  gridSize: number;
  hexTypes: HexMap;
  hexGrid: HexGrid;
}

export function determineTargetPosition(args: DetermineTargetPositionArgs): Hex {
  const {
    player,
    aiPlayers,
    viewDistance,
    hexTypes,
    hexGrid,
    gridSize
  } = args;

  let targetPosition = player.targetHex;

  const targetHexType = hexTypes.get(targetPosition.toString());
  const isTargetReached = player.hex.equals(targetPosition);
  const isTargetUnreachable = !targetHexType;

  const visiblePlayerHex = getPlayerHexInViewDistance({
    player,
    players: aiPlayers,
    viewDistance,
    hexTypes,
    hexGrid,
  });

  if (isTargetReached || isTargetUnreachable || visiblePlayerHex) {
    if (visiblePlayerHex) {
      player.lastSeenPlayer = visiblePlayerHex;
      targetPosition = visiblePlayerHex;
    } else if (player.lastSeenPlayer) {
      if (player.hex.equals(player.lastSeenPlayer)) {
        player.lastSeenPlayer = undefined;
      } else {
        targetPosition = player.lastSeenPlayer;
      }
    } else {
      targetPosition = getRandomWalkableHexTowardsLeastExploredArea({
        player: player,
        startPosition: player.hex,
        hexTypes: hexTypes,
        gridSize: gridSize,
        hexGrid: hexGrid,
      });
    }
  }

  return targetPosition;
}


interface GetRandomWalkableHexInViewDistanceArgs {
  startPosition: Hex;
  viewDistance: number;
  hexTypes: HexMap;
}

export function getRandomWalkableHexInViewDistance(
  args: GetRandomWalkableHexInViewDistanceArgs
): Hex {
  const { startPosition, viewDistance, hexTypes } = args;
  let targetPosition: Hex = startPosition;
  let isValidTarget: boolean;
  let attempts = 0;

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
    isValidTarget = !!candidateType && movementCosts[candidateType] < 4;

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
}

export function getRandomWalkableHexTowardsLeastExploredArea(
  args: GetRandomWalkableHexTowardsLeastExploredAreaArgs
): Hex {
  const { player, startPosition, hexTypes, gridSize, hexGrid } = args;
  let leastExploredAreaDirection: Hex | null = null;
  let maxUnexploredCount = 0;
  const explorationRadius = 10;
  const maxSearchDistance = 20;

  for (const hex of hexGrid.iterateGrid(gridSize)) {
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
      const isValidTarget =
        !!candidateType && movementCosts[candidateType] < 4;

      if (
        isValidTarget &&
        !player.visibilityMap.get(candidateHex.toString())
      ) {
        targetPosition = candidateHex;
        break;
      }
    }

    if (targetPosition.equals(player.hex)) {
      return getRandomWalkableHexInViewDistance({
        startPosition,
        viewDistance: 10,
        hexTypes,
      });
    }

    return targetPosition;
  } else {
    // If no unexplored area is found, fallback to the original method
    return getRandomWalkableHexInViewDistance({
      startPosition,
      viewDistance: 10,
      hexTypes,
    });
  }
}




