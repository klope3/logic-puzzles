export type NumberGrid = number[][];

export type Puzzle = {
  unsolved: NumberGrid;
  cells: Cell[][];
  paths: Path[];
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

export type Direction = "left" | "up" | "right" | "down";
