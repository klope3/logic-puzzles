import { black, empty, Grid, white, } from "./types.js";
import { countCellsBy, debugLog, getCellNeighbors } from "./utility.js";
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
export function getSolutions(rawGrid, maxSolutionsToFind) {
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
