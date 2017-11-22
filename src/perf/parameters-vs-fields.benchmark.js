'use strict'

const Benchmark = require('benchmark')

let o = {
    f0: 0,
    f1: 0,
    f2: 0,
    f3: 0,
    f4: 0,
    f5: 0,
    f6: 0,
    f7: 0,
    f8: 0,
    f9: 0,
    f10: 0,
    f11: 0,
    f12: 0,
    f13: 0,
    f14: 0,
    f15: 0,
    f16: 0,
    f17: 0,
    w(v0,
      v1,
      v2,
      v3,
      v4,
      v5,
      v6,
      v7,
      v8,
      v9,
      v10,
      v11,
      v12,
      v13,
      v14,
      v15,
      v16,
      v17) {
        let r = 0;
        r += v0;
        r += v1;
        r += v2;
        r += v3;
        r += v4;
        r += v5;
        r += v6;
        r += v7;
        r += v8;
        r += v9;
        r +=  v0;
        r +=  v1;
        r +=  v2;
        r +=  v3;
        r +=  v4;
        r +=  v5;
        r +=  v6;
        r +=  v7;
        this.f = r;
    },
    m(v0,
      v1,
      v2,
      v3,
      v4,
      v5,
      v6,
      v7,
      v8,
      v9,
      v10,
      v11,
      v12,
      v13,
      v14,
      v15,
      v16,
      v17) {
        this.f0 = v0;
        this.f1 = v1;
        this.f2 = v2;
        this.f3 = v3;
        this.f4 = v4;
        this.f5 = v5;
        this.f6 = v6;
        this.f7 = v7;
        this.f8 = v8;
        this.f9 = v9;
        this.f10 = v0;
        this.f11 = v1;
        this.f12 = v2;
        this.f13 = v3;
        this.f14 = v4;
        this.f15 = v5;
        this.f16 = v6;
        this.f17 = v7;
        this.f++;
    },
    x() {
        this.f++;
    },
    y() {
        this.f0 = arguments[0];
        this.f1 = arguments[1];
        this.f2 = arguments[2];
        this.f3 = arguments[3];
        this.f4 = arguments[4];
        this.f5 = arguments[5];
        this.f6 = arguments[6];
        this.f7 = arguments[7];
        this.f8 = arguments[8];
        this.f9 = arguments[9];
        this.f10 = arguments[0];
        this.f11 = arguments[1];
        this.f12 = arguments[2];
        this.f13 = arguments[3];
        this.f14 = arguments[4];
        this.f15 = arguments[5];
        this.f16 = arguments[6];
        this.f17 = arguments[7];
        this.f++;
    }
};

new Benchmark.Suite()

    .add('field', function () {
        for (let i = 0; i < 1000; i++) try {
            o.f0 = i;
            o.f1 = i;
            o.f2 = i;
            o.f3 = i;
            o.f4 = i;
            o.f5 = i;
            o.f6 = i;
            o.f7 = i;
            o.f8 = i;
            o.f9 = i;
            o.f10 = i;
            o.f11 = i;
            o.f12 = i;
            o.f13 = i;
            o.f14 = i;
            o.f15 = i;
            o.f16 = i;
            o.f17 = i;
            o.f++;
        } catch (e) {
            throw "error";
        }
    })

    .add('method m', function () {
        for (let i = 0; i < 1000; i++) try {
            o.m(
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i
            );
        } catch (e) {
            throw "error";
        }
    })

    .add('method w', function () {
        for (let i = 0; i < 1000; i++) try {
            o.w(
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i
            );
        } catch (e) {
            throw "error";
        }
    })

    .add('method x', function () {
        for (let i = 0; i < 1000; i++) try {
            o.f0 = i;
            o.f1 = i;
            o.f2 = i;
            o.f3 = i;
            o.f4 = i;
            o.f5 = i;
            o.f6 = i;
            o.f7 = i;
            o.f8 = i;
            o.f9 = i;
            o.f10 = i;
            o.f11 = i;
            o.f12 = i;
            o.f13 = i;
            o.f14 = i;
            o.f15 = i;
            o.f16 = i;
            o.f17 = i;
            o.x();
        } catch (e) {
            throw "error";
        }
    })

    .add('method y', function () {
        for (let i = 0; i < 1000; i++) try {
            o.y(
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i,
                i
            );
        } catch (e) {
            throw "error";
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
