'use strict';

const debug = true;

export const AsyncFunction = Object.getPrototypeOf(async function () {
}).constructor;

export class Deferred {

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        })
    }

    await(promise) {
        this.promise = this.promise.then(() => promise);
        return this;
    }

    then() {
        this.promise = this.promise.then(...arguments);
        return this;
    }

    catch() {
        this.promise = this.promise.catch(...arguments);
        return this;
    }

    get options() {
        return [this.resolve, this.reject];
    }
}

export const noop = function () {
};

let uid = 0;

/**
 * Function used to generate unique identifiers
 *
 * @returns {number}
 */
export function nextUID() {
    return ++uid;
}

export function nodePath(element) {
    if (element) {
        const parent = element.parentNode;
        if (parent && parent !== document.body) {
            let index = 0, sibling = element;
            while (sibling = sibling.previousElementSibling) index++;
            return nodePath(parent) + "/" + element.localName + "[" + index + "]";
        } else {
            return "/" + element.localName;
        }
    } else {
        return '';
    }
}

export function overrideMethod(target, method, factory) {
    target[method] = factory.call(target, target[method]);
}

export function findProperty(node, name) {
    do if (node.hasOwnProperty(name)) {
        return node[name];
    } while (node = node.parentNode);
}

export function findPropertyOwner(node, name) {
    do if (node.hasOwnProperty(name)) {
        debug && console.debug("found:", name, "on:", node);
        return node;
    } while (node = node.parentNode);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const DASH_REGEX = /[A-Z\u00C0-\u00D6\u00D8-\u00DE]/g;
const REVERSE_REGEX = /-[a-z\u00E0-\u00F6\u00F8-\u00FE]/g;
const ALL_WHITESPACES = /^\s+$/g;

export function dashCase(str) {
    return str.replace(DASH_REGEX, function (match) {
        return '-' + match.toLowerCase();
    });
}

export function camelCase(str) {
    return str.replace(REVERSE_REGEX, function (match) {
        return match.slice(1).toUpperCase();
    });
}

export function closest(name, fromNode, callback) {
    do {
        if (fromNode[name]) {
            return callback ? callback(fromNode) : fromNode[name];
        }
        fromNode = fromNode.parentElement;

    } while (fromNode);
}

export function appendCallback(target, methodName, callback) {
    let delegate = target[methodName];
    if (delegate) {
        target[methodName] = function () {
            delegate.call(this);
            callback.call(this);
        }
    } else {
        target[methodName] = callback;
    }
}

class LoggingProxyHandler {

    constructor(name) {
        this.name = name;
    }

    get(target, property) {
        if (target.hasOwnProperty(property)) {
            console.log("get:", this.name, "[", property, "]");
            let value = target[property];
            return typeof value === 'object' ? new Proxy(value, new LoggingProxyHandler(this.name + " > " + property)) : value;
        } else {
            return target[property];
        }
    }

    set(target, property, value, receiver) {
        console.log("set:", this.name, "[", property, "]");
        target[property] = value;
        return true;
    }
}

export const EMPTY_ARRAY = [];
export const EMPTY_OBJECT = {};
export const VOID_FUNCTION = function () {
};
