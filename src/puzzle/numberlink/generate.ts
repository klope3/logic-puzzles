import { GenerationResult, NumberGrid, Puzzle } from "./types";
import {
  debugLog,
  flatIndexToCoords,
  puzzleFromNumberGrid,
  randomSeedNumber,
} from "./utility.js";
import { mulberry32 } from "../../seededRandom.js";
import { solve } from "./solve.js";

export function generate(
  width: number,
  height: number,
  seed?: number,
  pairs?: number
): GenerationResult {
  seed = randomSeedNumber(seed);

  let attempts = 0;
  const attemptsMax = 999999;
  let seedOffset = 0;
  if (pairs === undefined) pairs = 5;
  const startTime = Date.now();
  let failures = 0;
  while (attempts < attemptsMax) {
    debugLog("starting a new grid");
    const nums = createEmptyNumberGrid(width, height);
    fillRandomPairs(nums, pairs, seed + seedOffset);
    const puzzle = puzzleFromNumberGrid(nums);
    if (solve(puzzle)) {
      puzzle.seed = seed;
      // console.log("done in " + attempts + " attempts with seed " + seed);
      return {
        puzzle,
        attempts,
        executionMs: Date.now() - startTime,
      };
    }

    seedOffset++;
    attempts++;
    failures++;
  }
  // console.error("Too many attempts!");
  return {
    puzzle: undefined,
    attempts,
    executionMs: Date.now() - startTime,
  };
}

function fillRandomPairs(numberGrid: NumberGrid, pairs: number, seed: number) {
  const width = numberGrid[0].length;
  const height = numberGrid.length;
  const totalCells = width * height;
  const openIndices = Array.from({ length: totalCells }, (_, i) => i);

  for (let i = 0; i < pairs; i++) {
    for (let j = 0; j < 2; j++) {
      const randIndex = Math.floor(
        mulberry32(seed + i + j) * openIndices.length
      );
      const randCoords = flatIndexToCoords(openIndices[randIndex], width);
      numberGrid[randCoords.y][randCoords.x] = i + 1;
      debugLog("filled a number at " + randCoords.x + ", " + randCoords.y);
      openIndices.splice(randIndex, 1);
    }
  }
}

function createEmptyNumberGrid(width: number, height: number): NumberGrid {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 0)
  );
}

export type PathCell = {
  left: boolean;
  up: boolean;
  right: boolean;
  down: boolean;
  coordinates: Vector2;
};

export type PathGrid = PathCell[][];

type PathCellNeighbors = {
  left: PathCell | undefined;
  up: PathCell | undefined;
  right: PathCell | undefined;
  down: PathCell | undefined;
  downLeft: PathCell | undefined;
  upLeft: PathCell | undefined;
  upRight: PathCell | undefined;
  downRight: PathCell | undefined;
};

// type DirectionConstraints = {
//   left: boolean | undefined;
//   up: boolean | undefined;
//   right: boolean | undefined;
//   down: boolean | undefined;
// };

type Vector2 = {
  x: number;
  y: number;
};

type Direction = "left" | "up" | "right" | "down";

// const permutations: PathCell[] = [
//   {
//     left: true,
//     up: false,
//     right: false,
//     down: false,
//   },
//   {
//     left: false,
//     up: true,
//     right: false,
//     down: false,
//   },
//   {
//     left: false,
//     up: false,
//     right: true,
//     down: false,
//   },
//   {
//     left: false,
//     up: false,
//     right: false,
//     down: true,
//   },
//   {
//     left: true,
//     up: false,
//     right: true,
//     down: false,
//   },
//   {
//     left: false,
//     up: true,
//     right: true,
//     down: false,
//   },
//   {
//     left: true,
//     up: false,
//     right: false,
//     down: true,
//   },
//   {
//     left: false,
//     up: false,
//     right: true,
//     down: true,
//   },
//   {
//     left: true,
//     up: true,
//     right: false,
//     down: false,
//   },
//   {
//     left: false,
//     up: true,
//     right: true,
//     down: false,
//   },
// ];

// const generated = generateGrid(5, 5);
// printGrid(generated);

