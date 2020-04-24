const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { compactMap } = require("../common/helpers");
const { SuccessfulScrape } = require("../models/successful-scrape");
const { MAX_ERRORS_PER_SITE } = require("../constants");
const { SocketEventTypes } = require("../enums");

class Scraper {
  constructor(deps) {
    puppeteer.use(StealthPlugin());

    this.browser = null;
    this.page = null;

    this.scrapeAll = this.scrapeAll.bind(this);
    this.scrapePage = this.scrapePage.bind(this);
    this.startScraping = this.startScraping.bind(this);
    this.setupScrapeEnvironment = this.setupScrapeEnvironment.bind(this);

    Object.assign(this, deps);
  }

  async setupScrapeEnvironment() {
    if (process.env.NODE_ENV === "debug") {
      this.browser = await puppeteer.launch({ devtools: true });
    } else {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      });
    }

    this.page = await this.browser.newPage();
    await this.page.setDefaultNavigationTimeout(120000);
    await this.page.exposeFunction("logError", this.mcp.addScrapeError);
    await this.page.exposeFunction("log", this.mcp.log);
    await this.page.setExtraHTTPHeaders({
      "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8"
    });
  }

  async startScraping() {
    await this.setupScrapeEnvironment();
    await this.scrapeAll();
  }

  async scrapeAll() {
    this.mcp.log("Scraping process started");
    const sitesGrouped = this.mcp.scrapeSitesGroupedByStatus;
    const scrapeCandidates = this.mcp.scrapeDataSource.filter(candidate =>
      sitesGrouped.functioningSites.includes(candidate.site)
    );

    this.mcp.emitEvent(SocketEventTypes.siteStatuses, sitesGrouped);

    if (scrapeCandidates.length) {
      let successfulScrapes = [];
      for (const candidate of scrapeCandidates) {
        this.mcp.log(`Scraping ${candidate.site}`);
        const results = await this.scrapePage(candidate);
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
    } else {
      this.mcp.endScrape();
      this.mcp.addGenericError("No valid candidates to scrape");
    }
  }

  async scrapePage(candidate) {
    try {
      await this.page.goto(candidate.url);
    } catch (e) {
      this.mcp.addScrapeError(
        `Was not able to load url: ${candidate.url}`,
        candidate
      );
    }

    const matches = await this.page.evaluate(
      this.puppeteerEvaluatePage,
      candidate
    );

    return matches.map(match => {
      return new SuccessfulScrape(
        match.site,
        match.url,
        match.text,
        new Date()
      );
    });
  }

  puppeteerEvaluatePage = candidate => {
    const isNotThere = value => {
      if (value === null || value === undefined) {
        return null;
      } else {
        return value;
      }
    };

    const getTextFromChildNode = child => {
      return (
        isNotThere(child.text) ||
        isNotThere(child.textContent) ||
        isNotThere(child.innerText) ||
        isNotThere(child.innerHTML)
      );
    };

    const checkRegexRule = (rule, child) => {
      const regex = new RegExp(rule.regex.pattern, rule.regex.flags);
      const matchesRegex = regex.test(getTextFromChildNode(child));
      const textShouldExist = candidate.textShouldExist || true;
      debugger;
      return matchesRegex === textShouldExist;
    };

    const evaluateTargetVersusRules = (target, candidate) => {
      let isValid = [];
      const { rules } = candidate;
      rules.forEach((rule, index) => {
        const child = target.querySelector(rule.child);
        if (rule.hasOwnProperty("regex")) {
          if (child) {
            const matchesRegex = checkRegexRule(rule, child);
            // window.log(
            //   `Regex rule number ${index +
            //     1} for ${candidate.site} has ${matchesRegex
            //     ? "passed"
            //     : "failed"}`
            // );
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
            return {
              site: candidate.site,
              url: candidate.url,
              text: getTextFromChildNode(result)
            };
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
