'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        mochacli: {
            all: [__dirname + '/pass.js']
        }
    });

    grunt.loadTasks(__dirname + '/../../tasks');

    grunt.registerTask('default', 'mochacli');
};
