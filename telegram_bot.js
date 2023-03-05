require("dotenv").config();
const { Telegraf } = require("telegraf");
const { CheckPastebin } = require("./function.js");
const moment = require("moment-timezone");

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN is missing");
}
if (!process.env.CHAT_ID) {
  throw new Error("CHAT_ID is missing");
}

const chat_id = Number(process.env.CHAT_ID);
const bot = new Telegraf(process.env.BOT_TOKEN);

async function start() {
  try {
    /* Dont 'await' bot.launch() - See ticket: https://github.com/telegraf/telegraf/issues/1749 */
    bot.launch();
    try {
      const res = await CheckPastebin();
      if (res.success === false) {
        await bot.telegram.sendMessage(
          chat_id,
          `* Something went wrong attempting to fetch Pastebin Pro status. I will automatically try again later *`,
          {
            parse_mode: "MarkdownV2",
            disable_notification: true,
          }
        );
        throw new Error(res.error);
      }
      const now = moment().tz("UTC").format("MMMM D, YYYY h:mma [UTC]");

      if (res.proAvaliable) {
        const message = await bot.telegram.sendPhoto(
          chat_id,
          { source: Buffer.from(b64screenshot, "base64") },
          {
            caption: `⚠️ * I don't see the 'sold out' message. Pastebin Pro may be available. * ⚠️\n\n${now}`,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Take me to Pastebin Pro Page",
                    url: "https://pastebin.com/pro",
                  },
                ],
              ],
            },
            parse_mode: "MarkdownV2",
          }
        );
        const chat = await bot.telegram.getChat(chatId);
        const oldestPinnedMessageId = chat.pinned_message.message_id;
        if (oldestPinnedMessageId) {
          await bot.telegram.unpinChatMessage(chatId, oldestPinnedMessageId);
        }
        await bot.telegram.pinChatMessage(chatId, message.message_id);
      } else {
        await bot.telegram.sendPhoto(
          chat_id,
          { source: Buffer.from(res.b64screenshot, "base64") },
          {
            caption: `I see the 'sold out' message. Pastebin Pro is not available.\n\n${now}`,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Take me to Pastebin Pro Page",
                    url: "https://pastebin.com/pro",
                  },
                ],
              ],
            },
            /* The channel doesnt need to be alerted if theres no change */
            disable_notification: true,
          }
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      bot.stop();
      process.exit();
    }
  } catch (e) {
    console.error(e);
  }
}

start();

process.once("SIGINT", () => bot.stop("SIGINT"));
