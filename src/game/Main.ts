import { EventEmitter } from "eventemitter3";
import PF, { Grid, Finder } from "pathfinding";

import { HexGrid } from "./HexGrid";
import {
  Action,
  allowStructure,
  Hex,
  HexType,
  itemAmounts,
  ItemInfo,
  ItemType,
  movementCosts,
  hexTypes as hexTypesList,
} from "./Hex";
import { Player } from "./Player";
import { AIPlayer } from "./AIPlayer";
import { Actions } from "./Actions";
import { Combat, CombatState, Weapons } from "./Combat";
import { loadWeaponsIcons } from "../components/WeaponIcon";
import { killPlayer, resolveCombat } from "../utils/combat";
import { HexMap } from "../utils/types";
import {
  findCheapestPath,
  getRandomWalkableHex,
  movePlayerAlongPath,
} from "../utils/routing";
import { generateItems, placeItemAtHex } from "../utils/items";
import {
  determineTargetPosition,
  takeActionIfAvailable,
} from "../utils/aiPlayer";
import { calculateVisibleHexes, populateDeathHexMap } from "../utils/hex";
import { actionCosts, performAction } from "../utils/actions";
import {
  convertToHexMap,
  generateStructures,
  structurePatterns,
} from "../utils/procGen/structureWaveFunction";
import { clearCanvas, drawPath, pixelToHex } from "../utils/hex/drawing";
import { connectAllRooms, generateHexTypesSingle } from "../utils/procGen";
import { SpriteManager } from "./SpriteManager";

const thresholds: Record<number, HexType> = {
  0.4: "SEA",
  // 0.55: "SAND",
  0.55: "GRASS",
  0.65: "WOODS",
  0.7: "DEEP_WOODS",
};

type Debug = {
  showGridCoords: boolean;
  showAIplayertarget: boolean;
  renderWholeMap: boolean;
};

export class Main {
  private gridSize: number;
  public canvas: HTMLCanvasElement;
  public canvas2: HTMLCanvasElement;
  private zoneRadius: number;
  public hexTypes: HexMap = new Map();
  public deathMap: Map<string, boolean> = new Map();
  public zoneCenter: Hex = new Hex(0, 0);
  public items: Map<string, ItemInfo> = new Map();
  public aiPlayers: AIPlayer[] = [];
  private numberOfAIPlayers: number = 30;
  private viewDistance: number = 4;
  private player: Player = new Player(new Hex(0, 0));
  private hexGrid: HexGrid;
  private actions: Actions;
  public spriteManager: SpriteManager;
  public spritesLoaded: boolean = false;
  public currentCombat: Combat | undefined;
  public turnNumber: number = 0;
  public gameState: "NOT_PLAYING" | "PLAYING" | "GAME_OVER" | "NOT_INIT" =
    "NOT_INIT";
  events: EventEmitter;
  public weaponImages: Record<Weapons, HTMLImageElement> = {} as Record<
    Weapons,
    HTMLImageElement
  >;
  public debug: Debug = {
    showGridCoords: false,
    renderWholeMap: false,
    showAIplayertarget: false,
  };

  constructor(canvas: HTMLCanvasElement, canvas2: HTMLCanvasElement) {
    EventEmitter;
    this.gridSize = 30;
    this.zoneRadius = this.gridSize;
    this.canvas = canvas;
    this.canvas2 = canvas2;
    // const structureMap = generateStructures({
    //   gridSize: this.gridSize,
    //   patterns: structurePatterns,
    // });
    // this.hexTypes = convertToHexMap({
    //   structureMap,
    //   patterns: structurePatterns,
    //   gridSize: this.gridSize,
    // });
    // this.deathMap = new Map();
    // // this.hexTypes = generateRandomRoads(8, this.hexTypes, this.gridSize);
    // // this.hexTypes = generateHexTypesOld({ gridSize: this.gridSize, thresholds });

    // // for (let i = 0; i < 10; i++) {
    // //   // const rotation = (Math.floor(Math.random() * 5) + 1) as HexRotation;
    // //   addStructure({
    // //     structure: wall2,
    // //     rotation: 0,
    // //     gridSize: this.gridSize,
    // //     hexTypes: this.hexTypes,
    // //   });
    // // }

    // // this.items  = new Map();
    // this.items = generateItems(this.hexTypes, itemAmounts, this.gridSize);

    // // this.walkableMatrix = this.generateWalkableMatrix(
    // //   this.hexTypes,
    // //   this.gridSize
    // // );

    // this.zoneCenter = getRandomWalkableHex(this.hexTypes, this.gridSize);

    // const playerStartPosition = getRandomWalkableHex(
    //   this.hexTypes,
    //   this.gridSize
    // );

    // const player = new Player(playerStartPosition);
    // this.player = player;

    // for (let i = 0; i < this.numberOfAIPlayers; i++) {
    //   let startPosition: Hex;
    //   let validPosition: boolean;

    //   let count = 0;

    //   do {
    //     startPosition = getRandomWalkableHex(this.hexTypes, this.gridSize);
    //     validPosition = true;

    //     for (const aiPlayer of [this.player, ...this.aiPlayers]) {
    //       const distance = startPosition.distance(aiPlayer.hex);
    //       if (distance <= 3) {
    //         validPosition = false;
    //         break;
    //       }
    //     }
    //     count += 1;
    //     if (count > 100) {
    //       console.log("Could not find valid position for AI player");
    //       break;
    //     }
    //   } while (!validPosition);

    //   this.aiPlayers.push(
    //     new AIPlayer(startPosition, startPosition, this.viewDistance)
    //   );
    // }

    this.events = new EventEmitter();

    this.hexGrid = new HexGrid(this, this.viewDistance, this.canvas, () => {
      this.render();
      this.spritesLoaded = true;
    });
    this.spriteManager = this.hexGrid.spriteManager;
    this.actions = new Actions(this);
    // this.getIconImages();
  }

