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

var helper = require('../../helpers'),
	Stream = require('stream'),
	AbstractWriter = require('../abstractWriter');

function JsonWriter() {

}

JsonWriter.prototype = {
	/**
	 * The implementation of the Stream that serializes the provided Object into a string
	 * @override
	 * @return {Stream} the Read Stream
	 */
	_doCreateReadStream: function (data) {
		return new ReadStream(data);
	}

};




var ReadStreamImpl = function ReadStream(data) {
	this._data = data;
};

ReadStreamImpl.prototype = {

	pause: function () {
		// noop
	},

	// WriteStream Implementation
	resume: function () {
		try {
			this._nextTickEmit('data', this._serialize(this._data));
			this._nextTickEmit('end');
		} catch (err) {
			this._nextTickEmit('error', err);
		}

		this._nextTickEmit('close');
		this._data = null;
	},

	_serialize: function (data) {
		return JSON.stringify(data, null, 2);
	},

	_nextTickEmit: function () {
		var args = Array.prototype.slice.call(arguments);
		process.nextTick(function () {
			this.emit.apply(this, args);
		}.bind(this));
	}

};


/*global exports:true*/
var ReadStream = helper.inherits(ReadStreamImpl, Stream);
exports = module.exports = helper.inherits(JsonWriter, AbstractWriter);
/*global exports:false*/
