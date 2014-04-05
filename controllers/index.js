'use strict';


var redisModel = require('../models/redis');


module.exports = function (app) {
    app.get('/', function (req, res) {
        redisModel.getAllKeys().then(function(keys){
            redisModel.formatKeys(keys).then(function(keyList){
                redisModel.getStatusCounts().then(function(countObject){
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
