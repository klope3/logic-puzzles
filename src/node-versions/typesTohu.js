export const empty = 0;
export const white = 1;
export const black = 2;
export class Cell {
    constructor(rawValue, flatIndex, gridWidth) {
        this.isEmpty = () => this.state === empty;
        this.coords = indexToCoords(flatIndex, gridWidth);
        this.state = rawValue;
        this.locked = rawValue > 0;
        this.coordsString = `(${this.coords.x}, ${this.coords.y})`;
    }
}
export class Grid {
    constructor(rawGrid) {
        this.width = rawGrid[0].length;
        this.height = rawGrid.length;
        this.cells = rawGrid
            .reduce((accum, item) => accum.concat(item), [])
            .map((rawValue, i) => new Cell(rawValue, i, this.width));
        this.rows = getRows(this.cells, this.width);
        this.columns = getColumns(this.cells, this.width);
    }
    createClone() {
        return new Grid(this.rows.map((row) => row.map((cell) => cell.state)));
    }
}
//used to get columns and rows
function getCellGroup(preparedCells, width, groupIndexCallback) {
    const group = {};
    for (let i = 0; i < preparedCells.length; i++) {
        const groupIndex = groupIndexCallback(i, width);
        if (!group[groupIndex])
            group[groupIndex] = [];
        group[groupIndex].push(preparedCells[i]);
    }
    return Object.keys(group).map((key) => group[key]);
}
function getColumns(preparedCells, width) {
    return getCellGroup(preparedCells, width, (i, width) => i % width);
}
function getRows(preparedCells, width) {
    return getCellGroup(preparedCells, width, (i, width) => Math.floor(i / width));
}
function indexToCoords(index, gridWidth) {
    return {
        x: index % gridWidth,
        y: Math.floor(index / gridWidth),
    };
}
