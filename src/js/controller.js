import $ from 'jquery';
import Store from './store';
import Util from './util';
import 'jquery-ui';


export default {



  init(){

    //height of 1 hour event, in pixels
    this.hourHeight = 80;
    this.eventMargin = 4;
    this.eventBorder = 2;
    this.heightSubtraction = 2*(this.eventMargin + this.eventBorder);

    ///////////  Tagging Events  ///////////////
    $("#addButton").bind("click", function(){
      this.showEditDialog();
    }.bind(this));

    $("#showInfoButton").bind("click", function(){
      $("#infoDialog").dialog("open");
    }.bind(this));

    window.onhashchange = this.render.bind(this);

    $(document).keydown(function (e){

      if(!this.dialog.dialog("isOpen")){
        //press "n" to add new.
        if(e.keyCode == 78){
            e.preventDefault();
            this.showEditDialog();
        }

        //press t to go todays
        if(e.keyCode == 84){
          e.preventDefault();
          location.hash = Util.getDateString("today", this.hash);
        }

        //press right to next date
        if(e.keyCode == 39){
          e.preventDefault();
          location.hash = Util.getDateString("next", this.hash);
        }

        //press left to left date
        if(e.keyCode == 37){
          e.preventDefault();
          location.hash = Util.getDateString("previous", this.hash);
        }

        //press i to show help
        if(e.keyCode == 73){
          if(!$("#infoDialog").dialog("isOpen")){
            $("#infoDialog").dialog("open");
          }else{
            $("#infoDialog").dialog("close");
          }
        }
      }
    }.bind(this));
    ////////////////////////////////////////////////

    $("#prevDateButton").click(function(){
      location.hash = Util.getDateString("previous", this.hash);
    }.bind(this));

    $("#nextDateButton").click(function(){
      location.hash = Util.getDateString("next", this.hash);
    }.bind(this));

    $("#goToToday").click(function(){
      location.hash = Util.getDateString("today", this.hash);
    }.bind(this));

    // Initialise the new event form
    this.dialog = $( "#addEventForm" ).dialog({
      autoOpen: false,
      height: 300,
      width: 350,
      modal: true,
      buttons: {
        "Cancel": function() {
          this.dialog.dialog( "close" );
        }.bind(this)
      },
      closeText: "",
      close: function() {
        $("#toTime").empty();
        this.render();
      }.bind(this)
    });


    //Initialise info dialog
    $("#infoDialog").dialog({
        modal: true,
        autoOpen: false,
        closeText: ""
    });

    // displayDatePicker setting
    $("#displayDateInput").hide();
    $("#displayDateInput").datepicker({
      dateFormat: "yymmdd",
      showOn: "button",
      altFormat: Util.dispDateFormat(),
      altField: "#displayDatePicker",
      onSelect: function(value) {
        location.hash = value;
       }
    });
    $("#displayDatePicker").datepicker("hide");

    $("#eventDatePicker").datepicker({
      dateFormat: Util.formDateFormat()
    });
    $("#eventDatePicker").datepicker("hide");

    //Initialise the drop down time selector on add form
    var displayTimes = Util.getDisplayTimes();
    for(var i = 0; i < 24.1; i = i + 0.5){
      var opt =$("<option />")
                .val(i)
                .html(displayTimes[parseInt(2*i)]);
      $("#fromTime").append(opt);
    }

    $("#fromTime").change(function(){
      this.fromTimeSelected();
    }.bind(this));

    // Get the date from the url
    if(!location.hash){
      //default set to todays date.
      location.hash = (new Date()).toLocaleString("en-GB").substr(0,10).split("/").reverse().join("");
    }

    window.onresize = function(a, b){
      console.log(a)
      console.log(b)
    }
    this.render();
    console.log("Calender initialised.");
    $("#ui-datepicker-div").hide();
  },

  renderSepartors(){
    var eventsDisplay = $("#eventsDisplay");
    for(var h = 1; h < 25; h++){
      var dashedLine = $('<hr />')
                  .addClass("halfHourSeparator")
                  .css("top", h*this.hourHeight - this.hourHeight/2);
      var line = $('<hr />')
                  .addClass("oneHourSeparator")
                  .css("top", h*this.hourHeight);
      eventsDisplay.append(dashedLine);
      eventsDisplay.append(line);
    }
  },

  render(){
    //get the date from the url
    this.hash = location.hash.substr(1);
    var date = this.hash;
    var eventsDisplay = $("#eventsDisplay");
    eventsDisplay.empty();
    this.renderSepartors();
    //$("#indiEvent").remove();   //empty the currently displaying events.
    var eventsBlobs = this.getEventBlobs(date);     //getting the events from the local storage. each blob is a group of crashing events

    //displayDatePicker button for selecting display date
    var displayDate =  Util.getDateFromUrl(date).toDateString();
    $("#displayDateButton").text(displayDate);
    $("#displayDateInput").datepicker("setDate", date);

    eventsBlobs.map(blob => {
      var crashingEventsCount = blob.events.length;   //crashing Events are those which have some overlap in time, and thus need to rendered with divided width.
      var eachWidth = 100/crashingEventsCount;
      blob.events.map((event, index) => {
        var top = event.starts*this.hourHeight + "px";
        var height = (event.ends - event.starts)*this.hourHeight - this.heightSubtraction;
        var left = index*eachWidth + "%";
        // var width = "calc(" + eachWidth + "%" + " - " + 2*this.eventBorder + "px)";
        // console.log(width)
        var style = "top: " + top + "; height: " + height + "; left: " + left;

        var deleteButton = $('<span />')
                           .attr("class", "ui-icon ui-icon-trash")
                           .click(function(){
                             Store.deleteEvent(date, event);
                             this.render();
                           }.bind(this));

        var eventDiv = $('<div />')
                       .attr("style", style)
                       .attr("class", "indiEvent")
                       .css('width', (eachWidth-1.1)+'%')
                       .text(event.text)
                       .dblclick(function(){
                         this.showEditDialog(date, event);
                       }.bind(this));
       if(index > 0){
         eventDiv.addClass("noLeftMargin");
       }

        eventDiv.append(deleteButton)
                .draggable({
                  axis: "y",
                  containment: "#eventsDisplay",
                  grid: [1, this.hourHeight/2],
                  stop: function(dragEvent, ui){
                    this.onDragStopped(ui, date, event);
                  }.bind(this)
                })
                .resizable({
                  handles: "n, s",
                  grid: [1, this.hourHeight/2],
                  containment: "#eventsDisplay",
                  minHeight: this.hourHeight/2 - this.heightSubtraction,
                  stop: function(resizeEvent, ui){
                    console.log(resizeEvent)
                    console.log(ui)
                    this.onResizeStopped(ui, date, event);
                  }.bind(this)
                });
        eventsDisplay.append(eventDiv);
      })

    })
  },

  onDragStopped(ui, date, event){
    var newFromTime = Number((ui.position.top)/this.hourHeight);
    var newEvent = {
      date: date,
      fromTime: newFromTime,
      toTime: newFromTime + Number(event.ends) - Number(event.starts),
      text: event.text
    };
    Store.editEvent(date, event, newEvent);
    this.render();
  },

  onResizeStopped(ui, date, event){
    var height = ui.size.height + this.heightSubtraction;
    var draggedHandle = ui.element.data('ui-resizable').axis;
    if(draggedHandle == "n"){
      //end Time is same, only the start time has chanegd.
      var newDuration = (height / this.hourHeight);
      var newEvent = {
        date: date,
        fromTime: event.ends - newDuration,
        toTime: event.ends,
        text: event.text
      };
    }else if (draggedHandle == "s"){
      //start Time is same, only the end time has chanegd.
      var newDuration = (height / this.hourHeight);
      var newEvent = {
        date: date,
        fromTime: Number(event.starts),
        toTime: Number(event.starts) + newDuration,
        text: event.text
      };
    }
    Store.editEvent(date, event, newEvent);
    this.render();
  },

  fromTimeSelected(){
    $("#toTime").empty();
    var selectedTime = Number($("#fromTime").val());
    var displayTimes = Util.getDisplayTimes();
    for(var i = selectedTime + 0.5; i < 24.1; i = i + 0.5){
      var opt =$("<option />")
                .val(i)
                .html(displayTimes[parseInt(2*i)]);
      $("#toTime").append(opt);
    }
  },

  showEditDialog(date, event){

    var editing = arguments.length == 2 ? true:false; //false means adding new event
    if(editing){
      $("#eventDatePicker").datepicker("option", "dateFormat", "yymmdd");
      $("#eventDatePicker").datepicker("setDate", date);
      $("#eventDatePicker").datepicker("option", "dateFormat", Util.formDateFormat());
      $("#fromTime").val(event.starts);
      this.fromTimeSelected();
      $("#toTime").val(event.ends);
      $("#eventText").val(event.text);
    }
    else{
      //new event, so just fill the date.
      $("#eventDatePicker").datepicker("option", "dateFormat", "yymmdd");
      $("#eventDatePicker").datepicker("setDate", this.hash);
      $("#eventDatePicker").datepicker("option", "dateFormat", Util.formDateFormat());
      $("#fromTime").val("");
      $("#toTime").val("");
      $("#eventText").val("");
    }

    this.dialog.dialog('option', 'buttons', {
      'Save': function(){
        if(editing){
          Store.editEvent(date, event);
        }else{
          Store.addEvent();
        }
        this.render();
        this.dialog.dialog("close");
      }.bind(this),
      "Cancel": function() {
        this.dialog.dialog( "close" );
      }.bind(this)
    });
    this.dialog.dialog("open");
  },

  //Get the event for the date from the location and put the clashing events together
  getEventBlobs(date){
    //get the date from the url
    var events = JSON.parse(localStorage.getItem(date));

    //eventBlob contains all the events which clash
    var eventBlobs = [];

    var allDone = Util.isEventsEmpty(events);
    while(!allDone){
      //first element of this blob
      let blob = {};
      var  anchorEvent = Util.getSingleEvent(events);
      blob.startTime = anchorEvent.starts;
      blob.endTime = anchorEvent.ends;
      blob.events = [anchorEvent];

      //loop through all other events to find if the any clashes occur.

      Object.keys(events).forEach(fromTime => {
        var indicesToRemove = [];
        events[fromTime].map((event, index) => {
          var startsInBlob = Number(fromTime) >= Number(blob.startTime) && Number(fromTime) < Number(blob.endTime);
          var endsInBlob = Number(event.ends) > Number(blob.startTime) && Number(event.ends) <= Number(blob.endTime);
          var blobStartsInEvent = Number(blob.startTime) >= Number(fromTime) && Number(blob.startTime) < Number(event.ends);
          var blobEndsInEvent = Number(blob.endTime) > Number(fromTime) && Number(blob.endTime) <= Number(event.ends);
          if(startsInBlob || endsInBlob || blobStartsInEvent || blobEndsInEvent){
            blob.events.push({
              starts: fromTime,
              ends: event.ends,
              text: event.text,
              created: event.created
            })
            blob.startTime = blob.startTime < fromTime ? blob.startTime : fromTime;
            blob.endTime = blob.endTime > event.ends ? blob.endTime : event.ends;
            indicesToRemove.push(index);
          }
        });
        //removing the not required arrays.
        indicesToRemove.reverse().map(indToRemove => {
          events[fromTime].splice(indToRemove, 1);
        })

        console.log()
      });

      eventBlobs.push(blob);
      allDone = Util.isEventsEmpty(events);
    }
    return eventBlobs;

  },
}
