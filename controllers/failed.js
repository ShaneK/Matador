'use strict';


var redisModel = require('../models/redis'),
    q = require('q');


module.exports = function (app) {
    var getFailedData = function(req, res){
        var dfd = q.defer();
        redisModel.getStatus("failed").done(function(failed){
            redisModel.getJobsInList(failed).done(function(keys){
                redisModel.formatKeys(keys).done(function(keyList){
                    redisModel.getStatusCounts().done(function(countObject){
                        var model = { keys: keyList, counts: countObject, failed: true, type: "Failed"};
                        dfd.resolve(model);
                    });
                });
            });
        });
        return dfd.promise;
    }

    app.get('/failed', function (req, res) {
        getFailedData(req, res).done(function(model){
            res.render('jobList', model);
        });
    });

    app.get('/api/failed', function (req, res) {
        getFailedData(req, res).done(function(model){
            res.json(model);
        });
    });
};
