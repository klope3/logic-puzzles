import { debugLog, getCoordsString, getNeighborCells, isInBounds, } from "./utility.js";
export function solve(puzzle) {
    startAllPaths(puzzle);
    let safety = 0;
    const safetyMax = 99999;
    let completePaths = 0;
    while (safety < safetyMax) {
        let deductionsThisPass = 0;
        completePaths = 0;
        for (const p of puzzle.paths) {
            const pathStartCoords = p.cells[0].coordinates;
            const pathEndCoords = p.cells[p.cells.length - 1].coordinates;
            const pathComplete = p.cells.length > 1 &&
                puzzle.unsolved[pathStartCoords.y][pathStartCoords.x] === p.number &&
                puzzle.unsolved[pathEndCoords.y][pathEndCoords.x] === p.number;
            if (pathComplete) {
                completePaths++;
                continue;
            }
            if (tryNecessaryPathExtension(puzzle, p))
                deductionsThisPass++;
        }
        if (deductionsThisPass === 0)
            break;
        safety++;
    }
    if (safety < safetyMax) {
        if (completePaths === puzzle.numberPairCount) {
            debugLog("SOLVED in " + safety + " passes");
            return true;
        }
        debugLog("puzzle solving FAILED======================");
        return false;
    }
    else {
        console.error("Infinite loop!");
        return false;
    }
}
function startAllPaths(puzzle) {
    const { cells } = puzzle;
    for (let y = 0; y < cells.length; y++) {
        for (let x = 0; x < cells[0].length; x++) {
            const coords = cells[y][x].coordinates;
            const numHere = puzzle.unsolved[coords.y][coords.x];
            if (numHere === 0)
                continue;
            debugLog("starting a path for " + numHere);
            const path = {
                number: numHere,
                cells: [cells[y][x]],
            };
            cells[y][x].pathParent = path;
            puzzle.paths.push(path);
        }
    }
}
function tryNecessaryPathExtension(puzzle, path) {
    const curCell = path.cells[path.cells.length - 1];
    const coords = curCell.coordinates;
    const { left, top, right, bottom } = getNeighborCells(puzzle, coords);
    const { canGoLeft, canGoUp, canGoRight, canGoDown } = getExtensionOptions(puzzle, path, coords);
    if (!canGoLeft && !canGoUp && !canGoRight && !canGoDown) {
        debugLog("Path " + path.number + " is stuck at " + getCoordsString(coords));
        return false;
    }
    if (left && canGoLeft && !canGoUp && !canGoRight && !canGoDown) {
        doNecessaryPathExtension(puzzle, path, left.coordinates);
        return true;
    }
    if (top && !canGoLeft && canGoUp && !canGoRight && !canGoDown) {
        doNecessaryPathExtension(puzzle, path, top.coordinates);
        return true;
    }
    if (right && !canGoLeft && !canGoUp && canGoRight && !canGoDown) {
        doNecessaryPathExtension(puzzle, path, right.coordinates);
        return true;
    }
    if (bottom && !canGoLeft && !canGoUp && !canGoRight && canGoDown) {
        doNecessaryPathExtension(puzzle, path, bottom.coordinates);
        return true;
    }
    return false;
}
function getExtensionOptions(puzzle, path, coordinates) {
    const { left, top, right, bottom } = getNeighborCells(puzzle, coordinates);
    const leftNum = getNumberat(left === null || left === void 0 ? void 0 : left.coordinates, puzzle);
    const upNum = getNumberat(top === null || top === void 0 ? void 0 : top.coordinates, puzzle);
    const rightNum = getNumberat(right === null || right === void 0 ? void 0 : right.coordinates, puzzle);
    const downNum = getNumberat(bottom === null || bottom === void 0 ? void 0 : bottom.coordinates, puzzle);
    const cameFromLeft = left &&
        puzzle.cells[left.coordinates.y][left.coordinates.x].pathParent === path;
    const cameFromTop = top &&
        puzzle.cells[top.coordinates.y][top.coordinates.x].pathParent === path;
    const cameFromRight = right &&
        puzzle.cells[right.coordinates.y][right.coordinates.x].pathParent === path;
    const cameFromBottom = bottom &&
        puzzle.cells[bottom.coordinates.y][bottom.coordinates.x].pathParent ===
            path;
    return {
        canGoLeft: left &&
            (leftNum === undefined || (leftNum === path.number && !cameFromLeft)),
        canGoUp: top && (upNum === undefined || (upNum === path.number && !cameFromTop)),
        canGoRight: right &&
            (rightNum === undefined || (rightNum === path.number && !cameFromRight)),
        canGoDown: bottom &&
            (downNum === undefined || (downNum === path.number && !cameFromBottom)),
    };
}
function doNecessaryPathExtension(puzzle, path, coordsToAdd) {
    var _a;
    debugLog("Path " +
        path.number +
        " forced to extend to " +
        getCoordsString(coordsToAdd));
    if (puzzle.cells[coordsToAdd.y][coordsToAdd.x].pathParent) {
        debugLog("merging path " +
            path.number +
            " with path " +
            ((_a = puzzle.cells[coordsToAdd.y][coordsToAdd.x].pathParent) === null || _a === void 0 ? void 0 : _a.number));
        mergePathsAt(puzzle, path, coordsToAdd);
    }
    else {
        path.cells.push(puzzle.cells[coordsToAdd.y][coordsToAdd.x]);
        puzzle.cells[coordsToAdd.y][coordsToAdd.x].pathParent = path;
    }
}
function mergePathsAt(puzzle, path, coordinates) {
    const targetCell = puzzle.cells[coordinates.y][coordinates.x];
    const targetPath = targetCell.pathParent; //this should ALWAYS be defined if we call this function
    const targetIsLastInPath = targetPath.cells[targetPath.cells.length - 1] === targetCell;
    if (targetIsLastInPath)
        targetPath.cells.reverse();
    for (const c of targetPath.cells) {
        c.pathParent = path;
    }
    path.cells.push(...targetPath.cells);
    puzzle.paths.splice(puzzle.paths.indexOf(targetPath), 1);
}
function getNumberat(coordinates, puzzle) {
    if (coordinates === undefined || !isInBounds(coordinates, puzzle))
        return undefined;
    const pathHere = puzzle.cells[coordinates.y][coordinates.x].pathParent;
    if (pathHere)
        return pathHere.number;
    const writtenNumber = puzzle.unsolved[coordinates.y][coordinates.x];
    return writtenNumber ? writtenNumber : undefined;
}
