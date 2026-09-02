// Opt-in load/stress config. Sets RUN_LOAD=1 so the gated load spec actually
// runs, then reuses the API config (same server, baseURL, rate-limit bypass).
process.env.RUN_LOAD = "1";
module.exports = require("./playwright.api.config.cjs");