  async getIconImages() {
    // this.weaponImages = ((await loadWeaponsIcons()) as unknown) as Record<
    //   Weapons,
    //   HTMLImageElement
    // >;
  }

  public reset() {
    // Reset hex types, items, and AI players
    // this.hexTypes = generateHexTypes({ gridSize: this.gridSize, thresholds });
    // this.hexTypes = generateRandomRoads(8, this.hexTypes, this.gridSize);
    // this.items = generateItems(this.hexTypes, itemAmounts, this.gridSize);
    this.aiPlayers = [];
    this.zoneRadius = this.gridSize;
    // const structureMap = generateStructures({
    //   gridSize: this.gridSize,
    //   patterns: structurePatterns,
    // });
    // this.hexTypes = convertToHexMap({
    //   structureMap,
    //   patterns: structurePatterns,
    //   gridSize: this.gridSize,
    // });

    const newHexMap = generateHexTypesSingle({
      gridSize: this.gridSize,
    });
    this.hexTypes = connectAllRooms(newHexMap, this.gridSize);
    this.deathMap = new Map();
    this.items = generateItems(this.hexTypes, itemAmounts, this.gridSize);

    this.zoneCenter = getRandomWalkableHex(this.hexTypes, this.gridSize);

    const playerStartPosition = getRandomWalkableHex(
      this.hexTypes,
      this.gridSize
    );

    const player = new Player(playerStartPosition);
    this.player = player;

    for (let i = 0; i < this.numberOfAIPlayers; i++) {
      let startPosition: Hex;
      let validPosition: boolean;

      let count = 0;

      do {
        startPosition = getRandomWalkableHex(this.hexTypes, this.gridSize);
        validPosition = true;

        for (const aiPlayer of [this.player, ...this.aiPlayers]) {
          const distance = startPosition.distance(aiPlayer.hex);
          if (distance <= 3) {
            validPosition = false;
            break;
          }
        }
        count += 1;
        if (count > 100) {
          console.log("Could not find valid position for AI player");
          break;
        }
      } while (!validPosition);

      this.aiPlayers.push(
        new AIPlayer(startPosition, startPosition, this.viewDistance)
      );
    }

    // Reset any ongoing combat
    this.currentCombat = undefined;

    // Update hexGrid and render
    this.hexGrid.reset();

    this.gameState = "PLAYING";
    this.turnNumber = 0;

    this.update();

    this.render();

    // Emit the new state
    this.emitCurrentState();
  }

  public nextCombatStep(): CombatState | undefined {
    if (!this.currentCombat) {
      throw new Error("No combat in progress");
    }

    if (this.currentCombat.combatOver) {
      const killList = resolveCombat(this.currentCombat);
      killList.forEach((player) => {
        this.killPlayer(player);
      });

      // End the combat
      this.currentCombat = undefined;

      if (this.player.health <= 0) {
        this.gameState = "GAME_OVER";
      }
      this.emitCurrentState();
      this.render();
      return;
    }

    const combatState = this.currentCombat.simulateCombatStep();
    this.emitCurrentState();

    return combatState;
  }

  public killPlayer(playerToRemove: Player) {
    if (playerToRemove.currentWeapon !== "FIST")
      placeItemAtHex(
        playerToRemove.hex,
        playerToRemove.currentWeapon,
        this.hexTypes,
        this.items
      );

    this.aiPlayers = killPlayer(playerToRemove, this.aiPlayers);

    // // Find the index of the playerToRemove in the aiPlayers array
    // const playerIndex = this.aiPlayers.findIndex(
    //   (player) => player === playerToRemove
    // );

    // // Remove the player from the aiPlayers array if found
    // if (playerIndex !== -1) {
    //   this.aiPlayers.splice(playerIndex, 1);
    // } else {
    //   console.warn("Player not found in aiPlayers array");
    // }
  }

  // private findSuitableLocation(structure: StructureDefinition): Hex | null {
  //   const { dimensions } = structure;
  //   const maxTries = 100;
  //   let tries = 0;

