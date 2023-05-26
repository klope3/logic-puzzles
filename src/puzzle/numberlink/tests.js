import { generate } from "./generate.js";
import { minBy, maxBy } from "../../minMax.js";
export function testGenerationTime(width, height, pairs, testsToRun = 100) {
    let testsNumber = 0; //a "test" is a generation attempt for a particular seed
    let failures = 0;
    const maxFailures = 10;
    const successTimes = []; //the time took for each puzzle generated successfully
    const successAttempts = []; //the number of attempts required for each puzzle generated successfully
    while (testsNumber < testsToRun) {
        const generationResult = generate(width, height, testsNumber, pairs);
        if (!generationResult.puzzle) {
            failures++;
            if (failures === maxFailures) {
                console.log(`TOO MANY FAILURES when generating ${width}x${height} puzzles with ${pairs} pairs.`);
                return;
            }
        }
        else {
            successTimes.push(generationResult.executionMs);
            successAttempts.push(generationResult.attempts);
        }
        testsNumber++;
    }
    const minTime = minBy(successTimes, (time) => time);
    const maxTime = maxBy(successTimes, (time) => time);
    const avgTime = successTimes.reduce((accum, time) => accum + time, 0) / successTimes.length;
    const minAttempts = minBy(successAttempts, (attempts) => attempts);
    const maxAttempts = maxBy(successAttempts, (attempts) => attempts);
    const avgAttempts = successAttempts.reduce((accum, attempts) => accum + attempts, 0) /
        successAttempts.length;
    console.log(`Ran the generation algorithm on ${testsToRun} seeds, with ${failures} failures.\n
    Puzzle size: ${width}x${height}\n
    Pair count: ${pairs}\n
    Generation time was in the range ${minTime}ms - ${maxTime}ms, with an average of ${avgTime}ms.\n
    Generation attempts per seed was in the range ${minAttempts} - ${maxAttempts}, with an average of ${avgAttempts}.`);
}
export function testSizesAndPairs() {
    const tests = [
        // {
        //   width: 5,
        //   height: 5,
        //   pairs: 3,
        // },
        // {
        //   width: 5,
        //   height: 5,
        //   pairs: 4,
        // },
        // {
        //   width: 5,
        //   height: 5,
        //   pairs: 5,
        // },
        // {
        //   width: 5,
        //   height: 5,
        //   pairs: 6,
        // },
        // {
        //   width: 6,
        //   height: 5,
        //   pairs: 3,
        // },
        // {
        //   width: 6,
        //   height: 5,
        //   pairs: 4,
        // },
        // {
        //   width: 6,
        //   height: 5,
        //   pairs: 5,
        // },
        // {
        //   width: 6,
        //   height: 5,
        //   pairs: 6,
        // },
        // {
        //   width: 7,
        //   height: 5,
        //   pairs: 3,
        // },
        // {
        //   width: 7,
        //   height: 5,
        //   pairs: 4,
        // },
        // {
        //   width: 7,
        //   height: 5,
        //   pairs: 5,
        // },
        // {
        //   width: 7,
        //   height: 5,
        //   pairs: 6,
        // },
        {
            width: 7,
            height: 6,
            pairs: 3,
        },
        {
            width: 7,
            height: 6,
            pairs: 4,
        },
        {
            width: 7,
            height: 6,
            pairs: 5,
        },
        {
            width: 7,
            height: 6,
            pairs: 6,
        },
        {
            width: 7,
            height: 7,
            pairs: 4,
        },
        {
            width: 7,
            height: 7,
            pairs: 5,
        },
        {
            width: 7,
            height: 7,
            pairs: 6,
        },
        {
            width: 7,
            height: 7,
            pairs: 7,
        },
        {
            width: 8,
            height: 7,
            pairs: 4,
        },
        {
            width: 8,
            height: 7,
            pairs: 5,
        },
        {
            width: 8,
            height: 7,
            pairs: 6,
        },
        {
            width: 8,
            height: 7,
            pairs: 7,
        },
        {
            width: 9,
            height: 7,
            pairs: 4,
        },
        {
            width: 9,
            height: 7,
            pairs: 5,
        },
        {
            width: 9,
            height: 7,
            pairs: 6,
        },
        {
            width: 9,
            height: 7,
            pairs: 7,
        },
        {
            width: 9,
            height: 8,
            pairs: 4,
        },
        {
            width: 9,
            height: 8,
            pairs: 5,
        },
        {
            width: 9,
            height: 8,
            pairs: 6,
        },
        {
            width: 9,
            height: 8,
            pairs: 7,
        },
        {
            width: 9,
            height: 9,
            pairs: 5,
        },
        {
            width: 9,
            height: 9,
            pairs: 6,
        },
        {
            width: 9,
            height: 9,
            pairs: 7,
        },
        {
            width: 9,
            height: 9,
            pairs: 8,
        },
    ];
    for (const test of tests) {
        testGenerationTime(test.width, test.height, test.pairs);
    }
}
