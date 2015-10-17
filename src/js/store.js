import $ from 'jquery';

export default {
  addMessage: "Adding",

  //startTime
  //endTime
  //text
  addEvent: function(start, end, text){
    var eventDate = $("#eventDate").val();
    var fromTime = $("#fromTime").val();
    var toTime = $("#toTime").val();
    var eventText = $("#eventText").val();

    var eventObject = {
      ends: toTime,
      text: eventText
    };

    // getting events for the date specified
    var daysEvents = JSON.parse(localStorage.getItem(eventDate));

    if(daysEvents){
      //events exist for this day, check if events exist starting at the same time
      var eventsStartingTogether = daysEvents[fromTime];

      if(eventsStartingTogether){
        eventsStartingTogether.push(eventObject);
        daysEvents[fromTime] = eventsStartingTogether;
      } else{
        //events exist for the same day but not starting at the same time.
        daysEvents[fromTime] = [eventObject];
      }

      localStorage.setItem(eventDate, JSON.stringify(daysEvents) );
    } else{
      //no event for this day is present
      var toAdd = {};
      toAdd[fromTime] = [eventObject];
      localStorage.setItem(eventDate, JSON.stringify(toAdd));
    }
  },

  deleteEvent: function(date, fromTime, index){
    console.log(date + " " + fromTime + " " + index);

    var daysEvents = JSON.parse(localStorage.getItem(date));
    var eventsStartingTogether = daysEvents[fromTime];
    eventsStartingTogether.splice(index, 1);
    daysEvents[fromTime] = eventsStartingTogether;
    localStorage.setItem(date, JSON.stringify(daysEvents));

  }

}
