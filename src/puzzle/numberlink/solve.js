import { getCoordsString } from "./utility.js";
export function solve(puzzle) {
    startAllPaths(puzzle);
    let safety = 0;
    const safetyMax = 999;
    while (safety < safetyMax) {
        let deductionsThisPass = 0;
        for (const p of puzzle.paths) {
            const pathStartCoords = p.cells[0].coordinates;
            const pathEndCoords = p.cells[p.cells.length - 1].coordinates;
            const pathComplete = p.cells.length > 1 &&
                puzzle.unsolved[pathStartCoords.y][pathStartCoords.x] === p.number &&
                puzzle.unsolved[pathEndCoords.y][pathEndCoords.x] === p.number;
            if (pathComplete)
                continue;
            if (tryNecessaryPathExtension(puzzle, p))
                deductionsThisPass++;
        }
        if (deductionsThisPass === 0)
            break;
        safety++;
    }
    console.log("done in " + safety + " passes");
    // if (safety === safetyMax) console.error("Infinite loop!");
}
function startAllPaths(puzzle) {
    const { cells } = puzzle;
    for (let y = 0; y < cells.length; y++) {
        for (let x = 0; x < cells[0].length; x++) {
            const coords = cells[y][x].coordinates;
            const numHere = puzzle.unsolved[coords.y][coords.x];
            if (numHere === 0)
                continue;
            console.log("starting a path for " + numHere);
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
    const leftCoords = { x: coords.x - 1, y: coords.y };
    const upCoords = { x: coords.x, y: coords.y - 1 };
    const rightCoords = { x: coords.x + 1, y: coords.y };
    const downCoords = { x: coords.x, y: coords.y + 1 };
    const leftNum = getNumberat(leftCoords, puzzle);
    const upNum = getNumberat(upCoords, puzzle);
    const rightNum = getNumberat(rightCoords, puzzle);
    const downNum = getNumberat(downCoords, puzzle);
    const cameFromLeft = isInBounds(leftCoords, puzzle) &&
        puzzle.cells[leftCoords.y][leftCoords.x].pathParent === path;
    const cameFromTop = isInBounds(upCoords, puzzle) &&
        puzzle.cells[upCoords.y][upCoords.x].pathParent === path;
    const cameFromRight = isInBounds(rightCoords, puzzle) &&
        puzzle.cells[rightCoords.y][rightCoords.x].pathParent === path;
    const cameFromBottom = isInBounds(downCoords, puzzle) &&
        puzzle.cells[downCoords.y][downCoords.x].pathParent === path;
    const canGoLeft = isInBounds(leftCoords, puzzle) &&
        (leftNum === undefined || (leftNum === path.number && !cameFromLeft));
    const canGoUp = isInBounds(upCoords, puzzle) &&
        (upNum === undefined || (upNum === path.number && !cameFromTop));
    const canGoRight = isInBounds(rightCoords, puzzle) &&
        (rightNum === undefined || (rightNum === path.number && !cameFromRight));
    const canGoDown = isInBounds(downCoords, puzzle) &&
        (downNum === undefined || (downNum === path.number && !cameFromBottom));
    if (!canGoLeft && !canGoUp && !canGoRight && !canGoDown) {
        console.error("Path " + path.number + " is stuck at " + getCoordsString(coords));
        return false;
    }
    if (canGoLeft && !canGoUp && !canGoRight && !canGoDown) {
        doNecessaryPathExtension(puzzle, path, leftCoords);
        return true;
    }
    if (!canGoLeft && canGoUp && !canGoRight && !canGoDown) {
        doNecessaryPathExtension(puzzle, path, upCoords);
        return true;
    }
    if (!canGoLeft && !canGoUp && canGoRight && !canGoDown) {
        doNecessaryPathExtension(puzzle, path, rightCoords);
        return true;
    }
    if (!canGoLeft && !canGoUp && !canGoRight && canGoDown) {
        doNecessaryPathExtension(puzzle, path, downCoords);
        return true;
    }
    return false;
}
function doNecessaryPathExtension(puzzle, path, coordsToAdd) {
    var _a;
    console.log("Path " +
        path.number +
        " forced to extend to " +
        getCoordsString(coordsToAdd));
    if (puzzle.cells[coordsToAdd.y][coordsToAdd.x].pathParent) {
        console.log("merging path " +
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
    if (!isInBounds(coordinates, puzzle))
        return undefined;
    const pathHere = puzzle.cells[coordinates.y][coordinates.x].pathParent;
    if (pathHere)
        return pathHere.number;
    const writtenNumber = puzzle.unsolved[coordinates.y][coordinates.x];
    return writtenNumber ? writtenNumber : undefined;
}
function isInBounds(coordinates, puzzle) {
    return (coordinates.x >= 0 &&
        coordinates.y >= 0 &&
        coordinates.x < puzzle.cells[0].length &&
        coordinates.y < puzzle.cells.length);
}
