const moment = require("moment");
const HttpServer = require("./http-server");
const Twilio = require("./twilio");
const Scraper = require("./scraper");
const ErrorHandler = require("./errors");

const { ErrorTypes, SocketEventTypes } = require("../enums");
const { GenericError, ScrapeError, ConfigError } = require("../models/error");
const { SuccessfulScrape } = require("../models/successful-scrape");

class MasterControlProgram {
  constructor(options) {
    const mcp = { mcp: this };
    this.errorHandler = new ErrorHandler();
    this._httpServer = new HttpServer(mcp);
    this.twilio = new Twilio(mcp);
    this.scraper = new Scraper(mcp);

    this.results = [];
    this.isScraping = false;

    Object.assign(this, options);
  }

  start = () => {
    this._httpServer.startServer();
  };

  startScrape = () => {
    this.isScraping = true;
    this.scraper.startScraping();
  };

  endScrape = () => {
    this.isScraping = false;
    this.log("Scraping process will end after the current scrape finishes");
    this.errorHandler.clearErrors();
    this.clearResults();
  };

  clearResults = () => {
    this.results = [];
  };

  clearErrors = () => {
    this.errorHandler.clearErrors();
  };

  addScrapeError = (text, candidate) => {
    const error = new ScrapeError(text, candidate);
    this.addError(error);
  };

  addConfigError = text => {
    const error = new ConfigError(text);
    this.addError(error);
  };

  addGenericError = text => {
    const error = new GenericError(text);
    this.addError(error);
  };

  addError = error => {
    let socketEventType = SocketEventTypes.appError;
    const formattedDate = moment(error.date).format(this.config.DATE_FORMAT);
    let message = `${formattedDate}: ${error.text}`;

    if (error.errorType === ErrorTypes.scrape) {
      socketEventType = SocketEventTypes.scrapeError;
      message = `${message} ( ${error.candidate.site} )`;
    }

    this.errorHandler.addError(error);
    this._httpServer.emitSocketEvent(socketEventType, message);
  };

  addResults = results => {
    const _results = results.filter(isValidResult);
    if (_results.length) {
      // TODO: call twilio and have remove after successful text was sent
      this.results.concat(_results);
    }
  };

  isValidResult = result => {
    const isUnique = !this.results.find(r => {
      return r.site === result.site && r.text === result.text;
    });

    // add other rules as necessary
    return isUnique;
  };

  log = message => {
    const socketEventType = SocketEventTypes.log;
    console.log(`${socketEventType}: ${message}`);
    this._httpServer.emitSocketEvent(socketEventType, message);
  };
}

module.exports = MasterControlProgram;
