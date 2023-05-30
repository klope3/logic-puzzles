import { mulberry32 } from "../../seededRandom.js";
import {
  doesPositionHaveTwoNeighborsOfState,
  isPositionFlankedByState,
  isTallyMaxedAtPosition,
} from "./deductions.js";
import {
  black,
  CellState,
  ColorTallies,
  Coordinates,
  Puzzle,
  white,
} from "./types.js";
import {
  getCellStateNeighbors,
  getOppositeState,
  getRandomFilledCellState,
  indexToCoords,
} from "./utility.js";

type PuzzleParams = {
  width: number;
  height: number;
};

export function generatePuzzle(
  width: number,
  height: number,
  seed?: number
): Puzzle {
  const params = validatePuzzleParams(width, height);
  width = params.width;
  height = params.height;
  const raw = getRawRandom(width, height, seed);
  const puzzle = raw.map((row) => row.map((state) => state));
  const openIndices = Array.from({ length: width * height }, (_, i) => i);
  let filledCellsCount = width * height;
  if (seed === undefined)
    seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  const columnTallies: ColorTallies[] = Array.from(
    { length: params.width },
    (_) => ({
      white: width / 2,
      black: width / 2,
    })
  );
  const rowTallies: ColorTallies[] = Array.from(
    { length: params.height },
    (_) => ({
      white: height / 2,
      black: height / 2,
    })
  );

  let step = 0;
  while (openIndices.length > 0) {
    const randIndex = Math.floor(mulberry32(seed + step) * openIndices.length);
    const flatIndex = openIndices[randIndex];
    const coords = indexToCoords(flatIndex, width);
    const originalValue = puzzle[coords.y][coords.x];
    if (wouldBeDeducible(coords, puzzle, columnTallies, rowTallies)) {
      puzzle[coords.y][coords.x] = 0;
      addStateTally(coords, originalValue, columnTallies, rowTallies, -1);
      filledCellsCount--;
    }
    openIndices.splice(randIndex, 1);
    step++;
  }
  return {
    states: puzzle,
    solution: raw,
  };
}

function wouldBeDeducible(
  coords: Coordinates,
  puzzle: CellState[][],
  columnTallies: ColorTallies[],
  rowTallies: ColorTallies[]
) {
  const width = puzzle[0].length;
  const height = puzzle.length;
  const maxPerColorPerColumn = height / 2;
  const maxPerColorPerRow = width / 2;
  const neighbors = getCellStateNeighbors(coords, puzzle);
  const stateHere = puzzle[coords.y][coords.x];
  const flanked = isPositionFlankedByState(
    neighbors,
    getOppositeState(stateHere)
  );
  const twoSameNeighbors = doesPositionHaveTwoNeighborsOfState(
    neighbors,
    stateHere
  );
  const oppositeMaxed = isTallyMaxedAtPosition(
    coords,
    columnTallies,
    rowTallies,
    maxPerColorPerRow,
    maxPerColorPerColumn,
    getOppositeState(stateHere)
  );

  return flanked || twoSameNeighbors || oppositeMaxed;
}

//after 12x12 the puzzles get slow to generate
export function getRawRandom(
  width: number,
  height: number,
  seed?: number
): CellState[][] {
  const params = validatePuzzleParams(width, height);

  const generated: CellState[][] = Array.from({ length: params.height }, (_) =>
    Array.from({ length: params.width }, (_) => 0)
  );
  let flatIndex = 0;
  let step = 0;
  if (seed === undefined)
    seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  const totalCells = params.width * params.height;
  const rowTallies: ColorTallies[] = Array.from(
    { length: params.height },
    (_) => ({
      white: 0,
      black: 0,
    })
  );
  const columnTallies: ColorTallies[] = Array.from(
    { length: params.width },
    (_) => ({
      white: 0,
      black: 0,
    })
  );

  let safety = 0;
  const safetyMax = 999999999;

  while (flatIndex < totalCells && safety < safetyMax) {
    if (
      tryGenerationStep(
        flatIndex,
        params.width,
        params.height,
        generated,
        columnTallies,
        rowTallies,
        seed,
        step
      )
    ) {
      flatIndex++;
    } else {
      if (flatIndex > 0) flatIndex--;
    }
    step++;
    safety++;
  }
  if (safety === safetyMax)
    console.error("infinite loop!=======================");

  return generated;
}

