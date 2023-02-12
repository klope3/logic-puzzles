import { Grid, empty, black, white, } from "./typesTohu.js";
const verbose = false;
const generated = getRawRandom(6, 6);
printGrid(new Grid(generated));
// const solutions = getSolutions(bad, 200);
// for (const solution of solutions) {
//   printGrid(solution);
// }
// console.log(solutions.length + " solutions");
function isInBounds(grid, coords) {
    return (coords.x >= 0 &&
        coords.x < grid.width &&
        coords.y >= 0 &&
        coords.y < grid.height);
}
function getOppositeState(state) {
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
function getCellNeighbors(preparedGrid, cell) {
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
function countCellsBy(grid, cells, callback) {
    return cells.reduce((accum, cell) => (callback(cell) ? accum + 1 : accum), 0);
}
function isCellLegal(grid, cell) {
    const thisCell = cell;
    const neighbors = getCellNeighbors(grid, cell);
    for (const key of Object.keys(neighbors)) {
        const twoSameNeighbors = countCellsBy(grid, neighbors[key], (cell) => cell.state > empty && cell.state === thisCell.state) === 2;
        if (twoSameNeighbors) {
            debugLog("cell " +
                cell.coordsString +
                " is illegal because it has two same neighbors on " +
                key);
            return false;
        }
    }
    const thisCellColumn = grid.columns[cell.coords.x];
    const thisCellRow = grid.rows[cell.coords.y];
    const sameColorInColumn = countCellsBy(grid, thisCellColumn, (cell) => cell.state === thisCell.state);
    const maxColorInColumn = grid.height / 2;
    if (sameColorInColumn > maxColorInColumn) {
        debugLog("cell " +
            cell.coordsString +
            " is illegal because there are more than " +
            maxColorInColumn +
            " of its color in its column");
        return false;
    }
    const sameColorInRow = countCellsBy(grid, thisCellRow, (cell) => cell.state === thisCell.state);
    const maxColorInRow = grid.width / 2;
    if (sameColorInRow > maxColorInRow) {
        debugLog("cell " +
            cell.coordsString +
            " is illegal because there are more than " +
            maxColorInRow +
            " of its color in its row");
        return false;
    }
    return true;
}
function tryIncrementCell(cell) {
    if (cell.locked) {
        console.error("Tried to increment a locked cell!");
        return false;
    }
    if (cell.state === black) {
        debugLog("reverting cell " + cell.coordsString);
        cell.state = empty;
        return false;
    }
    cell.state++;
    debugLog("cell " + cell.coordsString + " incremented to " + cell.state);
    return true;
}
function isGridLegal(rawGrid) {
    const grid = new Grid(rawGrid);
    const maxEachColorPerColumn = grid.columns.length / 2;
    const maxEachColorPerRow = grid.rows.length / 2;
    for (const column of grid.columns) {
        const whites = countCellsBy(grid, column, (cell) => cell.state === white);
        if (whites > maxEachColorPerColumn)
            return false;
        const blacks = countCellsBy(grid, column, (cell) => cell.state === white);
        if (blacks > maxEachColorPerColumn)
            return false;
    }
    for (const row of grid.rows) {
        const whites = countCellsBy(grid, row, (cell) => cell.state === white);
        if (whites > maxEachColorPerRow)
            return false;
        const blacks = countCellsBy(grid, row, (cell) => cell.state === white);
        if (blacks > maxEachColorPerRow)
            return false;
    }
    return true;
}
function getSolutions(rawGrid, maxSolutionsToFind) {
    let index = 0;
    let backtracking = false;
    let steps = 0;
    const preparedGrid = new Grid(rawGrid);
    const solutions = [];
    //   printGrid(preparedGrid);
    const maxIndex = preparedGrid.cells.length;
    while (true) {
        if (index >= maxIndex) {
            solutions.push(preparedGrid.createClone());
            debugLog("Solving SUCCESS after " +
                steps +
                " steps; " +
                solutions.length +
                " solution(s) found");
            if (!maxSolutionsToFind || solutions.length === maxSolutionsToFind) {
                break;
            }
            else {
                backtracking = true;
                index--;
            }
        }
        if (index < 0) {
            debugLog("Solving FAILED after " + steps + " steps");
            break;
        }
        const curCell = preparedGrid.cells[index];
        debugLog("=======================");
        debugLog("visiting cell " + curCell.coordsString + " on step " + steps);
        debugLog("locked? " +
            curCell.locked +
            "; empty? " +
            curCell.isEmpty() +
            "; legal? " +
            isCellLegal(preparedGrid, curCell));
        if (curCell.locked) {
            debugLog("cell " +
                curCell.coords.x +
                ", " +
                curCell.coords.y +
                " is locked; skipping");
            index = backtracking ? index - 1 : index + 1;
            steps++;
            continue;
        }
        while (true) {
            const reverted = !tryIncrementCell(curCell);
            if (reverted) {
                debugLog(`${backtracking ? "continue" : "start"} backtracking`);
                backtracking = true;
                break;
            }
            if (isCellLegal(preparedGrid, curCell)) {
                backtracking = false;
                break;
            }
        }
        index = backtracking ? index - 1 : index + 1;
        steps++;
    }
    return solutions;
}
function generateRaw(width, height) {
    let safety = 0;
    const safetyMax = 10000;
    let generated = [];
    while (safety < safetyMax) {
        generated = getRawRandom(width, height);
        const solutions = getSolutions(generated, 2);
        if (solutions.length === 1)
            break;
        safety++;
    }
    console.log("safety " + safety);
    return generated;
}
function getRawRandom(width, height) {
    //right now this needs a seedable RNG for proper testing!
    const generated = [];
    const offLimitsWhite = []; //which indices can't receive white
    const offLimitsBlack = []; //which indices can't receive black
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            let valToPlace = 0;
            const flatIndex = y * width + x;
            debugLog("visiting index " + flatIndex);
            //IF we decide the space won't be empty...
            if (Math.random() < 0.3) {
                //we'll place either white or black
                valToPlace = Math.random() < 0.5 ? white : black;
                //check off limits indices based on which color was chosen
                const offLimitsIndices = valToPlace === white ? offLimitsWhite : offLimitsBlack;
                const canPlaceThisVal = offLimitsIndices.includes(flatIndex);
                //if we can't place this color, choose the other instead
                if (!canPlaceThisVal)
                    valToPlace = getOppositeState(valToPlace);
                //if this is the second same color in a row horizontally, the space on the right must be off-limits for this color
                if (row[flatIndex - 1] === valToPlace)
                    offLimitsIndices.push(flatIndex + 1);
                //if this is the second same color in a row vertically, the space below must be off-limits for this color
                if (row[flatIndex - width] === valToPlace)
                    offLimitsIndices.push(flatIndex - width);
            }
            //actually place the value
            row.push(valToPlace);
        }
        generated.push(row);
    }
    return generated;
}
function printGrid(grid) {
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
function debugLog(message) {
    if (verbose)
        console.log(message);
}
