// import VectorNoiseGenerator from "atlas-vector-noise";
import { Hex, HexType, hexDirections } from "../../game/Hex";
import { axialToCube, hexToMatrix, matrixToHex } from "../hex";

type Thresholds = Record<number, HexType>;

interface GetHexTypeFromNoiseArgs {
  noiseValue: number;
  thresholds: Thresholds;
}

// export function getHexTypeFromNoise(args: GetHexTypeFromNoiseArgs): HexType {
//   const { noiseValue, thresholds } = args;

//   const sortedThresholds = Object.keys(thresholds)
//     .map(parseFloat)
//     .sort((a, b) => a - b);

//   for (let i = 0; i < sortedThresholds.length; i++) {
//     const threshold = sortedThresholds[i];
//     if (noiseValue < threshold) {
//       return thresholds[threshold];
//     }
//   }

//   return thresholds[sortedThresholds[sortedThresholds.length - 1]];
// }

interface GenerateHexTypesOldArgs {
  gridSize: number;
  thresholds: GetHexTypeFromNoiseArgs["thresholds"];
}

// export function generateHexTypesOld(
//   args: GenerateHexTypesOldArgs
// ): Map<string, HexType> {
//   const { gridSize, thresholds } = args;
//   const smallSquareGrid = new VectorNoiseGenerator(10);
//   const scaleFactor = 5;

//   const hexTypes = new Map<string, HexType>();

//   for (let q = -gridSize; q <= gridSize; q++) {
//     for (
//       let r = Math.max(-gridSize, -q - gridSize);
//       r <= Math.min(gridSize, -q + gridSize);
//       r++
//     ) {
//       const hex = new Hex(q, r);
//       const cube = axialToCube({ hex });
//       const x = Math.round(cube.x + gridSize);
//       const y = Math.round(cube.y + gridSize);
//       const noiseValue = smallSquareGrid.getPixel(
//         x / scaleFactor,
//         y / scaleFactor
//       );
//       const hexType = getHexTypeFromNoise({ noiseValue, thresholds });
//       const hexKey = hex.toString();
//       hexTypes.set(hexKey, hexType);
//     }
//   }

//   return hexTypes;
// }

import * as PF from "pathfinding";
import { getRandomWalkableHex } from "../routing";

interface AddRoadArgs {
  hexTypes: Map<string, HexType>;
  hexStart: Hex;
  hexEnd: Hex;
  gridSize: number;
}

export function addRoad(args: AddRoadArgs): Map<string, HexType> {
  const { hexTypes, hexStart, hexEnd, gridSize } = args;
  const matrixSize = 2 * gridSize + 1;

  const grid = new PF.Grid(matrixSize, matrixSize);

  hexTypes.forEach((hexType, hexKey) => {
    const hex = Hex.hexFromString(hexKey);
    const [x, y] = hexToMatrix({ hex, gridSize });
    if (
      hexType === "SEA" ||
      hexType === "SAND" ||
      hexType === "DEEP_WOODS" ||
      hexType === "ROAD"
    )
      grid.setWalkableAt(x, y, false);
  });

  const finder = new PF.AStarFinder();
  const [startX, startY] = hexToMatrix({ hex: hexStart, gridSize });
  const [endX, endY] = hexToMatrix({ hex: hexEnd, gridSize });
  const path = finder.findPath(startX, startY, endX, endY, grid);

  path.forEach(([x, y]) => {
    const hex = matrixToHex({ x, y, gridSize });
    hexTypes.set(hex.toString(), "ROAD");
  });

  return hexTypes;
}

interface AddRandomRoadArgs {
  hexTypes: Map<string, HexType>;
  gridSize: number;
}

export function addRandomRoad(args: AddRandomRoadArgs): Map<string, HexType> {
  const { hexTypes, gridSize } = args;

  const hexStart = getRandomWalkableHex(hexTypes, gridSize);
  const hexEnd = getRandomWalkableHex(hexTypes, gridSize);

  const newHexTypes = addRoad({ hexTypes, hexStart, hexEnd, gridSize });

  return newHexTypes;
}

export function generateRandomRoads(
  numRoads: number,
  hexTypes: Map<string, HexType>,
  gridSize: number
): Map<string, HexType> {
  let newHexTypes = hexTypes;
  for (let i = 0; i < numRoads; i++) {
    newHexTypes = addRandomRoad({
      hexTypes: newHexTypes,
      gridSize,
    });
  }

  return newHexTypes;
}

