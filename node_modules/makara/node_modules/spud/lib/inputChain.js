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

var SerializerFactory = require('./serializer/serializerFactory'),
	Stream = require('stream'),
	util = require('util'),
	fs = require('fs');


// Abstract Base class for each link in the chain - Chain of Responsibility Pattern
var Link = function (next) {
	this._next = next;
};

Link.prototype = {

	_canHandle: function (source) {
		return false;
	},

	_doExecute: function(source, sourceType, callback) {
		callback(new Error('not implemented'));
	},

	execute: function (source, sourceType, callback) {
		if (this._canHandle(source)) {
			this._doExecute(source, sourceType, callback);
		} else if (this._next) {
			this._next.execute(source, sourceType, callback);
		} else {
			throw new Error('Unrecognized input format.');
		}
	}

};




var BufferSource = function () {
	BufferSource.super_.apply(this, arguments);
};

util.inherits(BufferSource, Link);

BufferSource.prototype._canHandle = function (source) {
	return Buffer.isBuffer(source);
};

BufferSource.prototype._doExecute = function (source, sourceType, callback) {
	var deserializer = SerializerFactory.buildDeserializer(sourceType);
	deserializer.write(source);
	deserializer.end();
	deserializer.deserialize(callback);
};




var StreamSource = function () {
	StreamSource.super_.apply(this, arguments);
};

util.inherits(StreamSource, Link);

StreamSource.prototype._canHandle = function (source) {
	return source instanceof Stream;
};

StreamSource.prototype._doExecute = function (source, sourceType, callback) {
	var deserializer = SerializerFactory.buildDeserializer(sourceType);

    source.on('error', callback);
    source.on('close', function () {
        deserializer.deserialize(callback);
    });

    source.pipe(deserializer);
};




var FileSource = function () {
	FileSource.super_.apply(this, arguments);
};

util.inherits(FileSource, StreamSource);

FileSource.prototype._canHandle = function (source) {
	return typeof source === 'string';
};

FileSource.prototype._doExecute = function (source, sourceType, callback) {
	fs.exists(source, function (exists) {
		if (!exists) {
			callback(new Error('Source file not found: ' + source));
			return;
		}
		FileSource.super_.prototype._doExecute.apply(this, [fs.createReadStream(source), sourceType, callback]);
	});
};




/*global exports:true*/

// Build chain
exports = module.exports = new BufferSource(new StreamSource(new FileSource()));

/*global exports:false*/