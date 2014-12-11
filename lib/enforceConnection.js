'use strict';
var config = require('../config');
module.exports = function (req, res, next) {
    if (!redis.connected) {
        if (req.xhr) {
            res.json({success: false, message: "Not connected to redis database."});
        } else {
            res.render(config.errorPages["not-connected"]);
        }
    } else {
        next();
    }
};