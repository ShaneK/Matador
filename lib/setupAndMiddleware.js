var redisAdapter = require('./redisConnector'),
    express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');

module.exports = function(app, options){
    options = options || {};
    options.errorPages = options.errorPages || {};
    options.errorPages['not-connected'] = options.errorPages['not-connected'] || 'errors/not-connected';
    options.errorPages['404'] = options.errorPages['404'] || 'errors/404'

    app.locals.options = options;

    if (!options.redis){
        throw new Error('No redis configuration options passed to matador');
    }

    app.use(morgan('dev'));

    //Connect to redis
    redisAdapter.connect(options.redis);
    var redisConnectionEnforcer = require('./enforceConnection')(options);

    //Enforce that redis is connected to, will make render an error page if not connected
    app.use(redisConnectionEnforcer);

    app.use(bodyParser.urlencoded({extended: true}));

    //Publicly accessible routes
    app.use('/css/', express.static(__dirname + '/../public/css'));
    app.use('/fonts/', express.static(__dirname + '/../public/fonts'));
    app.use('/img/', express.static(__dirname + '/../public/img'));
    app.use('/js/', express.static(__dirname + '/../public/js'));

    //Setup routes
    require('../controllers/index')(app);
    require('../controllers/active')(app);
    require('../controllers/complete')(app);
    require('../controllers/failed')(app);
    require('../controllers/jobs')(app);
    require('../controllers/pending')(app);
    require('../controllers/delayed')(app);
    require('../controllers/queues')(app);
    require('../controllers/newjob')(app);

    //404
    app.get('*', function(req, res){
        res.render(options.errorPages["404"]);
    });
};