  //   while (tries < maxTries) {
  //     tries++;
  //     const offsetX = Math.floor(
  //       Math.random() * (this.gridSize - dimensions.q)
  //     );
  //     const offsetY = Math.floor(
  //       Math.random() * (this.gridSize - dimensions.r)
  //     );

  //     let isSuitable = true;

  //     for (let q = 0; q < dimensions.q; q++) {
  //       for (let r = 0; r < dimensions.r; r++) {
  //         const hex = new Hex(q + offsetX, r + offsetY);
  //         const hexType = this.hexTypes.get(hex.toString());

  //         if (!hexType || !allowStructure.includes(hexType)) {
  //           isSuitable = false;
  //           break;
  //         }
  //       }
  //       if (!isSuitable) break;
  //     }

  //     if (isSuitable) {
  //       return new Hex(offsetX, offsetY);
  //     }
  //   }

  //   return null;
  // }

  // public addStructure(
  //   structure: StructureDefinition,
  //   rotation: HexRotation = 0
  // ): boolean {
  //   const location = this.findSuitableLocation(structure);

  //   if (!location) {
  //     console.warn("No suitable location found for the structure");
  //     return false;
  //   }

  //   for (const element of structure.elements) {
  //     const rotatedElement = Structure.rotateElement(
  //       element,
  //       rotation,
  //       structure.center
  //     );
  //     const hex = new Hex(
  //       location.q + rotatedElement.position.q,
  //       location.r + rotatedElement.position.r
  //     );
  //     this.hexTypes.set(hex.toString(), rotatedElement.type);
  //   }

  //   return true;
  // }

  public emitCurrentState(): void {
    console.log("emitCurrentState");
    this.events.emit("currentState", {
      numAlivePlayers: this.numAlivePlayers,
      numPlayers: this.numPlayer,
      turnNumber: this.turnNumber,
      actionsLeft: this.player.actionsPerTurn - this.player.actionsTaken,
      playerHealth: this.player.health,
      player: this.player,
      currentCombat: this.currentCombat,
      gameState: this.gameState,
    });
  }

  // Calculate the s-coordinate (derived from q and r)
  public get numPlayer(): number {
    return this.aiPlayers.length;
  }

  public get numAlivePlayers(): number {
    return this.aiPlayers.filter((player) => player.alive).length;
  }

  // private generateItems(hexTypes: Map<string, HexType>): Map<string, ItemInfo> {
  //   const items: Map<string, ItemInfo> = new Map();

  //   const addItem = (type: ItemType) => {
  //     let hex: Hex;
  //     let isSuitable: boolean;
  //     do {
  //       hex = this.getRandomWalkableHex();
  //       const hexType = hexTypes.get(hex.toString());
  //       const isNearOtherItems = Array.from(items.keys())
  //         .map((key) => Hex.hexFromString(key))
  //         .some((itemHex) => itemHex.distance(hex) <= 4);

  //       isSuitable =
  //         (hexType === "GRASS" || hexType === "ROAD") && !isNearOtherItems;
  //     } while (!isSuitable);

  //     const itemInfo: ItemInfo = {
  //       type,
  //     };
  //     if (type === "HEALTH") {
  //       itemInfo.amount = 100;
  //     }
  //     if (type === "ARMOUR") {
  //       itemInfo.amount = 10;
  //     }

  //     items.set(hex.toString(), itemInfo);
  //   };

  //   for (const itemType in itemAmounts) {
  //     const amount = itemAmounts[itemType as ItemType];
  //     for (let i = 0; i < amount; i++) {
  //       addItem(itemType as ItemType);
  //     }
  //   }

  //   return items;
  // }

  // private generateWalkableMatrix(
  //   hexTypes: Map<string, HexType>,
  //   gridSize: number
  // ): number[][] {
  //   const matrixSize = 2 * gridSize + 1;
  //   const matrix = Array.from({ length: matrixSize }, () =>
  //     new Array(matrixSize).fill(0)
  //   );

  //   hexTypes.forEach((hexType, hexKey) => {
  //     const hex = Hex.hexFromString(hexKey);
  //     const [x, y] = this.hexToMatrix(hex);
  //     matrix[y][x] = hexType === "SEA" ? 1 : 0;
  //   });

  //   return matrix;
  // }

  private update(): void {
    this.hexGrid.setVisibleHexes(this.hexTypes, this.player);
    this.hexGrid.revealHexes(this.player);
    this.deathMap = populateDeathHexMap(
      this.zoneCenter,
      this.zoneRadius,
      this.gridSize
    );
    // this.resolveAIPlayerCombat();

    this.player.updateAvailableActions(this.items, this.aiPlayers);
    this.player.setReachableHexes(this.hexTypes, this.deathMap);

    for (const aiPlayer of this.aiPlayers) {
      this.hexGrid.setVisibleHexes(this.hexTypes, aiPlayer);
      this.hexGrid.revealHexes(aiPlayer);
      aiPlayer.setReachableHexes(this.hexTypes, this.deathMap);

      if (this.deathMap.get(aiPlayer.hex.toString())) {
        aiPlayer.health = aiPlayer.health - 5;
      }
      if (aiPlayer.health <= 0) {
        this.killPlayer(aiPlayer);
      }
    }

    this.emitCurrentState();
  }

