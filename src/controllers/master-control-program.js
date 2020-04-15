const HttpServer = require("./http-server");
const Twilio = require("./twilio");
const Scraper = require("./scraper");
const ErrorHandler = require("./errors");

class Result {
  constructor(site, text) {
    this.site = site;
    this.text = text;
    this.textSent = false;
  }
}

class MasterControlProgram {
  constructor(options) {
    this.errorHandler = new ErrorHandler();
    this._httpServer = new HttpServer({
      mcp: this,
      errorHandler: this.errorHandler
    });
    this.twilio = new Twilio({
      twilioConfig: options.config.twilio,
      errorHandler: this.errorHandler
    });
    this.scraper = new Scraper({
      scrapeDataSource: options.scrapeDataSource,
      errorHandler: this.errorHandler
    });

    this.results = [];

    Object.assign(this, options);
  }

  start = () => {
    this._httpServer.startServer();
  };

  get pageData() {
    return {
      scrapeErrors: this.errorHandler.scrapeErrors,
      appErrors: this.errorHandler.appErrors,
      results: this.results
    };
  }

  startScrape = () => {
    this.scraper.startScraping();
  };

  endScrape = () => {
    this.errorHandler.clearErrors();
    this.clearResults();
  };

  clearResults = () => {
    this.results = [];
  };

  addResult = result => {
    if (isValidResult(result)) {
      this.results.push(result);
    }
  };

  isValidResult = result => {
    const isUnique = !this.results.find(r => {
      return r.site === result.site && r.text === result.text;
    });

    // add other rules as necessary
    return isUnique;
  };
}

module.exports = MasterControlProgram;
