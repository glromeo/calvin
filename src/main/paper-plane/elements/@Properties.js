export function Properties(definitions) {
    return function (target) {
        Object.defineProperty(target, "properties", {
            get() {
                return Object.assign(Object.create(null), Object.getPrototypeOf(target).properties, definitions);
            }
        });
    }
}
