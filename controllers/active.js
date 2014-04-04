'use strict';


var redisModel = require('../models/redis');


module.exports = function (app) {
    app.get('/active', function (req, res) {
        redisModel.getActive().then(function(active){
            redisModel.getJobsInList(active).then(function(keys){
                redisModel.formatKeys(keys).then(function(keyList){
                    redisModel.getStatusCounts().then(function(countObject){
                        console.log(countObject);
                        res.render('jobList', { keys: keyList, counts: countObject, active: true, type: "Active" });
                    });
                });
            });
        });
    });
};
