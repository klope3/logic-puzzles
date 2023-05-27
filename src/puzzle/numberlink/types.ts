export type NumberGrid = number[][];

// export type Puzzle = {
//   unsolved: NumberGrid;
//   cells: SolvingCell[][];
//   paths: SolvingPath[];
//   numberPairCount: number;
//   seed: number | undefined;
// };

export type SolvingData = {
  unsolved: NumberGrid;
  cells: SolvingCell[][];
  paths: SolvingPath[];
  numberPairCount: number;
};

export type SolvingCell = {
  coordinates: Vector2;
  pathParent: SolvingPath | undefined;
};

export type SolvingPath = {
  cells: SolvingCell[];
  number: number | undefined;
};

export type PathCell = {
  left: boolean;
  up: boolean;
  right: boolean;
  down: boolean;
  coordinates: Vector2;
};

export type PathGrid = PathCell[][];

export type Direction = "left" | "up" | "right" | "down";

export type PathCellNeighbors = {
  left: PathCell | undefined;
  up: PathCell | undefined;
  right: PathCell | undefined;
  down: PathCell | undefined;
  downLeft: PathCell | undefined;
  upLeft: PathCell | undefined;
  upRight: PathCell | undefined;
  downRight: PathCell | undefined;
};
export type Vector2 = {
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
  // puzzle: Puzzle | undefined;
  puzzle: NumberGrid | undefined;
  solution: PathGrid | undefined; //not necessarily the only solution
  attempts: number;
  executionMs: number;
};
