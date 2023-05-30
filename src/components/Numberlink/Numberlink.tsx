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
  isCellPartiallyFilled,
} from "../../puzzle/numberlink/gridLogic";
import { PuzzleControls } from "../common/PuzzleControls";
import { Link } from "react-router-dom";

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

    setPuzzle(result.puzzle);
    setSolutionGrid(result.solution);
    setPathGridState(createEmptyPathGrid(generateWidth, generateHeight));
    setIsSolved(false);
  }

  function checkSolved() {
    const pathsToFind = new Set([...puzzle.flat().filter((a) => a !== 0)]);
    const completePathsFound: number[] = [];
    for (let y = 0; y < puzzle.length; y++) {
      for (let x = 0; x < puzzle[0].length; x++) {
        if (puzzle[y][x] === 0 || completePathsFound.includes(puzzle[y][x]))
          continue;
        if (!isCellPartiallyFilled(pathGridState[y][x])) return;
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
      {isSolved && <div className="solved">Solved!</div>}
      <PuzzleControls
        minWidth={5}
        minHeight={5}
        onChangeWidth={setGenerateWidth}
        onChangeHeight={setGenerateHeight}
        onChangeSeed={setGenerateSeed}
        showGenerationWarning={true}
        onClickGenerate={() =>
          generatePuzzle(generateWidth, generateHeight, generateSeed)
        }
        onClickSolve={() => {
          setPathGridState(solutionGrid);
          setIsSolved(true);
        }}
        onClickReset={() => {
          setPathGridState(createEmptyPathGrid(generateWidth, generateHeight));
          setIsSolved(false);
        }}
      />
      <details>
        <summary>How to Play</summary>
        <p>
          Click on the grid lines to draw paths. Connect same numbers. Paths
          can't cross.
        </p>
      </details>
    </>
  );
}
