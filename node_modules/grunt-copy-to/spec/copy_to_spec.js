'use strict';

var grunt = require('grunt');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

describe('copy-to', function() {

  beforeEach(function() {
  });

  afterEach(function() {
  });

  var toDir = __dirname + '/tmp';
  var fromDir = __dirname + '/test';
  var existingDir = __dirname + '/existing';

  it('should create the destination folder', function() {
    expect(grunt.file.exists(toDir)).toBe(true);
  });

  it('should maintain file modified times', function() {
    var statsFrom = fs.statSync(path.join(fromDir, 'testing.txt'));
    var statsTo = fs.statSync(path.join(toDir, 'testing.txt'));

    expect(statsFrom.mtime).toEqual(statsTo.mtime);
  });

  it('should maintain file modified times on existing files', function() {
    var statsFrom = fs.statSync(path.join(fromDir, 'testing.txt'));
    var statsTo = fs.statSync(path.join(existingDir, 'testing.txt'));

    expect(statsFrom.mtime).toEqual(statsTo.mtime);
  });

  it('should ignore specified files', function() {
    expect(grunt.file.exists(path.join(toDir, 'dontcopy.txt'))).toBe(false);
    expect(grunt.file.exists(path.join(toDir, 'dir1', 'test.foo'))).toBe(false);
  });

  it('should ignore specified directories', function() {
    expect(grunt.file.exists(path.join(toDir, 'dir2', 'shouldnotbecopies.txt'))).toBe(false);
    expect(grunt.file.exists(path.join(toDir, 'dir2'))).toBe(false);
  });
  it('should process content', function() {
    expect(grunt.file.exists(path.join(toDir, 'testing.txt'))).toBe(true);

    var contents = grunt.file.read(path.join(toDir, 'testing.txt'));
    expect(contents).toMatch(/three/);
    expect(contents).not.toMatch(/two/);
  });
});
