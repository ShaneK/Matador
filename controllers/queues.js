'use strict';


var redisModel = require('../models/redis'),
    q = require('q');


module.exports = function (app) {
    var getQueuesModel = function(req, res){
        var dfd = q.defer();
        redisModel.getQueues().done(function(queues){
            redisModel.getStatusCounts().done(function(countObject){
                var model = { keys: queues, counts: countObject, queues: true, type: "Queues" };
                dfd.resolve(model);
            });
        });
        return dfd.promise;
    };

    app.get('/queues', function (req, res) {
        getQueuesModel(req, res).done(function(model){
            res.render('queueList', model);
        });
    });

    app.get('/api/queues', function (req, res) {
        getQueuesModel(req, res).done(function(model){
            res.json(model);
        });
    });
};
