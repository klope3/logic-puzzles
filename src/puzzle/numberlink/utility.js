export function puzzleFromNumberGrid(grid) {
    const numbers = new Set();
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
            if (grid[y][x] > 0)
                numbers.add(grid[y][x]);
        }
    }
    console.log(numbers);
    const puzzle = {
        unsolved: grid,
    };
    return puzzle;
}
export function printPuzzle(puzzle) {
    const { unsolved } = puzzle;
    let full = "";
    for (let y = 0; y < unsolved.length; y++) {
        let row = "";
        for (let x = 0; x < unsolved[0].length; x++) {
            row += unsolved[y][x] > 0 ? unsolved[y][x] : ".";
        }
        row += "\n";
        full += row;
    }
    console.log(full);
}
