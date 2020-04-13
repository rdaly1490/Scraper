const App = require("./src/controllers/master-control-program");
const config = require("./config");
const scrapeDataSource = require("./scrapes-data-source.json");

const options = {
  config,
  scrapeDataSource
};

const app = new App(options);
app.start();
