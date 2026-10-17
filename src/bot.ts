import { Bot, InputFile, InlineQueryResultBuilder } from "grammy";

import { TEXT_CONTENT } from "./util/textContent";
import { extractVideoUrl } from "./util/extractTikTokVideo";
import { createLogger } from "./util/logger";
import { validateUrl } from "./util/validation";
import { getVideoStream } from "./util/videoDownloadStream";

const log = createLogger("main");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

export const createBot = () => {
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
      await ctx.replyWithChatAction("upload_video");

      const { videoPlayUrl, jar, pageUrl } = await extractVideoUrl(url);

      await ctx.replyWithChatAction("record_video");

      const videoStream = await getVideoStream(videoPlayUrl, {
        referer: pageUrl,
        jar,
      });

      log.info({ chatId, url }, "sending video to chat");

      return ctx.replyWithVideo(new InputFile(videoStream));
    } catch (err) {
      log.error({ err, chatId, url }, "failed to process video URL");
      return ctx.reply(TEXT_CONTENT.INVALID_URL);
    }
  });

  return bot;
};
