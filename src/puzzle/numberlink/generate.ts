import { GenerationResult, NumberGrid, Puzzle } from "./types";
import {
  debugLog,
  flatIndexToCoords,
  puzzleFromNumberGrid,
  randomSeedNumber,
} from "./utility.js";
import { mulberry32 } from "../../seededRandom.js";
import { solve } from "./solve.js";

export function generate(
  width: number,
  height: number,
  seed?: number,
  pairs?: number
): GenerationResult {
  seed = randomSeedNumber(seed);

  let attempts = 0;
  const attemptsMax = 999999;
  let seedOffset = 0;
  if (pairs === undefined) pairs = 5;
  const startTime = Date.now();
  let failures = 0;
  while (attempts < attemptsMax) {
    debugLog("starting a new grid");
    const nums = createEmptyNumberGrid(width, height);
    fillRandomPairs(nums, pairs, seed + seedOffset);
    const puzzle = puzzleFromNumberGrid(nums);
    if (solve(puzzle)) {
      puzzle.seed = seed;
      // console.log("done in " + attempts + " attempts with seed " + seed);
      return {
        puzzle,
        attempts,
        executionMs: Date.now() - startTime,
      };
    }

    seedOffset++;
    attempts++;
    failures++;
  }
  // console.error("Too many attempts!");
  return {
    puzzle: undefined,
    attempts,
    executionMs: Date.now() - startTime,
  };
}

function fillRandomPairs(numberGrid: NumberGrid, pairs: number, seed: number) {
  const width = numberGrid[0].length;
  const height = numberGrid.length;
  const totalCells = width * height;
  const openIndices = Array.from({ length: totalCells }, (_, i) => i);

  for (let i = 0; i < pairs; i++) {
    for (let j = 0; j < 2; j++) {
      const randIndex = Math.floor(
        mulberry32(seed + i + j) * openIndices.length
      );
      const randCoords = flatIndexToCoords(openIndices[randIndex], width);
      numberGrid[randCoords.y][randCoords.x] = i + 1;
      debugLog("filled a number at " + randCoords.x + ", " + randCoords.y);
      openIndices.splice(randIndex, 1);
    }
  }
}

function createEmptyNumberGrid(width: number, height: number): NumberGrid {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 0)
  );
}
