const SERVER_MODE = process.env.SERVER_MODE ? true : false;

async function CheckPastebin() {
  try {
    const { chromium } = require("playwright-extra");
    const stealth = require("puppeteer-extra-plugin-stealth")();

    chromium.use(stealth);
    const browser = await chromium.launch({ headless: SERVER_MODE });

    const page = await browser.newPage();
    await page.goto(`https://pastebin.com/pro`, {
      waitUntil: "networkidle",
    });

    const summaryResults = await page.evaluate(async () => {
      try {
        /* Cleanup page to make it easier to screenshot */
        document.querySelectorAll("[class*='sidebar']").forEach((element) => {
          element.remove();
        });
        document.querySelectorAll("[class*='popup-box']").forEach((element) => {
          element.remove();
        });
      } catch (e) {
        /* If something fails, its ok. Continue anyway and ignore it*/
      }

      return document
        .querySelector(".summary")
        .textContent.replaceAll("\n", "")
        .trim()
        .replace(/\s+/g, " ");
    });

    const b64screenshot = await page.screenshot();
    await browser.close();

    return {
      success: true,
      proAvaliable: summaryResults.includes(
        "Pastebin PRO accounts are currently sold out"
      )
        ? false
        : true,
      b64screenshot: b64screenshot.toString("base64"),
    };
  } catch (e) {
    return {
      success: false,
      error: e,
    };
  }
}

module.exports = {
  CheckPastebin,
};
