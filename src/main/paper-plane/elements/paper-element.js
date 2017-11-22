import {CustomElement} from "./@CustomElement.js";

import "../patch/Attr.js";
import "../patch/compile.js";
import "../patch/Element.js";
import "../patch/HTMLTemplateElement.js";
import "../patch/Node.js";
import "../patch/Text.js";

const debug = true;

/**
 * Base class for all PaperPlane custom elements. This base class is responsible of binding the element to
 * the Context, compiling the DOM of the element when necessary and dispatching to the finer grained callbacks...
 */
@CustomElement
export class PaperElement extends HTMLElement {

    constructor() {
        super();
        if (debug) console.debug("created:", this.tagName);
    }

    connectedCallback() {
        try {
            if (debug) console.debug("connected:", this.tagName, "to:", this.parentNode.tagName);

            this.linkedCallback();

            if (debug) console.debug("linked:", this.tagName);

        } catch (e) {
            console.error("failed to link:", this.tagName, e);
        }
    }

    disconnectedCallback() {
        if (debug) console.debug("disconnected:", this.tagName);
    }

    /**
     *
     * @param attrName
     * @param oldVal
     * @param newVal
     */
    attributeChangedCallback(attrName, oldVal, newVal) {

        if (debug) console.debug(this.tagName, "attribute changed", attrName, oldVal, newVal);

        const callbacks = this.attributeChangedCallbacks;
        if (callbacks) {
            const callback = callbacks[attrName];
            if (callback) {
                callback.call(this, newVal, oldVal);
            }
        }
    }

    get attributeChangedCallbacks() {
        Object.defineProperty(this, 'attributeChangedCallbacks', {value: this.attributeChangedCallbacks || {}});
        return attributeChangedCallbacks;
    }

    /**
     * @callback attributeChangedCallback
     * @param {string} newVal - New value
     * @param {string} oldVal - Old value
     */

    /**
     * This method is meant to be used by the @Attribute decorator but can be used also programmatically.
     * When invoked from @Attribute the callback is added to the prototype's context.
     *
     * TODO: can the static array of observedAttributes be changed after element definition? after upgrade??
     *
     * @param {string} attrName - The attribute name must have been specified in the static property observedAttributes
     * @param {attributeChangedCallback} callback - The callback which will be invoked (on the node) when that attribute changes
     */
    setAttributeChangedCallback(attrName, callback) {
        if (!this.hasOwnProperty('attributeChangedCallbacks')) {
            Object.defineProperty(this, 'attributeChangedCallbacks', {value: this.attributeChangedCallbacks || {}});
        }
        this.attributeChangedCallbacks[attrName] = callback;
    }
}

Object.defineProperty(PaperElement.prototype, Symbol.toStringTag, {value: PaperElement.name});
