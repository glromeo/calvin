import {defineObservableProperty} from "../observable.js";

const debug = true;


/**
 *
 * @param property
 * @returns {Element}
 */
Node.prototype.findPropertyOwner = function findPropertyOwner(property) {
    let owner = this;
    do if (owner.hasOwnProperty(property)) {
        if (debug) console.debug("found:", property, "on:", owner);
        return owner;
    } while (owner = owner.parentNode);
}

/**
 *
 * @param property
 * @returns {{owner: Element, descriptor: *}}
 */
Node.prototype.findPropertyDescriptor = function findPropertyDescriptor(property) {
    let owner = this, descriptor;
    do if (descriptor = Object.getOwnPropertyDescriptor(owner, property)) {
        if (debug) console.debug("found:", property, "on:", owner);
        return {owner, descriptor};
    } while (owner = owner.parentNode);
    return {owner: this, descriptor: defineObservableProperty(this, property)};
}

/**
 *
 * @param expression
 * @param watcher
 * @param handler
 * @param base
 * @returns {*}
 */
Node.prototype.eval = function (expression, watcher, handler) {

    if (typeof expression !== "function") {
        expression = compileExpression(expression);
    }

    if (debug) console.debug("eval:", expression.source);

    const parameters = expression.parameters;
    const properties = this;
    if (watcher) {
        const promise = new Promise((resolve, reject) => {
            try {
                let barrier = 0, p = parameters.length;
                const args = new Array(p);
                while (--p >= 0) {
                    const parameter = parameters[p];
                    const owner = this.findPropertyOwner(parameter);
                    const index = p;
                    const onChange = v => {
                        args[index] = v;
                        return watcher.call(this, expression.apply(this, args));
                    };
                    if ((args[index] = owner[parameter]) !== undefined) {
                        owner.watch(parameter).changed(onChange);
                    } else {
                        ++barrier;
                        owner.watch(parameter).changed(v => {
                            args[index] = v;
                            const value = expression.apply(this, args);
                            const nextOnChange = watcher.call(this, value);
                            if (--barrier === 0) {
                                resolve(value);
                            }
                            return nextOnChange !== undefined ? nextOnChange : onChange;
                        });
                        debug && console.debug('waiting:', parameter);
                    }
                }
                if (barrier === 0) {
                    const value = expression.apply(this, args);
                    watcher.call(this, value);
                    resolve(value);
                }
            } catch (e) {
                reject(e);
            }
        });
        if (handler) {
            return promise.catch(handler);
        } else {
            return promise;
        }
    } else {
        return expression.apply(base, parameters.map(p => properties[p]));
    }
}

/**
 * TODO: to be reviewed
 */
Node.prototype.evalAsync = async function (expression) {
    let {globals} = parseAsyncExpression(expression);
    let fn = new AsyncFunction(...globals, "\nreturn " + expression);
    const args = await Promise.all(globals.map(p => this.$when(p)));
    return fn.apply(this, args);
}

/**
 *
 * @param property
 * @returns {descriptor.set}
 */
Node.prototype.watch = function (property) {
    const descriptor = Object.getOwnPropertyDescriptor(this, property);
    if (descriptor.set && descriptor.set.cancel) {
        return descriptor.set;
    } else {
        return defineObservableProperty(this, property).set;
    }
}

/**
 *
 * @param property
 */
Node.prototype.unwatch = function (property) {
    const descriptor = Object.getOwnPropertyDescriptor(this, property);
    if (!descriptor) {
        throw new Error("no property descriptor found for: " + property);
    }
    descriptor.set.cancel();
}

/**
 *
 * @param property
 */
Node.prototype.when = function (property) {
    return this.watch(property).isDefined();
}

/**
 *
 */
Object.defineProperty(Node.prototype, 'isLinked', {
    get() {
        const isLinked = new Promise(resolve => {
            Object.defineProperty(this, 'isLinked', {enumerable: true, get: () => isLinked, set: resolve});
        });
        return isLinked;
    },
    set(linked) {
        Object.defineProperty(this, 'isLinked', {enumerable: true, writable: true, value: linked});
    }
});