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
import { HexInfo, HexMap } from "../types";
import { HexRotation } from "../../game/Structure";
import { iterateGrid } from "../hex/drawing";

interface AddRoadArgs {
  hexTypes: HexMap;
  hexStart: Hex;
  hexEnd: Hex;
  gridSize: number;
}

// export function addRoad(args: AddRoadArgs): HexMap {
//   const { hexTypes, hexStart, hexEnd, gridSize } = args;
//   const matrixSize = 2 * gridSize + 1;

//   const grid = new PF.Grid(matrixSize, matrixSize);

//   hexTypes.forEach((hexType, hexKey) => {
//     const hex = Hex.hexFromString(hexKey);
//     const [x, y] = hexToMatrix({ hex, gridSize });
//     if (
//       hexType.type === "SEA" ||
//       hexType.type === "SAND" ||
//       hexType.type === "DEEP_WOODS" ||
//       hexType.type === "ROAD"
//     )
//       grid.setWalkableAt(x, y, false);
//   });

//   const finder = new PF.AStarFinder();
//   const [startX, startY] = hexToMatrix({ hex: hexStart, gridSize });
//   const [endX, endY] = hexToMatrix({ hex: hexEnd, gridSize });
//   const path = finder.findPath(startX, startY, endX, endY, grid);

//   path.forEach(([x, y]) => {
//     const hex = matrixToHex({ x, y, gridSize });
//     // hexTypes.set(hex.toString(), "ROAD");
//   });

//   return hexTypes;
// }

// interface AddRandomRoadArgs {
//   hexTypes: Map<string, HexType>;
//   gridSize: number;
// }

// export function addRandomRoad(args: AddRandomRoadArgs): Map<string, HexType> {
//   const { hexTypes, gridSize } = args;

//   const hexStart = getRandomWalkableHex(hexTypes, gridSize);
//   const hexEnd = getRandomWalkableHex(hexTypes, gridSize);

//   const newHexTypes = addRoad({ hexTypes, hexStart, hexEnd, gridSize });

//   return newHexTypes;
// }

// export function generateRandomRoads(
//   numRoads: number,
//   hexTypes: Map<string, HexType>,
//   gridSize: number
// ): Map<string, HexType> {
//   let newHexTypes = hexTypes;
//   for (let i = 0; i < numRoads; i++) {
//     newHexTypes = addRandomRoad({
//       hexTypes: newHexTypes,
//       gridSize,
//     });
//   }

//   return newHexTypes;
// }

interface GenerateHexTypesArgs {
  gridSize: number;
}

function cloneWaveFunction(waveFunction: WaveFunction): WaveFunction {
  const clonedWaveFunction = new Map<string, Set<HexTypeWithRotation>>();

  for (const [key, value] of waveFunction.entries()) {
    clonedWaveFunction.set(key, new Set(value));
  }

  return clonedWaveFunction;
}

function resetToInitialWaveFunction(
  cell: string,
  waveFunction: WaveFunction,
  initialWaveFunction: WaveFunction,
  patterns: Pattern[]
): void {
  const hex = Hex.hexFromString(cell);
  const neighbors = hex.neighbors();
  const cellsToReset = [
    cell,
    ...neighbors.map((neighbor) => neighbor.toString()),
  ];

  console.log("Resetting " + hex.toString());

  for (const cellKey of cellsToReset) {
    if (waveFunction.has(cellKey)) {
      const initialPossibleHexTypes = initialWaveFunction.get(cellKey);
      const validHexTypes = new Set<HexTypeWithRotation>();

      if (initialPossibleHexTypes) {
        for (const hexType of initialPossibleHexTypes) {
          const side = ((hex.distance(Hex.hexFromString(cellKey)) + 3) %
            6) as HexRotation;

          const v = waveFunction.get(cell);

          const isValidHex = v
            ? [...v].every((hexB) => {
                if (hexType.type === hexB.type) {
                  return false;
                }

                return checkCompatibilitySingle({
                  hexA: hexType,
                  hexB,
                  side,
                  patterns,
                });
              })
            : false;

          if (isValidHex) {
            validHexTypes.add(hexType);
          }
        }
        waveFunction.set(cellKey, validHexTypes);
      }
    }
  }
}

