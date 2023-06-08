import React, { useRef, useEffect } from "react";
import { SpriteManager } from "../game/SpriteManager";

interface SpriteCanvasProps {
  spriteManager: SpriteManager;
  sheetId: string;
  spriteKey: string;
}

const SpriteCanvas: React.FC<SpriteCanvasProps> = ({
  spriteManager,
  sheetId,
  spriteKey,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    // Clear the canvas before drawing the sprite
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the sprite at the center of the canvas
    spriteManager.drawSprite(
      ctx,
      sheetId,
      spriteKey,
      0,
      0,
      128,
      128,
      0, // rotation
      0 // desaturationAmount
    );
  }, [spriteManager, sheetId, spriteKey]);

  return <canvas ref={canvasRef} width={128} height={128} />;
};

export default SpriteCanvas;
