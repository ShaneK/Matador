'use strict';


var redisModel = require('../models/redis');


module.exports = function (app) {
    app.get('/active', function (req, res) {
        redisModel.getStatus("active").done(function(active){
            redisModel.getJobsInList(active).done(function(keys){
                redisModel.formatKeys(keys).done(function(keyList){
                    redisModel.getStatusCounts().done(function(countObject){
                        var model = { keys: keyList, counts: countObject, active: true, type: "Active" };
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
