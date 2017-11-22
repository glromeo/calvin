const debug = true;

/**
 *
 * @param target
 * @param property
 */
export function defineObservableProperty(target, property) {
    let descriptor = Object.getOwnPropertyDescriptor(target, property);
    if (descriptor && descriptor.get && descriptor.set) {
        return overrideDescriptor(target, property, descriptor);
    } else {
        return createDescriptor(target, property, target[property]);
    }
}

/**
 *
 * @param target
 * @param property
 * @param descriptor
 * @returns {*}
 */
function overrideDescriptor(target, property, descriptor) {

    const original = descriptor.set;

    descriptor.set = function (update) {
        debug && console.log(JSON.stringify(target), "[" + property + "] = ", update);
        if (value !== update) {
            invokeCallbacks(descriptor.set, update, value);
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

/**
 *
 * @param target
 * @param property
 * @param value
 * @returns {{configurable: boolean, enumerable: boolean, get: get, set: setter}}
 */
function createDescriptor(target, property, value) {

    const setter = function (update) {
        debug && console.log(JSON.stringify(target), "[" + property + "] = ", update);
        if (value !== update) {
            invokeCallbacks(setter, update, value);
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

/**
 * Any non falsy value returned by the callback either replaces it with the return if it's a function
 * or removes it from the chain.
 *
 * @param context
 * @param update
 * @param value
 */
function invokeCallbacks(context, update, value) {
    const callbacks = context.callbacks;
    if (callbacks) {
        const length = callbacks.length;
        for (let c = 0; c < length; c++) {
            const response = callbacks[c](update, value);
            if (response !== undefined) {
                if (typeof response === 'function') {
                    callbacks[c] = response;
                } else {
                    callbacks.splice(c, 1);
                }
            }
        }
    }
}

/**
 *
 * @param target
 * @param property
 * @param setter
 */
function extendDescriptor(target, property, setter) {

    setter.changed = function (callback) {
        if (!this.callbacks) {
            this.callbacks = [];
        }
        this.callbacks.push(callback);
        return this;
    };

    setter.remove = function (callback) {
        const callbacks = this.callbacks;
        if (callbacks) {
            let i = callbacks.length
            while (i--) if (callbacks[i] === item) {
                callbacks.splice(i, 1);
            }
        }
        return this;
    };

    let defined;

    Object.defineProperty(setter, 'isDefined', {
        get() {
            if (defined) {
                return defined;
            } else return new Promise(resolve => {
                let value = target[property];
                if (value !== undefined) {
                    resolve(value);
                } else this.changed(value => {
                    resolve(value);
                    debug && console.log(JSON.stringify(target), "resolve:", property, "with:", value);
                    return true;
                });
            });
        }
    });
}