export function generateHexTypesSingle(args: GenerateHexTypesArgs): HexMap {
  const { gridSize } = args;

  const waveFunction = initializeWaveFunctionSingle({
    gridSize,
    hexTypes: patterns.map((pattern) => pattern.center),
  });

  const hexTypesMap: HexMap = new Map();

  while (waveFunction.size > 0) {
    const lowestEntropyCell = findLowestEntropyCellSingle({ waveFunction });

    if (lowestEntropyCell === null) {
      break;
    }

    const possibleHexTypes = waveFunction.get(lowestEntropyCell);

    if (possibleHexTypes === undefined || possibleHexTypes.size === 0) {
      // throw new Error("Inconsistent wave function state");
      // break;
      console.log("Inconsistent wave function state");

      hexTypesMap.set(lowestEntropyCell, {
        type: "EMPTY",
        rotation: 0,
      });
      waveFunction.delete(lowestEntropyCell);

      // return hexTypesMap;
    } else {
      const selectedHexType = chooseRandomHexTypeSingle(
        possibleHexTypes,
        patterns
      );
      hexTypesMap.set(lowestEntropyCell, selectedHexType);
      waveFunction.delete(lowestEntropyCell);

      updateWaveFunctionSingle({
        waveFunction,
        selectedCell: lowestEntropyCell,
        selectedHexType,
        patterns,
      });

      const finished = !!waveFunction.get(lowestEntropyCell);

      // console.log("finished", finished);
    }
  }

  return hexTypesMap;
}

function chooseRandomHexTypeSingle(
  possibleHexTypes: Set<HexTypeWithRotation>,
  patterns: Pattern[]
): HexTypeWithRotation {
  const hexTypesArray = Array.from(possibleHexTypes);
  const weightedHexTypesArray: HexTypeWithRotation[] = [];

  for (const hexType of hexTypesArray) {
    const pattern = patterns.find((p) => p.center === hexType.type);
    const weight = typeof pattern?.weight === "number" ? pattern?.weight : 10;

    for (let i = 0; i < weight; i++) {
      weightedHexTypesArray.push(hexType);
    }
  }

  const hexTypesCount = weightedHexTypesArray.length;
  const randomIndex = Math.floor(Math.random() * hexTypesCount);

  return weightedHexTypesArray[randomIndex];
}
export type Pattern = {
  center: HexType;
  neighbors: HexType[];
  canConnect: HexType[];
  connectionEnds: HexRotation[];
  weight?: number;
};

