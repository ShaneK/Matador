'use strict';

var bullModel = require('../models/bull');
var redisModel = require('../models/redis');

module.exports = function (app) {
    app.get('/api/jobs/pending/status/:type', function (req, res) {
        var type = req.params['type'];
        redisModel.makePendingByType(type).then(function(results){
            res.json(results);
        });
    });

    app.get('/api/jobs/pending/id/:type/:id', function (req, res) {
        var id = req.params['id'],
            type = req.params['type'];
        redisModel.makePendingById(type, id).then(function(results){
            res.json(results);
        });
    });

    app.get('/api/jobs/delete/status/:type', function (req, res) {
        var type = req.params['type'];
        var queueName = req.params['queueName'] ? req.params['queueName'] : null;
        redisModel.deleteJobByStatus(type, queueName).then(function(results){
            res.json(results);
        });
    });

    app.get('/api/jobs/delete/id/:type/:id', function (req, res) {
        var id = req.params['id'],
            type = req.params['type'];
        redisModel.deleteJobById(type, id).then(function(results){
            res.json(results);
        });
    });

    app.get('/api/jobs/info/:type/:id', function(req, res){
        var id = req.params['id'],
            type = req.params['type'];
        redisModel.getDataById(type, id).then(function(results){
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
              .then(function(){return res.status(200).send('OK');});
        }

    });
};
