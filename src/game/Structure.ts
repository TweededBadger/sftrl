import { Hex, HexType } from "./Hex";

export type StructureElement = {
  type: HexType;
  position: { q: number; r: number };
};

export type StructureDefinition = {
  center: { q: number; r: number };
  dimensions: { q: number; r: number };
  elements: StructureElement[];
};

export type HexRotation = 0 | 1 | 2 | 3 | 4 | 5;

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
    };
  }
}

export const houseDefinition: StructureDefinition = {
  center: { q: -1, r: 2 },
  dimensions: { q: 5, r: 5 },
  elements: [
    // First row
    { type: "WALL", position: { q: -1, r: 0 } },
    { type: "DOOR", position: { q: 0, r: 0 } },
    { type: "WALL", position: { q: 1, r: 0 } },

    { type: "WALL", position: { q: -2, r: 1 } },
    { type: "ROAD", position: { q: -1, r: 1 } },
    { type: "ROAD", position: { q: 0, r: 1 } },
    { type: "WALL", position: { q: 1, r: 1 } },

    { type: "WALL", position: { q: -3, r: 2 } },
    { type: "ROAD", position: { q: -2, r: 2 } },
    { type: "ROAD", position: { q: -1, r: 2 } },
    { type: "ROAD", position: { q: 0, r: 2 } },
    { type: "WALL", position: { q: 1, r: 2 } },

    { type: "WALL", position: { q: -3, r: 3 } },
    { type: "ROAD", position: { q: -2, r: 3 } },
    { type: "ROAD", position: { q: -1, r: 3 } },
    { type: "WALL", position: { q: 0, r: 3 } },

    { type: "WALL", position: { q: -3, r: 4 } },
    { type: "WALL", position: { q: -2, r: 4 } },
    { type: "WALL", position: { q: -1, r: 4 } },

    // Second row
    // { type: "WALL", position: { q: -1, r: -1 } },
    // { type: "WALL", position: { q: 0, r: -1 } },

    // // Third row
    // { type: "WALL", position: { q: -2, r: 0 } },
    // { type: "DOOR", position: { q: -1, r: 0 } },
    // { type: "WALL", position: { q: 0, r: 0 } },

    // // Fourth row
    // { type: "WALL", position: { q: -2, r: 1 } },
    // { type: "ROAD", position: { q: -1, r: 1 } },
    // { type: "ROAD", position: { q: 0, r: 1 } },
    // { type: "WALL", position: { q: 1, r: 1 } },

    // // Fifth row
    // { type: "WALL", position: { q: -1, r: 2 } },
    // { type: "ROAD", position: { q: 0, r: 2 } },
    // { type: "WALL", position: { q: 1, r: 2 } },

    // // Sixth row
    // { type: "WALL", position: { q: 0, r: 3 } },
    // { type: "WALL", position: { q: 1, r: 3 } },

    // // Seventh row
    // { type: "WALL", position: { q: 1, r: 4 } },
  ],
};
