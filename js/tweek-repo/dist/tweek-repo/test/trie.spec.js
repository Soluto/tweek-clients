"use strict";
require("mocha");
var chai_1 = require("chai");
var trie_1 = require("../trie");
var splitJoin = {
    split: function (key) { return key.split(""); },
    join: function (fragment) { return fragment.join(""); }
};
describe("read data from trie", function () {
    it("simple read", function () {
        var trie = new trie_1.default(splitJoin);
        trie.set("hello", "world");
        chai_1.expect(trie.get("hello")).to.eql("world");
    });
    it("list read", function () {
        var trie = new trie_1.default(splitJoin);
        trie.set("hello", "world");
        trie.set("hell", "diablo");
        trie.set("help", "me");
        chai_1.expect(trie.list("he")).to.eql({
            hello: "world",
            hell: "diablo",
            help: "me"
        });
        chai_1.expect(trie.list("hell")).to.eql({
            hello: "world",
            hell: "diablo"
        });
    });
    it("list falsy items", function () {
        var trie = new trie_1.default(splitJoin);
        trie.set("hello", false);
        trie.set("hell", 0);
        chai_1.expect(trie.list("he")).to.eql({
            hello: false,
            hell: 0
        });
    });
    it("list relative", function () {
        var trie = new trie_1.default(splitJoin);
        trie.set("hello", "world");
        trie.set("hell", "diablo");
        chai_1.expect(trie.listRelative("hel")).to.eql({
            lo: "world",
            l: "diablo"
        });
        chai_1.expect(trie.listRelative("")).to.eql({
            hello: "world",
            hell: "diablo"
        });
    });
    it("update value", function () {
        var trie = new trie_1.default(splitJoin);
        trie.set("hello", "world");
        chai_1.expect(trie.get("hello")).to.eql("world");
        trie.set("hello", "world2");
        chai_1.expect(trie.get("hello")).to.eql("world2");
    });
});
//# sourceMappingURL=C:/code/tweek-clients/js/tweek-repo/dist/tweek-repo/test/trie.spec.js.map