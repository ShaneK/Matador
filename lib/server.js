var express = require('express'),
  cons = require('consolidate'),
  dust = require('dustjs-linkedin'),
  app = express();

app.engine('dust', cons.dust);
app.set('view engine', 'dust');
app.set("views", __dirname + "/../public/templates/");

module.exports = app;