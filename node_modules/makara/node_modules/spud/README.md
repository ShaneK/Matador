Spud
---------------------------
Convert content bundles to and from different formats, including .properties, .json, etc.

API
---------------------------

#### spud.registerSerializer(name, serializer)
Register a custom serializer. See the "Plugins" section below for more information on custom serializers
```javascript
var mySerializer = require('node-mySerializer');
require('spud').registerSerializer('mySerializer', mySerializer);
```


#### spud.convert(source, sourceType, targetType, [writeStream], [callback])
Deserializes the source (file, buffer, or Read Stream) of type sourceType and serializes to targetType,
writing the results to the optional writeStream, or providing them to the optional callback. The callback
should have the signature `function (err, data);`
```javascript
var spud = require('spud'),
	fs = require('fs'),
	readStream = fs.createReadStream('./config.json'),
	writeStream = fs.createWriteStream('./config.properties');

spud.convert(readStream, 'json', 'properties', writeStream, function (err) {
	console.log('Conversion complete.');
});
```


#### spud.deserialize(source, sourceType, callback)
Deserializes the source (file, buffer, or Read Stream) of type sourceType and invokes the provided callback
with the result or any error that occurred. The callback should have the signature `function (err, data);`
```javascript
var spud = require('spud'),
	fs = require('fs'),
	readStream = fs.createReadStream('./config.json');

spud.deserialize(readStream, 'json', function (err, data) {
	console.log(err || data);
	console.log('Conversion complete.');
});
```


#### spud.serialize(source, targetType, [writeStream], [callback])
Serializes the source (String) to targetType and invokes the provided callback with the result
or any error that occurred. The callback should have the signature `function (err, data);`
```javascript
var spud = require('spud'),
	fs = require('fs'),
	writeStream = fs.createWriteStream('./config.json');

var settings = {
	host: "www.paypal.com",
	port: 8080
};

spud.serialize(settings, 'json', writeStream, function (err) {
	console.log('Conversion complete.');
});
```


Plugins
---------------------------
Writing serializers is easy. It's just 3 steps:

1) Make sure your module exports an object with a property called 'Reader' and one called 'Writer' whose values
are the constructors for your deserializer and serialzer, respectively:

```javascript
// index.js
module.exports = {
	Reader: MyReader,
	Writer: MyWriter
};
```

2) Build out your deserializer implementation. It merely needs to implement a method called _doDeserialize that
accepts data (in the form of a string) and callback arguments, and invokes the callback with error and deserialized data.

```javascript
function MyReader() {

}

MyReader.prototype = {
	_doDeserialize: function(input, callback) {
		// TODO: Implement
		var data = null;
		// ...
		callback(null, data);
	};
};
```

3) Build out your serializer implementation and a Read Stream for outputting the serialized data. 

``` javascript
function MyWriter() {

}

MyWriter.prototype = {
	_doCreateReadStream: function (data) {
		return new CustomReadStream(data);
	}
};
```

The stream must accept a data object in its constructor and implement the [NodeJS Read Stream interface]
(http://nodejs.org/api/stream.html#stream_readable_stream). It is likely that this where your serialization
implementation will go. When chunks of data are availble/serialized, write them out using the 'data' event.

```javascript
var util = require('util');

function CustomReadStream(data) {
	Stream.call(this);
	this._data = data;
}
util.inherits(ReadStream, Stream);

MyStream.prototype.pause = function () {
	// noop	
};

MyStream.prototype.drain = function () {
	// noop
};

MyStream.prototype.resume = function () {
	var serialized = null;
	// TODO: Serialize this._data
	this.emit('data', serialized);
};
```
