'use strict';


var redisModel = require('../models/redis'),
    _ = require('lodash'),
    q = require('q');


module.exports = function (app) {
    var getOverviewData = function(req, res){
        var dfd = q.defer();
        redisModel.getAllKeys().done(function(keys){
            redisModel.formatKeys(keys).done(function(keyList){
                redisModel.getStatusCounts().done(function(countObject){
                    if(countObject.stuck == 0) keyList = [];
                    else keyList = _.filter(keyList, function(key){ return key.status === "stuck"; })
                    var model = { keys: keyList, counts: countObject, overview: true };
                    dfd.resolve(model);
                });
            });
        });
        return dfd.promise;
    }

    app.get('/', function (req, res) {
        getOverviewData(req, res).done(function(model){
            res.render('index', model);
        });
    });

    app.get('/api/', function (req, res) {
        getOverviewData(req, res).done(function(model){
            res.json(model);
        });
    });
};
