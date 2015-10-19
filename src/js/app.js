var controller = require("./controller.js");

global.app = function () {
  controller.init();
};
