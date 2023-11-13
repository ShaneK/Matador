var DataModel = function(){
	var _self = this;

	//Page information
	_self.complete = ko.observable(null);
	_self.failed = ko.observable(null);
	_self.active = ko.observable(null);
	_self.pending = ko.observable(null);
	_self.delayed = ko.observable(null);
	_self.stuck = ko.observable(null);
	_self.queues = ko.observable(null);
	_self.keys = ko.observableArray([]);
	_self.memory = ko.observable({});
	_self.peakMemory = ko.observable("");
	_self.refreshTimeout = ko.observable(0);
	_self.fetchingUpdates = ko.observable(false);

	_self.autoRefreshId = null;
	_self.fn = {
		refreshViewModel: function(force){
			var pathname = window.location.pathname.replace(window.basepath, '');
			var refreshUrl = window.basepath + '/api' + (pathname !== '/' ? pathname : '');

			var paused = true;
			var refresh = function(){
				_self.fetchingUpdates(true);
				$.getJSON(refreshUrl).done(function(data){
					_self.complete(" ("+data.counts.complete+")");
					_self.failed(" ("+data.counts.failed+")");
					_self.active(" ("+data.counts.active+")");
					_self.pending(" ("+data.counts.pending+")");
					_self.delayed(" ("+data.counts.delayed+")");
					_self.stuck(" ("+data.counts.stuck+")");
					_self.keys(data.keys);
					if(data.memory){
						_self.memory(data.memory.usage);
						_self.peakMemory(data.memory.peak.human);
					}
					_self.fetchingUpdates(false);
					paused = false;
				});
			};

			var counter = 0;
			refresh();

			var refreshTimer = function(pollInterval) {
				if (paused) return;

				if (counter % pollInterval === 0) {
					paused = true;
					_self.refreshTimeout(1);
					refresh();
				} else {
					_self.refreshTimeout(((counter % pollInterval) / pollInterval));
				}

				counter++;
			};

			if(force){
				clearInterval(_self.autoRefreshId);
				paused = false;
				refreshTimer(0);
			}

			_self.autoRefreshId = setInterval(refreshTimer, 100, 20);
		}
	}

	return _self;
}

var dataModel = new DataModel();
