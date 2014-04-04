'use strict';


var redisModel = require('../models/redis');


module.exports = function (app) {
    app.get('/failed', function (req, res) {
        redisModel.getFailed().then(function(failed){
            redisModel.getJobsInList(failed).then(function(keys){
                redisModel.formatKeys(keys).then(function(keyList){
                    redisModel.getStatusCounts().then(function(countObject){
                        console.log(countObject);
                        res.render('jobList', { keys: keyList, counts: countObject, failed: true, type: "Failed"});
                    });
                });
            });
        });
    });
};
