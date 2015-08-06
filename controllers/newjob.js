'use strict';

var q = require('q')


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

};
