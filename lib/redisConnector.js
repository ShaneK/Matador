var redisAdapter = require('redis'),
    Promise = require('bluebird'),
    updateInfo = require('./updateInfo');

exports.connect = function(settings){
    Promise.promisifyAll(redisAdapter);
    redis = redisAdapter.createClient(settings.port, settings.host, settings.options);
    if(settings.password){
        redis.auth(settings.password);
    }
    redis.on("error", console.log);
    updateInfo.startUpdatingInfo();
};
