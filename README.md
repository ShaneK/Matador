# Matador

A node-based web interface for the <a href="https://github.com/OptimalBits/bull">Bull Project Manager</a>
***

**Why?**  
We needed a project manager and we wanted to stick to one that only really relied on Node and Redis, so we looked and looked until we found Bull. Bull looked really nice, but we also wanted to be able to monitor the jobs without having to actually log into the AWS server to access the Redis database. Thus, Matador was born.

**Why not just use Kue?**  
Kue has some <a href="https://github.com/LearnBoost/kue/issues/53">really old</a>, <a href="https://github.com/LearnBoost/kue/issues/130">outstanding bugs</a> that we encounted just while testing it. We tested Bull quite a bit, and couldn't reproduce these bugs. We thought it'd be easier to build an interface for Bull than to use Kue and deal with those bugs. (Notice that the first one, while closed, was never actually fixed...)

**How do I get started?**  
Easy! If you're using Bull already, then all you need to do is clone this repo and run

`npm install`

You will need to modify the config/app.json file so that it has the right values for your host and port for your redis server, then to start the server all you need to do is run

`npm start`

Or, if you prefer,

`node index.js`

If you're not using Bull, and you think you want to use Matador for some reason, then you should go check out Bull over <a href="https://github.com/OptimalBits/bull">here</a>. After that, if you decide you like it, come back and check out Matador!


**What is it built on?**  
Matador requires Node (obviously) and is built with <a href="http://krakenjs.com/">Kraken</a>. Other NPM packages utilized include, but are probably not limited to:

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


<img src="http://i.imgur.com/kIAOBaN.png" width="600" alt="Overview" />

**Q/A:**


*What is a stuck job?*  
A stuck job is a job that has no state. It's possible that jobs listed as stuck are just in between states, but if there's ever a job with no state for a long time, the overview page gives you a place where you can delete or revert such jobs back the pending queue. Because stuck jobs are any job without a state, and while jobs are processing they may become stateless, there is no way to mass-manage stuck jobs. This is because it would be really easy to accidentally modify jobs you didn't mean to if a job was being processed while you were mass managing "stuck jobs".


**Wrap-up**


Have an issue? Feel free to open an issue in the <a href="https://github.com/ShaneK/Matador/issues">issues page</a>. You can also send me a <a href="https://twitter.com/ShaneTheKing">tweet</a> and I'd be glad to respond!

If you wanna help, feel free to fork and make pull requests! The general layout and feel of Matador is pretty basic, and I tried to keep my code relatively clean (though, some of it is pretty awful looking right now...sorry about that).