const moment = require("moment");
const { ErrorTypes } = require("../enums");
const { GenericError, ScrapeError, ConfigError } = require("../models/error");

class ErrorHandler {
  constructor(deps) {
    this.errors = [];

    Object.assign(this, deps);
  }

  clearErrors = () => {
    this.errors = [];
  };

  addError = error => {
    if (this.errors.length === 100) this.errors.shift();
    this.errors.push(error);
  };

  get scrapeErrors() {
    return this.errors.filter(error => error.errorType === ErrorTypes.scrape);
  }

  get appErrors() {
    return this.errors.filter(error => error.errorType !== ErrorTypes.scrape);
  }

  formatErrorMessage = error => {
    const formattedDate = moment(error.date).format(
      this.mcp.config.DATE_FORMAT
    );
    let message = `${formattedDate}: ${error.text}`;

    if (error.errorType === ErrorTypes.scrape) {
      message = `${message} ( ${error.candidate.site} )`;
    }

    return message;
  };
}

module.exports = ErrorHandler;
