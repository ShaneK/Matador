'use strict';


var redisModel = require('../models/redis');

module.exports = function (app) {
    app.get('/jobs/pending/status/:type', function (req, res) {
        var type = req.param("type");
        redisModel.makePendingByType(type).done(function(results){
            res.json(results);
        });
    });

    app.get('/jobs/pending/id/:type/:id', function (req, res) {
        var id = req.param("id"),
            type = req.param("type");
        redisModel.makePendingById(type, id).done(function(results){
            res.json(results);
        });
    });

    app.get('/jobs/delete/status/:type', function (req, res) {
        var type = req.param("type");
        redisModel.deleteJobByStatus(type).done(function(results){
            res.json(results);
        });
    });

    app.get('/jobs/delete/id/:type/:id', function (req, res) {
        var id = req.param("id"),
            type = req.param("type");
        redisModel.deleteJobById(type, id).done(function(results){
            res.json(results);
        });
    });
};