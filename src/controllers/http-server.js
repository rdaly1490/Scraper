const express = require("express");
const pug = require("pug");
const http = require("http");
const io = require("socket.io");
const { PORT } = require("../constants");
const { ServerStatus, SocketEventTypes } = require("../enums");

class HttpServer {
  constructor(deps) {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = io(this.server);

    this.port = PORT;
    this.status = ServerStatus.stopped;

    this.app.set("view engine", "pug");
    this.app.use(express.static("views"));

    this.registerRoutes();
    this.establishSocketConnections();

    Object.assign(this, deps);
  }

  startServer = () => {
    this.server.listen(this.port, () => {
      this.status = ServerStatus.running;
      console.log(`Server started at http://localhost:${this.port}`);
    });
  };

  stopServer = () => {
    this.status = ServerStatus.stopped;
    this.app.close();
  };

  restartServer = () => {
    this.stopServer();
    this.startServer();
  };

  get siteData() {
    const {
      errorSites,
      functioningSites
    } = this.mcp.scrapeSitesGroupedByStatus;
    const serverStatus = ServerStatus.description(this.status);
    const isScraping = this.mcp.isScraping;
    const scrapeErrors = this.mcp.errorHandler.scrapeErrors
      .map(this.mcp.errorHandler.formatErrorMessage)
      .sort((a, b) => a.date - b.date);
    const appErrors = this.mcp.errorHandler.appErrors
      .map(this.mcp.errorHandler.formatErrorMessage)
      .sort((a, b) => a.date - b.date);
    const results = this.mcp.formatResultsDate(this.mcp.getResults());

    return {
      errorSites,
      functioningSites,
      serverStatus,
      isScraping,
      scrapeErrors,
      appErrors,
      results,
      SocketEventTypes
    };
  }

  registerRoutes = () => {
    //TODO: load any existing errors or results from mcp state
    this.app.get("/", (req, res) => {
      console.log(this.siteData);
      return res.render("index", this.siteData);
    });
  };

  emitSocketEvent = (name, message) => {
    this.io.emit(name, message);
  };

  establishSocketConnections = () => {
    this.io.on("connection", socket => {
      this.mcp.log("Socket connected");

      socket.on(SocketEventTypes.toggleScrape, shouldStart => {
        if (shouldStart) {
          this.mcp.startScrape();
        } else {
          this.mcp.endScrape();
        }
      });

      socket.on(SocketEventTypes.resetAppState, () => {
        this.mcp.resetAppState();
        const sitesGrouped = this.mcp.scrapeSitesGroupedByStatus;
        this.mcp.emitEvent(SocketEventTypes.siteStatuses, sitesGrouped);
      });

      socket.on(SocketEventTypes.sendTestText, () => {
        this.mcp.sendTestText();
      });

      socket.on("disconnect", () => {
        this.mcp.log("Socket Disconnected");
      });
    });
  };
}

module.exports = HttpServer;
