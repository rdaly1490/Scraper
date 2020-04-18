const ServerStatus = {
  running: 0,
  stopped: 1,

  description: status => {
    switch (status) {
      case ServerStatus.running:
        return "Running";
      case ServerStatus.stopped:
        return "Stopped";
    }
  }
};

const ErrorTypes = {
  scrape: 0,
  config: 1,
  generic: 2
};

const SocketEventTypes = {
  log: "log",
  scrapeError: "scrape error",
  appError: "app error",
  toggleScrape: "toggle scrape",
  siteStatuses: "site statuses",
  results: "results",
  resetAppState: "reset app state",
  sendTestText: "send test text"
};

module.exports = {
  ServerStatus,
  ErrorTypes,
  SocketEventTypes
};
