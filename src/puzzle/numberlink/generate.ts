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

type Vector2 = {
  x: number;
  y: number;
};

type Direction = "left" | "up" | "right" | "down";

export function generateFallback(
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
  return points;
}

function getDirectionFromCell(
  cell: PathCell,
  directionToIgnore?: Direction
): Direction {
  if (!isCellPartiallyFilled(cell) && directionToIgnore === undefined) {
    console.warn(
      "Getting direction from a cell that's not partially filled, but no direction to ignore was specififed!"
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
    console.error("Couldn't resolve correct direction for cell:");
    console.error(cell);
    return "left";
  }
  return match.label;
}

function cleanUpSingleEmpties(grid: PathGrid, seed: number) {
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
  for (let i = 0; i < singleEmptyCoords.length; i++) {
    const coords = singleEmptyCoords[i];
    const options = getPartialCellMergeOptions(coords, grid);
    if (options.length === 0) {
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
      const options = getPartialCellMergeOptions(cell.coordinates, grid);
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

  while (drawn < limit) {
    const neighbors = getNeighborsAtCoords(curCoords, grid);
    const orthogonals = [
      neighbors.left,
      neighbors.up,
      neighbors.right,
      neighbors.down,
    ];
    const nextCellOptions = orthogonals.filter((cell) => {
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
    });

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
    console.error("Infinite loop in drawInitialPath");
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
    console.error("Infinite loop in drawPathFromTo");
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
