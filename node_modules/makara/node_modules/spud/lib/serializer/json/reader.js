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
	AbstractReader = require('../abstractReader');

function JsonReader() {

}

JsonReader.prototype = {
	/**
	 * Implementation of abstract _doDeserialize builder function.
	 * Deserializes input string into JavaScript object
	 *
	 * @override
	 * @param  {String}   data     the input string to deserialize
	 * @param  {Function} callback the callback invoked with errors or deserialized object
	 */
	_doDeserialize: function(data, callback) {
		try {
			callback(null, JSON.parse(data));
		} catch (err) {
			callback(err);
		}
	}
};


/*global exports:true*/
exports = module.exports = helper.inherits(JsonReader, AbstractReader);
/*global exports:false*/