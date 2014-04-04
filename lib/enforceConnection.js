'use strict';

module.exports = function () {
    return function (req, res, next) {
        if(!redis.connected){
            res.render('errors/not-connected');
        }else{
            next();
        }
    };
};