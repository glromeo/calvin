import {alpha} from "sample/alpha";
const {test} = QUnit;

console.log("alpha test", QUnit);

test("test alpha", function (assert) {
    console.log("running alpha test");
    assert.equal(alpha(), "alpha", "Passed!");
});