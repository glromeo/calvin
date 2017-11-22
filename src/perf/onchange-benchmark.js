'use strict'

const Benchmark = require('benchmark')

const suite = new Benchmark.Suite

console.log('-------------------------------------------------------')


/**
 *
 * @param property
 * @param callback
 * @returns {*}
 */
function makeObservable2(target, property) {

    let defined, currentValue = target[property];
    let descriptor = Object.getOwnPropertyDescriptor(target, property);

    const notify = function (newValue, currentValue) {
        let callback = notify.linked, last = notify;
        while (callback) {
            if (callback(newValue, currentValue)) {
                last.linked = callback.linked
            }
            last = callback;
            callback = callback.linked;
        }
    }

    let getter = descriptor && descriptor.get;
    let setter = descriptor && descriptor.set;
    if (getter && setter) {
        setter = (oldSetMethod => function newSetMethod(newValue) {
            currentValue !== newValue && notify(newValue, currentValue);
            oldSetMethod(newValue);
        })(setter);
    } else {
        getter = function () {
            return currentValue;
        };
        setter = function (newValue) {
            currentValue !== newValue && notify(newValue, currentValue);
            currentValue = newValue;
        }
    }

    Object.setPrototypeOf(setter, {

        get defined() {
            if (defined !== undefined) {
                return defined;
            }
            if (currentValue !== undefined) {
                return defined = Promise.resolve(currentValue);
            }
            return defined = new Promise(resolve => this.firstChange(resolve));
        },

        cancel: (descriptor => function () {
            Object.defineProperty(target, property, descriptor || {
                configurable: true,
                enumerable: true,
                writable: true,
                value: currentValue
            });
        })(descriptor),

        onChange(cb) {
            if (notify.last) {
                notify.last = cb;
            } else {
                notify.linked = notify.last = cb;
            }
        }
    });

    descriptor = {
        configurable: true,
        enumerable: true,
        get: getter,
        set: setter
    };

    Object.defineProperty(target, property, descriptor);

    return descriptor;
}

function makeObservable3(target, property) {

    let defined, currentValue = target[property];

    const callbacks = [];

    let descriptor = {
        configurable: true,
        enumerable: true,
        get: function () {
            return currentValue;
        },
        set(newValue) {
            if (callbacks && currentValue !== newValue) {
                for (let i = callbacks.length - 1; i >= 0; --i) {
                    callbacks[i](newValue, currentValue) && callbacks.splice(i, 1);
                }
            }
            currentValue = newValue;
        }
    };

    Object.defineProperty(target, property, descriptor);

    return target['$observable'][property] = callbacks;
}

function makeObservable4(target, property) {

    let defined, currentValue = target[property];

    let notify = function (newValue) {
        if (currentValue !== newValue) {
            let callback = notify.linked, last = notify;
            while (callback) {
                if (callback(newValue, currentValue)) {
                    last.linked = callback.linked
                }
                last = callback;
                callback = callback.linked;
            }
        }
        currentValue = newValue;
    }

    const descriptor = {
        configurable: true,
        enumerable: true,
        get: function () {
            return currentValue;
        },
        set: notify
    };

    Object.defineProperty(target, property, descriptor);

    notify.onChange = function (cb) {
        if (notify.last) {
            notify.last = cb;
        } else {
            notify.linked = notify.last = cb;
        }
    }

    return descriptor;
}

function makeObservable(target, property) {
    let descriptor = Object.getOwnPropertyDescriptor(target, property);
    if (descriptor && descriptor.get && descriptor.set) {
        return overrideDescriptor(target, property, descriptor);
    } else {
        return createDescriptor(target, property, target[property]);
    }
}

function overrideDescriptor(target, property, descriptor) {

    const original = descriptor.set;

    descriptor.set = function (update) {
        if (value !== update) {
            let callback, context = descriptor.set;
            while (callback = context.linked) {
                if (callback(update, value)) {
                    context.linked = callback.linked
                }
                context = callback;
            }
        }
        return original.call(this, update);
    }

    descriptor.set.cancel = function () {
        Object.defineProperty(target, property, descriptor);
    };

    extendDescriptor(target, property, descriptor.set);

    Object.defineProperty(target, property, descriptor);

    return descriptor;
}

