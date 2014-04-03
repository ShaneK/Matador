/***@@@ BEGIN LICENSE @@@***/
/*───────────────────────────────────────────────────────────────────────────*\
│  Copyright (C) 2013 eBay Software Foundation                                │
│                                                                             │
│hh ,'""`.                                                                    │
│  / _  _ \  Licensed under the Apache License, Version 2.0 (the "License");  │
│  |(@)(@)|  you may not use this file except in compliance with the License. │
│  )  __  (  You may obtain a copy of the License at                          │
│ /,'))((`.\                                                                  │
│(( ((  )) ))    http://www.apache.org/licenses/LICENSE-2.0                   │
│ `\ `)(' /'                                                                  │
│                                                                             │
│   Unless required by applicable law or agreed to in writing, software       │
│   distributed under the License is distributed on an "AS IS" BASIS,         │
│   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  │
│   See the License for the specific language governing permissions and       │
│   limitations under the License.                                            │
\*───────────────────────────────────────────────────────────────────────────*/
/***@@@ END LICENSE @@@***/
'use strict';

var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    mkdirp = require('mkdirp'),
    assert = require('assert');



exports.dust = function (srcRoot, destRoot, options) {
    var lib, compiler;

    lib = requireAny('dustjs-linkedin', 'adaro');
    compiler = function dust(name, data, args, callback) {
        try {
            callback(null, lib.compile(data.toString('utf8'), name));
        } catch (err) {
            callback(err);
        }
    };

    return middleware(srcRoot, destRoot, options, compiler, 'js');
};



exports.less = function (srcRoot, destRoot, options) {
    var lib, compiler;

    lib = requireAny('less');
    compiler = function less(name, data, args, callback) {
        var parser = new(lib.Parser)({
            paths: args.paths, // Specify search paths for @import directives
            filename: name, // Specify a filename, for better error messages
            dumpLineNumbers: "comments" // Enables comment style debugging
        });

        try {

            // Really? REALLY?! It takes an error-handling callback but still can throw errors?
            parser.parse(data.toString('utf8'), function (err, tree) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(null, tree.toCSS());
            });

        } catch (err) {
            callback(err);
        }
    };

    return middleware(srcRoot, destRoot, options, compiler, 'css');
};



exports.sass = function (srcRoot, destRoot, options) {
    var lib, compiler;

    lib = requireAny('node-sass');
    compiler = function scss(name, data, args, callback) {
        lib.render({
            data: data,
            success: callback.bind(this, null),
            error: callback,
            includePaths: args.paths
        });
    };

    return middleware(srcRoot, destRoot, options, compiler, 'css');
};



exports.default = function (srcRoot, destRoot, options) {
    var compiler;

    compiler = function (name, data, args, callback) {
        // noop
        callback(null, data);
    };

    return middleware(srcRoot, destRoot, options, compiler, '[a-zA-Z]{2,5}?');
};



exports.compiler = function (srcRoot, destRoot, options) {

    var middleware = noop;

    Object.keys(options || {}).forEach(function (name) {
        var impl = exports[name](srcRoot, destRoot, options[name]);

        middleware = (function (prev) {
            return function krakenCompiler(req, res, next) {
                impl(req, res, function (err) {
                    if (err) {
                        next(err);
                        return;
                    }
                    prev(req, res, next);
                });
            };
        }(middleware));
    });

    return middleware;

};






function middleware(srcRoot, destRoot, options, compiler, ext) {

    // API allows just a string or config object
    options = options || '';
    if (typeof options === 'string') {
        options = { dir: options };
    }

    var regex = createPathRegex(options.dir || '', ext);
    var tasks = [
        options.precompile || noop,
        createExecutor(compiler),
        options.postcompile || noop
    ];

    return filterRequest(regex, function (req, res, next) {

        var start = function (callback) {
            // Create the compile context. This gets passed through all compile steps.
            var context = {
                srcRoot:  srcRoot,
                destRoot: destRoot,
                filePath: req.path.replace('/', path.sep),
                name:     req.path.match(regex)[1]
            };
            callback(null, context);
        };

        async.waterfall([start].concat(tasks), function (err) {
            // Guard against modules throwing whatever they damn well please.

            if (typeof err === 'string') {
                err = new Error(err);
            }

            // On Ubuntu, `less` failures return an object that is not an error but has the structure
            // { type: '', message: '', index: '' } so we need to accommodate that. :/
            if (typeof err === 'object' && err !== null && !(err instanceof Error)) {
                err = Object.keys(err).reduce(function (dest, prop) {
                    dest[prop] = err[prop];
                    return dest;
                }, new Error());
            }

            // Missing source is a valid case. Not an error.
            if (err && err.code === 'ENOENT') {
                err = undefined;
            }

            next(err);
        });

    });

}



function filterRequest(regex, fn) {
    return function filterRequest(req, res, next) {
        if (req.method.toLowerCase() !== 'get') {
            next();
            return;
        }

        if (!req.path.match(regex)) {
            next();
            return;
        }

        fn.apply(undefined, arguments);
    };
}




function requireAny(/*modules*/) {
    var result, failed;

    result = undefined;
    failed = [];

    Array.prototype.slice.call(arguments).some(function (moduleName) {
        try {
            result = require(moduleName);
        } catch (err) {
            // noop
            failed.push(moduleName);
        }
        return !!result;
    });

    assert.ok(failed.length !== arguments.length, 'Required module(s) not found. Please install one of the following: ' + failed.join(', '));
    return result;
}




function createPathRegex(dir, ext) {
    dir = dir || '';
    if (dir.charAt(0) !== '/') {
        dir = '/' + dir;
    }

    if (dir.charAt(dir.length - 1) !== '/') {
        dir = dir + '/';
    }

    return new RegExp('^' + dir + '(.*)\\.' + ext +'$', 'i');
}




function createExecutor(compiler) {
    return function compile(context, callback) {
        exec(compiler, context, function (err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, context);
        });
    };
}




function exec(compiler, context, callback) {
    var srcFile, destFile, srcPath, destPath;

    srcFile = destFile = context.filePath;
    if (compiler.name) {
        // XXX: compiler.name is source file extension, so if there's no name we don't concern ourselves
        // with looking for a source file that's different from the dest file.
        srcFile = srcFile.replace(path.extname(srcFile), '') + '.' + compiler.name;
    }

    srcPath  = path.join(context.srcRoot, srcFile);
    destPath = path.join(context.destRoot, destFile);

    fs.readFile(srcPath, function (err, raw) {
        var dirs, dir;

        if (err) {
            callback(err);
            return;
        }

        // Build search paths for compilers.
        dirs = [];
        dir = path.dirname(srcPath);
        while (dir !== context.srcRoot) {
            dirs.unshift(dir);
            dir = path.dirname(dir);
        }

        compiler(context.name, raw, { paths: dirs }, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            mkdirp(path.dirname(destPath), function (err) {
                if (err) {
                    callback(err);
                    return;
                }

                fs.writeFile(destPath, result, callback);
            });
        });
    });
}



function noop() {
    var args = Array.prototype.slice.call(arguments);
    var callback;
    if (typeof args[args.length - 1] === 'function') {
        callback = args.pop();
        args.unshift(null);
        callback.apply(undefined, args);
    }
}
