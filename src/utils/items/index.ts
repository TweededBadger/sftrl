import { Hex, ItemInfo, ItemType } from "../../game/Hex";
import { getRandomWalkableHex } from "../routing";
import { HexMap } from "../types";


export function generateItems(
    hexTypes: HexMap,
    itemAmounts: { [key in ItemType]: number },
    gridSize: number
  ): Map<string, ItemInfo> {
    const items: Map<string, ItemInfo> = new Map();
  
    const addItem = (type: ItemType) => {
      let hex: Hex;
      let isSuitable: boolean;
      do {
        hex = getRandomWalkableHex(hexTypes, gridSize);
        const hexType = hexTypes.get(hex.toString());
        const isNearOtherItems = Array.from(items.keys())
          .map((key) => Hex.hexFromString(key))
          .some((itemHex) => itemHex.distance(hex) <= 4);
  
        isSuitable =
          (hexType === "GRASS" || hexType === "ROAD") && !isNearOtherItems;
      } while (!isSuitable);
  
      const itemInfo: ItemInfo = {
        type,
      };
      if (type === "HEALTH") {
        itemInfo.amount = 100;
      }
      if (type === "ARMOUR") {
        itemInfo.amount = 10;
      }
  
      items.set(hex.toString(), itemInfo);
    };
  
    for (const itemType in itemAmounts) {
      const amount = itemAmounts[itemType as ItemType];
      for (let i = 0; i < amount; i++) {
        addItem(itemType as ItemType);
      }
    }
  
    return items;
  }