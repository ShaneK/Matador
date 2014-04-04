var redisAdapter = require('redis');

exports.connect = function(settings){
    redis = redisAdapter.createClient(settings.port, settings.host);
    redis.on("error", console.log);
};