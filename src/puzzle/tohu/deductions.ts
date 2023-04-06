import {
  black,
  CellState,
  CellStateNeighbors,
  ColorTallies,
  Coordinates,
  white,
} from "./types.js";

//these functions should be generalized to also be usable with solving algorithm
export function isPositionFlankedByState(
  neighbors: CellStateNeighbors,
  state: CellState
) {
  return (
    (neighbors.left[0] === state && neighbors.right[0] === state) ||
    (neighbors.top[0] === state && neighbors.bottom[0] === state)
  );
}

export function doesPositionHaveTwoNeighborsOfState(
  neighbors: CellStateNeighbors,
  state: CellState
) {
  return (
    (neighbors.left[0] === state && neighbors.left[1] === state) ||
    (neighbors.right[0] === state && neighbors.right[1] === state) ||
    (neighbors.top[0] === state && neighbors.top[1] === state) ||
    (neighbors.bottom[0] === state && neighbors.bottom[1] === state)
  );
}

export function isTallyMaxedAtPosition(
  coords: Coordinates,
  columnTallies: ColorTallies[],
  rowTallies: ColorTallies[],
  maxPerColorPerRow: number,
  maxPerColorPerColumn: number,
  state: CellState
) {
  return (
    (state === white &&
      (columnTallies[coords.x].white === maxPerColorPerColumn ||
        rowTallies[coords.y].white === maxPerColorPerRow)) ||
    (state === black &&
      (columnTallies[coords.x].black === maxPerColorPerColumn ||
        rowTallies[coords.y].black === maxPerColorPerRow))
  );
}
