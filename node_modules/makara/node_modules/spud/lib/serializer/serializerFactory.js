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

/*global exports:true*/

'use strict';

exports = module.exports = {

	_cache: {},

	_getLibForType: function (type) {
		var clazz = this._cache[type];
		if (!clazz) {
			clazz = this._cache[type] = require('./' + type);
		}
		return clazz;
	},

	buildDeserializer: function (type) {
		var Clazz = this._getLibForType(type).Reader;
		return new Clazz();
	},

	buildSerializer: function (type) {
		var Clazz = this._getLibForType(type).Writer;
		return new Clazz();
	},

	register: function (type, serializer) {
		var previous = this._cache[type];
		this._cache[type] = serializer;
		return previous;
	}

};