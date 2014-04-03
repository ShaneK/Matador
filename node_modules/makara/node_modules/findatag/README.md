findatag
==========

String tokenizer configured to recognize a particular pattern: `{@[A-Za-z._] [attrs...]/}`.


### API

#### createParseStream(entityHandler)
This factory method creates a ParseStream initialized with the provided entity handler.
```javascript
var finder = require('findatag');

var stream = finder.createParseStream(handler);
fs.createReadStream('./file/to/process').pipe(stream).pipe(process.stdout);
```


#### parse(file, entityHandler, callback)
Reads the file at the given file path and parses it, passing entity information to the provided entity handler.
```javascript
var finder = require('findatag');

finder.process('./file/to/process', handler, function (err, result) {
    // result is the full processed file
});
```


### Entity Handler
The parser needs to be provided with an entity handler that provides the implementation for what to be done
when the parse encounters a particular entity: tag or text.

#### tags
Getter exposing an array of strings or a comma-delimited string containing the names of tags recognized by this handler.


#### onTag(definition, callback)
The method invoked when any given tag is enountered. The tag definition is has the structure:
```javascript
{
    name: 'tagname',
    attributes: {
        'attributeName': 'attributeValue'
    }
}
```

The callback has the signature `function (err, result)` and should be invoked with the string with which to replace the
original tag.

```javascript
// ...

onTag: function (def, cb) {
    cb(null, def.name.toUpperCase());
}

//...
```

#### onText(chunk, callback) [optional]
This optional delegate method can perform operations on the provide text chunk. The callback has the signature
`function (err, result)` and should be invoked with the string with which to replace the original text.



### Example
```javascript
var finder = require('findatag');

var entityHandler = {
    _handlers: {
       'pre': { ... },
       'foo': { ... }
    },

    get tags () {
        return Object.keys(this._handlers);
    },

    onTag: function (def, cb) {
        this._handlers[def.name].exec(def, cb);
    },

    onText: function (chunk, cb) {
        cb(null, chunk.toUpperCase();
    }
}

```
