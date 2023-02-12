import { blankSmall } from "./tohuPuzzles.js";
import {
  CellState,
  Cell,
  CellNeighbors,
  Grid,
  empty,
  black,
  Coordinates,
  white,
} from "./typesTohu.js";

const verbose = false;

const solutions = getSolutions(blankSmall);

function isInBounds(grid: Grid, coords: Coordinates): boolean {
  return (
    coords.x >= 0 &&
    coords.x < grid.width &&
    coords.y >= 0 &&
    coords.y < grid.height
  );
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

function getCellNeighbors(preparedGrid: Grid, cell: Cell): CellNeighbors {
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

function countCellsBy(
  grid: Grid,
  cells: Cell[],
  callback: (cell: Cell) => boolean
): number {
  return cells.reduce(
    (accum: number, cell: Cell) => (callback(cell) ? accum + 1 : accum),
    0
  );
}

function isCellLegal(grid: Grid, cell: Cell): boolean {
  const thisCell = cell;
  const neighbors = getCellNeighbors(grid, cell);
  for (const key of Object.keys(neighbors)) {
    const twoSameNeighbors =
      countCellsBy(
        grid,
        neighbors[key],
        (cell) => cell.state > empty && cell.state === thisCell.state
      ) === 2;
    if (twoSameNeighbors) {
      debugLog(
        "cell " +
          cell.coordsString +
          " is illegal because it has two same neighbors on " +
          key
      );
      return false;
    }
  }
  const thisCellColumn = grid.columns[cell.coords.x];
  const thisCellRow = grid.rows[cell.coords.y];
  const sameColorInColumn = countCellsBy(
    grid,
    thisCellColumn,
    (cell) => cell.state === thisCell.state
  );
  const maxColorInColumn = grid.height / 2;
  if (sameColorInColumn > maxColorInColumn) {
    debugLog(
      "cell " +
        cell.coordsString +
        " is illegal because there are more than " +
        maxColorInColumn +
        " of its color in its column"
    );
    return false;
  }
  const sameColorInRow = countCellsBy(
    grid,
    thisCellRow,
    (cell) => cell.state === thisCell.state
  );
  const maxColorInRow = grid.width / 2;
  if (sameColorInRow > maxColorInRow) {
    debugLog(
      "cell " +
        cell.coordsString +
        " is illegal because there are more than " +
        maxColorInRow +
        " of its color in its row"
    );
    return false;
  }
  return true;
}

function tryIncrementCell(cell: Cell): boolean {
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

function getSolutions(
  rawGrid: CellState[][],
  maxSolutionsToFind?: number
): Grid[] {
  let index = 0;
  let backtracking = false;
  let steps = 0;
  const preparedGrid = new Grid(rawGrid);
  const solutions: Grid[] = [];
  printGrid(preparedGrid);
  const maxIndex = preparedGrid.cells.length;
  while (true) {
    if (index >= maxIndex) {
      solutions.push(preparedGrid.createClone());
      debugLog(
        "Solving SUCCESS after " +
          steps +
          " steps; " +
          solutions.length +
          " solution(s) found"
      );
      if (!maxSolutionsToFind || solutions.length === maxSolutionsToFind) {
        break;
      } else {
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
    debugLog(
      "locked? " +
        curCell.locked +
        "; empty? " +
        curCell.isEmpty() +
        "; legal? " +
        isCellLegal(preparedGrid, curCell)
    );

    if (curCell.locked) {
      debugLog(
        "cell " +
          curCell.coords.x +
          ", " +
          curCell.coords.y +
          " is locked; skipping"
      );
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

function printGrid(grid: Grid) {
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

function debugLog(message: string) {
  if (verbose) console.log(message);
}
