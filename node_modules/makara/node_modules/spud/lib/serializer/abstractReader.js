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

var util = require('util'),
	WriteStream = require('../writeStream');


function AbstractReader() {
	AbstractReader.super_.call(this);
}

/*global exports:true*/
exports = module.exports = AbstractReader;
util.inherits(AbstractReader, WriteStream);
/*global exports:false*/

var proto = AbstractReader.prototype;

proto.__defineSetter__('data', function (value) {
	this._data = value;
});

/**
 * Public API for invoking serialization on steramed in data
 * @param  {Function} callback the callback to invoke with the err or deserialized data details
 */
proto.deserialize = function (callback) {
	this._doDeserialize(this._data.toString('utf8'), callback);
};

/**
 * Abstract method to be overridden by implementing classes
 * @param  {String}   data     the string data to deserialize
 * @param  {Function} callback the callback to invoke with error or deserialized data
 */
proto._doDeserialize = function (data, callback) {
	throw new Error('Not implemented');
};
