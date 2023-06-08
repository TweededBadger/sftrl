import { weaponStats } from "../../game/Combat";
import {
  Hex,
  HexType,
  ItemInfo,
  ItemType,
  movementCosts,
} from "../../game/Hex";
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
    let tries = 0;
    do {
      hex = getRandomWalkableHex(hexTypes, gridSize);
      const hexType = hexTypes.get(hex.toString());
      const isNearOtherItems = Array.from(items.keys())
        .map((key) => Hex.hexFromString(key))
        .some((itemHex) => itemHex.distance(hex) <= 2);

      isSuitable = hexType?.type === "EMPTY" && !isNearOtherItems;
      tries++;
      if (tries > 100) {
        return;
      }
    } while (!isSuitable);

    const itemInfo: ItemInfo = {
      type,
    };
    if (type === "HEALTH") {
      itemInfo.amount = 100;
    }
    if (type === "ARMOUR") {
      itemInfo.amount = 20;
    }

    if (
      type !== "HEALTH" &&
      type !== "ARMOUR" &&
      type !== "CHEST" &&
      weaponStats[type]
    ) {
      itemInfo.isWeapon = true;
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

export function placeItemAtHex(
  hex: Hex,
  itemType: ItemType,
  hexTypes: HexMap,
  items: Map<string, ItemInfo>
): void {
  const neighbors = hex.neighbors();

  // Filter neighbors that have a valid HexType and a movement cost of 4 or less
  const availableNeighbors = neighbors.filter((neighbor) => {
    const neighborType = hexTypes.get(neighbor.toString());
    return (
      neighborType !== undefined &&
      neighborType.type !== "WALL" &&
      movementCosts[neighborType.type] <= 4
    );
  });

  if (availableNeighbors.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableNeighbors.length);
    const randomNeighbor = availableNeighbors[randomIndex];

    const itemInfo: ItemInfo = {
      type: itemType,
    };

    if (
      itemType !== "HEALTH" &&
      itemType !== "ARMOUR" &&
      itemType !== "CHEST"
    ) {
      itemInfo.isWeapon = true;
    }

    items.set(randomNeighbor.toString(), itemInfo);
  }
}
