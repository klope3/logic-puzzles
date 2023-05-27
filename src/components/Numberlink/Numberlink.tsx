import { Grid } from "./Grid";
import {
  createEmptyPathGrid,
  flatIndexToCoords,
} from "../../puzzle/numberlink/utility";
import { useEffect, useState } from "react";
import { NumberGrid, PathGrid } from "../../puzzle/numberlink/types";
import { generate } from "../../puzzle/numberlink/generate";

export function Numberlink() {
  const [puzzle, setPuzzle] = useState([] as NumberGrid);
  const [solutionGrid, setSolutionGrid] = useState([] as PathGrid);
  const [isSolved, setIsSolved] = useState(false);
  const [generateWidth, setGenerateWidth] = useState(5);
  const [generateHeight, setGenerateHeight] = useState(5);
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
    if (!result.puzzle) {
      console.error("Generation failed!");
      return;
    }

    // setSolutionGrid(puzzleToDirectionGrid(result.puzzle));
    // const cleaned = puzzleFromNumberGrid(result.puzzle.unsolved);
    setPuzzle(result.puzzle);
    setPathGridState(createEmptyPathGrid(generateWidth, generateHeight));
    setIsSolved(false);
  }

  function checkSolved() {
    return; //refactor later
    for (let y = 0; y < solutionGrid.length; y++) {
      for (let x = 0; x < solutionGrid[0].length; x++) {
        const current = pathGridState[y][x];
        const correct = solutionGrid[y][x];
        if (
          current.down !== correct.down ||
          current.up !== correct.up ||
          current.right !== correct.right ||
          current.down !== correct.down
        ) {
          return;
        }
      }
    }
    setIsSolved(true);
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
    const sourceCoords = flatIndexToCoords(source, 5);
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