interface GenerateHexTypesArgs {
  gridSize: number;
  hexTypes: HexType[];
}

// export function generateHexTypesSingle(args: GenerateHexTypesArgs): Map<string, HexType> {
//   const { gridSize, hexTypes } = args;

//   const waveFunction = initializeWaveFunctionSingle({
//     gridSize,
//     hexTypes,
//   });

//   const hexTypesMap = new Map<string, HexType>();

//   while (waveFunction.size > 0) {
//     const lowestEntropyCell = findLowestEntropyCellSingle({ waveFunction });

//     if (lowestEntropyCell === null) {
//       break;
//     }

//     const possibleHexTypes = waveFunction.get(lowestEntropyCell);

//     if (possibleHexTypes === undefined || possibleHexTypes.size === 0) {
//       throw new Error('Inconsistent wave function state');
//     }

//     const selectedHexType = chooseRandomHexTypeSingle(Array.from(possibleHexTypes));
//     hexTypesMap.set(lowestEntropyCell, selectedHexType);
//     waveFunction.delete(lowestEntropyCell);

//     updateWaveFunctionSingle({
//       waveFunction,
//       selectedCell: lowestEntropyCell,
//       selectedHexType,
//       patterns,
//     });
//   }

//   return hexTypesMap;
// }

function chooseRandomHexTypeSingle(): HexType {
  const hexTypes = startPatterns.map((pattern) => pattern.center);
  const randomIndex = Math.floor(Math.random() * hexTypes.length);
  return hexTypes[randomIndex];
}

export type Pattern = {
  center: HexType;
  neighbors: HexType[];
  structureId?: string;
};

const startPatterns: Pattern[] = [
  // { center: 'GRASS', neighbors: ['GRASS', 'ROAD', 'WOODS', 'SAND'] },
  // { center: 'ROAD', neighbors: ['ROAD', 'GRASS', "SEA", 'WOODS', "DOOR"] },
  // { center: 'SEA', neighbors: ['SEA', 'SAND'] },
  // { center: 'WOODS', neighbors: ['WOODS', 'GRASS', "ROAD", 'DEEP_WOODS'] },
  // { center: 'SAND', neighbors: ['SAND', 'SEA', 'GRASS'] },
  // { center: 'DEEP_WOODS', neighbors: ['DEEP_WOODS', 'WOODS'] },
  // { center: 'DOOR', neighbors: ['DOOR', 'WALL', 'GRASS', "ROAD"] },
  // { center: 'WALL', neighbors: ['WALL', 'DOOR'] },

  { center: "WOODS", neighbors: ["WOODS", "WALL", "ROAD"] },
  { center: "WALL", neighbors: ["WALL", "ROAD", "WOODS"] },
  { center: "ROAD", neighbors: ["ROAD", "WALL", "WOODS"] },
  // { center: 'WOODS', neighbors: ['WOODS', 'GRASS'] },
  // { center: 'GRASS', neighbors: ['WALL', 'GRASS', "ROAD"] },
];

// Add the structure patterns to the existing patterns array
// const wall1Patterns = createStructurePatterns(wall1, "wall1");
// const wall2Patterns = createStructurePatterns(wall2, "wall2");

// console.log({wall1Patterns, wall2Patterns})

// console.log(JSON.stringify(wall1Patterns, null, 2));

// const connectionPattern: Pattern = {
//   center: "WALL",
//   neighbors: ["WALL"],
//   structureId: "wall1-wall2",
// };

const patterns = [
  ...startPatterns,
  // ...wall1Patterns,
  // ...wall2Patterns,
  // connectionPattern,
];

// const waveFunction = initializeWaveFunction({
//   gridSize: 5,
//   hexTypes: hexTypes,
//   patterns: combinedPatterns,
// });

interface InitializeWaveFunctionArgs {
  gridSize: number;

  hexTypes: HexType[];
}

