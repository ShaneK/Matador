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
    resolver = require('./lib/resolver');


exports.create = function (parent) {


    return Object.create(resolver.create(parent), {

        resolveFile: {
            value: function (file, callback) {
                var self, ext;

                self = this;
                function done(err, data) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    callback(null, self.resolve(data));
                }

                // Short circuit file types node can handle natively.
                ext = path.extname(file);
                if (ext === '' || require.extensions.hasOwnProperty(ext)) {
                    process.nextTick(done.bind(undefined, null, require(file)));
                    return;
                }

                fs.readFile(file, 'utf8', function (err, data) {
                    var json, error;

                    if (err) {
                        done(err);
                        return;
                    }

                    try {
                        json = JSON.parse(data);
                        error = null;
                    } catch (err) {
                        json = undefined;
                        error = err;
                    } finally {
                        done(error, json);
                    }

                });
            }
        },

        resolveFileSync: {
            value: function (file) {
                var data, ext;

                ext = path.extname(file);
                if (ext === '' || require.extensions.hasOwnProperty(ext)) {
                    return this.resolve(require(file));
                }

                data = fs.readFileSync(file, 'utf8');
                data = JSON.parse(data);
                return this.resolve(data);
            }
        }

    });

};