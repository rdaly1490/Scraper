const ScraperBaseClass = require("../common/scraper-base-class");

class Twilio {
  constructor(deps) {
    if (deps.twilioConfig) {
      this.keys = deps.mcp.config.twilioConfig;
    } else {
      // add config error
    }

    Object.assign(this, deps);
  }

  sendTextForResult = result => {
    console.log(result);
  };
}

module.exports = Twilio;
