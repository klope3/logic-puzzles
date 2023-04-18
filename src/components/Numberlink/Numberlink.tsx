import { Grid } from "./Grid";
import { easy1 } from "../../puzzle/numberlink/puzzles";
import {
  createEmptyDirectionGrid,
  flatIndexToCoords,
  puzzleFromNumberGrid,
  puzzleToDirectionGrid,
} from "../../puzzle/numberlink/utility";
import { solve } from "../../puzzle/numberlink/solve";
import { useState } from "react";
import { DirectionSet } from "../../puzzle/numberlink/types";

const puzzle = puzzleFromNumberGrid(easy1);
solve(puzzle);
const solutionGrid = puzzleToDirectionGrid(puzzle);

export function Numberlink() {
  const [directionGridState, setDirectionGridState] = useState(
    createEmptyDirectionGrid(5, 5)
  );
  const [isSolved, setIsSolved] = useState(false);

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
      <Grid
        puzzle={puzzle}
        clickFunction={clickGrid}
        directionGridState={directionGridState}
      />
      {isSolved && <div>Solved!</div>}
    </>
  );
}
