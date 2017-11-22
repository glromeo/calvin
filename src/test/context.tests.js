import {assert, expect} from "chai";
import {Context} from "../main/calvin/context.js";

describe("Context tests", function () {

    let $root;

    before(function () {
        $root = new Context();
    });

    it("a new scope nas no keys", function () {
        let scope = new Context();
        assert.deepEqual(Object.keys(scope), []);
    });

    it("scope hidden properties", function () {
        let scope = new Context();
        [
            '$id',
            '$parent',
            '$$firstChild',
            '$$lastChild',
            '$$prevSibling',
            '$$nextSibling'
        ].forEach(property => {
            assert.isTrue(scope.hasOwnProperty(property));
        })
    });

    it("a scope can be created with a parent", function () {
        let parent = new Context();
        let scope = new Context(parent);
        assert.strictEqual(scope.$parent, parent);
        parent.p = 'v';
        assert.isUndefined(scope.p, "child is isolated");
    });

    it("a scope can be created with a parent and initial properties", function () {
        let parent = new Context();
        let scope = new Context(parent, {x: true});
        assert.isTrue(scope.hasOwnProperty('x'));
        assert.isTrue(scope.x);
    });

    it("if parent is not a Context then child is attached to Context.$root", function () {
        let $root = new Context();
        Context.$root = $root;
        let scope = new Context();
        assert.isUndefined($root.$parent);
        assert.equal(scope.$parent, $root);
        assert.equal($root.$$firstChild, scope);
    });

    it("a scope can be created with $new method on a parent scope", function () {
        let parent = new Context();
        let scope = parent.$new();
        assert.strictEqual(scope.$parent, parent);
        parent.p = 'v';
        assert.equal(scope.p, 'v', "in this case child inherits parent properties");
        assert.equal(Object.getPrototypeOf(scope), parent, "by prototypical inheritance");
    });

    it("a scope can be created with $new and initial properties", function () {
        let parent = new Context();
        let scope = parent.$new({q: true});
        assert.isTrue(scope.q);
    });

    it("a scope can move", function () {
        let parentA = new Context();
        parentA.p = 'a';
        let parentB = new Context();
        parentB.p = 'b';
        let scope = parentA.$new();
        assert.equal(scope.p, 'a');
        scope.$parent = parentB;
        assert.strictEqual(scope.$parent, parentB);
        assert.equal(scope.p, 'a', "child is still inheriting creator's properties");
        Object.setPrototypeOf(scope, parentB);
        assert.equal(scope.p, 'b', "one can always use setPrototypeOf to change that");
    });

    it("scopes are linked", function () {
        let r = new Context();
        let a = r.$new();
        let b = r.$new();
        let c = r.$new();
        assert.equal(r.$$firstChild, a);
        assert.equal(r.$$lastChild, c);
        assert.equal(b.$$prevSibling, a);
        assert.equal(b.$$nextSibling, c);
        b.$parent = a;
        assert.equal(r.$$firstChild.$$nextSibling, c);
        assert.equal(a.$$firstChild, b);
        assert.equal(a.$$lastChild, b);
        let e = a.$new();
        assert.equal(a.$$firstChild, b);
        assert.equal(a.$$lastChild, e);
        assert.equal(e.$$prevSibling, b);
        assert.equal(b.$$nextSibling, e);
        b.$parent = c;
        assert.equal(a.$$firstChild, e);
        assert.equal(c.$$firstChild, b);
        assert.isUndefined(e.$$prevSibling);
    });

    it("scopes can evaluate javascript expressions", function () {
        let scope = new Context();
        scope.txt = "The answer is";
        scope.num = 42;
        let actual = scope.$eval("txt + ' ' + num + '.'");
        assert.equal(actual, 'The answer is 42.');
    });

    it("scope $evalAsync supports async/await", function () {
        const men = ["Joe", "Mark", "Bob"];
        const women = ["Luise", "Jenny", "Claire", "Susan"];
        let scope = new Context();
        scope.fetchMen = async function () {
            return men
        };
        scope.women = women;
        let promise = scope.$evalAsync("(await fetchMen()).concat(women)");
        return promise.then(actual => {
            assert.deepEqual(actual, men.concat(women));
        });
    });

    // it("scope $onChange requires a callback", function () {
    //     expect(() => new Context().$watch("anything")).to.throw(TypeError);
    // });

    it("scope $onChange notifies callback until stopped", function () {

        let scope = new Context({x: 0});

        assert.deepEqual(Object.keys(scope), ['x']);

        let count = 0;

        scope.$watch('x').onChange(function first() {
            count++;
        });

        scope.x++;
        scope.x++;
        scope.x++;

        assert.equal(count, 3, "first called 3 times");

        let extra;

        scope.$watch('x').onChange(function second() {
            extra = true;
        });

        scope.x++;

        assert.equal(count, 4);
        assert.isTrue(extra, "second has been called");

        scope.$unwatch('x');

        scope.x++;

        assert.equal(count, 4);
    });

    it("scope.$watch('...').onChange notifies callback once if required", function () {

        let scope = new Context({x: 0});

        let count = 0;

        function once() {
            count++;
            return true;
        }

        let promise = scope.$watch('x').onChange(once);

        scope.x++;
        scope.x++;

        assert.equal(count, 1);
    });

    it("scope $when", function () {

        let scope = new Context({x: 0});

        let resolved = false;

        scope.$when('x').then(() => {
            resolved = true
        });

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                assert.isTrue(resolved, "property has been resolved");
                reject(new TypeError("for fun"));
            }, 100);
        }).catch(e => {
            assert.isTrue(e instanceof TypeError);
            assert.include(e.stack, 'for fun');
        });
    });

    it("$evalAsync simple test", async function () {

        let scope = new Context({x: 0, y: undefined});

        let actual;

        let result = scope.$evalAsync("x + y").then(v => {
            actual = v;
        });

        assert.isUndefined(actual);

        scope.y = 1;

        scope.y = 2;

        await result;

        assert.equal(actual, 1);
    });

    it("$eval with watcher", async function () {

        let scope = new Context({x: 0, y: undefined});

        let count = 0, actual;

        let result = scope.$eval("x + y", v => {
            count++;
            actual = v;
        });

        assert.isUndefined(actual);

        scope.y = 1;

        scope.y = 2;

        let r = await result;

        scope.y = 3;

        assert.equal(r, 1);
        assert.equal(count, 3);
        assert.equal(actual, 3);
    });
});