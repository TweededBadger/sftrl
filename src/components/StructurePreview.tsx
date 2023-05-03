import React, { useRef, useEffect } from "react";
import { renderHex } from "../utils/hex/drawing";
import { Hex } from "../game/Hex";
import { StructurePattern } from "../utils/procGen/structureWaveFunction";
import { FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import "./StructurePreview.css"; // Import the CSS

interface StructurePreviewProps {
    structurePattern: StructurePattern;
    activePattern: StructurePattern;
    hexSize?: number;
    onNeighbourAdd?: (direction: number) => void;
    onNeighbourRemove?: (direction: number) => void;
    onClick?: () => void;
}


const StructurePreview: React.FC<StructurePreviewProps> = ({
    activePattern,
    onNeighbourAdd,
    onNeighbourRemove,
    onClick,

    structurePattern, hexSize = 10 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const drawHexes = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const offsetX = canvas.width / 2;
        const offsetY = canvas.height / 2;

        // Clear the canvas before rendering
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Get the structure elements from the StructurePattern
        const structureElements = structurePattern.center.elements;

        // Iterate over the 3x3 grid and render hexes
        for (const element of structureElements) {
            const hex = new Hex(element.position.q, element.position.r);
            const hexType = structureElements.find(
                (element) => element.position.q === hex.q && element.position.r === hex.r
            )?.type;

            // If the hexType exists for the current hex, render the hex
            if (hexType) {
                renderHex(ctx, hex, offsetX, offsetY, hexSize, hexType, false);
            }
        }
    }
    useEffect(() => {

        drawHexes();
    }, [structurePattern]);

    useEffect(() => {

        drawHexes();
    }, [JSON.stringify(structurePattern.center.elements)]);


    const canTile = (direction: number) => {
        const activeNeighbours = activePattern.neighbors.find(
            (neighbour) => neighbour.direction === direction
        );
        const structurePatternName = structurePattern.name;

        return (
            activeNeighbours && activeNeighbours.types.includes(structurePatternName)
        );
    };


    const handleButtonClick = (direction: number) => {
        if (canTile(direction)) {
            onNeighbourRemove && onNeighbourRemove(direction);
        } else {
            onNeighbourAdd && onNeighbourAdd(direction);
        }
    };

    return (
        <div className="structure-preview-container">
            <button
                className={`structure-preview-button structure-preview-button-up ${canTile(0) ? "active" : ""
                    }`}
                onClick={() => handleButtonClick(0)}
            >
                <FaArrowUp />
            </button>
            <button
                className={`structure-preview-button structure-preview-button-right ${canTile(3) ? "active" : ""
                    }`}
                onClick={() => handleButtonClick(3)}
            >
                <FaArrowRight />
            </button>
            <canvas
                ref={canvasRef}
                width={100}
                height={100}
                style={{ border: "1px solid black" }}
                onClick={onClick}
            />
            <button
                className={`structure-preview-button structure-preview-button-left ${canTile(1) ? "active" : ""
                    }`}
                onClick={() => handleButtonClick(1)}
            >
                <FaArrowLeft />
            </button>
            <button
                className={`structure-preview-button structure-preview-button-down ${canTile(2) ? "active" : ""
                    }`}
                onClick={() => handleButtonClick(2)}
            >
                <FaArrowDown />
            </button>

            <div>{structurePattern.name}</div>
        </div>
    );
};
export default StructurePreview;
