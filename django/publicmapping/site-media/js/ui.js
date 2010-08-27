function loadButtons() {
    $('button, input[button]').button();
}

function loadTooltips() {
    $(".divtip").tooltip({ 
        position: 'bottom left',
        offset: [8,10],
        delay: 200,
        predelay: 50,
        opacity: .8,      
        onBeforeShow:  function() {
            // ensure proper DOM placement
            this.getTip().appendTo('body');
        },
        onHide:  function() {
            // restore original DOM placement
            this.getTip().appendTo(this.getTrigger());
        }
    });    
  
    $(".titletip[title]").tooltip({
        position: 'bottom right',
        delay: 250,
        predelay: 600,
        opacity: .8
    });    
      
    $("#stats_legend").tooltip({
        position: 'top center',
        effect: 'slide',
        delay: 200,
        offset: [10,0],
        opacity: .8,
        onBeforeShow:  function() {
            // ensure proper DOM placement
            this.getTip().appendTo('body');
        },
        onHide:  function() {
            // restore original DOM placement
            this.getTip().appendTo(this.getTrigger());
        }
    })  
}


$(function() {
    // jQuery-UI tab layout
    $('#steps').tabs();
    
    // jQuery Tools tooltips   
    loadTooltips();

    
    
    // jQuery-UI buttons   
    loadButtons();
    
    
        
        // stats dropdown button
        $('.menu_toggle')
            .button({
              icons: {primary: 'ui-icon-arrow-down'},text: false})
            .toggle(
              function(){
                $(this).button({icons: {primary: 'ui-icon-arrow-right'}})
              },
              function(){
                $(this).button({icons: {primary: 'ui-icon-arrow-down'}});
              })
            .click(function(){
              if ( $(".map_menu_content:visible'").length === 0) {
                 $storedPanel.slideDown(200);
              } else {
              $('.map_menu_content:visible').each(function() {
                  $storedPanel = $(this);
                  $storedPanel.slideUp(200);
                });
              }  
              });
        
        $("#map_menu_header select").change(function(){
            var selectedVal = this.value;
            $('.map_menu_content').each(function() {       
              if($(this).hasClass(selectedVal)) {
                  $(this).slideDown(200);
              }
              else {
                  $(this).slideUp(200);
              }
            });  
        }).val("demographics").attr("selected", "selected");
        
        
        // map editing buttons
        $('#toolset_draw .toolset_group button')
          .button({
              icons: {primary: 'ui-icon'},
              text:false
          })
          .click(function(){
            if($(this).hasClass('btntoggle')) {
              $('.toolset_group button.btntoggle').removeClass('toggle');
              $(this).addClass('toggle');
            }
          });    
        
        //toolset toggle button
        $('.toolbar_toggle').click(function(){
            if($('.toolset').hasClass('active')) {
               $('.toolset').each(function() {
                $(this).removeClass('active').animate({marginTop: '+=51'}, 200)
               });
            } else {
              $('.toolset').each(function(){
                $(this).addClass('active').animate({marginTop: '-=51'}, 200)
               })
            }
         });

        var dashRE = new RegExp('\-','g');
        var milliRE = new RegExp('\.\\d*$');
        var tzRE = new RegExp('T');
        $('#saveplaninfo').bind('planSaved', function(event, time) {
            var date = new Date(time);
            if (isNaN(date)) {
                // additional text wrangling for IE
                time = time.replace(dashRE,'\/')
                    .replace(milliRE,'')
                    .replace(tzRE, ' ');
                date = new Date(time);
            }
            var hours = date.getHours();
            var minutes = date.getMinutes();
            $('#saveplaninfo').text('Last Saved at ' + hours + ':' + ((minutes < 10) ? ('0' + minutes) : minutes));
        });

        $('#map_legend').click(function(){
            var toggle = $(this);
            var panel = $('#map_legend_content');
            if(toggle.hasClass('active')) {
                toggle.removeClass('active');
                panel.slideUp(240);
            }
            else {
                toggle.addClass('active');
                panel.slideDown(240);
            }
        });
        
        // report category parents toggling
        $('#reportdescription .master input').click( function() {
            $this = $(this);
            var id = $this.attr('id');
            var category = id.substring(0, id.indexOf('_'));
            var checked = $this.attr('checked');
            $('#reportdescription .' + category + ' input').attr('checked', $this.attr('checked'));     
        });
        $('#reportdescription .reportVar input').click( function() {
            $this = $(this).closest('span');
            var id = $this.attr('id');
            var categories = $this.attr('class');
            var category = categories.split(' ')[0]; 
            if ($this.find('input').attr('checked') == false) {
                $('#' + category + '_master').attr('checked', false);     
            }
        });

        $('#btnSaveAndShare').click( function() {
            var getData = function() {
                var name = $('#txtPlanName').val();
                if (name == '') { return false; }
                return { name: name, shared: true }; 
            };
            var $waitPublishing = $('<div title="Please Wait">Publishing with the server</div>').dialog({ autoOpen: true });
            var data = getData();
            if (!data) {
                $waitPublishing.dialog('close');
                $('<div title="Error">Please enter a new name to publish your plan</div>').dialog({ autoOpen: true });
                return false;
            } else {
                $.ajax({
                    url: '/districtmapping/plan/' + PLAN_ID + '/copy/',
                    type: 'POST',
                    data: data,
                    success: function(data, textStatus, xhr) {
                        $waitPublishing.dialog('close');
                        if (textStatus == 'success') {
                            $('#continueEditing').click( function() {
                                $('#successfulShare').dialog('close');
                                $('#steps').tabs('select', '#step-1');
                            });
                            $('#successfulShare').dialog({autoOpen: true});
                        }
                        else {
                            // how to notify that the plan was not saved?
                            window.status = data.message;
                    
                        }
                    },
                    error: function() {
                        $waitPublishing.dialog('close');
                        $('<div title="Server Failure">Sorry, we weren\'t able to contact the server.  Please try again later.</div>').dialog({autoOpen:true});
                    }

                });
            }
        });
    });