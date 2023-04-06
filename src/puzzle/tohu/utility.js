import { verbose } from "../../node-versions/tohuMain.js";
import { mulberry32 } from "../../seededRandom.js";
import { black, empty, white, } from "./types.js";
function isInBounds(grid, coords) {
    return (coords.x >= 0 &&
        coords.x < grid.width &&
        coords.y >= 0 &&
        coords.y < grid.height);
}
export function getOppositeState(state) {
    switch (state) {
        case white:
            return black;
        case black:
            return white;
        default:
            return empty;
    }
}
function getCellAt(grid, coords) {
    return isInBounds(grid, coords) ? grid.columns[coords.x][coords.y] : null;
}
function getCells(grid, coordsList) {
    const cells = coordsList.map((coords) => getCellAt(grid, coords));
    const cleaned = cells.filter((cell) => cell !== null); //should use "as" here??
    return cleaned;
}
//this should be removed in favor of getCellStateNeighbors
export function getCellNeighbors(preparedGrid, cell) {
    const { x: startX, y: startY } = cell.coords;
    const leftTwo = [
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY },
    ];
    const topTwo = [
        { x: startX, y: startY - 1 },
        { x: startX, y: startY - 2 },
    ];
    const rightTwo = [
        { x: startX + 1, y: startY },
        { x: startX + 2, y: startY },
    ];
    const botTwo = [
        { x: startX, y: startY + 1 },
        { x: startX, y: startY + 2 },
    ];
    return {
        left: getCells(preparedGrid, leftTwo).filter((cell) => cell),
        top: getCells(preparedGrid, topTwo).filter((cell) => cell),
        right: getCells(preparedGrid, rightTwo).filter((cell) => cell),
        bottom: getCells(preparedGrid, botTwo).filter((cell) => cell),
    };
}
export function getCellStateNeighbors(coords, stateGrid) {
    const gridWidth = stateGrid[0].length;
    const gridHeight = stateGrid.length;
    return {
        left: [
            coords.x > 0 ? stateGrid[coords.y][coords.x - 1] : undefined,
            coords.x > 1 ? stateGrid[coords.y][coords.x - 2] : undefined,
        ],
        right: [
            coords.x < gridWidth - 1 ? stateGrid[coords.y][coords.x + 1] : undefined,
            coords.x < gridWidth - 2 ? stateGrid[coords.y][coords.x + 2] : undefined,
        ],
        top: [
            coords.y > 0 ? stateGrid[coords.y - 1][coords.x] : undefined,
            coords.y > 1 ? stateGrid[coords.y - 2][coords.x] : undefined,
        ],
        bottom: [
            coords.y < gridHeight - 1 ? stateGrid[coords.y + 1][coords.x] : undefined,
            coords.y < gridHeight - 2 ? stateGrid[coords.y + 2][coords.x] : undefined,
        ],
    };
}
export function countCellsBy(grid, cells, callback) {
    return cells.reduce((accum, cell) => (callback(cell) ? accum + 1 : accum), 0);
}
export function getRandomFilledCellState(seed) {
    if (seed === undefined)
        return Math.random() > 0.5 ? 2 : 1;
    return mulberry32(seed) > 0.5 ? 2 : 1;
}
export function indexToCoords(index, gridWidth) {
    return {
        x: index % gridWidth,
        y: Math.floor(index / gridWidth),
    };
}
export function printGrid(grid) {
    let builtString = "";
    const { rows } = grid;
    for (let y = 0; y < rows.length; y++) {
        for (let x = 0; x < rows[y].length; x++) {
            const state = rows[y][x].state;
            if (state === 0)
                builtString += ". ";
            if (state === 1)
                builtString += "○ ";
            if (state === 2)
                builtString += "● ";
        }
        builtString += "\n";
    }
    console.log(builtString);
}
export function debugLog(message) {
    if (verbose)
        console.log(message);
}
