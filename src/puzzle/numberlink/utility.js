export function puzzleFromNumberGrid(grid) {
    const numbers = new Set();
    const puzzle = {
        unsolved: grid,
        cells: Array.from({ length: grid.length }, (_) => []),
        paths: [],
    };
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
            puzzle.cells[y][x] = {
                coordinates: { x, y },
                pathParent: undefined,
            };
        }
    }
    return puzzle;
}
function getCellVisual(cell) {
    if (!cell.pathParent)
        return ". ";
    const { cells: pathCells } = cell.pathParent;
    if (pathCells.length === 0)
        return ". ";
    const thisCellIndex = pathCells.indexOf(cell);
    const prevCell = pathCells[thisCellIndex - 1];
    const nextCell = pathCells[thisCellIndex + 1];
    if (!prevCell || !nextCell)
        return ". ";
    const thisCoords = cell.coordinates;
    const prevCoords = prevCell.coordinates;
    const nextCoords = nextCell.coordinates;
    const left = prevCoords.x === thisCoords.x - 1 || nextCoords.x === thisCoords.x - 1;
    const up = prevCoords.y === thisCoords.y - 1 || nextCoords.y === thisCoords.y - 1;
    const right = prevCoords.x === thisCoords.x + 1 || nextCoords.x === thisCoords.x + 1;
    const down = prevCoords.y === thisCoords.y + 1 || nextCoords.y === thisCoords.y + 1;
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
    const { unsolved, paths, cells } = puzzle;
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
