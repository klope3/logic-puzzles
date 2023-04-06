import { getRawRandom as getRawSolvedRandom } from "../puzzle/tohu/generate.js";
import { Grid } from "../puzzle/tohu/types.js";
import { printGrid } from "../puzzle/tohu/utility.js";

export const verbose = false;

// const generated = getRawRandom(6, 6);
// printGrid(new Grid(generated));

// const startSeed = 30;
// for (let index = startSeed; index < startSeed + 30; index++) {
//   const raw = getRawSolvedRandom(8, 8, index);
//   const grid = new Grid(raw);
//   printGrid(grid);
//   console.log("====================");
// }

for (let i = 0; i < 1; i++) {
  const raw = getRawSolvedRandom(13, 13);
}
console.log("done");
// let str = "";
// for (let i = 0; i < 30; i++) {
//   const n = mulberry32(i) > 0.5 ? 2 : 1;
//   str += n;
// }
// console.log(str);

// const solutions = getSolutions(puzzle1, 200);
// for (const solution of solutions) {
//   printGrid(solution);
// }
// console.log(solutions.length + " solutions");
