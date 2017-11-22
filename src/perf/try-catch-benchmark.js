'use strict'

const Benchmark = require('benchmark')

const suite = new Benchmark.Suite

console.log('-------------------------------------------------------')

const FUNCTION_TYPE = typeof function () {
};

const ITERATIONS = 1000;

let set = [];
for (let i = 0; i < ITERATIONS; i++) {
    set[i] = function (array, index, value) {
        array[index] = value;
    };
}

let set2 = [];
for (let i = 0; i < ITERATIONS; i++) {
    set2[i] = function (array, index, value) {
        try {
            array[index] = value;
        } catch (e) {
            console.log(e);
        }
    };
}

suite
    .add('nothing:', function () {
        let a = new Array(ITERATIONS);
        for (let i = 0; i < ITERATIONS; i++) {
            a[i] = i;
        }
    })
    .add('try catch:', function () {
        let a = new Array(ITERATIONS);
        for (let i = 0; i < ITERATIONS; i++) try {
            a[i] = i;
        } catch (e) {
            console.log(e);
        }
    })
    .add('try catch around set:', function () {
        let a = new Array(ITERATIONS);
        for (let i = 0; i < ITERATIONS; i++) try {
            set[i].call({}, a, i, i);
        } catch (e) {
            console.log(e);
        }
    })
    .add('nothing but set:', function () {
        let a = new Array(ITERATIONS);
        for (let i = 0; i < ITERATIONS; i++) {
            set[i].call({}, a, i, i);
        }
    })
    .add('nothing, set has try catch:', function () {
        let a = new Array(ITERATIONS);
        for (let i = 0; i < ITERATIONS; i++) {
            set[i].call({}, a, i, i);
        }
    })
    .on('cycle', function (event) {
        console.log(String(event.target))
    })
    .on('complete', function () {
        const faster = this.filter('fastest')[0]
        const slower = this.filter('slowest')[0]
        console.log('--------------------------------------------------')
        console.log(`${faster.name} by ${Math.round(faster.hz / slower.hz)}x`)
    })
    .run({'async': true})