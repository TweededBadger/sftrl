export type SpriteInfo = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export class SpriteManager {
  private spriteSheet: HTMLImageElement | null;
  private spriteInfo: { [key: string]: SpriteInfo };

  constructor(
    spriteSheetSrc: string,
    spriteInfo: { [key: string]: SpriteInfo },
    onLoad?: () => void
  ) {
    this.spriteInfo = spriteInfo;
    this.spriteSheet = null;
    this.loadSpriteSheet(spriteSheetSrc, onLoad);
  }

  private async loadSpriteSheet(
    src: string,
    onLoad?: () => void
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      const image = new Image();
      image.src = src;
      image.onload = () => {
        this.spriteSheet = image;
        resolve();
        if (onLoad) {
          onLoad();
        }
      };
    });
  }

  public drawSprite(
    ctx: CanvasRenderingContext2D,
    spriteKey: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    if (!this.spriteSheet) {
      return;
    }
    const sprite = this.spriteInfo[spriteKey];

    if (!sprite) {
      console.error(`Sprite not found: ${spriteKey}`);
      return;
    }
    ctx.drawImage(
      this.spriteSheet,
      sprite.x,
      sprite.y,
      sprite.width,
      sprite.height,
      x,
      y,
      width,
      height
    );
  }
}
