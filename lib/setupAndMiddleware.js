var config = require('../config'),
    redisAdapter = require('./redisConnector'),
    redisConnectionEnforcer = require('./enforceConnection'),
    express = require('express');

module.exports = function(app){
    //Connect to redis
    redisAdapter.connect(config.redis);
    //Enforce that redis is connected to, will make render an error page if not connected
    app.use(redisConnectionEnforcer);

    //Publicly accessible routes
    app.use('/css/', express.static('public/css'));
    app.use('/fonts/', express.static('public/fonts'));
    app.use('/img/', express.static('public/img'));
    app.use('/js/', express.static('public/js'));

    //Setup routes
    require('../controllers/index')(app);
    require('../controllers/active')(app);
    require('../controllers/complete')(app);
    require('../controllers/failed')(app);
    require('../controllers/jobs')(app);
    require('../controllers/pending')(app);

    //404
    app.use('*', function(req, res){
        res.render(config.errorPages["404"]);
    });
};