'use strict';


module.exports = function IndexModel() {
    return {
        getKeys: function(){
            redis.keys("*", function(err, keys){
                var keyList = [];
                for(var i = 0, ii = keys.length; i < ii; i++){
                    var explodedKeys = keys[i].split(":");
                    keyList.push({id: explodedKeys[2], type: explodedKeys[1]});
                }
                return keyList;
            });
        }
    };
};