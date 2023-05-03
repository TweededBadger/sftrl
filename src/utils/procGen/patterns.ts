import { StructurePattern } from "./structureWaveFunction";


export function exportPatterns(patterns: Record<string, StructurePattern>): void {
    const serializedPatterns = JSON.stringify(patterns);
    localStorage.setItem("patterns", serializedPatterns);
  }
  

  export function importPatterns(): Record<string, StructurePattern> {
    const serializedPatterns = localStorage.getItem("patterns");
    if (serializedPatterns) {
      try {
        const parsedPatterns = JSON.parse(serializedPatterns);
        return parsedPatterns as Record<string, StructurePattern>;
      } catch (error) {
        console.error("Error parsing patterns from local storage:", error);
      }
    }
    throw new Error("No patterns found in local storage");
  }
  