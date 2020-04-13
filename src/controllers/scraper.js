const puppeteer = require("puppeteer");
const ScraperBaseClass = require("../common/scraper-base-class");

class Scraper extends ScraperBaseClass {
  constructor(config) {
    super();

    this.poller = null;
    this.scrapeAll = this.scrapeAll.bind(this);
    this.scrapePage = this.scrapePage.bind(this);
    this.startScraping = this.startScraping.bind(this);

    Object.assign(this, config);
  }

  async startScraping() {
    // const { POLLING_INTERVAL } = this.config;
    console.log("start scraping");
    await this.scrapeAll();
    console.log("done scraping");
    // this.poller = setInterval(this.scrapeAll, POLLING_INTERVAL);
  }

  async scrapeAll() {
    const scrapeCandidates = this.scrapeDataSource;
    const browser = await puppeteer.launch();

    for (const candidate of scrapeCandidates) {
      const result = await this.scrapePage(candidate, browser);
      if (result) {
        console.log("succeess");
      } else {
        console.log("none in stock");
      }
    }
  }

  async scrapePage(candidate, browser) {
    const page = await browser.newPage();
    await page.goto(candidate.url);
    const targetEls = await page.$$eval(candidate.target, elements => {
      console.log(elements[0].querySelector);
      console.log(Array.from(elements)[0].querySelector);
      return elements;
    });

    // console.log(data);
    // for (let target of targetEls) {
    //   //   const parentTarget = await page.evaluate(el => el, target);

    //   //   let passesRules = false;
    //   console.log(target);
    //   //   candidate.rules.forEach(rule => {});
    //   //   console.log(iHtml);

    //   //   if (iHtml.replace(/[^0-9]/g, "") === "5") {
    //   //     await target.click();
    //   //     break;
    //   //   }
    // }

    // console.log(textContent);
  }
}

module.exports = Scraper;