  public zoomIn(): void {
    this.hexGrid.hexSize = this.hexGrid.hexSize + 5;
    this.render();
  }

  public zoomOut(): void {
    this.hexGrid.hexSize = this.hexGrid.hexSize - 5;
    if (this.hexGrid.hexSize < 5) {
      this.hexGrid.hexSize = 5;
    }
    this.render();
  }

  public render(): void {
    this.hexGrid.clearCanvas();

    this.hexGrid.renderGrid(
      this.gridSize,
      this.hexTypes,
      this.player,
      this.items,
      this.debug.showGridCoords
    );

    this.hexGrid.renderReachableArea(this.player, this.player);
    this.hexGrid.renderPlayer(this.player, this.player.hex);
    for (const aiPlayer of this.aiPlayers) {
      this.hexGrid.renderAIPlayer(aiPlayer, this.player);
    }

    this.hexGrid.drawZone(this.zoneCenter, this.zoneRadius, this.player);
    // this.hexGrid.drawMovableArea(this.player);

    // for (const player of this.aiPlayers) {
    //   const playerHex = this.hexTypes.get(player.hex.toString());
    //   if (playerHex) {
    //     this.hexGrid.drawMovableArea(player);
    //   }
    // }

    this.drawDebugInfo();
  }

  // Inside Main class
  public drawDebugInfo(): void {
    const color = "red";
    const lineWidth = 2;

    if (this.debug.showAIplayertarget) {
      this.aiPlayers.forEach((player) => {
        if (player.alive) {
          this.hexGrid.drawLine(
            player.hex,
            player.targetHex,
            this.player.hex,
            player.color,
            lineWidth
          );
          //   this.hexGrid.renderReachableArea(player, this.player, player.color);
          //   // Highlight the visibilityMap for each AI player
          //   const visibleHexes = Array.from(
          //     player.visibilityMap.keys()
          //   ).map((key) => Hex.hexFromString(key));

          //   this.hexGrid.highlightHexes(
          //     visibleHexes,
          //     player.color,
          //     this.player.hex
          //   );
        }
      });
    }
  }

  private resolveAIPlayerCombat(): void {
    const alivePlayers = this.aiPlayers.filter((player) => player.alive);

    for (let i = 0; i < alivePlayers.length; i++) {
      for (let j = i + 1; j < alivePlayers.length; j++) {
        const player1 = alivePlayers[i];
        const player2 = alivePlayers[j];

        if (player1.hex.distance(player2.hex) === 1) {
          const combat = new Combat([player1, player2]);
          combat.simulateCombat();
          combat.resolveCombat();

          if (player1.health <= 0) {
            this.killPlayer(player1);
          }
          if (player2.health <= 0) {
            this.killPlayer(player2);
          }
        }
      }
    }
  }
  public endTurn(): void {
    this.turnNumber++;
    this.player.actionsTaken = 0;
    this.emitCurrentState();
  }

  runEndOfTurnWork(): void {
    this.turnNumber++;
    for (const aiPlayer of this.aiPlayers) {
      // aiPlayer.setReachableHexes(this.hexTypes);
      this.performAiPlayerActions(aiPlayer);
      aiPlayer.actionsTaken = 0;
    }

    if (this.deathMap.get(this.player.hex.toString())) {
      this.player.health = this.player.health - 5;
    }

    this.checkIfPlayerIsDead();

    if (this.zoneRadius > 2 && this.turnNumber % 2 === 0)
      this.zoneRadius = this.zoneRadius - 1;
  }

  checkIfPlayerIsDead(): void {
    if (this.player.health <= 0) {
      this.gameState = "GAME_OVER";

      this.emitCurrentState();
      this.render();
    }
  }

  public performAction(action: Action): void {
    const actionOutcome = performAction(
      action,
      this.player,
      this.items,
      this.aiPlayers
    );

    if (actionOutcome?.combat) this.currentCombat = actionOutcome.combat;

    // this.player.updateAvailableActions(this.items, this.aiPlayers);

    // this.render();
    // this.emitCurrentState();

    // this.resolveAIPlayerCombat();

    if (action === "END_TURN") {
      this.runEndOfTurnWork();
    }

    this.update();

    this.emitCurrentState();
    this.render();
  }

  // private getPlayerHexInViewDistance(player: AIPlayer): Hex | null {
  //   const alivePlayers = this.aiPlayers.filter((player) => player.alive);
  //   const players = [this.player, ...alivePlayers];
  //   let closestPlayerHex: Hex | null = null;
  //   let minDistance = Infinity;