function createDescriptor(target, property, value) {

    const setter = function (update) {
        if (value !== update) {
            let callback, context = setter;
            while (callback = context.linked) {
                if (callback(update, value)) {
                    context.linked = callback.linked
                }
                context = callback;
            }
        }
        value = update;
    }

    setter.cancel = function () {
        Object.defineProperty(target, property, {
            configurable: true,
            enumerable: true,
            writable: true,
            value: value
        });
    };

    extendDescriptor(target, property, setter);

    let descriptor = {
        configurable: true,
        enumerable: true,
        get: function () {
            return value;
        },
        set: setter
    };

    Object.defineProperty(target, property, descriptor);

    return descriptor;
}

function extendDescriptor(target, property, setter) {

    setter.onChange = function (callback) {
        if (this.last) {
            this.last = this.last.linked = callback;
        } else {
            this.last = this.linked = callback;
        }
    };

    setter.isDefined = function () {
        if (this.defined) {
            return defined;
        }
        let value = target[property];
        if (value) {
            return this.defined = Promise.resolve(value);
        }
        return this.defined = new Promise(resolve => this.onChange(function (value) {
            resolve(value);
            return true;
        }));
    };
}

class Scope {

    constructor() {
        this.$observable = new Map();
    }

    $observe1(property, callback) {
        let value = this[property];
        Object.defineProperty(this, property, {
            enumerable: true,
            get() {
                return value;
            },
            set(v) {
                value !== v && callback(v, value);
                value = v;
            }
        });
    }

    /**
     * current!
     *
     * @param property
     * @param callback
     */
    $onChange0(property, callback) {
        let descriptor = Object.getOwnPropertyDescriptor(this, property);
        if (descriptor && descriptor.set && descriptor.set.cancel) {
            descriptor.set.onChange(callback);
        } else {
            makeObservable(this, property).set.onChange(callback);
        }
    }

    $onChange1(property, callback) {
        let callbacks = this.$observable[property];
        if (!callbacks) {
            callbacks = this.$observable[property] = new Set();
            const dismissed = [];
            this.$observe1(property, function notify(newValue, oldValue) {
                for (const callback of callbacks) {
                    callback(newValue, oldValue) && dismissed.push(callback);
                }
                while (dismissed.length) {
                    callbacks.delete(dismissed.pop());
                }
            });
        }
        callbacks.add(callback);
    }

    $onChange2(property, callback) {
        this.$watch2(property).onChange(callback);
    }

    $watch2(property) {
        let descriptor = Object.getOwnPropertyDescriptor(this, property);
        if (descriptor && descriptor.set && descriptor.set.cancel) {
            return descriptor.set;
        } else {
            return makeObservable2(this, property).set;
        }
    }

    $onChange3(property, callback) {
        let callbacks = this.$observable[property];
        if (!callbacks) {
            callbacks = makeObservable3(this, property);
        }
        callbacks.push(callback);
    }

    $onChange4(property, callback) {
        let descriptor = Object.getOwnPropertyDescriptor(this, property);
        if (descriptor && descriptor.set && descriptor.set.cancel) {
            descriptor.set.onChange(callback);
        } else {
            makeObservable4(this, property).set.onChange(callback);
        }
    }
}

function buildBenchmark(targetMethod) {

    return function () {

        try {
            let scope = new Scope();

            scope.sideEffect = 0;

            for (let i = 0; i < 100; i++) {
                let propertyName = 'x' + Math.round(i/10), cb;

                scope[propertyName] = i;

                scope[targetMethod](propertyName, cb = function (newValue, oldValue) {
                    scope.sideEffect++;
                    return i % 3 === 0;
                });
            }

            for (let j = 0; j < 10; j++) {
                for (let i = 0; i < 10; i++) {

                    let propertyName = 'x' + i;

                    scope[propertyName] += i;
                }
            }

        } catch (e) {
            console.error(e);
        }
    }
}

suite
    .add('Scope.$onChange0:', buildBenchmark('$onChange0'))
    .add('Scope.$onChange1:', buildBenchmark('$onChange1'))
    .add('Scope.$onChange2:', buildBenchmark('$onChange2'))
    .add('Scope.$onChange3:', buildBenchmark('$onChange3'))
    .add('Scope.$onChange4:', buildBenchmark('$onChange4'))
    .add('Scope.$onChange0:', buildBenchmark('$onChange0'))
    .on('cycle', function (event) {
        console.log(String(event.target))
    })
    .on('complete', function () {
        const faster = this.filter('fastest')[0]
        const slower = this.filter('slowest')[0]
        console.log('--------------------------------------------------')
        console.log(`${faster.name} by ${Math.round(faster.hz / slower.hz)}x`)
    })
    .run({'async': false})