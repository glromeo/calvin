'use strict'

class Sample {
    constructor(i_0, i_1, i_2, i_3, i_4, i_5, i_6, i_7, i_8, i_9) {
        this['i_0'] = i_1;
        this['i_1'] = i_2;
        this['i_2'] = i_3;
        this['i_3'] = i_4;
        this['i_4'] = i_5;
        this['i_5'] = i_6;
        this['i_6'] = i_7;
        this['i_7'] = i_8;
        this['i_8'] = i_9;
        this['i_9'] = i_0;
    }

    m_0(v) { this.i_0 = v }
    m_1(v) { this.i_1 = v }
    m_2(v) { this.i_2 = v }
    m_3(v) { this.i_3 = v }
    m_4(v) { this.i_4 = v }
    m_5(v) { this.i_5 = v }
    m_6(v) { this.i_6 = v }
    m_7(v) { this.i_7 = v }
    m_8(v) { this.i_8 = v }
    m_9(v) { this.i_9 = v }
}

new require('benchmark').Suite()

    .add('plain class', function () {
        for (var i = 0; i < 100; i++) {
            var obj = new Sample(i + 0, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9);
            for (var j = 0; j < 100; j++) {
                obj['i_0'] = obj['i_1'];
                obj.m_0(obj['i_1']);
                obj['i_1'] = obj['i_2'];
                obj.m_1(obj['i_2']);
                obj['i_2'] = obj['i_3'];
                obj.m_2(obj['i_3']);
                obj['i_3'] = obj['i_4'];
                obj.m_3(obj['i_4']);
                obj['i_4'] = obj['i_5'];
                obj.m_4(obj['i_5']);
                obj['i_5'] = obj['i_6'];
                obj.m_5(obj['i_6']);
                obj['i_6'] = obj['i_7'];
                obj.m_6(obj['i_7']);
                obj['i_7'] = obj['i_8'];
                obj.m_7(obj['i_8']);
                obj['i_8'] = obj['i_9'];
                obj.m_8(obj['i_9']);
                obj['i_9'] = obj['i_0'];
                obj.m_9(obj['i_0']);
            }
        }
    })

    .add('object', function () {
        for (var i = 0; i < 100; i++) {
            var obj = {
                'i + 0': i + 0,
                'i + 1': i + 1,
                'i + 2': i + 2,
                'i + 3': i + 3,
                'i + 4': i + 4,
                'i + 5': i + 5,
                'i + 6': i + 6,
                'i + 7': i + 7,
                'i + 8': i + 8,
                'i + 9': i + 9,
                m_0(v) { this.i_0 = v },
                m_1(v) { this.i_1 = v },
                m_2(v) { this.i_2 = v },
                m_3(v) { this.i_3 = v },
                m_4(v) { this.i_4 = v },
                m_5(v) { this.i_5 = v },
                m_6(v) { this.i_6 = v },
                m_7(v) { this.i_7 = v },
                m_8(v) { this.i_8 = v },
                m_9(v) { this.i_9 = v }
            };
            for (var j = 0; j < 100; j++) {
                obj['i_0'] = obj['i_1'];
                obj.m_0(obj['i_1']);
                obj['i_1'] = obj['i_2'];
                obj.m_1(obj['i_2']);
                obj['i_2'] = obj['i_3'];
                obj.m_2(obj['i_3']);
                obj['i_3'] = obj['i_4'];
                obj.m_3(obj['i_4']);
                obj['i_4'] = obj['i_5'];
                obj.m_4(obj['i_5']);
                obj['i_5'] = obj['i_6'];
                obj.m_5(obj['i_6']);
                obj['i_6'] = obj['i_7'];
                obj.m_6(obj['i_7']);
                obj['i_7'] = obj['i_8'];
                obj.m_7(obj['i_8']);
                obj['i_8'] = obj['i_9'];
                obj.m_8(obj['i_9']);
                obj['i_9'] = obj['i_0'];
                obj.m_9(obj['i_0']);
            }
        }
    })

    .add('object (proto)', function () {
        for (var i = 0; i < 100; i++) {
            var obj = {
                'i + 0': i + 0,
                'i + 1': i + 1,
                'i + 2': i + 2,
                'i + 3': i + 3,
                'i + 4': i + 4,
                'i + 5': i + 5,
                'i + 6': i + 6,
                'i + 7': i + 7,
                'i + 8': i + 8,
                'i + 9': i + 9
            };
            Object.setPrototypeOf(obj, Sample.prototype);
            for (var j = 0; j < 100; j++) {
                obj['i_0'] = obj['i_1'];
                obj.m_0(obj['i_1']);
                obj['i_1'] = obj['i_2'];
                obj.m_1(obj['i_2']);
                obj['i_2'] = obj['i_3'];
                obj.m_2(obj['i_3']);
                obj['i_3'] = obj['i_4'];
                obj.m_3(obj['i_4']);
                obj['i_4'] = obj['i_5'];
                obj.m_4(obj['i_5']);
                obj['i_5'] = obj['i_6'];
                obj.m_5(obj['i_6']);
                obj['i_6'] = obj['i_7'];
                obj.m_6(obj['i_7']);
                obj['i_7'] = obj['i_8'];
                obj.m_7(obj['i_8']);
                obj['i_8'] = obj['i_9'];
                obj.m_8(obj['i_9']);
                obj['i_9'] = obj['i_0'];
                obj.m_9(obj['i_0']);
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