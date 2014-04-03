'use strict';

var fs = require('fs');
var grunt = require('grunt');
var path = require('path');

var BOOL_OPTIONS = [
    'invert',
    'colors',
    'no-colors',
    'growl',
    'debug',
    'bail',
    'recursive',
    'debug-brk',
    'async-only',
    'check-leaks',
    'sort',
    'inline-diffs',
    'no-exit',
    'expose-gc',
    'gc-global',
    'harmony',
    'harmony-proxies',
    'harmony-collections',
    'harmony-generators',
    'prof'
];
var STRING_OPTIONS = [
    'reporter',
    'ui',
    'grep',
    'timeout',
    'slow'
];
var ARRAY_OPTIONS = [
    'globals',
    'compilers'
];


module.exports = function (options, callback) {
    var args = [];
    var spawnOptions = {
        opts: {
            env: process.env
        }
    };

    spawnOptions.cmd = require.resolve('mocha');
    spawnOptions.cmd = path.dirname(spawnOptions.cmd);
    spawnOptions.cmd += '/../.bin/mocha';

    if (process.platform === 'win32') {
        spawnOptions.cmd += '.cmd';
    }

    if (!options.quiet && !options.save) {
        // Redirect the Mocha output directly to the terminal to maintain colors
        spawnOptions.opts.stdio = 'inherit';
    }

    if (options.env) {
        Object.keys(options.env).forEach(function (property) {
            spawnOptions.opts.env[property] = options.env[property];
        });
    }

    BOOL_OPTIONS.forEach(function (option) {
        if (options[option]) {
            args.push('--' + option);
        }
    });

    STRING_OPTIONS.forEach(function (option) {
        if (options[option]) {
            args.push('--' + option);
            args.push(options[option]);
        }
    });

    ARRAY_OPTIONS.forEach(function (option) {
        if (Array.isArray(options[option])) {
            args.push('--' + option);
            args.push(options[option].join(','));
        }
    });

    if (Array.isArray(options.require)) {
        options.require.forEach(function (module) {
            args.push('--require');
            args.push(module);
        });
    }

    spawnOptions.args = args.concat(options.files);

    grunt.util.spawn(spawnOptions, function (error, output) {
        if (options.save) {
            fs.writeFileSync(options.save, output.stdout);
        }

        callback(error, output.stdout + output.stderr);
    });
};
