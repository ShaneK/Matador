'use strict';


var redisModel = require('../models/redis'),
    q = require('q');


module.exports = function (app) {
    var getDelayedModel = function(req, res){
        var dfd = q.defer();
        redisModel.getStatus("delayed").done(function(delayed){
            redisModel.getJobsInList(delayed).done(function(keys){
                redisModel.formatKeys(keys).done(function(formattedKeys){
                    redisModel.getDelayTimeForKeys(formattedKeys).done(function(keyList){
                        redisModel.getDataForKeys(keyList).done(function(keyList) {
                            redisModel.getStatusCounts().done(function (countObject) {
                                var model = {keys: keyList, counts: countObject, delayed: true, type: "Delayed"};
                                dfd.resolve(model);
                            });
                        });
                    });
                });
            });
        });
        return dfd.promise;
    };

    app.get('/delayed', function (req, res) {
        getDelayedModel(req, res).done(function(model){
            res.render('jobList', model);
        });
    });

    app.get('/api/delayed', function (req, res) {
        getDelayedModel(req, res).done(function(model){
            res.json(model);
        });
    });
};