export function generateGridAlt(
  width: number,
  height: number,
  seed: number
): PathGrid {
  const grid: PathGrid = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => ({
      left: false,
      up: false,
      right: false,
      down: false,
      coordinates: {
        x,
        y,
      },
    }))
  );

  drawInitialPath(grid, seed);
  let pathNumber = 1;
  let cellsLeft = grid
    .flat()
    .filter((cell) => !doesCellHaveSegment(cell)).length;
  let safety = 0;
  const limit = Number.MAX_SAFE_INTEGER;
  let passesWithNoFills = 0;
  const passesWithNoFillsLimit = 20;
  while (
    pathNumber <= limit &&
    cellsLeft > 0 &&
    passesWithNoFills < passesWithNoFillsLimit &&
    safety < 999
  ) {
    const cellsFilled = drawWrappingPath(grid, seed, pathNumber);
    console.log(cellsFilled + " cells filled; " + cellsLeft + " cells left");
    if (cellsFilled === 0) {
      passesWithNoFills++;
    } else {
      passesWithNoFills = 0;
    }
    cellsLeft -= cellsFilled;
    safety++;
    pathNumber++;
  }
  if (safety === 999) {
    console.error("infinite loop drawing wrapping paths");
  }
  cleanUpSingleEmpties(grid, seed);
  cleanUpShortPaths(grid, seed);
  const numberGrid = extractNumberGrid(grid);
  console.log("Finished grid:");
  console.log(numberGrid);

  return grid;
}

function extractNumberGrid(grid: PathGrid): NumberGrid {
  const numberGrid: NumberGrid = Array.from({ length: grid.length }, () =>
    Array.from({ length: grid[0].length }, () => 0)
  );
  const flat = grid.flat();
  const endpoints: Vector2[] = flat
    .filter((cell) => isCellPartiallyFilled(cell))
    .map((cell) => cell.coordinates);
  const usedEndpoints: Vector2[] = [];
  const paths: Vector2[][] = [];
  for (let i = 0; i < endpoints.length; i++) {
    if (findCoordsIn(endpoints[i], usedEndpoints)) continue;
    const path = followPathToEnd(grid, endpoints[i]);
    usedEndpoints.push(path[0]);
    usedEndpoints.push(path[path.length - 1]);
    paths.push(path);
  }
  console.log("Paths:");
  console.log(paths);
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    const endpoint1 = path[0];
    const endpoint2 = path[path.length - 1];
    numberGrid[endpoint1.y][endpoint1.x] = i + 1;
    numberGrid[endpoint2.y][endpoint2.x] = i + 1;
  }

  return numberGrid;
}

function followPathToEnd(grid: PathGrid, firstEndpoint: Vector2) {
  console.log(
    "Following path starting at " + firstEndpoint.x + ", " + firstEndpoint.y
  );
  const points: Vector2[] = [];
  let curPoint = firstEndpoint;
  let cameFromPoint: Vector2 | undefined;
  while (true) {
    const cell = grid[curPoint.y][curPoint.x];
    if (!cameFromPoint) {
      const nextDirection = getDirectionFromCell(cell);
      const nextDirectionDelta = getOrthoDirectionDelta(nextDirection);
      cameFromPoint = curPoint;
      points.push(curPoint);
      curPoint = vectorSum(curPoint, nextDirectionDelta);
    } else if (isCellPartiallyFilled(cell)) {
      points.push(curPoint);
      break;
    } else {
      const cameFromDirection = getOrthoDirectionFromTo(
        curPoint,
        cameFromPoint
      );
      const nextDirection = getDirectionFromCell(cell, cameFromDirection);
      const nextDirectionDelta = getOrthoDirectionDelta(nextDirection);
      cameFromPoint = curPoint;
      points.push(curPoint);
      curPoint = vectorSum(curPoint, nextDirectionDelta);
    }
  }
  console.log("Reached end of path:");
  console.log(points);
  return points;
}

function getDirectionFromCell(
  cell: PathCell,
  directionToIgnore?: Direction
): Direction {
  if (!isCellPartiallyFilled(cell) && directionToIgnore === undefined) {
    console.error(
      "Warning: getting direction from a cell that's not partially filled, but no direction to ignore was specififed!"
    );
  }
  type DirectionBoolean = {
    label: Direction;
    bool: boolean;
  };
  const directionBooleans: DirectionBoolean[] = [
    {
      label: "left",
      bool: cell.left,
    },
    {
      label: "up",
      bool: cell.up,
    },
    {
      label: "right",
      bool: cell.right,
    },
    {
      label: "down",
      bool: cell.down,
    },
  ];
  const match = directionBooleans.find(
    (db) => db.label !== directionToIgnore && db.bool
  );
  if (!match) {
    console.error("Warning: Couldn't resolve correct direction for cell:");
    console.error(cell);
    return "left";
  }
  return match.label;
}

