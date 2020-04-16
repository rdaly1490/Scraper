const { ErrorTypes } = require("../enums");
const { GenericError, ScrapeError, ConfigError } = require("../models/error");

class ErrorHandler {
  constructor() {
    this.errors = [];
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
}

module.exports = ErrorHandler;
