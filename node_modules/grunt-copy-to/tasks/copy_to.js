
var _ = require('lodash');

module.exports = function(grunt) {
  'use strict';

  var path = require('path');
  var fs = require('fs');

  grunt.registerMultiTask('copyto', 'Sync files between directories', function() {
    var options = this.options({
      'ignore': []
    });

    var copyOptions = {};
    if(options.processContent) {
      copyOptions.process = options.processContent;
    }

    var dirsCreated = 0;
    var filesCopied = 0;
    var filesUnchanged = 0;

    this.files.forEach(function(pair) {

      pair.src.forEach(function(src) {
        var fullpath = pair.orig.cwd + path.sep + src;
        var stats = fs.statSync(fullpath);
        var mtime = stats.mtime.getTime();
        var dest = pair.dest + src;

        if(grunt.file.isMatch(options.ignore, fullpath)) {
          grunt.verbose.writeln('Ignored ' + src.red);
        } else {
          if(stats.isFile()) {
            if(grunt.file.exists(dest)) {
              var destMtime = fs.statSync(dest).mtime.getTime();

              if(destMtime < mtime) {
                grunt.verbose.writeln('Changed ' + src.green);
                grunt.file.copy(fullpath, pair.dest + src, copyOptions);
                fs.utimesSync(dest, stats.atime, stats.mtime);
                filesCopied++;
              } else {
                grunt.verbose.writeln('Unchanged ' + src.red);
                filesUnchanged++;
              }
            } else {
              grunt.verbose.writeln('New File ' + src.green);
              grunt.file.copy(fullpath, dest, copyOptions);
              fs.utimesSync(dest, stats.mtime, stats.mtime);
              filesCopied++;
            }
          } else if(stats.isDirectory()) {
            if(!grunt.file.exists(dest)) {
              grunt.verbose.writeln('Creating ' + src.cyan);
              grunt.file.mkdir(dest);
              dirsCreated++;
            } else {
              grunt.verbose.writeln('Exists ' + src.red);
            }
          }
        }
      });
    });

    grunt.log.writeln("Copied " + filesCopied.toString().green + " files (" + filesUnchanged.toString().red + " unchanged), created " + dirsCreated.toString().cyan + " folders");
  });
};
