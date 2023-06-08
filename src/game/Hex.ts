// Add the HexType enum

import { Weapons } from "./Combat";

const house = [
  { type: "WALL", position: { q: 0, r: -1 } },
  { type: "DOOR", position: { q: 1, r: -1 } },
  // etc
];

export type ItemType = "HEALTH" | "CHEST" | "ARMOUR" | Weapons;

export type SpriteType = ItemType | HexType | "PLAYER" | "ENEMY" | "BASE_TILE";

export type Action =
  | "SWAP_WEAPON"
  | "OPEN_CHEST"
  | "TAKE_HEALTH"
  | "TAKE_ARMOUR"
  | "ATTACK"
  | "END_TURN";

export type ItemInfo = {
  type: ItemType;
  amount?: number;
  chestContents?: any;
  isWeapon?: boolean;
};

export const itemAmounts: Record<ItemType, number> = {
  HEALTH: 20,
  CHEST: 0,
  FIST: 0,
  HAMMER_1: 10,
  SWORD: 5,
  TAZER: 10,
  HAMMER_2: 3,
  ARMOUR: 10,
};

export const hexTypes: HexType[] = [
  // "GRASS",
  // "ROAD",
  // "SEA",
  // "WOODS",
  // "SAND",
  // "DEEP_WOODS",
  // "DOOR",
  "WALL",
  "WALL_END",
  "WALL_CORNER",
  "WALL_CORNER_THREE",
  "WINDOW",
  // "DOOR",
  "EMPTY",
  "WALL_CORNER_THREE_1",
];

export const blocksLineOfSite: HexType[] = [
  "DEEP_WOODS",
  "WALL",
  "DOOR",
  "WALL_END",
  "WALL_CORNER",
  "WALL_CORNER_THREE",
];

export const allowStructure: HexType[] = ["GRASS", "WOODS", "ROAD"];
export const walkAbleHexTypes: HexType[] = ["EMPTY", "DOOR"];

export const movementCosts: Record<HexType, number> = {
  GRASS: 2,
  ROAD: 1,
  SEA: 10000,
  WOODS: 2,
  SAND: 2,
  DEEP_WOODS: 2,
  WALL: 10000,
  DOOR: 1,
  DEATH: 10000,
  EMPTY: 1,
  WALL_END: 10000,
  WALL_CORNER: 10000,
  WALL_CORNER_THREE: 10000,
  WALL_CORNER_THREE_1: 10000,
  WINDOW: 10000,
  WALL_CORNER_TIGHT: 10000,
};
export const hexDirections: [number, number][] = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
];

export type HexType =
  | "GRASS"
  | "ROAD"
  | "SEA"
  | "WOODS"
  | "SAND"
  | "DEEP_WOODS"
  | "DOOR"
  | "WALL"
  | "WALL_END"
  | "WALL_CORNER_TIGHT"
  | "WALL_CORNER"
  | "WALL_CORNER_THREE"
  | "WALL_CORNER_THREE_1"
  | "WINDOW"
  | "DEATH"
  | "EMPTY";

export class Hex {
  public type?: HexType;

  constructor(public q: number, public r: number, type?: HexType) {
    // Assign a random type (GRASS, ROAD, or SEA) to each hex cell
    // this.type = Math.floor(
    //   (Math.random() * Object.keys(HexType).length) / 2
    // ) as HexType;
    this.type = type;
  }

  // Calculate the s-coordinate (derived from q and r)
  public get s(): number {
    return -this.q - this.r;
  }

  public toString(): string {
    return this.q.toString() + "|" + this.r.toString();
  }

  // Get neighboring hex cells
  public neighbors(): Hex[] {
    const directions: [number, number][] = [
      [1, 0],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [0, -1],
      [1, -1],
    ];

    return directions.map((dir) => new Hex(this.q + dir[0], this.r + dir[1]));
  }

  public neighborsWithinRadius(radius: number): Hex[] {
    const results: Hex[] = [];

    for (let dx = -radius; dx <= radius; dx++) {
      for (
        let dy = Math.max(-radius, -dx - radius);
        dy <= Math.min(radius, -dx + radius);
        dy++
      ) {
        const dz = -dx - dy;
        if (dx !== 0 || dy !== 0 || dz !== 0) {
          results.push(new Hex(this.q + dx, this.r + dy));
        }
      }
    }

    return results;
  }

  // Calculate the distance between two hex cells
  public distance(other: Hex): number {
    const dq = Math.abs(this.q - other.q);
    const dr = Math.abs(this.r - other.r);
    const ds = Math.abs(this.s - other.s);

    // return (dx + dy + dz) / 2;
    return Math.max(dq, dr, ds);
  }

