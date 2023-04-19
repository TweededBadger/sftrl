import VectorNoiseGenerator from "atlas-vector-noise";
import { EventEmitter } from "eventemitter3";
import PF, { Grid, Finder } from "pathfinding";

import { HexGrid } from "./HexGrid";
import { Action, Hex, HexType, itemAmounts, ItemInfo, ItemType } from "./Hex";
import { Player } from "./Player";
import { AIPlayer } from "./AIPlayer";
import { Actions } from "./Actions";

const thresholds: Record<number, HexType> = {
  0.4: "SEA",
  0.45: "SAND",
  0.65: "GRASS",
  0.72: "WOODS",
  0.75: "DEEP_WOODS",
};

const hexDirections: [number, number][] = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
];

export class Main {
  private gridSize: number;
  public hexTypes: Map<string, HexType>;
  public items: Map<string, ItemInfo>;
  private aiPlayers: AIPlayer[] = [];
  private numberOfAIPlayers: number = 50;
  private viewDistance: number = 4;
  private walkableMatrix: number[][];
  private finder: Finder;
  private player: Player;
  private hexGrid: HexGrid;
  private actions: Actions;
  public turnNumber: number = 0;
  events: EventEmitter;

  constructor(gridSize: number) {
    EventEmitter;
    this.gridSize = gridSize;
    this.hexTypes = this.generateHexTypes(this.gridSize);
    this.hexTypes = this.generateRandomRoads(this.hexTypes);
    this.items = this.generateItems(this.hexTypes);
    this.walkableMatrix = this.generateWalkableMatrix(
      this.hexTypes,
      this.gridSize
    );

    this.finder = new PF.AStarFinder();

    const player = new Player(new Hex(0, 0));
    this.player = player;

    for (let i = 0; i < this.numberOfAIPlayers; i++) {
      const startPosition = this.getRandomWalkableHex();
      const targetPosition = this.getRandomWalkableHexInViewDistance(
        startPosition,
        this.viewDistance
      );
      // console.log(startPosition);
      this.aiPlayers.push(
        new AIPlayer(startPosition, targetPosition, this.viewDistance)
      );
    }
    this.events = new EventEmitter();

    this.hexGrid = new HexGrid(this, this.gridSize, this.viewDistance, () => {
      this.render();
    });
    this.actions = new Actions(this);
  }

  private emitCurrentState(): void {
    this.events.emit("currentState", {
      numAlivePlayers: this.numAlivePlayers,
      numPlayers: this.numPlayer,
      turnNumber: this.turnNumber,
      actionsLeft: this.player.actionsPerTurn - this.player.actionsTaken,
      playerHealth: this.player.health,
      player: this.player,
    });
  }

  // Calculate the s-coordinate (derived from q and r)
  public get numPlayer(): number {
    return this.aiPlayers.length;
  }

  public get numAlivePlayers(): number {
    return this.aiPlayers.filter((player) => player.alive).length;
  }

