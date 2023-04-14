//pure deduction = no assumptions about unique solutions. all moves are strictly necessary.
//assisted deduction = no backtracking needed, but we assume that the puzzle has a unique solution and that all cells will be filled. This allows us to make deductions such as filling in puzzle corners, preventing paths from doubling back on themselves, etc.
//backtracking = at least part of the solution requires trial and error.
//janko.at #1
//pure deduction
export const easy1 = [
    [7, 0, 0, 0, 3],
    [9, 1, 3, 0, 0],
    [0, 0, 0, 7, 0],
    [0, 0, 0, 0, 0],
    [9, 0, 0, 0, 1],
];
//janko.at #2
//pure deduction
export const easy2 = [
    [0, 0, 0, 0, 0, 0],
    [0, 8, 0, 0, 8, 0],
    [0, 6, 0, 0, 0, 7],
    [0, 0, 0, 0, 0, 6],
    [0, 0, 2, 0, 0, 9],
    [7, 9, 0, 0, 0, 2],
];
//janko.at #162
//assisted deduction
export const easy3 = [
    [2, 0, 0, 0, 5, 2, 0],
    [0, 1, 3, 0, 0, 0, 0],
    [0, 4, 0, 0, 3, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 4, 5, 0],
    [0, 0, 0, 0, 0, 0, 0],
];
//janko.at #26
//pure deduction
export const easy4 = [
    [1, 7, 5, 8, 6, 4, 9, 10, 3, 2],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 8, 0, 0, 9, 0, 0, 0],
    [0, 0, 0, 5, 0, 0, 4, 0, 3, 0],
    [1, 0, 0, 7, 0, 0, 6, 0, 10, 2],
];
//janko.at #163
//pure deduction
export const easy5 = [
    [0, 0, 5, 1, 2, 0, 0, 0],
    [0, 0, 0, 0, 4, 0, 3, 0],
    [0, 0, 6, 0, 3, 0, 0, 0],
    [0, 0, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 4, 0, 0],
    [0, 0, 0, 6, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 0, 0, 0, 0, 0, 0, 1],
];
//janko.at #5
//backtracking
export const easy6 = [
    [0, 0, 0, 0, 0, 0, 0, 3],
    [8, 1, 0, 0, 0, 0, 0, 0],
    [7, 2, 0, 0, 0, 0, 4, 0],
    [0, 0, 0, 8, 0, 0, 0, 0],
    [0, 0, 0, 1, 3, 5, 0, 0],
    [0, 0, 0, 0, 2, 6, 0, 0],
    [0, 6, 0, 0, 0, 0, 4, 0],
    [0, 0, 0, 0, 7, 5, 0, 0],
];
