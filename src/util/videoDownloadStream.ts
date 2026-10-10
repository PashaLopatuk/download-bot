import type { CookieJar } from "tough-cookie";

import { createLogger } from "./logger";
import { USER_AGENT_HEADERS } from "./userAgentHeaders";

const log = createLogger("videoDownloadStream");

type GetVideoStreamOptions = {
  referer: string;
  jar: CookieJar;
};

export async function getVideoStream(
  url: string,
  options: GetVideoStreamOptions,
) {
  const cookieHeader = await options.jar.getCookieString(url);

  log.info({ referer: options.referer }, "fetching video stream from CDN");

  const response = await fetch(url, {
    headers: {
      ...USER_AGENT_HEADERS,
      Referer: options.referer,
      Cookie: cookieHeader,
      Range: "bytes=0-",
      Accept: "*/*",
    },
  });

  if (!response.ok && response.status !== 206) {
    log.error(
      { status: response.status, referer: options.referer },
      "CDN video request failed",
    );
    throw new Error(`Could not download video: ${response.status}`);
  }

  const { body } = response;

  if (!body) {
    log.warn({ referer: options.referer }, "CDN response has no body");
    return;
  }

  log.debug({ status: response.status }, "video stream ready");

  return body;
}
