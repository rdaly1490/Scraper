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

  checkRegexRule = (rule, child) => {
    const flags = rule.regex.replace(/.*\/([gimy]*)$/, "$1");
    const pattern = rule.regex.replace(
      new RegExp("^/(.*?)/" + flags + "$"),
      "$1"
    );
    var regex = new RegExp(pattern, flags);
    const matchesRegex = regex.test(child.innerHtml);
    return matchesRegex;
  };

  evaluateTargetVerusRules = (child, rules) => {
    let isValid = [];
    for (const rule of _candidate.rules) {
      const child = target.querySlector(rule.child);
      if (!child) {
        // one rule fails so all fail
        // Print error info
        return true;
      }

      if (rule.hasOwnProperty("regex")) {
        const matchesRegex = this.checkRegexRule(rule, child);
        isValid.push(true);
        // isValid.push(matchesRegex);
      } else if (rule.hasOwnProperty("existence")) {
        isValid.push(true);
        // if (rule.existence) {
        //   isValid.push(!!child);
        // } else {
        //   isValid.push(!child);
        // }
      } else {
        isValid.push(false);
      }
    }
    return isValid.length === 0;
  };

  async scrapePage(candidate, browser) {
    const that = this;
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(candidate.url);

    const matches = await page.evaluate(_candidate => {
      const checkRegexRule = (rule, child) => {
        const flags = rule.regex.replace(/.*\/([gimy]*)$/, "$1");
        const pattern = rule.regex.replace(
          new RegExp("^/(.*?)/" + flags + "$"),
          "$1"
        );
        var regex = new RegExp(rule.regex);
        const matchesRegex = regex.test(child.text);
        return matchesRegex;
      };

      const evaluateTargetVerusRules = (target, rules) => {
        let isValid = [];
        for (let rule of rules) {
          const child = target.querySelector(rule.child);
          if (!child) {
            // one rule fails so all fail
            // Print error info
            return false;
          }
          if (rule.hasOwnProperty("regex")) {
            const matchesRegex = checkRegexRule(rule, child);
            isValid.push(matchesRegex);
          } else if (rule.hasOwnProperty("existence")) {
            if (rule.existence) {
              isValid.push(!!child);
            } else {
              isValid.push(!child);
            }
          } else {
            // invalid rule type
            // Print error info
            return false;
          }
        }
        return isValid.length && isValid.every(t => t);
      };

      const targets = Array.from(document.querySelectorAll(_candidate.target));

      return targets.map(target => {
        const isValid = evaluateTargetVerusRules(target, _candidate.rules);
        if (isValid) {
          const result = target.querySelector(_candidate.itemDescriptionTarget);
          if (result) {
            return { site: _candidate.site, text: result.text };
          }
        }
        return null;
      });
    }, candidate);

    console.log(matches);
  }
}

module.exports = Scraper;
