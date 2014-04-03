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

var os = require('os'),
	helper = require('../../helpers'),
	Stream = require('stream'),
	AbstractWriter = require('../abstractWriter'),
	ReadStream = null;

function PropertyWriter() {

}


PropertyWriter.prototype = {
	_doCreateReadStream: function(data) {
		return new ReadStream(data);
	}
};



function ReadStreamImpl(data) {
	this._data = data;
	this._processed = false;
	this._buffer = [];
	this._remaining = 0;
	this._paused = true;
}

ReadStreamImpl.prototype = {

	pause: function () {
		this._paused = true;
	},

	drain: function () {
		this.resume();
	},

	resume: function () {
		this._paused = false;

		// Start writing to stream
		if (this._data && !this._processed) {
			this._read(null, this._data);
			this._remaining = this._buffer.length;
			this._processed = true;
		}

		// Work through buffer to process
		if (this._buffer.length) {

			this._buffer.splice(0).forEach(function (entry) {
				process.nextTick(function () {
					if (this._paused) {
						this._buffer.push(entry);
					} else {
						this.emit('data', entry);
						this._remaining -= 1;
						if (!this._remaining) {
							this.emit('end');
							this.emit('close');
							this._data = null;
						}
					}
				}.bind(this));
			}.bind(this));

		} else {

			// All done, no buffered entries
			this.emit('end');
			this.emit('close');
			this._data = null;
		}

	},

	destroy: function () {
		this._buffer = null;
		this._data = null;
		this.emit('close');
	},

	_read: function (namespace, data) {

		// TODO: Some more work in this direction to make it
		// super fast, if necessary.
		//process.nextTick(function () {

			switch (typeof data) {
				case 'object':
					if (Array.isArray(data)) {
						data.forEach(function (item) {
							this._read(namespace, item);
						}.bind(this));
					} else {
						Object.keys(data).forEach(function (key) {
							var name = namespace ? namespace + '.' + key : key;
							this._read(name, data[key]);
						}.bind(this));
					}
					break;

				case 'number':
					this._read(namespace, Number.isFinite(data) ? String(data) : '');
					break;

				case 'boolean':
					this._read(namespace, String(data));
					break;

				case 'null':
					this._read(namespace, String(data));
					break;

				case 'string':
					var value = [namespace, '=', data, os.EOL].join('');
					if (this._paused) {
						this._buffer.push(value);
					} else {
						this.emit('data', value);
					}
					break;

				default:
					console.warn('Unserializable value:', data);
			}

		//}.bind(this));
	}
};

/*global exports:true*/
ReadStream = helper.inherits(ReadStreamImpl, Stream);
exports = module.exports = helper.inherits(PropertyWriter, AbstractWriter);
/*global exports:false*/