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
                $.getJSON("/jobs/delete/id/"+type+"/"+id).done(function(response){
                    _self.util.handleAjaxResponse(response);
                    dataModel.fn.refreshViewModel(true);
                }).always(function(){
                    $.unblockUI();
                });
            });
        },
        deleteByStatus: function(status){
            status = status.toLowerCase();
            var statusDisplay = status;
            if(status === "pending"){
                status = "wait";
                statusDisplay = "pending";
            }
            _self.util.notyConfirm("Are you sure you want to delete <strong>all</strong> jobs with the status "+statusDisplay+"?", function(){
                _self.util.blockUI();
                $.getJSON("/jobs/delete/status/"+status).done(function(response){
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
                $.getJSON("/jobs/pending/id/"+type+"/"+id).done(function(response){
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
            $.getJSON("/jobs/info/"+type+"/"+id).done(function(response){
                if(response.success === false){
                    _self.util.handleAjaxResponse(response);
                }else{
                    var buttons = [
                        {addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) { $noty.close(); } },
                    ];
                    var message = "<pre style='text-align: left'>Job ID: "+id+"\nType: "+type+"\nStatus: "+ o.status + "\n\nData:\n"+JSON.stringify(JSON.parse(response.message), null, "\t")+"</pre>";
                    var displayedNoty = noty({
                        text: message,
                        type: 'alert',
                        layout: 'center',
                        buttons: buttons,
                        modal: true,
                        template: '<div class="noty_message" style="width: 100%;"><span class="noty_text" style="width: 100%"></span><div class="noty_close"></div></div>'
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
                $.getJSON("/jobs/pending/status/"+status).done(function(response){
                    if(status !== statusDisplay && response.success){
                        response.message = response.message.replace(status, statusDisplay);
                    }
                    _self.util.handleAjaxResponse(response);
                    dataModel.fn.refreshViewModel(true);
                }).always(function(){
                    $.unblockUI();
                });
            });
        }
    };

    return _self;
};

var redisHandler = new RedisHandler();