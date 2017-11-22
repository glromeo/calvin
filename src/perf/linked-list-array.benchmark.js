'use strict'

const Benchmark = require('benchmark')

new Benchmark.Suite()
    .add('array:', function () {
        let a = [];
        for (let i = 0; i < 1000000; i++) {
            a[i] = {v: i};
        }
    })
    .add('array:', function () {
        let a = [];
        for (let i = 0; i < 1000000; i++) {
            a.push({v: i});
        }
    })
    .add('list:', function () {
        let h, t, c = 0;
        for (let i = 0; i < 1000000; i++) {
            t = {v: i}
            t.t = h
            h = t;
            ++c;
        }
        let a = new Array(c), i = 0;
        do {
            a[i++] = h;
        } while (h = h.t);
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
