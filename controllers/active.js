'use strict';


var redisModel = require('../models/redis');


module.exports = function (app) {
    app.get('/active', function (req, res) {
        redisModel.getStatus("active").done(function(active){
            redisModel.getJobsInList(active).done(function(keys){
                redisModel.formatKeys(keys).done(function(keyList){
                    redisModel.getStatusCounts().done(function(countObject){
                        res.render('jobList', { keys: keyList, counts: countObject, active: true, type: "Active" });
                    });
                });
            });
        });
    });
};
