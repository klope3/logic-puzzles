import { drawPathSegment, getOrthoDirectionFromTo } from "./gridLogic";
import {
  NumberGrid,
  SolvingPath,
  Vector2,
  SolvingData,
  PathGrid,
  PathCell,
  SolvingCell,
} from "./types";
import {
  createEmptyPathGrid,
  debugLog,
  getCoordsString,
  getNeighborCells,
  isInBounds,
} from "./utility.js";

export function solve(puzzle: NumberGrid): PathGrid | undefined {
  const solvingData = createEmptySolvingData(puzzle);
  startAllPaths(solvingData);

  let safety = 0;
  const safetyMax = 99999;
  let completePaths = 0;
  while (safety < safetyMax) {
    let deductionsThisPass = 0;
    completePaths = 0;
    for (const p of solvingData.paths) {
      const pathStartCoords = p.cells[0].coordinates;
      const pathEndCoords = p.cells[p.cells.length - 1].coordinates;
      const pathComplete =
        p.cells.length > 1 &&
        solvingData.unsolved[pathStartCoords.y][pathStartCoords.x] ===
          p.number &&
        solvingData.unsolved[pathEndCoords.y][pathEndCoords.x] === p.number;
      if (pathComplete) {
        completePaths++;
        continue;
      }

      if (tryNecessaryPathExtension(solvingData, p)) deductionsThisPass++;
    }
    if (deductionsThisPass === 0) break;
    safety++;
  }
  if (safety < safetyMax) {
    if (completePaths === solvingData.numberPairCount) {
      debugLog("SOLVED in " + safety + " passes");
      return pathGridFromSolvingData(solvingData);
    }
    debugLog("puzzle solving FAILED======================");
    return undefined;
  } else {
    console.error("Infinite loop!");
    return undefined;
  }
}

function pathGridFromSolvingData(solvingData: SolvingData): PathGrid {
  const width = solvingData.unsolved[0].length;
  const height = solvingData.unsolved.length;
  const pathGrid = createEmptyPathGrid(width, height);
  for (const path of solvingData.paths) {
    for (let i = 1; i < path.cells.length; i++) {
      const prevCell = path.cells[i - 1];
      const curCell = path.cells[i];
      const cameFromDirection = getOrthoDirectionFromTo(
        curCell.coordinates,
        prevCell.coordinates
      );
      drawPathSegment(pathGrid, curCell.coordinates, cameFromDirection);
    }
  }
  return pathGrid;
}

function createEmptySolvingData(puzzle: NumberGrid): SolvingData {
  const data: SolvingData = {
    unsolved: puzzle,
    cells: Array.from({ length: puzzle.length }, (_) => []),
    paths: [],
    numberPairCount: 0,
  };
  const numbers = new Set<number>();
  for (let y = 0; y < puzzle.length; y++) {
    for (let x = 0; x < puzzle[0].length; x++) {
      if (puzzle[y][x] > 0) numbers.add(puzzle[y][x]);
      data.cells[y][x] = {
        coordinates: { x, y },
        pathParent: undefined,
      };
    }
  }
  data.numberPairCount = numbers.size;
  return data;
}

function startAllPaths(solvingData: SolvingData) {
  const { unsolved, cells, paths } = solvingData;
  for (let y = 0; y < cells.length; y++) {
    for (let x = 0; x < cells[0].length; x++) {
      const coords = cells[y][x].coordinates;
      const numHere = unsolved[coords.y][coords.x];
      if (numHere === 0) continue;
      debugLog("starting a path for " + numHere);
      const path: SolvingPath = {
        number: numHere,
        cells: [cells[y][x]],
      };
      cells[y][x].pathParent = path;
      paths.push(path);
    }
  }
}

