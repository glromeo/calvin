import {compileExpression} from "./compile.js";
import {nodePath} from "../utility.js";

const debug = true;

function mustacheTemplateCallback(value) {
    this.nodeValue = value;
}

function insertErrorBeforeTextNode(error) {
    console.error("Failed:", this, error);
    this.parentNode.insertBefore(createErrorPlaceholder(error), this.nextSibling);
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
Text.prototype.linkedCallback = function textLinkedCallback() {

    const text = this.wholeText, parentNode = this.parentNode;

    while (this.previousSibling && this.previousSibling.nodeType === this.nodeType) parentNode.removeChild(this.previousSibling);
    while (this.nextSibling && this.nextSibling.nodeType === this.nodeType) parentNode.removeChild(this.nextSibling);

    let end = 0, begin = text.indexOf('{{', end), staticText, expression;
    while (begin >= end) {

        if (begin > end && (staticText = text.substring(end, begin).trim())) {
            parentNode.insertBefore(document.createTextNode(staticText), this);
        }

        end = text.indexOf('}}', begin += 2);

        if (end > begin && (expression = text.substring(begin, end).trim())) {
            const node = document.createTextNode('');
            parentNode.insertBefore(node, this);

            expression = compileExpression(expression, nodePath(node));
            node.isLinked = this.eval(expression, mustacheTemplateCallback, insertErrorBeforeTextNode);

            Object.defineProperty(node, "[[Expression]]", {value: expression});
            if (debug) {
                console.debug("linked #text to expression: {{", expression.source, "}}");
            }
        }

        begin = text.indexOf('{{', end += 2);
    }

    if (end < text.length && (staticText = text.substring(end).trim())) {
        parentNode.insertBefore(document.createTextNode(staticText), this);
    }

    const pi = document.createProcessingInstruction(':text', text);
    pi.disconnectedCallback = function () {
        if (this.parentNode) this.parentNode.insertBefore(document.createTextNode(text), this.nextSibling);
    }

    parentNode.insertBefore(pi, this);
    return this;
}