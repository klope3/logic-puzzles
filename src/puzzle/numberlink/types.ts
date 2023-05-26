export type NumberGrid = number[][];

export type Puzzle = {
  unsolved: NumberGrid;
  cells: Cell[][];
  paths: Path[];
  numberPairCount: number;
  seed: number | undefined;
};

export type Cell = {
  coordinates: Coordinates;
  pathParent: Path | undefined;
};

export type Path = {
  cells: Cell[];
  number: number | undefined;
};

export type Coordinates = {
  x: number;
  y: number;
};

export type DirectionSet = {
  left: boolean;
  up: boolean;
  right: boolean;
  down: boolean;
};

export type GenerationResult = {
  puzzle: Puzzle | undefined;
  attempts: number;
  executionMs: number;
};
