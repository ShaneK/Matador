'use strict';


var redisModel = require('../models/redis');


module.exports = function (app) {
    app.get('/pending', function (req, res) {
        //Sorry, but this is gonna be really ugly.
        redisModel.getAllKeys().then(function(allKeys){
            redisModel.getCompleted().then(function(completed){
                redisModel.getActive().then(function(active){
                    redisModel.getFailed().then(function(failed){
                        var pendingJobs = [];
                        for(var i = 0, ii = allKeys.length; i < ii; i++){
                            var id = allKeys[i].split(":")[2];
                            if(completed.indexOf(id) === -1 && active.indexOf(id) === -1 && failed.indexOf(id) === -1){
                                pendingJobs.push(allKeys[i]);
                            }
                        }
                        redisModel.formatKeys(pendingJobs).then(function(keyList){
                            redisModel.getStatusCounts().then(function(countObject){
                                console.log(countObject);
                                res.render('jobList', { keys: keyList, counts: countObject, pending: true, type: "Pending" });
                            });
                        });
                    });
                });
            });
        });
    });
};
