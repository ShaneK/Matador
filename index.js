'use strict';


var kraken = require('kraken-js'),
    app = {},
    redisAdapter = require(process.cwd()+'/lib/redisConnector.js'),
    redisConnectionEnforcer = require(process.cwd()+'/lib/enforceConnection.js');


app.configure = function configure(nconf, next) {
    // Async method run on startup.
    redisAdapter.connect(nconf.get('redis'));
    next(null);
};


app.requestStart = function requestStart(server) {
    // Run before most express middleware has been registered.
};


app.requestBeforeRoute = function requestBeforeRoute(server) {
    server.use(redisConnectionEnforcer());
};


app.requestAfterRoute = function requestAfterRoute(server) {
    // Run after all routes have been added.
};


if (require.main === module) {
    kraken.create(app).listen(function (err, server) {
        if (err) {
            console.error(err.stack);
        }
    });
}


module.exports = app;
