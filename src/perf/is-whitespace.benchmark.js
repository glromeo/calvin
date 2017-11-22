'use strict'

const Benchmark = require('benchmark');

const CC_SPACE = ' '.charCodeAt(0);
const CC_SP_2 = '\r'.charCodeAt(0);
const CC_SP_3 = '\t'.charCodeAt(0);
const CC_SP_4 = '\n'.charCodeAt(0);
const CC_SP_5 = '\v'.charCodeAt(0);
const CC_SP_6 = 0x00A0;

const WHITESPACES = [CC_SPACE, CC_SP_2, CC_SP_3, CC_SP_4, CC_SP_5, CC_SP_6];

function isWhitespace(ch) {
    return ch === ' ' || ch === '\r' || ch === '\t' || ch === '\n' || ch === '\v' || ch === '\u00A0';
}

function isWhitespace2(cc) {
    return cc === CC_SPACE || cc === CC_SP_2 || cc === CC_SP_3 || cc === CC_SP_4 || cc === CC_SP_5 || cc === CC_SP_6;
}

function isWhitespace3(cc) {
    return WHITESPACES.indexOf(cc) >= 0;
}

function isWhitespace4(cc) {
    return cc <= 0x20 || 0x7F <= cc && cc <= 0xA0;
}

let testString = '', base = "abc xyz ABC                      JKL 0123";
for (let i = 0; i < 10000; i++) {
    testString += base;
}

let dump;

new Benchmark.Suite()
    // .add('isWhitespace', function () {
    //     let i = 0, state;
    //     for (let i = 0; i < testString.length; i++) try {
    //         state = isWhitespace(testString.charAt(i));
    //     } catch (e) {
    //         state = false;
    //     }
    //     dump = !state;
    // })
    .add('isWhitespace2', function () {
        let i = 0, state;
        for (let i = 0; i < testString.length; i++) try {
            state = isWhitespace2(testString.charCodeAt(i));
        } catch (e) {
            state = false;
        }
        dump = !state;
    })
    // .add('isWhitespace3', function () {
    //     let i = 0, state;
    //     for (let i = 0; i < testString.length; i++) try {
    //         state = isWhitespace3(testString.charCodeAt(i));
    //     } catch (e) {
    //         state = false;
    //     }
    //     dump = !state;
    // })
    .add('isWhitespace4', function () {
        let i = 0, state;
        for (let i = 0; i < testString.length; i++) try {
            state = isWhitespace4(testString.charCodeAt(i));
        } catch (e) {
            state = false;
        }
        dump = !state;
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
