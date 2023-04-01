import { verbose } from "../../node-versions/tohuMain.js";
import {
  black,
  Cell,
  CellNeighbors,
  CellState,
  Coordinates,
  empty,
  Grid,
  white,
} from "./types.js";

function isInBounds(grid: Grid, coords: Coordinates): boolean {
  return (
    coords.x >= 0 &&
    coords.x < grid.width &&
    coords.y >= 0 &&
    coords.y < grid.height
  );
}

export function getOppositeState(state: CellState) {
  switch (state) {
    case white:
      return black;
    case black:
      return white;
    default:
      return empty;
  }
}

function getCellAt(grid: Grid, coords: Coordinates): Cell | null {
  return isInBounds(grid, coords) ? grid.columns[coords.x][coords.y] : null;
}

function getCells(grid: Grid, coordsList: Coordinates[]): Cell[] {
  const cells: (Cell | null)[] = coordsList.map((coords: Coordinates) =>
    getCellAt(grid, coords)
  );
  const cleaned: Cell[] = cells.filter(
    (cell: Cell | null) => cell !== null
  ) as Cell[]; //should use "as" here??
  return cleaned;
}

export function getCellNeighbors(
  preparedGrid: Grid,
  cell: Cell
): CellNeighbors {
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
    left: getCells(preparedGrid, leftTwo).filter((cell: Cell | null) => cell),
    top: getCells(preparedGrid, topTwo).filter((cell: Cell | null) => cell),
    right: getCells(preparedGrid, rightTwo).filter((cell: Cell | null) => cell),
    bottom: getCells(preparedGrid, botTwo).filter((cell: Cell | null) => cell),
  };
}

export function countCellsBy(
  grid: Grid,
  cells: Cell[],
  callback: (cell: Cell) => boolean
): number {
  return cells.reduce(
    (accum: number, cell: Cell) => (callback(cell) ? accum + 1 : accum),
    0
  );
}

export function printGrid(grid: Grid) {
  let builtString = "";
  const { rows } = grid;
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const state = rows[y][x].state;
      if (state === 0) builtString += ". ";
      if (state === 1) builtString += "○ ";
      if (state === 2) builtString += "● ";
    }
    builtString += "\n";
  }
  console.log(builtString);
}

export function debugLog(message: string) {
  if (verbose) console.log(message);
}
