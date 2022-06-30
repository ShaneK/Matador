# Matador

A node-based web interface for the <a href="https://github.com/OptimalBits/bull">Bull Job Manager</a>
***

**Update Note version 0.1.0 -> 1.0.0**  
In the latest update, Matador went from relying on Kraken to relying on just express/dust (which is why I incremented by a major version number). This occurred because Kraken has changed quite a bit since Matador was made, with quite a bit of the previous code becoming deprecated. I also re-worked some of the code to try to make it quicker and resolve some of the issues/feature requests.

**Why?**  
We needed a job manager and we wanted to stick to one that only really relied on Node and Redis, so we looked and looked until we found Bull. Bull looked really nice, but we also wanted to be able to monitor the jobs without having to actually log into the AWS server to access the Redis database. Thus, Matador was born.

**Why not just use Kue?**  
Kue has some <a href="https://github.com/LearnBoost/kue/issues/53">really old</a>, <a href="https://github.com/LearnBoost/kue/issues/130">outstanding bugs</a> that we encounted just while testing it. We tested Bull quite a bit, and couldn't reproduce these bugs. We thought it'd be easier to build an interface for Bull than to use Kue and deal with those bugs. (Notice that the first one, while closed, was never actually fixed...)

##Getting Started##

###Installing###

Easy! If you're using Bull already, then all you need to do is clone this repo and run

`npm install`

###Running standalone from npm###

You can run the app standalone with

`node index.js`  or  `npm start`

This standalone method will require you to modify the config/development.json and config/production.json files so that it has the right values for your host and port for your redis server (also any additional redis options, such as passwords).

Or you can simply

`npm install bull-ui`

```js
  var app = require('bull-ui/app')(options);
  app.listen(1337, function(){
    console.log('bull-ui started listening on port', this.address().port);
  });

// http://localhost:1337/
```

Where options is completely optional.  If not specified, it will default to the development settings in config.
You can also pass in your own redis configuration thusly:

```js
var matador = require('bull-ui/app')({
  redis: {
    host: your host name,
    port: your port number,
    password: optional auth password
  }
});
```

Or use a URL:

```js
var matador = require('bull-ui/app')({
  redis: {
    url: "redis://u:password@hostname",
  }
});
```

If you are including matador inside of another express app, declare the basepath when you mount it to the other app.

```js
var app = someExpressApp();
var matador = require('bull-ui/app')(options);

app.use('/matador', function(req, res, next){
  req.basepath = '/matador';
  res.locals.basepath = '/matador';
  next();
}, matador);

app.listen(9000);

// http://localhost:9000/matador
```

If you're not using Bull, and you think you want to use Matador for some reason, then you should go check out Bull over <a href="https://github.com/OptimalBits/bull">here</a>. After that, if you decide you like it, come back and check out Matador!


**What is it built on?**  
Matador requires Node (obviously) and is built on Experess. Other NPM packages utilized include, but are probably not limited to:

* <a href="http://lodash.com/">Lodash</a>
* <a href="https://github.com/mranney/node_redis">Redis</a>
* <a href="https://github.com/kriskowal/q">Q</a>

On top of that, Matador also utilizes several open-source javascript/css libraries and tools, including but not limited to:

* <a href="http://jquery.com/">jQuery</a>
* <a href="http://knockoutjs.com/">Knockout</a>
* <a href="http://malsup.com/jquery/block/">blockUI</a>
* <a href="http://ned.im/noty/">noty</a>
* <a href="http://www.chartjs.org/">Chart.js</a>
* <a href="http://getbootstrap.com/">Bootstrap</a>
* <a href="http://fortawesome.github.io/Font-Awesome/">Font Awesome</a>


**Screenshot**


<img src="https://cloud.githubusercontent.com/assets/561207/5333224/66e5334a-7e36-11e4-8394-1728f1662569.png" width="600" alt="Overview" />

**Q/A:**


*What is a stuck job?*  
A stuck job is a job that has no state. It's possible that jobs listed as stuck are just in between states, but if there's ever a job with no state for a long time, the overview page gives you a place where you can delete or revert such jobs back the pending queue. Because stuck jobs are any job without a state, and while jobs are processing they may become stateless, there is no way to mass-manage stuck jobs. This is because it would be really easy to accidentally modify jobs you didn't mean to if a job was being processed while you were mass managing "stuck jobs".


**Wrap-up**


Have an issue? Feel free to open an issue in the <a href="https://github.com/ShaneK/Matador/issues">issues page</a>. You can also send me a <a href="https://twitter.com/ShaneTheKing">tweet</a> and I'd be glad to respond!

If you wanna help, feel free to fork and make pull requests! The general layout and feel of Matador is pretty basic, and I tried to keep my code relatively clean (though, some of it is pretty awful looking right now...sorry about that).

***
**License**
***

The MIT License (MIT)

Copyright (c) 2014 Shane King

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