function initializeWaveFunctionSingle(
  args: InitializeWaveFunctionArgs
): Map<string, Set<HexType>> {
  const { gridSize, hexTypes } = args;

  const waveFunction = new Map<string, Set<HexType>>();

  for (let q = -gridSize; q <= gridSize; q++) {
    for (let r = -gridSize; r <= gridSize; r++) {
      const hex = new Hex(q, r);

      const possibleHexTypes = getCompatibleHexTypesSingle({
        waveFunction,
        position: hex,
        patterns: patterns,
      });

      if (possibleHexTypes.size > 0) {
        waveFunction.set(hex.toString(), possibleHexTypes);
      }
    }
  }

  for (let q = -gridSize; q <= gridSize; q++) {
    for (
      let r = Math.max(-gridSize, -q - gridSize);
      r <= Math.min(gridSize, -q + gridSize);
      r++
    ) {
      const hex = new Hex(q, r);
      const hexKey = hex.toString();
      waveFunction.set(hexKey, new Set(hexTypes));
    }
  }

  return waveFunction;
}

interface GetCompatibleHexTypesArgs {
  waveFunction: Map<string, Set<HexType>>;
  position: Hex;
  patterns: Pattern[];
}

function getCompatibleHexTypesSingle(
  args: GetCompatibleHexTypesArgs
): Set<HexType> {
  const { waveFunction, position, patterns } = args;
  const compatibleHexTypes = new Set<HexType>();

  for (const hexType of waveFunction.get(position.toString()) ||
    new Set<HexType>()) {
    const pattern = patterns.find((p) => p.center === hexType);

    if (pattern) {
      const neighborPositions = position.neighbors();
      const isCompatible = neighborPositions.some((neighborPosition, index) => {
        const neighborHexTypes = waveFunction.get(neighborPosition.toString());
        const expectedNeighborType = pattern.neighbors[index];

        return (
          neighborHexTypes &&
          neighborHexTypes.has(expectedNeighborType) &&
          checkCompatibilitySingle({
            hexA: hexType,
            hexB: expectedNeighborType,
            patterns,
          })
        );
      });

      if (isCompatible) {
        compatibleHexTypes.add(hexType);
      }
    }
  }

  return compatibleHexTypes;
}

interface UpdateWaveFunctionArgs {
  waveFunction: Map<string, Set<HexType>>;
  selectedCell: string;
  selectedHexType: HexType;
  patterns: Pattern[];
}

function updateWaveFunctionSingle(args: UpdateWaveFunctionArgs): void {
  const { waveFunction, selectedCell, selectedHexType, patterns } = args;
  const selectedHex = Hex.hexFromString(selectedCell);
  const neighbors = selectedHex.neighbors();

  for (const neighbor of neighbors) {
    const neighborKey = neighbor.toString();

    if (waveFunction.has(neighborKey)) {
      const possibleNeighborHexTypes = waveFunction.get(neighborKey);
      const remainingPossibleHexTypes = new Set<HexType>();

      if (possibleNeighborHexTypes) {
        for (const possibleNeighborHexType of possibleNeighborHexTypes) {
          if (
            checkCompatibilitySingle({
              hexA: selectedHexType,
              hexB: possibleNeighborHexType,
              patterns,
            })
          ) {
            remainingPossibleHexTypes.add(possibleNeighborHexType);
          }
        }
      }

      waveFunction.set(neighborKey, remainingPossibleHexTypes);
    }
  }
}

interface CheckCompatibilityArgs {
  hexA: HexType;
  hexB: HexType;
  patterns: Pattern[];
}

function checkCompatibilitySingle(args: CheckCompatibilityArgs): boolean {
  const { hexA, hexB, patterns } = args;

  const patternA = patterns.find((pattern) => pattern.center === hexA);
  const patternB = patterns.find((pattern) => pattern.center === hexB);

  if (!patternA || !patternB) {
    return false;
  }

  const compatibleNeighborsA = patternA.neighbors;
  const compatibleNeighborsB = patternB.neighbors;

  return (
    compatibleNeighborsA.includes(hexB) && compatibleNeighborsB.includes(hexA)
  );
}

interface FindLowestEntropyCellArgs {
  waveFunction: Map<string, Set<HexType>>;
}

function findLowestEntropyCellSingle(
  args: FindLowestEntropyCellArgs
): string | null {
  const { waveFunction } = args;

  let minEntropy = Infinity;
  let minEntropyCell: string | null = null;

  waveFunction.forEach((possibleHexTypes, cellKey) => {
    const entropy = possibleHexTypes.size;

    if (entropy < minEntropy) {
      minEntropy = entropy;
      minEntropyCell = cellKey;
    }
  });

  return minEntropyCell;
}
