import {assert} from "chai";
import {Compiler} from "grassroots/lib/compiler";

describe("compile tests", () => {

    function compile(text) {
        return new Compiler().compile(text);
    }

    it("1 + x", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['x']);
    });

    it("x + y", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters ['x', 'y']);
    });

    it("x => x + y", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['y']);
    });

    it("function F() { let z = x + y; {;}; return z; }", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters ['x', 'y']);
    });

    it("([x,,y=1]) => x + y", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, []);
    });

    it("({a=b, x=y}) => a + x + y", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters ['b', 'y']);
    });

    it("a.b.c,true", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['a']);
    });

    it("function F() { if (true) {{ var a = 0; }} return a; }", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, []);
    });

    it("[a, b] = [a, 0]", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, []);
    });

    it("[x, c = d] = [1]", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['d']);
    });

    it("[{x}] = [{x: c}]", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['c']);
    });

    it("() => { if (false) { function f() {} } else { function g() {} } return f(g(c(d))); }", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['c', 'd']);
    });

    it("(function q() { q = () => q() + c(); })()", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['c']);
    });

    it("() => { for (var x = 0; x < c; y ++) { d = x + 1 } }", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['c', 'y']);
    });

    it("() => {{ class c {}; d = c; } d++ }", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, []);
    });

    it("() => {d++; { d = 1; }}", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['d']);
    });

    it("() => { class c {}; x = d; }", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['d']);
    });

    it("() => { while(x) { y++ } }", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['x', 'y']);
    });

    it("() => { do { let c; y++ } while(c); }", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['c', 'y']);
    });

    it("() => { do { var c; y++ } while(c); }", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['y']);
    });

    it("a[x] + a[0]", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['a', 'x']);
    });

    it("a ? b : c", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['a', 'b', 'c']);
    });

    it("!x", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['x']);
    });

    it("this.x", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, []);
    });

    it("c = new C()", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['C']);
    });

    it("a && true", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['a']);
    });

    it("class C { constructor() { super(); y; } m() { return x; } }", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['y', 'x']);
    });

    it("async function f() { await a; }", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['a']);
    });

    it("function *f() { yield a; }", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['a']);
    });

    it("() => { for (a in b) { c; } }", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['b', 'c']);
    });

    it("() => { for (a of b) {} }", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['b']);
    });

    it("() => { a: for (;;) { if (b) break a; if (c) continue; } }", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['b', 'c']);
    });

    it("() => { switch(a) { case b: break; default: c } }", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['a', 'b', 'c']);
    });

    it("() => { try {} catch(l) { throw e; } finally { f; } }", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['e', 'f']);
    });

    it("class C extends c {}", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['c']);
    });

    it("() => {a; debugger; b;}", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['a','b']);
    });

    it("{a:'A', b:'B'}[v]", function () {
        let {parameters} = compile(this.test.title);
        assert.deepEqual(parameters, ['v']);
    });
});