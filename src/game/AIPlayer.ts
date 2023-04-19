import { Hex } from "./Hex";
import { Player } from "./Player";

export class AIPlayer extends Player {
  targetHex: Hex;
  viewDistance: number;
  id: Number;
  alive: boolean = true;

  constructor(position: Hex, targetPosition: Hex, viewDistance: number) {
    super(position);
    this.targetHex = targetPosition;
    this.viewDistance = viewDistance;
    this.id = Math.round(Math.random() * 10000);
  }
}
