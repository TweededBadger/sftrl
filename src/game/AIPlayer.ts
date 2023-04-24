import { Hex } from "./Hex";
import { Player } from "./Player";

export class AIPlayer extends Player {
  targetHex: Hex;
  public lastSeenPlayer?: Hex;
  viewDistance: number;
  id: Number;
  alive: boolean = true;
  public isAiPlayer: boolean = true;
  public currentPath: Hex[] | null = null;

  constructor(position: Hex, targetPosition: Hex, viewDistance: number) {
    super(position);
    this.targetHex = targetPosition;
    this.viewDistance = viewDistance;
    this.id = Math.round(Math.random() * 10000);
    this.maxHealth = 50;
    this.health = 50;
    this.actionsPerTurn = 4;
  }
}
