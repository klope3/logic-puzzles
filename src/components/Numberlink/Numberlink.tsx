import { Grid } from "./Grid";
import { easy1 } from "../../puzzle/numberlink/puzzles";
import {
  createEmptyDirectionGrid,
  flatIndexToCoords,
  puzzleFromNumberGrid,
  puzzleToDirectionGrid,
} from "../../puzzle/numberlink/utility";
import { solve } from "../../puzzle/numberlink/solve";
import { useEffect, useState } from "react";
import { DirectionSet, Puzzle } from "../../puzzle/numberlink/types";
import { generate } from "../../puzzle/numberlink/generate";

export function Numberlink() {
  const [puzzle, setPuzzle] = useState({} as Puzzle);
  const [solutionGrid, setSolutionGrid] = useState([] as DirectionSet[][]);
  const [directionGridState, setDirectionGridState] = useState(
    [] as DirectionSet[][]
  );
  const [isSolved, setIsSolved] = useState(false);
  const [generateWidth, setGenerateWidth] = useState(5);
  const [generateHeight, setGenerateHeight] = useState(5);
  const [generateSeed, setGenerateSeed] = useState(0);

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

    setSolutionGrid(puzzleToDirectionGrid(result.puzzle));
    const cleaned = puzzleFromNumberGrid(result.puzzle.unsolved);
    setPuzzle(cleaned);
    setDirectionGridState(
      createEmptyDirectionGrid(generateWidth, generateHeight)
    );
    setIsSolved(false);
  }

  function checkSolved() {
    for (let y = 0; y < solutionGrid.length; y++) {
      for (let x = 0; x < solutionGrid[0].length; x++) {
        const current = directionGridState[y][x];
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
    const newDirectionGrid = [...directionGridState];
    if (direction == "right") {
      newDirectionGrid[sourceCoords.y][sourceCoords.x].right =
        !newDirectionGrid[sourceCoords.y][sourceCoords.x].right;
      newDirectionGrid[sourceCoords.y][sourceCoords.x + 1].left =
        !newDirectionGrid[sourceCoords.y][sourceCoords.x + 1].left;
    } else {
      newDirectionGrid[sourceCoords.y][sourceCoords.x].down =
        !newDirectionGrid[sourceCoords.y][sourceCoords.x].down;
      newDirectionGrid[sourceCoords.y + 1][sourceCoords.x].up =
        !newDirectionGrid[sourceCoords.y + 1][sourceCoords.x].up;
    }

    setDirectionGridState(newDirectionGrid);
    checkSolved();
  }

  return (
    <>
      {puzzle.unsolved !== undefined && (
        <Grid
          puzzle={puzzle}
          clickFunction={clickGrid}
          directionGridState={directionGridState}
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
          setDirectionGridState(solutionGrid);
          setIsSolved(true);
        }}
      >
        Solve
      </button>
      <button
        onClick={() => {
          setDirectionGridState(
            createEmptyDirectionGrid(generateWidth, generateHeight)
          );
          setPuzzle(puzzleFromNumberGrid(puzzle.unsolved));
          setIsSolved(false);
        }}
      >
        Reset
      </button>
    </>
  );
}
