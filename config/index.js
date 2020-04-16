module.exports = (() => {
  const SCRAPE_DELAY = 5000;
  const DATE_FORMAT = "MMM D - h:m A";
  if (process.env.NODE_ENV === "production") {
    return {
      twilio: {
        TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
        MY_PHONE_NUMBER: process.env.MY_PHONE_NUMBER,
        ACCOUNT_SID: process.env.ACCOUNT_SID,
        AUTH_TOKEN: process.env.AUTH_TOKEN
      },
      SCRAPE_DELAY: process.env.SCRAPE_DELAY || SCRAPE_DELAY,
      DATE_FORMAT: process.env.DATE_FORMAT || DATE_FORMAT
    };
  } else {
    const keys = require("./keys");
    return {
      twilio: keys.twilio,
      SCRAPE_DELAY,
      DATE_FORMAT
    };
  }
})();
