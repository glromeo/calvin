'use strict'

const Benchmark = require('benchmark')

new Benchmark.Suite()
    .add('?:', function () {
        let a = 0;
        for (let i = 0; i < 100000; i++) (()=>{
            a += !!(i % 100) ? i : 0;
        })();
    })
    .add('||', function () {
        let a = 0;
        for (let i = 0; i < 100000; i++) (()=>{
            a += !!(i % 100) && i || 0;
        })();
    })
    .add('if', function () {
        let a = 0;
        for (let i = 0; i < 100000; i++) (()=>{
            if (!!(i % 100)) {
                a += i;
            }
        })();
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
