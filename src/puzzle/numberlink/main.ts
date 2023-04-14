import { easy1 } from "./puzzles.js";
import { Puzzle } from "./types.js";
import { printPuzzle, puzzleFromNumberGrid } from "./utility.js";

const puzzle: Puzzle = puzzleFromNumberGrid(easy1);
printPuzzle(puzzle);
