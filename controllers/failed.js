'use strict';


var redisModel = require('../models/redis');


module.exports = function (app) {
    app.get('/failed', function (req, res) {
        redisModel.getStatus("failed").done(function(failed){
            redisModel.getJobsInList(failed).done(function(keys){
                redisModel.formatKeys(keys).done(function(keyList){
                    redisModel.getStatusCounts().done(function(countObject){
                        var model = { keys: keyList, counts: countObject, failed: true, type: "Failed"};
                        if(req.xhr){
                            res.json(model);
                        }else{
                            res.render('jobList', model);
                        }
                    });
                });
            });
        });
    });
};
