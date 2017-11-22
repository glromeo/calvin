const debug = false;

const moment = require("moment");

const path = require("path");

const basedir = path.resolve(__dirname);


(function interceptConsoleMethods(proxy) {

    console.native = Object.create(console);

    ["debug", "error", "info", "log", "warn", "trace"].forEach(method => {
        console[method] = proxy(method, console.native[method] = console[method]);
    });

})(function proxy(method, native) {
    let timeformat = "HH:mm:ss.SSS";
    let regExp = /\((.+):(\d+):(\d+)\)/;
    return function () {
        let matches = new Error().stack.split(' at ')[2].match(/\((.+):(\d+:\d+)\)/) || ['', ''];
        let file = debug ? path.relative(basedir, matches[1]) : path.basename(matches[1]);
        let timestamp = "\x1b[32m" + moment().format(debug ? "YYYY-MM-DD HH:mm:ss.SSS" : "HH:mm:ss.SSS");
        return native.call(this, timestamp, "\x1b[34m" + file, "\x1b[35m(" + matches[2] + ")", "\x1b[30m" + Array.from(arguments).join(" "));
    };
});


const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');

const {port, app} = require("./server");

async function launch() {
    return chromeLauncher.launch({
        port: 9222,
        chromeFlags: [
            '--window-size=1024,768',
            '--disable-gpu',
            '--headless'
        ]
    }).then(chrome => {
        console.log(`chrome debugging port running on ${chrome.port}`);
        return chrome;
    });
}

async function main() {

    const chrome = await launch();
    const client = await CDP({port: chrome.port});

    const {Console, Network, Page, Runtime, Security} = client;

    console.log("enabling runtime notifications...");
    await Runtime.enable();
    Runtime.consoleAPICalled(function (event) {
        let timestamp = "\x1b[32m" + moment(event.timestamp).format(debug ? "YYYY-MM-DD HH:mm:ss.SSS" : "HH:mm:ss.SSS");
        let callFrame = event.stackTrace.callFrames[0];
        nativeConsole.log(timestamp, "\x1b[32m" + callFrame.url, `\x1b[35m(${callFrame.lineNumber}:${callFrame.columnNumber})\x1b[30m`, ...(event.args.map(arg => arg.value)));
    });

    console.log("enabling page notifications...");
    Page.loadEventFired(async () => {
        const js = "document.querySelector('title').textContent";
        // Evaluate the JS expression in the page.
        const evaluation = await Runtime.evaluate({expression: js});

        console.log('Title of page: ' + evaluation.result.value);

        // client.close();
        // chrome.kill(); // Kill Chrome.
    });
    await Page.enable();

    if (debug.network) {
        console.log("setting up network handlers...");
        Network.requestWillBeSent((params) => {
            console.log("request:", params.request.url);
        });
        await Network.enable();
    }

    console.log("setting up security handlers...");
    Security.certificateError(({eventId}) => {
        Security.handleCertificateError({
            eventId,
            action: 'continue'
        });
    });
    await Security.enable();
    await Security.setOverrideCertificateErrors({override: true});

    await Page.navigate({url: `https://localhost:${port}/public/test.html`});

    return client;
}

main().then(client => {
    console.log("ready");
}, error => {
    console.error("error", error);
});

