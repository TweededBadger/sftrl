import { calculateVisibleHexes } from "../utils/hex";
import { iterateGrid, renderHex } from "../utils/hex/drawing";
import { AIPlayer } from "./AIPlayer";
import { Hex, HexType, ItemInfo, movementCosts, SpriteType } from "./Hex";
import { Main } from "./Main";
import { Player } from "./Player";
import { SpriteInfo, SpriteManager } from "./SpriteManager";

export const spriteInfo: Record<SpriteType, SpriteInfo> = {
  HEALTH: { x: 64 * 2, y: 0, width: 64, height: 64 },
  CHEST: { x: 64 * 4, y: 64 * 6, width: 64, height: 64 },
  ROCK: { x: 64 * 1, y: 64 * 2, width: 64, height: 64 },
  SCISSORS: { x: 64 * 4, y: 64 * 3, width: 64, height: 64 },
  CLEAVER: { x: 64 * 1, y: 64 * 3, width: 64, height: 64 },
  SWORD: { x: 64 * 4, y: 64 * 5, width: 64, height: 64 },
  ARMOUR: { x: 64 * 1, y: 64 * 1, width: 64, height: 64 },
  PLAYER: { x: 64 * 0, y: 64 * 8, width: 64, height: 64 },
  ENEMY: { x: 64 * 1, y: 64 * 8, width: 64, height: 64 },
  BASE_TILE: { x: 128 * 2, y: 128 * 1, width: 128, height: 128 },
  DOOR: { x: 128 * 1, y: 128 * 1, width: 128, height: 128 },
  WALL: { x: 128 * 3, y: 128 * 2, width: 128, height: 128 },
  WALL_END: { x: 128 * 3, y: 128 * 2, width: 128, height: 128 },
  WALL_CORNER: { x: 128 * 0, y: 128 * 2, width: 128, height: 128 },
  WALL_CORNER_TIGHT: { x: 128 * 2, y: 128 * 2, width: 128, height: 128 },
  WALL_CORNER_THREE: { x: 128 * 1, y: 128 * 2, width: 128, height: 128 },
  WINDOW: { x: 128 * 0, y: 128 * 3, width: 128, height: 128 },
};

type Point = { x: number; y: number };

export class HexGrid {
  public hexSize: number;
  private viewDistance: number;
  private ctx: CanvasRenderingContext2D;
  // private visibilityMap: Map<string, boolean>;
  // private visibleHexes: Set<string> = new Set();
  private spriteManager: SpriteManager;
  public main: Main;
  public canvas: HTMLCanvasElement;

  constructor(
    main: Main,
    viewDistance: number,
    canvas: HTMLCanvasElement,
    onLoaded: () => void
  ) {
    this.hexSize = 30;
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    // this.visibilityMap = new Map();
    this.viewDistance = viewDistance;
    this.spriteManager = new SpriteManager(
      "images/items_all.png",
      spriteInfo,
      () => {
        onLoaded();
      }
    );
    this.main = main;
  }

  public reset() {
    // this.visibilityMap = new Map();
    // this.visibleHexes = new Set();
  }

  // Add a function to get the greyed out color
  private getGreyedOutColor(color: string): string {
    const greyOutFactor = 0.3;
    const hexColor = color.slice(1);
    const rgb = parseInt(hexColor, 16);
    const r = ((rgb >> 16) & 255) * greyOutFactor;
    const g = ((rgb >> 8) & 255) * greyOutFactor;
    const b = (rgb & 255) * greyOutFactor;

    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }

  public calculateOffset(playerHex: Hex): { offsetX: number; offsetY: number } {
    const playerPixel = playerHex.toPixel(this.hexSize);

    const offsetX = this.canvas.width / 2 - playerPixel.x;
    const offsetY = this.canvas.height / 2 - playerPixel.y;

    return { offsetX, offsetY };
  }

