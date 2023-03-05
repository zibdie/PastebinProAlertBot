const { CheckPastebin } = require("./function.js");

async function main() {
  console.log(await CheckPastebin());
}

main();
