import { join } from "path";

module.exports = {
  cache: join(__dirname, ".cache", "puppeteer"),
  browsers: ["chrome"],
};
