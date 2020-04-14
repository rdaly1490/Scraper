const HttpServer = require("./http-server");
const Twilio = require("./twilio");
const Scraper = require("./scraper");

class MasterControlProgram {
  constructor(options) {
    this._httpServer = new HttpServer({ mcp: this });
    this.twilio = new Twilio();
    this.scraper = new Scraper(options);

    this.results = [];

    Object.assign(this, options);
  }

  start = () => {
    this._httpServer.startServer();
  };

  startScrape = () => {
    this.scraper.startScraping();
  };

  addResult = result => {
    // add if unique result, then send twilio text
    this.results.push(result);
  };
}

module.exports = MasterControlProgram;
