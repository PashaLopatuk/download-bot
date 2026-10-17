import { InputFile, type Context } from "grammy";
import { extractVideoUrl } from "../util/extractTikTokVideo";
import { getVideoStream } from "../util/videoDownloadStream";
import { createLogger } from "../util/logger";
import { TEXT_CONTENT } from "../util/textContent";

const log = createLogger("videoDownloaderController");

export const videoDownloaderController = async (ctx: Context) => {
  const url = ctx.message?.text;
  const chatId = ctx.chat?.id;

  try {
    await ctx.replyWithChatAction("upload_video");

    const { videoPlayUrl, jar, pageUrl } = await extractVideoUrl(url as any);

    await ctx.replyWithChatAction("record_video");

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
};
