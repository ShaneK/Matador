'use strict';

var q = require('q')

var bullModel = require('../models/bull');
var redisModel = require('../models/redis');

module.exports = function (app) {

    var getNewJobModel = function(req, res){
        var dfd = q.defer();
        redisModel.getStatusCounts().done(function(countObject){
            var model = { counts: countObject, newjob: true, type: "New Job" };
            dfd.resolve(model);
        });
        return dfd.promise;
    };

    app.get('/newjob', function (req, res) {
        getNewJobModel(req, res).done(function(model){
            res.render('newJob', model);
        });
    });

    app.get('/api/newjob', function (req, res) {
        getNewJobModel(req, res).done(function(model){
            res.json(model);
        });
    });

    app.post('/api/jobs/create', function(req, res){
        var error;
        var payloadObject;
        var payload = req.body.payload;
        var queue = req.body && req.body.queue;
        if (!queue){
            error = 'No queue specified';
        }
        if (!error){
            try {
                payloadObject = JSON.parse(req.body.payload);
            } catch (e) {
                error = 'Invalid JSON';
            }
        }
        if (error) {
            getNewJobModel(req, res).done(function(model){
                model.error = error;
                model.payload = payload;
                model.queue = queue;
                console.log('model:', model);
                return res.render('newJob', model);
            });
        } else {
            bullModel.createJob(queue, payloadObject).done(function(){
                getNewJobModel(req, res).done(function(model){
                    return res.render('newJob', model);
                });
            });
        }

    });
};
