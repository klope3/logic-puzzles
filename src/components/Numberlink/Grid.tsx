import { Cell } from "./Cell";
import {
  DirectionSet,
  NumberGrid,
  PathGrid,
} from "../../puzzle/numberlink/types";
import "./Grid.css";
import { flatIndexToCoords } from "../../puzzle/numberlink/utility";

type GridProps = {
  puzzle: NumberGrid;
  pathGrid: PathGrid;
  clickFunction: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

export function Grid({ puzzle, clickFunction, pathGrid }: GridProps) {
  let flattenedNumbers: number[] = [];
  puzzle.forEach((row) => (flattenedNumbers = flattenedNumbers.concat(row)));
  const gridStyle = {
    gridTemplateColumns: `repeat(${puzzle[0].length}, auto)`,
  };

  const width = puzzle[0].length;
  const height = puzzle.length;

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
            pathCell={pathGrid[coords.y][coords.x]}
          />
        );
      })}
    </div>
  );
}
