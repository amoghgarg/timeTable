import $ from 'jquery';

/*
The data is stored in the local storage in the following format:
e.g.:
{
  20151010: {        //Date
    0100: [     //From toTime
      {
        toTime: 0200,
        eventText: Meet Jim
      },
      {
        toTime: 0130,
        eventText: Mona will be there too.
      }
    ],
    0300: [      //FromTime
      {
        toTime: 0330,
        eventText: Meet Jerry
      }
    ]
  }
}

*/

export default {

  addEvent: function(event){
    var eventDate, fromTime, toTime, eventText;
    if(arguments.length == 0){
      //Get the values from the form
      eventDate = $("#eventDate").val();
      fromTime = $("#fromTime").val();
      toTime = $("#toTime").val();
      eventText = $("#eventText").val();
    } else if(arguments.length == 1){
      eventDate = event.date;
      fromTime = event.fromTime;
      toTime = event.toTime;
      eventText = event.text
    }

    var eventObject = {
      ends: toTime,
      text: eventText,
      created: (new Date()).getTime()
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

  editEvent: function(date, oldEvent, newEvent){
    this.deleteEvent(date, oldEvent);
    if(arguments.length === 2){
      this.addEvent();
    }else{
      this.addEvent(newEvent);
    }
  },

  deleteEvent: function(date, event){
    var fromTime = event.starts;
    var created = event.created;

    var daysEvents = JSON.parse(localStorage.getItem(date));
    var eventsStartingTogether = daysEvents[fromTime];
    var remainingEvents = eventsStartingTogether.filter(event => {

      return !(event.created === created);
    });
    daysEvents[fromTime] = remainingEvents;
    localStorage.setItem(date, JSON.stringify(daysEvents));
  }

}
