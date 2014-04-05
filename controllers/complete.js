'use strict';


var redisModel = require('../models/redis');


module.exports = function (app) {
    app.get('/complete', function (req, res) {
        redisModel.getStatus("complete").done(function(completed){
            redisModel.getJobsInList(completed).done(function(keys){
                redisModel.formatKeys(keys).done(function(keyList){
                    redisModel.getStatusCounts().done(function(countObject){
                        var model = { keys: keyList, counts: countObject, complete: true, type: "Complete" };
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
