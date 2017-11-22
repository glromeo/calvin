if (location.search.startsWith("?_ijt")) (function redirectIntelliJ({hostname, pathname, search}) {
    const SERVER_PORT = 8443;
    location = `https://${hostname}:${SERVER_PORT}${
    "/public" + pathname.substring(pathname.indexOf('/', 1 + pathname.indexOf('/', 1 + pathname.indexOf('/'))))
        }`;
})(location);

Object.defineProperty(window, 'exports', {
    value: new Proxy({}, {
        get(target, property) {
            return window[property];
        },
        set(target, property, value) {
            window[property] = value;
            return true;
        }
    })
});

window.setImmediate = setTimeout