import EventEmitter from "eventemitter3";
import { iterateGrid, pixelToHex, renderHex } from "../utils/hex/drawing";
import { StructurePattern, convertToHexMap, generateStructures } from "../utils/procGen/structureWaveFunction";
import { Hex, HexType } from "./Hex";
import { HexGrid } from "./HexGrid"; // Assuming you have the HexGrid class
import { HexMap } from "../utils/types";

type PatternsRecord = Record<string, StructurePattern>;

export type EditorState = {
    activePattern: StructurePattern | null;
    patterns: Record<string, StructurePattern>;
    currentHexType: HexType | null;
  };
  

export class Editor {
    
  events: EventEmitter<{
    currentState: EditorState;
}>;
  patterns: PatternsRecord;
  activePattern: StructurePattern | null;
  activePatternCanvasCtx: CanvasRenderingContext2D;
  previewCanvasCtx: CanvasRenderingContext2D;
  currentHexType: HexType | null;
   hexSize:number = 20;

  constructor(
    activePatternCanvasCtx: CanvasRenderingContext2D,
    previewCanvasCtx: CanvasRenderingContext2D
    ) {
    
    EventEmitter;
    this.patterns = {};
    this.activePattern = null;
    this.activePatternCanvasCtx = activePatternCanvasCtx;
    this.previewCanvasCtx = previewCanvasCtx;
    this.currentHexType = null;
    this.events = new EventEmitter<{
        currentState: EditorState;
    }>();
  }

 public   loadStructurePatterns(structurePatterns: PatternsRecord): void {
    this.patterns = structurePatterns;
    this.activePattern = this.patterns[Object.keys(this.patterns)[0]];
    this.emitCurrentState();
    this.renderPattern();   
  }

  public chooseActivePattern(patternName: string): void {
    this.activePattern = this.patterns[patternName];
    this.renderPattern();
    this.emitCurrentState();
  }

  public emitCurrentState(): void {
    this.events.emit<"currentState">("currentState", {
      activePattern: this.activePattern,
        patterns: this.patterns,
        currentHexType: this.currentHexType,
    });
  }

  public addNeighbor(patternName: string, direction: number): void {
    const activePattern = this.activePattern;
    if (!activePattern) return;
  
    const existingNeighbor = activePattern.neighbors.find(
      (neighbor) => neighbor.direction === direction
    );
  
    if (existingNeighbor && !existingNeighbor.types.includes(patternName)) {
      existingNeighbor.types.push(patternName);
  
      // Add the active pattern to the corresponding pattern's neighbors
      const correspondingPattern = this.patterns[patternName];
      const oppositeDirection = (direction + 2) % 4;
      const correspondingNeighbor = correspondingPattern.neighbors.find(
        (neighbor) => neighbor.direction === oppositeDirection
      );
  
      if (correspondingNeighbor && !correspondingNeighbor.types.includes(activePattern.name)) {
        correspondingNeighbor.types.push(activePattern.name);
      }
    }
  
    this.emitCurrentState();
  }
  
  public removeNeighbor(patternName: string, direction: number): void {
    const activePattern = this.activePattern;
    if (!activePattern) return;
  
    const existingNeighbor = activePattern.neighbors.find(
      (neighbor) => neighbor.direction === direction
    );
  
    if (existingNeighbor) {
      const typeIndex = existingNeighbor.types.indexOf(patternName);
  
      if (typeIndex !== -1) {
        existingNeighbor.types.splice(typeIndex, 1);
  
        // Remove the active pattern from the corresponding pattern's neighbors
        const correspondingPattern = this.patterns[patternName];
        const oppositeDirection = (direction + 2) % 4;
        const correspondingNeighbor = correspondingPattern.neighbors.find(
          (neighbor) => neighbor.direction === oppositeDirection
        );
  
        if (correspondingNeighbor) {
          const activePatternIndex = correspondingNeighbor.types.indexOf(activePattern.name);
          if (activePatternIndex !== -1) {
            correspondingNeighbor.types.splice(activePatternIndex, 1);
          }
        }
      }
    }
  
    this.emitCurrentState();
  }
  




