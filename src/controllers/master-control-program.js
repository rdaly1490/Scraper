const moment = require("moment");
const HttpServer = require("./http-server");
const Twilio = require("./twilio");
const Scraper = require("./scraper");
const ErrorHandler = require("./errors");

const { ErrorTypes, SocketEventTypes } = require("../enums");
const { GenericError, ScrapeError, ConfigError } = require("../models/error");
const { MAX_ERRORS_PER_SITE } = require("../constants");

class MasterControlProgram {
  constructor(options) {
    Object.assign(this, options);

    const mcp = { mcp: this };
    this.errorHandler = new ErrorHandler(mcp);
    this._httpServer = new HttpServer(mcp);
    this.twilio = new Twilio(mcp);
    this.scraper = new Scraper(mcp);

    this.results = [];
    this.isScraping = false;

    this.addResults = this.addResults.bind(this);
    this.sendTestText = this.sendTestText.bind(this);
  }

  start = () => {
    this._httpServer.startServer();
  };

  setScraping = status => {
    this.isScraping = status;
    this.emitEvent(SocketEventTypes.toggleScrape, status);
  };

  startScrape = () => {
    this.setScraping(true);
    this.scraper.startScraping();
  };

  resetAppState = () => {
    this.setScraping(false);
    this.clearData();
  };

  endScrape = () => {
    this.setScraping(false);
    this.log("Scraping process will end after the current scrape finishes");
  };

  clearData = () => {
    this.errorHandler.clearErrors();
    this.clearResults();
  };

  clearResults = () => {
    this.results = [];
  };

  clearErrors = () => {
    this.errorHandler.clearErrors();
  };

  getResults = () => {
    return this.results;
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
    const message = this.errorHandler.formatErrorMessage(error);
    const socketEventType =
      error.errorType === ErrorTypes.scrape
        ? SocketEventTypes.scrapeError
        : SocketEventTypes.appError;

    this.errorHandler.addError(error);
    this._httpServer.emitSocketEvent(socketEventType, message);
  };

  formatResultsDate = results => {
    return results.map(result => {
      return {
        ...result,
        date: moment(result.date).format(this.config.DATE_FORMAT)
      };
    });
  };

  async addResults(results) {
    const _results = results.filter(this.isValidResult);
    if (_results.length) {
      this.results = [...this.results, ..._results];

      const formattedResults = this.formatResultsDate(_results);
      this.emitEvent(SocketEventTypes.results, formattedResults);

      await this.twilio.sendTextForResults(formattedResults);
    }
  }

  async sendTestText() {
    await this.twilio.sendTwilioMessage("Test");
  }

  isValidResult = result => {
    const isDuplicateResult = this.results.find(r => {
      const resultForSameSiteExists = r.site === result.site;
      const resultForSameItemExists = r.text === result.text;
      const resultIsFromSameDay = moment(result.date).isSame(
        moment(r.date),
        "day"
      );

      const isDuplicate =
        resultForSameSiteExists &&
        resultForSameItemExists &&
        resultIsFromSameDay;

      return isDuplicate;
    });

    if (isDuplicateResult) {
      this.log(`Duplicate result processed for ${result.site}`);
    }

    const isUnique = !isDuplicateResult;

    // add other rules as necessary
    return isUnique;
  };

  emitEvent = (socketEventType, message) => {
    this._httpServer.emitSocketEvent(socketEventType, message);
  };

  log = message => {
    const socketEventType = SocketEventTypes.log;
    console.log(`${socketEventType}: ${message}`);
    this.emitEvent(socketEventType, message);
  };

  get scrapeSitesGroupedByStatus() {
    const { scrapeErrors } = this.errorHandler;

    const errorsGrouped = scrapeErrors.reduce((acc, error) => {
      if (acc.hasOwnProperty(error.candidate.site)) {
        acc[error.candidate.site] = acc[error.candidate.site] + 1;
      } else {
        acc[error.candidate.site] = 1;
      }
      return acc;
    }, {});

    const sitesGrouped = this.scrapeDataSource.reduce(
      (acc, { site }) => {
        if (
          errorsGrouped[site] < MAX_ERRORS_PER_SITE ||
          !errorsGrouped.hasOwnProperty(site)
        ) {
          acc.functioningSites.push(site);
        } else {
          acc.errorSites.push(site);
        }
        return acc;
      },
      { errorSites: [], functioningSites: [] }
    );

    return sitesGrouped;
  }
}

module.exports = MasterControlProgram;
