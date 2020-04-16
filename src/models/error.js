const { ErrorTypes } = require("../enums");

class GenericError {
  constructor(text) {
    this.text = text;
    this.date = new Date();
    this.errorType = ErrorTypes.generic;
  }
}

class ScrapeError extends GenericError {
  constructor(text, candidate) {
    super(text);
    this.candidate = candidate;
    this.errorType = ErrorTypes.scrape;
  }
}

class ConfigError extends GenericError {
  constructor(text) {
    super(text);
    this.errorType = ErrorTypes.config;
  }
}

module.exports = {
  GenericError,
  ScrapeError,
  ConfigError
};
