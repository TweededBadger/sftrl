export type SpriteInfo = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type SpriteSheetInfo = {
  sheetId: string;
  src: string;
  spriteInfo: { [key: string]: SpriteInfo };
};

export class SpriteManager {
  private spriteSheets: Map<string, HTMLImageElement>;
  private spriteInfo: Map<string, SpriteInfo>;

  constructor(spriteSheetInfos: SpriteSheetInfo[], onLoad?: () => void) {
    this.spriteSheets = new Map();
    this.spriteInfo = new Map();

    const loadPromises = spriteSheetInfos.map((info) =>
      this.loadSpriteSheet(info.sheetId, info.src, info.spriteInfo)
    );

    Promise.all(loadPromises).then(() => {
      if (onLoad) {
        onLoad();
      }
    });
  }

  private async loadSpriteSheet(
    sheetId: string,
    src: string,
    spriteInfo: { [key: string]: SpriteInfo }
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      const image = new Image();
      image.src = src;
      image.onload = () => {
        this.spriteSheets.set(sheetId, image);
        Object.entries(spriteInfo).forEach(([key, info]) => {
          this.spriteInfo.set(key, info);
        });
        resolve();
      };
    });
  }

  public drawSprite(
    ctx: CanvasRenderingContext2D,
    sheetId: string, // optional, used to specify the sprite sheet
    spriteKey: string,
    x: number,
    y: number,
    width: number,
    height: number,
    rotation: number = 0, // in degrees
    desaturationAmount: number = 0 // between 0 and 1
  ): void {
    const sprite = this.spriteInfo.get(spriteKey);

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

    const spriteSheet = this.spriteSheets.get(sheetId); // default to the first sprite sheet

    if (!spriteSheet) {
      console.error(`Sprite sheet not found: ${sheetId}`);
      return;
    }

    // If desaturation is enabled, draw the image to a temporary canvas and manipulate the pixel data
    if (desaturationAmount > 0 && false) {
      // const tempCanvas = document.createElement("canvas");
      // tempCanvas.width = sprite.width;
      // tempCanvas.height = sprite.height;
      // const tempCtx = tempCanvas.getContext("2d");
      // if (!tempCtx) {
      //   return;
      // }
      // tempCtx.drawImage(
      //   spriteSheet,
      //   sprite.x,
      //   sprite.y,
      //   sprite.width,
      //   sprite.height,
      //   0,
      //   0,
      //   sprite.width,
      //   sprite.height
      // );
      // const imageData = tempCtx.getImageData(0, 0, sprite.width, sprite.height);
      // const data = imageData.data;
      // for (let i = 0; i < data.length; i += 4) {
      //   const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      //   data[i] = data[i] * (1 - desaturationAmount) + avg * desaturationAmount; // red
      //   data[i + 1] =
      //     data[i + 1] * (1 - desaturationAmount) + avg * desaturationAmount; // green
      //   data[i + 2] =
      //     data[i + 2] * (1 - desaturationAmount) + avg * desaturationAmount; // blue
      // }
      // tempCtx.putImageData(imageData, 0, 0);
      // ctx.drawImage(tempCanvas, -width / 2, -height / 2, width, height);
    } else {
      // Draw the image without desaturation
      ctx.drawImage(
        spriteSheet,
        sprite.x,
        sprite.y,
        sprite.width,
        sprite.height,
        -width / 2,
        -height / 2,
        width,
        height
      );
    }
    // Restore the unrotated context state
    ctx.restore();
  }
}
