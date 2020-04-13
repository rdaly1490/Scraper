module.exports = (() => {
  const POLLING_INTERVAL = 5000;
  if (process.env.NODE_ENV === "production") {
    return {
      twilio: {
        TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
        MY_PHONE_NUMBER: process.env.MY_PHONE_NUMBER,
        ACCOUNT_SID: process.env.ACCOUNT_SID,
        AUTH_TOKEN: process.env.AUTH_TOKEN
      },
      POLLING_INTERVAL: process.env.POLLING_INTERVAL || POLLING_INTERVAL
    };
  } else {
    const keys = require("./keys");
    return {
      twilio: keys.twilio,
      POLLING_INTERVAL
    };
  }
})();
