const verbose = false;
export function puzzleFromNumberGrid(grid) {
    const puzzle = {
        unsolved: grid,
        cells: Array.from({ length: grid.length }, (_) => []),
        paths: [],
        numberPairCount: 0,
        seed: undefined,
    };
    const numbers = new Set();
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
            if (grid[y][x] > 0)
                numbers.add(grid[y][x]);
            puzzle.cells[y][x] = {
                coordinates: { x, y },
                pathParent: undefined,
            };
        }
    }
    puzzle.numberPairCount = numbers.size;
    return puzzle;
}
export function getNeighborCells(puzzle, centerCoords) {
    const l = { x: centerCoords.x - 1, y: centerCoords.y };
    const u = { x: centerCoords.x, y: centerCoords.y - 1 };
    const r = { x: centerCoords.x + 1, y: centerCoords.y };
    const d = { x: centerCoords.x, y: centerCoords.y + 1 };
    return {
        left: isInBounds(l, puzzle) ? puzzle.cells[l.y][l.x] : undefined,
        top: isInBounds(u, puzzle) ? puzzle.cells[u.y][u.x] : undefined,
        right: isInBounds(r, puzzle) ? puzzle.cells[r.y][r.x] : undefined,
        bottom: isInBounds(d, puzzle) ? puzzle.cells[d.y][d.x] : undefined,
    };
}
export function isInBounds(coordinates, puzzle) {
    return (coordinates.x >= 0 &&
        coordinates.y >= 0 &&
        coordinates.x < puzzle.cells[0].length &&
        coordinates.y < puzzle.cells.length);
}
function getCellVisual(cell) {
    if (!cell.pathParent || cell.pathParent.cells.length === 0)
        return ". ";
    const { cells: pathCells } = cell.pathParent;
    const thisCellIndex = pathCells.indexOf(cell);
    const prevCellInPath = pathCells[thisCellIndex - 1];
    const nextCellInPath = pathCells[thisCellIndex + 1];
    if (!prevCellInPath || !nextCellInPath)
        return ". ";
    return chooseCellVisual(cell.coordinates, prevCellInPath.coordinates, nextCellInPath.coordinates);
}
function chooseCellVisual(targetCoords, prevCoords, nextCoords) {
    const left = prevCoords.x === targetCoords.x - 1 || nextCoords.x === targetCoords.x - 1;
    const up = prevCoords.y === targetCoords.y - 1 || nextCoords.y === targetCoords.y - 1;
    const right = prevCoords.x === targetCoords.x + 1 || nextCoords.x === targetCoords.x + 1;
    const down = prevCoords.y === targetCoords.y + 1 || nextCoords.y === targetCoords.y + 1;
    if (left && up && !right && !down)
        return "┘ ";
    if (left && right && !up && !down)
        return "——";
    if (left && down && !up && !right)
        return "┐ ";
    if (up && right && !left && !down)
        return "└—";
    if (down && right && !left && !up)
        return "┌—";
    if (up && down)
        return "| ";
    return "? ";
}
export function getCoordsString(coordinates) {
    return `(${coordinates.x}, ${coordinates.y})`;
}
export function printPuzzle(puzzle) {
    const { unsolved, cells } = puzzle;
    let full = "";
    for (let y = 0; y < unsolved.length; y++) {
        let row = "";
        for (let x = 0; x < unsolved[0].length; x++) {
            if (unsolved[y][x] > 0) {
                row += unsolved[y][x];
                if (unsolved[y][x] < 10)
                    row += " ";
                continue;
            }
            row += getCellVisual(cells[y][x]);
        }
        row += "\n";
        full += row;
    }
    console.log(full);
}
export function testPathInPuzzle(puzzle, pathNumber, coordinatesArray) {
    const path = {
        cells: [],
        number: pathNumber,
    };
    for (const c of coordinatesArray) {
        path.cells.push(puzzle.cells[c.y][c.x]);
        puzzle.cells[c.y][c.x].pathParent = path;
    }
    puzzle.paths.push(path);
}
//this function could be adapted to support grid printing in console
export function puzzleToDirectionGrid(puzzle) {
    const { cells } = puzzle;
    const directionGrid = Array.from({ length: cells.length }, (_) => Array.from({ length: cells[0].length }, (_) => ({
        left: false,
        up: false,
        right: false,
        down: false,
    })));
    for (let y = 0; y < cells.length; y++) {
        for (let x = 0; x < cells[0].length; x++) {
            const cell = cells[y][x];
            if (!cell.pathParent || cell.pathParent.cells.length === 0)
                continue;
            const pathCells = cell.pathParent.cells;
            const indexInPath = pathCells.indexOf(cell);
            const prevCellInPath = pathCells[indexInPath - 1];
            const nextCellInPath = pathCells[indexInPath + 1];
            if (!prevCellInPath && !nextCellInPath)
                continue;
            directionGrid[y][x].left =
                (prevCellInPath && prevCellInPath.coordinates.x < cell.coordinates.x) ||
                    (nextCellInPath && nextCellInPath.coordinates.x < cell.coordinates.x);
            directionGrid[y][x].up =
                (prevCellInPath && prevCellInPath.coordinates.y < cell.coordinates.y) ||
                    (nextCellInPath && nextCellInPath.coordinates.y < cell.coordinates.y);
            directionGrid[y][x].right =
                (prevCellInPath && prevCellInPath.coordinates.x > cell.coordinates.x) ||
                    (nextCellInPath && nextCellInPath.coordinates.x > cell.coordinates.x);
            directionGrid[y][x].down =
                (prevCellInPath && prevCellInPath.coordinates.y > cell.coordinates.y) ||
                    (nextCellInPath && nextCellInPath.coordinates.y > cell.coordinates.y);
        }
    }
    return directionGrid;
}
export function createEmptyDirectionGrid(width, height) {
    return Array.from({ length: height }, (_) => Array.from({ length: width }, (_) => ({
        left: false,
        up: false,
        right: false,
        down: false,
    })));
}
export function debugLog(message) {
    if (verbose)
        console.log(message);
}
//this function can be used by ANY grid-based puzzle and should be moved to a project-wide utility file
export function flatIndexToCoords(index, gridWidth) {
    return {
        x: index % gridWidth,
        y: Math.floor(index / gridWidth),
    };
}
//this function can be used by ANY grid-based puzzle and should be moved to a project-wide utility file
export function randomSeedNumber() {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}
