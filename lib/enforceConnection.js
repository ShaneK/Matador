'use strict';
module.exports = exports = function (options){
  options = options || {};
  return function (req, res, next) {
    if (!redis.connected) {
        if (req.xhr) {
            res.json({success: false, message: "Not connected to redis database."});
        } else {
            res.render(options.errorPages["not-connected"]);
        }
    } else {
        next();
    }
  };
};