import { CookieJar } from "tough-cookie";

import { createLogger } from "./logger";
import { syncResponseCookies } from "./syncResponseCookies";
import { USER_AGENT_HEADERS } from "./userAgentHeaders";

const log = createLogger("extractTikTokVideo");

const htmlTextVideoAddressMatcher =
  /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">([\s\S]*?)<\/script>/;

export type TikTokVideoSession = {
  videoPlayUrl: string;
  jar: CookieJar;
  pageUrl: string;
};

export async function extractVideoUrl(url: string): Promise<TikTokVideoSession> {
  const jar = new CookieJar();
  const cookieHeader = await jar.getCookieString(url);

  log.info({ url }, "fetching TikTok page");

  const response = await fetch(url, {
    headers: {
      ...USER_AGENT_HEADERS,
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      Cookie: cookieHeader,
    },
  });

  if (!response.ok) {
    log.error(
      { url, status: response.status, statusText: response.statusText },
      "TikTok page request failed",
    );
    throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
  }

  await syncResponseCookies(response, url, jar);

  const htmlText = await response.text();

  const scriptMatch = htmlText.match(htmlTextVideoAddressMatcher);

  if (!scriptMatch || !scriptMatch[1]) {
    log.error({ url }, "rehydration script not found in page HTML");
    throw new Error("");
  }

  const payload = JSON.parse(scriptMatch[1]);
  const defaultScope = payload.__DEFAULT_SCOPE__;
  const itemInfo = defaultScope?.["webapp.video-detail"]?.itemInfo?.itemStruct;

  if (!itemInfo) {
    log.error({ url }, "itemStruct missing in rehydration payload");
    throw new Error("");
  }

  const videoPlayUrl = itemInfo.video?.playAddr as string;

  if (!videoPlayUrl) {
    log.error({ url }, "playAddr missing in itemStruct");
    throw new Error("");
  }

  log.info({ url }, "resolved playAddr for video");

  return { videoPlayUrl, jar, pageUrl: url };
}
