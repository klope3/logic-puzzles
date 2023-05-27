import { Direction, PathGrid, Vector2 } from "./types";

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
