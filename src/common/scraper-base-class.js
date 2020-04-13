const ErrorHandler = require("../controllers/errors");

class ScraperBaseClass {
  constructor() {
    this.errorHandler = new ErrorHandler();
  }
}

module.exports = ScraperBaseClass;
