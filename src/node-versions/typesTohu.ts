export const empty = 0;
export const white = 1;
export const black = 2;

export type CellState = 0 | 1 | 2;

export type CellNeighbors = {
  left: Cell[];
  top: Cell[];
  right: Cell[];
  bottom: Cell[];
  [key: string]: Cell[];
};

export type Coordinates = {
  x: number;
  y: number;
};

export class Cell {
  readonly coords: Coordinates;
  state: CellState;
  readonly locked: boolean;
  readonly coordsString: string;
  constructor(rawValue: CellState, flatIndex: number, gridWidth: number) {
    this.coords = indexToCoords(flatIndex, gridWidth);
    this.state = rawValue;
    this.locked = rawValue > 0;
    this.coordsString = `(${this.coords.x}, ${this.coords.y})`;
  }
  isEmpty = () => this.state === empty;
}

export class Grid {
  width: number;
  height: number;
  cells: Cell[];
  rows: Cell[][];
  columns: Cell[][];
  constructor(rawGrid: CellState[][]) {
    this.width = rawGrid[0].length;
    this.height = rawGrid.length;
    this.cells = rawGrid
      .reduce((accum, item) => accum.concat(item), [])
      .map(
        (rawValue: CellState, i: number) => new Cell(rawValue, i, this.width)
      );
    this.rows = getRows(this.cells, this.width);
    this.columns = getColumns(this.cells, this.width);
  }

  createClone(): Grid {
    return new Grid(
      this.rows.map((row: Cell[]) => row.map((cell: Cell) => cell.state))
    );
  }
}

//used to get columns and rows
function getCellGroup(
  preparedCells: Cell[],
  width: number,
  groupIndexCallback: (i: number, width: number) => number
): Cell[][] {
  const group: any = {};
  for (let i = 0; i < preparedCells.length; i++) {
    const groupIndex = groupIndexCallback(i, width);
    if (!group[groupIndex]) group[groupIndex] = [];
    group[groupIndex].push(preparedCells[i]);
  }
  return Object.keys(group).map((key) => group[key]);
}

function getColumns(preparedCells: Cell[], width: number): Cell[][] {
  return getCellGroup(preparedCells, width, (i, width) => i % width);
}

function getRows(preparedCells: Cell[], width: number): Cell[][] {
  return getCellGroup(preparedCells, width, (i, width) =>
    Math.floor(i / width)
  );
}

function indexToCoords(index: number, gridWidth: number): Coordinates {
  return {
    x: index % gridWidth,
    y: Math.floor(index / gridWidth),
  };
}