  // Convert axial coordinates to pixel coordinates
  public toPixel(size: number): { x: number; y: number } {
    const x = size * (Math.sqrt(3) * this.q + (Math.sqrt(3) / 2) * this.r);
    const y = size * ((3 / 2) * this.r);
    return { x, y };
  }

  public static hexFromString(hexString: string): Hex {
    const [q, r] = hexString.split("|").map(Number);
    return new Hex(q, r);
  }

  // Convert pixel coordinates to axial coordinates (rounding)
  public static fromPixel(x: number, y: number, size: number): Hex {
    const q = ((x * Math.sqrt(3)) / 3 - y / 3) / size;
    const r = ((2 / 3) * y) / size;
    return Hex.roundAxial(q, r);
  }

  public lerp(other: Hex, t: number): Hex {
    const q = this.q * (1 - t) + other.q * t;
    const r = this.r * (1 - t) + other.r * t;
    const s = this.s * (1 - t) + other.s * t;

    return new Hex(q, r); // Since we calculated s, we don't need to pass it as a parameter.
  }

  public static round(hex: Hex): Hex {
    let q = Math.round(hex.q);
    let r = Math.round(hex.r);
    let s = Math.round(hex.s);

    const q_diff = Math.abs(q - hex.q);
    const r_diff = Math.abs(r - hex.r);
    const s_diff = Math.abs(s - hex.s);

    if (q_diff > r_diff && q_diff > s_diff) {
      q = -r - s;
    } else if (r_diff > s_diff) {
      r = -q - s;
    } else {
      s = -q - r;
    }

    return new Hex(q, r);
  }

  // Round axial coordinates to the nearest integer
  public static roundAxial(q: number, r: number): Hex {
    const s = -q - r;
    let rq = Math.round(q);
    let rr = Math.round(r);
    const rs = Math.round(s);

    const qDiff = Math.abs(rq - q);
    const rDiff = Math.abs(rr - r);
    const sDiff = Math.abs(rs - s);

    if (qDiff > rDiff && qDiff > sDiff) {
      rq = -rr - rs;
    } else if (rDiff > sDiff) {
      rr = -rq - rs;
    } else {
      // Automatically corrected due to constraint (q + r + s = 0)
    }

    return new Hex(rq, rr);
  }

  public isAdjacent(other: Hex): boolean {
    const dx = Math.abs(this.q - other.q);
    const dy = Math.abs(this.r - other.r);
    const dz = Math.abs(this.s - other.s);

    return (dx + dy + dz) / 2 === 1;
  }

  public equals(other: Hex): boolean {
    return this.q === other.q && this.r === other.r;
  }
  public round(): Hex {
    let rx = Math.round(this.q);
    let ry = Math.round(this.r);
    let rz = Math.round(this.s);

    const xDiff = Math.abs(rx - this.q);
    const yDiff = Math.abs(ry - this.r);
    const zDiff = Math.abs(rz - this.s);

    if (xDiff > yDiff && xDiff > zDiff) {
      rx = -ry - rz;
    } else if (yDiff > zDiff) {
      ry = -rx - rz;
    } else {
      rz = -rx - ry;
    }

    return new Hex(rx, ry, this.type);
  }

  public subtract(other: Hex): Hex {
    return new Hex(this.q - other.q, this.r - other.r);
  }

  public add(other: Hex): Hex {
    return new Hex(this.q + other.q, this.r + other.r);
  }

  public dot(other: Hex): number {
    return this.q * other.q + this.r * other.r;
  }

  public normalize(): Hex {
    const magnitude = Math.sqrt(this.q * this.q + this.r * this.r);
    return new Hex(this.q / magnitude, this.r / magnitude);
  }

  public scale(scalar: number): Hex {
    return new Hex(this.q * scalar, this.r * scalar);
  }

  public getNeighborByOffset(offsetQ: number, offsetR: number): Hex {
    return new Hex(this.q + offsetQ, this.r + offsetR);
  }

  public cubeRing(radius: number): Hex[] {
    const center = this;
    const results: Hex[] = [];

    if (radius === 0) {
      return [center];
    }

    let hex = center.add(
      new Hex(hexDirections[4][0], hexDirections[4][1]).scale(radius)
    );

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < radius; j++) {
        results.push(hex);
        hex = hex.add(new Hex(hexDirections[i][0], hexDirections[i][1]));
      }
    }
    return results;
  }
}
