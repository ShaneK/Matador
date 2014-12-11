'use strict';

var config = require('./config'),
    app = require('./lib/server');

require('./lib/setupAndMiddleware')(app);

app.listen(config.port, function(){
    console.log("Matador listening on port", config.port, "in", process.env.NODE_ENV, "mode");
});
