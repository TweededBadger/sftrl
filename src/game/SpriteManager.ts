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
    height: number,
    rotation: number = 0 // in degrees
  ): void {
    if (!this.spriteSheet) {
      return;
    }
    const sprite = this.spriteInfo[spriteKey];

    if (!sprite) {
      console.error(`Sprite not found: ${spriteKey}`);
      return;
    }

    // Save the unrotated context state
    ctx.save();

    // Move the rotation point to the center of the image
    ctx.translate(x + width / 2, y + height / 2);

    // Convert degrees to radians and rotate the canvas to the specified angle
    const rotationInRadians = (rotation * Math.PI) / 180;
    ctx.rotate(rotationInRadians);

    // Draw the image, but offset its position by half its width and height to account for the previous translate
    ctx.drawImage(
      this.spriteSheet,
      sprite.x,
      sprite.y,
      sprite.width,
      sprite.height,
      -width / 2,
      -height / 2,
      width,
      height
    );

    // Restore the unrotated context state
    ctx.restore();
  }
}
