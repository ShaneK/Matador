'use strict';

var _ = require("lodash"),
    Promise = require('bluebird'),
    q = require('q');

var getActiveKeys = function(queueName){
    var dfd = q.defer();
    queueName = queueName ? queueName : '*';
    redis.keys("bull:" + queueName + ":active", function(err, keys){
        dfd.resolve(keys);
    });
    return dfd.promise;
};

var getCompletedKeys = function(queueName){
    var dfd = q.defer();
    queueName = queueName ? queueName : '*';
    redis.keys("bull:" + queueName + ":completed", function(err, keys){
        dfd.resolve(keys);
    });
    return dfd.promise;
};

var getFailedKeys = function(queueName){
    var dfd = q.defer();
    queueName = queueName ? queueName : '*';
    redis.keys("bull:" + queueName + ":failed", function(err, keys){
        dfd.resolve(keys);
    });
    return dfd.promise;
};

var getWaitingKeys = function(queueName){
    var dfd = q.defer();
    queueName = queueName ? queueName : '*';
    redis.keys("bull:" + queueName + ":wait", function(err, keys){
        dfd.resolve(keys);
    });
    return dfd.promise;
};

var getDelayedKeys = function(queueName){
    var dfd = q.defer();
    queueName = queueName ? queueName : '*';
    redis.keys("bull:" + queueName + ":delayed", function(err, keys){
        dfd.resolve(keys);
    });
    return dfd.promise;
};

var getStuckKeys = function(){
    var dfd = q.defer();
    //TODO: Find better way to do this. Being lazy at the moment.
    getAllKeys().done(function(keys){
        formatKeys(keys).done(function(keyList){
            keyList = _.filter(keyList, function(key){ return key.status === "stuck"; });
            var results = {};
            var count = 0;
            for(var i = 0, ii = keyList.length; i < ii; i++){
                if(!results[keyList[i].type]) results[keyList[i].type] = [];
                results[keyList[i].type].push(keyList[i].id);
                count++;
            }
            dfd.resolve({keys: results, count: count});
        });
    });
    return dfd.promise;
};

var getStatus = function(status, queueName){
    var dfd = q.defer();
    var getStatusKeysFunction = null;
    if(status === "complete"){
        getStatusKeysFunction = getCompletedKeys;
    }else if(status === "active"){
        getStatusKeysFunction = getActiveKeys;
    }else if(status === "failed"){
        getStatusKeysFunction = getFailedKeys;
    }else if(status === "wait"){
        getStatusKeysFunction = getWaitingKeys;
    }else if(status === "delayed"){
        getStatusKeysFunction = getDelayedKeys;
    }else if(status === "stuck"){
        return getStuckKeys();
    }else{
        console.log("UNSUPPORTED STATUS:", status);
        return;
    }

    getStatusKeysFunction(queueName).done(function(keys){
        var multi = [];
        var statusKeys = [];
        for(var i = 0, ii = keys.length; i < ii; i++){
             var arr = keys[i].split(":");
            var queueName = arr.slice(1, arr.length - 1);
            var queue = queueName.join(":");
            statusKeys[queue] = []; // This creates an array/object thing with keys of the job type
            if(status === "active" || status === "wait"){
                multi.push(['lrange', keys[i], 0, -1]);
            }else if(status === "delayed" || status === "complete" || status === "failed"){
                multi.push(["zrange", keys[i], 0, -1]);
            }else{
                multi.push(["smembers", keys[i]]);
            }
        }
        redis.multi(multi).exec(function(err, data){
            var statusKeyKeys = Object.keys(statusKeys); // Get the keys from the object we created earlier...
            var count = 0;
            for(var k = 0, kk = data.length; k < kk; k++){
                statusKeys[statusKeyKeys[k]] = data[k];
                count += data[k].length;
            }
            dfd.resolve({keys: statusKeys, count: count});
        });
    });
    return dfd.promise;
};

