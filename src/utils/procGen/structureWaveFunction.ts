import { Hex, HexType } from "../../game/Hex";
import { StructureDefinition } from "../../game/Structure";
import { iterateGrid } from "../hex/drawing";
import { HexMap } from "../types";
import { importPatterns } from "./patterns";
import { patterns1 } from "./patternsLib";

type StructurePatternName = string;

export type StructurePattern = {
  center: StructureDefinition;
  name: string;
  neighbors: {
    direction: number;
    types: string[];
  }[];
};

export const structurePatterns: Record<
  string,
  StructurePattern
> = importPatterns();
// export const structurePatterns: Record<
//   string,
//   StructurePattern
// > = patterns1 as Record<string, StructurePattern>;

interface ConvertToHexMapArgs {
  structureMap: Map<string, StructurePatternName>;
  patterns: Record<StructurePatternName, StructurePattern>;
  gridSize: number;
}
export function convertToHexMap(args: ConvertToHexMapArgs): HexMap {
  const { structureMap, patterns, gridSize } = args;
  const hexMap: HexMap = new Map();
  const hexMap2: HexMap = new Map();

  structureMap.forEach((structurePatternName, gridKey) => {
    const [i, j] = gridKey.split(",").map(Number);
    const structurePattern = patterns[structurePatternName];
    const structureDefinition = structurePattern.center;

    structureDefinition.elements.forEach((element) => {
      const hex = new Hex(
        element.position.q + 3 * i - j * 2 + Math.floor(j / 2) + 2,
        element.position.r + 3 * j
      );
      const hexType = element.type;
      hexMap.set(hex.toString(), {
        type: hexType,
        rotation: element.rotation,
      });
    });
  });

  for (const hex of iterateGrid(gridSize)) {
    const hexType = hexMap.get(hex.toString());
    if (hexType) {
      hexMap2.set(hex.toString(), hexType);
    }
  }

  return hexMap2;
}

type StructureGrid = Set<StructurePatternName>[][];

function generateStructureGrid(
  gridSize: number,
  structures: StructurePatternName[]
): StructureGrid {
  const structureGridSize = gridSize / 4;
  const structureGrid: StructureGrid = [];

  for (let i = 0; i < structureGridSize + 2; i++) {
    structureGrid[i] = [];
    for (let j = 0; j < structureGridSize + 2; j++) {
      structureGrid[i][j] = new Set(structures);
    }
  }

  return structureGrid;
}

function isValidHexPosition(
  position: [number, number],
  gridSize: number
): boolean {
  const hex = new Hex(position[0], position[1]);
  const q = hex.q;
  const r = hex.r;
  return (
    q >= -gridSize &&
    q <= gridSize &&
    r >= Math.max(-gridSize, -q - gridSize) &&
    r <= Math.min(gridSize, -q + gridSize)
  );
}

interface GenerateStructuresArgs {
  gridSize: number;
  patterns: Record<StructurePatternName, StructurePattern>;
  callback?: (structureMap: Map<string, StructurePatternName>) => void;
}

export function generateStructures(
  args: GenerateStructuresArgs
): Map<string, StructurePatternName> {
  const { gridSize, patterns } = args;

  const hexTypes = Object.keys(patterns);
  const structureGrid = generateStructureGrid(
    gridSize,
    Object.keys(patterns) as StructurePatternName[]
  );

  const waveFunction = initializeWaveFunction({
    grid: structureGrid,
    patterns,
  });

  const structureMap = new Map<string, StructurePatternName>();

  while (waveFunction.size > 0) {
    const lowestEntropyCell = findLowestEntropyCell({ waveFunction });

    if (lowestEntropyCell === null) {
      break;
    }

    const [i, j] = lowestEntropyCell.split(",").map(Number);
    if (!isValidHexPosition([i, j], gridSize)) {
      waveFunction.delete(lowestEntropyCell);
      continue;
    }

    const possibleStructures = waveFunction.get(lowestEntropyCell);

    if (possibleStructures === undefined || possibleStructures.size === 0) {
      throw new Error("Inconsistent wave function state");
    }

    const selectedStructure = chooseRandomStructure({
      possibleStructures: Array.from(possibleStructures),
    });

    structureMap.set(lowestEntropyCell, selectedStructure);
    waveFunction.delete(lowestEntropyCell);

    updateWaveFunction({
      waveFunction,
      selectedCell: lowestEntropyCell,
      selectedStructure,
      patterns,
    });
    if (args.callback) {
      args.callback(structureMap);
    }
  }

  return structureMap;
}

type WaveFunction = Map<string, Set<StructurePatternName>>;

interface InitializeWaveFunctionArgs {
  grid: StructureGrid;
  patterns: Record<StructurePatternName, StructurePattern>;
}

function initializeWaveFunction(
  args: InitializeWaveFunctionArgs
): WaveFunction {
  const { grid, patterns } = args;

  const waveFunction: WaveFunction = new Map();

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; j++) {
      waveFunction.set(`${i},${j}`, new Set(grid[i][j]));
    }
  }

  return waveFunction;
}

//   interface GetCompatibleStructureDefinitionsArgs {
//     waveFunction: WaveFunction;
//     position: Hex;
//     patterns: StructurePattern[];
//   }

//   function getCompatibleStructureDefinitions(
//     args: GetCompatibleStructureDefinitionsArgs
//   ): Set<StructureDefinition> {
//     const { waveFunction, position, patterns } = args;
//     const compatibleStructureDefinitions = new Set<StructureDefinition>();

//     for (const structureDefinition of waveFunction.get(position.toString()) ||
//       new Set<StructureDefinition>()) {
//       const pattern = patterns.find((p) => p.center === structureDefinition);

