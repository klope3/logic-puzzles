import { black, white } from "./types.js";
import { debugLog, getOppositeState } from "./utility.js";
function getRawRandom(width, height) {
    //right now this needs a seedable RNG for proper testing!
    const generated = [];
    const offLimitsWhite = []; //which indices can't receive white
    const offLimitsBlack = []; //which indices can't receive black
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            let valToPlace = 0;
            const flatIndex = y * width + x;
            debugLog("visiting index " + flatIndex);
            //IF we decide the space won't be empty...
            if (Math.random() < 0.3) {
                //we'll place either white or black
                valToPlace = Math.random() < 0.5 ? white : black;
                //check off limits indices based on which color was chosen
                const offLimitsIndices = valToPlace === white ? offLimitsWhite : offLimitsBlack;
                const canPlaceThisVal = offLimitsIndices.includes(flatIndex);
                //if we can't place this color, choose the other instead
                if (!canPlaceThisVal)
                    valToPlace = getOppositeState(valToPlace);
                //if this is the second same color in a row horizontally, the space on the right must be off-limits for this color
                if (row[flatIndex - 1] === valToPlace)
                    offLimitsIndices.push(flatIndex + 1);
                //if this is the second same color in a row vertically, the space below must be off-limits for this color
                if (row[flatIndex - width] === valToPlace)
                    offLimitsIndices.push(flatIndex - width);
            }
            //actually place the value
            row.push(valToPlace);
        }
        generated.push(row);
    }
    return generated;
}