  public renderGrid(
    gridSize: number,
    hexTypes: Map<string, HexType>,
    player: Player,
    items: Map<string, ItemInfo>,
    debug: boolean
  ): void {
    const { offsetX, offsetY } = this.calculateOffset(player.hex);

    for (const hex of iterateGrid(gridSize)) {
      const hexKey = hex.toString();
      const type = hexTypes.get(hexKey) || "WALL";
      const isVisible = this.main.debug.renderWholeMap
        ? true
        : player.visibilityMap.get(hexKey);
      const isWithinViewDistance = this.main.debug.renderWholeMap
        ? true
        : player.hex.distance(hex) <= this.viewDistance &&
          player.visibleHexes.has(hexKey);

      const isOutsideZone = this.main.deathMap.get(hexKey);

      if (isVisible && type) {
        renderHex(
          this.ctx,
          hex,
          offsetX,
          offsetY,
          this.hexSize,
          type,
          !isWithinViewDistance
        );

        // Check if there's an item at the current hex and render it
        const item = items.get(hexKey);
        if (item) {
          this.renderItem(
            hex,
            offsetX,
            offsetY,
            item,
            player,
            this.viewDistance
          );
        }

        // Render debug information if debug is true
        if (debug) {
          this.ctx.fillStyle = "black";
          this.ctx.font = "12px Arial";
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";

          const pixel = hex.toPixel(this.hexSize);
          const text = `${hex.q}, ${hex.r}`;

          this.ctx.fillText(text, pixel.x + offsetX, pixel.y + offsetY);
        }
      }

      if (isOutsideZone) {
        renderHex(
          this.ctx,
          hex,
          offsetX,
          offsetY,
          this.hexSize,
          "DEATH",
          false
        );
      }
    }
  }

  // Inside HexGrid class
  public drawLine(
    fromHex: Hex,
    toHex: Hex,
    referenceHex: Hex,
    color: string,
    lineWidth: number
  ): void {
    const fromPixel = fromHex.toPixel(this.hexSize);
    const toPixel = toHex.toPixel(this.hexSize);
    const offset = this.calculateOffset(referenceHex);

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(fromPixel.x + offset.offsetX, fromPixel.y + offset.offsetY);
    this.ctx.lineTo(toPixel.x + offset.offsetX, toPixel.y + offset.offsetY);
    this.ctx.stroke();
  }

