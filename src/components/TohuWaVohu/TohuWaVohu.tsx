import { useState } from "react";
import { CellState, black, empty, white } from "../../puzzle/tohu/types";
import { Grid } from "./Grid";
import { generatePuzzle } from "../../puzzle/tohu/generate";
import { indexToCoords } from "../../puzzle/tohu/utility";

const initialPuzzle = generatePuzzle(6, 6, 0);

function clonePuzzleStates(states: CellState[][]) {
  return states.map((row) => [...row]);
}

export function TohuWaVohu() {
  const [puzzle, setPuzzle] = useState(initialPuzzle);
  const [puzzleState, setPuzzleState] = useState(
    clonePuzzleStates(puzzle.states)
  );
  const [isSolved, setIsSolved] = useState(false);
  const [newSeed, setNewSeed] = useState(0);
  const [newWidth, setNewWidth] = useState(6);
  const [newHeight, setNewHeight] = useState(6);

  function checkSolved(newStates: CellState[][]) {
    for (let y = 0; y < newStates.length; y++) {
      for (let x = 0; x < newStates[0].length; x++) {
        if (puzzle.solution[y][x] !== newStates[y][x]) {
          return;
        }
      }
    }
    setIsSolved(true);
  }

  function clickCell(clickedFlatIndex: number) {
    if (isSolved) return;

    const coords = indexToCoords(clickedFlatIndex, puzzle.solution[0].length);
    if (puzzle.states[coords.y][coords.x] !== empty) return;

    const curState = puzzleState[coords.y][coords.x];
    const newStates = clonePuzzleStates(puzzleState);
    let stateToSet: CellState = 0;
    if (curState === empty) stateToSet = white;
    if (curState === white) stateToSet = black;
    newStates[coords.y][coords.x] = stateToSet;

    setPuzzleState(newStates);
    checkSolved(newStates);
  }

  return (
    <div>
      <div>Tohu</div>
      <Grid
        puzzleOriginal={puzzle.states}
        puzzleState={puzzleState}
        clickFunction={clickCell}
      />
      {isSolved && <div>Solved!</div>}
      <div>
        <button onClick={() => setPuzzleState(puzzle.states)}>Reset</button>
      </div>
      <div>
        <button
          onClick={() => {
            const newPuzzle = generatePuzzle(newWidth, newHeight, newSeed);
            setPuzzle(newPuzzle);
            setPuzzleState(newPuzzle.states);
            setIsSolved(false);
          }}
        >
          Generate
        </button>
      </div>
      <div>
        <label htmlFor="seed">
          Seed:
          <input
            type="number"
            name="seed"
            id="seed"
            value={newSeed}
            onChange={(e) => setNewSeed(+e.target.value)}
          />
        </label>
      </div>
      <div>
        <label htmlFor="width">
          Width:
          <input
            type="number"
            name="width"
            id="width"
            value={newWidth}
            onChange={(e) => setNewWidth(+e.target.value)}
          />
        </label>
      </div>
      <div>
        <label htmlFor="height">
          Height:
          <input
            type="number"
            name="height"
            id="height"
            value={newHeight}
            onChange={(e) => setNewHeight(+e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
