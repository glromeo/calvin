import {dashCase} from "../utility";

function defineObservedAttributes(constructor) {
    if (constructor.observedAttributes) {
        constructor.observedAttributes = constructor.observedAttributes.slice();
    } else {
        constructor.observedAttributes = [];
    }
}

export function Attribute() {

    let name = arguments[0];

    let decorator = function (target, property, descriptor) {

        const constructor = target.constructor;

        if (!constructor.hasOwnProperty('observedAttributes')) {
            defineObservedAttributes(constructor);
        }

        constructor.observedAttributes.push(name);

        target.setAttributeChangedCallback(name, target[property]);
    }

    if (typeof name === "string") {
        return decorator;
    } else {
        name = dashCase(property);
        return decorator.apply(this, arguments);
    }
}


