const ScraperBaseClass = require("../common/scraper-base-class");

class Twilio extends ScraperBaseClass {
  constructor(twilioConfig) {
    super();
    if (twilioConfig) {
      this.keys = twilioConfig;
    } else {
      this.errorHandler.throwMissingConfigError();
    }
  }
}

module.exports = Twilio;
