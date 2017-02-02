var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
let val = Symbol.for("value");
export default class Trie {
    constructor(_splitJoin) {
        this._splitJoin = _splitJoin;
        this._root = {};
    }
    set(key, value) {
        const fragments = this._splitJoin.split(key);
        let node = fragments.reduce((acc, next) => {
            if (!acc[next]) {
                acc[next] = {};
            }
            return acc[next];
        }, this._root);
        node[val] = value;
    }
    get(key) {
        const fragments = this._splitJoin.split(key);
        let node = fragments.reduce((acc, next) => {
            if (!acc)
                return null;
            return acc[next];
        }, this._root);
        return node && node[val];
    }
    listRelative(key) {
        const fragments = this._splitJoin.split(key);
        return this.list(key, fragments.length);
    }
    list(key, index = 0) {
        const fragments = key && this._splitJoin.split(key) || [];
        let node = fragments.reduce((acc, next) => {
            if (!acc)
                return null;
            return acc[next];
        }, this._root);
        let results = [
            ...[
                ...Object.keys(node)
                    .map(name => this.list(this._splitJoin.join([...fragments, name]), index))
            ]
        ].reduce((acc, next) => (__assign({}, acc, next)), node[val] ? {
            [this._splitJoin.join(fragments.slice(index))]: node[val]
        } : {});
        return results;
    }
}
//# sourceMappingURL=trie.js.map