//       if (pattern) {
//         const neighborPositions = position.neighbors();
//         const isCompatible = neighborPositions.some((neighborPosition, index) => {
//           const neighborStructureDefinitions = waveFunction.get(
//             neighborPosition.toString()
//           );
//           const expectedNeighborTypes = pattern.neighbors[index].types;

//           return (
//             neighborStructureDefinitions &&
//             expectedNeighborTypes.some((expectedNeighborType) =>
//               neighborStructureDefinitions.has(expectedNeighborType) &&
//               checkCompatibility({
//                 structureA: structureDefinition,
//                 structureB: expectedNeighborType,
//                 patterns,
//               })
//             )
//           );
//         });

//         if (isCompatible) {
//           compatibleStructureDefinitions.add(structureDefinition);
//         }
//       }
//     }

//     return compatibleStructureDefinitions;
//   }

interface FindLowestEntropyCellArgs {
  waveFunction: WaveFunction;
}

function findLowestEntropyCell(args: FindLowestEntropyCellArgs): string | null {
  const { waveFunction } = args;

  let minEntropy = Infinity;
  let minEntropyCell: string | null = null;

  waveFunction.forEach((possibleStructureDefinitions, cellKey) => {
    const entropy = possibleStructureDefinitions.size;

    if (entropy < minEntropy) {
      minEntropy = entropy;
      minEntropyCell = cellKey;
    }
  });

  return minEntropyCell;
}

interface ChooseRandomStructureArgs {
  possibleStructures: StructurePatternName[];
}

function chooseRandomStructure(
  args: ChooseRandomStructureArgs
): StructurePatternName {
  const { possibleStructures } = args;
  const randomIndex = Math.floor(Math.random() * possibleStructures.length);
  return possibleStructures[randomIndex];
}

interface UpdateWaveFunctionArgs {
  waveFunction: WaveFunction;
  selectedCell: string;
  selectedStructure: StructurePatternName;
  patterns: Record<StructurePatternName, StructurePattern>;
}
function updateWaveFunction(args: UpdateWaveFunctionArgs): void {
  const { waveFunction, selectedCell, selectedStructure, patterns } = args;
  const [i, j] = selectedCell.split(",").map(Number);
  // console.log(`======== updateWaveFunction for ${selectedCell} - ${selectedStructure} ==========`);
  const adjacentCoordsAndDirections = [
    { coords: [i, j - 1], direction: 0 }, // Up (i, j - 1)
    { coords: [i + 1, j], direction: 1 }, // Right (i + 1, j)
    { coords: [i, j + 1], direction: 2 }, // Down (i, j + 1)
    { coords: [i - 1, j], direction: 3 }, // Left (i - 1, j)
  ];

  for (const {
    coords: [adjacentI, adjacentJ],
    direction,
  } of adjacentCoordsAndDirections) {
    const neighborKey = `${adjacentI},${adjacentJ}`;

    if (waveFunction.has(neighborKey)) {
      const possibleNeighborStructures = waveFunction.get(neighborKey);
      const remainingPossibleStructures = new Set<StructurePatternName>();

      if (possibleNeighborStructures) {
        for (const possibleNeighborStructure of possibleNeighborStructures) {
          if (
            checkCompatibility({
              structureA: selectedStructure,
              structureB: possibleNeighborStructure,
              direction,
              patterns,
            })
          ) {
            remainingPossibleStructures.add(possibleNeighborStructure);
          }
        }
      } else {
        // console.log(`waveFunction does not have neighborKey: ${neighborKey}`);
      }

      //   console.log(`${selectedCell} - ${selectedStructure} - ${direction}`);
      // console.log(`Before updating wave function at (${adjacentI},${adjacentJ}):`, possibleNeighborStructures ? Array.from(possibleNeighborStructures) : 'undefined')
      // console.log(`After updating wave function at (${adjacentI},${adjacentJ}):`, Array.from(remainingPossibleStructures));

      if (remainingPossibleStructures.size > 0) {
        waveFunction.set(neighborKey, remainingPossibleStructures);
      } else {
        waveFunction.set(neighborKey, new Set(["empty"]));
        console.log(
          `Inconsistent wave function state at (${adjacentI},${adjacentJ}) after selecting ${selectedStructure} at (${i},${j}).`
        );
      }
    }
  }
}

interface CheckCompatibilityArgs {
  structureA: StructurePatternName;
  structureB: StructurePatternName;
  patterns: Record<StructurePatternName, StructurePattern>;
  direction: number;
}

function checkCompatibility(args: CheckCompatibilityArgs): boolean {
  const { structureA, structureB, patterns, direction } = args;

  // console.log("Checking compatibility", { structureA, structureB, direction });

  const patternA = patterns[structureA];
  const patternB = patterns[structureB];

  const compatibleNeighborsA = patternA.neighbors;
  const compatibleNeighborsB = patternB.neighbors;

  // Check if structureA has structureB as a compatible neighbor in the given direction
  const isStructureACompatible = compatibleNeighborsA.some(
    (neighbor) =>
      neighbor.direction === direction && neighbor.types.includes(structureB)
  );

  // console.log("Is structure A compatible?", isStructureACompatible);

  // Check if structureB has structureA as a compatible neighbor in the opposite direction
  const isStructureBCompatible = compatibleNeighborsB.some(
    (neighbor) =>
      neighbor.direction === (direction + 2) % 4 &&
      neighbor.types.includes(structureA)
  );

  // console.log("Is structure B compatible?", isStructureBCompatible);

  // Return true if both structureA and structureB are compatible neighbors
  return isStructureACompatible && isStructureBCompatible;
}
