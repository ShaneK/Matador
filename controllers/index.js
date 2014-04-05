'use strict';


var redisModel = require('../models/redis'),
    _ = require('lodash');


module.exports = function (app) {
    app.get('/', function (req, res) {
        redisModel.getAllKeys().done(function(keys){
            redisModel.formatKeys(keys).done(function(keyList){
                redisModel.getStatusCounts().done(function(countObject){
                    if(countObject.stuck == 0) keyList = [];
                    else keyList = _.filter(keyList, function(key){ return key.status === "stuck"; })
                    var model = { keys: keyList, counts: countObject, overview: true };
                    if(req.xhr){
                        res.json(model);
                    }else{
                        res.render('index', model);
                    }
                });
            });
        });
    });
};