var getAllKeys = function(){
    var dfd = q.defer();
    redis.keys("bull:*:[0-9]*", function(err, keysWithLocks){
        var keys = [];
        for(var i = 0, ii = keysWithLocks.length; i < ii; i++){
            var keyWithLock = keysWithLocks[i];
            if(keyWithLock.substring(keyWithLock.length-5, keyWithLock.length) !== ":lock"){
                keys.push(keyWithLock);
            }
        }
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
    var dfd = q.defer();
    var jobs = [];
    if(list["keys"]){
        //New list type
        var keys = list["keys"];
        var objectKeys = Object.keys(keys);
        var fullNames = [];
        for(var i = 0, ii = objectKeys.length; i < ii; i++){
            for(var k = 0, kk = keys[objectKeys[i]].length; k < kk; k++){
                fullNames.push("bull:"+objectKeys[i]+":"+keys[objectKeys[i]][k]);
            }
        }
        dfd.resolve(fullNames);
    }else{
        //Old list type
        getFullKeyNamesFromIds(list).done(function(keys){
           dfd.resolve(keys);
        });
    }
   return dfd.promise;
};

var getStatusCounts = function(){
    var dfd = q.defer();
    getStatus("active").done(function(active){
        getStatus("complete").done(function(completed){
            getStatus("failed").done(function(failed){
                getStatus("wait").done(function(pendingKeys){
                    getStatus("delayed").done(function(delayedKeys){
                        getAllKeys().done(function(allKeys){
                          redis.keys("bull:*:id", function (err, keys) {
                            var countObject = {
                                active: active.count,
                                complete: completed.count,
                                failed: failed.count,
                                pending: pendingKeys.count,
                                delayed: delayedKeys.count,
                                total: allKeys.length,
                                stuck: allKeys.length - (active.count+completed.count+failed.count+pendingKeys.count+delayedKeys.count),
                                queues: keys.length
                            };
                           dfd.resolve(countObject);
                          });
                        });
                    });
                });
            });
        });
    });
    return dfd.promise;
};

var formatKeys = function(keys){
    if(!keys) return;
    var dfd = q.defer();
    getStatus("failed").done(function(failedJobs){
        getStatus("complete").done(function(completedJobs){
            getStatus("active").done(function(activeJobs){
                getStatus("wait").done(function(pendingJobs){
                    getStatus("delayed").done(function(delayedJobs){
                        var keyList = [];
                        for(var i = 0, ii = keys.length; i < ii; i++){
                            var arr = keys[i].split(":");
                            var queueName = arr.slice(1, arr.length - 1);
                            var queue = queueName.join(":");
                            var explodedKeys = {};
                            explodedKeys[0] = arr[0];
                            explodedKeys[1] = queue;
                            explodedKeys[2] = arr[arr.length-1];
                            var status = "stuck";
                            if(activeJobs.keys[explodedKeys[1]] && activeJobs.keys[explodedKeys[1]].indexOf(explodedKeys[2]) !== -1) status = "active";
                            else if(completedJobs.keys[explodedKeys[1]] && completedJobs.keys[explodedKeys[1]].indexOf(explodedKeys[2]) !== -1) status = "complete";
                            else if(failedJobs.keys[explodedKeys[1]] && failedJobs.keys[explodedKeys[1]].indexOf(explodedKeys[2]) !== -1) status = "failed";
                            else if(pendingJobs.keys[explodedKeys[1]] && pendingJobs.keys[explodedKeys[1]].indexOf(explodedKeys[2]) !== -1) status = "pending";
                            else if(delayedJobs.keys[explodedKeys[1]] && delayedJobs.keys[explodedKeys[1]].indexOf(explodedKeys[2]) !== -1) status = "delayed";
                            keyList.push({id: explodedKeys[2], type: explodedKeys[1], status: status});
                        }

                        keyList = _.sortBy(keyList, function(key){return parseInt(key.id);});
                        dfd.resolve(keyList);
                    });
                });
            });
        });
    });
    return dfd.promise;
};

var removeJobs = function(list){
    if(!list) return;
    //Expects {id: 123, type: "video transcoding"}

    var multi = [];
    for(var i = 0, ii = list.length; i < ii; i++){
        var firstPartOfKey = "bull:"+list[i].type+":";
        multi.push(["del", firstPartOfKey+list[i].id]);
        multi.push(["lrem", firstPartOfKey+"active", 0, list[i].id]);
        multi.push(["lrem", firstPartOfKey+"wait", 0, list[i].id]);
        multi.push(["srem", firstPartOfKey+"completed", list[i].id]);
        multi.push(["srem", firstPartOfKey+"failed", list[i].id]);
        multi.push(["zrem", firstPartOfKey+"delayed", list[i].id]);

    }
    redis.multi(multi).exec();
};

var makePendingByType = function(type){
    type = type.toLowerCase();
    var validTypes = ['active', 'complete', 'failed', 'wait', 'delayed']; //I could add stuck, but I won't support mass modifying "stuck" jobs because it's very possible for things to be in a "stuck" state temporarily, while transitioning between states
    var dfd = q.defer();
    if(validTypes.indexOf(type) === -1) {
        dfd.resolve({success:false, message:"Invalid type: "+type+" not in list of supported types"});
        return dfd.promise;
    }
    getStatus(type).done(function(allKeys){
        var multi = [];
        var allKeyObjects = Object.keys(allKeys.keys);
        for(var i = 0, ii = allKeyObjects.length; i < ii; i++){
            var firstPartOfKey = "bull:"+allKeyObjects[i]+":";
            for(var k = 0, kk = allKeys.keys[allKeyObjects[i]].length; k < kk; k++){
                var item = allKeys.keys[allKeyObjects[i]][k];
                //Brute force remove from everything
                multi.push(["lrem", firstPartOfKey+"active", 0, item]);
                multi.push(["srem", firstPartOfKey+"completed", item]);
                multi.push(["srem", firstPartOfKey+"failed", item]);
                multi.push(["zrem", firstPartOfKey+"delayed", item]);
                //Add to pending
                multi.push(["rpush", firstPartOfKey+"wait", item]);
            }
        }
        redis.multi(multi).exec(function(err, data){
            if(err){
                dfd.resolve({success: false, message: err});
            }else{
                dfd.resolve({success: true, message: "Successfully made all " + type + " jobs pending."});
            }
        });
    });
    return dfd.promise;
};

var makePendingById = function(type, id){
    var dfd = q.defer();
    if(!id) dfd.resolve({success: false, message: "There was no ID provided."});
    if(!type) dfd.resolve({success: false, message: "There was no type provided."});

    var firstPartOfKey = "bull:"+type+":";
    var multi = [];
    multi.push(["lrem", firstPartOfKey+"active", 0, id]);
    multi.push(["lrem", firstPartOfKey+"wait", 0, id]);
    multi.push(["srem", firstPartOfKey+"completed", id]);
    multi.push(["srem", firstPartOfKey+"failed", id]);
    multi.push(["zrem", firstPartOfKey+"delayed", id]);
    //Add to pending
    multi.push(["rpush", firstPartOfKey+"wait", id]);
    redis.multi(multi).exec(function(err, data){
        if(err){
            dfd.resolve({success: false, message: err});
        }else{
            dfd.resolve({success: true, message: "Successfully made "+type+" job #"+id+" pending."});
        }
    });
    return dfd.promise;
};

var deleteJobByStatus = function(type, queueName){
    type = type.toLowerCase();
    var validTypes = ['active', 'complete', 'failed', 'wait', 'delayed']; //I could add stuck, but I won't support mass modifying "stuck" jobs because it's very possible for things to be in a "stuck" state temporarily, while transitioning between states
    var dfd = q.defer();
    if(validTypes.indexOf(type) === -1) {
        dfd.resolve({success:false, message:"Invalid type: "+type+" not in list of supported types"});
        return dfd.promise;
    }
    getStatus(type, queueName).done(function(allKeys){
        var multi = [];
        var allKeyObjects = Object.keys(allKeys.keys);
        for(var i = 0, ii = allKeyObjects.length; i < ii; i++){
            var firstPartOfKey = "bull:"+allKeyObjects[i]+":";
            for(var k = 0, kk = allKeys.keys[allKeyObjects[i]].length; k < kk; k++){
                var item = allKeys.keys[allKeyObjects[i]][k];
                //Brute force remove from everything
                multi.push(["lrem", firstPartOfKey+"active", 0, item]);
                multi.push(["lrem", firstPartOfKey+"wait", 0, item]);
                multi.push(["srem", firstPartOfKey+"completed", item]);
                multi.push(["srem", firstPartOfKey+"failed", item]);
                multi.push(["zrem", firstPartOfKey+"delayed", item]);
                multi.push(["del", firstPartOfKey+item]);
            }
        }
        redis.multi(multi).exec(function(err, data){
            if(err){
                dfd.resolve({success: false, message: err});
            }else{
              if (queueName) {
                dfd.resolve({success: true, message: "Successfully deleted all jobs of status " + type +" of queue " + queueName + "."});
              }
                dfd.resolve({success: true, message: "Successfully deleted all jobs of status " + type +"."});
            }
        });
    });
    return dfd.promise;
};

var deleteJobById = function(type, id){
    var dfd = q.defer();
    if(!id) dfd.resolve({success: false, message: "There was no ID provided."});
    if(!type) dfd.resolve({success: false, message: "There was no type provided."});

    var firstPartOfKey = "bull:"+type+":";
    var multi = [];
    multi.push(["lrem", firstPartOfKey+"active", 0, id]);
    multi.push(["lrem", firstPartOfKey+"wait", 0, id]);
    multi.push(["srem", firstPartOfKey+"completed", id]);
    multi.push(["srem", firstPartOfKey+"failed", id]);
    multi.push(["zrem", firstPartOfKey+"delayed", id]);
    multi.push(["del", firstPartOfKey+id]);
    redis.multi(multi).exec(function(err, data){
        if(err){
            dfd.resolve({success: false, message: err});
        }else{
            dfd.resolve({success: true, message: "Successfully deleted job "+type+" #"+id+"."});
        }
    });
    return dfd.promise;
};

var getDataById = function(type, id){
    var dfd = q.defer();
    if(!id) dfd.resolve({success: false, message: "There was no ID provided."});
    if(!type) dfd.resolve({success: false, message: "There was no type provided."});

    var firstPartOfKey = "bull:"+type+":";
    var multi = [];
    redis.hgetall(firstPartOfKey+id, function(err, data){
        if(err){
            dfd.resolve({success: false, message: err});
        }else{
            dfd.resolve({success: true, message: data});
        }
    });
    return dfd.promise;
};

var getProgressForKeys = function(keys){
    var dfd = q.defer();
    var multi = [];
    for(var i = 0, ii = keys.length; i < ii; i++){
        multi.push(["hget", "bull:"+keys[i].type+":"+keys[i].id, "progress"]);
    }
    redis.multi(multi).exec(function(err, results){
        for(var i = 0, ii = keys.length; i < ii; i++){
            keys[i].progress = results[i];
        }
        dfd.resolve(keys);
    });
    return dfd.promise;
};

var getDelayTimeForKeys = function(keys){
    var dfd = q.defer();
    var multi = [];
    for(var i = 0, ii = keys.length; i < ii; i++){
        multi.push(["zscore", "bull:"+keys[i].type+":delayed", keys[i].id]);
    }
    redis.multi(multi).exec(function(err, results){
        for(var i = 0, ii = keys.length; i < ii; i++){
            // Bull packs delay expire timestamp and job id into a single number. This is mostly
            // needed to preserve execution order – first part of the resulting number contains
            // the timestamp and the end contains the incrementing job id. We don't care about
            // the id, so we can just remove this part from the value.
            // https://github.com/OptimalBits/bull/blob/e38b2d70de1892a2c7f45a1fed243e76fd91cfd2/lib/scripts.js#L90
            keys[i].delayUntil = new Date(Math.floor(results[i]/0x1000));
        }
        dfd.resolve(keys);
    });
    return dfd.promise;
};

var getQueues = function(){
    var dfd = q.defer();
    var queues = redis.keysAsync("bull:*:id").then(function(queues) {
      return Promise.all(queues.map(function(queue) {
        var name = queue.substring(0, queue.length - 3);
        var activeJobs = redis.lrangeAsync(name + ":active", 0, -1);
        var active = activeJobs.filter(function (job) {
          return redis.getAsync(name + ":" + job + ":lock").then(function(lock) {
            return lock != null;
          });
        });
        var stalled = activeJobs.filter(function (job) {
          return redis.getAsync(name + ":" + job + ":lock").then(function(lock) {
            return lock == null;
          });
        });
        var pending = redis.llenAsync(name + ":wait");
        var delayed = redis.zcardAsync(name + ":delayed");
        var completed = redis.zcountAsync(name + ":completed", '-inf', '+inf');
        var failed = redis.zcountAsync(name + ":failed", '-inf', '+inf');
        return Promise.join (active, stalled, pending, delayed, completed, failed, function(active, stalled, pending, delayed, completed, failed) {
          return {
            name: name.substring(5),
            active: active.length,
            stalled: stalled.length,
            pending: pending,
            delayed: delayed,
            completed: completed,
            failed: failed
          };
        });
      }));
    }).then(dfd.resolve);
    return dfd.promise;
};


module.exports.getAllKeys = getAllKeys; //Returns all JOB keys in string form (ex: bull:video transcoding:101)
module.exports.formatKeys = formatKeys; //Returns all keys in object form, with status applied to object. Ex: {id: 101, type: "video transcoding", status: "pending"}
module.exports.getStatus = getStatus; //Returns indexes of completed jobs
module.exports.getStatusCounts = getStatusCounts; //Returns counts for different statuses
module.exports.getJobsInList = getJobsInList; //Returns the job data from a list of job ids
module.exports.getDataById = getDataById; //Returns the job's data based on type and ID
module.exports.removeJobs = removeJobs; //Removes one or  more jobs by ID, also removes the job from any state list it's in
module.exports.makePendingByType = makePendingByType; //Makes all jobs in a specific status pending
module.exports.makePendingById = makePendingById; //Makes a job with a specific ID pending, requires the type of job as the first parameter and ID as second.
module.exports.deleteJobByStatus = deleteJobByStatus; //Deletes all jobs in a specific status
module.exports.deleteJobById = deleteJobById; //Deletes a job by ID. Requires type as the first parameter and ID as the second.
module.exports.getProgressForKeys = getProgressForKeys; //Gets the progress for the keys passed in
module.exports.getDelayTimeForKeys = getDelayTimeForKeys; // Gets the delay end time for the keys passed in
module.exports.getQueues = getQueues //Get information about all the queues in the redis instance
