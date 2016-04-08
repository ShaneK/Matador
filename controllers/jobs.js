'use strict';

var bullModel = require('../models/bull');
var redisModel = require('../models/redis');

module.exports = function (app) {
    app.get('/api/jobs/pending/status/:type', function (req, res) {
        var type = req.param("type");
        redisModel.makePendingByType(type).done(function(results){
            res.json(results);
        });
    });

    app.get('/api/jobs/pending/id/:type/:id', function (req, res) {
        var id = req.param("id"),
            type = req.param("type");
        redisModel.makePendingById(type, id).done(function(results){
            res.json(results);
        });
    });

    app.get('/api/jobs/delete/status/:type', function (req, res) {
        var type = req.param("type");
        redisModel.deleteJobByStatus(type).done(function(results){
            res.json(results);
        });
    });

    app.get('/api/jobs/delete/id/:type/:id', function (req, res) {
        var id = req.param("id"),
            type = req.param("type");
        redisModel.deleteJobById(type, id).done(function(results){
            res.json(results);
        });
    });

    app.get('/api/jobs/info/:type/:id', function(req, res){
        var id = req.param("id"),
            type = req.param("type");
        redisModel.getDataById(type, id).done(function(results){
            res.json(results);
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
            return res.status(400).send(error);
        } else {
            bullModel.createJob(req.app.locals.options.redis, queue, payloadObject)
                    .done(function(){return res.status(200).send('OK');});
        }

    });
};
