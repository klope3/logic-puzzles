import { generate } from "./generate.js";
import { printPuzzle } from "./utility.js";
// const puzzle: Puzzle = puzzleFromNumberGrid(easy1);
// solve(puzzle);
const puzzle = generate(5, 5);
console.log("puzzle seed is " + (puzzle === null || puzzle === void 0 ? void 0 : puzzle.seed));
if (puzzle)
    printPuzzle(puzzle);
