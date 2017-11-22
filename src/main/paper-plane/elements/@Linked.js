/**
 * When a PaperElement is connected to the live DOM it is associated with its own scope (the properties).
 * The methods decorated with @Linked get invoked immediately after the properties have been defined.
 * This is equivalent to override the link method in PaperElement.
 */
export function Linked(target, property, descriptor) {
    const linkedCallback = target.linkedCallback;
    target.linkedCallback = function (context) {
        target[property].call(this, context);
        return linkedCallback.call(this, context);
    };
}