  private generateItems(hexTypes: Map<string, HexType>): Map<string, ItemInfo> {
    const items: Map<string, ItemInfo> = new Map();

    const addItem = (type: ItemType) => {
      let hex: Hex;
      let isSuitable: boolean;
      do {
        hex = this.getRandomWalkableHex();
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

  private generateWalkableMatrix(
    hexTypes: Map<string, HexType>,
    gridSize: number
  ): number[][] {
    const matrixSize = 2 * gridSize + 1;
    const matrix = Array.from({ length: matrixSize }, () =>
      new Array(matrixSize).fill(0)
    );

    hexTypes.forEach((hexType, hexKey) => {
      const hex = Hex.hexFromString(hexKey);
      const [x, y] = this.hexToMatrix(hex);
      matrix[y][x] = hexType === "SEA" ? 1 : 0;
    });

    return matrix;
  }

  private update(): void {
    this.hexGrid.revealHexes(this.player.hex);
    // this.resolveAIPlayerCombat();
    console.log(this.numAlivePlayers);

    this.player.updateAvailableActions(this.items, this.aiPlayers);
    this.player.setReachableHexes(this.hexTypes);

    // for (const aiPlayer of this.aiPlayers) {
    //   this.movePlayer(aiPlayer);
    // }

    this.emitCurrentState();
  }

  private render(): void {
    this.hexGrid.clearCanvas();

    this.hexGrid.renderGrid(
      this.gridSize,
      this.hexTypes,
      this.player.hex,
      this.items
    );
    this.hexGrid.renderPlayer(this.player, this.player.hex);
    for (const aiPlayer of this.aiPlayers) {
      this.hexGrid.renderAIPlayer(aiPlayer, this.player.hex);
    }

    this.hexGrid.renderReachableArea(this.player);
    // this.hexGrid.drawMovableArea(this.player);

    // for (const player of this.aiPlayers) {
    //   const playerHex = this.hexTypes.get(player.hex.toString());
    //   if (playerHex) {
    //     this.hexGrid.drawMovableArea(player);
    //   }
    // }
  }

  private resolveAIPlayerCombat(): void {
    const alivePlayers = this.aiPlayers.filter((player) => player.alive);

    for (let i = 0; i < alivePlayers.length; i++) {
      for (let j = i + 1; j < alivePlayers.length; j++) {
        const player1 = alivePlayers[i];
        const player2 = alivePlayers[j];

        if (player1.hex.distance(player2.hex) === 1) {
          const randomIndex = Math.floor(Math.random() * 2);
          const defeatedPlayer = randomIndex === 0 ? player1 : player2;
          defeatedPlayer.alive = false;
        }
      }
    }
  }

  private movePlayer(player: AIPlayer): void {
    if (!player.alive) return;
    const path = this.findPath(player.hex, player.targetHex);

    if (path.length > 0) {
      player.hex = path[0];
    }

    if (path.length === 0 || path.length === 1) {
      let targetPosition = this.getPlayerHexInViewDistance(player);
      if (!targetPosition) {
        targetPosition = this.getRandomWalkableHexInViewDistance(
          player.hex,
          this.viewDistance
        );
      }
      player.targetHex = targetPosition;
    }
  }

  public endTurn(): void {
    this.turnNumber++;
    this.player.actionsTaken = 0;
    this.emitCurrentState();
  }

  public performAction(action: Action): void {
    this.actions.performAction(action, this.player);
    // this.player.updateAvailableActions(this.items, this.aiPlayers);

    // this.render();
    // this.emitCurrentState();
    this.update();
    this.render();
  }

  private getPlayerHexInViewDistance(player: AIPlayer): Hex | null {
    const alivePlayers = this.aiPlayers.filter((player) => player.alive);
    const players = alivePlayers;
    let closestPlayerHex: Hex | null = null;
    let minDistance = Infinity;

    for (const otherPlayer of players) {
      const distance = player.hex.distance(otherPlayer.hex);
      if (
        distance <= this.viewDistance &&
        distance < minDistance &&
        otherPlayer.id !== player.id
      ) {
        minDistance = distance;
        closestPlayerHex = otherPlayer.hex;
      }
    }

    return closestPlayerHex;
  }

  private findPath(start: Hex, target: Hex): Hex[] {
    const [startX, startY] = this.hexToMatrix(start);
    const [targetX, targetY] = this.hexToMatrix(target);

    var grid = new PF.Grid(this.walkableMatrix);

    const path = this.finder.findPath(startX, startY, targetX, targetY, grid);

    // Convert the path back to Hex objects, skipping the first element (the starting position)
    return path.slice(1).map(([x, y]) => this.matrixToHex(x, y));
  }

  public start(): void {
    const hexSize = 20;
    this.turnNumber = 0;

    this.hexGrid.canvas.addEventListener("click", (event) => {
      this.handleClick(event);
    });

    window.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        this.performAction("END_TURN");
      }
    });

    this.hexGrid.revealHexes(this.player.hex);

    this.update();

    this.render();
    this.emitCurrentState();
  }

  private getRandomWalkableHexInViewDistance(
    startPosition: Hex,
    viewDistance: number
  ): Hex {
    let targetPosition: Hex = startPosition;
    let isValidTarget: boolean;
    let attempts = 0;

    do {
      const randomDirectionIndex = Math.floor(
        Math.random() * hexDirections.length
      );
      const randomDirection = hexDirections[randomDirectionIndex];
      const randomDistance = Math.floor(Math.random() * viewDistance) + 1;
      targetPosition = new Hex(
        startPosition.q + randomDirection[0] * randomDistance,
        startPosition.r + randomDirection[1] * randomDistance
      );
      const candidateType = this.hexTypes.get(targetPosition.toString());
      isValidTarget = !!candidateType && candidateType !== "SEA";

      attempts++;
      if (attempts >= 100) {
        console.warn("Could not find a valid target hex within view distance.");
        return startPosition;
      }
    } while (!isValidTarget);

    return targetPosition;
  }

  private getRandomWalkableHex(): Hex {
    let randomHex: Hex | null = null;

    while (!randomHex) {
      const randomQ =
        Math.floor(Math.random() * (2 * this.gridSize + 1)) - this.gridSize;
      const randomR =
        Math.floor(Math.random() * (2 * this.gridSize + 1)) - this.gridSize;
      const candidateHex = new Hex(randomQ, randomR);
      const candidateType = this.hexTypes.get(candidateHex.toString());

      if (!!candidateType && candidateType !== "SEA") {
        randomHex = candidateHex;
      }
    }

    return randomHex;
  }

