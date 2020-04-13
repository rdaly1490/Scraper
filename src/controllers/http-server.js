const express = require("express");
const pug = require("pug");
const { PORT } = require("../constants");
const { ServerStatus } = require("../enums");

class HttpServer {
  constructor() {
    this.app = express();
    this.port = PORT;
    this.status = ServerStatus.stopped;

    this.app.set("view engine", "pug");

    this.registerRoutes();
  }

  startServer = () => {
    this.app.listen(this.port, () => {
      this.status = ServerStatus.running;
      console.log(`Server started at http://localhost:${this.port}`);
    });
  };

  registerRoutes = () => {
    this.app.get("/", (req, res) =>
      res.render("index", { status: ServerStatus.description(this.status) })
    );
  };

  stopServer = () => {
    this.status = ServerStatus.stopped;
    this.app.close();
  };

  restartServer = () => {
    this.stopServer();
    this.startServer();
  };
}

module.exports = HttpServer;
