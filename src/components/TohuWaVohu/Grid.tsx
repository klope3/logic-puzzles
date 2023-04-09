import { CellState, empty } from "../../puzzle/tohu/types";
import { Cell } from "./Cell";
import "./Grid.css";
import { indexToCoords } from "../../puzzle/tohu/utility";

type GridProps = {
  puzzleOriginal: CellState[][];
  puzzleState: CellState[][];
  clickFunction: (clickedIndex: number) => void;
};

export function Grid({
  puzzleOriginal,
  puzzleState,
  clickFunction,
}: GridProps) {
  let flattened: CellState[] = [];
  puzzleState.forEach((row) => (flattened = flattened.concat(row)));
  const style = {
    gridTemplateColumns: `repeat(${puzzleState[0].length}, auto)`,
  };
  return (
    <div className="puzzle-grid" style={style}>
      {flattened.map((state, i) => {
        const coords = indexToCoords(i, puzzleState[0].length);
        const locked = puzzleOriginal[coords.y][coords.x] > empty;
        return (
          <Cell
            flatIndex={i}
            state={state}
            locked={locked}
            clickFunction={clickFunction}
          />
        );
      })}
    </div>
  );
}