  public  addPatternRecord(patternName: string): void {

    const type = this.currentHexType;
    if (!type) return;
    const newStructurePattern: StructurePattern = {
      name: patternName,
      center: {
        elements: [
            { type, position: { q: 0, r: 0 } },
            { type, position: { q: 1, r: 0 } },
            { type, position: { q: 2, r: 0 } },
            { type, position: { q: -1, r: 1 } },
            { type, position: { q: 0, r: 1 } },
            { type, position: { q: 1, r: 1 } },
            { type, position: { q: -1, r: 2 } },
            { type, position: { q: 0, r: 2 } },
            { type, position: { q: 1, r: 2 } },
        ],
      },
      neighbors: [
        { direction: 0, types: [] },
        { direction: 1, types: [] },
        { direction: 2, types: [] },
        { direction: 3, types: [] },
      ],
    };

    this.patterns[patternName] = newStructurePattern;
    this.emitCurrentState();
  }


  public testPattern(): void {
    generateStructures({ gridSize: 20, patterns:this.patterns, callback: (structureMap) => { 

        console.log(structureMap);

        const hexTypes =  convertToHexMap(
            {structureMap, patterns: this.patterns, gridSize: 20
            });

            this.renderPreview(20,hexTypes);

    }});

  }


  renderPreview( gridSize: number,hexTypes:HexMap): void {


    this.previewCanvasCtx.clearRect(
        0,
        0,
        this.previewCanvasCtx.canvas.width,
        this.previewCanvasCtx.canvas.height
      );
  
      
    const offsetX = 30;
    const offsetY = 10;

    
    for (const hex of iterateGrid(gridSize)) {
        const hexKey = hex.toString();
        const type = hexTypes.get(hexKey) || 'GRASS';
        
  
          renderHex(this.previewCanvasCtx, hex, offsetX, offsetY, 10,  type, false);

    
    }

  }


  // Render the current active StructurePattern on the canvas
  renderPattern(): void {

    if (!this.activePattern) return;
    // Clear the canvas before rendering
    this.activePatternCanvasCtx.clearRect(
      0,
      0,
      this.activePatternCanvasCtx.canvas.width,
      this.activePatternCanvasCtx.canvas.height
    );

    // Define the hexSize and offsets to center the pattern on the canvas
   
    const offsetX = this.activePatternCanvasCtx.canvas.width / 2;
    const offsetY = this.activePatternCanvasCtx.canvas.height / 2;

    // Get the active StructurePattern and its elements
    const structureElements = this.activePattern.center.elements;

    // Iterate over the 3x3 grid and render hexes
    for (const element of structureElements) {
        const hex = new Hex(element.position.q, element.position.r);
      const hexType = structureElements.find(
        (element) => element.position.q === hex.q && element.position.r === hex.r
      )?.type;

      // If the hexType exists for the current hex, render the hex
      if (hexType) {
        renderHex(
          this.activePatternCanvasCtx,
          hex,
          offsetX,
          offsetY,
          this.hexSize,
          hexType,
          false
        );
      }
    }
  }
  
  setCurrentHexType(hexType: HexType): void {
    this.currentHexType = hexType;
    
    this.emitCurrentState();
  }

  setPatternHex(hexCoord: { q: number; r: number }, hexType: HexType): void {
    if (!this.activePattern) return;
    const hexIndex = this.activePattern.center.elements.findIndex(
      (element) =>
        element.position.q === hexCoord.q && element.position.r === hexCoord.r
    );

    if (hexIndex !== -1) {
      this.activePattern.center.elements[hexIndex].type = hexType;
    }
  }

  public handleClick(event: MouseEvent): void {
    if (!this.currentHexType) return;
    // const { offsetX, offsetY } = event;
    const rect = this.activePatternCanvasCtx.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;


    const offsetX = this.activePatternCanvasCtx.canvas.width / 2;
    const offsetY = this.activePatternCanvasCtx.canvas.height / 2;

    console.log({x,y})
    
    const hex = pixelToHex(x - offsetX, y - offsetY, this.hexSize);

    console.log(hex)

    // const hexCoord = HexGrid.pixelToHex(offsetX, offsetY); // Assuming HexGrid has pixelToHex method

    this.setPatternHex(hex, this.currentHexType);
    this.renderPattern();
    
    this.emitCurrentState();
  }
}
