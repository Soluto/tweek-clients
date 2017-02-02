"use strict";
function partitionByIndex(arr, index) {
    if (index >= 0) {
        return [arr.slice(0, index), arr.slice(index)];
    }
    else {
        return partitionByIndex(arr, arr.length - index);
    }
}
exports.partitionByIndex = partitionByIndex;
function distinct(arr) {
    return Array.from(new Set(arr));
}
exports.distinct = distinct;
function captialize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function snakeToCamelCase(keyName) {
    var _a = partitionByIndex(keyName.split("_"), 1), first = _a[0][0], others = _a[1];
    return [first].concat(others.map(captialize)).join("");
}
exports.snakeToCamelCase = snakeToCamelCase;
//# sourceMappingURL=utils.js.map