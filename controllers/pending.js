'use strict';


var redisModel = require('../models/redis');


module.exports = function (app) {
    app.get('/pending', function (req, res) {
        redisModel.getStatus("wait").done(function(active){
            redisModel.getJobsInList(active).done(function(keys){
                redisModel.formatKeys(keys).done(function(keyList){
                    redisModel.getStatusCounts().done(function(countObject){
                        var model = { keys: keyList, counts: countObject, pending: true, type: "Pending" };
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