  private handleClick(event: MouseEvent): void {
    const rect = this.hexGrid.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const { offsetX, offsetY } = this.hexGrid.calculateOffset(this.player.hex);
    const hex = this.hexGrid.pixelToHex(x - offsetX, y - offsetY);

    const hexKey = hex.toString();
    const type = this.hexTypes.get(hexKey);

    if (!type) return;

    if (this.player.hex.isAdjacent(hex)) {
      this.player.moveTo(hex, type);

      this.update();
      this.render();
    }
  }

  private getHexTypeFromNoise(noiseValue: number): HexType {
    const sortedThresholds = Object.keys(thresholds)
      .map(parseFloat)
      .sort((a, b) => a - b);

    for (let i = 0; i < sortedThresholds.length; i++) {
      const threshold = sortedThresholds[i];
      if (noiseValue < threshold) {
        return thresholds[threshold];
      }
    }

    return thresholds[sortedThresholds[sortedThresholds.length - 1]];
  }

  // Convert axial coordinates to cube coordinates
  private axialToCube(hex: Hex): { x: number; y: number; z: number } {
    const x = hex.q;
    const z = hex.r;
    const y = -x - z;
    return { x, y, z };
  }

  private generateHexTypes(gridSize: number): Map<string, HexType> {
    const smallSquareGrid = new VectorNoiseGenerator(10);
    const scaleFactor = 10;

    const hexTypes = new Map<string, HexType>();

    for (let q = -gridSize; q <= gridSize; q++) {
      for (
        let r = Math.max(-gridSize, -q - gridSize);
        r <= Math.min(gridSize, -q + gridSize);
        r++
      ) {
        const hex = new Hex(q, r);
        const cube = this.axialToCube(hex);
        const x = Math.round(cube.x + gridSize);
        const y = Math.round(cube.y + gridSize);
        const noiseValue = smallSquareGrid.getPixel(
          x / scaleFactor,
          y / scaleFactor
        );
        // console.log({ x, y, noiseValue });
        // const noiseValue = 0;
        const hexType = this.getHexTypeFromNoise(noiseValue);
        const hexKey = hex.toString();
        hexTypes.set(hexKey, hexType);
      }
    }

    return hexTypes;
  }

  private hexToMatrix(hex: Hex): [number, number] {
    const gridSize = this.gridSize;
    const x = hex.q + gridSize;
    const y = hex.r + gridSize;
    return [x, y];
  }

  private matrixToHex(x: number, y: number): Hex {
    const gridSize = this.gridSize;
    const q = x - gridSize;
    const r = y - gridSize;
    return new Hex(q, r);
  }

  private addRoad(
    hexTypes: Map<string, HexType>,
    hexStart: Hex,
    hexEnd: Hex
  ): Map<string, HexType> {
    const matrixSize = 2 * this.gridSize + 1;

    const grid = new PF.Grid(matrixSize, matrixSize);

    hexTypes.forEach((hexType, hexKey) => {
      const hex = Hex.hexFromString(hexKey);
      const [x, y] = this.hexToMatrix(hex);
      if (
        hexType === "SEA" ||
        hexType === "SAND" ||
        hexType === "DEEP_WOODS" ||
        hexType === "ROAD"
      )
        grid.setWalkableAt(x, y, false);
    });

    const finder = new PF.AStarFinder();
    const [startX, startY] = this.hexToMatrix(hexStart);
    const [endX, endY] = this.hexToMatrix(hexEnd);
    const path = finder.findPath(startX, startY, endX, endY, grid);

    path.forEach(([x, y]) => {
      const hex = this.matrixToHex(x, y);
      hexTypes.set(hex.toString(), "ROAD");
    });

    return hexTypes;
  }

  private addRandomRoad(hexTypes: Map<string, HexType>): Map<string, HexType> {
    const gridSize = this.gridSize;

    let hexStart = this.getRandomWalkableHex();
    let hexEnd = this.getRandomWalkableHex();

    // while (!hexStart || !hexEnd) {
    //   const randomQ = Math.floor(Math.random() * (2 * gridSize + 1)) - gridSize;
    //   const randomR = Math.floor(Math.random() * (2 * gridSize + 1)) - gridSize;
    //   const candidateHex = this.getRandomWalkableHex();
    //   const candidateType = hexTypes.get(candidateHex.toString());

    //   if (
    //     candidateType !== "SEA" &&
    //     candidateType !== "SAND" &&
    //     candidateType !== "DEEP_WOODS"
    //   ) {
    //     if (!hexStart) {
    //       hexStart = candidateHex;
    //     } else if (!hexEnd) {
    //       hexEnd = candidateHex;
    //     }
    //   }
    // }

    const newHexTypes = this.addRoad(hexTypes, hexStart, hexEnd);

    return newHexTypes;
  }
  private generateRandomRoads(
    hexTypes: Map<string, HexType>
  ): Map<string, HexType> {
    let newHexTypes = hexTypes;
    for (let i = 0; i < 8; i++) {
      newHexTypes = this.addRandomRoad(newHexTypes);
    }

    return newHexTypes;
  }
}