const patterns: Pattern[] = [
  {
    center: "WALL",
    neighbors: ["EMPTY"],
    canConnect: [
      "WALL",
      "WALL_CORNER",
      "WALL_CORNER_THREE",
      "DOOR",
      "WINDOW",
      "WALL_CORNER_THREE_1",
    ],
    connectionEnds: [1, 4],
  },

  {
    center: "DOOR",
    neighbors: ["EMPTY"],
    canConnect: ["WALL", "WALL_CORNER", "WALL_CORNER", "WALL_CORNER_THREE_1"],
    connectionEnds: [1, 4],
    weight: 3,
  },

  {
    center: "WINDOW",
    neighbors: ["EMPTY"],
    canConnect: [
      "WALL",
      "WALL_CORNER",
      "WALL_CORNER_THREE",
      "WALL_CORNER_THREE_1",
    ],
    connectionEnds: [1, 4],
    weight: 5,
  },
  // {
  //   center: "WALL_END",
  //   neighbors: ["EMPTY", "WALL_CORNER"],
  //   canConnect: ["WALL", "WALL_CORNER"],
  //   connectionEnds: [1],
  // },
  {
    center: "WALL_CORNER",
    neighbors: ["EMPTY"],
    canConnect: [
      "WALL",
      "WINDOW",
      "WALL_CORNER_THREE",
      "DOOR",
      // "WALL_CORNER",
      // "WALL_CORNER_THREE_1",
    ],
    connectionEnds: [2, 4],
    weight: 3,
  },
  {
    center: "WALL_CORNER_THREE",
    neighbors: ["EMPTY", "WALL"],
    canConnect: [
      "WALL",
      "WINDOW",
      "WALL_CORNER",

      "DOOR",
      "WALL_CORNER_THREE_1",
    ],
    connectionEnds: [0, 2, 4],
    weight: 7,
  },
  // {
  //   center: "WALL_CORNER_THREE_1",
  //   neighbors: ["EMPTY", "WALL"],
  //   canConnect: ["WALL", "WINDOW", "WALL_CORNER", "WALL_CORNER_THREE", "DOOR"],
  //   connectionEnds: [1, 3, 4],
  //   weight: 5,
  // },
  // {
  //   center: "WALL_CORNER_TIGHT",
  //   neighbors: [
  //     "EMPTY",
  //     "WALL_CORNER",
  //     "WALL_CORNER_TIGHT",
  //     "WALL",
  //     "WALL_END",
  //   ],
  //   canConnect: ["WALL", "WALL_END", "WALL_CORNER"],
  //   connectionEnds: [4, 5],
  // },
  {
    center: "EMPTY",
    neighbors: [
      "WALL",
      "EMPTY",
      "WALL_CORNER",
      "WALL_CORNER_THREE",
      "WALL_CORNER_THREE_1",
      "DOOR",
      "WINDOW",
    ],
    canConnect: [],
    connectionEnds: [],
    weight: 10,
  },
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

// const waveFunction = initializeWaveFunction({
//   gridSize: 5,
//   hexTypes: hexTypes,
//   patterns: combinedPatterns,
// });

interface InitializeWaveFunctionArgs {
  gridSize: number;

  hexTypes: HexType[];
}

type HexTypeWithRotation = {
  type: HexType;
  rotation: HexRotation;
  position: Hex;
};

type WaveFunction = Map<string, Set<HexTypeWithRotation>>;

function initializeWaveFunctionSingle(
  args: InitializeWaveFunctionArgs
): WaveFunction {
  const { gridSize, hexTypes } = args;

  const waveFunction: WaveFunction = new Map();

  // for (let q = 0; q <= gridSize; q++) {
  //   for (let r = 0; r <= gridSize; r++) {
  //     const hex = new Hex(q, r);

  //     // const possibleHexTypes = getCompatibleHexTypesSingle({
  //     //   waveFunction,
  //     //   position: hex,
  //     //   patterns: patterns,
  //     // });

  //     // if (possibleHexTypes.size > 0) {
  //     const possibleHexTypesWithRotations = new Set<{
  //       type: HexType;
  //       rotation: HexRotation;
  //     }>();

  //     hexTypes.forEach((hexType) => {
  //       for (let rotation: HexRotation = 0; rotation <= 5; rotation++) {
  //         possibleHexTypesWithRotations.add({
  //           type: hexType,
  //           rotation: rotation as HexRotation,
  //         });
  //       }
  //     });

  //     waveFunction.set(hex.toString(), possibleHexTypesWithRotations);
  //   }
  //   // }
  // }

  for (const hex of iterateGrid(gridSize)) {
    const hexKey = hex.toString();
    const allHexTypesWithRotations = new Set<HexTypeWithRotation>();

    hexTypes.forEach((hexType) => {
      for (let rotation: HexRotation = 0; rotation <= 5; rotation++) {
        allHexTypesWithRotations.add({
          type: hexType,
          rotation: rotation as HexRotation,
          position: hex,
        });
      }
    });

    waveFunction.set(hexKey, allHexTypesWithRotations);
  }

  // for (let q = 0; q <= gridSize; q++) {
  //   for (
  //     let r = Math.max(-gridSize, -q - gridSize);
  //     r <= Math.min(gridSize, -q + gridSize);
  //     r++
  //   ) {
  //     const hex = new Hex(q, r);
  //     const hexKey = hex.toString();
  //     const allHexTypesWithRotations = new Set<{
  //       type: HexType;
  //       rotation: HexRotation;
  //     }>();

  //     hexTypes.forEach((hexType) => {
  //       for (let rotation: HexRotation = 0; rotation <= 5; rotation++) {
  //         allHexTypesWithRotations.add({
  //           type: hexType,
  //           rotation: rotation as HexRotation,
  //         });
  //       }
  //     });

  //     waveFunction.set(hexKey, allHexTypesWithRotations);
  //   }
  // }

  return waveFunction;
}
interface GetCompatibleHexTypesArgs {
  waveFunction: WaveFunction;
  position: Hex;
  patterns: Pattern[];
}

// function getCompatibleHexTypesSingle(
//   args: GetCompatibleHexTypesArgs
// ): Set<HexTypeWithRotation> {
//   const { waveFunction, position, patterns } = args;
//   const compatibleHexTypes = new Set<HexTypeWithRotation>();

//   for (const hexTypeWithRotation of waveFunction.get(position.toString()) ||
//     new Set<HexTypeWithRotation>()) {
//     const pattern = patterns.find((p) => p.center === hexTypeWithRotation.type);

//     if (pattern) {
//       const neighborPositions = position.neighbors();
//       const isCompatible = neighborPositions.some((neighborPosition, index) => {
//         const neighborHexTypesWithRotation = waveFunction.get(
//           neighborPosition.toString()
//         );
//         const expectedNeighborType = pattern.neighbors[index];

//         if (neighborHexTypesWithRotation) {
//           for (const neighborTypeWithRotation of neighborHexTypesWithRotation) {
//             if (neighborTypeWithRotation.type === expectedNeighborType) {
//               const compatibility = checkCompatibilitySingle({
//                 hexA: hexTypeWithRotation,
//                 hexB: neighborTypeWithRotation,
//                 patterns,
//               });

//               if (compatibility) {
//                 return true;
//               }
//             }
//           }
//         }
//       });

//       if (isCompatible) {
//         compatibleHexTypes.add(hexTypeWithRotation);
//       }
//     }
//   }

//   return compatibleHexTypes;
// }

interface UpdateWaveFunctionArgs {
  waveFunction: WaveFunction;
  selectedCell: string;
  selectedHexType: HexTypeWithRotation;
  patterns: Pattern[];
}

function updateWaveFunctionSingle(args: UpdateWaveFunctionArgs): void {
  const { waveFunction, selectedCell, selectedHexType, patterns } = args;
  const selectedHex = Hex.hexFromString(selectedCell);
  const neighbors = selectedHex.neighbors();

  for (const [index, neighbor] of neighbors.entries()) {
    const neighborKey = neighbor.toString();

    if (waveFunction.has(neighborKey)) {
      const possibleNeighborHexTypes = waveFunction.get(neighborKey);
      const remainingPossibleHexTypes = new Set<HexTypeWithRotation>();

      if (possibleNeighborHexTypes) {
        for (const possibleNeighborHexType of possibleNeighborHexTypes) {
          const side = index as HexRotation;
          if (
            checkCompatibilitySingle({
              hexA: selectedHexType,
              hexB: possibleNeighborHexType,
              side,
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
  hexA: HexTypeWithRotation;
  hexB: HexTypeWithRotation;
  side: HexRotation;
  patterns: Pattern[];
}

function checkCompatibilitySingle(args: CheckCompatibilityArgs): boolean {
  const { hexA, hexB, side, patterns } = args;

  const patternA = patterns.find((pattern) => pattern.center === hexA.type);
  const patternB = patterns.find((pattern) => pattern.center === hexB.type);

  if (!patternA || !patternB) {
    return false;
  }

  const isConnectionEndA = patternA.connectionEnds
    .map((ce) => (ce + hexA.rotation) % 6)
    .includes(side);
  const oppositeSide = (side + 3) % 6;
  const isConnectionEndB = patternB.connectionEnds
    .map((ce) => (ce + hexB.rotation) % 6)
    .includes(oppositeSide);

  if (isConnectionEndA) {
    // Check if the type of hexB is in canConnect
    if (!patternA.canConnect.includes(hexB.type)) {
      return false;
    }

    // Check if the corresponding side on hexB is a connection side
    if (isConnectionEndB) {
      return true;
    }
  } else {
    // Check if the type of hexB is in neighbors
    if (!patternA.neighbors.includes(hexB.type)) {
      return false;
    }

    // Check if the corresponding side on hexB is NOT a connection side
    if (!isConnectionEndB) {
      return true;
    }
  }

  return false;
}

interface FindLowestEntropyCellArgs {
  waveFunction: WaveFunction;
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

// export function connectAllRooms(hexMap: HexMap, gridSize: number): HexMap {
//   const newHexMap = new Map(hexMap);
//   const visited = new Set<string>();

//   function floodFill(hex: Hex) {
//     const key = hex.toString();

//     if (visited.has(key) || !newHexMap.has(key)) return;

//     const hexInfo = newHexMap.get(key);
//     if (hexInfo && hexInfo.type === "EMPTY") {
//       visited.add(key);
//       for (const neighbor of hex.neighbors()) {
//         floodFill(neighbor);
//       }
//     }
//   }

//   function findDoorCandidate(): {
//     hex: Hex;
//     hexInfo: HexInfo;
//   } | null {
//     for (const hex of iterateGrid(gridSize)) {
//       const key = hex.toString();
//       const hexInfo = newHexMap.get(key);
//       if (hexInfo && hexInfo.type === "WALL") {
//         let visitedEmptyNeighbor = false;
//         let unvisitedEmptyNeighbor = false;
//         for (const neighbor of hex.neighbors()) {
//           const neighborKey = neighbor.toString();
//           const neighborInfo = newHexMap.get(neighborKey);
//           if (neighborInfo && neighborInfo.type === "EMPTY") {
//             if (visited.has(neighborKey)) {
//               visitedEmptyNeighbor = true;
//             } else {
//               unvisitedEmptyNeighbor = true;
//             }
//           }
//           if (visitedEmptyNeighbor && unvisitedEmptyNeighbor) {
//             return { hex, hexInfo };
//           }
//         }
//       }
//     }
//     return null;
//   }

//   const startingHex = Array.from(newHexMap.keys()).find((key) => {
//     const hexInfo = newHexMap.get(key);
//     return hexInfo && hexInfo.type === "EMPTY";
//   });

//   if (startingHex) {
//     floodFill(Hex.hexFromString(startingHex));
//   }

//   while (visited.size !== Array.from(newHexMap.keys()).length) {
//     const doorCandidate = findDoorCandidate();
//     if (doorCandidate) {
//       newHexMap.set(doorCandidate.hex.toString(), {
//         type: "DOOR",
//         rotation: doorCandidate.hexInfo.rotation,
//       });
//       floodFill(doorCandidate.hex);
//     } else {
//       break;
//     }
//   }

//   return newHexMap;
// }

export function connectAllRooms(hexMap: HexMap, gridSize: number): HexMap {
  const newHexMap = new Map(hexMap);
  const visited = new Set<string>();

  function floodFill(hex: Hex): void {
    const stack: Hex[] = [hex];
    while (stack.length > 0) {
      const current = stack.pop();
      if (current) {
        const key = current.toString();
        if (!visited.has(key)) {
          visited.add(key);
          for (const neighbor of current.neighbors()) {
            const neighborKey = neighbor.toString();
            const neighborInfo = newHexMap.get(neighborKey);
            if (
              neighborInfo &&
              (neighborInfo.type === "EMPTY" || neighborInfo.type === "DOOR")
            ) {
              stack.push(neighbor);
            }
          }
        }
      }
    }
  }

  function findDoorCandidate(): Hex | null {
    for (const hex of iterateGrid(gridSize)) {
      const key = hex.toString();
      const hexInfo = newHexMap.get(key);
      if (hexInfo && (hexInfo.type === "WALL" || hexInfo.type === "WINDOW")) {
        let visitedEmptyNeighbor = false;
        let unvisitedEmptyNeighbor = false;
        for (const neighbor of hex.neighbors()) {
          const neighborKey = neighbor.toString();
          const neighborInfo = newHexMap.get(neighborKey);
          if (
            neighborInfo &&
            (neighborInfo.type === "EMPTY" || neighborInfo.type === "DOOR")
          ) {
            if (visited.has(neighborKey)) {
              visitedEmptyNeighbor = true;
            } else {
              unvisitedEmptyNeighbor = true;
            }
          }
          if (visitedEmptyNeighbor && unvisitedEmptyNeighbor) {
            newHexMap.set(key, { type: "DOOR", rotation: hexInfo.rotation });
            return hex;
          }
        }
      }
    }
    return null;
  }
  const startingHex = Array.from(newHexMap.keys()).find((key) => {
    const hexInfo = newHexMap.get(key);
    return hexInfo && hexInfo.type === "EMPTY";
  });

  if (startingHex) {
    floodFill(Hex.hexFromString(startingHex));
  }

  while (visited.size !== Array.from(newHexMap.keys()).length) {
    const doorCandidate = findDoorCandidate();
    if (doorCandidate) {
      const doorCandidateKey = doorCandidate.toString();
      const hexInfo = newHexMap.get(doorCandidateKey);
      if (hexInfo) {
        newHexMap.set(doorCandidateKey, {
          type: "DOOR",
          rotation: hexInfo.rotation,
        });
      }
      floodFill(doorCandidate);
    } else {
      break;
    }
  }

  return newHexMap;
}