function cleanUpSingleEmpties(grid: PathGrid, seed: number) {
  console.log("cleaning up single empties");
  const width = grid[0].length;
  const height = grid.length;
  const allCoords = Array.from({ length: width * height }, (_, i) =>
    flatIndexToCoords(i, width)
  );
  const singleEmptyCoords = allCoords.filter((coords) => {
    const cellHere = grid[coords.y][coords.x];
    if (doesCellHaveSegment(cellHere)) return false;
    const neighborsHere = getNeighborsAtCoords(coords, grid);
    const orthogonals = [
      neighborsHere.left,
      neighborsHere.up,
      neighborsHere.right,
      neighborsHere.down,
    ].filter((cell) => cell !== undefined);
    const filledNeighborCount = orthogonals.filter(
      (cell) => cell && doesCellHaveSegment(cell)
    ).length;
    return filledNeighborCount === orthogonals.length;
  });
  console.log("Found " + singleEmptyCoords.length + " single empties");
  for (let i = 0; i < singleEmptyCoords.length; i++) {
    const coords = singleEmptyCoords[i];
    // const { left, upLeft, up, upRight, right, downRight, down, downLeft } =
    //   getNeighborsAtCoords(coords, grid);
    // const options: PathCell[] = [];
    // const goingLeftWouldDoubleBack =
    //   left &&
    //   ((upLeft && left.up && upLeft.right) ||
    //     (downLeft && left.down && downLeft.right));
    // const goingUpWouldDoubleBack =
    //   up &&
    //   ((upLeft && up.left && upLeft.down) ||
    //     (upRight && up.right && upRight.down));
    // const goingRightWouldDoubleBack =
    //   right &&
    //   ((upRight && right.up && upRight.left) ||
    //     (downRight && right.down && downRight.left));
    // const goingDownWouldDoubleBack =
    //   down &&
    //   ((downRight && down.right && downRight.up) ||
    //     (downLeft && down.left && downLeft.up));
    // if (left && isCellPartiallyFilled(left) && !goingLeftWouldDoubleBack)
    //   options.push(left);
    // if (up && isCellPartiallyFilled(up) && !goingUpWouldDoubleBack)
    //   options.push(up);
    // if (right && isCellPartiallyFilled(right) && !goingRightWouldDoubleBack)
    //   options.push(right);
    // if (down && isCellPartiallyFilled(down) && !goingDownWouldDoubleBack)
    //   options.push(down);
    const options = getPartialCellMergeOptions(coords, grid);
    if (options.length === 0) {
      console.log("A single empty was impossible to fill");
      continue;
    }
    const randIndex = Math.floor(mulberry32(seed + i) * options.length);
    const randChoice = options[randIndex];
    const direction = getOrthoDirectionFromTo(coords, randChoice.coordinates);
    drawPathSegment(grid, coords, direction);
  }
}

function cleanUpShortPaths(grid: PathGrid, seed: number) {
  const width = grid[0].length;
  const height = grid.length;
  const lengthTwoPaths: PathCell[][] = [];
  const ignoreCells: PathCell[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = grid[y][x];
      if (!isCellPartiallyFilled(cell) || ignoreCells.includes(cell)) continue;
      const neighbors = getOrthogonalNeighborsAtCoords(cell.coordinates, grid);
      let otherCell = {} as PathCell; //if this cell is partially filled, it WILL have a defined partner cell
      if (cell.left && neighbors.left && isCellPartiallyFilled(neighbors.left))
        otherCell = neighbors.left;
      else if (cell.up && neighbors.up && isCellPartiallyFilled(neighbors.up))
        otherCell = neighbors.up;
      else if (
        cell.right &&
        neighbors.right &&
        isCellPartiallyFilled(neighbors.right)
      )
        otherCell = neighbors.right;
      else if (
        cell.down &&
        neighbors.down &&
        isCellPartiallyFilled(neighbors.down)
      )
        otherCell = neighbors.down;
      else continue;
      lengthTwoPaths.push([cell, otherCell]);
      ignoreCells.push(otherCell); //to avoid finding the same path twice, ignore this cell next time it's visited
    }
  }
  const pathsToIgnore: PathCell[][] = [];
  for (let i = 0; i < lengthTwoPaths.length; i++) {
    if (pathsToIgnore.includes(lengthTwoPaths[i])) continue;
    if (mulberry32(seed + i) < 0.5) lengthTwoPaths[i].reverse();
    for (const cell of lengthTwoPaths[i]) {
      console.log(
        `Trying to merge ${cell.coordinates.x}, ${cell.coordinates.y} with another path`
      );
      const options = getPartialCellMergeOptions(cell.coordinates, grid);
      console.log("It has these options:");
      console.log(options);
      if (options.length === 0) continue;
      const randIndex = mulberry32(seed + i) & options.length;
      const cellToMergeWith = options[randIndex];
      const otherLengthTwoPathWithThisCell = lengthTwoPaths.find((path) =>
        path.includes(cellToMergeWith)
      );
      if (otherLengthTwoPathWithThisCell)
        pathsToIgnore.push(otherLengthTwoPathWithThisCell);
      const direction = getOrthoDirectionFromTo(
        cell.coordinates,
        cellToMergeWith.coordinates
      );
      drawPathSegment(grid, cell.coordinates, direction);
      console.log(
        `Merged ${cell.coordinates.x}, ${cell.coordinates.y} ${direction}`
      );
      break;
    }
  }
}

