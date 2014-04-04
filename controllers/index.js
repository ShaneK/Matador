'use strict';


var IndexModel = require('../models/index');


module.exports = function (app) {

    var model = new IndexModel();
    app.get('/', function (req, res) {
        redis.keys("*", function(err, data){
            console.log(data);
        });
        res.render('index', model);
    });

};
