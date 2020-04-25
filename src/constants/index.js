const PORT = process.env.PORT || 3000;
const POLLING_INTERVAL = 60000 * 5; // Every 5 min
const MAX_ERRORS_PER_SITE = 10;

module.exports = {
  POLLING_INTERVAL,
  PORT,
  MAX_ERRORS_PER_SITE
};
