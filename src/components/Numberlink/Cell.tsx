import { DirectionSet } from "../../puzzle/numberlink/types";
import { flatIndexToCoords } from "../../puzzle/numberlink/utility";

type CellProps = {
  number: number | undefined;
  flatIndex: number;
  puzzleWidth: number;
  puzzleHeight: number;
  directions: DirectionSet;
};

export function Cell({
  number,
  flatIndex,
  puzzleWidth,
  puzzleHeight,
  directions,
}: CellProps) {
  const cellCoords = flatIndexToCoords(flatIndex, puzzleWidth);
  const clickZoneBase = {
    position: "absolute",
    // backgroundColor: "red",
    zIndex: "10",
  };
  const clickZoneHorzStyle = {
    ...clickZoneBase,
    right: "0",
    top: "50%",
    translate: "50% -50%",
    height: "40%",
    width: "60%",
  };
  const clickZoneVertStyle = {
    ...clickZoneBase,
    bottom: "0",
    left: "50%",
    translate: "-50% 50%",
    height: "60%",
    width: "40%",
  };
  const lineBase = {
    position: "absolute",
    backgroundColor: "black",
  };
  const horzBase = {
    top: "50%",
    translate: "0 -50%",
    height: "20%",
  };
  const vertBase = {
    left: "50%",
    translate: "-50%",
    width: "20%",
  };
  const leftStyle = {
    ...lineBase,
    ...horzBase,
    left: 0,
    right: "40%",
  };
  const rightStyle = {
    ...lineBase,
    ...horzBase,
    right: 0,
    left: "40%",
  };
  const upStyle = {
    ...lineBase,
    ...vertBase,
    top: 0,
    bottom: "40%",
  };
  const downStyle = {
    ...lineBase,
    ...vertBase,
    bottom: 0,
    top: "40%",
  };
  return (
    <div className="cell">
      <div className="cell-number">{number}</div>
      {directions.left && <div style={leftStyle}></div>}
      {directions.right && <div style={rightStyle}></div>}
      {directions.up && <div style={upStyle}></div>}
      {directions.down && <div style={downStyle}></div>}
      {cellCoords.x < puzzleWidth - 1 && (
        <div
          data-clickzonesource={flatIndex}
          data-clickzonedirection="right"
          style={clickZoneHorzStyle}
        ></div>
      )}
      {cellCoords.y < puzzleHeight - 1 && (
        <div
          data-clickzonesource={flatIndex}
          data-clickzonedirection="down"
          style={clickZoneVertStyle}
        ></div>
      )}
    </div>
  );
}
