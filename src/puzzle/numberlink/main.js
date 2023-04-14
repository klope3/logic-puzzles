import { easy1 } from "./puzzles.js";
import { solve } from "./solve.js";
import { printPuzzle, puzzleFromNumberGrid } from "./utility.js";
const puzzle = puzzleFromNumberGrid(easy1);
solve(puzzle);
printPuzzle(puzzle);
