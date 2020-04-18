module.exports = (() => {
  const SCRAPE_DELAY = 5000;
  const DATE_FORMAT = "MMM D - h:mm A";
  const ACTION_CONTROLLER = "twilio";

  if (process.env.NODE_ENV === "production") {
    return {
      actionControllerConfig: {
        TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
        MY_PHONE_NUMBER: process.env.MY_PHONE_NUMBER,
        ACCOUNT_SID: process.env.ACCOUNT_SID,
        AUTH_TOKEN: process.env.AUTH_TOKEN
      },
      SCRAPE_DELAY: process.env.SCRAPE_DELAY || SCRAPE_DELAY,
      DATE_FORMAT: process.env.DATE_FORMAT || DATE_FORMAT,
      ACTION_CONTROLLER: process.env.ACTION_CONTROLLER || ACTION_CONTROLLER
    };
  } else {
    const actionControllerConfig = require("./action-controller-config");
    return {
      actionControllerConfig,
      SCRAPE_DELAY,
      DATE_FORMAT,
      ACTION_CONTROLLER
    };
  }
})();