function tryGenerationStep(
  flatIndex: number,
  width: number,
  height: number,
  generated: CellState[][],
  columnTallies: ColorTallies[],
  rowTallies: ColorTallies[],
  seed: number,
  step: number
) {
  const coords = indexToCoords(flatIndex, width);
  const prevValue = generated[coords.y][coords.x];
  //if a value is already here, we got here by backtracking, so remove the previous value and update the tallies
  if (prevValue !== 0) {
    generated[coords.y][coords.x] = 0;
    addStateTally(coords, prevValue, columnTallies, rowTallies, -1);
  }

  //get a value to set, either by random choice or by necessity
  const valToSet = chooseStateForCoords(
    coords,
    width,
    height,
    columnTallies,
    rowTallies,
    generated,
    seed + step
  );
  //if there's no legal value we can set, OR if we're trying to repeat the prev value, backtrack
  if (valToSet === undefined || valToSet === prevValue) {
    return false;
  }

  generated[coords.y][coords.x] = valToSet;
  addStateTally(coords, valToSet, columnTallies, rowTallies, 1);
  return true;
}

function validatePuzzleParams(width: number, height: number): PuzzleParams {
  if (width < 2) width = 2;
  if (height < 2) height = 2;
  if (width % 2 !== 0) {
    console.error(
      "Puzzle width must be even and at least 2; changing " +
        width +
        " to " +
        (width + 1)
    );
    width++;
  }
  if (height % 2 !== 0) {
    console.error(
      "Puzzle height must be even and at least 2; changing " +
        height +
        " to " +
        (height + 1)
    );
    height++;
  }
  return {
    width,
    height,
  };
}

function addStateTally(
  coords: Coordinates,
  state: CellState,
  columnTallies: ColorTallies[],
  rowTallies: ColorTallies[],
  valueToAdd: number
) {
  if (state === white) {
    columnTallies[coords.x].white += valueToAdd;
    rowTallies[coords.y].white += valueToAdd;
  }
  if (state === black) {
    columnTallies[coords.x].black += valueToAdd;
    rowTallies[coords.y].black += valueToAdd;
  }
}

function chooseStateForCoords(
  coords: Coordinates,
  width: number,
  height: number,
  columnTallies: ColorTallies[],
  rowTallies: ColorTallies[],
  rawStates: CellState[][],
  currentSeed: number
) {
  const maxPerColorPerColumn = height / 2;
  const maxPerColorPerRow = width / 2;
  const whitesMaxed =
    columnTallies[coords.x].white === maxPerColorPerColumn ||
    rowTallies[coords.y].white === maxPerColorPerRow;
  const blacksMaxed =
    columnTallies[coords.x].black === maxPerColorPerColumn ||
    rowTallies[coords.y].black === maxPerColorPerRow;
  const twoWhiteNeighborsTop =
    coords.y > 1 &&
    rawStates[coords.y - 1][coords.x] === white &&
    rawStates[coords.y - 2][coords.x] === white;
  const twoBlackNeighborsTop =
    coords.y > 1 &&
    rawStates[coords.y - 1][coords.x] === black &&
    rawStates[coords.y - 2][coords.x] === black;
  const twoWhiteNeighborsLeft =
    coords.x > 1 &&
    rawStates[coords.y][coords.x - 1] === white &&
    rawStates[coords.y][coords.x - 2] === white;
  const twoBlackNeighborsLeft =
    coords.x > 1 &&
    rawStates[coords.y][coords.x - 1] === black &&
    rawStates[coords.y][coords.x - 2] === black;
  const whiteAllowed =
    !whitesMaxed && !twoWhiteNeighborsTop && !twoWhiteNeighborsLeft;
  const blackAllowed =
    !blacksMaxed && !twoBlackNeighborsTop && !twoBlackNeighborsLeft;

  if (whiteAllowed && blackAllowed)
    return getRandomFilledCellState(currentSeed);
  else if (whiteAllowed && !blackAllowed) return white;
  else if (!whiteAllowed && blackAllowed) return black;
  else {
    // printValueFailure(
    //   coords,
    //   columnTallies,
    //   rowTallies,
    //   twoWhiteNeighborsLeft,
    //   twoBlackNeighborsLeft,
    //   twoWhiteNeighborsTop,
    //   twoBlackNeighborsTop
    // );
    return undefined;
  }
}

function printValueFailure(
  coords: Coordinates,
  columnTallies: ColorTallies[],
  rowTallies: ColorTallies[],
  twoWhiteNeighborsLeft: boolean,
  twoBlackNeighborsLeft: boolean,
  twoWhiteNeighborsTop: boolean,
  twoBlackNeighborsTop: boolean
) {
  console.log(
    `Failed to choose a value for (${coords.x}, ${coords.y}). ${
      columnTallies[coords.x].white
    } whites and ${columnTallies[coords.x].black} blacks were in the column. ${
      rowTallies[coords.y].white
    } whites and ${
      rowTallies[coords.y].black
    } blacks were in the row. Two white neighbors on left: ${twoWhiteNeighborsLeft}. Two black neighbors on left: ${twoBlackNeighborsLeft}. Two white neighbors on top: ${twoWhiteNeighborsTop}. Two black neighbors on top: ${twoBlackNeighborsTop}`
  );
}
