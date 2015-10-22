export default {


  dispDateFormat() {
    return 'D, d M yy';
  },

  formDateFormat(){
    return 'D, d M yy';
  },

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
      return (new Date()).toLocaleString("en-GB").substr(0,10).split("/").reverse().join("");
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

  getDateFromUrl(strDate){
    var year = strDate.substr(0,4);
    var month = strDate.substr(4,2) - 1;
    var day = strDate.substr(6,2);
    var date = new Date(year, month, day);
    return (date);
  },

  getSlashDate(strDate){
    var year = strDate.substr(0,4);
    var month = strDate.substr(4,2);
    var day = strDate.substr(6,2);
    return (year + "/" + month + "/" + day);
  },

  getDisplayTimes(){
    var times =  ["12:00am", "12:30am", "01:00am",
    "01:30am", "02:00am", "02:30am", "03:00am",
    "03:30am", "04:00am", "04:30am", "05:00am",
    "05:30am", "06:00am", "06:30am", "07:00am",
    "07:30am", "08:00am", "08:30am", "09:00am",
    "09:30am", "10:00am", "10:30am", "11:00am",
    "11:30am", "12:00pm", "12:30pm", "01:00pm",
    "01:30pm", "02:00pm", "02:30pm", "03:00pm",
    "03:30pm", "04:00pm", "04:30pm", "05:00pm",
    "05:30pm", "06:00pm", "06:30pm", "07:00pm",
    "07:30pm", "08:00pm", "08:30pm", "09:00pm",
    "09:30pm", "10:00pm", "10:30pm", "11:00pm",
    "11:30pm", "12:00pm" ];
    return times;
  }
};
