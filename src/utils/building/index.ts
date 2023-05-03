import { allowStructure, Hex } from "../../game/Hex";
import {
  HexRotation,
  Structure,
  StructureDefinition,
} from "../../game/Structure";
import { HexMap } from "../types";

// export const findSuitableLocation = (structure: StructureDefinition, gridSize: number,hexTypes:HexMap): Hex | null =>  {
//     const { dimensions } = structure;
//     const maxTries = 100;
//     let tries = 0;

//     while (tries < maxTries) {
//       tries++;
//       const offsetX = Math.floor(
//         Math.random() * (gridSize - dimensions.q)
//       );
//       const offsetY = Math.floor(
//         Math.random() * (gridSize - dimensions.r)
//       );

//       let isSuitable = true;

//       for (let q = 0; q < dimensions.q; q++) {
//         for (let r = 0; r < dimensions.r; r++) {
//           const hex = new Hex(q + offsetX, r + offsetY);
//           const hexType = hexTypes.get(hex.toString());

//           if (!hexType || !allowStructure.includes(hexType)) {
//             isSuitable = false;
//             break;
//           }
//         }
//         if (!isSuitable) break;
//       }

//       if (isSuitable) {
//         return new Hex(offsetX, offsetY);
//       }
//     }

//     return null;
//   }

//   type AddStructureParams = {
//     hexTypes: HexMap;
//     structure: StructureDefinition;
//     rotation?: HexRotation;
//     gridSize: number;
//   }

//   export function addStructure({
//     hexTypes,
//     structure,
//     rotation = 0,
//     gridSize
//   }: AddStructureParams): boolean {
//     const location = findSuitableLocation(structure, gridSize, hexTypes);

//     if (!location) {
//       console.warn("No suitable location found for the structure");
//       return false;
//     }

//     for (const element of structure.elements) {
//       const rotatedElement = Structure.rotateElement(
//         element,
//         rotation,
//         structure.center
//       );
//       const hex = new Hex(
//         location.q + rotatedElement.position.q,
//         location.r + rotatedElement.position.r
//       );
//       hexTypes.set(hex.toString(), rotatedElement.type);
//     }

//     return true;
//   }
