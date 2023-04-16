import { Cell, Coordinates, NumberGrid, Path, Puzzle } from "./types.js";

const verbose = false;

export function puzzleFromNumberGrid(grid: NumberGrid) {
  const puzzle: Puzzle = {
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

export function getNeighborCells(puzzle: Puzzle, centerCoords: Coordinates) {
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

export function isInBounds(coordinates: Coordinates, puzzle: Puzzle) {
  return (
    coordinates.x >= 0 &&
    coordinates.y >= 0 &&
    coordinates.x < puzzle.cells[0].length &&
    coordinates.y < puzzle.cells.length
  );
}

function getCellVisual(cell: Cell): string {
  if (!cell.pathParent || cell.pathParent.cells.length === 0) return ". ";

  const { cells: pathCells } = cell.pathParent;
  const thisCellIndex = pathCells.indexOf(cell);
  const prevCellInPath = pathCells[thisCellIndex - 1];
  const nextCellInPath = pathCells[thisCellIndex + 1];
  if (!prevCellInPath || !nextCellInPath) return ". ";

  return chooseCellVisual(
    cell.coordinates,
    prevCellInPath.coordinates,
    nextCellInPath.coordinates
  );
}

function chooseCellVisual(
  targetCoords: Coordinates,
  prevCoords: Coordinates,
  nextCoords: Coordinates
) {
  const left =
    prevCoords.x === targetCoords.x - 1 || nextCoords.x === targetCoords.x - 1;
  const up =
    prevCoords.y === targetCoords.y - 1 || nextCoords.y === targetCoords.y - 1;
  const right =
    prevCoords.x === targetCoords.x + 1 || nextCoords.x === targetCoords.x + 1;
  const down =
    prevCoords.y === targetCoords.y + 1 || nextCoords.y === targetCoords.y + 1;

  if (left && up && !right && !down) return "┘ ";
  if (left && right && !up && !down) return "——";
  if (left && down && !up && !right) return "┐ ";
  if (up && right && !left && !down) return "└—";
  if (down && right && !left && !up) return "┌—";
  if (up && down) return "| ";

  return "? ";
}

export function getCoordsString(coordinates: Coordinates) {
  return `(${coordinates.x}, ${coordinates.y})`;
}

export function printPuzzle(puzzle: Puzzle) {
  const { unsolved, cells } = puzzle;
  let full = "";
  for (let y = 0; y < unsolved.length; y++) {
    let row = "";
    for (let x = 0; x < unsolved[0].length; x++) {
      if (unsolved[y][x] > 0) {
        row += unsolved[y][x];
        if (unsolved[y][x] < 10) row += " ";
        continue;
      }
      row += getCellVisual(cells[y][x]);
    }
    row += "\n";
    full += row;
  }
  console.log(full);
}

export function testPathInPuzzle(
  puzzle: Puzzle,
  pathNumber: number,
  coordinatesArray: Coordinates[]
) {
  const path: Path = {
    cells: [],
    number: pathNumber,
  };
  for (const c of coordinatesArray) {
    path.cells.push(puzzle.cells[c.y][c.x]);
    puzzle.cells[c.y][c.x].pathParent = path;
  }
  puzzle.paths.push(path);
}

export function debugLog(message: string) {
  if (verbose) console.log(message);
}
