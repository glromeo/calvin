import {compileExpression} from "./compile.js";

const debug = true;

function customAttributeCallback(value) {
    this.ownerElement.setAttribute(this.name, value);
}

function insertErrorInAttributeOwner(error) {
    console.error("Failed:", this.ownerElement, error);
    this.ownerElement.appendChild(createErrorPlaceholder(error));
}

function createErrorPlaceholder(error) {
    const pre = document.createElement('pre');
    pre.style = "background-color: red; color: white; font-size: 10pt; font-family: 'Helvetica'; padding: 4px; border: 1px solid darkred;";
    pre.innerText = error;
    return pre;
}

/**
 *
 */
Attr.prototype.linkedCallback = function attrLinkedCallback() {

    const expression = compileExpression(this.value, nodePath(this) + "[" + this.name + "]");

    Object.defineProperty(node, "[[Expression]]", {value: expression});
    if (debug) {
        console.debug("linked #text to expression: {{", expression, "}}");
    }

    this.name = this.name.substring(1);

    if (debug) console.debug("linking attribute:", this.name, "to expression:" + this.expression);

    this.eval(expression, customAttributeCallback, insertErrorInAttributeOwner, this);
}
