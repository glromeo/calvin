'use strict'

const Benchmark = require('benchmark')

const suite = new Benchmark.Suite

const indirectSetter = new (class {
    constructor() {
        let x;
        const getter = function () {
            return x;
        }
        const setter = function (v) {
            x = v;
        }

        Object.defineProperty(this, 'x', {
            get() {
                return getter();
            },
            set(v) {
                setter(v);
            }

        });
    }
})();

const indirectSetterWithLambda = new (class {
    constructor() {
        let x;
        const getter = () => x;
        const setter = v => x = v;

        Object.defineProperty(this, 'x', {
            get() {
                return getter();
            },
            set(v) {
                setter(v);
            }

        });
    }
})();

let accessors_value = 100;

const redefineEveryTime = {x: 100}, plainOldAccess = {x: 100},
    accessors = {
        _x: 100,
        set x(v) {
            accessors_value = v;
        },
        get x() {
            return accessors_value;
        }
    },
    gettersAndSetters = {
        _x: 100,
        setX(v) {
            this._x = v;
        },
        getX() {
            return this._x;
        }
    };

const propertyDescriptorWithValue = new (class {
    constructor() {
        Object.defineProperty(this, 'x', {writable: true, value: 100});
    }
})();

const configurablePropertyDescriptorWithValue = new (class {
    constructor() {
        Object.defineProperty(this, 'x', {configurable: true, writable: true, value: 100});
    }
})();

/**
 * This is the winner!!!!
 *
 * @type {{}}
 */
const propertyDescriptorWithFixedGetSet = new (class {
    constructor() {
        let x = 100;
        const getter = function () {
            return x;
        }
        const setter = function (v) {
            x = v;
        }
        Object.defineProperty(this, 'x', {
            get: getter,
            set: setter
        });
    }
})();

const proxied = new Proxy(plainOldAccess, {
    get(target, name) {
        return target[name]
    },
    set(target, name, value) {
        target[name] = value
        return true;
    }
})

console.log('-------------------------------------------------------')

suite
    .add('redefineEveryTime\t', function () {
        for (let i = 0; i < 100; i++) {
            Object.defineProperty(redefineEveryTime, 'x', {value: redefineEveryTime.x += 1});
        }
    })
    .add('indirectSetter\t', function () {
        for (let i = 0; i < 100; i++) {
            indirectSetter.x += 1;
        }
    })
    .add('indirectSetterWithLambda\t', function () {
        for (let i = 0; i < 100; i++) {
            indirectSetterWithLambda.x += 1;
        }
    })
    .add('proxied\t', function () {
        for (let i = 0; i < 100; i++) {
            proxied.x += 1;
        }
    })
    .add('plainOldAccess\t', function () {
        for (let i = 0; i < 100; i++) {
            plainOldAccess.x += 1;
        }
    })
    .add('accessors\t', function () {
        for (let i = 0; i < 100; i++) {
            accessors.x += 1;
        }
    })
    .add('gettersAndSetters\t', function () {
        for (let i = 0; i < 100; i++) {
            gettersAndSetters.setX(gettersAndSetters.getX() + 1);
        }
    })
    .add('propertyDescriptorWithValue\t', function () {
        for (let i = 0; i < 100; i++) {
            propertyDescriptorWithValue.x += 1;
        }
    })
    .add('configurablePropertyDescriptorWithValue\t', function () {
        for (let i = 0; i < 100; i++) {
            configurablePropertyDescriptorWithValue.x += 1;
        }
    })
    .add('propertyDescriptorWithFixedGetSet\t', function () {
        for (let i = 0; i < 100; i++) {
            propertyDescriptorWithFixedGetSet.x += 1;
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