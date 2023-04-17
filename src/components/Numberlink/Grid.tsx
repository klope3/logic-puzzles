import { Cell } from "./Cell";
import { DirectionSet, Puzzle } from "../../puzzle/numberlink/types";
import "./Grid.css";
import { flatIndexToCoords } from "../../puzzle/numberlink/utility";

type GridProps = {
  puzzle: Puzzle;
  directionGridState: DirectionSet[][];
  clickFunction: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

export function Grid({ puzzle, clickFunction, directionGridState }: GridProps) {
  let flattenedNumbers: number[] = [];
  puzzle.unsolved.forEach(
    (row) => (flattenedNumbers = flattenedNumbers.concat(row))
  );
  const gridStyle = {
    gridTemplateColumns: `repeat(${puzzle.unsolved[0].length}, auto)`,
  };

  const width = puzzle.unsolved[0].length;
  const height = puzzle.unsolved.length;

  return (
    <div className="puzzle-grid" style={gridStyle} onClick={clickFunction}>
      {flattenedNumbers.map((num, i) => {
        const coords = flatIndexToCoords(i, width);
        return (
          <Cell
            number={num > 0 ? num : undefined}
            puzzleWidth={width}
            puzzleHeight={height}
            flatIndex={i}
            directions={directionGridState[coords.y][coords.x]}
          />
        );
      })}
    </div>
  );
}
