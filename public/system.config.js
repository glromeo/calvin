System.config({
    baseURL: '/node_modules',
    map: {
        "calvin": "/calvin",
        "custom-attributes": "/custom-attributes",
        "perf": "/perf",
        "test": "/test"
    },
    packages: {
        'calvin': {
            main: 'main.js',
            format: 'system',
            defaultExtension: 'js'
        },
        'custom-attributes': {
            main: 'context.js',
            format: 'system',
            defaultExtension: 'js'
        }
    },
    packageConfigPaths: [
        '/node_modules/*/package.json'
    ],
    trace: true
});
