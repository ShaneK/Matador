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
	Stream = require('stream');

var WriteStream = function (stream) {
	WriteStream.super_.call(this);
	this._wrapped = stream;
	this._data = null;
	this._chunks = [];
	this._chunkLength = 0;
};

util.inherits(WriteStream, Stream);

WriteStream.prototype.__defineGetter__('data', function () {
	return this._data;
});

WriteStream.prototype.write = function (chunk) {
	if (typeof chunk === 'string') {
		chunk = new Buffer(chunk);
	}

	this._chunks.push(chunk);
	this._chunkLength += chunk.length;

	return this._proxy('write', arguments) || true;
};

WriteStream.prototype.end = function () {
	this._data = Buffer.concat(this._chunks, this._chunkLength);
	this._proxy('end', arguments);
};

WriteStream.prototype.destroy = function () {
	this._proxy('destroy', arguments);
};

WriteStream.prototype.destroySoon = function () {
	this._proxy('destroySoon', arguments);
};

WriteStream.prototype._proxy = function(method, args) {
	var stream = this._wrapped;
	if (stream) {
		return stream[method].apply(stream, args);
	}
};

/*global exports:true*/
exports = module.exports = WriteStream;
/*global exports:false*/