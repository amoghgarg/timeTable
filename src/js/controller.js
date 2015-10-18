import $ from 'jquery';
import store from './store';
import 'jquery-ui';



export default {

  init(){

    this.rowHeight = 40;

    $("#addButton").bind("click", function(){
      console.log("adding")
      this.dialog.dialog( "open" );
      console.log($("#eventsList").html());
    }.bind(this));


    this.dialog = $( "#dialog-form" ).dialog({
      autoOpen: false,
      height: 300,
      width: 350,
      modal: true,
      buttons: {
        "Save": function(){
          store.addEvent();
          this.render();
        }.bind(this),
        "Cancel": function() {
          this.dialog.dialog( "close" );
        }.bind(this)
      },
      close: function() {
        this.render();
      }.bind(this)
    });

    if(!location.hash){
      //default set to todays date.
      location.hash = (new Date()).toISOString().slice(0,10).replace(/-/g,"")
    }
    this.hash = location.hash;
    this.render();
    console.log("Controller installed.");
  },

  render(){
    //get the date from the url
    var date = this.hash.substr(1);
    var eventsDisplay = $("#eventsDisplay");
    eventsDisplay.empty();
    var eventsBlobs = this.getEventBlobs(date);

    console.log(this.rowHeight);

    eventsBlobs.map(blob => {
      var crashingEventsCount = blob.events.length;
      var eachWidth = 100/crashingEventsCount;
      blob.events.map((event, index) => {
        var top = event.starts*this.rowHeight + "px";
        var height = (event.ends - event.starts)*this.rowHeight;
        var left = index*eachWidth + "%";
        var width = eachWidth + "%";
        var script = "top: " + top + "; height: " + height + "; width: " + width + "; left: " + left;

        var eventDiv = $('<div />')
                       .attr("style", script)
                       .text(event.text)
                       .dblclick(function(){
                         this.showEditDialog(date, event);
                       }.bind(this));


        var deleteButton = $('<span />')
                           .attr("class", "ui-icon ui-icon-trash")
                           .text("CLOSE")
                           .click(function(){
                             store.deleteEvent(date, event);
                             this.render();
                           }.bind(this))
        eventDiv.append(deleteButton)
                .draggable({
                  axis: "y",
                  containment: "#eventsDisplay",
                  grid: [1, this.rowHeight/2],
                  stop: function(dragEvent, ui){
                    var newFromTime = Number((ui.position.top)/40*1);
                    var newEvent = {
                      date: date,
                      fromTime: newFromTime,
                      toTime: newFromTime + Number(event.ends) - Number(event.starts),
                      text: event.text
                    };
                    store.editEvent(date, event, newEvent);
                    this.render();
                  }.bind(this)
                });
        eventsDisplay.append(eventDiv);
      })

    })

    console.log(eventsBlobs);
  },

  showEditDialog(date, event){
    $("#eventDate").val(date);
    $("#fromTime").val(event.starts);
    $("#toTime").val(event.ends);
    $("#eventText").val(event.text);
    this.dialog.dialog('option', 'buttons', {
      'Save': function(){
        store.editEvent(date, event);
        this.render()
      }.bind(this),
      "Cancel": function() {
        this.dialog.dialog( "close" );
      }.bind(this)
    });
    this.dialog.dialog("open");
  },

  //Check if the data object is empty
  isEventsEmpty(events){
    var result = true;
    Object.keys(events).forEach(fromTime => {
      if(events[fromTime].length > 0){
        result = false;
      }
    });
    return result;
  },

  //get one event from the data object, any one will do
  getSingleEvent(events){
    var singleEvent;
    for(var fromTime in events){
        if(events[fromTime].length > 0){
          var singleEvent = {
            starts: fromTime,
            ends: events[fromTime][0].ends,
            text: events[fromTime][0].text,
            created: events[fromTime][0].created,
          }
          //remove the event
          events[fromTime].shift();
          break;
        }
    };
    return singleEvent;
  },

  //Get the event for the date from the location and put the clashing events together
  getEventBlobs(date){
    //get the date from the url
    var date = this.hash.substr(1);
    var events = JSON.parse(localStorage.getItem(date));
    // console.log(events);

    //eventBlob contains all the events which clash
    var eventBlobs = [];

    var allDone = this.isEventsEmpty(events);
    while(!allDone){
      //first element of this blob
      let blob = {};
      var  anchorEvent = this.getSingleEvent(events);
      // console.log("anchor event")
      // console.log(anchorEvent);
      blob.startTime = anchorEvent.starts;
      blob.endTime = anchorEvent.ends;
      blob.events = [anchorEvent];

      //loop through all other events to find if the any clashes occur.

      Object.keys(events).forEach(fromTime => {
        var indicesToRemove = [];
        events[fromTime].map((event, index) => {
          // console.log("---------enevt");
          // console.log(event);
          var startsInBlob = Number(fromTime) >= Number(blob.startTime) && Number(fromTime) <= Number(blob.endTime);
          var endsInBlob = Number(event.ends) >= Number(blob.startTime) && Number(event.ends) <= Number(blob.endTime);
          if(startsInBlob || endsInBlob){
            // console.log("pushing")
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
        // console.log("indicesToRemove")
        // console.log(indicesToRemove)
        indicesToRemove.reverse().map(indToRemove => {
          events[fromTime].splice(indToRemove, 1);
        })
      });

      eventBlobs.push(blob);
      allDone = this.isEventsEmpty(events);
      // console.log("isEmpty?");
      // console.log(allDone);
    }
    return eventBlobs;

  }


}
