'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        mochacli: {
            options: {
                require: ['should']
            },
            all: [__dirname + '/require.js']
        }
    });

    grunt.loadTasks(__dirname + '/../../tasks');

    grunt.registerTask('default', 'mochacli');
};
