import { mulberry32 } from "../../seededRandom.js";
import {
  SolvingCell,
  Vector2,
  DirectionSet,
  NumberGrid,
  SolvingPath,
  // Puzzle,
  PathGrid,
  SolvingData,
} from "./types.js";

const verbose = false;

// export function puzzleFromNumberGrid(grid: NumberGrid) {
//   const puzzle: Puzzle = {
//     unsolved: grid,
//     cells: Array.from({ length: grid.length }, (_) => []),
//     paths: [],
//     numberPairCount: 0,
//     seed: undefined,
//   };
//   const numbers = new Set<number>();
//   for (let y = 0; y < grid.length; y++) {
//     for (let x = 0; x < grid[0].length; x++) {
//       if (grid[y][x] > 0) numbers.add(grid[y][x]);
//       puzzle.cells[y][x] = {
//         coordinates: { x, y },
//         pathParent: undefined,
//       };
//     }
//   }
//   puzzle.numberPairCount = numbers.size;
//   return puzzle;
// }

export function getNeighborCells(
  solvingData: SolvingData,
  centerCoords: Vector2
) {
  const l = { x: centerCoords.x - 1, y: centerCoords.y };
  const u = { x: centerCoords.x, y: centerCoords.y - 1 };
  const r = { x: centerCoords.x + 1, y: centerCoords.y };
  const d = { x: centerCoords.x, y: centerCoords.y + 1 };

  return {
    left: isInBounds(l, solvingData.unsolved)
      ? solvingData.cells[l.y][l.x]
      : undefined,
    top: isInBounds(u, solvingData.unsolved)
      ? solvingData.cells[u.y][u.x]
      : undefined,
    right: isInBounds(r, solvingData.unsolved)
      ? solvingData.cells[r.y][r.x]
      : undefined,
    bottom: isInBounds(d, solvingData.unsolved)
      ? solvingData.cells[d.y][d.x]
      : undefined,
  };
}

export function isInBounds(coordinates: Vector2, grid: NumberGrid) {
  return (
    coordinates.x >= 0 &&
    coordinates.y >= 0 &&
    coordinates.x < grid[0].length &&
    coordinates.y < grid.length
  );
}

function getCellVisual(cell: SolvingCell): string {
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
  targetCoords: Vector2,
  prevCoords: Vector2,
  nextCoords: Vector2
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

export function getCoordsString(coordinates: Vector2) {
  return `(${coordinates.x}, ${coordinates.y})`;
}

export function printSolvingData(solvingData: SolvingData) {
  const { unsolved, cells } = solvingData;
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

// export function testPathInPuzzle(
//   puzzle: Puzzle,
//   pathNumber: number,
//   coordinatesArray: Vector2[]
// ) {
//   const path: SolvingPath = {
//     cells: [],
//     number: pathNumber,
//   };
//   for (const c of coordinatesArray) {
//     path.cells.push(puzzle.cells[c.y][c.x]);
//     puzzle.cells[c.y][c.x].pathParent = path;
//   }
//   puzzle.paths.push(path);
// }

//this function could be adapted to support grid printing in console
export function puzzleToDirectionGrid(
  solvingData: SolvingData
): DirectionSet[][] {
  const { cells } = solvingData;
  const directionGrid: DirectionSet[][] = Array.from(
    { length: cells.length },
    (_) =>
      Array.from({ length: cells[0].length }, (_) => ({
        left: false,
        up: false,
        right: false,
        down: false,
      }))
  );

  for (let y = 0; y < cells.length; y++) {
    for (let x = 0; x < cells[0].length; x++) {
      const cell = cells[y][x];
      if (!cell.pathParent || cell.pathParent.cells.length === 0) continue;

      const pathCells = cell.pathParent.cells;
      const indexInPath = pathCells.indexOf(cell);
      const prevCellInPath = pathCells[indexInPath - 1];
      const nextCellInPath = pathCells[indexInPath + 1];
      if (!prevCellInPath && !nextCellInPath) continue;

      directionGrid[y][x].left = !!(
        (prevCellInPath && prevCellInPath.coordinates.x < cell.coordinates.x) ||
        (nextCellInPath && nextCellInPath.coordinates.x < cell.coordinates.x)
      );
      directionGrid[y][x].up = !!(
        (prevCellInPath && prevCellInPath.coordinates.y < cell.coordinates.y) ||
        (nextCellInPath && nextCellInPath.coordinates.y < cell.coordinates.y)
      );
      directionGrid[y][x].right = !!(
        (prevCellInPath && prevCellInPath.coordinates.x > cell.coordinates.x) ||
        (nextCellInPath && nextCellInPath.coordinates.x > cell.coordinates.x)
      );
      directionGrid[y][x].down = !!(
        (prevCellInPath && prevCellInPath.coordinates.y > cell.coordinates.y) ||
        (nextCellInPath && nextCellInPath.coordinates.y > cell.coordinates.y)
      );
    }
  }

  return directionGrid;
}

export function createEmptyDirectionGrid(
  width: number,
  height: number
): DirectionSet[][] {
  return Array.from({ length: height }, (_) =>
    Array.from({ length: width }, (_) => ({
      left: false,
      up: false,
      right: false,
      down: false,
    }))
  );
}

export function createEmptyPathGrid(width: number, height: number): PathGrid {
  const grid: PathGrid = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => ({
      left: false,
      up: false,
      right: false,
      down: false,
      coordinates: { x, y },
    }))
  );
  return grid;
}

export function debugLog(message: string) {
  if (verbose) console.log(message);
}

//this function can be used by ANY grid-based puzzle and should be moved to a project-wide utility file
export function flatIndexToCoords(index: number, gridWidth: number) {
  return {
    x: index % gridWidth,
    y: Math.floor(index / gridWidth),
  };
}

//this function can be used by ANY seed-based puzzle and should be moved to a project-wide utility file
export function randomSeedNumber(prevSeed?: number) {
  const randFactor =
    prevSeed === undefined ? Math.random() : mulberry32(prevSeed);
  return Math.floor(randFactor * Number.MAX_SAFE_INTEGER);
}
