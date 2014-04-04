'use strict';


var redisModel = require('../models/redis');


module.exports = function (app) {
    app.get('/complete', function (req, res) {
        redisModel.getCompleted().then(function(completed){
            redisModel.getJobsInList(completed).then(function(keys){
                redisModel.formatKeys(keys).then(function(keyList){
                    redisModel.getStatusCounts().then(function(countObject){
                        console.log(countObject);
                        res.render('jobList', { keys: keyList, counts: countObject, complete: true, type: "Complete" });
                    });
                });
            });
        });
    });
};
