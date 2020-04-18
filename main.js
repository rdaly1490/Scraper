const App = require("./src/controllers/master-control-program");
const config = require("./config");
const scrapeDataSource = require("./scrapes-data-source.json");

const options = {
  config,
  scrapeDataSource:
    process.env.NODE_ENV === "production"
      ? require("./scrapes-data-source.json")
      : require("./scrapes-test-data-source.json")
};

const app = new App(options);
app.start();
