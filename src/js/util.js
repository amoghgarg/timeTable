export default {
  //Check if the data object is empty
  isEventsEmpty(events){
    var result = true;
    if(events){
      Object.keys(events).forEach(fromTime => {
        if(events[fromTime].length > 0){
          result = false;
        }
      });
    }
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


  getDateString(which, urlDate){
    if(which == "today"){
      return (new Date()).toISOString().slice(0,10).replace(/-/g,"");
    }
    if(which == "next"){
      var currentDate = this.getDateFromUrl(urlDate);
      var nextDate = new Date();  //temp
      nextDate.setTime(currentDate.getTime() + 86400000);   //adding 1 day in miliseconds
      var nextDateStr = nextDate.toLocaleString("en-GB").substr(0,10).split("/").reverse().join("");
      return nextDateStr;
    }
    if(which == "previous"){
      var currentDate = this.getDateFromUrl(urlDate);
      var nextDate = new Date();  //temp
      nextDate.setTime(currentDate.getTime() - 86400000);   //subtract 1 day in miliseconds
      var nextDateStr = nextDate.toLocaleString("en-GB").substr(0,10).split("/").reverse().join("");
      return nextDateStr;
    }
  },

  getDateFromUrl(urlDate){
    var year = urlDate.substr(0,4);
    var month = urlDate.substr(4,2) - 1;
    var day = urlDate.substr(6,2);
    var date = new Date(year, month, day);
    return (date);
  }
};
