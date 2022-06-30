'use strict';

var _ = require("lodash");
var Promise = require('bluebird');
var q = require('q');
var Queue = require('bull');

var createQueue = _.memoize(
  function( queue, port, host, password, options ){
    return Queue( queue, { redis: { port: port, host: host, password: password, opts: options } });
  },
  function(queue, port, host, options){
    return queue;
  }
);

var createJob = function createJob(redisOptions, queueName, payload){
  var queue = createQueue(queueName, redisOptions.port, redisOptions.host, redisOptions.password, redisOptions.options || {});
  return queue.add(payload);
};

module.exports.createJob = createJob; // Creates a job
