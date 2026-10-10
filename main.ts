import { Bot, InputFile } from "grammy";

import { TEXT_CONTENT } from "./textContent";
import { extractVideoUrl } from "./util/extractTikTokVideo";
import { createLogger } from "./util/logger";
import { validateUrl } from "./util/validation";
import { getVideoStream } from "./util/videoDownloadStream";

const log = createLogger("main");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const bot = new Bot(BOT_TOKEN);

bot.catch((err) => {
  log.error({ err }, "unhandled error in bot middleware");
});

bot.command("start", (ctx) => {
  log.debug({ chatId: ctx.chat?.id }, "start command");
  ctx.reply(TEXT_CONTENT.START);
});

bot.on("::url", async (ctx) => {
  const url = ctx.message?.text;
  const chatId = ctx.chat?.id;

  if (!validateUrl(url)) {
    log.warn({ chatId, url }, "invalid URL received");
    return ctx.reply(TEXT_CONTENT.INVALID_URL);
  }

  log.info({ chatId, url }, "processing video URL");

  try {
    const { videoPlayUrl, jar, pageUrl } = await extractVideoUrl(url);

    const videoStream = await getVideoStream(videoPlayUrl, {
      referer: pageUrl,
      jar,
    });

    if (!videoStream) {
      log.error({ chatId, url }, "empty video stream");
      return ctx.reply(TEXT_CONTENT.INVALID_URL);
    }

    log.info({ chatId, url }, "sending video to chat");
    return ctx.replyWithVideo(new InputFile(videoStream));
  } catch (err) {
    log.error({ err, chatId, url }, "failed to process video URL");
    return ctx.reply(TEXT_CONTENT.INVALID_URL);
  }
});

export const runApp = () => {
  log.info("starting Telegram bot");
  bot.start();
};
