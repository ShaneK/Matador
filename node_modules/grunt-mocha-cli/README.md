Grunt Mocha CLI
===============

[![Build Status](https://secure.travis-ci.org/Rowno/grunt-mocha-cli.png?branch=master)](http://travis-ci.org/Rowno/grunt-mocha-cli)
[![Dependency Status](https://david-dm.org/Rowno/grunt-mocha-cli.png)](https://david-dm.org/Rowno/grunt-mocha-cli)

[![NPM](https://nodei.co/npm/grunt-mocha-cli.png?downloads=true&stars=true)](https://npmjs.org/package/grunt-mocha-cli)

Run [Mocha][] server-side tests in [Grunt][].


Getting Started
---------------
If you haven't used [Grunt][] before, be sure to check out the [Getting Started][] guide, as it explains how to create a Gruntfile as well as install and use Grunt plugins. You can install this plugin with this command:

```bash
npm install grunt-mocha-cli --save-dev
```


Usage
-----

### Options ###
All of the Mocha command line options are supported, plus some extras.

The list of test files to run can be specified using either the standard Grunt format or by using the `files` option. If neither is specified, the Mocha default will be used (`test/*.js`).

#### Mocha Options ####
 * `invert` (boolean) - inverts `grep` matches.
 * `colors` (boolean) - force enabling of colors.
 * `no-colors` (boolean) - force disabling of colors.
 * `growl` (boolean) - enable growl notification support.
 * `debug` (boolean) - enable node's debugger, synonym for `node --debug`.
 * `bail` (boolean) - bail after first test failure.
 * `recursive` (boolean) - include sub directories.
 * `debug-brk` (boolean) - enable node's debugger breaking on the first line.
 * `async-only` (boolean) - force all tests to take a callback (async).
 * `check-leaks` (boolean) - check for global variable leaks.
 * `sort` (boolean) - sort test files.
 * `inline-diffs` (boolean) - display actual/expected differences inline within each string.
 * `no-exit` (boolean) - require a clean shutdown of the event loop: mocha will not call `process.exit()`.
 * `reporter` (string) - specify the reporter to use.
 * `ui` (string) - specify user-interface (bdd|tdd|exports).
 * `grep` (string) - only run tests matching pattern.
 * `timeout` (string) - set test-case timeout in milliseconds [2000].
 * `slow` (string) - "slow" test threshold in milliseconds [75].
 * `globals` (array) - allow the given comma-delimited global names.
 * `compilers` (array) - use the given module(s) to compile files.
 * `require` (array) - require the given modules.
 * `expose-gc` (boolean) - expose gc extension, synonym for `node --expose-gc`.
 * `gc-global` (boolean) - always perform global GCs, synonym for `node --gc-global`.
 * `harmony` (boolean) - enable all harmony features (except typeof), synonym for `node --harmony`.
 * `harmony-proxies` (boolean) - enable harmony proxies, synonym for `node --harmony-proxies`.
 * `harmony-collections` (boolean) - enable harmony collections, synonym for `node --harmony-collections`.
 * `harmony-generators` (boolean) - enable harmony generators, synonym for `node --harmony-generators`.
 * `prof` (boolean) - log statistical profiling information, synonym for `node --prof`.

#### Extras ####
 * `quiet` (boolean) - disable printing of Mocha's output to the terminal.
 * `force` (boolean) - continue running Grunt tasks even if tests fail.
 * `save` (string) - write the mocha output to a file.
 * `files` (string|array) - glob(s) of test files to run.
 * `env` (object) - hash of additional environment variables to pass to the Mocha process.


### Examples ###

Define test files using the standard Grunt format:

```javascript
grunt.initConfig({
    mochacli: {
        options: {
            require: ['should'],
            reporter: 'nyan',
            bail: true
        },
        all: ['test/*.js']
    }
});

grunt.registerTask('test', ['mochacli']);
```

Define test files and basic options once, then customise options per target:

```javascript
grunt.initConfig({
    mochacli: {
        options: {
            require: ['should'],
            files: 'test/*.js'
        },
        spec: {
            options: {
                reporter: 'spec'
            }
        },
        nyan: {
            options: {
                reporter: 'nyan'
            }
        }
    }
});

grunt.registerTask('test', ['mochacli:spec']);
```


Contributing
------------
In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using Grunt.


License
-------
Grunt Mocha CLI is released under the MIT license.

Copyright © 2013 Roland Warmerdam.


[Mocha]: http://visionmedia.github.com/mocha/
[Grunt]: http://gruntjs.com/
[Getting Started]: http://gruntjs.com/getting-started
