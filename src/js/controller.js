import $ from 'jquery';
import Store from './store';
import Util from './util'
import 'jquery-ui';


export default {

  init(){

    //height of 1 hour event, in pixels
    this.hourHeight = 40;

    ///////////  Tagging Events  ///////////////
    $("#addButton").bind("click", function(){
      this.showEditDialog();
    }.bind(this));

    window.onhashchange = this.render.bind(this);

    $(document).keydown(function (e){
      //press "n" to add new.
      if(!this.dialog.dialog("isOpen")){
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
      }

    }.bind(this));
    ////////////////////////////////////////////////


    // Initialise the new event form
    this.dialog = $( "#dialog-form" ).dialog({
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
        this.render();
      }.bind(this)
    });

    // Get the date from the url
    if(!location.hash){
      //default set to todays date.
      location.hash = (new Date()).toISOString().slice(0,10).replace(/-/g,"")
    }
    this.render();
    console.log("Calender initialised.");
  },

  render(){
    //get the date from the url
    this.hash = location.hash.substr(1);
    var date = this.hash;
    var eventsDisplay = $("#eventsDisplay");
    eventsDisplay.empty();   //empty the currently displaying events.
    var eventsBlobs = this.getEventBlobs(date);     //getting the events from the local storage. each blob is a group of crashing events

    eventsBlobs.map(blob => {
      var crashingEventsCount = blob.events.length;   //crashing Events are those which have some overlap in time, and thus need to rendered with divided width.
      var eachWidth = 100/crashingEventsCount;
      blob.events.map((event, index) => {
        var top = event.starts*this.hourHeight + "px";
        var height = (event.ends - event.starts)*this.hourHeight;
        var left = index*eachWidth + "%";
        var width = eachWidth + "%";
        var style = "top: " + top + "; height: " + height + "; width: " + width + "; left: " + left;

        var deleteButton = $('<span />')
                           .attr("class", "ui-icon ui-icon-trash")
                           .click(function(){
                             Store.deleteEvent(date, event);
                             this.render();
                           }.bind(this));

        var eventDiv = $('<div />')
                       .attr("style", style)
                       .text(event.text)
                       .dblclick(function(){
                         this.showEditDialog(date, event);
                       }.bind(this));

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
                  minHeight: this.hourHeight/2,
                  stop: function(resizeEvent, ui){
                    this.onResizeStopped(ui, date, event);
                  }.bind(this)
                });
        eventsDisplay.append(eventDiv);
      })

    })
  },

  onDragStopped(ui, date, event){
    var newFromTime = Number((ui.position.top)/40*1);
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
    var draggedHandle = ui.element.data('ui-resizable').axis;
    if(draggedHandle == "n"){
      //end Time is same, only the start time has chanegd.
      var newDuration = (ui.size.height / this.hourHeight);
      var newEvent = {
        date: date,
        fromTime: event.ends - newDuration,
        toTime: event.ends,
        text: event.text
      };
    }else if (draggedHandle == "s"){
      //start Time is same, only the end time has chanegd.
      var newDuration = (ui.size.height / this.hourHeight);
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

  showEditDialog(date, event){

    var editing = arguments.length == 2 ? true:false; //false means adding new event
    if(editing){
      $("#eventDate").val(date);
      $("#fromTime").val(event.starts);
      $("#toTime").val(event.ends);
      $("#eventText").val(event.text);
    }
    else{
      //new event, so just fill the date.
      $("#eventDate").val(this.hash);
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
          if(startsInBlob || endsInBlob){
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
      });

      eventBlobs.push(blob);
      allDone = Util.isEventsEmpty(events);
    }
    return eventBlobs;

  },
}
