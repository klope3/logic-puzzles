import { Direction, PathCell, PathGrid, Vector2 } from "./types";

export function drawPathSegment(
  grid: PathGrid,
  start: Vector2,
  direction: Direction
) {
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

//assumes the two coords are orthogonal to each other!
export function getOrthoDirectionFromTo(
  start: Vector2,
  end: Vector2
): Direction {
  if (end.x < start.x) return "left";
  if (end.x > start.x) return "right";
  if (end.y < start.y) return "up";
  return "down";
}

function countDirectionsInCell(cell: PathCell) {
  return [cell.left, cell.up, cell.right, cell.down].filter((b) => b).length;
}

export function isCellPartiallyFilled(cell: PathCell) {
  return countDirectionsInCell(cell) === 1;
}

export function isCellEmpty(cell: PathCell) {
  return countDirectionsInCell(cell) === 0;
}

export function isCellInvalid(cell: PathCell) {
  return countDirectionsInCell(cell) > 2;
}

export function getDirectionFromCell(
  cell: PathCell,
  directionToIgnore?: Direction
): Direction {
  if (!isCellPartiallyFilled(cell) && directionToIgnore === undefined) {
    console.warn(
      `Getting direction from a cell that's not partially filled (${cell.coordinates.x}, ${cell.coordinates.y}), but no direction to ignore was specififed!`
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

export function getOrthoDirectionDelta(direction: Direction): Vector2 {
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

export function vectorSum(a: Vector2, b: Vector2) {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

export function followPathToEnd(grid: PathGrid, firstEndpoint: Vector2) {
  const points: Vector2[] = [];
  let curPoint = firstEndpoint;
  let cameFromPoint: Vector2 | undefined;
  while (true) {
    const cell = grid[curPoint.y][curPoint.x];
    if (isCellInvalid(cell)) return [];
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

export function areVectorsEqual(a: Vector2, b: Vector2) {
  return a.x === b.x && a.y === b.y;
}
