import {beta} from "sample/beta";
const {test} = QUnit;

console.log("beta test", QUnit);

test("test beta", function (assert) {
    console.log("running beta test");
    assert.equal(beta(), "beta calling alpha", "Passed!");
});