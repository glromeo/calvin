const debug = true;

const isCustomElement = typeof customElements !== "undefined" ? function (localName) {
    return customElements.get(localName) ? true : false;
} : function () {
    return false;
};

/**
 *
 */
Element.prototype.linkedCallback = function elementLinkedCallback() {

    let ready = [];

    if (this.hasAttributes()) for (const attr of this.attributes) {
        if (attr.name[0] === '@') {
            attr.linkedCallback();
            ready.push(attr.isLinked);
        }
    }

    let node = this.firstChild;
    if (node) do switch (node.nodeType) {

        case Node.TEXT_NODE: {
            node = node.linkedCallback();
            continue;
        }

        case Node.ELEMENT_NODE: {

            if (isCustomElement(node)) continue;

            node = node.linkedCallback();
            continue;
        }

        default: {
            throw new Error("unexpected node: " + node);
        }

    } while (node = node.nextSibling);
}