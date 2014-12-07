var q = require('q');

var memoryKey = "matador:memory";
var peakMemoryUsage = "";
var peakMemoryUsageHuman = "";

var clearOldData = function(){
    //Deletes any memory usage data older than 15 minutes (or, if you changed the update interval, (updateInterval*30)/60 minutes
    var maximumAmountOfKeys = 20;
    redis.hgetall(memoryKey, function(err, data){
        var keys = Object.keys(data);
        if(keys.length > maximumAmountOfKeys){
            var difference = keys.length - maximumAmountOfKeys;
            var multi = [];
            for(var i = 0; i < difference; i++){
                multi.push(["hdel", memoryKey, keys[i]]);
            }
            redis.multi(multi).exec();
        }
    });
}

var updateInfo = function(){
    var dfd = q.defer();
    redis.info(function(err, data){
        var now = new Date().getTime();
        data = data.split("\r\n");
        var usedMemoryBytes = "",
            usedMemoryHuman = "";
        for(var i = 0, ii = data.length; i < ii; i++){
            var infoString = data[i];
            if(infoString.indexOf("used_memory:") === 0){
                usedMemoryBytes = infoString.split(":")[1];
            }else if(infoString.indexOf("used_memory_human:") === 0){
                usedMemoryHuman = infoString.split(":")[1];
            }else if(infoString.indexOf("used_memory_peak:") === 0){
                peakMemoryUsage = infoString.split(":")[1];
            }else if(infoString.indexOf("used_memory_peak_human") === 0){
                peakMemoryUsageHuman = infoString.split(":")[1];
            }
        }
        redis.hset(memoryKey, now, usedMemoryBytes+":"+usedMemoryHuman, function(err, data){
            clearOldData();
        });
        dfd.resolve();
    });
    return dfd.promise;
};

exports.startUpdatingInfo = function(){
    redis.del(memoryKey); //Clears old data when the app starts
    var updateInterval = 60; //In seconds
    updateInfo().done(function(){
        setInterval(function(){
            updateInfo();
        }, updateInterval*1000)
    });
};

exports.getMemoryUsage = function(){
    var dfd = q.defer();
    redis.hgetall(memoryKey, function(err, data){
        dfd.resolve({peak: {bytes: peakMemoryUsage, human: peakMemoryUsageHuman}, usage: data});
    });
    return dfd.promise;
};