//for a cell that's partially filled, get all the options it has for merging with an adjacent existing path
function getPartialCellMergeOptions(
  partialCellCoords: Vector2,
  grid: PathGrid
) {
  const { left, upLeft, up, upRight, right, downRight, down, downLeft } =
    getNeighborsAtCoords(partialCellCoords, grid);
  const self = grid[partialCellCoords.y][partialCellCoords.x];
  const options: PathCell[] = [];
  const goingLeftWouldDoubleBack =
    left &&
    ((self.up && up && up.left) ||
      (self.up && left && left.up) ||
      (self.down && left && left.down) ||
      (self.down && down && down.left) ||
      (upLeft && left.up && upLeft.right) ||
      (downLeft && left.down && downLeft.right));
  const goingUpWouldDoubleBack =
    up &&
    ((self.right && up && up.right) ||
      (self.right && right && right.up) ||
      (self.left && left && left.up) ||
      (self.left && up && up.left) ||
      (upLeft && up.left && upLeft.down) ||
      (upRight && up.right && upRight.down));
  const goingRightWouldDoubleBack =
    right &&
    ((self.up && up && up.right) ||
      (self.up && right && right.up) ||
      (self.down && right && right.down) ||
      (self.down && down && down.right) ||
      (upRight && right.up && upRight.left) ||
      (downRight && right.down && downRight.left));
  const goingDownWouldDoubleBack =
    down &&
    ((self.left && down && down.left) ||
      (self.right && down && down.right) ||
      (self.left && left && left.down) ||
      (self.right && right && right.down) ||
      (downRight && down.right && downRight.up) ||
      (downLeft && down.left && downLeft.up));
  if (
    left &&
    isCellPartiallyFilled(left) &&
    !left.right &&
    !goingLeftWouldDoubleBack
  )
    options.push(left);
  if (up && isCellPartiallyFilled(up) && !up.down && !goingUpWouldDoubleBack)
    options.push(up);
  if (
    right &&
    isCellPartiallyFilled(right) &&
    !right.left &&
    !goingRightWouldDoubleBack
  )
    options.push(right);
  if (
    down &&
    isCellPartiallyFilled(down) &&
    !down.up &&
    !goingDownWouldDoubleBack
  )
    options.push(down);

  return options;
}