  //   // Calculate visible hexes for the given player
  //   const visibleHexes = this.hexGrid.calculateVisibleHexes(
  //     player.hex,
  //     this.viewDistance,
  //     this.hexTypes
  //   );

  //   for (const otherPlayer of players) {
  //     const distance = player.hex.distance(otherPlayer.hex);
  //     // Check if the other player's hex is within the set of visible hexes
  //     if (
  //       distance <= this.viewDistance &&
  //       distance < minDistance &&
  //       otherPlayer.id !== player.id &&
  //       visibleHexes.has(otherPlayer.hex.toString())
  //     ) {
  //       minDistance = distance;
  //       closestPlayerHex = otherPlayer.hex;
  //     }
  //   }

  //   return closestPlayerHex;
  // }

  private hasTargetChanged(player: AIPlayer, newTarget: Hex): boolean {
    return !player.targetHex.equals(newTarget);
  }

  private performAiPlayerActions(player: AIPlayer): void {
    if (!player.alive) return;

    player.visibleHexes = calculateVisibleHexes(
      player.hex,
      this.viewDistance,
      this.hexTypes
    );

    while (player.actionsTaken < player.actionsPerTurn) {
      player.updateAvailableActions(this.items, [
        this.player,
        ...this.aiPlayers,
      ]);

      // Perform action with takeActionIfAvailable
      const actionTaken = takeActionIfAvailable(player, this.items);

      // Perform an ATTACK action and resolve the resulting combat
      if (
        player.availableActions.includes("ATTACK") &&
        player.actionsTaken + actionCosts["ATTACK"] <= player.actionsPerTurn
      ) {
        if (player.hex.distance(this.player.hex) === 1) {
          const actionOutcome = performAction(
            "ATTACK",
            this.player,
            this.items,
            this.aiPlayers
          );

          if (actionOutcome?.combat) {
            this.currentCombat = actionOutcome.combat;

            player.actionsTaken = player.actionsPerTurn;
          }
        } else {
          const combatResult = performAction(
            "ATTACK",
            player,
            this.items,
            this.aiPlayers
          );
          if (combatResult && combatResult.combat) {
            combatResult.combat.simulateCombat();
            const killList = resolveCombat(combatResult.combat);
            killList.forEach((player) => {
              this.killPlayer(player);
            });
          }
          player.actionsTaken += actionCosts["ATTACK"];
        }
      } else {
        const newTargetPosition = determineTargetPosition({
          player: player,
          aiPlayers: [this.player, ...this.aiPlayers],
          viewDistance: this.viewDistance,
          hexTypes: this.hexTypes,
          hexGrid: this.hexGrid,
          gridSize: this.gridSize,
          items: this.items,
          deathMap: this.deathMap,
          // getRandomWalkableHexTowardsLeastExploredArea: someFunction,
        });

        if (this.hasTargetChanged(player, newTargetPosition)) {
          const avoidHexes = new Map<string, boolean>();
          // this.aiPlayers.forEach((player) => {
          //   avoidHexes.set(player.hex.toString(), true);
          // });

          const { path, totalCost } = findCheapestPath({
            start: player.hex,
            target: newTargetPosition,
            hexTypes: this.hexTypes,
            avoidHexes,
          });
          const pathWithoutFirst = path.slice(1);
          player.currentPath = pathWithoutFirst;
          player.targetHex = newTargetPosition;

          if (totalCost > 10000) {
            player.currentPath = null;
            player.targetHex = player.hex;
          }
        }

        if (player.currentPath && player.currentPath.length > 0) {
          // Move 1 space along the currentPath
          const newPath = movePlayerAlongPath(
            {
              player: player,
              path: player.currentPath,
              hexTypes: this.hexTypes,
              aiPlayers: this.aiPlayers,
              mainPlayer: this.player,
            },
            1 // maxStepsTaken set to 1
          );
          if (newPath.length === player.currentPath.length) break;
          player.currentPath = newPath;
        } else {
          break;
        }
      }
    }

    // Reset the actionsTaken for the next turn
    player.actionsTaken = 0;
  }

  // private determineTargetPosition(player: AIPlayer): Hex {
  //   let targetPosition = player.targetHex;

  //   // Check if the player has reached their target or the target is unreachable
  //   const targetHexType = this.hexTypes.get(targetPosition.toString());
  //   const isTargetReached = player.hex.equals(targetPosition);
  //   const isTargetUnreachable = !targetHexType;
  //   const visiblePlayerHex = getPlayerHexInViewDistance({
  //     player: player,
  //     players: this.aiPlayers,
  //     viewDistance: this.viewDistance,
  //     hexTypes: this.hexTypes,
  //     hexGrid: this.hexGrid,
  //   });

