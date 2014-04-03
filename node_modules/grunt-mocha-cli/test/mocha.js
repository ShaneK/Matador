'use strict';

var fs = require('fs');
var mocha = require('../lib/mocha');


exports['sanity check'] = function (test) {
    test.expect(2);

    mocha({
        files: [__dirname + '/fixture/pass.js'],
        quiet: true
    }, function (error, output) {
        test.ifError(error);
        test.notStrictEqual(output.indexOf('1 passing'), -1, '1 test should pass');
        test.done();
    });
};

exports['mocha pass'] = function (test) {
    test.expect(1);

    mocha({
        files: [__dirname + '/fixture/pass.js'],
        quiet: true
    }, function (error) {
        test.ok(!error, 'mocha should pass');
        test.done();
    });
};

exports['mocha fail'] = function (test) {
    test.expect(1);

    mocha({
        files: [__dirname + '/fixture/fail.js'],
        quiet: true
    }, function (error) {
        test.ok(error, 'mocha should fail');
        test.done();
    });
};

exports['set string option'] = function (test) {
    test.expect(2);

    mocha({
        files: [__dirname + '/fixture/pass.js'],
        quiet: true,
        reporter: 'json'
    }, function (error, output) {
        test.ifError(error);
        test.doesNotThrow(function () {
            JSON.parse(output);
        }, SyntaxError, 'should return valid JSON');
        test.done();
    });
};

exports['set bool option'] = function (test) {
    test.expect(1);

    mocha({
        files: [__dirname + '/fixture/fail.js'],
        quiet: true,
        reporter: 'json',
        bail: true
    }, function (error, output) {
        output = JSON.parse(output);
        test.strictEqual(output.stats.tests, 1, 'should run only 1 test');
        test.done();
    });
};

exports['set array option'] = function (test) {
    test.expect(1);

    mocha({
        files: [__dirname + '/fixture/coffeescript.coffee'],
        quiet: true,
        reporter: 'json',
        compilers: ['coffee:coffee-script']
    }, function (error) {
        test.ifError(error, 'should compile the coffeescript');
        test.done();
    });
};

exports['require modules'] = function (test) {
    test.expect(2);

    mocha({
        files: [__dirname + '/fixture/require.js'],
        quiet: true,
        reporter: 'json',
        require: ['should']
    }, function (error, output) {
        output = JSON.parse(output);
        test.ifError(error);
        test.strictEqual(output.stats.passes, 1, 'should require modules');
        test.done();
    });
};

exports['set environment variables'] = function (test) {
    test.expect(1);

    mocha({
        files: [__dirname + '/fixture/env.js'],
        quiet: true,
        require: ['should'],
        env: {
            FOO: 'bar'
        }
    }, function (error) {
        test.ifError(error);
        test.done();
    });
};

exports['save mocha output'] = function (test) {
    test.expect(2);

    mocha({
        files: [__dirname + '/fixture/pass.js'],
        save: __dirname + '/output.txt',
        reporter: 'tap'
    }, function (error) {
        try {
            test.ifError(error);
            var output = fs.readFileSync(__dirname + '/output.txt', 'utf8');
            test.ok(output.match(/ok 1 fixture pass/));
            test.done();
        } finally {
            fs.unlink(__dirname + '/output.txt');
        }
    });
};
