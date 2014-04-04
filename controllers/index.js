'use strict';


var redisModel = require('../models/redis');


module.exports = function (app) {
    app.get('/', function (req, res) {
        redisModel.getAllKeys().then(function(keys){
            redisModel.formatKeys(keys).then(function(keyList){
                redisModel.getStatusCounts().then(function(countObject){
                    res.render('index', { keys: keyList, counts: countObject, overview: true });
                });
            });
        });
    });
};
