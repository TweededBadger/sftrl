import { HexType } from "../game/Hex";
import { HexRotation } from "../game/Structure";

export type HexInfo = { type: HexType; rotation: HexRotation };
export type HexMap = Map<string, HexInfo>;