  //   if (isTargetReached || isTargetUnreachable || visiblePlayerHex) {
  //     if (visiblePlayerHex) {
  //       player.lastSeenPlayer = visiblePlayerHex;
  //       targetPosition = visiblePlayerHex;
  //     } else if (player.lastSeenPlayer) {
  //       if (player.hex.equals(player.lastSeenPlayer)) {
  //         player.lastSeenPlayer = undefined;
  //       } else {
  //         targetPosition = player.lastSeenPlayer;
  //       }
  //     } else {
  //       targetPosition = this.getRandomWalkableHexTowardsLeastExploredArea(
  //         player,
  //         player.hex
  //       );
  //     }
  //   }

  //   return targetPosition;
  // }

  // private movePlayerAlongPath(player: AIPlayer, path: Hex[]): Hex[] {
  //   const isNextHexOccupied = (nextHex: Hex) => {
  //     return (
  //       this.aiPlayers.some(
  //         (otherPlayer) =>
  //           otherPlayer !== player && otherPlayer.hex.equals(nextHex)
  //       ) || player.hex.equals(this.player.hex)
  //     );
  //   };

  //   let stepsTaken = 0;
  //   let actionsTaken = player.actionsTaken;

  //   for (const nextHex of path) {
  //     const nextHexType = this.hexTypes.get(nextHex.toString());
  //     if (!nextHexType) break;
  //     const nextHexCost = movementCosts[nextHexType];

  //     if (
  //       player.actionsPerTurn - actionsTaken < nextHexCost ||
  //       isNextHexOccupied(nextHex)
  //     ) {
  //       break;
  //     }

  //     player.hex = nextHex;
  //     stepsTaken++;
  //     actionsTaken = actionsTaken + nextHexCost;
  //   }

  //   player.actionsTaken = actionsTaken;
  //   return path.slice(stepsTaken);
  // }

