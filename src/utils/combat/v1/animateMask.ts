import { gsap } from "gsap";
import * as PIXI from "pixi.js";

export function animateMask(
  graphic: PIXI.Graphics,
  angle: number,
  duration: number = 1
) {
  // Update the bounds of the graphic
  // graphic.geometry.invalidate();

  const bounds = graphic.geometry.bounds;

  // Calculate width and height based on bounds
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;

  // Create a mask based on the graphic's bounds
  const mask = new PIXI.Graphics();
  mask.beginFill(0xff00ff);
  mask.drawRect(bounds.minX, bounds.minY, width, height);
  mask.endFill();

  // Apply the mask to the graphic
  graphic.mask = mask;

  // Add the mask to the graphic
  graphic.addChild(mask);

  // Calculate the starting and ending positions for the mask based on the angle
  const distance = Math.sqrt(width * width + height * height);
  const endX = 0;
  const endY = 0;
  const startX = distance * Math.cos(angle + Math.PI);
  const startY = distance * Math.sin(angle + Math.PI);

  // Position the mask at the starting point
  mask.x = startX;
  mask.y = startY;

  // Use GSAP to animate the mask
  gsap.to(mask, {
    x: 0,
    y: 0,
    duration,
    onComplete: () => {
      // Remove the mask when the animation is completed
      graphic.mask = null;
      graphic.removeChild(mask);
    },
  });
}
