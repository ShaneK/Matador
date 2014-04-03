# grunt-copy-to

Like grunt-contrib-copy but only copies files that are newer and maintains modified times for copied files. Useful for creating build directories that can be later synced using tools that rely on file modified times.

## Getting Started
Install this grunt plugin next to your project's [Gruntfile.js gruntfile][getting_started] with: `npm install grunt-copy-to`

Then add this line to your project's `Gruntfile.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-copy-to');
```

[grunt]: http://gruntjs.com/
[getting_started]: https://github.com/gruntjs/grunt/blob/master/docs/getting_started.md

## Documentation

```javascript
copyto: {
  stuff: {
    files: [
      {cwd: 'stuffdir/', src: ['**/*'], dest: 'build/'}
    ],
    options: {
      processContent: function(content, path) {
          // do something with content or return false to abort copy
          return content;
      },
      // array of ignored paths, can be specific files or a glob
      ignore: [
        'stuffdir/**/*.bak',
        'stuffdir/dontcopyme.txt',
        // ignore both a directory and it's contents (brace expansion)
        'stuffdir/somedir{,/**/*}'
      ]
    }
  }
}
```

## Release History

0.0.10 - bug fixes (@fschell)

0.0.9 - be less verbose by default, display summary; use --verbose for full output

0.0.8 - adds processContent 

0.0.7 - clarification

0.0.5 - code cleanup; readme updates

0.0.3 - Add ignore array

0.0.2 - Tests

0.0.1 - Initial Release

## License
Copyright (c) 2013 Charles Lavery  
Licensed under the MIT license.
