'use strict'

const Benchmark = require('benchmark')

const suite = new Benchmark.Suite();

suite
    .add('p = p.then(() => new Promise()):', {
        defer: true, fn: function (deferred) {
            let promise = Promise.resolve();
            let push = function (p) {
                promise = promise.then(() => p);
            }
            for (let i = 0; i < 10; i++) {
                push(Promise.resolve(i));
            }
            promise.then(() => deferred.resolve());
        }
    })
    .add('Promise.all:', {
        defer: true, fn: function (deferred) {
            let promises = [];
            let push = function (p) {
                promises.push(p);
            }
            for (let i = 0; i < 10; i++) {
                push(Promise.resolve(i));
            }
            Promise.all(promises).then(() => deferred.resolve());
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