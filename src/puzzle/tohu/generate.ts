import { black, CellState, Coordinates, white } from "./types.js";
import { getRandomFilledCellState, indexToCoords } from "./utility.js";

type ColorTallies = {
  white: number;
  black: number;
};

//after 12x12 the puzzles get slow to generate
export function getRawRandom(
  width: number,
  height: number,
  seed?: number
): CellState[][] {
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

  const generated: CellState[][] = Array.from({ length: height }, (_) =>
    Array.from({ length: width }, (_) => 0)
  );
  let flatIndex = 0;
  let step = 0;
  if (seed === undefined)
    seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  const totalCells = width * height;
  const rowTallies: ColorTallies[] = Array.from({ length: height }, (_) => ({
    white: 0,
    black: 0,
  }));
  const columnTallies: ColorTallies[] = Array.from({ length: width }, (_) => ({
    white: 0,
    black: 0,
  }));

  let safety = 0;
  const safetyMax = 999999999;

  while (flatIndex < totalCells && safety < safetyMax) {
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
      if (flatIndex > 0) flatIndex--;
      step++;
      safety++;
      continue;
    }

    generated[coords.y][coords.x] = valToSet;
    addStateTally(coords, valToSet, columnTallies, rowTallies, 1);
    step++;
    flatIndex++;
    safety++;
  }
  if (safety === safetyMax)
    console.error("infinite loop!=======================");

  return generated;
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
