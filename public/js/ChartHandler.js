var ChartHandler = function () {
    var _self = this;
    _self.fn = {
        subscribe: function () {
            dataModel.memory.subscribe(function (data) {
                var chartData = _.map(data, function (memory) {
                    return [memory.time, memory.memory.split(":")[0]];
                });
                $.plot("#memoryChart", [chartData], {
                    xaxis: {
                        mode: "time",
                        timeformat: "%H:%M",
                        tickSize: [1, "minute"]
                    },
                    yaxis: {
                        tickFormatter: function (val, axis) {
                            if(!val) return 0;
                            return Math.ceil(val/10000)/100 + " MB";
                        }
                    }
                });
            });
        }
    };

    return _self;
}

var chartHandler = new ChartHandler();


$(document).ready(function () {
    chartHandler.fn.subscribe();
});