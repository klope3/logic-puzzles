import { debugLog, flatIndexToCoords, puzzleFromNumberGrid, randomSeedNumber, } from "./utility.js";
import { mulberry32 } from "../../seededRandom.js";
import { solve } from "./solve.js";
export function generate(width, height, seed) {
    if (seed === undefined)
        seed = randomSeedNumber();
    let safety = 0;
    const safetyMax = 9999;
    let seedOffset = 0;
    while (safety < safetyMax) {
        debugLog("starting a new grid");
        const nums = createEmptyNumberGrid(width, height);
        fillRandomPairs(nums, 5, seed + seedOffset);
        const puzzle = puzzleFromNumberGrid(nums);
        if (solve(puzzle)) {
            puzzle.seed = seed;
            console.log("done in " + safety + " attempts with seed " + seed);
            return puzzle;
        }
        seedOffset++;
        safety++;
    }
    if (safety === safetyMax)
        console.error("Infinite loop!");
}
function fillRandomPairs(numberGrid, pairs, seed) {
    const width = numberGrid[0].length;
    const height = numberGrid.length;
    const totalCells = width * height;
    const openIndices = Array.from({ length: totalCells }, (_, i) => i);
    for (let i = 0; i < pairs; i++) {
        for (let j = 0; j < 2; j++) {
            const randIndex = Math.floor(mulberry32(seed + i + j) * openIndices.length);
            const randCoords = flatIndexToCoords(openIndices[randIndex], width);
            numberGrid[randCoords.y][randCoords.x] = i + 1;
            debugLog("filled a number at " + randCoords.x + ", " + randCoords.y);
            openIndices.splice(randIndex, 1);
        }
    }
}
function createEmptyNumberGrid(width, height) {
    return Array.from({ length: height }, () => Array.from({ length: width }, () => 0));
}
