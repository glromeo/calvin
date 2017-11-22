/**
 *
 */
HTMLTemplateElement.prototype.linkedCallback = function elementLinkedCallback() {
    const is = this.getAttribute("is");
    if (is) {
        const customElement = document.createElement(is);
        for (const attr of this.attributes) {
            customElement.setAttribute(attr.name, attr.value);
        }
        customElement.content = this.content;
        this.parentNode.replaceChild(customElement, this);
        return customElement;
    } else {
        return this;
    }
}

