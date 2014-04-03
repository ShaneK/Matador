var path = require('path');

module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    watch: {
      files: ['Gruntfile.js', 'tasks/**/*.js', 'spec/**/*.js'],
      tasks: 'default'
    },
    jshint: {
      files: ['grunt.js', 'tasks/**/*.js', 'spec/**/*.js'],
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        es5: true,
        globals: {
          // jasmine globals
          describe: false,
          jasmine: false,
          it: false,
          xit: false,
          expect: false,
          beforeEach: false,
          afterEach: false
        }
      },
    },
    exec: {
      jasmine: {
        cmd: 'node_modules' + path.sep + '.bin' + path.sep + 'jasmine-node spec'
      }
    },
    copyto: {
      test: {
        files: [
          {cwd: 'spec/test', src: ['**/*'], dest: 'spec/tmp/'}
        ],
        options: {
          processContent: function(content, path) {
            if(path.match(/testing\.txt/)) {
              return content.replace(/two/, "three");
            }
          },
          ignore: [
            'spec/test/dontcopy.txt',
            'spec/test/dir2{,/**/*}',
            'spec/test/**/*.foo'
          ]
        }
      },
      test2: {
        files: [
          {cwd: 'spec/test', src: ['**/*'], dest: 'spec/existing/'}
        ],
        options: {
          ignore: [
            'spec/test/dontcopy.txt',
            'spec/test/dir2{,/**/*}',
            'spec/test/**/*.foo'
          ]
        }
      }
    },
    clean: {
      test: ['spec/tmp', 'spec/existing']
    }
  });
  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-exec');

  // Default task.
  grunt.registerTask('default', ['jshint', 'clean', 'copyto', 'exec:jasmine']);

};
