'use strict';

var _ = require("lodash"),
    q = require('q');

var getActive = function(){
    var dfd = q.defer();
    redis.lrange("bull:video transcoding:active", 0, -1, function(err, data){
        dfd.resolve(data);
    });
    return dfd.promise;
};

var getCompleted = function(){
    var dfd = q.defer();
    redis.smembers("bull:video transcoding:completed", function(err, data){
        dfd.resolve(data);
    });
    return dfd.promise;
};

var getFailed = function(){
    var dfd = q.defer();
    redis.smembers("bull:video transcoding:failed", function(err, data){
        dfd.resolve(data);
    });
    return dfd.promise;
};

var getAllKeys = function(){
    var dfd = q.defer();
    redis.keys("bull:*:[0-9]*", function(err, keys){
        dfd.resolve(keys);
    });
    return dfd.promise;
};

var getFullKeyNamesFromIds = function(list){
    if(!list) return;
    if(!(list instanceof Array)) return;
    var dfd = q.defer();
    var keys = [];
    for(var i = 0, ii = list.length; i < ii; i++){
        keys.push(["keys", "bull:*:"+list[i]]);
    }

    redis.multi(keys).exec(function(err, arrayOfArrays){
        var results = [];
        for(var i = 0, ii = arrayOfArrays.length; i < ii; i++){
            if(arrayOfArrays[i].length === 1){
                results.push(arrayOfArrays[i][0]);
            }
        }
        dfd.resolve(results);
    });
    return dfd.promise;
}

var getJobsInList = function(list){
    if(!list) return;
    if(!(list instanceof Array)) return;
    var dfd = q.defer();
    var jobs = [];

    getFullKeyNamesFromIds(list).then(function(keys){
       dfd.resolve(keys);
    });
   return dfd.promise;
};

var getStatusCounts = function(){
    var dfd = q.defer();
    getActive().then(function(active){
        getCompleted().then(function(completed){
            getFailed().then(function(failed){
                getAllKeys().then(function(allKeys){
                    var countObject = {
                        active: active.length,
                        complete: completed.length,
                        failed: failed.length,
                        pending: allKeys.length - (active.length+completed.length+failed.length),
                        total: allKeys.length
                    };
                    dfd.resolve(countObject);
                });
            });
        });
    });
    return dfd.promise;
};

var formatKeys = function(keys){
    if(!keys) return;

    var dfd = q.defer();
    getFailed().then(function(failedJobs){
        getCompleted().then(function(completedJobs){
            getActive().then(function(activeJobs){
                var keyList = [];
                for(var i = 0, ii = keys.length; i < ii; i++){
                    var explodedKeys = keys[i].split(":");
                    var status = "pending";
                    if(activeJobs.indexOf(explodedKeys[2]) !== -1) status = "active";
                    else if(completedJobs.indexOf(explodedKeys[2]) !== -1) status = "complete";
                    else if(failedJobs.indexOf(explodedKeys[2]) !== -1) status = "failed";
                    keyList.push({id: explodedKeys[2], type: explodedKeys[1], status: status});
                }
                keyList = _.sortBy(keyList, "id");
                dfd.resolve(keyList);
            });
        });
    });
    return dfd.promise;
};

module.exports.getActive = getActive; //Returns indexes of active jobs
module.exports.getAllKeys = getAllKeys; //Returns all JOB keys in string form (ex: bull:video transcoding:101)
module.exports.formatKeys = formatKeys; //Returns all keys in object form, with status applied to object. Ex: {id: 101, type: "video transcoding", status: "pending"}
module.exports.getCompleted = getCompleted; //Returns indexes of completed jobs
module.exports.getFailed = getFailed; //Returns indexes of failed jobs
module.exports.getStatusCounts = getStatusCounts; //Returns counts for different statuses
module.exports.getJobsInList = getJobsInList; //Returns the job data from a list of job ids
