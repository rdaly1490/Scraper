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

  registerRoutes = () => {
    //TODO: load any existing errors or results on page load
    this.app.get("/", (req, res) =>
      res.render("index", {
        status: ServerStatus.description(this.status),
        isScraping: this.mcp.isScraping
      })
    );
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

      socket.on("disconnect", () => {
        this.mcp.log("Socket Disconnected");
      });
    });
  };
}

module.exports = HttpServer;
