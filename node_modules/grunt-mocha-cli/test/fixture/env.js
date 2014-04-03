'use strict';

var should = require('should');


describe('fixture', function () {
    it('should have environment variable "FOO"', function () {
        should.strictEqual(process.env.FOO, 'bar');
    });
});
