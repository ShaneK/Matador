'use strict';

module.exports = function () {
    return function (req, res, next) {
        if(!redis.connected){
            if(req.xhr){
                res.json({success: false, message: "Not connected to redis database."});
            }else{
                res.render('errors/not-connected');
            }
        }else{
            next();
        }
    };
};