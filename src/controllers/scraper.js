const puppeteer = require("puppeteer");
const ScraperBaseClass = require("../common/scraper-base-class");
const { compactMap } = require("../common/helpers");
const { SuccessfulScrape } = require("../models/successful-scrape");

class Scraper {
  constructor(deps) {
    this.scrapeAll = this.scrapeAll.bind(this);
    this.scrapePage = this.scrapePage.bind(this);
    this.startScraping = this.startScraping.bind(this);

    Object.assign(this, deps);
  }

  async startScraping() {
    this.mcp.log("Scraping process started");

    this.mcp.clearErrors();
    await this.scrapeAll();
  }

  async scrapeAll() {
    const scrapeCandidates = this.mcp.scrapeDataSource;
    let browser;
    if (process.env.NODE_ENV === "production") {
      browser = await puppeteer.launch();
    } else {
      browser = await puppeteer.launch({ devtools: true });
    }

    let successfulScrapes = [];
    for (const candidate of scrapeCandidates) {
      const results = await this.scrapePage(candidate, browser);
      if (results.length) {
        successfulScrapes = [...successfulScrapes, ...results];
      }
    }

    this.mcp.addResults(successfulScrapes);

    this.mcp.log(
      `Current scrape process finished with ${successfulScrapes.length} successful scrapes`
    );

    setTimeout(() => {
      if (this.mcp.isScraping) {
        this.scrapeAll();
      } else {
        this.mcp.log("Scraping has stopped");
      }
    }, this.mcp.config.SCRAPE_DELAY || 0);
  }

  async scrapePage(candidate, browser) {
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(120000);
    await page.exposeFunction("logError", this.mcp.addScrapeError);
    await page.goto(candidate.url);

    const matches = await page.evaluate(this.puppeteerEvaluatePage, candidate);
    return matches;
  }

  puppeteerEvaluatePage = candidate => {
    const checkRegexRule = (rule, child) => {
      var regex = new RegExp(rule.regex.pattern, rule.regex.flags);
      const matchesRegex = regex.test(child.text);
      return matchesRegex;
    };

    const evaluateTargetVersusRules = (target, candidate) => {
      let isValid = [];
      const { rules } = candidate;
      rules.forEach((rule, index) => {
        const child = target.querySelector(rule.child);
        if (rule.hasOwnProperty("regex")) {
          if (child) {
            const matchesRegex = checkRegexRule(rule, child);
            isValid.push(matchesRegex);
          } else {
            window.logError(
              `Couldn't find child for rule number ${index}`,
              candidate
            );
          }
        } else if (rule.hasOwnProperty("existence")) {
          if (rule.existence) {
            isValid.push(!!child);
          } else {
            isValid.push(!child);
          }
        } else {
          window.logError(
            `Invalid rule type for rule number ${index}`,
            candidate
          );
          return false;
        }
      });

      return isValid.length && isValid.every(t => t);
    };

    const targets = Array.from(document.querySelectorAll(candidate.target));
    window.logError("Test", candidate);
    return targets
      .map(target => {
        const isValid = evaluateTargetVersusRules(target, candidate);
        if (isValid) {
          const result = target.querySelector(candidate.itemDescriptionTarget);
          if (result) {
            return new SuccessfulScrape(
              candidate.site,
              candidate.url,
              result.text
            );
          } else {
            window.logError(
              "Success for rules, but couldn't find 'itemDescriptionTarget'",
              candidate
            );
          }
        }
        return null;
      })
      .filter(x => x);
  };
}

module.exports = Scraper;
