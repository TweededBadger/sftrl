import React, { useRef, useState, useEffect } from "react";
import { StructurePattern, structurePatterns } from "./utils/procGen/structureWaveFunction";
import { HexType, hexTypes } from "./game/Hex";
import { Editor, EditorState } from "./game/Editor";
import StructurePreview from "./components/StructurePreview";
import "./HexEditor.css";
import { exportPatterns, importPatterns } from "./utils/procGen/patterns";

const HexEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const [editorState, setEditorState] = useState<EditorState>({
    activePattern: null,
    patterns: {},
    currentHexType: null,
  });
  const [newPatternName, setNewPatternName] = useState("");

  useEffect(() => {
    if (canvasRef.current && previewCanvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const previewCtx = previewCanvasRef.current.getContext("2d");
      if (ctx && previewCtx && !editorRef.current) {
        editorRef.current = new Editor(ctx, previewCtx);
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

  }

  const handleTest = () => {
    if (editorRef.current) {
      editorRef.current.testPattern();
    }

  }


  return (
    <div className="hex-editor">
      <div className="hex-editor-main">
        <canvas ref={canvasRef} width={600} height={400} />
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
            <button onClick={() => exportPatterns(editorState.patterns)}>Export</button>
            <button onClick={handleImportPatterns}>Import</button>
            <button onClick={handleTest}>Test</button>

          </div>
        </div>


        <canvas ref={previewCanvasRef} width={600} height={400} />

      </div>
      <div className="hex-editor-previews">
        {editorState.activePattern &&
          Object.keys(editorState.patterns).map((structurePatternKey) => {
            const structurePattern = editorState.patterns[structurePatternKey];
            return (
              <div key={structurePatternKey}>
                {editorState.activePattern && (
                  <StructurePreview
                    structurePattern={structurePattern}
                    activePattern={editorState.activePattern}
                    onClick={() => {
                      editorRef.current?.chooseActivePattern(
                        structurePatternKey
                      );
                    }}
                    onNeighbourAdd={(direction) => {
                      handleAddNeighbour(structurePatternKey, direction);
                    }}
                    onNeighbourRemove={(direction) => {
                      handleRemoveNeighbour(structurePatternKey, direction);
                    }}
                  />
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default HexEditor;