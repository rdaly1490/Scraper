const ErrorTypes = {
  scrape: 0,
  config: 1
};

class ScrapeError {
  constructor(text, candidate) {
    this.text = text;
    this.date = new Date();
    this.candidate = candidate;
    this.errorType = ErrorTypes.scrape;
  }
}

class ErrorHandler {
  constructor() {
    this.errors = [];
  }

  addScrapeError = (text, candidate) => {
    const error = new ScrapeError(text, candidate);
    this.addError(error);
  };

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
