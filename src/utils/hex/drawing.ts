import { Hex, HexType } from "../../game/Hex";

const typeColors: Record<HexType, string> = {
    GRASS: "#00D04E",
    ROAD: "#808080",
    SEA: "#0000FF",
    WOODS: "#019437",
    DEEP_WOODS: "#00451A",
    SAND: "#FFFF00",
    WALL: "#508050",
    DOOR: "#FF00FF",
    DEATH: "rgba(255, 0, 0, 0.5)",
  };
  

export function calculateHexPoints(
    centerX: number,
    centerY: number,
    size: number
  ): { x: number; y: number }[] {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = ((2 * Math.PI) / 6) * i + Math.PI / 6; // Start at 30 degrees
      const x = centerX + size * Math.cos(angle);
      const y = centerY + size * Math.sin(angle);
      points.push({ x, y });
    }
    return points;
  }


  export function  desaturateColor(
    color: string,
    desaturationFactor: number = 0.3
  ): string {
    const greyOutFactor = 0.5;
    const hexColor = color.slice(1);
    const rgb = parseInt(hexColor, 16);
    const r = ((rgb >> 16) & 255) * greyOutFactor;
    const g = ((rgb >> 8) & 255) * greyOutFactor;
    const b = (rgb & 255) * greyOutFactor;

    const maxColorValue = Math.max(r, g, b);
    const minColorValue = Math.min(r, g, b);
    const lightness = (maxColorValue + minColorValue) / 2;

    const newR = r + (lightness - r) * desaturationFactor;
    const newG = g + (lightness - g) * desaturationFactor;
    const newB = b + (lightness - b) * desaturationFactor;

    return `rgb(${Math.round(newR)}, ${Math.round(newG)}, ${Math.round(newB)})`;
  }


  export function renderHex(
    ctx: CanvasRenderingContext2D,
    hex: Hex,
    offsetX: number,
    offsetY: number,
    hexSize: number,
    hexType: HexType,
    greyOut: boolean
  ): void {
    const { x, y } = hex.toPixel(hexSize);
    const centerX = x + offsetX;
    const centerY = y + offsetY;
  
    const points = calculateHexPoints(centerX, centerY, hexSize);
    ctx.beginPath();
  
    ctx.setLineDash([5, 10]);
  
    ctx.lineWidth = 1;
    ctx.moveTo(points[0].x, points[0].y);
  
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
  
    ctx.closePath();
    ctx.fillStyle = greyOut
      ? desaturateColor(typeColors[hexType], 0.9)
      : typeColors[hexType];
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();
  }

  export   function *iterateGrid(gridSize: number): Generator<Hex> {
    for (let r = 0; r < gridSize; r++) {
      for (let q = 0; q < gridSize; q++) {
        const hexOffset = { col: q, row: r };
        const hex = evenrToAxial(hexOffset);
        yield hex;
      }
    }
  }

  export function evenrToAxial(hexOffset: { col: number; row: number }): Hex {
   const q = hexOffset.col - (hexOffset.row + (hexOffset.row & 1)) / 2;
   const r = hexOffset.row;
   return new Hex(q, r);
 }

 export function pixelToHex(x: number, y: number, hexSize:number): Hex {
   const q = ((x * Math.sqrt(3)) / 3 - y / 3) / hexSize;
   const r = (y * 2) / 3 / hexSize;
   return new Hex(q, r).round();
 }
 
  