function drawWrappingPath(grid: PathGrid, seed: number, pathNumber: number) {
  console.log("========================");
  console.log("trying to draw wrapping path " + pathNumber);
  const width = grid[0].length;
  const height = grid.length;
  const allCoords = Array.from({ length: width * height }, (_, i) =>
    flatIndexToCoords(i, width)
  );
  const curPathsPerimeter = allCoords.filter((coords) => {
    if (doesCellHaveSegment(grid[coords.y][coords.x])) {
      return false;
    }
    const neighborsHere = getNeighborsAtCoords(coords, grid);
    const neighborsWithAnySegment = neighborsAsArray(neighborsHere).filter(
      (neighbor) => neighbor && doesCellHaveSegment(neighbor)
    );
    return neighborsWithAnySegment.length > 0;
  });

  const randIndex = Math.floor(
    mulberry32(seed + pathNumber) * curPathsPerimeter.length
  );
  const randStart = curPathsPerimeter[randIndex];
  let curCoords = randStart;
  let drawn = 0;
  const limit = Math.floor(curPathsPerimeter.length / 2);
  const filledCoords = [randStart];
  console.log("Start drawing wrapping path at:");
  console.log(randStart);

  while (drawn < limit) {
    const neighbors = getNeighborsAtCoords(curCoords, grid);
    const orthogonals = [
      neighbors.left,
      neighbors.up,
      neighbors.right,
      neighbors.down,
    ];
    const nextCellOptions = orthogonals.filter(
      (cell) => {
        if (
          !cell ||
          doesCellHaveSegment(cell) ||
          !findCoordsIn(cell.coordinates, curPathsPerimeter)
        )
          return false;
        const neighbors = getNeighborsAtCoords(cell.coordinates, grid);
        const orthogonals = [
          neighbors.left,
          neighbors.up,
          neighbors.right,
          neighbors.down,
        ];
        const doublesBack =
          orthogonals.filter(
            (cell) => cell && findCoordsIn(cell.coordinates, filledCoords)
          ).length === 2;
        return !doublesBack;
      }
      // (cell) =>
      //   cell &&
      //   !doesCellHaveSegment(cell) &&
      //   findCoordsIn(cell.coordinates, curPathsPerimeter)
    );
    // const nextCell = orthogonals.find((cell) => {
    //   if (!cell || doesCellHaveSegment(cell)) return false;
    //   const neighborsHere = getNeighborsAtCoords(cell.coordinates, grid);
    //   const neighborsArr = neighborsAsArray(neighborsHere);
    //   const orthogonals = [
    //     neighborsHere.left,
    //     neighborsHere.up,
    //     neighborsHere.right,
    //     neighborsHere.down,
    //   ];
    //   return !!neighborsArr.find((cell) => cell && doesCellHaveSegment(cell));
    // });

    console.log("Have " + nextCellOptions.length + " options");
    const randIndex = Math.floor(
      mulberry32(seed + pathNumber) * nextCellOptions.length
    );
    const nextCell = nextCellOptions[randIndex];
    if (!nextCell) break;
    else {
      const direction = getOrthoDirectionFromTo(
        curCoords,
        nextCell.coordinates
      );
      drawPathSegment(grid, curCoords, direction);
      curCoords = nextCell.coordinates;
      filledCoords.push(curCoords);
      drawn++;
    }
  }
  return drawn > 0 ? drawn + 1 : 0;

  // console.log("initial perimter is:");
  // console.log(curPathsPerimeter);
  // const orderedPerimeter = [curPathsPerimeter[0]];
  // let safety = 0;
  // while (safety < 999) {
  //   if (orderedPerimeter.length === curPathsPerimeter.length) break;
  //   const lastAdded = orderedPerimeter[orderedPerimeter.length - 1];
  //   const neighbors = getNeighborsAtCoords(lastAdded, grid);
  //   const orthogonals = [
  //     neighbors.left,
  //     neighbors.up,
  //     neighbors.right,
  //     neighbors.down,
  //   ];
  //   const nextNeighborOnPerimeter = orthogonals.find(
  //     (cell) =>
  //       cell &&
  //       findCoordsIn(cell.coordinates, curPathsPerimeter) &&
  //       !findCoordsIn(cell.coordinates, orderedPerimeter)
  //   );
  //   if (!nextNeighborOnPerimeter) {
  //     console.log(
  //       "unable to order the full perimeter, probably due to grid edge"
  //     );
  //     break;
  //   }
  //   orderedPerimeter.push(nextNeighborOnPerimeter.coordinates);
  //   safety++;
  // }
  // if (safety === 999) {
  //   console.error("infinite loop in ordering perimeter");
  // }
  // if (mulberry32(seed + pathNumber) < 0.5) {
  //   orderedPerimeter.reverse();
  // }

  // let curIndex = Math.floor(
  //   mulberry32(seed + pathNumber) * orderedPerimeter.length
  // );
  // let drawn = 0;
  // const limit = Math.floor(orderedPerimeter.length * 0.5);
  // console.log("draw starting at:");
  // console.log(orderedPerimeter[curIndex]);
  // while (drawn < limit && drawn < orderedPerimeter.length - 1) {
  //   const nextIndex =
  //     curIndex === orderedPerimeter.length - 1 ? 0 : curIndex + 1;
  //   if (
  //     !areCoordinatesOrthogonal(
  //       orderedPerimeter[curIndex],
  //       orderedPerimeter[nextIndex]
  //     )
  //   ) {
  //     break;
  //   }
  //   const direction = getOrthoDirectionFromTo(
  //     orderedPerimeter[curIndex],
  //     orderedPerimeter[nextIndex]
  //   );
  //   drawPathSegment(grid, orderedPerimeter[curIndex], direction);
  //   console.log("drew a segment " + direction + " from:");
  //   console.log(orderedPerimeter[curIndex]);
  //   drawn++;
  //   curIndex = nextIndex;
  // }
  // return drawn > 0 ? drawn + 1 : 0;

  // const randIndex = Math.floor(
  //   mulberry32(seed + pathNumber) * curPathsPerimeter.length
  // );
  // const randStart = curPathsPerimeter[randIndex];
  // console.log("Start drawing wrapping path at:");
  // console.log(randStart);
  // const { left, up, right, down } = getNeighborsAtCoords(randStart, grid);
  // const orthogonals = [left, up, right, down];
  // const nextCellOptions = orthogonals.filter((cell) => {
  //   if (!cell || doesCellHaveSegment(cell)) return false;
  //   const neighborsHere = getNeighborsAtCoords(cell.coordinates, grid);
  //   const neighborsWithAnySegment = neighborsAsArray(neighborsHere).filter(
  //     (neighbor) => neighbor && doesCellHaveSegment(neighbor)
  //   );
  //   return neighborsWithAnySegment.length > 0;
  // });
  // console.log("next cell options are:");
  // console.log(nextCellOptions);

  // const nextCell =
  //   nextCellOptions.length < 2 ? nextCellOptions[0] : nextCellOptions[1];
  // if (!nextCell) {
  //   console.error("Wrapping path had no options!");
  //   return;
  // }
  // let curDirection = getOrthoDirectionFromTo(randStart, nextCell.coordinates);
  // drawPathSegment(grid, randStart, curDirection);
  // let curCell: PathCell | undefined = nextCell;

  // if (curCell && (curDirection === "up" || curDirection === "down")) {
  //   const neighbors = getNeighborsAtCoords(curCell.coordinates, grid);
  //   const neighborsToCheck = [neighbors.left, neighbors.right];
  //   const neighborWithSegment = neighborsToCheck.find(
  //     (cell) => cell && doesCellHaveSegment(cell)
  //   );
  //   if (neighborWithSegment) {
  //     console.log("maintain course because this neighbor has a segment:");
  //     console.log(neighborWithSegment);
  //     drawPathSegment(grid, curCell.coordinates, curDirection);
  //     curCell = curDirection === "up" ? neighbors.up : neighbors.down;
  //   } else {
  //     console.log("no neighbors on left or right; must change direction");
  //   }
  // }
}

