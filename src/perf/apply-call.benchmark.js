'use strict'

const Benchmark = require('benchmark')

function targetFunction(a, b, c) {
    return a + b + c;
}

function withApply() {
    return targetFunction.apply(this, arguments);
}

function withApplyStructured(a, b, c) {
    return targetFunction.apply(this, [a, b, c]);
}

function withApplyDestructured(...args) {
    return targetFunction.apply(this, args);
}

function withCall(a, b, c) {
    return targetFunction.call(this, a, b, c);
}

function withCallSpread() {
    return targetFunction.call(this, ...arguments);
}

new Benchmark.Suite()
    .add('apply', function () {
        let a = 0;
        for (let i = 0; i < 1000; i++) {
            a = withApply(i, -i, i);
        }
    })
    .add('call', function () {
        let a = 0;
        for (let i = 0; i < 1000; i++) {
            a = withCall(i, -i, i);
        }
    })
    .add('apply []', function () {
        let a = 0;
        for (let i = 0; i < 1000; i++) {
            a = withApplyStructured(i, -i, i);
        }
    })
    .add('apply ...', function () {
        let a = 0;
        for (let i = 0; i < 1000; i++) {
            a = withApplyDestructured(i, -i, i);
        }
    })
    .add('call ...', function () {
        let a = 0;
        for (let i = 0; i < 1000; i++) {
            a = withCallSpread(i, -i, i);
        }
    })
    .on('cycle', function (event) {
        console.log(String(event.target))
    })
    .on('complete', function () {
        const faster = this.filter('fastest')[0]
        const slower = this.filter('slowest')[0]
        console.log('--------------------------------------------------')
        console.log(`${faster.name} by ${Math.round(100 * faster.hz / slower.hz) - 100}%`)
    })
    .run({'async': true})
