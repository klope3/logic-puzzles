"use strict";
const empty = 0;
const white = 1;
const black = 2;
const verbose = false;
class Cell {
    constructor(rawValue, flatIndex, gridWidth) {
        this.isEmpty = () => this.state === empty;
        this.coords = indexToCoords(flatIndex, gridWidth);
        this.state = rawValue;
        this.locked = rawValue > 0;
        this.coordsString = `(${this.coords.x}, ${this.coords.y})`;
    }
}
class Grid {
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
const blank = [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
];
const blankSmall = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
];
const puzzle1 = [
    [0, 0, 0, 0, 0, 0],
    [0, 2, 0, 0, 0, 0],
    [0, 0, 0, 2, 0, 0],
    [0, 2, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 1],
    [0, 2, 2, 0, 0, 0],
];
const puzzle2 = [
    [0, 0, 0, 0, 2, 0],
    [2, 2, 0, 2, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [2, 0, 1, 1, 0, 0],
    [2, 0, 1, 0, 0, 1],
    [0, 0, 0, 0, 2, 0],
];
const puzzle3 = [
    [0, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 2, 0],
    [0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 2, 0],
    [1, 0, 0, 0, 0, 1],
];
const veryHard = [
    [0, 0, 2, 0, 0, 0],
    [1, 1, 0, 2, 0, 0],
    [1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 0, 0],
    [0, 0, 0, 0, 1, 0],
];
const solutions = getSolutions(blankSmall);
function debugLog(message) {
    if (verbose)
        console.log(message);
}
function rawValueToColor(raw) {
    switch (raw) {
        case empty:
            return empty;
    }
}
function trySetCellState(cell, state) {
    if (!cell.locked) {
        cell.state = state;
        return true;
    }
    return false;
}
function indexToCoords(index, gridWidth) {
    return {
        x: index % gridWidth,
        y: Math.floor(index / gridWidth),
    };
}
function isInBounds(grid, coords) {
    return (coords.x >= 0 &&
        coords.x < grid.width &&
        coords.y >= 0 &&
        coords.y < grid.height);
}
function getCellAt(grid, coords) {
    return isInBounds(grid, coords) ? grid.columns[coords.x][coords.y] : null;
}
function getCells(grid, coordsList) {
    const cells = coordsList.map((coords) => getCellAt(grid, coords));
    const cleaned = cells.filter((cell) => cell !== null); //should use "as" here??
    return cleaned;
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
// function getPreparedCell(rawValue: CellState, flatIndex: number, gridWidth: number) {
//   const coords = indexToCoords(flatIndex, gridWidth);
//   return {
//     coords,
//     state: rawValue,
//     locked: rawValue > empty,
//     isEmpty: () => rawValue === empty,
//     coordsString: `(${coords.x}, ${coords.y})`,
//   };
// }
function getCellNeighbors(preparedGrid, cell) {
    const { x: startX, y: startY } = cell.coords;
    const leftTwo = [
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY },
    ];
    const topTwo = [
        { x: startX, y: startY - 1 },
        { x: startX, y: startY - 2 },
    ];
    const rightTwo = [
        { x: startX + 1, y: startY },
        { x: startX + 2, y: startY },
    ];
    const botTwo = [
        { x: startX, y: startY + 1 },
        { x: startX, y: startY + 2 },
    ];
    return {
        left: getCells(preparedGrid, leftTwo).filter((cell) => cell),
        top: getCells(preparedGrid, topTwo).filter((cell) => cell),
        right: getCells(preparedGrid, rightTwo).filter((cell) => cell),
        bottom: getCells(preparedGrid, botTwo).filter((cell) => cell),
    };
}
function countCellsBy(grid, cells, callback) {
    return cells.reduce((accum, cell) => (callback(cell) ? accum + 1 : accum), 0);
}
function isCellLegal(grid, cell) {
    const thisCell = cell;
    const neighbors = getCellNeighbors(grid, cell);
    for (const key of Object.keys(neighbors)) {
        const twoSameNeighbors = countCellsBy(grid, neighbors[key], (cell) => cell.state > empty && cell.state === thisCell.state) === 2;
        if (twoSameNeighbors) {
            debugLog("cell " +
                cell.coordsString +
                " is illegal because it has two same neighbors on " +
                key);
            return false;
        }
    }
    const thisCellColumn = grid.columns[cell.coords.x];
    const thisCellRow = grid.rows[cell.coords.y];
    const sameColorInColumn = countCellsBy(grid, thisCellColumn, (cell) => cell.state === thisCell.state);
    const maxColorInColumn = grid.height / 2;
    if (sameColorInColumn > maxColorInColumn) {
        debugLog("cell " +
            cell.coordsString +
            " is illegal because there are more than " +
            maxColorInColumn +
            " of its color in its column");
        return false;
    }
    const sameColorInRow = countCellsBy(grid, thisCellRow, (cell) => cell.state === thisCell.state);
    const maxColorInRow = grid.width / 2;
    if (sameColorInRow > maxColorInRow) {
        debugLog("cell " +
            cell.coordsString +
            " is illegal because there are more than " +
            maxColorInRow +
            " of its color in its row");
        return false;
    }
    return true;
}
// function getPreparedGrid(rawGrid: CellState[][]) {
//   const width = rawGrid[0].length;
//   const cells = rawGrid
//     .flat()
//     .map((rawValue, i) => getPreparedCell(rawValue, i, width));
//   const grid = {
//     width,
//     height: rawGrid.length,
//     cells,
//     rows: getRows(cells, width),
//     columns: getColumns(cells, width),
//   };
//   return grid;
// }
function tryIncrementCell(cell) {
    if (cell.locked) {
        console.error("Tried to increment a locked cell!");
        return false;
    }
    if (cell.state === black) {
        debugLog("reverting cell " + cell.coordsString);
        cell.state = empty;
        return false;
    }
    cell.state++;
    debugLog("cell " + cell.coordsString + " incremented to " + cell.state);
    return true;
}
function getSolutions(rawGrid, maxSolutionsToFind) {
    let index = 0;
    let backtracking = false;
    let steps = 0;
    const preparedGrid = new Grid(rawGrid);
    const solutions = [];
    printGrid(preparedGrid);
    const maxIndex = preparedGrid.cells.length;
    while (true) {
        if (index >= maxIndex) {
            solutions.push(preparedGrid.createClone());
            debugLog("Solving SUCCESS after " +
                steps +
                " steps; " +
                solutions.length +
                " solution(s) found");
            if (!maxSolutionsToFind || solutions.length === maxSolutionsToFind) {
                break;
            }
            else {
                backtracking = true;
                index--;
            }
        }
        if (index < 0) {
            debugLog("Solving FAILED after " + steps + " steps");
            break;
        }
        const curCell = preparedGrid.cells[index];
        debugLog("=======================");
        debugLog("visiting cell " + curCell.coordsString + " on step " + steps);
        debugLog("locked? " +
            curCell.locked +
            "; empty? " +
            curCell.isEmpty() +
            "; legal? " +
            isCellLegal(preparedGrid, curCell));
        if (curCell.locked) {
            debugLog("cell " +
                curCell.coords.x +
                ", " +
                curCell.coords.y +
                " is locked; skipping");
            index = backtracking ? index - 1 : index + 1;
            steps++;
            continue;
        }
        while (true) {
            const reverted = !tryIncrementCell(curCell);
            if (reverted) {
                debugLog(`${backtracking ? "continue" : "start"} backtracking`);
                backtracking = true;
                break;
            }
            if (isCellLegal(preparedGrid, curCell)) {
                backtracking = false;
                break;
            }
        }
        index = backtracking ? index - 1 : index + 1;
        steps++;
    }
    return solutions;
}
function printGrid(grid) {
    let builtString = "";
    const { rows } = grid;
    for (let y = 0; y < rows.length; y++) {
        for (let x = 0; x < rows[y].length; x++) {
            const state = rows[y][x].state;
            if (state === 0)
                builtString += ". ";
            if (state === 1)
                builtString += "○ ";
            if (state === 2)
                builtString += "● ";
        }
        builtString += "\n";
    }
    console.log(builtString);
}
// using System;
// using System.Collections.Generic;
// //This is technically a variation of the puzzle because it does not require rows and columsn to be unique in validation. This variation can also be seen in
// //Simon Tatham's puzzle collection, in the puzzle Unruly, using the seed 6x6dn#721761777483731. Many other seeds for Unruly also produce duplicate rows
// //and/or columns in Unruly, and the puzzles are still enjoyable, so I decided to follow his lead here.
// public class Program
// {
// 	public static void Main()
// 	{
// 		int[,] blank = new int[,]
// 		{
// 			{0,0,0,0,0,0},
// 			{0,0,0,0,0,0},
// 			{0,0,0,0,0,0},
// 			{0,0,0,0,0,0},
// 			{0,0,0,0,0,0},
// 			{0,0,0,0,0,0},
// 		};
// 		int[,] puzzle = new int[,]
// 		{
// 			{0,0,0,0,0,0},
// 			{0,2,0,0,0,0},
// 			{0,0,0,2,0,0},
// 			{0,2,0,0,1,1},
// 			{0,0,0,0,0,1},
// 			{0,2,2,0,0,0},
// 		};
// 		int[,] puzzleModified1 = new int[,] //this one currently produces incorrect output
// 		{
// 			{0,0,0,0,0,0},
// 			{0,1,0,0,0,0},
// 			{0,0,0,1,0,0},
// 			{0,2,0,0,1,1},
// 			{0,0,0,0,0,1},
// 			{0,2,2,0,0,0},
// 		};
// 		int[,] puzzleModified2 = new int[,]
// 		{
// 			{0,0,0,0,0,0},
// 			{0,2,1,0,0,0},
// 			{0,0,0,2,0,0},
// 			{0,2,0,0,1,1},
// 			{0,0,0,0,0,1},
// 			{0,2,2,0,0,0},
// 		};
// 		int[,] veryHard = new int[,]
// 		{
// 			{0,0,2,0,0,0},
// 			{1,1,0,2,0,0},
// 			{1,0,0,0,0,0},
// 			{0,0,0,0,0,0},
// 			{0,0,0,2,0,0},
// 			{0,0,0,0,1,0},
// 		}; //from https://www.binarypuzzle.com/puzzles.php?size=6&level=4&nr=1
// 		GenerateAndSolve();
// 	}
// 	public static void GenerateAndSolve()
// 	{
// 		Generator gen = new Generator();
// 		int[,] generated = gen.GetNewPuzzle(3, 3, 30);
// 		Grid grid = new Grid(generated);
// 		GridVisuals visuals = new GridVisuals(grid);
// 		CheckUnique(generated);
// 		FindSolutions(generated, 1);
// 	}
// 	public static void FindSolutions(int[,] input, int maxSolutions)
// 	{
// 		Grid grid = new Grid(input);
// 		GridVisuals visuals = new GridVisuals(grid);
// 		Solver solver = new Solver(grid);
// 		solver.Solve(maxSolutions);
// 		for (int i = 0; i < solver.SolutionsFound; i++)
// 		{
// 			visuals = new GridVisuals(solver.GetSolvedGrid(i));
// 			Console.WriteLine();
// 		}
// 	}
// 	public static void DoSteps(int[,] input, int steps)
// 	{
// 		Grid grid = new Grid(input);
// 		GridVisuals visuals = new GridVisuals(grid);
// 		Console.WriteLine();
// 		Solver solver = new Solver(grid);
// 		for (int i = 0; i < steps; i++)
// 			solver.TryStep(int.MaxValue);
// 		visuals = new GridVisuals(solver.GetSolvedGrid(0));
// 		Console.WriteLine();
// 		visuals = new GridVisuals(solver.GetSolvedGrid(1));
// 	}
// 	public static void CheckUnique(int[,] input)
// 	{
// 		Grid grid = new Grid(input);
// 		Solver solver = new Solver(grid);
// 		bool unique = solver.HasUniqueSolution();
// 		if (unique)
// 			Console.WriteLine("Has unique solution");
// 		else
// 			Console.WriteLine("Does NOT have unique solution");
// 	}
// 	public static void ShowAllSolutions(int[,] input)
// 	{
// 		Grid grid = new Grid(input);
// 		Console.WriteLine("Starting grid");
// 		GridVisuals visuals = new GridVisuals(grid);
// 		Solver solver = new Solver(grid);
// 		int safety = 0;
// 		int solutionsSoFar = solver.SolutionsFound;
// 		while (!solver.PassedStart)
// 		{
// 			int solutionsThisStep = solver.SolutionsFound;
// 			if (solutionsThisStep > solutionsSoFar)
// 			{
// 				Grid newSolvedGrid = solver.GetSolvedGrid(solutionsSoFar);
// 				visuals = new GridVisuals(solver.GetSolvedGrid(solutionsSoFar));
// 				Console.WriteLine();
// 				solutionsSoFar = solutionsThisStep;
// 			}
// 			solver.TryStep(int.MaxValue);
// 			safety++;
// 		}
// 	}
// }
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// public class Grid
// {
// 	private Cell[, ] cells;
// 	public int Columns {get{return cells.GetLength(0);}}
// 	public int Rows{get{return cells.GetLength(1);}}
// 	public int SectorWidth{get{return (int)Math.Sqrt(Columns);}}
// 	public int SectorHeight{get{return (int)Math.Sqrt(Rows);}}
// 	private readonly int maxRunCount = 2;
// 	public enum Direction
// 	{
// 		Left,
// 		Up,
// 		Right,
// 		Down
// 	}
// 	public Grid(int sectorWidth, int sectorHeight)
// 	{
// 		cells = new Cell[sectorWidth * sectorWidth, sectorHeight * sectorHeight];
// 		for (int x = 0; x < Columns; x++)
// 		{
// 			for (int y = 0; y < Rows; y++)
// 			{
// 				cells[x, y] = new Cell(this);
// 			}
// 		}
// 	}
// 	public Grid(int[, ] states)
// 	{
// 		int width = states.GetLength(0);
// 		int height = states.GetLength(1);
// 		cells = new Cell[width, height];
// 		int maxValue = width;
// 		for (int x = 0; x < width; x++)
// 		{
// 			for (int y = 0; y < height; y++)
// 			{
// 				cells[x, y] = new Cell(this);
// 				if (states[y, x] == 0)
// 					continue;
// 				cells[x, y].SetState(states[y, x]); //mirror x/y axes for readability
// 			}
// 		}
// 	}
// 	public Cell GetCell(int x, int y)
// 	{
// 		if (x < 0 || x >= Columns || y < 0 || y >= Rows)
// 			return null;
// 		return cells[x, y];
// 	}
// 	private bool IsInBounds(int x, int y)
// 	{
// 		return x >= 0 && x < Columns && y >= 0 && y < Rows;
// 	}
// 	public int GetState(int x, int y)
// 	{
// 		return cells[x, y].State;
// 	}
// 	public bool IsGridLegal()
// 	{
// 		for (int x = 0; x < Columns; x++)
// 		{
// 			for (int y = 0; y < Rows; y++)
// 			{
// 				if (GetState(x, y) != 0 && !IsCellLegal(x, y))
// 					return false;
// 			}
// 		}
// 		return true;
// 	}
// 	public bool IsCellLegal(int x, int y)
// 	{
// 		int state = GetState(x, y);
// 		int runCountLeft = CountStateRun(state, x, y, Direction.Left);
// 		int runCountUp = CountStateRun(state, x, y, Direction.Up);
// 		int runCountRight = CountStateRun(state, x, y, Direction.Right);
// 		int runCountDown = CountStateRun(state, x, y, Direction.Down);
// 		int stateCountInColumn = CountStateInColumn(state, x);
// 		int stateCountInRow = CountStateInRow(state, y);
// 		return runCountLeft + runCountRight - 1 <= maxRunCount && runCountUp + runCountDown - 1 <= maxRunCount &&
// 			stateCountInColumn <= Rows / 2 && stateCountInRow <= Columns / 2;
// 	}
// 	public int CountStateInColumn(int state, int columnX)
// 	{
// 		int count = 0;
// 		for (int y = 0; y < Rows; y++)
// 		{
// 			if (GetState(columnX, y) == state)
// 				count++;
// 		}
// 		return count;
// 	}
// 	public int CountStateInRow(int state, int rowY)
// 	{
// 		int count = 0;
// 		for (int x = 0; x < Columns; x++)
// 		{
// 			if (GetState(x, rowY) == state)
// 				count++;
// 		}
// 		return count;
// 	}
// 	public int CountStateRun(int state, int startX, int startY, Direction direction)
// 	{
// 		int count = 0;
// 		int curX = startX;
// 		int curY = startY;
// 		while (IsInBounds(curX, curY) && GetState(curX, curY) == state)
// 		{
// 			count++;
// 			if (direction == Direction.Left)
// 				curX--;
// 			if (direction == Direction.Up)
// 				curY--;
// 			if (direction == Direction.Right)
// 				curX++;
// 			if (direction == Direction.Down)
// 				curY++;
// 		}
// 		return count;
// 	}
// 	public Grid CreateClone()
// 	{
// 		int[,] states = new int[Columns, Rows];
// 		for (int x = 0; x < Columns; x++)
// 		{
// 			for (int y = 0; y < Rows; y++)
// 			{
// 				states[x, y] = GetState(y, x);
// 			}
// 		}
// 		return new Grid(states);
// 	}
// }
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// public class Cell
// {
// 	private Grid parentGrid;
// 	public int State { get; private set; }
// 	private bool isLocked;
// 	public bool IsLocked { get { return isLocked; } }
// 	private readonly int maxStateValue = 2;
// 	public Cell(Grid gridIn)
// 	{
// 		parentGrid = gridIn;
// 	}
// 	public void SetState(int state)
// 	{
// 		State = state;
// 		isLocked = true;
// 	}
// 	public bool TryIncrement()
// 	{
// 		if (isLocked)
// 		{
// 			Console.WriteLine("Tried to increment a locked cell!");
// 			return false;
// 		}
// 		if (State == maxStateValue)
// 		{
// 			State = 0;
// 			return false;
// 		}
// 		State++;
// 		return true;
// 	}
// }
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// public class Generator
// {
// 	private System.Random rand;
// 	public Generator()
// 	{
// 		rand = new System.Random();
// 	}
// 	public Generator(int seed)
// 	{
// 		rand = new System.Random(seed);
// 	}
// 	public int[,] GetNewPuzzle(int halfWidth, int halfHeight, int cluePercent)
// 	{
// 		if (cluePercent < 0 || cluePercent > 100)
// 		{
// 			Console.WriteLine("cluePercent must be between 0 and 100.");
// 			return null;
// 		}
// 		int width = halfWidth * 2;
// 		int height = halfHeight * 2;
// 		int[,] puzzle = new int[width, height];
// 		int clueCount = (int)((cluePercent / 100f) * width * height);
// 		int safety = 0;
// 		while (safety < 10000)
// 		{
// 			puzzle = new int[width, height];
// 			for (int i = 0; i < clueCount; i++)
// 			{
// 				int randX = rand.Next(0, width);
// 				int randY = rand.Next(0, height);
// 				while (puzzle[randX, randY] != 0)
// 				{
// 					randX = rand.Next(0, width);
// 					randY = rand.Next(0, height);
// 				}
// 				puzzle[randX, randY] = rand.Next(1, 3);
// 			}
// 			Grid generated = new Grid(puzzle);
// 			Solver solver = new Solver(generated);
// 			if (generated.IsGridLegal() && solver.HasUniqueSolution())
// 				break;
// 			safety++;
// 		}
// 		Console.WriteLine("Safety " + safety);
// 		return puzzle;
// 	}
// }
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// public class Solver
// {
// 	private Grid grid;
// 	private int curX;
// 	private int curY;
// 	public bool PassedStart { get { if (curY == -1) Console.WriteLine("Passed start"); return curY == -1; } }
// 	private bool PassedEnd { get { return curY == grid.Rows; } }
// 	private List<Grid> solvedGrids;
// 	public int SolutionsFound { get { return solvedGrids.Count; } }
// 	public Solver(Grid gridIn)
// 	{
// 		grid = gridIn;
// 		solvedGrids = new List<Grid>();
// 	}
// 	public Grid GetSolvedGrid(int index)
// 	{
// 		return solvedGrids[index];
// 	}
// 	public bool HasUniqueSolution()
// 	{
// 		curX = 0;
// 		curY = 0;
// 		while (TryStep(2)) { }
// 		return SolutionsFound == 1;
// 	}
// 	public void Solve(int maxSolutionsToFind)
// 	{
// 		curX = 0;
// 		curY = 0;
// 		int steps = 0;
// 		while (TryStep(maxSolutionsToFind)) { steps++; }
// 		if (curY == -1)
// 			Console.Write("Solving FAILED after ");
// 		else
// 			Console.Write("Solving SUCCESS after ");
// 		Console.WriteLine(steps + " steps");
// 		Console.WriteLine("Found " + SolutionsFound + " solutions");
// 	}
// 	public bool TryStep(int maxSolutionsToFind)
// 	{
// 		if (PassedEnd)
// 		{
// 			//Console.WriteLine("Passed end");
// 			solvedGrids.Add(grid.CreateClone());
// 			if (SolutionsFound < maxSolutionsToFind)
// 			{
// 				//Console.WriteLine("Continuing to search");
// 				SetPrevCoords();
// 			}
// 			else
// 				return false;
// 		}
// 		Cell curCell = grid.GetCell(curX, curY);
// 		if (curCell == null)
// 			return false;
// 		while (true)
// 		{
// 			if (grid.GetCell(curX, curY).IsLocked)
// 			{
// 				SetNextCoords();
// 				break;
// 			}
// 			if (!curCell.TryIncrement())
// 			{
// 				SetPrevCoords();
// 				break;
// 			}
// 			if (grid.IsCellLegal(curX, curY))
// 			{
// 				SetNextCoords();
// 				break;
// 			}
// 		}
// 		return true;
// 	}
// 	private void SetNextCoords()
// 	{
// 		do
// 		{
// 			curX++;
// 			if (curX == grid.Columns)
// 			{
// 				curX = 0;
// 				curY++;
// 			}
// 		} while (grid.GetCell(curX, curY) != null && grid.GetCell(curX, curY).IsLocked);
// 	}
// 	private void SetPrevCoords()
// 	{
// 		do
// 		{
// 			curX--;
// 			if (curX < 0)
// 			{
// 				curX = grid.Columns - 1;
// 				curY--;
// 			}
// 		} while (grid.GetCell(curX, curY) != null && grid.GetCell(curX, curY).IsLocked);
// 	}
// }
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
// public class GridVisuals
// {
// 	public GridVisuals(Grid grid)
// 	{
// 		for (int y = 0; y < grid.Rows; y++)
// 		{
// 			for (int x = 0; x < grid.Columns; x++)
// 			{
// 				int state = grid.GetState(x, y);
// 				string str = ". ";
// 				if (state == 1)
// 					str = "○ ";
// 				if (state == 2)
// 					str = "● ";
// 				Console.Write(str);
// 			}
// 			Console.WriteLine();
// 		}
// 	}
// }
