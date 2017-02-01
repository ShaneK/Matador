'use strict';


var redisModel = require('../models/redis'),
		moment = require('moment'),
    q = require('q');


module.exports = function (app) {
    var getDelayedModel = function(req, res){
        var dfd = q.defer();
        redisModel.getStatus("delayed").done(function(delayed){
            redisModel.getJobsInList(delayed).done(function(keys){
                redisModel.formatKeys(keys).done(function(formattedKeys){
                    redisModel.getDelayTimeForKeys(formattedKeys).done(function(keyList){
                        redisModel.getStatusCounts().done(function(countObject){
													keyList = keyList.map(function (key) {
														var numSecondsUntil = moment(new Date(key.delayUntil)).diff(moment(), 'seconds');
														var formattedDelayUntil = 'in ' + numSecondsUntil + ' seconds';
														if (numSecondsUntil === 1) {
															formattedDelayUntil = 'in ' + numSecondsUntil + ' second';
														}
														else if (numSecondsUntil > 60) {
															formattedDelayUntil = moment(new Date(key.delayUntil)).fromNow();
														}

														key.delayUntil = formattedDelayUntil;
														return key;

													});
                            var model = { keys: keyList, counts: countObject, delayed: true, type: "Delayed" };
                            dfd.resolve(model);
                        });
                    });
                });
            });
        });
        return dfd.promise;
    };

    app.get('/delayed', function (req, res) {
        getDelayedModel(req, res).done(function(model){
            res.render('jobList', model);
        });
    });

    app.get('/api/delayed', function (req, res) {
        getDelayedModel(req, res).done(function(model){
            res.json(model);
        });
    });
};
