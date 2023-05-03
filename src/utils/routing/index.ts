import { AIPlayer } from "../../game/AIPlayer";
import { Hex, movementCosts } from "../../game/Hex";
import { Player } from "../../game/Player";
import { PriorityQueue } from "../../game/PriorityQueue";
import { HexMap } from "../types";

export function getRandomWalkableHex(hexTypes: HexMap, gridSize: number): Hex {
  let randomHex: Hex | null = null;

  while (!randomHex) {
    const randomQ = Math.floor(Math.random() * (2 * gridSize + 1)) - gridSize;
    const randomR = Math.floor(Math.random() * (2 * gridSize + 1)) - gridSize;
    const candidateHex = new Hex(randomQ, randomR);
    const candidateType = hexTypes.get(candidateHex.toString());

    if (!!candidateType && movementCosts[candidateType] <= 2) {
      randomHex = candidateHex;
    }
  }

  return randomHex;
}

interface FindCheapestPathArgs {
  start: Hex;
  target: Hex;
  hexTypes: HexMap;
  avoidHexes?: Map<string, boolean>;
}

export function findCheapestPath(
  args: FindCheapestPathArgs
): { path: Hex[]; totalCost: number } {
  const { start, target, hexTypes, avoidHexes } = args;

  const frontier = new PriorityQueue<{ hex: Hex; cost: number }>(
    (a, b) => a.cost < b.cost
  );
  frontier.enqueue({ hex: start, cost: 0 }, 0);

  const cameFrom = new Map<string, Hex>();
  const costSoFar = new Map<string, number>();
  cameFrom.set(start.toString(), start);
  costSoFar.set(start.toString(), 0);

  while (!frontier.isEmpty()) {
    const { hex: current } = frontier.dequeue()!;

    if (current.equals(target)) {
      const path = reconstructPath({ cameFrom, current });
      const totalCost = costSoFar.get(current.toString())!;
      return { path, totalCost };
    }

    for (const neighbor of current.neighbors()) {
      let hexType = hexTypes.get(neighbor.toString());
      if (avoidHexes?.has(neighbor.toString())) hexType = 'WALL';
      if (!hexType) continue;
      const costSoFarNeighbour = costSoFar.get(neighbor.toString()) || 0;
      const newCost =
        costSoFar.get(current.toString())! +
        movementCosts[hexType];
      if (
        !costSoFar.has(neighbor.toString()) ||
        newCost < costSoFarNeighbour
      ) {
        costSoFar.set(neighbor.toString(), newCost);
        cameFrom.set(neighbor.toString(), current);
        frontier.enqueue({ hex: neighbor, cost: newCost }, newCost);
      }
    }
  }

  return { path: [], totalCost: 0 }; // Return an empty path and cost of 0 if no path is found
}

interface ReconstructPathArgs {
  cameFrom: Map<string, Hex>;
  current: Hex;
}

export function reconstructPath(args: ReconstructPathArgs): Hex[] {
  const { cameFrom } = args;
  let current = args.current;
  const path = [current];

  let count = 0;

  // Iterate through the cameFrom map to reconstruct the path
  while (cameFrom.has(current.toString())) {
    count++;
    if (count > 100) {
      console.warn("reconstructPath loops 100 times");
      break;
    }

    current = cameFrom.get(current.toString())!;
    path.unshift(current); // Add the current Hex to the beginning of the path

    // Terminate the loop if the same Hex is encountered twice to prevent infinite looping
    if (cameFrom.get(current.toString())?.equals(current)) {
      break;
    }
  }

  return path;
}

interface MovePlayerAlongPathArgs {
  player: AIPlayer;
  path: Hex[];
  hexTypes: HexMap;
  aiPlayers: AIPlayer[];
  mainPlayer: Player;
}

export function movePlayerAlongPath(
  args: MovePlayerAlongPathArgs,
  maxStepsTaken: number = Infinity
): Hex[] {
  const { player, path, hexTypes, aiPlayers, mainPlayer } = args;

  const isNextHexOccupied = (nextHex: Hex) => {
    return (
      aiPlayers.some(
        (otherPlayer) =>
          otherPlayer !== player && otherPlayer.hex.equals(nextHex)
      ) || mainPlayer.hex.equals(nextHex)
    );
  };

  let stepsTaken = 0;
  let actionsTaken = player.actionsTaken;

  for (const nextHex of path) {
    if (stepsTaken >= maxStepsTaken) {
      break;
    }

    const nextHexType = hexTypes.get(nextHex.toString());
    if (!nextHexType) break;
    const nextHexCost = movementCosts[nextHexType];

    if (
      player.actionsPerTurn - actionsTaken < nextHexCost ||
      isNextHexOccupied(nextHex)
    ) {
      break;
    }

    player.hex = nextHex;
    stepsTaken++;
    actionsTaken = actionsTaken + nextHexCost;
  }

  player.actionsTaken = actionsTaken;
  return path.slice(stepsTaken);
}
