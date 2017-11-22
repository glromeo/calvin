export function Ready(target, property, descriptor) {
    if (!target.hasOwnProperty('@Ready')) {
        target['@Ready'] = new Deferred();
    }
    target['@Ready'].then(context => this[property](context));
}