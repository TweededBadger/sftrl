import VectorNoiseGenerator from "atlas-vector-noise";
import { Hex, HexType } from "../../game/Hex";
import { axialToCube, hexToMatrix, matrixToHex } from "../hex";

type  Thresholds = Record<number, HexType>;

interface GetHexTypeFromNoiseArgs {
  noiseValue: number;
  thresholds: Thresholds;
}

export function getHexTypeFromNoise(args: GetHexTypeFromNoiseArgs): HexType {
  const { noiseValue, thresholds } = args;

  const sortedThresholds = Object.keys(thresholds)
    .map(parseFloat)
    .sort((a, b) => a - b);

  for (let i = 0; i < sortedThresholds.length; i++) {
    const threshold = sortedThresholds[i];
    if (noiseValue < threshold) {
      return thresholds[threshold];
    }
  }

  return thresholds[sortedThresholds[sortedThresholds.length - 1]];
}


interface GenerateHexTypesArgs {
  gridSize: number;
  thresholds: GetHexTypeFromNoiseArgs["thresholds"];
}

export function generateHexTypes(args: GenerateHexTypesArgs): Map<string, HexType> {
  const { gridSize, thresholds } = args;
  const smallSquareGrid = new VectorNoiseGenerator(10);
  const scaleFactor = 10;

  const hexTypes = new Map<string, HexType>();

  for (let q = -gridSize; q <= gridSize; q++) {
    for (
      let r = Math.max(-gridSize, -q - gridSize);
      r <= Math.min(gridSize, -q + gridSize);
      r++
    ) {
      const hex = new Hex(q, r);
      const cube = axialToCube({ hex });
      const x = Math.round(cube.x + gridSize);
      const y = Math.round(cube.y + gridSize);
      const noiseValue = smallSquareGrid.getPixel(
        x / scaleFactor,
        y / scaleFactor
      );
      const hexType = getHexTypeFromNoise({ noiseValue, thresholds });
      const hexKey = hex.toString();
      hexTypes.set(hexKey, hexType);
    }
  }

  return hexTypes;
}

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

  const hexStart = getRandomWalkableHex(hexTypes, gridSize );
  const hexEnd = getRandomWalkableHex(hexTypes, gridSize);

  const newHexTypes = addRoad({ hexTypes, hexStart, hexEnd, gridSize });

  return newHexTypes;
}


export function generateRandomRoads(
    numRoads: number, hexTypes: Map<string, HexType>, gridSize: number
  ): Map<string, HexType> {
    let newHexTypes = hexTypes;
    for (let i = 0; i < numRoads; i++) {
      newHexTypes = addRandomRoad({
        hexTypes: newHexTypes,
        gridSize
      });
    }

    return newHexTypes;
  }