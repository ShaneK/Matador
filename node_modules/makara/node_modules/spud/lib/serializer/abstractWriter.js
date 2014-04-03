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

var util = require('util');


function AbstractWriter() {
	this._data = null;
}

/*global exports:true*/
exports = module.exports = AbstractWriter;
/*global exports:false*/

var proto = AbstractWriter.prototype;

proto.__defineSetter__('data', function (value) {
	this._data = value;
});

/**
 * Builder method to generate Readable Stream which emits serialized data
 * @return {Stream} a Read Stream
 */
proto.createReadStream = function () {
	var stream = this._doCreateReadStream(this._data);
	process.nextTick(stream.resume.bind(stream));
	return stream;
};

/**
 * Abstract method for implementors to use in defining their Read Strems
 * @param  {Object} data the data to be serialized
 * @return {Stream}      the Read Stream which will emit the serialized data
 */
proto._doCreateReadStream = function (data) {
	throw new Error('Not implemented.');
};