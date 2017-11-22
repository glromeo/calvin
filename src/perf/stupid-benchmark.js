'use strict'

const Benchmark = require('benchmark')

const suite = new Benchmark.Suite()

let a = [];

a.push(undefined);
a.push(null);
a.push(1);
a.push({});
a.push(function () {
})
a.push(class {
})
for (let i = 0; i < 4; i++) {
    let j = 10 * i;
    let o = {};
    while (j-- > 0) {
        o = Object.create(o);
    }
    a.push(o);
}

let set = new Set();
for (let i = 0; i < 50; i++) {
    let j = i % 10;
    j > 2 && set.add(Object.create(a[j])) || set.add(a[j]);
}

let w = [];
for (let i = 0; i < 10; i++) {
    w.push(i);
}

class Q1 {
    constructor() {
        this.c = 0;
    }

    go() {
        w.forEach(w => this.c += w);
    }
}

class Q2 {
    constructor() {
        this.c = 0;
    }

    sum(w) {
        this.c += w;
    }

    go() {
        w.forEach(this.sum.bind(this));
    }
}

console.log('-------------------------------------------------------')

const FUNCTION_TYPE = typeof function () {
};

suite
    .add('diamond:', function () {
        (new Q1()).go();
    })
    .add('bind:', function () {
        (new Q2()).go();
    })
    .add('hasOwnProperty:', function () {
        let c = 0;
        for (let i of set) {
            if (i && typeof i === 'object') {
                try {
                    c += !(i.hasOwnProperty('x'));
                } catch (e) {
                    console.error(e);
                }
            }
        }
    })
    .add('o["x"] !== undefined:', function () {
        let c = 0;
        for (let i of set) {
            if (i && typeof i === 'object') {
                try {
                    c += i['x'] !== undefined;
                } catch (e) {
                    console.error(e);
                }
            }
        }
    })
    .add('typeof === "undefined":', function () {
        let c = 0;
        for (let i of set) {
            if (typeof i === 'undefined') {
                ++c;
            }
            if (typeof i !== 'undefined') {
                --c;
            }
        }
    })
    .add('i === undefined:', function () {
        let c = 0;
        for (let i of set) {
            if (i === undefined) {
                ++c;
            }
            if (i !== undefined) {
                --c;
            }
        }
    })
    .add('f instanceof Function:', function () {
        let c = 0;
        for (let i of set) {
            if (i instanceof Function) {
                ++c;
            }
            if (!(i instanceof Function)) {
                --c;
            }
        }
    })
    .add('typeof f === \'function\':', function () {
        let c = 0;
        for (let i of set) {
            if (typeof i === 'function') {
                ++c;
            }
            if (typeof i !== 'function') {
                --c;
            }
        }
    })
    .add('typeof f === FUNCTION_TYPE:', function () {
        let c = 0;
        for (let i of set) {
            if (typeof i === FUNCTION_TYPE) {
                ++c;
            }
            if (typeof i !== FUNCTION_TYPE) {
                --c;
            }
        }
    })
    .add('o instanceof Object:', function () {
        let c = 0;
        for (let i of set) {
            if (i instanceof Object) {
                ++c;
            }
            if (!(i instanceof Object)) {
                --c;
            }
        }
    })
    .add('typeof o === \'object\':', function () {
        let c = 0;
        for (let i of set) {
            if (i && typeof i === 'object') {
                ++c;
            }
            if (i && typeof i !== 'object') {
                --c;
            }
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