function findCoordsIn(coords: Vector2, arr: Vector2[]) {
  return !!arr.find((c) => areVectorsEqual(c, coords));
}

function drawInitialPath(grid: PathGrid, seed: number) {
  const width = grid[0].length;
  const height = grid.length;
  const maxLineLength = width < height ? width - 1 : height - 1;
  const minLineLength = maxLineLength * 0.5;
  let randShift = 0;
  const randPointA = randomGridCoordinates(grid, seed);
  randShift++;
  let randPointB = randomGridCoordinates(grid, seed + randShift);
  randShift++;
  let distAToB = getTaxicabDistance(randPointA, randPointB);
  let safety = 0;
  while (safety < 999 && distAToB.distance < minLineLength) {
    randPointB = randomGridCoordinates(grid, seed + randShift);
    distAToB = getTaxicabDistance(randPointA, randPointB);
    randShift++;
    safety++;
  }
  if (safety === 999) {
    console.log("Infinite loop in drawInitialPath");
  }
  if (distAToB.deltaX < distAToB.deltaY) {
    randPointB.x = randPointA.x;
  } else {
    randPointB.y = randPointA.y;
  }

  drawPathFromTo(grid, randPointA, randPointB);
}

function doesCellHaveSegment(cell: PathCell) {
  return cell.left || cell.up || cell.right || cell.down;
}

function isCellPartiallyFilled(cell: PathCell) {
  return (
    [cell.left, cell.up, cell.right, cell.down].filter((b) => b).length === 1
  );
}

function getTaxicabDistance(a: Vector2, b: Vector2) {
  return {
    deltaX: Math.abs(a.x - b.x),
    deltaY: Math.abs(a.y - b.y),
    distance: Math.abs(a.x - b.x) + Math.abs(a.y - b.y),
  };
}

function randomGridCoordinates(grid: PathGrid, seed: number): Vector2 {
  const width = grid[0].length;
  const height = grid.length;
  return {
    x: Math.floor(mulberry32(seed) * width),
    y: Math.floor(mulberry32(seed + 1) * height),
  };
}

function drawPathFromTo(grid: PathGrid, a: Vector2, b: Vector2) {
  const pathDirection = getOrthoDirectionFromTo(a, b);
  const delta = getOrthoDirectionDelta(pathDirection);
  let curCoords = { ...a };

  let safety = 0;
  while (safety < 999 && !areVectorsEqual(curCoords, b)) {
    drawPathSegment(grid, curCoords, pathDirection);
    curCoords = vectorSum(curCoords, delta);
    safety++;
  }
  if (safety === 999) {
    console.log("Infinite loop in drawPathFromTo");
  }
}

function drawPathSegment(grid: PathGrid, start: Vector2, direction: Direction) {
  const startCell = grid[start.y][start.x];
  if (direction === "left") {
    startCell.left = true;
    grid[start.y][start.x - 1].right = true;
  } else if (direction === "up") {
    startCell.up = true;
    grid[start.y - 1][start.x].down = true;
  } else if (direction === "right") {
    startCell.right = true;
    grid[start.y][start.x + 1].left = true;
  } else {
    startCell.down = true;
    grid[start.y + 1][start.x].up = true;
  }
}

