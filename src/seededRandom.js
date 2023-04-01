"use strict";
//This is not mine!! Found here: https://github.com/bryc/code/blob/master/jshash/PRNGs.md
function mulberry32(a) {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}