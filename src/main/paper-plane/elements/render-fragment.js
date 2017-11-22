import {compile} from "../compile";
import {CustomElement} from "./@CustomElement";
import {PaperElement} from "./paper-element";

const debug = true;

const ForEachOfRegExp = /^\s*(.+)\s+of\s+(.*?)\s*$/;

@CustomElement
export class RenderFragment extends PaperElement {

    constructor() {

        super();

        this.content = document.createDocumentFragment();
        while (this.firstChild) {
            this.content.appendChild(this.firstChild);
        }
    }

    async linkedCallback(context) {

        let fragment = document.createDocumentFragment();

        let alias = this.getAttribute("item");
        let expression = this.getAttribute("in");

        return context.eval(expression, this.insert.bind(this));
    }

    @Attribute
    forEach(value) {
        const [alias, expression] = value.match(ForEachOfRegExp);
        this.alias = alias;
        this.forEach = expression;
    }

    @Attribute
    if(expression) {
        this.if = expression;
    }

    insert(items) {

        if (Array.isArray(items)) {
            items.forEach((item, index) => {
                fragment.appendChild(this.transclude(context.create({
                    [alias]: item,
                    "index": index
                })));
            });
        } else if (items) {
            Object.keys(items).forEach((key) => {
                fragment.appendChild(this.transclude(context.create({
                    [alias]: items[key],
                    "index": key
                })));
            });
        }

        this.appendChild(fragment);

        return this.update.bind(this);
    };

    update(items) {

        while (this.lastChild) this.removeChild(this.lastChild);

        if (Array.isArray(items)) {
            items.forEach((item, index) => {
                fragment.appendChild(this.transclude(context.create({
                    [alias]: item,
                    "index": index
                })));
            });
        } else if (items) {
            Object.keys(items).forEach((key) => {
                fragment.appendChild(this.transclude(context.create({
                    [alias]: items[key],
                    "index": key
                })));
            });
        }

        this.appendChild(fragment);
    }

    transclude($scope) {

        let clone = this.content.cloneNode(true);

        for (let child = clone.firstChild; child; child = child.nextSibling) {
            child.$scope = $scope;
        }

        const link = compile(clone);

        link($scope);

        return clone;
    }
}

function createPlaceholder(prefix = ' ', suffix = ' ') {
    let outerHTML = this.outerHTML;
    let start = outerHTML.indexOf('<') + 1;
    let end = outerHTML.indexOf('>', start);
    return document.createComment(prefix + outerHTML.substring(start, end) + suffix);
}