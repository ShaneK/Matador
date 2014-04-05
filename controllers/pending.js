'use strict';


var redisModel = require('../models/redis');


module.exports = function (app) {
    app.get('/pending', function (req, res) {
        //Sorry, but this is gonna be really ugly.
        redisModel.getStatus("wait").done(function(active){
            redisModel.getJobsInList(active).done(function(keys){
                redisModel.formatKeys(keys).done(function(keyList){
                    redisModel.getStatusCounts().done(function(countObject){
                        res.render('jobList', { keys: keyList, counts: countObject, pending: true, type: "Pending" });
                    });
                });
            });
        });
    });
};
