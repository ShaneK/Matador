'use strict';


var redisModel = require('../models/redis'),
    q = require('q');


module.exports = function (app) {
    var getPendingModel = function(req, res){
        var dfd = q.defer();
        redisModel.getStatus("wait").done(function(active){
            redisModel.getJobsInList(active).done(function(keys){
                redisModel.formatKeys(keys).done(function(formattedKeys){
                    redisModel.getDataForKeys(formattedKeys).done(function(keyList) {
                        redisModel.getStatusCounts().done(function (countObject) {
                            var model = {keys: keyList, counts: countObject, pending: true, type: "Pending"};
                            dfd.resolve(model);
                        });
                    });
                });
            });
        });
        return dfd.promise;
    };

    app.get('/pending', function (req, res) {
        getPendingModel(req, res).done(function(model){
            res.render('jobList', model);
        });
    });

    app.get('/api/pending', function (req, res) {
        getPendingModel(req, res).done(function(model){
            res.json(model);
        });
    });
};
