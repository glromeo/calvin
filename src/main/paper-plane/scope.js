import {Compiler} from "grassroots/lib/compiler.js";
import {defineObservableProperty} from "./observable";
import {AsyncFunction} from "./utility";

const debug = true;

const compiler = new Compiler();

try {
    if (typeof window !== "undefined") window.$scope = function (selector) {
        const element = document.querySelector(selector);
        return findProperty(element, "$scope");
    }
} catch (error) {
    console.log(error);
}

let nextUniqueScopeId = 0;

function init(scope, parent) {

    let $parent = parent;

    Object.defineProperties(scope, {
        '$id': {value: ++nextUniqueScopeId},
        '$parent': {
            get() {
                return $parent;
            },
            set(parent) {
                $parent && remove(scope, $parent);
                parent && append(scope, parent);
                $parent = parent;
            }
        },
        '$$firstChild': {writable: true},
        '$$lastChild': {writable: true},
        '$$prevSibling': {writable: true},
        '$$nextSibling': {writable: true}
    });

    parent && append(scope, parent);
}

function assign(target, source) {
    if (source) {
        const properties = {};
        for (const [key, value] of Object.entries(source)) properties[key] = {
            configurable: true,
            writable: true,
            enumerable: true,
            value: value
        };
        Object.defineProperties(target, properties);
    }
    return target;
}

/**
 * Append a scope node (child) to another node (parent)
 *
 * @param child
 * @param parent
 */
function append(child, parent) {

    if (parent.$$firstChild) {
        parent.$$lastChild.$$nextSibling = child;
        child.$$prevSibling = parent.$$lastChild;
    } else {
        parent.$$firstChild = child;
    }

    parent.$$lastChild = child;
}

/**
 * Removes a child scope from its parent
 *
 * @param child
 * @param parent
 * @returns true if the node was actually removed, false if couldn't be found
 */
function remove(child, parent) {

    for (let next = parent.$$firstChild; next; next = next.$$nextSibling) if (next === child) {
        if (child.$$prevSibling) {
            child.$$prevSibling.$$nextSibling = child.$$nextSibling;
            child.$$prevSibling = undefined;
        } else {
            parent.$$firstChild = child.$$nextSibling;
        }
        if (child.$$nextSibling) {
            child.$$nextSibling.$$prevSibling = child.$$prevSibling;
            child.$$nextSibling = undefined;
        } else {
            parent.$$lastChild = child.$$prevSibling;
        }
        return true;
    }
    return false;
}

export class Scope {

    constructor(parent, properties) {
        if (parent instanceof Scope) {
            init(this, parent);
            assign(this, properties);
        } else {
            init(this, Scope.$root);
            assign(this, parent);
        }
    }

    get $root() {
        return Scope.$root;
    }

    $new(properties) {
        let child = assign(Object.create(this), properties);
        init(child, this);
        return child;
    }

    $findOwner(property) {
        let owner = this;
        do if (owner.hasOwnProperty(property)) {
            debug && console.debug("found:", property, "on:", owner);
            return owner;
        } while (owner = owner.$parent);
    }

    $getPropertyDescriptor(property) {
        let owner = this.$findOwner(property)
        if (owner) {
            return {owner: owner, descriptor: Object.getOwnPropertyDescriptor(owner, property)};
        }
        throw new Error("property: " + property + " is undefined.");
    }

    /**
     * TODO: implement cancel() on the promise
     *
     * @param fn
     * @param watcher
     * @returns {*}
     */
    $eval(fn, watcher, handler) {

        if (typeof fn !== 'function') {
            fn = new Compiler(fn);
        }

        debug && console.debug("$eval:", fn.source);

        const parameters = fn.parameters;
        if (watcher) {
            const promise = new Promise((resolve, reject) => {
                try {
                    let barrier = 0, g = parameters.length;
                    const args = new Array(g);
                    while (--g >= 0) {
                        const property = parameters[g];
                        if (this[property] !== undefined) {
                            args[g] = this[property];
                            continue;
                        }
                        const i = g;
                        ++barrier;
                        this.$watch(property).changed(function (v) {
                            args[i] = v;
                            if (--barrier === 0) {
                                resolve(v = fn.apply(this, args));
                                if (v = watcher(v)) {
                                    return v;
                                }
                            }
                            return v => (args[i] = v) && watcher(fn.apply(this, args));
                        });
                        debug && console.debug('waiting:', property);
                    }
                    if (!barrier) {
                        const value = fn.apply(this, args);
                        watcher(value);
                        resolve(value);
                    }
                } catch (e) {
                    reject(e);
                }
            });
            handler && promise.catch(handler);
            return promise;
        } else {
            return fn.apply(this, parameters.map(p => this[p]));
        }
    }

    async $evalAsync(expression) {
        let {parameters} = compiler.compile(expression);
        let fn = new AsyncFunction(...parameters, "\nreturn " + expression);
        const args = await Promise.all(parameters.map(p => this.$when(p)));
        return fn.apply(this, args);
    }

    $watch(property) {
        const {owner, descriptor} = this.$getPropertyDescriptor(property);
        if (descriptor.set && descriptor.set.cancel) {
            return descriptor.set;
        } else {
            return defineObservableProperty(owner, property).set;
        }
    }

    $unwatch(property) {
        const {owner, descriptor} = this.$getPropertyDescriptor(property);
        if (!descriptor) {
            throw new Error("no property descriptor found for: " + property);
        }
        descriptor.set.cancel();
    }

    $when(property) {
        return this.$watch(property).isDefined;
    }
}