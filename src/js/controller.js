import $ from 'jquery';
import store from './store';
import 'jquery-ui';



export default {

  init(){

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
        "Create": function(){
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
    $("#eventsList").empty();
    var todaysEvents = JSON.parse(localStorage.getItem(date));

    if(todaysEvents){
      console.log("Rendering")
      Object.keys(todaysEvents).forEach(fromTime => {
        console.log("Rendering")
        $("#eventsList").append("<ol id=\"theList\">"+fromTime+"<ul>");
        if(todaysEvents[fromTime].length > 0){
          todaysEvents[fromTime].map((event, index) => {

            let deleteButton = $("<button>Delete</button>");
            deleteButton.on("click", event => {
              store.deleteEvent(date, fromTime, index);
              this.render();
            });
            let eventItem = $("<li>"+event.text+"</li>");
            eventItem.append(deleteButton);
            $("#eventsList").append(eventItem);
          })
        }
      });

      $("#eventsList").append("</ul></ol>")

    }


  }



}
