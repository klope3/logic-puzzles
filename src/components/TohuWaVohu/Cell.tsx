import { CellState, black, white } from "../../puzzle/tohu/types";

type CellProps = {
  flatIndex: number;
  state: CellState;
  locked: boolean;
  clickFunction: (index: number) => void;
};

export function Cell({ state, flatIndex, locked, clickFunction }: CellProps) {
  let fillClass;
  if (state === white) fillClass = "white";
  if (state === black) fillClass = "black";
  return (
    <div
      className={`cell ${fillClass} ${locked ? "locked" : ""}`}
      onClick={() => clickFunction(flatIndex)}
    ></div>
  );
}
