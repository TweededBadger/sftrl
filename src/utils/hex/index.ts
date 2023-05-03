import { blocksLineOfSite, Hex, HexType } from "../../game/Hex";
import { iterateGrid } from "./drawing";

interface AxialToCubeArgs {
  hex: Hex;
}

export function axialToCube(args: AxialToCubeArgs): { x: number; y: number; z: number } {
  const { hex } = args;
  const x = hex.q;
  const z = hex.r;
  const y = -x - z;
  return { x, y, z };
}


interface HexToMatrixArgs {
  hex: Hex;
  gridSize: number;
}

export function hexToMatrix(args: HexToMatrixArgs): [number, number] {
  const { hex, gridSize } = args;
  const x = hex.q + gridSize;
  const y = hex.r + gridSize;
  return [x, y];
}

interface MatrixToHexArgs {
  x: number;
  y: number;
  gridSize: number;
}

export function matrixToHex(args: MatrixToHexArgs): Hex {
  const { x, y, gridSize } = args;
  const q = x - gridSize;
  const r = y - gridSize;
  return new Hex(q, r);
}



export function calculateVisibleHexes(
    playerHex: Hex,
    viewDistance: number,
    hexTypes: Map<string, HexType>
  ): Set<string> {
    const visibleHexes = new Set<string>();

    // Add the player's hex to the visible hexes
    visibleHexes.add(playerHex.toString());

    const angleStep = 360/(6*7);

    for (let angle = 0; angle < 360; angle += angleStep) {
      const dx = Math.cos((angle * Math.PI) / 180);
      const dy = Math.sin((angle * Math.PI) / 180);

      let currentHex = playerHex;

      for (let distance = 0; distance <= viewDistance + 1; distance = distance + 0.5) {
        const x = playerHex.q + dx * distance;
        const y = playerHex.r + dy * distance;
        const z = -(x + y);
        const candidateHex = Hex.round(new Hex(x, y));

        if (!currentHex.equals(candidateHex)) {
          currentHex = candidateHex;

          const hexKey = currentHex.toString();
          const hexType = hexTypes.get(hexKey);

          visibleHexes.add(hexKey);

          if (hexType && blocksLineOfSite.includes(hexType)) {
            break;
          }
        }
      }
    }

    return visibleHexes;
  }


  export function populateDeathHexMap(center: Hex, radius: number, gridSize: number): Map<string, boolean> {
    const deathHexMap = new Map<string, boolean>();
  
    for (const hex of iterateGrid(gridSize)) {
        const isInZone = center.distance(hex) > radius;
        deathHexMap.set(hex.toString(), isInZone);
    }

    return deathHexMap;
  }