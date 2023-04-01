import { bad, puzzle1 } from "../puzzle/tohu/puzzles.js";
import { getSolutions } from "../puzzle/tohu/solve.js";
import { Grid } from "../puzzle/tohu/types.js";
import { printGrid } from "../puzzle/tohu/utility.js";

export const verbose = false;

// const generated = getRawRandom(6, 6);
// printGrid(new Grid(generated));
printGrid(new Grid(puzzle1));
const solutions = getSolutions(puzzle1, 200);
for (const solution of solutions) {
  printGrid(solution);
}
console.log(solutions.length + " solutions");
