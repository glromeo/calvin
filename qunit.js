const path = require("path");
const basedir = path.resolve(__dirname);
const home = path.resolve(__dirname, "src");

const debug = false;

const moment = require("moment");

(function interceptConsoleMethods(proxy) {

    console.native = Object.create(console);

    ["debug", "error", "info", "log", "warn", "trace"].map(m => [m, console[m]]).forEach(([method, native]) => {
        const pattern = /\((.+):(\d+:\d+)\)/;
        const format = debug ? "YYYY-MM-DD HH:mm:ss.SSS" : "HH:mm:ss.SSS";
        console.native[method] = console[method];
        console[method] = function () {
            let matches = new Error().stack.split(' at ')[2].match(pattern) || ['', ''];
            let file = debug ? path.relative(basedir, matches[1]) : path.basename(matches[1]);
            let timestamp = "\x1b[32m" + moment().format(format);
            let loc = "(" + matches[2] + ")";
            let args = Array.from(arguments).join(" ");
            return native.call(this, timestamp, "\x1b[34m" + file, "\x1b[35m"+ loc, "\x1b[30m" + args);
        };
    });

})();

const chokidar = require("chokidar");
const server = require("./server");

server.websocket(function connected(socket, req) {

    console.log("websocket connected");
    {
        const main = "main/**/*.js";
        const test = "test/**/*." + req.url.substring(1) + ".js";

        console.log("scanning:", home, "for:", main);
        console.log("scanning:", home, "for:", test);

        const watcher = chokidar.watch([main, test], {cwd: home});
        watcher.on("add", (file, stats) => {
            file = file.replace('\\','/');
            if (file.startsWith("test")) {
                console.log("add:", file);
                socket.send(JSON.stringify({
                    type: 'import',
                    src: file
                }));
            }
        });
        watcher.on("change", (file, stats) => {
            file = file.replace('\\','/');
            file = file.startsWith("main/") ? file.substring(5) : file;
            console.log("change:", file);
            socket.send(JSON.stringify({
                type: 'reload',
                src: file
            }));
        });

        socket.on('close', function () {
            watcher.close();
            console.log('watcher closed');
        });
    }

    let handler = {
        console(data) {
            console.native[data.method](
                "\x1b[32m" + moment(data.timestamp, data.timeformat).format(data.timeformat),
                "\x1b[34m" + data.url,
                "\x1b[35m(" + data.row + ':' + data.column + ")",
                "\x1b[30m" + Array.from(data.args).join(" ")
            );
        }
    };

    socket.on('message', function incoming(message) {
        let actionLength = message.indexOf(':');
        let action = message.substring(0, actionLength);
        let data = JSON.parse(message.substring(actionLength + 1));
        try {
            handler[action](data);
        } catch (e) {
            console.error(e);
        }
    });
});