// This method iterates all the keys in the source exports object and copies them to the destination exports one.
// Note: the method will not check for naming collisions and will override any already existing entries in the destination exports.
export var merge = function (sourceExports: any, destExports: any, deep?: boolean) {
    for (var key in sourceExports) {
        if (deep && typeof sourceExports[key] === "object") {
            destExports[key] = {};
            merge(sourceExports[key], destExports[key], true);
        } else {
            destExports[key] = sourceExports[key];
        }
    }
}
