var redisAdapter = require('redis'),
    updateInfo = require(process.cwd()+'/lib/updateInfo.js');

exports.connect = function(settings){
    redis = redisAdapter.createClient(settings.port, settings.host);
    redis.on("error", console.log);
    updateInfo.startUpdatingInfo();
};