const debug = true;

let nextUniqueContextId = 0;

export class Context {

    constructor() {
        this.id = nextUniqueContextId++;
    }

    /**
     *
     * @param {Context} context
     * @param {boolean} inheritProperties
     */
    appendChild(context, inheritProperties) {

        if (context.prevSibling = this.lastChild) {
            this.lastChild = this.lastChild.nextSibling = context;
        } else {
            this.lastChild = this.firstChild = context;
        }

        if (context.parentContext) {
            context.parentContext.removeChild(context);
        }
        context.parentContext = this;

        if (inheritProperties) {
            Object.setPrototypeOf(context.properties, this.properties);
        }
    }

    /**
     *
     * @param {Context} context
     */
    removeChild(context) {

        for (let next = this.firstChild; next; next = next.nextSibling) if (next === context) {
            if (context.prevSibling) {
                context.prevSibling.nextSibling = context.nextSibling;
                context.prevSibling = undefined;
            } else {
                this.firstChild = context.nextSibling;
            }
            if (context.nextSibling) {
                context.nextSibling.prevSibling = context.prevSibling;
                context.nextSibling = undefined;
            } else {
                this.lastChild = context.prevSibling;
            }
            return true;
        }
    }

    createChild(definitions) {
        let child = new Context(this);
        child.defineProperties(definitions);
        return child;
    }


}

/**
 *
 * @returns {Context}
 */
export function rootContext() {
    return Context.prototype[__RootContext__];
}

/**
 *
 * @param {Node} node
 * @returns {boolean}
 */
export function hasContext(node) {
    return node.hasOwnProperty('context');
}

/**
 *
 * @param {Node} node
 * @returns {Context}
 */
export function closestContext(node) {
    do if (node.hasOwnProperty('context')) {
        return node.context;
    } while (node = node.parentNode);
}

/**
 *
 * @param {Node} node
 * @param {Object} properties
 * @returns {Context}
 */
export function createContext(node, properties) {
    const context = new Context();
    if (properties) {
        const contextProperties = context.properties;
        Object.keys(properties).forEach(key => contextProperties.set(key, properties[key]));
    }
    node.context = context;
    return context;
}

/**
 * TODO: all listeners must be destroyed
 *
 * @param node
 * @returns {*}
 */
export function deleteContext(node) {
    delete node.context;
}

if (typeof document !== "undefined") {

    const rootContext = createContext(document.documentElement);

    Object.defineProperty(Context.prototype, 'root', {
        value: rootContext
    });

    Object.defineProperties(document, {
        'rootContext': {
            get() {
                return rootContext;
            }
        },
        'closestContext': {
            value: function (selector) {
                const element = document.querySelector(selector);
                return closestContext(element);
            }
        }
    });

    /**
     * TODO: not valid yet
     *
     * @type {MutationObserver}
     */
    const disconnectionObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            let nodesToCleanUp = [];
            for (const removed of mutation.removedNodes) if (removed.nodeType === Node.ELEMENT_NODE) {
                const treeWalker = document.createTreeWalker(removed, NodeFilter.SHOW_ELEMENT);
                do {
                    const node = treeWalker.currentNode;
                    if (node.cleanUpCallback) {
                        nodesToCleanUp.push(node);
                    }
                } while (treeWalker.nextNode());
            }
            setTimeout(() => {
                nodesToCleanUp.forEach(node => node.cleanUpCallback());
            });
        });
    });

    // disconnectionObserver.observe(document.querySelector('body'), {childList: true, subtree: true});

    // TODO: Refactor this, it's not used yet!
    document.dispatchEvent(new CustomEvent("calvin:ready"));
}
