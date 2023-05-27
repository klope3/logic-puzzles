import { Grid } from "./Grid";
import {
  createEmptyPathGrid,
  flatIndexToCoords,
} from "../../puzzle/numberlink/utility";
import { useEffect, useState } from "react";
import { NumberGrid, PathGrid } from "../../puzzle/numberlink/types";
import { generate } from "../../puzzle/numberlink/generate";
import {
  areVectorsEqual,
  followPathToEnd,
  isCellEmpty,
  isCellPartiallyFilled,
} from "../../puzzle/numberlink/gridLogic";

const initialWidth = 5;
const initialHeight = 5;

export function Numberlink() {
  const [puzzle, setPuzzle] = useState([] as NumberGrid);
  const [solutionGrid, setSolutionGrid] = useState([] as PathGrid);
  const [isSolved, setIsSolved] = useState(false);
  const [generateWidth, setGenerateWidth] = useState(initialWidth);
  const [generateHeight, setGenerateHeight] = useState(initialHeight);
  const [generateSeed, setGenerateSeed] = useState(0);
  const [pathGridState, setPathGridState] = useState(
    createEmptyPathGrid(generateWidth, generateHeight)
  );

  useEffect(() => {
    // const puzzle = generate(5, 5);
    // if (!puzzle) return;

    // setSolutionGrid(puzzleToDirectionGrid(puzzle));
    // const cleaned = puzzleFromNumberGrid(puzzle.unsolved);
    // setPuzzle(cleaned);
    generatePuzzle();
  }, []);

  function generatePuzzle(
    width: number = 5,
    height: number = 5,
    seed?: number
  ) {
    const result = generate(width, height, seed);
    if (!result.puzzle || !result.solution) {
      console.error("Generation failed!");
      return;
    }

    // setSolutionGrid(puzzleToDirectionGrid(result.puzzle));
    // const cleaned = puzzleFromNumberGrid(result.puzzle.unsolved);
    setPuzzle(result.puzzle);
    setSolutionGrid(result.solution);
    setPathGridState(createEmptyPathGrid(generateWidth, generateHeight));
    setIsSolved(false);
  }

  function checkSolved() {
    const pathsToFind = new Set([...puzzle.flat().filter((a) => a !== 0)]);
    console.log("paths to find:");
    console.log(pathsToFind);
    const completePathsFound: number[] = [];
    for (let y = 0; y < puzzle.length; y++) {
      for (let x = 0; x < puzzle[0].length; x++) {
        if (puzzle[y][x] === 0 || completePathsFound.includes(puzzle[y][x]))
          continue;
        if (!isCellPartiallyFilled(pathGridState[y][x])) return;
        console.log("Starting at " + puzzle[y][x]);
        const path = followPathToEnd(pathGridState, { x, y });
        if (path.length < 2) continue;
        const start = path[0];
        const end = path[path.length - 1];
        if (
          !areVectorsEqual(start, end) &&
          puzzle[start.y][start.x] === puzzle[end.y][end.x]
        ) {
          completePathsFound.push(puzzle[start.y][start.x]);
          continue;
        } else return;
      }
    }
    if (completePathsFound.length === pathsToFind.size) setIsSolved(true);
  }

  function clickGrid(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (isSolved) return;

    const clicked = e.target as HTMLElement;
    if (
      clicked.dataset.clickzonesource === undefined ||
      clicked.dataset.clickzonedirection === undefined
    )
      return;

    const source = +clicked.dataset.clickzonesource;
    const direction = clicked.dataset.clickzonedirection as "right" | "down";
    const sourceCoords = flatIndexToCoords(source, generateWidth);
    const newPathGrid = [...pathGridState];
    if (direction == "right") {
      newPathGrid[sourceCoords.y][sourceCoords.x].right =
        !newPathGrid[sourceCoords.y][sourceCoords.x].right;
      newPathGrid[sourceCoords.y][sourceCoords.x + 1].left =
        !newPathGrid[sourceCoords.y][sourceCoords.x + 1].left;
    } else {
      newPathGrid[sourceCoords.y][sourceCoords.x].down =
        !newPathGrid[sourceCoords.y][sourceCoords.x].down;
      newPathGrid[sourceCoords.y + 1][sourceCoords.x].up =
        !newPathGrid[sourceCoords.y + 1][sourceCoords.x].up;
    }

    setPathGridState(newPathGrid);
    checkSolved();
  }

  return (
    <>
      {puzzle.length > 0 && (
        <Grid
          puzzle={puzzle}
          clickFunction={clickGrid}
          pathGrid={pathGridState}
        />
      )}
      {isSolved && <div>Solved!</div>}
      <label htmlFor="width">
        Width:
        <input
          type="number"
          name="width"
          id="width"
          min={5}
          onChange={(e) => setGenerateWidth(+e.target.value)}
        />
      </label>
      <label htmlFor="height">
        Height:
        <input
          type="number"
          name="height"
          id="height"
          min={5}
          onChange={(e) => setGenerateHeight(+e.target.value)}
        />
      </label>
      <label htmlFor="seed">
        Seed:
        <input
          type="number"
          name="seed"
          id="seed"
          min={0}
          onChange={(e) => setGenerateSeed(+e.target.value)}
        />
      </label>
      <button
        onClick={() =>
          generatePuzzle(generateWidth, generateHeight, generateSeed)
        }
      >
        Generate
      </button>
      <button
        onClick={() => {
          setPathGridState(solutionGrid);
          setIsSolved(true);
        }}
      >
        Solve
      </button>
      <button
        onClick={() => {
          setPathGridState(createEmptyPathGrid(generateWidth, generateHeight));
          // setPuzzle(puzzleFromNumberGrid(puzzle.unsolved));
          setIsSolved(false);
        }}
      >
        Reset
      </button>
    </>
  );
}
