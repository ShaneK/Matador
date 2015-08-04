'use strict';

var _ = require("lodash");
var Promise = require('bluebird');
var q = require('q');
var Queue = require('bull');
var config = require('../config');

var createJob = function(queue, payload){
    return Queue( queue, config.redis.port, config.redis.host).add(payload);
};


module.exports.createJob = createJob; // Creates a job

