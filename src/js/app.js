var controller = require("./controller.js");
var store = require("./store.js");

global.app = function () {
  //initialising the controller
  console.log("initialising the controller")
  controller.init(store);
};
