var RedisHandler = function(){
    var _self = this;

    _self.util = {
        notyConfirm: function(message, cb){
            var buttons = [
                {addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) { $noty.close(); cb(); } },
                {addClass: 'btn btn-danger', text: 'Cancel', onClick: function ($noty) { $noty.close(); } }
            ];
            noty({text: message, type: 'alert', layout: 'center', buttons: buttons, modal: true});
        },
        handleAjaxResponse: function(ajaxResponse){
            noty({text: ajaxResponse.message, type: ajaxResponse.success ? 'success' : 'error', timeout: 3500, layout: 'topRight'});
        },
        blockUI: function(){
            $.blockUI({message: '<h2>Please wait... <i class="fa fa-cog fa-spin"></i></h2>'});
        }
    };

    _self.fn = {
        deleteById: function(o){
            var id = o.id;
            var type = o.type;
            _self.util.notyConfirm("Are you sure you want to delete the job of type "+ type + " with ID #"+id+"?", function(){
                _self.util.blockUI();
                $.getJSON(window.basepath + "/api/jobs/delete/id/"+type+"/"+id).done(function(response){
                    _self.util.handleAjaxResponse(response);
                    dataModel.fn.refreshViewModel(true);
                }).always(function(){
                    $.unblockUI();
                });
            });
        },
        deleteByStatus: function(status, obj){
            var queueName = obj.name;
            status = status.toLowerCase();
            var statusDisplay = status;
            if(status === "pending"){
                status = "wait";
                statusDisplay = "pending";
            }
            _self.util.notyConfirm("Are you sure you want to delete <strong>all</strong> jobs with the status "+statusDisplay+"?", function(){
                _self.util.blockUI();
                var targetUrl = null;
                if (queueName) {
                  targetUrl = window.basepath + "/api/jobs/delete/status/"+status + "?queueName=" + queueName;
                } else {
                  targetUrl = window.basepath + "/api/jobs/delete/status/"+status;
                }
                $.getJSON(targetUrl).done(function(response){
                    if(status !== statusDisplay && response.success){
                        response.message = response.message.replace(status, statusDisplay);
                    }
                    _self.util.handleAjaxResponse(response);
                    dataModel.fn.refreshViewModel(true);
                }).always(function(){
                    $.unblockUI();
                });
            });
        },
        pendingById: function(o){
            var id = o.id;
            var type = o.type;
            _self.util.notyConfirm("Are you sure you want make the job of type "+ type + " with ID #"+id+" pending? This will put this job in the queue to be run again.", function(){
                _self.util.blockUI();
                $.getJSON(window.basepath + "/api/jobs/pending/id/"+type+"/"+id).done(function(response){
                    _self.util.handleAjaxResponse(response);
                    dataModel.fn.refreshViewModel(true);
                }).always(function(){
                    $.unblockUI();
                });
            });
        },
        infoById: function(o, e){
            var id = o.id;
            var type = o.type;
            _self.util.blockUI();
            $.getJSON(window.basepath + "/api/jobs/info/"+type+"/"+id).done(function(response){
                if(response.success === false){
                    _self.util.handleAjaxResponse(response);
                }else{
                    var buttons = [
                        {addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) { $noty.close(); } },
                    ];

                    var response = JSON.parse(JSON.stringify(response));
                    response.message.data = JSON.parse(response.message.data);
                    var data = JSON.stringify(response.message.data, null, 2);
                    var stacktrace = response.message.stacktrace;

                    var message = '<pre style="text-align: left">Job ID: ' + id +
                        '\nType: ' + type +
                        '\nStatus: ' + o.status +
                        '\n\nData: ' + data;

                    if (stacktrace){
                        message = message + '\n\n<span style="color: red;">Stack Trace: \n' + stacktrace + '</span>' + '</pre>';
                    } else {
                        message = message + '</pre>';
                    }

                    var displayedNoty = noty({
                        text: message,
                        type: 'alert',
                        layout: 'center',
                        buttons: buttons,
                        modal: true,
                        template: '<div class="noty_message" style="height: 300px; width: 100%; overflow-y: scroll;"><span class="noty_text" style="width: 100%"></span><div class="noty_close"></div></div>'
                    });

                    displayedNoty.$message.parents('li').width("50vw");
                    displayedNoty.$message.parents('.i-am-new').css('left', '25vw');
                }
            }).always(function(){
                $.unblockUI();
            });
        },
        pendingByStatus: function(status){
            status = status.toLowerCase();
            var statusDisplay = status;
            if(status === "pending"){
                status = "wait";
                statusDisplay = "pending";
            }
            _self.util.notyConfirm("Are you sure you want to make <strong>all</strong> jobs with the status "+status+" pending? This will put all jobs with this status in the queue to be run again.", function(){
                _self.util.blockUI();
                $.getJSON(window.basepath + "/api/jobs/pending/status/"+status).done(function(response){
                    if(status !== statusDisplay && response.success){
                        response.message = response.message.replace(status, statusDisplay);
                    }
                    _self.util.handleAjaxResponse(response);
                    dataModel.fn.refreshViewModel(true);
                }).always(function(){
                    $.unblockUI();
                });
            });
        },
        createJob: function(){
            var data = $("#newjob").serializeArray();
            var url = window.basepath + "/api/jobs/create";
            $.ajax({
                type:'POST',
                url:url,
                data: data,
                success: function(){
                    // clear form
                    $('#newjob').trigger("reset");
                    $('.alert').html('').addClass('hidden');
                },
                error: function(response){
                    // display error
                    $('.alert').html('<strong>Error!</strong> ' + response.responseText).removeClass('hidden');
                }
            });
        }
    };

    return _self;
};

var redisHandler = new RedisHandler();