  // Inside HexGrid class
  // Inside HexGrid class
  public highlightHexes(hexes: Hex[], color: string, referenceHex: Hex): void {
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = 0.5; // Adjust the transparency as needed

    for (const hex of hexes) {
      const pixel = hex.toPixel(this.hexSize);
      const { offsetX, offsetY } = this.calculateOffset(referenceHex);

      this.ctx.beginPath();
      this.ctx.arc(
        pixel.x + offsetX,
        pixel.y + offsetY,
        this.hexSize * 0.8, // Adjust the circle size as needed
        0,
        2 * Math.PI
      );
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1; // Reset the transparency
  }

  private renderItem(
    hex: Hex,
    offsetX: number,
    offsetY: number,
    item: ItemInfo,
    player: Player,
    viewDistance: number
  ): void {
    if (
      !player.visibleHexes.has(hex.toString()) &&
      !this.main.debug.renderWholeMap
    )
      return;

    // Check if the hex is within the view distance
    if (
      hex.distance(player.hex) > viewDistance &&
      !this.main.debug.renderWholeMap
    )
      return;

    const ctx = this.ctx;
    const { x, y } = hex.toPixel(this.hexSize);
    const imageSize = this.hexSize * 1.5;

    ctx.save();
    ctx.translate(offsetX, offsetY);

    this.spriteManager.drawSprite(
      ctx,
      item.type,
      x - imageSize / 2,
      y - imageSize / 2,
      imageSize,
      imageSize
    );
    ctx.restore();
  }

  public renderAIPlayer(aiPlayer: AIPlayer, player: Player): void {
    if (
      !this.main.debug.renderWholeMap &&
      !player.visibleHexes?.has(aiPlayer.hex.toString())
    )
      return;

    const { offsetX, offsetY } = this.calculateOffset(player.hex);

    const isWithinViewDistance =
      this.main.debug.renderWholeMap ||
      player.hex.distance(aiPlayer.hex) <= this.viewDistance;

    if (!isWithinViewDistance) return;

    const { x, y } = aiPlayer.hex.toPixel(this.hexSize);
    const centerX = x + offsetX;
    const centerY = y + offsetY;

    // Render the "PLAYER" sprite
    this.spriteManager.drawSprite(
      this.ctx,
      "ENEMY",
      centerX - this.hexSize / 2,
      centerY - this.hexSize / 2,
      this.hexSize,
      this.hexSize
    );

    // Draw health bar
    const healthBarWidth = this.hexSize;
    const healthBarHeight = this.hexSize * 0.2;
    const healthBarX = centerX - healthBarWidth / 2;
    const healthBarY = centerY - this.hexSize / 2 - healthBarHeight - 2;

    // Draw background (black) bar
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    // Draw foreground (green) bar
    const healthPercentage = aiPlayer.health / aiPlayer.maxHealth;
    this.ctx.fillStyle = "green";
    this.ctx.fillRect(
      healthBarX,
      healthBarY,
      healthBarWidth * healthPercentage,
      healthBarHeight
    );

    // Draw a white outline around the health bar
    this.ctx.setLineDash([]);
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(
      healthBarX - 0.5,
      healthBarY - 0.5,
      healthBarWidth + 1,
      healthBarHeight + 1
    );

    const weaponImage = this.main.weaponImages[aiPlayer.currentWeapon];
    if (weaponImage) {
      const weaponIconSize = this.hexSize;
      const weaponIconX = centerX - weaponIconSize / 2;
      const weaponIconY = centerY - this.hexSize - weaponIconSize;
      this.ctx.drawImage(
        weaponImage,
        weaponIconX,
        weaponIconY,
        weaponIconSize,
        weaponIconSize
      );
    }
  }

  public setVisibleHexes = (hexTypes: Map<string, HexType>, player: Player) => {
    player.visibleHexes = calculateVisibleHexes(
      player.hex,
      this.viewDistance,
      hexTypes
    );
  };

  public revealHexes(player: Player): void {
    const hexesToReveal: Hex[] = [player.hex];

    for (let i = 1; i <= this.viewDistance; i++) {
      const newNeighbors = hexesToReveal
        .flatMap((hex) => hex.neighbors())
        .filter((neighbor) => player.hex.distance(neighbor) === i);
      hexesToReveal.push(...newNeighbors);
    }

    for (const hex of hexesToReveal) {
      if (player.visibleHexes.has(hex.toString())) {
        player.visibilityMap.set(hex.toString(), true);
      }
    }
  }

  public renderPlayer(player: Player | AIPlayer, playerHex: Hex): void {
    const { offsetX, offsetY } = this.calculateOffset(playerHex);
    const { x, y } = player.hex.toPixel(this.hexSize);
    const centerX = x + offsetX;
    const centerY = y + offsetY;

    const imageSize = this.hexSize * 1.5;

    // Render the "PLAYER" sprite
    this.spriteManager.drawSprite(
      this.ctx,
      "PLAYER",
      centerX - imageSize / 2,
      centerY - imageSize / 2,
      imageSize,
      imageSize
    );
  }

  private getReachableHexes(
    player: Player | AIPlayer,
    hex: Hex,
    remainingActions: number,
    visited: Set<string> = new Set<string>()
  ): Hex[] {
    if (visited.has(hex.toString())) return [];
    visited.add(hex.toString());

    const neighbors = hex.neighbors();

    const reachableHexes = neighbors.filter((neighbor) => {
      const neighborType = this.main.hexTypes.get(neighbor.toString());
      if (!neighborType) return false;
      const movementCost = movementCosts[neighborType];
      return remainingActions - movementCost >= 0;
    });

    const nextReachableHexes = reachableHexes.flatMap((reachableHex) => {
      const neighborType = this.main.hexTypes.get(reachableHex.toString());
      if (!neighborType) return [];
      const movementCost = movementCosts[neighborType];
      const newVisited = new Set(visited);
      newVisited.add(hex.toString());
      return this.getReachableHexes(
        player,
        reachableHex,
        remainingActions - movementCost,
        newVisited
      );
    });

    return [...reachableHexes, ...nextReachableHexes];
  }

  private getCorners(x: number, y: number): Point[] {
    const corners: Point[] = [];

    for (let i = 0; i < 6; i++) {
      const angleDeg = 60 * i - 30; // Start at 30 degrees
      const angleRad = (Math.PI / 180) * angleDeg;
      const cornerX = x + this.hexSize * Math.cos(angleRad);
      const cornerY = y + this.hexSize * Math.sin(angleRad);
      corners.push({
        x: cornerX,
        y: cornerY,
      });
    }

    return corners;
  }
  public renderReachableArea(
    player: Player | AIPlayer,
    referencePlayer: Player,
    color: string = "red"
  ): void {
    const reachableHexes = player.reachableHexes;
    const boundaryPoints: { x: number; y: number }[] = [];

    this.drawMovementArea(player, referencePlayer, reachableHexes, color);
  }
  public drawMovementArea(
    player: Player,
    referencePlayer: Player,
    reachableHexes: Hex[],
    color: string = "red"
  ): void {
    const { ctx } = this;

    // reset line dash
    ctx.setLineDash([]);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    reachableHexes.forEach((hex) => {
      const { offsetX, offsetY } = this.calculateOffset(referencePlayer.hex);
      const { x, y } = hex.toPixel(this.hexSize);
      const corners = this.getCorners(x + offsetX, y + offsetY);
      const neighbors = hex.neighbors();

      // this.drawHexOutline(hex, offsetX, offsetY);
      neighbors.forEach((neighbor, i) => {
        const isReachableNeighbor = reachableHexes.some((reachableHex) =>
          neighbor.equals(reachableHex)
        );

        if (!isReachableNeighbor) {
          const currentCorner = corners[i];
          const nextCorner = corners[(i + 1) % corners.length];

          ctx.beginPath();
          ctx.moveTo(currentCorner.x, currentCorner.y);
          ctx.lineTo(nextCorner.x, nextCorner.y);
          ctx.stroke();
        }
      });
    });
  }

  public drawZone(
    center: Hex,
    radius: number,
    referencePlayer: Player,
    color: string = "red"
  ): void {
    const { offsetX, offsetY } = this.calculateOffset(referencePlayer.hex);

    const { ctx } = this;
    const zoneHexes = center.cubeRing(radius);

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    zoneHexes.forEach((hex) => {
      const { x, y } = hex.toPixel(this.hexSize);
      const corners = this.getCorners(x + offsetX, y + offsetY);
      const neighbors = hex.neighbors();

      neighbors.forEach((neighbor, i) => {
        const isOutsideZone = center.distance(neighbor) > radius;

        if (isOutsideZone) {
          const currentCorner = corners[i];
          const nextCorner = corners[(i + 1) % corners.length];

          ctx.beginPath();
          ctx.moveTo(currentCorner.x, currentCorner.y);
          ctx.lineTo(nextCorner.x, nextCorner.y);
          ctx.stroke();
        }
      });
    });
  }

  public drawMovableArea(player: Player | AIPlayer): void {
    // const remainingActionPoints = player.actionsPerTurn - player.actionsTaken;

    const movableHexes: Hex[] = player.reachableHexes;

    // Draw a line around the movable hexes
    this.ctx.lineWidth = 3;
    //create a dashed line
    this.ctx.setLineDash([5, 10]);

    this.ctx.strokeStyle = "black";
    for (const hex of movableHexes) {
      const { offsetX, offsetY } = this.calculateOffset(player.hex);
      this.drawHexOutline(hex, offsetX, offsetY);
    }
  }

  // Helper method to draw a hex outline
  private drawHexOutline(hex: Hex, offsetX: number, offsetY: number): void {
    const { x, y } = hex.toPixel(this.hexSize);
    // const offsetX = this.canvas.width / 2;
    // const offsetY = this.canvas.height / 2;

    this.ctx.beginPath();

    this.ctx.strokeStyle = "purple";
    this.ctx.lineWidth = 1;

    for (let i = 0; i <= 6; i++) {
      const angleDeg = 60 * i + 30; // Start at 30 degrees
      const angleRad = (Math.PI / 180) * angleDeg;
      const cornerX = x + offsetX + this.hexSize * Math.cos(angleRad);
      const cornerY = y + offsetY + this.hexSize * Math.sin(angleRad);
      if (i === 0) {
        this.ctx.moveTo(cornerX, cornerY);
      } else {
        this.ctx.lineTo(cornerX, cornerY);
      }
    }
    this.ctx.stroke();
  }

  public clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
