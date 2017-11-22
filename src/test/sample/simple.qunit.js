const { test } = QUnit;

console.log("simple qunit test", QUnit);

test( "hello test", function( assert ) {
    assert.ok( 1 == "1", "Passed!" );
});