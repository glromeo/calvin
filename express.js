const debug = false;

const path = require("path");

const {promisify} = (require('util'));
const fs = require("fs");
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

const pkg = JSON.parse(fs.readFileSync("package.json"));

class Server {

    constructor() {
        this.express = require('express');
        this.app = this.express();
    }

    cors() {
        const cors = require('cors');
        this.app.use(cors());
        return this;
    }

    accessLog() {
        let morgan = require('morgan');
        let middleware = morgan('dev');
        this.app.use(middleware);
        return this;
    }

    errorPage() {
        let expressError = require('express-error');
        let middleware = expressError.express3({contextLinesCount: 3, handleUncaughtException: true});
        this.app.use(middleware);
        return this;
    }

    resources(roots) {
        const serveIndex = require('serve-index');
        for (const context of roots) this.app.use(
            context,
            this.express.static(path.join(__dirname, context)),
            serveIndex(path.join(__dirname, context))
        );
        return this;
    }

    babelMiddleware(mappings, babelrc, options) {

        const babel = require("babel-core");

        const middleware = require('@codebite/transpile-middleware');
        const config = Object.assign({
            from: '*.js',
            to: '*.js',
            debug: false,
            force: false,
            transpile(source, {req, file}) {
                console.log("user-agent:", req.headers['user-agent']);
                console.log("compiling:", file || req.path);
                return babel.transform(source, babelrc);
            },
            headers: {
                "Content-Type": "application/javascript"
            }
        }, options);

        for (const {url, from, to} of mappings) this.app.use(
            url,
            middleware(Object.assign(Object.create(config), {
                src: from,
                dest: to,
                onSend(code, req, res) {
                    let basedir = path.dirname(to + req.url);
                    new Function("System", code).call(this, {
                        register(deps, callback) {
                            for (const dep of deps) {
                                console.log(path.resolve(basedir, dep));
                            }
                        }
                    })
                }
            })),
            this.express.static(path.join(__dirname, to))
        );
        return this;
    }

    sassMiddleware(mappings, config) {

        const middleware = require('node-sass-middleware');

        for (const {url, from, to} of mappings) this.app.use(
            url,
            middleware(Object.assign({
                src: from,
                dest: to,
                sourceMapRoot: from
            }, config)),
            this.express.static(path.join(__dirname, to))
        );
        return this;
    }

    http(port) {
        this.http.server = require('http').createServer(this.app);
        this.http.server.listen(port, function () {
            console.log('http server listening on port: ' + port);
        });
        this.http.port = port;
        return this;
    }

    http2(port) {
        let key = require("fs").readFileSync('./cert/localhost.key');
        let cert = require("fs").readFileSync('./cert/localhost.crt');

        this.http2.server = require('spdy').createServer({key, cert}, this.app);
        this.http2.server.listen(port, function () {
            console.log('http2 server listening on port: ' + port);
        });
        this.http2.port = port;
        return this;
    }

    websocket(connectedCallback) {

        const WebSocket = require('ws');

        [
            new WebSocket.Server({server: this.http.server}),
            new WebSocket.Server({server: this.http2.server})

        ].forEach(ws => {

            ws.on('connection', function connect(socket, req) {

                connectedCallback.call(this, socket, req);

                socket.isAlive = true;
                socket.on('pong', function heartbeat() {
                    this.isAlive = true;
                });
            });

            setInterval(function ping() {
                ws.clients.forEach(function each(client) {
                    if (!client.isAlive) {
                        return client.terminate();
                    }
                    client.isAlive = false;
                    client.ping('', false, true);
                });
            }, 30000);
        });
        return this;
    }
}

module.exports = new Server()

    .cors()

    .accessLog()

    .errorPage()

    .babelMiddleware([
        {url: '/calvin', from: 'src/main/calvin', to: 'lib/calvin'},
        {url: '/custom-attributes', from: 'src/main/custom-attributes', to: 'lib/custom-attributes'},
        {url: '/perf', from: 'src/perf', to: 'lib/perf'},
        {url: '/test', from: 'src/test', to: 'lib/test'}
    ], {
        "babelrc": false,
        "sourceMaps": true,
        "plugins": [
            "transform-decorators-legacy",
            "transform-es2015-modules-systemjs"
        ]
    })

    .sassMiddleware([
        {url: '/css', from: 'src/styles', to: 'lib/css'}
    ], {
        debug: true,
        sourceMap: true,
        outputStyle: 'compressed',
    })

    .resources([
        '/node_modules',
        '/data',
        '/public',
        '/src',
        '/tools'
    ])

    .http(8080)

    .http2(8443);
