const lessThan = (a, b) => a < b;
const greaterThan = (a, b) => a > b;
export const minBy = (array, cb) => {
    return minOrMaxBy(array, cb, "min");
};
export function maxBy(array, cb) {
    return minOrMaxBy(array, cb, "max");
}
function minOrMaxBy(array, cb, comparisonType) {
    let best = array[0];
    if (best === undefined)
        return undefined;
    let bestValue = cb(best);
    const compare = comparisonType === "min" ? lessThan : greaterThan;
    for (const element of array) {
        const elementValue = cb(element);
        if (compare(elementValue, bestValue)) {
            best = element;
            bestValue = elementValue;
        }
    }
    return best;
}
