import { generate } from "./generate.js";
import { easy1 } from "./puzzles.js";
import { solve } from "./solve.js";
import { Puzzle } from "./types.js";
import { printPuzzle, puzzleFromNumberGrid } from "./utility.js";

// const puzzle: Puzzle = puzzleFromNumberGrid(easy1);
// solve(puzzle);
const puzzle = generate(5, 5);
console.log("puzzle seed is " + puzzle?.seed);
if (puzzle) printPuzzle(puzzle);
