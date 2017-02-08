"use strict";
var Optional = (function () {
    function Optional() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _this = this;
        this.value = undefined;
        this.hasValue = false;
        this.map = function (fn) { return _this.flatMap(function (v) { return Optional.some(fn(v)); }); };
        this.flatMap = function (fn) { return _this.hasValue ? fn(_this.value) : Optional.none(); };
        this.orElse = function (value) {
            if (typeof (value) === "function") {
                return value();
            }
            else {
                return value;
            }
        };
        this.orNull = function () { return _this.orElse(null); };
        if (args.length === 1) {
            this.value = args[0];
            this.hasValue = true;
        }
    }
    return Optional;
}());
Optional.some = function (value) { return new Optional(value); };
Optional.none = function () { return new Optional(); };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Optional;
//# sourceMappingURL=optional.js.map