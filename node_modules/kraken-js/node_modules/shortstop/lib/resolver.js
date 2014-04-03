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



exports.create = function (parent) {

    return {

        _parent: parent,

        _handlers: Object.create(null),

        use: function (protocol, impl) {
            var handlers, handler, index, removed;

            handlers = this._handlers;
            handler = handlers[protocol];

            if(!handler) {
                handler = handlers[protocol] = {

                    protocol: protocol,

                    regex: new RegExp('^' + protocol + ':'),

                    predicate: function (value) {
                        return this.regex.test(value);
                    },

                    stack: []

                };
            }

            index = handler.stack.push(impl);
            removed = false;

            // Unuse
            return function () {
                if (!removed) {
                    removed = true;
                    return handler.stack.splice(index - 1, 1)[0];
                }
                return undefined;
            }
        },

        getStack: function (protocol) {
            var current, parent, hasParent;

            current = this._handlers[protocol] && this._handlers[protocol].stack;
            parent = this._parent && this._parent.getStack(protocol);
            hasParent = parent && parent.length;

            if (current && hasParent) {
                return current.concat(parent);
            }

            if (hasParent) {
                return parent;
            }

            return current;
        },

        resolve: function resolve(src) {
            var dest, handlers;

            dest = src;

            if (typeof src === 'object' && src !== null) {

                dest = (Array.isArray(src) ? [] : Object.create(Object.getPrototypeOf(src)));
                Object.keys(src).forEach(function (key) {
                    dest[key] = this.resolve(src[key]);
                }, this);

            } else if (typeof src === 'string') {

                handlers = this._handlers;
                Object.keys(handlers).forEach(function (protocol) {
                    var handler = handlers[protocol];

                    if (handler.predicate(src)) {
                        // run through stack and mutate
                        dest = src.slice(protocol.length + 1);
                        this.getStack(protocol).forEach(function (handler) {
                            dest = handler(dest);
                        });
                    }
                }, this);

            }

            return dest;
        }

    };
};