function tryNecessaryPathExtension(
  solvingData: SolvingData,
  path: SolvingPath
) {
  const curCell = path.cells[path.cells.length - 1];
  const coords = curCell.coordinates;
  const { left, top, right, bottom } = getNeighborCells(solvingData, coords);
  const { canGoLeft, canGoUp, canGoRight, canGoDown } = getExtensionOptions(
    solvingData,
    path,
    coords
  );

  if (!canGoLeft && !canGoUp && !canGoRight && !canGoDown) {
    debugLog("Path " + path.number + " is stuck at " + getCoordsString(coords));
    return false;
  }
  if (left && canGoLeft && !canGoUp && !canGoRight && !canGoDown) {
    doNecessaryPathExtension(solvingData, path, left.coordinates);
    return true;
  }
  if (top && !canGoLeft && canGoUp && !canGoRight && !canGoDown) {
    doNecessaryPathExtension(solvingData, path, top.coordinates);
    return true;
  }
  if (right && !canGoLeft && !canGoUp && canGoRight && !canGoDown) {
    doNecessaryPathExtension(solvingData, path, right.coordinates);
    return true;
  }
  if (bottom && !canGoLeft && !canGoUp && !canGoRight && canGoDown) {
    doNecessaryPathExtension(solvingData, path, bottom.coordinates);
    return true;
  }
  return false;
}

function getExtensionOptions(
  solvingData: SolvingData,
  path: SolvingPath,
  coordinates: Vector2
) {
  const { left, top, right, bottom } = getNeighborCells(
    solvingData,
    coordinates
  );
  const leftNum = getNumberat(left?.coordinates, solvingData);
  const upNum = getNumberat(top?.coordinates, solvingData);
  const rightNum = getNumberat(right?.coordinates, solvingData);
  const downNum = getNumberat(bottom?.coordinates, solvingData);

  const cameFromLeft =
    left &&
    solvingData.cells[left.coordinates.y][left.coordinates.x].pathParent ===
      path;
  const cameFromTop =
    top &&
    solvingData.cells[top.coordinates.y][top.coordinates.x].pathParent === path;
  const cameFromRight =
    right &&
    solvingData.cells[right.coordinates.y][right.coordinates.x].pathParent ===
      path;
  const cameFromBottom =
    bottom &&
    solvingData.cells[bottom.coordinates.y][bottom.coordinates.x].pathParent ===
      path;

  return {
    canGoLeft:
      left &&
      (leftNum === undefined || (leftNum === path.number && !cameFromLeft)),
    canGoUp:
      top && (upNum === undefined || (upNum === path.number && !cameFromTop)),
    canGoRight:
      right &&
      (rightNum === undefined || (rightNum === path.number && !cameFromRight)),
    canGoDown:
      bottom &&
      (downNum === undefined || (downNum === path.number && !cameFromBottom)),
  };
}

function doNecessaryPathExtension(
  solvingData: SolvingData,
  path: SolvingPath,
  coordsToAdd: Vector2
) {
  debugLog(
    "Path " +
      path.number +
      " forced to extend to " +
      getCoordsString(coordsToAdd)
  );
  if (solvingData.cells[coordsToAdd.y][coordsToAdd.x].pathParent) {
    debugLog(
      "merging path " +
        path.number +
        " with path " +
        solvingData.cells[coordsToAdd.y][coordsToAdd.x].pathParent?.number
    );
    mergePathsAt(solvingData, path, coordsToAdd);
  } else {
    path.cells.push(solvingData.cells[coordsToAdd.y][coordsToAdd.x]);
    solvingData.cells[coordsToAdd.y][coordsToAdd.x].pathParent = path;
  }
}

function mergePathsAt(
  solvingData: SolvingData,
  path: SolvingPath,
  coordinates: Vector2
) {
  const targetCell = solvingData.cells[coordinates.y][coordinates.x];
  const targetPath = targetCell.pathParent as SolvingPath; //this should ALWAYS be defined if we call this function
  const targetIsLastInPath =
    targetPath.cells[targetPath.cells.length - 1] === targetCell;
  if (targetIsLastInPath) targetPath.cells.reverse();
  for (const c of targetPath.cells) {
    c.pathParent = path;
  }
  path.cells.push(...targetPath.cells);
  solvingData.paths.splice(solvingData.paths.indexOf(targetPath), 1);
}

function getNumberat(
  coordinates: Vector2 | undefined,
  solvingData: SolvingData
) {
  if (
    coordinates === undefined ||
    !isInBounds(coordinates, solvingData.unsolved)
  )
    return undefined;

  const pathHere = solvingData.cells[coordinates.y][coordinates.x].pathParent;
  if (pathHere) return pathHere.number;
  const writtenNumber = solvingData.unsolved[coordinates.y][coordinates.x];
  return writtenNumber ? writtenNumber : undefined;
}
