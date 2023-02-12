import { CellState } from "./typesTohu";

export const blank = [
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
];

export const blankSmall: CellState[][] = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

export const puzzle1: CellState[][] = [
  [0, 0, 0, 0, 0, 0],
  [0, 2, 0, 0, 0, 0],
  [0, 0, 0, 2, 0, 0],
  [0, 2, 0, 0, 1, 1],
  [0, 0, 0, 0, 0, 1],
  [0, 2, 2, 0, 0, 0],
];

export const puzzle2: CellState[][] = [
  [0, 0, 0, 0, 2, 0],
  [2, 2, 0, 2, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [2, 0, 1, 1, 0, 0],
  [2, 0, 1, 0, 0, 1],
  [0, 0, 0, 0, 2, 0],
];

export const puzzle3: CellState[][] = [
  [0, 0, 1, 0, 0, 0],
  [1, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 2, 0],
  [0, 0, 0, 1, 0, 0],
  [0, 0, 0, 1, 2, 0],
  [1, 0, 0, 0, 0, 1],
];

export const veryHard: CellState[][] = [
  [0, 0, 2, 0, 0, 0],
  [1, 1, 0, 2, 0, 0],
  [1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 2, 0, 0],
  [0, 0, 0, 0, 1, 0],
];