  public start(): void {
    this.turnNumber = 0;

    this.hexGrid.canvas.addEventListener("click", (event) => {
      this.handleClick(event);
    });

    // add mousemove event listener to the canvas
    this.hexGrid.canvas.addEventListener("mousemove", (event) => {
      this.handleMouseMove(event);
    });

    window.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        this.performAction("END_TURN");
      }
    });

    // zoom in when the mouse wheel is used
    this.hexGrid.canvas.addEventListener("wheel", (event) => {
      event.preventDefault();

      if (event.deltaY < 0) {
        this.zoomIn();
      }
      if (event.deltaY > 0) {
        this.zoomOut();
      }
    });

    // this.reset();

    this.update();

    this.render();
    this.gameState = "NOT_PLAYING";
    setTimeout(() => {
      this.emitCurrentState();
    }, 100);
  }

  // private getRandomWalkableHexInViewDistance(
  //   startPosition: Hex,
  //   viewDistance: number
  // ): Hex {
  //   let targetPosition: Hex = startPosition;
  //   let isValidTarget: boolean;
  //   let attempts = 0;

  //   do {
  //     const randomDirectionIndex = Math.floor(
  //       Math.random() * hexDirections.length
  //     );
  //     const randomDirection = hexDirections[randomDirectionIndex];
  //     const randomDistance = Math.floor(Math.random() * viewDistance) + 1;
  //     targetPosition = new Hex(
  //       startPosition.q + randomDirection[0] * randomDistance,
  //       startPosition.r + randomDirection[1] * randomDistance
  //     );
  //     const candidateType = this.hexTypes.get(targetPosition.toString());
  //     isValidTarget = !!candidateType && movementCosts[candidateType] < 4;

  //     attempts++;
  //     if (attempts >= 100) {
  //       console.warn("Could not find a valid target hex within view distance.");
  //       return startPosition;
  //     }
  //   } while (!isValidTarget);

  //   return targetPosition;
  // }

  // private getRandomWalkableHexTowardsLeastExploredArea(
  //   player: AIPlayer,
  //   startPosition: Hex
  // ): Hex {
  //   let leastExploredAreaDirection: Hex | null = null;
  //   let maxUnexploredCount = 0;
  //   const explorationRadius = 15;
  //   const maxSearchDistance = 30;

  //   for (const hex of this.hexGrid.iterateGrid(this.gridSize)) {
  //     let unexploredCount = 0;
  //     for (const neighbor of hex.neighborsWithinRadius(explorationRadius)) {
  //       if (!player.visibilityMap.get(neighbor.toString())) {
  //         unexploredCount++;
  //       }
  //     }

  //     if (unexploredCount > maxUnexploredCount) {
  //       maxUnexploredCount = unexploredCount;
  //       leastExploredAreaDirection = hex;
  //     }
  //   }

  //   if (leastExploredAreaDirection) {
  //     const direction = leastExploredAreaDirection
  //       .subtract(startPosition)
  //       .normalize();

  //     let targetPosition = startPosition;
  //     for (let i = 1; i <= maxSearchDistance; i++) {
  //       const candidateHex = startPosition.add(direction.scale(i)).round();
  //       const candidateType = this.hexTypes.get(candidateHex.toString());
  //       const isValidTarget =
  //         !!candidateType && movementCosts[candidateType] < 4;

  //       if (
  //         isValidTarget &&
  //         !player.visibilityMap.get(candidateHex.toString())
  //       ) {
  //         targetPosition = candidateHex;
  //         break;
  //       }
  //     }

  //     if (targetPosition.equals(player.hex)) {
  //       return this.getRandomWalkableHexInViewDistance(startPosition, 10);
  //     }

  //     return targetPosition;
  //   } else {
  //     // If no unexplored area is found, fallback to the original method
  //     return this.getRandomWalkableHexInViewDistance(startPosition, 10);
  //   }
  // }

  // private getRandomWalkableHex(): Hex {
  //   let randomHex: Hex | null = null;

  //   while (!randomHex) {
  //     const randomQ =
  //       Math.floor(Math.random() * (2 * this.gridSize + 1)) - this.gridSize;
  //     const randomR =
  //       Math.floor(Math.random() * (2 * this.gridSize + 1)) - this.gridSize;
  //     const candidateHex = new Hex(randomQ, randomR);
  //     const candidateType = this.hexTypes.get(candidateHex.toString());

  //     if (!!candidateType && movementCosts[candidateType] <= 2) {
  //       randomHex = candidateHex;
  //     }
  //   }

  //   return randomHex;
  // }

  private handleMouseMove(event: MouseEvent): void {
    const rect = this.hexGrid.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const { offsetX, offsetY } = this.hexGrid.calculateOffset(this.player.hex);
    const hex = pixelToHex(x - offsetX, y - offsetY, this.hexGrid.hexSize);

    console.log(hex.toString());

    const reachable = this.player.reachableHexes.some((reachableHex) =>
      reachableHex.equals(hex)
    );

    if (reachable) {
      // Calculate the shortest path and its total movement cost
      const { path, totalCost } = findCheapestPath({
        start: this.player.hex,
        target: hex,
        hexTypes: this.hexTypes,
      });

      if (totalCost > 0) {
        drawPath(
          path,
          this.canvas2.getContext("2d") as CanvasRenderingContext2D,
          this.hexGrid.hexSize,
          offsetX,
          offsetY,
          "white",
          5,
          totalCost
        );
        return;
      }
    }
    clearCanvas(this.canvas2);
  }

  private handleClick(event: MouseEvent): void {
    const rect = this.hexGrid.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const { offsetX, offsetY } = this.hexGrid.calculateOffset(this.player.hex);
    const hex = pixelToHex(x - offsetX, y - offsetY, this.hexGrid.hexSize);

    const hexKey = hex.toString();
    const type = this.hexTypes.get(hexKey);

    if (!type) return;

    const reachable = this.player.reachableHexes.some((reachableHex) =>
      reachableHex.equals(hex)
    );

    if (reachable) {
      // Calculate the shortest path and its total movement cost
      const { path, totalCost } = findCheapestPath({
        start: this.player.hex,
        target: hex,
        hexTypes: this.hexTypes,
      });

      if (path && totalCost) {
        this.player.moveTo(path, totalCost);

        this.update();
        this.render();
      }
    }
  }

  // public findCheapestPath(
  //   start: Hex,
  //   target: Hex
  // ): { path: Hex[]; totalCost: number } {
  //   const frontier = new PriorityQueue<{ hex: Hex; cost: number }>(
  //     (a, b) => a.cost < b.cost
  //   );
  //   frontier.enqueue({ hex: start, cost: 0 }, 0);

  //   const cameFrom = new Map<string, Hex>();
  //   const costSoFar = new Map<string, number>();
  //   cameFrom.set(start.toString(), start);
  //   costSoFar.set(start.toString(), 0);

  //   while (!frontier.isEmpty()) {
  //     const { hex: current } = frontier.dequeue()!;

  //     if (current.equals(target)) {
  //       const path = this.reconstructPath(cameFrom, current);
  //       const totalCost = costSoFar.get(current.toString())!;
  //       return { path, totalCost };
  //     }

  //     for (const neighbor of current.neighbors()) {
  //       const newCost =
  //         costSoFar.get(current.toString())! +
  //         movementCosts[this.hexTypes.get(neighbor.toString())!];
  //       if (
  //         !costSoFar.has(neighbor.toString()) ||
  //         newCost < costSoFar.get(neighbor.toString())!
  //       ) {
  //         costSoFar.set(neighbor.toString(), newCost);
  //         cameFrom.set(neighbor.toString(), current);
  //         frontier.enqueue({ hex: neighbor, cost: newCost }, newCost);
  //       }
  //     }
  //   }

  //   return { path: [], totalCost: 0 }; // Return an empty path and cost of 0 if no path is found
  // }

  // /**
  //  * Reconstructs the path from the start Hex to the target Hex using the 'cameFrom' map.
  //  *
  //  * @param cameFrom - A map of Hex keys to the Hex from which they were reached
  //  * @param current - The target Hex
  //  * @returns An array of Hexes representing the path from the start Hex to the target Hex
  //  */
  // private reconstructPath(cameFrom: Map<string, Hex>, current: Hex): Hex[] {
  //   const path = [current];

  //   let count = 0;

  //   // Iterate through the cameFrom map to reconstruct the path
  //   while (cameFrom.has(current.toString())) {
  //     count++;
  //     if (count > 100) {
  //       console.warn("reconstructPath loops 100 times");
  //       break;
  //     }

  //     current = cameFrom.get(current.toString())!;
  //     path.unshift(current); // Add the current Hex to the beginning of the path

  //     // Terminate the loop if the same Hex is encountered twice to prevent infinite looping
  //     if (cameFrom.get(current.toString())?.equals(current)) {
  //       break;
  //     }
  //   }

  //   return path;
  // }

  // private getHexTypeFromNoise(noiseValue: number): HexType {
  //   const sortedThresholds = Object.keys(thresholds)
  //     .map(parseFloat)
  //     .sort((a, b) => a - b);

  //   for (let i = 0; i < sortedThresholds.length; i++) {
  //     const threshold = sortedThresholds[i];
  //     if (noiseValue < threshold) {
  //       return thresholds[threshold];
  //     }
  //   }

  //   return thresholds[sortedThresholds[sortedThresholds.length - 1]];
  // }

  // // Convert axial coordinates to cube coordinates
  // private axialToCube(hex: Hex): { x: number; y: number; z: number } {
  //   const x = hex.q;
  //   const z = hex.r;
  //   const y = -x - z;
  //   return { x, y, z };
  // }

  // private generateHexTypes(gridSize: number): Map<string, HexType> {
  //   const smallSquareGrid = new VectorNoiseGenerator(10);
  //   const scaleFactor = 10;

  //   const hexTypes = new Map<string, HexType>();

  //   for (let q = -gridSize; q <= gridSize; q++) {
  //     for (
  //       let r = Math.max(-gridSize, -q - gridSize);
  //       r <= Math.min(gridSize, -q + gridSize);
  //       r++
  //     ) {
  //       const hex = new Hex(q, r);
  //       const cube = axialToCube(hex);
  //       const x = Math.round(cube.x + gridSize);
  //       const y = Math.round(cube.y + gridSize);
  //       const noiseValue = smallSquareGrid.getPixel(
  //         x / scaleFactor,
  //         y / scaleFactor
  //       );
  //       // const noiseValue = 0;
  //       const hexType = getHexTypeFromNoise({noiseValue, thresholds});
  //       const hexKey = hex.toString();
  //       hexTypes.set(hexKey, hexType);
  //     }
  //   }

  //   return hexTypes;
  // }

  // private hexToMatrix(hex: Hex): [number, number] {
  //   const gridSize = this.gridSize;
  //   const x = hex.q + gridSize;
  //   const y = hex.r + gridSize;
  //   return [x, y];
  // }

  // private matrixToHex(x: number, y: number): Hex {
  //   const gridSize = this.gridSize;
  //   const q = x - gridSize;
  //   const r = y - gridSize;
  //   return new Hex(q, r);
  // }

  // private addRoad(
  //   hexTypes: Map<string, HexType>,
  //   hexStart: Hex,
  //   hexEnd: Hex
  // ): Map<string, HexType> {
  //   const matrixSize = 2 * this.gridSize + 1;

  //   const grid = new PF.Grid(matrixSize, matrixSize);

  //   hexTypes.forEach((hexType, hexKey) => {
  //     const hex = Hex.hexFromString(hexKey);
  //     const [x, y] = this.hexToMatrix(hex);
  //     if (
  //       hexType === "SEA" ||
  //       hexType === "SAND" ||
  //       hexType === "DEEP_WOODS" ||
  //       hexType === "ROAD"
  //     )
  //       grid.setWalkableAt(x, y, false);
  //   });

  //   const finder = new PF.AStarFinder();
  //   const [startX, startY] = this.hexToMatrix(hexStart);
  //   const [endX, endY] = this.hexToMatrix(hexEnd);
  //   const path = finder.findPath(startX, startY, endX, endY, grid);

  //   path.forEach(([x, y]) => {
  //     const hex = this.matrixToHex(x, y);
  //     hexTypes.set(hex.toString(), "ROAD");
  //   });

  //   return hexTypes;
  // }

  // private addRandomRoad(hexTypes: Map<string, HexType>): Map<string, HexType> {

  //   let hexStart = getRandomWalkableHex(this.hexTypes, this.gridSize);
  //   let hexEnd = getRandomWalkableHex(this.hexTypes, this.gridSize);

  //   const newHexTypes = addRoad(hexTypes, hexStart, hexEnd);

  //   return newHexTypes;
  // }
  // private generateRandomRoads(
  //   hexTypes: Map<string, HexType>
  // ): Map<string, HexType> {
  //   let newHexTypes = hexTypes;
  //   for (let i = 0; i < 8; i++) {
  //     newHexTypes = this.addRandomRoad(newHexTypes);
  //   }

  //   return newHexTypes;
  // }
}
