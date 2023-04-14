export type NumberGrid = number[][];

export type Puzzle = {
  unsolved: NumberGrid;
  paths: Path[];
};

type Path = {
  cells: Coordinates[];
  number: number | undefined;
};

export type Coordinates = {
  x: number;
  y: number;
};
