const puppeteer = require("puppeteer");
const ScraperBaseClass = require("../common/scraper-base-class");
const { compactMap } = require("../common/helpers");

class Scraper {
  constructor(deps) {
    this.scrapeAll = this.scrapeAll.bind(this);
    this.scrapePage = this.scrapePage.bind(this);
    this.startScraping = this.startScraping.bind(this);

    Object.assign(this, deps);
  }

  async startScraping() {
    console.log("start scraping");
    this.errorHandler.clearErrors();
    await this.scrapeAll();
    console.log("done scraping");
  }

  async scrapeAll() {
    const scrapeCandidates = this.scrapeDataSource;
    let browser;
    if (process.env.NODE_ENV === "production") {
      browser = await puppeteer.launch();
    } else {
      browser = await puppeteer.launch({ devtools: true });
    }

    for (const candidate of scrapeCandidates) {
      const result = await this.scrapePage(candidate, browser);
      if (result.length) {
        // use mcp to add to result set
        console.log("succeess");
      }
    }
  }

  async scrapePage(candidate, browser) {
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(120000);
    await page.exposeFunction("logError", this.errorHandler.addScrapeError);
    await page.goto(candidate.url);

    const matches = await page.evaluate(this.puppeteerEvaluatePage, candidate);

    console.log(matches);

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
    return targets
      .map(target => {
        const isValid = evaluateTargetVersusRules(target, candidate);
        if (isValid) {
          const result = target.querySelector(candidate.itemDescriptionTarget);
          if (result) {
            return { site: candidate.site, text: result.text };
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
