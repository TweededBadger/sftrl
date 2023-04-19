// Add the HexType enum
export type HexType =
  | "GRASS"
  | "ROAD"
  | "SEA"
  | "WOODS"
  | "SAND"
  | "DEEP_WOODS";

export type ItemType =
  | "HEALTH"
  | "CHEST"
  | "ROCK"
  | "SCISSORS"
  | "CLEAVER"
  | "SWORD"
  | "ARMOUR";

export type SpriteType = ItemType | "PLAYER" | "ENEMY";

export type Weapons = "CLEAVER" | "SWORD" | "SCISSORS" | "ROCK" | "HANDS";

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
};

export const itemAmounts: Record<ItemType, number> = {
  HEALTH: 5,
  CHEST: 10,
  ROCK: 10,
  SCISSORS: 5,
  CLEAVER: 3,
  SWORD: 2,
  ARMOUR: 10,
};

export const hexTypes: HexType[] = [
  "GRASS",
  "ROAD",
  "SEA",
  "WOODS",
  "SAND",
  "DEEP_WOODS",
];

export const movementCosts: Record<HexType, number> = {
  GRASS: 2,
  ROAD: 1,
  SEA: 2,
  WOODS: 4,
  SAND: 4,
  DEEP_WOODS: 4,
};

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

  // Calculate the distance between two hex cells
  public distance(other: Hex): number {
    const dx = Math.abs(this.q - other.q);
    const dy = Math.abs(this.r - other.r);
    const dz = Math.abs(this.s - other.s);

    return (dx + dy + dz) / 2;
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
}
