import React, { useRef, useState, useEffect } from "react";
import {
  StructurePattern,
  structurePatterns,
} from "./utils/procGen/structureWaveFunction";
import { HexType, hexTypes } from "./game/Hex";
import { Editor, EditorState } from "./game/Editor";
import StructurePreview from "./components/StructurePreview";
import "./HexEditor.css";
import { exportPatterns, importPatterns } from "./utils/procGen/patterns";
import {
  spriteInfoCharacters,
  spriteInfoTiles,
  spriteItems,
  spriteWeapons,
} from "./game/HexGrid";
import { SpriteManager } from "./game/SpriteManager";
import { hexRotations } from "./game/Structure";

const HexEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const editorRef = useRef<Editor | null>(null);

  const spriteManager = useRef(
    new SpriteManager(
      [
        {
          sheetId: "TILES",
          spriteInfo: spriteInfoTiles,
          src: "images/ss_tiles.png",
        },
        {
          sheetId: "WEAPONS",
          spriteInfo: spriteWeapons,
          src: "images/ss_weapons.png",
        },
        {
          sheetId: "ITEMS",
          spriteInfo: spriteItems,
          src: "images/ss_items.png",
        },
        {
          sheetId: "CHARACTERS",
          spriteInfo: spriteInfoCharacters,
          src: "images/ss_characters.png",
        },
      ],
      () => {}
    )
  );

  const [editorState, setEditorState] = useState<EditorState>({
    activePattern: null,
    patterns: {},
    currentHexType: null,
  });
  const [newPatternName, setNewPatternName] = useState("");

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx && !editorRef.current) {
        editorRef.current = new Editor(ctx, spriteManager.current);
        editorRef.current.events.on("currentState", handleCurrentState);
        // Run loadStructurePatterns with test data
        // editorRef.current.loadStructurePatterns(structurePatterns);
        // editorRef.current.chooseActivePattern("structurePattern1");

        canvasRef.current.addEventListener("click", (event) => {
          editorRef.current?.handleClick(event);
        });
      }
    }
  }, []);

  const handleCurrentState = (currentState: EditorState) => {
    console.log({ currentState });
    setEditorState(currentState);
  };

  const handleHexTypeClick = (hexType: HexType) => {
    if (editorRef.current) {
      editorRef.current.setCurrentHexType(hexType);
      setEditorState({
        ...editorState,
        currentHexType: hexType,
      });
    }
  };

  const handleAddNeighbour = (patternName: string, direction: number) => {
    if (editorRef.current) {
      editorRef.current.addNeighbor(patternName, direction);
    }
  };

  const handleRemoveNeighbour = (patternName: string, direction: number) => {
    if (editorRef.current) {
      editorRef.current.removeNeighbor(patternName, direction);
    }
  };

  const handleAddPatternRecord = () => {
    if (editorRef.current && newPatternName) {
      editorRef.current.addPatternRecord(newPatternName);
      setNewPatternName("");
    }
  };

  const handleImportPatterns = () => {
    const patterns = importPatterns();

    if (patterns && editorRef.current) {
      editorRef.current.loadStructurePatterns(patterns);
    }
  };

  const handleTest = () => {
    if (editorRef.current) {
      editorRef.current.testPattern();
    }
  };

  return (
    <div className="hex-editor">
      <div className="hex-editor-main">
        <canvas ref={canvasRef} width={1200} height={1000} />
        <div className="hex-editor-controls">
          {/* Render buttons to choose the currentHexType */}
          {hexTypes.map((hexType) => (
            <button
              key={hexType}
              onClick={() => handleHexTypeClick(hexType)}
              style={{
                backgroundColor:
                  editorState.currentHexType === hexType ? "lightblue" : "",
              }}
            >
              {hexType}
            </button>
          ))}
          {/* Render a text field and submit button to add a new PatternRecord */}
          <div>
            <input
              type="text"
              value={newPatternName}
              onChange={(e) => setNewPatternName(e.target.value)}
              placeholder="Pattern name"
            />
            <button onClick={handleAddPatternRecord}>Add Pattern</button>
            <button onClick={() => exportPatterns(editorState.patterns)}>
              Export
            </button>
            <button onClick={handleImportPatterns}>Import</button>
            <button onClick={handleTest}>Test</button>
            <button
              onClick={() => {
                if (editorRef.current) {
                  editorRef.current.renderHexMap();
                }
              }}
            >
              Render Hex Map
            </button>
            <button
              onClick={() => {
                if (editorRef.current) {
                  editorRef.current.renderHexMapWithDoors();
                }
              }}
            >
              Render Hex Map With Doors
            </button>
          </div>
        </div>
      </div>
      {/* <div className="hex-editor-previews">
        {hexTypes.map((hexType) => {
          return hexRotations.map((rotation) => (
            <StructurePreview
              spriteManager={spriteManager.current}
              hexType={hexType}
              rotation={rotation}
              onClick={() => {}}
              onNeighbourAdd={(direction) => {
                // handleAddNeighbour(structurePatternKey, direction);
              }}
              onNeighbourRemove={(direction) => {
                // handleRemoveNeighbour(structurePatternKey, direction);
              }}
            />
          ));
        })}
      </div> */}
    </div>
  );
};

export default HexEditor;
