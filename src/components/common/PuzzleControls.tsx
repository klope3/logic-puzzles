type NumberCb = (val: number) => void;

type PuzzleControlsProps = {
  minWidth: number;
  minHeight: number;
  onChangeWidth: NumberCb;
  onChangeHeight: NumberCb;
  onChangeSeed: NumberCb;
  showGenerationWarning: boolean;
  onClickGenerate: () => void;
  onClickSolve: () => void;
  onClickReset: () => void;
};

export function PuzzleControls({
  minWidth,
  minHeight,
  onChangeWidth,
  onChangeHeight,
  onChangeSeed,
  showGenerationWarning,
  onClickGenerate,
  onClickSolve,
  onClickReset,
}: PuzzleControlsProps) {
  return (
    <div>
      <div>
        <label htmlFor="width">
          Width:
          <input
            type="number"
            name="width"
            id="width"
            min={minWidth}
            onChange={(e) => onChangeWidth(+e.target.value)}
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
            min={minHeight}
            onChange={(e) => onChangeHeight(+e.target.value)}
          />
        </label>
      </div>
      <div>
        <label htmlFor="seed">
          Seed:
          <input
            type="number"
            name="seed"
            id="seed"
            onChange={(e) => onChangeSeed(+e.target.value)}
          />
        </label>
      </div>
      {showGenerationWarning && (
        <div className="danger">
          Please allow a few seconds for larger puzzles to generate.
        </div>
      )}
      <div>
        <button onClick={onClickGenerate}>Generate</button>
      </div>
      <div>
        <button onClick={onClickSolve}>Solve</button>
      </div>
      <div>
        <button onClick={onClickReset}>Reset</button>
      </div>
    </div>
  );
}
