import { Hex } from "./Hex";
import { Player } from "./Player";

export class AIPlayer extends Player {
  targetHex: Hex;
  public lastSeenPlayer?: Hex;
  viewDistance: number;
  alive: boolean = true;
  public currentPath: Hex[] | null = null;

  constructor(position: Hex, targetPosition: Hex, viewDistance: number) {
    super(position);
    this.targetHex = targetPosition;
    this.viewDistance = viewDistance;
    this.id = Math.round(Math.random() * 10000);
    this.maxHealth = 100;
    this.health = 100;
    this.isAiPlayer = true;
    // this.actionsPerTurn = 4;
  }
}
