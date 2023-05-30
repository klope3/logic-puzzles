import { generate } from "./generate.js";
import { easy1 } from "./puzzles.js";
import { solve } from "./solve.js";
import { testGenerationTime, testSizesAndPairs } from "./tests.js";
import { printSolvingData } from "./utility.js";

// const puzzle: Puzzle = puzzleFromNumberGrid(easy1);
// solve(puzzle);

// const { puzzle } = generate(7, 5, 0, 3);
// console.log("puzzle seed is " + puzzle?.seed);
// if (puzzle) printPuzzle(puzzle);

testSizesAndPairs();
