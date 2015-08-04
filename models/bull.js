'use strict';

var _ = require("lodash");
var Promise = require('bluebird');
var q = require('q');
var Queue = require('bull');

var createQueue = _.memoize(
  function( queue, port, host, options ){
    return Queue( queue, port, host, options);
  },
  function(queue, port, host, options){
    return queue;
  }
);

var createJob = function createJob(redisOptions, queueName, payload){
  var options = redisOptions.options || {};
  if(redisOptions.password){
    options.auth_pass = redisOptions.password;
  }
  var queue = createQueue(queueName, redisOptions.port, redisOptions.host, options);
  return queue.add(payload);
};

module.exports.createJob = createJob; // Creates a job
