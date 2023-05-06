import { Pattern } from "../utils/procGen";
import { Hex, HexType } from "./Hex";

export type HexRotation = 0 | 1 | 2 | 3 | 4 | 5;

export const hexRotations: HexRotation[] = [0, 1, 2, 3, 4, 5];

export class Structure {
  hexes: Map<Hex, HexType>;

  constructor(center: Hex, structureDefinition: StructureElement[]) {
    this.hexes = new Map<Hex, HexType>();

    for (const element of structureDefinition) {
      const hex = new Hex(
        center.q + element.position.q,
        center.r + element.position.r
      );
      this.hexes.set(hex, element.type);
    }
  }

  public static rotateElement(
    element: StructureElement,
    rotation: HexRotation,
    center: { q: number; r: number }
  ): StructureElement {
    const offsetX = element.position.q - center.q;
    const offsetY = element.position.r - center.r;

    let rotatedQ, rotatedR;

    switch (rotation) {
      case 1:
        rotatedQ = -offsetY;
        rotatedR = offsetX + offsetY;
        break;
      case 2:
        rotatedQ = -offsetX - offsetY;
        rotatedR = offsetX;
        break;
      case 3:
        rotatedQ = -offsetX;
        rotatedR = -offsetY;
        break;
      case 4:
        rotatedQ = offsetY;
        rotatedR = -offsetX - offsetY;
        break;
      case 5:
        rotatedQ = offsetX + offsetY;
        rotatedR = -offsetX;
        break;
      default:
        rotatedQ = offsetX;
        rotatedR = offsetY;
    }

    const finalQ = rotatedQ + center.q;
    const finalR = rotatedR + center.r;

    return {
      type: element.type,
      position: { q: finalQ, r: finalR },
      rotation: 0,
    };
  }
}

export type StructureElement = {
  type: HexType;
  position: { q: number; r: number };
  rotation: HexRotation;
};

export type StructureDefinition = {
  center?: { q: number; r: number };
  dimensions?: { q: number; r: number };
  elements: StructureElement[];
};
