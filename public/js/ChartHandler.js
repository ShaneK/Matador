var ChartHandler = function(){
    var _self = this;

    _self.fn = {
        getDataAndLabels: function(){
            var usage = DataModel.memory().usage;
            var dataset = [];
            var labels = [];
            for(var time in usage){
                var date = new Date(parseInt(time));
                var hours = date.getHours();
                if(hours < 10) hours = "0"+hours;
                var minutes = date.getMinutes();
                if(minutes < 10) minutes = "0" + minutes;
                labels.push("       "+hours + ":" + minutes);
                dataset.push((parseInt(usage[time].split(":")[0])/1024).toFixed(2));
            }
            DataModel.peakMemory(DataModel.memory().peak.human);
            return {data: dataset, labels: labels};
        },
        getOptions: function(data){
            var min = Math.max.apply(Math, data)
            var max = Math.min.apply(Math, data)

            if (max == min) {
                //Chart.js screws up if all the data on a line is the same, this is a workaround.
                return {
                    animation: false,
                    scaleOverride: true,
                    scaleSteps: 3,
                    scaleStepWidth: 1,
                    scaleStartValue: max-2,
                    scaleLabel: "<%=value%> MB"
                };
            }
            return {
                animation: false,
                scaleLabel: "<%=value%> MB"
            };
        },
        subscribe: function(){
            var ctx = $("#memoryChart").get(0).getContext("2d");
            DataModel.memory.subscribe(function(){
                ctx.canvas.width = 350;
                ctx.canvas.height = 200;
                var info = _self.fn.getDataAndLabels();

                var data = {
                    labels : info.labels,
                    datasets : [
                        {
                            fillColor : "rgba(151,187,205,0.5)",
                            strokeColor : "rgba(151,187,205,1)",
                            pointColor : "rgba(151,187,205,1)",
                            pointStrokeColor : "#fff",
                            data : info.data
                        }
                    ]
                };
                new Chart(ctx).Line(data, _self.fn.getOptions(info.data));
            });
        }
    };

    return _self;
}

var chartHandler = new ChartHandler();


$(document).ready(function(){
    chartHandler.fn.subscribe();
});