function vectorSum(a: Vector2, b: Vector2) {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

function areVectorsEqual(a: Vector2, b: Vector2) {
  return a.x === b.x && a.y === b.y;
}

function areCoordinatesOrthogonal(a: Vector2, b: Vector2) {
  return getTaxicabDistance(a, b).distance === 1;
}

function getOrthoDirectionDelta(direction: Direction): Vector2 {
  switch (direction) {
    case "left":
      return {
        x: -1,
        y: 0,
      };
    case "up":
      return {
        x: 0,
        y: -1,
      };
    case "right":
      return {
        x: 1,
        y: 0,
      };
    case "down":
      return {
        x: 0,
        y: 1,
      };
  }
}

//assumes the two coords are orthogonal to each other!
function getOrthoDirectionFromTo(start: Vector2, end: Vector2): Direction {
  if (end.x < start.x) return "left";
  if (end.x > start.x) return "right";
  if (end.y < start.y) return "up";
  return "down";
}

// function isInBounds(coords: Vector2, grid: PathGrid) {
//   return (
//     coords.x >= 0 &&
//     coords.y >= 0 &&
//     coords.x < grid[0].length &&
//     coords.y < grid.length
//   );
// }

// export function generateGrid(width: number, height: number) {
//   const grid: PathGrid = Array.from({ length: height }, () => []);

//   // for (let y = 0; y < height; y++) {
//   //   for (let x = 0; x < width; x++) {
//   //     const constraints = getConstraintsForCellCoords({ x, y }, grid);
//   //     grid[y][x] = pickRandomPermuationWithConstraint(
//   //       constraints,
//   //       coordsToFlatIndex({ x, y }, width)
//   //     );
//   //   }
//   // }

//   const totalCells = width * height;
//   let curIndex = 0;
//   while (curIndex < totalCells) {
//     const coords = flatIndexToCoords(curIndex, width);
//     const neighbors = getNeighborsAtCoords(coords, grid);
//     const puzzleRightEdge = coords.x === width - 1;
//     const puzzleBottomEdge = coords.y === height - 1;

//     const options = permutations.filter((perm) => {
//       const constraints: DirectionConstraints = {
//         left: undefined,
//         up: undefined,
//         right: undefined,
//         down: undefined,
//       };

//       constraints.left =
//         neighbors.left === undefined ? false : neighbors.left.right;
//       constraints.up = neighbors.up === undefined ? false : neighbors.up.down;

//       if (puzzleRightEdge) {
//         constraints.right = false;
//       } else if (neighbors.right !== undefined) {
//         constraints.right = neighbors.right.left;
//       }

//       if (puzzleBottomEdge) {
//         constraints.down = false;
//       } else if (neighbors.down !== undefined) {
//         constraints.down = neighbors.down.up;
//       }

//       if (
//         (constraints.left !== undefined && constraints.left !== perm.left) ||
//         (constraints.up !== undefined && constraints.up !== perm.up) ||
//         (constraints.right !== undefined && constraints.right !== perm.right) ||
//         (constraints.down !== undefined && constraints.down !== perm.down)
//       )
//         return false;

//       if (
//         (perm.left &&
//           perm.up &&
//           neighbors.left !== undefined &&
//           neighbors.left.right &&
//           neighbors.left.up) ||
//         (perm.left &&
//           perm.up &&
//           neighbors.up !== undefined &&
//           neighbors.up.down &&
//           neighbors.up.left) ||
//         (perm.up &&
//           perm.right &&
//           neighbors.up !== undefined &&
//           neighbors.up.down &&
//           neighbors.up.right) ||
//         (perm.left &&
//           perm.down &&
//           neighbors.left !== undefined &&
//           neighbors.left.right &&
//           neighbors.left.down)
//       )
//         return false;
//       return true;
//     });

//     if (options.length === 0) {
//       grid[coords.y][coords.x] = {
//         left: false,
//         up: false,
//         right: false,
//         down: false,
//         coordinates: {
//           x: coords.x,
//           y: coords.y
//         }
//       };
//       curIndex++;
//       continue;
//     }

//     const seed = Math.floor(mulberry32(0) * Number.MAX_SAFE_INTEGER);
//     const randIndex = Math.floor(mulberry32(seed + curIndex) * options.length);
//     grid[coords.y][coords.x] = options[randIndex];

//     curIndex++;
//   }

//   return grid;
// }

function neighborsAsArray(neighbors: PathCellNeighbors) {
  return [
    neighbors.downLeft,
    neighbors.left,
    neighbors.upLeft,
    neighbors.up,
    neighbors.upRight,
    neighbors.right,
    neighbors.downRight,
    neighbors.down,
  ];
}

function getNeighborsAtCoords(
  { x, y }: Vector2,
  grid: PathGrid
): PathCellNeighbors {
  return {
    left: grid[y][x - 1],
    up: grid[y - 1] ? grid[y - 1][x] : undefined,
    right: grid[y][x + 1],
    down: grid[y + 1] ? grid[y + 1][x] : undefined,
    downLeft: grid[y + 1] ? grid[y + 1][x - 1] : undefined,
    upLeft: grid[y - 1] ? grid[y - 1][x - 1] : undefined,
    upRight: grid[y - 1] ? grid[y - 1][x + 1] : undefined,
    downRight: grid[y + 1] ? grid[y + 1][x + 1] : undefined,
  };
}

function getOrthogonalNeighborsAtCoords({ x, y }: Vector2, grid: PathGrid) {
  const all = getNeighborsAtCoords({ x, y }, grid);
  return {
    left: all.left,
    up: all.up,
    right: all.right,
    down: all.down,
  };
}

// // function getConstraintsForCellCoords(
// //   { x, y }: Coordinates,
// //   grid: PathGrid
// // ): DirectionConstraints {
// //   const constraints: DirectionConstraints = {
// //     left: undefined,
// //     up: undefined,
// //     right: undefined,
// //     down: undefined,
// //   };

// //   const width = grid[0].length;
// //   const height = grid.length;
// //   const puzzleRightEdge = x === width - 1;
// //   const puzzleBottomEdge = y === height - 1;

// //   const neighbors = getNeighborsAtCoords({ x, y }, grid);
// //   constraints.left =
// //     neighbors.left === undefined ? false : neighbors.left.right;
// //   constraints.up = neighbors.up === undefined ? false : neighbors.up.down;

// //   if (puzzleRightEdge) {
// //     constraints.right = false;
// //   } else if (neighbors.right !== undefined) {
// //     constraints.right = neighbors.right.left;
// //   }

// //   if (puzzleBottomEdge) {
// //     constraints.down = false;
// //   } else if (neighbors.down !== undefined) {
// //     constraints.down = neighbors.down.up;
// //   }

// //   return constraints;
// // }

// // function pickRandomPermuationWithConstraint(
// //   { left, up, right, down }: DirectionConstraints,
// //   flatIndex: number
// // ): PathCell {
// //   const options = permutations.filter(
// //     (perm) =>
// //       (left === undefined || left === perm.left) &&
// //       (up === undefined || up === perm.up) &&
// //       (right === undefined || right === perm.right) &&
// //       (down === undefined || down === perm.down)
// //   );
// //   if (options.length === 0) {
// //     return {
// //       left: false,
// //       up: false,
// //       right: false,
// //       down: false,
// //     };
// //   }
// //   const seed = Math.floor(mulberry32(0) * Number.MAX_SAFE_INTEGER);
// //   const randIndex = Math.floor(mulberry32(seed + flatIndex) * options.length);
// //   return options[randIndex];
// // }

// function getCellVisual(cell: PathCell) {
//   const { left, up, right, down } = cell;
//   if (left && up && !right && !down) return "┘ ";
//   if (left && right && !up && !down) return "——";
//   if (left && down && !up && !right) return "┐ ";
//   if (up && right && !left && !down) return "└—";
//   if (down && right && !left && !up) return "┌—";
//   if (up && down && !left && !right) return "| ";
//   if (!up && !down && !left && !right) return ". ";

//   if (left && !up && !right && !down) return "- ";
//   if (right && !left && !up && !down) return " -";
//   if (up && !left && !right && !down) return "' ";
//   if (down && !left && !up && !right) return ", ";

//   // if ([left, up, right, down].filter((d) => d).length === 1) return "X "; //endpoint

//   return "? ";
// }

// function printGrid(grid: PathGrid) {
//   for (let y = 0; y < grid.length; y++) {
//     let str = "";
//     for (let x = 0; x < grid[0].length; x++) {
//       str += getCellVisual(grid[y][x]);
//     }
//     console.log(str);
//   }
//   // if (left && up && !right && !down) return "┘ ";
//   // if (left && right && !up && !down) return "——";
//   // if (left && down && !up && !right) return "┐ ";
//   // if (up && right && !left && !down) return "└—";
//   // if (down && right && !left && !up) return "┌—";
//   // if (up && down) return "| ";
// }

// // function coordsToFlatIndex(coords: Coordinates, gridWidth: number) {
// //   return gridWidth * coords.y + coords.x;
// // }
